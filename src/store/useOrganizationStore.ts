import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import {
  CampusScheduleConfig,
  OrgHierarchyEdge,
  OrgNodeSubRole,
  OrgPermissions,
  OrgSeatNode,
  SchoolOrganizationGraph,
  TeacherSubjectAssignment,
  TimetablePlacement,
  VibratoryProtocolAlert,
  WeekdayKey,
  WorkDaysMode,
  applyNodeConfigurationUpdate,
  autoOrganizeOrgNodes,
  buildDynamicSlaDelegatesFromGraph,
  calculateConsolidatedPayrollSummary,
  createEmptyOrganizationGraph,
  createDemoSchoolOrganizationGraph,
  createInitialSeatNode,
  getFullNameOfNode,
  isStaleDemoOrgGraph,
  isSuperiorInOrgChart,
  normalizeOrgSchoolId,
  regenerateNodePassword,
  rotateFirstLoginPassword,
  verifyOrgPassword,
  wouldCreateHierarchyCycle,
} from '@/lib/services/organizationService';
import { useSchoolAdminStore } from './useSchoolAdminStore';
import { UserProfile, UserRole, isPlatformSuperUser } from '@/types';

const ORG_CHANNEL_NAME = 'iskool_org_realtime_v1';
const EXECUTIVE_ORG_ROLES = new Set(['superadmin', 'director', 'admin', 'owner', 'ceo']);

function getActiveClientSessionUser(): Partial<UserProfile> | null {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('iskool_active_session_v2');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Partial<UserProfile>) : null;
  } catch {
    return null;
  }
}

function isSessionAuthorizedForOrgSchool(schoolId: string): boolean {
  const sessionUser = getActiveClientSessionUser();
  if (!sessionUser) return true;
  const roleLower = String(sessionUser.role || '').toLowerCase();
  if (roleLower && !EXECUTIVE_ORG_ROLES.has(roleLower)) {
    return false;
  }
  if (isPlatformSuperUser(sessionUser)) {
    return true;
  }
  const userSchool = sessionUser.school_id ? normalizeOrgSchoolId(sessionUser.school_id) : '';
  if (!userSchool) return false;
  return userSchool === normalizeOrgSchoolId(schoolId);
}

