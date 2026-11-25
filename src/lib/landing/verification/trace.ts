// Análisis del trazo de "¡Borra el pizarrón!" (función pura).
// Lo usa el servidor para juzgar el movimiento y el cliente para calcular la
// cobertura con la misma cuadrícula, así que no depende de nada del servidor.

export interface TracePoint {
  x: number
  y: number
  t: number
}

export interface TraceInput {
  mode: 'pointer' | 'keyboard'
  radio: number
  trazo: TracePoint[]
  teclas: { t: number }[]
}

export type TraceVerdict = { veredicto: 'ok' | 'dudoso' | 'sintetico'; motivos: string[] }

/** Fracción del pizarrón que debe quedar borrada. */
export const COVERAGE_TARGET = 0.65
/** Lado de la cuadrícula con la que se mide la cobertura. */
export const COVERAGE_GRID = 24
/** Tope de puntos que el cliente puede enviar. */
export const MAX_TRACE_POINTS = 1500
/** Radio normalizado máximo del borrador; un radio mayor se recorta a este. */
export const RADIO_MAX = 0.1

/** Menos puntos que esto no es un borrado. */
export const MIN_POINTS = 15
/** Un borrado de menos de esto (ms) no es humano. */
export const MIN_DURATION_MS = 600
/** Teclado: pulsaciones mínimas y tiempo mínimo (ms) desde la primera. */
export const MIN_KEYS = 2
export const MIN_KEYBOARD_MS = 1500

// Señal de movimiento constante: los tres juntos.
const CV_CONSTANTE = 0.05
const RECTITUD_CONSTANTE = 0.98
// Giro (grados) respecto a la dirección del tramo que abre un tramo nuevo.
const GIRO_TRAMO = 60
/** Más puntos que esto ya no es un borrado lento sino abuso: se trata como forma inválida. */
export const MAX_ABUSE_POINTS = 10 * MAX_TRACE_POINTS

const sinteticoForma = (): TraceVerdict => ({ veredicto: 'sintetico', motivos: ['forma'] })

const finito = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/**
 * Fracción (0–1) de celdas de la cuadrícula `grid×grid` cuyo centro quedó a
 * ≤ `radio` de algún segmento del trazo. Un solo punto cuenta como segmento nulo.
 * El radio se recorta a `RADIO_MAX` para que el cliente no infle la cobertura.
 */
export function computeCoverage(trazo: TracePoint[], radio: number, grid: number = COVERAGE_GRID): number {
  if (trazo.length === 0 || !(radio > 0)) return 0
  const r = Math.min(radio, RADIO_MAX)
  const r2 = r * r
  const celda = 1 / grid
  const cubiertas = new Uint8Array(grid * grid)

  const marcar = (a: TracePoint, b: TracePoint) => {
    // Solo se revisan las celdas dentro de la caja del segmento ampliada por el radio.
    const i0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - r) / celda))
    const i1 = Math.min(grid - 1, Math.floor((Math.max(a.x, b.x) + r) / celda))
    const j0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - r) / celda))
    const j1 = Math.min(grid - 1, Math.floor((Math.max(a.y, b.y) + r) / celda))
    const dx = b.x - a.x
    const dy = b.y - a.y
    const largo2 = dx * dx + dy * dy
    for (let j = j0; j <= j1; j++) {
      const cy = (j + 0.5) * celda
      for (let i = i0; i <= i1; i++) {
        const k = j * grid + i
        if (cubiertas[k]) continue
        const cx = (i + 0.5) * celda
        let f = largo2 === 0 ? 0 : ((cx - a.x) * dx + (cy - a.y) * dy) / largo2
        f = Math.max(0, Math.min(1, f))
        const ex = a.x + f * dx - cx
        const ey = a.y + f * dy - cy
        if (ex * ex + ey * ey <= r2) cubiertas[k] = 1
      }
    }
  }

  if (trazo.length === 1) marcar(trazo[0], trazo[0])
  for (let n = 1; n < trazo.length; n++) marcar(trazo[n - 1], trazo[n])

  let total = 0
  for (const c of cubiertas) total += c
  return total / cubiertas.length
}

// Coeficiente de variación; sin datos suficientes devuelve Infinity para que
// nunca cuente como "constante".
function coefVariacion(valores: number[]): number {
  if (valores.length < 2) return Infinity
  const media = valores.reduce((s, v) => s + v, 0) / valores.length
  if (!(media > 0)) return Infinity
  const varianza = valores.reduce((s, v) => s + (v - media) ** 2, 0) / valores.length
  return Math.sqrt(varianza) / media
}

/**
 * Rectitud: el trazo se parte en tramos cada vez que la dirección gira más de
 * `GIRO_TRAMO` respecto a la del tramo en curso; por tramo se toma
 * distancia directa / longitud recorrida, y se promedia ponderando por longitud
 * (un tramo de un solo paso vale 1 pero pesa poco).
 */
function rectitud(trazo: TracePoint[]): number {
  const cosGiro = Math.cos((GIRO_TRAMO * Math.PI) / 180)
  let recorridoTotal = 0
  let directoTotal = 0
  let inicio = trazo[0]
  let recorrido = 0
  let previo = trazo[0]
  for (let n = 1; n < trazo.length; n++) {
    const p = trazo[n]
    const px = p.x - previo.x
    const py = p.y - previo.y
    const paso = Math.hypot(px, py)
    if (paso === 0) continue
    const tx = previo.x - inicio.x
    const ty = previo.y - inicio.y
    const directo = Math.hypot(tx, ty)
    if (directo > 0 && (px * tx + py * ty) / (paso * directo) < cosGiro) {
      // Cambio de dirección: se cierra el tramo en el punto previo.
      recorridoTotal += recorrido
      directoTotal += directo
      inicio = previo
      recorrido = 0
    }
    recorrido += paso
    previo = p
  }
  recorridoTotal += recorrido
  directoTotal += Math.hypot(previo.x - inicio.x, previo.y - inicio.y)
  return recorridoTotal === 0 ? 0 : directoTotal / recorridoTotal
}

