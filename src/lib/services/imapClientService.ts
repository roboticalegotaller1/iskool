import tls from 'tls';
import { RawGmailItem } from '@/app/api/mail/raw-inbox/route';

/**
 * ============================================================================
 * MOTOR Y CLIENTE IMAP EN TIEMPO REAL (iSkool Sovereign IMAP Engine)
 * Conexión TLS cifrada con servidores de correo (Google Workspace, Gmail, IMAP institucional).
 * Decodificación de cabeceras RFC 2047, cuerpos MIME, detección de estado leído/no leído,
 * clasificación pedagógica y persistencia en búfer de alta fidelidad.
 * ============================================================================
 */

export interface ImapEmailResult {
  success: boolean;
  authenticated: boolean;
  requiresAppPassword?: boolean;
  error?: string;
  totalInBox?: number;
  emails: RawGmailItem[];
  lastSyncTime: string;
  connectedEmail: string;
  latencyMs: number;
}

// Búfer en memoria global para retener correos reales descargados del buzón
const globalInboxCache: Map<string, { emails: RawGmailItem[]; lastSync: number }> =
  (globalThis as any).__iskoolRealInboxCache ||
  ((globalThis as any).__iskoolRealInboxCache = new Map());

/**
 * Decodificador RFC 2047 para Asuntos y Remitentes con codificación Base64 o Quoted-Printable
 * Ej: =?UTF-8?B?QWx1bW5vIGhlcmlkbyBlbiBsYXMgY2FuY2hhcw==?=
 */
export function decodeMimeHeader(input: string): string {
  if (!input) return '';
  return input.replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g, (match, charset, encoding, text) => {
    try {
      const cs = charset.toLowerCase();
      const enc = encoding.toUpperCase();
      let buf: Buffer;
      if (enc === 'B') {
        buf = Buffer.from(text, 'base64');
      } else if (enc === 'Q') {
        const bytes: number[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text[i] === '_') {
            bytes.push(0x20);
          } else if (text[i] === '=' && i + 2 < text.length && /^[0-9A-Fa-f]{2}$/.test(text.substr(i + 1, 2))) {
            bytes.push(parseInt(text.substr(i + 1, 2), 16));
            i += 2;
          } else {
            bytes.push(text.charCodeAt(i));
          }
        }
        buf = Buffer.from(bytes);
      } else {
        return match;
      }

      if (cs.includes('iso-8859-1') || cs.includes('latin1')) {
        return buf.toString('latin1');
      }
      return buf.toString('utf8');
    } catch {
      return match;
    }
  });
}

/**
 * Decodificar cuerpo Quoted-Printable en texto plano legible
 */
