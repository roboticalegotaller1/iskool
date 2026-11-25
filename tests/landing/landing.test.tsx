import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoForm } from '@/components/landing/DemoForm'
import { Landing } from '@/components/landing/Landing'
import { Contact } from '@/components/landing/sections/Contact'
import { landingJsonLd, landingMetadata } from '@/lib/landing/metadata'
import { CHALLENGE_TTL_MS } from '@/lib/landing/verification/challengeTiming'
import { COVERAGE_TARGET, analyzeTrace, computeCoverage } from '@/lib/landing/verification/trace'

vi.mock('@/components/landing/fonts', () => ({ LANDING_FONT_VARIABLES: 'fuentes-de-prueba' }))

// jsdom no puede fabricar eventos confiables (isTrusted siempre es falso): la prueba decide.
const confianza = vi.hoisted(() => ({ confiable: true }))
vi.mock('@/lib/landing/verification/trusted', () => ({ esEventoConfiable: () => confianza.confiable }))
// El pase se resuelve al instante; el solucionador real se prueba en solver.test.ts.
vi.mock('@/lib/landing/verification/solver', () => ({ solveChallenge: vi.fn(async () => 4242) }))

const PASE_1 = { salt: '1'.repeat(32) + '.1700000000000.1700001800000', challenge: 'c'.repeat(64), max: 75000, signature: 'f1' }
const PASE_2 = { salt: '2'.repeat(32) + '.1700000000000.1700001800000', challenge: 'd'.repeat(64), max: 75000, signature: 'f2' }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

// Simula el servidor: el pase y los envíos se atienden por separado; cada llamada recibe una respuesta nueva.
function servidor(
  envios: Array<() => Response> = [],
  pases: Array<() => Response> = [() => json(PASE_1), () => json(PASE_2)],
  otroPase: () => Response = () => json(PASE_2),
) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    void init
    if (url === '/api/demo/challenge') return (pases.shift() ?? otroPase)()
    return (envios.shift() ?? (() => json({ ok: true })))()
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const llamadasA = (fetchMock: ReturnType<typeof servidor>, url: string) => fetchMock.mock.calls.filter(([u]) => u === url)
const cuerpoEnviado = (fetchMock: ReturnType<typeof servidor>, n = 0) =>
  JSON.parse(String(llamadasA(fetchMock, '/api/demo')[n][1]?.body))

