/**
 * @file nextStepService.ts
 * @description Motor de decisión pedagógica determinista del AI Tutor (Fase 8).
 * Evalúa el estado de la conversación, los intentos acumulados, las rachas de éxito/error y las solicitudes del alumno
 * para determinar la acción más oportuna:
 * - explain: explicación conceptual o re-explicación
 * - hint: escalamiento de pista (Hint Ladder)
 * - practice: ejercicio guiado o comunicativo
 * - review_prerequisite: retroceso temporal para afianzar un prerrequisito
 * - increase_difficulty: desafío cognitivo (challenge / extension)
 * - reduce_scaffolding: retiro gradual de apoyos
 * - exit_check: comprobación final antes de concluir
 * - finish: conclusión exitosa de la sesión
 */

import { ConversationState, NextStepDecision, ScaffoldingLevel, HintLevel } from './types';

export interface NextStepEvaluationResult {
  decision: NextStepDecision;
  next_hint_level: HintLevel;
  next_scaffolding: ScaffoldingLevel;
  rationale: string;
}

export class AITutorNextStepService {
  /**
   * Evalúa la situación didáctica y retorna la decisión recomendada.
   */
  static evaluate(
    state: ConversationState,
    studentInput: string,
    currentScaffolding: ScaffoldingLevel
  ): NextStepEvaluationResult {
    const inputClean = studentInput.toLowerCase().trim();

    // 1. Detección de comandos explícitos del estudiante
    if (inputClean.includes('hint') || inputClean.includes('pista') || inputClean.includes('ayuda')) {
      const nextHint = Math.min(5, (state.current_hint_level || 1) + 1) as HintLevel;
      return {
        decision: 'hint',
        next_hint_level: nextHint,
        next_scaffolding: currentScaffolding,
        rationale: `El estudiante solicitó una pista. Se escala al Nivel ${nextHint} de la Escalera de Pistas.`
      };
    }

    if (inputClean.includes('explain again') || inputClean.includes('no entiendo') || inputClean.includes("i don't understand")) {
      return {
        decision: 'explain',
        next_hint_level: state.current_hint_level,
        next_scaffolding: 'high',
        rationale: 'El estudiante expresó incomprensión directa. Se provee explicación estructurada adaptada.'
      };
    }

    if (inputClean.includes('easier') || inputClean.includes('más fácil')) {
      return {
        decision: 'hint',
        next_hint_level: Math.min(5, state.current_hint_level + 1) as HintLevel,
        next_scaffolding: 'high',
        rationale: 'El estudiante solicitó simplificación. Se incrementa el andamiaje a nivel alto.'
      };
    }

    if (inputClean.includes('challenge') || inputClean.includes('difícil') || inputClean.includes('harder')) {
      return {
        decision: 'increase_difficulty',
        next_hint_level: 1,
        next_scaffolding: 'low',
        rationale: 'El estudiante solicitó un reto mayor. Se reduce el andamiaje y se eleva la demanda discursiva.'
      };
    }

    // 2. Comprobación de Exit Check (Fin de sesión formativa)
    if (state.is_exit_check) {
      if (state.exit_check_passed) {
        return {
          decision: 'finish',
          next_hint_level: 1,
          next_scaffolding: currentScaffolding,
          rationale: 'El estudiante completó exitosamente la comprobación de salida (Exit Check). Concluir sesión.'
        };
      }
    }

    // Si ya completó 3 o más intentos exitosos autónomos, activar Exit Check
    if (state.successful_attempts >= 3 && !state.is_exit_check) {
      return {
        decision: 'exit_check',
        next_hint_level: 1,
        next_scaffolding: 'medium',
        rationale: 'El estudiante demostró consistencia (3+ aciertos). Ejecutar comprobación final de salida.'
      };
    }

    // 3. Evaluación de rachas de error y andamiaje
    if (state.consecutive_errors >= 2) {
      const nextHint = Math.min(5, state.current_hint_level + 1) as HintLevel;
      return {
        decision: 'hint',
        next_hint_level: nextHint,
        next_scaffolding: 'high',
        rationale: `El estudiante acumuló ${state.consecutive_errors} errores consecutivos. Se incrementa andamiaje a HIGH y se activa Pista Nivel ${nextHint}.`
      };
    }

    // 4. Evaluación de rachas de acierto y desvanecimiento de andamios (Fading)
    if (state.consecutive_correct >= 3) {
      let nextScaff = currentScaffolding;
      if (currentScaffolding === 'high') nextScaff = 'medium';
      else if (currentScaffolding === 'medium') nextScaff = 'low';

      return {
        decision: 'reduce_scaffolding',
        next_hint_level: 1,
        next_scaffolding: nextScaff,
        rationale: `El estudiante logró ${state.consecutive_correct} aciertos consecutivos. Se retiran apoyos hacia nivel ${nextScaff.toUpperCase()}.`
      };
    }

    // 5. Flujo estándar de práctica guiada
    return {
      decision: 'practice',
      next_hint_level: state.current_hint_level,
      next_scaffolding: currentScaffolding,
      rationale: 'Continuar con el ciclo de práctica dialógica sobre el objetivo curricular activo.'
    };
  }
}