export function decodeQuotedPrintable(text: string): string {
  if (!text) return '';
  // Remover saltos suaves =\r\n
  const stripped = text.replace(/=\r?\n/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === '=' && i + 2 < stripped.length && /^[0-9A-Fa-f]{2}$/.test(stripped.substr(i + 1, 2))) {
      bytes.push(parseInt(stripped.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(stripped.charCodeAt(i));
    }
  }
  try {
    return Buffer.from(bytes).toString('utf8');
  } catch {
    return text;
  }
}

/**
 * Extraer texto limpio de cuerpo HTML o MIME multipart
 */
export function cleanEmailBody(rawBody: string): string {
  if (!rawBody) return '';
  let body = decodeQuotedPrintable(rawBody);

  // Si es multipart, buscar la sección text/plain
  if (body.includes('Content-Type: text/plain')) {
    const parts = body.split(/--[a-zA-Z0-9_-]+/);
    for (const part of parts) {
      if (part.includes('Content-Type: text/plain')) {
        const subParts = part.split(/\r?\n\r?\n/);
        if (subParts.length > 1) {
          body = subParts.slice(1).join('\n');
          break;
        }
      }
    }
  }

  // Eliminar etiquetas HTML residuales
  body = body
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  return body;
}

/**
 * Clasificación y cuadrante cognitivo basado en el contenido del correo
 */
function classifyEmailTriage(subject: string, body: string): {
  category: 'principal' | 'actualizaciones' | 'promociones' | 'spam';
  triage_badge: RawGmailItem['triage_badge'];
} {
  const text = `${subject} ${body}`.toLowerCase();

  const isMandatoryCeoKeyword = /\b(supervision|supervisión|sep|cte)\b/i.test(text) || text.includes('supervisi') || text.includes('supervisió') || text.includes('cte');
  const urgentKeywords = ['herido', 'accidente', 'urgente', 'queja', 'agresión', 'demanda', 'emergencia', 'violencia', 'grave', 'hospital'];
  const operationalKeywords = ['factura', 'pago', 'colegiatura', 'cfdi', 'transporte', 'ruta', 'descuento', 'beca', 'constancia', 'inscripción', 'reinscripción'];
  const informativeKeywords = ['circular', 'aviso', 'calendario', 'reunión', 'asistencia', 'oficio', 'acuse', 'convocatoria'];
  const spamKeywords = ['premio', 'tarjeta de regalo', 'ganador', 'bitcoin', 'crypto', 'remate', 'préstamo', 'oferta exclusiva'];
  const promoKeywords = ['descuento', 'liquidación', 'marketing', 'simposio', 'conferencia', 'software', 'hosting', 'webinar'];

  if (isMandatoryCeoKeyword || urgentKeywords.some(k => text.includes(k))) {
    return {
      category: 'principal',
      triage_badge: {
        quadrant: 'ATENCION_CEO',
        label: '🔴 ATENCIÓN INMEDIATA CEO',
        color: 'bg-red-50 text-red-700 border-red-200'
      }
    };
  }

  if (operationalKeywords.some(k => text.includes(k))) {
    return {
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'DELEGADO_CON_PLAZO',
        label: '🟡 DELEGADO OPERATIVO',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    };
  }

  if (spamKeywords.some(k => text.includes(k))) {
    return {
      category: 'spam',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⛔ SPAM MALICIOSO / PHISHING',
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    };
  }

  if (promoKeywords.some(k => text.includes(k))) {
    return {
      category: 'promociones',
      triage_badge: {
        quadrant: 'SPAM_DESCARTADO',
        label: '⚪ PROMOCIÓN EXTERNA',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      }
    };
  }

  if (informativeKeywords.some(k => text.includes(k))) {
    return {
      category: 'actualizaciones',
      triage_badge: {
        quadrant: 'INFORMATIVO',
        label: '🟢 INFORMATIVO',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    };
  }

  return {
    category: 'principal',
    triage_badge: {
      quadrant: 'INFORMATIVO',
      label: '🟢 COMUNICACIÓN GENERAL',
      color: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  };
}

/**
 * Cliente IMAP TLS para descargar correos reales de Google / IMAP
 */
export async function fetchLiveImapEmails(
  host: string,
  port: number,
  user: string,
  pass: string,
  options?: {
    maxCount?: number;
    timeoutMs?: number;
    tenantId?: string;
  }
): Promise<ImapEmailResult> {
  const startTime = Date.now();
  const maxCount = options?.maxCount || 20;
  const timeoutMs = options?.timeoutMs || 8500;
  const cleanPass = (pass || '').replace(/\s+/g, '');
  const cleanUser = (user || '').trim().toLowerCase();
  const tenantKey = `${options?.tenantId || 'sch-default'}:${cleanUser}`;

  // Si no hay contraseña real, informar inmediatamente sin fingir
  if (!cleanPass || cleanPass === '••••••••••••' || cleanPass === 'password') {
    const cached = globalInboxCache.get(tenantKey);
    return {
      success: false,
      authenticated: false,
      requiresAppPassword: true,
      error: 'Google IMAP requiere una Contraseña de Aplicación de 16 caracteres para acceder al buzón en tiempo real.',
      emails: cached?.emails || [],
      lastSyncTime: 'Requiere credencial',
      connectedEmail: cleanUser,
      latencyMs: 18
    };
  }

  return new Promise((resolve) => {
    let isResolved = false;
    let socket: tls.TLSSocket;
    let buffer = '';
    let step: 'INIT' | 'LOGIN' | 'SELECT' | 'FETCH' | 'LOGOUT' | 'DONE' = 'INIT';
    let existsCount = 0;
    let emails: RawGmailItem[] = [];

    const finish = (result: Omit<ImapEmailResult, 'latencyMs'>) => {
      if (isResolved) return;
      isResolved = true;
      const latencyMs = Math.max(1, Date.now() - startTime);
      try {
        if (socket && !socket.destroyed) {
          socket.write('T99 LOGOUT\r\n');
          socket.end();
          socket.destroy();
        }
      } catch {}

      if (result.success && result.emails.length > 0) {
        globalInboxCache.set(tenantKey, { emails: result.emails, lastSync: Date.now() });
      }

      resolve({
        latencyMs,
        ...result
      });
    };

    try {
      socket = tls.connect(
        port,
        host,
        {
          servername: host,
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false
        },
        () => {
          // Handshake completado
        }
      );
    } catch (err: any) {
      finish({
        success: false,
        authenticated: false,
        error: `Fallo al iniciar conexión TLS con ${host}:${port}: ${err.message}`,
        emails: [],
        lastSyncTime: 'Error de red',
        connectedEmail: cleanUser
      });
      return;
    }

    socket.setTimeout(timeoutMs, () => {
      finish({
        success: false,
        authenticated: false,
        error: `Tiempo de espera agotado (${timeoutMs}ms) al sincronizar con ${host}:${port}.`,
        emails: globalInboxCache.get(tenantKey)?.emails || [],
        lastSyncTime: 'Timeout',
        connectedEmail: cleanUser
      });
    });

    socket.on('error', (err: any) => {
      finish({
        success: false,
        authenticated: false,
        error: `Error de socket TLS: ${err.message}`,
        emails: globalInboxCache.get(tenantKey)?.emails || [],
        lastSyncTime: 'Error',
        connectedEmail: cleanUser
      });
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');

      // 1. Banner inicial de bienvenida (* OK)
      if (step === 'INIT' && buffer.includes('* OK')) {
        step = 'LOGIN';
        buffer = '';
        const safeUser = cleanUser.replace(/"/g, '\\"');
        const safePass = cleanPass.replace(/"/g, '\\"');
        socket.write(`T01 LOGIN "${safeUser}" "${safePass}"\r\n`);
        return;
      }

      // 2. Respuesta a LOGIN
      if (step === 'LOGIN' && buffer.includes('T01 ')) {
        if (buffer.includes('T01 NO') || buffer.includes('T01 BAD') || buffer.includes('AUTHENTICATIONFAILED')) {
          const isGoogleAppPassReq =
            buffer.includes('Application-specific password required') ||
            buffer.includes('support.google.com/accounts/answer/185833') ||
            buffer.includes('Invalid credentials');

          finish({
            success: false,
            authenticated: false,
            requiresAppPassword: isGoogleAppPassReq,
            error: isGoogleAppPassReq
              ? 'Google IMAP rechazó el acceso: Tu cuenta requiere una Contraseña de Aplicación de 16 caracteres (2FA activo) generada en myaccount.google.com/apppasswords.'
              : 'Credenciales inválidas en el servidor IMAP.',
            emails: globalInboxCache.get(tenantKey)?.emails || [],
            lastSyncTime: 'No autorizado',
            connectedEmail: cleanUser
          });
          return;
        }

        if (buffer.includes('T01 OK')) {
          step = 'SELECT';
          buffer = '';
          socket.write(`T02 SELECT "INBOX"\r\n`);
          return;
        }
      }

      // 3. Respuesta a SELECT "INBOX"
      if (step === 'SELECT' && buffer.includes('T02 OK')) {
        // Parsear cantidad de correos existentes: * 48 EXISTS
        const existsMatch = buffer.match(/\*\s+(\d+)\s+EXISTS/i);
        existsCount = existsMatch ? parseInt(existsMatch[1], 10) : 0;

        if (existsCount === 0) {
          step = 'DONE';
          finish({
            success: true,
            authenticated: true,
            totalInBox: 0,
            emails: [],
            lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            connectedEmail: cleanUser
          });
          return;
        }

        // Determinar rango de descarga (los últimos N mensajes)
        const startSeq = Math.max(1, existsCount - maxCount + 1);
        const endSeq = existsCount;

        step = 'FETCH';
        buffer = '';
        socket.write(
          `T03 FETCH ${startSeq}:${endSeq} (UID FLAGS INTERNALDATE RFC822.SIZE BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID CONTENT-TYPE)] BODY.PEEK[TEXT]<0.8192>)\r\n`
        );
        return;
      }

      // 4. Respuesta a FETCH
      if (step === 'FETCH' && (buffer.includes('T03 OK') || buffer.includes('T03 NO') || buffer.includes('T03 BAD'))) {
        const fetchBlocks = buffer.split(/\*\s+\d+\s+FETCH\s+/i).filter(Boolean);

        for (let idx = 0; idx < fetchBlocks.length; idx++) {
          const block = fetchBlocks[idx];
          if (!block || block.startsWith('T03')) continue;

          // Extraer UID si está presente
          const uidMatch = block.match(/UID\s+(\d+)/i);
          const uid = uidMatch ? uidMatch[1] : `uid-${Date.now()}-${idx}`;

          // Extraer FLAGS para estado no leído
          const flagsMatch = block.match(/FLAGS\s*\(([^)]*)\)/i);
          const flags = flagsMatch ? flagsMatch[1] : '';
          const isUnread = !flags.includes('\\Seen');

          // Extraer Encabezados
          const fromMatch = block.match(/From:\s*([^\r\n]+)/i);
          const toMatch = block.match(/To:\s*([^\r\n]+)/i);
          const subjectMatch = block.match(/Subject:\s*([^\r\n]+)/i);
          const dateMatch = block.match(/Date:\s*([^\r\n]+)/i);

          const rawSubject = subjectMatch ? subjectMatch[1].trim() : '(Sin asunto)';
          const rawFrom = fromMatch ? fromMatch[1].trim() : cleanUser;
          const rawTo = toMatch ? toMatch[1].trim() : cleanUser;

          const decodedSubject = decodeMimeHeader(rawSubject);
          const decodedFrom = decodeMimeHeader(rawFrom);

          // Extraer nombre del remitente y correo electrónico
          const senderEmailMatch = decodedFrom.match(/<([^>]+)>/);
          const senderEmail = senderEmailMatch ? senderEmailMatch[1].trim() : decodedFrom.replace(/["']/g, '').trim();
          const senderName = decodedFrom.split('<')[0]?.replace(/["']/g, '').trim() || senderEmail;

          // Extraer Cuerpo del Correo
          let rawBodyText = '';
          const bodyParts = block.split(/BODY\[TEXT[^\]]*\]\s*(\{\d+\}\r?\n)?/i);
          if (bodyParts.length > 1) {
            rawBodyText = bodyParts.slice(1).join('\n').replace(/\)\r?\n(?:T03|\*\s+\d+)[\s\S]*/, '').trim();
          }

          const cleanBody = cleanEmailBody(rawBodyText) || decodedSubject;
          const snippet = cleanBody.slice(0, 130) + (cleanBody.length > 130 ? '...' : '');

          // Clasificación y Cuadrante Cognitivo
          const triage = classifyEmailTriage(decodedSubject, cleanBody);

          // Formateo de fecha y hora
          let formattedDate = 'Hoy';
          let timeDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (dateMatch) {
            try {
              const d = new Date(dateMatch[1].trim());
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString([], { day: '2-digit', month: 'short' });
                timeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            } catch {}
          }

          emails.push({
            id: `imap-${uid}`,
            sender_name: senderName,
            sender_email: senderEmail,
            recipient_email: rawTo,
            subject: decodedSubject,
            snippet,
            body_text: cleanBody,
            received_at: formattedDate,
            timestamp: timeDisplay,
            is_unread: isUnread,
            is_starred: false,
            is_important: triage.triage_badge?.quadrant === 'ATENCION_CEO',
            category: triage.category,
            triage_badge: triage.triage_badge
          });
        }

        // Ordenar en orden cronológico inverso (el más reciente arriba)
        emails.reverse();

        step = 'DONE';
        finish({
          success: true,
          authenticated: true,
          totalInBox: existsCount,
          emails,
          lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          connectedEmail: cleanUser
        });
        return;
      }
    });
  });
}

/**
 * Obtener correos cacheados de la sesión para respuesta instantánea (con aislamiento estricto por tenant y cuenta)
 */
export function getCachedInboxEmails(tenantId: string, email?: string): RawGmailItem[] | null {
  if (!email) {
    const item = globalInboxCache.get(tenantId);
    return item ? item.emails : null;
  }
  const cleanUser = email.trim().toLowerCase();
  const tenantKey = `${tenantId}:${cleanUser}`;
  const item = globalInboxCache.get(tenantKey) || globalInboxCache.get(tenantId);
  return item ? item.emails : null;
}

/**
 * Inyectar manualmente un correo en el caché del buzón (para pruebas y webhooks)
 */
export function injectEmailIntoCache(tenantId: string, email: RawGmailItem): void {
  const cleanUser = (email.recipient_email || '').trim().toLowerCase();
  const tenantKey = cleanUser ? `${tenantId}:${cleanUser}` : tenantId;
  const current = globalInboxCache.get(tenantKey)?.emails || [];
  const exists = current.some(e => e.id === email.id || e.subject.trim().toLowerCase() === email.subject.trim().toLowerCase());
  if (!exists) {
    globalInboxCache.set(tenantKey, {
      emails: [email, ...current],
      lastSync: Date.now()
    });
  }
}

/**
 * Purgar completamente el caché de un colegio o cuenta específica
 */
export function clearTenantInboxCache(tenantId: string, email?: string): void {
  if (email) {
    globalInboxCache.delete(`${tenantId}:${email.trim().toLowerCase()}`);
  }
  globalInboxCache.delete(tenantId);
  for (const key of Array.from(globalInboxCache.keys())) {
    if (key.startsWith(`${tenantId}:`)) {
      globalInboxCache.delete(key);
    }
  }
}
