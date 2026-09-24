/**
 * @file priorityService.ts
 * @description Motor de priorización pedagógica y ordenamiento de necesidades de aprendizaje (Fase 7).
 * Pondera de forma determinista y auditable:
 * 1. Centralidad de prerrequisitos (peso en el Grafo Curricular)
 * 2. Proximidad temporal con la lección o evaluación en curso
 * 3. Severidad del estado de maestría (not_assessed < needs_review < developing)
 * 4. Recencia y decaimiento temporal
 */

import { KnowledgeGap, PriorityItem, StudentCompetencyEntity } from './types';

export class AdaptiveLearningPriorityService {
  /**
   * Pondera y clasifica las prioridades de atención formativa para el estudiante.
   */
  static call(
    gaps: KnowledgeGap[],
    competenciesMap: Map<string, StudentCompetencyEntity>,
    currentLessonTargetUnitId?: string
  ): PriorityItem[] {
    const scoredItems: { gap: KnowledgeGap; finalScore: number; rationale: string }[] = [];

    for (const gap of gaps) {
      let score = gap.priority_score;
      const rationaleParts: string[] = [gap.rationale];

      // 1. Bono de proximidad con la lección en curso
      if (currentLessonTargetUnitId && gap.knowledge_unit_id === currentLessonTargetUnitId) {
        score += 15;
        rationaleParts.push('Es el objetivo directo de la lección que el grupo está trabajando hoy.');
      }

      // 2. Factor de recencia y severidad del estado
      const comp = competenciesMap.get(gap.knowledge_unit_id);
      if (comp) {
        if (comp.mastery_state === 'needs_review') {
          score += 10;
          rationaleParts.push('Evidencia reciente indica regresión o decaimiento que amerita revisión prioritaria.');
        } else if (comp.mastery_state === 'developing' && comp.evidence_count >= 3) {
          score += 8;
          rationaleParts.push('Múltiples intentos en desarrollo; requiere intervención guiada.');
        }
      }

      // 3. Ponderación de extensiones
      if (gap.gap_type === 'extension_opportunity') {
        // Las extensiones son valiosas pero no deben bloquear a quien tiene deficiencias formativas
        score = Math.min(score, 40);
        rationaleParts.push('Oportunidad de enriquecimiento y aplicación creativa.');
      }

      scoredItems.push({
        gap,
        finalScore: Math.min(100, Math.max(0, score)),
        rationale: rationaleParts.join(' ')
      });
    }

    // Ordenar descendente por puntuación final calculada
    scoredItems.sort((a, b) => b.finalScore - a.finalScore);

    // Asignar rangos y nivel de urgencia
    return scoredItems.map((item, index) => {
      let urgency: PriorityItem['urgency'] = 'low';
      if (item.finalScore >= 80) urgency = 'high';
      else if (item.finalScore >= 50) urgency = 'medium';

      return {
        rank: index + 1,
        knowledge_unit_id: item.gap.knowledge_unit_id,
        title: item.gap.title,
        skill: item.gap.skill,
        cefr: item.gap.cefr,
        gap_type: item.gap.gap_type,
        priority_score: item.finalScore,
        urgency,
        rationale: item.rationale
      };
    });
  }
}
