/**
 * @file prerequisiteService.ts
 * @description Servicio de resolución y análisis jerárquico de prerrequisitos pedagógicos en iSchool.
 * Permite responder con precisión: "¿Qué necesita dominar un alumno antes de aprender este concepto?"
 * Desglosa prerrequisitos directos y aguas arriba (transitivos), previniendo ciclos circulares.
 */

import { KnowledgeVaultLoader } from './loader';
import { AcademicGraph } from './academicGraph';
import { ParsedKnowledgeDocument } from './types';

export interface PrerequisiteAnalysisResult {
  nodeId: string;
  nodeTitle: string;
  directPrerequisites: { id: string; title: string; cefr: string[]; type: string }[];
  upstreamPrerequisites: { id: string; title: string; cefr: string[]; type: string }[];
  learningPathSequence: { step: number; id: string; title: string; cefr: string[] }[];
  hasCycle: boolean;
  cycleDetails?: string[];
}

export class KnowledgeVaultPrerequisiteService {
  /**
   * Analiza los prerrequisitos directos y transitivos de un concepto curricular.
   */
  static call(nodeId: string, docs?: ParsedKnowledgeDocument[]): PrerequisiteAnalysisResult {
    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const graph = AcademicGraph.build(loadedDocs);

    const targetNode = graph.getNode(nodeId);
    if (!targetNode) {
      throw new Error(`KnowledgeVaultPrerequisiteService: El concepto "${nodeId}" no existe en el grafo académico.`);
    }

    // 1. Prerrequisitos Directos (inmediatos)
    const directIds = Array.from(new Set([...targetNode.prerequisites, ...targetNode.builds_on]));
    const directPrerequisites = directIds.map(id => {
      const node = graph.getNode(id);
      return {
        id,
        title: node?.title || id,
        cefr: node?.cefr || [],
        type: node?.type || 'unknown'
      };
    });

    // 2. Todos los Prerrequisitos Recursivos (Aguas Arriba)
    const allPrereqIds = graph.getPrerequisites(nodeId, true);
    const upstreamIds = allPrereqIds.filter(id => !directIds.includes(id));
    const upstreamPrerequisites = upstreamIds.map(id => {
      const node = graph.getNode(id);
      return {
        id,
        title: node?.title || id,
        cefr: node?.cefr || [],
        type: node?.type || 'unknown'
      };
    });

    // 3. Ruta de Aprendizaje Topológica
    const pathIds = graph.getLearningPath(nodeId);
    const learningPathSequence = pathIds.map((id, index) => {
      const node = graph.getNode(id);
      return {
        step: index + 1,
        id,
        title: node?.title || id,
        cefr: node?.cefr || []
      };
    });

    // 4. Detección de Ciclos
    const cycles = graph.detectCycles();
    const relevantCycle = cycles.find(c => c.includes(nodeId));

    return {
      nodeId,
      nodeTitle: targetNode.title,
      directPrerequisites,
      upstreamPrerequisites,
      learningPathSequence,
      hasCycle: Boolean(relevantCycle),
      cycleDetails: relevantCycle
    };
  }
}
