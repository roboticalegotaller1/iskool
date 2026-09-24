/**
 * @file curriculumAlignmentService.ts
 * @description Servicio de auditoría de Alineación Curricular (Curriculum Alignment).
 * Responde a las dos preguntas forenses fundamentales:
 * 1. «¿Todo lo que enseñamos se evalúa?»
 * 2. «¿Todo lo que evaluamos fue enseñado?»
 * Detecta discrepancias de alineación (taught_not_assessed, assessed_not_taught, etc.).
 */

import { UnitEntity, LessonEntity, AssessmentEntity, CurriculumAlignmentReport } from './types';

export class CurriculumAlignmentService {
  /**
   * Ejecuta el análisis bidireccional de alineación curricular para un curso.
   */
  static analyze(
    courseId: string,
    units: UnitEntity[],
    lessons: LessonEntity[],
    assessments: AssessmentEntity[]
  ): CurriculumAlignmentReport {
    // 1. Recolectar todos los conocimientos enseñados en lecciones
    const taughtKnowledge = new Set<string>();
    const scheduledOutcomes = new Set<string>();

    for (const lesson of lessons) {
      for (const target of lesson.knowledge_targets || []) {
        taughtKnowledge.add(target);
      }
      if (lesson.primary_learning_outcome) {
        scheduledOutcomes.add(lesson.primary_learning_outcome.trim());
      }
      for (const sec of lesson.secondary_learning_outcomes || []) {
        scheduledOutcomes.add(sec.trim());
      }
    }

    // 2. Recolectar todos los conocimientos y outcomes evaluados en assessments
    const assessedKnowledge = new Set<string>();
    const assessmentWithoutTargets: string[] = [];

    for (const assessment of assessments) {
      const targets = assessment.knowledge_targets || [];
      if (targets.length === 0) {
        assessmentWithoutTargets.push(assessment.id);
      }
      for (const target of targets) {
        assessedKnowledge.add(target);
      }
    }

    // 3. Recolectar conocimientos declarados en las unidades
    const unitDeclaredKnowledge = new Set<string>();
    const unitDeclaredOutcomes = new Set<string>();

    for (const unit of units) {
      for (const target of unit.knowledge_targets || []) {
        unitDeclaredKnowledge.add(target);
      }
      for (const outcome of unit.learning_outcomes || []) {
        unitDeclaredOutcomes.add(outcome.trim());
      }
    }

    // 4. Calcular discrepancias
    // Taught not assessed: enseñado en clase pero nunca evaluado en los blueprints
    const taughtNotAssessed: string[] = [];
    for (const target of taughtKnowledge) {
      if (!assessedKnowledge.has(target)) {
        taughtNotAssessed.push(target);
      }
    }

    // Assessed not taught: evaluado en el examen pero omitido en las lecciones impartidas
    const assessedNotTaught: string[] = [];
    for (const target of assessedKnowledge) {
      if (!taughtKnowledge.has(target)) {
        assessedNotTaught.push(target);
      }
    }

    // Knowledge without lesson: declarado en la unidad pero jamás agendado en una lección
    const knowledgeWithoutLesson: string[] = [];
    for (const target of unitDeclaredKnowledge) {
      if (!taughtKnowledge.has(target)) {
        knowledgeWithoutLesson.push(target);
      }
    }

    // Outcome not scheduled: objetivos de la unidad que no se cubren en lecciones
    const outcomeNotScheduled: string[] = [];
    for (const outcome of unitDeclaredOutcomes) {
      let found = false;
      const cleanOutcome = outcome.replace(/[\.\s]+$/, '').toLowerCase();
      for (const sched of scheduledOutcomes) {
        const cleanSched = sched.replace(/[\.\s]+$/, '').toLowerCase();
        if (cleanSched.includes(cleanOutcome) || cleanOutcome.includes(cleanSched)) {
          found = true;
          break;
        }
      }
      if (!found) {
        outcomeNotScheduled.push(outcome);
      }
    }

    // Cálculo del Score de Alineación (0 a 100%)
    let penalty = 0;
    penalty += taughtNotAssessed.length * 5;
    penalty += assessedNotTaught.length * 15; // Penalización más severa por evaluar lo no enseñado
    penalty += knowledgeWithoutLesson.length * 10;
    penalty += outcomeNotScheduled.length * 10;

    const alignmentScore = Math.max(0, Math.min(100, 100 - penalty));
    const isFullyAligned = alignmentScore === 100 && assessedNotTaught.length === 0;

    return {
      course_id: courseId,
      taught_not_assessed: taughtNotAssessed,
      assessed_not_taught: assessedNotTaught,
      outcome_not_scheduled: outcomeNotScheduled,
      knowledge_without_lesson: knowledgeWithoutLesson,
      assessment_without_learning_target: assessmentWithoutTargets,
      alignment_score_percent: alignmentScore,
      is_fully_aligned: isFullyAligned
    };
  }

  /**
   * Formateo textual para reporte CLI.
   */
  static formatForCli(report: CurriculumAlignmentReport): string {
    const lines: string[] = [];
    lines.push(`================================================================`);
    lines.push(`🎯 AUDITORÍA DE ALINEACIÓN CURRICULAR [Curso: ${report.course_id}]`);
    lines.push(`================================================================`);
    lines.push(`Puntaje de Alineación: ${report.alignment_score_percent}%`);
    lines.push(`Estado: ${report.is_fully_aligned ? '🟢 PERFECTAMENTE ALINEADO' : '⚠️ DISCREPANCIAS DETECTADAS'}`);
    lines.push(``);

    if (report.assessed_not_taught.length > 0) {
      lines.push(`❌ EVALUADO PERO NO ENSEÑADO (assessed_not_taught):`);
      for (const item of report.assessed_not_taught) lines.push(`    • ${item}`);
    } else {
      lines.push(`✅ Cero evaluaciones de contenidos no enseñados.`);
    }

    if (report.taught_not_assessed.length > 0) {
      lines.push(`⚠️ ENSEÑADO PERO NO EVALUADO (taught_not_assessed):`);
      for (const item of report.taught_not_assessed) lines.push(`    • ${item}`);
    } else {
      lines.push(`✅ Todo contenido enseñado cuenta con ponderación evaluativa.`);
    }

    if (report.knowledge_without_lesson.length > 0) {
      lines.push(`⚠️ CONOCIMIENTOS DECLARADOS SIN LECCIÓN AGENDADA:`);
      for (const item of report.knowledge_without_lesson) lines.push(`    • ${item}`);
    }

    if (report.outcome_not_scheduled.length > 0) {
      lines.push(`⚠️ OBJETIVOS DE UNIDAD SIN SESIÓN ASIGNADA:`);
      for (const item of report.outcome_not_scheduled) lines.push(`    • ${item}`);
    }

    return lines.join('\n');
  }
}
