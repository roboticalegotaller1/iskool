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
  assert(synthesis.averageMasteryRate > 0.8, `Tasa de dominio promedio calculada (${(synthesis.averageMasteryRate * 100).toFixed(1)}%)`);
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

  console.log(`\n================================================================`);
  console.log(`🏁 RESULTADOS: ${passedTests}/${totalTests} pruebas superadas con éxito`);
  console.log(`================================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Error fatal en pruebas:", err);
  process.exit(1);
});
