import { describe, it, expect } from 'vitest';
import {
  signMultiTenantToken,
  verifyMultiTenantToken,
  resolveTenantFromHostOrHeader,
  getDefaultMetadataForTenant
} from '@/lib/auth/multiTenantSession';
import {
  createAuthorizationCodeTicket,
  verifyAndConsumeAuthorizationCode
} from '@/lib/auth/oauthTickets';
import { IbimeAuthProvider } from '@/lib/auth/ibimeAuthProvider';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('🛡️ SEGURIDAD MULTI-TENANT: iSkool Core e IBIME', () => {

  describe('1. Estructura y Claims Obligatorios de JWT / Sesión', () => {
    it('debe generar un token válido para iSkool con claims obligatorios y metadatos pedagógicos', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-prof-1',
        email: 'docente@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'teacher',
        school_id: 'sch-jjrosseau',
        first_name: 'Laura',
        last_name: 'Gómez'
      });

      expect(typeof token).toBe('string');
      const verified = await verifyMultiTenantToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.tenant_id).toBe('iskool');
      expect(verified?.role).toBe('teacher');
      expect(verified?.institution_metadata.branding.schoolName).toBe('iSkool Ecosistema Educativo');
      expect(verified?.institution_metadata.feature_flags.pedagogicalAi).toBe(true);
      expect(verified?.institution_metadata.feature_flags.curricularVault).toBe(true);
      expect(verified?.institution_metadata.feature_flags.interactiveCanvas).toBe(true);
      expect(verified?.institution_metadata.feature_flags.officialKardexSep).toBe(false);
    });

    it('debe generar un token válido para IBIME con claims obligatorios y metadatos de control escolar', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-ibime-dir-1',
        email: 'direccion@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'director',
        school_id: 'sch-ibime-central',
        first_name: 'Roberto',
        last_name: 'Sánchez'
      });

      const verified = await verifyMultiTenantToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.tenant_id).toBe('ibime');
      expect(verified?.role).toBe('director');
      expect(verified?.institution_metadata.branding.schoolName).toBe('IBIME Instituto Bicultural');
      expect(verified?.institution_metadata.branding.primaryColorHex).toBe('#047857');
      expect(verified?.institution_metadata.feature_flags.officialKardexSep).toBe(true);
      expect(verified?.institution_metadata.feature_flags.pedagogicalAi).toBe(false);
      expect(verified?.institution_metadata.feature_flags.curricularVault).toBe(false);
      expect(verified?.institution_metadata.feature_flags.interactiveCanvas).toBe(false);
    });
  });

  describe('2. Resolución Determinista de Tenant (Subdominios, Headers y Rutas)', () => {
    it('debe resolver tenant ibime por subdominio Host', () => {
      const tenant = resolveTenantFromHostOrHeader({ host: 'ibime.iskool.mx:3000' });
      expect(tenant).toBe('ibime');
    });

    it('debe resolver tenant ibime por subdominio localhost', () => {
      const tenant = resolveTenantFromHostOrHeader({ host: 'ibime.localhost:3000' });
      expect(tenant).toBe('ibime');
    });

    it('debe resolver tenant ibime por header x-tenant-id explícito', () => {
      const tenant = resolveTenantFromHostOrHeader({
        host: 'api.iskool.mx',
        headerTenantId: 'ibime'
      });
      expect(tenant).toBe('ibime');
    });

    it('debe resolver tenant ibime por ruta institucional /ibime/*', () => {
      const tenant = resolveTenantFromHostOrHeader({
        host: 'iskool.mx',
        pathname: '/ibime/portal'
      });
      expect(tenant).toBe('ibime');
    });

    it('debe resolver tenant iskool por defecto para subdominios estándar', () => {
      const tenant = resolveTenantFromHostOrHeader({ host: 'portal.iskool.mx' });
      expect(tenant).toBe('iskool');
    });
  });

  describe('3. Pruebas de Penetración y Fuga de Sesión (Zero Leakage Tests)', () => {
    it('PEN-TEST 01: Rechazo de token alterado con manipulación de tenant_id en payload', async () => {
      // 1. Generar token legítimo para iSkool
      const genuineToken = await signMultiTenantToken({
        id: 'usr-attacker-1',
        email: 'attacker@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student'
      });

      // 2. Extraer partes y alterar payload (forgery attempt)
      const [payloadBase64, signature] = genuineToken.split('.');
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const tamperedObj = JSON.parse(decodedJson);
      tamperedObj.tenant_id = 'ibime'; // Intento de escalar privilegios hacia IBIME
      tamperedObj.role = 'superadmin';

      const tamperedBase64 = btoa(JSON.stringify(tamperedObj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // 3. Montar token falsificado con la firma original del payload previo
      const forgedToken = `${tamperedBase64}.${signature}`;

      // 4. La verificación criptográfica debe fallar rotundamente
      const result = await verifyMultiTenantToken(forgedToken);
      expect(result).toBeNull();
    });

    it('PEN-TEST 02: Bloqueo de Token de iSkool contra Recurso Protegido de IBIME (Cross-Tenant Denial)', async () => {
      const iskoolToken = await signMultiTenantToken({
        id: 'usr-student-iskool',
        email: 'alumno@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student'
      });

      // Intentar validar esperando estrictamente tenant 'ibime'
      const crossResult = await verifyMultiTenantToken(iskoolToken, {
        expectedTenant: 'ibime',
        allowSuperAdminBypass: false
      });

      expect(crossResult).toBeNull();
    });

    it('PEN-TEST 03: Bloqueo de Token de IBIME contra Recurso Protegido de iSkool Core', async () => {
      const ibimeToken = await signMultiTenantToken({
        id: 'usr-docente-ibime',
        email: 'docente@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'teacher'
      });

      // Intentar validar esperando estrictamente tenant 'iskool'
      const crossResult = await verifyMultiTenantToken(ibimeToken, {
        expectedTenant: 'iskool',
        allowSuperAdminBypass: false
      });

      expect(crossResult).toBeNull();
    });

    it('PEN-TEST 04: Excepción de Super Usuario para Gobernanza Central', async () => {
      const superAdminToken = await signMultiTenantToken({
        id: 'usr-super-admin',
        email: 'admin@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'superadmin'
      });

      // El Super Usuario sí debe ser admitido si allowSuperAdminBypass es true
      const superResult = await verifyMultiTenantToken(superAdminToken, {
        expectedTenant: 'ibime',
        allowSuperAdminBypass: true
      });

      expect(superResult).not.toBeNull();
      expect(superResult?.role).toBe('superadmin');
    });
  });

  describe('4. Flujo OAuth 2.0 / OIDC con PKCE para Frontend de IBIME', () => {
    it('debe ejecutar el intercambio de código con PKCE exitosamente', async () => {
      const provider = new IbimeAuthProvider({
        issuerUrl: 'https://api.iskool.mx',
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        tenantId: 'ibime'
      });

      const { codeVerifier, codeChallenge } = await provider.generatePkcePair();

      // Servidor genera ticket de autorización
      const authCode = await createAuthorizationCodeTicket({
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        codeChallenge,
        tenantId: 'ibime',
        userId: 'usr-ibime-doc-42',
        email: 'profesor@ibime.edu.mx',
        role: 'teacher',
        firstName: 'Carlos',
        lastName: 'Mendoza'
      });

      // Servidor valida e intercambia código usando el codeVerifier
      const ticket = await verifyAndConsumeAuthorizationCode({
        code: authCode,
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        codeVerifier
      });

      expect(ticket.userId).toBe('usr-ibime-doc-42');
      expect(ticket.tenantId).toBe('ibime');
      expect(ticket.role).toBe('teacher');
    });

    it('PEN-TEST 05: Rechazo de intercambio si el Code Verifier es incorrecto (Ataque Man-in-the-Middle)', async () => {
      const provider = new IbimeAuthProvider({
        issuerUrl: 'https://api.iskool.mx',
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        tenantId: 'ibime'
      });

      const { codeChallenge } = await provider.generatePkcePair();

      const authCode = await createAuthorizationCodeTicket({
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        codeChallenge,
        tenantId: 'ibime',
        userId: 'usr-victim',
        email: 'victima@ibime.edu.mx',
        role: 'student'
      });

      // Atacante intenta canjear el código con un verifier arbitrario
      const wrongVerifier = 'WRONG_VERIFIER_STRING_NOT_MATCHING_THE_CHALLENGE_HASH_0123456789';

      await expect(
        verifyAndConsumeAuthorizationCode({
          code: authCode,
          clientId: 'ibime_portal_client',
          redirectUri: 'https://ibime.iskool.mx/callback',
          codeVerifier: wrongVerifier
        })
      ).rejects.toThrow('Validación PKCE fallida');
    });

    it('PEN-TEST 06: Rechazo de reutilización de código (Replay Attack)', async () => {
      const provider = new IbimeAuthProvider({
        issuerUrl: 'https://api.iskool.mx',
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        tenantId: 'ibime'
      });

      const { codeVerifier, codeChallenge } = await provider.generatePkcePair();

      const authCode = await createAuthorizationCodeTicket({
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        codeChallenge,
        tenantId: 'ibime',
        userId: 'usr-student-1',
        email: 'estudiante@ibime.edu.mx',
        role: 'student'
      });

      // Primer consumo: Exitoso
      await verifyAndConsumeAuthorizationCode({
        code: authCode,
        clientId: 'ibime_portal_client',
        redirectUri: 'https://ibime.iskool.mx/callback',
        codeVerifier
      });

      // Segundo consumo del mismo código: Debe ser bloqueado
      await expect(
        verifyAndConsumeAuthorizationCode({
          code: authCode,
          clientId: 'ibime_portal_client',
          redirectUri: 'https://ibime.iskool.mx/callback',
          codeVerifier
        })
      ).rejects.toThrow('Código de autorización ya consumido');
    });
  });

  describe('5. Simulación de Middleware Perimetral', () => {
    it('debe responder con 404 Not Found a peticiones API de IBIME cuando se utiliza un token de iSkool', async () => {
      const iskoolToken = await signMultiTenantToken({
        id: 'usr-student-iskool',
        email: 'estudiante@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student'
      });

      // Simular petición a API de integración o de IBIME con Cookie de iSkool
      const req = new NextRequest('http://localhost:3000/api/v1/ibime/kardex', {
        headers: {
          cookie: `iskool_session=${iskoolToken}`
        }
      });

      const res = await middleware(req);
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.code).toBe('NOT_FOUND');
    });

    it('debe responder con 404 Not Found a peticiones UI a rutas protegidas de iSkool cuando se utiliza un token de IBIME', async () => {
      const ibimeToken = await signMultiTenantToken({
        id: 'usr-student-ibime',
        email: 'estudiante@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'student'
      });

      // Simular navegación a /teacher con sesión de IBIME
      const req = new NextRequest('http://localhost:3000/teacher', {
        headers: {
          cookie: `ibime_session=${ibimeToken}`
        }
      });

      const res = await middleware(req);
      // Debe responder con 404 rewrite para evitar enumeración cross-tenant
      expect(res.status).toBe(404);
    });

    it('debe descartar el encabezado forjado x-resolved-tenant y responder 404 ante un token no autorizado de iSkool', async () => {
      const iskoolToken = await signMultiTenantToken({
        id: 'usr-attacker-spoof',
        email: 'attacker@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student'
      });

      // Simular petición con inyección/spoofing deliberado del encabezado interno x-resolved-tenant: ibime
      const req = new NextRequest('http://localhost:3000/api/v1/ibime/kardex', {
        headers: {
          'x-resolved-tenant': 'ibime',
          'x-resolved-tenant-id': 'ibime',
          cookie: `iskool_session=${iskoolToken}`
        }
      });

      const res = await middleware(req);

      // El middleware debe descartar la cabecera forjada y responder HTTP 404 Not Found
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.code).toBe('NOT_FOUND');
    });
  });
});
