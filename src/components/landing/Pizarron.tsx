'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  COVERAGE_TARGET,
  MAX_TRACE_POINTS,
  MIN_KEYBOARD_MS,
  MIN_KEYS,
  computeCoverage,
  type TracePoint,
} from '@/lib/landing/verification/trace'
import { esEventoConfiable } from '@/lib/landing/verification/trusted'
import { dibujarGis } from './pizarronGis'

// Minijuego "¡Borra el pizarrón!": la persona borra los garabatos de gis con el
// dedo, el mouse o el teclado. Se registra el trazo para que el servidor lo revise.

export interface PizarronState {
  listo: boolean
  mode: 'pointer' | 'keyboard'
  radio: number
  trazo: TracePoint[]
  teclas: { t: number }[]
}

interface PizarronProps {
  onChange(state: PizarronState): void
  resetKey: number
  error?: string
}

/** Radio normalizado del borrador (el servidor lo recorta a RADIO_MAX). */
export const RADIO_BORRADOR = 0.06
// Se guarda un punto cuando el puntero se movió al menos esto (normalizado).
const DIEZMADO = 0.01
const MAX_TECLAS = 20

// Borrado automático con teclado: zigzag por renglones, en dos mitades.
const RENGLONES = 10
const PASO_AUTO = 0.012
const DURACION_MITAD_1 = 1000
const DURACION_MITAD_2 = 900

type FaseTeclado = 'quieto' | 'primera' | 'espera' | 'segunda' | 'fin'

const recortar01 = (v: number) => Math.min(1, Math.max(0, v))
const redondear = (v: number) => Math.round(v * 10_000) / 10_000

// Vértices del zigzag; cada renglón queda a ≤ 0.05 del siguiente, menos que el radio.
function rutaTeclado(): { x: number; y: number }[][] {
  const vertices: { x: number; y: number }[] = []
  for (let i = 0; i < RENGLONES; i++) {
    const y = (i + 0.5) / RENGLONES
    const [x0, x1] = i % 2 === 0 ? [0.03, 0.97] : [0.97, 0.03]
    vertices.push({ x: x0, y }, { x: x1, y })
  }
  const densificar = (vs: { x: number; y: number }[]) => {
    const puntos = [vs[0]]
    for (let n = 1; n < vs.length; n++) {
      const a = vs[n - 1]
      const b = vs[n]
      const pasos = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / PASO_AUTO))
      for (let k = 1; k <= pasos; k++) puntos.push({ x: a.x + ((b.x - a.x) * k) / pasos, y: a.y + ((b.y - a.y) * k) / pasos })
    }
    return puntos
  }
  // Primera mitad: los renglones de arriba (dos vértices por renglón); la segunda sigue desde ahí.
  const corte = RENGLONES
  return [densificar(vertices.slice(0, corte)), densificar(vertices.slice(corte - 1)).slice(1)]
}

const [MITAD_1, MITAD_2] = rutaTeclado()

// Cada espera recuerda de qué tipo es, para cancelarla con la función correcta.
type Espera = { tipo: 'cuadro'; id: number } | { tipo: 'temporizador'; id: ReturnType<typeof setTimeout> }

const pedirCuadro = (cb: () => void): Espera =>
  typeof requestAnimationFrame === 'function'
    ? { tipo: 'cuadro', id: requestAnimationFrame(cb) }
    : { tipo: 'temporizador', id: setTimeout(cb, 16) }
const cancelarEspera = (espera: Espera) => {
  if (espera.tipo === 'cuadro') cancelAnimationFrame(espera.id)
  else clearTimeout(espera.id)
}

