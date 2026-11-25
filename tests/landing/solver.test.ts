// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createChallenge, sha256Hex } from '@/lib/landing/verification/challenge'
import { solveChallenge } from '@/lib/landing/verification/solver'

describe('solucionador del pase', () => {
  const previo = process.env.DEMO_FORM_SECRET
  beforeEach(() => {
    process.env.DEMO_FORM_SECRET = 'clave-de-prueba'
  })
  afterEach(() => {
    if (previo === undefined) delete process.env.DEMO_FORM_SECRET
    else process.env.DEMO_FORM_SECRET = previo
  })

  it('encuentra el número de un pase de createChallenge', async () => {
    const pase = createChallenge()
    expect(pase).not.toBeNull()
    const numero = await solveChallenge(pase!)
    expect(sha256Hex(pase!.salt + String(numero))).toBe(pase!.challenge)
  })

  it('rechaza si el número no está hasta max', async () => {
    const salt = 'a'.repeat(32) + '.1700000000000.1700001800000'
    const challenge = sha256Hex(salt + '900')
    await expect(solveChallenge({ salt, challenge, max: 600, signature: 'x' })).rejects.toThrow()
  })

  it('se detiene cuando se cancela', async () => {
    const salt = 'b'.repeat(32) + '.1700000000000.1700001800000'
    const control = new AbortController()
    control.abort()
    await expect(solveChallenge({ salt, challenge: 'f'.repeat(64), max: 75_000, signature: 'x' }, control.signal)).rejects.toThrow()
  })
})