const recortar01 = (v: number) => Math.min(1, Math.max(0, v))

// Valida la forma; devuelve null solo con datos de verdad mal formados (tipos
// incorrectos, números no finitos, tiempos que retroceden, modo desconocido o un
// volumen de abuso). Los puntos fuera del pizarrón se recortan a [0, 1]: en un
// pizarrón angosto el dedo de una persona real puede salirse al arrastrar.
function leerEntrada(input: unknown): TraceInput | null {
  if (!esObjeto(input)) return null
  const { mode, radio, trazo, teclas } = input
  if (mode !== 'pointer' && mode !== 'keyboard') return null
  if (!finito(radio) || radio <= 0) return null
  if (!Array.isArray(trazo) || !Array.isArray(teclas)) return null
  if (trazo.length > MAX_ABUSE_POINTS || teclas.length > MAX_ABUSE_POINTS) return null
  const limpio: TracePoint[] = []
  let tPrevio = -Infinity
  for (const p of trazo) {
    if (!esObjeto(p) || !finito(p.x) || !finito(p.y) || !finito(p.t)) return null
    if (p.t < 0 || p.t < tPrevio) return null
    tPrevio = p.t
    limpio.push({ x: recortar01(p.x), y: recortar01(p.y), t: p.t })
  }
  tPrevio = -Infinity
  for (const k of teclas) {
    if (!esObjeto(k) || !finito(k.t) || k.t < 0 || k.t < tPrevio) return null
    tPrevio = k.t
  }
  return { mode, radio, trazo: limpio, teclas: teclas as { t: number }[] }
}

/**
 * Juzga el trazo: `sintetico` solo con señales inequívocas (se descarta),
 * `dudoso` para lo intermedio (se entrega etiquetado), `ok` si todo cuadra.
 * La cobertura baja nunca es `sintetico`: una persona real que no terminó
 * de borrar no debe perderse en silencio.
 */
export function analyzeTrace(input: unknown): TraceVerdict {
  const entrada = leerEntrada(input)
  if (!entrada) return sinteticoForma()

  if (entrada.mode === 'keyboard') return analizarTeclado(entrada)

  // Un borrado muy lento puede rebasar el tope: no se descarta, se etiqueta, y
  // para acotar el costo solo se analizan los primeros MAX_TRACE_POINTS puntos.
  const exceso = entrada.trazo.length > MAX_TRACE_POINTS
  const trazo = exceso ? entrada.trazo.slice(0, MAX_TRACE_POINTS) : entrada.trazo
  const { radio } = entrada
  const dudosos: string[] = []
  const sinteticos: string[] = []
  if (trazo.length < MIN_POINTS) sinteticos.push('puntos')
  const duracion = trazo.length > 0 ? trazo[trazo.length - 1].t - trazo[0].t : 0
  if (duracion < MIN_DURATION_MS) sinteticos.push('duracion')

  if (trazo.length >= 3) {
    const intervalos: number[] = []
    const velocidades: number[] = []
    for (let n = 1; n < trazo.length; n++) {
      const dt = trazo[n].t - trazo[n - 1].t
      intervalos.push(dt)
      // Eventos agrupados (dt = 0) no aportan velocidad.
      if (dt > 0) velocidades.push(Math.hypot(trazo[n].x - trazo[n - 1].x, trazo[n].y - trazo[n - 1].y) / dt)
    }
    // Ninguna condición sola basta: un humano rápido tiene intervalos casi
    // constantes (un evento por cuadro) y el diezmado por distancia iguala los
    // pasos. Intervalo y velocidad no son independientes (con pasos iguales, la
    // velocidad varía justo cuando varía el intervalo), así que la rectitud es la
    // que separa a un script de una mano que avanza pareja.
    if (
      coefVariacion(intervalos) < CV_CONSTANTE &&
      coefVariacion(velocidades) < CV_CONSTANTE &&
      rectitud(trazo) > RECTITUD_CONSTANTE
    ) {
      sinteticos.push('constante')
    }
  }
  if (sinteticos.length > 0) return { veredicto: 'sintetico', motivos: sinteticos }

  if (computeCoverage(trazo, radio) < COVERAGE_TARGET) dudosos.push('cobertura')
  if (exceso) dudosos.push('exceso')
  if (dudosos.length > 0) return { veredicto: 'dudoso', motivos: dudosos }
  return { veredicto: 'ok', motivos: [] }
}

/**
 * Camino de teclado: el borrado es automático, así que no se mide el trazo.
 * Exige al menos `MIN_KEYS` pulsaciones y `MIN_KEYBOARD_MS` entre la primera
 * pulsación y el último instante registrado (última tecla o último punto del
 * borrado automático, lo que ocurra después). Nunca es `ok`: a lo más `dudoso`.
 */
function analizarTeclado({ teclas, trazo }: TraceInput): TraceVerdict {
  if (teclas.length < MIN_KEYS) return { veredicto: 'sintetico', motivos: ['teclado', 'teclas'] }
  const ultimoTrazo = trazo.length > 0 ? trazo[trazo.length - 1].t : -Infinity
  const fin = Math.max(teclas[teclas.length - 1].t, ultimoTrazo)
  if (fin - teclas[0].t < MIN_KEYBOARD_MS) return { veredicto: 'sintetico', motivos: ['teclado', 'duracion'] }
  return { veredicto: 'dudoso', motivos: ['teclado'] }
}
