import type { MetadataRoute } from 'next';

/** Páginas públicas de iskool.mx anunciadas a los buscadores (robots.ts ya apunta aquí). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://iskool.mx/' },
    { url: 'https://iskool.mx/privacidad' },
    { url: 'https://iskool.mx/terminos' },
  ];
}
