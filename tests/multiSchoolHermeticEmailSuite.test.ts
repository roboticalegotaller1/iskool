import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { HermeticEmailBrainService } from '@/lib/services/hermetic-email-brain.service';
import {
  getSchoolDomain,
  getTenantId,
  generateDefaultMattersForSchool
} from '@/components/admin/CEOEmailCommunicationsModal';

describe('🏛️ SUITE DE CORREO INSTITUCIONAL HERMÉTICO & MULTI-COLEGIO (CEO & ADMINISTRATIVOS)', () => {
  const adminPagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'page.tsx');
  const ceoDashboardPath = path.join(process.cwd(), 'src', 'components', 'admin', 'CEOExecutiveDashboard.tsx');
  const emailModalPath = path.join(process.cwd(), 'src', 'components', 'admin', 'CEOEmailCommunicationsModal.tsx');
  const brainServicePath = path.join(process.cwd(), 'src', 'lib', 'services', 'hermetic-email-brain.service.ts');

  it('todos los archivos fuente requeridos deben existir', () => {
    expect(fs.existsSync(adminPagePath)).toBe(true);
    expect(fs.existsSync(ceoDashboardPath)).toBe(true);
    expect(fs.existsSync(emailModalPath)).toBe(true);
    expect(fs.existsSync(brainServicePath)).toBe(true);
  });

  const adminContent = fs.readFileSync(adminPagePath, 'utf-8');
  const ceoContent = fs.readFileSync(ceoDashboardPath, 'utf-8');
  const modalContent = fs.readFileSync(emailModalPath, 'utf-8');
  const brainContent = fs.readFileSync(brainServicePath, 'utf-8');

  describe('1. Activación Universal en Panel Administrativo (src/app/admin/page.tsx)', () => {
    it('debe importar CEOEmailCommunicationsModal', () => {
      expect(adminContent).toContain("import { CEOEmailCommunicationsModal } from '@/components/admin/CEOEmailCommunicationsModal'");
    });

    it('debe declarar el estado reactivo para abrir el modal en cualquier colegio', () => {
      expect(adminContent).toContain('const [isAdminEmailModalOpen, setIsAdminEmailModalOpen] = useState(false);');
    });

    it('debe incluir botón de acceso en el header administrativo de la escuela activa', () => {
      expect(adminContent).toContain('onClick={() => setIsAdminEmailModalOpen(true)}');
      expect(adminContent).toContain('Email Institucional');
    });

    it('debe incluir botón en la barra de navegación (tabs strip)', () => {
      expect(adminContent).toContain('Email & Triage');
    });

    it('debe incluir acceso directo desde las tarjetas del Directorio de Colegios', () => {
      expect(adminContent).toContain('Abrir Email Institucional, Triage Cognitivo y Conexión Google para');
    });

    it('debe renderizar CEOEmailCommunicationsModal vinculado a la institución activa', () => {
      expect(adminContent).toContain('<CEOEmailCommunicationsModal');
      expect(adminContent).toContain('holding={currentSchoolHolding}');
      expect(adminContent).toContain('schoolId={currentSchool?.id || effectiveSchoolId');
    });
  });

  describe('2. Activación Universal en Tablero Ejecutivo CEO (src/components/admin/CEOExecutiveDashboard.tsx)', () => {
    it('debe tener el botón Email & Triage visible permanentemente en el sidebar desktop para todo colegio', () => {
      expect(ceoContent).toContain('Bandeja de Correo Institucional, Triage Cognitivo y Conexión Google (15 Fases)');
      expect(ceoContent).toContain('onClick={() => setIsEmailModalOpen(true)}');
    });

    it('debe tener el botón Email & Triage en el cajón de navegación móvil', () => {
      expect(ceoContent).toContain('setIsEmailModalOpen(true)');
    });

    it('debe tener acceso directo en el header superior ejecutivo', () => {
      expect(ceoContent).toContain('Bandeja de Correo Institucional, Triage Cognitivo y Conexión Google (15 Fases)');
    });

    it('debe resolver dinámicamente el schoolId sin forzar hardcode a sch-ibime', () => {
      expect(ceoContent).toContain("schoolId={schoolId || holding?.id || currentInstitution?.id || 'sch-ibime'}");
    });
  });

  describe('3. Aislamiento Hermético Multi-Tenant (Persistencia por Colegio)', () => {
    it('debe usar claves de almacenamiento independientes para cada colegio (Google OAuth y manual)', () => {
      expect(modalContent).toContain('iskool_connected_email_${currentTenantId}');
      expect(modalContent).toContain('iskool_matters_${currentTenantId}');
      expect(modalContent).toContain('iskool_discarded_${currentTenantId}');
    });

    it('debe resolver dominios institucionales correctos para diferentes colegios', () => {
      const ibimeDomain = getSchoolDomain({ id: 'sch-ibime', name: 'Instituto Bilingüe IBIME', slug: 'ibime' });
      expect(ibimeDomain).toBe('ibime.edu.mx');

      const jjRosseauDomain = getSchoolDomain({ id: 'sch-jjrosseau', name: 'Colegio Jean Jacques Rousseau', slug: 'jjrosseau' });
      expect(jjRosseauDomain).toBe('jjrosseau.edu.mx');

      const oxfordDomain = getSchoolDomain({ id: 'sch-oxford', name: 'Oxford Academy', domain: 'oxford.edu.mx' });
      expect(oxfordDomain).toBe('oxford.edu.mx');

      const genericDomain = getSchoolDomain(undefined, 'sch-cervantes');
      expect(genericDomain).toBe('sch-cervantes.edu.mx');
    });

    it('debe resolver el tenantId adecuado preservando la identidad del colegio', () => {
      expect(getTenantId({ id: 'sch-montessori', name: 'Montessori' })).toBe('sch-montessori');
      expect(getTenantId(undefined, 'sch-colegio-mexico')).toBe('sch-colegio-mexico');
      expect(getTenantId(undefined, undefined)).toBe('sch-default');
    });

    it('debe generar asuntos clave específicos y personalizados para colegios no-IBIME', () => {
      const matters = generateDefaultMattersForSchool(
        'Colegio Jean Jacques Rousseau',
        'jjrosseau.edu.mx',
        [{ id: 'cmp-norte', name: 'Campus Norte' }],
        'sch-jjrosseau'
      );

      expect(matters.length).toBeGreaterThanOrEqual(3);
      expect(matters[0].matter_code).toMatch(/^MAT-[A-Z0-9]+-2026-001$/);
      expect(matters[0].title).toContain('Campus Norte');
      expect(matters[0].suggested_draft_reply).toContain('Colegio Jean Jacques Rousseau');
      expect(matters[2].sender_email).toContain('jjrosseau.edu.mx');
    });
  });

  describe('4. Motor de Inferencia Hermético (HermeticEmailBrainService)', () => {
    it('el servicio RAG debe aislar la memoria institucional filtrando estrictamente por tenant_id', async () => {
      expect(brainContent).toContain('WHERE tenant_id = current_tenant_id');
      expect(brainContent).toContain('tenant_id: currentTenantId');
    });

    it('debe procesar correos entrantes usando el contexto del colegio activo', async () => {
      const mockSession = {
        user: {
          id: 'usr-admin-oxford',
          email: 'director@oxford.edu.mx',
          app_metadata: {
            tenant_id: 'sch-oxford',
            institution_name: 'Oxford Academy'
          }
        }
      };

      const result = await HermeticEmailBrainService.processInboundEmail(
        {
          recipient_email: 'direccion@oxford.edu.mx',
          sender_name: 'Lic. Fernando Gómez',
          sender_email: 'padre@gmail.com',
          subject: 'Incidencia escolar grave',
          body_text: 'Solicito aclaración sobre la cuota de reinscripción anual en Campus Norte.',
          reincidence_count: 1
        },
        mockSession as any
      );

      expect(result.quadrant).toBeDefined();
      expect(result.why_shown_to_director).toBeDefined();
      expect(result.suggested_draft).toBeDefined();
      expect(result.suggested_draft.body).toContain('Oxford Academy');
    });
  });

  describe('5. Cumplimiento de Políticas Institucionales y Marca Blanca', () => {
    it('no debe exponer nombres comerciales prohibidos en ningún archivo modificado', () => {
      const checkWhiteLabel = (code: string) => {
        const lower = code.toLowerCase();
        expect(lower).not.toContain('gemini');
        expect(lower).not.toContain('obsidian');
        expect(lower).not.toContain('canvas lms');
      };

      checkWhiteLabel(adminContent);
      checkWhiteLabel(ceoContent);
      checkWhiteLabel(modalContent);
    });
  });

  describe('6. Blindaje Antifuga y Prevención de Contaminación Cruzada', () => {
    it('no debe contener fallbacks hardcodeados a cuentas personales ni contraseñas de aplicación fijas', () => {
      expect(modalContent).not.toContain('const rawVal = appPasswordInput || \'orqm');
      expect(modalContent).not.toContain('targetEmail = (connectedEmail || authUsername || \'israell35mac');
      expect(modalContent).not.toContain('targetEmail = connectedEmail || authUsername || \'israell35mac');
      expect(modalContent).not.toContain('isGmail ? \'orqmtfagqzevwihw\'');
    });

    it('debe garantizar remontaje React con key basada en colegio en admin/page.tsx y CEOExecutiveDashboard', () => {
      expect(adminContent).toContain('key={currentSchool?.id || effectiveSchoolId || \'sch-default\'}');
      expect(ceoContent).toContain('key={schoolId || currentInstitution?.id || holding?.id || \'sch-default\'}');
    });

    it('debe aislar el caché IMAP en backend estrictamente por combinación tenantId y usuario', () => {
      const imapServiceContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/services/imapClientService.ts'), 'utf-8');
      expect(imapServiceContent).toContain('const tenantKey = `${tenantId}:${cleanUser}`');
      expect(imapServiceContent).toContain('clearTenantInboxCache(tenantId: string, email?: string)');
    });
  });
});

