import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  DEMO_SCHOOL_ID,
  DEMO_SCHOOL_CCT,
  DEMO_SCHOOL_NAME,
  DEMO_DEFAULT_PASSWORD,
  DEMO_PERSONAS,
  DEMO_STORYLINE_STEPS,
  isDemoSandboxContext,
} from './demoSandboxConfig';
import {
  OrganizationServerService,
  createDemoSchoolOrganizationGraph,
  getUnifiedInstitutionAccounts,
  verifyOrgPassword,
} from '@/lib/services/organizationService';
import {
  STAFF_USERS_SEED,
  DETAILED_STUDENTS_SEED,
  TEACHERS_LIST_SEED,
  CAMPUSES_SEED,
  GROUPS_SEED,
  SUBJECTS_SEED,
  BILLING_RECORDS_SEED,
  STAFF_PAYROLL_SEED,
} from '@/store/seeds';
import {
  CRM_LEADS_SEED,
  CRM_CANDIDATES_SEED,
} from '@/store/seeds/crmSeeds';
import { computeAdmissionsPipelineMetrics } from '@/services/admissionsPipelineService';
import {
  useSchoolAdminStore,
  getSchoolCampuses,
  getSchoolStudents,
  getSchoolTeachers,
  getSchoolGroups,
  getSchoolPayroll,
} from '@/store/useSchoolAdminStore';

vi.mock('@/lib/authValidator', () => ({
  validateApiAuth: vi.fn(async (req: NextRequest) => {
    const email = req.headers.get('x-test-email') || 'demo.docente@iskool.mx';
    const role = req.headers.get('x-test-role') || 'teacher';
    const schoolId = req.headers.get('x-test-school') || DEMO_SCHOOL_ID;
    return {
      authenticated: true,
      user: {
        id: 'usr-demo-teacher-1',
        email,
        role,
        school_id: schoolId,
        first_name: 'Prof. Alejandro',
        last_name: 'Ruiz',
      },
    };
  }),
}));

