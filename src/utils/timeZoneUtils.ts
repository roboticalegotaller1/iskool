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
