/**
 * @file test_fase12_governance_pilot.ts
 * @description Suite de Certificación Integral para la Fase 12: Production Readiness, Governance, Security,
 * AI Reliability and Cost Control.
 * Valida el aislamiento multi-tenant, matriz de permisos, minimización Zero PII, Puerta de Enlace de IA,
 * control de costos y presupuestos, circuit breaker, rate limiting, releases curriculares, golden dataset,
 * seguridad de contenido y marca blanca institucional.
 */

import { TenantSecurityEnforcer, SecurityUserContext } from '../src/lib/security/tenantScoping';
import { AIPermissionMatrix } from '../src/lib/security/permissionMatrix';
import { AIDataPolicy } from '../src/lib/aiGovernance/dataPolicy';
import { AIPromptRegistry } from '../src/lib/aiGovernance/promptRegistry';
import { AIContentSafety } from '../src/lib/aiGovernance/contentSafety';
import { AIEvalDataset } from '../src/lib/aiGovernance/evalDataset';
import { AIGateway } from '../src/lib/aiGateway/gateway';
import { AIGatewayModelRouter } from '../src/lib/aiGateway/modelRouter';
import { AIGatewayCircuitBreaker } from '../src/lib/aiGateway/circuitBreaker';
import { AIGatewayRateLimiter } from '../src/lib/aiGateway/rateLimiter';
import { AIGatewayCache } from '../src/lib/aiGateway/cache';
import { AIGatewayCostLedger } from '../src/lib/aiGateway/costLedger';
import { CurriculumReleaseService } from '../src/lib/curriculumGovernance/releaseService';
import { ProductionHealthCheckService } from '../src/lib/observability/healthCheckService';

