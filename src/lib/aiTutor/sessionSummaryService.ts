/**
 * @file sessionSummaryService.ts
 * @description Generador de resúmenes diferenciados para el estudiante y para el docente (Fase 8).
 * - Resumen Estudiante: Amigable, motivacional, enfocado en logros y metas inmediatas.
 * - Resumen Docente: Técnico, métricas cuantitativas de éxito independiente, errores recurrentes y acción sugerida.
 */

import {
  TutorSessionEntity,
  TutorSessionSummary,
  StudentFacingSummary,
  TeacherFacingSummary
} from './types';
import { LearningEvidenceEntity } from '../adaptiveLearning/types';

export class AITutorSessionSummaryService {
  /**
   * Genera el resumen consolidado de la sesión de tutoría.
   */
  static generate(
    session: TutorSessionEntity,
    evidence?: LearningEvidenceEntity
  ): TutorSessionSummary {
    const state = session.conversation_state;
    const totalAttempts = Math.max(1, state.questions_attempted);
    const successCount = state.successful_attempts;
    const hintsCount = state.hints_used_count;

    // 1. Resumen Estudiante
    const studentSummary: StudentFacingSummary = {
      today_practiced: session.primary_learning_outcome,
      did_well_with: successCount >= 2
        ? 'Expresar tu punto de vista de forma clara y respetuosa con tus propias ideas.'
        : 'Participar activamente en la sesión y seguir las pistas para construir tus respuestas.',
      keep_practicing: state.observed_errors.length > 0
        ? `Reforzar el uso de conectores causales como "because", "since" y "so" para justificar posturas.`
        : 'Continuar ampliando tu vocabulario y fluidez oral.',
      next_recommendation: session.scaffolding_level === 'high'
        ? 'Práctica guiada breve en parejas para afianzar conectores.'
        : session.scaffolding_level === 'low'
        ? 'Participar en el panel de debate con contraargumentos.'
        : 'Continuar con la siguiente sesión del curso grupal.'
    };

    // 2. Resumen Docente
    const teacherSummary: TeacherFacingSummary = {
      target_unit_id: session.knowledge_target_ids[0] || 'speaking_b1_secondary_expressing_opinions',
      total_questions_attempted: totalAttempts,
      independent_successful_attempts: successCount,
      hints_required_count: hintsCount,
      main_issues_observed: state.observed_errors.length > 0
        ? state.observed_errors
        : ['Ninguna dificultad crítica persistente'],
      suggested_action: successCount >= 3 && hintsCount <= 1
        ? 'Promover a actividades de extensión o debate autónomo.'
        : hintsCount >= 3
        ? 'Reforzar en el Círculo de Práctica Guiada con sentence starters.'
        : 'Mantener en el Foro Colaborativo de nivel estándar.',
      evidence_record_id: evidence?.id
    };

    return {
      session_id: session.id,
      student_id: session.student_id,
      duration_seconds: session.duration_seconds || 600,
      student_summary: studentSummary,
      teacher_summary: teacherSummary,
      generated_evidence: evidence
    };
  }
}
