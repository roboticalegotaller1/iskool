import type { CSSProperties } from 'react'
import { Logo } from './Logo'

/*
 * Cerebro vivo: dos hemisferios de nodos y conexiones luminosas sobre una plataforma.
 * Toda la geometría se calcula una sola vez en el servidor con una semilla fija,
 * así que el resultado es idéntico en cada render y no requiere JavaScript de cliente.
 */

type Pt = readonly [number, number]

const W = 600
const H = 500
const CX = W / 2
const PHRASE = 'El cerebro vivo de tu escuela'

// Placa central donde vive el logotipo.
const PLATE = { cx: CX, cy: 204, hw: 124, hh: 50 }
// Plataforma.
const PODIUM = { cx: CX, cy: 452, rx: 250, ry: 46 }

// Contorno del hemisferio izquierdo (vista frontal). El derecho es su espejo.
const LEFT_OUTLINE: Pt[] = [
  [291, 66], [263, 46], [224, 44], [190, 58], [160, 60], [132, 84], [118, 118],
  [94, 146], [82, 186], [92, 222], [84, 256], [102, 292], [134, 306], [160, 334],
  [200, 346], [234, 336], [264, 350], [290, 328], [286, 270], [292, 200], [286, 130],
]

// Surcos: pliegues que le dan forma orgánica a cada hemisferio.
const LEFT_SULCI: Pt[][] = [
  [[272, 84], [236, 104], [206, 132], [170, 138], [132, 166], [108, 196]],
  [[250, 60], [240, 84], [214, 92]],
  [[176, 72], [162, 96], [170, 122]],
  [[280, 300], [250, 282], [226, 292], [204, 266], [170, 268], [140, 244], [112, 250]],
  [[150, 318], [166, 296], [196, 298], [214, 316]],
  [[120, 138], [140, 150], [150, 176], [176, 186]],
]

// Conexiones que llegan desde fuera hacia el cerebro.
const LEFT_INPUTS: Pt[][] = [
  [[10, 72], [72, 80], [124, 114]],
  [[2, 206], [44, 198], [84, 188]],
  [[16, 334], [66, 324], [104, 294]],
]

// Puentes entre hemisferios.
const BRIDGES: Pt[][] = [
  [[246, 112], [300, 96], [354, 112]],
  [[240, 306], [300, 322], [360, 306]],
]

const mirror = (points: readonly Pt[]): Pt[] => points.map(([x, y]) => [W - x, y] as const)
const round = (n: number) => Math.round(n * 10) / 10
const fmt = ([x, y]: Pt) => `${round(x)} ${round(y)}`

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Puntos de control de la curva suave (Catmull-Rom) entre p1 y p2.
function controls(p0: Pt, p1: Pt, p2: Pt, p3: Pt): [Pt, Pt] {
  return [
    [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
    [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
  ]
}

function closedPath(points: readonly Pt[]): string {
  const n = points.length
  let d = `M${fmt(points[0])}`
  for (let i = 0; i < n; i++) {
    const [c1, c2] = controls(points[(i - 1 + n) % n], points[i], points[(i + 1) % n], points[(i + 2) % n])
    d += `C${fmt(c1)} ${fmt(c2)} ${fmt(points[(i + 1) % n])}`
  }
  return `${d}Z`
}

function openPath(points: readonly Pt[]): string {
  const n = points.length
  let d = `M${fmt(points[0])}`
  for (let i = 0; i < n - 1; i++) {
    const [c1, c2] = controls(points[Math.max(i - 1, 0)], points[i], points[i + 1], points[Math.min(i + 2, n - 1)])
    d += `C${fmt(c1)} ${fmt(c2)} ${fmt(points[i + 1])}`
  }
  return d
}

function sampleClosed(points: readonly Pt[], perSegment: number): Pt[] {
  const n = points.length
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const [c1, c2] = controls(points[(i - 1 + n) % n], p1, p2, points[(i + 2) % n])
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment
      const u = 1 - t
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ])
    }
  }
  return out
}

