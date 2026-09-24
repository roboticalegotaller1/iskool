/**
 * @file intentService.ts
 * @description Servicio de detección y clasificación de intenciones docentes en lenguaje natural (Ítem #5).
 * Transforma solicitudes conversacionales del profesor en intenciones estructuradas con parámetros extraídos,
 * evitando que el Motor de IA tenga que interpretar ambiguamente el objetivo de la petición.
 */

import { TeacherRequestType, ResolvedTeacherIntent, GroupingStrategyType } from './types';
import { SkillType } from '../knowledgeVault/types';

export class TeacherCopilotIntentService {
  /**
   * Alias canónico para resolución de intenciones docentes.
   */
  static resolve(rawRequest: string): ResolvedTeacherIntent {
    return this.parse(rawRequest);
  }

  /**
   * Analiza una solicitud textual del docente y retorna la intención estructurada con parámetros.
   */
  static parse(rawRequest: string): ResolvedTeacherIntent {
    const text = (rawRequest || '').toLowerCase().trim();

    // 1. Extracción de parámetros transversales
    const durationMatch = text.match(/(\d+)\s*(minutos?|mins?|minutes?|m\b)/i);
    const duration_minutes = durationMatch ? parseInt(durationMatch[1], 10) : undefined;

    let skill: SkillType | undefined;
    if (text.includes('speaking') || text.includes('habla') || text.includes('oral') || text.includes('parler') || text.includes('debate') || text.includes('conversaci')) {
      skill = 'speaking';
    } else if (text.includes('writing') || text.includes('escritura') || text.includes('écrit') || text.includes('rédaction') || text.includes('redacci') || text.includes('párrafo')) {
      skill = 'writing';
    } else if (text.includes('reading') || text.includes('lectura') || text.includes('lecture') || text.includes('comprensi') || text.includes('compréhension écrite')) {
      skill = 'reading';
    } else if (text.includes('listening') || text.includes('audio') || text.includes('écoute') || text.includes('escucha')) {
      skill = 'listening';
    } else if (text.includes('grammar') || text.includes('gramática') || text.includes('grammaire') || text.includes('conjugaison')) {
      skill = 'grammar';
    } else if (text.includes('vocab') || text.includes('vocabulario') || text.includes('lexique') || text.includes('palabras')) {
      skill = 'vocabulary';
    }

    let grouping_strategy: GroupingStrategyType | undefined;
    if (text.includes('mixt') || text.includes('equilibrad') || text.includes('heterog')) {
      grouping_strategy = 'mixed_ability';
    } else if (text.includes('pareja') || text.includes('tutor') || text.includes('pares') || text.includes('peer')) {
      grouping_strategy = 'peer_support';
    } else if (text.includes('aleator') || text.includes('azar') || text.includes('random')) {
      grouping_strategy = 'random';
    } else if (text.includes('proyecto') || text.includes('balance') || text.includes('roles')) {
      grouping_strategy = 'project_balance';
    } else if (text.includes('necesidad') || text.includes('nivel') || text.includes('apoyo')) {
      grouping_strategy = 'similar_need';
    }

    // Extracción de alias o nombre de alumno individual si aplica
    let student_alias: string | undefined;
    const studentMatch = text.match(/(alumno|estudiante|student|carlos|mariana|mateo)\s*([a-z0-9_-]+)?/i);
    if (studentMatch && (text.includes('este alumno') || text.includes('por qué') || text.includes('dificultad') || text.includes('carlos') || text.includes('mariana') || text.includes('mateo'))) {
      student_alias = studentMatch[0].trim();
    }

    // 2. Clasificación determinista de intención
    // A. Diferenciación
    if (
      text.includes('versión') || 
      text.includes('diferencia') || 
      text.includes('adapt') || 
      (text.includes('apoyo') && text.includes('actividad')) ||
      text.includes('más fácil') ||
      text.includes('más difícil')
    ) {
      return {
        intent: 'differentiation',
        confidence: 0.95,
        extracted_params: { duration_minutes, skill, grouping_strategy, student_alias },
        raw_request: rawRequest
      };
    }

    // B. Preparación de Lección (Plan de Clase)
    if (
      text.includes('clase de mañana') || 
      text.includes('prepara') || 
      text.includes('planea') || 
      text.includes('plan de clase') || 
      text.includes('siguiente lección') ||
      text.includes('sesión de mañana')
    ) {
      return {
        intent: 'lesson_planning',
        confidence: 0.98,
        extracted_params: { duration_minutes: duration_minutes || 50, skill, grouping_strategy },
        raw_request: rawRequest
      };
    }

    // C. Agrupamiento de Alumnos
    if (
      text.includes('grupos') || 
      text.includes('agrupa') || 
      text.includes('equipos') || 
      text.includes('pares') ||
      text.includes('parejas')
    ) {
      return {
        intent: 'student_grouping',
        confidence: 0.96,
        extracted_params: { grouping_strategy: grouping_strategy || 'similar_need', skill },
        raw_request: rawRequest
      };
    }

    // D. Diagnóstico de Alumnos que Necesitan Apoyo o Grupo
    if (
      text.includes('quiénes necesitan') || 
      text.includes('quién necesita') || 
      text.includes('quienes necesitan') ||
      text.includes('alumnos con dificultades') ||
      text.includes('rezagados') ||
      text.includes('refuerzo')
    ) {
      return {
        intent: 'group_analysis',
        confidence: 0.97,
        extracted_params: { skill, filter_type: 'support_needed' },
        raw_request: rawRequest
      };
    }

    // E. Generación de Evaluación
    if (
      text.includes('evaluación') || 
      text.includes('evaluacion') || 
      text.includes('examen') || 
      text.includes('quiz') || 
      text.includes('assessment') ||
      text.includes('prueba corta')
    ) {
      return {
        intent: 'assessment_generation',
        confidence: 0.95,
        extracted_params: { duration_minutes, skill, assessment_format: 'blueprint_first' },
        raw_request: rawRequest
      };
    }

    // F. Análisis de Evaluación Pasada
    if (
      text.includes('salió mal') || 
      text.includes('salio mal') || 
      text.includes('análisis del examen') || 
      text.includes('resultados de la prueba') ||
      text.includes('fallaron más')
    ) {
      return {
        intent: 'assessment_analysis',
        confidence: 0.94,
        extracted_params: { skill },
        raw_request: rawRequest
      };
    }

    // G. Cobertura Curricular y Progreso del Curso
    if (
      text.includes('falta cubrir') || 
      text.includes('cobertura') || 
      text.includes('atrasados') || 
      text.includes('vamos a tiempo') || 
      text.includes('avance del curso') ||
      text.includes('antes del examen') ||
      text.includes('antes de terminar la unidad')
    ) {
      return {
        intent: 'course_progress',
        confidence: 0.96,
        extracted_params: { filter_type: 'coverage_and_pace' },
        raw_request: rawRequest
      };
    }

    // H. Generación de Actividad Específica
    if (
      text.includes('actividad de') || 
      text.includes('dinámica') || 
      text.includes('ejercicio de') || 
      text.includes('práctica de')
    ) {
      return {
        intent: 'activity_generation',
        confidence: 0.92,
        extracted_params: { duration_minutes: duration_minutes || 15, skill },
        raw_request: rawRequest
      };
    }

    // I. Análisis de Estudiante Individual
    if (
      text.includes('por qué') && (text.includes('alumno') || text.includes('estudiante') || text.includes('dificultad'))
    ) {
      return {
        intent: 'student_progress',
        confidence: 0.93,
        extracted_params: { student_alias },
        raw_request: rawRequest
      };
    }

    // J. Remediación y Repaso
    if (
      text.includes('repasar') || 
      text.includes('remediar') || 
      text.includes('prerrequisito')
    ) {
      return {
        intent: 'remediation',
        confidence: 0.91,
        extracted_params: { skill },
        raw_request: rawRequest
      };
    }

    // K. Resumen Diario / Semanal (Brief)
    if (
      text.includes('brief') || 
      text.includes('resumen del día') || 
      text.includes('resumen de hoy') ||
      text.includes('qué tengo hoy')
    ) {
      return {
        intent: 'summary',
        confidence: 0.93,
        extracted_params: { filter_type: 'daily' },
        raw_request: rawRequest
      };
    }

    // Fallback: Planeación de Lección general
    return {
      intent: 'lesson_planning',
      confidence: 0.70,
      extracted_params: { duration_minutes: 50 },
      raw_request: rawRequest
    };
  }
}
