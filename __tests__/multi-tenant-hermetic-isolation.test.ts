// @vitest-environment node
/**
 * ============================================================================
 * SUITE DE SEGURIDAD QA: AISLAMIENTO HERMÉTICO MULTI-TENANT (BANK/MED-GRADE)
 * Archivo: __tests__/multi-tenant-hermetic-isolation.test.ts
 * ============================================================================
 * 
 * Verificación exhaustiva de:
 * 1. Intento de Lectura Cruzada (Cross-Tenant Leakage & Pen-Testing).
 * 2. Autenticación con Google Externo & Aprovisionamiento de Sandbox Aislado.
 * 3. Idempotencia y Estabilidad en Procesamiento en Vivo (<800ms).
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { 
  signLaboratorioSession, 
  verifyLaboratorioSession,
  resolveLaboratorioTenant,
  POST as authSessionPost,
  GET as authSessionGet
} from '@/app/api/auth/laboratorio-session/route';
import { 
  HermeticEmailBrainService, 
  InboundEmailDTO, 
  HermeticAuthSession 
} from '@/lib/services/hermetic-email-brain.service';
import { POST as processEmailPost } from '@/app/api/portal/ceo/laboratorio/process-email/route';
import { verifyMultiTenantToken, signMultiTenantToken } from '@/lib/auth/multiTenantSession';

describe('🛡️ QA SECURITY AUDIT: Aislamiento Hermético Multi-Tenant Cero Fugas', () => {

  const TENANT_A_IBIME = 'e1000000-0000-0000-0000-000000000001';
  const TENANT_B_ISKOOL = 'e2000000-0000-0000-0000-000000000002';

  const sessionTenantA: HermeticAuthSession = {
    user: {
      id: 'usr-ibime-director-qa',
      email: 'direccion@ibime.edu.mx',
      app_metadata: {
        tenant_id: TENANT_A_IBIME,
        role: 'CEO',
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false
      }
    },
    app_metadata: {
      tenant_id: TENANT_A_IBIME,
      role: 'CEO',
      institution_name: 'Instituto Bilingüe Ibime',
      is_isolated_sandbox: false
    }
  };

  const sessionTenantB: HermeticAuthSession = {
    user: {
      id: 'usr-iskool-ceo-qa',
      email: 'ceo@iskool.edu.mx',
      app_metadata: {
        tenant_id: TENANT_B_ISKOOL,
        role: 'CEO',
        institution_name: 'iSkool Ecosistema Educativo',
        is_isolated_sandbox: false
      }
    },
    app_metadata: {
      tenant_id: TENANT_B_ISKOOL,
      role: 'CEO',
      institution_name: 'iSkool Ecosistema Educativo',
      is_isolated_sandbox: false
    }
  };

  // =========================================================================
  // ESCENARIO 1: INTENTO DE LECTURA CRUZADA (CROSS-TENANT LEAKAGE)
  // =========================================================================
  describe('1. Intento de Lectura Cruzada (Cross-Tenant Leakage & Pen-Testing)', () => {
    
    it('PEN-TEST 01: Un usuario de Colegio A no debe recibir precedentes normativos ni datos de Colegio B', async () => {
      // Usuario autenticado en Colegio A consulta intencionalmente un término exclusivo de Colegio B
      const crossQueryEmail: InboundEmailDTO = {
        sender_email: 'infiltrado@externo.com',
        sender_name: 'Agente Auditor',
        subject: 'Consulta sobre Lineamientos de Gobernanza y Convivencia Escolar iSkool',
        body_text: 'Deseo consultar los lineamientos específicos de gobernanza y calendario de salida escalonada de iSkool.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(crossQueryEmail, sessionTenantA);

      // Cero fuga: Ningún documento de Colegio B debe figurar en la procedencia
      result.provenance.forEach((doc) => {
        expect(doc.tenant_id).toBe(TENANT_A_IBIME);
        expect(doc.source_path).not.toContain('iSkool');
        expect(doc.document_title).not.toContain('iSkool');
      });

      // La telemetría debe confirmar que la consulta se acotó estrictamente al tenant_id de Colegio A
      expect(result.telemetry.tenant_id).toBe(TENANT_A_IBIME);
      expect(result.telemetry.institution_name).toBe('Instituto Bilingüe Ibime');
    });

    it('PEN-TEST 02: Intento de forjar tenant_id en cabeceras o token debe ser rechazado', async () => {
      const now = Math.floor(Date.now() / 1000);
      
      // Token legítimo emitido para Colegio A
      const tokenA = await signLaboratorioSession({
        tenant_id: TENANT_A_IBIME,
        role: 'CEO',
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false,
        email: 'direccion@ibime.edu.mx',
        user_id: 'usr-ibime-qa',
        auth_provider: 'google',
        issued_at: now,
        expires_at: now + 3600
      });

      // El atacante intenta enviar el token legítimo de Colegio A pero forzando x-resolved-tenant-id hacia Colegio B
      const req = new NextRequest('http://localhost:3000/api/portal/ceo/laboratorio/process-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-resolved-tenant-id': TENANT_B_ISKOOL, // Inyección forjada
          cookie: `laboratorio_session=${tokenA}`
        },
        body: JSON.stringify({
          sender_email: 'padre@familia.com',
          subject: 'Consulta confidencial',
          body_text: 'Intento de consultar datos de Colegio B con token de Colegio A'
        })
      });

      const res = await processEmailPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      // El servidor DEBE IGNORAR la cabecera forjada y aplicar estrictamente el tenant criptográfico de Colegio A
      expect(json.triage.telemetry.tenant_id).toBe(TENANT_A_IBIME);
      expect(res.headers.get('x-resolved-tenant-id')).toBe(TENANT_A_IBIME);
    });

    it('PEN-TEST 03: Validación estricta con expectedTenant previene usurpación de identidad cross-tenant', async () => {
      const iskoolToken = await signMultiTenantToken({
        id: 'usr-iskool-tester',
        email: 'tester@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'admin'
      });

      // Intentar validar esperando estrictamente tenant 'ibime'
      const verifiedWithIbime = await verifyMultiTenantToken(iskoolToken, { expectedTenant: 'ibime' });
      expect(verifiedWithIbime).toBeNull(); // Acceso denegado de forma hermética

      // Validar con su propio tenant esperado 'iskool'
      const verifiedWithIskool = await verifyMultiTenantToken(iskoolToken, { expectedTenant: 'iskool' });
      expect(verifiedWithIskool).not.toBeNull();
      expect(verifiedWithIskool?.tenant_id).toBe('iskool');
    });
  });

  // =========================================================================
  // ESCENARIO 2: AUTENTICACIÓN CON GOOGLE EXTERNO & SANDBOX DINÁMICO
  // =========================================================================
  describe('2. Autenticación con Google Externo & Aprovisionamiento de Sandbox Aislado', () => {

    it('debe asignar un sandbox_tenant temporal con bandera is_isolated_sandbox ante login con @gmail.com', async () => {
      const externalEmail = 'evaluador.externo@gmail.com';
      
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'google',
          email: externalEmail
        })
      });

      const res = await authSessionPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.session.is_isolated_sandbox).toBe(true);
      expect(json.app_metadata.is_isolated_sandbox).toBe(true);
      expect(json.app_metadata.role).toBe('CEO');
      expect(json.app_metadata.institution_name).toContain('Sandbox Pedagógico (evaluador.externo)');
      
      // El tenant_id asignado NO debe coincidir con ninguno de los colegios de producción
      expect(json.session.tenant_id).not.toBe(TENANT_A_IBIME);
      expect(json.session.tenant_id).not.toBe(TENANT_B_ISKOOL);
      expect(json.session.tenant_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('las pruebas ejecutadas en un sandbox aislado jamás deben exponer ni contaminar bandejas de producción', async () => {
      const sandboxResolution = resolveLaboratorioTenant('auditor.libre@gmail.com');
      
      const sandboxSession: HermeticAuthSession = {
        user: {
          id: 'usr-sandbox-auditor',
          email: 'auditor.libre@gmail.com',
          app_metadata: {
            tenant_id: sandboxResolution.tenant_id,
            role: 'CEO',
            institution_name: sandboxResolution.institution_name,
            is_isolated_sandbox: true
          }
        },
        app_metadata: {
          tenant_id: sandboxResolution.tenant_id,
          role: 'CEO',
          institution_name: sandboxResolution.institution_name,
          is_isolated_sandbox: true
        }
      };

      const testEmail: InboundEmailDTO = {
        sender_email: 'padre.prueba@externo.org',
        subject: 'Prueba de estrés en sandbox',
        body_text: 'Evaluación de protocolo y tiempo de respuesta sin afectar la producción de IBIME ni iSkool.'
      };

      const result = await HermeticEmailBrainService.processInboundEmail(testEmail, sandboxSession);

      // La procedencia debe estar confinada al sandbox exclusivo
      result.provenance.forEach((doc) => {
        expect(doc.tenant_id).toBe(sandboxResolution.tenant_id);
        expect(doc.source_path).toContain('sandbox');
        expect(doc.source_path).not.toContain('IBIME');
        expect(doc.source_path).not.toContain('iSkool');
      });

      expect(result.telemetry.tenant_id).toBe(sandboxResolution.tenant_id);
    });
  });

  // =========================================================================
  // ESCENARIO 3: IDEMPOTENCIA Y PROCESAMIENTO EN VIVO (<800ms)
  // =========================================================================
  describe('3. Idempotencia y Procesamiento en Vivo', () => {

    it('la inyección repetida del mismo correo debe producir resultados deterministas y estables sin corromper SLAs', async () => {
      const recurrentEmail: InboundEmailDTO = {
        sender_email: 'sra.garcia@familia.com',
        sender_name: 'Sra. Beatriz García',
        subject: 'Solicitud de factura CFDI colegiatura octubre',
        body_text: 'Requiero la factura correspondiente al pago de colegiatura con complemento educativo.',
        reincidence_count: 1
      };

      // Inyección 1: Primer procesamiento
      const result1 = await HermeticEmailBrainService.processInboundEmail(recurrentEmail, sessionTenantA);
      
      // Inyección 2: Segundo procesamiento consecutivo idéntico
      const result2 = await HermeticEmailBrainService.processInboundEmail(recurrentEmail, sessionTenantA);

      // Inyección 3: Tercer procesamiento consecutivo idéntico
      const result3 = await HermeticEmailBrainService.processInboundEmail(recurrentEmail, sessionTenantA);

      // 1. Verificación de Idempotencia de Cuadrante
      expect(result1.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result2.quadrant).toBe('DELEGADO_CON_SLA');
      expect(result3.quadrant).toBe('DELEGADO_CON_SLA');

      // 2. Verificación de SLA y Asignación Inmutable
      expect(result1.sla_hours).toBe(24);
      expect(result2.sla_hours).toBe(24);
      expect(result3.sla_hours).toBe(24);
      expect(result1.assigned_department).toBe(result2.assigned_department);
      expect(result2.assigned_department).toBe(result3.assigned_department);

      // 3. Verificación de Categoría e Intención
      expect(result1.category).toBe('Cobranza y Facturación');
      expect(result2.category).toBe('Cobranza y Facturación');
      expect(result3.category).toBe('Cobranza y Facturación');

      // 4. Verificación de Telemetría (<800ms en todas las llamadas)
      expect(result1.telemetry.latency_ms).toBeLessThan(800);
      expect(result2.telemetry.latency_ms).toBeLessThan(800);
      expect(result3.telemetry.latency_ms).toBeLessThan(800);
    });

    it('debe mantener respuesta en menos de 800ms incluso ante casos de reincidencia crítica', async () => {
      const criticalEmail: InboundEmailDTO = {
        sender_email: 'familia.critica@ibime.edu.mx',
        sender_name: 'Lic. Javier Morales',
        subject: 'Urgente: Agresión física grave en patio escolar',
        body_text: 'Reporto agresión física directa contra mi hijo durante el receso. Exijo reunión urgente.',
        reincidence_count: 4
      };

      const result = await HermeticEmailBrainService.processInboundEmail(criticalEmail, sessionTenantA);
      
      expect(result.quadrant).toBe('ATENCION_CEO');
      expect(result.urgency).toBe('CRITICA');
      expect(result.sla_hours).toBe(12);
      expect(result.telemetry.latency_ms).toBeLessThan(800);
    });
  });
});
