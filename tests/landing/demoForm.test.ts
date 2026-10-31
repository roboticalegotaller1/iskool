import { describe, expect, it } from 'vitest'
import {
  HONEYPOT_FIELD,
  MAX_FIELD_LENGTH,
  MAX_MESSAGE_LENGTH,
  REQUIRED_FIELDS,
  isHoneypotFilled,
  parseDemoRequest,
  validateDemoRequest,
} from '@/lib/landing/demoForm'
import type { DemoRequest } from '@/lib/landing/contactLinks'

const valid: DemoRequest = {
  nombre: 'Ana Pérez',
  escuela: 'Colegio Ejemplo',
  cargo: 'Directora',
  telefono: '55 1234 5678',
  correo: 'ana@ejemplo.edu',
  mensaje: '',
}

describe('validateDemoRequest', () => {
  it('acepta una solicitud completa sin mensaje', () => {
    expect(validateDemoRequest(valid)).toEqual({})
  })

  it('marca cada campo requerido vacío o solo con espacios', () => {
    const errors = validateDemoRequest({
      nombre: '', escuela: '  ', cargo: '', telefono: '', correo: '', mensaje: '',
    })
    expect(Object.keys(errors).sort()).toEqual([...REQUIRED_FIELDS].sort())
    expect(errors.mensaje).toBeUndefined()
  })

  it('rechaza correos mal formados', () => {
    expect(validateDemoRequest({ ...valid, correo: 'ana@' }).correo).toBeDefined()
    expect(validateDemoRequest({ ...valid, correo: 'ana ejemplo.edu' }).correo).toBeDefined()
  })

  it('rechaza teléfonos con menos de 8 dígitos', () => {
    expect(validateDemoRequest({ ...valid, telefono: '12-34' }).telefono).toBeDefined()
    expect(validateDemoRequest({ ...valid, telefono: '+52 (55) 1234-5678' }).telefono).toBeUndefined()
  })
})

describe('parseDemoRequest', () => {
  it('devuelve la solicitud cuando el cuerpo trae todos los campos como texto', () => {
    expect(parseDemoRequest({ ...valid })).toEqual(valid)
  })

  it('trata el mensaje ausente como vacío e ignora campos desconocidos', () => {
    const sinMensaje: Record<string, unknown> = { ...valid, otro: 'x' }
    delete sinMensaje.mensaje
    expect(parseDemoRequest(sinMensaje)).toEqual(valid)
  })

  it('rechaza cuerpos que no son un objeto o con campos que no son texto', () => {
    expect(parseDemoRequest(null)).toBeNull()
    expect(parseDemoRequest('hola')).toBeNull()
    expect(parseDemoRequest([valid])).toBeNull()
    expect(parseDemoRequest({ ...valid, nombre: 42 })).toBeNull()
    expect(parseDemoRequest({ ...valid, correo: undefined })).toBeNull()
  })

  it('rechaza campos desmedidos', () => {
    expect(parseDemoRequest({ ...valid, nombre: 'a'.repeat(MAX_FIELD_LENGTH + 1) })).toBeNull()
    expect(parseDemoRequest({ ...valid, mensaje: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) })).toBeNull()
    expect(parseDemoRequest({ ...valid, mensaje: 'a'.repeat(MAX_MESSAGE_LENGTH) })).not.toBeNull()
  })

  it('quita saltos de línea de los campos de un solo renglón', () => {
    const parsed = parseDemoRequest({ ...valid, escuela: 'Colegio\r\nBcc: otro@ejemplo.com' })
    expect(parsed?.escuela).toBe('Colegio Bcc: otro@ejemplo.com')
  })
})

describe('isHoneypotFilled', () => {
  it('detecta el campo trampa relleno', () => {
    expect(isHoneypotFilled({ ...valid, [HONEYPOT_FIELD]: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ ...valid, [HONEYPOT_FIELD]: '' })).toBe(false)
    expect(isHoneypotFilled(valid)).toBe(false)
    expect(isHoneypotFilled(null)).toBe(false)
  })
})
