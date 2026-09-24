/**
 * @file academic_generation_cli.ts
 * @description Interfaz de línea de comandos e inspección para el Motor de Generación Académica de iSchool.
 * Permite ejecutar generaciones pedagógicas, inspeccionar linaje curricular y visualizar los 7 artefactos
 * de trazabilidad (Request, Knowledge, Context, Prompt, Raw response, Parsed result, Validation).
 *
 * Uso:
 *   npx tsx scripts/academic_generation_cli.ts
 *   npx tsx scripts/academic_generation_cli.ts inspect <generation_id>
 *   npx tsx scripts/academic_generation_cli.ts list
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
import { AcademicGenerationTraceabilityStore } from '../src/lib/academicGeneration/traceabilityStore';
import { AcademicGenerationRequest } from '../src/lib/academicGeneration/request';
import { AcademicGenerationContextService } from '../src/lib/academicGeneration/contextService';
import { AcademicGenerationPromptBuilder } from '../src/lib/academicGeneration/promptBuilder';
import { ActivityGenerator } from '../src/lib/academicGeneration/activityGenerator';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'default-run';

  if (command === 'list') {
    const list = await AcademicGenerationTraceabilityStore.listAll();
    console.log(`\n📋 TOTAL DE GENERACIONES REGISTRADAS: ${list.length}\n`);
    for (const item of list) {
      console.log(
        `• [${item.generation_id}] ${item.created_at} | Grade: ${item.request.grade} | CEFR: ${item.request.cefr} | Skill: ${item.request.skill} | Status: ${item.validation.valid ? '✅ PASSED' : '❌ FAILED'}`
      );
    }
    return;
  }

  if (command === 'inspect') {
    const genId = args[1];
    if (!genId) {
      console.error('Error: Debe especificar el ID de generación a inspeccionar.');
      process.exit(1);
    }
    const record = await AcademicGenerationTraceabilityStore.getById(genId);
    if (!record) {
      console.error(`Error: Registro no encontrado con ID "${genId}".`);
      process.exit(1);
    }
    console.log('\n================================================================');
    console.log(`🔍 INSPECCIÓN DE GENERACIÓN: ${record.generation_id}`);
    console.log('================================================================\n');
    console.log(JSON.stringify(record, null, 2));
    return;
  }

  // Ejecución por defecto: Caso canónico de Fase 3
  console.log('================================================================');
  console.log('🚀 iSchool Academic Generation Engine — Invocación Canónica (Fase 3)');
  console.log('================================================================\n');

  const requestParams = {
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: 'technology',
    language_function: 'expressing_opinions',
    activity_type: 'guided_discussion',
    duration_minutes: 20
  };

  console.log('--- A. REQUEST (Solicitud Académica Rails) ---');
  console.log(JSON.stringify(requestParams, null, 2));
  console.log('');

  // 1. Validar request
  const request = new AcademicGenerationRequest(requestParams);

  // 2. Recuperar conocimiento del Knowledge Vault
  console.log('--- B. RETRIEVED KNOWLEDGE (Documentos de la Bóveda Curricular) ---');
  const retrieved = await AcademicGenerationContextService.call(request);
  console.log(`Total documentos consultados: ${retrieved.knowledge_document_ids.length}`);
  retrieved.knowledge_versions.forEach(v => {
    console.log(`  • ID: ${v.document_id} (v${v.version}) [${v.document_type || 'node'}] - ${v.title || ''}`);
  });
  console.log('');

  // 3. Contexto estructurado
  console.log('--- C. CONTEXT (Contexto Curricular Entregado a la IA) ---');
  console.log(`Grado objetivo: ${retrieved.context.grade}`);
  console.log(`Nivel CEFR: ${retrieved.context.cefrTarget}`);
  console.log(`Habilidad: ${retrieved.context.skill}`);
  console.log(`Objetivos Can-Do extraídos: ${retrieved.context.learningObjectives.length}`);
  console.log(`Funciones de Lenguaje: ${retrieved.context.languageFunctions.map(f => f.title).join(', ')}`);
  console.log(`Gramática clave: ${retrieved.context.grammar.keyStructures.join('; ')}`);
  console.log(`Colocaciones de vocabulario: ${retrieved.context.vocabularyDomain.collocations.join(', ')}`);
  console.log(`Criterios de evaluación: ${retrieved.context.assessmentCriteria.map(a => a.title).join(', ')}`);
  console.log('');

  // 4. Prompt construido
  console.log('--- D. PROMPT (Prompt Final Sanitizado, Sin Secretos) ---');
  const prompt = AcademicGenerationPromptBuilder.build(request, retrieved);
  console.log(prompt.slice(0, 800) + '\n... [TRUNCADO PARA REPORTE - LONGITUD TOTAL: ' + prompt.length + ' CARACTERES] ...\n');

  // 5. Inferencia con Motor de IA
  console.log('--- E. RAW AI RESPONSE (Respuesta Cruda del Motor de IA Pedagógica) ---');
  const generator = new ActivityGenerator();
  const startTime = Date.now();
  const result = await generator.generate(request);
  const elapsedMs = Date.now() - startTime;
  console.log(`Tiempo de respuesta: ${elapsedMs} ms`);
  console.log(result.raw);
  console.log('');

  // 6. Parsed Result
  console.log('--- F. PARSED RESULT (Estructura Educativa Tipada) ---');
  console.log(JSON.stringify(result.output, null, 2));
  console.log('');

  // 7. Validation
  console.log('--- G. VALIDATION (Auditoría Anti-Alucinaciones y Esquema) ---');
  console.log(`Estatus: ${result.validation.valid ? '✅ APROBADO (VALID)' : '❌ RECHAZADO (INVALID)'}`);
  if (result.validation.errors.length > 0) {
    console.log('Errores encontrados:');
    result.validation.errors.forEach(e => console.log(`  ❌ ${e}`));
  } else {
    console.log('Cero errores de validación. Nivel CEFR, grado, habilidad y duración coinciden 100% con la solicitud.');
  }
  if (result.validation.warnings.length > 0) {
    console.log('Advertencias pedagógicas:');
    result.validation.warnings.forEach(w => console.log(`  ⚠️ ${w}`));
  }
  console.log(`\nID de Trazabilidad Generado: ${result.traceability.generation_id}`);
  console.log('Persistido en: .generations/' + result.traceability.generation_id + '.json');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR EN GENERACIÓN ACADÉMICA:', err);
  process.exit(1);
});
