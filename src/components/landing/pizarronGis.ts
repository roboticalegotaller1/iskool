// Dibujo de los trazos de gis del pizarrón. Cada pase usa una semilla distinta,
// así que los garabatos (números, letras y dibujitos) cambian cada vez.

type Rnd = () => number
type Ctx = CanvasRenderingContext2D

// Generador pseudoaleatorio con semilla (mulberry32).
export function prng(seed: number): Rnd {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GIS_BLANCO = 'rgba(255, 255, 255, 0.9)'
const GIS_CIELO = 'rgba(120, 190, 255, 0.95)'

const TEXTOS = ['3 + 4 = 7', '2 × 5', 'A B C', '1, 2, 3', 'a e i o u', '¡Hola!', '8 − 3', '½', '10', 'x²', 'ñ', '9 ÷ 3']

// Repite el trazo con un leve temblor: así se ve como gis y no como línea de computadora.
function trazoGis(ctx: Ctx, rnd: Rnd, grosor: number, dibujar: (dx: number, dy: number) => void) {
  for (let pasada = 0; pasada < 3; pasada++) {
    const dx = (rnd() - 0.5) * grosor * 0.9
    const dy = (rnd() - 0.5) * grosor * 0.9
    ctx.globalAlpha = pasada === 0 ? 0.85 : 0.35
    ctx.lineWidth = grosor * (pasada === 0 ? 1 : 0.7)
    ctx.beginPath()
    dibujar(dx, dy)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

const DIBUJOS: ((ctx: Ctx, x: number, y: number, s: number, rnd: Rnd) => void)[] = [
  // Estrella
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5
        const px = x + dx + Math.cos(a) * s * 0.45
        const py = y + dy + Math.sin(a) * s * 0.45
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
    }),
  // Sol
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      ctx.arc(x + dx, y + dy, s * 0.2, 0, Math.PI * 2)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        ctx.moveTo(x + dx + Math.cos(a) * s * 0.3, y + dy + Math.sin(a) * s * 0.3)
        ctx.lineTo(x + dx + Math.cos(a) * s * 0.45, y + dy + Math.sin(a) * s * 0.45)
      }
    }),
  // Corazón
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      const cx = x + dx
      const cy = y + dy - s * 0.12
      ctx.moveTo(cx, cy + s * 0.42)
      ctx.bezierCurveTo(cx - s * 0.55, cy, cx - s * 0.25, cy - s * 0.35, cx, cy - s * 0.08)
      ctx.bezierCurveTo(cx + s * 0.25, cy - s * 0.35, cx + s * 0.55, cy, cx, cy + s * 0.42)
    }),
  // Carita feliz
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      const cx = x + dx
      const cy = y + dy
      ctx.arc(cx, cy, s * 0.4, 0, Math.PI * 2)
      ctx.moveTo(cx - s * 0.13, cy - s * 0.1)
      ctx.arc(cx - s * 0.14, cy - s * 0.1, s * 0.01, 0, Math.PI * 2)
      ctx.moveTo(cx + s * 0.15, cy - s * 0.1)
      ctx.arc(cx + s * 0.14, cy - s * 0.1, s * 0.01, 0, Math.PI * 2)
      ctx.moveTo(cx - s * 0.2, cy + s * 0.08)
      ctx.quadraticCurveTo(cx, cy + s * 0.3, cx + s * 0.2, cy + s * 0.08)
    }),
  // Espiral
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.055, (dx, dy) => {
      for (let i = 0; i <= 60; i++) {
        const a = i * 0.32
        const r = (s * 0.45 * i) / 60
        const px = x + dx + Math.cos(a) * r
        const py = y + dy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
    }),
  // Casita
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      const cx = x + dx
      const cy = y + dy
      ctx.moveTo(cx - s * 0.32, cy - s * 0.02)
      ctx.lineTo(cx, cy - s * 0.4)
      ctx.lineTo(cx + s * 0.32, cy - s * 0.02)
      ctx.rect(cx - s * 0.25, cy - s * 0.02, s * 0.5, s * 0.4)
      ctx.rect(cx - s * 0.07, cy + s * 0.16, s * 0.14, s * 0.22)
    }),
  // Manzana
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      const cx = x + dx
      const cy = y + dy + s * 0.05
      ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2)
      ctx.moveTo(cx, cy - s * 0.3)
      ctx.lineTo(cx + s * 0.04, cy - s * 0.48)
      ctx.moveTo(cx + s * 0.04, cy - s * 0.42)
      ctx.quadraticCurveTo(cx + s * 0.25, cy - s * 0.55, cx + s * 0.28, cy - s * 0.38)
    }),
  // Nube
  (ctx, x, y, s, rnd) =>
    trazoGis(ctx, rnd, s * 0.06, (dx, dy) => {
      const cx = x + dx
      const cy = y + dy
      ctx.moveTo(cx - s * 0.4, cy + s * 0.15)
      ctx.arc(cx - s * 0.22, cy + s * 0.02, s * 0.18, Math.PI * 0.75, Math.PI * 1.6)
      ctx.arc(cx + s * 0.02, cy - s * 0.1, s * 0.22, Math.PI * 1.1, Math.PI * 1.95)
      ctx.arc(cx + s * 0.26, cy + s * 0.04, s * 0.16, Math.PI * 1.4, Math.PI * 0.4)
      ctx.lineTo(cx - s * 0.4, cy + s * 0.15)
    }),
]

