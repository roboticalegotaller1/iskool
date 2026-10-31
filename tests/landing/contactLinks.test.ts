import { describe, expect, it } from 'vitest'
import {
  buildDemoMessage,
  buildMailtoLink,
  buildWhatsappLink,
  plainWhatsappLink,
  type DemoRequest,
} from '@/lib/landing/contactLinks'

const req: DemoRequest = {
  nombre: 'Ana Pérez',
  escuela: 'Colegio Ejemplo & Hijos',
  cargo: 'Directora',
  telefono: '+52 55 1234 5678',
  correo: 'ana@ejemplo.edu',
  mensaje: '¿Pueden el martes?',
}

describe('buildDemoMessage', () => {
  it('incluye todos los datos y la región', () => {
    const msg = buildDemoMessage(req, 'México')
    for (const value of Object.values(req)) expect(msg).toContain(value)
    expect(msg).toContain('México')
  })

  it('omite la línea de mensaje si viene vacío', () => {
    const msg = buildDemoMessage({ ...req, mensaje: '   ' }, 'México')
    expect(msg).not.toContain('Mensaje:')
  })
})

describe('buildMailtoLink', () => {
  it('arma un mailto con asunto y cuerpo codificados', () => {
    const link = buildMailtoLink('contacto@iskool.mx', req, 'México')
    expect(link.startsWith('mailto:contacto@iskool.mx?subject=')).toBe(true)
    expect(link).toContain('&body=')
    expect(link).not.toContain(' ')
    expect(link).not.toContain('&Hijos')
    expect(decodeURIComponent(link.split('&body=')[1])).toBe(buildDemoMessage(req, 'México'))
  })
})

describe('buildWhatsappLink', () => {
  it('devuelve null si no hay número configurado', () => {
    expect(buildWhatsappLink(null, req, 'México')).toBeNull()
    expect(plainWhatsappLink(null)).toBeNull()
  })

  it('deja solo dígitos en el número y codifica el texto', () => {
    const link = buildWhatsappLink('+52 (55) 1234-5678', req, 'México')
    expect(link).not.toBeNull()
    expect(link!.startsWith('https://wa.me/525512345678?text=')).toBe(true)
    expect(decodeURIComponent(link!.split('?text=')[1])).toBe(buildDemoMessage(req, 'México'))
  })

  it('arma el enlace simple sin texto', () => {
    expect(plainWhatsappLink('+52 55 1234 5678')).toBe('https://wa.me/525512345678')
  })
})
