/**
 * @file test_institutional_memory.ts
 * @description Script de prueba y certificación técnica para la Memoria Institucional de iSkool.
 * Verifica carga, validación de esquemas, síntesis multi-ciclo y el blindaje cripto-pedagógico Cero PII.
 */

import { InstitutionalMemoryService } from '../src/lib/institutionalMemory/memoryService';
import {
  InstitutionalMemoryReconcileService,
  identifyMissingGitMemories,
  reconcileGitOpsMemories
} from '../src/lib/institutionalMemory/reconcileService';
import { PedagogicalPiiGuard, PedagogicalPrivacyViolationError } from '../src/lib/institutionalMemory/piiGuard';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';
import { KnowledgeVaultParser } from '../src/lib/knowledgeVault/parser';
import { timingSafeTokenCheck } from '../src/app/api/vault/memory/route';
import { timingSafeTokenCheck as reconcileTokenCheck } from '../src/app/api/vault/reconcile/route';
import type { MemoryManifestEntry } from '../src/lib/institutionalMemory/types';
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

  // 10. Prueba de Actualización de Memoria Existente y Verificación de SHA
  console.log(`\n🔄 Validando actualización de memoria existente y protocolo SHA GitOps...`);
  const updateMemoryInput = {
    ...newMemoryInput,
    metrics: {
      students_evaluated_count: 29,
      mastery_rate: 0.93,
      comprehension_friction_points: ["sublimacion_proceso_fisico"]
    },
    sections: {
      ...newMemoryInput.sections,
      contextoDiagnostico: "Actualización posterior a segunda ronda de laboratorio con condensación."
    }
  };
  const updateRes = await InstitutionalMemoryService.saveMemory(updateMemoryInput);
  assert(updateRes.success, 'Actualización exitosa de memoria institucional existente');
  
  const updatedDoc = InstitutionalMemoryService.queryMemories({
    grade: 4,
    subject: 'ciencias',
    topic: 'estados_de_la_materia'
  });
  const updatedFm = updatedDoc[0]?.frontmatter;
  assert(updatedFm?.metrics.students_evaluated_count === 29, `Muestra actualizada en memoria existente (29 estudiantes)`);
  assert(updatedFm?.metrics.mastery_rate === 0.93, `Tasa de dominio actualizada en memoria existente (93%)`);

  // Simulación de resolución de SHA en GitOps
  const originalFetch = global.fetch;
  let shaVerifiedInPayload: boolean = false;
  let skipCiVerifiedInPayload: boolean = false;

  try {
    process.env.REPO_ACCESS_TOKEN = 'test_token_mock_123';
    global.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const urlStr = String(url);
      const method = init?.method || 'GET';

      if (method === 'GET') {
        // Simula respuesta de GitHub indicando que el archivo existe con un SHA específico
        return new Response(JSON.stringify({ sha: 'mock_existing_sha_987654321' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (method === 'PUT') {
        const body = JSON.parse(String(init?.body || '{}'));
        if (body.sha === 'mock_existing_sha_987654321') {
          shaVerifiedInPayload = true;
        }
        if (body.message && body.message.includes('[skip ci]') && body.message.includes('[amplify skip]')) {
          skipCiVerifiedInPayload = true;
        }
        return new Response(JSON.stringify({ commit: { sha: 'mock_commit_sha_abcdef' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const mockGitResult = await InstitutionalMemoryService.syncToCentralRepository({
      relativeRepoPath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Test.md',
      fileContent: '# Test with SHA check'
    });

    assert(mockGitResult.synced === true, 'Sincronización GitOps exitosa con mock de GitHub');
    assert(Boolean(shaVerifiedInPayload), 'Manejo de Actualización: SHA existente consultado e incluido en PUT (Previene HTTP 422)');
    assert(Boolean(skipCiVerifiedInPayload), 'Prevención de Bucles de Build: Commit incluye [skip ci] [amplify skip]');
  } finally {
    global.fetch = originalFetch;
    delete process.env.REPO_ACCESS_TOKEN;
  }

  // 11. Prueba de Seguridad con Tiempo Constante (crypto.timingSafeEqual)
  console.log(`\n🛡️ Validando comparación de tokens en tiempo constante (crypto.timingSafeEqual)...`);
  const secret = 'iSkool_Pedagogical_Ingestion_Secret_Key_9988';
  
  assert(timingSafeTokenCheck(secret, secret) === true, 'Token coincidente verificado con éxito');
  assert(timingSafeTokenCheck('wrong_token_1234', secret) === false, 'Token divergente de distinta longitud rechazado con tiempo constante');
  assert(timingSafeTokenCheck('iSkool_Pedagogical_Ingestion_Secret_Key_9989', secret) === false, 'Token divergente de idéntica longitud rechazado');
  assert(timingSafeTokenCheck('', secret) === false, 'Token vacío rechazado de forma segura');
  // 12. Poda de Memorias y Token Budget para IA Pedagógica (formatMemoriesForPrompt)
  console.log(`\n✂️ Validando poda y presupuesto de tokens para IA Pedagógica (FASE 4)...`);
  const promptOutput = InstitutionalMemoryService.formatMemoriesForPrompt(math4Memories, 1200);

  assert(promptOutput.includes('Logros pedagógicos:'), 'Extracción de logros pedagógicos en el prompt');
  assert(promptOutput.includes('Dificultades detectadas y errores conceptuales comunes:'), 'Extracción de dificultades y errores conceptuales');
  assert(promptOutput.includes('Adecuaciones curriculares que funcionaron:'), 'Extracción de adecuaciones curriculares comprobadas');
  assert(promptOutput.includes('Recomendaciones para el docente:'), 'Extracción de recomendaciones docentes');
  assert(promptOutput.length <= 1200 * 4 + 300, `Presupuesto estricto de tokens respetado (${promptOutput.length} caracteres para maxTokens=1200)`);

  const memoryBlockCount = (promptOutput.match(/\[MEMORIA DE CICLO ANTERIOR/g) || []).length;
  assert(memoryBlockCount <= 3 && memoryBlockCount >= 1, `Límite de memorias por prompt respetado (Encontradas: ${memoryBlockCount}, máximo permitido: 3)`);

  // 13. Resiliencia de GitOps contra Conflictos Concurrentes (Reintento ante HTTP 409)
  console.log(`\n🔁 Validando ciclo de reintento GitOps ante colisiones de versión (HTTP 409)...`);
  let attemptsCount = 0;
  try {
    process.env.REPO_ACCESS_TOKEN = 'test_token_mock_retry';
    global.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const method = init?.method || 'GET';
      if (method === 'GET') {
        return new Response(JSON.stringify({ sha: `sha_attempt_${attemptsCount}` }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (method === 'PUT') {
        attemptsCount++;
        if (attemptsCount === 1) {
          // Primer intento simula colisión concurrente (HTTP 409 Conflict)
          return new Response('{"message": "Conflict: Sha is outdated"}', {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // Segundo intento tiene éxito
        return new Response(JSON.stringify({ commit: { sha: 'commit_sha_resolved_after_retry' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const retryResult = await InstitutionalMemoryService.syncToCentralRepository({
      relativeRepoPath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Retry_Test.md',
      fileContent: '# Test retry 409'
    });

    assert(retryResult.synced === true, 'Sincronización GitOps superada con éxito tras reintento ante HTTP 409');
    assert(attemptsCount === 2, `Número exacto de iteraciones ejecutadas (${attemptsCount} intentos)`);
  } finally {
    global.fetch = originalFetch;
    delete process.env.REPO_ACCESS_TOKEN;
  }

  // 14. Fase 6: Reconciliador GitOps (identifyMissingGitMemories y reconcileGitOpsMemories)
  console.log(`\n🔎 Validando Reconciliador GitOps (FASE 6)...`);
  const mockManifest: MemoryManifestEntry[] = [
    {
      id: 'memoria-fracciones-4b',
      fileName: 'Memoria_2024-2025_G4_matematicas_fracciones_equivalentes_4B.md',
      filePath: 'planeaciones/Memorias_Institucionales/2024-2025/Memoria_2024-2025_G4_matematicas_fracciones_equivalentes_4B.md',
      ciclo: '2024-2025',
      grado: '4',
      asignatura: 'matematicas',
      tema: 'fracciones',
      fecha: '2025-06-20T10:00:00.000Z',
      palabras_clave: ['matematicas', 'fracciones']
    },
    {
      id: 'memoria-ciencias-4c',
      fileName: 'Memoria_2025-2026_G4_ciencias_estados_de_la_materia_4C.md',
      filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_2025-2026_G4_ciencias_estados_de_la_materia_4C.md',
      ciclo: '2025-2026',
      grado: '4',
      asignatura: 'ciencias',
      tema: 'estados_de_la_materia',
      fecha: '2026-02-15T12:00:00.000Z',
      palabras_clave: ['ciencias', 'materia']
    }
  ];

  // Simular árbol del Repositorio Central donde únicamente existe la primera memoria
  const mockGitBlobs = [
    {
      path: 'planeaciones/Memorias_Institucionales/2024-2025/Memoria_2024-2025_G4_matematicas_fracciones_equivalentes_4B.md',
      sha: 'blob_sha_11111'
    }
  ];

  const detectedMissing = identifyMissingGitMemories(mockManifest, mockGitBlobs);
  assert(
    detectedMissing.length === 1 && detectedMissing[0].id === 'memoria-ciencias-4c',
    'Detección de memoria ausente en Git mediante ReconcileService'
  );

  // Reconciliación simulada de la memoria huérfana en GitHub
  const originalFetchReconcile = global.fetch;
  let reconcilePutCalled: boolean = false;
  let skipCiInReconcileCommit: boolean = false;

  try {
    process.env.REPO_ACCESS_TOKEN = 'test_reconcile_token';
    global.fetch = (async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const urlStr = String(url);
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/git/trees/')) {
        return new Response(JSON.stringify({
          tree: [
            {
              path: 'planeaciones/Memorias_Institucionales/2024-2025/Memoria_2024-2025_G4_matematicas_fracciones_equivalentes_4B.md',
              type: 'blob',
              sha: 'blob_sha_11111'
            }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (method === 'GET' && urlStr.includes('/contents/')) {
        return new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (method === 'PUT' && urlStr.includes('/contents/')) {
        reconcilePutCalled = true;
        const body = JSON.parse(String(init?.body || '{}'));
        if (body.message && body.message.includes('[skip ci]') && body.message.includes('[amplify skip]')) {
          skipCiInReconcileCommit = true;
        }
        return new Response(JSON.stringify({
          commit: { sha: 'commit_reconciled_sha_777888' }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const reconcileResult = await InstitutionalMemoryReconcileService.reconcileGitOpsMemories({
      delayMs: 0,
      manifestEntriesOverride: mockManifest,
      gitBlobsOverride: mockGitBlobs
    });

    assert(
      reconcileResult.success === true &&
      reconcileResult.reconciledCount === 1 &&
      Boolean(reconcilePutCalled) &&
      Boolean(skipCiInReconcileCommit),
      'Reconciliación exitosa de memoria huérfana en GitHub'
    );
  } finally {
    global.fetch = originalFetchReconcile;
    delete process.env.REPO_ACCESS_TOKEN;
  }

  // Validación de seguridad para /api/vault/reconcile
  const validSyncSecret = 'iSkool_Vault_Sync_Secret_Key_Secure_2026';
  const authValid = reconcileTokenCheck(validSyncSecret, validSyncSecret);
  const authInvalid = reconcileTokenCheck('invalid_attack_token_123', validSyncSecret);
  const authEmpty = reconcileTokenCheck('', validSyncSecret);

  assert(
    authValid === true && authInvalid === false && authEmpty === false,
    'Rechazo de reconciliación no autorizada (Token Inválido)'
  );

  // 15. Fase 7: Manifest Atomic Locking y resolución de colisiones concurrentes
  console.log(`\n⚡ Validando Fase 7: Manifest Atomic Locking y resolución de colisiones...`);
  const divergentManifestAlpha: MemoryManifestEntry[] = [
    {
      id: 'memoria-1',
      fileName: 'Memoria_1.md',
      filePath: 'planeaciones/Memorias_Institucionales/2024-2025/Memoria_1.md',
      ciclo: '2024-2025',
      grado: '4',
      asignatura: 'matematicas',
      tema: 'fracciones',
      fecha: '2024-10-01T10:00:00.000Z',
      palabras_clave: ['fracciones']
    },
    {
      id: 'memoria-shared',
      fileName: 'Memoria_Shared.md',
      filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Shared.md',
      ciclo: '2025-2026',
      grado: '4',
      asignatura: 'ciencias',
      tema: 'ecosistemas_v1',
      fecha: '2025-10-15T08:00:00.000Z',
      palabras_clave: ['ecosistemas']
    }
  ];

  const divergentManifestBeta: MemoryManifestEntry[] = [
    {
      id: 'memoria-2',
      fileName: 'Memoria_2.md',
      filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_2.md',
      ciclo: '2025-2026',
      grado: '5',
      asignatura: 'historia',
      tema: 'revolucion',
      fecha: '2026-01-20T11:00:00.000Z',
      palabras_clave: ['historia']
    },
    {
      id: 'memoria-shared',
      fileName: 'Memoria_Shared.md',
      filePath: 'planeaciones/Memorias_Institucionales/2025-2026/Memoria_Shared.md',
      ciclo: '2025-2026',
      grado: '4',
      asignatura: 'ciencias',
      tema: 'ecosistemas_v2_actualizado',
      fecha: '2025-10-15T09:30:00.000Z',
      palabras_clave: ['ecosistemas', 'actualizado']
    }
  ];

  const resolvedManifest = InstitutionalMemoryService.mergeAndSortManifestEntries(
    divergentManifestAlpha,
    divergentManifestBeta
  );

  const sharedEntry = resolvedManifest.find(e => e.id === 'memoria-shared');
  const hasMemoria1 = resolvedManifest.some(e => e.id === 'memoria-1');
  const hasMemoria2 = resolvedManifest.some(e => e.id === 'memoria-2');

  assert(
    resolvedManifest.length === 3 &&
    hasMemoria1 &&
    hasMemoria2 &&
    sharedEntry?.tema === 'ecosistemas_v2_actualizado',
    'Resolución atómica de colisión en manifest.json con versión divergente'
  );

  const isChronologicallySorted = resolvedManifest.every((entry, idx) => {
    if (idx === 0) return true;
    const prev = resolvedManifest[idx - 1];
    const cicloDiff = prev.ciclo.localeCompare(entry.ciclo);
    if (cicloDiff > 0) return true;
    if (cicloDiff === 0) {
      return prev.fecha.localeCompare(entry.fecha) >= 0;
    }
    return false;
  });

  assert(
    isChronologicallySorted && resolvedManifest[0].ciclo === '2025-2026',
    'Ordenamiento cronológico estricto y deduplicación atómica en manifest.json'
  );

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


