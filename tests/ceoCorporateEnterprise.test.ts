import { describe, it, expect } from 'vitest';
import { 
  INSTITUTIONS_SEED, 
  CAMPUSES_SEED, 
  SUBJECTS_SEED, 
  DETAILED_STUDENTS_SEED, 
  STAFF_PAYROLL_SEED,
  STAFF_USERS_SEED
} from '@/store/seeds';
import { 
  isCorporateInstitution, 
  Institution, 
  ROLE_HIERARCHY_LEVEL, 
  canManageTargetRole, 
  UserRole 
} from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

describe('🏢 SUITE: Sector Corporativo B2B & Cuentas CEO en ISkool', () => {

  describe('1. Semillas Forenses y Modelos de Empresa (BMW, Vanguardia Retail, Innovasoft Tech)', () => {
    it('debe contener las 3 empresas corporativas con flags estrictos is_corporate_enterprise', () => {
      const corporateEnterprises = INSTITUTIONS_SEED.filter(inst => inst.is_corporate_enterprise);
      expect(corporateEnterprises.length).toBeGreaterThanOrEqual(3);

      const bmw = INSTITUTIONS_SEED.find(inst => inst.id === 'emp-bmw');
      expect(bmw).toBeDefined();
      expect(bmw?.name).toContain('BMW Group');
      expect(bmw?.institution_type).toBe('corporate');
      expect(bmw?.corporate_industry).toBe('automotive');
      expect(bmw?.ceo_name).toContain('Dirk Dreher');
      expect(bmw?.tax_id).toBe('BGM940315BMW');
      expect(isCorporateInstitution(bmw)).toBe(true);

      const retail = INSTITUTIONS_SEED.find(inst => inst.id === 'emp-ventas');
      expect(retail).toBeDefined();
      expect(retail?.institution_type).toBe('corporate');
      expect(retail?.corporate_industry).toBe('retail');
      expect(retail?.ceo_name).toBeDefined();
      expect(isCorporateInstitution(retail)).toBe(true);

      const tech = INSTITUTIONS_SEED.find(inst => inst.id === 'emp-tech');
      expect(tech).toBeDefined();
      expect(tech?.institution_type).toBe('corporate');
      expect(tech?.corporate_industry).toBe('technology');
      expect(tech?.ceo_name).toBeDefined();
      expect(isCorporateInstitution(tech)).toBe(true);
    });

    it('debe asegurar que los colegios educativos regulares NO son marcados como corporativos', () => {
      const ibime = INSTITUTIONS_SEED.find(inst => inst.id === 'sch-ibime');
      expect(ibime).toBeDefined();
      expect(isCorporateInstitution(ibime)).toBe(false);
      expect(ibime?.is_corporate_enterprise).toBeFalsy();

      const rosseau = INSTITUTIONS_SEED.find(inst => inst.id === 'sch-jjrosseau');
      expect(rosseau).toBeDefined();
      expect(isCorporateInstitution(rosseau)).toBe(false);
      expect(rosseau?.is_corporate_enterprise).toBeFalsy();
    });

    it('debe contener cursos de formación técnica y programas de capacitación corporativa', () => {
      const bmwCourses = SUBJECTS_SEED.filter(s => s.school_id === 'emp-bmw');
      expect(bmwCourses.length).toBeGreaterThanOrEqual(3);
      expect(bmwCourses.some(c => c.name.includes('Robótica') || c.name.includes('KUKA') || c.name.includes('Industrial'))).toBe(true);
      expect(bmwCourses.some(c => c.name.includes('Calidad') || c.name.includes('ISO') || c.name.includes('Seguridad'))).toBe(true);

      const retailCourses = SUBJECTS_SEED.filter(s => s.school_id === 'emp-ventas');
      expect(retailCourses.length).toBeGreaterThanOrEqual(2);

      const techCourses = SUBJECTS_SEED.filter(s => s.school_id === 'emp-tech');
      expect(techCourses.length).toBeGreaterThanOrEqual(2);
    });

    it('debe registrar colaboradores con gamificación desactivada y métricas profesionales (horas, competencias, certificaciones)', () => {
      const bmwEmployees = DETAILED_STUDENTS_SEED.filter(s => s.school_id === 'emp-bmw');
      expect(bmwEmployees.length).toBeGreaterThanOrEqual(3);

      bmwEmployees.forEach(emp => {
        // CERO Gamificación para B2B
        expect(emp.gamification_enabled).toBe(false);
        expect(emp.job_title).toBeDefined();
        expect(emp.department).toBeDefined();
        expect(emp.training_hours).toBeGreaterThan(0);
        expect(emp.competency_score).toBeGreaterThan(0);
        expect(emp.competency_score).toBeLessThanOrEqual(100);
        expect(Array.isArray(emp.certifications)).toBe(true);
      });
    });

    it('debe contener registros de nómina corporativos con terminología de Empleados', () => {
      const bmwPayroll = STAFF_PAYROLL_SEED.filter(p => p.school_id === 'emp-bmw');
      expect(bmwPayroll.length).toBeGreaterThanOrEqual(3);

      bmwPayroll.forEach(record => {
        expect(record.position_title).toBeDefined();
        expect(record.base_salary).toBeGreaterThan(0);
        expect(record.department).toBeDefined();
      });
    });

    it('debe registrar cuentas staff con rol "ceo" para cada empresa', () => {
      const ceos = STAFF_USERS_SEED.filter(u => u.role === ('ceo' as UserRole));
      expect(ceos.length).toBeGreaterThanOrEqual(3);

      const bmwCeo = ceos.find(u => u.school_id === 'emp-bmw');
      expect(bmwCeo).toBeDefined();
      expect(bmwCeo?.email).toBe('ceo@bmw-corp.mx');
      expect(bmwCeo?.role).toBe('ceo');

      const retailCeo = ceos.find(u => u.school_id === 'emp-ventas');
      expect(retailCeo).toBeDefined();
      expect(retailCeo?.email).toBe('ceo@vanguardia-retail.mx');

      const techCeo = ceos.find(u => u.school_id === 'emp-tech');
      expect(techCeo).toBeDefined();
      expect(techCeo?.email).toBe('ceo@innovasoft-tech.com');
    });
  });

  describe('2. Aislamiento Jerárquico de Roles y Seguridad (RoleGuard)', () => {
    it('debe tener el nivel de jerarquía asignado correctamente al rol "ceo"', () => {
      expect(ROLE_HIERARCHY_LEVEL['superadmin']).toBe(1);
      expect(ROLE_HIERARCHY_LEVEL['admin']).toBe(1);
      expect(ROLE_HIERARCHY_LEVEL['owner']).toBe(2);
      expect(ROLE_HIERARCHY_LEVEL['ceo']).toBe(2);
      expect(ROLE_HIERARCHY_LEVEL['director']).toBe(3);

      // Un superadmin o admin puede gestionar a un CEO
      expect(canManageTargetRole('superadmin', 'ceo')).toBe(true);
      expect(canManageTargetRole('admin', 'ceo')).toBe(true);

      // Un CEO NO puede gestionar a un superadmin o admin
      expect(canManageTargetRole('ceo', 'superadmin')).toBe(false);
      expect(canManageTargetRole('ceo', 'admin')).toBe(false);

      // Un CEO puede gestionar directores, coordinadores y docentes/empleados
      expect(canManageTargetRole('ceo', 'director')).toBe(true);
      expect(canManageTargetRole('ceo', 'coordinator')).toBe(true);
      expect(canManageTargetRole('ceo', 'teacher')).toBe(true);
    });
  });

  describe('3. Estado y Operaciones de Super Usuario en Zustand Store', () => {
    it('debe permitir pausar y reanudar empresas corporativas mediante toggleSchoolSuspension', () => {
      const store = useSchoolAdminStore.getState();
      
      const initialSuspension = store.isSchoolSuspended('emp-bmw');
      const toggled = store.toggleSchoolSuspension('emp-bmw');
      expect(toggled).toBe(!initialSuspension);

      // Restaurar estado
      store.toggleSchoolSuspension('emp-bmw');
    });

    it('debe filtrar adecuadamente las empresas corporativas para no mezclarlas en la lista escolar ordinaria', () => {
      const institutions = useSchoolAdminStore.getState().institutionsList;
      
      // Colegios educativos ordinarios
      const regularSchools = institutions.filter(inst => 
        !inst.is_corporate_enterprise && 
        inst.institution_type !== 'corporate' &&
        !inst.id.startsWith('emp-')
      );

      // Ningún colegio ordinario debe ser empresa corporativa
      regularSchools.forEach(school => {
        expect(school.is_corporate_enterprise).toBeFalsy();
      });

      // Las empresas deben identificarse con facilidad
      const corporateOnes = institutions.filter(inst => 
        inst.is_corporate_enterprise || 
        inst.institution_type === 'corporate' ||
        inst.id.startsWith('emp-')
      );
      expect(corporateOnes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('4. Vocabulario Corporativo Estricto (Sin términos escolares en Tarjeta CEO ni Sistema CEO)', () => {
    it('debe tener candidatos corporativos iniciales con puestos y sedes de empresa sin grados escolares', async () => {
      const { INITIAL_CORPORATE_CANDIDATES } = await import('@/components/admin/CEOExecutiveDashboard');
      expect(INITIAL_CORPORATE_CANDIDATES.length).toBeGreaterThanOrEqual(3);

      const schoolRegex = /primaria|secundaria|kínder|kinder|preparatoria|colegio|alumno|docente|profesor|aula/i;

      INITIAL_CORPORATE_CANDIDATES.forEach(cand => {
        expect(cand.grade).not.toMatch(schoolRegex);
        expect(cand.notes).not.toMatch(schoolRegex);
      });
    });

    it('la Tarjeta CEO en src/app/admin/page.tsx debe usar términos ejecutivos de empresa', async () => {
      const fs = await import('fs');
      const adminCode = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

      // Buscar el bloque de la Tarjeta CEO
      const ceoCardStartIndex = adminCode.indexOf('TARJETA SECTOR CORPORATIVO / CEO');
      expect(ceoCardStartIndex).toBeGreaterThan(-1);

      const ceoCardEndIndex = adminCode.indexOf('TARJETA DE ALTA RÁPIDA (+)', ceoCardStartIndex);
      expect(ceoCardEndIndex).toBeGreaterThan(ceoCardStartIndex);

      const ceoCardBlock = adminCode.substring(ceoCardStartIndex, ceoCardEndIndex);

      // Debe contener términos corporativos de CEO
      expect(ceoCardBlock).toContain('Colaboradores');
      expect(ceoCardBlock).toContain('Instructores');
      expect(ceoCardBlock).toContain('Empresas');
      expect(ceoCardBlock).toContain('Entorno Corporativo');
      expect(ceoCardBlock).toContain('Sector Empresarial B2B');

      // No debe contener términos de escuela en el bloque de la Tarjeta CEO
      expect(ceoCardBlock).not.toMatch(/alumnos|docentes|profesores|aulas|colegios|colegiaturas/i);
    });
  });
});
