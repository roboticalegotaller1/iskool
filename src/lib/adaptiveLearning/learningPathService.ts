/**
 * @file learningPathService.ts
 * @description Generador de rutas de aprendizaje adaptativas y personalizadas por estudiante (Fase 7).
 * Responde a la pregunta: «¿Qué debería trabajar este alumno a continuación?»
 * organizando de forma secuencial y topológica las micro-competencias a reforzar
 * respetando estrictamente las dependencias de prerrequisitos del Grafo Curricular.
 */

import { PriorityItem, StudentCompetencyEntity } from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';
import { ParsedKnowledgeDocument } from '../knowledgeVault/types';

export interface PersonalLearningPathStep {
  step_number: number;
  knowledge_unit_id: string;
  title: string;
  skill: string;
  cefr: string;
  current_state: string;
  is_prerequisite_bridge: boolean;
  learning_goal: string;
  rationale: string;
}

export interface PersonalLearningPathResult {
  student_id: string;
  target_skill: string;
  target_cefr: string;
  total_steps: number;
  steps: PersonalLearningPathStep[];
  pedagogical_summary: string;
}

export class AdaptiveLearningPathService {
  /**
   * Construye la secuencia personalizada de aprendizaje para un alumno concreto.
   */
  static call(
    studentId: string,
    targetSkill: string,
    targetCefr: string,
    priorities: PriorityItem[],
    competenciesMap: Map<string, StudentCompetencyEntity>,
    docs?: ParsedKnowledgeDocument[]
  ): PersonalLearningPathResult {
    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const graph = AcademicGraph.build(loadedDocs);

    // 1. Filtrar prioridades de la habilidad objetivo o que sean prerrequisitos bloqueantes de ella
    const candidateUnitIds = new Set<string>();
    for (const p of priorities) {
      if (p.gap_type === 'extension_opportunity') continue; // Las extensiones van al final o como optativas
      candidateUnitIds.add(p.knowledge_unit_id);

      // Si tiene prerrequisitos en el grafo no dominados, agregarlos
      const node = graph.getNode(p.knowledge_unit_id);
      if (node) {
        for (const preId of [...node.prerequisites, ...node.builds_on]) {
          const preComp = competenciesMap.get(preId);
          if (!preComp || (preComp.mastery_state !== 'secure' && preComp.mastery_state !== 'mastered')) {
            candidateUnitIds.add(preId);
          }
        }
      }
    }

    if (candidateUnitIds.size === 0) {
      return {
        student_id: studentId,
        target_skill: targetSkill,
        target_cefr: targetCefr,
        total_steps: 0,
        steps: [],
        pedagogical_summary: 'El estudiante no presenta brechas activas en esta habilidad. Se encuentra al nivel esperado del curso.'
      };
    }

    // 2. Ordenamiento Topológico de los conceptos candidatos
    const candidateNodes = Array.from(candidateUnitIds).map(id => graph.getNode(id)).filter(Boolean);
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const n of candidateNodes) {
      inDegree.set(n!.id, 0);
      adj.set(n!.id, []);
    }

    for (const n of candidateNodes) {
      const deps = [...n!.prerequisites, ...n!.builds_on].filter(d => candidateUnitIds.has(d));
      for (const depId of deps) {
        adj.get(depId)?.push(n!.id);
        inDegree.set(n!.id, (inDegree.get(n!.id) || 0) + 1);
      }
    }

    // Cola de nodos listos (sin dependencias pendientes en el conjunto de brechas)
    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const orderedIds: string[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      orderedIds.push(curr);

      const neighbors = adj.get(curr) || [];
      for (const n of neighbors) {
        const newDeg = (inDegree.get(n) || 1) - 1;
        inDegree.set(n, newDeg);
        if (newDeg === 0) {
          queue.push(n);
        }
      }
    }

    // Si hubo ciclos o nodos no visitados, anexar restantes
    for (const id of candidateUnitIds) {
      if (!orderedIds.includes(id)) {
        orderedIds.push(id);
      }
    }

    // 3. Transformar a pasos con significado pedagógico
    const steps: PersonalLearningPathStep[] = orderedIds.map((unitId, index) => {
      const node = graph.getNode(unitId);
      const comp = competenciesMap.get(unitId);
      const state = comp ? comp.mastery_state : 'not_assessed';
      const isBridge = (node?.cefr[0] || 'A2') !== targetCefr;

      return {
        step_number: index + 1,
        knowledge_unit_id: unitId,
        title: node?.title || unitId,
        skill: node?.skills[0] || targetSkill,
        cefr: node?.cefr[0] || targetCefr,
        current_state: state,
        is_prerequisite_bridge: isBridge,
        learning_goal: node?.learning_outcomes[0] || 'Desarrollar fluidez y precisión comunicativa.',
        rationale: isBridge
          ? `Puente formativo previo necesario para cimentar la competencia en ${targetCefr}.`
          : `Consolidar el objetivo directo del curso hacia la maestría autónoma.`
      };
    });

    return {
      student_id: studentId,
      target_skill: targetSkill,
      target_cefr: targetCefr,
      total_steps: steps.length,
      steps,
      pedagogical_summary: `Ruta de aprendizaje personalizada compuesta por ${steps.length} pasos ordenados secuencialmente según prerrequisitos formativos.`
    };
  }
}
