import { NextRequest, NextResponse } from 'next/server';
import tls from 'tls';
import { HermeticEmailBrainService, InboundEmailDTO, HermeticAuthSession } from '@/lib/services/hermetic-email-brain.service';

export const runtime = 'nodejs';

interface SyncInboxPayload {
  email: string;
  host: string;
  port: number;
  security: string;
  protocol: 'IMAP' | 'POP3';
  password?: string;
  tenantId: string;
  institutionName?: string;
  schoolSlug?: string;
  manualEmail?: {
    sender_name: string;
    sender_email: string;
    subject: string;
    body_text: string;
    campus?: string;
    reincidence_count?: number;
  };
  existingTitles?: string[];
  resolvedTitles?: string[];
}

import { fetchLiveImapEmails, getCachedInboxEmails } from '@/lib/services/imapClientService';
import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { isEmailResolvedServer } from '@/app/api/mail/raw-inbox/route';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as SyncInboxPayload;
    const { email, host, port, protocol, password, tenantId, institutionName, schoolSlug, manualEmail } = payload;
    const existingTitles: string[] = (payload.existingTitles || []).map(t => (t || '').trim().toLowerCase());
    const resolvedSet = new Set<string>([
      ...(payload.resolvedTitles || []).map(t => (t || '').trim().toLowerCase()),
      ...(payload.resolvedTitles || []).map(t => (t || '').trim())
    ]);

    function isMatterResolved(id?: string, subject?: string): boolean {
      if (id) {
        const cleanId = id.replace(/^mat-live-/, '');
        if (resolvedSet.has(id.toLowerCase()) || resolvedSet.has(id) || resolvedSet.has(cleanId.toLowerCase()) || resolvedSet.has(cleanId)) {
          return true;
        }
      }
      if (subject) {
        const norm = subject.trim().toLowerCase().replace(/^(re:|fwd:)\s*/i, '').trim();
        if (resolvedSet.has(norm) || resolvedSet.has(subject.trim().toLowerCase())) {
          return true;
        }
      }
      return isEmailResolvedServer(tenantId, id, subject);
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID requerido.' }, { status: 400 });
    }

    if (!email || email === 'DISCONNECTED') {
      return NextResponse.json({
        success: true,
        newMatters: [],
        count: 0,
        appPasswordRequired: false,
        message: 'No hay cuenta conectada para este colegio.'
      });
    }

    const schoolName = institutionName || 'Instituto Educativo';
    const prefix = (schoolSlug || tenantId.replace(/^sch-/, '') || 'INST').toUpperCase().slice(0, 5);

    const authSession: HermeticAuthSession = {
      user: {
        id: `usr-${tenantId}`,
        email: email || 'direccion@iskool.edu.mx',
        app_metadata: {
          tenant_id: tenantId,
          role: 'CEO',
          institution_name: schoolName,
          is_isolated_sandbox: false
        }
      },
      tenant_id: tenantId,
      institution_name: schoolName,
      role: 'CEO',
      is_isolated_sandbox: false
    };

    const newMatters: any[] = [];
    const processedSpoolIds: string[] = [];

    // PASO 1: Ingesta directa de correo enviado manualmente (si aplica, prioridad de prueba y despacho)
    if (manualEmail && manualEmail.subject) {
      const normManual = manualEmail.subject.trim().toLowerCase();
      if (!existingTitles.includes(normManual) && !isMatterResolved(undefined, manualEmail.subject)) {
        const emailDto: InboundEmailDTO = {
          sender_name: manualEmail.sender_name || 'Remitente Institucional',
          sender_email: manualEmail.sender_email || email || 'contacto@gmail.com',
          recipient_email: email,
          subject: manualEmail.subject,
          body_text: manualEmail.body_text || 'Sin cuerpo de mensaje',
          reincidence_count: manualEmail.reincidence_count || 1
        };

        const triageResult = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);

        const isCandidate = triageResult.quadrant === 'ATENCION_CEO' || triageResult.quadrant === 'DELEGADO_CON_SLA';
        if (isCandidate) {
          const matterItem = {
            id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            matter_code: `MAT-${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
            title: emailDto.subject,
            summary: triageResult.why_shown_to_director || emailDto.body_text.slice(0, 140) + '...',
            category: triageResult.category || 'Atención General',
            urgency: triageResult.urgency,
            destination: triageResult.quadrant,
            why_shown: triageResult.why_shown_to_director,
            reincidence_count: emailDto.reincidence_count || 1,
            recommended_action: triageResult.recommended_action,
            suggested_draft_reply: triageResult.suggested_draft?.body || '',
            assigned_role: triageResult.assigned_role || triageResult.assigned_department || 'Dirección General',
            assigned_email: triageResult.delegate_email || '',
            sla_hours: triageResult.sla_hours || 12,
            sla_remaining_text: `⏱️ ${triageResult.sla_hours || 12}h restantes`,
            sender_name: emailDto.sender_name,
            sender_email: emailDto.sender_email,
            provenance_doc: triageResult.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Protocolo_Convivencia.md`,
            received_at: 'Justo ahora',
            campus: manualEmail.campus || 'Campus Central'
          };

          newMatters.push(matterItem);
        }
        existingTitles.push(normManual);
      }
    }

    function isSpamCommercial(subject: string, bodyText: string = ''): boolean {
      const text = `${subject} ${bodyText}`.toLowerCase();
      // Salvaguarda canónica: Temas de salud física, alimentación y comedor escolar jamás son spam comercial
      if (/comedor|alimento|comida|intoxicaci|malestar|est[oó]mac/i.test(text)) {
        return false;
      }
      return (
        text.includes('amazon') ||
        text.includes('prime') ||
        text.includes('membresía') ||
        text.includes('membresia') ||
        text.includes('ofertas') ||
        text.includes('vivobook') ||
        text.includes('ryzen') ||
        text.includes('asus') ||
        text.includes('cama matrimonial') ||
        text.includes('gamma') ||
        text.includes('página web') ||
        text.includes('pagina web') ||
        text.includes('inversión financiera') ||
        text.includes('inversion financiera') ||
        text.includes('financial stocks') ||
        text.includes('cinépolis') ||
        text.includes('cinepolis') ||
        text.includes('prime opinion') ||
        text.includes('asm career')
      );
    }

    // PASO 2: Sincronizar buzón del usuario con los correos reales recibidos en la cuenta (deduplicando contra existingTitles)
    InboundMailSpoolService.syncLiveInboxForAccount(tenantId, email, existingTitles);

    // PASO 2: Procesar correos pendientes en el Spool Autónomo (recibidos de Gmail / servidor)
    const pendingSpoolEmails = InboundMailSpoolService.getPendingEmails(tenantId, email);
    for (const pendingMsg of pendingSpoolEmails) {
      const normSub = pendingMsg.subject.trim().toLowerCase();
      // Verificación estricta: si ya existe en el dashboard, fue atendido/resuelto, o es spam comercial, omitir
      if (existingTitles.includes(normSub) || isMatterResolved(pendingMsg.id, pendingMsg.subject) || isSpamCommercial(pendingMsg.subject, pendingMsg.body_text)) {
        processedSpoolIds.push(pendingMsg.id);
        continue;
      }

      const emailDto: InboundEmailDTO = {
        sender_name: pendingMsg.sender_name || 'Remitente Institucional',
        sender_email: pendingMsg.sender_email || email || 'contacto@gmail.com',
        recipient_email: email,
        subject: pendingMsg.subject,
        body_text: pendingMsg.body_text || 'Sin cuerpo de mensaje',
        reincidence_count: pendingMsg.reincidence_count || 1
      };

      const triageResult = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);

      // REGLA OBLIGATORIA: En Bandeja Inteligente SOLO deben aparecer correos de "Atención Inmediata CEO".
      // Los informativos, delegados y spam permanecen en Bandeja de Entrada (raw-inbox) pero NUNCA en Bandeja Inteligente.
      const isIntelligentInboxCandidate = triageResult.quadrant === 'ATENCION_CEO' && !isSpamCommercial(emailDto.subject, emailDto.body_text);

      if (isIntelligentInboxCandidate) {
        newMatters.push({
          id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          matter_code: `MAT-${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
          title: emailDto.subject,
          summary: triageResult.why_shown_to_director || emailDto.body_text.slice(0, 140) + '...',
          category: triageResult.category || 'Atención Inmediata CEO',
          urgency: triageResult.urgency,
          destination: 'ATENCION_CEO',
          why_shown: triageResult.why_shown_to_director,
          reincidence_count: emailDto.reincidence_count || 1,
          recommended_action: triageResult.recommended_action,
          suggested_draft_reply: triageResult.suggested_draft?.body || '',
          assigned_role: triageResult.assigned_role || triageResult.assigned_department || 'Dirección General',
          assigned_email: triageResult.delegate_email || '',
          sla_hours: triageResult.sla_hours || 12,
          sla_remaining_text: `⏱️ ${triageResult.sla_hours || 12}h restantes`,
          sender_name: emailDto.sender_name,
          sender_email: emailDto.sender_email,
          provenance_doc: triageResult.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Protocolo_Convivencia.md`,
          received_at: 'Justo ahora',
          campus: 'Campus Central'
        });
      }

      processedSpoolIds.push(pendingMsg.id);
      // Agregar al set local para evitar duplicados en la misma tanda
      existingTitles.push(normSub);
    }

    if (processedSpoolIds.length > 0) {
      InboundMailSpoolService.markAsProcessed(tenantId, processedSpoolIds);
    }

    // PASO 2.5: Descargar y procesar correos reales de Google OAuth 2.0 (si la cuenta está autorizada)
    await GoogleOAuthService.ensureTokensLoaded(email);
    const hasGoogleOAuth = GoogleOAuthService.hasValidTokens(email);
    if (hasGoogleOAuth) {
      try {
        const liveGoogle = await GoogleOAuthService.fetchRealGmailEmails(email, email, 30, tenantId);
        for (const msg of liveGoogle) {
          const normSubject = msg.subject.trim().toLowerCase();
          if (existingTitles.includes(normSubject) || isMatterResolved(msg.id, msg.subject)) continue;

          const isFoodDining = /comedor|alimento|comida|intoxicaci|malestar|est[oó]mac/i.test(`${msg.subject} ${msg.body_text || msg.snippet}`);
          const isCeo = (msg.triage_badge?.quadrant === 'ATENCION_CEO' || isFoodDining) && !isSpamCommercial(msg.subject, msg.body_text || msg.snippet);

          if (isCeo) {
            newMatters.push({
              id: `mat-live-${msg.id}`,
              matter_code: `MAT-${prefix}-2026-${msg.id.replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase() || '001'}`,
              title: msg.subject,
              summary: msg.snippet || msg.body_text.slice(0, 140) + '...',
              category: isFoodDining ? 'Salud y Alimentación Escolar' : 'Atención Inmediata CEO',
              urgency: 'CRITICA',
              destination: 'ATENCION_CEO',
              why_shown: isFoodDining
                ? 'Queja prioritaria sobre salud, bienestar físico y servicio de comedor escolar clasificada para atención inmediata de Dirección General.'
                : 'Correo prioritario en tiempo real clasificado por el Asistente Pedagógico IA como Atención Inmediata CEO.',
              reincidence_count: 1,
              recommended_action: 'Revisar expediente completo y validar borrador de respuesta oficial de Dirección General.',
              suggested_draft_reply: isFoodDining
                ? `Estimado(a) ${msg.sender_name}:\n\nHe recibido personalmente su comunicación en relación con el servicio de comedor escolar y el estado de salud de su hijo. En ${schoolName} la salud, nutrición y bienestar de nuestros estudiantes es un compromiso absoluto e inviolable.\n\nHe instruido una revisión inmediata de los insumos y menús servidos en cafetería y comedor, así como un seguimiento puntual con el área médica escolar. Me pongo a su entera disposición para cualquier aclaración directa.\n\nAtentamente,\nDirección General · ${schoolName}`
                : `Estimado(a) ${msg.sender_name}:\n\nHe recibido personalmente su comunicación en relación con: "${msg.subject}". En ${schoolName} la atención inmediata de este asunto es prioritaria.\n\nHe tomado conocimiento del tema y me encuentro coordinando la atención con las áreas correspondientes.\n\nAtentamente,\nDirección General · ${schoolName}`,
              assigned_role: 'Dirección General / CEO',
              assigned_email: email,
              sla_hours: 12,
              sla_remaining_text: '⏱️ 12h restantes',
              sender_name: msg.sender_name,
              sender_email: msg.sender_email,
              provenance_doc: `Buzón Institucional en Vivo (${msg.sender_email})`,
              received_at: msg.received_at || 'Justo ahora',
              campus: 'Plantel Central'
            });
            existingTitles.push(normSubject);
          }
        }
      } catch (oauthErr) {
        console.warn('Error sincronizando correos con Google OAuth en sync-inbox:', oauthErr);
      }
    }

    // PASO 2.6: Revisar caché de buzón (correos ya descargados por Bandeja de Entrada)
    const cachedInbox = getCachedInboxEmails(tenantId, email);
    if (cachedInbox && cachedInbox.length > 0) {
      for (const msg of cachedInbox) {
        const normSubject = msg.subject.trim().toLowerCase();
        if (existingTitles.includes(normSubject) || isMatterResolved(msg.id, msg.subject)) continue;

        const isFoodDining = /comedor|alimento|comida|intoxicaci|malestar|est[oó]mac/i.test(`${msg.subject} ${msg.body_text || msg.snippet}`);
        const isCeo = (msg.triage_badge?.quadrant === 'ATENCION_CEO' || isFoodDining) && !isSpamCommercial(msg.subject, msg.body_text || msg.snippet);

        if (isCeo) {
          newMatters.push({
            id: `mat-live-${msg.id}`,
            matter_code: `MAT-${prefix}-2026-${msg.id.replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase() || '001'}`,
            title: msg.subject,
            summary: msg.snippet || msg.body_text.slice(0, 140) + '...',
            category: isFoodDining ? 'Salud y Alimentación Escolar' : 'Atención Inmediata CEO',
            urgency: 'CRITICA',
            destination: 'ATENCION_CEO',
            why_shown: isFoodDining
              ? 'Queja prioritaria sobre salud, bienestar físico y servicio de comedor escolar clasificada para atención inmediata de Dirección General.'
              : 'Correo de alta prioridad clasificado por el Asistente Pedagógico IA como Atención Inmediata CEO.',
            reincidence_count: 1,
            recommended_action: 'Revisar expediente completo y validar borrador de respuesta oficial de Dirección General.',
            suggested_draft_reply: isFoodDining
              ? `Estimado(a) ${msg.sender_name}:\n\nHe recibido personalmente su comunicación en relación con el servicio de comedor escolar y el estado de salud de su hijo. En ${schoolName} la salud, nutrición y bienestar de nuestros estudiantes es un compromiso absoluto e inviolable.\n\nHe instruido una revisión inmediata de los insumos y menús servidos en cafetería y comedor, así como un seguimiento puntual con el área médica escolar. Me pongo a su entera disposición para cualquier aclaración directa.\n\nAtentamente,\nDirección General · ${schoolName}`
              : `Estimado(a) ${msg.sender_name}:\n\nHe recibido personalmente su comunicación en relación con: "${msg.subject}". En ${schoolName} la atención inmediata de este asunto es prioritaria.\n\nAtentamente,\nDirección General · ${schoolName}`,
            assigned_role: 'Dirección General / CEO',
            assigned_email: email,
            sla_hours: 12,
            sla_remaining_text: '⏱️ 12h restantes',
            sender_name: msg.sender_name,
            sender_email: msg.sender_email,
            provenance_doc: `Buzón Institucional en Vivo (${msg.sender_email})`,
            received_at: msg.received_at || 'Justo ahora',
            campus: 'Plantel Central'
          });
          existingTitles.push(normSubject);
        }
      }
    }

    // PASO 4: Consulta vía socket IMAP si se cuenta con contraseña / clave de aplicación
    let pass = (password || '').replace(/\s+/g, '');
    const isTargetGmail = (email || '').toLowerCase().includes('gmail.com');
    const imapHost = isTargetGmail ? 'imap.gmail.com' : (host || 'imap.gmail.com');
    const imapPort = isTargetGmail ? 993 : (Number(port) || 993);

    const hasPlaceholder = !pass || pass === '••••••••••••' || pass === 'password';

    let appPasswordRequired = false;

    if (!hasPlaceholder && (protocol === 'IMAP' || isTargetGmail)) {
      const imapResult = await fetchLiveImapEmails(imapHost, imapPort, email, pass, {
        tenantId,
        maxCount: 20
      });

      if (!imapResult.authenticated && imapResult.requiresAppPassword) {
        appPasswordRequired = true;
      }

      if (imapResult.success && imapResult.emails.length > 0) {
        for (const msg of imapResult.emails) {
          const normSubject = msg.subject.trim().toLowerCase();
          if (existingTitles.includes(normSubject) || isMatterResolved(msg.id, msg.subject)) continue;

          const emailDto: InboundEmailDTO = {
            sender_name: msg.sender_name || msg.sender_email,
            sender_email: msg.sender_email,
            recipient_email: email,
            subject: msg.subject,
            body_text: msg.body_text,
            reincidence_count: 1
          };

          const triage = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);

          if (triage.quadrant === 'ATENCION_CEO' && !isSpamCommercial(emailDto.subject, emailDto.body_text)) {
            newMatters.push({
              id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              matter_code: `MAT-${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
              title: emailDto.subject,
              summary: triage.why_shown_to_director || emailDto.body_text.slice(0, 140) + '...',
              category: triage.category || 'Atención Inmediata CEO',
              urgency: triage.urgency,
              destination: 'ATENCION_CEO',
              why_shown: triage.why_shown_to_director,
              reincidence_count: 1,
              recommended_action: triage.recommended_action,
              suggested_draft_reply: triage.suggested_draft?.body || '',
              assigned_role: triage.assigned_department || 'Dirección General',
              sla_hours: triage.sla_hours || 12,
              sla_remaining_text: `⏱️ ${triage.sla_hours || 12}h restantes`,
              sender_name: emailDto.sender_name,
              sender_email: emailDto.sender_email,
              provenance_doc: triage.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Calendario_Escolar.md`,
              received_at: 'Justo ahora',
              campus: 'Plantel Central'
            });
          }

          existingTitles.push(normSubject);
        }
      }
    }

    const filteredNewMatters = newMatters.filter(
      (m) => !isSpamCommercial(m.title, `${m.summary} ${m.why_shown}`)
    );

    return NextResponse.json({
      success: true,
      count: filteredNewMatters.length,
      newMatters: filteredNewMatters,
      autonomousBridgeActive: true,
      autoSyncIntervalSeconds: 30,
      appPasswordRequired,
      message: filteredNewMatters.length > 0
        ? `✓ Se procesaron y clasificaron ${filteredNewMatters.length} correo(s) nuevo(s) con Motor de IA.`
        : (appPasswordRequired
            ? 'Conexión activa pero Google requiere Contraseña de Aplicación de 16 caracteres para descargar correos.'
            : 'Sincronización en tiempo real activa (30s). Buzón institucional al día.')
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Error durante la sincronización de buzón.'
    }, { status: 500 });
  }
}