// `maxAncho` evita que un texto largo invada la celda vecina.
function texto(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, maxAncho: number) {
  const palabra = TEXTOS[Math.floor(rnd() * TEXTOS.length)]
  ctx.font = `600 ${Math.round(s * 0.36)}px Poppins, "Instrument Sans", ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rnd() - 0.5) * 0.25)
  for (let pasada = 0; pasada < 2; pasada++) {
    ctx.globalAlpha = pasada === 0 ? 0.9 : 0.35
    ctx.fillText(palabra, (rnd() - 0.5) * s * 0.03, (rnd() - 0.5) * s * 0.03, maxAncho)
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

// Línea ondulada que cruza el pizarrón: deja gis también en los huecos.
function onda(ctx: Ctx, ancho: number, y: number, s: number, rnd: Rnd) {
  const amplitud = s * (0.05 + rnd() * 0.06)
  const fase = rnd() * Math.PI * 2
  trazoGis(ctx, rnd, s * 0.045, (dx, dy) => {
    for (let px = ancho * 0.04; px <= ancho * 0.96; px += 6) {
      const py = y + dy + Math.sin(px / (s * 0.35) + fase) * amplitud
      if (px === ancho * 0.04) ctx.moveTo(px + dx, py)
      else ctx.lineTo(px + dx, py)
    }
  })
}

/** Dibuja el polvo y los garabatos de gis sobre un lienzo transparente de `ancho × alto` píxeles. */
export function dibujarGis(ctx: Ctx, ancho: number, alto: number, semilla: number) {
  const rnd = prng(semilla)
  ctx.clearRect(0, 0, ancho, alto)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Polvo de gis en todo el pizarrón: al borrar, se nota en cualquier lugar.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fillRect(0, 0, ancho, alto)
  for (let i = 0; i < 60; i++) {
    ctx.globalAlpha = 0.02 + rnd() * 0.035
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.ellipse(rnd() * ancho, rnd() * alto, 10 + rnd() * ancho * 0.12, 6 + rnd() * alto * 0.08, rnd() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const columnas = ancho >= alto * 1.8 ? 4 : 3
  const filas = 2
  const s = Math.min(ancho / columnas, alto / filas) * 0.95
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const color = rnd() < 0.55 ? GIS_BLANCO : GIS_CIELO
      ctx.strokeStyle = color
      ctx.fillStyle = color
      const x = ((col + 0.5) / columnas) * ancho + (rnd() - 0.5) * (ancho / columnas) * 0.25
      const y = ((fila + 0.5) / filas) * alto + (rnd() - 0.5) * (alto / filas) * 0.25
      if (rnd() < 0.4) texto(ctx, x, y, s, rnd, (ancho / columnas) * 0.8)
      else DIBUJOS[Math.floor(rnd() * DIBUJOS.length)](ctx, x, y, s * 0.85, rnd)
    }
  }

  ctx.strokeStyle = GIS_BLANCO
  onda(ctx, ancho, alto * (0.48 + (rnd() - 0.5) * 0.08), s, rnd)
}
