import nodemailer from 'nodemailer'
import { REGION, SITE } from '@/content/landing/site'
import { buildDemoMessage, buildDemoSubject } from '@/lib/landing/contactLinks'
import { isHoneypotFilled, parseDemoRequest, validateDemoRequest } from '@/lib/landing/demoForm'

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

// Recibe la solicitud de demostración y la entrega al buzón de contacto.
// Las credenciales del servidor de correo viven en variables de entorno del hosting, nunca en el código.
export async function POST(request: Request) {
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

  let body: unknown
  const contentType = (request.headers.get('content-type') || '').toLowerCase()
  try {
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      body = Object.fromEntries(form.entries())
    } else {
      body = await request.json()
    }
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  // A un robot se le responde como si todo hubiera salido bien, sin enviar nada.
  if (isHoneypotFilled(body)) return Response.json({ ok: true })

  const demo = parseDemoRequest(body)
  if (!demo || Object.keys(validateDemoRequest(demo)).length > 0) {
    return Response.json({ ok: false }, { status: 400 })
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Solicitud de demostración no enviada: falta configurar el servidor de correo.')
    return Response.json({ ok: false }, { status: 503 })
  }

  const port = Number(SMTP_PORT) || 465

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
      subject: buildDemoSubject(demo),
      text: buildDemoMessage(demo, REGION.placeName),
    })
  } catch (error) {
    console.error('Solicitud de demostración no enviada:', error instanceof Error ? error.message : error)
    return Response.json({ ok: false }, { status: 502 })
  }

  return Response.json({ ok: true })
}
