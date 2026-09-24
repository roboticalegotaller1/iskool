/**
 * @file orchestrator.ts
 * @description Orquestador Central Unificado del Ecosistema iSchool (IskoolCore).
 * Integra de forma cohesiva las 12 Fases pedagógicas, operativas y de gobierno:
 * 1-5. Bóveda Curricular y Grafo Académico
 * 6. Course Planning Layer (40 Semanas, 160 Lecciones)
 * 7. Adaptive Learning & Mastery Engine
 * 8. AI Tutor Conversacional Socrático
 * 9. Teacher Copilot & Classroom Orchestration
 * 10. Academic Analytics Engine
 * 11. Leadership Dashboard & Coordinator Copilot
 * 12. Production Readiness, AI Gateway & Cost Ledger
 */

import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';
import { CurriculumReleaseService } from '../curriculumGovernance/releaseService';
import { CourseGenerator, CourseGeneratorParams } from '../coursePlanning/courseGenerator';
import { CourseQualityChecker } from '../coursePlanning/courseQualityChecker';
import { AdaptiveLearningMasteryEngine } from '../adaptiveLearning/masteryEngine';
import { AdaptiveLearningNextActionService } from '../adaptiveLearning/nextActionService';
import { AdaptiveLearningStore } from '../adaptiveLearning/adaptiveStore';
import { AITutorEngine } from '../aiTutor/tutorEngine';
import { AITutorStore } from '../aiTutor/tutorStore';
import { TeacherCopilotIntentService } from '../teacherCopilot/intentService';
import { TeacherCopilotEngine } from '../teacherCopilot/copilotEngine';
import { TeacherCopilotStore } from '../teacherCopilot/copilotStore';
import { AcademicAnalyticsQueryService, AnalyticsQueryParams } from '../academicAnalytics/queryService';
import { AcademicAnalyticsStore } from '../academicAnalytics/analyticsStore';
import { LeadershipDashboardService } from '../leadership/dashboardService';
import { CoordinatorCopilotEngine } from '../coordinatorCopilot/copilotEngine';
import { CoordinatorCopilotBriefService } from '../coordinatorCopilot/briefService';
import { AIGateway } from '../aiGateway/gateway';
import { AIGatewayCostLedger } from '../aiGateway/costLedger';
import { AIGatewayCircuitBreaker } from '../aiGateway/circuitBreaker';
import { AIDataPolicy } from '../aiGovernance/dataPolicy';
import { AIContentSafety } from '../aiGovernance/contentSafety';
import { AIPromptRegistry } from '../aiGovernance/promptRegistry';
import { TenantSecurityEnforcer, SecurityUserContext } from '../security/tenantScoping';
import { AIPermissionMatrix } from '../security/permissionMatrix';
import { HealthCheckService } from '../observability/healthCheckService';
import { InputSanitizer } from '../security/inputSanitizer';
import { LeadershipScopeDescriptor } from '../leadership/types';
import { UserAcademicContext } from '../leadership/scopeService';
import { AIGatewayResponse } from '../aiGateway/types';

export interface IskoolSessionContext {
  schoolId: string;
  userId: string;
  role: 'student' | 'teacher' | 'coordinator' | 'academic_director' | 'administrator' | 'superadmin';
  assignedGrades?: string[];
  grade?: string;
}

export class IskoolCore {
  // =========================================================================
  // MÉTODOS UNIFICADOS DE ALTO NIVEL (PATRÓN FACADE CANÓNICO)
  // =========================================================================

  /**
   * 1. IskoolCore.getStudentSession(studentId, options)
   * Consolida la experiencia del estudiante: perfil adaptativo, competencias,
   * siguiente acción pedagógica recomendada y diagnóstico adaptativo.
   */
  static async getStudentSession(
    studentId: string,
    options?: { grade?: string; courseId?: string; targetKnowledgeId?: string }
  ) {
    const grade = options?.grade || 'high_school_1';
    const profile = await this.Adaptive.getProfile(studentId, grade);
    const competenciesMap = await this.Adaptive.getCompetenciesMap(studentId);

    const currentTarget = options?.targetKnowledgeId ||
      profile.mastery_history?.[0]?.concept_id ||
      'node_hs1_spk_opinion_01';

    const nextAction = await this.Adaptive.diagnoseStudent(
      studentId,
      currentTarget,
      profile.priority_focus_targets || [],
      competenciesMap
    );

    return {
      student_id: studentId,
      grade,
      profile,
      competencies: Object.fromEntries(competenciesMap.entries()),
      current_target: currentTarget,
      next_action: nextAction
    };
  }

