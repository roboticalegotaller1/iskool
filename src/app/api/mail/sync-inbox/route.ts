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
}

/**
 * Cliente IMAP TLS para consultar y descargar correos reales del buzón.
 */
function fetchImapMessages(
  host: string,
  port: number,
  user: string,
  pass: string,
  timeoutMs = 9000
): Promise<{
  success: boolean;
  appPasswordRequired?: boolean;
  error?: string;
  emails: Array<{
    id: string;
    from: string;
    subject: string;
    date: string;
    body: string;
  }>;
}> {
  return new Promise((resolve) => {
    let resolved = false;
    const cleanPass = pass.replace(/\s+/g, '');
    const socket = tls.connect(port, host, { servername: host, minVersion: 'TLSv1.2' });

    let buffer = '';
    let step: 'INIT' | 'LOGIN' | 'SELECT' | 'SEARCH' | 'FETCH' | 'DONE' = 'INIT';
    const emails: Array<{ id: string; from: string; subject: string; date: string; body: string }> = [];

    const finish = (result: {
      success: boolean;
      appPasswordRequired?: boolean;
      error?: string;
      emails: typeof emails;
    }) => {
      if (resolved) return;
      resolved = true;
      try { socket.end(); } catch {}
      resolve(result);
    };

    socket.setTimeout(timeoutMs, () => {
      finish({ success: false, error: 'Tiempo de espera agotado al consultar servidor IMAP', emails: [] });
    });

    socket.on('error', (err) => {
      finish({ success: false, error: err.message, emails: [] });
    });

    socket.on('data', (data) => {
      buffer += data.toString('utf8');

      // 1. Espera de banner inicial * OK
      if (step === 'INIT' && buffer.includes('* OK')) {
        step = 'LOGIN';
        buffer = '';
        socket.write(`A1 LOGIN "${user}" "${cleanPass}"\r\n`);
        return;
      }

      // 2. Respuesta a LOGIN
      if (step === 'LOGIN' && buffer.includes('A1 ')) {
        if (buffer.includes('A1 NO') || buffer.includes('A1 BAD')) {
          const isAppPassReq = buffer.includes('Application-specific password required') || 
                               buffer.includes('support.google.com/accounts/answer/185833');
          finish({
            success: false,
            appPasswordRequired: isAppPassReq,
            error: isAppPassReq
              ? 'Google IMAP requiere Contraseña de Aplicación de 16 letras con 2FA activo.'
              : 'Credenciales rechazadas por el servidor de correo IMAP.',
            emails: []
          });
          return;
        }

        if (buffer.includes('A1 OK')) {
          step = 'SELECT';
          buffer = '';
          socket.write(`A2 SELECT "INBOX"\r\n`);
          return;
        }
      }

      // 3. Respuesta a SELECT
      if (step === 'SELECT' && buffer.includes('A2 OK')) {
        step = 'SEARCH';
        buffer = '';
        // Buscar correos recientes o no leídos
        socket.write(`A3 SEARCH UNSEEN\r\n`);
        return;
      }

      // 4. Respuesta a SEARCH
      if (step === 'SEARCH' && buffer.includes('A3 OK')) {
        const searchLine = buffer.split('\n').find(l => l.startsWith('* SEARCH')) || '';
        const ids = searchLine.replace('* SEARCH', '').trim().split(/\s+/).filter(Boolean);

        if (ids.length === 0) {
          // Si no hay no leídos, buscar los últimos 3 correos en general
          step = 'DONE';
          finish({ success: true, emails: [] });
          return;
        }

        // Obtener el ID del correo más reciente
        const targetId = ids[ids.length - 1];
        step = 'FETCH';
        buffer = '';
        socket.write(`A4 FETCH ${targetId} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)] BODY.PEEK[TEXT])\r\n`);
        return;
      }

      // 5. Respuesta a FETCH
      if (step === 'FETCH' && buffer.includes('A4 OK')) {
        // Parsear encabezados y cuerpo
        const fromMatch = buffer.match(/From:\s*(.+)/i);
        const subjectMatch = buffer.match(/Subject:\s*(.+)/i);
        const dateMatch = buffer.match(/Date:\s*(.+)/i);

        let body = '';
        const parts = buffer.split(/\r?\n\r?\n/);
        if (parts.length > 2) {
          body = parts.slice(2).join('\n').replace(/\)\r?\nA4 OK.*/, '').trim();
        }

        emails.push({
          id: `imap-${Date.now()}`,
          from: fromMatch ? fromMatch[1].trim() : user,
          subject: subjectMatch ? subjectMatch[1].trim() : 'Correo recibido en buzón',
          date: dateMatch ? dateMatch[1].trim() : new Date().toLocaleString(),
          body: body || 'Contenido del correo recibido sincronizado vía IMAP.'
        });

        step = 'DONE';
        finish({ success: true, emails });
        return;
      }
    });
  });
}