function broadcastOrgUpdate(payload: any) {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(ORG_CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch {
    // Ignore BroadcastChannel errors in restricted browsers
  }
}

function mapNodeToUserRole(node: OrgSeatNode): UserRole {
  if (node.nodeId === 'demo-ceo-01' || (node.username || '').trim().toLowerCase() === 'demo.ceo@iskool.mx') {
    return 'ceo';
  }
  if (node.category === 'profesor') return 'teacher';
  if (node.subRole === 'director_general') return 'director';
  if (node.subRole === 'finanzas') return 'billing';
  return 'coordinator';
}

function syncGraphToServerAndAdminStore(
  rawSchoolId: string,
  graph: SchoolOrganizationGraph,
  options?: { skipServerPost?: boolean; skipBroadcast?: boolean }
) {
  const schoolId = normalizeOrgSchoolId(rawSchoolId || graph?.schoolId);
  // 1. Sincronizar hacia useSchoolAdminStore de forma hermética por schoolId (CERO contaminación entre colegios o CEOs)
  try {
    const adminState = useSchoolAdminStore.getState();
    const allOrgNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
    const payrollSummary = calculateConsolidatedPayrollSummary(graph);

    const activeOrgUserIds = new Set(
      allOrgNodes.map((n) => `usr-org-${n.nodeId}`)
    );

    const nonOrgStaffEmails = new Set(
      (adminState.staffUsers || [])
        .filter(
          (u) =>
            normalizeOrgSchoolId(u.school_id) === schoolId &&
            !String(u.id || '').startsWith('usr-org-') &&
            Boolean(u.email)
        )
        .map((u) => String(u.email || '').trim().toLowerCase())
    );
    const nonOrgTeacherEmails = new Set(
      (adminState.teachersList || [])
        .filter(
          (t) =>
            normalizeOrgSchoolId(t.school_id) === schoolId &&
            !String(t.id || '').startsWith('usr-org-') &&
            Boolean(t.email)
        )
        .map((t) => String(t.email || '').trim().toLowerCase())
    );

    // Conservar intactos todos los usuarios de otros colegios y limpiar usr-org-* dados de baja o duplicados de semilla canónica de ESTE schoolId
    const existingStaff = (adminState.staffUsers || []).filter((u) => {
      if (normalizeOrgSchoolId(u.school_id) !== schoolId) return true;
      if (!String(u.id || '').startsWith('usr-org-')) return true;
      if (!activeOrgUserIds.has(u.id)) return false;
      const emailLower = String(u.email || '').trim().toLowerCase();
      if (emailLower && nonOrgStaffEmails.has(emailLower)) return false;
      return true;
    });
    const existingTeachers = (adminState.teachersList || []).filter((t) => {
      if (normalizeOrgSchoolId(t.school_id) !== schoolId) return true;
      if (!String(t.id || '').startsWith('usr-org-')) return true;
      if (!activeOrgUserIds.has(t.id)) return false;
      const emailLower = String(t.email || '').trim().toLowerCase();
      if (emailLower && nonOrgTeacherEmails.has(emailLower)) return false;
      return true;
    });
    const existingPayroll = [...(adminState.staffPayroll || [])];
    const existingSubjects = [...(adminState.subjectsList || [])];
    const existingSchedules = [...(adminState.schedulesList || [])];

    // Upsert de Materias guardadas al catálogo escolar AISLADO por school_id
    for (const catSubj of graph.savedSubjects || []) {
      const subjId = `subj-org-${schoolId}-${catSubj.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (
        !existingSubjects.some(
          (s) =>
            s.id === subjId ||
            ((s as any).school_id === schoolId &&
              s.name.toLowerCase() === catSubj.name.toLowerCase())
        )
      ) {
        existingSubjects.push({
          id: subjId,
          school_id: schoolId,
          name: catSubj.name,
          color: catSubj.contourColor,
          created_at: catSubj.createdAt,
        } as any);
      }
    }

    for (const node of allOrgNodes) {
      const canonicalUserId = `usr-org-${node.nodeId}`;
      const lastNames = [node.paternalLastName, node.maternalLastName].filter(Boolean).join(' ');
      const role = mapNodeToUserRole(node);
      const userProfile: UserProfile & Record<string, any> = {
        id: canonicalUserId,
        email: node.username,
        first_name: node.firstName || node.customRoleLabel || node.roleTitle,
        last_name: lastNames,
        role,
        school_id: schoolId,
        campus_name: node.campusName || 'Plantel Central',
        is_blocked: Boolean(node.isBlocked),
        temporary_password: node.tempPasswordPreview || 'Personalizada',
        org_node_id: node.nodeId,
        org_sub_role: node.subRole,
        org_category: node.category,
        org_role_title: node.customRoleLabel || node.roleTitle,
        org_permissions: node.permissions,
        org_is_provisioned: Boolean(node.isProvisioned),
        org_monthly_salary_mxn: node.monthlyBaseSalaryMxn,
        org_hourly_rate_mxn: node.hourlyRateMxn,
        created_at: node.createdAt,
        updated_at: node.updatedAt,
      };

      const nodeEmailLower = (node.username || '').trim().toLowerCase();

      // Reportar SIEMPRE de forma inmediata en staffUsers para control total del Super Usuario (/admin y /superuser),
      // evitando duplicar identidades canónicas preexistentes del mismo colegio con distinto id.
      const staffIdx = existingStaff.findIndex(
        (u) =>
          u.id === canonicalUserId ||
          (Boolean(nodeEmailLower) &&
            normalizeOrgSchoolId(u.school_id) === schoolId &&
            (u.email || '').trim().toLowerCase() === nodeEmailLower)
      );
      if (staffIdx >= 0) {
        const prevStaff = existingStaff[staffIdx];
        const keepSeedIdentity = !String(prevStaff.id || '').startsWith('usr-org-');
        existingStaff[staffIdx] = {
          ...prevStaff,
          ...userProfile,
          id: keepSeedIdentity ? prevStaff.id : canonicalUserId,
          role: keepSeedIdentity ? prevStaff.role : userProfile.role,
          first_name: node.firstName || (keepSeedIdentity ? prevStaff.first_name : undefined) || userProfile.first_name,
          last_name: lastNames || (keepSeedIdentity ? prevStaff.last_name : undefined) || userProfile.last_name,
          is_blocked: Boolean(node.isBlocked),
          org_node_id: node.nodeId,
          org_sub_role: node.subRole,
          org_category: node.category,
          org_role_title: node.customRoleLabel || node.roleTitle,
          org_permissions: node.permissions,
          org_is_provisioned: Boolean(node.isProvisioned),
          org_monthly_salary_mxn: node.monthlyBaseSalaryMxn,
          org_hourly_rate_mxn: node.hourlyRateMxn,
        } as UserProfile & Record<string, any>;
      } else {
        existingStaff.unshift(userProfile);
      }

      // Si es Profesor, aprovisionar Portal Académico en teachersList sin duplicar semillas del colegio
      if (node.category === 'profesor') {
        const teacherProfile: UserProfile & Record<string, any> = {
          ...userProfile,
          role: 'teacher',
        };
        const tIdx = existingTeachers.findIndex(
          (t) =>
            t.id === canonicalUserId ||
            (Boolean(nodeEmailLower) &&
              normalizeOrgSchoolId(t.school_id) === schoolId &&
              (t.email || '').trim().toLowerCase() === nodeEmailLower)
        );
        if (tIdx >= 0) {
          const prevTeacher = existingTeachers[tIdx];
          const keepSeedTeacher = !String(prevTeacher.id || '').startsWith('usr-org-');
          existingTeachers[tIdx] = {
            ...prevTeacher,
            ...teacherProfile,
            id: keepSeedTeacher ? prevTeacher.id : canonicalUserId,
            role: 'teacher',
            first_name: node.firstName || (keepSeedTeacher ? prevTeacher.first_name : undefined) || teacherProfile.first_name,
            last_name: lastNames || (keepSeedTeacher ? prevTeacher.last_name : undefined) || teacherProfile.last_name,
            is_blocked: Boolean(node.isBlocked),
            org_node_id: node.nodeId,
            org_sub_role: node.subRole,
            org_category: node.category,
            org_role_title: node.customRoleLabel || node.roleTitle,
            org_permissions: node.permissions,
            org_is_provisioned: Boolean(node.isProvisioned),
            org_monthly_salary_mxn: node.monthlyBaseSalaryMxn,
            org_hourly_rate_mxn: node.hourlyRateMxn,
          } as UserProfile & Record<string, any>;
        } else {
          existingTeachers.unshift(teacherProfile);
        }
      }
    }

    // Sincronizar Nómina Recurrente consolidada AISLADA por schoolId (sin tocar otros colegios)
    const activeOrgPayrollIds = new Set(payrollSummary.rows.map((r) => `pay-org-${r.nodeId}`));
    const cleanedPayroll = existingPayroll.filter(
      (p) =>
        p.school_id !== schoolId ||
        !p.id.startsWith('pay-org-') ||
        activeOrgPayrollIds.has(p.id)
    );
    for (const row of payrollSummary.rows) {
      const payId = `pay-org-${row.nodeId}`;
      const record = {
        id: payId,
        employee_id: row.userId,
        employee_name: row.fullName,
        role: row.category === 'profesor' ? 'teacher' : 'admin',
        position_title:
          row.category === 'profesor'
            ? `Profesor (${row.weeklyHours}h/sem · ${row.subjectsCount || 1} mat.)`
            : row.roleTitle,
        department:
          row.category === 'profesor'
            ? 'Docencia'
            : row.category === 'administracion'
            ? 'Administración'
            : row.category === 'intendencia_servicios'
            ? 'Intendencia y Servicios'
            : 'Otros',
        school_id: schoolId,
        campus_name: row.campusName,
        base_salary: row.monthlyRecurringTotalMxn,
        bonuses: 0,
        deductions: 0,
        net_salary: row.monthlyRecurringTotalMxn,
        payment_period: 'Recurrente Organización',
        period_type: 'mensual' as const,
        payment_method: 'SPEI / Transferencia Bancaria',
        status: 'pendiente' as const,
      };
      const pIdx = cleanedPayroll.findIndex((p) => p.id === payId);
      if (pIdx >= 0) {
        cleanedPayroll[pIdx] = { ...cleanedPayroll[pIdx], ...(record as any) };
      } else {
        cleanedPayroll.unshift(record as any);
      }
    }

    // Sincronizar Horario Semanal hacia schedulesList AISLADO por schoolId
    const nonOrgSchedules = existingSchedules.filter(
      (s) => !String(s.id || '').startsWith(`sched-org-${schoolId}-`)
    );
    const schoolGroup = (adminState.groupsList || []).find((g) => g.school_id === schoolId);
    const defaultSchoolGroupId = schoolGroup?.id || `grp-org-${schoolId}`;

    const dayNormalizeMap: Record<string, 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      miércoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
    };

    const mappedOrgSchedules = (graph.timetablePlacements || []).map((pl) => {
      const normalizedDay = dayNormalizeMap[(pl.day || '').toLowerCase()] || 'Lunes';
      const subjectSlug = pl.subjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return {
        id: `sched-org-${schoolId}-${pl.id}`,
        school_id: schoolId,
        groupId: defaultSchoolGroupId,
        subjectId: `subj-org-${schoolId}-${subjectSlug}`,
        subjectName: pl.subjectName,
        teacherId: `usr-org-${pl.teacherNodeId}`,
        dayOfWeek: normalizedDay,
        timeSlot: `${pl.startTime} - ${pl.endTime}`,
        classroom: pl.campusId,
      };
    });

    useSchoolAdminStore.setState({
      staffUsers: existingStaff,
      teachersList: existingTeachers,
      subjectsList: existingSubjects,
      staffPayroll: cleanedPayroll,
      schedulesList: [...mappedOrgSchedules, ...nonOrgSchedules] as any,
    });
  } catch {
    // Prevent store cross-sync failures in isolated unit environments
  }

  // 2. Sincronizar hacia API del Servidor (/api/admin/organization) en cliente navegador
  if (
    !options?.skipServerPost &&
    typeof window !== 'undefined' &&
    typeof fetch !== 'undefined' &&
    isSessionAuthorizedForOrgSchool(schoolId)
  ) {
    fetch(`/api/admin/organization?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, graph }),
    }).catch(() => {});
  }

  // 3. Emitir evento en tiempo real para que el Portal del Super Usuario (/admin y /superuser) refleje cambios en 0ms
  if (!options?.skipBroadcast) {
    broadcastOrgUpdate({
      type: 'GRAPH_UPDATED',
      schoolId,
      graph,
      nodesCount: Array.isArray(graph?.nodes) ? graph.nodes.length : 0,
      updatedAt: graph?.updatedAt || new Date().toISOString(),
    });
  }
}

