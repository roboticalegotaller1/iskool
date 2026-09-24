/**
 * @file spiralCurriculumTracker.ts
 * @description Rastreador del modelo de Currículo Espiral (Spiral Curriculum Tracker).
 * Analiza la recurrencia pedagógica de cada nodo de conocimiento a lo largo de las semanas:
 * introduce -> practice -> revisit -> consolidate -> extend -> assess.
 * Detecta y alerta sobre conceptos enseñados una sola vez ("teach once, forget forever").
 */

import { LessonEntity, SpiralProgressionRole, KnowledgeTimelineNode, KnowledgeExposureEvent } from './types';

export class SpiralCurriculumTracker {
  /**
   * Procesa la secuencia de lecciones y genera el mapa de exposición de cada nodo de conocimiento.
   */
  static track(lessons: LessonEntity[]): Record<string, KnowledgeTimelineNode> {
    const nodeMap: Record<string, KnowledgeTimelineNode> = {};

    // Ordenar lecciones por semana y número de sesión cronológicamente
    const sortedLessons = [...lessons].sort((a, b) => {
      if (a.week_number !== b.week_number) return a.week_number - b.week_number;
      return a.session_number - b.session_number;
    });

    for (const lesson of sortedLessons) {
      const targets = lesson.knowledge_targets || [];
      
      for (const targetId of targets) {
        if (!nodeMap[targetId]) {
          nodeMap[targetId] = {
            knowledge_id: targetId,
            title: targetId, // Se enriquecerá con el título real de la Bóveda
            exposures: [],
            total_exposures: 0,
            is_single_exposure_warning: false
          };
        }

        const currentExposures = nodeMap[targetId].exposures.length;
        let role: SpiralProgressionRole = 'introduce';

        if (lesson.lesson_type === 'assessment') {
          role = 'assess';
        } else if (lesson.lesson_type === 'review' || lesson.lesson_type === 'integration') {
          role = currentExposures >= 3 ? 'consolidate' : 'revisit';
        } else if (currentExposures === 0) {
          role = 'introduce';
        } else if (currentExposures === 1) {
          role = 'practice';
        } else if (currentExposures === 2) {
          role = 'revisit';
        } else if (currentExposures === 3) {
          role = 'consolidate';
        } else {
          role = 'extend';
        }

        const event: KnowledgeExposureEvent = {
          week: lesson.week_number,
          session_number: lesson.session_number,
          unit_position: Math.ceil(lesson.week_number / 5),
          lesson_title: lesson.title,
          role
        };

        nodeMap[targetId].exposures.push(event);
        nodeMap[targetId].total_exposures = nodeMap[targetId].exposures.length;
      }
    }

    // Identificar advertencias de exposición única
    for (const targetId of Object.keys(nodeMap)) {
      if (nodeMap[targetId].total_exposures <= 1) {
        nodeMap[targetId].is_single_exposure_warning = true;
      }
    }

    return nodeMap;
  }
}
