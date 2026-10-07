import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { decodeMimeHeader, decodeQuotedPrintable, cleanEmailBody } from '../src/lib/services/imapClientService';
import { GET as getRawInbox, POST as postRawInbox } from '../src/app/api/mail/raw-inbox/route';
import { POST as postSyncInbox } from '../src/app/api/mail/sync-inbox/route';

describe('⚡ SINCRONIZACIÓN REAL DE CORREO IMAP Y BANDEJA EN TIEMPO REAL', () => {
  it('1. Debe decodificar asuntos RFC 2047 en Base64 (UTF-8) correctamente', () => {
    // =?UTF-8?B?QWx1bW5vIGhlcmlkbyBlbiBsYXMgY2FuY2hhcw==?= -> "Alumno herido en las canchas"
    const encoded = '=?UTF-8?B?QWx1bW5vIGhlcmlkbyBlbiBsYXMgY2FuY2hhcw==?=';
    const decoded = decodeMimeHeader(encoded);
    expect(decoded).toBe('Alumno herido en las canchas');
  });

  it('2. Debe decodificar asuntos RFC 2047 en Quoted-Printable correctamente', () => {
    // =?UTF-8?Q?Reuni=C3=B3n_Urgente_de_Consejo?= -> "Reunión Urgente de Consejo"
    const encoded = '=?UTF-8?Q?Reuni=C3=B3n_Urgente_de_Consejo?=';
    const decoded = decodeMimeHeader(encoded);
    expect(decoded).toBe('Reunión Urgente de Consejo');
  });

  it('3. Debe decodificar cuerpo Quoted-Printable y limpiar HTML', () => {
    const rawMimeBody = `
      Content-Type: text/plain; charset=UTF-8
      Content-Transfer-Encoding: quoted-printable

      Estimada Direcci=C3=B3n General:=0D=0A=
      El alumno Patricio sufri=C3=B3 una lesi=C3=B3n en la rodilla durante educaci=C3=B3n f=C3=ADsica.
    `;
    const cleaned = cleanEmailBody(rawMimeBody);
    expect(cleaned).toContain('Dirección General');
    expect(cleaned).toContain('sufrió una lesión');
    expect(cleaned).toContain('educación física');
  });

  it('4. POST /api/mail/raw-inbox con inyección de correo debe reflejarlo de inmediato en el buzón', async () => {
    const req = new NextRequest('http://localhost:3000/api/mail/raw-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'sch-ibime',
        email: 'israell35mac@gmail.com',
        injectEmail: {
          sender_name: 'Dr. Roberto Sánchez (Médico Escolar)',
          sender_email: 'medico@ibime.edu.mx',
          subject: 'Reporte Urgente de Enfermería: Alumno con luxación',
          body_text: 'El alumno del grupo 4B fue trasladado a enfermería tras choque en canchas de fútbol.'
        }
      })
    });

    const res = await postRawInbox(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.emails.length).toBeGreaterThanOrEqual(1);

    const injected = data.emails.find((e: any) => e.subject.includes('luxación'));
    expect(injected).toBeTruthy();
    expect(injected.sender_name).toBe('Dr. Roberto Sánchez (Médico Escolar)');
    expect(injected.is_unread).toBe(true);
    expect(injected.triage_badge.quadrant).toBe('ATENCION_CEO');
  });

  it('5. POST /api/mail/raw-inbox sin contraseña válida debe ser honesto y requerir Contraseña de Aplicación', async () => {
    const req = new NextRequest('http://localhost:3000/api/mail/raw-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'sch-ibime',
        email: 'israell35mac@gmail.com',
        password: ''
      })
    });

    const res = await postRawInbox(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.requiresAppPassword).toBe(true);
    expect(data.authenticated).toBe(false);
  });

  it('6. POST /api/mail/sync-inbox debe clasificar el correo en Bandeja Inteligente con cuadrante CEO', async () => {
    const req = new NextRequest('http://localhost:3000/api/mail/sync-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'sch-ibime',
        email: 'israell35mac@gmail.com',
        manualEmail: {
          sender_name: 'israel LopezAngeles',
          sender_email: 'israell35mac@gmail.com',
          subject: 'Accidente en patio escolar durante recreo',
          body_text: 'Solicito atención prioritaria del director general respecto a protocolo de seguridad.',
          reincidence_count: 2
        }
      })
    });

    const res = await postSyncInbox(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.newMatters.length).toBeGreaterThanOrEqual(1);
    const item = data.newMatters.find((m: any) => m.title.includes('Accidente en patio'));
    expect(item).toBeTruthy();
    expect(item.destination).toBe('ATENCION_CEO');
  });
});
