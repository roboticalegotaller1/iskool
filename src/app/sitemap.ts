import type { MetadataRoute } from 'next';

/** Páginas públicas de iskool.mx anunciadas a los buscadores (robots.ts ya apunta aquí). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: 'https://iskool.mx/',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://iskool.mx/privacidad',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://iskool.mx/terminos',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
