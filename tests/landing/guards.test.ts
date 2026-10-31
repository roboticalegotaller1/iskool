import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(__dirname, '..', '..')
const LANDING_DIRS = ['src/components/landing', 'src/content/landing', 'src/lib/landing'].map((d) => join(ROOT, d))

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

// El módulo de fuentes importa de un paquete cuyo nombre incluye una marca; ese identificador no se puede evitar.
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('next/font/google', '')
const files = LANDING_DIRS.flatMap(walk)

// Marcas de terceros y nombre del prospecto: no deben aparecer en textos ni componentes.
const BANNED = [
  'ibime', 'google', 'gemini', 'santillana', 'cambridge', 'progrentis',
  'obsidian', 'github', 'openai', 'supabase', 'microsoft', 'vercel', 'canvas',
]

describe('guardas de marca', () => {
  it('hay archivos de la portada que revisar', () => {
    expect(files.length).toBeGreaterThan(15)
  })

  it.each(BANNED)('"%s" no aparece en la portada', (word) => {
    const offenders = files
      .filter((file) => read(file).toLowerCase().includes(word))
      .map((file) => relative(ROOT, file))
    expect(offenders).toEqual([])
  })
})

function hue(hex: string): { h: number; s: number } {
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [r, g, b] = n.map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return { h: 0, s: 0 }
  const l = (max + min) / 2
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = (h * 60 + 360) % 360
  return { h, s }
}

const isRed = ({ h, s }: { h: number; s: number }) => s > 0.25 && (h < 20 || h > 335)
const isGreen = ({ h, s }: { h: number; s: number }) => s > 0.25 && h > 75 && h < 165

describe('guardas de color', () => {
  const styled = files.filter((f) => /\.(tsx|ts|css|svg)$/.test(f))

  it('ningún color hexadecimal es rojo ni verde', () => {
    const offenders: string[] = []
    for (const file of styled) {
      for (const match of read(file).matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
        const c = hue(match[0])
        if (isRed(c) || isGreen(c)) offenders.push(`${relative(ROOT, file)}: ${match[0]}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('no se usan clases de color rojas ni verdes', () => {
    const offenders = styled
      .filter((file) => /\b(?:red|rose|green|emerald|lime)-\d{2,3}\b/.test(read(file)))
      .map((file) => relative(ROOT, file))
    expect(offenders).toEqual([])
  })
})

describe('aislamiento del resto de la plataforma', () => {
  const TOKENS = 'navy-deep|navy|sky|blue|violet|magenta|cyan|amber|mist|surface|muted'
  const UTILITIES = 'text|bg|border|from|via|to|ring|decoration|fill|stroke|divide|outline'
  const tsx = files.filter((f) => f.endsWith('.tsx'))

  it('los tokens de color siempre llevan el prefijo lp-', () => {
    const bareClass = new RegExp(`(?<![\\w-])(?:${UTILITIES})-(?:${TOKENS})(?![\\w-])`)
    const bareVar = new RegExp(`var\\(--color-(?:${TOKENS})\\b`)
    const offenders = tsx
      .concat(join(ROOT, 'src/components/landing/landing.css'))
      .filter((f) => bareClass.test(read(f)) || bareVar.test(read(f)))
      .map((f) => relative(ROOT, f))
    expect(offenders).toEqual([])
  })

  it('las fuentes y las clases propias llevan el prefijo lp-', () => {
    const bare = /(?<![\w-])(?:font-display|font-body|brain-(?:aura|flow|ping|twinkle)|dot-grid(?:-light)?|fade-edges|on-dark)(?![\w-])/
    const bareMotion = /["'`](?:[^"'`]*\s)?(?:rise|reveal)(?:\s[^"'`]*)?["'`]/
    const offenders = tsx
      .filter((f) => bare.test(read(f)) || bareMotion.test(read(f)))
      .map((f) => relative(ROOT, f))
    expect(offenders).toEqual([])
  })

  it('cada regla de la hoja de estilos de la portada está limitada a ella', () => {
    const css = readFileSync(join(ROOT, 'src/components/landing/landing.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...css.matchAll(/(?:^|[{};])\s*([^{}@;]+?)\s*\{/g)]
      .map((m) => m[1])
      .filter((s) => !/^(from|to|\d+%)/.test(s))
    expect(selectors.length).toBeGreaterThan(5)
    for (const selector of selectors) {
      for (const part of selector.split(',')) expect(part).toMatch(/lp-/)
    }
    const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1])
    expect(keyframes.length).toBeGreaterThan(0)
    for (const name of keyframes) expect(name).toMatch(/^lp-/)
  })
})
