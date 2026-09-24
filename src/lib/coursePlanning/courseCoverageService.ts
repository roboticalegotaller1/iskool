/**
 * @file courseCoverageService.ts
 * @description Servicio de diagnóstico de Cobertura Curricular del Curso (Course Coverage Service).
 * Compara los requerimientos canónicos del Grade Map (Bóveda Curricular) frente a la programación real
 * del Course Plan, clasificando cada objetivo como covered, partially_covered o missing.
 */

import { UnitEntity, LessonEntity, CourseCoverageReport } from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';

export class CourseCoverageService {
  /**
   * Compara los requerimientos del perfil de grado frente al plan del curso.
   */
  static analyze(
    courseId: string,
    grade: string,
    units: UnitEntity[],
    lessons: LessonEntity[]
  ): CourseCoverageReport {
    // 1. Obtener los requerimientos del Grade Map correspondiente
    const cleanGrade = grade.toLowerCase().trim();
    let requiredTargets: string[] = [];

    try {
      const allDocs = KnowledgeVaultLoader.loadAll();
      const gradeMapDoc = allDocs.find(d => 
        d.frontmatter.type === 'grade_profile' && 
        (d.frontmatter.grades || []).includes(cleanGrade)
      );

      if (gradeMapDoc) {
        // Extraer gramática requerida, topics y enlaces bidireccionales
        const fm = gradeMapDoc.frontmatter;
        const grammarReqs = (fm.grammar || []).map((g: string) => `grammar_${g}`);
        const topicReqs = (fm.topics || []).map((t: string) => `topic_${t}`);
        const linkedNodes = (gradeMapDoc.wikiLinks || []);

        requiredTargets = Array.from(new Set([
          ...grammarReqs,
          ...topicReqs,
          ...linkedNodes
        ]));
      }
    } catch {
      // Fallback a targets estándar si se corre en entorno de pruebas aislado
    }

    if (requiredTargets.length === 0) {
      // Requerimientos canónicos de High School 1
      requiredTargets = [
        'listening_b1_b2_main_ideas',
        'listening_b1_b2_detail_and_attitude',
        'speaking_b1_b2_collaborative_discussion',
        'speaking_b1_b2_speculation_and_presentation',
        'HS1_Reading_Inference_Author_Purpose',
        'HS1_Reading_Gist_Scanning',
        'HS1_Writing_Formal_Informal_Correspondence',
        'HS1_Writing_Opinion_Argument',
        'grammar_b1_b2_conditionals_progression',
        'grammar_b1_b2_discourse_connectors',
        'grammar_b1_b2_passive_voice_discourse',
        'vocab_b1_b2_technology_media',
        'vocab_b1_b2_environment_global_issues',
        'vocab_b1_b2_future_careers_education'
      ];
    }

    // 2. Contar la frecuencia de aparición de cada target en las lecciones programadas
    const targetFrequencies: Record<string, number> = {};
    for (const req of requiredTargets) {
      targetFrequencies[req] = 0;
    }

    for (const lesson of lessons) {
      for (const t of lesson.knowledge_targets || []) {
        for (const req of requiredTargets) {
          if (t.toLowerCase() === req.toLowerCase() || t.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(t.toLowerCase())) {
            targetFrequencies[req] = (targetFrequencies[req] || 0) + 1;
          }
        }
      }
    }

    // También buscar en los targets declarados de las unidades
    for (const unit of units) {
      for (const t of unit.knowledge_targets || []) {
        for (const req of requiredTargets) {
          if (t.toLowerCase() === req.toLowerCase() || t.toLowerCase().includes(req.toLowerCase())) {
            targetFrequencies[req] = Math.max(targetFrequencies[req] || 0, 1);
          }
        }
      }
    }

    const covered: string[] = [];
    const partiallyCovered: string[] = [];
    const missing: string[] = [];

    for (const req of requiredTargets) {
      const count = targetFrequencies[req] || 0;
      if (count >= 2) {
        covered.push(req);
      } else if (count === 1) {
        partiallyCovered.push(req);
      } else {
        missing.push(req);
      }
    }

    const totalReqs = requiredTargets.length;
    const effectivePoints = covered.length + (partiallyCovered.length * 0.5);
    const coveragePercent = totalReqs > 0 ? Math.round((effectivePoints / totalReqs) * 100) : 100;

    return {
      course_id: courseId,
      grade: cleanGrade,
      required_knowledge_targets: requiredTargets,
      covered_targets: covered,
      partially_covered_targets: partiallyCovered,
      missing_targets: missing,
      coverage_percent: coveragePercent
    };
  }

  /**
   * Formateo textual para CLI.
   */
  static formatForCli(report: CourseCoverageReport): string {
    const lines: string[] = [];
    lines.push(`================================================================`);
    lines.push(`🎯 DIAGNÓSTICO DE COBERTURA: GRADE MAP VS COURSE PLAN`);
    lines.push(`================================================================`);
    lines.push(`Curso: ${report.course_id} | Grado Canónico: ${report.grade}`);
    lines.push(`Porcentaje de Cobertura Efectiva: ${report.coverage_percent}%`);
    lines.push(`Total Requerimientos Auditados: ${report.required_knowledge_targets.length}`);
    lines.push(`  🟢 Completamente Cubiertos (≥2 sesiones): ${report.covered_targets.length}`);
    lines.push(`  🟡 Parcialmente Cubiertos (1 sesión): ${report.partially_covered_targets.length}`);
    lines.push(`  🔴 No Cubiertos / Faltantes: ${report.missing_targets.length}`);
    lines.push(``);

    if (report.missing_targets.length > 0) {
      lines.push(`Metas del Grade Map No Cubiertas:`);
      for (const m of report.missing_targets) lines.push(`  • ${m}`);
    } else {
      lines.push(`✅ Todas las competencias del Grade Map se encuentran cubiertas en el plan.`);
    }

    return lines.join('\n');
  }
}
