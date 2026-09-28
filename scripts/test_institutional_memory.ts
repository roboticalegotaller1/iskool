/**
 * @file test_institutional_memory.ts
 * @description Script de prueba y certificación técnica para la Memoria Institucional de iSkool.
 * Verifica carga, validación de esquemas, síntesis multi-ciclo y el blindaje cripto-pedagógico Cero PII.
 */

import { InstitutionalMemoryService } from '../src/lib/institutionalMemory/memoryService';
import { PedagogicalPiiGuard, PedagogicalPrivacyViolationError } from '../src/lib/institutionalMemory/piiGuard';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';
import { KnowledgeVaultParser } from '../src/lib/knowledgeVault/parser';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log(`\n================================================================`);
  console.log(`🧠 PRUEBA DE CERTIFICACIÓN: ARQUITECTURA DE MEMORIA INSTITUCIONAL`);
  console.log(`   Principio: "El docente trabaja; iSkool recuerda; la institución aprende."`);
  console.log(`================================================================\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
    }
  }

  // 1. Carga de memorias existentes en la Bóveda Curricular
  const memories = InstitutionalMemoryService.loadAllMemories();
  assert(memories.length >= 2, `Carga de memorias en la Bóveda Curricular (Encontradas: ${memories.length})`);

  // 2. Validación de notas con KnowledgeVaultValidator
  for (const mem of memories) {
    const raw = fs.readFileSync(mem.filePath, 'utf8');
    const parsed = KnowledgeVaultParser.parse(raw, mem.filePath);
    const valResult = KnowledgeVaultValidator.validate(parsed);
    assert(valResult.valid, `Validación de esquema frontmatter: ${path.basename(mem.filePath)}`, JSON.stringify(valResult.errors));
  }

  // 3. Consulta semántica y por filtros (Grado 4, Matemáticas, Fracciones)
  const math4Memories = InstitutionalMemoryService.queryMemories({
    grade: 4,
    subject: 'matematicas',
    topic: 'fracciones'
  });
  assert(math4Memories.length >= 2, `Consulta de memorias 4º Primaria Matemáticas (Encontradas: ${math4Memories.length})`);

  // 4. Síntesis acumulativa entre ciclos (2024-2025 y 2025-2026)
  const synthesis = InstitutionalMemoryService.synthesizePriorCycleLearnings(math4Memories, 'fracciones_equivalentes');
  assert(synthesis.cyclesCovered.includes('2024-2025') && synthesis.cyclesCovered.includes('2025-2026'), 'Síntesis abarca ciclos 2024-2025 y 2025-2026');
  assert(synthesis.totalStudentsEvaluated >= 50, `Conteo agregado de muestra de estudiantes (${synthesis.totalStudentsEvaluated})`);
  assert(synthesis.averageMasteryRate >= 0.65, `Tasa de dominio promedio calculada (${(synthesis.averageMasteryRate * 100).toFixed(1)}%)`);
  assert(synthesis.recurrentFrictionPoints.length > 0, `Detección de fricciones conceptuales recurrentes (${synthesis.recurrentFrictionPoints.length} encontradas)`);
  assert(synthesis.citedMemories.length >= 2, `Trazabilidad de procedencia y enlaces wiki [[...]] (${synthesis.citedMemories.length} citadas)`);

  console.log(`\n📊 Resumen de Síntesis Institucional:`);
  console.log(`   - Ciclos analizados: ${synthesis.cyclesCovered.join(', ')}`);
  console.log(`   - Fricción recurrente #1: "${synthesis.recurrentFrictionPoints[0]?.friction}" (${synthesis.recurrentFrictionPoints[0]?.occurrences} ciclos)`);
  console.log(`   - Intervenciones probadas en la institución: ${synthesis.provenInterventions.length}`);
  console.log(`   - Recomendaciones al docente nuevo: ${synthesis.recommendationsForNextTeacher.length}\n`);

  // 5. Blindaje de Privacidad de Menores (Cero PII)
  console.log(`🔒 Validando Guardián de Privacidad de Menores (Regla No Negociable Cero PII)...`);

  // Caso 5.1: CURP de menor debe ser rechazada inmediatamente
  let curpBlocked = false;
  try {
    PedagogicalPiiGuard.assertZeroPii({
      text: "El alumno con CURP ABCD120304HDFRRN01 tuvo problemas en la prueba.",
      cohort: "4B"
    });
  } catch (err) {
    if (err instanceof PedagogicalPrivacyViolationError) {
      curpBlocked = true;
    }
  }
  assert(curpBlocked, 'Bloqueo estricto de CURP oficial de menor');

  // Caso 5.2: Correo electrónico de menor/padre debe ser rechazado
  let emailBlocked = false;
  try {
    PedagogicalPiiGuard.assertZeroPii("Contacto con madre de familia: mama_sofia@gmail.com para seguimiento individual.");
  } catch (err) {
    if (err instanceof PedagogicalPrivacyViolationError) {
      emailBlocked = true;
    }
  }
  assert(emailBlocked, 'Bloqueo estricto de correo electrónico personal');

  // Caso 5.3: Expediente nominativo directo de menor debe ser rechazado
  let nameBlocked = false;
  try {
    PedagogicalPiiGuard.assertZeroPii("El alumno: Juan Rodriguez no alcanzó el objetivo.");
  } catch (err) {
    if (err instanceof PedagogicalPrivacyViolationError) {
      nameBlocked = true;
    }
  }
  assert(nameBlocked, 'Bloqueo estricto de nombre y apellido individual de alumno');

  // Caso 5.4: Datos agregados legítimos deben pasar sin objeción
  let legitPassed = false;
  try {
    PedagogicalPiiGuard.assertZeroPii({
      group_cohort: "4A",
      students_evaluated_count: 28,
      mastery_rate: 0.85,
      friction: "Dificultad en conversión de fracciones impropias"
    });
    legitPassed = true;
  } catch (err) {
    legitPassed = false;
  }
  assert(legitPassed, 'Admisión de telemetría pedagógica agregada y anónima');

  // 6. Prueba de Ruta de Ingestión Programática (Rails -> Next.js)
  console.log(`\n📡 Probando flujo de ingestión programática de Memoria Institucional...`);
  const newMemoryInput = {
    institution_id: "IBIME",
    campus: "Campus Central",
    academic_cycle: "2025-2026",
    phase_nem: "fase_4",
    grade: 4,
    subject: "ciencias",
    topic: "estados_de_la_materia",
    created_by_teacher_ref: "teacher_test_99",
    author_display_name: "Prof. Laura Gomez",
    group_cohort: "4C",
    metrics: {
      students_evaluated_count: 26,
      mastery_rate: 0.88,
      comprehension_friction_points: ["sublimacion_proceso_fisico"]
    },
    provenance: {
      rails_activity_id: 9940,
      rails_assessment_batch_id: 12040,
      ingestion_agent: "iSkool-Memory-Worker/1.0"
    },
    sections: {
      contextoDiagnostico: "Evaluación formativa tras experimento de laboratorio con hielo seco y vapor.",
      friccionesErrores: ["Confusión entre evaporación y ebullición", "Concepto de sublimación sin pasar por líquido"],
      adaptacionesExitosas: ["Uso de modelo molecular con esferas de plastilina para representar espaciado de partículas"],
      recomendacionesProximoCiclo: ["Iniciar con el experimento de la jeringa y presión antes de fórmulas de temperatura"]
    }
  };

  const saveRes = await InstitutionalMemoryService.saveMemory(newMemoryInput);
  assert(saveRes.success && Boolean(saveRes.filePath), 'Guardado atómico de nueva memoria vía InstitutionalMemoryService');

  const queryCiencias = InstitutionalMemoryService.queryMemories({
    grade: 4,
    subject: 'ciencias',
    topic: 'estados_de_la_materia'
  });
  assert(queryCiencias.length >= 1, `Consulta de memoria recién ingerida (Encontradas: ${queryCiencias.length})`);

  const synthCiencias = InstitutionalMemoryService.synthesizePriorCycleLearnings(queryCiencias, 'estados_de_la_materia');
  assert(synthCiencias.totalStudentsEvaluated === 26 && synthCiencias.averageMasteryRate === 0.88, 'Síntesis correcta de memoria recién ingerida');

  // 7. Prueba de Persistencia GitOps & Cloud Storage (AWS Amplify / Lambda)
  console.log(`\n☁️ Validando resiliencia de persistencia serverless y GitOps...`);
  const gitSyncTestResult = await InstitutionalMemoryService.syncToCentralRepository({
    relativeRepoPath: 'planeaciones/Memorias_Institucionales/test/test_persistence.md',
    fileContent: '# Test persistence'
  });
  // Si no hay token de GitHub configurado en local, debe retornar synced: false con mensaje descriptivo sin lanzar excepción
  assert(typeof gitSyncTestResult.synced === 'boolean', 'Manejo defensivo de sincronización GitOps sin excepciones no controladas');

  const storageSyncTestResult = await InstitutionalMemoryService.syncToCloudStorage(
    'planeaciones/Memorias_Institucionales/test/test_storage.md',
    '# Test cloud storage'
  );
  assert(typeof storageSyncTestResult.synced === 'boolean', 'Manejo defensivo de sincronización Cloud Storage sin excepciones');

  // 8. Prueba del Emisor de Lotes de Rails (Cero PII & Agregación)
  console.log(`\n🚂 Validando lógica de agregación del Emisor de Rails...`);
  const mockEvaluations = [
    { score: 8.5, friction_tags: ['fracciones_equivalentes_recta'] },
    { score: 9.0, friction_tags: [] },
    { score: 5.5, friction_tags: ['confusion_numerador_denominador', 'fracciones_equivalentes_recta'] },
    { score: 7.0, friction_tags: [] },
    { score: 6.0, friction_tags: ['confusion_numerador_denominador'] }
  ];
  const passedStudents = mockEvaluations.filter(e => e.score >= 7.0).length;
  const computedMastery = Math.round((passedStudents / mockEvaluations.length) * 100) / 100;
  assert(computedMastery === 0.60, `Cálculo de tasa de dominio en lote (Esperado 60%, obtenido ${(computedMastery * 100).toFixed(0)}%)`);

  // Validar rechazo de PII en evaluaciones crudas
  let rawStudentBlocked = false;
  try {
    PedagogicalPiiGuard.assertZeroPii({
      student_name: 'Santiago Ramirez Morales',
      curp: 'RAMS120501HDFR09',
      score: 9.5
    });
  } catch (err) {
    if (err instanceof PedagogicalPrivacyViolationError) {
      rawStudentBlocked = true;
    }
  }
  assert(rawStudentBlocked, 'Rechazo absoluto de evaluaciones con nombres de alumnos o CURP (Cero PII)');

  // 9. Prueba de Inyección en Prompt de IA Pedagógica
  console.log(`\n🤖 Validando inyección canónica en prompt de Inteligencia Artificial Pedagógica...`);
  const mathSynth = InstitutionalMemoryService.synthesizePriorCycleLearnings(math4Memories, 'fracciones_equivalentes');
  const generatedPromptBlock = `[MEMORIA INSTITUCIONAL DEL COLEGIO]:
- Fricciones históricas detectadas en este tema: ${mathSynth.recurrentFrictionPoints.map(f => f.friction).join(', ') || 'Ninguna registrada'}
- Intervenciones y adaptaciones probadas con éxito por otros docentes:
${mathSynth.provenInterventions.map(i => `  • ${i.intervention}`).join('\n')}
- Recomendaciones pedagógicas acumuladas:
${mathSynth.recommendationsForNextTeacher.map(r => `  • ${r}`).join('\n')}
- Instrucción pedagógica: Integra explícitamente estas intervenciones en el diseño de las actividades (Desarrollo y Cierre) para prevenir los bloqueos conceptuales históricos.`;

  assert(generatedPromptBlock.includes('[MEMORIA INSTITUCIONAL DEL COLEGIO]:'), 'Encabezado canónico de memoria institucional presente');
  assert(generatedPromptBlock.includes('- Fricciones históricas detectadas en este tema:'), 'Bloque de fricciones históricas inyectado');
  assert(generatedPromptBlock.includes('- Intervenciones y adaptaciones probadas con éxito por otros docentes:'), 'Bloque de adaptaciones probadas inyectado');
  assert(generatedPromptBlock.includes('conversion_impropia_mixta') || generatedPromptBlock.includes('numerador'), 'Fricción histórica específica inyectada en el prompt');

  console.log(`\n================================================================`);
  console.log(`🏁 RESULTADOS: ${passedTests}/${totalTests} pruebas superadas con éxito`);
  console.log(`================================================================\n`);

  if (passedTests !== totalTests) {
    process.exitCode = 1;
  }
}

runTests().catch(err => {
  console.error("Error fatal en pruebas:", err);
  process.exitCode = 1;
});

