import { NextRequest, NextResponse } from 'next/server';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';
import { fetchLiveImapEmails, getCachedInboxEmails, injectEmailIntoCache } from '@/lib/services/imapClientService';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

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
    quadrant: 'ATENCION_CEO' | 'DELEGADO_CON_PLAZO' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
    label: string;
    color: string;
    linkedMatterId?: string;
  };
}

// Semilla canónica de respaldo exclusivamente para sandboxes de prueba locales
function getFallbackRawEmails(accountEmail: string): RawGmailItem[] {
  const targetEmail = (accountEmail || '').trim().toLowerCase();
  // Jamás entregar correos falsos a cuentas reales del usuario
  if (!targetEmail.includes('sandbox') && !targetEmail.includes('test-case')) {
    return [];
  }
  return [
    {
      id: 'raw-msg-01',
      sender_name: 'Supervisión Escolar',
      sender_email: 'supervision.zona@edomex.gob.mx',
      recipient_email: targetEmail,
      subject: 'Auditoría Curricular y Supervisión de Zona',
      snippet: 'Entrega de documentación requerida para supervisión de zona escolar correspondiente al ciclo activo...',
      body_text: 'Estimada Dirección General: Se requiere la entrega de evidencias de proyectos comunitarios de la NEM y listas de asistencia técnica.',
      received_at: 'Hoy',
      timestamp: '14:20',
      is_unread: true,
      is_starred: true,
      is_important: true,
      category: 'principal',
      triage_badge: {
        quadrant: 'ATENCION_CEO',
        label: '🔴 ATENCIÓN INMEDIATA CEO',
        color: 'bg-red-50 text-red-700 border-red-200'
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = (searchParams.get('email') || (tenantId.includes('ibime') || tenantId === 'e1000000-0000-0000-0000-000000000001' || tenantId === 'sch-ibime' ? 'roboticalegotaller1@gmail.com' : 'roboticalegotaller1@gmail.com')).trim();
    const password = searchParams.get('password') || '';
    const host = searchParams.get('host') || 'imap.gmail.com';
    const port = Number(searchParams.get('port')) || 993;

    if (!email || email === 'DISCONNECTED') {
      return NextResponse.json({
        success: true,
        authenticated: false,
        requiresAppPassword: false,
        emails: [],
        total: 0,
        unreadCount: 0,
        connectedEmail: '',
        lastSyncTime: 'Sin cuenta conectada'
      });
    }

    let emails: RawGmailItem[] = [];
    let authenticated = false;
    let requiresAppPassword = false;
    let authError: string | undefined;
    let latencyMs = 18;

    // 1. Verificar si la cuenta cuenta con autorización oficial de Google OAuth 2.0
    const hasGoogleOAuth = GoogleOAuthService.hasValidTokens(email);
    if (hasGoogleOAuth) {
      try {
        const liveGoogle = await GoogleOAuthService.fetchRealGmailEmails(email, email, 30, tenantId);
        if (liveGoogle.length > 0) {
          authenticated = true;
          requiresAppPassword = false;
          emails = liveGoogle;
          for (const item of liveGoogle) {
            injectEmailIntoCache(tenantId, item);
          }
        }
      } catch (err: any) {
        console.warn('Error sincronizando correos con Google OAuth:', err?.message);
      }
    }

    // 2. Si no se descargó por OAuth y se proporciona contraseña real, consultar IMAP en vivo
    let cleanPass = (password || '').replace(/\s+/g, '');
    const isTargetGmail = email.toLowerCase().includes('gmail.com');
    const targetHost = isTargetGmail ? 'imap.gmail.com' : (host || 'imap.gmail.com');
    const targetPort = isTargetGmail ? 993 : (Number(port) || 993);

    if (!authenticated && cleanPass && cleanPass !== '••••••••••••' && cleanPass !== 'password') {
      const imapRes = await fetchLiveImapEmails(targetHost, targetPort, email, cleanPass, { tenantId });
      latencyMs = imapRes.latencyMs || latencyMs;

      if (imapRes.success && imapRes.authenticated) {
        authenticated = true;
        requiresAppPassword = false;
        emails = imapRes.emails;
      } else {
        authenticated = false;
        requiresAppPassword = imapRes.requiresAppPassword || false;
        authError = imapRes.error;
      }
    } else if (!hasGoogleOAuth) {
      requiresAppPassword = true;
    }

    // 3. Consultar caché estricto del tenant y cuenta
    const isSandboxAccount = email.toLowerCase().includes('sandbox') || email.toLowerCase().includes('test-case');
    if (emails.length === 0) {
      if (hasGoogleOAuth || authenticated || isSandboxAccount) {
        const cached = getCachedInboxEmails(tenantId, email);
        if (cached && cached.length > 0) {
          emails = cached;
          if (hasGoogleOAuth) {
            authenticated = true;
            requiresAppPassword = false;
          }
        } else if (isSandboxAccount) {
          const fallback = getFallbackRawEmails(email);
          emails = fallback;
          for (const item of fallback) {
            injectEmailIntoCache(tenantId, item);
          }
        }
      }
      requiresAppPassword = !authenticated && !hasGoogleOAuth;
    }

    // 4. Incorporar todos los correos del spool de entrada (webhooks, reenvíos, pruebas)
    const additionalFromSpool: RawGmailItem[] = [];
    if (authenticated || hasGoogleOAuth || isSandboxAccount) {
      const allSpool = InboundMailSpoolService.getAllInboundEmails(tenantId, email);
      for (const item of allSpool) {
        const alreadyInList = emails.some(
          e => e.id === item.id || e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase()
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
    const tenantId = body.tenantId || 'sch-default';
    const email = (body.email || '').trim();
    const password = body.password || '';
    const host = body.host || 'imap.gmail.com';
    const port = Number(body.port) || 993;

    if (!email || email === 'DISCONNECTED') {
      return NextResponse.json({
        success: true,
        authenticated: false,
        requiresAppPassword: false,
        emails: [],
        total: 0,
        unreadCount: 0,
        connectedEmail: '',
        lastSyncTime: 'Sin cuenta conectada'
      });
    }

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
      emails.push(injected);
    }

    // 1. Verificar si la cuenta cuenta con autorización oficial de Google OAuth 2.0
    const hasGoogleOAuth = (body.isOAuth || body.password === '••••••••••••' || (body.password && body.password.trim() !== '')) && GoogleOAuthService.hasValidTokens(email);
    if (hasGoogleOAuth) {
      try {
        const liveGoogle = await GoogleOAuthService.fetchRealGmailEmails(email, email, 30, tenantId);
        if (liveGoogle.length > 0) {
          authenticated = true;
          requiresAppPassword = false;
          emails = liveGoogle;
          for (const item of liveGoogle) {
            injectEmailIntoCache(tenantId, item);
          }
        }
      } catch (err: any) {
        console.warn('Error sincronizando correos con Google OAuth en POST:', err?.message);
      }
    }

    // 2. Consulta en vivo por IMAP si se cuenta con credenciales
    let cleanPass = (password || '').replace(/\s+/g, '');
    const isTargetGmail = email.toLowerCase().includes('gmail.com');
    const targetHost = isTargetGmail ? 'imap.gmail.com' : (host || 'imap.gmail.com');
    const targetPort = isTargetGmail ? 993 : (Number(port) || 993);

    if (!authenticated && cleanPass && cleanPass !== '••••••••••••' && cleanPass !== 'password') {
      const imapRes = await fetchLiveImapEmails(targetHost, targetPort, email, cleanPass, { tenantId });
      latencyMs = imapRes.latencyMs || latencyMs;

      if (imapRes.success && imapRes.authenticated) {
        authenticated = true;
        requiresAppPassword = false;
        emails = imapRes.emails;
      } else {
        authenticated = false;
        requiresAppPassword = imapRes.requiresAppPassword || false;
        authError = imapRes.error;
      }
    } else if (!hasGoogleOAuth) {
      requiresAppPassword = true;
    }

    const isSandboxAccount = email.toLowerCase().includes('sandbox') || email.toLowerCase().includes('test-case');
    if (emails.length === 0) {
      if (hasGoogleOAuth || authenticated || isSandboxAccount) {
        const cached = getCachedInboxEmails(tenantId, email);
        if (cached && cached.length > 0) {
          emails = cached;
          if (hasGoogleOAuth) {
            authenticated = true;
            requiresAppPassword = false;
          }
        } else if (isSandboxAccount) {
          const fallback = getFallbackRawEmails(email);
          emails = fallback;
          for (const item of fallback) {
            injectEmailIntoCache(tenantId, item);
          }
        }
      }
      requiresAppPassword = !authenticated && !hasGoogleOAuth;
    }

    // Incorporar todos los correos del spool de entrada (webhooks, reenvíos, pruebas)
    if (authenticated || hasGoogleOAuth || isSandboxAccount) {
      const allSpool = InboundMailSpoolService.getAllInboundEmails(tenantId, email);
      for (const item of allSpool) {
        if (!emails.some(e => e.id === item.id || e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase())) {
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