interface OrganizationStoreState {
  graphsBySchool: Record<string, SchoolOrganizationGraph>;

  getGraph: (schoolId?: string) => SchoolOrganizationGraph;
  hydrateFromServer: (schoolId?: string) => Promise<void>;
  hydrateAllSchoolsFromServer: (
    schoolIds?: string[],
    options?: { authorizedSchoolId?: string | null; isSuperUser?: boolean }
  ) => Promise<void>;

  // Acciones de Nodos y Organigrama
  addSeatNode: (params: {
    schoolId?: string;
    campusId: string;
    campusName: string;
    subRole: OrgNodeSubRole;
    x?: number;
    y?: number;
  }) => OrgSeatNode;
  moveSeatNode: (schoolId: string, nodeId: string, x: number, y: number) => void;
  deleteSeatNode: (schoolId: string, nodeId: string) => void;
  connectNodes: (
    schoolId: string,
    sourceNodeId: string,
    targetNodeId: string
  ) => { success: boolean; error?: string };
  removeEdge: (schoolId: string, edgeId: string) => void;
  autoOrganize: (schoolId: string) => void;

  // Configuración del Nodo (Auto-creación al cerrar, Recuperación de Clave, Continuidad de Puesto y Control Total Super Usuario)
  saveAndProvisionNode: (
    schoolId: string,
    nodeId: string,
    patch: {
      firstName?: string;
      paternalLastName?: string;
      maternalLastName?: string;
      username?: string;
      campusId?: string;
      campusName?: string;
      subRole?: OrgNodeSubRole;
      permissions?: Partial<OrgPermissions>;
      subjects?: TeacherSubjectAssignment[];
      hourlyRateMxn?: number;
      monthlyBaseSalaryMxn?: number;
      slaHours?: number;
      customRoleLabel?: string;
      isBlocked?: boolean;
    }
  ) => { updatedNode: OrgSeatNode | null; campusChanged: boolean };
  recoverNodePassword: (
    schoolId: string,
    nodeId: string,
    customPassword?: string
  ) => { newPassword: string; updatedNode: OrgSeatNode | null };
  toggleNodeBlock: (
    schoolId: string,
    nodeId: string,
    isBlocked?: boolean
  ) => OrgSeatNode | null;
  findSchoolAndNodeByUserIdOrEmail: (
    idOrEmail: string
  ) => { schoolId: string; node: OrgSeatNode } | null;

