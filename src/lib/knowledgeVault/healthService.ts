/**
 * @file healthService.ts
 * @description Servicio de diagnóstico de salud y calidad técnica del Knowledge Vault de iSchool.
 * Audita exhaustivamente:
 * - Unidades totales por CEFR, Grado, Dominio, Skill, Estado
 * - Nodos huérfanos, referencias rotas, prerrequisitos faltantes
 * - Candidatos a duplicado
 * - Conceptos sin fuente, sin learning outcomes, sin assessment evidence o sin grade progression
 * - Quality Score técnico binario (conteo de unidades 'needs_review' vs 'approved')
 */

import { KnowledgeVaultLoader } from './loader';
import { AcademicGraph } from './academicGraph';
import { CoverageService, CURRICULAR_DOMAINS, CurricularDomain } from './coverageService';
import { KnowledgeVaultValidator } from './validator';
import { ParsedKnowledgeDocument } from './types';

export interface ConceptDefect {
  id: string;
  title: string;
  filePath: string;
  issues: string[];
}

export interface KnowledgeHealthReport {
  totalKnowledgeUnits: number;
  byCefr: Record<string, number>;
  byGrade: Record<string, number>;
  byDomain: Record<CurricularDomain, number>;
  bySkill: Record<string, number>;
  byStatus: Record<string, number>;
  orphanConcepts: string[];
  brokenReferences: { id: string; targetId: string; relationType: string }[];
  missingPrerequisites: { id: string; missingPrereqId: string }[];
  duplicateCandidates: { idA: string; idB: string; reason: string }[];
  conceptsWithoutSource: string[];
  conceptsWithoutLearningOutcomes: string[];
  conceptsWithoutAssessmentEvidence: string[];
  conceptsWithoutGradeProgression: string[];
  qualitySummary: {
    totalEvaluated: number;
    fullyCompliant: number;
    needsReview: number;
    compliancePercentage: number;
  };
  defects: ConceptDefect[];
}

export class KnowledgeVaultHealthService {
  /**
   * Ejecuta la auditoría exhaustiva de salud curricular.
   */
  static runAudit(docs?: ParsedKnowledgeDocument[]): KnowledgeHealthReport {
    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const graph = AcademicGraph.build(loadedDocs);
    const coverageReport = CoverageService.generateReport(loadedDocs);
    const duplicates = CoverageService.findDuplicates(loadedDocs);

    const validIdSet = new Set(loadedDocs.map(d => d.documentId).filter(Boolean));

    // Desgloses
    const byCefr: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    const bySkill: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    const brokenReferences: KnowledgeHealthReport['brokenReferences'] = [];
    const missingPrerequisites: KnowledgeHealthReport['missingPrerequisites'] = [];
    const conceptsWithoutSource: string[] = [];
    const conceptsWithoutLearningOutcomes: string[] = [];
    const conceptsWithoutAssessmentEvidence: string[] = [];
    const conceptsWithoutGradeProgression: string[] = [];
    const defects: ConceptDefect[] = [];

    // Filtrar documentos curriculares
    const curricularDocs = loadedDocs.filter(d => 
      !d.relativePath.includes('00_SYSTEM') && 
      !d.relativePath.includes('99_SOURCES') &&
      d.frontmatter.type !== 'system_documentation' &&
      d.frontmatter.type !== 'source_spec'
    );

    for (const doc of curricularDocs) {
      const id = doc.documentId;
      const fm = doc.frontmatter;
      const docIssues: string[] = [];

      // Conteo de estado
      const status = fm.status || 'draft';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Conteo por CEFR
      (fm.cefr || []).forEach(c => {
        byCefr[c] = (byCefr[c] || 0) + 1;
      });

      // Conteo por Grado
      (fm.grades || []).forEach(g => {
        byGrade[g] = (byGrade[g] || 0) + 1;
      });

      // Conteo por Habilidad
      (fm.skills || []).forEach(s => {
        bySkill[s] = (bySkill[s] || 0) + 1;
      });

      // Checks binarios de integridad
      const isRubricOrFramework = fm.type === 'assessment_rubric' || fm.type === 'framework_spec' || fm.type === 'grade_profile';

      // 1. Fuentes
      if (!fm.source_ids || fm.source_ids.length === 0) {
        conceptsWithoutSource.push(id);
        docIssues.push('Carece de source_ids registrados');
      }

      // 2. Learning Outcomes (solo para unidades pedagógicas atómicas)
      if (!isRubricOrFramework && (!fm.learning_outcomes || fm.learning_outcomes.length === 0)) {
        conceptsWithoutLearningOutcomes.push(id);
        docIssues.push('Carece de learning_outcomes observables');
      }

      // 3. Assessment Evidence
      if (!isRubricOrFramework && (!fm.assessment_evidence || fm.assessment_evidence.length === 0)) {
        conceptsWithoutAssessmentEvidence.push(id);
        docIssues.push('Carece de assessment_evidence tangible');
      }

      // 4. Grade Progression
      if (!isRubricOrFramework && (!fm.grade_progression || Object.keys(fm.grade_progression).length === 0)) {
        conceptsWithoutGradeProgression.push(id);
        docIssues.push('Carece de especificación de grade_progression');
      }

      // 5. Referencias Rotas en Grafo
      const allRels: [string[], string][] = [
        [fm.prerequisites || [], 'prerequisite'],
        [fm.builds_on || [], 'builds_on'],
        [fm.extends || [], 'extends'],
        [fm.related_to || [], 'related_to'],
        [fm.assessed_by || [], 'assessed_by']
      ];

      for (const [targets, relType] of allRels) {
        for (const tId of targets) {
          if (!validIdSet.has(tId)) {
            brokenReferences.push({ id, targetId: tId, relationType: relType });
            docIssues.push(`Referencia rota (${relType}): "${tId}" no existe`);
            if (relType === 'prerequisite' || relType === 'builds_on') {
              missingPrerequisites.push({ id, missingPrereqId: tId });
            }
          }
        }
      }

      if (docIssues.length > 0) {
        defects.push({
          id,
          title: fm.title || id,
          filePath: doc.relativePath,
          issues: docIssues
        });
      }
    }

    const orphanConcepts = graph.findOrphanNodes();
    const fullyCompliant = curricularDocs.length - defects.length;
    const compliancePercentage = curricularDocs.length > 0 
      ? Math.round((fullyCompliant / curricularDocs.length) * 100) 
      : 100;

    return {
      totalKnowledgeUnits: curricularDocs.length,
      byCefr,
      byGrade,
      byDomain: coverageReport.domainCounts,
      bySkill,
      byStatus,
      orphanConcepts,
      brokenReferences,
      missingPrerequisites,
      duplicateCandidates: duplicates.map(d => ({ idA: d.idA, idB: d.idB, reason: d.reason })),
      conceptsWithoutSource,
      conceptsWithoutLearningOutcomes,
      conceptsWithoutAssessmentEvidence,
      conceptsWithoutGradeProgression,
      qualitySummary: {
        totalEvaluated: curricularDocs.length,
        fullyCompliant,
        needsReview: defects.length,
        compliancePercentage
      },
      defects
    };
  }

