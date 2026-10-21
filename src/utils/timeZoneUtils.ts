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

/**
 * Resuelve y extrae el timestamp unix en milisegundos de un correo de forma robusta y determinista
 */
export function parseEmailDateMs(item: {
  date_ms?: number;
  date_iso?: string;
  received_at?: string;
  timestamp?: string;
}): number {
  if (typeof item.date_ms === 'number' && !isNaN(item.date_ms) && item.date_ms > 0) {
    return item.date_ms;
  }
  if (item.date_iso) {
    const t = new Date(item.date_iso).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item.received_at) {
    const t = new Date(item.received_at).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  // Parsear strings heurísticos de timestamp ("18:24 hrs", "06:41")
  const timeStr = item.timestamp || '';
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  const hours = timeMatch ? parseInt(timeMatch[1], 10) : 12;
  const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;

  const targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);

  const recLower = (item.received_at || '').toLowerCase();
  if (recLower.includes('ayer')) {
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (recLower.includes('justo ahora') || recLower.includes('hoy') || recLower.includes('ahora')) {
    // Mantener la fecha de hoy con las horas parseadas
  } else if (item.received_at && item.received_at.length >= 3) {
    const parsed = new Date(item.received_at);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(hours, minutes, 0, 0);
      return parsed.getTime();
    }
  }

  return targetDate.getTime();
}
