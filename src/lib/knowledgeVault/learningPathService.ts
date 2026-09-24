/**
 * @file learningPathService.ts
 * @description Servicio de generación de secuencias curriculares y rutas de aprendizaje entre niveles CEFR.
 * Permite responder consultas pedagógicas como: "From: A1 To: B1 Skill: Speaking"
 * y produce una trayectoria coherente basada en ordenamiento topológico sobre el Grafo Académico.
 */

import { KnowledgeVaultLoader } from './loader';
import { AcademicGraph, AcademicGraphNode } from './academicGraph';
import { ParsedKnowledgeDocument } from './types';
import { VALID_CEFR_LEVELS } from './taxonomy';

export interface LearningPathRequest {
  fromCefr?: string;
  toCefr: string;
  skill?: string;
  domain?: string;
}

export interface LearningPathStep {
  order: number;
  id: string;
  title: string;
  cefr: string[];
  skills: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  role?: string;
}

export interface LearningPathResult {
  fromCefr: string;
  toCefr: string;
  skill?: string;
  totalSteps: number;
  steps: LearningPathStep[];
}

export class KnowledgeVaultLearningPathService {
  /**
   * Orden numérico para comparar niveles CEFR
   */
  private static cefrRank(cefr: string): number {
    const idx = VALID_CEFR_LEVELS.indexOf(cefr as any);
    return idx >= 0 ? idx : 99;
  }

  /**
   * Genera la secuencia pedagógica progresiva entre niveles CEFR.
   */
  static call(request: LearningPathRequest, docs?: ParsedKnowledgeDocument[]): LearningPathResult {
    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const graph = AcademicGraph.build(loadedDocs);

    const fromCefr = request.fromCefr || 'Foundation';
    const toCefr = request.toCefr;

    const fromRank = this.cefrRank(fromCefr);
    const toRank = this.cefrRank(toCefr);

    if (toRank < fromRank) {
      throw new Error(`KnowledgeVaultLearningPathService: toCefr ("${toCefr}") no puede ser menor que fromCefr ("${fromCefr}").`);
    }

    // 1. Filtrar nodos candidatos en el rango CEFR
    const candidateNodes: AcademicGraphNode[] = [];
    for (const node of graph.getAllNodes()) {
      if (
        node.type === 'system_documentation' ||
        node.type === 'system_index' ||
        node.type === 'source_spec' ||
        node.type === 'grade_profile' ||
        node.type === 'assessment_rubric' ||
        node.filePath.includes('00_SYSTEM') ||
        node.filePath.includes('99_SOURCES')
      ) {
        continue;
      }

      // Filtro de habilidad lingüística
      if (request.skill) {
        const targetSkill = request.skill.toLowerCase();
        if (!node.skills.some(s => s.toLowerCase() === targetSkill)) {
          continue;
        }
      }

      // Filtro de CEFR
      const hasLevelInRange = node.cefr.some(c => {
        const rank = this.cefrRank(c);
        return rank >= fromRank && rank <= toRank;
      });

      if (hasLevelInRange) {
        candidateNodes.push(node);
      }
    }

    // 2. Ordenamiento Topológico y Curricular
    // Usamos el Grafo: si A es prerrequisito de B, A debe ir antes de B.
    // Si no hay dependencia directa, se desempata por rango de CEFR mínimo.
    const candidateSet = new Set(candidateNodes.map(n => n.id));
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of candidateNodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const node of candidateNodes) {
      const deps = [...node.prerequisites, ...node.builds_on].filter(d => candidateSet.has(d));
      for (const depId of deps) {
        adj.get(depId)?.push(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }

    // Cola de prioridad basada en CEFR
    const ready = candidateNodes.filter(n => (inDegree.get(n.id) || 0) === 0);
    ready.sort((a, b) => {
      const minCefrA = Math.min(...a.cefr.map(c => this.cefrRank(c)));
      const minCefrB = Math.min(...b.cefr.map(c => this.cefrRank(c)));
      return minCefrA - minCefrB;
    });

    const orderedIds: string[] = [];
    while (ready.length > 0) {
      const curr = ready.shift()!;
      orderedIds.push(curr.id);

      const neighbors = adj.get(curr.id) || [];
      for (const neighborId of neighbors) {
        const newDeg = (inDegree.get(neighborId) || 1) - 1;
        inDegree.set(neighborId, newDeg);
        if (newDeg === 0) {
          const neighborNode = graph.getNode(neighborId);
          if (neighborNode) {
            ready.push(neighborNode);
            ready.sort((a, b) => {
              const minA = Math.min(...a.cefr.map(c => this.cefrRank(c)));
              const minB = Math.min(...b.cefr.map(c => this.cefrRank(c)));
              return minA - minB;
            });
          }
        }
      }
    }

    // Agregar cualquier nodo que no haya sido consumido (resiliencia)
    for (const node of candidateNodes) {
      if (!orderedIds.includes(node.id)) {
        orderedIds.push(node.id);
      }
    }

    // 3. Mapear pasos resultantes
    const steps: LearningPathStep[] = orderedIds.map((id, index) => {
      const node = graph.getNode(id)!;
      return {
        order: index + 1,
        id,
        title: node.title,
        cefr: node.cefr,
        skills: node.skills,
        learningOutcomes: node.learning_outcomes || [],
        prerequisites: node.prerequisites
      };
    });

    return {
      fromCefr,
      toCefr,
      skill: request.skill,
      totalSteps: steps.length,
      steps
    };
  }
}
