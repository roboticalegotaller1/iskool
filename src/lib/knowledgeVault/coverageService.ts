/**
 * @file coverageService.ts
 * @description Servicio de análisis de cobertura curricular y detección de duplicados semánticos de iSchool.
 * Genera la matriz Grado x Dominio x CEFR para identificar huecos formativos y vigilar la integridad del catálogo.
 */

import { ParsedKnowledgeDocument } from './types';
import { VALID_GRADES, VALID_CEFR_LEVELS } from './taxonomy';

export const CURRICULAR_DOMAINS = [
  'Listening',
  'Speaking',
  'Reading',
  'Writing',
  'Grammar',
  'Vocabulary',
  'Pronunciation',
  'Language Functions',
  'Discourse',
  'Assessment',
  'Study Skills',
  'Intercultural Communication'
] as const;

export type CurricularDomain = typeof CURRICULAR_DOMAINS[number];

export interface CoverageCell {
  count: number;
  documentIds: string[];
}

export interface CoverageReport {
  matrix: Record<string, Record<CurricularDomain, CoverageCell>>;
  cefrMatrix: Record<string, Record<CurricularDomain, CoverageCell>>;
  totalDocuments: number;
  domainCounts: Record<CurricularDomain, number>;
  gradeCounts: Record<string, number>;
  cefrCounts: Record<string, number>;
  gaps: {
    grade: string;
    domain: CurricularDomain;
  }[];
}

export interface DuplicateCandidate {
  idA: string;
  idB: string;
  titleA: string;
  titleB: string;
  similarityScore: number;
  reason: string;
}

export class CoverageService {
  /**
   * Mapea un documento de la Bóveda a uno o más de los 12 dominios canónicos.
   */
  static classifyDomain(doc: ParsedKnowledgeDocument): CurricularDomain[] {
    const domains = new Set<CurricularDomain>();
    const fm = doc.frontmatter;
    const rel = doc.relativePath.toLowerCase();
    const type = (fm.type || '').toLowerCase();
    const id = (doc.documentId || '').toLowerCase();

    // Clasificación por tipo o ruta
    if (rel.includes('listening') || fm.skills?.includes('listening')) domains.add('Listening');
    if (rel.includes('speaking') || fm.skills?.includes('speaking')) domains.add('Speaking');
    if (rel.includes('reading') || fm.skills?.includes('reading')) domains.add('Reading');
    if (rel.includes('writing') || fm.skills?.includes('writing')) domains.add('Writing');
    if (rel.includes('grammar') || type === 'grammar_rule' || id.startsWith('grammar_') || fm.skills?.includes('grammar')) domains.add('Grammar');
    if (rel.includes('vocabulary') || type === 'vocabulary_set' || id.startsWith('vocab_') || fm.skills?.includes('vocabulary')) domains.add('Vocabulary');
    if (rel.includes('pronunciation') || type === 'pronunciation_guide' || id.startsWith('pronunciation_') || fm.skills?.includes('pronunciation')) domains.add('Pronunciation');
    if (rel.includes('languagefunctions') || type === 'language_function' || id.startsWith('func_')) domains.add('Language Functions');
    if (rel.includes('discourse') || type === 'discourse_marker' || id.startsWith('discourse_')) domains.add('Discourse');
    if (rel.includes('assessment') || type === 'assessment_rubric' || id.startsWith('rubric_') || id.startsWith('assessment_')) domains.add('Assessment');
    if (rel.includes('study_skills') || type === 'study_skills' || id.startsWith('study_skills_')) domains.add('Study Skills');
    if (rel.includes('intercultural') || type === 'intercultural_competence' || id.startsWith('culture_')) domains.add('Intercultural Communication');

    // Si aún no se asignó ninguno, derivar de subskills o contenido
    if (domains.size === 0) {
      if (type === 'activity_pattern') domains.add('Speaking');
      else domains.add('Vocabulary');
    }

    return Array.from(domains);
  }

