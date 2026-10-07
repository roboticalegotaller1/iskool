import { NextRequest, NextResponse } from 'next/server';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';
import { fetchLiveImapEmails, getCachedInboxEmails, injectEmailIntoCache } from '@/lib/services/imapClientService';

export const runtime = 'nodejs';

export interface RawGmailItem {
  id: string;
  sender_name: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  snippet: string;
  body_text: string;
  received_at: string;
  timestamp: string;
  is_unread: boolean;
  is_starred: boolean;
  is_important: boolean;
  category: 'principal' | 'actualizaciones' | 'promociones' | 'spam';
  triage_badge?: {
    quadrant: 'ATENCION_CEO' | 'DELEGADO_CON_SLA' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
    label: string;
    color: string;
    linkedMatterId?: string;
  };
}

// Semilla canónica de respaldo en caso de desconexión sin credenciales
function getFallbackRawEmails(accountEmail: string): RawGmailItem[] {
  const targetEmail = accountEmail || 'israell35mac@gmail.com';
  return [
    {
      id: 'raw-msg-01',
      sender_name: 'israel LopezAngeles',
      sender_email: targetEmail,
      recipient_email: targetEmail,
      subject: 'Alumno herido',
      snippet: 'El alumno Patricio estrella fue herido ayer en las canchas de futball durante el horario de receso...',
      body_text: 'El alumno Patricio estrella fue herido ayer en las canchas de futball durante el horario de receso. Solicito saber qué protocolo médico se aplicó y si el colegio cuenta con seguro de gastos médicos mayores vigente para la atención inmediata.',
      received_at: 'Hoy',
      timestamp: '16:42',
      is_unread: true,
      is_starred: true,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'ATENCION_CEO',
        label: '🔴 ATENCIÓN INMEDIATA CEO',
        color: 'bg-red-50 text-red-700 border-red-200'
      }
    },
    {
      id: 'raw-msg-02',
      sender_name: 'Israel Lopez',
      sender_email: targetEmail,
      recipient_email: targetEmail,
      subject: 'CTE urgente',
      snippet: 'Se notifica que tendrá cte urgente mañana a las 3 pm ,confirme asistencia por favor...',
      body_text: 'Se notifica que tendrá cte urgente mañana a las 3 pm ,confirme asistencia por favor para preparar la sala de juntas de Dirección General y el orden del día curricular.',
      received_at: 'Hoy',
      timestamp: '15:30',
      is_unread: true,
      is_starred: false,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'DELEGADO_CON_SLA',
        label: '🟡 DELEGADO CON SLA',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'sch-ibime';
    const email = searchParams.get('email') || 'israell35mac@gmail.com';
    const password = searchParams.get('password') || '';
    const host = searchParams.get('host') || 'imap.gmail.com';
    const port = Number(searchParams.get('port')) || 993;

    let emails: RawGmailItem[] = [];
    let authenticated = false;
    let requiresAppPassword = false;
    let authError: string | undefined;
    let latencyMs = 18;

    // 1. Si se proporciona contraseña o clave de aplicación real, consultar IMAP en vivo
    const cleanPass = password.trim();
    if (cleanPass && cleanPass !== '••••••••••••' && cleanPass !== 'password') {
      const imapRes = await fetchLiveImapEmails(host, port, email, cleanPass, { tenantId });
      latencyMs = imapRes.latencyMs || latencyMs;

      if (imapRes.success && imapRes.authenticated) {
        authenticated = true;
        emails = imapRes.emails;
      } else {
        authenticated = false;
        requiresAppPassword = imapRes.requiresAppPassword || false;
        authError = imapRes.error;
      }
    } else {
      requiresAppPassword = true;
    }

    // 2. Si no se autenticó o no se proporcionó contraseña, revisar si hay correos cacheados
    if (emails.length === 0) {
      const cached = getCachedInboxEmails(tenantId);
      if (cached && cached.length > 0) {
        emails = cached;
      } else {
        emails = getFallbackRawEmails(email);
        requiresAppPassword = true;
      }
    }

    // 3. Incorporar correos del spool dinámico de entrada (webhooks / reenvío)
    const spoolEmails = InboundMailSpoolService.getPendingEmails(tenantId);
    const additionalFromSpool: RawGmailItem[] = [];

    for (const item of spoolEmails) {
      const alreadyInList = emails.some(
        e => e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase()
      );
      if (!alreadyInList) {
        const spoolItem: RawGmailItem = {
          id: item.id,
          sender_name: item.sender_name || 'Remitente Institucional',
          sender_email: item.sender_email || email,
          recipient_email: item.recipient_email || email,
          subject: item.subject,
          snippet: (item.body_text || item.subject || '').slice(0, 110) + '...',
          body_text: item.body_text || 'Sin contenido de mensaje',
          received_at: 'Justo ahora',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_unread: true,
          is_starred: false,
          is_important: true,
          category: 'principal',
          triage_badge: {
            quadrant: 'ATENCION_CEO',
            label: '🔴 ATENCIÓN INMEDIATA CEO',
            color: 'bg-red-50 text-red-700 border-red-200'
          }
        };
        additionalFromSpool.push(spoolItem);
        injectEmailIntoCache(tenantId, spoolItem);
      }
    }

    const allEmails = [...additionalFromSpool, ...emails];

    return NextResponse.json({
      success: true,
      authenticated,
      requiresAppPassword,
      authError,
      latencyMs,
      emails: allEmails,
      total: allEmails.length,
      unreadCount: allEmails.filter(e => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al obtener correos en tiempo real'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'sch-ibime';
    const email = body.email || 'israell35mac@gmail.com';
    const password = body.password || '';
    const host = body.host || 'imap.gmail.com';
    const port = Number(body.port) || 993;

    let emails: RawGmailItem[] = [];
    let authenticated = false;
    let requiresAppPassword = false;
    let authError: string | undefined;
    let latencyMs = 18;

    // Si se envía correo manual para inyección directa
    if (body.injectEmail) {
      const injected: RawGmailItem = {
        id: `inj-${Date.now()}`,
        sender_name: body.injectEmail.sender_name || 'Remitente de Prueba',
        sender_email: body.injectEmail.sender_email || email,
        recipient_email: email,
        subject: body.injectEmail.subject || 'Correo de Prueba en Vivo',
        snippet: (body.injectEmail.body_text || '').slice(0, 110) + '...',
        body_text: body.injectEmail.body_text || 'Mensaje de prueba inyectado en tiempo real.',
        received_at: 'Justo ahora',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_unread: true,
        is_starred: false,
        is_important: true,
        category: 'principal',
        triage_badge: {
          quadrant: 'ATENCION_CEO',
          label: '🔴 ATENCIÓN INMEDIATA CEO',
          color: 'bg-red-50 text-red-700 border-red-200'
        }
      };

      injectEmailIntoCache(tenantId, injected);
      InboundMailSpoolService.enqueueEmail(tenantId, {
        sender_name: injected.sender_name,
        sender_email: injected.sender_email,
        recipient_email: email,
        subject: injected.subject,
        body_text: injected.body_text,
        reincidence_count: 1
      });
    }

    // Consulta en vivo por IMAP si se cuenta con credenciales
    const cleanPass = (password || '').trim();
    if (cleanPass && cleanPass !== '••••••••••••' && cleanPass !== 'password') {
      const imapRes = await fetchLiveImapEmails(host, port, email, cleanPass, { tenantId });
      latencyMs = imapRes.latencyMs || latencyMs;

      if (imapRes.success && imapRes.authenticated) {
        authenticated = true;
        emails = imapRes.emails;
      } else {
        authenticated = false;
        requiresAppPassword = imapRes.requiresAppPassword || false;
        authError = imapRes.error;
      }
    } else {
      requiresAppPassword = true;
    }

    if (emails.length === 0) {
      const cached = getCachedInboxEmails(tenantId);
      if (cached && cached.length > 0) {
        emails = cached;
      } else {
        emails = getFallbackRawEmails(email);
        requiresAppPassword = true;
      }
    }

    // Spool
    const spoolEmails = InboundMailSpoolService.getPendingEmails(tenantId);
    for (const item of spoolEmails) {
      if (!emails.some(e => e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase())) {
        emails.unshift({
          id: item.id,
          sender_name: item.sender_name || 'Remitente Institucional',
          sender_email: item.sender_email || email,
          recipient_email: item.recipient_email || email,
          subject: item.subject,
          snippet: (item.body_text || '').slice(0, 110) + '...',
          body_text: item.body_text || 'Sin contenido de mensaje',
          received_at: 'Justo ahora',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_unread: true,
          is_starred: false,
          is_important: true,
          category: 'principal',
          triage_badge: {
            quadrant: 'ATENCION_CEO',
            label: '🔴 ATENCIÓN INMEDIATA CEO',
            color: 'bg-red-50 text-red-700 border-red-200'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      authenticated,
      requiresAppPassword,
      authError,
      latencyMs,
      emails,
      total: emails.length,
      unreadCount: emails.filter(e => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al sincronizar bandeja de entrada'
    }, { status: 500 });
  }
}
