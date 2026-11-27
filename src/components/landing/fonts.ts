import localFont from 'next/font/local';
import { poppins } from '@/app/fonts';

export const instrumentSans = localFont({
  src: '../../../public/fonts/instrument-sans-latin.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  preload: true,
  variable: '--font-instrument-sans',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/** Clases que declaran las fuentes auto-hospedadas; solo las lleva el contenedor de la portada. */
export const LANDING_FONT_VARIABLES = `lp-fonts-ready ${instrumentSans.variable} ${poppins.variable}`;