  /**
   * 2. IskoolCore.getTeacherWorkspace(teacherId, courseId, options)
   * Consolida el espacio de trabajo docente: release curricular oficial, analítica
   * de avance del grupo, sesión de Teacher Copilot y artefactos en estado borrador.
   */
  static async getTeacherWorkspace(
    teacherId: string,
    courseId: string,
    options?: { groupId?: string; schoolId?: string }
  ) {
    const schoolId = options?.schoolId || 'sch-jjrosseau';
    const groupId = options?.groupId || 'group_hs1_a';

    const release = await this.Knowledge.getRelease('release_1.0_english_2026');

    const groupAnalytics = await this.Analytics.query({
      metric: 'executive_summary',
      scopeType: 'group',
      scopeId: groupId
    });

    const sessionId = `copilot_sess_${teacherId}_${courseId}`;
    let copilotSession = await TeacherCopilotStore.getSession(sessionId);
    if (!copilotSession) {
      copilotSession = {
        id: sessionId,
        teacher_id: teacherId,
        school_id: schoolId,
        course_id: courseId,
        group_id: groupId,
        title: `Workspace Docente - ${courseId}`,
        status: 'active',
        constraints: {
          class_size: 25,
          available_technology: 'projector_only',
          pair_work_allowed: true,
          group_work_allowed: true,
          printing_available: false,
          internet_available: true,
          projector_available: true,
          time_available_minutes: 50
        },
        preferences: {
          preferred_lesson_style: 'communicative',
          grouping_preference: 'similar_need',
          language_policy: 'mostly_target_language',
          assessment_style: 'formative_frequent'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await TeacherCopilotStore.saveSession(copilotSession);
    }

    const artifacts = await TeacherCopilotStore.getArtifactsBySession(sessionId);

    return {
      teacher_id: teacherId,
      course_id: courseId,
      school_id: schoolId,
      group_id: groupId,
      release_info: release,
      group_analytics: groupAnalytics,
      copilot_session: copilotSession,
      draft_artifacts: artifacts.filter(a => a.status === 'draft')
    };
  }

  /**
   * 3. IskoolCore.getCoordinatorCockpit(schoolId, grade, userProfile)
   * Cabina de mando para coordinadores y directores:
   * Métricas directivas, Daily Brief, señales prioritarias, salud del sistema y presupuesto IA.
   */
  static async getCoordinatorCockpit(
    schoolId: string,
    grade: string,
    userProfile?: any
  ) {
    const user: UserAcademicContext = userProfile || {
      userId: 'coord_sys',
      role: 'coordinator',
      schoolId: schoolId,
      assignedGrades: [grade]
    };

    const scope: LeadershipScopeDescriptor = {
      scope_type: 'grade',
      school_id: schoolId,
      grade,
      subject: 'english'
    };

    const [dashboardMetrics, dailyBrief, healthReport, budget] = await Promise.all([
      this.Leadership.getDashboardMetrics({ scope, userProfile: user }),
      this.Leadership.getDailyBrief(scope, user),
      this.Health.runFullCheck(),
      this.Gateway.getSchoolBudget(schoolId)
    ]);

    return {
      school_id: schoolId,
      grade,
      overview: dashboardMetrics.overview,
      daily_brief: dailyBrief,
      priority_signals: dashboardMetrics.priority_signals,
      what_changed: dashboardMetrics.what_changed,
      ai_budget: budget,
      system_readiness: healthReport.overall_status
    };
  }

  /**
   * 4. IskoolCore.dispatchAIOperation(request)
   * Despacho universal gobernado de operaciones de IA: sanitización, Circuit Breaker,
   * presupuesto y caché multinivel (L1 memoria / L2 Supabase).
   */
  static async dispatchAIOperation<T = any>(
    request: Parameters<typeof AIGateway.execute>[0]
  ): Promise<AIGatewayResponse<T>> {
    const sanitized = InputSanitizer.sanitizeText(request.prompt);
    const cleanRequest = {
      ...request,
      prompt: sanitized.cleanText
    };

    return this.Gateway.execute(cleanRequest) as Promise<AIGatewayResponse<T>>;
  }

  // =========================================================================
  // SUB-FACHADAS MODULARES ESPECIALIZADAS (FASES 1 A 12)
  // =========================================================================

  // 1. Capa Curricular y de Bóveda (Fases 1, 2, 4, 5)
  static readonly Knowledge = {
    loadVault: (language?: 'english' | 'french' | 'all') => KnowledgeVaultLoader.loadAll(undefined, language),
    buildGraph: (language?: 'english' | 'french' | 'all') => AcademicGraph.build(KnowledgeVaultLoader.loadAll(undefined, language)),
    getRelease: (tag: string) => CurriculumReleaseService.getRelease(tag),
    publishRelease: (params: Parameters<typeof CurriculumReleaseService.publishRelease>[0]) =>
      CurriculumReleaseService.publishRelease(params),
    validateTargetsInRelease: (releaseTag: string, targets: string[]) =>
      CurriculumReleaseService.validateTargetsInRelease(releaseTag, targets)
  };

  // 2. Capa de Planificación Anual (Fase 6)
  static readonly Planning = {
    generateCourse: (params: CourseGeneratorParams) =>
      CourseGenerator.generateCourse(params),
    checkQuality: (coursePlan: any, grade: string) =>
      CourseQualityChecker.checkQualityGates(coursePlan, grade)
  };

  // 3. Capa de Aprendizaje Adaptativo (Fase 7)
  static readonly Adaptive = {
    getProfile: (studentId: string, grade?: string) =>
      AdaptiveLearningStore.getProfile(studentId, grade),
    saveProfile: (profile: Parameters<typeof AdaptiveLearningStore.saveProfile>[0]) =>
      AdaptiveLearningStore.saveProfile(profile),
    getCompetenciesMap: (studentId: string) =>
      AdaptiveLearningStore.getCompetencies(studentId),
    diagnoseStudent: (
      studentId: string,
      currentTarget: string,
      priorities: any[],
      comps: any
    ) => AdaptiveLearningNextActionService.call(studentId, currentTarget, priorities, comps),
    processEvidence: async (evidence: any) => {
      const profile = await AdaptiveLearningStore.getProfile(evidence.student_id);
      const compsMap = await AdaptiveLearningStore.getCompetencies(evidence.student_id);
      const result = AdaptiveLearningMasteryEngine.call(profile, compsMap, evidence);
      await AdaptiveLearningStore.saveProfile(result.updated_profile);
      await AdaptiveLearningStore.saveCompetencies(evidence.student_id, result.updated_competencies);
      return result;
    }
  };

  // 4. Capa de Tutoría Conversacional (Fase 8)
  static readonly Tutor = {
    startSession: (params: Parameters<typeof AITutorEngine.startSession>[0]) =>
      AITutorEngine.startSession(params),
    processTurn: async (
      session: Parameters<typeof AITutorEngine.processTurn>[0],
      rawInput: string,
      profile: Parameters<typeof AITutorEngine.processTurn>[2],
      comps: Parameters<typeof AITutorEngine.processTurn>[3]
    ) => {
      const sanitized = InputSanitizer.sanitizeText(rawInput);
      return AITutorEngine.processTurn(session, sanitized.cleanText, profile, comps);
    },
    saveSession: (session: Parameters<typeof AITutorStore.saveSession>[0]) =>
      AITutorStore.saveSession(session),
    getSession: (sessionId: string) =>
      AITutorStore.getSession(sessionId)
  };

  // 5. Capa de Copiloto Docente (Fase 9)
  static readonly Copilot = {
    resolveIntent: (rawRequest: string) => {
      const sanitized = InputSanitizer.sanitizeText(rawRequest);
      return TeacherCopilotIntentService.resolve(sanitized.cleanText);
    },
    processRequest: async (
      sessionId: string,
      rawRequest: string
    ) => {
      const sanitized = InputSanitizer.sanitizeText(rawRequest);
      return TeacherCopilotEngine.processRequest(sessionId, sanitized.cleanText);
    },
    getArtifact: (id: string) =>
      TeacherCopilotStore.getArtifact(id),
    saveArtifact: (artifact: Parameters<typeof TeacherCopilotStore.saveArtifact>[0]) =>
      TeacherCopilotStore.saveArtifact(artifact)
  };

  // 6. Capa de Analítica Académica (Fase 10)
  static readonly Analytics = {
    query: (params: AnalyticsQueryParams) =>
      AcademicAnalyticsQueryService.query(params),
    getSnapshot: (id: string) =>
      AcademicAnalyticsStore.getSnapshot(id),
    saveSnapshot: (snapshot: Parameters<typeof AcademicAnalyticsStore.saveSnapshot>[0]) =>
      AcademicAnalyticsStore.saveSnapshot(snapshot)
  };

  // 7. Capa de Liderazgo y Coordinación (Fase 11)
  static readonly Leadership = {
    getDashboardMetrics: (params: Parameters<typeof LeadershipDashboardService.call>[0]) =>
      LeadershipDashboardService.call(params),
    askCoordinatorCopilot: (query: string, scope: any, user: any) => {
      const sanitized = InputSanitizer.sanitizeText(query);
      return CoordinatorCopilotEngine.ask(sanitized.cleanText, scope, user);
    },
    getDailyBrief: (scopeOrSchoolId: any, userOrGrade?: any) => {
      let scope: any;
      let user: any;
      if (typeof scopeOrSchoolId === 'string') {
        const schoolId = scopeOrSchoolId;
        const grade = typeof userOrGrade === 'string' ? userOrGrade : 'high_school_1';
        scope = { scope_type: 'grade', school_id: schoolId, grade, subject: 'english' };
        user = { userId: 'coord_sys', role: 'coordinator', schoolId: schoolId, school_id: schoolId, assignedGrades: [grade], assigned_grades: [grade] };
      } else {
        scope = scopeOrSchoolId;
        user = userOrGrade || { userId: 'coord_sys', role: 'coordinator', schoolId: scope.school_id, school_id: scope.school_id, assignedGrades: scope.grade ? [scope.grade] : [] };
      }
      return CoordinatorCopilotBriefService.generateDailyBrief(scope, user);
    },
    getWeeklyBrief: (scopeOrSchoolId: any, userOrGrade?: any) => {
      let scope: any;
      let user: any;
      if (typeof scopeOrSchoolId === 'string') {
        const schoolId = scopeOrSchoolId;
        const grade = typeof userOrGrade === 'string' ? userOrGrade : 'high_school_1';
        scope = { scope_type: 'grade', school_id: schoolId, grade, subject: 'english' };
        user = { userId: 'coord_sys', role: 'coordinator', schoolId: schoolId, school_id: schoolId, assignedGrades: [grade], assigned_grades: [grade] };
      } else {
        scope = scopeOrSchoolId;
        user = userOrGrade || { userId: 'coord_sys', role: 'coordinator', schoolId: scope.school_id, school_id: scope.school_id, assignedGrades: scope.grade ? [scope.grade] : [] };
      }
      return CoordinatorCopilotBriefService.generateWeeklyBrief(scope, user);
    }
  };

  // 8. Capa de Puerta de Enlace de IA y Gobernanza (Fase 12)
  static readonly Gateway = {
    execute: (request: Parameters<typeof AIGateway.execute>[0]) =>
      AIGateway.execute(request),
    getSchoolBudget: (schoolId: string) =>
      AIGatewayCostLedger.getSchoolBudget(schoolId),
    getMonthlySpend: (schoolId: string, month: string) =>
      AIGatewayCostLedger.getMonthlySpend(schoolId, month),
    getCircuitBreakerStatus: () =>
      AIGatewayCircuitBreaker.getStatus(),
    sanitizeStudentContext: (data: Parameters<typeof AIDataPolicy.sanitizeStudentContext>[0]) =>
      AIDataPolicy.sanitizeStudentContext(data),
    inspectContentSafety: (content: string, options?: Parameters<typeof AIContentSafety.inspectContent>[1]) =>
      AIContentSafety.inspectContent(content, options || { grade: 'high_school_1' }),
    getPrompt: (id: string, version?: string) =>
      AIPromptRegistry.get(id, version)
  };

  // 9. Capa de Seguridad y Permisos
  static readonly Security = {
    can: (role: string, action: string, resource: string) =>
      AIPermissionMatrix.can(role as any, action as any, resource as any),
    enforceSchoolScope: (user: SecurityUserContext, targetSchoolId: string, action: string) =>
      TenantSecurityEnforcer.enforceSchoolScope(user, targetSchoolId, action),
    enforceStudentSelfAccess: (user: SecurityUserContext, targetStudentId: string) =>
      TenantSecurityEnforcer.enforceStudentSelfAccess(user, targetStudentId),
    enforceTeacherGroupAccess: (user: SecurityUserContext, targetGroupId: string) =>
      TenantSecurityEnforcer.enforceTeacherGroupAccess(user, targetGroupId)
  };

  // 10. Diagnóstico y Salud Operativa de Producción
  static readonly Health = {
    runFullCheck: () => HealthCheckService.runFullCheck()
  };
}
