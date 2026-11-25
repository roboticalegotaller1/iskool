import nodemailer from 'nodemailer'
import { REGION, SITE } from '@/content/landing/site'
import { buildDemoMessage, buildDemoSubject } from '@/lib/landing/contactLinks'
import { VERIFICATION_FIELD, isHoneypotFilled, parseDemoRequest, validateDemoRequest } from '@/lib/landing/demoForm'
import { verifyChallenge } from '@/lib/landing/verification/challenge'
import { analyzeContent } from '@/lib/landing/verification/content'
import { checkKeyboardLimit } from '@/lib/landing/verification/keyboardLimit'
import { analyzeTrace } from '@/lib/landing/verification/trace'

const demoAttemptTracker = new Map<string, { count: number; resetAtMs: number }>()

function checkDemoRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = demoAttemptTracker.get(ip)
  if (!entry || entry.resetAtMs <= now) {
    demoAttemptTracker.set(ip, { count: 1, resetAtMs: now + 10 * 60_000 })
    return true
  }
  entry.count += 1
  return entry.count <= 10
}

const SPAM_TAG = '[POSIBLE SPAM] '

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

// Dirección absoluta de la portada, respetando el dominio público cuando hay un proxy delante.
function landingUrl(request: Request, path: string): URL {
  const url = new URL(request.url)
  const forwardedHost = firstHeaderValue(request.headers.get('x-forwarded-host'))
  const forwardedProto = firstHeaderValue(request.headers.get('x-forwarded-proto'))
  if (forwardedHost) url.host = forwardedHost
  if (forwardedProto === 'http' || forwardedProto === 'https') url.protocol = `${forwardedProto}:`
  return new URL(path, url.origin)
}

// Recibe la solicitud de demostración, revisa el pizarrón y la entrega al buzón de contacto
// (con etiqueta de revisión cuando algo se ve dudoso). Las credenciales del servidor de correo
// viven en variables de entorno del hosting, nunca en el código.
export async function POST(request: Request) {
  // Un envío sin JavaScript nunca trae la verificación: se regresa a la portada con un aviso.
  const contentType = (request.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    return Response.redirect(landingUrl(request, '/?demo=sin-verificacion#contacto'), 303)
  }

  // Un cuerpo ilegible se rechaza más adelante, al revisar los datos.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = undefined
  }

  if (isHoneypotFilled(body)) return fingirExito()

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
  if (trazo.veredicto === 'sintetico') return fingirExito()

  const isKeyboard = (verificacion as Record<string, unknown>).mode === 'keyboard'
  if (isKeyboard && !checkKeyboardLimit(clientIp)) return fingirExito()

  const motivos = [...trazo.motivos, ...analyzeContent(demo)]

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

  return Response.json({ ok: true })
}