  // Autenticación y Rotación Obligatoria en Primer Ingreso
  authenticateOrgAccount: (
    identifier: string,
    password: string
  ) => {
    matched: boolean;
    validPassword: boolean;
    mustChangePassword: boolean;
    node?: OrgSeatNode;
    schoolId?: string;
  };
  completeFirstLoginPasswordRotation: (
    identifier: string,
    currentTempPassword: string,
    newPersonalPassword: string
  ) => Promise<{ success: boolean; node?: OrgSeatNode; error?: string }>;

  // Horario Escolar por Plantel y Bloques por Materia
  configureCampusSchedule: (
    schoolId: string,
    config: Omit<CampusScheduleConfig, 'updatedAt'>
  ) => CampusScheduleConfig;
  setActiveTimetableCampus: (schoolId: string, campusId: string) => void;
  placeSubjectBlockInTimetable: (params: {
    schoolId: string;
    campusId: string;
    day: WeekdayKey;
    slotIndex: number;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    teacherNodeId: string;
    subjectId: string;
    subjectName: string;
    contourColor: string;
  }) => { success: boolean; conflictMessage?: string; placement?: TimetablePlacement };
  removeTimetablePlacement: (schoolId: string, placementId: string) => void;

  // Alertas Vibratorias Jerárquicas SLA y Comunicación Padre-Profesor
  dispatchHierarchicalSlaAlert: (params: {
    schoolId: string;
    fromNodeId?: string; // 'ceo-root' o nodeId superior
    fromName: string;
    fromRoleLabel: string;
    targetDelegateEmail: string;
    subject: string;
    message: string;
    slaHours: number;
  }) => { triggered: boolean; alert?: VibratoryProtocolAlert; reason?: string };
  dispatchParentMessageAlert: (params: {
    schoolId: string;
    parentName: string;
    studentName: string;
    targetTeacherUsername?: string;
    targetTeacherName: string;
    subject: string;
    message: string;
    parentMessageId?: string;
  }) => VibratoryProtocolAlert;
  acknowledgeAlert: (schoolId: string, alertId: string) => void;
  replyToVibratoryAlert: (
    schoolId: string,
    alertId: string,
    replyText: string
  ) => void;

  // Selectores Derivados
  getDynamicSlaDelegates: (schoolId?: string) => ReturnType<typeof buildDynamicSlaDelegatesFromGraph>;
  getPayrollSummary: (schoolId?: string) => ReturnType<typeof calculateConsolidatedPayrollSummary>;
  resetSchoolOrganization: (schoolId?: string) => void;
}

