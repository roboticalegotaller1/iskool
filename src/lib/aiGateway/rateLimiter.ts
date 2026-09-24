/**
 * @file rateLimiter.ts
 * @description Limitador de Frecuencia y Prevención de Abusos para Peticiones de IA (Ítems #28 y #86).
 * Controla el caudal de solicitudes por usuario y por institución para evitar saturación de cuota y costos imprevistos.
 */

export class AIGatewayRateLimiter {
  private static userWindows = new Map<string, number[]>();
  private static schoolWindows = new Map<string, number[]>();

  // Límites estándar por ventana de 1 minuto (60,000 ms)
  private static readonly WINDOW_MS = 60_000;
  private static readonly MAX_CALLS_PER_USER = 60;
  private static readonly MAX_CALLS_PER_SCHOOL = 300;

  /**
   * Verifica si el usuario y la escuela están dentro del límite de frecuencia permitido.
   */
  static checkRateLimit(
    userId: string,
    schoolId: string
  ): { allowed: boolean; retryAfterMs?: number; reason?: string } {
    const now = Date.now();

    // 1. Limpieza de llamadas fuera de la ventana para el usuario
    const userTimestamps = (this.userWindows.get(userId) || []).filter(t => now - t < this.WINDOW_MS);
    if (userTimestamps.length >= this.MAX_CALLS_PER_USER) {
      const oldest = userTimestamps[0];
      const retryAfterMs = this.WINDOW_MS - (now - oldest);
      return {
        allowed: false,
        retryAfterMs,
        reason: `Límite de solicitudes por usuario excedido (${this.MAX_CALLS_PER_USER}/min). Reintente en ${Math.ceil(retryAfterMs / 1000)}s.`
      };
    }

    // 2. Limpieza de llamadas fuera de la ventana para la escuela
    const schoolTimestamps = (this.schoolWindows.get(schoolId) || []).filter(t => now - t < this.WINDOW_MS);
    if (schoolTimestamps.length >= this.MAX_CALLS_PER_SCHOOL) {
      const oldest = schoolTimestamps[0];
      const retryAfterMs = this.WINDOW_MS - (now - oldest);
      return {
        allowed: false,
        retryAfterMs,
        reason: `Límite de solicitudes institucionales excedido (${this.MAX_CALLS_PER_SCHOOL}/min). Contacte a coordinación.`
      };
    }

    // 3. Registrar llamada actual
    userTimestamps.push(now);
    schoolTimestamps.push(now);
    this.userWindows.set(userId, userTimestamps);
    this.schoolWindows.set(schoolId, schoolTimestamps);

    return { allowed: true };
  }

  static clear(): void {
    this.userWindows.clear();
    this.schoolWindows.clear();
  }
}
