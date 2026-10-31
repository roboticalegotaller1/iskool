import { SUPPORT_EMAIL } from '@/components/PublicLanding'

// Único lugar a editar cuando cambien los datos de contacto.
export const SITE = {
  name: 'ISkool',
  teamName: 'ISkool Team',
  tagline: 'Inteligencia para instituciones educativas',
  url: 'https://iskool.mx',
  email: SUPPORT_EMAIL,
  // Con código de país, p. ej. '+52 55 0000 0000'. En null, el sitio no muestra el canal.
  whatsappNumber: null as string | null,
} as const

export const REGION = {
  placeName: 'México',
  adaptation: 'adaptada a las escuelas privadas de México',
  curriculum:
    'Alineada con la Nueva Escuela Mexicana: campos formativos, ejes articuladores y Procesos de Desarrollo de Aprendizaje.',
} as const