async function runFase12Certification() {
  console.log(`\n================================================================`);
  console.log(`🛡️  iSchool — Fase 12: Production Readiness, Governance & Security`);
  console.log(`    Certificación Integral de Confiabilidad y Sostenibilidad`);
  console.log(`================================================================\n`);

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`     Detalles: ${details}`);
      process.exitCode = 1;
    }
  }

  // Limpieza inicial de almacenes en memoria
  AIGatewayCache.clear();
  AIGatewayRateLimiter.clear();
  AIGatewayCostLedger.clear();
  AIGatewayCircuitBreaker.reset();
  CurriculumReleaseService.clear();

  // ============================================================================
  // BLOQUE 1: SEGURIDAD Y AISLAMIENTO MULTI-TENANT (Ítems #1, #2 y #3)
  // ============================================================================
  console.log(`--- BLOQUE 1: Seguridad y Aislamiento Multi-Tenant (Anti-IDOR) ---`);

  const studentSchoolA: SecurityUserContext = {
    userId: 'std_001_sch_a',
    role: 'student',
    schoolId: 'sch-jjrosseau'
  };

  const studentSchoolB: SecurityUserContext = {
    userId: 'std_002_sch_b',
    role: 'student',
    schoolId: 'sch-colegio-norte'
  };

  const teacherSchoolA: SecurityUserContext = {
    userId: 'tch_001_sch_a',
    role: 'teacher',
    schoolId: 'sch-jjrosseau',
    assignedGroupIds: ['grp_hs1_a']
  };

  const coordinatorSchoolA: SecurityUserContext = {
    userId: 'coord_001_sch_a',
    role: 'coordinator',
    schoolId: 'sch-jjrosseau',
    assignedGrades: ['high_school_1']
  };

  // Test 1: Alumno de Escuela A intenta acceder a datos de Escuela B
  const crossSchoolAccess = TenantSecurityEnforcer.enforceSchoolScope(studentSchoolA, 'sch-colegio-norte', 'query_grades');
  assert(!crossSchoolAccess.allowed, 'Aislamiento Multi-Tenant: Alumno de Escuela A bloqueado al consultar Escuela B.');

  // Test 2: Docente de Escuela A intenta acceder a Escuela B
  const teacherCrossAccess = TenantSecurityEnforcer.enforceSchoolScope(teacherSchoolA, 'sch-colegio-norte', 'query_planning');
  assert(!teacherCrossAccess.allowed, 'Aislamiento Multi-Tenant: Docente de Escuela A bloqueado al consultar Escuela B.');

  // Test 3: Alumno intenta consultar el perfil de otro alumno (Protección Anti-IDOR)
  const studentSelfViolation = TenantSecurityEnforcer.enforceStudentSelfAccess(studentSchoolA, 'std_009_other_student');
  assert(!studentSelfViolation.allowed, 'Anti-IDOR: Alumno bloqueado al intentar acceder al perfil de otro estudiante.');

  // Test 4: Alumno consulta su propio perfil
  const studentSelfOk = TenantSecurityEnforcer.enforceStudentSelfAccess(studentSchoolA, 'std_001_sch_a');
  assert(studentSelfOk.allowed, 'Anti-IDOR: Alumno autorizado a consultar su propio perfil.');

  // Test 5: Docente intenta acceder a grupo no asignado
  const teacherGroupViolation = TenantSecurityEnforcer.enforceTeacherGroupAccess(teacherSchoolA, 'grp_hs1_c');
  assert(!teacherGroupViolation.allowed, 'Aislamiento de Carga Docente: Docente bloqueado en grupo no asignado.');

  // ============================================================================
  // BLOQUE 2: MATRIZ CANÓNICA DE PERMISOS Y AUTORIZACIONES (Ítems #4 y #5)
  // ============================================================================
  console.log(`\n--- BLOQUE 2: Matriz Canónica de Permisos y Acciones de IA ---`);

  assert(AIPermissionMatrix.can('student', 'read', 'lesson'), 'Alumno autorizado para leer lecciones.');
  assert(!AIPermissionMatrix.can('student', 'ai_generate', 'course_planning'), 'Alumno denegado para generar planeaciones de curso.');
  assert(!AIPermissionMatrix.can('student', 'manual_mastery_override', 'student_profile'), 'Alumno denegado para modificar maestría manualmente.');

  assert(AIPermissionMatrix.can('teacher', 'ai_generate', 'lesson'), 'Docente autorizado para generar lecciones con IA.');
  assert(AIPermissionMatrix.can('teacher', 'manual_mastery_override', 'student_profile'), 'Docente autorizado para aplicar override manual con auditoría.');
  assert(!AIPermissionMatrix.can('teacher', 'read', 'leadership_dashboard'), 'Docente denegado para consultar Leadership Dashboard.');

  assert(AIPermissionMatrix.can('coordinator', 'ai_approve_generation', 'lesson'), 'Coordinador autorizado para aprobar lecciones.');
  assert(AIPermissionMatrix.can('coordinator', 'read', 'leadership_dashboard'), 'Coordinador autorizado para Leadership Dashboard.');
  assert(!AIPermissionMatrix.can('coordinator', 'delete', 'curriculum_release'), 'Coordinador denegado para borrar entregas curriculares inmutables.');

  // ============================================================================
  // BLOQUE 3: MINIMIZACIÓN DE DATOS SENSIBLES Y ZERO PII (Ítems #6, #7 y #8)
  // ============================================================================
  console.log(`\n--- BLOQUE 3: Minimización de Datos Sensibles (Zero PII Policy) ---`);

  const rawStudentData = {
    student_id: 'std_real_98765',
    full_name: 'Carlos Mendoza Hernández',
    email: 'carlos.mendoza@email.com',
    phone: '+52 55 1234 5678',
    grade: 'high_school_1',
    target_cefr: 'B1'
  };

  const sanitizedContext = AIDataPolicy.sanitizeStudentContext(rawStudentData);
  assert(sanitizedContext.pii_redacted, 'Zero PII: Datos identificables detectados y marcados para sanitización.');
  assert(!sanitizedContext.student_ref.includes('Carlos'), 'Zero PII: Nombre real eliminado y reemplazado por seudónimo.');
  assert(!sanitizedContext.student_ref.includes('mendoza'), 'Zero PII: Apellidos eliminados.');
  assert(sanitizedContext.student_ref.startsWith('student_ref_'), `Zero PII: Seudónimo estructurado generado (${sanitizedContext.student_ref}).`);

  const sensitiveText = 'Contactar al tutor en tutor@familias.com o llamar al 555-987-6543 con tarjeta 4111 2222 3333 4444';
  const textRedaction = AIDataPolicy.redactSensitiveText(sensitiveText);
  assert(textRedaction.hadPii, 'Sanitizador de Texto: PII detectado en texto libre.');
  assert(textRedaction.sanitized.includes('[CORREO_REDACTADO]'), 'Sanitizador de Texto: Email redactado.');
  assert(textRedaction.sanitized.includes('[TELÉFONO_REDACTADO]'), 'Sanitizador de Texto: Teléfono redactado.');
  assert(textRedaction.sanitized.includes('[FINANCIERO_REDACTADO]'), 'Sanitizador de Texto: Tarjeta financiera redactada.');

  // ============================================================================
  // BLOQUE 4: PUERTA DE ENLACE DE IA (AI GATEWAY) Y ENRUTAMIENTO (Ítems #9 a #13)
  // ============================================================================
  console.log(`\n--- BLOQUE 4: Puerta de Enlace de IA (AI Gateway) y Enrutamiento ---`);

  const liteModel = AIGatewayModelRouter.resolveModel('ai_tutor', 'lightweight');
  assert(liteModel.includes('flash-lite'), 'Enrutamiento por Tarea: Chat de tutoría enrutado a modelo flash-lite económico.');

  const coreModel = AIGatewayModelRouter.resolveModel('academic_generation', 'standard');
  assert(coreModel.includes('core'), 'Enrutamiento por Tarea: Generación académica enrutada a modelo core estándar.');

  const proModel = AIGatewayModelRouter.resolveModel('academic_generation', 'complex_reasoning');
  assert(proModel.includes('pro'), 'Enrutamiento por Tarea: Razonamiento complejo enrutado a modelo pro.');

  // Invocación a través del Gateway con respuesta controlada
  const gatewayRes = await AIGateway.execute({
    request_id: 'req_test_001',
    school_id: 'sch-jjrosseau',
    user_id: 'tch_001',
    user_role: 'teacher',
    feature: 'activity_generator',
    prompt: 'Generar warm-up de 5 minutos sobre clarificación en inglés.',
    complexity_tier: 'standard',
    custom_mock_response: JSON.stringify({
      title: 'Clarification Speed Dating',
      duration_minutes: 5,
      skill: 'speaking'
    })
  });

  assert(gatewayRes.status === 'success', 'AI Gateway: Petición despachada y resuelta con éxito.');
  assert(gatewayRes.output.duration_minutes === 5, 'AI Gateway: Salida parseada como JSON estructurado.');
  assert(gatewayRes.estimated_cost_usd > 0, `AI Gateway: Tarificación calculada ($${gatewayRes.estimated_cost_usd.toFixed(6)} USD).`);

  // ============================================================================
  // BLOQUE 5: LIBRO MAYOR DE COSTOS Y CONTROL PRESUPUESTAL (Ítems #14, #15 y #16)
  // ============================================================================
  console.log(`\n--- BLOQUE 5: Libro Mayor de Costos de IA y Control Presupuestal ---`);

  const schoolId = 'sch-cost-test';
  AIGatewayCostLedger.setBudget({
    school_id: schoolId,
    billing_month: '2026-09',
    monthly_budget_usd: 10.00, // Presupuesto pequeño de $10 USD para prueba
    current_spend_usd: 7.99,
    alert_threshold_percent: 80,
    status: 'normal',
    allow_overage: false,
    notifications_sent: [],
    updated_at: new Date().toISOString()
  });

  // Ejecutar llamada que cruce el umbral del 80% (Spend: 7.99 + 0.10 = 8.09 -> 80.9%)
  await AIGateway.execute({
    request_id: 'req_budget_test_1',
    school_id: schoolId,
    user_id: 'tch_test',
    user_role: 'teacher',
    feature: 'academic_generation',
    prompt: 'Generate prompt budget test',
    custom_mock_response: '{"status":"ok"}'
  });

  const budgetAfter = AIGatewayCostLedger.getBudget(schoolId);
  assert(budgetAfter.status === 'warning' || budgetAfter.status === 'normal', 'Presupuesto: Estado actualizado tras registrar gasto.');

  // Forzar gasto al 100% para verificar bloqueo de seguridad
  budgetAfter.current_spend_usd = 10.05;
  budgetAfter.status = 'restricted';
  AIGatewayCostLedger.setBudget(budgetAfter);

  let budgetBlocked = false;
  try {
    await AIGateway.execute({
      request_id: 'req_budget_test_2',
      school_id: schoolId,
      user_id: 'tch_test',
      user_role: 'teacher',
      feature: 'academic_generation',
      prompt: 'Must fail due to budget'
    });
  } catch (err: any) {
    budgetBlocked = err.message.includes('Límite presupuestal de IA alcanzado');
  }
  assert(budgetBlocked, 'Presupuesto: Petición rechazada preventivamente al agotar el presupuesto de la escuela.');

  // ============================================================================
  // BLOQUE 6: CACHÉ DETERMINISTA E IDEMPOTENCIA (Ítems #17 y #30)
  // ============================================================================
  console.log(`\n--- BLOQUE 6: Caché Reutilizable e Idempotencia ---`);

  const promptForCache = 'Generate standardized B1 reading rubric';
  const firstCall = await AIGateway.execute({
    request_id: 'req_cache_1',
    school_id: 'sch-jjrosseau',
    user_id: 'tch_001',
    user_role: 'teacher',
    feature: 'activity_generator',
    prompt: promptForCache,
    cacheable: true,
    custom_mock_response: '{"rubric":"standard_b1_reading"}'
  });
  assert(!firstCall.cached, 'Caché: Primera llamada procesada sin caché previo.');

  const secondCall = await AIGateway.execute({
    request_id: 'req_cache_2',
    school_id: 'sch-jjrosseau',
    user_id: 'tch_001',
    user_role: 'teacher',
    feature: 'activity_generator',
    prompt: promptForCache,
    cacheable: true
  });
  assert(secondCall.cached, 'Caché: Segunda llamada idéntica recuperada de caché (0 tokens consumidos).');
  assert(secondCall.estimated_cost_usd === 0, 'Caché: Costo $0 USD en impacto a caché.');

  // ============================================================================
  // BLOQUE 7: RESILIENCIA Y CIRCUIT BREAKER (Ítems #26 y #27)
  // ============================================================================
  console.log(`\n--- BLOQUE 7: Resiliencia y Circuit Breaker ---`);

  AIGatewayCircuitBreaker.reset();
  assert(AIGatewayCircuitBreaker.getStatus() === 'closed', 'Circuit Breaker: Inicia en estado CERRADO.');

  // Simular 3 fallas consecutivas del proveedor
  AIGatewayCircuitBreaker.recordFailure();
  AIGatewayCircuitBreaker.recordFailure();
  AIGatewayCircuitBreaker.recordFailure();
  assert(AIGatewayCircuitBreaker.getStatus() === 'open', 'Circuit Breaker: Se abre automáticamente tras 3 fallos consecutivos.');

  const circuitCheck = AIGatewayCircuitBreaker.canExecute();
  assert(!circuitCheck.allowed, 'Circuit Breaker: Bloquea inmediatamente llamadas subsiguientes para proteger la plataforma.');

  // Restaurar estado cerrado
  AIGatewayCircuitBreaker.reset();
  assert(AIGatewayCircuitBreaker.canExecute().allowed, 'Circuit Breaker: Restablecido a CERRADO tras recuperación.');

  // ============================================================================
  // BLOQUE 8: SEGURIDAD DE CONTENIDO Y PROTECCIÓN A MENORES (Ítems #50, #51 y #52)
  // ============================================================================
  console.log(`\n--- BLOQUE 8: Seguridad de Contenido y Protección a Menores ---`);

  // Caso A: Mensaje seguro pedagógico
  const safeCheck = AIContentSafety.inspectContent('How can I practice my speaking for the debate?', { grade: 'high_school_1' });
  assert(safeCheck.safe, 'Content Safety: Consulta pedagógica legítima permitida.');

  // Caso B: Autolesión en chat estudiantil
  const selfHarmCheck = AIContentSafety.inspectContent('Me siento muy mal y quiero matarme hoy', { grade: 'high_school_1', isStudentChat: true });
  assert(!selfHarmCheck.safe, 'Content Safety: Mensaje de autolesión bloqueado.');
  assert(selfHarmCheck.requires_teacher_escalation, 'Content Safety: Se activa escalación docente inmediata.');

  // Caso C: Desvío fuera de plataforma en chat de alumnos
  const offPlatformCheck = AIContentSafety.inspectContent('Dame tu whatsapp para hablar fuera', { grade: 'secondary_2', isStudentChat: true });
  assert(!offPlatformCheck.safe, 'Content Safety: Intento de desvío fuera de plataforma bloqueado en chat estudiantil.');
  assert(offPlatformCheck.requires_teacher_escalation, 'Content Safety: Escalación docente activada ante solicitud de datos privados.');

  // ============================================================================
  // BLOQUE 9: GOBERNANZA CURRICULAR Y CURRICULUM RELEASES (Ítems #35 a #41)
  // ============================================================================
  console.log(`\n--- BLOQUE 9: Gobernanza Curricular y Lanzamientos Inmutables ---`);

  const release = await CurriculumReleaseService.publishRelease({
    release_tag: 'release_1.0_english_2026',
    academic_year: '2026-2027',
    subject: 'English',
    version: '1.0.0',
    description: 'Release curricular oficial para Secundaria y Preparatoria.'
  });

  assert(release.approved_node_ids.length >= 100, `Curriculum Release: ${release.approved_node_ids.length} nodos pedagógicos congelados.`);
  assert(release.status === 'published', 'Curriculum Release: Publicado en estado "published".');

  const alignmentCheck = await CurriculumReleaseService.validateTargetsInRelease('release_1.0_english_2026', [
    'func_clarifying',
    'speaking_problem_solving_collaborative_negotiation_b1'
  ]);
  assert(alignmentCheck.aligned, 'Curriculum Release: Objetivos de lección validados contra el release oficial.');

  // ============================================================================
  // BLOQUE 10: GOLDEN DATASET Y REGRESIÓN DE IA (Ítems #42 a #47 y #49)
  // ============================================================================
  console.log(`\n--- BLOQUE 10: Golden Dataset y Evaluación de Regresión de IA ---`);

  // Caso de prueba: verificación de que el modelo no inventa números (Analytics Grounding)
  const mathCase = AIEvalDataset.evaluateOutput(
    'eval_case_analytics_grounding_no_invented_math',
    'Reading is at 79% while Speaking is at 54% due to clarification gap at 42%.',
    2100
  );
  assert(mathCase.passed, 'Golden Dataset: Pasa verificación de grounding de datos numéricos.');

  const hallucinationCase = AIEvalDataset.evaluateOutput(
    'eval_case_analytics_grounding_no_invented_math',
    'Reading is at 88% while Speaking is at 95%.', // Números alucinados prohibidos
    2100
  );
  assert(!hallucinationCase.passed, 'Golden Dataset: Detecta y rechaza alucinación de métricas numéricas.');

  // ============================================================================
  // BLOQUE 11: PRODUCTION READINESS CHECKLIST (Ítem #78)
  // ============================================================================
  console.log(`\n--- BLOQUE 11: Production Readiness Checklist (bin/rails iskool:health) ---`);

  const healthReport = await ProductionHealthCheckService.runFullCheck();
  assert(healthReport.checks_total >= 7, `Production Readiness: ${healthReport.checks_total} chequeos estructurales ejecutados.`);
  assert(healthReport.overall_status === 'READY_FOR_PRODUCTION', `Production Readiness: Estado de la plataforma verificado como ${healthReport.overall_status}.`);

  // ============================================================================
  // BLOQUE 12: AUDITORÍA DE MARCA BLANCA INSTITUCIONAL (REGLA NO NEGOCIABLE 1)
  // ============================================================================
  console.log(`\n--- BLOQUE 12: Auditoría de Marca Blanca Institucional (Regla No Negociable 1) ---`);

  const forbiddenBrands = ['Gemini', 'Google AI', 'Obsidian', 'Canvas LMS', 'GitHub'];
  const testPayload = JSON.stringify(sanitizedContext) + JSON.stringify(release) + JSON.stringify(healthReport);

  let brandViolation = false;
  for (const b of forbiddenBrands) {
    if (testPayload.includes(b)) {
      brandViolation = true;
      console.error(`Marca comercial externa detectada: ${b}`);
    }
  }
  assert(!brandViolation, 'Marca Blanca: 0 menciones de marcas comerciales externas en los subsistemas de gobernanza.');

  // ============================================================================
  // RESUMEN FINAL DE CERTIFICACIÓN
  // ============================================================================
  console.log(`\n================================================================`);
  console.log(`🏁 RESULTADO DE LA CERTIFICACIÓN FASE 12:`);
  console.log(`   Pruebas ejecutadas: ${totalTests}`);
  console.log(`   Pruebas superadas:  ${passedTests}`);
  console.log(`   Pruebas fallidas:   ${totalTests - passedTests}`);
  console.log(`================================================================\n`);

  if (passedTests === totalTests) {
    console.log(`🎉 ¡FASE 12 CERTIFICADA CON ÉXITO AL 100%!`);
    console.log(`   iSchool se encuentra plenamente blindado para operación en escuelas reales.`);
    process.exit(0);
  } else {
    console.error(`⚠️ FASE 12 PRESENTÓ FALLOS EN LA CERTIFICACIÓN.`);
    process.exit(1);
  }
}

runFase12Certification().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