  /**
   * Formatea el reporte para visualización en terminal.
   */
  static formatReport(report: KnowledgeHealthReport): string {
    const lines: string[] = [];
    lines.push('\n================================================================');
    lines.push('🏥 REPORTE DE SALUD Y CALIDAD CURRICULAR (iSchool English Knowledge Vault)');
    lines.push('================================================================\n');

    lines.push(`Total Unidades Curriculares Analizadas: ${report.totalKnowledgeUnits}`);
    lines.push(`Score de Calidad Técnica: ${report.qualitySummary.compliancePercentage}% de cumplimiento pleno`);
    lines.push(`  • Unidades 100% conformes: ${report.qualitySummary.fullyCompliant}`);
    lines.push(`  • Unidades con observaciones (needs_review): ${report.qualitySummary.needsReview}`);

    lines.push('\nDesglose por Estado de Gobernanza:');
    for (const [st, count] of Object.entries(report.byStatus)) {
      lines.push(`  • ${st.toUpperCase().padEnd(12)}: ${count}`);
    }

    lines.push('\nDesglose por Nivel CEFR:');
    for (const [lvl, count] of Object.entries(report.byCefr)) {
      lines.push(`  • ${lvl.padEnd(12)}: ${count}`);
    }

    lines.push('\nDesglose por Habilidad Lingüística:');
    for (const [sk, count] of Object.entries(report.bySkill)) {
      lines.push(`  • ${sk.padEnd(14)}: ${count}`);
    }

    lines.push('\n--- Indicadores Forenses de Integridad ---');
    lines.push(`  • Nodos Huérfanos: ${report.orphanConcepts.length === 0 ? '✅ 0' : `⚠️ ${report.orphanConcepts.length}`}`);
    lines.push(`  • Referencias Rotas: ${report.brokenReferences.length === 0 ? '✅ 0' : `❌ ${report.brokenReferences.length}`}`);
    lines.push(`  • Prerrequisitos Inexistentes: ${report.missingPrerequisites.length === 0 ? '✅ 0' : `❌ ${report.missingPrerequisites.length}`}`);
    lines.push(`  • Candidatos a Duplicado: ${report.duplicateCandidates.length === 0 ? '✅ 0' : `⚠️ ${report.duplicateCandidates.length}`}`);
    lines.push(`  • Unidades sin Fuente Oficial: ${report.conceptsWithoutSource.length === 0 ? '✅ 0' : `⚠️ ${report.conceptsWithoutSource.length}`}`);
    lines.push(`  • Unidades sin Learning Outcomes: ${report.conceptsWithoutLearningOutcomes.length === 0 ? '✅ 0' : `⚠️ ${report.conceptsWithoutLearningOutcomes.length}`}`);
    lines.push(`  • Unidades sin Assessment Evidence: ${report.conceptsWithoutAssessmentEvidence.length === 0 ? '✅ 0' : `⚠️ ${report.conceptsWithoutAssessmentEvidence.length}`}`);
    lines.push(`  • Unidades sin Grade Progression: ${report.conceptsWithoutGradeProgression.length === 0 ? '✅ 0' : `⚠️ ${report.conceptsWithoutGradeProgression.length}`}`);

    if (report.defects.length > 0) {
      lines.push('\n--- Muestra de Unidades con Observaciones Pendientes (Top 5) ---');
      report.defects.slice(0, 5).forEach(d => {
        lines.push(`  ⚠️ [${d.id}] (${d.filePath}):`);
        d.issues.forEach(i => lines.push(`     - ${i}`));
      });
      if (report.defects.length > 5) {
        lines.push(`  ... y ${report.defects.length - 5} unidades adicionales requieren actualización progresiva en sus batches correspondientes.`);
      }
    }

    return lines.join('\n');
  }
}
