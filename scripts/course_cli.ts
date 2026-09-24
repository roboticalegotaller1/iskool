/**
 * @file course_cli.ts
 * @description CLI Shim para Course Planning de iSchool (bin/rails course:*).
 * Permite ejecutar generación de cursos, diagnósticos de cobertura, alineación, cronograma y exportación.
 */

import { CourseGenerator } from '../src/lib/coursePlanning/courseGenerator';
import { CourseStore } from '../src/lib/coursePlanning/courseStore';
import { KnowledgeTimelineService } from '../src/lib/coursePlanning/knowledgeTimelineService';
import { CurriculumAlignmentService } from '../src/lib/coursePlanning/curriculumAlignmentService';
import { CourseCoverageService } from '../src/lib/coursePlanning/courseCoverageService';
import { SkillBalanceService } from '../src/lib/coursePlanning/skillBalanceService';
import { TimeBudgetService } from '../src/lib/coursePlanning/timeBudgetService';
import { CourseQualityChecker } from '../src/lib/coursePlanning/courseQualityChecker';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const targetId = args[1] || '';

  // Asegurar que exista un curso en memoria si no se especifica ID
  let currentResult = CourseGenerator.call({
    subject: 'english',
    grade: 'high_school_1',
    entry_cefr: 'B1',
    target_cefr: 'B2',
    total_weeks: 40,
    sessions_per_week: 4,
    minutes_per_session: 50
  });

  const course = CourseStore.getCourse(targetId) || currentResult.course;
  const units = CourseStore.getUnits(course.id);
  const lessons = CourseStore.getLessons(course.id);
  const slots = CourseStore.getSlots(course.id);
  const assessments = CourseStore.getAssessments(course.id);

  switch (command) {
    case 'generate': {
      console.log(`\n================================================================`);
      console.log(`🎓 CURSO GENERADO: ${course.title}`);
      console.log(`================================================================`);
      console.log(`ID del Curso: ${course.id}`);
      console.log(`Grado: ${course.grade} | CEFR: ${course.entry_cefr} → ${course.target_cefr}`);
      console.log(`Estructura: ${units.length} Unidades | ${lessons.length} Lecciones | ${slots.length} Slots | ${assessments.length} Blueprints`);
      console.log(`Estado: [${course.status.toUpperCase()}] — Versión ${course.version}`);
      console.log(`\nUnidades Creadas:`);
      for (const u of units) {
        console.log(`  • Unit ${u.position}: ${u.title} (${u.duration_weeks} semanas) [${u.theme}]`);
      }
      break;
    }

    case 'timeline': {
      const report = KnowledgeTimelineService.generateReport(course.id, lessons);
      console.log(KnowledgeTimelineService.formatForCli(report));
      break;
    }

    case 'alignment': {
      const report = CurriculumAlignmentService.analyze(course.id, units, lessons, assessments);
      console.log(CurriculumAlignmentService.formatForCli(report));
      break;
    }

    case 'coverage': {
      const report = CourseCoverageService.analyze(course.id, course.grade, units, lessons);
      console.log(CourseCoverageService.formatForCli(report));
      break;
    }

    case 'balance': {
      const report = SkillBalanceService.analyze(lessons, slots);
      console.log(SkillBalanceService.formatForCli(report));
      break;
    }

    case 'inspect': {
      console.log(`\n================================================================`);
      console.log(`🔍 INSPECCIÓN ESTRUCTURAL DEL CURSO: ${course.title}`);
      console.log(`================================================================`);
      console.log(`ID: ${course.id}`);
      console.log(`Duración: ${course.total_weeks} semanas (${course.sessions_per_week} sesiones/sem @ ${course.minutes_per_session} min)`);
      
      const budget = TimeBudgetService.calculate(course, lessons);
      console.log(`Tiempo Lectivo: ${budget.total_planned_minutes} min (Buffer: ${budget.planned_buffer_minutes} min)`);

      const quality = CourseQualityChecker.verify(course, units, lessons, assessments);
      console.log(`Calidad: ${quality.passed ? '🟢 CONFORME' : '🔴 OBSERVACIONES'} (${quality.error_count} errores, ${quality.warning_count} advertencias)`);

      console.log(`\nMuestra de Lección y Ranuras (Semana 12, Sesión 2):`);
      const sampleLesson = lessons.find(l => l.week_number === 12 && l.session_number === 2) || lessons[0];
      if (sampleLesson) {
        console.log(`  • Título: ${sampleLesson.title}`);
        console.log(`    Objetivo: ${sampleLesson.primary_learning_outcome}`);
        console.log(`    Modelo: ${sampleLesson.pedagogical_model} | Tipo: ${sampleLesson.lesson_type}`);
        console.log(`    Targets: ${sampleLesson.knowledge_targets.join(', ')}`);
        
        const sampleSlots = slots.filter(s => s.lesson_id === sampleLesson.id);
        console.log(`    Slots Didácticos (${sampleSlots.length}):`);
        for (const s of sampleSlots) {
          console.log(`      [Slot ${s.position}] ${s.purpose.toUpperCase()} (${s.duration_minutes} min) — ${s.instructions_brief}`);
        }
      }
      break;
    }

    case 'export': {
      console.log(`\n================================================================`);
      console.log(`🗺️ MAPA CURRICULAR (COURSE MAP) — MARKDOWN & MERMAID`);
      console.log(`================================================================`);
      console.log(`\n\`\`\`mermaid`);
      console.log(`gantt`);
      console.log(`    title Course Map: ${course.title}`);
      console.log(`    dateFormat  X`);
      console.log(`    axisFormat Week %s`);
      for (const u of units) {
        const startW = (u.position - 1) * u.duration_weeks + 1;
        const endW = u.position * u.duration_weeks;
        console.log(`    section Unit ${u.position}`);
        console.log(`    ${u.title} :${startW}, ${endW}`);
      }
      console.log(`\`\`\`\n`);
      break;
    }

    default: {
      console.log(`\n[iSchool CLI Shim] Comandos disponibles para course:`);
      console.log(`  bin/rails course:generate              # Generar esqueleto de curso piloto`);
      console.log(`  bin/rails course:timeline [ID]         # Reporte de línea de tiempo espiral`);
      console.log(`  bin/rails course:alignment [ID]        # Reporte de alineación enseñado vs evaluado`);
      console.log(`  bin/rails course:coverage [ID]         # Reporte de cobertura Grade Map vs Plan`);
      console.log(`  bin/rails course:balance [ID]          # Reporte de balance de habilidades`);
      console.log(`  bin/rails course:inspect [ID]          # Inspección jerárquica de lecciones y slots`);
      console.log(`  bin/rails course:export [ID]           # Exportar mapa curricular en Markdown/Mermaid`);
      break;
    }
  }
}

main().catch(err => {
  console.error('[course_cli ERROR]:', err);
  process.exit(1);
});
