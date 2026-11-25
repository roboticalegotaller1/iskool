// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  COVERAGE_GRID,
  COVERAGE_TARGET,
  MAX_TRACE_POINTS,
  RADIO_MAX,
  analyzeTrace,
  computeCoverage,
  type TracePoint,
} from '@/lib/landing/verification/trace'
import { HUMAN_TRACE_RADIO, humanTrace, straightTrace } from './helpers/humanTrace'

const puntero = (trazo: TracePoint[], radio = HUMAN_TRACE_RADIO) => ({ mode: 'pointer' as const, radio, trazo, teclas: [] })
const teclado = (teclas: { t: number }[]) => ({ mode: 'keyboard' as const, radio: HUMAN_TRACE_RADIO, trazo: [], teclas })

// Barrido completo en filas, de orilla a orilla.
function barridoEnFilas(): TracePoint[] {
  const trazo: TracePoint[] = []
  let t = 0
  for (let fila = 0; fila < 10; fila++) {
    const y = 0.05 + fila * 0.1
    const ida = fila % 2 === 0
    trazo.push({ x: ida ? 0 : 1, y, t: (t += 20) })
    trazo.push({ x: ida ? 1 : 0, y, t: (t += 300) })
  }
  return trazo
}

describe('cobertura del pizarrón', () => {
  it('constantes exportadas', () => {
    expect(COVERAGE_TARGET).toBe(0.65)
    expect(COVERAGE_GRID).toBe(24)
    expect(MAX_TRACE_POINTS).toBe(1500)
  })

  it('un barrido completo en filas con radio 0.06 cubre al menos la meta', () => {
    expect(computeCoverage(barridoEnFilas(), 0.06)).toBeGreaterThanOrEqual(COVERAGE_TARGET)
  })

  it('un solo punto cubre menos del 5 %', () => {
    expect(computeCoverage([{ x: 0.5, y: 0.5, t: 0 }], 0.06)).toBeLessThan(0.05)
  })

  it('sin puntos la cobertura es 0', () => {
    expect(computeCoverage([], 0.06)).toBe(0)
  })
})

