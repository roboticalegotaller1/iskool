import { describe, it, expect } from 'vitest';
import {
  OrganizationServerService,
  calculateConsolidatedPayrollSummary,
} from '@/lib/services/organizationService';
import {
  DEMO_CAMPUSES,
  DEMO_DETAILED_STUDENTS,
  DEMO_GROUPS,
  DEMO_STAFF_PAYROLL,
  DEMO_STAFF_USERS,
  DEMO_TEACHERS,
} from '@/lib/demo/demoSchoolSeeds';
import { buildDemoPlanningsForTeacher, getTeacherPlanningCount } from '@/lib/demo/demoTeacherPlannings';
import {
  MIN_FILL_MS,
  __resetUsedChallenges,
  createChallenge,
  sha256Hex,
  verifyChallenge,
} from '@/lib/landing/verification/challenge';
import { GET as getChallenge } from '@/app/api/demo/challenge/route';

describe('Auditoría de Seeds de Nómina Demo y CAPTCHA Anti-Bots', () => {
  it('todos los 45 profesores consolidados de sch-demo-0001 tienen horas semanales y nómina mensual > 0', () => {
    const graph = OrganizationServerService.getGraph('sch-demo-0001');
    const summary = calculateConsolidatedPayrollSummary(graph);

    expect(summary.totalTeachersConsolidatedCount).toBe(45);
    expect(summary.rows.length).toBeGreaterThanOrEqual(50);
    expect(summary.totalTeacherWeeklyHours).toBeGreaterThan(700);
    expect(summary.totalMonthlyPayrollMxn).toBeGreaterThan(950_000);

    const teacherRows = summary.rows.filter((r) => r.category === 'profesor');
    expect(teacherRows.length).toBe(45);
    for (const row of teacherRows) {
      expect(row.weeklyHours).toBeGreaterThanOrEqual(16);
      expect(row.hourlyRateMxn).toBeGreaterThanOrEqual(250);
      expect(row.monthlyRecurringTotalMxn).toBeGreaterThanOrEqual(15_000);
    }
  });

  it('DEMO_STAFF_PAYROLL cubre a todos los 45 docentes y directivos demo con montos y CLABEs reales', () => {
    expect(DEMO_STAFF_PAYROLL.length).toBeGreaterThanOrEqual(50);
    const payrollIds = new Set(DEMO_STAFF_PAYROLL.map((p) => p.employee_id));
    for (const teacher of DEMO_TEACHERS) {
      expect(payrollIds.has(teacher.id)).toBe(true);
    }
    for (const record of DEMO_STAFF_PAYROLL) {
      expect(record.base_salary).toBeGreaterThan(10_000);
      expect(record.net_salary).toBeGreaterThan(9_000);
      expect(record.account_clabe).toMatch(/^\d{18}$/);
      expect(record.bank_name).toBeTruthy();
    }
  });

  it('verificación interactiva "¡Borra el pizarrón!" firma pases PoW y rechaza firmas o números manipulados', async () => {
    const prevSecret = process.env.DEMO_FORM_SECRET;
    process.env.DEMO_FORM_SECRET = 'demo-test-pizarron-signing-key-32chars';
    __resetUsedChallenges();
    try {
      const res = await getChallenge();
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      const data = await res.json();
      expect(typeof data.salt).toBe('string');
      expect(typeof data.challenge).toBe('string');
      expect(typeof data.signature).toBe('string');
      expect(data.max).toBeGreaterThan(0);

      const challenge = createChallenge()!;
      expect(challenge).not.toBeNull();
      const issuedAt = Number(challenge.salt.split('.')[1]);

      const badNumber = verifyChallenge(
        { ...challenge, number: -1 },
        issuedAt + MIN_FILL_MS
      );
      expect(badNumber.ok).toBe(false);

      const tamperedSig = verifyChallenge(
        { ...challenge, signature: '0'.repeat(64), number: 0 },
        issuedAt + MIN_FILL_MS
      );
      expect(tamperedSig.ok).toBe(false);

      // Resolver prueba de trabajo real y validar pase legítimo
      let solved = -1;
      for (let n = 0; n <= challenge.max; n++) {
        if (sha256Hex(challenge.salt + String(n)) === challenge.challenge) {
          solved = n;
          break;
        }
      }
      expect(solved).toBeGreaterThanOrEqual(0);
      expect(
        verifyChallenge({ ...challenge, number: solved }, issuedAt + MIN_FILL_MS)
      ).toEqual({ ok: true });
    } finally {
      if (prevSecret === undefined) delete process.env.DEMO_FORM_SECRET;
      else process.env.DEMO_FORM_SECRET = prevSecret;
    }
  });

  it('los 45 docentes demo tienen cantidades variadas de planeaciones y contenido completo verificable', () => {
    const counts = DEMO_TEACHERS.map((t) => getTeacherPlanningCount(t));
    const distinctCounts = new Set(counts);
    expect(distinctCounts.size).toBeGreaterThanOrEqual(5);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...counts)).toBeGreaterThanOrEqual(8);

    const samplePlannings = buildDemoPlanningsForTeacher(DEMO_TEACHERS[0]);
    expect(samplePlannings.length).toBe(counts[0]);
    for (const plan of samplePlannings) {
      expect(plan.title.length).toBeGreaterThan(10);
      expect(plan.pdaOficial.length).toBeGreaterThan(20);
      expect(plan.inicio).toContain('00–15 min');
      expect(plan.desarrollo).toContain('15–40 min');
      expect(plan.cierre).toContain('40–50 min');
      expect(plan.evaluacionRubrica.length).toBe(3);
      expect(plan.entregableTangible.length).toBeGreaterThan(10);
    }

    // Incluso con caché legado (<25k tokens), getTeacherPlanningCount resuelve al seed canónico
    const staleTeacher = { ...DEMO_TEACHERS[0], ai_tokens_consumed: 2100 };
    expect(getTeacherPlanningCount(staleTeacher)).toBe(counts[0]);
  });

  it('integridad referencial cruzada: 650 alumnos, 27 grupos, 45 docentes, nómina y horarios están 100% enlazados', () => {
    const campusIds = new Set(DEMO_CAMPUSES.map((c) => c.id));
    const groupIds = new Set(DEMO_GROUPS.map((g) => g.id));
    const employeeIds = new Set([
      ...DEMO_TEACHERS.map((t) => t.id),
      ...DEMO_STAFF_USERS.map((s) => s.id),
    ]);

    expect(DEMO_CAMPUSES.length).toBe(3);
    expect(DEMO_GROUPS.length).toBe(27);
    expect(DEMO_TEACHERS.length).toBe(45);
    expect(DEMO_DETAILED_STUDENTS.length).toBe(650);

    for (const g of DEMO_GROUPS) {
      expect(campusIds.has(g.campus_id || '')).toBe(true);
    }
    for (const st of DEMO_DETAILED_STUDENTS) {
      expect(groupIds.has(st.group_id || '')).toBe(true);
    }
    for (const t of DEMO_TEACHERS) {
      expect(campusIds.has(t.campus_id || '')).toBe(true);
    }
    for (const pay of DEMO_STAFF_PAYROLL) {
      expect(employeeIds.has(pay.employee_id || '')).toBe(true);
    }
  });
});
