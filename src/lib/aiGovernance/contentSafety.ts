/**
 * @file contentSafety.ts
 * @description Filtro Perimetral de Seguridad de Contenido y Protección a Menores (Ítems #50, #51, #52 y #53).
 * Adapta salvaguardas para la educación básica y media, bloqueando contenido nocivo, previniendo solicitudes
 * de datos personales o contactos externos en el Tutor de IA y activando el flujo de escalación docente.
 */

import { SafetyCategory, SafetyCheckResult } from './types';

export class AIContentSafety {
  // Palabras y patrones de riesgo crítico
  private static readonly SELF_HARM_PATTERNS = [
    /\b(suicid|matarme|cortarme|hacerme daño|quitarme la vida|end my life|kill myself)\b/i
  ];
  private static readonly VIOLENCE_PATTERNS = [
    /\b(fabricar bomba|fabricar arma|disparar a todos|shoot school|make explosive)\b/i
  ];
  private static readonly HARASSMENT_PATTERNS = [
    /\b(eres un idiota|te odio|eres basura|ugly freak|kill you)\b/i
  ];
  private static readonly OFF_PLATFORM_PATTERNS = [
    /\b(dame tu whatsapp|hablemos por telegram|pásame tu instagram|meet outside|send me photos|enviame una foto tuya)\b/i
  ];

  /**
   * Evalúa la seguridad del contenido en mensajes de estudiantes y respuestas de IA.
   */
  static inspectContent(
    text: string,
    context: { grade: string; isStudentChat?: boolean }
  ): SafetyCheckResult {
    const raw = (text || '').toLowerCase().trim();
    const flaggedCategories: SafetyCategory[] = [];

    // 1. Detección de Autolesión (Máxima Prioridad)
    if (this.SELF_HARM_PATTERNS.some(p => p.test(raw))) {
      flaggedCategories.push('self_harm');
      return {
        safe: false,
        flagged_categories: flaggedCategories,
        severity: 'high',
        requires_teacher_escalation: true,
        action_taken: 'block_and_escalate',
        rationale: 'Contenido relacionado con autolesión detectado. Se bloquea la interacción y se emite alerta inmediata al orientador escolar.'
      };
    }

    // 2. Detección de Violencia Explícita
    if (this.VIOLENCE_PATTERNS.some(p => p.test(raw))) {
      flaggedCategories.push('violence');
      return {
        safe: false,
        flagged_categories: flaggedCategories,
        severity: 'high',
        requires_teacher_escalation: true,
        action_taken: 'block_and_escalate',
        rationale: 'Instrucciones o amenazas de violencia extrema detectadas.'
      };
    }

    // 3. Detección de Solicitudes Fuera de Plataforma o Privacidad de Menores
    if (context.isStudentChat && this.OFF_PLATFORM_PATTERNS.some(p => p.test(raw))) {
      flaggedCategories.push('off_platform_contact');
      return {
        safe: false,
        flagged_categories: flaggedCategories,
        severity: 'medium',
        requires_teacher_escalation: true,
        action_taken: 'block_and_escalate',
        rationale: 'Intento de desvío fuera de la plataforma o solicitud de datos privados de contacto en chat de menores.'
      };
    }

    // 4. Acoso u Hostigamiento
    if (this.HARASSMENT_PATTERNS.some(p => p.test(raw))) {
      flaggedCategories.push('harassment');
      return {
        safe: false,
        flagged_categories: flaggedCategories,
        severity: 'medium',
        requires_teacher_escalation: false,
        action_taken: 'sanitize',
        rationale: 'Lenguaje hostil detectado. Se redirige la conversación al objetivo pedagógico.'
      };
    }

    // 5. Verificación de Contenido según la edad escolar (Age-Aware Constraint / Ítem #51)
    const isEarlyAge = context.grade.includes('preschool') || context.grade.includes('primary_1') || context.grade.includes('primary_2');
    if (isEarlyAge && (raw.includes('war') || raw.includes('weapons') || raw.includes('death') || raw.includes('muerte'))) {
      flaggedCategories.push('violence');
      return {
        safe: false,
        flagged_categories: flaggedCategories,
        severity: 'low',
        requires_teacher_escalation: false,
        action_taken: 'sanitize',
        rationale: 'Temas inapropiados para la etapa de desarrollo de educación temprana.'
      };
    }

    return {
      safe: true,
      flagged_categories: [],
      severity: 'low',
      requires_teacher_escalation: false,
      action_taken: 'allow'
    };
  }
}
