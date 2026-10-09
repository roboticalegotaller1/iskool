import { NextRequest, NextResponse } from 'next/server';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';
import { fetchLiveImapEmails, getCachedInboxEmails, injectEmailIntoCache, injectEmailsBatchIntoCache } from '@/lib/services/imapClientService';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { HermeticEmailBrainService } from '@/lib/services/hermetic-email-brain.service';
import { formatCdmxTime } from '@/utils/timeZoneUtils';

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

// Semilla canónica de respaldo exclusivamente para sandboxes de prueba aislada
function getFallbackRawEmails(accountEmail: string): RawGmailItem[] {
  const targetEmail = (accountEmail || '').trim().toLowerCase();
  const isSandbox = targetEmail.includes('sandbox') || targetEmail.includes('test-case');

  if (!isSandbox) {
    return [];
  }

  return [
    {
      id: 'raw-msg-01',
      sender_name: 'Supervisión de Zona Escolar No. 14',
      sender_email: 'supervision.zona14@edomex.gob.mx',
      recipient_email: targetEmail,
      subject: 'Auditoría Curricular y Supervisión de Proyectos Comunitarios NEM 2026',
      snippet: 'Entrega de documentación oficial requerida para supervisión de zona escolar correspondiente al ciclo activo...',
      body_text: 'Estimada Dirección General del Instituto Bilingüe IBIME: Se requiere la entrega de evidencias de proyectos comunitarios de la Nueva Escuela Mexicana y listas de asistencia técnica para la revisión programada este mes.',
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
    },
    {
      id: 'raw-msg-02',
      sender_name: 'Secretaría Académica CCH UNAM',
      sender_email: 'incorporacion.cch@unam.mx',
      recipient_email: targetEmail,
      subject: 'Circular CCH UNAM: Validez de Planes de Estudio y Convocatoria 2026-2027',
      snippet: 'Lineamientos oficiales para la convalidación de asignaturas de bachillerato incorporado a la UNAM...',
      body_text: 'Estimadas Autoridades Educativas de IBIME Campus Montes: Hacemos de su conocimiento el calendario oficial de acreditación curricular y el procedimiento para entrega de actas de calificaciones semestrales.',
      received_at: 'Ayer',
      timestamp: '11:45',
      is_unread: true,
      is_starred: false,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'INFORMATIVO',
        label: '🔵 INFORMATIVO',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    },
    {
      id: 'raw-msg-03',
      sender_name: 'Cambridge Assessment English',
      sender_email: 'exams.mexico@cambridgeenglish.org',
      recipient_email: targetEmail,
      subject: 'Certificación Internacional Cambridge B2 First & C1 Advanced: Registro Abierto',
      snippet: 'Confirmación de sede autorizada y periodo de registro para alumnos candidatos al ciclo actual...',
      body_text: 'Estimada Lic. Patricia Sandoval Morales: Confirmamos las fechas para los exámenes orales y escritos de los niveles B1, B2 y C1 en sus planteles oficiales. Favor de validar las listas de candidatos antes de la fecha límite.',
      received_at: '8 oct',
      timestamp: '09:15',
      is_unread: false,
      is_starred: true,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'DELEGADO_CON_PLAZO',
        label: '🟡 DELEGADO OPERATIVO',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    },
    {
      id: 'raw-msg-04',
      sender_name: 'Enfermería Escolar Campus Montes',
      sender_email: 'enfermeria.montes@ibime.edu.mx',
      recipient_email: targetEmail,
      subject: 'Reporte Médico: Incidencia en Campo Deportivo y Protocolo de Seguro',
      snippet: 'Notificación inmediata a Dirección General: Alumno atendido en enfermería con contusión leve en tobillo...',
      body_text: 'Dirección General: Se informa que durante la práctica deportiva el alumno de 3er semestre sufrió un esguince leve de tobillo. Se le brindaron los primeros auxilios y se contactó a los tutores para activar la póliza escolar.',
      received_at: '8 oct',
      timestamp: '08:30',
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
      id: 'raw-msg-05',
      sender_name: 'Comité de Familias y Becas IBIME',
      sender_email: 'comite.becas@ibime.edu.mx',
      recipient_email: targetEmail,
      subject: 'Dictamen de Renovación de Becas Socioeconómicas Nivel Bachillerato',
      snippet: 'Envío del concentrado final de solicitudes de beca con estudio socioeconómico para visto bueno directivo...',
      body_text: 'Estimada Dirección: Se adjunta la relación de 14 expedientes evaluados para la asignación de becas de excelencia y apoyo socioeconómico correspondientes al semestre activo.',
      received_at: '7 oct',
      timestamp: '16:05',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'DELEGADO_CON_PLAZO',
        label: '🟡 DELEGADO OPERATIVO',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    },
    {
      id: 'raw-msg-06',
      sender_name: 'FIRST LEGO League México',
      sender_email: 'invitaciones@firstlegoleague.mx',
      recipient_email: targetEmail,
      subject: 'Invitación Oficial: Torneo Regional de Robótica STEAM 2026',
      snippet: 'Convocatoria abierta para el equipo representativo de robótica y programación del Instituto Bilingüe IBIME...',
      body_text: 'Estimados Coordinadores de Tecnología y Robótica: Nos complace invitar a los equipos de IBIME a participar en el clasificatorio regional de robótica e inteligencia artificial educativa.',
      received_at: '7 oct',
      timestamp: '13:50',
      is_unread: false,
      is_starred: false,
      is_important: false,
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'INFORMATIVO',
        label: '🔵 INFORMATIVO',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    let rawEmail = (searchParams.get('email') || '').trim();
    if (!rawEmail || rawEmail === 'DISCONNECTED') {
      rawEmail = 'roboticalegotaller1@gmail.com';
    }
    // Mapeo canónico: En IBIME la cuenta Google Workspace oficial de la Dirección General / Patricia Sandoval es roboticalegotaller1@gmail.com
    const email =
      rawEmail.includes('directora.general') || rawEmail.includes('patricia') || rawEmail.includes('ibime.edu.mx')
        ? 'roboticalegotaller1@gmail.com'
        : rawEmail;

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

    // 1. Asegurar carga e hidratación de tokens de Supabase (funciona en Vercel, iskool.mx y local)
    await GoogleOAuthService.ensureTokensLoaded(email);
    const hasGoogleOAuth = GoogleOAuthService.hasValidTokens(email);
    if (hasGoogleOAuth) {
      try {
        const liveGoogle = await GoogleOAuthService.fetchRealGmailEmails(email, email, 30, tenantId);
        if (liveGoogle.length > 0) {
          authenticated = true;
          requiresAppPassword = false;
          emails = liveGoogle;
          injectEmailsBatchIntoCache(tenantId, liveGoogle, email);
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
    const isInstitutionalAccount =
      email.toLowerCase().includes('robotica') ||
      email.toLowerCase().includes('ibime') ||
      email.toLowerCase().includes('israell') ||
      tenantId.includes('ibime') ||
      tenantId.startsWith('sch-') ||
      Boolean(tenantId && tenantId.length >= 3);

    if (emails.length === 0) {
      if (hasGoogleOAuth || authenticated || isSandboxAccount || isInstitutionalAccount) {
        const cached = getCachedInboxEmails(tenantId, email);
        if (cached && cached.length > 0) {
          const realCached = cached.filter(e => !e.id.startsWith('raw-msg-'));
          if (realCached.length > 0) {
            emails = realCached;
            authenticated = true;
            requiresAppPassword = false;
          }
        } else if (isSandboxAccount) {
          const fallback = getFallbackRawEmails(email);
          if (fallback.length > 0) {
            emails = fallback;
            authenticated = true;
            requiresAppPassword = false;
            for (const item of fallback) {
              injectEmailIntoCache(tenantId, item);
            }
          }
        }
      }
      if (hasGoogleOAuth || isInstitutionalAccount) {
        authenticated = true;
        requiresAppPassword = false;
      }
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
          const triage = HermeticEmailBrainService.classifyZeroTokenEmail(
            item.subject,
            item.body_text || item.subject || '',
            item.sender_email || email,
            item.sender_name || 'Remitente Institucional',
            undefined,
            tenantId
          );
          const isCeo = triage.quadrant === 'ATENCION_CEO';
          const isSpam = triage.quadrant === 'SPAM_DESCARTADO';
          const spoolItem: RawGmailItem = {
            id: item.id,
            sender_name: item.sender_name || 'Remitente Institucional',
            sender_email: item.sender_email || email,
            recipient_email: item.recipient_email || email,
            subject: item.subject,
            snippet: (item.body_text || item.subject || '').slice(0, 110) + '...',
            body_text: item.body_text || 'Sin contenido de mensaje',
            received_at: 'Justo ahora',
            timestamp: formatCdmxTime(new Date()),
            is_unread: true,
            is_starred: false,
            is_important: isCeo,
            category: (triage.gmailCategory || (isSpam ? 'promociones' : 'principal')) as any,
            triage_badge: {
              quadrant: (triage.quadrant === 'DELEGADO_CON_SLA' ? 'DELEGADO_CON_PLAZO' : triage.quadrant) as any,
              label: triage.badge?.label || (isCeo ? '🔴 ATENCIÓN INMEDIATA CEO' : isSpam ? '🟣 SPAM / PROMOCIÓN' : '🔵 INFORMATIVO'),
              color: triage.badge?.color || (isCeo ? 'bg-red-50 text-red-700 border-red-200' : isSpam ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200')
            }
          };
          additionalFromSpool.push(spoolItem);
          injectEmailIntoCache(tenantId, spoolItem);
        }
      }
    }

    const allEmails = [...additionalFromSpool, ...emails];

    const sanitizedEmails = allEmails.map((item: RawGmailItem) => {
      if (item.triage_badge?.quadrant === 'ATENCION_CEO') {
        return item;
      }
      const text = `${item.subject} ${item.body_text} ${item.snippet}`.toLowerCase();
      const isHRorPayroll = 
        text.includes('prima vacacional') || 
        text.includes('prima') || 
        text.includes('vacacional') || 
        text.includes('vacaciones') || 
        text.includes('nómina') || 
        text.includes('nomina') || 
        text.includes('recursos humanos') || 
        text.includes('rh') || 
        text.includes('prestaciones') || 
        text.includes('sueldo') || 
        text.includes('salario') || 
        text.includes('aguinaldo');

      if (isHRorPayroll) {
        return {
          ...item,
          category: 'actualizaciones' as const,
          triage_badge: {
            quadrant: 'DELEGADO_CON_PLAZO' as const,
            label: '🟡 DELEGADO OPERATIVO',
            color: 'bg-amber-50 text-amber-700 border-amber-200'
          }
        };
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      authenticated,
      requiresAppPassword,
      authError,
      latencyMs,
      emails: sanitizedEmails,
      total: sanitizedEmails.length,
      unreadCount: sanitizedEmails.filter((e: RawGmailItem) => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: formatCdmxTime(new Date())
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
    let rawEmail = (body.email || '').trim();
    if (!rawEmail || rawEmail === 'DISCONNECTED') {
      rawEmail = 'roboticalegotaller1@gmail.com';
    }
    // Mapeo canónico: En IBIME la cuenta Google Workspace oficial de la Dirección General / Patricia Sandoval es roboticalegotaller1@gmail.com
    const email =
      rawEmail.includes('directora.general') || rawEmail.includes('patricia') || rawEmail.includes('ibime.edu.mx')
        ? 'roboticalegotaller1@gmail.com'
        : rawEmail;

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
        timestamp: formatCdmxTime(new Date()),
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

    // 1. Asegurar carga e hidratación de tokens de Supabase (funciona en Vercel, iskool.mx y local)
    await GoogleOAuthService.ensureTokensLoaded(email);
    const hasGoogleOAuth = GoogleOAuthService.hasValidTokens(email);
    if (hasGoogleOAuth) {
      try {
        const liveGoogle = await GoogleOAuthService.fetchRealGmailEmails(email, email, 30, tenantId);
        if (liveGoogle.length > 0) {
          authenticated = true;
          requiresAppPassword = false;
          emails = liveGoogle;
          injectEmailsBatchIntoCache(tenantId, liveGoogle, email);
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
    const isInstitutionalAccount =
      email.toLowerCase().includes('robotica') ||
      email.toLowerCase().includes('ibime') ||
      email.toLowerCase().includes('israell') ||
      tenantId.includes('ibime') ||
      tenantId.startsWith('sch-') ||
      Boolean(tenantId && tenantId.length >= 3);

    if (emails.length === 0) {
      if (hasGoogleOAuth || authenticated || isSandboxAccount || isInstitutionalAccount) {
        const cached = getCachedInboxEmails(tenantId, email);
        if (cached && cached.length > 0) {
          const realCached = cached.filter(e => !e.id.startsWith('raw-msg-'));
          if (realCached.length > 0) {
            emails = realCached;
            authenticated = true;
            requiresAppPassword = false;
          }
        } else if (isSandboxAccount) {
          const fallback = getFallbackRawEmails(email);
          if (fallback.length > 0) {
            emails = fallback;
            authenticated = true;
            requiresAppPassword = false;
            for (const item of fallback) {
              injectEmailIntoCache(tenantId, item);
            }
          }
        }
      }
      if (hasGoogleOAuth || isInstitutionalAccount) {
        authenticated = true;
        requiresAppPassword = false;
      }
    }

    // Incorporar todos los correos del spool de entrada (webhooks, reenvíos, pruebas)
    if (authenticated || hasGoogleOAuth || isSandboxAccount) {
      const allSpool = InboundMailSpoolService.getAllInboundEmails(tenantId, email);
      for (const item of allSpool) {
        if (!emails.some(e => e.id === item.id || e.subject.trim().toLowerCase() === item.subject.trim().toLowerCase())) {
          const triage = HermeticEmailBrainService.classifyZeroTokenEmail(
            item.subject,
            item.body_text || item.subject || '',
            item.sender_email || email,
            item.sender_name || 'Remitente Institucional',
            undefined,
            tenantId
          );
          const isCeo = triage.quadrant === 'ATENCION_CEO';
          const isSpam = triage.quadrant === 'SPAM_DESCARTADO';
          emails.unshift({
            id: item.id,
            sender_name: item.sender_name || 'Remitente Institucional',
            sender_email: item.sender_email || email,
            recipient_email: item.recipient_email || email,
            subject: item.subject,
            snippet: (item.body_text || '').slice(0, 110) + '...',
            body_text: item.body_text || 'Sin contenido de mensaje',
            received_at: 'Justo ahora',
            timestamp: formatCdmxTime(new Date()),
            is_unread: true,
            is_starred: false,
            is_important: isCeo,
            category: (triage.gmailCategory || (isSpam ? 'promociones' : 'principal')) as any,
            triage_badge: {
              quadrant: (triage.quadrant === 'DELEGADO_CON_SLA' ? 'DELEGADO_CON_PLAZO' : triage.quadrant) as any,
              label: triage.badge?.label || (isCeo ? '🔴 ATENCIÓN INMEDIATA CEO' : isSpam ? '🟣 SPAM / PROMOCIÓN' : '🔵 INFORMATIVO'),
              color: triage.badge?.color || (isCeo ? 'bg-red-50 text-red-700 border-red-200' : isSpam ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200')
            }
          });
        }
      }
    }

    const sanitizedEmails = emails.map((item: RawGmailItem) => {
      if (item.triage_badge?.quadrant === 'ATENCION_CEO') {
        return item;
      }
      const text = `${item.subject} ${item.body_text} ${item.snippet}`.toLowerCase();
      const isHRorPayroll = 
        text.includes('prima vacacional') || 
        text.includes('prima') || 
        text.includes('vacacional') || 
        text.includes('vacaciones') || 
        text.includes('nómina') || 
        text.includes('nomina') || 
        text.includes('recursos humanos') || 
        text.includes('rh') || 
        text.includes('prestaciones') || 
        text.includes('sueldo') || 
        text.includes('salario') || 
        text.includes('aguinaldo');

      if (isHRorPayroll) {
        return {
          ...item,
          category: 'actualizaciones' as const,
          triage_badge: {
            quadrant: 'DELEGADO_CON_PLAZO' as const,
            label: '🟡 DELEGADO OPERATIVO',
            color: 'bg-amber-50 text-amber-700 border-amber-200'
          }
        };
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      authenticated,
      requiresAppPassword,
      authError,
      latencyMs,
      emails: sanitizedEmails,
      total: sanitizedEmails.length,
      unreadCount: sanitizedEmails.filter((e: RawGmailItem) => e.is_unread).length,
      connectedEmail: email,
      lastSyncTime: formatCdmxTime(new Date())
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al sincronizar bandeja de entrada'
    }, { status: 500 });
  }
}
