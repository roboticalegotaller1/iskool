/**
 * @file groupingService.ts
 * @description Servicio de agrupamiento pedagógico dinámico y neutral para dinámicas en aula (Fase 7).
 * Agrupa estudiantes según sus necesidades de aprendizaje sin utilizar etiquetas estigmatizantes
 * (nunca "lentos", "malos" o "débiles").
 * Utiliza denominaciones académicas respetuosas orientadas a la meta didáctica:
 * - "Guided Practice Circle" (Apoyo focalizado)
 * - "Collaborative Discourse Forum" (Nivel estándar)
 * - "Advanced Debate & Synthesis Panel" (Extensión)
 */

import { GroupCluster, StudentCompetencyEntity } from './types';
import { AdaptiveLearningNextActionService } from './nextActionService';
import { AdaptiveLearningPriorityService } from './priorityService';
import { AdaptiveLearningGapDetector } from './gapDetector';

export interface StudentForGrouping {
  student_id: string;
  display_alias: string; // e.g. "Estudiante A"
  competenciesMap: Map<string, StudentCompetencyEntity>;
}

export class AdaptiveLearningGroupingService {
  /**
   * Agrupa a los estudiantes de una clase para una lección específica.
   */
  static call(
    students: StudentForGrouping[],
    currentLessonTargetUnitId: string
  ): GroupCluster[] {
    const supportStudentIds: string[] = [];
    const coreStudentIds: string[] = [];
    const extensionStudentIds: string[] = [];

    for (const student of students) {
      // 1. Detectar brechas y prioridades
      const gaps = AdaptiveLearningGapDetector.call([currentLessonTargetUnitId], student.competenciesMap);
      const priorities = AdaptiveLearningPriorityService.call(gaps, student.competenciesMap, currentLessonTargetUnitId);
      
      // 2. Obtener recomendación de acción
      const recommendation = AdaptiveLearningNextActionService.call(
        student.student_id,
        currentLessonTargetUnitId,
        priorities,
        student.competenciesMap
      );

      if (recommendation.adaptation_suggested === 'support') {
        supportStudentIds.push(student.student_id);
      } else if (recommendation.adaptation_suggested === 'extension') {
        extensionStudentIds.push(student.student_id);
      } else {
        coreStudentIds.push(student.student_id);
      }
    }

    const clusters: GroupCluster[] = [];

    // Cluster 1: Apoyo guiado
    if (supportStudentIds.length > 0) {
      clusters.push({
        id: 'cluster_guided_support',
        pedagogical_label: 'Círculo de Práctica Guiada y Andamiaje Estructural',
        suggested_adaptation: 'support',
        student_ids: supportStudentIds,
        primary_focus_unit_id: currentLessonTargetUnitId,
        rationale: 'Estudiantes que se benefician de bancos de palabras, sentence starters y modelado previo para consolidar el objetivo de la sesión.'
      });
    }

    // Cluster 2: Nivel estándar
    if (coreStudentIds.length > 0) {
      clusters.push({
        id: 'cluster_core_discourse',
        pedagogical_label: 'Foro Colaborativo de Práctica Estándar',
        suggested_adaptation: 'core',
        student_ids: coreStudentIds,
        primary_focus_unit_id: currentLessonTargetUnitId,
        rationale: 'Estudiantes en el nivel meta esperado para la lección de High School 1; trabajan con autonomía regulada en tareas comunicativas.'
      });
    }

    // Cluster 3: Extensión
    if (extensionStudentIds.length > 0) {
      clusters.push({
        id: 'cluster_advanced_extension',
        pedagogical_label: 'Panel Avanzado de Debate y Síntesis Crítica',
        suggested_adaptation: 'extension',
        student_ids: extensionStudentIds,
        primary_focus_unit_id: currentLessonTargetUnitId,
        rationale: 'Estudiantes que ya dominan los objetivos clave de la lección; abordan dilemas con contra-argumentación y mayor complejidad léxica.'
      });
    }

    return clusters;
  }
}