export const useOrganizationStore = create<OrganizationStoreState>()(
  persist(
    (set, get) => ({
      graphsBySchool: {},

      getGraph: (rawSchoolId = 'sch-test-case') => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const existing = get().graphsBySchool[schoolId];
        if (existing) {
          if (schoolId === 'sch-demo-0001' && isStaleDemoOrgGraph(existing)) {
            return createDemoSchoolOrganizationGraph();
          }
          return existing;
        }
        return createEmptyOrganizationGraph(schoolId);
      },

      hydrateFromServer: async (rawSchoolId = 'sch-test-case') => {
        if (typeof window === 'undefined') return;
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        if (!isSessionAuthorizedForOrgSchool(schoolId)) return;
        try {
          const res = await fetch(`/api/admin/organization?schoolId=${encodeURIComponent(schoolId)}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data?.success && data.graph) {
            if (schoolId === 'sch-demo-0001' && isStaleDemoOrgGraph(data.graph)) {
              const upgraded = createDemoSchoolOrganizationGraph();
              set((state) => ({
                graphsBySchool: {
                  ...state.graphsBySchool,
                  [schoolId]: upgraded,
                },
              }));
              syncGraphToServerAndAdminStore(schoolId, upgraded, {
                skipBroadcast: true,
              });
              return;
            }
            const local = get().graphsBySchool[schoolId];
            const serverNodesCount = Array.isArray(data.graph.nodes) ? data.graph.nodes.length : 0;
            const localNodesCount = Array.isArray(local?.nodes) ? local.nodes.length : 0;
            const serverTs = data.graph.updatedAt ? new Date(data.graph.updatedAt).getTime() : 0;
            const localTs = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;

            if (!local || serverTs >= localTs) {
              set((state) => ({
                graphsBySchool: {
                  ...state.graphsBySchool,
                  [schoolId]: data.graph,
                },
              }));
              syncGraphToServerAndAdminStore(schoolId, data.graph, {
                skipServerPost: true,
                skipBroadcast: true,
              });
            } else if (localNodesCount > 0 && serverNodesCount === 0 && localTs > serverTs) {
              // Asegurar que el servidor tenga el estado local más reciente sin disparar bucle de broadcast
              syncGraphToServerAndAdminStore(schoolId, local, {
                skipBroadcast: true,
              });
            }
          }
        } catch {
          // Offline-resilient
        }
      },

      hydrateAllSchoolsFromServer: async (schoolIds, options) => {
        if (typeof window === 'undefined') return;

        // Restringir la hidratación multi-colegio a Super Usuarios de plataforma;
        // cuentas directivas/CEO de un solo colegio o demo solo consultan su school_id autorizado.
        if (options?.isSuperUser === false) {
          const scopedId = options.authorizedSchoolId
            ? normalizeOrgSchoolId(options.authorizedSchoolId)
            : '';
          if (scopedId) {
            await get().hydrateFromServer(scopedId);
          }
          return;
        }

        if (options?.isSuperUser !== true) {
          const sessionUser = getActiveClientSessionUser();
          if (sessionUser) {
            const roleLower = String(sessionUser.role || '').toLowerCase();
            if (roleLower && !EXECUTIVE_ORG_ROLES.has(roleLower)) {
              return;
            }
            if (!isPlatformSuperUser(sessionUser)) {
              const scopedId = sessionUser.school_id
                ? normalizeOrgSchoolId(sessionUser.school_id)
                : '';
              if (scopedId) {
                await get().hydrateFromServer(scopedId);
              }
              return;
            }
          }
        }

        const defaultIds = [
          'sch-ibime',
          'sch-jjrosseau',
          'sch-montessori',
          'sch-test-case',
          'sch-demo-0001',
          'emp-bmw',
          'emp-ventas',
          'emp-tech',
        ];
        const allIds = Array.from(new Set([...defaultIds, ...(schoolIds || [])]));
        await Promise.all(allIds.map((id) => get().hydrateFromServer(id)));
      },

      addSeatNode: ({ schoolId: rawSchoolId = 'sch-test-case', campusId, campusName, subRole, x, y }) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const newNode = createInitialSeatNode({
          schoolId,
          campusId,
          campusName,
          subRole,
          x,
          y,
          existingCount: current.nodes.length,
        });
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: [...current.nodes, newNode],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return newNode;
      },

      moveSeatNode: (rawSchoolId, nodeId, x, y) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: current.nodes.map((n) =>
            n.nodeId === nodeId ? { ...n, x: Math.round(x), y: Math.round(y) } : n
          ),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
      },

      deleteSeatNode: (rawSchoolId, nodeId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: current.nodes.filter((n) => n.nodeId !== nodeId),
          edges: current.edges.filter(
            (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
          ),
          timetablePlacements: current.timetablePlacements.filter(
            (p) => p.teacherNodeId !== nodeId
          ),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      connectNodes: (rawSchoolId, sourceNodeId, targetNodeId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        if (sourceNodeId === targetNodeId) {
          return { success: false, error: 'Un nodo no puede reportarse a sí mismo.' };
        }
        if (wouldCreateHierarchyCycle(sourceNodeId, targetNodeId, current.edges)) {
          return {
            success: false,
            error: 'Conexión inválida: generaría un ciclo jerárquico en el organigrama.',
          };
        }
        const alreadyExists = current.edges.some(
          (e) => e.sourceNodeId === sourceNodeId && e.targetNodeId === targetNodeId
        );
        if (alreadyExists) {
          return { success: true };
        }
        // Reemplazar superior inmediato previo de targetNodeId para mantener árbol jerárquico limpio
        const filteredEdges = current.edges.filter((e) => e.targetNodeId !== targetNodeId);
        const newEdge: OrgHierarchyEdge = {
          id: `edge-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
          schoolId,
          sourceNodeId,
          targetNodeId,
          createdAt: new Date().toISOString(),
        };
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          edges: [...filteredEdges, newEdge],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return { success: true };
      },

      removeEdge: (rawSchoolId, edgeId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          edges: current.edges.filter((e) => e.id !== edgeId),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      autoOrganize: (rawSchoolId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const organizedNodes = autoOrganizeOrgNodes(current.nodes, current.edges);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: organizedNodes,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      saveAndProvisionNode: (rawSchoolId, nodeId, patch) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const target = current.nodes.find((n) => n.nodeId === nodeId);
        if (!target) return { updatedNode: null, campusChanged: false };

        const { updatedNode, updatedCatalog, campusChanged } = applyNodeConfigurationUpdate(
          target,
          patch,
          current.savedSubjects
        );

        const nextFullName = getFullNameOfNode(updatedNode);
        const updatedPlacements = current.timetablePlacements.map((p) => {
          if (p.teacherNodeId !== nodeId) return p;
          const matchingSubj = updatedNode.subjects.find((s) => s.id === p.subjectId);
          return {
            ...p,
            teacherFullName: nextFullName,
            subjectName: matchingSubj?.subjectName || p.subjectName,
            contourColor: matchingSubj?.contourColor || p.contourColor,
          };
        });

        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: current.nodes.map((n) => (n.nodeId === nodeId ? updatedNode : n)),
          savedSubjects: updatedCatalog,
          timetablePlacements: updatedPlacements,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return { updatedNode, campusChanged };
      },

      recoverNodePassword: (rawSchoolId, nodeId, customPassword) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const target = current.nodes.find((n) => n.nodeId === nodeId);
        if (!target) return { newPassword: '', updatedNode: null };

        const { newPassword, updatedNode } = regenerateNodePassword(target, customPassword);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: current.nodes.map((n) => (n.nodeId === nodeId ? updatedNode : n)),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return { newPassword, updatedNode };
      },

      toggleNodeBlock: (rawSchoolId, nodeId, isBlocked) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const target = current.nodes.find((n) => n.nodeId === nodeId);
        if (!target) return null;

        const nextBlocked = isBlocked !== undefined ? Boolean(isBlocked) : !Boolean(target.isBlocked);
        const updatedNode: OrgSeatNode = {
          ...target,
          isBlocked: nextBlocked,
          updatedAt: new Date().toISOString(),
        };
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          nodes: current.nodes.map((n) => (n.nodeId === nodeId ? updatedNode : n)),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return updatedNode;
      },

      findSchoolAndNodeByUserIdOrEmail: (idOrEmail) => {
        const clean = (idOrEmail || '').trim().toLowerCase();
        if (!clean) return null;
        const strippedNodeId = clean.startsWith('usr-org-') ? clean.slice('usr-org-'.length) : clean;
        const allGraphs = get().graphsBySchool;
        for (const [schoolId, graph] of Object.entries(allGraphs)) {
          const found = (graph?.nodes || []).find(
            (n) =>
              n.nodeId.toLowerCase() === strippedNodeId ||
              `usr-org-${n.nodeId}`.toLowerCase() === clean ||
              n.username.toLowerCase() === clean
          );
          if (found) {
            return { schoolId, node: found };
          }
        }
        return null;
      },

      authenticateOrgAccount: (identifier, password) => {
        const clean = (identifier || '').trim().toLowerCase();
        if (!clean) {
          return { matched: false, validPassword: false, mustChangePassword: false };
        }
        const allGraphs = get().graphsBySchool;
        for (const [schoolId, graph] of Object.entries(allGraphs)) {
          const found = graph.nodes.find(
            (n) =>
              n.isProvisioned &&
              (n.username.toLowerCase() === clean ||
                `usr-org-${n.nodeId}`.toLowerCase() === clean)
          );
          if (found) {
            if (found.isBlocked) {
              return {
                matched: true,
                validPassword: false,
                mustChangePassword: found.mustChangePassword,
                node: found,
                schoolId,
              };
            }
            const valid = verifyOrgPassword(
              (password || '').trim(),
              found.passwordSalt,
              found.passwordHash
            );
            return {
              matched: true,
              validPassword: valid,
              mustChangePassword: found.mustChangePassword,
              node: found,
              schoolId,
            };
          }
        }
        return { matched: false, validPassword: false, mustChangePassword: false };
      },

      completeFirstLoginPasswordRotation: async (
        identifier,
        currentTempPassword,
        newPersonalPassword
      ) => {
        const clean = (identifier || '').trim().toLowerCase();
        const allGraphs = get().graphsBySchool;
        for (const [schoolId, graph] of Object.entries(allGraphs)) {
          const idx = graph.nodes.findIndex(
            (n) => n.isProvisioned && n.username.toLowerCase() === clean
          );
          if (idx !== -1) {
            const result = rotateFirstLoginPassword(
              graph.nodes[idx],
              currentTempPassword,
              newPersonalPassword
            );
            if (!result.success || !result.updatedNode) {
              return result;
            }
            const nextNodes = [...graph.nodes];
            nextNodes[idx] = result.updatedNode;
            const nextGraph: SchoolOrganizationGraph = {
              ...graph,
              nodes: nextNodes,
              updatedAt: new Date().toISOString(),
            };
            set((state) => ({
              graphsBySchool: {
                ...state.graphsBySchool,
                [schoolId]: nextGraph,
              },
            }));

            // Sincronizar rotación en el servidor antes de iniciar sesión definitiva
            if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
              try {
                await fetch('/api/auth/rotate-initial-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: result.updatedNode.username,
                    currentPassword: currentTempPassword,
                    newPassword: newPersonalPassword,
                  }),
                });
              } catch {
                // Local rotation already persisted
              }
            }
            syncGraphToServerAndAdminStore(schoolId, nextGraph);
            return { success: true, node: result.updatedNode };
          }
        }

        // Si el store del cliente estaba vacío (ej. otro navegador), rotar directamente contra el servidor
        if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
          try {
            const res = await fetch('/api/auth/rotate-initial-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: clean,
                currentPassword: currentTempPassword,
                newPassword: newPersonalPassword,
              }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              return { success: true };
            }
            return { success: false, error: data.error || 'No se pudo actualizar la contraseña.' };
          } catch (err: any) {
            return { success: false, error: err?.message || 'Error de red al actualizar contraseña.' };
          }
        }

        return { success: false, error: 'Cuenta organizacional no encontrada.' };
      },

      configureCampusSchedule: (rawSchoolId, config) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const fullConfig: CampusScheduleConfig = {
          ...config,
          blockDurationMinutes: Math.max(15, Math.min(240, Number(config.blockDurationMinutes) || 50)),
          updatedAt: new Date().toISOString(),
        };
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          campusSchedules: {
            ...current.campusSchedules,
            [config.campusId]: fullConfig,
          },
          activeCampusIdForTimetable: config.campusId,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return fullConfig;
      },

      setActiveTimetableCampus: (rawSchoolId, campusId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          activeCampusIdForTimetable: campusId,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
      },

      placeSubjectBlockInTimetable: ({
        schoolId: rawSchoolId,
        campusId,
        day,
        slotIndex,
        startTime,
        endTime,
        durationMinutes,
        teacherNodeId,
        subjectId,
        subjectName,
        contourColor,
      }) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const teacherNode = current.nodes.find((n) => n.nodeId === teacherNodeId);
        if (!teacherNode) {
          return { success: false, conflictMessage: 'Profesor no encontrado en el organigrama.' };
        }
        const teacherFullName = getFullNameOfNode(teacherNode);

        // Detección internacional de choque de horario docente (mismo profesor en otra sede/bloque simultáneo)
        const crossCampusClash = current.timetablePlacements.find(
          (p) =>
            p.teacherNodeId === teacherNodeId &&
            p.day === day &&
            p.startTime === startTime &&
            !(p.campusId === campusId && p.slotIndex === slotIndex)
        );
        if (crossCampusClash) {
          return {
            success: false,
            conflictMessage: `${teacherFullName} ya imparte ${crossCampusClash.subjectName} el ${day} a las ${startTime}.`,
          };
        }

        // Reemplazar cualquier bloque previo en la misma celda (campusId + day + slotIndex)
        const withoutCell = current.timetablePlacements.filter(
          (p) => !(p.campusId === campusId && p.day === day && p.slotIndex === slotIndex)
        );

        const placement: TimetablePlacement = {
          id: `pl-${campusId}-${day}-${slotIndex}-${Date.now()}`,
          schoolId,
          campusId,
          day,
          slotIndex,
          startTime,
          endTime,
          durationMinutes,
          teacherNodeId,
          teacherFullName,
          subjectId,
          subjectName,
          contourColor,
        };

        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          timetablePlacements: [...withoutCell, placement],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        return { success: true, placement };
      },

      removeTimetablePlacement: (rawSchoolId, placementId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          timetablePlacements: current.timetablePlacements.filter((p) => p.id !== placementId),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      dispatchHierarchicalSlaAlert: ({
        schoolId: rawSchoolId,
        fromNodeId = 'ceo-root',
        fromName,
        fromRoleLabel,
        targetDelegateEmail,
        subject,
        message,
        slaHours,
      }) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const cleanEmail = (targetDelegateEmail || '').trim().toLowerCase();
        const targetNode = current.nodes.find(
          (n) => n.isProvisioned && n.username.toLowerCase() === cleanEmail
        );
        if (!targetNode) {
          return { triggered: false, reason: 'El destinatario no pertenece a los nodos generados.' };
        }

        const isSuperior = isSuperiorInOrgChart(fromNodeId, targetNode.nodeId, current.edges);
        if (!isSuperior) {
          return {
            triggered: false,
            reason: 'El remitente no es superior jerárquico del destinatario en el organigrama.',
          };
        }

        const alert: VibratoryProtocolAlert = {
          id: `vib-sla-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          schoolId,
          kind: 'sla_superior',
          fromName,
          fromRoleLabel,
          fromNodeId,
          targetNodeId: targetNode.nodeId,
          targetUsername: targetNode.username,
          targetFullName: getFullNameOfNode(targetNode),
          subject,
          message,
          slaHours,
          createdAt: new Date().toISOString(),
        };

        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          alerts: [alert, ...current.alerts].slice(0, 50),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        broadcastOrgUpdate({ type: 'VIBRATORY_ALERT', schoolId, alert });
        return { triggered: true, alert };
      },

      dispatchParentMessageAlert: ({
        schoolId: rawSchoolId,
        parentName,
        studentName,
        targetTeacherUsername,
        targetTeacherName,
        subject,
        message,
        parentMessageId,
      }) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const matchedTeacher = current.nodes.find(
          (n) =>
            n.category === 'profesor' &&
            ((targetTeacherUsername &&
              n.username.toLowerCase() === targetTeacherUsername.trim().toLowerCase()) ||
              getFullNameOfNode(n).toLowerCase() === (targetTeacherName || '').trim().toLowerCase())
        );

        const alert: VibratoryProtocolAlert = {
          id: `vib-parent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          schoolId,
          kind: 'parent_teacher_message',
          fromName: parentName,
          fromRoleLabel: `Padre / Tutor · ${studentName}`,
          targetNodeId: matchedTeacher?.nodeId,
          targetUsername: matchedTeacher?.username || targetTeacherUsername,
          targetFullName: matchedTeacher ? getFullNameOfNode(matchedTeacher) : targetTeacherName,
          subject,
          message,
          studentName,
          parentMessageId,
          createdAt: new Date().toISOString(),
        };

        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          alerts: [alert, ...current.alerts].slice(0, 50),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
        broadcastOrgUpdate({ type: 'VIBRATORY_ALERT', schoolId, alert });
        return alert;
      },

      acknowledgeAlert: (rawSchoolId, alertId) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          alerts: current.alerts.map((a) =>
            a.id === alertId ? { ...a, acknowledgedAt: new Date().toISOString() } : a
          ),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      replyToVibratoryAlert: (rawSchoolId, alertId, replyText) => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const current = get().getGraph(schoolId);
        const nowIso = new Date().toISOString();
        const targetAlert = current.alerts.find((a) => a.id === alertId);
        if (targetAlert?.parentMessageId) {
          try {
            useSchoolAdminStore.getState().replyToParentMessage(targetAlert.parentMessageId, replyText);
          } catch {
            // Optional sync with parentMessages thread
          }
        }
        const nextGraph: SchoolOrganizationGraph = {
          ...current,
          alerts: current.alerts.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  acknowledgedAt: a.acknowledgedAt || nowIso,
                  replyText: replyText.trim(),
                  repliedAt: nowIso,
                }
              : a
          ),
          updatedAt: nowIso,
        };
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: nextGraph,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, nextGraph);
      },

      getDynamicSlaDelegates: (rawSchoolId = 'sch-test-case') => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        return buildDynamicSlaDelegatesFromGraph(get().getGraph(schoolId));
      },

      getPayrollSummary: (rawSchoolId = 'sch-test-case') => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        return calculateConsolidatedPayrollSummary(get().getGraph(schoolId));
      },

      resetSchoolOrganization: (rawSchoolId = 'sch-test-case') => {
        const schoolId = normalizeOrgSchoolId(rawSchoolId);
        const empty = createEmptyOrganizationGraph(schoolId);
        set((state) => ({
          graphsBySchool: {
            ...state.graphsBySchool,
            [schoolId]: empty,
          },
        }));
        syncGraphToServerAndAdminStore(schoolId, empty);
      },
    }),
    {
      name: 'iskool-organization-studio-v1',
      version: 2,
      migrate: (persistedState: any) => {
        if (persistedState?.graphsBySchool) {
          const demoGraph = persistedState.graphsBySchool['sch-demo-0001'];
          if (!demoGraph || isStaleDemoOrgGraph(demoGraph)) {
            persistedState.graphsBySchool['sch-demo-0001'] = createDemoSchoolOrganizationGraph();
          }
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const existing = state.graphsBySchool?.['sch-demo-0001'];
        if (!existing || isStaleDemoOrgGraph(existing)) {
          const upgraded = createDemoSchoolOrganizationGraph();
          useOrganizationStore.setState((prev) => ({
            graphsBySchool: {
              ...prev.graphsBySchool,
              'sch-demo-0001': upgraded,
            },
          }));
        }
      },
      storage: createJSONStorage((): StateStorage => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        const memoryFallback: Record<string, string> = {};
        return {
          getItem: (name) => memoryFallback[name] ?? null,
          setItem: (name, value) => {
            memoryFallback[name] = value;
          },
          removeItem: (name) => {
            delete memoryFallback[name];
          },
        };
      }),
    }
  )
);

