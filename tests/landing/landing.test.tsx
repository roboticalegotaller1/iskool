import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { DemoForm } from '@/components/landing/DemoForm'
import { Landing } from '@/components/landing/Landing'
import { landingJsonLd, landingMetadata } from '@/lib/landing/metadata'

vi.mock('@/components/landing/fonts', () => ({ LANDING_FONT_VARIABLES: 'fuentes-de-prueba' }))

const PROHIBITED = /\b(apps?|aplicaci[oó]n|m[oó]vil)\b/i

describe('portada', () => {
  it('tiene exactamente un acceso, "Iniciar sesión", hacia /login', () => {
    render(<Landing />)
    const links = screen.getAllByRole('link', { name: /iniciar sesi[oó]n/i })
    expect(links).toHaveLength(1)
    expect(links[0].textContent).toBe('Iniciar sesión')
    expect(links[0].getAttribute('href')).toBe('/login')
    expect(screen.queryByRole('link', { name: /entrar|conoce iskool/i })).toBeNull()
  })

  it('el pie enlaza privacidad, condiciones y contacto, con la línea de derechos', () => {
    render(<Landing />)
    const footer = within(screen.getByRole('contentinfo'))
    const nav = within(footer.getByRole('navigation', { name: 'Enlaces legales' }))
    expect(nav.getByRole('link', { name: 'Política de Privacidad' }).getAttribute('href')).toBe('https://iskool.mx/privacidad')
    expect(nav.getByRole('link', { name: 'Condiciones del Servicio' }).getAttribute('href')).toBe('https://iskool.mx/terminos')
    expect(nav.getByRole('link', { name: 'Contacto' }).getAttribute('href')).toBe('mailto:contacto@iskool.mx')
    expect(screen.getByRole('contentinfo').textContent).toContain('© 2026 ISkool. Todos los derechos reservados.')
  })

  it('explica el inicio de sesión institucional y qué datos usa, con enlace a privacidad', () => {
    render(<Landing />)
    const paragraph = screen.getByText(/Los usuarios inician sesión con su cuenta institucional\./)
    expect(paragraph.textContent).toBe(
      'Los usuarios inician sesión con su cuenta institucional. ISkool solo usa el nombre, el correo electrónico y la foto de perfil para identificar a cada usuario dentro de su escuela. Consulta los detalles en nuestra Política de Privacidad.',
    )
    expect(within(paragraph).getByRole('link').getAttribute('href')).toBe('https://iskool.mx/privacidad')
  })

  it('el texto visible no dice "app", "aplicación" ni "móvil"', () => {
    const { container } = render(<Landing />)
    expect(container.textContent).toContain('El cerebro vivo de tu escuela')
    expect(container.textContent).not.toMatch(PROHIBITED)
  })

  it('tiene un solo h1, enlace para saltar al contenido y ambas llamadas a la acción', () => {
    render(<Landing />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' }).getAttribute('href')).toBe('#contenido')
    expect(screen.getByRole('link', { name: /Ver cómo funciona/ }).getAttribute('href')).toBe('#como-funciona')
    const demo = screen.getAllByRole('link', { name: /Solicitar una demostración/ })
    for (const link of demo) expect(link.getAttribute('href')).toBe('#contacto')
  })

  it('el botón de demostración del encabezado no ocupa lugar en teléfonos', () => {
    const { container } = render(<Landing />)
    const header = within(container.querySelector('header') as HTMLElement)
    const demo = header.getByRole('link', { name: 'Solicitar una demostración' })
    expect(demo.className).toMatch(/(^|\s)hidden(\s|$)/)
    expect(header.getByRole('link', { name: 'Iniciar sesión' }).className).not.toMatch(/(^|\s)hidden(\s|$)/)
  })

  it('oculta el canal de WhatsApp mientras no haya número', () => {
    const { container } = render(<Landing />)
    expect(container.textContent).not.toMatch(/whatsapp/i)
  })
})

describe('metadatos de la portada', () => {
  it('no dicen "app", "aplicación" ni "móvil"', () => {
    expect(JSON.stringify(landingMetadata)).not.toMatch(PROHIBITED)
    expect(JSON.stringify(landingJsonLd)).not.toMatch(PROHIBITED)
  })

  it('declaran título, descripción, canónica y Open Graph de la versión México', () => {
    expect(landingMetadata.title).toBe('ISkool — El cerebro vivo de tu escuela | México')
    expect(landingMetadata.description).toMatch(/México/)
    expect(landingMetadata.alternates?.canonical).toBe('https://iskool.mx/')
    expect(JSON.stringify(landingMetadata.openGraph)).toContain('https://iskool.mx/')
  })

  it('declaran datos estructurados de la organización', () => {
    expect(landingJsonLd).toMatchObject({ '@type': 'Organization', name: 'ISkool', url: 'https://iskool.mx/', email: 'contacto@iskool.mx' })
  })

  it('no agregan imágenes ni iconos por convención de archivo, que heredarían las demás rutas', () => {
    for (const name of ['opengraph-image.tsx', 'opengraph-image.png', 'twitter-image.tsx', 'twitter-image.png', 'icon.svg']) {
      expect(existsSync(join(process.cwd(), 'src/app', name))).toBe(false)
    }
  })
})

describe('formulario de demostración', () => {
  const fill = () => {
    for (const [label, value] of [
      ['Nombre', 'Ana Pérez'],
      ['Escuela', 'Colegio Ejemplo'],
      ['Cargo', 'Directora'],
      ['Teléfono', '55 1234 5678'],
      ['Correo', 'ana@ejemplo.edu'],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } })
    }
  }

  it('si el servidor no puede enviar, ofrece el correo como alternativa', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<DemoForm placeName="México" email="contacto@iskool.mx" whatsappNumber={null} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }))
    const fallback = await screen.findByRole('link', { name: 'contacto@iskool.mx' })
    expect(fallback.getAttribute('href')).toBe('mailto:contacto@iskool.mx')
    expect(fetchMock).toHaveBeenCalledWith('/api/demo', expect.objectContaining({ method: 'POST' }))
    vi.unstubAllGlobals()
  })

  it('confirma cuando la solicitud se envió', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })))
    render(<DemoForm placeName="México" email="contacto@iskool.mx" whatsappNumber={null} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
    vi.unstubAllGlobals()
  })
})
