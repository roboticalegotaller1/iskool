import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('anuncia la portada, privacidad y condiciones', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      'https://iskool.mx/',
      'https://iskool.mx/privacidad',
      'https://iskool.mx/terminos',
    ])
  })
})
