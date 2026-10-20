import type { MetadataRoute } from 'next';

/**
 * Directivas de indexación SEO para ISkool.
 * - En iskool.mx: Permite indexar la portada comercial e institucional y los enlaces legales (/privacidad, /terminos).
 * - En app.iskool.mx: Toda la aplicación privada y portales escolares quedan protegidos con noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/student',
          '/teacher',
          '/parent',
          '/coordinator',
          '/admin',
          '/director',
          '/portal-ceo',
          '/superadmin',
          '/superuser',
          '/api/',
          '/login',
          '/ibime/',
          '/checkout',
          '/pay',
        ],
        allow: [
          '/',
          '/privacidad',
          '/terminos',
          '/politica-de-privacidad',
          '/condiciones-del-servicio',
          '/promo',
        ],
      },
      {
        userAgent: 'Googlebot',
        disallow: [
          '/student',
          '/teacher',
          '/parent',
          '/coordinator',
          '/admin',
          '/director',
          '/portal-ceo',
          '/superadmin',
          '/superuser',
          '/api/',
          '/login',
          '/ibime/',
          '/checkout',
          '/pay',
        ],
        allow: [
          '/',
          '/privacidad',
          '/terminos',
          '/politica-de-privacidad',
          '/condiciones-del-servicio',
          '/promo',
        ],
      },
    ],
    sitemap: 'https://iskool.mx/sitemap.xml',
  };
}
