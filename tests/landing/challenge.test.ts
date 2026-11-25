// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CHALLENGE_TTL_MS,
  MIN_FILL_MS,
  __resetUsedChallenges,
  createChallenge,
  sha256Hex,
  verifyChallenge,
  type DemoChallenge,
} from '@/lib/landing/verification/challenge'
import { GET } from '@/app/api/demo/challenge/route'

// Resuelve la prueba de trabajo por fuerza bruta, igual que lo hará el navegador.
function solve(c: DemoChallenge): number {
  for (let n = 0; n <= c.max; n++) if (sha256Hex(c.salt + String(n)) === c.challenge) return n
  throw new Error('sin solución')
}

const issuedAt = (c: DemoChallenge) => Number(c.salt.split('.')[1])
const pass = (c: DemoChallenge, number: number) => ({ salt: c.salt, challenge: c.challenge, signature: c.signature, number })

describe('pase firmado de la solicitud de demostración', () => {
  beforeEach(() => {
    vi.stubEnv('DEMO_FORM_SECRET', '')
    vi.stubEnv('SMTP_PASS', 'x')
    __resetUsedChallenges()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('crea y verifica un pase resuelto', () => {
    const c = createChallenge()!
    expect(verifyChallenge(pass(c, solve(c)), issuedAt(c) + MIN_FILL_MS)).toEqual({ ok: true })
  })

  it('rechaza firma alterada', () => {
    const c = createChallenge()!
    const bad = { ...pass(c, solve(c)), signature: 'a'.repeat(64) }
    expect(verifyChallenge(bad, issuedAt(c) + MIN_FILL_MS)).toEqual({ ok: false, motivo: 'firma' })
  })

  it('rechaza número incorrecto', () => {
    const c = createChallenge()!
    expect(verifyChallenge(pass(c, solve(c) + 1), issuedAt(c) + MIN_FILL_MS)).toEqual({ ok: false, motivo: 'numero' })
  })

  it('rechaza vencido', () => {
    const c = createChallenge()!
    expect(verifyChallenge(pass(c, solve(c)), issuedAt(c) + CHALLENGE_TTL_MS + 1)).toEqual({ ok: false, motivo: 'vencido' })
  })

  it('rechaza antes de 3 s', () => {
    const c = createChallenge()!
    expect(verifyChallenge(pass(c, solve(c)), issuedAt(c) + MIN_FILL_MS - 1)).toEqual({ ok: false, motivo: 'muy-rapido' })
  })

  it('rechaza reuso', () => {
    const c = createChallenge()!
    const input = pass(c, solve(c))
    const now = issuedAt(c) + MIN_FILL_MS
    expect(verifyChallenge(input, now)).toEqual({ ok: true })
    expect(verifyChallenge(input, now)).toEqual({ ok: false, motivo: 'usado' })
  })

  it('un intento rechazado no consume el pase', () => {
    const c = createChallenge()!
    const now = issuedAt(c) + MIN_FILL_MS
    expect(verifyChallenge(pass(c, solve(c) + 1), now).ok).toBe(false)
    expect(verifyChallenge(pass(c, solve(c)), now)).toEqual({ ok: true })
  })

  it('rechaza entrada sin forma', () => {
    expect(verifyChallenge({})).toEqual({ ok: false, motivo: 'ausente' })
    expect(verifyChallenge(null)).toEqual({ ok: false, motivo: 'ausente' })
  })

  it('sin SMTP_PASS ni DEMO_FORM_SECRET createChallenge devuelve null', () => {
    vi.stubEnv('SMTP_PASS', '')
    expect(createChallenge()).toBeNull()
  })

  it('DEMO_FORM_SECRET tiene prioridad', () => {
    vi.stubEnv('DEMO_FORM_SECRET', 'otra-clave')
    const c = createChallenge()!
    const input = pass(c, solve(c))
    vi.stubEnv('DEMO_FORM_SECRET', '')
    expect(verifyChallenge(input, issuedAt(c) + MIN_FILL_MS)).toEqual({ ok: false, motivo: 'firma' })
  })
})

describe('GET /api/demo/challenge', () => {
  beforeEach(() => vi.stubEnv('DEMO_FORM_SECRET', ''))
  afterEach(() => vi.unstubAllEnvs())

  it('devuelve el pase con las cuatro llaves y sin caché', async () => {
    vi.stubEnv('SMTP_PASS', 'x')
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(Object.keys(await response.json()).sort()).toEqual(['challenge', 'max', 'salt', 'signature'])
  })

  it('responde 503 sin clave de firma', async () => {
    vi.stubEnv('SMTP_PASS', '')
    expect((await GET()).status).toBe(503)
  })
})
