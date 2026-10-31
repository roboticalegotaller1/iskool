export interface DemoRequest {
  nombre: string
  escuela: string
  cargo: string
  telefono: string
  correo: string
  mensaje: string
}

export function buildDemoMessage(req: DemoRequest, placeName: string): string {
  const lines = [
    'Hola, ISkool Team. Me gustaría agendar una demostración.',
    '',
    `Nombre: ${req.nombre.trim()}`,
    `Escuela: ${req.escuela.trim()}`,
    `Cargo: ${req.cargo.trim()}`,
    `Teléfono: ${req.telefono.trim()}`,
    `Correo: ${req.correo.trim()}`,
    `Región: ${placeName}`,
  ]
  if (req.mensaje.trim()) lines.push(`Mensaje: ${req.mensaje.trim()}`)
  return lines.join('\n')
}

export function buildDemoSubject(req: DemoRequest): string {
  return `Solicitud de demostración — ${req.escuela.trim()}`
}

export function buildMailtoLink(email: string, req: DemoRequest, placeName: string): string {
  const subject = buildDemoSubject(req)
  const body = buildDemoMessage(req, placeName)
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function plainWhatsappLink(number: string | null): string | null {
  const digits = (number ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

export function buildWhatsappLink(
  number: string | null,
  req: DemoRequest,
  placeName: string,
): string | null {
  const base = plainWhatsappLink(number)
  return base ? `${base}?text=${encodeURIComponent(buildDemoMessage(req, placeName))}` : null
}
