/**
 * ============================================================================
 * UTILIDADES CANÓNICAS DE ZONA HORARIA Y RELOJ CIUDAD DE MÉXICO (AMERICA/MEXICO_CITY)
 * ============================================================================
 * Garantiza que cada hora, fecha y estampado temporal mostrado en la plataforma
 * refleje de manera determinista la hora oficial de la Ciudad de México (CST / UTC-6),
 * mitigando desfasamientos por servidores cloud en UTC u otros husos horarios.
 */

export const CDMX_TIMEZONE = 'America/Mexico_City';

/**
 * Obtiene la hora actual formateada en Ciudad de México (HH:mm:ss o HH:mm)
 */
export function formatCdmxTime(
  date: Date | string | number = new Date(),
  includeSeconds = false
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Ahora';

    return d.toLocaleTimeString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: false
    }) + (includeSeconds ? '' : ' hrs');
  } catch {
    return 'Ahora';
  }
}

/**
 * Obtiene la fecha actual en Ciudad de México en formato corto (e.g., '09 oct 2026')
 */
export function formatCdmxDate(
  date: Date | string | number = new Date()
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Hoy';

    return d.toLocaleDateString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Hoy';
  }
}

/**
 * Obtiene la representación de fecha y hora completa en Ciudad de México
 */