export function Pizarron({ onChange, resetKey, error }: PizarronProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const lienzoRef = useRef<HTMLCanvasElement>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const trazo = useRef<TracePoint[]>([])
  // Índices donde empieza un trazo nuevo del dedo (el borrado visible no une los saltos).
  const cortes = useRef(new Set<number>())
  const teclas = useRef<{ t: number }[]>([])
  const modo = useRef<'pointer' | 'keyboard'>('pointer')
  const origen = useRef<number | null>(null)
  const ultimoT = useRef(0)
  const puntero = useRef<number | null>(null)
  const listoRef = useRef(false)
  const fase = useRef<FaseTeclado>('quieto')
  const segundaPendiente = useRef(false)
  const cuadro = useRef<Espera | null>(null)
  const semilla = useRef(1)

  const [listo, setListo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [esperaTecla, setEsperaTecla] = useState(false)

  // Con un pase nuevo la vista vuelve al inicio (ajuste durante el render, sin efecto en cascada).
  const [claveVista, setClaveVista] = useState(resetKey)
  if (claveVista !== resetKey) {
    setClaveVista(resetKey)
    setListo(false)
    setProgreso(0)
    setEsperaTecla(false)
  }

  const avisar = () =>
    onChangeRef.current({
      listo: listoRef.current,
      mode: modo.current,
      radio: RADIO_BORRADOR,
      trazo: trazo.current.slice(),
      teclas: teclas.current.slice(),
    })

  // Tiempo en ms desde el primer evento, siempre creciente.
  const tiempo = () => {
    const ahora = performance.now()
    if (origen.current === null) origen.current = ahora
    ultimoT.current = Math.max(ultimoT.current, Math.round(ahora - origen.current))
    return ultimoT.current
  }

  const contexto = () => lienzoRef.current?.getContext('2d') ?? null

  // Borra en coordenadas normalizadas: la misma geometría con la que el servidor cuenta la cobertura.
  const borrarTramo = (a: TracePoint, b: TracePoint | null) => {
    const lienzo = lienzoRef.current
    const ctx = contexto()
    if (!lienzo || !ctx || !lienzo.width || !lienzo.height) return
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.setTransform(lienzo.width, 0, 0, lienzo.height, 0, 0)
    ctx.fillStyle = '#000'
    ctx.strokeStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(a.x, a.y, RADIO_BORRADOR, RADIO_BORRADOR, 0, 0, Math.PI * 2)
    ctx.fill()
    if (b) {
      ctx.lineCap = 'round'
      ctx.lineWidth = RADIO_BORRADOR * 2
      ctx.beginPath()
      ctx.moveTo(b.x, b.y)
      ctx.lineTo(a.x, a.y)
      ctx.stroke()
    }
    ctx.restore()
  }

  const pintar = () => {
    const board = boardRef.current
    const lienzo = lienzoRef.current
    if (!board || !lienzo) return
    const rect = board.getBoundingClientRect()
    if (!(rect.width > 0 && rect.height > 0)) return
    const escala = Math.min(2, window.devicePixelRatio || 1)
    lienzo.width = Math.round(rect.width * escala)
    lienzo.height = Math.round(rect.height * escala)
    const ctx = contexto()
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.save()
    ctx.scale(escala, escala)
    dibujarGis(ctx, rect.width, rect.height, semilla.current)
    ctx.restore()
    trazo.current.forEach((p, i) => borrarTramo(p, i > 0 && !cortes.current.has(i) ? trazo.current[i - 1] : null))
  }

  const completar = () => {
    if (listoRef.current) return
    listoRef.current = true
    setListo(true)
    setEsperaTecla(false)
  }

  const medir = () => {
    const cobertura = computeCoverage(trazo.current, RADIO_BORRADOR)
    setProgreso(cobertura)
    return cobertura
  }

  // Reinicio del trazo y del gis: al montar y cada vez que llega un pase nuevo.
  useEffect(() => {
    if (cuadro.current !== null) cancelarEspera(cuadro.current)
    cuadro.current = null
    trazo.current = []
    cortes.current = new Set()
    teclas.current = []
    modo.current = 'pointer'
    origen.current = null
    ultimoT.current = 0
    puntero.current = null
    listoRef.current = false
    fase.current = 'quieto'
    segundaPendiente.current = false
    semilla.current = Math.floor(Math.random() * 2 ** 31)
    pintar()
    avisar()
    return () => {
      if (cuadro.current !== null) cancelarEspera(cuadro.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // Si cambia el tamaño, se vuelve a dibujar el gis y lo ya borrado.
  useEffect(() => {
    const board = boardRef.current
    if (!board || typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(() => pintar())
    observador.observe(board)
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Dedo y mouse ----------

  const registrar = (e: PointerEvent<HTMLDivElement>, inicioDeTrazo: boolean) => {
    if (trazo.current.length >= MAX_TRACE_POINTS) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (!(rect.width > 0 && rect.height > 0)) return
    const x = redondear(recortar01((e.clientX - rect.left) / rect.width))
    const y = redondear(recortar01((e.clientY - rect.top) / rect.height))
    const previo = trazo.current[trazo.current.length - 1]
    if (!inicioDeTrazo && previo && Math.hypot(x - previo.x, y - previo.y) < DIEZMADO) return
    const punto = { x, y, t: tiempo() }
    if (inicioDeTrazo) cortes.current.add(trazo.current.length)
    trazo.current.push(punto)
    borrarTramo(punto, inicioDeTrazo ? null : previo)
    // Al llegar al tope se da por terminado: quien repasó mucho la misma zona no debe quedarse
    // atorada; el servidor recalcula la cobertura y, si es baja, lo entrega etiquetado.
    if (medir() >= COVERAGE_TARGET || trazo.current.length >= MAX_TRACE_POINTS) completar()
    avisar()
  }

  const tecladoActivo = () => fase.current !== 'quieto'

  // Si el teclado espera la segunda pulsación y la persona prefiere el dedo, el dedo toma el
  // control desde cero: un trazo de puntero no se mezcla con el borrado automático.
  const dejarTeclado = () => {
    fase.current = 'quieto'
    segundaPendiente.current = false
    modo.current = 'pointer'
    trazo.current = []
    cortes.current = new Set()
    teclas.current = []
    setEsperaTecla(false)
    pintar()
    medir()
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!esEventoConfiable(e.nativeEvent) || listoRef.current) return
    if (fase.current === 'espera') dejarTeclado()
    if (tecladoActivo()) return
    // Un solo dedo a la vez: un segundo toque simultáneo no hace saltar el borrador. Un toque
    // primario nuevo sí reemplaza al anterior, por si se perdió su aviso de soltar.
    if (puntero.current !== null && puntero.current !== e.pointerId && !e.isPrimary) return
    puntero.current = e.pointerId
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      // Sin captura el borrado sigue funcionando dentro del pizarrón.
    }
    modo.current = 'pointer'
    registrar(e, true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== puntero.current || listoRef.current || tecladoActivo() || !esEventoConfiable(e.nativeEvent)) return
    registrar(e, false)
  }

  const soltar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === puntero.current) puntero.current = null
  }

  // ---------- Teclado ----------

  const animar = (puntos: { x: number; y: number }[], duracion: number, alTerminar: () => void) => {
    const inicio = performance.now()
    let siguiente = 0
    const cuadroNuevo = () => {
      const avance = Math.min(1, (performance.now() - inicio) / duracion)
      const meta = Math.min(puntos.length, Math.ceil(puntos.length * avance))
      for (; siguiente < meta && trazo.current.length < MAX_TRACE_POINTS; siguiente++) {
        const punto = { x: redondear(puntos[siguiente].x), y: redondear(puntos[siguiente].y), t: tiempo() }
        const previo = trazo.current[trazo.current.length - 1] ?? null
        trazo.current.push(punto)
        borrarTramo(punto, previo)
      }
      medir()
      if (avance >= 1) {
        cuadro.current = null
        alTerminar()
      } else {
        cuadro.current = pedirCuadro(cuadroNuevo)
      }
    }
    cuadro.current = pedirCuadro(cuadroNuevo)
  }

  const terminarTeclado = () => {
    fase.current = 'fin'
    const cerrar = () => {
      const t = teclas.current
      const final = Math.max(t[t.length - 1]?.t ?? 0, trazo.current[trazo.current.length - 1]?.t ?? 0)
      const falta = t.length > 0 ? MIN_KEYBOARD_MS - (final - t[0].t) : 0
      if (t.length >= MIN_KEYS && falta <= 0) {
        completar()
        avisar()
        return
      }
      // No debería pasar con las duraciones elegidas: se espera lo que falte y se marca el último instante.
      const id = setTimeout(() => {
        const ultimo = trazo.current[trazo.current.length - 1]
        if (ultimo) trazo.current.push({ x: ultimo.x, y: ultimo.y, t: tiempo() })
        cerrar()
      }, Math.max(16, falta))
      cuadro.current = { tipo: 'temporizador', id }
    }
    cerrar()
  }

  const iniciarSegunda = () => {
    fase.current = 'segunda'
    setEsperaTecla(false)
    animar(MITAD_2, DURACION_MITAD_2, terminarTeclado)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (e.repeat || listoRef.current || !esEventoConfiable(e.nativeEvent)) return
    if (fase.current === 'quieto') {
      // El teclado reemplaza lo que se haya borrado con el dedo: su trazo es el automático.
      modo.current = 'keyboard'
      trazo.current = []
      cortes.current = new Set()
    }
    if (teclas.current.length < MAX_TECLAS) teclas.current.push({ t: tiempo() })

    if (fase.current === 'quieto') {
      fase.current = 'primera'
      animar(MITAD_1, DURACION_MITAD_1, () => {
        if (segundaPendiente.current) iniciarSegunda()
        else {
          fase.current = 'espera'
          setEsperaTecla(true)
        }
      })
    } else if (fase.current === 'primera') {
      segundaPendiente.current = true
    } else if (fase.current === 'espera') {
      iniciarSegunda()
    }
    avisar()
  }

  const avance = Math.min(1, progreso / COVERAGE_TARGET)

  return (
    <div className="sm:col-span-2">
      <p id="pizarron-titulo" className="text-sm font-semibold text-lp-navy">
        ¡Borra el pizarrón!
      </p>
      <p id="pizarron-ayuda" className="mt-1 text-sm text-lp-muted">
        Para enviar, borra el pizarrón con el dedo o el mouse
      </p>

      <div className="relative mt-3">
        <div
          ref={boardRef}
          data-pizarron=""
          role="button"
          tabIndex={0}
          aria-label={listo ? 'Pizarrón borrado' : 'Pizarrón para borrar. Con el teclado, presiona Enter.'}
          aria-describedby={['pizarron-ayuda', error ? 'pizarron-error' : null].filter(Boolean).join(' ')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={soltar}
          onPointerCancel={soltar}
          onLostPointerCapture={soltar}
          onKeyDown={onKeyDown}
          style={{ touchAction: 'none' }}
          className={`relative aspect-[16/10] w-full cursor-crosshair select-none overflow-hidden rounded-2xl border-[6px] bg-lp-navy shadow-[inset_0_2px_18px_rgba(0,0,0,0.45)] sm:aspect-[2/1] ${
            error ? 'border-lp-amber ring-4 ring-lp-amber/25' : 'border-lp-navy-deep'
          }`}
        >
          <canvas
            ref={lienzoRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out ${listo ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
        {/* Fuera del botón: dentro de un role="button" los hijos son presentacionales y no se anunciarían. */}
        <div aria-live="polite" className="pointer-events-none absolute inset-0 grid place-items-center">
          {listo && (
            <div className="lp-pizarron-listo flex flex-col items-center gap-3 text-white">
              <span className="grid size-16 place-items-center rounded-full bg-white/10 ring-2 ring-lp-sky">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="lp-pizarron-palomita size-9 fill-none stroke-white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7" pathLength={1} />
                </svg>
              </span>
              <span className="font-lp-display text-xl font-bold tracking-[-0.01em]">¡Listo! Gracias.</span>
            </div>
          )}
        </div>
      </div>

      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-lp-navy/10">
        <div
          className="h-full origin-left rounded-full bg-lp-sky transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${avance})` }}
        />
      </div>

      <p aria-live="polite" className="mt-2 text-sm font-medium text-lp-navy empty:hidden">
        {esperaTecla ? 'Presiona Enter otra vez para terminar de borrar.' : ''}
      </p>

      {error && (
        <p id="pizarron-error" role="alert" className="mt-2 flex items-start gap-2 text-sm font-medium text-lp-navy">
          <span aria-hidden="true" className="mt-[0.35rem] size-2.5 shrink-0 rounded-full bg-lp-amber" />
          {error}
        </p>
      )}
    </div>
  )
}
