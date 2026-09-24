/**
 * @file gapDetector.ts
 * @description Detector de brechas curriculares entre expectativas del curso y el perfil competencial real del alumno.
 * Clasifica brechas en:
 * - blocking_gap: prerrequisito crítico de múltiples conceptos posteriores
 * - important_gap: objetivo central de la unidad curricular actual no dominado
 * - practice_gap: concepto en desarrollo que requiere consolidación
 * - extension_opportunity: concepto dominado con potencial de desafío cognitivo
 */

import { KnowledgeGap, GapType, StudentCompetencyEntity } from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';
import { ParsedKnowledgeDocument } from '../knowledgeVault/types';

export class AdaptiveLearningGapDetector {
  /**
   * Compara los objetivos esperados contra el estado competencial del alumno.
   */
  static call(
    expectedKnowledgeTargets: string[],
    competenciesMap: Map<string, StudentCompetencyEntity>,
    docs?: ParsedKnowledgeDocument[]
  ): KnowledgeGap[] {
    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const graph = AcademicGraph.build(loadedDocs);
    const gaps: KnowledgeGap[] = [];
    const processedIds = new Set<string>();

    // 1. Evaluar objetivos directos esperados
    for (const targetId of expectedKnowledgeTargets) {
      const node = graph.getNode(targetId);
      if (!node) continue;

      processedIds.add(targetId);
      const comp = competenciesMap.get(targetId);
      const state = comp ? comp.mastery_state : 'not_assessed';

      // Calcular dependientes posteriores en el grafo curricular
      const downstreamDependents = graph.getDependents(targetId);
      const downstreamCount = downstreamDependents.length;

      // Evaluar si es oportunidad de extensión, brecha o consolidación
      if (state === 'mastered') {
        gaps.push({
          knowledge_unit_id: targetId,
          title: node.title,
          skill: node.skills[0] || 'general',
          cefr: node.cefr[0] || 'B1',
          current_state: state,
          gap_type: 'extension_opportunity',
          priority_score: 30,
          downstream_dependents_count: downstreamCount,
          rationale: `El alumno domina completamente "${node.title}". Candidato para actividades de extensión de orden superior.`
        });
        continue;
      }

      if (state === 'secure') {
        // En nivel objetivo, sin brecha crítica
        continue;
      }

      // Tipificar brecha
      let gapType: GapType = 'important_gap';
      let priorityScore = 70;
      let rationale = '';

      if (downstreamCount >= 2) {
        gapType = 'blocking_gap';
        priorityScore = 90 + Math.min(10, downstreamCount);
        rationale = `Brecha bloqueante: "${node.title}" es prerrequisito de ${downstreamCount} conceptos posteriores en la planificación.`;
      } else if (state === 'developing') {
        gapType = 'practice_gap';
        priorityScore = 55;
        rationale = `Brecha de práctica: Comprensión emergente en "${node.title}". Requiere andamiaje y consolidación.`;
      } else if (state === 'needs_review') {
        gapType = 'important_gap';
        priorityScore = 75;
        rationale = `Requiere revisión: El alumno presentó dificultades recientes en "${node.title}".`;
      } else {
        gapType = 'important_gap';
        priorityScore = 70;
        rationale = `Objetivo esperado de la unidad curricular aún no evaluado o no consolidado: "${node.title}".`;
      }

      gaps.push({
        knowledge_unit_id: targetId,
        title: node.title,
        skill: node.skills[0] || 'general',
        cefr: node.cefr[0] || 'B1',
        current_state: state,
        gap_type: gapType,
        priority_score: priorityScore,
        downstream_dependents_count: downstreamCount,
        rationale
      });

      // 2. Evaluar prerrequisitos inmediatos de este target
      const directPrereqs = [...node.prerequisites, ...node.builds_on];
      for (const prereqId of directPrereqs) {
        if (processedIds.has(prereqId)) continue;
        processedIds.add(prereqId);

        const prereqNode = graph.getNode(prereqId);
        if (!prereqNode) continue;

        const prereqComp = competenciesMap.get(prereqId);
        const prereqState = prereqComp ? prereqComp.mastery_state : 'not_assessed';

        // Si el prerrequisito no está seguro ni dominado, se convierte en un BLOCKING GAP crítico
        if (prereqState !== 'secure' && prereqState !== 'mastered') {
          const prereqDownstream = graph.getDependents(prereqId).length;
          gaps.push({
            knowledge_unit_id: prereqId,
            title: prereqNode.title,
            skill: prereqNode.skills[0] || 'general',
            cefr: prereqNode.cefr[0] || 'A2',
            current_state: prereqState,
            gap_type: 'blocking_gap',
            priority_score: 95,
            downstream_dependents_count: prereqDownstream,
            rationale: `Prerrequisito formativo no consolidado: "${prereqNode.title}" es necesario para abordar con éxito el objetivo "${node.title}".`
          });
        }
      }
    }

    // Ordenar de mayor a menor prioridad
    return gaps.sort((a, b) => b.priority_score - a.priority_score);
  }
}
