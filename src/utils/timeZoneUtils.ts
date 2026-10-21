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

  // 2. Intento nativo de Date (ISO 8601 o RFC 2822)
  const native = new Date(trimmed).getTime();
  if (!isNaN(native) && native > 946684800000) {
    return native;
  }

  // 3. Extracción de horas y minutos si están presentes
  let hours = 12;
  let minutes = 0;
  let seconds = 0;
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    if (timeMatch[3]) seconds = parseInt(timeMatch[3], 10);
  }

  const strLower = trimmed.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();

  // 4. Casos relativos directos
  if (strLower.includes('hoy') || strLower.includes('ahora')) {
    const d = new Date(now);
    d.setHours(hours, minutes, seconds, 0);
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

  // 5. Patrón español: "16 oct", "16 oct 09:22 hrs", "16 de octubre de 2026", "16 oct 2026"
  const spanishDateMatch = strLower.match(/(\d{1,2})\s*(?:de\s*)?([a-záéíóúñ]{3,10})(?:\s*(?:de\s*)?(\d{4}))?/i);
  if (spanishDateMatch) {
    const day = parseInt(spanishDateMatch[1], 10);
    const monthKey = spanishDateMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    const monthIndex = SPANISH_MONTH_MAP[monthKey] ?? SPANISH_MONTH_MAP[spanishDateMatch[2]];
    if (monthIndex !== undefined && day >= 1 && day <= 31) {
      const year = spanishDateMatch[3] ? parseInt(spanishDateMatch[3], 10) : currentYear;
      const d = new Date(year, monthIndex, day, hours, minutes, seconds, 0);
      return d.getTime();
    }
  }

  // 6. Patrón numérico DD/MM/YYYY o DD-MM-YYYY
  const slashMatch = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    let year = currentYear;
    if (slashMatch[3]) {
      year = parseInt(slashMatch[3], 10);
      if (year < 100) year += 2000;
    }
    const d = new Date(year, month, day, hours, minutes, seconds, 0);
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

  const fromTimestamp = parseDateStringToEpochMs(item.timestamp);
  const fromReceivedAt = parseDateStringToEpochMs(item.received_at);

  // Si date_ms existe y es válido
  if (typeof item.date_ms === 'number' && !isNaN(item.date_ms) && item.date_ms > 946684800000) {
    // Si fromTimestamp tiene una fecha explícita (ej. 16 oct), verificar concordancia
    if (fromTimestamp) {
      const dtMs = new Date(item.date_ms);
      const dtExplicit = new Date(fromTimestamp);
      // Si difieren en más de 20 horas (ej. date_ms guardado erróneamente en otro día), confiar en la fecha explícita
      if (Math.abs(dtMs.getTime() - dtExplicit.getTime()) > 20 * 60 * 60 * 1000) {
        return fromTimestamp;
      }
    }
    return item.date_ms;
  }

  if (item.date_iso) {
    const t = new Date(item.date_iso).getTime();
    if (!isNaN(t) && t > 946684800000) {
      if (fromTimestamp) {
        const dtIso = new Date(t);
        const dtExplicit = new Date(fromTimestamp);
        if (Math.abs(dtIso.getTime() - dtExplicit.getTime()) > 20 * 60 * 60 * 1000) {
          return fromTimestamp;
        }
      }
      return t;
    }
  }

  if (fromTimestamp) return fromTimestamp;
  if (fromReceivedAt) return fromReceivedAt;

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
    .replace(/gemini\s*(?:\d+(?:\.\d+)?\s*(?:flash|pro|ultra|argon)?|advanced)?/gi, 'Motor Pedagógico IA')
    .replace(/chatgpt/gi, 'Asistente Digital')
    .replace(/openai/gi, 'Laboratorio de Inteligencia Artificial')
    .replace(/obsidian/gi, 'Bóveda Curricular')
    .replace(/github/gi, 'Repositorio Central')
    .replace(/canvas\s*lms/gi, 'Lienzo Digital')
    .replace(/\bcanvas\b/gi, 'Lienzo Digital');
}

