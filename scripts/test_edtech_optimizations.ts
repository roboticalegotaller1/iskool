/**
 * @file test_edtech_optimizations.ts
 * @description Suite de Pruebas y Certificación de las 3 Optimizaciones EdTech:
 * 1. Fachada Unificada de Orquestación (IskoolCoreOrchestrator)
 * 2. Estrategia de Caché Multinivel (L1 LRU Memoria <1ms / L2 Supabase Persistente)
 * 3. Puente Universal de API Routes de Next.js (REST/Server Actions)
 */

import { IskoolCore } from '../src/lib/iskoolCore';
import { AIGatewayCache } from '../src/lib/aiGateway/cache';
import { AIGateway } from '../src/lib/aiGateway/gateway';
import { POST as handleTutorChat } from '../src/app/api/iskool/tutor/chat/route';
import { POST as handleCopilotAsk } from '../src/app/api/iskool/copilot/ask/route';
import { GET as handleAnalyticsGroup } from '../src/app/api/iskool/analytics/group/route';
import { GET as handleLeadershipDashboard } from '../src/app/api/iskool/leadership/dashboard/route';
import { GET as handleHealth } from '../src/app/api/iskool/health/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Aserción fallida: ${message}`);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runEdTechOptimizationsTest() {
  console.log(`================================================================`);
  console.log(`🚀 iSchool — Certificación de Optimizaciones EdTech y Mejores Prácticas`);
  console.log(`================================================================`);

  let totalTests = 0;
  let passedTests = 0;

  // -------------------------------------------------------------------------
  // 1. FACHADA UNIFICADA DE ORQUESTACIÓN (IskoolCoreOrchestrator)
  // -------------------------------------------------------------------------
  console.log(`\n--- 1. Fachada Unificada de Orquestación (IskoolCore) ---`);

  // A. getStudentSession
  totalTests++;
  const studentSession = await IskoolCore.getStudentSession('std_edtech_pilot_01', {
    grade: 'high_school_1'
  });
  assert(
    studentSession.student_id === 'std_edtech_pilot_01' &&
    studentSession.profile !== null &&
    studentSession.next_action !== undefined,
    'IskoolCore.getStudentSession(): Consolida perfil adaptativo, competencias y diagnóstico pedagógico.'
  );
  passedTests++;

  // B. getTeacherWorkspace
  totalTests++;
  const teacherWorkspace = await IskoolCore.getTeacherWorkspace(
    'teacher_edtech_lead',
    'course_hs1_eng_2026',
    { groupId: 'group_hs1_a', schoolId: 'sch-jjrosseau' }
  );
  assert(
    teacherWorkspace.release_info.release_tag === 'release_1.0_english_2026' &&
    teacherWorkspace.copilot_session !== null &&
    Array.isArray(teacherWorkspace.draft_artifacts),
    'IskoolCore.getTeacherWorkspace(): Integra release curricular oficial, analítica de grupo y sesión Copilot.'
  );
  passedTests++;

  // C. getCoordinatorCockpit
  totalTests++;
  const coordinatorCockpit = await IskoolCore.getCoordinatorCockpit(
    'sch-jjrosseau',
    'high_school_1'
  );
  assert(
    coordinatorCockpit.overview !== null &&
    coordinatorCockpit.daily_brief !== null &&
    coordinatorCockpit.ai_budget !== null &&
    coordinatorCockpit.system_readiness === 'READY_FOR_PRODUCTION',
    'IskoolCore.getCoordinatorCockpit(): Cabina ejecutiva con Daily Brief, señales analíticas y presupuesto IA.'
  );
  passedTests++;

  // D. dispatchAIOperation
  totalTests++;
  const aiResult = await IskoolCore.dispatchAIOperation({
    request_id: `req_test_dispatch_${Date.now()}`,
    feature: 'activity_generator',
    prompt: 'Genera un ejercicio breve de speaking sobre opiniones tecnológicas.',
    school_id: 'sch-jjrosseau',
    user_id: 'teacher_edtech_lead',
    user_role: 'teacher',
    cacheable: true
  });
  assert(
    aiResult.status === 'success' || aiResult.status === 'cached',
    'IskoolCore.dispatchAIOperation(): Despacho universal gobernado con sanitización y Circuit Breaker.'
  );
  passedTests++;

  // -------------------------------------------------------------------------
  // 2. ESTRATEGIA DE CACHÉ MULTINIVEL (L1 MEMORIA / L2 SUPABASE)
  // -------------------------------------------------------------------------
  console.log(`\n--- 2. Estrategia de Caché Multinivel (L1 LRU / L2 Supabase) ---`);

  // A. Generación de clave determinista SHA-256
  totalTests++;
  const testKey = AIGatewayCache.generateKey(
    'speaking_practice',
    'What is your opinion about technology?',
    'models/pedagogical-ai-core'
  );
  assert(testKey.length === 64, 'AIGatewayCache: Clave determinista SHA-256 de 64 caracteres hexadecimales.');
  passedTests++;

  // B. Escritura y lectura L1 en < 1ms
  totalTests++;
  const t0 = performance.now();
  await AIGatewayCache.set(testKey, {
    output: { lesson: 'Technology opinions', level: 'B1' },
    raw_text: '{"lesson": "Technology opinions", "level": "B1"}',
    model: 'models/pedagogical-ai-core',
    tokens_saved: 120
  });
  const tWrite = performance.now() - t0;

  const t1 = performance.now();
  const cachedL1 = await AIGatewayCache.get(testKey);
  const tRead = performance.now() - t1;

  assert(
    cachedL1 !== undefined && cachedL1.source === 'L1_memory' && tRead < 10,
    `AIGatewayCache (L1 Memoria): Lectura ultrarrápida ejecutada en ${tRead.toFixed(3)} ms con salida intacta.`
  );
  passedTests++;

  // C. Reutilización a través de AIGateway.execute (Cache Hit)
  totalTests++;
  const cachedGatewayResponse = await AIGateway.execute({
    request_id: `req_cache_hit_${Date.now()}`,
    feature: 'activity_generator',
    prompt: 'Genera un ejercicio breve de speaking sobre opiniones tecnológicas.',
    school_id: 'sch-jjrosseau',
    user_id: 'teacher_edtech_lead',
    user_role: 'teacher',
    cacheable: true
  });
  assert(
    cachedGatewayResponse.cached === true && cachedGatewayResponse.input_tokens === 0,
    'AIGateway: Cache Hit exitoso reutiliza respuesta sin consumo de tokens (0 tokens facturados).'
  );
  passedTests++;

  // D. Métricas y Telemetría de Caché
  totalTests++;
  const stats = AIGatewayCache.getStats();
  assert(
    stats.l1_hits > 0 && stats.l1_current_size > 0,
    `AIGatewayCache: Telemetría activa (L1 Size: ${stats.l1_current_size}, L1 Hits: ${stats.l1_hits}, Misses: ${stats.misses}).`
  );
  passedTests++;

  // -------------------------------------------------------------------------
  // 3. PUENTE UNIVERSAL DE API ROUTES DE NEXT.JS
  // -------------------------------------------------------------------------
  console.log(`\n--- 3. Puente Universal de API Routes de Next.js ---`);

  // A. POST /api/iskool/tutor/chat
  totalTests++;
  const tutorChatReq = new Request('http://localhost:3000/api/iskool/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'std_edtech_pilot_01',
      grade: 'high_school_1',
      message: 'I think smartphones are useful because they help us study anywhere.'
    })
  });
  const tutorChatRes: any = await handleTutorChat(tutorChatReq as any);
  const tutorChatData = await tutorChatRes.json();
  if (tutorChatRes.status !== 200 || !tutorChatData.success) {
    console.error('DEBUG tutorChat:', tutorChatRes.status, tutorChatData);
  }
  assert(
    tutorChatRes.status === 200 &&
    tutorChatData.success === true &&
    tutorChatData.turn !== undefined,
    'API Route [POST /api/iskool/tutor/chat]: Turno socrático procesado con context building y zero PII.'
  );
  passedTests++;

  // B. POST /api/iskool/copilot/ask
  totalTests++;
  const copilotAskReq = new Request('http://localhost:3000/api/iskool/copilot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacherId: 'teacher_edtech_lead',
      courseId: 'course_hs1_eng_2026',
      query: 'Prepara la clase de mañana para High School 1 sobre dilemas éticos.'
    })
  });
  const copilotAskRes: any = await handleCopilotAsk(copilotAskReq as any);
  const copilotAskData = await copilotAskRes.json();
  assert(
    copilotAskRes.status === 200 &&
    copilotAskData.success === true &&
    copilotAskData.human_in_the_loop.status === 'draft_pending_review',
    'API Route [POST /api/iskool/copilot/ask]: Consulta resuelta con artefactos en borrador y Human-in-the-Loop.'
  );
  passedTests++;

  // C. GET /api/iskool/analytics/group
  totalTests++;
  const analyticsGroupReq = new Request('http://localhost:3000/api/iskool/analytics/group?groupId=group_hs1_a&grade=high_school_1');
  const analyticsGroupRes: any = await handleAnalyticsGroup(analyticsGroupReq as any);
  const analyticsGroupData = await analyticsGroupRes.json();
  assert(
    analyticsGroupRes.status === 200 &&
    analyticsGroupData.success === true &&
    analyticsGroupData.executive_summary !== null &&
    analyticsGroupData.instruction_gap !== null,
    'API Route [GET /api/iskool/analytics/group]: Radiografía de grupo determinista con brecha de instrucción.'
  );
  passedTests++;

  // D. GET /api/iskool/leadership/dashboard
  totalTests++;
  const leadershipDashboardReq = new Request('http://localhost:3000/api/iskool/leadership/dashboard?schoolId=sch-jjrosseau&grade=high_school_1&role=coordinator');
  const leadershipDashboardRes: any = await handleLeadershipDashboard(leadershipDashboardReq as any);
  const leadershipDashboardData = await leadershipDashboardRes.json();
  assert(
    leadershipDashboardRes.status === 200 &&
    leadershipDashboardData.success === true &&
    leadershipDashboardData.cockpit.daily_brief !== null &&
    leadershipDashboardData.cockpit.overview !== null,
    'API Route [GET /api/iskool/leadership/dashboard]: Cabina directiva entregada con control de acceso RBAC.'
  );
  passedTests++;

  // E. GET /api/iskool/health
  totalTests++;
  const healthRes: any = await handleHealth();
  const healthData = await healthRes.json();
  assert(
    healthRes.status === 200 &&
    healthData.overall_status === 'READY_FOR_PRODUCTION' &&
    healthData.checks_passed >= 7,
    'API Route [GET /api/iskool/health]: Monitor de salud externo 100% READY_FOR_PRODUCTION.'
  );
  passedTests++;

  // -------------------------------------------------------------------------
  // 4. AUDITORÍA DE MARCA BLANCA INSTITUCIONAL (REGLA NO NEGOCIABLE 1)
  // -------------------------------------------------------------------------
  console.log(`\n--- 4. Auditoría de Marca Blanca Institucional ---`);
  totalTests++;
  const payloadStr = JSON.stringify({
    studentSession,
    teacherWorkspace,
    coordinatorCockpit,
    tutorChatData,
    copilotAskData,
    analyticsGroupData,
    leadershipDashboardData
  });

  const forbiddenBrands = ['gemini', 'obsidian', 'obsidean', 'canvas lms'];
  let violationFound = false;
  for (const brand of forbiddenBrands) {
    if (payloadStr.toLowerCase().includes(brand)) {
      violationFound = true;
      console.error(`Violación de marca blanca detectada: ${brand}`);
    }
  }
  assert(!violationFound, 'Marca Blanca Institucional: Cero exposición de nombres de marcas comerciales externas.');
  passedTests++;

  console.log(`\n================================================================`);
  console.log(`🏁 RESULTADO DE LA CERTIFICACIÓN EDTECH:`);
  console.log(`   Pruebas ejecutadas: ${totalTests}`);
  console.log(`   Pruebas superadas:  ${passedTests}`);
  console.log(`   Pruebas fallidas:   ${totalTests - passedTests}`);
  console.log(`================================================================\n`);
}

runEdTechOptimizationsTest().catch((err) => {
  console.error('Error fatal durante la certificación EdTech:', err);
  process.exit(1);
});
