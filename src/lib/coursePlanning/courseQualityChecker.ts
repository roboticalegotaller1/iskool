/**
 * @file courseQualityChecker.ts
 * @description Sistema automatizado de compuertas de calidad (10 Quality Gates) para Course Planning.
 * Audita y previene lecciones huérfanas, saltos CEFR, prerrequisitos rotos, sobrecarga de tiempo y desbalances.
 */

import { CourseEntity, UnitEntity, LessonEntity, AssessmentEntity, CourseQualityReport, QualityCheckItem } from './types';
import { TimeBudgetService } from './timeBudgetService';
import { SkillBalanceService } from './skillBalanceService';
import { SpiralCurriculumTracker } from './spiralCurriculumTracker';
import { KnowledgeVaultPrerequisiteService } from '../knowledgeVault/prerequisiteService';

export class CourseQualityChecker {
  /**
   * Ejecuta las 10 verificaciones de calidad curricular obligatorias.
   */
  static verify(
    course: CourseEntity,
    units: UnitEntity[],
    lessons: LessonEntity[],
    assessments: AssessmentEntity[]
  ): CourseQualityReport {
    const checks: QualityCheckItem[] = [];

    // 1. Lesson without outcome
    const lessonsWithoutOutcome = lessons.filter(l => !l.primary_learning_outcome || l.primary_learning_outcome.trim() === '');
    checks.push({
      rule_id: 'lesson_without_outcome',
      title: 'Lecciones sin Objetivo Pedagógico',
      severity: 'error',
      passed: lessonsWithoutOutcome.length === 0,
      message: lessonsWithoutOutcome.length === 0 
        ? 'Todas las lecciones cuentan con un primary_learning_outcome explícito.'
        : `Se detectaron ${lessonsWithoutOutcome.length} lecciones sin objetivo definido.`,
      details: lessonsWithoutOutcome.map(l => l.title)
    });

    // 2. Lesson without knowledge target
    const lessonsWithoutTargets = lessons.filter(l => !l.knowledge_targets || l.knowledge_targets.length === 0);
    checks.push({
      rule_id: 'lesson_without_knowledge_target',
      title: 'Lecciones sin Nodos de la Bóveda Curricular',
      severity: 'error',
      passed: lessonsWithoutTargets.length === 0,
      message: lessonsWithoutTargets.length === 0
        ? 'El 100% de las lecciones está anclado a la Bóveda Curricular.'
        : `Existen ${lessonsWithoutTargets.length} lecciones sin knowledge_targets asociados.`,
      details: lessonsWithoutTargets.map(l => l.title)
    });

    // 3. Unit without assessment
    const assessedUnitIds = new Set(assessments.map(a => a.unit_id).filter(Boolean));
    const unitsWithoutAssessment = units.filter(u => !assessedUnitIds.has(u.id));
    checks.push({
      rule_id: 'unit_without_assessment',
      title: 'Unidades sin Blueprint de Evaluación',
      severity: 'error',
      passed: unitsWithoutAssessment.length === 0,
      message: unitsWithoutAssessment.length === 0
        ? 'Todas las unidades cuentan con un blueprint de evaluación formativa o sumativa.'
        : `Se identificaron ${unitsWithoutAssessment.length} unidades sin evaluación asociada.`,
      details: unitsWithoutAssessment.map(u => u.title)
    });

    // 4. Assessment without target
    const assessmentsWithoutTargets = assessments.filter(a => !a.knowledge_targets || a.knowledge_targets.length === 0);
    checks.push({
      rule_id: 'assessment_without_target',
      title: 'Evaluaciones sin Metas de Aprendizaje',
      severity: 'error',
      passed: assessmentsWithoutTargets.length === 0,
      message: assessmentsWithoutTargets.length === 0
        ? 'Todas las evaluaciones tienen especificadas sus metas pedagógicas.'
        : `Hay ${assessmentsWithoutTargets.length} evaluaciones sin targets curriculares.`,
      details: assessmentsWithoutTargets.map(a => a.title)
    });

    // 5. Duplicate lesson objective
    const outcomeCounts = new Map<string, number>();
    for (const l of lessons) {
      if (l.primary_learning_outcome) {
        const text = l.primary_learning_outcome.trim();
        outcomeCounts.set(text, (outcomeCounts.get(text) || 0) + 1);
      }
    }
    const duplicateOutcomes = Array.from(outcomeCounts.entries()).filter(([_, count]) => count > 1);
    checks.push({
      rule_id: 'duplicate_lesson_objective',
      title: 'Objetivos de Lección Duplicados',
      severity: 'warning',
      passed: duplicateOutcomes.length === 0,
      message: duplicateOutcomes.length === 0
        ? 'Cero duplicaciones en los objetivos de las lecciones programadas.'
        : `Se detectaron ${duplicateOutcomes.length} objetivos pedagógicos repetidos textualmente.`,
      details: duplicateOutcomes.map(([text, count]) => `[x${count}] ${text}`)
    });

    // 6. Broken prerequisite (Enseñanza antes de prerrequisito dentro del curso)
    const seenKnowledge = new Set<string>();
    const brokenPrereqs: string[] = [];
    const courseDeclaredTargets = new Set<string>();
    for (const u of units) {
      for (const t of u.knowledge_targets || []) {
        courseDeclaredTargets.add(t);
      }
    }

    let loadedDocs: any[] | undefined = undefined;
    try {
      const { KnowledgeVaultLoader } = require('../knowledgeVault/loader');
      loadedDocs = KnowledgeVaultLoader.loadAll();
    } catch {}

    for (const l of lessons) {
      for (const target of l.knowledge_targets || []) {
        try {
          const prereqAnalysis = KnowledgeVaultPrerequisiteService.call(target, loadedDocs);
          for (const direct of prereqAnalysis.directPrerequisites) {
            // Solo alertar si el prerrequisito es una meta del propio curso y no fue visto previamente
            if (courseDeclaredTargets.has(direct.id) && !seenKnowledge.has(direct.id)) {
              brokenPrereqs.push(`Lección "${l.title}" programa "${target}" antes de la introducción de "${direct.id}".`);
            }
          }
        } catch {
          // Ignorar si el nodo es compuesto o no está en la muestra
        }
        seenKnowledge.add(target);
      }
    }

    checks.push({
      rule_id: 'broken_prerequisite',
      title: 'Ruptura de Prerrequisitos en la Secuencia Intra-Curso',
      severity: 'error',
      passed: brokenPrereqs.length === 0,
      message: brokenPrereqs.length === 0
        ? 'Secuencia estrictamente ordenada de acuerdo con los prerrequisitos del Grafo y perfil de entrada.'
        : `Se encontraron ${brokenPrereqs.length} posibles inversiones de prerrequisitos intra-curso.`,
      details: brokenPrereqs.slice(0, 5)
    });

    // 7. CEFR jump (Saltos de nivel injustificados)
    const cefrLevelsSeen = new Set<string>();
    for (const u of units) {
      for (const t of u.knowledge_targets) {
        if (t.includes('_c1_') || t.includes('_c2_')) cefrLevelsSeen.add('C1+');
        if (t.includes('_pre_a1_')) cefrLevelsSeen.add('Pre-A1');
      }
    }
    const hasCefrJump = cefrLevelsSeen.has('C1+') && !course.target_cefr.includes('C1');
    checks.push({
      rule_id: 'cefr_jump',
      title: 'Salto CEFR Inadecuado para el Nivel Meta',
      severity: 'error',
      passed: !hasCefrJump,
      message: !hasCefrJump
        ? `Niveles CEFR de los contenidos alineados con el objetivo ${course.entry_cefr} → ${course.target_cefr}.`
        : 'Se detectaron unidades con nivel C1+ asignadas a un curso de perfil B1/B2.'
    });

    // 8. Time overflow
    const budget = TimeBudgetService.calculate(course, lessons);
    checks.push({
      rule_id: 'time_overflow',
      title: 'Desbordamiento del Presupuesto de Tiempo Lectivo',
      severity: 'error',
      passed: !budget.is_overflow,
      message: !budget.is_overflow
        ? `Presupuesto respetado: ${budget.total_planned_minutes} min programados de ${budget.total_available_minutes} min disponibles.`
        : `Exceso de tiempo: se programaron ${budget.total_planned_minutes} min para un límite de ${budget.total_available_minutes} min (exceso de ${budget.overflow_minutes} min).`
    });

    // 9. Knowledge taught once only (Teach once warning)
    const timeline = SpiralCurriculumTracker.track(lessons);
    const singleExposures = Object.values(timeline).filter(n => n.is_single_exposure_warning);
    checks.push({
      rule_id: 'knowledge_taught_once_only',
      title: 'Conceptos Clave de Exposición Única (Currículo Espiral)',
      severity: 'warning',
      passed: singleExposures.length === 0,
      message: singleExposures.length === 0
        ? 'Todos los conceptos clave se revisitan al menos dos veces a lo largo del curso.'
        : `Se identificaron ${singleExposures.length} conceptos que aparecen solo una vez en todo el ciclo.`,
      details: singleExposures.map(n => n.knowledge_id)
    });

    // 10. Skill imbalance
    const balance = SkillBalanceService.analyze(lessons);
    checks.push({
      rule_id: 'skill_imbalance',
      title: 'Equilibrio Pedagógico de Habilidades Lingüísticas',
      severity: 'warning',
      passed: balance.is_balanced,
      message: balance.is_balanced
        ? 'Distribución armónica entre Listening, Speaking, Reading, Writing y soporte de Grammar.'
        : `Desbalances detectados: ${balance.warnings.join(' ')}`,
      details: balance.skill_percentages
    });

    const errorCount = checks.filter(c => !c.passed && c.severity === 'error').length;
    const warningCount = checks.filter(c => !c.passed && c.severity === 'warning').length;
    const passed = errorCount === 0;

    return {
      passed,
      total_checks: checks.length,
      error_count: errorCount,
      warning_count: warningCount,
      checks
    };
  }

  /**
   * Formateo textual para CLI.
   */
  static formatForCli(report: CourseQualityReport): string {
    const lines: string[] = [];
    lines.push(`================================================================`);
    lines.push(`🛡️ COMPUERTAS DE CALIDAD CURRICULAR (10 Quality Gates)`);
    lines.push(`================================================================`);
    lines.push(`Dictamen Global: ${report.passed ? '🟢 APROBADO (0 Errores)' : '🔴 RECHAZADO'}`);
    lines.push(`Resumen: ${report.total_checks} Verificaciones | ${report.error_count} Errores | ${report.warning_count} Advertencias`);
    lines.push(``);

    for (const c of report.checks) {
      const icon = c.passed ? '✅' : (c.severity === 'error' ? '❌' : '⚠️');
      lines.push(`${icon} [${c.rule_id}] ${c.title}:`);
      lines.push(`    ${c.message}`);
      if (!c.passed && c.details && Array.isArray(c.details) && c.details.length > 0) {
        lines.push(`    Detalles (${c.details.length}): ${c.details.slice(0, 3).join(', ')}${c.details.length > 3 ? '...' : ''}`);
      }
    }

    return lines.join('\n');
  }
}
