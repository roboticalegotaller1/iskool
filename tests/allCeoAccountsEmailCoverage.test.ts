import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  getTenantId, 
  getSchoolDomain, 
  generateDefaultMattersForSchool,
  sortEmailsDescending,
  mergeAndSortEmails
} from '@/components/admin/CEOEmailCommunicationsModal';
import { parseEmailDateMs, parseDateStringToEpochMs } from '@/utils/timeZoneUtils';
import { STAFF_USERS_SEED, SUPER_USERS_ISKOOL_SEED } from '@/store/seeds';

describe('📬 COBERTURA TOTAL DE CORREO INSTITUCIONAL CEO — MULTI-TENANT UNIVERSAL', () => {

  describe('1. Colegios Existentes (IBIME, Juan Jacobo Rosseau, Laboratorio Sandbox)', () => {
    it('debe asignar tenantId aislado y canónico a IBIME', () => {
      const ibimeTenant = getTenantId('sch-ibime', 'e1000000-0000-0000-0000-000000000001', true);
      expect(ibimeTenant).toBe('e1000000-0000-0000-0000-000000000001');
      expect(getSchoolDomain('Instituto Bilingüe IBIME', 'ibime', 'sch-ibime')).toBe('ibime.edu.mx');
    });

    it('debe asignar tenantId aislado a UP Juan Jacobo Rosseau', () => {
      const jjrTenant = getTenantId('sch-jjrosseau', 'sch-jjrosseau', false);
      expect(jjrTenant).toBe('sch-jjrosseau');
      expect(getSchoolDomain('UP Juan Jacobo Rosseau', 'jjrosseau', 'sch-jjrosseau')).toBe('jjrosseau.edu.mx');
    });

    it('debe asignar tenantId aislado a Laboratorio Pedagógico (Sandbox)', () => {
      const sandboxTenant = getTenantId('sch-test-case', 'sch-test-case', false);
      expect(sandboxTenant).toBe('sch-test-case');
      expect(getSchoolDomain('Laboratorio Pedagógico (Sandbox)', 'laboratoriopedagogico', 'sch-test-case')).toBe('laboratoriopedagogico.edu.mx');
    });

    it('debe generar asuntos canónicos contextualizados al tenant correspondiente sin mezclar', () => {
      const ibimeMatters = generateDefaultMattersForSchool('Instituto Bilingüe IBIME', 'ibime.edu.mx', [], 'e1000000-0000-0000-0000-000000000001');
      const jjrMatters = generateDefaultMattersForSchool('UP Juan Jacobo Rosseau', 'jjrosseau.edu.mx', [], 'sch-jjrosseau');

      expect(ibimeMatters.length).toBeGreaterThan(0);
      expect(jjrMatters.length).toBeGreaterThan(0);
      expect(ibimeMatters[0].provenance_doc).toContain('e1000000-0000-0000-0000-000000000001');
      expect(jjrMatters[0].provenance_doc).toContain('sch-jjrosseau');
    });
  });

  describe('2. Colegios Nuevos (Dinámicos y de reciente registro)', () => {
    const newSchools = [
      { id: 'sch-oxford-2026', name: 'Colegio Británico Oxford', slug: 'oxford' },
      { id: 'sch-montessori-valle', name: 'Instituto Montessori del Valle', slug: 'montessori-valle' },
      { id: 'sch-cumbres-nuevo', name: 'Colegio Cumbres Lomas', slug: 'cumbres' }
    ];

    it('debe generar un tenantId unívoco y hermético para cualquier colegio nuevo', () => {
      const tenantIds = new Set();
      for (const school of newSchools) {
        const tenant = getTenantId(school.id, undefined, false);
        expect(tenant).toBe(school.id);
        expect(tenantIds.has(tenant)).toBe(false);
        tenantIds.add(tenant);
      }
    });

    it('debe resolver dominios institucionales coherentes para colegios nuevos', () => {
      expect(getSchoolDomain('Colegio Británico Oxford', 'oxford', 'sch-oxford-2026')).toBe('oxford.edu.mx');
      expect(getSchoolDomain('Instituto Montessori del Valle', 'montessori-valle', 'sch-montessori-valle')).toBe('montessori-valle.edu.mx');
    });

    it('debe generar expedientes herméticos con la ruta del nuevo tenant', () => {
      const matters = generateDefaultMattersForSchool('Colegio Británico Oxford', 'oxford.edu.mx', [], 'sch-oxford-2026');
      expect(matters.length).toBe(5);
      expect(matters[0].provenance_doc).toContain('Correo/sch-oxford-2026/');
    });
  });

  describe('3. Cuentas CEO Corporativas / B2B (Nexus Motors BMW, Retail, Tech)', () => {
    const corporateCEOs = STAFF_USERS_SEED.filter(u => u.role === 'ceo');

    it('debe existir registro para cada CEO corporativo en STAFF_USERS_SEED', () => {
      expect(corporateCEOs.length).toBeGreaterThanOrEqual(3);
      const emails = corporateCEOs.map(c => c.email);
      expect(emails).toContain('ceo@nexus-motors.mx');
      expect(emails).toContain('ceo@vanguardia-retail.mx');
      expect(emails).toContain('ceo@innovasoft-tech.com');
    });

    it('debe aislar el tenant corporativo de cada empresa B2B', () => {
      expect(getTenantId('emp-bmw', undefined, false)).toBe('emp-bmw');
      expect(getTenantId('emp-ventas', undefined, false)).toBe('emp-ventas');
      expect(getTenantId('emp-tech', undefined, false)).toBe('emp-tech');
    });
  });

  describe('4. CEOs Unilaterales y Directores Independientes', () => {
    it('debe soportar superusuarios de ISkool con acceso universal', () => {
      expect(SUPER_USERS_ISKOOL_SEED.length).toBeGreaterThanOrEqual(3);
      const emails = SUPER_USERS_ISKOOL_SEED.map(su => su.email);
      expect(emails).toContain('admin@iskool.edu.mx');
      expect(emails).toContain('tecnologia@iskool.edu.mx');
      expect(emails).toContain('pedagogia@iskool.edu.mx');
    });

    it('debe soportar directores de plantel único', () => {
      const directors = STAFF_USERS_SEED.filter(u => u.role === 'director');
      expect(directors.length).toBeGreaterThanOrEqual(3);
      const schools = directors.map(d => d.school_id);
      expect(schools).toContain('sch-jjrosseau');
      expect(schools).toContain('sch-test-case');
      expect(schools).toContain('sch-ibime');
    });
  });

  describe('5. Disponibilidad de la Consola en Todas las Vistas de Directores y CEOs', () => {
    it('src/app/admin/page.tsx debe contener el modal de correo y botones de acceso', () => {
      const code = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');
      expect(code).toContain('CEOEmailCommunicationsModal');
      expect(code).toContain('setIsAdminEmailModalOpen(true)');
    });

    it('src/app/director/page.tsx debe contener el modal de correo y botones para directores', () => {
      const code = fs.readFileSync(path.join(process.cwd(), 'src/app/director/page.tsx'), 'utf-8');
      expect(code).toContain('CEOEmailCommunicationsModal');
      expect(code).toContain('isEmailModalOpen');
      expect(code).toContain('Email Institucional & Triage');
      expect(code).toContain('Visión CEO');
    });

    it('src/app/ibime/portal/page.tsx debe contener el modal y botón directo para directores de IBIME', () => {
      const code = fs.readFileSync(path.join(process.cwd(), 'src/app/ibime/portal/page.tsx'), 'utf-8');
      expect(code).toContain('CEOEmailCommunicationsModal');
      expect(code).toContain('isEmailModalOpen');
      expect(code).toContain('Email & Triage');
    });

    it('src/app/portal-ceo/email/page.tsx debe conectar directamente a la suite CEOEmailCommunicationsModal', () => {
      const code = fs.readFileSync(path.join(process.cwd(), 'src/app/portal-ceo/email/page.tsx'), 'utf-8');
      expect(code).toContain('CEOEmailCommunicationsModal');
      expect(code).toContain('buildHoldingForInstitution');
    });

    it('CorporateEnterprisesSuperUserStudio.tsx debe contar con acceso al correo institucional CEO', () => {
      const code = fs.readFileSync(path.join(process.cwd(), 'src/components/admin/CorporateEnterprisesSuperUserStudio.tsx'), 'utf-8');
      expect(code).toContain('onOpenEmail');
    });
  });

  describe('6. Mejoras del Correo: Orden Cronológico Estricto y Normalización de Fechas', () => {
    it('parseEmailDateMs debe normalizar fechas en español con exactitud de milisegundos', () => {
      const oct16 = parseEmailDateMs('16 oct 09:22 hrs');
      const oct21 = parseEmailDateMs('21 oct 14:30 hrs');
      const hoy = parseEmailDateMs('Hoy 08:00 hrs');

      expect(oct16).toBeGreaterThan(0);
      expect(oct21).toBeGreaterThan(oct16);
      expect(hoy).toBeGreaterThan(oct16);
    });

    it('sortEmailsDescending debe ordenar estrictamente de más reciente a más antiguo', () => {
      const unsorted = [
        { id: '1', date_ms: 1000, timestamp: '16 oct 09:00 hrs', subject: 'A', from: 'a@test.com', snippet: '', quadrant: 'informativo' as any },
        { id: '2', date_ms: 5000, timestamp: '21 oct 15:00 hrs', subject: 'B', from: 'b@test.com', snippet: '', quadrant: 'informativo' as any },
        { id: '3', date_ms: 3000, timestamp: '18 oct 12:00 hrs', subject: 'C', from: 'c@test.com', snippet: '', quadrant: 'informativo' as any }
      ];

      const sorted = sortEmailsDescending(unsorted as any);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('mergeAndSortEmails debe fusionar sin duplicar y mantener el orden descendente', () => {
      const existing = [
        { id: 'e1', date_ms: 2000, timestamp: '17 oct 10:00 hrs', subject: 'Existente', from: 'a@test.com', snippet: '', quadrant: 'informativo' as any }
      ];
      const incoming = [
        { id: 'e1', date_ms: 2000, timestamp: '17 oct 10:00 hrs', subject: 'Existente Actualizado', from: 'a@test.com', snippet: '', quadrant: 'informativo' as any },
        { id: 'n1', date_ms: 4000, timestamp: '20 oct 10:00 hrs', subject: 'Nuevo', from: 'b@test.com', snippet: '', quadrant: 'informativo' as any }
      ];

      const merged = mergeAndSortEmails(existing as any, incoming as any);
      expect(merged.length).toBe(2);
      expect(merged[0].id).toBe('n1');
      expect(merged[1].id).toBe('e1');
    });
  });

  describe('📱 ADAPTACIÓN RESPONSIVA TOTAL Y AJUSTE VISUAL (PC, LAPTOP, TABLET Y CELULAR)', () => {
    const modalPath = path.join(process.cwd(), 'src', 'components', 'admin', 'CEOEmailCommunicationsModal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');

    it('el contenedor del modal debe adaptarse dinámicamente a celulares (100dvh) y pantallas mayores sin desbordar', () => {
      expect(modalContent).toContain('h-[100dvh] sm:h-[95vh]');
      expect(modalContent).toContain('max-h-[100dvh] sm:max-h-[95vh]');
      expect(modalContent).toContain('rounded-none sm:rounded-2xl lg:rounded-3xl');
      expect(modalContent).toContain('p-0 sm:p-2 md:p-3 lg:p-4');
    });

    it('el header de la consola de correo debe usar flex-nowrap estricto para evitar que los controles se pasen a la parte baja', () => {
      expect(modalContent).toMatch(/flex items-center justify-between shrink-0 border-b.*flex-nowrap/);
      expect(modalContent).toContain('flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0 ml-auto');
    });

    it('los temas deben desplegarse en un selector compacto con popover para no saturar horizontalmente la barra', () => {
      expect(modalContent).toContain('isThemeMenuOpen');
      expect(modalContent).toContain('setIsThemeMenuOpen');
      expect(modalContent).toContain('themeMenuRef');
      expect(modalContent).toContain('🏛️ Marfil Institucional');
      expect(modalContent).toContain('⬛ Pizarra Ejecutiva');
      expect(modalContent).toContain('🔷 Azul Real Académico');
      expect(modalContent).toContain('🌲 Verde Esmeralda');
      expect(modalContent).toContain('🍷 Borgoña Soberano');
      expect(modalContent).toContain('Estudio de Color Libre');
    });

    it('el título debe colapsar ordenadamente en resoluciones compactas (xl, sm, mobile)', () => {
      expect(modalContent).toContain('hidden xl:inline');
      expect(modalContent).toContain('hidden sm:inline xl:hidden');
      expect(modalContent).toContain('sm:hidden');
      expect(modalContent).toContain('Correo CEO');
    });

    it('el botón "Ponte al día" y el botón de cerrar deben permanecer anclados en la misma fila sin saltar a línea 2', () => {
      expect(modalContent).toContain('Ponte al día');
      expect(modalContent).toContain('aria-label="Cerrar modal"');
    });
  });

});

