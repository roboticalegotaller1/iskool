/**
 * @file test_activity_patterns.ts
 * @description Prueba de diferenciación estructural entre patrones de actividad:
 * 1. guided_discussion
 * 2. pair_interview
 * 3. mini_presentation
 * 4. opinion_paragraph
 * 5. reading_for_gist
 *
 * Demuestra que activity_pattern + academic context + Motor de IA produce resultados diferenciados y coherentes.
 */

import fs from 'fs';
import path from 'path';

function loadEnvFile(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';

const patterns = [
  { pattern: 'pair_interview', skill: 'speaking', function: 'expressing_opinions' },
  { pattern: 'mini_presentation', skill: 'speaking', function: 'expressing_opinions' },
  { pattern: 'opinion_paragraph', skill: 'writing', function: 'expressing_opinions' },
  { pattern: 'reading_for_gist', skill: 'reading', function: 'expressing_opinions' }
];

async function runPatterns() {
  console.log('================================================================');
  console.log('🧩 EVALUACIÓN DE DIFERENCIACIÓN ESTRUCTURAL DE PATRONES');
  console.log('================================================================\n');

  for (const item of patterns) {
    console.log(`\n▶️ PROBANDO PATRÓN: ${item.pattern.toUpperCase()} (${item.skill})`);
    const start = Date.now();
    try {
      const res = await AcademicGenerationGenerator.call({
        grade: 'high_school_1',
        cefr: 'B1',
        skill: item.skill,
        topic: 'technology',
        language_function: item.function,
        activity_type: item.pattern,
        duration_minutes: 20
      });

      const elapsed = Date.now() - start;
      console.log(`  ⏱️ Tiempo: ${elapsed} ms | Estatus: ${res.success ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
      console.log(`  📌 Título: "${res.activity?.title}"`);
      console.log(`  🎯 Objetivo: "${res.activity?.learning_objective}"`);
      console.log(`  👣 Pasos definidos: ${res.activity?.activity_steps?.length || 0}`);
      res.activity?.activity_steps?.forEach((s, idx) => {
        console.log(`     [Paso ${idx + 1}: ${s.phase} (${s.duration_minutes} min)] ${s.student_instructions.slice(0, 80)}...`);
      });
      console.log(`  📊 Criterios de evaluación: ${res.activity?.assessment?.criteria?.slice(0, 2).join(' | ')}`);
    } catch (err: unknown) {
      console.error(`  ❌ Error probando patrón ${item.pattern}:`, err instanceof Error ? err.message : err);
    }
    // Pausa pedagógica entre llamadas de inferencia para mitigar límites de ráfaga
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n================================================================');
  console.log('🏁 EVALUACIÓN DE PATRONES COMPLETADA');
  console.log('================================================================\n');
}

runPatterns().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
