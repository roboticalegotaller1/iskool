/**
 * @file run_generation_tests_batch1.ts
 * @description Ejecución y trazabilidad de las 3 actividades de prueba del Batch 1:
 *   - Activity A: Primary 1 | Pre-A1 | Speaking | Greetings | 10 min
 *   - Activity B: Primary 3 | A1 | Reading | Daily routines | 15 min
 *   - Activity C: Primary 4 | A1 | Writing | Likes and dislikes | 20 min
 *
 * Muestra las 7 dimensiones completas de trazabilidad institucional.
 */

import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { AcademicGenerationParams } from '../src/lib/academicGeneration/types';

async function main() {
  console.log(`\n================================================================`);
  console.log(`🚀 PRUEBAS DE GENERACIÓN ACADÉMICA - BATCH 1 (Pre-A1 y A1)`);
  console.log(`================================================================\n`);

  const activities: { id: string; label: string; params: AcademicGenerationParams }[] = [
    {
      id: 'ACTIVITY_A',
      label: 'Actividad A: Primary 1 | Pre-A1 | Speaking | Greetings | 10 min',
      params: {
        grade: 'primary_1',
        cefr: 'Pre-A1',
        skill: 'speaking',
        topic: 'greetings_and_introductions',
        language_function: 'greetings_leave_taking',
        activity_type: 'pair_interview',
        duration_minutes: 10
      }
    },
    {
      id: 'ACTIVITY_B',
      label: 'Actividad B: Primary 3 | A1 | Reading | Daily routines | 15 min',
      params: {
        grade: 'primary_3',
        cefr: 'A1',
        skill: 'reading',
        topic: 'daily_routines',
        language_function: 'describing_daily_routines',
        activity_type: 'guided_discussion',
        duration_minutes: 15
      }
    },
    {
      id: 'ACTIVITY_C',
      label: 'Actividad C: Primary 4 | A1 | Writing | Likes and dislikes | 20 min',
      params: {
        grade: 'primary_4',
        cefr: 'A1',
        skill: 'writing',
        topic: 'likes_and_dislikes',
        language_function: 'expressing_likes_dislikes',
        activity_type: 'opinion_paragraph',
        duration_minutes: 20
      }
    }
  ];

  for (const act of activities) {
    console.log(`\n${'#'.repeat(70)}`);
    console.log(`📌 ${act.label}`);
    console.log(`${'#'.repeat(70)}\n`);

    try {
      const result = await AcademicGenerationGenerator.call(act.params);

      const trace = result.traceability;
      console.log(`--- [DIMENSIÓN 1: SOLICITUD ACADÉMICA VALIDADA] ---`);
      console.log(`  Grado: ${trace.request.grade}`);
      console.log(`  CEFR: ${trace.request.cefr}`);
      console.log(`  Habilidad: ${trace.request.skill}`);
      console.log(`  Tema: ${trace.request.topic}`);
      console.log(`  Función: ${trace.request.language_function}`);
      console.log(`  Tipo: ${trace.request.activity_type}`);
      console.log(`  Duración: ${trace.request.duration_minutes} min`);

      console.log(`\n--- [DIMENSIÓN 2: CONOCIMIENTO OFICIAL RECUPERADO (KNOWLEDGE VAULT)] ---`);
      console.log(`  Documentos consultados (${trace.knowledge_document_ids.length}):`);
      trace.knowledge_versions.forEach(kv => {
        console.log(`  • [${kv.document_id}] v${kv.version} - ${kv.title} (${kv.document_type})`);
      });

      console.log(`\n--- [DIMENSIÓN 3 & 4: CONTEXTO Y PROMPT PEDAGÓGICO CONSTRUIDO] ---`);
      const promptText = trace.prompt_sent || '';
      const promptLines = promptText.split('\n');
      console.log(`  Longitud total del Prompt: ${promptText.length} caracteres (${promptLines.length} líneas)`);
      console.log(`  Modelo de Motor IA: ${trace.model}`);
      console.log(`  Versión del Template: ${trace.prompt_version}`);
      console.log(`  Muestra inicial del Prompt:`);
      promptLines.slice(0, 8).forEach(l => console.log(`    ${l}`));

      console.log(`\n--- [DIMENSIÓN 5: RESPUESTA RAW DEL MOTOR DE IA] ---`);
      const rawText = trace.raw_output || '';
      console.log(`  Longitud raw recibida: ${rawText.length} caracteres`);
      console.log(`  Muestra raw: ${rawText.substring(0, 150).replace(/[\r\n]+/g, ' ')}...`);

      console.log(`\n--- [DIMENSIÓN 6: RESULTADO ESTRUCTURADO PARSEADO] ---`);
      if (result.activity) {
        console.log(`  Título: "${result.activity.title}"`);
        console.log(`  Objetivo Pedagógico: ${result.activity.learning_objective}`);
        console.log(`  Instrucciones para el estudiante: ${result.activity.student_instructions}`);
        console.log(`  Instrucciones para el profesor: ${result.activity.teacher_instructions}`);
        console.log(`  Fases de la actividad (${result.activity.activity_steps.length}):`);
        result.activity.activity_steps.forEach(s => {
          console.log(`    • [${s.phase.toUpperCase()} - ${s.duration_minutes}m] Docente: ${s.teacher_instructions}`);
        });
        console.log(`  Soporte lingüístico:`);
        console.log(`    - Frases útiles: ${result.activity.language_support.useful_phrases.join(' | ')}`);
        console.log(`    - Gramática: ${result.activity.language_support.grammar_support.join(' | ')}`);
        console.log(`    - Vocabulario: ${result.activity.language_support.vocabulary_support.join(' | ')}`);
        console.log(`  Criterios de Evaluación:`);
        result.activity.assessment.criteria.forEach(c => console.log(`    * ${c}`));
      }

      console.log(`\n--- [DIMENSIÓN 7: VALIDACIÓN INSTITUCIONAL Y ANTI-ALUCINACIONES] ---`);
      console.log(`  Válido según políticas institucionales: ${result.validation.valid ? '✅ SÍ' : '❌ NO'}`);
      if (result.validation.errors.length > 0) {
        console.log(`  Errores detectados:`);
        result.validation.errors.forEach(e => console.log(`    ❌ ${e}`));
      }
      if (result.validation.warnings.length > 0) {
        console.log(`  Advertencias pedagógicas:`);
        result.validation.warnings.forEach(w => console.log(`    ⚠️ ${w}`));
      }
      const hasBannedWords = result.validation.errors.some(e => e.toLowerCase().includes('prohibido') || e.toLowerCase().includes('banned'));
      console.log(`  Términos prohibidos encontrados: ${hasBannedWords ? '⚠️ Detectados' : '0 (Cumple Regla 1 al 100%)'}`);
    } catch (err: unknown) {
      console.error(`❌ Error al generar ${act.id}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n================================================================`);
  console.log(`🎉 PRUEBAS DE GENERACIÓN BATCH 1 FINALIZADAS`);
  console.log(`================================================================\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