describe('Ecosistema Cuentas Demo (CCT 0001) & Cero Escritura en Bóveda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects all 7 demo emails (including demo.ceo@iskool.mx), schoolId sch-demo-0001 and CCT 0001 while leaving production untouched', () => {
    expect(DEMO_PERSONAS).toHaveLength(7);
    expect(DEMO_STORYLINE_STEPS).toHaveLength(7);
    expect(DEMO_PERSONAS.some((p) => p.id === 'demo-ceo' && p.email === 'demo.ceo@iskool.mx')).toBe(true);

    expect(isDemoSandboxContext({ schoolId: DEMO_SCHOOL_ID })).toBe(true);
    expect(isDemoSandboxContext({ cct: DEMO_SCHOOL_CCT })).toBe(true);
    expect(isDemoSandboxContext({ userId: 'std-demo-01' })).toBe(true);
    for (const p of DEMO_PERSONAS) {
      expect(isDemoSandboxContext({ email: p.email })).toBe(true);
    }
    expect(isDemoSandboxContext({ email: 'demo.staff@iskool.mx' })).toBe(true);

    const combinedText = JSON.stringify({ DEMO_PERSONAS, DEMO_STORYLINE_STEPS });
    expect(combinedText).not.toMatch(/\b(Gemini|Obsidian|GitHub|Canvas)\b/i);

    expect(isDemoSandboxContext({ schoolId: 'sch-ibime', email: 'directora.general@ibime.edu.mx' })).toBe(false);
    expect(isDemoSandboxContext({ schoolId: 'sch-jjrosseau', email: 'director@jjrosseau.edu.mx' })).toBe(false);
  });

  it('provisions 50 CEO org accounts (5 admin incl. demo-ceo-01 + 45 teachers) for sch-demo-0001 with unified DemoISkool2026! password and mustChangePassword=false', () => {
    const graph = createDemoSchoolOrganizationGraph();
    expect(graph.schoolId).toBe(DEMO_SCHOOL_ID);
    expect(graph.nodes).toHaveLength(50);
    expect(graph.nodes.some((n) => n.nodeId === 'demo-ceo-01' && n.username === 'demo.ceo@iskool.mx')).toBe(true);

    for (const node of graph.nodes) {
      expect(node.isProvisioned).toBe(true);
      expect(node.mustChangePassword).toBe(false);
      expect(verifyOrgPassword(DEMO_DEFAULT_PASSWORD, node.passwordSalt, node.passwordHash)).toBe(true);
    }

    const serverGraph = OrganizationServerService.getGraph(DEMO_SCHOOL_ID);
    expect(serverGraph.nodes).toHaveLength(50);

    const unified = getUnifiedInstitutionAccounts(DEMO_SCHOOL_ID, null, STAFF_USERS_SEED);
    expect(unified.totalAccountsCount).toBe(50);
    expect(unified.orgAdminCount).toBe(5);
    expect(unified.orgTeacherCount).toBe(45);
    expect(unified.nonOrgStaffCount).toBe(0);
  });

  it('deduplicates legacy empty CCT 0001 / Cuentas demo institution into canonical sch-demo-0001 with 3 campuses, 650 students, 45 teachers, 36 billing and 10 payroll items', () => {
    const legacyId = 'sch-legacy-999';
    useSchoolAdminStore.setState((state) => ({
      activeSchoolId: legacyId,
      institutionsList: [
        ...state.institutionsList.filter((i) => i.id !== DEMO_SCHOOL_ID),
        {
          id: legacyId,
          name: DEMO_SCHOOL_NAME,
          cct: DEMO_SCHOOL_CCT,
          logoUrl: '/brand/ibime_logo.svg',
          campusesCount: 2,
          studentsCount: 0,
          teachersCount: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        } as any,
      ],
      campusesList: [
        ...state.campusesList.filter((c) => c.school_id !== DEMO_SCHOOL_ID),
        {
          id: 'cmp-legacy-1',
          school_id: legacyId,
          name: 'Plantel Vacío Legacy',
          level: 'primaria',
          grades: ['1º'],
          created_at: '2026-01-01T00:00:00.000Z',
        } as any,
      ],
    }));

    useSchoolAdminStore.getState().reconcileSeedsWithStore();

    const updated = useSchoolAdminStore.getState();
    expect(updated.activeSchoolId).toBe(DEMO_SCHOOL_ID);
    const cuentasDemoCards = updated.institutionsList.filter(
      (i) => i.cct === DEMO_SCHOOL_CCT || i.name.toLowerCase() === 'cuentas demo'
    );
    expect(cuentasDemoCards).toHaveLength(1);
    expect(cuentasDemoCards[0].id).toBe(DEMO_SCHOOL_ID);
    expect(cuentasDemoCards[0].logoUrl).toBe('/brand/cuentas_demo_logo.webp');

    const demoCampuses = getSchoolCampuses(updated.campusesList || CAMPUSES_SEED, DEMO_SCHOOL_ID);
    const demoStudents = getSchoolStudents(updated.detailedStudents || DETAILED_STUDENTS_SEED, DEMO_SCHOOL_ID, demoCampuses);
    const demoTeachers = getSchoolTeachers(updated.teachersList || TEACHERS_LIST_SEED, DEMO_SCHOOL_ID, demoCampuses);
    const demoGroups = getSchoolGroups(updated.groupsList || GROUPS_SEED, DEMO_SCHOOL_ID, demoCampuses);
    const demoSubjects = (updated.subjectsList || SUBJECTS_SEED).filter((s) => s.school_id === DEMO_SCHOOL_ID);
    const demoBilling = (updated.billingRecords || BILLING_RECORDS_SEED).filter((b) => b.school_id === DEMO_SCHOOL_ID);
    const demoPayroll = getSchoolPayroll(updated.staffPayroll || STAFF_PAYROLL_SEED, DEMO_SCHOOL_ID);

    expect(demoCampuses).toHaveLength(3);
    expect(demoStudents).toHaveLength(650);
    expect(demoStudents.filter((s) => s.campus_id === 'cmp-demo-pri')).toHaveLength(260);
    expect(demoStudents.filter((s) => s.campus_id === 'cmp-demo-sec')).toHaveLength(210);
    expect(demoStudents.filter((s) => s.campus_id === 'cmp-demo-prep')).toHaveLength(180);
    expect(demoStudents.some((s) => s.academic_standing === 'en_riesgo')).toBe(true);
    expect(demoStudents.every((s) => (s.photo_url || '').endsWith('.webp'))).toBe(true);

    expect(demoTeachers).toHaveLength(45);
    expect(demoTeachers.filter((t) => t.campus_id === 'cmp-demo-pri')).toHaveLength(18);
    expect(demoTeachers.filter((t) => t.campus_id === 'cmp-demo-sec')).toHaveLength(15);
    expect(demoTeachers.filter((t) => t.campus_id === 'cmp-demo-prep')).toHaveLength(12);

    expect(demoGroups).toHaveLength(27);
    expect(demoSubjects).toHaveLength(18);
    expect(demoBilling).toHaveLength(36);
    expect(demoBilling.filter((b) => b.status === 'paid')).toHaveLength(18);
    expect(demoBilling.filter((b) => b.status === 'pending')).toHaveLength(9);
    expect(demoBilling.filter((b) => b.status === 'overdue')).toHaveLength(9);
    expect(demoPayroll).toHaveLength(10);
  });

  it('scopes 15 CRM admissions leads and candidates to sch-demo-0001 without polluting IBIME metrics', () => {
    const demoLeads = CRM_LEADS_SEED.filter((l) => l.school_id === DEMO_SCHOOL_ID);
    const demoCandidates = CRM_CANDIDATES_SEED.filter((c) => c.id.startsWith('cand-demo-'));
    expect(demoLeads).toHaveLength(15);
    expect(demoCandidates).toHaveLength(15);

    const demoMetrics = computeAdmissionsPipelineMetrics(CRM_LEADS_SEED, CRM_CANDIDATES_SEED, 'all', '2026-2027', DEMO_SCHOOL_ID);
    expect(demoMetrics.totalLeads).toBe(15);
    expect(demoMetrics.totalCandidates).toBe(15);
    expect(demoMetrics.capacity.baseEnrolledSeats).toBe(650);
    expect(demoMetrics.capacity.totalPhysicalSeats).toBe(720);

    const ibimeMetrics = computeAdmissionsPipelineMetrics(CRM_LEADS_SEED, CRM_CANDIDATES_SEED, 'all', '2026-2027', 'sch-ibime');
    expect(ibimeMetrics.capacity.baseEnrolledSeats).toBe(3620);
  });

  it('blocks physical writes to Bóveda Curricular on /api/vault and /api/vault/protocol for demo requests', async () => {
    const { POST: vaultPost } = await import('@/app/api/vault/route');
    const { POST: protocolPost } = await import('@/app/api/vault/protocol/route');

    const vaultReq = new NextRequest('http://localhost:3000/api/vault', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-email': 'demo.docente@iskool.mx',
        'x-test-role': 'teacher',
        'x-test-school': DEMO_SCHOOL_ID,
      },
      body: JSON.stringify({
        title: 'Fracciones Equitativas Demo',
        levelName: 'Primaria',
        gradeName: '5º',
        subjectName: 'Matemáticas',
      }),
    });

    const vaultRes = await vaultPost(vaultReq);
    const vaultJson = await vaultRes.json();
    expect(vaultRes.status).toBe(200);
    expect(vaultJson.success).toBe(true);
    expect(vaultJson.demoSandbox).toBe(true);
    expect(vaultJson.persistedInVault).toBe(false);

    const protoReq = new NextRequest('http://localhost:3000/api/vault/protocol', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-email': 'demo.director@iskool.mx',
        'x-test-role': 'director',
        'x-test-school': DEMO_SCHOOL_ID,
      },
      body: JSON.stringify({
        title: 'Protocolo Demo Convivencia',
        content: 'Simulación temporal sin escritura en Bóveda',
      }),
    });

    const protoRes = await protocolPost(protoReq);
    const protoJson = await protoRes.json();
    expect(protoRes.status).toBe(200);
    expect(protoJson.success).toBe(true);
    expect(protoJson.demoSandbox).toBe(true);
    expect(protoJson.persistedInVault).toBe(false);
  });
});
