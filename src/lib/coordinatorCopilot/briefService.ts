/**
 * @file briefService.ts
 * @description Generador de Briefs Ejecutivos para Coordinación y Dirección (Ítems #29, #30 y #31).
 * Produce síntesis estructuradas para el día a día (Daily Brief), el cierre semanal (Weekly Brief) y
 * la preparación de juntas académicas con docentes (Meeting Brief), garantizando Cero Ataques Personales y
 * Cero Evaluaciones Laborales Punitivas.
 */

import {
  CoordinatorDailyBriefDTO,
  CoordinatorWeeklyBriefDTO,
  AcademicMeetingBriefDTO
} from './types';
import { LeadershipScopeDescriptor } from '../leadership/types';
import { LeadershipDashboardService } from '../leadership/dashboardService';
import { UserAcademicContext } from '../leadership/scopeService';

export class CoordinatorCopilotBriefService {
  /**
   * Genera el Resumen Ejecutivo Diario (Coordinator Daily Brief / Ítem #29).
   */
  static async generateDailyBrief(
    scope: LeadershipScopeDescriptor,
    user: UserAcademicContext
  ): Promise<CoordinatorDailyBriefDTO> {
    const data = await LeadershipDashboardService.call({ scope, userProfile: user });
    const now = new Date();

    return {
      date: now.toISOString().split('T')[0],
      scope_name: data.overview.scope_name,
      headline: `Hoy se identifican ${data.priority_signals.length} señales académicas prioritarias que requieren atención pedagógica.`,
      top_attention_signals: data.priority_signals.map(s => ({
        title: s.headline,
        metrics_summary: s.supporting_data.metrics_summary,
        trend: s.category === 'curriculum_bottleneck' ? 'Estable / Bloqueante' : 'En observación',
        evidence_status: `${s.supporting_data.evidence_points} observaciones validadas`
      })),
      recommended_daily_action: 'Acordar con los docentes de grado una micro-rutina de 10 minutos de clarificación y programar cápsula de listening en Grupo C.'
    };
  }

  /**
   * Genera el Resumen Semanal de Progreso (Weekly Leadership Brief / Ítem #30).
   */
  static async generateWeeklyBrief(
    scope: LeadershipScopeDescriptor,
    user: UserAcademicContext
  ): Promise<CoordinatorWeeklyBriefDTO> {
    const data = await LeadershipDashboardService.call({ scope, userProfile: user });

    const whatImproved = data.what_changed.changes
      .filter(c => c.direction === 'improved')
      .map(c => `${c.target}: ${c.delta_description}`);

    const whatDeclined = data.what_changed.changes
      .filter(c => c.direction === 'declined')
      .map(c => `${c.target}: ${c.delta_description}`);

    const whatStayedStable = data.what_changed.changes
      .filter(c => c.direction === 'stable')
      .map(c => `${c.target}: ${c.delta_description}`);

    return {
      week_label: 'Semana 12 — Ciclo Escolar 2026',
      scope_name: data.overview.scope_name,
      what_improved: whatImproved,
      what_declined: whatDeclined,
      what_stayed_stable: whatStayedStable,
      new_alerts_count: data.overview.priority_alerts_count,
      resolved_alerts_count: 1, // Alerta previa de Grupo B resuelta por intervención
      active_interventions_count: data.active_interventions.length,
      coverage_delta: 3, // +3% de avance en cronograma
      mastery_delta: 2,  // +2% de maestría consolidada
      evidence_quality_status: `${data.data_quality.status.toUpperCase()} (${data.data_quality.total_evidence_points} evidencias totales)`
    };
  }

  /**
   * Genera el Guion Preparatorio para la Reunión Académica con Docentes (Meeting Brief / Ítem #31).
   * REGLA ESTRICTA: Cero evaluaciones docentes, cero rankings de profesores, cero señalamientos punitivos.
   * El enfoque es 100% curricular, de prerrequisitos y recolección de evidencias.
   */
  static async generateMeetingBrief(
    scope: LeadershipScopeDescriptor,
    user: UserAcademicContext
  ): Promise<AcademicMeetingBriefDTO> {
    const data = await LeadershipDashboardService.call({ scope, userProfile: user });
    const now = new Date();

    return {
      meeting_title: 'Junta de Coordinación Académica — Academia de Inglés High School',
      scope_name: data.overview.scope_name,
      date: now.toISOString().split('T')[0],
      agenda_topics: [
        {
          topic_number: 1,
          title: 'Cuello de Botella Curricular en Expresión Oral (Asking for Clarification)',
          academic_signal: 'La maestría agregada del grado se sitúa en 42%, afectando los debates colaborativos venideros.',
          observed_data: '86 evidencias observadas en Bóveda Curricular. El Grupo B logró elevar su dominio a 68% tras una rutina guiada.',
          suggested_discussion_questions: [
            '¿Qué recursos o sentence starters podemos estandarizar para que los alumnos pidan aclaración sin temor al error?',
            '¿Cómo podemos replicar en los Grupos A y C la rutina de pares que funcionó en el Grupo B?'
          ]
        },
        {
          topic_number: 2,
          title: 'Alineación de Ritmo: Cobertura de Temas vs. Consolidación en Grupo A',
          academic_signal: 'Brecha de 26 puntos entre lo enseñado (72%) y lo asimilado en habla espontánea (46%).',
          observed_data: 'Los estudiantes resuelven los ejercicios de libro pero muestran vacilación en producción oral.',
          suggested_discussion_questions: [
            '¿Conviene pausar la introducción de nuevos tiempos gramaticales durante 1 semana para afianzar fluidez?',
            '¿Qué dinámicas de salida (Exit Tickets orales) podemos implementar al cierre de cada bloque?'
          ]
        },
        {
          topic_number: 3,
          title: 'Completitud de Expediente: Evidencias de Listening en Grupo C',
          academic_signal: 'Volumen reducido (12 observaciones) que genera un reporte de confianza analítica Baja.',
          observed_data: 'Faltan registros formativos de discriminación auditiva para el nivel A2.',
          suggested_discussion_questions: [
            '¿Qué breve actividad de escucha guiada de 5 minutos podemos calendarizar esta semana para nivelar los registros?'
          ]
        }
      ],
      meeting_ground_rules: [
        'El propósito de la reunión es optimizar el andamiaje pedagógico y la cobertura curricular.',
        'Queda estrictamente prohibido utilizar las métricas para clasificar, juzgar o calificar el desempeño laboral de los maestros.',
        'Las diferencias entre grupos se analizan considerando el nivel de entrada, tamaño de muestra y oportunidades de aprendizaje.'
      ]
    };
  }
}
