/**
 * @file gameSecurity.ts
 * @description Módulo de Seguridad Criptográfica y Validación de Telemetría para Simuladores y Juegos de ISkool.
 * 
 * Implementa:
 * 1. Handshake Criptográfico con Nonce y HMAC-SHA256 para tokens de sesión efímeros.
 * 2. Invalidador de Sesión Única (Anti-Replay Attack Protection).
 * 3. Validador de Telemetría Biológicamente Plausible y Filtro Anti-Macro.
 */

import * as crypto from 'crypto';

// Clave secreta para la firma de tokens de juego (fallback seguro institucional)
const GAME_SECURITY_SECRET = process.env.GAME_SECURITY_SECRET || 'iskool-ultra-nano-banana-sec-key-2026-auth-engine';

// Tiempo de vida de la sesión (TTL): 30 minutos máximo
export const GAME_SESSION_TTL_MS = 30 * 60 * 1000;

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'facil' | 'medio' | 'dificil';

export interface GameSessionPayload {
  sessionId: string;
  studentId: string;
  timestamp: number; // Marca de tiempo de emisión
  issuedAt: number;  // Compatibilidad hacia atrás
  expiresAt: number; // Expiración (máximo 30 minutos)
  simulatorId?: string;
  difficulty?: string;
  nonce?: string;
  teacherId?: string;
}

export interface GameTelemetryData {
  timeSpentSeconds: number;
  interactionCount: number;
  durationMs?: number;
  userActions?: Array<{ type: string; timestamp: number }>;
  deviceInfo?: string;
}

export interface TelemetryValidationResult {
  isValid: boolean;
  code?: 'VALID' | 'INSUFFICIENT_TIME' | 'INSUFFICIENT_INTERACTIONS' | 'INHUMAN_CLICK_RATE';
  message?: string;
  calculatedCps?: number;
}

/**
 * Registro en memoria de sesiones consumidas para evitar ataques de repetición (Anti-Replay).
 * Almacena el timestamp de consumo para permitir purgas automáticas sin fugas de memoria.
 */
class ConsumedSessionStore {
  private consumed = new Map<string, number>();

  /**
   * Intenta consumir una sesión. Si ya fue consumida, retorna false.
   */
  public consume(sessionId: string): boolean {
    this.cleanExpired();
    if (this.consumed.has(sessionId)) {
      return false;
    }
    this.consumed.set(sessionId, Date.now());
    return true;
  }

  /**
   * Comprueba si una sesión ya fue consumida previamente sin marcarla.
   */
  public isConsumed(sessionId: string): boolean {
    return this.consumed.has(sessionId);
  }

  /**
   * Purga sesiones consumidas que ya hayan superado el TTL de validez (evita fugas de memoria).
   */
  private cleanExpired() {
    const now = Date.now();
    this.consumed.forEach((timestamp, id) => {
      if (now - timestamp > GAME_SESSION_TTL_MS * 2) {
        this.consumed.delete(id);
      }
    });
  }

  /**
   * Método de utilidad para pruebas (reinicia la caché)
   */
  public resetForTesting() {
    this.consumed.clear();
  }
}

export const consumedSessionsCache = new ConsumedSessionStore();

/**
 * Codifica un buffer o string a formato Base64URL
 */
function toBase64Url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Decodifica una cadena Base64URL a Buffer
 */