function isInside(polygon: readonly Pt[], x: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const underPlate = (x: number, y: number) =>
  Math.abs(x - PLATE.cx) < PLATE.hw - 6 && Math.abs(y - PLATE.cy) < PLATE.hh - 6

interface BrainNode {
  x: number
  y: number
  r: number
  tone: number
  group: number
  hub: boolean
}

const TONES = 5
const GROUPS = 4

function buildHemisphere(outline: readonly Pt[], seed: number) {
  const rand = mulberry32(seed)
  const polygon = sampleClosed(outline, 6)
  const xs = polygon.map((p) => p[0])
  const ys = polygon.map((p) => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]

  // El tono sigue la posición horizontal: cian a la izquierda, magenta a la derecha.
  const make = (x: number, y: number, r: number, hub: boolean): BrainNode => ({
    x,
    y,
    r,
    hub,
    tone: Math.min(TONES - 1, Math.max(0, Math.floor(((x - 80) / 440) * TONES + (rand() - 0.5) * 0.9))),
    group: Math.floor(rand() * GROUPS),
  })

  const nodes: BrainNode[] = []

  // Nodos sobre el contorno: dibujan la silueta.
  polygon.forEach(([x, y], i) => {
    if (i % 4 === 0 && !underPlate(x, y)) nodes.push(make(x, y, 1.5 + rand() * 1.1, false))
  })

  // Nodos interiores, separados entre sí para que la red respire.
  const target = nodes.length + 84
  for (let guard = 0; nodes.length < target && guard < 9000; guard++) {
    const x = minX + rand() * (maxX - minX)
    const y = minY + rand() * (maxY - minY)
    if (!isInside(polygon, x, y) || underPlate(x, y)) continue
    if (nodes.some((q) => (q.x - x) ** 2 + (q.y - y) ** 2 < 14.5 ** 2)) continue
    nodes.push(make(x, y, 1.1 + rand() * 2, rand() < 0.1))
  }

  // Cada nodo se conecta con sus vecinos más cercanos.
  const seen = new Set<string>()
  let edges = ''
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter(({ j, d }) => j !== i && d < 46)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(key)) return
        seen.add(key)
        edges += `M${round(a.x)} ${round(a.y)}L${round(nodes[j].x)} ${round(nodes[j].y)}`
      })
  })

  return { nodes, edges }
}

const RIGHT_OUTLINE = mirror(LEFT_OUTLINE)
const left = buildHemisphere(LEFT_OUTLINE, 20260930)
const right = buildHemisphere(RIGHT_OUTLINE, 7031)

const NODES = [...left.nodes, ...right.nodes]
const EDGES = left.edges + right.edges
const HUBS = NODES.filter((n) => n.hub)
const OUTLINES = closedPath(LEFT_OUTLINE) + closedPath(RIGHT_OUTLINE)
const SULCI = [...LEFT_SULCI, ...LEFT_SULCI.map(mirror)].map(openPath)
const INPUTS = [...LEFT_INPUTS, ...LEFT_INPUTS.map(mirror)]
const BRIDGE_PATHS = BRIDGES.map(openPath)

// Un solo trazado por tono para la capa de resplandor.
const circlePath = (n: BrainNode, scale: number) => {
  const r = round(n.r * scale)
  return `M${round(n.x - r)} ${round(n.y)}a${r} ${r} 0 1 0 ${round(r * 2)} 0a${r} ${r} 0 1 0 ${round(-r * 2)} 0`
}
const GLOW_BY_TONE = Array.from({ length: TONES }, (_, tone) =>
  NODES.filter((n) => n.tone === tone)
    .map((n) => circlePath(n, 2.3))
    .join(''),
)

const TONE_FILL = ['fill-lp-cyan', 'fill-lp-sky', 'fill-lp-blue', 'fill-lp-violet', 'fill-lp-magenta']
const TONE_STROKE = ['stroke-lp-cyan', 'stroke-lp-sky', 'stroke-lp-blue', 'stroke-lp-violet', 'stroke-lp-magenta']
const PILLAR_TONE = ['bg-lp-sky', 'bg-lp-violet', 'bg-lp-magenta', 'bg-lp-cyan']
const PILLAR_FILL = ['fill-lp-sky', 'fill-lp-violet', 'fill-lp-magenta', 'fill-lp-cyan']

