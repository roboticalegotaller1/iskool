/**
 * @file academicGraph.ts
 * @description Motor del Grafo Académico Curricular de iSchool.
 * Modela el currículo como una red dirigida de conceptos interconectados mediante relaciones pedagógicas
 * (prerequisite, builds_on, extends, related_to, assessed_by).
 * Provee resolución topológica de dependencias, detección de ciclos y rastreo de nodos huérfanos.
 */

import { ParsedKnowledgeDocument } from './types';

export type AcademicEdgeType = 
  | 'prerequisite'
  | 'builds_on'
  | 'extends'
  | 'related_to'
  | 'assessed_by';

export interface AcademicGraphEdge {
  from: string;
  to: string;
  type: AcademicEdgeType;
}

export interface AcademicGraphNode {
  id: string;
  title: string;
  type: string;
  cefr: string[];
  grades: string[];
  skills: string[];
  status: string;
  prerequisites: string[];
  builds_on: string[];
  extends: string[];
  related_to: string[];
  assessed_by: string[];
  grade_progression?: Record<string, { role: string; notes?: string }>;
  learning_outcomes?: string[];
  filePath: string;
}

export class AcademicGraph {
  private nodes: Map<string, AcademicGraphNode> = new Map();
  private edges: AcademicGraphEdge[] = [];
  private outgoing: Map<string, AcademicGraphEdge[]> = new Map();
  private incoming: Map<string, AcademicGraphEdge[]> = new Map();

  /**
   * Construye el grafo a partir de los documentos curriculares cargados.
   */
  static build(docs: ParsedKnowledgeDocument[]): AcademicGraph {
    const graph = new AcademicGraph();

    // 1. Registrar Nodos
    for (const doc of docs) {
      if (!doc.documentId) continue;
      const fm = doc.frontmatter;
      const node: AcademicGraphNode = {
        id: doc.documentId,
        title: fm.title || doc.documentId,
        type: fm.type || 'unknown',
        cefr: Array.isArray(fm.cefr) ? fm.cefr.map(String) : [],
        grades: Array.isArray(fm.grades) ? fm.grades.map(String) : [],
        skills: Array.isArray(fm.skills) ? fm.skills.map(String) : [],
        status: fm.status || 'draft',
        prerequisites: Array.isArray(fm.prerequisites) ? fm.prerequisites.map(String) : [],
        builds_on: Array.isArray(fm.builds_on) ? fm.builds_on.map(String) : [],
        extends: Array.isArray(fm.extends) ? fm.extends.map(String) : [],
        related_to: Array.isArray(fm.related_to) ? fm.related_to.map(String) : [],
        assessed_by: Array.isArray(fm.assessed_by) ? fm.assessed_by.map(String) : [],
        grade_progression: fm.grade_progression as AcademicGraphNode['grade_progression'],
        learning_outcomes: Array.isArray(fm.learning_outcomes) ? fm.learning_outcomes.map(String) : [],
        filePath: doc.filePath
      };

      graph.nodes.set(node.id, node);
      graph.outgoing.set(node.id, []);
      graph.incoming.set(node.id, []);
    }

    // 2. Registrar Aristas
    for (const [, node] of graph.nodes) {
      const addEdge = (targetId: string, type: AcademicEdgeType) => {
        const edge: AcademicGraphEdge = { from: node.id, to: targetId, type };
        graph.edges.push(edge);
        graph.outgoing.get(node.id)?.push(edge);
        if (graph.incoming.has(targetId)) {
          graph.incoming.get(targetId)?.push(edge);
        }
      };

      node.prerequisites.forEach(p => addEdge(p, 'prerequisite'));
      node.builds_on.forEach(b => addEdge(b, 'builds_on'));
      node.extends.forEach(e => addEdge(e, 'extends'));
      node.related_to.forEach(r => addEdge(r, 'related_to'));
      node.assessed_by.forEach(a => addEdge(a, 'assessed_by'));
    }

    return graph;
  }

