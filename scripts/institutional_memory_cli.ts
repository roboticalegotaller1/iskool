#!/usr/bin/env tsx
/**
 * @file institutional_memory_cli.ts
 * @description CLI Shim para la Memoria Institucional de iSkool (Institutional Brain).
 * Permite consultar, listar, inspeccionar y sintetizar la memoria pedagógica acumulativa entre ciclos escolares.
 */

import { InstitutionalMemoryService } from '../src/lib/institutionalMemory/memoryService';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || 'help';

  switch (command) {
    case 'list':
    case 'memory:list':
      runList();
      break;

    case 'inspect':
    case 'memory:inspect':
      runInspect(args[1]);
      break;

    case 'synthesis':
    case 'memory:synthesis':
      runSynthesis(args[1], args[2], args[3]);
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

function runList() {
  console.log(`\n================================================================`);
  console.log(`🧠 MEMORIA INSTITUCIONAL iSkool (Bóveda Curricular)`);
  console.log(`   Principio: "El docente trabaja; iSkool recuerda; la institución aprende."`);
  console.log(`================================================================\n`);

  const memories = InstitutionalMemoryService.loadAllMemories();
  console.log(`📚 Total de Memorias Registradas: ${memories.length}\n`);

  if (memories.length === 0) {
    console.log(`ℹ️ No se han registrado memorias institucionales aún en planeaciones/Memorias_Institucionales/`);
    return;
  }

  console.log(`┌─────────────┬───────┬──────────────┬───────────────────────────────┬────────────────────┬──────────┬───────────┐`);
  console.log(`│ Ciclo       │ Grado │ Asignatura   │ Tema Pedagógico               │ Docente Titular    │ Dominio  │ Muestra   │`);
  console.log(`├─────────────┼───────┼──────────────┼───────────────────────────────┼────────────────────┼──────────┼───────────┤`);

  for (const m of memories) {
    const fm = m.frontmatter;
    const cycle = fm.academic_cycle.padEnd(11).slice(0, 11);
    const grade = String(fm.grade).padEnd(5).slice(0, 5);
    const subject = fm.subject.padEnd(12).slice(0, 12);
    const topic = fm.topic.padEnd(29).slice(0, 29);
    const teacher = fm.author_display_name.padEnd(18).slice(0, 18);
    const mastery = `${((fm.metrics?.mastery_rate || 0) * 100).toFixed(0)}%`.padStart(8);
    const sample = `${fm.metrics?.students_evaluated_count || 0} alum.`.padStart(9);

    console.log(`│ ${cycle} │ ${grade} │ ${subject} │ ${topic} │ ${teacher} │ ${mastery} │ ${sample} │`);
  }
  console.log(`└─────────────┴───────┴──────────────┴───────────────────────────────┴────────────────────┴──────────┴───────────┘\n`);
}

function runInspect(targetId?: string) {
  if (!targetId) {
    console.error(`❌ Error: Debes especificar el nombre de archivo o identificador de memoria a inspeccionar.`);
    console.log(`Ejemplo: bin/rails memory:inspect Memoria_2024-2025_G4_matematicas_fracciones_equivalentes_4B.md`);
    return;
  }

  const memories = InstitutionalMemoryService.loadAllMemories();
  const cleanTarget = targetId.toLowerCase().replace(/\.md$/, '');
  const match = memories.find(m => m.id.includes(cleanTarget) || path.basename(m.filePath).toLowerCase().includes(cleanTarget));

  if (!match) {
    console.error(`❌ Memoria institucional no encontrada para: "${targetId}".`);
    return;
  }

  const fm = match.frontmatter;
  console.log(`\n================================================================`);
  console.log(`🔍 DETALLE DE MEMORIA INSTITUCIONAL: ${match.id}`);
  console.log(`================================================================\n`);

  console.log(`📍 METADATOS Y PROCEDENCIA:`);
  console.log(`   - Institución:          ${fm.institution_id} (${fm.campus || 'Campus Central'})`);
  console.log(`   - Ciclo Escolar:        ${fm.academic_cycle}`);
  console.log(`   - Grado y Asignatura:   Grado ${fm.grade} • ${fm.subject}`);
  console.log(`   - Tema:                 ${fm.topic}`);
  console.log(`   - Cohorte/Grupo:        ${fm.group_cohort}`);
  console.log(`   - Docente Titular:      ${fm.author_display_name} (Ref: ${fm.created_by_teacher_ref})`);
  console.log(`   - Actividad Origen:     ${fm.activity_source || 'N/A'}`);
  console.log(`   - Adaptación de:        ${fm.adaptation_of || 'Diseño original'}`);
  console.log(`   - Rails Activity ID:    ${fm.provenance?.rails_activity_id}`);
  console.log(`   - Batch ID Evaluación:  ${fm.provenance?.rails_assessment_batch_id || 'N/A'}`);
  console.log(`   - Fecha Captura:        ${fm.provenance?.captured_at}`);

  console.log(`\n📊 TELEMETRÍA AGREGADA (CERO PII):`);
  console.log(`   - Estudiantes Evaluados: ${fm.metrics?.students_evaluated_count}`);
  console.log(`   - Tasa de Dominio:       ${((fm.metrics?.mastery_rate || 0) * 100).toFixed(1)}%`);
  console.log(`   - Puntos de Fricción:    ${fm.metrics?.comprehension_friction_points?.join(', ') || 'Ninguno'}`);

  console.log(`\n⚠️ FRICCIONES REPORTADAS:`);
  for (const f of match.sections.friccionesErrores) {
    console.log(`   - ${f}`);
  }

  console.log(`\n💡 ADAPTACIONES EXITOSAS:`);
  for (const a of match.sections.adaptacionesExitosas) {
    console.log(`   - ${a}`);
  }

  console.log(`\n🔮 RECOMENDACIONES PARA EL PRÓXIMO CICLO:`);
  for (const r of match.sections.recomendacionesProximoCiclo) {
    console.log(`   - ${r}`);
  }

  console.log(`\n🔗 ENLACES WIKILINKS [[...]] DETECTADOS:`);
  for (const wl of match.wikiLinks) {
    console.log(`   - [[${wl}]]`);
  }
  console.log(``);
}

function runSynthesis(gradeArg?: string, subjectArg?: string, topicArg?: string) {
  const grade = gradeArg || '4';
  const subject = subjectArg || 'matematicas';
  const topic = topicArg || '';

  console.log(`\n================================================================`);
  console.log(`🔮 SÍNTESIS DE MEMORIA INSTITUCIONAL ACUMULATIVA`);
  console.log(`   Grado: ${grade} | Asignatura: ${subject} | Tema: ${topic || 'Todos'}`);
  console.log(`================================================================\n`);

  const matches = InstitutionalMemoryService.queryMemories({
    grade,
    subject,
    topic: topic || undefined
  });

  if (matches.length === 0) {
    console.log(`ℹ️ No se encontraron memorias para estos criterios de búsqueda.`);
    return;
  }

  const synthesis = InstitutionalMemoryService.synthesizePriorCycleLearnings(matches, topic || 'General');

  console.log(`📈 DIAGNÓSTICO INSTITUCIONAL HISTÓRICO:`);
  console.log(`   - Memorias acumuladas:    ${synthesis.totalMemoriesFound}`);
  console.log(`   - Ciclos analizados:      ${synthesis.cyclesCovered.join(' ➔ ')}`);
  console.log(`   - Muestra histórica:      ${synthesis.totalStudentsEvaluated} alumnos evaluados (Datos Cero PII)`);
  console.log(`   - Dominio promedio:       ${(synthesis.averageMasteryRate * 100).toFixed(1)}%`);

  console.log(`\n⚠️ FRICCIONES CONCEPTUALES RECURRENTES (Avisos de Prevención al Nuevo Docente):`);
  for (const f of synthesis.recurrentFrictionPoints) {
    console.log(`   - [${f.occurrences} ciclo(s) en ${f.cycles.join(', ')}]: ${f.friction}`);
  }

  console.log(`\n💡 INTERVENCIONES PROBADAS EN LA INSTITUCIÓN:`);
  for (const inv of synthesis.provenInterventions) {
    console.log(`   - "${inv.intervention}" (Reportado por: ${inv.reportedBy.join(', ')})`);
  }

  console.log(`\n🔮 RECOMENDACIONES VITALES PARA EL DOCENTE DEL NUEVO CICLO:`);
  for (const rec of synthesis.recommendationsForNextTeacher) {
    console.log(`   ✨ ${rec}`);
  }

  console.log(`\n🔗 CITAS Y TRAZABILIDAD INSTITUCIONAL:`);
  for (const c of synthesis.citedMemories) {
    console.log(`   - Ciclo ${c.cycle} (Grupo ${c.cohort}) • ${c.teacher} ➔ ${c.wikiLink}`);
  }
  console.log(``);
}

function printHelp() {
  console.log(`\n[iSkool Institutional Memory CLI]`);
  console.log(`Comandos disponibles:`);
  console.log(`  bin/rails memory:list                            # Listar todas las memorias institucionales en la Bóveda`);
  console.log(`  bin/rails memory:inspect <archivo_o_id>          # Inspección forense de una memoria específica`);
  console.log(`  bin/rails memory:synthesis <grado> <asignatura>  # Síntesis pedagógica acumulativa entre ciclos`);
  console.log(``);
}

main().catch(err => {
  console.error("Error en CLI de Memoria Institucional:", err);
  process.exit(1);
});