export function formatCdmxDateTime(
  date: Date | string | number = new Date()
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Hoy';

    const dateStr = d.toLocaleDateString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      day: '2-digit',
      month: 'short'
    });
    const timeStr = d.toLocaleTimeString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${dateStr} (${timeStr} hrs)`;
  } catch {
    return 'Hoy';
  }
}

/**
 * Retorna fecha contextual en Ciudad de México ('Hoy, HH:mm hrs', 'Ayer, HH:mm hrs', o 'DD Mon, HH:mm hrs')
 */
export function formatCdmxRelative(
  date: Date | string | number = new Date()
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Hoy';

    const now = new Date();
    const dCdmx = d.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE }); // YYYY-MM-DD
    const nowCdmx = now.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE });

    const timeStr = d.toLocaleTimeString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (dCdmx === nowCdmx) {
      return `Hoy, ${timeStr} hrs`;
    }

    // Calcular si fue ayer en CDMX
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayCdmx = yesterday.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE });
    if (dCdmx === yesterdayCdmx) {
      return `Ayer, ${timeStr} hrs`;
    }

    const datePart = d.toLocaleDateString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      day: '2-digit',
      month: 'short'
    });
    return `${datePart}, ${timeStr} hrs`;
  } catch {
    return 'Hoy';
  }
}

/**
 * Genera un estampado temporal verosímil y dinámico para asuntos de 'Hoy'
 * relativo a la hora actual en Ciudad de México (minutos atrás).
 */
export function getRecentCdmxTimeStr(minutesAgo: number = 0): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return formatCdmxRelative(d);
}

/**
 * Retorna el distintivo temporal inteligente para correos estilo Gmail (Hora CDMX)
 * - Si es de hoy: 'Hoy 18:24 hrs'
 * - Si es de ayer: 'Ayer 22:19 hrs'
 * - Si es anterior: '20 oct 16:36 hrs'
 */
export function formatCdmxSmartBadge(
  date: Date | string | number = new Date()
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Ahora';

    const now = new Date();
    const dCdmx = d.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE }); // YYYY-MM-DD
    const nowCdmx = now.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE });

    const timeStr = d.toLocaleTimeString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (dCdmx === nowCdmx) {
      return `Hoy ${timeStr} hrs`;
    }

    // Calcular si fue ayer en CDMX
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayCdmx = yesterday.toLocaleDateString('en-CA', { timeZone: CDMX_TIMEZONE });
    if (dCdmx === yesterdayCdmx) {
      return `Ayer ${timeStr} hrs`;
    }

    const datePart = d.toLocaleDateString('es-MX', {
      timeZone: CDMX_TIMEZONE,
      day: 'numeric',
      month: 'short'
    });
    return `${datePart} ${timeStr} hrs`;
  } catch {
    return 'Ahora';
  }
}

/**
 * Retorna la fecha y hora completa en español para tooltip o vista de lectura
 */
export function formatCdmxFull(
  date: Date | string | number = new Date()
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Fecha no disponible';

    return (
      d.toLocaleDateString('es-MX', {
        timeZone: CDMX_TIMEZONE,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) +
      ', ' +
      d.toLocaleTimeString('es-MX', {
        timeZone: CDMX_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) +
      ' (Hora CDMX)'
    );
  } catch {
    return 'Fecha no disponible';
  }
}

const SPANISH_MONTH_MAP: Record<string, number> = {
  ene: 0, jan: 0, enero: 0, january: 0,
  feb: 1, febrero: 1, february: 1,
  mar: 2, marzo: 2, march: 2,
  abr: 3, apr: 3, abril: 3, april: 3,
  may: 4, mayo: 4,
  jun: 5, junio: 5, june: 5,
  jul: 6, julio: 6, july: 6,
  ago: 7, aug: 7, agosto: 7, august: 7,
  sep: 8, sept: 8, septiembre: 8, september: 8,
  oct: 9, octubre: 9, october: 9,
  nov: 10, noviembre: 10, november: 10,
  dic: 11, dec: 11, diciembre: 11, december: 11,
};

/**
 * Parsea cualquier formato textual (español o estándar) a milisegundos unix de forma exhaustiva.
 */
export function parseDateStringToEpochMs(str?: string | null): number | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // 1. Número unix en string
  if (/^\d{12,14}$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    if (!isNaN(n) && n > 946684800000) return n;
  }

  // 2. Intento nativo de Date SOLO cuando contiene año explícito de 4 dígitos o formato ISO 8601.
  // Evita el bug de V8 donde new Date("7 nov") o new Date("8 oct") asigna silenciosamente el año 2001.
  if (/\b(19|20)\d{2}\b/.test(trimmed) || /^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const native = new Date(trimmed).getTime();
    if (!isNaN(native) && native > 946684800000) {
      return native;
    }
  }

  const strLower = trimmed.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();

  // 3. Expresiones relativas ("Justo ahora", "Hace 15 min", "Hace 2 h", "Hace 3 d")
  if (
    strLower === 'justo ahora' ||
    strLower === 'ahora' ||
    strLower === 'reciente' ||
    strLower.startsWith('en vivo')
  ) {
    return now.getTime();
  }

  const relMinMatch = strLower.match(/hace\s+(\d+)\s*(?:min|minuto|minutos|m\b)/i);
  if (relMinMatch) {
    const mins = parseInt(relMinMatch[1], 10);
    if (!isNaN(mins)) return now.getTime() - mins * 60 * 1000;
  }

  const relHourMatch = strLower.match(/hace\s+(\d+)\s*(?:h\b|hr|hrs|hora|horas)/i);
  if (relHourMatch) {
    const hrs = parseInt(relHourMatch[1], 10);
    if (!isNaN(hrs)) return now.getTime() - hrs * 3600 * 1000;
  }

  const relDayMatch = strLower.match(/hace\s+(\d+)\s*(?:d\b|día|dias|días)/i);
  if (relDayMatch) {
    const days = parseInt(relDayMatch[1], 10);
    if (!isNaN(days)) return now.getTime() - days * 24 * 3600 * 1000;
  }

  // 4. Extracción de horas y minutos si están presentes
  let hours = 12;
  let minutes = 0;
  let seconds = 0;
  let hasExplicitTime = false;
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    if (timeMatch[3]) seconds = parseInt(timeMatch[3], 10);
    hasExplicitTime = true;
  }

  // 5. Casos relativos con hora ("Hoy 09:05 hrs", "Ayer 14:50 hrs")
  if (strLower.includes('hoy') || strLower.includes('ahora')) {
    const d = new Date(now);
    if (hasExplicitTime) {
      d.setHours(hours, minutes, seconds, 0);
    }
    return d.getTime();
  }
  if (strLower.includes('ayer')) {
    const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    d.setHours(hours, minutes, seconds, 0);
    return d.getTime();
  }
  if (strLower.includes('antier') || strLower.includes('anteayer')) {
    const d = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    d.setHours(hours, minutes, seconds, 0);
    return d.getTime();
  }

  // 6. Patrón español/inglés corto: "16 oct", "7 nov 19:25 hrs", "16 de octubre de 2026", "16 oct 2026"
  const EN_MONTH_FALLBACK: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const spanishDateMatch = strLower.match(/(\d{1,2})\s*(?:de\s*)?([a-záéíóúñ]{3,10})(?:\s*(?:de\s*)?(\d{4}))?/i);
  if (spanishDateMatch) {
    const day = parseInt(spanishDateMatch[1], 10);
    const monthKey = spanishDateMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    const monthIndex =
      SPANISH_MONTH_MAP[monthKey] ??
      SPANISH_MONTH_MAP[spanishDateMatch[2]] ??
      EN_MONTH_FALLBACK[monthKey];
    if (monthIndex !== undefined && day >= 1 && day <= 31) {
      const hasYear = Boolean(spanishDateMatch[3]);
      let year = hasYear ? parseInt(spanishDateMatch[3], 10) : currentYear;
      let d = new Date(year, monthIndex, day, hours, minutes, seconds, 0);
      // Si no trae año explícito y cae en el futuro (> 36h adelante, ej. "28 dic" leído en noviembre), pertenece al año anterior
      if (!hasYear && d.getTime() > now.getTime() + 36 * 3600 * 1000) {
        year -= 1;
        d = new Date(year, monthIndex, day, hours, minutes, seconds, 0);
      }
      return d.getTime();
    }
  }

  // 7. Patrón numérico DD/MM/YYYY o DD-MM-YYYY
  const slashMatch = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    let year = currentYear;
    const hasYear = Boolean(slashMatch[3]);
    if (slashMatch[3]) {
      year = parseInt(slashMatch[3], 10);
      if (year < 100) year += 2000;
    }
    let d = new Date(year, month, day, hours, minutes, seconds, 0);
    if (!hasYear && d.getTime() > now.getTime() + 36 * 3600 * 1000) {
      d = new Date(year - 1, month, day, hours, minutes, seconds, 0);
    }
    return d.getTime();
  }

  // 8. Solo hora "14:20" o "09:15 hrs" -> asumir día actual
  if (hasExplicitTime) {
    const d = new Date(now);
    d.setHours(hours, minutes, seconds, 0);
    return d.getTime();
  }

  return null;
}

/**
 * Resuelve y extrae el timestamp unix en milisegundos de un correo de forma robusta y determinista,
 * reconciliando cualquier discrepancia entre date_ms y el texto visible del timestamp.
 */
export function parseEmailDateMs(itemOrStr?: {
  date_ms?: number;
  date_iso?: string;
  received_at?: string;
  timestamp?: string;
} | string | null): number {
  if (!itemOrStr) return Date.now();

  if (typeof itemOrStr === 'string') {
    return parseDateStringToEpochMs(itemOrStr) || Date.now();
  }

  const item = itemOrStr;
  const nowMs = Date.now();
  const rawTextContext = `${item.received_at || ''} ${item.timestamp || ''}`;
  const explicitlyYear2001 = /\b2001\b/.test(rawTextContext);

  const healCandidateEpoch = (candidateMs: number): number | null => {
    if (typeof candidateMs !== 'number' || isNaN(candidateMs) || candidateMs <= 946684800000) {
      return null;
    }
    const dCandidate = new Date(candidateMs);
    // Descartar timestamps contaminados por el bug de V8 (año 2001 implícito al parsear "7 nov" / "8 oct")
    if (dCandidate.getFullYear() === 2001 && !explicitlyYear2001) {
      return null;
    }

    // Si cayó en medianoche (00:00:00) o mediodía sintético (12:00:00) y timestamp contiene HH:mm explícito, restaurar hora real
    const isSyntheticTime =
      dCandidate.getSeconds() === 0 &&
      ((dCandidate.getUTCHours() === 0 && dCandidate.getUTCMinutes() === 0) ||
        (dCandidate.getUTCHours() === 6 && dCandidate.getUTCMinutes() === 0) ||
        (dCandidate.getHours() === 0 && dCandidate.getMinutes() === 0) ||
        (dCandidate.getHours() === 12 && dCandidate.getMinutes() === 0 && item.timestamp && !/\b12:00\b/.test(item.timestamp)));

    if (isSyntheticTime && item.timestamp) {
      const timeMatch = item.timestamp.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        const h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
        dCandidate.setHours(h, m, s, 0);
      }
    }

    // Evitar que fechas sin año explícito (ej. "28 dic" leído en noviembre) floten en el futuro por encima de "Hoy"
    if (dCandidate.getTime() > nowMs + 36 * 3600 * 1000) {
      dCandidate.setFullYear(dCandidate.getFullYear() - 1);
    }

    return dCandidate.getTime();
  };

  // 1. Si date_ms existe y pasa la validación anti-2001 / anti-futuro
  if (typeof item.date_ms === 'number') {
    const healedMs = healCandidateEpoch(item.date_ms);
    if (healedMs !== null) {
      return healedMs;
    }
  }

  // 2. Si date_iso existe y es un ISO válido no contaminado por año 2001
  if (item.date_iso) {
    const healedIso = healCandidateEpoch(new Date(item.date_iso).getTime());
    if (healedIso !== null) {
      return healedIso;
    }
  }

  // 3. Reconciliación inteligente entre received_at (puede traer solo fecha "7 nov 2026") y timestamp (suele traer "7 nov 11:24 hrs" o "11:24")
  const recHasTime = Boolean(item.received_at && /\d{1,2}:\d{2}/.test(item.received_at));
  const tsHasTime = Boolean(item.timestamp && /\d{1,2}:\d{2}/.test(item.timestamp));

  if (item.received_at && item.timestamp && !recHasTime && tsHasTime) {
    const combined = parseDateStringToEpochMs(`${item.received_at} ${item.timestamp}`);
    if (combined && combined > 946684800000) {
      return combined;
    }
  }

  if (tsHasTime && item.timestamp) {
    const fromTimestamp = parseDateStringToEpochMs(item.timestamp);
    if (fromTimestamp && fromTimestamp > 946684800000) {
      return fromTimestamp;
    }
  }

  // 4. Fallback: Parsear received_at
  if (item.received_at) {
    const fromReceivedAt = parseDateStringToEpochMs(item.received_at);
    if (fromReceivedAt && fromReceivedAt > 946684800000) {
      return fromReceivedAt;
    }
  }

  // 5. Fallback: Parsear timestamp visible
  if (item.timestamp) {
    const fromTimestamp = parseDateStringToEpochMs(item.timestamp);
    if (fromTimestamp && fromTimestamp > 946684800000) {
      return fromTimestamp;
    }
  }

  return Date.now();
}

/**
 * REGLA NO NEGOCIABLE 1: Sustitución de marcas comerciales externas por denominaciones institucionales canónicas.
 */
export function sanitizeCommercialTrademarks(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/google\s*ai\s*studio/gi, 'Centro de Innovación y Motor IA')
    .replace(/google\s*ai/gi, 'Inteligencia Artificial Pedagógica')
    .replace(/google\s*calendar/gi, 'Calendario Institucional')
    .replace(/calendar-notification@google\.com/gi, 'agenda.institucional@iskool.mx')
    .replace(/gemini\s*(?:\d+(?:\.\d+)?\s*(?:flash|pro|ultra|argon)?|advanced)?/gi, 'Motor Pedagógico IA')
    .replace(/chatgpt/gi, 'Asistente Digital')
    .replace(/openai/gi, 'Laboratorio de Inteligencia Artificial')
    .replace(/obsidian/gi, 'Bóveda Curricular')
    .replace(/github/gi, 'Repositorio Central')
    .replace(/canvas\s*lms/gi, 'Lienzo Digital')
    .replace(/\bcanvas\b/gi, 'Lienzo Digital');
}

function decodeQuotedPrintableUtf8(input: string): string {
  if (!input || !/=[0-9A-F]{2}|=\r?\n/i.test(input)) return input;
  try {
    const softStripped = input.replace(/=\r?\n/g, '');
    if (typeof Buffer !== 'undefined') {
      const chunks: number[] = [];
      let i = 0;
      while (i < softStripped.length) {
        if (
          softStripped[i] === '=' &&
          i + 2 < softStripped.length &&
          /^[0-9A-Fa-f]{2}$/.test(softStripped.slice(i + 1, i + 3))
        ) {
          chunks.push(parseInt(softStripped.slice(i + 1, i + 3), 16));
          i += 3;
        } else {
          const utf8Bytes = Buffer.from(softStripped[i], 'utf-8');
          for (let b = 0; b < utf8Bytes.length; b++) chunks.push(utf8Bytes[b]);
          i += 1;
        }
      }
      return Buffer.from(chunks).toString('utf-8');
    }
    return softStripped.replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  } catch {
    return input;
  }
}

function tryDecodeBase64Utf8Chunk(b64Raw: string): string | null {
  try {
    const normalized = b64Raw.replace(/-/g, '+').replace(/_/g, '/');
    const clean = normalized.replace(/\.{2,}$/, '').replace(/[^A-Za-z0-9+/=]/g, '');
    if (clean.length < 16) return null;
    const alignedLen = clean.length - (clean.length % 4);
    if (alignedLen < 16) return null;
    const aligned = clean.slice(0, alignedLen);

    let bytes: Uint8Array;
    if (typeof Buffer !== 'undefined') {
      bytes = new Uint8Array(Buffer.from(aligned, 'base64'));
    } else if (typeof atob === 'function') {
      const bin = atob(aligned);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } else {
      return null;
    }

    const decoded = new TextDecoder('utf-8', { fatal: false })
      .decode(bytes)
      .replace(/\uFFFD+/g, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[(?:image|imagen):\s*[^\]]*\]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!decoded || decoded.length < 4) return null;
    // Verificar que al menos el 78% sean caracteres legibles en español/ASCII
    let printable = 0;
    for (let i = 0; i < decoded.length; i++) {
      const code = decoded.charCodeAt(i);
      if ((code >= 32 && code <= 126) || (code >= 160 && code <= 687)) {
        printable++;
      }
    }
    if (printable / decoded.length < 0.78) return null;
    return decoded;
  } catch {
    return null;
  }
}

function stripMimeEnvelopeNoise(raw: string): string {
  let cleaned = raw
    // Prefijos literales IMAP ej. "(8192)", "<0>", "{8192}", "BODY[TEXT]<0>"
    .replace(/^\s*[-–—]?\s*(?:BODY\[TEXT[^\]]*\](?:<\d+>)?\s*)?(?:\{\d+\}|\(\d+\)|<\d+>)\s*/i, '')
    // Límites MIME multipart ej. "------=_Part_34084312_674855645.1794072260773", "=_Part_...", "--000000000000..."
    .replace(/(?:--+|=_Part_)[=_A-Za-z0-9.-]{4,}(?:--)?/gi, ' ')
    // Cabeceras MIME crudas incrustadas
    .replace(/Content-Type:\s*[^\s;]+(?:\s*;\s*(?:charset|boundary|format|delsp|name)=[^\s;\r\n]+)*/gi, ' ')
    .replace(/Content-Transfer-Encoding:\s*[A-Za-z0-9_-]+/gi, ' ')
    .replace(/Content-Disposition:\s*[^\r\n;]+(?:\s*;\s*filename=[^\r\n]+)?/gi, ' ')
    .replace(/Content-ID:\s*<[^>]+>/gi, ' ')
    .replace(/MIME-Version:\s*1\.0/gi, ' ')
    .replace(/\b(?:charset|boundary)=["']?[A-Za-z0-9_.\-+]+["']?/gi, ' ')
    // Fragmentos truncados de cabeceras MIME al final ej. "Content-T..."
    .replace(/\bContent-[A-Za-z-]*\.{0,3}$/gi, ' ')
    .trim();

  cleaned = decodeQuotedPrintableUtf8(cleaned);
  return cleaned;
}

/**
 * Decodifica automáticamente cadenas Base64, multiparts MIME y artefactos IMAP
 * para presentar siempre un resumen ejecutivo limpio y legible en español.
 */
export function decodeEmailBodyOrSnippet(
  rawText?: string | null,
  fallbackSubject?: string,
  senderName?: string
): string {
  if (!rawText || typeof rawText !== 'string') {
    return fallbackSubject
      ? `Comunicación institucional referente a «${sanitizeCommercialTrademarks(fallbackSubject)}».`
      : 'Comunicación oficial registrada en buzón institucional.';
  }

  let text = stripMimeEnvelopeNoise(rawText.trim());

  // Caso 1: Todo el texto restante es un bloque Base64 (con o sin espacios/saltos y '...' al final)
  const strippedForCheck = text.replace(/\.{2,}$/, '').replace(/\s+/g, '');
  if (
    strippedForCheck.length >= 16 &&
    /^[A-Za-z0-9+/_=-]+$/.test(strippedForCheck) &&
    !/\s/.test(text.slice(0, Math.min(20, text.length)))
  ) {
    const fullDecoded = tryDecodeBase64Utf8Chunk(strippedForCheck);
    if (fullDecoded) {
      const postClean = fullDecoded
        .replace(/\[(?:image|imagen):\s*[^\]]*\]/gi, ' ')
        .replace(/https?:\/\/\S{45,}/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (postClean.length >= 6) {
        return sanitizeCommercialTrademarks(postClean);
      }
    }
  }

  // Caso 2: Bloques Base64 incrustados dentro del texto (ej. después de cabeceras MIME o prefijos)
  text = text.replace(
    /(?:[A-Za-z0-9+/]{20,}(?:=|\s+[A-Za-z0-9+/=]{8,})*(?:\.{2,})?)/g,
    (match) => {
      if (/^https?:/i.test(match)) return match;
      const decodedChunk = tryDecodeBase64Utf8Chunk(match);
      if (decodedChunk) return ` ${decodedChunk} `;
      return ' ';
    }
  );

  // Limpiar HTML residual, etiquetas [image: ...], URLs de rastreo kilométricas y espacios
  text = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\[(?:image|imagen):\s*[^\]]*\]/gi, ' ')
    .replace(/https?:\/\/[^\s]{55,}/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[·•\-–—:\s]+|[·•\-–—:\s]+$/g, '')
    .trim();

  if (!text || text.length < 6 || /[A-Za-z0-9+/]{35,}/.test(text)) {
    const cleanSub = sanitizeCommercialTrademarks(fallbackSubject || 'Notificación Institucional');
    const cleanSender = sanitizeCommercialTrademarks(senderName || 'Remitente Institucional');
    return `${cleanSender} — ${cleanSub}`;
  }

  return sanitizeCommercialTrademarks(text);
}

/**
 * Normaliza códigos de expediente eliminando guiones duplicados (ej. MAT-TEST--2026-511 -> MAT-TEST-2026-511).
 */
export function formatCleanMatterCode(code?: string | null): string {
  if (!code) return 'MAT-INST-2026-001';
  return code.replace(/-{2,}/g, '-').replace(/^-|-$/g, '').toUpperCase();
}

/**
 * Limpia el texto de SLA para evitar emojis duplicados (⏱️ ⏱️) y mantener formato compacto.
 */
export function formatCleanSlaText(slaText?: string | null, slaHours?: number): string {
  if (!slaText) return `${slaHours || 12}h restantes`;
  return slaText.replace(/^[⏱️⏳\s]+/u, '').replace(/\bSLA\b/g, 'Tiempo de respuesta').trim() || `${slaHours || 12}h restantes`;
}

/**
 * Formatea una fecha/hora de expediente en versión ejecutiva compacta para tarjetas de listado
 * (ej. "miércoles, 28 de octubre de 2026, 07:49:53 (Hora CDMX) (28 oct...)" -> "28 oct · 07:49")
 */
export function formatCompactExecutiveTimestamp(raw?: string | null): string {
  if (!raw) return 'Hoy';
  const clean = raw.trim();
  if (clean.length <= 22) return clean.replace(/\s*\(Hora CDMX\)/i, '');

  const spanishMatch = clean.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]{3,10})(?:\s+de\s+\d{4})?.*?(\d{1,2}:\d{2})/i);
  if (spanishMatch) {
    const day = spanishMatch[1].padStart(2, '0');
    const month = spanishMatch[2].slice(0, 3).toLowerCase();
    const time = spanishMatch[3];
    return `${day} ${month} · ${time}`;
  }

  const shortMatch = clean.match(/(\d{1,2}\s+[a-záéíóúñ]{3}).*?(\d{1,2}:\d{2})/i);
  if (shortMatch) {
    return `${shortMatch[1].toLowerCase()} · ${shortMatch[2]}`;
  }

  return clean.split('(')[0].replace(/,\s*\d{4}/, '').trim().slice(0, 22);
}

/**
 * Formatea una fecha/hora de expediente completa pero limpia (sin duplicaciones entre paréntesis)
 * para el encabezado del Muelle de Decisión.
 */
export function formatFullExecutiveTimestamp(raw?: string | null): string {
  if (!raw) return 'Hoy · Hora CDMX';
  // Eliminar segundo paréntesis duplicado como "(Hora CDMX) (28 oct 2026...)"
  const withoutDuplicateParen = raw
    .replace(/\(Hora CDMX\)\s*\([^)]*\)/i, '(Hora CDMX)')
    .replace(/:\d{2}\s*\(Hora CDMX\)/i, ' hrs (CDMX)')
    .trim();
  return withoutDuplicateParen;
}


