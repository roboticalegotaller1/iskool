import { Poppins } from 'next/font/google'

// Solo la lleva el logotipo: `className` se aplica a su texto y no declara variables globales.
const wordmarkFont = Poppins({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
})

export const WORDMARK_FONT_CLASS = wordmarkFont.className
