/**
 * @file test_french_integration_12_fases.ts
 * @description Suite de Certificación de Integración de las 12 Fases para Francés en iSkool.
 * Verifica la emulación completa del modelo pedagógico, curricular, adaptativo y operativo
 * para el idioma francés, asegurando la preparación para la acreditación oficial DELF/DALF y SEP CENNI.
 */

import { IskoolCore } from '../src/lib/iskoolCore/orchestrator';
import { CourseQualityChecker } from '../src/lib/coursePlanning/courseQualityChecker';
import { CurriculumReleaseService } from '../src/lib/curriculumGovernance/releaseService';
import { AdaptiveLearningStore } from '../src/lib/adaptiveLearning/adaptiveStore';
import { AITutorStore } from '../src/lib/aiTutor/tutorStore';
import { TeacherCopilotStore } from '../src/lib/teacherCopilot/copilotStore';
import { AcademicAnalyticsQueryService } from '../src/lib/academicAnalytics/queryService';
import { AcademicAnalyticsCurriculumAnalytics } from '../src/lib/academicAnalytics/curriculumAnalytics';
import { CoordinatorCopilotBriefService } from '../src/lib/coordinatorCopilot/briefService';
import { AIGatewayCircuitBreaker } from '../src/lib/aiGateway/circuitBreaker';
import { TenantSecurityEnforcer } from '../src/lib/security/tenantScoping';
import { HealthCheckService } from '../src/lib/observability/healthCheckService';

interface TestResult {
  name: string;
  phase: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, phase: string, details?: string) {
  results.push({ name, phase, passed: condition, details });
  const icon = condition ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`  ${icon} ${phase}: ${name}`);
  if (!condition && details) {
    console.error(`      Detalles del fallo: ${details}`);
  }
}