  /**
   * Obtiene un nodo por su ID.
   */
  getNode(id: string): AcademicGraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Obtiene todos los nodos del grafo.
   */
  getAllNodes(): AcademicGraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Obtiene todas las aristas del grafo.
   */
  getAllEdges(): AcademicGraphEdge[] {
    return this.edges;
  }

  /**
   * Obtiene los prerrequisitos (directos o recursivos) de un concepto.
   */
  getPrerequisites(nodeId: string, recursive: boolean = true): string[] {
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = this.nodes.get(current);
      if (!node) continue;

      const direct = [...node.prerequisites, ...node.builds_on];
      for (const p of direct) {
        if (!visited.has(p)) {
          visited.add(p);
          if (recursive) {
            queue.push(p);
          }
        }
      }
    }

    return Array.from(visited);
  }

  /**
   * Obtiene los nodos dependientes (conceptos que requieren a este nodo).
   */
  getDependents(nodeId: string): string[] {
    const incomingEdges = this.incoming.get(nodeId) || [];
    return incomingEdges
      .filter(e => e.type === 'prerequisite' || e.type === 'builds_on' || e.type === 'extends')
      .map(e => e.from);
  }

  /**
   * Traza la ruta secuencial de aprendizaje (ordenamiento topológico hacia un objetivo).
   */
  getLearningPath(targetNodeId: string): string[] {
    const prereqs = this.getPrerequisites(targetNodeId, true);
    const subnodes = [targetNodeId, ...prereqs];
    const subnodeSet = new Set(subnodes);

    // Grado de entrada para ordenación topológica
    const inDegree = new Map<string, number>();
    const localAdj = new Map<string, string[]>();

    for (const id of subnodes) {
      inDegree.set(id, 0);
      localAdj.set(id, []);
    }

    for (const id of subnodes) {
      const node = this.nodes.get(id);
      if (!node) continue;
      const deps = [...node.prerequisites, ...node.builds_on].filter(d => subnodeSet.has(d));
      for (const d of deps) {
        // d debe aprenderse antes que id: d -> id
        localAdj.get(d)?.push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const path: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      path.push(u);
      const neighbors = localAdj.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    return path;
  }

  /**
   * Detecta dependencias circulares en las aristas de prerrequisitos.
   */
  detectCycles(): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (u: string, currentPath: string[]) => {
      visited.add(u);
      recStack.add(u);
      currentPath.push(u);

      const node = this.nodes.get(u);
      const targets = node ? [...node.prerequisites, ...node.builds_on] : [];

      for (const v of targets) {
        if (!visited.has(v)) {
          dfs(v, [...currentPath]);
        } else if (recStack.has(v)) {
          const cycleStartIdx = currentPath.indexOf(v);
          cycles.push(currentPath.slice(cycleStartIdx).concat(v));
        }
      }

      recStack.delete(u);
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }

    return cycles;
  }

  /**
   * Identifica nodos huérfanos (conceptos curriculares sin ningún enlace entrante ni saliente).
   * Excluye documentación de sistema, especificaciones de fuentes y mapas de grado.
   */
  findOrphanNodes(): string[] {
    const orphans: string[] = [];
    for (const [id, node] of this.nodes) {
      if (
        node.type === 'system_documentation' ||
        node.type === 'system_index' ||
        node.type === 'source_spec' ||
        node.type === 'grade_profile' ||
        node.filePath.includes('00_SYSTEM') ||
        node.filePath.includes('99_SOURCES')
      ) {
        continue;
      }

      const outCount = this.outgoing.get(id)?.length || 0;
      const inCount = this.incoming.get(id)?.length || 0;

      if (outCount === 0 && inCount === 0) {
        orphans.push(id);
      }
    }
    return orphans;
  }

  /**
   * Genera estadísticas consolidadas del Grafo Académico.
   */
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    edgeBreakdown: Record<AcademicEdgeType, number>;
    orphanCount: number;
    cyclesCount: number;
  } {
    const edgeBreakdown: Record<AcademicEdgeType, number> = {
      prerequisite: 0,
      builds_on: 0,
      extends: 0,
      related_to: 0,
      assessed_by: 0
    };

    for (const e of this.edges) {
      edgeBreakdown[e.type] = (edgeBreakdown[e.type] || 0) + 1;
    }

    const orphans = this.findOrphanNodes();
    const cycles = this.detectCycles();

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      edgeBreakdown,
      orphanCount: orphans.length,
      cyclesCount: cycles.length
    };
  }

  /**
   * Exporta el grafo o subgrafo en formato de diagrama Mermaid.
   */
  toMermaid(options: { nodeId?: string; maxNodes?: number } = {}): string {
    const lines: string[] = ['graph TD'];
    const nodesToInclude = new Set<string>();

    if (options.nodeId) {
      nodesToInclude.add(options.nodeId);
      this.getPrerequisites(options.nodeId, true).forEach(p => nodesToInclude.add(p));
      this.getDependents(options.nodeId).forEach(d => nodesToInclude.add(d));
    } else {
      const max = options.maxNodes || 80;
      let count = 0;
      for (const id of this.nodes.keys()) {
        if (count >= max) break;
        nodesToInclude.add(id);
        count++;
      }
    }

    // Agregar estilos y clases según CEFR
    for (const id of nodesToInclude) {
      const node = this.nodes.get(id);
      if (!node) continue;
      const cefr = node.cefr[0] || 'Gen';
      const cleanTitle = (node.title || id).replace(/["()]/g, '');
      lines.push(`  ${id}["[${cefr}] ${cleanTitle}"]`);
    }

    // Agregar aristas
    for (const edge of this.edges) {
      if (nodesToInclude.has(edge.from) && nodesToInclude.has(edge.to)) {
        if (edge.type === 'prerequisite') {
          lines.push(`  ${edge.to} -.->|prereq| ${edge.from}`);
        } else if (edge.type === 'builds_on') {
          lines.push(`  ${edge.to} ==>|builds_on| ${edge.from}`);
        } else if (edge.type === 'extends') {
          lines.push(`  ${edge.to} -->|extends| ${edge.from}`);
        } else if (edge.type === 'related_to') {
          lines.push(`  ${edge.from} ---|related| ${edge.to}`);
        } else if (edge.type === 'assessed_by') {
          lines.push(`  ${edge.from} -.->|assessed_by| ${edge.to}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Exporta el grafo en formato Graphviz (DOT).
   */
  toDot(options: { nodeId?: string } = {}): string {
    const lines: string[] = ['digraph AcademicCurriculum {', '  rankdir=LR;', '  node [shape=box, style=rounded, fontname="Helvetica"];'];
    const nodesToInclude = new Set<string>();

    if (options.nodeId) {
      nodesToInclude.add(options.nodeId);
      this.getPrerequisites(options.nodeId, true).forEach(p => nodesToInclude.add(p));
      this.getDependents(options.nodeId).forEach(d => nodesToInclude.add(d));
    } else {
      for (const id of this.nodes.keys()) nodesToInclude.add(id);
    }

    for (const id of nodesToInclude) {
      const node = this.nodes.get(id);
      if (!node) continue;
      const label = `[${node.cefr.join('/')}] ${node.title}`;
      lines.push(`  "${id}" [label="${label.replace(/"/g, '\\"')}"];`);
    }

    for (const edge of this.edges) {
      if (nodesToInclude.has(edge.from) && nodesToInclude.has(edge.to)) {
        lines.push(`  "${edge.to}" -> "${edge.from}" [label="${edge.type}"];`);
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Exporta el grafo en formato JSON estructurado.
   */
  toJson(nodeId?: string): string {
    if (nodeId) {
      const node = this.nodes.get(nodeId);
      const prereqs = this.getPrerequisites(nodeId, true);
      const dependents = this.getDependents(nodeId);
      const path = this.getLearningPath(nodeId);
      return JSON.stringify({ node, directPrerequisites: node?.prerequisites || [], upstreamPrerequisites: prereqs, dependents, learningPath: path }, null, 2);
    }

    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      stats: this.getStats()
    }, null, 2);
  }
}
