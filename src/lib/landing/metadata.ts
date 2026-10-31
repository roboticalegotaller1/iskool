import type { Metadata } from 'next'
import { HOME } from '@/content/landing/home'
import { REGION, SITE } from '@/content/landing/site'

const HOME_URL = `${SITE.url}/`
const { title, description } = HOME.meta

// Imagen estática referida solo desde la portada: un archivo opengraph-image en app/ lo heredarían las demás rutas.
const SHARE_IMAGE = {
  url: `${SITE.url}/brand/iskool-og.png`,
  width: 1200,
  height: 630,
  alt: 'ISkool — El cerebro vivo de tu escuela',
}

export const landingMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: { canonical: HOME_URL },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'es_MX',
    url: HOME_URL,
    title,
    description,
    images: [SHARE_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
}

export const landingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: HOME_URL,
  logo: `${SITE.url}/brand/iskool-logo-web.png`,
  email: SITE.email,
  description,
  areaServed: REGION.placeName,
}
