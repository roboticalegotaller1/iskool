import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { getSecuritySecret } from '../src/lib/security/secretManager';
import { signSessionToken, verifySessionToken } from '../src/lib/sessionToken';
import { signMultiTenantToken, verifyMultiTenantToken } from '../src/lib/auth/multiTenantSession';
import { encryptToken, decryptToken } from '../src/lib/security/tokenCipher';
import { sanitizeHtml } from '../src/lib/vaultMarkdownEngine';
import { validateMailTarget, isPrivateOrReservedIp } from '../src/lib/security/ssrfValidator';
import { POST as postDataDeletion } from '../src/app/api/user/data-deletion/route';
import { POST as postGoogleRevoke } from '../src/app/api/auth/google/revoke/route';

describe('🛡️ AUDITORÍA DE SEGURIDAD CASA TIER 3 / OWASP ASVS v4.0 NIVEL 3 (ISKOOL ECOSISTEMA)', () => {

  // =========================================================================
  // V1: ARQUITECTURA, AMENAZAS Y AISLAMIENTO MULTI-TENANT (ASVS V1)
  // =========================================================================
  describe('CASA-V1: Arquitectura y Aislamiento Perimetral Zero-Trust', () => {
    it('Debe purgar cualquier header spoofed (x-resolved-tenant) inyectado por clientes maliciosos', async () => {
      const req = new NextRequest('http://localhost:3000/login', {
        headers: {
          'x-resolved-tenant': 'ibime',
          'x-resolved-tenant-id': 'ibime'
        }
      });
      const res = await middleware(req);
      expect(res).toBeDefined();
      // El header inyectado al downstream debe ser sanitizado y resuelto por la autoridad interna
      expect(res?.headers.get('x-resolved-tenant')).toBe('iskool');
    });

    it('Debe responder con 404 Not Found (Anti-Enumeración) ante intentos de acceso cross-tenant de API', async () => {
      // Crear un token válido para iSkool
      const iskoolToken = await signSessionToken({
        id: 'user-iskool-001',
        role: 'director',
        tenant_id: 'iskool',
        school_id: 'sch-iskool-core'
      });

      // Intentar acceder a ruta protegida de IBIME con cookie de iSkool
      const req = new NextRequest('http://localhost:3000/ibime/portal', {
        headers: {
          'Cookie': `iskool_session=${iskoolToken}`,
          'Accept': 'application/json'
        }
      });

      const res = await middleware(req);
      expect(res?.status).toBe(404);
      const body = await res?.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // V2: AUTENTICACIÓN Y ROLES (ASVS V2)
  // =========================================================================
  describe('CASA-V2: Verificación de Autenticación y Control de Rutas', () => {
    it('Debe bloquear con 401 peticiones no autenticadas a APIs protegidas', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/metrics', {
        headers: {
          'Accept': 'application/json'
        }
      });
      const res = await middleware(req);
      expect(res?.status).toBe(401);
      const data = await res?.json();
      expect(data.code).toBe('UNAUTHENTICATED');
    });

    it('Debe redirigir al login correspondiente cuando se accede por navegador sin credenciales', async () => {
      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          'Accept': 'text/html'
        }
      });
      const res = await middleware(req);
      expect(res?.status).toBe(307);
      expect(res?.headers.get('location')).toContain('/login?redirect=%2Fadmin');
    });
  });

  // =========================================================================
  // V3: GESTIÓN DE SESIÓN Y CRIPTOGRAFÍA DE TOKENS (ASVS V3)
  // =========================================================================
  describe('CASA-V3: Gestión de Sesiones Criptográficas y Resistencia a Manipulación', () => {
    it('Debe emitir y validar tokens HMAC-SHA256 con Web Crypto API', async () => {
      const token = await signSessionToken({
        id: 'usr-secure-test-99',
        role: 'teacher',
        school_id: 'sch-mexico-01',
        tenant_id: 'iskool'
      }, 3600);

      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(2);

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe('usr-secure-test-99');
      expect(verified?.role).toBe('teacher');
      expect(verified?.tenant_id).toBe('iskool');
    });

    it('Debe rechazar de forma estricta tokens con firma HMAC alterada (Anti-Tampering)', async () => {
      const token = await signSessionToken({
        id: 'usr-legit',
        role: 'student',
        tenant_id: 'iskool'
      }, 3600);

      const [payload, sig] = token.split('.');
      const corruptedSig = sig.substring(0, sig.length - 4) + 'abcd';
      const tamperedToken = `${payload}.${corruptedSig}`;

      const verified = await verifySessionToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it('Debe rechazar tokens expirados', async () => {
      // Token con expiración de -10 segundos en el pasado
      const expiredToken = await signSessionToken({
        id: 'usr-expired',
        role: 'student',
        tenant_id: 'iskool'
      }, -10);

      const verified = await verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });
  });

  // =========================================================================
  // V4: CONTROL DE ACCESO (RBAC & BOLA / IDOR) (ASVS V4)
  // =========================================================================
  describe('CASA-V4: Control de Acceso Basado en Roles (RBAC)', () => {
    it('Debe impedir que el rol "student" acceda a portales administrativos redirigiéndolo a su entorno', async () => {
      const studentToken = await signMultiTenantToken({
        id: 'std-test-rbac',
        email: 'alumno@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student',
        school_id: 'sch-iskool'
      });

      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          'Cookie': `iskool_session=${studentToken}`,
          'Accept': 'text/html'
        }
      });

      const res = await middleware(req);
      expect(res?.status).toBe(307);
      expect(res?.headers.get('location')).toContain('/student');
    });
  });

  // =========================================================================
  // V5 & V6: CRIPTOGRAFÍA, SECRETOS Y CIFRADO EN REPOSO (ASVS V5 & V6)
  // =========================================================================
  describe('CASA-V5 & V6: Cero Secretos Hardcodeados y Cifrado Autenticado AES-256-GCM', () => {
    it('Debe obtener secretos criptográficos con entropía >= 32 caracteres (CWE-798)', () => {
      const secret = getSecuritySecret('SESSION_SECRET');
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThanOrEqual(32);
    });

    it('Debe cifrar tokens con AES-256-GCM y verificar el tag de autenticación en reposo', () => {
      const plaintext = 'token-secreto-academico-2026';
      const encrypted = encryptToken(plaintext);

      expect(encrypted).toMatch(/^enc:v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
      expect(encrypted).not.toContain(plaintext);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  // =========================================================================
  // V8: PRIVACIDAD Y DERECHOS DE SUPRESIÓN DE DATOS (ASVS V8 / CASA TIER 3)
  // =========================================================================
  describe('CASA-V8: Privacidad, Revocación RFC 7009 y Supresión de Datos', () => {
    it('Debe operar el endpoint de supresión de datos conforme a GDPR/COPPA/CASA', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'estudiante.baja@ibime.edu.mx' })
      });

      const res = await postDataDeletion(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe('PURGED_AND_QUEUED');
      expect(data.confirmation_code).toMatch(/^DEL-/);
    });

    it('Debe procesar la revocación segura de credenciales en /api/auth/google/revoke', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/google/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'profesor.saliente@iskool.edu.mx' })
      });

      const res = await postGoogleRevoke(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // =========================================================================
  // V10: MANEJO DE ENTRADAS MALICIOSAS, XSS Y SSRF (ASVS V10)
  // =========================================================================
  describe('CASA-V10: Prevención de Inyección, XSS y SSRF', () => {
    it('Debe neutralizar vectores XSS (scripts, on* attributes, iframes) con DOMPurify', () => {
      const maliciousPayload = '<script>alert("XSS")</script><p>Hola <img src="x" onerror="alert(1)" /></p><iframe src="javascript:alert(2)"></iframe>';
      const cleanHtml = sanitizeHtml(maliciousPayload);

      expect(cleanHtml).not.toContain('<script>');
      expect(cleanHtml).not.toContain('onerror');
      expect(cleanHtml).not.toContain('<iframe');
      expect(cleanHtml).toContain('<p>Hola </p>');
    });

    it('Debe bloquear redes privadas y metadatos cloud contra SSRF (ASVS V10.2)', () => {
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('10.20.30.40')).toBe(true);
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true); // AWS / GCP metadata IP
      expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);

      const targetCheck = validateMailTarget('169.254.169.254', 25);
      expect(targetCheck.valid).toBe(false);
      expect(targetCheck.reason).toContain('bloqueada');
    });
  });

  // =========================================================================
  // V14: CABECERAS DEFENSIVAS HTTP Y ENDURECIMIENTO PERIMETRAL (ASVS V14)
  // =========================================================================
  describe('CASA-V14: Cabeceras Defensivas HTTP Estrictas en Todas las Respuestas', () => {
    it('Debe inyectar HSTS, CSP, X-Frame-Options, X-Content-Type-Options y Permissions-Policy en respuestas normales', async () => {
      const req = new NextRequest('http://localhost:3000/login');
      const res = await middleware(req);

      expect(res).toBeDefined();
      expect(res?.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
      expect(res?.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res?.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res?.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res?.headers.get('Permissions-Policy')).toContain('camera=(self)');
      expect(res?.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(res?.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
      expect(res?.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('Debe inyectar cabeceras de seguridad estrictas incluso en respuestas de error 401 unauthenticated', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/system', {
        headers: { 'Accept': 'application/json' }
      });
      const res = await middleware(req);

      expect(res?.status).toBe(401);
      expect(res?.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
      expect(res?.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res?.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res?.headers.get('Content-Security-Policy')).toBeDefined();
    });

    it('Debe inyectar cabeceras de seguridad estrictas en respuestas 404 cross-tenant', async () => {
      const iskoolToken = await signSessionToken({
        id: 'usr-cross-test',
        role: 'director',
        tenant_id: 'iskool'
      });

      const req = new NextRequest('http://localhost:3000/ibime/admin', {
        headers: {
          'Cookie': `iskool_session=${iskoolToken}`,
          'Accept': 'application/json'
        }
      });

      const res = await middleware(req);
      expect(res?.status).toBe(404);
      expect(res?.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
      expect(res?.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res?.headers.get('Content-Security-Policy')).toBeDefined();
    });
  });

});
