import { cleanup, render, screen } from '@testing-library/react'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ISkoolOfficialLogo } from '@/components/brand/ISkoolOfficialLogo'
import { SchoolOfficialLogo } from '@/components/brand/SchoolOfficialLogo'
import { DEFAULT_ISKOOL_METADATA } from '@/lib/auth/multiTenantSession'
import { isISkoolHouseBrand, ISKOOL_THEME_TOKENS } from '@/lib/branding/tenantThemeTokens'
import { SITE } from '@/content/landing/site'

const ROOT = join(__dirname, '..', '..')
const part = (root: HTMLElement, name: string) => root.querySelector(`[data-logo-part="${name}"]`)

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

afterEach(cleanup)

describe('ISkoolOfficialLogo', () => {
  const variants = ['horizontal', 'stacked', 'emblem_only', 'badge'] as const
  const themes = ['dark', 'light', 'auto', 'monochrome'] as const

  it.each(variants.flatMap((v) => themes.map((t) => [v, t] as const)))('%s / %s se anuncia como ISkool', (variant, theme) => {
    render(<ISkoolOfficialLogo variant={variant} theme={theme} />)
    expect(screen.getByRole('img', { name: 'ISkool' })).toBeTruthy()
  })

  it('horizontal muestra la palabra y la marca registrada, sin gráfico', () => {
    const { container } = render(<ISkoolOfficialLogo variant="horizontal" showTagline={false} />)
    expect(part(container, 'wordmark')?.textContent).toBe('iSkool®')
    expect(container.querySelector('svg')).toBeNull()
  })

  it.each(['emblem_only', 'badge'] as const)('%s es el cuadro de la "i" al tamaño pedido', (variant) => {
    const { container } = render(<ISkoolOfficialLogo variant={variant} size={32} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
    expect(part(container, 'wordmark')).toBeNull()
  })

  it('los colores de la "i" y de "Skool" siguen el tema', () => {
    const colors = (theme: (typeof themes)[number]) => {
      const { container } = render(<ISkoolOfficialLogo theme={theme} showTagline={false} />)
      const [i, skool] = Array.from(part(container, 'wordmark')!.children)
      return { i: i.className, skool: skool.className }
    }
    expect(colors('dark')).toEqual({ i: 'text-[#2F9BFF]', skool: 'text-white' })
    expect(colors('light')).toEqual({ i: 'text-[#2F9BFF]', skool: 'text-[#0B1B3F]' })
    expect(colors('auto')).toEqual({ i: 'text-[#2F9BFF]', skool: 'text-[#0B1B3F] dark:text-white' })
    expect(colors('monochrome')).toEqual({ i: '', skool: '' })
  })

  it('el lema coincide con el de la portada y desaparece en tamaños pequeños', () => {
    const big = render(<ISkoolOfficialLogo size={40} />)
    expect(part(big.container, 'tagline')?.textContent).toBe(SITE.tagline)
    const small = render(<ISkoolOfficialLogo size={32} />)
    expect(part(small.container, 'tagline')).toBeNull()
    const off = render(<ISkoolOfficialLogo size={60} showTagline={false} />)
    expect(part(off.container, 'tagline')).toBeNull()
  })
})

describe('marca propia frente a marca blanca', () => {
  const { logoUrl, schoolName } = ISKOOL_THEME_TOKENS

  it('los valores por defecto usan el cuadro con la "i"', () => {
    expect(logoUrl).toBe('/brand/iskool-icono.png')
    expect(DEFAULT_ISKOOL_METADATA.branding.logoUrl).toBe(logoUrl)
  })

  it('reconoce la marca propia y respeta la de cada escuela', () => {
    expect(isISkoolHouseBrand(logoUrl, schoolName)).toBe(true)
    expect(isISkoolHouseBrand('', '')).toBe(true)
    expect(isISkoolHouseBrand('', 'ISkool')).toBe(true)
    expect(isISkoolHouseBrand(logoUrl, 'Colegio Sol')).toBe(false)
    expect(isISkoolHouseBrand('/uploads/sol.webp', schoolName)).toBe(false)
    expect(isISkoolHouseBrand('', 'Colegio Sol')).toBe(false)
  })

  it('una ruta guardada del logotipo anterior no se pinta como imagen rota', () => {
    expect(isISkoolHouseBrand('/brand/iskool_logo.webp', schoolName)).toBe(true)
    const { container } = render(<SchoolOfficialLogo schoolId="sch-sol" name="Colegio Sol" logoUrl="/brand/iskool_logo.webp" />)
    expect(container.querySelector('img')).toBeNull()
    expect(part(container, 'mark')).toBeTruthy()
  })

  it('SchoolOfficialLogo usa el cuadro para ISkool y respeta los logos subidos', () => {
    const iskool = render(<SchoolOfficialLogo schoolId="sch-iskool" size={44} />)
    expect(part(iskool.container, 'mark')).toBeTruthy()
    const school = render(<SchoolOfficialLogo schoolId="sch-sol" name="Colegio Sol" logoUrl="/uploads/sol.webp" />)
    expect(school.container.querySelector('img')?.getAttribute('src')).toBe('/uploads/sol.webp')
    expect(school.container.querySelector('[data-logo-part]')).toBeNull()
  })
})

describe('guardas del logotipo', () => {
  const sources = walk(join(ROOT, 'src'))

  it('ningún archivo de src/ apunta al logotipo anterior', () => {
    const offenders = sources.filter((f) => readFileSync(f, 'utf8').includes('iskool_logo.webp')).map((f) => relative(ROOT, f))
    expect(offenders).toEqual([])
  })

  it('el dibujo anterior ya no existe', () => {
    const source = readFileSync(join(ROOT, 'src/components/brand/ISkoolOfficialLogo.tsx'), 'utf8')
    expect(source).not.toMatch(/iskoolCap|mortarboard|linearGradient|F59E0B/)
  })
})