const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties
const stop = (color: string, opacity = 1): CSSProperties => ({ stopColor: `var(--color-lp-${color})`, stopOpacity: opacity })

// Divisiones del borde de la plataforma (ángulos sobre la elipse).
const rimPoint = (deg: number, scale = 1): Pt => {
  const rad = (deg * Math.PI) / 180
  return [PODIUM.cx + PODIUM.rx * scale * Math.cos(rad), PODIUM.cy + PODIUM.ry * scale * Math.sin(rad)]
}
const RIM_TICKS = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((deg) => `M${fmt(rimPoint(deg, 0.8))}L${fmt(rimPoint(deg))}`)
  .join('')
const RIM_MARKS = [157.5, 112.5, 67.5, 22.5].map((deg) => rimPoint(deg, 0.9))

export function BrainVisual({ pillars }: { pillars: readonly string[] }) {
  return (
    <div className="@container relative mx-auto w-full max-w-[38rem]">
      <div aria-hidden="true" className="relative z-10">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full overflow-visible"
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient id="isk-spectrum" gradientUnits="userSpaceOnUse" x1="80" y1="0" x2="520" y2="0">
              <stop offset="0" style={stop('cyan')} />
              <stop offset="0.24" style={stop('sky')} />
              <stop offset="0.48" style={stop('blue')} />
              <stop offset="0.72" style={stop('violet')} />
              <stop offset="1" style={stop('magenta')} />
            </linearGradient>
            <radialGradient id="isk-lobe-l" gradientUnits="userSpaceOnUse" cx="170" cy="150" r="230">
              <stop offset="0" style={stop('blue', 0.75)} />
              <stop offset="0.55" style={stop('navy', 0.9)} />
              <stop offset="1" style={stop('navy-deep')} />
            </radialGradient>
            <radialGradient id="isk-lobe-r" gradientUnits="userSpaceOnUse" cx="430" cy="150" r="230">
              <stop offset="0" style={stop('violet', 0.7)} />
              <stop offset="0.55" style={stop('navy', 0.9)} />
              <stop offset="1" style={stop('navy-deep')} />
            </radialGradient>
            <radialGradient id="isk-podium-top" cx="0.5" cy="0.42" r="0.6">
              <stop offset="0" style={stop('blue', 0.55)} />
              <stop offset="0.5" style={stop('navy')} />
              <stop offset="1" style={stop('navy-deep')} />
            </radialGradient>
            <radialGradient id="isk-pool">
              <stop offset="0" style={stop('sky', 0.9)} />
              <stop offset="0.5" style={stop('violet', 0.35)} />
              <stop offset="1" style={stop('violet', 0)} />
            </radialGradient>
            <linearGradient id="isk-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={stop('sky', 0.75)} />
              <stop offset="1" style={stop('violet', 0)} />
            </linearGradient>
            <filter id="isk-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.4" />
            </filter>
            <filter id="isk-haze" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="34" />
            </filter>
            <path id="isk-outline" d={OUTLINES} />
            <path id="isk-edges" d={EDGES} />
            <ellipse id="isk-rim" cx={PODIUM.cx} cy={PODIUM.cy} rx={PODIUM.rx} ry={PODIUM.ry} />
          </defs>

          {/* Halo de color detrás del cerebro */}
          <g filter="url(#isk-haze)">
            <ellipse className="lp-brain-aura fill-lp-sky" cx="170" cy="190" rx="130" ry="120" opacity="0.5" />
            <ellipse className="lp-brain-aura fill-lp-violet" style={delay(-3)} cx="430" cy="180" rx="130" ry="120" opacity="0.45" />
            <ellipse className="lp-brain-aura fill-lp-magenta" style={delay(-5)} cx="420" cy="320" rx="90" ry="70" opacity="0.3" />
            <ellipse className="lp-brain-aura fill-lp-cyan" style={delay(-1.5)} cx="190" cy="330" rx="90" ry="60" opacity="0.3" />
          </g>

          {/* Conexiones que entran y salen */}
          {INPUTS.map((points, i) => {
            const d = openPath(points)
            const tone = i < 3 ? [0, 1, 2][i] : [4, 3, 4][i - 3]
            const [x, y] = points[0]
            return (
              <g key={d} className={TONE_STROKE[tone]}>
                <path d={d} strokeWidth="1.4" opacity="0.55" />
                <path d={d} pathLength="100" strokeDasharray="9 91" strokeWidth="2.4" strokeLinecap="round" className="lp-brain-flow" style={delay(-i * 0.9)} />
                <circle cx={x} cy={y} r="5.5" className="fill-white" strokeWidth="2" />
              </g>
            )
          })}

          {/* Plataforma */}
          <use href="#isk-rim" fill="url(#isk-podium-top)" />
          <use href="#isk-rim" stroke="url(#isk-spectrum)" strokeWidth="7" opacity="0.55" filter="url(#isk-soft)" />
          <use href="#isk-rim" stroke="url(#isk-spectrum)" strokeWidth="2" />
          <ellipse cx={PODIUM.cx} cy={PODIUM.cy} rx={PODIUM.rx * 0.8} ry={PODIUM.ry * 0.8} className="stroke-white" strokeOpacity="0.16" />
          <ellipse cx={PODIUM.cx} cy={PODIUM.cy} rx={PODIUM.rx * 0.54} ry={PODIUM.ry * 0.54} className="stroke-lp-sky" strokeOpacity="0.5" strokeDasharray="2 7" strokeLinecap="round" />
          <path d={RIM_TICKS} className="stroke-white" strokeOpacity="0.28" />
          {RIM_MARKS.map(([x, y], i) => (
            <circle key={PILLAR_FILL[i]} cx={round(x)} cy={round(y)} r="4" className={PILLAR_FILL[i]} />
          ))}
          <ellipse className="lp-brain-aura" cx={PODIUM.cx} cy={PODIUM.cy - 2} rx="118" ry="21" fill="url(#isk-pool)" />

          {/* Haz de luz y tallo */}
          <path d="M288 378L312 378L392 450L208 450Z" fill="url(#isk-beam)" opacity="0.5" filter="url(#isk-soft)" />
          <path d="M280 334Q300 350 320 334L312 380Q300 387 288 380Z" className="fill-lp-navy-deep" stroke="url(#isk-spectrum)" strokeWidth="1.2" />
          <path d="M300 348V382" className="stroke-lp-sky" strokeOpacity="0.5" strokeWidth="1.2" />
          <path d="M300 348V382" pathLength="100" strokeDasharray="30 70" strokeLinecap="round" strokeWidth="2" className="lp-brain-flow stroke-white" />

          {/* Volumen de los hemisferios */}
          <use href="#isk-outline" className="fill-lp-navy-deep stroke-lp-navy-deep" strokeWidth="20" strokeLinejoin="round" />
          <path d={closedPath(LEFT_OUTLINE)} fill="url(#isk-lobe-l)" />
          <path d={closedPath(RIGHT_OUTLINE)} fill="url(#isk-lobe-r)" />

          {/* Resplandor */}
          <g filter="url(#isk-soft)">
            <use href="#isk-outline" stroke="url(#isk-spectrum)" strokeWidth="5" opacity="0.8" />
            <use href="#isk-edges" stroke="url(#isk-spectrum)" strokeWidth="2.2" opacity="0.7" />
            {GLOW_BY_TONE.map((d, tone) => (
              <path key={TONE_FILL[tone]} d={d} className={TONE_FILL[tone]} opacity="0.85" />
            ))}
          </g>

          {/* Surcos y puentes, con pulsos que los recorren */}
          <g stroke="url(#isk-spectrum)" strokeLinecap="round">
            {SULCI.map((d) => (
              <path key={d} d={d} strokeWidth="1.5" opacity="0.6" />
            ))}
            {BRIDGE_PATHS.map((d) => (
              <path key={d} d={d} strokeWidth="1.2" opacity="0.7" />
            ))}
          </g>
          <g className="stroke-white" strokeLinecap="round" strokeWidth="2">
            {[...SULCI, ...BRIDGE_PATHS].map((d, i) => (
              <path key={d} d={d} pathLength="100" strokeDasharray="6 94" className="lp-brain-flow" style={delay(-i * 0.7)} />
            ))}
          </g>

          {/* Red nítida */}
          <use href="#isk-outline" stroke="url(#isk-spectrum)" strokeWidth="1.4" />
          <use href="#isk-edges" stroke="url(#isk-spectrum)" strokeWidth="0.8" opacity="0.85" />
          {Array.from({ length: TONES * GROUPS }, (_, k) => {
            const tone = Math.floor(k / GROUPS)
            const group = k % GROUPS
            return (
              <g key={k} className={`${TONE_FILL[tone]} lp-brain-twinkle`} style={delay(-group * 0.95)}>
                {NODES.filter((n) => n.tone === tone && n.group === group).map((n) => (
                  <circle key={`${n.x}-${n.y}`} cx={round(n.x)} cy={round(n.y)} r={round(n.r)} />
                ))}
              </g>
            )
          })}

          {/* Nodos principales: núcleo blanco y onda */}
          {HUBS.map((n, i) => (
            <g key={`${n.x}-${n.y}`}>
              <circle cx={round(n.x)} cy={round(n.y)} r={round(n.r + 2.2)} className={`${TONE_STROKE[n.tone]} lp-brain-ping`} style={delay(-i * 0.45)} strokeWidth="1" />
              <circle cx={round(n.x)} cy={round(n.y)} r={round(n.r + 1.2)} className={TONE_FILL[n.tone]} />
              <circle cx={round(n.x)} cy={round(n.y)} r={round(n.r * 0.55 + 0.4)} className="fill-white" />
            </g>
          ))}

          {/* Placa central */}
          <rect
            x={PLATE.cx - PLATE.hw}
            y={PLATE.cy - PLATE.hh}
            width={PLATE.hw * 2}
            height={PLATE.hh * 2}
            rx={PLATE.hh}
            stroke="url(#isk-spectrum)"
            strokeWidth="6"
            opacity="0.6"
            filter="url(#isk-soft)"
          />
          <rect
            x={PLATE.cx - PLATE.hw}
            y={PLATE.cy - PLATE.hh}
            width={PLATE.hw * 2}
            height={PLATE.hh * 2}
            rx={PLATE.hh}
            className="fill-lp-navy-deep"
            fillOpacity="0.94"
            stroke="url(#isk-spectrum)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Logotipo y frase dentro del cerebro: escalan con el ancho del contenedor */}
        <div className="absolute left-1/2 top-[40.8%] flex w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
          <Logo variant="dark" className="[font-size:6.3cqw]" />
          <p className="mt-[1.1cqw] text-balance font-lp-display [font-size:max(0.5rem,1.95cqw)] font-semibold uppercase leading-[1.4] tracking-[0.2em] text-white/90">
            {PHRASE}
          </p>
        </div>
      </div>

      {/* Frente de la plataforma: los cuatro pilares como texto real */}
      <ul className="relative z-0 mx-[8.333%] -mt-[8%] grid grid-cols-2 rounded-b-[2rem] bg-linear-to-b from-lp-navy-deep to-lp-navy px-2 pb-3 pt-[calc(8%+0.5rem)] shadow-[0_34px_60px_-28px_rgba(11,27,63,0.6)] sm:grid-cols-4 sm:px-3 sm:pb-4">
        {pillars.map((pillar, i) => (
          <li
            key={pillar}
            className="flex flex-col items-center gap-2 border-white/10 px-2 py-3 text-center odd:border-r sm:border-r sm:last:border-r-0 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0"
          >
            <span className={`h-1 w-7 rounded-full ${PILLAR_TONE[i % PILLAR_TONE.length]}`} />
            <span className="font-lp-display text-[0.72rem] font-semibold leading-tight text-white sm:text-xs">{pillar}</span>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="mx-auto -mt-1 h-8 w-3/5 rounded-[100%] bg-lp-navy/25 blur-xl" />
    </div>
  )
}
