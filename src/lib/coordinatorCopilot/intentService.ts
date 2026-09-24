/**
 * @file intentService.ts
 * @description Clasificador Determinista de Intenciones del Coordinator Copilot (Ítems #23 y #24).
 * Identifica con precisión 10 tipos de consultas directivas en lenguaje natural y extrae sus parámetros clave
 * (grado, habilidad, grupo, ventana de tiempo) sin ambigüedades.
 */

import { CoordinatorRequestType, ResolvedCoordinatorIntent } from './types';
import { SkillType } from '../knowledgeVault/types';

export class CoordinatorCopilotIntentService {
  /**
   * Clasifica una solicitud en lenguaje natural y resuelve la intención con parámetros estructurados.
   */
  static parse(rawQuery: string): ResolvedCoordinatorIntent {
    const text = (rawQuery || '').toLowerCase().trim();

    // 1. Detección de Habilidad Macro
    let target_skill: SkillType | undefined;
    if (text.includes('speaking') || text.includes('habla') || text.includes('oral') || text.includes('pronunciaci')) {
      target_skill = 'speaking';
    } else if (text.includes('writing') || text.includes('escritura') || text.includes('redacci') || text.includes('párrafo')) {
      target_skill = 'writing';
    } else if (text.includes('reading') || text.includes('lectura') || text.includes('comprensi')) {
      target_skill = 'reading';
    } else if (text.includes('listening') || text.includes('escucha') || text.includes('audio')) {
      target_skill = 'listening';
    } else if (text.includes('grammar') || text.includes('gramática')) {
      target_skill = 'grammar';
    } else if (text.includes('vocab') || text.includes('vocabulario') || text.includes('léxico')) {
      target_skill = 'vocabulary';
    }

    // 2. Detección de Grado
    let target_grade: string | undefined;
    if (text.includes('high school 1') || text.includes('prepa 1') || text.includes('10mo') || text.includes('hs1')) {
      target_grade = 'high_school_1';
    } else if (text.includes('high school 2') || text.includes('prepa 2') || text.includes('11vo') || text.includes('hs2')) {
      target_grade = 'high_school_2';
    } else if (text.includes('high school 3') || text.includes('prepa 3') || text.includes('12vo') || text.includes('hs3')) {
      target_grade = 'high_school_3';
    } else if (text.includes('secondary 2') || text.includes('secundaria 2')) {
      target_grade = 'secondary_2';
    } else if (text.includes('primary') || text.includes('primaria')) {
      target_grade = 'primary_6';
    }

    // 3. Detección de Grupo
    let target_group: string | undefined;
    if (text.includes('grupo a') || text.includes('group a')) {
      target_group = 'group_a';
    } else if (text.includes('grupo b') || text.includes('group b')) {
      target_group = 'group_b';
    } else if (text.includes('grupo c') || text.includes('group c')) {
      target_group = 'group_c';
    }

    // 4. Clasificación Determinista de Intención (10 Tipos)
    let intent: CoordinatorRequestType = 'overview';

    // A. Intervenciones
    if (text.includes('intervenci') || text.includes('funcionó') || text.includes('repaso de la semana') || text.includes('repaso de clarificaci')) {
      intent = 'intervention_analysis';
    }
    // B. Calidad de Evidencia / Confianza
    else if (text.includes('poca evidencia') || text.includes('evidencia') || text.includes('confianza') || text.includes('datos insuficientes') || text.includes('puntos de evidencia')) {
      intent = 'evidence_quality';
    }
    // C. Cuello de botella / Prerrequisitos
    else if (text.includes('bloqueando') || text.includes('cuello de botella') || text.includes('bottleneck') || text.includes('prerrequisito') || text.includes('bloquea')) {
      intent = 'knowledge_bottleneck';
    }
    // D. Brecha Curricular Taught vs Mastered
    else if (text.includes('dominando lo que') || text.includes('enseñó') || text.includes('taught') || text.includes('cobertura adelantada') || text.includes('brecha de instrucci') || text.includes('img')) {
      intent = 'curriculum_gap';
    }
    // E. Tendencia / Qué cambió
    else if (text.includes('cambió') || text.includes('mes pasado') || text.includes('este mes') || text.includes('tendencia') || text.includes('últimos 30') || text.includes('evolución')) {
      intent = 'trend_analysis';
    }
    // F. Planificación de Acciones / Reunión Académica
    else if (text.includes('maestros') || text.includes('junta') || text.includes('reunión') || text.includes('revisar mañana') || text.includes('discutir') || text.includes('agenda')) {
      intent = 'action_planning';
    }
    // G. Comparativa de Grupos / Quién necesita refuerzo
    else if (text.includes('compara') || text.includes('comparar') || text.includes('qué grupo') || text.includes('cuál grupo') || text.includes('refuerzo') || text.includes('atención')) {
      intent = 'compare_groups';
    }
    // H. Análisis de Habilidad Específica
    else if (target_skill && (text.includes('por qué') || text.includes('bajo en') || text.includes('dificultad') || text.includes('análisis') || text.includes('problemas de'))) {
      intent = 'skill_analysis';
    }
    // I. Avance del Curso
    else if (text.includes('avance') || text.includes('cronograma') || text.includes('cubrir') || text.includes('lecciones')) {
      intent = 'course_progress';
    }
    // J. Overview General por Defecto
    else {
      intent = 'overview';
    }

    return {
      intent,
      target_grade,
      target_group,
      target_skill,
      time_window: text.includes('30') ? '30_days' : text.includes('7') ? '7_days' : 'term',
      requires_explanation: true
    };
  }
}
