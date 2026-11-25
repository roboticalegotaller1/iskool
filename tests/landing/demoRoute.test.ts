// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/demo/route'
import { middleware } from '@/middleware'
import { buildDemoSubject } from '@/lib/landing/contactLinks'
import { VERIFICATION_FIELD } from '@/lib/landing/demoForm'
import { __resetUsedChallenges, createChallenge, sha256Hex } from '@/lib/landing/verification/challenge'
import { __resetKeyboardLimit } from '@/lib/landing/verification/keyboardLimit'
import type { TraceInput, TracePoint } from '@/lib/landing/verification/trace'
import { HUMAN_TRACE_RADIO, humanTrace, straightTrace } from './helpers/humanTrace'

const { sendMail, createTransport } = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }))
vi.mock('nodemailer', () => ({ default: { createTransport } }))

const valid = {
  nombre: 'Ana Pérez',
  escuela: 'Colegio Ejemplo',
  cargo: 'Directora',
  telefono: '55 1234 5678',
  correo: 'ana@ejemplo.edu',
  mensaje: '',
}

// Cada prueba usa su propia IP para no chocar con el límite por IP de la ruta.
let ipSeq = 0
const nuevaIp = () => `10.0.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/demo', {
    method: 'POST',
    headers: { 'x-forwarded-for': nuevaIp(), ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

// Pide un pase emitido hace 5 s (supera el tiempo mínimo de llenado) y lo resuelve por fuerza bruta.
function pase() {
  const reto = createChallenge(Date.now() - 5_000)
  if (!reto) throw new Error('sin clave de firma en la prueba')
  for (let number = 0; number <= reto.max; number++) {
    if (sha256Hex(reto.salt + String(number)) === reto.challenge) return { ...reto, number }
  }
  throw new Error('acertijo sin solución')
}

const puntero = (trazo: TracePoint[]): TraceInput => ({ mode: 'pointer', radio: HUMAN_TRACE_RADIO, trazo, teclas: [] })
const teclado = (): TraceInput => ({ mode: 'keyboard', radio: HUMAN_TRACE_RADIO, trazo: [], teclas: [{ t: 0 }, { t: 2000 }] })

const conVerificacion = (datos: Record<string, unknown> = valid, trazo: TraceInput = puntero(humanTrace())) => ({
  ...datos,
  [VERIFICATION_FIELD]: { ...pase(), ...trazo },
})

const mensajeEnviado = () => sendMail.mock.calls[0][0] as { subject: string; text: string }

describe('POST /api/demo', () => {
  beforeEach(() => {
    for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']) vi.stubEnv(name, '')
    vi.stubEnv('DEMO_FORM_SECRET', 'clave-de-prueba')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMail.mockReset()
    sendMail.mockResolvedValue({})
    createTransport.mockReset()
    createTransport.mockImplementation(() => ({ sendMail }))
    __resetUsedChallenges()
    __resetKeyboardLimit()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  const conCorreo = () => {
    vi.stubEnv('SMTP_HOST', 'correo.ejemplo.test')
    vi.stubEnv('SMTP_USER', 'buzon@ejemplo.test')
    vi.stubEnv('SMTP_PASS', 'contrasena-de-prueba')
  }

  it('responde 400 a un cuerpo vacío o inválido', async () => {
    expect((await POST(post({}))).status).toBe(400)
    expect((await POST(post('no es json'))).status).toBe(400)
    expect((await POST(post({ ...valid, correo: 'ana@' }))).status).toBe(400)
  })

  it('responde 503 a una solicitud válida si falta el servidor de correo', async () => {
    expect((await POST(post(conVerificacion()))).status).toBe(503)
  })

  it('finge éxito ante el campo trampa, sin intentar enviar', async () => {
    conCorreo()
    const response = await POST(post({ ...valid, sitio: 'http://spam' }))
    expect(response.status).toBe(200)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('envío humano limpio se entrega con el asunto normal', async () => {
    conCorreo()
    const response = await POST(post(conVerificacion()))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect(mensajeEnviado().subject).toBe(buildDemoSubject(valid))
    expect(mensajeEnviado().text).not.toContain('Motivos de revisión')
  })

  it("sin verificación → 400 { error: 'verificacion' }", async () => {
    conCorreo()
    const response = await POST(post(valid))
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ ok: false, error: 'verificacion' })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('un pase reutilizado → 400 { error: verificacion }', async () => {
    conCorreo()
    const cuerpo = conVerificacion()
    expect((await POST(post(cuerpo))).status).toBe(200)
    const segunda = await POST(post(cuerpo))
    expect(segunda.status).toBe(400)
    expect(await segunda.json()).toMatchObject({ error: 'verificacion' })
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('trazo sintético → 200 y sendMail no llamado', async () => {
    conCorreo()
    const response = await POST(post(conVerificacion(valid, puntero(straightTrace()))))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it("trazo dudoso → asunto empieza con '[POSIBLE SPAM] ' y el cuerpo termina con 'Motivos de revisión:'", async () => {
    conCorreo()
    const response = await POST(post(conVerificacion(valid, puntero(humanTrace({ coverage: 'partial' })))))
    expect(response.status).toBe(200)
    const { subject, text } = mensajeEnviado()
    expect(subject).toBe(`[POSIBLE SPAM] ${buildDemoSubject(valid)}`)
    const ultimaLinea = text.trimEnd().split('\n').pop()
    expect(ultimaLinea).toBe('Motivos de revisión: cobertura')
  })

  it('contenido del bot del 2026-11-24 con trazo humano → etiquetado', async () => {
    conCorreo()
    const bot = {
      nombre: 'Kennethagide',
      escuela: 'Empresa',
      cargo: 'Telefonia',
      telefono: '88998196677',
      correo: 'ingeiiv7braun@mail.com',
      mensaje: 'Jfeuwgduwefhw fuhe-',
    }
    const response = await POST(post(conVerificacion(bot)))
    expect(response.status).toBe(200)
    const { subject, text } = mensajeEnviado()
    expect(subject.startsWith('[POSIBLE SPAM] ')).toBe(true)
    const ultimaLinea = text.trimEnd().split('\n').pop() ?? ''
    expect(ultimaLinea.startsWith('Motivos de revisión: ')).toBe(true)
    expect(ultimaLinea).toContain('texto sin sentido')
    expect(ultimaLinea).toContain('escuela y cargo sin relación escolar')
  })

  it('el modo teclado se entrega etiquetado y combina motivos de trazo y contenido', async () => {
    conCorreo()
    const response = await POST(post(conVerificacion({ ...valid, mensaje: 'Visita www.ofertas.example' }, teclado())))
    expect(response.status).toBe(200)
    expect(mensajeEnviado().subject.startsWith('[POSIBLE SPAM] ')).toBe(true)
    const ultimaLinea = mensajeEnviado().text.trimEnd().split('\n').pop() ?? ''
    expect(ultimaLinea.startsWith('Motivos de revisión: teclado, ')).toBe(true)
    expect(ultimaLinea).toContain('liga en los datos')
  })

  it('cuarto envío de teclado de la misma IP en una hora → 200 sin enviar', async () => {
    conCorreo()
    const ip = { 'x-forwarded-for': '192.0.2.77' }
    for (let i = 0; i < 3; i++) {
      expect((await POST(post(conVerificacion(valid, teclado()), ip))).status).toBe(200)
    }
    expect(sendMail).toHaveBeenCalledTimes(3)
    for (const [mensaje] of sendMail.mock.calls) expect(mensaje.subject.startsWith('[POSIBLE SPAM] ')).toBe(true)
    const cuarta = await POST(post(conVerificacion(valid, teclado()), ip))
    expect(cuarta.status).toBe(200)
    expect(await cuarta.json()).toEqual({ ok: true })
    expect(sendMail).toHaveBeenCalledTimes(3)
  })

  it('Origin de otro dominio → 403', async () => {
    conCorreo()
    const response = await POST(post(conVerificacion(), { host: 'iskool.mx', origin: 'https://otro.example' }))
    expect(response.status).toBe(403)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('Sec-Fetch-Site: same-site → 403', async () => {
    conCorreo()
    const response = await POST(post(conVerificacion(), { host: 'iskool.mx', 'sec-fetch-site': 'same-site' }))
    expect(response.status).toBe(403)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('Origin igual a x-forwarded-host → pasa', async () => {
    conCorreo()
    const response = await POST(
      post(conVerificacion(), {
        host: 'interno:3000',
        'x-forwarded-host': 'iskool.mx',
        origin: 'https://iskool.mx',
        'sec-fetch-site': 'same-origin',
      })
    )
    expect(response.status).toBe(200)
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it("formulario urlencoded → 303 con Location que termina en '/?demo=sin-verificacion#contacto'", async () => {
    conCorreo()
    const response = await POST(
      new Request('http://localhost/api/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': nuevaIp() },
        body: new URLSearchParams(valid).toString(),
      })
    )
    expect(response.status).toBe(303)
    const location = response.headers.get('location') ?? ''
    expect(location.endsWith('/?demo=sin-verificacion#contacto')).toBe(true)
    expect(() => new URL(location)).not.toThrow()
    expect(sendMail).not.toHaveBeenCalled()
  })
})

// El middleware no exporta su lista de rutas públicas, así que se prueba la función completa.
describe('el perímetro deja pasar el formulario público', () => {
  it('POST /api/demo sin sesión no recibe 401 ni redirección', async () => {
    const response = await middleware(new NextRequest('https://iskool.mx/api/demo', { method: 'POST' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('GET /api/demo/challenge sin sesión tampoco', async () => {
    const response = await middleware(new NextRequest('https://iskool.mx/api/demo/challenge'))
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
