import { describe, it, expect } from 'vitest';
import { 
  HermeticEmailBrainService,
  InboundEmailDTO,
  HermeticAuthSession
} from '@/lib/services/hermetic-email-brain.service';
import { signLaboratorioSession } from '@/app/api/auth/laboratorio-session/route';
import { POST } from '@/app/api/portal/ceo/laboratorio/process-email/route';
import { NextRequest } from 'next/server';

describe('🧠 MOTOR DE IA HERMÉTICO: Inferencia, Búsqueda Vectorial Aislada y Triage', () => {

  const ibimeSession: HermeticAuthSession = {
    user: {
      id: 'usr-ibime-ceo',
      email: 'director@ibime.edu.mx',
      app_metadata: {
        tenant_id: 'e1000000-0000-0000-0000-000000000001',
        role: 'CEO',
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false
      }
    },
    app_metadata: {
      tenant_id: 'e1000000-0000-0000-0000-000000000001',
      role: 'CEO',
      institution_name: 'Instituto Bilingüe Ibime',
      is_isolated_sandbox: false
    }
  };

  const iskoolSession: HermeticAuthSession = {
    user: {
      id: 'usr-iskool-ceo',
      email: 'ceo@iskool.edu.mx',
      app_metadata: {
        tenant_id: 'e2000000-0000-0000-0000-000000000002',
        role: 'CEO',
        institution_name: 'iSkool Ecosistema Educativo',
        is_isolated_sandbox: false
      }
    },
    app_metadata: {
      tenant_id: 'e2000000-0000-0000-0000-000000000002',
      role: 'CEO',
      institution_name: 'iSkool Ecosistema Educativo',
      is_isolated_sandbox: false
    }
  };

  const sandboxSession: HermeticAuthSession = {
    user: {
      id: 'usr-sandbox-guest',
      email: 'guest.evaluador@gmail.com',
      app_metadata: {
        tenant_id: '99999999-9999-4999-9999-999999999999',
        role: 'CEO',
        institution_name: 'Sandbox Pedagógico (guest.evaluador)',
        is_isolated_sandbox: true
      }
    },
    app_metadata: {
      tenant_id: '99999999-9999-4999-9999-999999999999',
      role: 'CEO',
      institution_name: 'Sandbox Pedagógico (guest.evaluador)',
      is_isolated_sandbox: true
    }
  };

  describe('1. Validación Obligatoria de tenant_id (Regla Técnica 1)', () => {
    it('debe arrojar error si la sesión no posee tenant_id asignado', async () => {
      const invalidSession: HermeticAuthSession = {
        user: { id: 'usr-anon', email: 'anon@test.com' }
      };

      const email: InboundEmailDTO = {
        sender_email: 'familia@test.com',
        subject: 'Consulta general',
        body_text: 'Duda sobre el horario'
      };

      await expect(
        HermeticEmailBrainService.processInboundEmail(email, invalidSession)
      ).rejects.toThrow('Acceso denegado: Sesión sin tenant asignado.');
    });
  });

  describe('2. Aislamiento Estricto de Búsqueda Vectorial y Procedencia RAG', () => {
    it('debe consultar ÚNICAMENTE documentos del tenant IBIME sin filtrar datos de iSkool', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'padre@familia.com',
        subject: 'Urgente: Acoso escolar y conflicto',
        body_text: 'Reportamos situación de agresión y acoso escolar en Campus Montes.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.provenance.length).toBeGreaterThan(0);

      // Toda la procedencia debe pertenecer estrictamente a IBIME
      result.provenance.forEach((doc) => {
        expect(doc.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
        expect(doc.source_path).toContain('IBIME');
        expect(doc.source_path).not.toContain('iSkool');
      });
    });

    it('debe consultar ÚNICAMENTE documentos del tenant iSkool sin filtrar datos de IBIME', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'tutor@escuela.com',
        subject: 'Consulta sobre el festival y horario de salida',
        body_text: '¿A qué hora es la salida escalonada por el festival del viernes?'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, iskoolSession);
      expect(result.provenance.length).toBeGreaterThan(0);

      result.provenance.forEach((doc) => {
        expect(doc.tenant_id).toBe('e2000000-0000-0000-0000-000000000002');
        expect(doc.source_path).toContain('iSkool');
        expect(doc.source_path).not.toContain('IBIME');
      });
    });

    it('debe mantener aislamiento total en entornos sandbox sin exponer normativas de otros colegios', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'evaluador@gmail.com',
        subject: 'Prueba de convivencia',
        body_text: 'Conflicto grave en el aula de prueba.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, sandboxSession);
      result.provenance.forEach((doc) => {
        expect(doc.tenant_id).toBe('99999999-9999-4999-9999-999999999999');
        expect(doc.source_path).toContain('sandbox');
        expect(doc.source_path).not.toContain('IBIME');
        expect(doc.source_path).not.toContain('iSkool');
      });
    });
  });

  describe('3. Clasificación en 4 Cuadrantes en Tiempo Real', () => {
    it('🔴 ATENCION_CEO: debe clasificar incidencias de acoso, violencia o riesgo legal como ATENCION_CEO con SLA de 12h', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'mama.victima@ibime.edu.mx',
        sender_name: 'Sra. Patricia Mendoza',
        subject: 'Urgente: Acoso escolar recurrente y agresión física en recreo',
        body_text: 'Mi hijo volvió a ser agredido físicamente en el recreo de 5º B. Exijo reunión urgente con Dirección General o procederemos legalmente.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.sla_hours).toBe(12);
      expect(result.assigned_department).toBe('Dirección General / CEO');
      expect(result.why_shown_to_director).toContain('gobernanza o riesgo normativo');
      expect(result.suggested_draft.can_auto_send).toBe(false);
      expect(result.suggested_draft.body).toContain('reunión presencial en Dirección General');
    });

    it('🔴 ATENCION_CEO: debe clasificar reincidencia elevada (>= 3 comunicaciones) como ATENCION_CEO', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'padre.inconforme@gmail.com',
        sender_name: 'Ing. Carlos Ruiz',
        subject: 'Tercera comunicación: falta de profesor en taller de robótica',
        body_text: 'Es la tercera vez que escribo este mes reportando que el grupo sigue sin suplente.',
        reincidence_count: 4
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.urgency).toBe('ALTA');
      expect(result.why_shown_to_director).toContain('reincidencia elevada');
    });

    it('🟡 DELEGADO_CON_SLA: debe canalizar solicitudes de facturación a Cobranza con SLA de 24h', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'fiscal@empresa.com',
        sender_name: 'Lic. Claudia Nava',
        subject: 'Solicitud de factura CFDI colegiatura octubre',
        body_text: 'Requiero factura con complemento educativo de la colegiatura correspondiente al mes en curso.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.category).toBe('Cobranza y Facturación');
      expect(result.sla_hours).toBe(24);
      expect(result.suggested_draft.can_auto_send).toBe(true);
    });

    it('🟡 DELEGADO_CON_SLA: debe canalizar trámites de boleta o kardex SEP a Secretaría con SLA de 48h', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'tutor@gmail.com',
        sender_name: 'Dr. Fernando Ortiz',
        subject: 'Solicitud de constancia de estudios y kardex oficial SEP',
        body_text: 'Necesitamos el kardex oficial de secundaria para trámite de beca deportiva.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.category).toBe('Control Escolar y Trámites');
      expect(result.sla_hours).toBe(48);
    });

    it('🟡 DELEGADO_CON_SLA: debe canalizar incidencias de ruta escolar a Prefectura / Transporte con SLA de 24h', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'familia.transporte@gmail.com',
        sender_name: 'Mtra. Elena Torres',
        subject: 'Demora recurrente en Ruta 4 matutina',
        body_text: 'El camión de la Ruta 4 llegó con 20 minutos de retraso a la parada central.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result.category).toBe('Logística y Transporte');
      expect(result.sla_hours).toBe(24);
    });

    it('🔵 INFORMATIVO: debe catalogar confirmaciones o salutaciones como INFORMATIVO para archivo', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'familia.salazar@gmail.com',
        subject: 'Confirmación de asistencia a la escuela para padres',
        body_text: 'Confirmamos con gusto nuestra presencia en la plática de orientación.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('INFORMATIVO');
      expect(result.urgency).toBe('BAJA');
      expect(result.why_shown_to_director).toContain('no requiere gestión ejecutiva');
    });

    it('⚪ SPAM_DESCARTADO: debe descartar publicidad no deseada o promociones comerciales', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'promos@creditos-faciles.biz',
        subject: '¡Felicidades! Préstamo inmediato sin buró preaprobado',
        body_text: 'Obtén dinero en efectivo sin buró de crédito ni comprobantes.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.quadrant).toBe('SPAM_DESCARTADO');
      expect(result.urgency).toBe('BAJA');
      expect(result.suggested_draft.can_auto_send).toBe(false);
    });
  });

  describe('4. Telemetría en Tiempo Real (<800ms)', () => {
    it('debe ejecutar el pipeline cognitivo completo en menos de 800 milisegundos', async () => {
      const email: InboundEmailDTO = {
        sender_email: 'tutor@ibime.edu.mx',
        subject: 'Aclaración de pago',
        body_text: 'Duda sobre el recargo aplicado en la mensualidad.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(email, ibimeSession);
      expect(result.telemetry.latency_ms).toBeLessThan(800);
      expect(result.telemetry.vector_search_ms).toBeGreaterThanOrEqual(0);
      expect(result.telemetry.inference_ms).toBeGreaterThanOrEqual(0);
      expect(result.telemetry.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
    });
  });

  describe('5. Endpoint Route Handler (/api/portal/ceo/laboratorio/process-email)', () => {
    it('debe procesar exitosamente un correo y devolver la estructura JSON de triage ante una sesión válida', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = await signLaboratorioSession({
        tenant_id: 'e1000000-0000-0000-0000-000000000001',
        role: 'CEO',
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false,
        email: 'director@ibime.edu.mx',
        user_id: 'usr-ibime-ceo',
        auth_provider: 'google',
        issued_at: now,
        expires_at: now + 3600
      });

      const req = new NextRequest('http://localhost:3000/api/portal/ceo/laboratorio/process-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `laboratorio_session=${token}`
        },
        body: JSON.stringify({
          sender_email: 'mama.alumna@gmail.com',
          sender_name: 'Gabriela S.',
          subject: 'Demora en Ruta 4',
          body_text: 'El camión se demoró 25 minutos esta mañana.'
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.triage.quadrant).toBe('DELEGADO_CON_SLA');
      expect(json.triage.assigned_department).toBe('Coordinación de Logística y Prefectura');
      expect(json.triage.telemetry.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');

      // Verificar cabeceras de auditoría perimetral
      expect(res.headers.get('x-resolved-tenant-id')).toBe('e1000000-0000-0000-0000-000000000001');
      expect(res.headers.get('x-quadrant')).toBe('DELEGADO_CON_SLA');
    });

    it('debe responder HTTP 401 si no se suministra cookie o token de sesión', async () => {
      const req = new NextRequest('http://localhost:3000/api/portal/ceo/laboratorio/process-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_email: 'test@test.com',
          subject: 'Prueba sin login',
          body_text: 'Contenido'
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.code).toBe('UNAUTHENTICATED');
    });
  });
});
