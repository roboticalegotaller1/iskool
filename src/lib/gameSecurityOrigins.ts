/**
 * @file gameSecurityOrigins.ts
 * @description Constantes y validación de orígenes autorizados para simuladores y juegos.
 * Seguro para importar tanto en componentes de cliente ('use client') como en el servidor.
 */

export const ALLOWED_SIMULATOR_ORIGINS: readonly string[] = Object.freeze([
  'https://phet.colorado.edu',
  'https://www.geogebra.org',
  'https://geogebra.org',
  'https://www.desmos.com',
  'https://desmos.com',
  'https://falstad.com',
  'https://www.falstad.com',
  'https://wokwi.com',
  'https://www.wokwi.com',
  'https://tinkercad.com',
  'https://www.tinkercad.com'
]);

/**
 * Valida si un origen dado pertenece a los orígenes autorizados
 * (mismo origen local, subdominios institucionales o lista blanca oficial).
 */
export function isAllowedSimulatorOrigin(origin: string, localOrigin?: string): boolean {
  if (!origin || typeof origin !== 'string') return false;

  // 1. Mismo origen local (Next.js host actual)
  if (localOrigin && origin === localOrigin) {
    return true;
  }

  // 2. Comprobar dominios oficiales autorizados
  if (ALLOWED_SIMULATOR_ORIGINS.includes(origin)) {
    return true;
  }

  // 3. Subdominios institucionales seguros o localhost en desarrollo
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
    if (url.hostname.endsWith('.iskool.edu.mx') || url.hostname === 'iskool.edu.mx') {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