function fromBase64Url(input: string): Buffer {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

/**
 * Genera un token de sesión efímero firmado con HMAC-SHA256 usando crypto
 * (sessionId, studentId, timestamp, firma HMAC).
 */
export function generateGameSessionToken(params: {
  studentId: string;
  simulatorId?: string;
  sessionId?: string;
  difficulty?: string;
  teacherId?: string;
  customTtlMs?: number;
}): { token: string; payload: GameSessionPayload } {
  const now = Date.now();
  const ttl = Math.min(params.customTtlMs || GAME_SESSION_TTL_MS, GAME_SESSION_TTL_MS);

  const payload: GameSessionPayload = {
    sessionId: params.sessionId || `gses_${crypto.randomUUID()}`,
    studentId: params.studentId,
    timestamp: now,
    issuedAt: now,
    expiresAt: now + ttl,
    simulatorId: params.simulatorId || 'general-game',
    difficulty: (params.difficulty || 'medium').toLowerCase(),
    nonce: crypto.randomBytes(16).toString('hex'),
    teacherId: params.teacherId
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = toBase64Url(payloadJson);

  const hmac = crypto.createHmac('sha256', GAME_SECURITY_SECRET);
  hmac.update(payloadB64);
  const signatureB64 = toBase64Url(hmac.digest());

  const token = `${payloadB64}.${signatureB64}`;

  return { token, payload };
}

// Alias para compatibilidad
export const createGameSessionToken = generateGameSessionToken;

/**
 * Valida el token de sesión efímero.
 * Verifica obligatoriamente:
 * 1. Firma HMAC-SHA256 válida (protegida contra timing attacks).
 * 2. Tiempo de expiración (máx 30 minutos).
 * 3. Coherencia e integridad de datos (sessionId, studentId, timestamp).
 */
export function validateGameSessionToken(token: string): {
  isValid: boolean;
  error?: string;
  payload?: GameSessionPayload;
} {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Token no proporcionado o formato inválido' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Estructura de token criptográfico incorrecta' };
  }

  const [payloadB64, signatureB64] = parts;

  try {
    // 1. Verificación de firma HMAC con timingSafeEqual
    const hmac = crypto.createHmac('sha256', GAME_SECURITY_SECRET);
    hmac.update(payloadB64);
    const expectedSigBuf = hmac.digest();
    const receivedSigBuf = fromBase64Url(signatureB64);

    if (expectedSigBuf.length !== receivedSigBuf.length || !crypto.timingSafeEqual(expectedSigBuf, receivedSigBuf)) {
      return { isValid: false, error: 'Firma criptográfica inválida (Falsificación o adulteración detectada)' };
    }

    // 2. Parseo y validación de coherencia de datos
    const payloadStr = fromBase64Url(payloadB64).toString('utf8');
    const payload: GameSessionPayload = JSON.parse(payloadStr);

    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      return { isValid: false, error: 'Incoherencia en token: Identificador de sesión (sessionId) ausente o inválido' };
    }

    if (!payload.studentId || typeof payload.studentId !== 'string') {
      return { isValid: false, error: 'Incoherencia en token: Identificador de estudiante (studentId) ausente o inválido' };
    }

    const tokenTimestamp = payload.timestamp || payload.issuedAt;
    if (!tokenTimestamp || typeof tokenTimestamp !== 'number') {
      return { isValid: false, error: 'Incoherencia en token: Marca de tiempo (timestamp) ausente o inválida' };
    }

    const now = Date.now();
    // Tolerancia de 60 segundos por desincronización de reloj
    if (tokenTimestamp > now + 60000) {
      return { isValid: false, error: 'Incoherencia en token: Timestamp proviene del futuro' };
    }

    // 3. Verificación de expiración (30 minutos máximo)
    if (now > payload.expiresAt) {
      return { isValid: false, error: 'El token de sesión ha expirado (límite de 30 minutos excedido)' };
    }

    if (now - tokenTimestamp > GAME_SESSION_TTL_MS) {
      return { isValid: false, error: 'Sesión expirada: La antigüedad del token supera los 30 minutos permitidos' };
    }

    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, error: `Error procesando el token de sesión: ${err.message}` };
  }
}

// Alias para compatibilidad
export const verifyGameSessionToken = validateGameSessionToken;

/**
 * Obtiene el tiempo mínimo biológicamente plausible según la dificultad del simulador (en segundos)
 */
export function getMinimumPlausibleTime(difficulty?: string): number {
  const norm = (difficulty || '').toLowerCase();
  switch (norm) {
    case 'easy':
    case 'facil':
      return 10; // Mínimo 10 segundos para interacciones elementales
    case 'hard':
    case 'dificil':
      return 25; // Mínimo 25 segundos para simulaciones complejas
    case 'medium':
    case 'medio':
    default:
      return 15; // Mínimo 15 segundos estándar
  }
}

/**
 * Valida si la telemetría enviada por el simulador es biológicamente plausible para un ser humano:
 * 1. Tiempo transcurrido >= Umbral mínimo biológico según dificultad.
 * 2. Mínimo de interacciones registradas (evita bots pasivos o inyección vacía).
 * 3. Tasa de clics por segundo (CPS) humana (máximo 20 CPS; sobrehumano sugiere bot o script de consola).
 */
export function validateGameTelemetry(
  telemetry: GameTelemetryData,
  difficulty?: string
): TelemetryValidationResult {
  const { timeSpentSeconds, interactionCount, durationMs } = telemetry;
  const effectiveSeconds = durationMs ? durationMs / 1000 : timeSpentSeconds;
  const minRequiredTime = getMinimumPlausibleTime(difficulty);

  // 1. Validación de tiempo mínimo biológico
  if (typeof effectiveSeconds !== 'number' || effectiveSeconds < minRequiredTime) {
    return {
      isValid: false,
      code: 'INSUFFICIENT_TIME',
      message: `El tiempo jugado (${effectiveSeconds || 0}s) es inferior al mínimo biológicamente plausible (${minRequiredTime}s) para resolver esta actividad.`
    };
  }

  // 2. Validación de interacciones mínimas
  const minInteractions = 3;
  if (typeof interactionCount !== 'number' || interactionCount < minInteractions) {
    return {
      isValid: false,
      code: 'INSUFFICIENT_INTERACTIONS',
      message: `La actividad requiere al menos ${minInteractions} interacciones activas para validar el aprendizaje (registradas: ${interactionCount || 0}).`
    };
  }

  // 3. Validación de tasa de clics por segundo (CPS)
  const calculatedCps = interactionCount / Math.max(1, effectiveSeconds);
  const maxHumanCps = 20.0;
  if (calculatedCps > maxHumanCps) {
    return {
      isValid: false,
      code: 'INHUMAN_CLICK_RATE',
      message: `Tasa de interacción sobrehumana detectada (${calculatedCps.toFixed(1)} clics/seg). Actividad rechazada por protección anti-trampas.`,
      calculatedCps
    };
  }

  return {
    isValid: true,
    code: 'VALID',
    message: 'Telemetría pedagógica validada y biológicamente plausible.',
    calculatedCps
  };
}

/**
 * Reexportación de orígenes autorizados para compatibilidad server-side
 */
export { ALLOWED_SIMULATOR_ORIGINS, isAllowedSimulatorOrigin } from './gameSecurityOrigins';
