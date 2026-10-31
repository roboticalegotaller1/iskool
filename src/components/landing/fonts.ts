import { Instrument_Sans, Poppins } from 'next/font/google'

// Titulares y logotipo: sans geométrica de trazo grueso.
const displayFont = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-lp-display-loaded',
  display: 'swap',
})

// Cuerpo: grotesca ligeramente condensada, contrasta con la anchura de los titulares.
const bodyFont = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-lp-body-loaded',
  display: 'swap',
})

/** Clases que declaran las fuentes; solo las lleva el contenedor de la portada. */
export const LANDING_FONT_VARIABLES = `${displayFont.variable} ${bodyFont.variable}`
