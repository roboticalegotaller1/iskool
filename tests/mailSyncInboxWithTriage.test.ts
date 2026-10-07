import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/mail/sync-inbox/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/mail/sync-inbox', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('📬 SINCRONIZACIÓN DE BANDEJA Y TRIAGE COGNITIVO (/api/mail/sync-inbox)', () => {
  it('1. Debe procesar un correo entrante con el Motor de IA Pedagógica y retornar el MatterItem clasificado', async () => {
    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      host: 'imap.gmail.com',
      port: 993,
      security: 'SSL_TLS',
      protocol: 'IMAP',
      tenantId: 'sch-ibime',
      institutionName: 'Instituto Bilingüe IBIME',
      manualEmail: {
        sender_name: 'Lic. Fernando Mendoza',
        sender_email: 'familia.mendoza@gmail.com',
        subject: 'Urgente: Reincidencia de agresión física en 5º B de Primaria Campus Montes',
        body_text: 'Estimada Directora: Nos dirigimos a usted por tercera ocasión en 10 días tras un nuevo altercado en el recreo. Exigimos cita presencial urgente con ambas familias antes de acudir a la SEP.',
        reincidence_count: 3,
        campus: 'Campus Montes (Sede Matriz)'
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(1);
    expect(data.newMatters.length).toBeGreaterThanOrEqual(1);

    const matter = data.newMatters.find((m: any) => m.title.includes('Reincidencia')) || data.newMatters[0];
    expect(matter.matter_code).toMatch(/^MAT-/);
    expect(matter.title).toContain('Reincidencia');
    expect(matter.destination).toBe('ATENCION_CEO');
    expect(matter.urgency).toBe('CRITICA');
    expect(matter.why_shown).toBeTruthy();
    expect(matter.suggested_draft_reply).toBeTruthy();
    expect(typeof matter.suggested_draft_reply).toBe('string');
  });

  it('2. Debe clasificar solicitudes operativas en DELEGADO_CON_SLA', async () => {
    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      host: 'imap.gmail.com',
      port: 993,
      security: 'SSL_TLS',
      protocol: 'IMAP',
      tenantId: 'sch-ibime',
      institutionName: 'Instituto Bilingüe IBIME',
      manualEmail: {
        sender_name: 'Carlos Ramírez',
        sender_email: 'carlos.ramirez@gmail.com',
        subject: 'Solicitud de factura CFDI 4.0 con complemento educativo IEDU de colegiatura de octubre',
        body_text: 'Buenas tardes, adjunto comprobante de pago de colegiatura para solicitar mi factura fiscal CFDI correspondiente a este mes.',
        reincidence_count: 1
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    const matter = data.newMatters[0];
    expect(matter.destination).toBe('DELEGADO_CON_SLA');
    expect(matter.sla_hours).toBe(24);
  });

  it('3. Debe activar el Puente Autónomo en tiempo real (30s) sin requerir Contraseña de Aplicación manual', async () => {
    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      host: 'imap.gmail.com',
      port: 993,
      security: 'SSL_TLS',
      protocol: 'IMAP',
      tenantId: 'sch-ibime',
      password: '••••••••••••'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.autonomousBridgeActive).toBe(true);
    expect(data.autoSyncIntervalSeconds).toBe(30);
    expect(data.appPasswordRequired).toBe(false);
  });

  it('4. Debe procesar automáticamente correos encolados en el InboundMailSpoolService', async () => {
    const { InboundMailSpoolService } = await import('../src/lib/services/inboundMailSpool');
    InboundMailSpoolService.enqueueEmail('sch-ibime', {
      sender_name: 'Comité de Padres IBIME',
      sender_email: 'padres@ibime.edu.mx',
      recipient_email: 'israell35mac@gmail.com',
      subject: 'Propuesta de Transporte y Horarios Escolares',
      body_text: 'Estimada Dirección: Enviamos la propuesta consensuada sobre las rutas de transporte escolar matutino.',
      reincidence_count: 1
    });

    const req = createMockRequest({
      email: 'israell35mac@gmail.com',
      host: 'imap.gmail.com',
      port: 993,
      security: 'SSL_TLS',
      protocol: 'IMAP',
      tenantId: 'sch-ibime'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(1);
    const found = data.newMatters.find((m: any) => m.title.includes('Transporte'));
    expect(found).toBeDefined();
    expect(found.destination).toBe('DELEGADO_CON_SLA');
  });
});
