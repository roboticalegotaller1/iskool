import { describe, expect, it } from 'vitest'
import { BENEFITS, CLOSING } from '@/content/landing/benefits'
import { FEATURES } from '@/content/landing/features'
import { HOME } from '@/content/landing/home'
import { ROLES } from '@/content/landing/roles'
import { STEPS } from '@/content/landing/steps'

const flatten = (value: unknown): string => JSON.stringify(value)

describe('contenido', () => {
  it('habla de México y de la Nueva Escuela Mexicana', () => {
    const text = flatten([HOME, STEPS, ROLES])
    expect(text).toContain('México')
    expect(text).toContain('Nueva Escuela Mexicana')
  })

  it('menciona el origen canadiense', () => {
    expect(flatten(HOME.origin)).toMatch(/canadiense/i)
  })

  it('la descripción meta mide a lo mucho 160 caracteres y menciona lo canadiense', () => {
    expect(HOME.meta.description.length).toBeLessThanOrEqual(160)
    expect(HOME.meta.description).toMatch(/canadiense/i)
  })
})

describe('estructura', () => {
  it('tiene cinco pasos numerados del 1 al 5', () => {
    expect(STEPS.map((s) => s.number)).toEqual([1, 2, 3, 4, 5])
  })

  it('tiene los cinco roles en orden y cada uno con capacidades', () => {
    expect(ROLES.map((r) => r.id)).toEqual(['docentes', 'alumnos', 'familias', 'directivos', 'institucion'])
    for (const role of ROLES) expect(role.capabilities.length).toBeGreaterThanOrEqual(2)
  })

  it('tiene tres beneficios, tres frases de cierre y cuatro pilares', () => {
    expect(BENEFITS).toHaveLength(3)
    expect(CLOSING.beats).toHaveLength(3)
    expect(HOME.pillars).toHaveLength(4)
  })

  it('explica en concreto qué hace, con ocho funciones para sus distintos públicos', () => {
    expect(FEATURES.items).toHaveLength(8)
    const text = flatten(FEATURES.items)
    for (const topic of [/docente/i, /alumno/i, /familia/i, /hist[oó]ric/i, /ingl[eé]s/i, /franc[eé]s/i, /directiv/i, /cobranza/i]) {
      expect(text).toMatch(topic)
    }
  })
})

describe('honestidad comercial', () => {
  const all = flatten([HOME, STEPS, ROLES, FEATURES, BENEFITS, CLOSING])

  it('no promete funciones no verificadas', () => {
    expect(all).not.toMatch(/factur|timbrad|CFDI|SPEI|tarjeta|credencial|app m[oó]vil|torniquete|copiloto|tutor IA/i)
  })

  it('no usa porcentajes ni cifras de resultados', () => {
    expect(all).not.toMatch(/\d+\s?%/)
  })

  it('no usa voseo', () => {
    expect(all).not.toMatch(/(querés|podés|tenés|sabés|agendá|mirá|escribinos|contanos)/i)
  })

  it('no dice "app", "aplicación" ni "móvil": la portada solo habla de la plataforma', () => {
    expect(all).not.toMatch(/\b(apps?|aplicaci[oó]n|m[oó]vil)\b/i)
  })
})
