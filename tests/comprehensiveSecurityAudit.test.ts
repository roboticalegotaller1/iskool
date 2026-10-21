import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as postLaboratorioSession } from '../src/app/api/auth/laboratorio-session/route';
import { GET as getRawInbox, POST as postRawInbox } from '../src/app/api/mail/raw-inbox/route';
import { POST as postPaymentWebhook } from '../src/app/api/webhooks/payment/route';
import { GET as getLeadershipDashboard } from '../src/app/api/iskool/leadership/dashboard/route';
import { GET as getFiscalStatus } from '../src/app/api/fiscal/status/route';
import { GET as getInvoiceDownload } from '../src/app/api/billing/invoice/download/route';
import { POST as postHistoricalFigure } from '../src/app/api/ai/historical-figure/route';
import { POST as postSTT } from '../src/app/api/ai/stt/route';
import { POST as postTTS } from '../src/app/api/ai/tts/route';
import { GET as getGoogleCallback } from '../src/app/api/auth/callback/google/route';
import { POST as postGoogleRevoke } from '../src/app/api/auth/google/revoke/route';
import { POST as postDataDeletion } from '../src/app/api/user/data-deletion/route';
import { encryptToken, decryptToken } from '../src/lib/security/tokenCipher';
import { signOAuthState, verifyOAuthState } from '../src/lib/security/oauthState';

