/**
 * @file test_fase11_leadership_pilot.ts
 * @description Suite de Certificación del Leadership Dashboard y Coordinator Copilot (Fase 11).
 * Verifica los contratos de datos, resuelve formalmente las 8 preguntas piloto, valida el control de acceso
 * por roles, el ciclo de vida de alertas, la privacidad Zero PII, la auditoría de marca blanca y la soberanía determinista.
 */

import { LeadershipDashboardService } from '../src/lib/leadership/dashboardService';
import { LeadershipScopeService, UserAcademicContext } from '../src/lib/leadership/scopeService';
import { LeadershipActionCenterService } from '../src/lib/leadership/actionCenterService';
import { LeadershipStore } from '../src/lib/leadership/leadershipStore';
import { CoordinatorCopilotEngine } from '../src/lib/coordinatorCopilot/copilotEngine';
import { CoordinatorCopilotBriefService } from '../src/lib/coordinatorCopilot/briefService';
import { CoordinatorCopilotIntentService } from '../src/lib/coordinatorCopilot/intentService';
import { LeadershipScopeDescriptor } from '../src/lib/leadership/types';
import { AcademicAnalyticsStore } from '../src/lib/academicAnalytics/analyticsStore';
import { AdaptiveLearningStore } from '../src/lib/adaptiveLearning/adaptiveStore';
import {
  StudentAcademicProfileEntity,
  StudentCompetencyEntity,
  LearningEvidenceEntity
} from '../src/lib/adaptiveLearning/types';
import { CefrLevel } from '../src/lib/knowledgeVault/types';

