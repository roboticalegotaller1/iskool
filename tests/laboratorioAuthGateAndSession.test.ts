import { describe, it, expect } from 'vitest';
import { 
  resolveLaboratorioTenant, 
  signLaboratorioSession, 
  verifyLaboratorioSession,
  POST,
  GET,
  DELETE
} from '@/app/api/auth/laboratorio-session/route';
import { NextRequest } from 'next/server';

describe('🛡️ IAM & BOUNDED CONTEXT: Laboratorio Pedagógico Auth Gate & Sesión Dinámica', () => {

  describe('1. Resolución Dinámica de Bounded Contexts por Dominio de Correo', () => {
    it('debe mapear correos @ibime.edu.mx al tenant oficial de IBIME con rol CEO', () => {
      const result = resolveLaboratorioTenant('director@ibime.edu.mx');
      expect(result.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
      expect(result.institution_name).toBe('Instituto Bilingüe Ibime');
      expect(result.is_isolated_sandbox).toBe(false);
    });

    it('debe mapear subdominios o variaciones de IBIME al tenant oficial', () => {
      const result = resolveLaboratorioTenant('rectoria@campus-coacalco.ibime.edu.mx');
      expect(result.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
      expect(result.institution_name).toBe('Instituto Bilingüe Ibime');
      expect(result.is_isolated_sandbox).toBe(false);
    });

    it('debe mapear correos @iskool.edu.mx al tenant oficial de iSkool Core', () => {
      const result = resolveLaboratorioTenant('ceo@iskool.edu.mx');
      expect(result.tenant_id).toBe('e2000000-0000-0000-0000-000000000002');
      expect(result.institution_name).toBe('iSkool Ecosistema Educativo');
      expect(result.is_isolated_sandbox).toBe(false);
    });

    it('debe aprovisionar dinámicamente un sandbox hermético para cuentas @gmail.com', () => {
      const result = resolveLaboratorioTenant('pedagogo.investigador@gmail.com');
      expect(typeof result.tenant_id).toBe('string');
      // Debe tener formato UUID válido
      expect(result.tenant_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.institution_name).toContain('Sandbox Pedagógico (pedagogo.investigador)');
      expect(result.is_isolated_sandbox).toBe(true);
    });

    it('debe aprovisionar dinámicamente un sandbox hermético para dominios institucionales externos no federados', () => {
      const result = resolveLaboratorioTenant('direccion@colegio-montessori-nuevo.edu.mx');
      expect(typeof result.tenant_id).toBe('string');
      expect(result.tenant_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.institution_name).toBe('Sandbox Institucional (colegio-montessori-nuevo.edu.mx)');
      expect(result.is_isolated_sandbox).toBe(true);
    });
  });

  describe('2. Motor Criptográfico HMAC-SHA256 de Sesión Hermética', () => {
    it('debe firmar y verificar exitosamente un token de sesión del Laboratorio', async () => {
      const now = Math.floor(Date.now() / 1000);
      const metadata = {
        tenant_id: 'e1000000-0000-0000-0000-000000000001',
        role: 'CEO' as const,
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false,
        email: 'director@ibime.edu.mx',
        user_id: 'usr-ibime-ceo-01',
        auth_provider: 'google' as const,
        issued_at: now,
        expires_at: now + 3600
      };

      const token = await signLaboratorioSession(metadata);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(2);

      const verified = await verifyLaboratorioSession(token);
      expect(verified).not.toBeNull();
      expect(verified?.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
      expect(verified?.role).toBe('CEO');
      expect(verified?.institution_name).toBe('Instituto Bilingüe Ibime');
      expect(verified?.is_isolated_sandbox).toBe(false);
    });

    it('PEN-TEST: debe rechazar un token manipulado en su carga útil (Anti-Tampering)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = await signLaboratorioSession({
        tenant_id: 'sandbox-original-uuid',
        role: 'CEO',
        institution_name: 'Sandbox Temporal',
        is_isolated_sandbox: true,
        email: 'attacker@gmail.com',
        user_id: 'usr-attacker',
        auth_provider: 'sandbox',
        issued_at: now,
        expires_at: now + 3600
      });

      const [payloadEncoded, signature] = token.split('.');
      // Forjar alteración de tenant_id en payload para intentar acceder a IBIME
      const decodedJson = atob(payloadEncoded.replace(/-/g, '+').replace(/_/g, '/'));
      const forgedObj = JSON.parse(decodedJson);
      forgedObj.tenant_id = 'e1000000-0000-0000-0000-000000000001'; // Escalamiento de privilegios a IBIME
      forgedObj.is_isolated_sandbox = false;

      const forgedPayload = btoa(JSON.stringify(forgedObj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const tamperedToken = `${forgedPayload}.${signature}`;

      const result = await verifyLaboratorioSession(tamperedToken);
      expect(result).toBeNull();
    });

    it('debe rechazar un token expirado temporalmente', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredToken = await signLaboratorioSession({
        tenant_id: 'e2000000-0000-0000-0000-000000000002',
        role: 'CEO',
        institution_name: 'iSkool Core',
        is_isolated_sandbox: false,
        email: 'ceo@iskool.edu.mx',
        user_id: 'usr-iskool-ceo',
        auth_provider: 'credentials',
        issued_at: now - 7200,
        expires_at: now - 3600 // Expirado hace una hora
      });

      const result = await verifyLaboratorioSession(expiredToken);
      expect(result).toBeNull();
    });
  });

  describe('3. Route Handler API (/api/auth/laboratorio-session)', () => {
    it('POST: debe emitir sesión hermética con app_metadata para login con Google (@ibime.edu.mx)', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'google',
          email: 'rectoria@ibime.edu.mx'
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.app_metadata.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
      expect(json.app_metadata.role).toBe('CEO');
      expect(json.app_metadata.institution_name).toBe('Instituto Bilingüe Ibime');
      expect(json.app_metadata.is_isolated_sandbox).toBe(false);

      // Verificar que se haya emitido la cookie segura
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('laboratorio_session');
      expect(cookieHeader).toContain('HttpOnly');
    });

    it('POST: debe emitir sandbox dinámico para login con cuenta externa o Gmail', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'google',
          email: 'profesor.prueba@gmail.com'
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.app_metadata.role).toBe('CEO');
      expect(json.app_metadata.is_isolated_sandbox).toBe(true);
      expect(json.app_metadata.institution_name).toContain('Sandbox Pedagógico (profesor.prueba)');
      expect(json.app_metadata.tenant_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('GET: debe validar la cookie de sesión activa y retornar app_metadata', async () => {
      const now = Math.floor(Date.now() / 1000);
      const validToken = await signLaboratorioSession({
        tenant_id: 'e1000000-0000-0000-0000-000000000001',
        role: 'CEO',
        institution_name: 'Instituto Bilingüe Ibime',
        is_isolated_sandbox: false,
        email: 'direccion@ibime.edu.mx',
        user_id: 'usr-ibime-ceo',
        auth_provider: 'google',
        issued_at: now,
        expires_at: now + 3600
      });

      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'GET',
        headers: {
          cookie: `laboratorio_session=${validToken}`
        }
      });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.authenticated).toBe(true);
      expect(json.app_metadata.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
      expect(json.app_metadata.role).toBe('CEO');
    });

    it('GET: debe rechazar peticiones sin cookie con HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'GET'
      });

      const res = await GET(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.authenticated).toBe(false);
      expect(json.session).toBeNull();
    });

    it('DELETE: debe invalidar la sesión y purgar la cookie con maxAge 0', async () => {
      const res = await DELETE();
      expect(res.status).toBe(200);

      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('laboratorio_session=;');
      expect(cookieHeader).toContain('Max-Age=0');
    });
  });
});