describe('análisis del trazo del pizarrón', () => {
  it('trazo humano en zigzag con ruido y velocidad variable cubre el pizarrón → ok', () => {
    const trazo = humanTrace()
    expect(computeCoverage(trazo, HUMAN_TRACE_RADIO)).toBeGreaterThanOrEqual(COVERAGE_TARGET)
    expect(analyzeTrace(puntero(trazo))).toEqual({ veredicto: 'ok', motivos: [] })
  })

  it('el trazo humano por omisión da ok con distintas semillas', () => {
    for (let seed = 1; seed <= 25; seed++) {
      expect(analyzeTrace(puntero(humanTrace({ seed }))).veredicto, `semilla ${seed}`).toBe('ok')
    }
  })

  it('trazos humanos rápidos y lentos dan ok', () => {
    for (const durationMs of [1500, 3000, 12000]) {
      expect(analyzeTrace(puntero(humanTrace({ durationMs }))).veredicto, `${durationMs} ms`).toBe('ok')
    }
  })

  it('el generador es determinista para una semilla', () => {
    expect(humanTrace({ seed: 7 })).toEqual(humanTrace({ seed: 7 }))
    expect(humanTrace({ seed: 7 })).not.toEqual(humanTrace({ seed: 8 }))
  })

  it('trazo humano lento de 25 s con ~1200 puntos → ok', () => {
    const trazo = humanTrace({ durationMs: 25000 })
    expect(trazo.length).toBeGreaterThanOrEqual(1000)
    expect(trazo.length).toBeLessThanOrEqual(MAX_TRACE_POINTS)
    expect(trazo[trazo.length - 1].t).toBeGreaterThan(24000)
    expect(analyzeTrace(puntero(trazo))).toEqual({ veredicto: 'ok', motivos: [] })
  })

  it('línea recta a velocidad e intervalos constantes → sintetico', () => {
    const r = analyzeTrace(puntero(straightTrace()))
    expect(r.veredicto).toBe('sintetico')
    expect(r.motivos).toContain('constante')
  })

  it('zigzag perfecto a velocidad e intervalos constantes → sintetico', () => {
    const trazo: TracePoint[] = []
    let t = 0
    // Pasos de 0.02 cada 16 ms, también al bajar de una fila a la otra.
    for (let fila = 0; fila < 10; fila++) {
      const y = 0.05 + fila * 0.1
      const x = fila % 2 === 0 ? (i: number) => i / 50 : (i: number) => 1 - i / 50
      for (let i = fila === 0 ? 0 : 1; i <= 50; i++) {
        trazo.push({ x: x(i), y, t })
        t += 16
      }
      if (fila < 9) {
        for (let k = 1; k <= 5; k++) {
          trazo.push({ x: x(50), y: y + k * 0.02, t })
          t += 16
        }
      }
    }
    expect(analyzeTrace(puntero(trazo)).veredicto).toBe('sintetico')
  })

  it('menos de 15 puntos → sintetico', () => {
    const r = analyzeTrace(puntero(humanTrace().slice(0, 14)))
    expect(r.veredicto).toBe('sintetico')
    expect(r.motivos).toContain('puntos')
  })

  it('duración 400 ms → sintetico', () => {
    const base = humanTrace()
    const fin = base[base.length - 1].t
    const trazo = base.map((p) => ({ ...p, t: (p.t * 400) / fin }))
    const r = analyzeTrace(puntero(trazo))
    expect(r.veredicto).toBe('sintetico')
    expect(r.motivos).toContain('duracion')
  })

  it('trazo humano que cubre solo 40 % → dudoso, nunca sintetico', () => {
    const trazo = humanTrace({ coverage: 'partial' })
    const cobertura = computeCoverage(trazo, HUMAN_TRACE_RADIO)
    expect(cobertura).toBeGreaterThan(0.3)
    expect(cobertura).toBeLessThan(0.5)
    expect(analyzeTrace(puntero(trazo))).toEqual({ veredicto: 'dudoso', motivos: ['cobertura'] })
  })

  it('un radio inflado por el cliente se recorta al máximo', () => {
    const unPuntoTras = humanTrace().slice(0, 40)
    // Con radio 1 bastaría un trazo corto para "cubrir" todo; el servidor lo recorta.
    expect(computeCoverage(unPuntoTras, 1)).toBe(computeCoverage(unPuntoTras, RADIO_MAX))
    expect(analyzeTrace(puntero(unPuntoTras, 1)).motivos).toContain('cobertura')
  })

  it('tolera intervalos de 0 ms y puntos un poco fuera del pizarrón', () => {
    const trazo = humanTrace()
    trazo.splice(10, 0, { ...trazo[10] })
    trazo[20] = { ...trazo[20], x: -0.03 }
    trazo[30] = { ...trazo[30], x: 1.02 }
    expect(analyzeTrace(puntero(trazo)).veredicto).toBe('ok')
  })

  it('teclado con 2 teclas y 1.6 s → dudoso', () => {
    expect(analyzeTrace(teclado([{ t: 0 }, { t: 1600 }]))).toEqual({ veredicto: 'dudoso', motivos: ['teclado'] })
  })

  it('teclado con 1 tecla → sintetico', () => {
    const r = analyzeTrace(teclado([{ t: 0 }]))
    expect(r.veredicto).toBe('sintetico')
    expect(r.motivos).toContain('teclado')
  })

  it('teclado con 0.5 s → sintetico', () => {
    const r = analyzeTrace(teclado([{ t: 0 }, { t: 200 }, { t: 500 }]))
    expect(r.veredicto).toBe('sintetico')
    expect(r.motivos).toContain('teclado')
  })

  it('teclado cuenta el tiempo hasta el último punto del borrado automático', () => {
    const r = analyzeTrace({ mode: 'keyboard', radio: 0.06, trazo: [{ x: 0.5, y: 0.5, t: 1700 }], teclas: [{ t: 0 }, { t: 100 }] })
    expect(r.veredicto).toBe('dudoso')
  })

  it('entrada mal formada → sintetico por forma', () => {
    const malas: unknown[] = [
      null,
      'trazo',
      {},
      { mode: 'raton', radio: 0.06, trazo: [], teclas: [] },
      { mode: 'pointer', radio: 'x', trazo: [], teclas: [] },
      { mode: 'pointer', radio: 0, trazo: [], teclas: [] },
      { mode: 'pointer', radio: 0.06, trazo: 'no', teclas: [] },
      { mode: 'pointer', radio: 0.06, trazo: [{ x: 0.1, y: Number.NaN, t: 0 }], teclas: [] },
      { mode: 'pointer', radio: 0.06, trazo: [{ x: 0.1, y: 0.1, t: 5 }, { x: 0.2, y: 0.2, t: 3 }], teclas: [] },
      { mode: 'pointer', radio: 0.06, trazo: [{ x: 9, y: 0.1, t: 0 }], teclas: [] },
      { mode: 'keyboard', radio: 0.06, trazo: [], teclas: [{ t: 'a' }] },
    ]
    for (const m of malas) expect(analyzeTrace(m), JSON.stringify(m)).toEqual({ veredicto: 'sintetico', motivos: ['forma'] })
  })

  it(`más de ${MAX_TRACE_POINTS} puntos → sintetico`, () => {
    const trazo = Array.from({ length: MAX_TRACE_POINTS + 1 }, (_, i) => ({ x: (i % 100) / 100, y: 0.5, t: i * 16 }))
    expect(analyzeTrace(puntero(trazo)).veredicto).toBe('sintetico')
  })
})