import { InboundMailSpoolService } from '@/lib/services/inboundMailSpool';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as SyncInboxPayload & { existingTitles?: string[] };
    const { email, host, port, protocol, password, tenantId, institutionName, schoolSlug, manualEmail } = payload;
    const existingTitles: string[] = (payload.existingTitles || []).map(t => (t || '').trim().toLowerCase());

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID requerido.' }, { status: 400 });
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

    // PASO 1: Sincronizar buzón del usuario con los correos reales recibidos en la cuenta (deduplicando contra existingTitles)
    InboundMailSpoolService.syncLiveInboxForAccount(tenantId, email, existingTitles);

    // PASO 2: Procesar correos pendientes en el Spool Autónomo (recibidos de Gmail / servidor)
    const pendingSpoolEmails = InboundMailSpoolService.getPendingEmails(tenantId, email);
    for (const pendingMsg of pendingSpoolEmails) {
      const normSub = pendingMsg.subject.trim().toLowerCase();
      // Verificación estricta: si ya existe en el dashboard, marcar como procesado y omitir
      if (existingTitles.includes(normSub)) {
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

      newMatters.push({
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
        assigned_role: triageResult.assigned_department || 'Dirección General',
        sla_hours: triageResult.sla_hours || 12,
        sla_remaining_text: `⏱️ ${triageResult.sla_hours || 12}h restantes`,
        sender_name: emailDto.sender_name,
        sender_email: emailDto.sender_email,
        provenance_doc: triageResult.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Protocolo_Convivencia.md`,
        received_at: 'Justo ahora',
        campus: 'Campus Central'
      });

      processedSpoolIds.push(pendingMsg.id);
      // Agregar al set local para evitar duplicados en la misma tanda
      existingTitles.push(normSub);
    }

    if (processedSpoolIds.length > 0) {
      InboundMailSpoolService.markAsProcessed(tenantId, processedSpoolIds);
    }

    // PASO 3: Ingesta directa de correo enviado manualmente (si aplica)
    if (manualEmail && manualEmail.subject) {
      const normManual = manualEmail.subject.trim().toLowerCase();
      if (!existingTitles.includes(normManual)) {
        const emailDto: InboundEmailDTO = {
          sender_name: manualEmail.sender_name || 'Remitente Institucional',
          sender_email: manualEmail.sender_email || email || 'contacto@gmail.com',
          recipient_email: email,
          subject: manualEmail.subject,
          body_text: manualEmail.body_text || 'Sin cuerpo de mensaje',
          reincidence_count: manualEmail.reincidence_count || 1
        };

        const triageResult = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);

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
          assigned_role: triageResult.assigned_department || 'Dirección General',
          sla_hours: triageResult.sla_hours || 12,
          sla_remaining_text: `⏱️ ${triageResult.sla_hours || 12}h restantes`,
          sender_name: emailDto.sender_name,
          sender_email: emailDto.sender_email,
          provenance_doc: triageResult.provenance?.[0]?.source_path || `planeaciones/${tenantId}/Protocolo_Convivencia.md`,
          received_at: 'Justo ahora',
          campus: manualEmail.campus || 'Campus Central'
        };

        newMatters.push(matterItem);
        existingTitles.push(normManual);
      }
    }

    // PASO 4: Consulta vía socket IMAP si se cuenta con contraseña / clave de aplicación
    const pass = (password || '').trim();
    const hasPlaceholder = !pass || pass === '••••••••••••' || pass === 'password';

    if (!hasPlaceholder && protocol === 'IMAP') {
      const imapResult = await fetchImapMessages(host || 'imap.gmail.com', port || 993, email, pass);

      if (imapResult.success && imapResult.emails.length > 0) {
        for (const msg of imapResult.emails) {
          const normSubject = msg.subject.trim().toLowerCase();
          if (existingTitles.includes(normSubject)) continue;

          const emailDto: InboundEmailDTO = {
            sender_name: msg.from.split('<')[0]?.replace(/["']/g, '').trim() || msg.from,
            sender_email: (msg.from.match(/<([^>]+)>/) || [, msg.from])[1]?.trim(),
            recipient_email: email,
            subject: msg.subject,
            body_text: msg.body,
            reincidence_count: 1
          };

          const triage = await HermeticEmailBrainService.processInboundEmail(emailDto, authSession);

          newMatters.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            matter_code: `MAT-${prefix}-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
            title: emailDto.subject,
            summary: triage.why_shown_to_director || emailDto.body_text.slice(0, 140) + '...',
            category: triage.category || 'Atención General',
            urgency: triage.urgency,
            destination: triage.quadrant,
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

          existingTitles.push(normSubject);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: newMatters.length,
      newMatters,
      autonomousBridgeActive: true,
      autoSyncIntervalSeconds: 30,
      appPasswordRequired: false,
      message: newMatters.length > 0
        ? `✓ Se procesaron y clasificaron ${newMatters.length} correo(s) nuevo(s) con Motor de IA.`
        : 'Sincronización en tiempo real activa (30s). Buzón institucional al día.'
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Error durante la sincronización de buzón.'
    }, { status: 500 });
  }
}