describe('🛡️ AUDITORÍA DE SEGURIDAD INTEGRAL — VERIFICACIÓN AUTOMATIZADA DE VULNERABILIDADES', () => {

  // VULN-01: Bypass de Autenticación en Laboratorio Pedagógico
  describe('VULN-01: Blindaje en /api/auth/laboratorio-session', () => {
    it('Debe RECHAZAR con 401 si un atacante envía únicamente un email sin contraseña ni token', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'director@ibime.edu.mx' })
      });

      const res = await postLaboratorioSession(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Autenticación requerida');
    });

    it('Debe PERMITIR acceso legítimo de demostración directiva con contraseña canónica autorizada (Normativa 1)', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/laboratorio-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_method: 'credentials',
          email: 'directora.general@ibime.edu.mx',
          password: '008805'
        })
      });

      const res = await postLaboratorioSession(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session.role).toBe('CEO');
      expect(data.session.tenant_id).toBe('e1000000-0000-0000-0000-000000000001');
    });
  });

  // VULN-02: Exfiltración de Buzón Directivo
  describe('VULN-02: Blindaje de Buzón Institucional (/api/mail/raw-inbox)', () => {
    it('Debe RECHAZAR con 401 consultas GET anónimas al buzón de correos', async () => {
      const req = new NextRequest('http://localhost:3000/api/mail/raw-inbox?tenantId=e1000000-0000-0000-0000-000000000001&email=roboticalegotaller1@gmail.com');
      const res = await getRawInbox(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Autenticación requerida');
    });

    it('Debe RECHAZAR con 401 peticiones POST anónimas para resolver o inyectar correos', async () => {
      const req = new NextRequest('http://localhost:3000/api/mail/raw-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_resolved', emailId: 'msg-123' })
      });
      const res = await postRawInbox(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  // VULN-03: Falsificación de Webhook de Pagos
  describe('VULN-03: Verificación Estricta en /api/webhooks/payment', () => {
    it('Debe RECHAZAR con 400 webhooks que no incluyan firma criptográfica válida', async () => {
      const req = new NextRequest('http://localhost:3000/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'payment.succeeded',
          invoiceId: 'inv-malicious-test'
        })
      });

      const res = await postPaymentWebhook(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Firma de webhook inválida');
    });
  });

  // VULN-04: BOLA / IDOR en Leadership Dashboard
  describe('VULN-04: Protección contra BOLA en /api/iskool/leadership/dashboard', () => {
    it('Debe RECHAZAR con 401 a clientes no autenticados que intenten consultar métricas de liderazgo', async () => {
      const req = new NextRequest('http://localhost:3000/api/iskool/leadership/dashboard?schoolId=sch-jjrosseau&grade=high_school_1');
      const res = await getLeadershipDashboard(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
    });
  });

  // VULN-05: Exposición Fiscal y Descarga Arbitraria de Facturas
  describe('VULN-05: Protección de Endpoints Fiscales SAT', () => {
    it('Debe RECHAZAR con 401 el volcado de CFDIs timbrados en /api/fiscal/status', async () => {
      const req = new NextRequest('http://localhost:3000/api/fiscal/status');
      const res = await getFiscalStatus(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('Debe RECHAZAR con 401 la generación no autenticada de XMLs CFDI 4.0 en /api/billing/invoice/download', async () => {
      const req = new NextRequest('http://localhost:3000/api/billing/invoice/download?receipt_id=REC-TEST&uuid=TEST-UUID');
      const res = await getInvoiceDownload(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain('Autenticación requerida');
    });
  });

  // VULN-06: Protección de Endpoints de IA y Multimedia
  describe('VULN-06: Protección de Motores de IA Pedagógica y Multimedia', () => {
    it('Debe RECHAZAR con 401 llamadas no autenticadas a /api/ai/historical-figure', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/historical-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_figure', characterName: 'Juárez' })
      });
      const res = await postHistoricalFigure(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('Debe RECHAZAR con 401 cargas no autenticadas de audio en /api/ai/stt', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/stt', {
        method: 'POST'
      });
      const res = await postSTT(req);
      const data = await res.json();

      expect(res.status).toBe(401);
    });

    it('Debe RECHAZAR con 401 solicitudes no autenticadas de síntesis en /api/ai/tts', async () => {
      const req = new NextRequest('http://localhost:3000/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hola mundo' })
      });
      const res = await postTTS(req);
      const data = await res.json();

      expect(res.status).toBe(401);
    });
  });

  // VULN-07: Blindaje OAuth 2.0 State Anti-CSRF (CASA ASVS 3.7.1)
  describe('VULN-07: Validación Estricta Anti-CSRF en Callback de Google OAuth', () => {
    it('Debe RECHAZAR con 403 peticiones de callback con estado manipulado o sin firma válida', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/callback/google?code=fake_code&state=fake_unsigned_state');
      const res = await getGoogleCallback(req);
      const html = await res.text();

      expect(res.status).toBe(403);
      expect(html).toContain('Fallo de Seguridad Anti-CSRF');
    });

    it('Debe RECHAZAR con 403 peticiones de callback sin parámetro de estado', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/callback/google?code=fake_code');
      const res = await getGoogleCallback(req);
      const html = await res.text();

      expect(res.status).toBe(403);
      expect(html).toContain('Fallo de Seguridad Anti-CSRF');
    });
  });

  // VULN-08: Cifrado Autenticado AES-256-GCM de Tokens OAuth en Reposo (CASA ASVS 6.2.1)
  describe('VULN-08: Cifrado Autenticado AES-256-GCM para Tokens en Reposo', () => {
    it('Debe cifrar tokens con prefijo enc:v1: y descifrarlos de forma determinista', () => {
      const plainToken = 'ya29.a0ARrdaM_secret_token_1234567890';
      const encrypted = encryptToken(plainToken);

      expect(encrypted).toMatch(/^enc:v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
      expect(encrypted).not.toContain(plainToken);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(plainToken);
    });

    it('Debe rechazar o devolver cadena vacía ante manipulación del payload o authentication tag GCM', () => {
      const plainToken = 'ya29.sample_refresh_token_xyz';
      const encrypted = encryptToken(plainToken);
      const parts = encrypted.split(':');
      // Alterar el auth tag (tag de autenticación GCM)
      parts[3] = 'ffffffffffffffffffffffffffffffff';
      const tampered = parts.join(':');

      const decrypted = decryptToken(tampered);
      expect(decrypted).toBe('');
    });
  });

  // VULN-09: Revocación Activa de Tokens y Supresión de Datos (Google Limited Use & RFC 7009)
  describe('VULN-09: Revocación Activa de Tokens RFC 7009 y Supresión de Datos', () => {
    it('Debe permitir revocar credenciales institucionales y purgar el almacenamiento en /api/auth/google/revoke', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/google/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-revoke@ibime.edu.mx' })
      });
      const res = await postGoogleRevoke(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('revocadas exitosamente');
    });

    it('Debe responder informativamente en el endpoint de eliminación de datos /api/user/data-deletion', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usuario-eliminacion@ibime.edu.mx' })
      });
      const res = await postDataDeletion(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe('PURGED_AND_QUEUED');
      expect(data.confirmation_code).toMatch(/^DEL-/);
    });
  });

});