async function runFrenchCertification() {
  console.log('================================================================');
  console.log('🇫🇷 iSchool — Certificación de Integración de las 12 Fases (Francés)');
  console.log('    Alineación Oficial: DELF / DALF & SEP CENNI México');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // FASES 1 & 2: BÓVEDA CURRICULAR Y GRAFO ACADÉMICO (FRANCÉS)
  // ---------------------------------------------------------------------------
  console.log('--- FASES 1 & 2: Bóveda Curricular y Grafo Académico en Francés ---');
  const frenchDocs = IskoolCore.Knowledge.loadVault('french');
  assert(frenchDocs.length >= 30, 'Bóveda de Francés cargada con éxito', 'Fases 1 & 2', `Nodos encontrados: ${frenchDocs.length}`);

  const frGraph = IskoolCore.Knowledge.buildGraph('french');
  const allFrNodes = frGraph.getAllNodes();
  assert(allFrNodes.length >= 30, 'Grafo Académico indexa los nodos de francés', 'Fases 1 & 2', `Nodos en grafo: ${allFrNodes.length}`);

  const cycles = frGraph.detectCycles();
  assert(cycles.length === 0, 'Topología del Grafo de Francés estrictamente libre de ciclos (DAG)', 'Fases 1 & 2', `Ciclos detectados: ${cycles.length}`);

  const sampleNode = frGraph.getNode('fr_gram_passe_compose_vs_imparfait_a2_b1');
  assert(sampleNode !== undefined && sampleNode.cefr.includes('B1'), 'Nodo clave de gramática francesa correctamente tipado y accesible', 'Fases 1 & 2');

  // ---------------------------------------------------------------------------
  // FASES 3, 4 & 5: MAPEO CURRICULAR Y ACREDITACIÓN CENNI / DELF
  // ---------------------------------------------------------------------------
  console.log('\n--- FASES 3, 4 & 5: Mapeo Curricular y Acreditación DELF / CENNI ---');
  const cenniMatrixDoc = frenchDocs.find(d => d.documentId === 'fr_framework_cenni_sep_matrix');
  assert(cenniMatrixDoc !== undefined, 'Matriz oficial de equivalencias SEP CENNI integrada', 'Fases 3, 4 & 5');

  const delfMatrixDoc = frenchDocs.find(d => d.documentId === 'fr_framework_delf_dalf_matrix');
  assert(delfMatrixDoc !== undefined, 'Marco de evaluación DELF/DALF (France Éducation International) integrado', 'Fases 3, 4 & 5');

  // ---------------------------------------------------------------------------
  // FASE 6: PLANIFICACIÓN DE CURSOS (40 SEMANAS) Y CURRICULUM RELEASE
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 6: Plan de Curso de Francés (40 Semanas, 160 Lecciones) ---');
  const frCourseResult = IskoolCore.Planning.generateCourse({
    subject: 'french',
    grade: 'high_school_1',
    entry_cefr: 'B1',
    target_cefr: 'B2',
    total_weeks: 40,
    sessions_per_week: 4,
    minutes_per_session: 50
  });

  assert(frCourseResult.units.length === 8, '8 Unidades temáticas DELF generadas', 'Fase 6', `Unidades: ${frCourseResult.units.length}`);
  assert(frCourseResult.lessons.length === 160, '160 Lecciones de francés planificadas a lo largo de 40 semanas', 'Fase 6', `Lecciones: ${frCourseResult.lessons.length}`);
  assert(frCourseResult.slots.length === 640, '640 Ranuras didácticas cronometradas (Warm-up, Core, Practice, Exit)', 'Fase 6', `Slots: ${frCourseResult.slots.length}`);

  // Quality Gates
  const quality = CourseQualityChecker.verify(
    frCourseResult.course,
    frCourseResult.units,
    frCourseResult.lessons,
    frCourseResult.assessments
  );
  assert(quality.passed, '10/10 Compuertas de Calidad Curricular aprobadas para el curso de francés', 'Fase 6', `Errores: ${quality.error_count}`);

  // Curriculum Release Inmutable
  const frRelease = await CurriculumReleaseService.publishRelease({
    release_tag: 'release_1.0_french_2026',
    academic_year: '2026-2027',
    subject: 'french',
    version: '1.0.0',
    description: 'Référentiel Pédagogique Officiel Français DELF/DALF & SEP CENNI'
  });
  assert(frRelease.status === 'published' && frRelease.approved_node_ids.length >= 30, 'Release curricular inmutable publicado con éxito para francés', 'Fase 6');

  // ---------------------------------------------------------------------------
  // FASE 7: APRENDIZAJE ADAPTATIVO EN FRANCÉS
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 7: Aprendizaje Adaptativo y Perfil de Maestría (Francés) ---');
  const studentFrId = 'std_francophone_01';
  const frEvidence = {
    student_id: studentFrId,
    knowledge_unit_id: 'fr_gram_passe_compose_vs_imparfait_a2_b1',
    knowledge_targets: ['fr_gram_passe_compose_vs_imparfait_a2_b1'],
    skill: 'grammar',
    score: 88,
    max_score: 100,
    evidence_type: 'oral_narrative_production',
    timestamp: new Date().toISOString()
  };

  const adaptiveResult = await IskoolCore.Adaptive.processEvidence(frEvidence);
  assert(adaptiveResult.updated_profile.student_id === studentFrId, 'Perfil adaptativo procesado con éxito para competencias en francés', 'Fase 7');
  assert(adaptiveResult.updated_competencies.length > 0, 'Matriz de competencias lingüísticas en francés actualizada acumulativamente', 'Fase 7');

  // ---------------------------------------------------------------------------
  // FASE 8: AI TUTOR CONVERSACIONAL SOCRÁTICO (EN FRANCÉS)
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 8: AI Tutor Conversacional Socrático en Francés ---');
  const tutorSession = await IskoolCore.Tutor.startSession({
    studentId: studentFrId,
    courseId: frCourseResult.course.id,
    lessonId: frCourseResult.lessons[0].id,
    primaryLearningOutcome: frCourseResult.lessons[0].primary_learning_outcome,
    knowledgeTargetIds: ['fr_gram_present_indicatif_a1']
  });
  assert(tutorSession.id !== undefined, 'Sesión de tutoría socrática iniciada en francés', 'Fase 8');

  const compsMap = new Map(adaptiveResult.updated_competencies.map(c => [c.knowledge_unit_id, c]));
  const tutorTurn = await IskoolCore.Tutor.processTurn(
    tutorSession,
    'Bonjour professeur, comment conjuguer le verbe parler au présent?',
    adaptiveResult.updated_profile,
    compsMap
  );
  const tutorMsg = tutorTurn.output?.student_message || (tutorTurn as any).assistant_message || '';
  assert(tutorMsg.length > 0, 'Respuesta pedagógica socrática generada con andamiaje en francés', 'Fase 8');

  // ---------------------------------------------------------------------------
  // FASE 9: TEACHER COPILOT PARA DOCENTES DE FRANCÉS (FLE)
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 9: Teacher Copilot y Orquestación Docente (FLE) ---');
  const teacherWorkspace = await IskoolCore.getTeacherWorkspace('prof_dupont', frCourseResult.course.id, {
    schoolId: 'sch_ecole_voltaire',
    groupId: 'groupe_terminale_a'
  });
  assert(teacherWorkspace.copilot_session !== undefined, 'Espacio de trabajo docente inicializado para Francés Lengua Extranjera', 'Fase 9');

  const intent = await IskoolCore.Copilot.resolveIntent('Préparer une tâche actionnelle pour le DELF B1 sur l\'écologie');
  assert(intent.intent !== undefined, 'Intención docente en francés resuelta por el copiloto', 'Fase 9');

  // ---------------------------------------------------------------------------
  // FASE 10: ANALÍTICA ACADÉMICA MULTILINGÜE
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 10: Academic Analytics Engine para Francés ---');
  const compsArray = Array.from(adaptiveResult.updated_competencies.values());
  const bottlenecks = AcademicAnalyticsCurriculumAnalytics.detectBottlenecks(compsArray, 60, 'french');
  assert(Array.isArray(bottlenecks), 'Análisis de cuellos de botella ejecutado sobre el currículo de francés', 'Fase 10');

  // ---------------------------------------------------------------------------
  // FASE 11: LEADERSHIP DASHBOARD & COORDINATOR COPILOT (LENGUAS)
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 11: Leadership Dashboard y Coordinación de Lenguas Extranjeras ---');
  const coordinatorCockpit = await IskoolCore.getCoordinatorCockpit('coord_langues_extranjeras', {
    schoolId: 'sch_ecole_voltaire',
    grade: 'high_school_1'
  });
  assert(coordinatorCockpit.daily_brief !== undefined, 'Daily Brief ejecutivo entregado con señales del departamento de francés', 'Fase 11');

  // ---------------------------------------------------------------------------
  // FASE 12: PRODUCCIÓN, GOBERNANZA DE IA Y CONTROL DE COSTOS
  // ---------------------------------------------------------------------------
  console.log('\n--- FASE 12: Gobernanza de IA, Pasarela y Control de Costos ---');
  const circuitBreakerState = AIGatewayCircuitBreaker.getState();
  assert(circuitBreakerState.toLowerCase() === 'closed', 'Circuit Breaker en estado CERRADO y operativo para inferencias de francés', 'Fase 12');

  const health = await HealthCheckService.performCheck();
  assert(health.overall_status === 'READY_FOR_PRODUCTION', 'Plataforma certificada 100% READY_FOR_PRODUCTION', 'Fase 12');

  // ---------------------------------------------------------------------------
  // SEGURIDAD MULTI-TENANT Y MARCA BLANCA
  // ---------------------------------------------------------------------------
  console.log('\n--- SEGURIDAD & MARCA BLANCA INSTITUCIONAL ---');
  let crossSchoolBlocked = false;
  try {
    TenantSecurityEnforcer.assertStudentAccess(
      { school_id: 'sch_ecole_voltaire', user_id: 'prof_dupont', role: 'teacher' },
      'std_other_school_99',
      'sch_lycee_paris'
    );
  } catch {
    crossSchoolBlocked = true;
  }
  assert(crossSchoolBlocked, 'Aislamiento estricto multi-tenant impide acceso entre colegios', 'Seguridad');

  const allCodeTerms = JSON.stringify(frCourseResult.course) + JSON.stringify(frRelease);
  const hasExternalBrand = /Gemini|Obsidian|GitHub|Canvas LMS/i.test(allCodeTerms);
  assert(!hasExternalBrand, 'Marca Blanca Institucional estricta (0 marcas comerciales externas)', 'Marca Blanca');

  // ---------------------------------------------------------------------------
  // BALANCE FINAL
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log('🏁 RESULTADO DE LA CERTIFICACIÓN DE FRANCÉS (12 FASES):');
  console.log(`   Pruebas ejecutadas: ${results.length}`);
  console.log(`   Pruebas superadas:  ${passedCount}`);
  console.log(`   Pruebas fallidas:   ${failedCount}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runFrenchCertification().catch(err => {
  console.error('Error durante la certificación de francés:', err);
  process.exit(1);
});
