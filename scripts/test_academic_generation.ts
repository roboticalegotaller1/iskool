/**
 * @file test_academic_generation.ts
 * @description Suite de pruebas automatizadas para la capa de Generación Académica (Fase 3).
 * Cubre validaciones de taxonomía (rechazo de B7), recuperación curricular, construcción de prompt,
 * parsing estricto, detección de alucinaciones y simulación offline mediante mocks.
 *
 * Ejecución:
 *   npx tsx scripts/test_academic_generation.ts
 */

import { AcademicGenerationRequest } from '../src/lib/academicGeneration/request';
import { AcademicGenerationContextService } from '../src/lib/academicGeneration/contextService';
import { AcademicGenerationPromptBuilder } from '../src/lib/academicGeneration/promptBuilder';
import { AcademicGenerationResponseParser } from '../src/lib/academicGeneration/responseParser';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';
import { AcademicGenerationTraceabilityStore } from '../src/lib/academicGeneration/traceabilityStore';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { AcademicActivityOutput, AcademicGenerationParams } from '../src/lib/academicGeneration/types';

interface TestStats {
  passed: number;
  failed: number;
}

const stats: TestStats = { passed: 0, failed: 0 };

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    stats.passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    stats.failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 SUITE DE PRUEBAS: iSchool Academic Generation Layer (Fase 3)');
  console.log('================================================================\n');

  // --- TEST 1: Valid Request ---
  console.log('--- TEST 1: Solicitud Académica Válida ---');
  try {
    const validParams: AcademicGenerationParams = {
      grade: 'high_school_1',
      cefr: 'B1',
      skill: 'speaking',
      topic: 'technology',
      language_function: 'expressing_opinions',
      activity_type: 'guided_discussion',
      duration_minutes: 20
    };
    const req = new AcademicGenerationRequest(validParams);
    assert(req.grade === 'high_school_1', 'Conserva grado válido high_school_1');
    assert(req.cefr === 'B1', 'Conserva CEFR B1');
    assert(req.skill === 'speaking', 'Conserva skill speaking');
    assert(req.duration_minutes === 20, 'Conserva duración de 20 minutos');
    assert(req.language_function === 'expressing_opinions', 'Conserva función de lenguaje');
  } catch (err: unknown) {
    assert(false, `Excepción inesperada en solicitud válida: ${err}`);
  }

  // --- TEST 2: Invalid CEFR Level (B7) ---
  console.log('\n--- TEST 2: Rechazo Estricto de CEFR Inválido (B7) ---');
  let b7Caught = false;
  try {
    new AcademicGenerationRequest({
      grade: 'high_school_1',
      cefr: 'B7',
      skill: 'speaking',
      topic: 'technology',
      language_function: 'expressing_opinions',
      duration_minutes: 20
    });
  } catch (err: unknown) {
    b7Caught = true;
    const msg = err instanceof Error ? err.message : String(err);
    assert(msg.includes('B7'), 'El mensaje de error menciona explícitamente B7');
    assert(msg.includes('Nivel CEFR inválido'), 'Identifica fallo de taxonomía CEFR');
  }
  assert(b7Caught, 'Solicitud con cefr: "B7" es rechazada de forma inmediata');

  // --- TEST 3: Invalid Grade ---
  console.log('\n--- TEST 3: Rechazo de Grado Fuera de Taxonomía ---');
  let invalidGradeCaught = false;
  try {
    new AcademicGenerationRequest({
      grade: 'kindergarten_99',
      cefr: 'B1',
      skill: 'speaking',
      topic: 'technology',
      language_function: 'expressing_opinions',
      duration_minutes: 20
    });
  } catch (err: unknown) {
    invalidGradeCaught = true;
    const msg = err instanceof Error ? err.message : String(err);
    assert(msg.includes('kindergarten_99'), 'Menciona grado inválido');
  }
  assert(invalidGradeCaught, 'Grado inválido es rechazado');

  // --- TEST 4: Invalid Skill ---
  console.log('\n--- TEST 4: Rechazo de Habilidad Fuera de Taxonomía ---');
  let invalidSkillCaught = false;
  try {
    new AcademicGenerationRequest({
      grade: 'high_school_1',
      cefr: 'B1',
      skill: 'telepathy' as unknown as string,
      topic: 'technology',
      language_function: 'expressing_opinions',
      duration_minutes: 20
    });
  } catch (err: unknown) {
    invalidSkillCaught = true;
  }
  assert(invalidSkillCaught, 'Habilidad lingüística inexistente es rechazada');

  // --- TEST 5: Knowledge Vault Retrieval via ContextService ---
  console.log('\n--- TEST 5: Recuperación de Conocimiento desde el Vault ---');
  const standardReq = new AcademicGenerationRequest({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: 'technology',
    language_function: 'expressing_opinions',
    activity_type: 'guided_discussion',
    duration_minutes: 20
  });

  const retrieved = await AcademicGenerationContextService.call(standardReq);
  assert(retrieved.knowledge_document_ids.length > 0, `Recupera documentos del Vault (${retrieved.knowledge_document_ids.length} docs)`);
  assert(retrieved.knowledge_versions.length > 0, 'Genera catálogo de versiones de conocimiento');
  assert(retrieved.knowledge_versions.every(v => typeof v.version === 'number'), 'Todos los documentos consultados tienen número de versión');
  assert(retrieved.context.learningObjectives.length > 0, 'Extrae objetivos Can-Do');
  assert(retrieved.context.languageFunctions.length > 0, 'Extrae funciones de lenguaje pertinentes');
  assert(retrieved.context.vocabularyDomain.collocations.length > 0, 'Extrae colocaciones temáticas');

  // --- TEST 6: Prompt Construction & Rules Isolation ---
  console.log('\n--- TEST 6: Construcción y Partición Estricta del Prompt ---');
  const prompt = AcademicGenerationPromptBuilder.build(standardReq, retrieved);
  assert(prompt.includes('### SECTION 1: SYSTEM RULES ###'), 'Contiene Sección 1: SYSTEM RULES');
  assert(prompt.includes('### SECTION 2: ACADEMIC CONTEXT (AUTHORITATIVE KNOWLEDGE VAULT) ###'), 'Contiene Sección 2: ACADEMIC CONTEXT');
  assert(prompt.includes('### SECTION 3: GENERATION REQUEST ###'), 'Contiene Sección 3: GENERATION REQUEST');
  assert(prompt.includes('### SECTION 4: OUTPUT SCHEMA ###'), 'Contiene Sección 4: OUTPUT SCHEMA');
  assert(prompt.includes('The supplied Knowledge Vault context is authoritative'), 'Subordina el modelo a la autoridad curricular');
  assert(!prompt.includes('Gemini') && !prompt.includes('Google AI'), 'Cumple Marca Blanca Institucional en el prompt');

  // --- TEST 7: Response Parser (Markdown Stripping and JSON parsing) ---
  console.log('\n--- TEST 7: Parseo Sanitizado de Respuestas JSON ---');
  const rawWithTicks = '```json\n{\n  "title": "Discussion on Tech",\n  "grade": "high_school_1",\n  "cefr": "B1",\n  "skill": "speaking",\n  "topic": "technology",\n  "language_function": "expressing_opinions",\n  "activity_type": "guided_discussion",\n  "duration_minutes": 20,\n  "learning_objective": "Express opinions about smartphones",\n  "student_instructions": "Discuss in pairs.",\n  "teacher_instructions": "Monitor.",\n  "language_support": {\n    "useful_phrases": ["In my opinion..."],\n    "grammar_support": ["Present simple"],\n    "vocabulary_support": ["devices"]\n  },\n  "activity_steps": [\n    {\n      "phase": "warm_up",\n      "duration_minutes": 5,\n      "teacher_instructions": "Ask questions",\n      "student_instructions": "Answer"\n    }\n  ],\n  "assessment": {\n    "criteria": ["Fluency"]\n  }\n}\n```';

  const parsed = AcademicGenerationResponseParser.parse(rawWithTicks);
  assert(parsed.title === 'Discussion on Tech', 'Elimina delimitadores markdown ```json');
  assert(parsed.duration_minutes === 20, 'Parsea enteros numéricos correctamente');
  assert(parsed.language_support.useful_phrases.length === 1, 'Parsea objetos y arrays anidados');

  // --- TEST 8: Response Parser Error on Malformed JSON ---
  console.log('\n--- TEST 8: Manejo Seguro de JSON Malformado o Incompleto ---');
  let parseErrorCaught = false;
  try {
    AcademicGenerationResponseParser.parse('This is not json at all { unclosed bracket');
  } catch (err: unknown) {
    parseErrorCaught = true;
    const msg = err instanceof Error ? err.message : String(err);
    assert(msg.includes('Error al parsear JSON'), 'Reporta mensaje explicativo de sintaxis inválida');
  }
  assert(parseErrorCaught, 'Lanza error controlado si el modelo no devuelve JSON');

  // --- TEST 9: Validator Anti-Alucinación: CEFR Mismatch (B1 -> B2) ---
  console.log('\n--- TEST 9: Detección Anti-Alucinación: Discrepancia de Nivel CEFR ---');
  const mutatedCefrOutput: AcademicActivityOutput = {
    ...parsed,
    cefr: 'B2' // Solicitado B1, modelo alucinó B2
  };
  const valCefr = AcademicGenerationValidator.validate(standardReq, mutatedCefrOutput);
  assert(!valCefr.valid, 'Validador invalida la respuesta con CEFR discrepante');
  assert(valCefr.errors.some(e => e.includes('Alucinación de Nivel CEFR')), 'Reporta error específico de alucinación CEFR');
  assert(valCefr.mismatches.some(m => m.field === 'cefr' && m.expected === 'B1' && m.received === 'B2'), 'Registra mismatch en auditoría');

  // --- TEST 10: Validator Anti-Alucinación: Grade Mismatch ---
  console.log('\n--- TEST 10: Detección Anti-Alucinación: Discrepancia de Grado Escolar ---');
  const mutatedGradeOutput: AcademicActivityOutput = {
    ...parsed,
    grade: 'high_school_3' // Solicitado high_school_1
  };
  const valGrade = AcademicGenerationValidator.validate(standardReq, mutatedGradeOutput);
  assert(!valGrade.valid, 'Validador invalida la respuesta con Grado discrepante');
  assert(valGrade.errors.some(e => e.includes('Alucinación de Grado Escolar')), 'Reporta error específico de alucinación de Grado');

  // --- TEST 11: Validator Missing Required Fields ---
  console.log('\n--- TEST 11: Detección de Campos Requeridos Faltantes ---');
  const incompleteOutput = {
    title: 'Only title',
    grade: 'high_school_1',
    cefr: 'B1'
  } as unknown as AcademicActivityOutput;
  const valIncomplete = AcademicGenerationValidator.validate(standardReq, incompleteOutput);
  assert(!valIncomplete.valid, 'Invalida objeto con campos obligatorios omitidos');
  assert(valIncomplete.errors.length >= 5, `Detecta múltiples campos faltantes (${valIncomplete.errors.length} reportados)`);

  // --- TEST 12: Successful Generation via Mock Provider (Offline) ---
  console.log('\n--- TEST 12: Flujo Completo con Inferencia Simulada (Offline Mock) ---');
  const mockActivityOutput: AcademicActivityOutput = {
    title: 'Teen Tech Opinions Debate',
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: 'technology',
    language_function: 'expressing_opinions',
    activity_type: 'guided_discussion',
    duration_minutes: 20,
    learning_objective: 'Express personal opinions on social media use with functional phrases.',
    student_instructions: 'Take turns sharing your view on smartphones in school.',
    teacher_instructions: 'Form pairs of two. Walk around and note pronunciation.',
    language_support: {
      useful_phrases: ['I believe that...', 'From my point of view...', 'I agree with...'],
      grammar_support: ['Modal verbs for opinion (should, might)'],
      vocabulary_support: ['digital device', 'screen time', 'connectivity']
    },
    activity_steps: [
      { phase: 'warm_up', duration_minutes: 5, teacher_instructions: 'Lead-in', student_instructions: 'Brainstorm' },
      { phase: 'core_task', duration_minutes: 10, teacher_instructions: 'Facilitate', student_instructions: 'Discuss' },
      { phase: 'wrap_up', duration_minutes: 5, teacher_instructions: 'Debrief', student_instructions: 'Summarize' }
    ],
    assessment: {
      criteria: ['Expresses opinion clearly', 'Uses at least 2 target phrases'],
      rubric_snapshot: ['B1: Can enter unprepared into conversations on familiar topics']
    }
  };

  BaseAcademicGenerator.setMockProvider(async () => JSON.stringify(mockActivityOutput));

  const result = await AcademicGenerationGenerator.call({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: 'technology',
    language_function: 'expressing_opinions',
    activity_type: 'guided_discussion',
    duration_minutes: 20
  });

  // Restaurar mock
  BaseAcademicGenerator.setMockProvider(null);

  assert(result.success, 'Generación completa exitosa');
  assert(result.activity?.title === 'Teen Tech Opinions Debate', 'La actividad resultante contiene título generado');
  assert(result.validation.valid, 'Validación pasa con éxito');
  assert(result.traceability.generation_id.startsWith('gen_'), 'ID de trazabilidad generado correctamente');
  assert(result.traceability.knowledge_document_ids.length > 0, 'Asocia IDs de la Bóveda Curricular');
  assert(result.traceability.knowledge_versions.length > 0, 'Asocia versiones de documentos');

  // --- TEST 13: Traceability Store Retrieval ---
  console.log('\n--- TEST 13: Persistencia y Recuperación de Trazabilidad ---');
  const stored = await AcademicGenerationTraceabilityStore.getById(result.traceability.generation_id);
  assert(stored !== null, 'El registro de generación fue guardado y recuperado de .generations/');
  assert(stored?.request.grade === 'high_school_1', 'El registro guardado preserva los parámetros de la solicitud');
  assert(stored?.knowledge_document_ids.length === result.traceability.knowledge_document_ids.length, 'Preserva linaje curricular exacto');

  // ================================================================
  console.log('\n================================================================');
  console.log(`📊 RESUMEN: ${stats.passed} PASADAS, ${stats.failed} FALLADAS de ${stats.passed + stats.failed}`);
  console.log('================================================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
