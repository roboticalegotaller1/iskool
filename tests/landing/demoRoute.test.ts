// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/demo/route'
import { middleware } from '@/middleware'

const valid = {
  nombre: 'Ana Pérez',
  escuela: 'Colegio Ejemplo',
  cargo: 'Directora',
  telefono: '55 1234 5678',
  correo: 'ana@ejemplo.edu',
  mensaje: '',
}

const post = (body: unknown) =>
  new Request('http://localhost/api/demo', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) })

describe('POST /api/demo', () => {
  beforeEach(() => {
    for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']) vi.stubEnv(name, '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('responde 400 a un cuerpo vacío o inválido', async () => {
    expect((await POST(post({}))).status).toBe(400)
    expect((await POST(post('no es json'))).status).toBe(400)
    expect((await POST(post({ ...valid, correo: 'ana@' }))).status).toBe(400)
  })

  it('responde 503 a una solicitud válida si falta el servidor de correo', async () => {
    expect((await POST(post(valid))).status).toBe(503)
  })

  it('finge éxito ante el campo trampa, sin intentar enviar', async () => {
    expect((await POST(post({ ...valid, sitio: 'http://spam' }))).status).toBe(200)
  })
})

// El middleware no exporta su lista de rutas públicas, así que se prueba la función completa.
describe('el perímetro deja pasar el formulario público', () => {
  it('POST /api/demo sin sesión no recibe 401 ni redirección', async () => {
    const response = await middleware(new NextRequest('https://iskool.mx/api/demo', { method: 'POST' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('/sitemap.xml sin sesión tampoco', async () => {
    const response = await middleware(new NextRequest('https://iskool.mx/sitemap.xml'))
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('app.iskool.mx sigue abriendo el login en la raíz', async () => {
    const response = await middleware(new NextRequest('https://app.iskool.mx/', { headers: { host: 'app.iskool.mx' } }))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toMatch(/\/login$/)
  })
})
