import nodemailer from 'nodemailer'
import { REGION, SITE } from '@/content/landing/site'
import { buildDemoMessage, buildDemoSubject } from '@/lib/landing/contactLinks'
import { VERIFICATION_FIELD, isHoneypotFilled, parseDemoRequest, validateDemoRequest } from '@/lib/landing/demoForm'
import { verifyChallenge } from '@/lib/landing/verification/challenge'
import { analyzeContent } from '@/lib/landing/verification/content'
import { isKeyboardLimited, recordKeyboardDelivery } from '@/lib/landing/verification/keyboardLimit'
import { analyzeTrace } from '@/lib/landing/verification/trace'

const demoAttemptTracker = new Map<string, { count: number; resetAtMs: number }>()
const DEMO_TRACKER_SWEEP_THRESHOLD = 500
const DEMO_TRACKER_MAX_ENTRIES = 5000

function sweepDemoAttemptTracker(now: number): void {
  if (demoAttemptTracker.size <= DEMO_TRACKER_SWEEP_THRESHOLD) return
  for (const [key, item] of demoAttemptTracker) {
    if (item.resetAtMs <= now) {
      demoAttemptTracker.delete(key)
    }
  }
  while (demoAttemptTracker.size >= DEMO_TRACKER_MAX_ENTRIES) {
    const oldestKey = demoAttemptTracker.keys().next().value
    if (oldestKey === undefined) break
    demoAttemptTracker.delete(oldestKey)
  }
}

function checkDemoRateLimit(ip: string): boolean {
  const now = Date.now()
  sweepDemoAttemptTracker(now)
  const entry = demoAttemptTracker.get(ip)
  if (!entry || entry.resetAtMs <= now) {
    if (!entry && demoAttemptTracker.size >= DEMO_TRACKER_MAX_ENTRIES) {
      const oldestKey = demoAttemptTracker.keys().next().value
      if (oldestKey !== undefined) demoAttemptTracker.delete(oldestKey)
    }
    demoAttemptTracker.set(ip, { count: 1, resetAtMs: now + 10 * 60_000 })
    return true
  }
  entry.count += 1
  return entry.count <= 10
}

const SPAM_TAG = '[REVISAR] '

// A un robot se le responde como si todo hubiera salido bien, sin enviar nada.
const fingirExito = () => Response.json({ ok: true })

const firstHeaderValue = (value: string | null) => (value || '').toLowerCase().split(',')[0].trim()

// Mismo criterio que la protección del middleware: el host de `Origin` debe coincidir con el
// del sitio, y si el navegador declara `Sec-Fetch-Site`, debe ser `same-origin`. Sin `Origin` pasa.
function isSameOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite !== null && secFetchSite.trim().toLowerCase() !== 'same-origin') return false

  const origin = request.headers.get('origin')
  if (origin === null) return true
  const host = firstHeaderValue(request.headers.get('x-forwarded-host') || request.headers.get('host'))
  try {
    return new URL(origin).host.toLowerCase() === host
  } catch {
    return false
  }
}

// Tope del cuerpo: una solicitud legítima (datos y trazo del pizarrón) pesa mucho menos.
const MAX_BODY_BYTES = 128 * 1024

// Ancla del aviso estático de la sección de contacto; se muestra con `:target`, sin JavaScript.
const AVISO_SIN_VERIFICACION = '/#demo-sin-verificacion'

// Cómo se leen en el correo los motivos del trazo; el dueño del buzón no es técnico.
const MOTIVOS_TRAZO: Record<string, string> = {
  cobertura: 'borró poco del pizarrón',
  exceso: 'trazo inusualmente largo',
  teclado: 'usó el teclado en lugar del dedo o el mouse (puede ser una persona que no usa mouse)',
}
const MOTIVO_TRAZO_DESCONOCIDO = 'trazo poco común en el pizarrón'

const describirMotivoTrazo = (codigo: string) => MOTIVOS_TRAZO[codigo] ?? MOTIVO_TRAZO_DESCONOCIDO

// Descartes silenciosos: queda constancia en el registro, solo con el motivo y sin datos personales.
const descartar = (motivo: string | string[]) => {
  console.warn('Solicitud de demostración descartada:', motivo)
  return fingirExito()
}

// Recibe la solicitud de demostración, revisa el pizarrón y la entrega al buzón de contacto
// (con etiqueta de revisión cuando algo se ve dudoso). Las credenciales del servidor de correo
// viven en variables de entorno del hosting, nunca en el código.
export async function POST(request: Request) {
  // Un cuerpo desmedido se rechaza antes de leerlo.
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false }, { status: 413 })
  }

  // Un envío sin JavaScript nunca trae la verificación: se regresa a la portada, al aviso
  // estático de la sección de contacto. La dirección es relativa para no depender del proxy.
  const contentType = (request.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    return new Response(null, { status: 303, headers: { Location: AVISO_SIN_VERIFICACION } })
  }

  // Un cuerpo ilegible se rechaza más adelante, al revisar los datos.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = undefined
  }

  if (isHoneypotFilled(body)) return descartar('campo trampa')

  if (!isSameOrigin(request)) return Response.json({ ok: false }, { status: 403 })

  const clientIp = (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  ).split(',')[0].trim()

  if (!checkDemoRateLimit(clientIp)) {
    return Response.json(
      { ok: false, error: 'Demasiadas solicitudes. Intente nuevamente en unos minutos.' },
      { status: 429 }
    )
  }

  // Los datos se revisan antes que el pase para no gastarlo en un formulario con errores.
  const demo = parseDemoRequest(body)
  if (!demo || Object.keys(validateDemoRequest(demo)).length > 0) {
    return Response.json({ ok: false }, { status: 400 })
  }

  const verificacion = (body as Record<string, unknown>)[VERIFICATION_FIELD]
  if (!verifyChallenge(verificacion).ok) {
    return Response.json(
      { ok: false, error: 'verificacion', mensaje: 'La verificación venció; borra el pizarrón otra vez.' },
      { status: 400 }
    )
  }

  const trazo = analyzeTrace(verificacion)
  if (trazo.veredicto === 'sintetico') return descartar(trazo.motivos)

  // El cupo de teclado se revisa aquí, pero se cuenta solo cuando el correo sí sale.
  const isKeyboard = (verificacion as Record<string, unknown>).mode === 'keyboard'
  if (isKeyboard && isKeyboardLimited(clientIp)) return descartar('cupo de teclado')

  const motivos = [...trazo.motivos.map(describirMotivoTrazo), ...analyzeContent(demo)]

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Solicitud de demostración no enviada: falta configurar el servidor de correo.')
    return Response.json({ ok: false }, { status: 503 })
  }

  const port = Number(SMTP_PORT) || 465
  const subject = buildDemoSubject(demo)
  const text = buildDemoMessage(demo, REGION.placeName)

  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    })
    await transport.sendMail({
      from: { name: SITE.teamName, address: SMTP_USER },
      to: SITE.email,
      replyTo: demo.correo.trim(),
      subject: motivos.length > 0 ? SPAM_TAG + subject : subject,
      text: motivos.length > 0 ? `${text.trimEnd()}\n\nMotivos de revisión: ${motivos.join(', ')}` : text,
    })
  } catch (error) {
    console.error('Solicitud de demostración no enviada:', error instanceof Error ? error.message : error)
    return Response.json({ ok: false }, { status: 502 })
  }

  if (isKeyboard) recordKeyboardDelivery(clientIp)
  return Response.json({ ok: true })
}
