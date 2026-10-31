import type { DemoRequest } from './contactLinks'

export type DemoField = keyof DemoRequest

export const REQUIRED_FIELDS = ['nombre', 'escuela', 'cargo', 'telefono', 'correo'] as const satisfies readonly DemoField[]

export const MAX_FIELD_LENGTH = 200
export const MAX_MESSAGE_LENGTH = 4000
/** Campo oculto que una persona nunca llena; si llega con texto, lo envió un robot. */
export const HONEYPOT_FIELD = 'sitio'

const SINGLE_LINE_FIELDS = ['nombre', 'escuela', 'cargo', 'telefono', 'correo'] as const satisfies readonly DemoField[]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function isHoneypotFilled(body: unknown): boolean {
  return isRecord(body) && typeof body[HONEYPOT_FIELD] === 'string' && body[HONEYPOT_FIELD].trim() !== ''
}

/** Convierte el cuerpo recibido por el servidor en una solicitud, o `null` si no tiene la forma esperada. */
export function parseDemoRequest(body: unknown): DemoRequest | null {
  if (!isRecord(body)) return null

  const fields = {} as Record<(typeof SINGLE_LINE_FIELDS)[number], string>
  for (const field of SINGLE_LINE_FIELDS) {
    const value = body[field]
    if (typeof value !== 'string' || value.length > MAX_FIELD_LENGTH) return null
    // Sin saltos de línea: estos datos acaban en el asunto y en encabezados del correo.
    fields[field] = value.replace(/[\r\n]+/g, ' ')
  }

  const mensaje = body.mensaje ?? ''
  if (typeof mensaje !== 'string' || mensaje.length > MAX_MESSAGE_LENGTH) return null

  return { ...fields, mensaje }
}

export function validateDemoRequest(req: DemoRequest): Partial<Record<DemoField, string>> {
  const errors: Partial<Record<DemoField, string>> = {}

  for (const field of REQUIRED_FIELDS) {
    if (!req[field].trim()) errors[field] = 'Este dato es necesario.'
  }
  if (!errors.correo && !EMAIL_PATTERN.test(req.correo.trim())) {
    errors.correo = 'Revisa el correo; parece incompleto.'
  }
  if (!errors.telefono && req.telefono.replace(/\D/g, '').length < 8) {
    errors.telefono = 'Revisa el teléfono; faltan dígitos.'
  }
  return errors
}
