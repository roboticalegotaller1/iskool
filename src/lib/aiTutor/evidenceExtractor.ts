/**
 * @file evidenceExtractor.ts
 * @description Extractor de evidencias formativas a partir de sesiones concluidas del AI Tutor (Fase 8).
 * Garantiza que el modelo de IA nunca actualice directamente el perfil del alumno:
 *   Sesión del Tutor -> EvidenceExtractor -> LearningEvidenceEntity -> MasteryEngine
 */

import { TutorSessionEntity } from './types';
import { LearningEvidenceEntity, RubricLevel } from '../adaptiveLearning/types';

export class AITutorEvidenceExtractor {
  /**
   * Transforma las métricas y el historial de una sesión de tutoría en una evidencia formativa estandarizada.
   */
  static extract(session: TutorSessionEntity): LearningEvidenceEntity {
    const state = session.conversation_state;
    const totalAttempts = Math.max(1, state.questions_attempted);
    const successfulAttempts = state.successful_attempts;
    const hintsCount = state.hints_used_count;
    const exitPassed = state.exit_check_passed;

    // 1. Calcular tasa de éxito independiente (sin depender de pistas de nivel 4 o 5)
    const successRatio = successfulAttempts / totalAttempts;
    
    // Penalización leve por uso excesivo de pistas
    const hintPenalty = Math.min(25, hintsCount * 4);
    
    let baseScore = Math.round(successRatio * 100) - hintPenalty;
    if (exitPassed) {
      baseScore = Math.min(100, baseScore + 10);
    }
    const finalScore = Math.max(30, Math.min(100, baseScore));

    // 2. Determinar nivel de rúbrica
    let rubricLevel: RubricLevel = 'developing';
    if (finalScore >= 88 && hintsCount <= 1) {
      rubricLevel = 'mastered';
    } else if (finalScore >= 70 && exitPassed) {
      rubricLevel = 'secure';
    } else if (finalScore < 50) {
      rubricLevel = 'not_met';
    }

    // 3. Determinar dificultad según el andamiaje utilizado en la sesión
    const difficulty = session.scaffolding_level === 'high' ? 0.40 :
                       session.scaffolding_level === 'medium' ? 0.65 : 0.85;

    const evidenceId = `ev_tutor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    return {
      id: evidenceId,
      student_id: session.student_id,
      evidence_type: 'class_activity',
      skill: 'speaking',
      knowledge_targets: session.knowledge_target_ids,
      learning_outcome: session.primary_learning_outcome,
      assessment_id: undefined,
      difficulty,
      score: finalScore,
      rubric_level: rubricLevel,
      attempts_count: totalAttempts,
      result_metadata: {
        session_id: session.id,
        session_type: session.session_type,
        successful_attempts: successfulAttempts,
        hints_used: hintsCount,
        exit_check_passed: exitPassed,
        observed_errors: state.observed_errors
      },
      created_at: new Date().toISOString()
    };
  }
}