beforeEach(() => {
  confianza.confiable = true
  // jsdom no dibuja: un contexto falso que acepta cualquier llamada.
  const ctx: Record<string | symbol, unknown> = {}
  const falso = new Proxy(ctx, {
    get: (t, k) => (k in t ? t[k] : (t[k] = vi.fn(() => ({ addColorStop: vi.fn() })))),
    set: (t, k, v) => {
      t[k] = v
      return true
    },
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => falso) as never)
  servidor()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

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
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

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

  const pizarron = () => screen.getByRole('button', { name: /pizarrón/i })

  // Barre el pizarrón en zigzag como lo haría una persona con el dedo.
  const borrar = (pointerId = 1, isPrimary = true) => {
    const board = pizarron()
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(board, { pointerId, isPrimary, clientX: 4, clientY: 8 })
    let derecha = true
    for (let y = 0.05; y < 1; y += 0.1) {
      for (let x = 0; x <= 1.0001; x += 0.02) fireEvent.pointerMove(board, { pointerId, clientX: (derecha ? x : 1 - x) * 400, clientY: y * 200 })
      derecha = !derecha
    }
    fireEvent.pointerUp(board, { pointerId })
  }

  // Como una mano: un evento cada ~16 ms con variación y pasos desiguales.
  const borrarConTiempo = () => {
    const board = pizarron()
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
    let semilla = 7
    const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647)
    fireEvent.pointerDown(board, { pointerId: 1, isPrimary: true, clientX: 4, clientY: 8 })
    let derecha = true
    for (let y = 0.05; y < 1; y += 0.1) {
      for (let x = 0; x <= 1.0001; x += 0.015 + azar() * 0.02) {
        vi.advanceTimersByTime(10 + Math.round(azar() * 14))
        const px = derecha ? x : 1 - x
        fireEvent.pointerMove(board, { pointerId: 1, clientX: px * 400, clientY: (y + (azar() - 0.5) * 0.03) * 200 })
      }
      derecha = !derecha
    }
    fireEvent.pointerUp(board, { pointerId: 1 })
  }

  // La persona tarda unos segundos en llenar el formulario.
  const esperar = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

  const montar = async () => {
    render(<DemoForm placeName="México" email="contacto@iskool.mx" whatsappNumber={null} />)
    await esperar(50)
  }

  const enviar = () => fireEvent.click(screen.getByRole('button', { name: /Enviar solicitud/ }))

  it('si el servidor no puede enviar, ofrece el correo como alternativa', async () => {
    const fetchMock = servidor([() => json({ ok: false }, 503)])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    enviar()
    const fallback = await waitFor(() => within(screen.getByRole('status')).getByRole('link', { name: 'contacto@iskool.mx' }))
    expect(fallback.getAttribute('href')).toBe('mailto:contacto@iskool.mx')
    expect(fetchMock).toHaveBeenCalledWith('/api/demo', expect.objectContaining({ method: 'POST' }))
    // Con 503 se pide un pase nuevo para el siguiente intento.
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo/challenge')).toHaveLength(2))
  })

  it('confirma cuando la solicitud se envió', async () => {
    servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
  })

  it('no envía sin borrar el pizarrón y enfoca el pizarrón con el mensaje', async () => {
    const fetchMock = servidor()
    await montar()
    fill()
    await esperar(4000)
    enviar()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Borra el pizarrón para enviar.')
    expect(document.activeElement).toBe(pizarron())
    expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(0)
  })

  it("con el pizarrón borrado envía con 'verificacion' en el cuerpo", async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrar()
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    const body = cuerpoEnviado(fetchMock)
    expect(body.nombre).toBe('Ana Pérez')
    expect(body.sitio).toBe('')
    const v = body.verificacion
    expect(v).toMatchObject({ ...PASE_1, number: 4242, mode: 'pointer', teclas: [] })
    expect(v.radio).toBeGreaterThan(0)
    expect(v.radio).toBeLessThanOrEqual(0.06)
    expect(v.trazo.length).toBeGreaterThan(15)
    expect(v.trazo.length).toBeLessThanOrEqual(1500)
    for (const p of v.trazo) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(1)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(1)
    }
    for (let i = 1; i < v.trazo.length; i++) expect(v.trazo[i].t).toBeGreaterThanOrEqual(v.trazo[i - 1].t)
    // El servidor recalcula la cobertura con el mismo trazo y el mismo radio.
    expect(computeCoverage(v.trazo, v.radio)).toBeGreaterThanOrEqual(COVERAGE_TARGET)
  })

  it('quien repasa mucho la misma zona no se queda atorada al llegar al tope de puntos', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    const board = pizarron()
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(board, { pointerId: 1, clientX: 0, clientY: 20 })
    for (let i = 0; i < 1700; i++) fireEvent.pointerMove(board, { pointerId: 1, clientX: i % 2 === 0 ? 80 : 4, clientY: 20 })
    fireEvent.pointerUp(board, { pointerId: 1 })
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    const v = cuerpoEnviado(fetchMock).verificacion
    expect(v.trazo.length).toBeLessThanOrEqual(1500)
    expect(computeCoverage(v.trazo, v.radio)).toBeLessThan(COVERAGE_TARGET)
  })

  it('ignora los toques que no vienen de una persona', async () => {
    const fetchMock = servidor()
    await montar()
    fill()
    confianza.confiable = false
    borrar()
    expect(screen.queryByText('¡Listo! Gracias.')).toBeNull()
    enviar()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Borra el pizarrón para enviar.')
    expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(0)
  })

  it('si el pase vence, reinicia el pizarrón y conserva los datos', async () => {
    const fetchMock = servidor([
      () => json({ ok: false, error: 'verificacion', mensaje: 'La verificación venció; borra el pizarrón otra vez.' }, 400),
      () => json({ ok: true }),
    ])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    enviar()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'La verificación venció; borra el pizarrón otra vez.')
    expect(screen.queryByText('¡Listo! Gracias.')).toBeNull()
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Ana Pérez')
    expect((screen.getByLabelText('Correo') as HTMLInputElement).value).toBe('ana@ejemplo.edu')
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo/challenge')).toHaveLength(2))

    borrar()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(2))
    expect(cuerpoEnviado(fetchMock, 1).verificacion.salt).toBe(PASE_2.salt)
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
  })

  it('si el pase está por vencer, consigue otro en silencio sin pedir borrar de nuevo', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    // La persona se fue a otra cosa: el pase de fondo tiene 29 min, a uno de vencer.
    vi.setSystemTime(Date.now() + CHALLENGE_TTL_MS - 60_000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo/challenge')).toHaveLength(2))
    // El tiempo mínimo cuenta desde el pase nuevo: todavía no se envía.
    await esperar(1000)
    expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(0)
    await esperar(3000)
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    expect(cuerpoEnviado(fetchMock).verificacion.salt).toBe(PASE_2.salt)
    expect(cuerpoEnviado(fetchMock).verificacion.mode).toBe('pointer')
    expect(screen.queryByRole('alert')).toBeNull()
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
  })

  it('con un pase todavía vigente no pide otro', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    vi.setSystemTime(Date.now() + CHALLENGE_TTL_MS - 120_000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    expect(llamadasA(fetchMock, '/api/demo/challenge')).toHaveLength(1)
    expect(cuerpoEnviado(fetchMock).verificacion.salt).toBe(PASE_1.salt)
  })

  it('el pizarrón tiene touch-action none mientras se borra y lo suelta al terminar', async () => {
    await montar()
    expect(pizarron().style.touchAction).toBe('none')
    borrar()
    await esperar(50)
    // Ya borrado, el pizarrón no debe estorbar el desplazamiento de la página en un teléfono.
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    expect(pizarron().style.touchAction).toBe('auto')
    expect(screen.getByText('Para enviar, borra el pizarrón con el dedo o el mouse')).toBeTruthy()
    expect(screen.getByText(/¿No puedes usar el pizarrón\? Escríbenos a/).textContent).toContain('contacto@iskool.mx')
  })

  it('si /api/demo/challenge falla, reintenta en silencio y al enviar ofrece el correo', async () => {
    const fetchMock = servidor([], [], () => json({ ok: false }, 503))
    await montar()
    await esperar(5000)
    // Mientras nadie ha enviado, no se muestra ningún error.
    expect(screen.getByRole('status').textContent).toBe('')
    expect(llamadasA(fetchMock, '/api/demo/challenge')).toHaveLength(3)
    fill()
    borrar()
    enviar()
    const fallback = await waitFor(() => within(screen.getByRole('status')).getByRole('link', { name: 'contacto@iskool.mx' }))
    expect(fallback.getAttribute('href')).toBe('mailto:contacto@iskool.mx')
    expect(llamadasA(fetchMock, '/api/demo/challenge').length).toBeGreaterThanOrEqual(4)
    expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(0)
  })

  it('si el pase falla una vez al cargar, el reintento silencioso permite enviar', async () => {
    const fetchMock = servidor([() => json({ ok: true })], [() => json({ ok: false }, 503), () => json(PASE_1)])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    expect(screen.getByRole('status').textContent).toBe('')
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    expect(cuerpoEnviado(fetchMock).verificacion.salt).toBe(PASE_1.salt)
  })

  it('si el pase de fondo no se consiguió, al enviar pide uno nuevo y envía', async () => {
    const falla = () => json({ ok: false }, 503)
    const fetchMock = servidor([() => json({ ok: true })], [falla, falla, falla])
    await montar()
    await esperar(5000)
    fill()
    borrar()
    enviar()
    await esperar(4000)
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    expect(cuerpoEnviado(fetchMock).verificacion.salt).toBe(PASE_2.salt)
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
  })

  it('anuncia "¡Listo! Gracias." en una región viva fuera del botón del pizarrón', async () => {
    await montar()
    borrar()
    const vivo = screen.getByText('¡Listo! Gracias.').closest('[aria-live]')
    expect(vivo).not.toBeNull()
    expect(pizarron().contains(vivo)).toBe(false)
  })

  it('si se pierde el aviso de soltar, el pizarrón no se traba', async () => {
    await montar()
    const board = pizarron()
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(board, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.lostPointerCapture(board, { pointerId: 1 })
    // Un toque nuevo con otro identificador (aun sin ser primario) ya no se ignora.
    borrar(2, false)
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
  })

  it('un toque primario nuevo reemplaza a uno que nunca se soltó', async () => {
    await montar()
    const board = pizarron()
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(board, { pointerId: 9, isPrimary: true, clientX: 10, clientY: 10 })
    // Un segundo dedo simultáneo (no primario) se ignora.
    fireEvent.pointerDown(board, { pointerId: 10, isPrimary: false, clientX: 300, clientY: 150 })
    fireEvent.pointerMove(board, { pointerId: 10, clientX: 350, clientY: 150 })
    // Sin pointerup del 9: un toque primario nuevo toma el control y borra.
    fireEvent.pointerDown(board, { pointerId: 2, isPrimary: true, clientX: 4, clientY: 8 })
    let derecha = true
    for (let y = 0.05; y < 1; y += 0.1) {
      for (let x = 0; x <= 1.0001; x += 0.02) fireEvent.pointerMove(board, { pointerId: 2, clientX: (derecha ? x : 1 - x) * 400, clientY: y * 200 })
      derecha = !derecha
    }
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
  })

  it('un borrado con ritmo de persona pasa la revisión del servidor como ok', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrarConTiempo()
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    expect(analyzeTrace(cuerpoEnviado(fetchMock).verificacion)).toEqual({ veredicto: 'ok', motivos: [] })
  })

  it('si el teclado espera la segunda pulsación, el dedo puede tomar el control', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    const board = pizarron()
    board.focus()
    fireEvent.keyDown(board, { key: 'Enter' })
    await esperar(2000)
    expect(screen.getByText(/Presiona Enter otra vez/)).toBeTruthy()
    borrar()
    expect(screen.queryByText(/Presiona Enter otra vez/)).toBeNull()
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    const v = cuerpoEnviado(fetchMock).verificacion
    expect(v.mode).toBe('pointer')
    expect(v.teclas).toEqual([])
    expect(computeCoverage(v.trazo, v.radio)).toBeGreaterThanOrEqual(COVERAGE_TARGET)
  })

  it('después de enviado, un segundo clic no vuelve a llamar fetch', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    borrar()
    await esperar(4000)
    enviar()
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Recibimos tu solicitud/))
    fill()
    enviar()
    await esperar(4000)
    expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1)
  })

  it('el pizarrón se completa con teclado', async () => {
    const fetchMock = servidor([() => json({ ok: true })])
    await montar()
    fill()
    const board = pizarron()
    board.focus()
    fireEvent.keyDown(board, { key: 'Enter' })
    await esperar(2000)
    expect(screen.getByText(/Presiona Enter otra vez/)).toBeTruthy()
    expect(screen.queryByText('¡Listo! Gracias.')).toBeNull()
    fireEvent.keyDown(board, { key: ' ' })
    await esperar(2000)
    expect(screen.getByText('¡Listo! Gracias.')).toBeTruthy()
    enviar()
    await waitFor(() => expect(llamadasA(fetchMock, '/api/demo')).toHaveLength(1))
    const v = cuerpoEnviado(fetchMock).verificacion
    expect(v.mode).toBe('keyboard')
    expect(v.teclas).toHaveLength(2)
    const fin = Math.max(v.teclas[1].t, v.trazo[v.trazo.length - 1].t)
    expect(fin - v.teclas[0].t).toBeGreaterThanOrEqual(1500)
    expect(analyzeTrace(v)).toEqual({ veredicto: 'dudoso', motivos: ['teclado'] })
  })
})

describe('aviso de envío sin verificación', () => {
  // La sección se genera en el servidor: el aviso viaja en el HTML estático, oculto, y solo
  // `:target` (la dirección /#demo-sin-verificacion) lo muestra, aun sin JavaScript.
  const html = () => renderToStaticMarkup(<Contact />)
  const aviso = () => {
    const contenedor = document.createElement('div')
    contenedor.innerHTML = html()
    return contenedor.querySelector<HTMLElement>('#demo-sin-verificacion')
  }

  it('el HTML del servidor de la sección de contacto trae el aviso con su ancla y el correo', () => {
    const elemento = aviso()
    expect(elemento).not.toBeNull()
    expect(elemento!.closest('section')?.id).toBe('contacto')
    expect(elemento!.textContent).toMatch(/No pudimos verificar tu solicitud/)
    expect(elemento!.textContent).toMatch(/Recarga la página, borra el pizarrón/)
    expect(elemento!.querySelector('a')?.getAttribute('href')).toBe('mailto:contacto@iskool.mx')
  })

  it('está oculto por omisión y solo se muestra como destino del ancla', () => {
    const clases = aviso()!.className.split(/\s+/)
    expect(clases).toContain('hidden')
    expect(clases).toContain('target:block')
  })
})
