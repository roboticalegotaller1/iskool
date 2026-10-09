import { NextRequest, NextResponse } from 'next/server';
import tls from 'tls';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { markEmailAsResolvedServer } from '../raw-inbox/route';
import { formatCdmxDate, formatCdmxTime } from '@/utils/timeZoneUtils';

export const runtime = 'nodejs';

interface SendMailRequest {
  senderEmail?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
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
  inReplyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return new Promise((resolve) => {
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
        rejectUnauthorized: false
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
        const headers = [
          `From: ${options.from}`,
          `To: ${options.to}`,
          `Subject: ${utf8Subject}`,
          `Date: ${dateStr}`,
          `Message-ID: ${msgId}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/plain; charset=utf-8`,
          `Content-Transfer-Encoding: 8bit`
        ];
        if (options.inReplyTo) {
          headers.push(`In-Reply-To: <${options.inReplyTo}>`);
          headers.push(`References: <${options.inReplyTo}>`);
        }
        const fullMessage = `${headers.join('\r\n')}\r\n\r\n${options.body}\r\n.\r\n`;
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
    const payload: SendMailRequest = await req.json();
    const {
      senderEmail,
      recipientEmail,
      recipientName,
      subject,
      bodyText,
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

    const effectiveSender = (senderEmail || 'roboticalegotaller1@gmail.com').trim().toLowerCase();

    // 1. Intentar despacho primario oficial vía Google Mail API (OAuth 2.0)
    let dispatchResult = await GoogleOAuthService.sendEmailViaGmailApi({
      senderEmail: effectiveSender,
      recipientEmail,
      recipientName,
      subject,
      bodyText,
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
      sender: effectiveSender,
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