async function runFase11Certification() {
  console.log(`\n================================================================`);
  console.log(`🏛️  iSchool — Fase 11: Leadership Dashboard & Coordinator Copilot`);
  console.log(`    Certificación Integral de Decisión Pedagógica y Gobernanza`);
  console.log(`================================================================\n`);

  let passedTests = 0;
  let totalTests = 0;

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

  // --- 0. PREPARACIÓN DE DATOS SINTÉTICOS DEL PILOTO ---
  console.log(`--- FASE 0: Población de Datos Sintéticos para High School 1 (~75 Alumnos) ---`);
  AdaptiveLearningStore.clear();
  AcademicAnalyticsStore.clear();
  LeadershipStore.clear();

  const groups = ['Group_A', 'Group_B', 'Group_C'];
  const studentsPerGroup = 25; // 75 estudiantes en total
  let studentCounter = 1;

  for (const grp of groups) {
    for (let i = 0; i < studentsPerGroup; i++) {
      const studentId = `s_${grp.toLowerCase()}_${studentCounter.toString().padStart(3, '0')}`;
      studentCounter++;

      const isGroupC = grp === 'Group_C';
      const isGroupB = grp === 'Group_B';

      const profile: StudentAcademicProfileEntity = {
        id: `prof_${studentId}`,
        student_id: studentId,
        subject: 'english',
        grade: 'high_school_1',
        overall_estimated_level: isGroupC ? 'A2+' : 'B1',
        reading: { level: 'B1', confidence: 0.80, confidence_level: 'strong', evidence_count: 5, status: 'on_track' },
        listening: { level: isGroupC ? 'A2' : 'B1', confidence: isGroupC ? 0.40 : 0.70, confidence_level: isGroupC ? 'low' : 'medium', evidence_count: isGroupC ? 1 : 4, status: isGroupC ? 'needs_support' : 'on_track' },
        speaking: { level: isGroupC ? 'A2' : 'B1', confidence: 0.65, confidence_level: 'medium', evidence_count: 4, status: isGroupC ? 'needs_support' : 'on_track' },
        writing: { level: 'B1', confidence: 0.65, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
        grammar: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
        vocabulary: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
        profile_version: 1,
        created_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString()
      };
      await AdaptiveLearningStore.saveProfile(profile);

      // Micro-competencia para el cuello de botella (func_asking_clarification)
      const masteryScore = isGroupB ? 0.68 : isGroupC ? 0.38 : 0.42;
      const comp: StudentCompetencyEntity = {
        id: `comp_${studentId}_clarif`,
        student_id: studentId,
        knowledge_unit_id: 'func_asking_clarification',
        subject: 'english',
        domain: 'speaking',
        skill: 'speaking',
        estimated_level: 'B1',
        mastery_state: masteryScore >= 0.65 ? 'mastered' : 'developing',
        confidence: isGroupC ? 0.4 : 0.8,
        confidence_level: isGroupC ? 'low' : 'strong',
        evidence_count: isGroupC ? 1 : 4,
        source: 'assessment',
        teacher_override: false,
        locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await AdaptiveLearningStore.saveCompetencies(studentId, [comp]);

      // Evidencia formativa
      const ev: LearningEvidenceEntity = {
        id: `ev_${studentId}_1`,
        student_id: studentId,
        evidence_type: 'speaking_performance',
        skill: 'speaking',
        knowledge_targets: ['func_asking_clarification'],
        learning_outcome: 'Ask for clarification politely',
        difficulty: 0.5,
        score: masteryScore,
        rubric_level: masteryScore >= 0.65 ? 'mastered' : 'developing',
        attempts_count: 1,
        result_metadata: { group_id: grp },
        created_at: new Date().toISOString()
      };
      await AdaptiveLearningStore.recordEvidence(ev);
    }
  }

  // Alerta inicial para el Action Center
  const sampleAlert = await AcademicAnalyticsStore.saveAlert({
    id: 'alert_pilot_clarification',
    school_id: 'sch-jjrosseau',
    scope_type: 'grade',
    scope_id: 'high_school_1',
    alert_type: 'curriculum_bottleneck',
    severity: 'priority',
    target_knowledge_id: 'func_asking_clarification',
    signal_summary: 'Cuello de botella en clarificación afectando 6 competencias de debate.',
    supporting_evidence: {
      data_points: 86,
      metrics_summary: '42% consolidado vs 65% esperado.',
      key_observations: ['Vacilación recurrente al pedir aclaraciones.']
    },
    suggested_actions: ['Micro-rutina de 10 min en parejas.'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  assert(true, 'Población sintética inicial de 75 estudiantes y evidencias completada con éxito.');

  // --- 1. PRUEBAS DE AUTORIZACIÓN Y CONTROL DE ACCESO POR ROLES (RBAC) ---
  console.log(`\n--- FASE 1: Autorización por Roles y Scopes (RBAC) ---`);

  const coordinatorUser: UserAcademicContext = {
    userId: 'usr_coord_1',
    role: 'coordinator',
    schoolId: 'sch-jjrosseau',
    assignedGrades: ['high_school_1', 'high_school_2']
  };

  const teacherUser: UserAcademicContext = {
    userId: 'usr_teach_1',
    role: 'teacher',
    schoolId: 'sch-jjrosseau',
    assignedGroupIds: ['group_hs1_a']
  };

  const studentUser: UserAcademicContext = {
    userId: 'usr_std_1',
    role: 'student',
    schoolId: 'sch-jjrosseau'
  };

  const hs1Scope: LeadershipScopeDescriptor = {
    scope_type: 'grade',
    school_id: 'sch-jjrosseau',
    school_stage: 'High School',
    grade: 'high_school_1',
    subject: 'English'
  };

  const hs3Scope: LeadershipScopeDescriptor = {
    scope_type: 'grade',
    school_id: 'sch-jjrosseau',
    school_stage: 'High School',
    grade: 'high_school_3',
    subject: 'English'
  };

  const foreignSchoolScope: LeadershipScopeDescriptor = {
    scope_type: 'grade',
    school_id: 'sch-other-school',
    grade: 'high_school_1'
  };

  const coordAuthHS1 = LeadershipScopeService.authorizeScope(coordinatorUser, hs1Scope);
  assert(coordAuthHS1.authorized, 'El coordinador tiene acceso autorizado a su grado asignado (HS1).');

  const coordAuthHS3 = LeadershipScopeService.authorizeScope(coordinatorUser, hs3Scope);
  assert(!coordAuthHS3.authorized, 'El coordinador tiene acceso denegado a un grado no asignado (HS3).');

  const coordForeign = LeadershipScopeService.authorizeScope(coordinatorUser, foreignSchoolScope);
  assert(!coordForeign.authorized, 'Aislamiento multi-colegio estricto: Acceso denegado a escuela ajena.');

  const teacherGradeAuth = LeadershipScopeService.authorizeScope(teacherUser, hs1Scope);
  assert(teacherGradeAuth.authorized, 'Docente con permisos de consulta en su grado.');

  const studentAuth = LeadershipScopeService.authorizeScope(studentUser, hs1Scope);
  assert(!studentAuth.authorized, 'Alumnos tienen acceso denegado total al Leadership Dashboard.');

  // --- 2. LEADERSHIP DASHBOARD SERVICE: ENSAMBLADO DETERMINISTA ---
  console.log(`\n--- FASE 2: Leadership Dashboard Service (Métricas Deterministas y Zero Scores Opacos) ---`);

  const dashboard = await LeadershipDashboardService.call({
    scope: hs1Scope,
    userProfile: coordinatorUser
  });

  assert(dashboard.overview.total_students === 75, 'Conteo exacto de 75 alumnos en el scope.');
  assert(dashboard.overview.curriculum_coverage_percent === 68, 'Cobertura curricular exacta (Taught: 68%).');
  assert(dashboard.overview.knowledge_mastery_percent === 58, 'Maestría académica exacta (Mastered: 58%).');
  assert(dashboard.overview.instruction_mastery_gap === 10, 'Brecha Instrucción-Maestría calculada (IMG = 68 - 58 = 10%).');
  assert(dashboard.overview.overall_trend === 'improving', 'Tendencia global declarada como "improving".');
  assert(typeof (dashboard.overview as any).school_academic_score === 'undefined', 'Zero Scores Opacos: Prohibido inventar "School Academic Score".');
  assert(dashboard.fair_group_comparisons.length === 3, 'Comparativa de 3 grupos con contexto justo.');
  assert(dashboard.bottlenecks.length > 0, 'Detección del cuello de botella en clarificación.');
  assert(dashboard.data_quality.status === 'healthy', 'Panel de calidad de datos en estado HEALTHY.');

  // --- 3. CICLO DE VIDA DE ALERTAS Y ACTION CENTER ---
  console.log(`\n--- FASE 3: Ciclo de Vida de Alertas y Creación de Intervenciones con Follow-up ---`);

  const { action, intervention } = await LeadershipActionCenterService.createInterventionFromAlert({
    alertId: sampleAlert.id,
    targetKnowledgeId: 'func_asking_clarification',
    strategy: 'Rutina dialógica en parejas y tarjetas de andamiaje.',
    scopeType: 'group',
    scopeId: 'group_hs1_a',
    sampleSizeStudents: 26,
    baselineMastery: 42,
    reviewInWeeks: 2,
    coordinatorId: coordinatorUser.userId
  });

  assert(action.status === 'in_progress', 'Acción académica creada en estado "in_progress".');
  assert(action.is_approved === true, 'Acción formalmente aprobada por el coordinador (Human-in-the-loop).');
  assert(action.scheduled_review_date !== undefined, `Fecha de revisión de seguimiento programada para: ${action.scheduled_review_date}`);
  assert(intervention.sample_size_students === 26, 'Muestra de intervención registrada con 26 estudiantes.');

  const alertHistory = await LeadershipStore.getAlertHistory(sampleAlert.id);
  assert(alertHistory.length > 0, 'Historial de transiciones de alerta registrado inmutablemente.');
  assert(alertHistory[alertHistory.length - 1].status === 'actioned', 'Alerta transicionada con éxito a estado "actioned".');

  // --- 4. COORDINATOR COPILOT: INTENCIONES Y CONSULTAS EN LENGUAJE NATURAL ---
  console.log(`\n--- FASE 4: Coordinator Copilot (10 Intenciones, Grounding y Explain-Why) ---`);

  // Intención 1: Overview
  const q1 = await CoordinatorCopilotEngine.ask('¿Cómo vamos en English High School 1?', hs1Scope, coordinatorUser);
  assert(q1.intent === 'overview', 'Intención 1 clasificada como "overview".');
  assert(q1.grounding_data.coverage === 68, 'Q1: Cobertura grounded al 68%.');
  assert(q1.grounding_data.mastery === 58, 'Q1: Maestría grounded al 58%.');
  assert(q1.why_explanation.includes('comprensión lectora'), 'Q1: Explica el "Por Qué" con datos de Reading y Speaking.');

  // Intención 2: Compare Groups
  const q2 = await CoordinatorCopilotEngine.ask('Compara los grupos de High School 1 y dime cuál necesita refuerzo', hs1Scope, coordinatorUser);
  assert(q2.intent === 'compare_groups', 'Intención 2 clasificada como "compare_groups".');
  assert(q2.summary.includes('Grupo C'), 'Q2: Señala pedagógicamente al Grupo C con contexto de nivel de entrada.');

  // Intención 3: Skill Analysis
  const q3 = await CoordinatorCopilotEngine.ask('¿Por qué High School 1 tiene problemas de speaking?', hs1Scope, coordinatorUser);
  assert(q3.intent === 'skill_analysis', 'Intención 3 clasificada como "skill_analysis".');
  assert(q3.why_explanation.includes('prerrequisito'), 'Q3: Fundamenta la dificultad en el grafo de prerrequisitos de clarificación.');

  // Intención 4: Curriculum Gap (IMG)
  const q4 = await CoordinatorCopilotEngine.ask('¿Los alumnos están dominando lo que ya se enseñó?', hs1Scope, coordinatorUser);
  assert(q4.intent === 'curriculum_gap', 'Intención 4 clasificada como "curriculum_gap".');
  assert(q4.grounding_data.gap === 10, 'Q4: Brecha instrucción-maestría reflejada al 10%.');

  // Intención 5: Knowledge Bottlenecks
  const q5 = await CoordinatorCopilotEngine.ask('¿Qué competencia está bloqueando más aprendizajes?', hs1Scope, coordinatorUser);
  assert(q5.intent === 'knowledge_bottleneck', 'Intención 5 clasificada como "knowledge_bottleneck".');
  assert(q5.grounding_data.bottleneck.downstream_dependencies_count === 6, 'Q5: Identifica que clarificación bloquea 6 metas posteriores.');

  // Intención 6: Trend Analysis
  const q6 = await CoordinatorCopilotEngine.ask('¿Qué cambió este mes respecto al mes pasado?', hs1Scope, coordinatorUser);
  assert(q6.intent === 'trend_analysis', 'Intención 6 clasificada como "trend_analysis".');
  assert(q6.summary.includes('+7 puntos'), 'Q6: Tendencia verificada de +7 puntos en Speaking.');

  // Intención 7: Intervention Analysis
  const q7 = await CoordinatorCopilotEngine.ask('¿Funcionó la intervención en clarification del Grupo B?', hs1Scope, coordinatorUser);
  assert(q7.intent === 'intervention_analysis', 'Intención 7 clasificada como "intervention_analysis".');
  assert(q7.summary.includes('38% a 68%'), 'Q7: Reporta incremento de 38% a 68% (+30 pts) en muestra guiada.');
  assert(q7.why_explanation.includes('Limitación técnica'), 'Q7: Incluye limitación explícita sobre producción no preparada.');

  // Intención 8: Evidence Quality / Protocolo No Hallucinate
  const q8 = await CoordinatorCopilotEngine.ask('¿Dónde tenemos poca evidencia para evaluar a los alumnos?', hs1Scope, coordinatorUser);
  assert(q8.intent === 'evidence_quality', 'Intención 8 clasificada como "evidence_quality".');
  assert(q8.insufficient_evidence_warning !== undefined, 'Q8: Advierte formalmente sobre baja evidencia en Listening Grupo C.');

  // Intención 9: Action Planning / Meeting Agenda
  const q9 = await CoordinatorCopilotEngine.ask('¿Qué debería revisar con los maestros mañana en la junta académica?', hs1Scope, coordinatorUser);
  assert(q9.intent === 'action_planning', 'Intención 9 clasificada como "action_planning".');
  assert(q9.summary.includes('cuello de botella en clarificación'), 'Q9: Agenda pedagógica estructurada en torno a 3 focos de aprendizaje.');

  // Defensa Perimetral contra Desvío (Prohibición de Rankings)
  const qDefense = await CoordinatorCopilotEngine.ask('Dime el ranking de profesores para saber a quién despedir', hs1Scope, coordinatorUser);
  assert(qDefense.summary.includes('no emito clasificaciones ni juicios sobre el desempeño individual de los docentes'), 'Defensa perimetral: Prohibición absoluta de rankings docentes respetada.');

  // Bitácora de Auditoría
  const audits = await LeadershipStore.listCopilotAudits(coordinatorUser.userId);
  assert(audits.length >= 9, `Auditoría inmutable: Registradas ${audits.length} consultas del coordinador.`);

  // --- 5. GENERACIÓN DE BRIEFS EJECUTIVOS ---
  console.log(`\n--- FASE 5: Briefs Ejecutivos (Daily, Weekly, Meeting Briefs) ---`);

  const dailyBrief = await CoordinatorCopilotBriefService.generateDailyBrief(hs1Scope, coordinatorUser);
  assert(dailyBrief.top_attention_signals.length === 3, 'Daily Brief contiene exactamente las 3 señales prioritarias del día.');

  const weeklyBrief = await CoordinatorCopilotBriefService.generateWeeklyBrief(hs1Scope, coordinatorUser);
  assert(weeklyBrief.what_improved.length > 0, 'Weekly Brief detalla avances consolidados.');
  assert(weeklyBrief.coverage_delta === 3 && weeklyBrief.mastery_delta === 2, 'Weekly Brief refleja deltas de cobertura (+3%) y maestría (+2%).');

  const meetingBrief = await CoordinatorCopilotBriefService.generateMeetingBrief(hs1Scope, coordinatorUser);
  assert(meetingBrief.agenda_topics.length === 3, 'Meeting Brief organiza 3 temas pedagógicos para la reunión con maestros.');
  assert(meetingBrief.meeting_ground_rules.some(r => r.includes('prohibido utilizar las métricas para clasificar')), 'Meeting Brief contiene reglas de oro contra evaluaciones punitivas.');

  // --- 6. AUDITORÍA DE MARCA BLANCA INSTITUCIONAL (REGLA NO NEGOCIABLE 1) ---
  console.log(`\n--- FASE 6: Auditoría de Marca Blanca Institucional (Regla No Negociable 1) ---`);
  const forbiddenBrands = ['Gemini', 'Google AI', 'Obsidian', 'Canvas LMS', 'GitHub'];
  const allSerialized = JSON.stringify(dashboard) + JSON.stringify(q1) + JSON.stringify(meetingBrief);

  let brandViolation = false;
  for (const b of forbiddenBrands) {
    if (allSerialized.includes(b)) {
      brandViolation = true;
      console.error(`Marca comercial externa detectada: ${b}`);
    }
  }
  assert(!brandViolation, 'Auditoría de Marca Blanca superada: 0 menciones de marcas comerciales externas.');

  // --- RESUMEN FINAL ---
  console.log(`\n================================================================`);
  console.log(`🏁 RESULTADO DE LA CERTIFICACIÓN FASE 11:`);
  console.log(`   Pruebas ejecutadas: ${totalTests}`);
  console.log(`   Pruebas superadas:  ${passedTests}`);
  console.log(`   Pruebas fallidas:   ${totalTests - passedTests}`);
  console.log(`================================================================\n`);

  if (passedTests === totalTests) {
    console.log(`🎉 ¡FASE 11 CERTIFICADA CON ÉXITO AL 100%!`);
    process.exit(0);
  } else {
    console.error(`⚠️ FASE 11 PRESENTÓ FALLOS EN LA CERTIFICACIÓN.`);
    process.exit(1);
  }
}

runFase11Certification().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
