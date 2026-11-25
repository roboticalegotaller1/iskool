// Generador determinista de trazos para las pruebas del pizarrón.
// Simula lo que el navegador registrará: eventos del puntero cada ~16 ms con
// variación, y luego el diezmado por distancia (se guarda un punto cuando el
// puntero se movió al menos ~1 % del ancho), igual que hará el cliente.

import type { TracePoint } from '@/lib/landing/verification/trace'

// Radio normalizado del borrador que suponen estos trazos.
export const HUMAN_TRACE_RADIO = 0.06

// Distancia mínima entre puntos guardados (diezmado del cliente).
const DECIMATION = 0.01

// Generador pseudoaleatorio con semilla (mulberry32): mismo resultado siempre.
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Ruta de borrado en zigzag por filas; `pasadas` repite el barrido (una persona
// lenta suele repasar). Devuelve los vértices de la ruta base.
function rutaZigzag(yMax: number, pasadas: number): { x: number; y: number }[] {
  const filas: number[] = []
  const paso = 0.09
  for (let y = 0.05; y <= yMax + 1e-9; y += paso) filas.push(y)
  const vertices: { x: number; y: number }[] = []
  for (let p = 0; p < pasadas; p++) {
    const orden = p % 2 === 0 ? filas : [...filas].reverse()
    orden.forEach((y, i) => {
      const izquierdaADerecha = (i + p) % 2 === 0
      vertices.push({ x: izquierdaADerecha ? 0.04 : 0.96, y })
      vertices.push({ x: izquierdaADerecha ? 0.96 : 0.04, y })
    })
  }
  return vertices
}

function longitud(v: { x: number; y: number }[]): number {
  let total = 0
  for (let i = 1; i < v.length; i++) total += Math.hypot(v[i].x - v[i - 1].x, v[i].y - v[i - 1].y)
  return total
}

// Posición sobre la ruta base a una distancia recorrida `d`.
function puntoEnRuta(v: { x: number; y: number }[], d: number): { x: number; y: number } {
  let resto = d
  for (let i = 1; i < v.length; i++) {
    const seg = Math.hypot(v[i].x - v[i - 1].x, v[i].y - v[i - 1].y)
    if (resto <= seg || i === v.length - 1) {
      const f = seg === 0 ? 0 : Math.min(1, resto / seg)
      return { x: v[i - 1].x + (v[i].x - v[i - 1].x) * f, y: v[i - 1].y + (v[i].y - v[i - 1].y) * f }
    }
    resto -= seg
  }
  return v[v.length - 1]
}

/**
 * Trazo humano simulado: zigzag con temblor de la mano, velocidad variable y
 * eventos con intervalos irregulares. Por omisión dura ~5 s y cubre el pizarrón.
 * `coverage: 'partial'` barre solo la franja superior (~40 % del pizarrón).
 */
export function humanTrace(opts: { seed?: number; durationMs?: number; coverage?: 'full' | 'partial' } = {}): TracePoint[] {
  const { seed = 1, durationMs = 5000, coverage = 'full' } = opts
  const rnd = prng(seed)
  const yMax = coverage === 'full' ? 0.95 : 0.32
  // Quien borra despacio repasa más: una pasada extra por cada ~8 s.
  const pasadas = Math.max(1, Math.round(durationMs / 8000))
  const ruta = rutaZigzag(yMax, pasadas)
  const total = longitud(ruta)

  // Eventos crudos del puntero.
  const crudos: TracePoint[] = []
  let t = 0
  let d = 0
  const fase1 = rnd() * Math.PI * 2
  const fase2 = rnd() * Math.PI * 2
  const velocidadMedia = total / durationMs
  while (d < total) {
    const p = puntoEnRuta(ruta, d)
    // Temblor de la mano: ondulación lenta más ruido fino.
    const temblorX = 0.006 * Math.sin(t / 170 + fase1) + (rnd() - 0.5) * 0.004
    const temblorY = 0.012 * Math.sin(t / 230 + fase2) + (rnd() - 0.5) * 0.004
    crudos.push({ x: p.x + temblorX, y: p.y + temblorY, t: Math.round(t * 10) / 10 })
    // Intervalo de ~16 ms con variación y, de vez en cuando, un cuadro perdido.
    const dt = 14 + rnd() * 5 + (rnd() < 0.05 ? 16 + rnd() * 20 : 0)
    // Velocidad que acelera y frena (factor 0.4–1.6).
    const factor = 1 + 0.45 * Math.sin(t / 400 + fase1) + (rnd() - 0.5) * 0.3
    d += velocidadMedia * factor * dt
    t += dt
  }
  const fin = puntoEnRuta(ruta, total)
  crudos.push({ x: fin.x, y: fin.y, t: Math.round(t * 10) / 10 })

  // Diezmado por distancia, como el cliente.
  const trazo: TracePoint[] = [crudos[0]]
  for (let i = 1; i < crudos.length; i++) {
    const ultimo = trazo[trazo.length - 1]
    if (Math.hypot(crudos[i].x - ultimo.x, crudos[i].y - ultimo.y) >= DECIMATION || i === crudos.length - 1) {
      trazo.push(crudos[i])
    }
  }
  return trazo
}

/** Línea recta a velocidad e intervalos constantes: lo que haría un script. */
export function straightTrace(): TracePoint[] {
  const trazo: TracePoint[] = []
  for (let i = 0; i < 100; i++) trazo.push({ x: 0.1 + i * 0.008, y: 0.5, t: i * 16 })
  return trazo
}