// Puente bidireccional sin ciclos de importación para que acciones del Super Usuario en useSchoolAdminStore controlen los nodos de useOrganizationStore
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__iskoolOrgBridge = {
    onUpdateStaff: (id: string, data: Record<string, any>) => {
      const store = useOrganizationStore.getState();
      const found = store.findSchoolAndNodeByUserIdOrEmail(id);
      if (!found) return;
      const lastParts = String(data.last_name ?? '').trim().split(/\s+/).filter(Boolean);
      const paternal = lastParts[0] ?? found.node.paternalLastName;
      const maternal = lastParts.length > 1 ? lastParts.slice(1).join(' ') : found.node.maternalLastName;
      store.saveAndProvisionNode(found.schoolId, found.node.nodeId, {
        firstName: data.first_name !== undefined ? String(data.first_name) : found.node.firstName,
        paternalLastName: data.last_name !== undefined ? paternal : found.node.paternalLastName,
        maternalLastName: data.last_name !== undefined ? maternal : found.node.maternalLastName,
        username: data.email !== undefined ? String(data.email) : found.node.username,
        campusName: data.campus_name !== undefined ? String(data.campus_name) : found.node.campusName,
        isBlocked: data.is_blocked !== undefined ? Boolean(data.is_blocked) : found.node.isBlocked,
      });
    },
    onDeleteStaff: (id: string) => {
      const store = useOrganizationStore.getState();
      const found = store.findSchoolAndNodeByUserIdOrEmail(id);
      if (!found) return;
      store.deleteSeatNode(found.schoolId, found.node.nodeId);
    },
    onToggleBlock: (id: string, isBlocked: boolean) => {
      const store = useOrganizationStore.getState();
      const found = store.findSchoolAndNodeByUserIdOrEmail(id);
      if (!found) return;
      store.toggleNodeBlock(found.schoolId, found.node.nodeId, isBlocked);
    },
    onChangePassword: (id: string, newPassword?: string): string | null => {
      const store = useOrganizationStore.getState();
      const found = store.findSchoolAndNodeByUserIdOrEmail(id);
      if (!found) return null;
      const res = store.recoverNodePassword(found.schoolId, found.node.nodeId, newPassword);
      return res.newPassword || null;
    },
  };
}
