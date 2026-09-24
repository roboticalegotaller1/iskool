/**
 * @file gradeCoverageService.ts
 * @description Servicio de análisis de cobertura curricular detallada por grado escolar específico en iSchool.
 * Evalúa los 12 dominios canónicos para un grado dado y clasifica el estado como:
 * - COMPLETE (≥ 2 unidades curriculares activas)
 * - PARTIAL (1 unidad curricular activa)
 * - MISSING (0 unidades curriculares activas)
 */

import { KnowledgeVaultLoader } from './loader';
import { CoverageService, CURRICULAR_DOMAINS, CurricularDomain } from './coverageService';
import { ParsedKnowledgeDocument } from './types';
import { KnowledgeTaxonomy } from './taxonomy';

export type DomainCoverageStatus = 'complete' | 'partial' | 'missing';

export interface DomainCoverageItem {
  domain: CurricularDomain;
  status: DomainCoverageStatus;
  count: number;
  documentIds: string[];
}

export interface GradeCoverageReport {
  grade: string;
  totalActiveUnits: number;
  completeCount: number;
  partialCount: number;
  missingCount: number;
  domainResults: DomainCoverageItem[];
}

export class GradeCoverageService {
  /**
   * Genera el diagnóstico de cobertura para un grado específico.
   */
  static analyzeGrade(gradeInput: string, docs?: ParsedKnowledgeDocument[]): GradeCoverageReport {
    const cleanGrade = gradeInput.toLowerCase().replace(/^\[|\]$/g, '').trim();

    if (!KnowledgeTaxonomy.isGradeValid(cleanGrade)) {
      throw new Error(`GradeCoverageService: Grado escolar "${cleanGrade}" no reconocido en la taxonomía.`);
    }

    const loadedDocs = docs || KnowledgeVaultLoader.loadAll();
    const coverage = CoverageService.generateReport(loadedDocs);
    const gradeMatrix = coverage.matrix[cleanGrade] || {};

    let completeCount = 0;
    let partialCount = 0;
    let missingCount = 0;
    let totalActiveUnits = 0;

    const domainResults: DomainCoverageItem[] = CURRICULAR_DOMAINS.map(domain => {
      const cell = gradeMatrix[domain] || { count: 0, documentIds: [] };
      const count = cell.count;
      totalActiveUnits += count;

      let status: DomainCoverageStatus = 'missing';
      if (count >= 2) {
        status = 'complete';
        completeCount++;
      } else if (count === 1) {
        status = 'partial';
        partialCount++;
      } else {
        missingCount++;
      }

      return {
        domain,
        status,
        count,
        documentIds: cell.documentIds
      };
    });

    return {
      grade: cleanGrade,
      totalActiveUnits,
      completeCount,
      partialCount,
      missingCount,
      domainResults
    };
  }

  /**
   * Formatea el reporte para visualización en terminal.
   */
  static formatReport(report: GradeCoverageReport): string {
    const lines: string[] = [];
    lines.push('\n================================================================');
    lines.push(`🎯 REPORTE DE COBERTURA POR GRADO: [${report.grade.toUpperCase()}]`);
    lines.push('================================================================\n');

    lines.push(`Total Unidades Vinculadas: ${report.totalActiveUnits}`);
    lines.push(`Resumen de Dominios:`);
    lines.push(`  🟢 Completos (≥2): ${report.completeCount}`);
    lines.push(`  🟡 Parciales (=1): ${report.partialCount}`);
    lines.push(`  🔴 Faltantes (=0): ${report.missingCount}\n`);

    lines.push('Desglose por Dominio Curricular:');
    report.domainResults.forEach(item => {
      const icon = item.status === 'complete' ? '🟢 COMPLETE' : item.status === 'partial' ? '🟡 PARTIAL ' : '🔴 MISSING ';
      const countStr = `(${item.count} unidades)`.padEnd(15);
      const docsPreview = item.documentIds.length > 0 ? `→ [${item.documentIds.slice(0, 3).join(', ')}${item.documentIds.length > 3 ? '...' : ''}]` : '';
      lines.push(`  ${icon} | ${item.domain.padEnd(28)} ${countStr} ${docsPreview}`);
    });

    return lines.join('\n');
  }
}
