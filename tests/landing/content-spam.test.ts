// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { analyzeContent } from '@/lib/landing/verification/content'
import type { DemoRequest } from '@/lib/landing/contactLinks'

const real: DemoRequest = {
  nombre: 'María Fernanda López',
  escuela: 'Colegio Montessori del Valle',
  cargo: 'Directora académica',
  telefono: '55 1234 5678',
  correo: 'direccion@montessori.edu.mx',
  mensaje: 'Nos interesa conocer la plataforma para nuestra primaria y secundaria.',
}
const con = (cambios: Partial<DemoRequest>): DemoRequest => ({ ...real, ...cambios })

describe('analyzeContent', () => {
  it('el envío del bot del 2026-11-24 es sospechoso', () => {
    const motivos = analyzeContent({
      nombre: 'Kennethagide',
      escuela: 'Empresa',
      cargo: 'Telefonia',
      telefono: '88998196677',
      correo: 'ingeiiv7braun@mail.com',
      mensaje: 'Jfeuwgduwefhw fuhe-',
    })
    expect(motivos).toContain('texto sin sentido')
    expect(motivos).toContain('teléfono fuera de México/Norteamérica')
    expect(motivos).toContain('escuela y cargo sin relación escolar')
  })

  it('una directora real está limpia', () => {
    expect(analyzeContent(real)).toEqual([])
  })

  it('acepta teléfonos de México y Norteamérica', () => {
    expect(analyzeContent(con({ telefono: '+52 55 1234 5678' }))).toEqual([])
    expect(analyzeContent(con({ telefono: '+1 416 555 0199' }))).toEqual([])
    expect(analyzeContent(con({ telefono: '(55) 1234-5678' }))).toEqual([])
  })

  it('marca teléfonos con dígitos que no corresponden', () => {
    expect(analyzeContent(con({ telefono: '12345' }))).toContain(
      'teléfono fuera de México/Norteamérica',
    )
    expect(analyzeContent(con({ telefono: '+44 20 7946 0958' }))).toContain(
      'teléfono fuera de México/Norteamérica',
    )
  })

  it('marca ligas en cualquier campo', () => {
    expect(analyzeContent(con({ mensaje: 'Visita http://ofertas.example/ya' }))).toContain(
      'liga en los datos',
    )
    expect(analyzeContent(con({ nombre: 'www.promo.com' }))).toContain('liga en los datos')
    expect(analyzeContent(con({ escuela: 'Gana dinero en promo.xyz' }))).toContain(
      'liga en los datos',
    )
  })

  it('nombres reales con pocas vocales o de origen náhuatl están limpios', () => {
    for (const nombre of [
      'Xóchitl Hernández',
      'Tlalli Pérez',
      'Cuauhtémoc Ramírez',
      'Ixchel Domínguez',
      'Nezahualcóyotl Cruz',
      'Christopher Schmidt',
      'Itzcóatl Mixtli',
    ]) {
      expect(analyzeContent(con({ nombre }))).toEqual([])
    }
  })

  it('un mensaje vacío o muy corto está limpio', () => {
    expect(analyzeContent(con({ mensaje: '' }))).toEqual([])
    expect(analyzeContent(con({ mensaje: 'Gracias' }))).toEqual([])
    expect(analyzeContent(con({ mensaje: 'Quiero una demo' }))).toEqual([])
  })

  it('detecta texto sin sentido de teclado en nombre o mensaje', () => {
    expect(analyzeContent(con({ mensaje: 'asdfghjkl qwrtpsdf' }))).toContain('texto sin sentido')
    expect(analyzeContent(con({ nombre: 'Jfeuwgduwefhw' }))).toContain('texto sin sentido')
    expect(analyzeContent(con({ mensaje: 'aaaaaaaa' }))).toContain('texto sin sentido')
  })

  it('escuela y cargo de una palabra con relación escolar están limpios', () => {
    expect(analyzeContent(con({ escuela: 'Primaria', cargo: 'Directora' }))).toEqual([])
    expect(analyzeContent(con({ escuela: 'Montessori', cargo: 'Dueño' }))).toEqual([])
    expect(analyzeContent(con({ escuela: 'Primaria', cargo: 'Telefonia' }))).toEqual([])
  })

  it('escuela y cargo de una palabra sin relación escolar se marcan', () => {
    expect(analyzeContent(con({ escuela: 'Empresa', cargo: 'Telefonia' }))).toContain(
      'escuela y cargo sin relación escolar',
    )
  })

  it('escuela o cargo de varias palabras o vacíos no se marcan por esa regla', () => {
    expect(analyzeContent(con({ escuela: 'Empresa Educativa Sol', cargo: 'Telefonia' }))).toEqual([])
    expect(analyzeContent(con({ escuela: 'Empresa', cargo: '' }))).toEqual([])
  })

  it('una cadena enorme con guiones se analiza rápido', () => {
    const t0 = performance.now()
    analyzeContent(con({ mensaje: 'a-'.repeat(100000) + '!', nombre: 'a-'.repeat(100000) + '!' }))
    expect(performance.now() - t0).toBeLessThan(200)
  })

  it('un correo escrito en el mensaje no cuenta como liga', () => {
    expect(analyzeContent(con({ mensaje: 'Mi correo es juan@ejemplo.com, escríbeme.' }))).toEqual([])
  })

  it('tolera prefijos antiguos, extensiones y varios números', () => {
    for (const telefono of [
      '044 55 1234 5678',
      '045 55 1234 5678',
      '01 55 1234 5678',
      '55 1234 5678 ext 12',
      '5512345678 / 5587654321',
      '+52 1 55 1234 5678',
    ]) {
      expect(analyzeContent(con({ telefono }))).toEqual([])
    }
  })

  it('reconoce contador, conserje, intendente y auxiliar como puestos', () => {
    for (const cargo of ['Contadora', 'Conserje', 'Intendente', 'Auxiliar']) {
      expect(analyzeContent(con({ escuela: 'Empresa', cargo }))).toEqual([])
    }
  })

  it('nombres con y o apellidos alemanes están limpios', () => {
    expect(analyzeContent(con({ nombre: 'Brynn Schwarz' }))).toEqual([])
    expect(analyzeContent(con({ nombre: 'Wolfgang Kirchstrasse' }))).toEqual([])
  })
})
