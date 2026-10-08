import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  CeoEmailSettingsService 
} from '../src/lib/services/ceoEmailSettingsService';
import { 
  HermeticEmailBrainService,
  InboundEmailDTO,
  HermeticAuthSession 
} from '../src/lib/services/hermetic-email-brain.service';

describe('⚙️ AJUSTES EJECUTIVOS DEL CEO (REGLAS VIP, DELEGADOS, COMUNICADOS OFICIALES)', () => {
  const tenantId = 'e1000000-0000-0000-0000-000000000001';
  const authSession: HermeticAuthSession = {
    user: {
      id: 'ceo-user-1',
      email: 'direccion@ibime.edu.mx',
      app_metadata: {
        tenant_id: tenantId,
        role: 'CEO',
        institution_name: 'Instituto Bilingüe IBIME',
        is_isolated_sandbox: false
      }
    },
    tenant_id: tenantId,
    institution_name: 'Instituto Bilingüe IBIME',
    role: 'CEO',
    is_isolated_sandbox: false
  };

  beforeEach(() => {
    // Resetear configuración a estado limpio para el tenant
    const fresh = CeoEmailSettingsService.resetAllToDefault(tenantId);
    expect(fresh.tenantId).toBe(tenantId);
  });

  describe('1. Correos de Alta Importancia (Reglas VIP)', () => {
    it('debe tener precargadas las reglas VIP institucionales (Supervisión SEP, Presidencia Patronato, Jurídico)', () => {
      const settings = CeoEmailSettingsService.getSettings(tenantId);
      expect(settings.vipEmails.length).toBeGreaterThanOrEqual(3);

      const hasSep = settings.vipEmails.some(r => r.email.includes('supervision.zona@edomex.gob.mx'));
      const hasPresidencia = settings.vipEmails.some(r => r.email.includes('presidente.patronato@ibime.edu.mx'));
      const hasJuridico = settings.vipEmails.some(r => r.email.includes('juridico.escolar@despacholegal.com'));

      expect(hasSep).toBe(true);
      expect(hasPresidencia).toBe(true);
      expect(hasJuridico).toBe(true);
    });

    it('debe permitir dar de alta un nuevo correo VIP y persistirlo', () => {
      const newRule = CeoEmailSettingsService.addVipEmail(tenantId, {
        email: 'secretario.educacion@edomex.gob.mx',
        contactName: 'Mtro. Miguel Gómez (Secretario)',
        organization: 'Secretaría de Educación',
        reason: 'Titular de la entidad educativa estatal',
        enabled: true
      });

      expect(newRule.id).toBeDefined();
      expect(newRule.email).toBe('secretario.educacion@edomex.gob.mx');

      const isVip = CeoEmailSettingsService.isVipEmail(tenantId, 'secretario.educacion@edomex.gob.mx');
      expect(isVip).toBe(true);
    });

    it('🔴 REGLA SUPREMA: Todo correo recibido de una dirección VIP DEBE catalogarse como "ATENCION_CEO" con urgencia CRITICA aunque su texto sea ordinario', async () => {
      // Registrar un correo VIP de prueba
      CeoEmailSettingsService.addVipEmail(tenantId, {
        email: 'consejero.distinguido@patronato.org',
        contactName: 'Ing. Rodrigo Fox',
        organization: 'Consejo Consultivo',
        reason: 'Decisiones de alta envergadura',
        enabled: true
      });

      // El correo entrante tiene un asunto y cuerpo totalmente ordinario que normalmente sería informativo
      const routineEmail: InboundEmailDTO = {
        sender_name: 'Ing. Rodrigo Fox',
        sender_email: 'consejero.distinguido@patronato.org',
        subject: 'Saludos cordiales y confirmación de asistencia',
        body_text: 'Estimada dirección, un gusto saludarles. Les escribo para confirmar que asistiré al evento del próximo mes.',
        reincidence_count: 1
      };

      const result = await HermeticEmailBrainService.processInboundEmail(routineEmail, authSession);

      // Debe elevarse a ATENCION_CEO de manera automática por regla VIP
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.category).toContain('Regla VIP');
      expect(result.assigned_department).toBe('Dirección General / CEO');
      expect(result.why_shown_to_director).toContain('consejero.distinguido@patronato.org');
    });

    it('debe permitir eliminar un correo de la lista VIP', () => {
      const rule = CeoEmailSettingsService.addVipEmail(tenantId, {
        email: 'temporal@sep.gob.mx',
        contactName: 'Inspector Temporal',
        organization: 'SEP',
        reason: 'Inspección de una sola ocasión',
        enabled: true
      });

      const removed = CeoEmailSettingsService.removeVipEmail(tenantId, rule.id);
      expect(removed).toBe(true);

      const stillVip = CeoEmailSettingsService.isVipEmail(tenantId, 'temporal@sep.gob.mx');
      expect(stillVip).toBe(false);
    });
  });

  describe('2. Delegados por Sección (Enrutamiento Dinámico & SLA)', () => {
    it('debe contar con las 5 secciones clave configuradas (Cobranza, Transporte, Control Escolar, Servicio Médico, Convivencia)', () => {
      const settings = CeoEmailSettingsService.getSettings(tenantId);
      expect(settings.delegates.length).toBe(5);

      const sectionKeys = settings.delegates.map(d => d.sectionKey);
      expect(sectionKeys).toContain('cobranza');
      expect(sectionKeys).toContain('transporte');
      expect(sectionKeys).toContain('control_escolar');
      expect(sectionKeys).toContain('servicio_medico');
      expect(sectionKeys).toContain('convivencia');
    });

    it('debe permitir cambiar el correo y SLA del delegado de una sección y verificar su efecto funcional en el triage', async () => {
      // 1. Modificar el delegado de Cobranza a una dirección personalizada
      const updated = CeoEmailSettingsService.updateDelegate(tenantId, 'cobranza', {
        delegateName: 'Lic. Mariana Zavala (Directora de Finanzas)',
        delegateEmail: 'mariana.finanzas@ibime.edu.mx',
        slaHours: 12
      });

      expect(updated).not.toBeNull();
      expect(updated?.delegateEmail).toBe('mariana.finanzas@ibime.edu.mx');
      expect(updated?.slaHours).toBe(12);

      // 2. Procesar un correo de solicitud de factura / colegiatura
      const invoiceEmail: InboundEmailDTO = {
        sender_name: 'Padre de Familia',
        sender_email: 'padre@empresa.com',
        subject: 'Solicitud de factura fiscal CFDI colegiatura octubre',
        body_text: 'Requiero por favor la factura correspondiente al pago de colegiatura efectuado hoy.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(invoiceEmail, authSession);

      // 3. Comprobar que fue derivado a la nueva delegada con el SLA de 12 horas
      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.assigned_role).toBe('Lic. Mariana Zavala (Directora de Finanzas)');
      expect(result.delegate_email).toBe('mariana.finanzas@ibime.edu.mx');
      expect(result.sla_hours).toBe(12);
      expect(result.recommended_action).toContain('mariana.finanzas@ibime.edu.mx');
    });
  });

  describe('3. Plantillas de Comunicados Oficiales (Personalización de Default)', () => {
    it('debe ofrecer las 5 plantillas canónicas más usadas', () => {
      const settings = CeoEmailSettingsService.getSettings(tenantId);
      expect(settings.templates.length).toBeGreaterThanOrEqual(5);

      const templateIds = settings.templates.map(t => t.id);
      expect(templateIds).toContain('tpl-cte');
      expect(templateIds).toContain('tpl-salvaguarda');
      expect(templateIds).toContain('tpl-cobranza');
      expect(templateIds).toContain('tpl-transporte');
      expect(templateIds).toContain('tpl-circular');
    });

    it('debe permitir al CEO editar un comunicado y guardarlo como su predeterminado oficial', () => {
      const customSubject = 'Convocatoria Extraordinaria a Consejo Técnico: Prioridades Estratégicas 2026';
      const customBody = 'Estimado equipo docente y directores de {COLEGIO}:\n\nPor este conducto convoco a la sesión extraordinaria de Consejo Técnico...\n\nAtentamente,\n{DIRECTOR}';

      const saved = CeoEmailSettingsService.saveCustomDefaultTemplate(
        tenantId,
        'tpl-cte',
        customSubject,
        customBody
      );

      expect(saved).not.toBeNull();
      expect(saved?.defaultSubject).toBe(customSubject);
      expect(saved?.defaultBody).toBe(customBody);
      expect(saved?.isCustomDefault).toBe(true);

      // Al consultar la configuración del tenant debe devolver la versión personalizada
      const current = CeoEmailSettingsService.getSettings(tenantId);
      const cteTpl = current.templates.find(t => t.id === 'tpl-cte');
      expect(cteTpl?.defaultSubject).toBe(customSubject);
      expect(cteTpl?.isCustomDefault).toBe(true);
    });

    it('debe permitir restablecer una plantilla a su versión estándar de fábrica', () => {
      // Primero personalizarla
      CeoEmailSettingsService.saveCustomDefaultTemplate(
        tenantId,
        'tpl-cte',
        'Asunto Temporal',
        'Cuerpo Temporal'
      );

      // Restablecerla
      const reset = CeoEmailSettingsService.resetTemplateToDefault(tenantId, 'tpl-cte');
      expect(reset).not.toBeNull();
      expect(reset?.isCustomDefault).toBe(false);
      expect(reset?.defaultSubject).toContain('Consejo Técnico Escolar');
    });
  });

  describe('4. Interfaz de Usuario y Estructura en CEOEmailCommunicationsModal', () => {
    const modalPath = path.join(
      process.cwd(),
      'src',
      'components',
      'admin',
      'CEOEmailCommunicationsModal.tsx'
    );

    const fileContent = fs.readFileSync(modalPath, 'utf8');

    it('debe tener el botón "Ajustes" ubicado estrictamente debajo de "ROI & Telemetría"', () => {
      const roiIndex = fileContent.indexOf("setActiveTab('roi')");
      const ajustesIndex = fileContent.indexOf("setActiveTab('ajustes')");

      expect(roiIndex).toBeGreaterThan(-1);
      expect(ajustesIndex).toBeGreaterThan(-1);
      expect(ajustesIndex).toBeGreaterThan(roiIndex);

      expect(fileContent).toContain('id="ceo-settings-nav-btn"');
      expect(fileContent).toContain('<Sliders');
      expect(fileContent).toContain('Ajustes');
    });

    it('debe implementar la vista de Ajustes con los 3 submódulos exigidos', () => {
      expect(fileContent).toContain("activeTab === 'ajustes'");
      expect(fileContent).toContain('Correos de Alta Importancia (VIP)');
      expect(fileContent).toContain('Delegados por Sección');
      expect(fileContent).toContain('Comunicados Predeterminados');
      expect(fileContent).toContain('handleRunLiveVipTest');
      expect(fileContent).toContain('handleRunLiveDelegateTest');
      expect(fileContent).toContain('handleSaveCustomDefaultTemplate');
    });

    it('debe cumplir de forma rigurosa con la Regla No Negociable 1 (cero marcas comerciales)', () => {
      const lower = fileContent.toLowerCase();
      expect(lower).not.toContain('gemini');
      expect(lower).not.toContain('obsidian');
      expect(lower).not.toContain('canvas lms');
    });
  });
});