  /**
   * Genera el reporte completo de cobertura curricular Grado x Dominio y CEFR x Dominio.
   */
  static generateReport(docs: ParsedKnowledgeDocument[]): CoverageReport {
    const curricularDocs = docs.filter(d => 
      !d.relativePath.includes('00_SYSTEM') && 
      !d.relativePath.includes('99_SOURCES') &&
      d.frontmatter.type !== 'system_documentation' &&
      d.frontmatter.type !== 'source_spec'
    );

    const matrix: CoverageReport['matrix'] = {} as CoverageReport['matrix'];
    const cefrMatrix: CoverageReport['cefrMatrix'] = {} as CoverageReport['cefrMatrix'];
    const domainCounts: Record<CurricularDomain, number> = {} as Record<CurricularDomain, number>;
    const gradeCounts: Record<string, number> = {};
    const cefrCounts: Record<string, number> = {};

    CURRICULAR_DOMAINS.forEach(dom => {
      domainCounts[dom] = 0;
    });

    VALID_GRADES.forEach(g => {
      gradeCounts[g] = 0;
      matrix[g] = {} as Record<CurricularDomain, CoverageCell>;
      CURRICULAR_DOMAINS.forEach(dom => {
        matrix[g][dom] = { count: 0, documentIds: [] };
      });
    });

    VALID_CEFR_LEVELS.forEach(c => {
      cefrCounts[c] = 0;
      cefrMatrix[c] = {} as Record<CurricularDomain, CoverageCell>;
      CURRICULAR_DOMAINS.forEach(dom => {
        cefrMatrix[c][dom] = { count: 0, documentIds: [] };
      });
    });

    for (const doc of curricularDocs) {
      const docDomains = this.classifyDomain(doc);
      const grades = doc.frontmatter.grades || [];
      const cefrs = doc.frontmatter.cefr || [];

      docDomains.forEach(dom => {
        domainCounts[dom]++;
      });

      for (const g of grades) {
        if (matrix[g]) {
          gradeCounts[g] = (gradeCounts[g] || 0) + 1;
          for (const dom of docDomains) {
            matrix[g][dom].count++;
            matrix[g][dom].documentIds.push(doc.documentId);
          }
        }
      }

      for (const c of cefrs) {
        if (cefrMatrix[c]) {
          cefrCounts[c] = (cefrCounts[c] || 0) + 1;
          for (const dom of docDomains) {
            cefrMatrix[c][dom].count++;
            cefrMatrix[c][dom].documentIds.push(doc.documentId);
          }
        }
      }
    }

    // Detectar huecos (gaps)
    const gaps: CoverageReport['gaps'] = [];
    VALID_GRADES.forEach(g => {
      CURRICULAR_DOMAINS.forEach(dom => {
        if (matrix[g][dom].count === 0) {
          gaps.push({ grade: g, domain: dom });
        }
      });
    });

    return {
      matrix,
      cefrMatrix,
      totalDocuments: curricularDocs.length,
      domainCounts,
      gradeCounts,
      cefrCounts,
      gaps
    };
  }

  /**
   * Detecta posibles duplicados semánticos calculando la similitud léxica y de tokens entre identificadores.
   */
  static findDuplicates(docs: ParsedKnowledgeDocument[]): DuplicateCandidate[] {
    const candidates: DuplicateCandidate[] = [];
    const validDocs = docs.filter(d => Boolean(d.documentId) && !d.relativePath.includes('00_SYSTEM') && !d.relativePath.includes('99_SOURCES'));

    const normalize = (str: string) => {
      return str
        .toLowerCase()
        .replace(/^(func_|grammar_|vocab_|speaking_|reading_|writing_|listening_|pattern_|rubric_)/, '')
        .replace(/_(pre_a1|a1|a2|b1|b2|c1|c2)$/, '')
        .replace(/[^a-z0-9]/g, '');
    };

    for (let i = 0; i < validDocs.length; i++) {
      for (let j = i + 1; j < validDocs.length; j++) {
        const docA = validDocs[i];
        const docB = validDocs[j];

        const idA = docA.documentId;
        const idB = docB.documentId;

        // Si son exactamente iguales en identificador base normalizado
        const normA = normalize(idA);
        const normB = normalize(idB);

        if (normA.length > 4 && normA === normB && idA !== idB) {
          candidates.push({
            idA,
            idB,
            titleA: docA.frontmatter.title || idA,
            titleB: docB.frontmatter.title || idB,
            similarityScore: 1.0,
            reason: `Raíz canónica idéntica: "${normA}"`
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Genera la tabla visual de matriz en texto ASCII para el terminal.
   */
  static formatAsciiTable(report: CoverageReport, targetGrades?: string[]): string {
    const gradesToShow = targetGrades || ['preschool_1', 'primary_1', 'primary_2', 'primary_3', 'primary_4', 'secondary_3', 'high_school_1'];
    const headers = ['Dominio', ...gradesToShow.map(g => g.replace('primary_', 'P').replace('preschool_', 'Pre').replace('secondary_', 'S').replace('high_school_', 'H'))];

    const colWidths = [24, ...gradesToShow.map(() => 6)];
    const pad = (s: string, w: number) => s.padEnd(w).slice(0, w);
    const center = (s: string, w: number) => {
      const left = Math.max(0, Math.floor((w - s.length) / 2));
      return ' '.repeat(left) + s + ' '.repeat(Math.max(0, w - s.length - left));
    };

    const lines: string[] = [];
    lines.push('+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+');
    lines.push('|' + headers.map((h, i) => center(h, colWidths[i])).join('|') + '|');
    lines.push('+' + colWidths.map(w => '='.repeat(w)).join('+') + '+');

    for (const dom of CURRICULAR_DOMAINS) {
      const row = [pad(dom, colWidths[0])];
      for (let i = 0; i < gradesToShow.length; i++) {
        const g = gradesToShow[i];
        const count = report.matrix[g]?.[dom]?.count || 0;
        const cell = count > 0 ? `✓ (${count})` : ' · ';
        row.push(center(cell, colWidths[i + 1]));
      }
      lines.push('|' + row.join('|') + '|');
    }
    lines.push('+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+');

    return lines.join('\n');
  }
}
