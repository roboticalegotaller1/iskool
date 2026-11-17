import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ISkool · Plataforma Académica Gamificada',
    short_name: 'ISkool',
    description:
      'Ecosistema escolar multi-plantel alineado con la Nueva Escuela Mexicana, Bóveda Curricular e Inteligencia Artificial Pedagógica.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d68ff',
    lang: 'es-MX',
    icons: [
      {
        src: '/brand/iskool-icono.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
