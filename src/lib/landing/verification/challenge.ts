import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

// Pase firmado de prueba de trabajo para la solicitud de demostración.
// El servidor emite un acertijo que el navegador resuelve por fuerza bruta; al enviar el formulario
// se verifica la firma, la vigencia, el tiempo mínimo de llenado y que el pase no se haya usado antes.

export interface DemoChallenge {
  salt: string
  challenge: string
  max: number
  signature: string
}

export const CHALLENGE_TTL_MS = 30 * 60_000
export const MIN_FILL_MS = 3_000
// Tope de la búsqueda del número secreto (calibrar contra el tiempo de cómputo en un teléfono modesto).
const CHALLENGE_MAX = 75_000

export type ChallengeFailure = 'ausente' | 'firma' | 'numero' | 'vencido' | 'muy-rapido' | 'usado'

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

// La clave dedicada tiene prioridad; si no existe se reutiliza la contraseña del correo, que ya es secreta.
export function getSigningKey(): string | null {
  return process.env.DEMO_FORM_SECRET || process.env.SMTP_PASS || null
}

function sign(key: string, challenge: string): string {
  return createHmac('sha256', key).update(challenge).digest('hex')
}

export function createChallenge(now: number = Date.now()): DemoChallenge | null {
  const key = getSigningKey()
  if (!key) return null
  const salt = `${randomBytes(16).toString('hex')}.${now}.${now + CHALLENGE_TTL_MS}`
  const secret = Math.floor(Math.random() * (CHALLENGE_MAX + 1))
  const challenge = sha256Hex(salt + String(secret))
  return { salt, challenge, max: CHALLENGE_MAX, signature: sign(key, challenge) }
}

// Pases ya consumidos (valor: instante de vencimiento, para poder limpiarlos).
const usedChallenges = new Map<string, number>()

export function __resetUsedChallenges(): void {
  usedChallenges.clear()
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyChallenge(
  input: unknown,
  now: number = Date.now()
): { ok: true } | { ok: false; motivo: ChallengeFailure } {
  const fail = (motivo: ChallengeFailure) => ({ ok: false as const, motivo })

  for (const [id, expiresAt] of usedChallenges) if (expiresAt <= now) usedChallenges.delete(id)

  if (!input || typeof input !== 'object') return fail('ausente')
  const { salt, challenge, signature, number } = input as Record<string, unknown>
  if (typeof salt !== 'string' || typeof challenge !== 'string' || typeof signature !== 'string') return fail('ausente')
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 0) return fail('ausente')

  const key = getSigningKey()
  if (!key) return fail('firma')
  if (!safeEqualHex(sign(key, challenge), signature)) return fail('firma')

  // El número solo cuenta si reproduce el acertijo firmado.
  if (!safeEqualHex(sha256Hex(salt + String(number)), challenge)) return fail('numero')

  const [, issuedRaw, expiresRaw] = salt.split('.')
  const issuedAt = Number(issuedRaw)
  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return fail('numero')
  if (now > expiresAt) return fail('vencido')
  if (now - issuedAt < MIN_FILL_MS) return fail('muy-rapido')

  if (usedChallenges.has(challenge)) return fail('usado')
  usedChallenges.set(challenge, expiresAt)
  return { ok: true }
}
