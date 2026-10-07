import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/mail/test-connection/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/mail/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('⚡ SUITE DE COMPROBACIÓN Y PING EN TIEMPO REAL DE SERVIDORES DE CORREO', () => {
  it('1. Debe rechazar dominios no existentes o erróneos vía DNS en tiempo real', async () => {
    const req = createMockRequest({
      email: 'usuario@dominio-absolutamente-falso-xyz987.org',
      protocol: 'IMAP',
      incomingHost: 'mail.dominio-absolutamente-falso-xyz987.org',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.pingSuccess).toBe(false);
    expect(data.error).toContain('no existe o no tiene registros DNS/MX');
  }, 10000);

  it('2. Debe rechazar cuentas de correo erróneas sin credenciales como israell335mac@gmail.com', async () => {
    const req = createMockRequest({
      email: 'israell335mac@gmail.com',
      protocol: 'IMAP',
      incomingHost: 'imap.gmail.com',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS',
      password: '' // Sin contraseña válida
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    // El ping al host real imap.gmail.com responde, pero la autenticación falla rotundamente
    expect(data.pingSuccess).toBe(true);
    expect(data.requiresValidCredentials).toBe(true);
    expect(data.error).toContain('requiere una contraseña de aplicación o token válido');
    expect(typeof data.latencyMs).toBe('number');
    expect(data.latencyMs).toBeGreaterThan(0);
  }, 15000);

  it('3. Debe rechazar credenciales incorrectas en vivo para buzones comerciales', async () => {
    const req = createMockRequest({
      email: 'israell335mac@gmail.com',
      protocol: 'IMAP',
      incomingHost: 'imap.gmail.com',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS',
      password: 'password_erroneo_12345'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.pingSuccess).toBe(true);
    expect(data.authFailed).toBe(true);
    expect(data.error).toContain('rechazó las credenciales');
  }, 15000);

  it('4. Debe validar y retornar comprobación exitosa en cuenta institucional / sandbox (@test-case.edu.mx)', async () => {
    const req = createMockRequest({
      email: 'direccion@test-case.edu.mx',
      protocol: 'IMAP',
      incomingHost: 'mail.test-case.edu.mx',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pingSuccess).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(typeof data.latencyMs).toBe('number');
    expect(data.message).toContain('Ping de retorno recibido con éxito');
    expect(data.syncedFolders).toEqual(['INBOX', 'Enviados', 'Borradores', 'Archivo Institucional', 'Papelera']);
  }, 10000);

  it('5. Debe detectar desafío de Verificación en 2 Pasos (Google Prompt) en cuentas como israell35mac@gmail.com', async () => {
    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      protocol: 'IMAP',
      incomingHost: 'imap.gmail.com',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS',
      password: 'password_cuenta_con_2fa'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.pingSuccess).toBe(true);
    expect(data.requires2FA).toBe(true);
    expect(data.provider).toBe('google');
    expect(data.deviceChallenge).toBeDefined();
    expect(data.deviceChallenge.verificationNumber).toBe(42);
    expect(data.deviceChallenge.targetDevice).toContain('celular');
    expect(data.error).toContain('Verificación en 2 Pasos');
  }, 15000);

  it('6. Debe validar y autorizar la cuenta Google cuando se confirma la notificación desde el celular (deviceConfirmed: true)', async () => {
    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      protocol: 'IMAP',
      incomingHost: 'imap.gmail.com',
      incomingPort: 993,
      incomingSecurity: 'SSL_TLS',
      password: 'password_cuenta_con_2fa',
      deviceConfirmed: true,
      mode: '2fa_confirm'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pingSuccess).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(data.twoFactorVerified).toBe(true);
    expect(data.message).toContain('Verificación en 2 Pasos confirmada desde tu celular');
    expect(typeof data.latencyMs).toBe('number');
  }, 10000);
});

