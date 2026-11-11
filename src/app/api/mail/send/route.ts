import { NextRequest, NextResponse } from 'next/server';
import tls from 'tls';
import { validateApiAuth } from '@/lib/authValidator';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { markEmailAsResolvedServer } from '../raw-inbox/route';
import { formatCdmxDate, formatCdmxTime } from '@/utils/timeZoneUtils';
import { validateMailTarget } from '@/lib/security/ssrfValidator';

export const runtime = 'nodejs';

interface InlineVisualAttachmentPayload {
  cid: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
}

interface SendMailRequest {
  senderEmail?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  inlineVisualAttachment?: InlineVisualAttachmentPayload;
  threadId?: string;
  inReplyToMessageId?: string;
  tenantId?: string;
  smtpConfig?: {
    host?: string;
    port?: number;
    security?: string;
    username?: string;
    password?: string;
  };
}

const MAX_INLINE_VISUAL_B64_CHARS = 650_000; // Estricto < ~480 KB Base64 (~360 KB binarios, Regla No Negociable 3)

/**
 * Envío soberano directo por protocolo SMTP sobre TLS (Puerto 465 / 587)
 * Permite despachar correos con Contraseñas de Aplicación sin depender de bibliotecas externas
 */
function sendViaNativeTlsSmtp(options: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  inlineVisualAttachment?: InlineVisualAttachmentPayload;
  inReplyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return new Promise((resolve) => {
    const targetCheck = validateMailTarget(options.host, options.port);
    if (!targetCheck.valid) {
      return resolve({ success: false, error: targetCheck.reason || 'Servidor SMTP bloqueado por seguridad.' });
    }

    const timeout = 12000;
    let isFinished = false;

    const finish = (result: { success: boolean; messageId?: string; error?: string }) => {
      if (isFinished) return;
      isFinished = true;
      try {
        socket.destroy();
      } catch {}
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ success: false, error: 'Tiempo de espera agotado al conectar con el servidor SMTP' });
    }, timeout);

    const socket = tls.connect(
      options.port || 465,
      options.host || 'smtp.gmail.com',
      {
        servername: options.host || 'smtp.gmail.com',
        rejectUnauthorized: true
      },
      () => {
        // Conexión TLS establecida
      }
    );

    let stage = 0;
    const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
    const cleanUser = options.user.trim();
    const cleanPass = options.pass.trim();

    socket.on('data', (chunk) => {
      const resp = chunk.toString();
      const code = parseInt(resp.slice(0, 3), 10);

      if (code >= 400 && code < 600) {
        clearTimeout(timer);
        return finish({ success: false, error: `Error SMTP (${code}): ${resp.trim()}` });
      }

      if (stage === 0 && code === 220) {
        stage = 1;
        socket.write(`EHLO iskool.mx\r\n`);
      } else if (stage === 1 && code === 250) {
        stage = 2;
        socket.write(`AUTH LOGIN\r\n`);
      } else if (stage === 2 && code === 334) {
        stage = 3;
        socket.write(`${Buffer.from(cleanUser).toString('base64')}\r\n`);
      } else if (stage === 3 && code === 334) {
        stage = 4;
        socket.write(`${Buffer.from(cleanPass).toString('base64')}\r\n`);
      } else if (stage === 4 && code === 235) {
        // Autenticado con éxito
        stage = 5;
        socket.write(`MAIL FROM:<${options.from}>\r\n`);
      } else if (stage === 5 && code === 250) {
        stage = 6;
        socket.write(`RCPT TO:<${options.to}>\r\n`);
      } else if (stage === 6 && code === 250) {
        stage = 7;
        socket.write(`DATA\r\n`);
      } else if (stage === 7 && code === 354) {
        stage = 8;
        const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2, 9)}@iskool.mx>`;
        const dateStr = new Date().toUTCString();
        const rfc822 = GoogleOAuthService.buildRfc822MimePayload({
          from: options.from,
          to: options.to,
          utf8Subject,
          dateHeader: dateStr,
          uniqueMsgId: msgId,
          inReplyToMessageId: options.inReplyTo,
          bodyText: options.body,
          bodyHtml: options.bodyHtml,
          inlineVisualAttachment: options.inlineVisualAttachment,
        });
        // Dot-stuffing conforme a RFC 5321 §4.5.2
        const dotStuffed = rfc822.replace(/\r\n\./g, '\r\n..');
        const fullMessage = `${dotStuffed}\r\n.\r\n`;
        socket.write(fullMessage);
      } else if (stage === 8 && code === 250) {
        clearTimeout(timer);
        socket.write(`QUIT\r\n`);
        finish({ success: true, messageId: `smtp-${Date.now()}` });
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      finish({ success: false, error: `Error de red en conexión SMTP: ${err.message}` });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verificación perimetral de autenticación Zero-Trust (Solo sesiones autorizadas)
    const auth = await validateApiAuth(req);
    const isTest = process.env.NODE_ENV === 'test';

    if (!auth.authenticated && !isTest) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para despachar correos institucionales.' },
        { status: 401 }
      );
    }

    // Prevención de Impersonación y Control de Roles (CASA ASVS V4)
    if (auth.authenticated && auth.user) {
      const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'billing', 'owner', 'ceo', 'teacher'];
      const userRole = (auth.user.role || '').toLowerCase();
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado: El rol de su cuenta no tiene autorización para enviar correos institucionales.' },
          { status: 403 }
        );
      }
    }

    const payload: SendMailRequest = await req.json();
    const {
      senderEmail,
      recipientEmail,
      recipientName,
      subject,
      bodyText,
      bodyHtml,
      inlineVisualAttachment,
      threadId,
      inReplyToMessageId,
      tenantId = 'ibime',
      smtpConfig
    } = payload;

    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json({ success: false, error: 'Destinatario no especificado' }, { status: 400 });
    }

    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json({ success: false, error: 'El contenido del correo no puede estar vacío' }, { status: 400 });
    }

    let validatedInlineVisual: InlineVisualAttachmentPayload | undefined;
    if (inlineVisualAttachment && inlineVisualAttachment.base64Data && inlineVisualAttachment.cid) {
      if (inlineVisualAttachment.base64Data.length > MAX_INLINE_VISUAL_B64_CHARS) {
        return NextResponse.json(
          { success: false, error: 'El activo gráfico adjunto excede el límite institucional de compresión WebP (< 400 KB).' },
          { status: 413 }
        );
      }
      validatedInlineVisual = {
        cid: String(inlineVisualAttachment.cid).slice(0, 120),
        fileName: String(inlineVisualAttachment.fileName || 'comunicado-institucional.webp').slice(0, 120),
        mimeType: String(inlineVisualAttachment.mimeType || 'image/webp').slice(0, 48),
        base64Data: inlineVisualAttachment.base64Data,
      };
    }

    // Si el usuario es un docente o rol no directivo, forzar que el remitente sea su propio correo verificado
    let effectiveSender = GoogleOAuthService.resolveEffectiveGoogleEmail(senderEmail);
    if (auth.authenticated && auth.user) {
      const userRole = (auth.user.role || '').toLowerCase();
      const isDirectorOrAdmin = ['admin', 'superadmin', 'director', 'ceo', 'owner'].includes(userRole);
      if (!isDirectorOrAdmin && auth.user.email) {
        effectiveSender = GoogleOAuthService.resolveEffectiveGoogleEmail(auth.user.email);
      }
    }

    // 1. Intentar despacho primario oficial vía Google Mail API (OAuth 2.0)
    let dispatchResult = await GoogleOAuthService.sendEmailViaGmailApi({
      senderEmail: effectiveSender,
      recipientEmail,
      recipientName,
      subject,
      bodyText,
      bodyHtml,
      inlineVisualAttachment: validatedInlineVisual,
      threadId,
      inReplyToMessageId
    });

    let usedProvider = 'google_workspace';

    // 2. Si Google API falló o no cuenta con tokens, y se cuenta con configuración SMTP / Contraseña de Aplicación
    if (!dispatchResult.success && smtpConfig?.password) {
      console.warn('Fallo en Google API, reintentando con SMTP nativo TLS:', dispatchResult.error);
      const host = smtpConfig.host || (effectiveSender.includes('gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');
      const port = smtpConfig.port || 465;
      const smtpRes = await sendViaNativeTlsSmtp({
        host,
        port,
        user: smtpConfig.username || effectiveSender,
        pass: smtpConfig.password,
        from: effectiveSender,
        to: recipientEmail,
        subject,
        body: bodyText,
        bodyHtml,
        inlineVisualAttachment: validatedInlineVisual,
        inReplyTo: inReplyToMessageId
      });

      if (smtpRes.success) {
        dispatchResult = {
          success: true,
          messageId: smtpRes.messageId,
          threadId: threadId || smtpRes.messageId
        };
        usedProvider = 'smtp_tls';
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Error al despachar correo: Google API (${dispatchResult.error}) | SMTP (${smtpRes.error})`
          },
          { status: 502 }
        );
      }
    }

    if (!dispatchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: dispatchResult.error || 'No fue posible despachar el correo con los proveedores configurados'
        },
        { status: 500 }
      );
    }

    // 3. Registrar resolución atómica del expediente en el servidor para evitar que vuelva a aparecer
    if (inReplyToMessageId || subject) {
      markEmailAsResolvedServer(tenantId, inReplyToMessageId, subject);
    }

    const now = new Date();
    return NextResponse.json({
      success: true,
      messageId: dispatchResult.messageId,
      threadId: dispatchResult.threadId,
      recipient: recipientEmail,
      sender: dispatchResult.senderEmail || effectiveSender,
      endpoint: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      dispatchedAt: `${formatCdmxDate(now)} ${formatCdmxTime(now)} (CDMX)`,
      provider: usedProvider
    });
  } catch (err: any) {
    console.error('Error no controlado en /api/mail/send:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno al despachar correo' },
      { status: 500 }
    );
  }
}
