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
  'https://www.ophysics.com',
  'https://www.myphysicslab.com',
  'https://www.physicsclassroom.com',
  'https://www.walter-fendt.de',
  'https://graspablemath.com',
  'https://visualgo.net',
  'https://demonstrations.wolfram.com',
  'https://toytheater.com',
  'https://www.mathopenref.com',
  'https://embed.molview.org',
  'https://molview.org',
  'https://ptable.com',
  'https://chemcollective.org',
  'https://www.rcsb.org',
  'https://learn.genetics.utah.edu',
  'https://stellarium-web.org',
  'https://www.solarsystemscope.com',
  'https://earth.nullschool.net',
  'https://wokwi.com',
  'https://www.wokwi.com',
  'https://makecode.microbit.org',
  'https://arcade.makecode.com',
  'https://snap.berkeley.edu',
  'https://trinket.io',
  'https://musiclab.chromeexperiments.com',
  'https://www.chronas.org',
  'https://www.gapminder.org',
  'https://www.beepbox.co',
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
    if (url.hostname.endsWith('.iskool.mx') || url.hostname === 'iskool.mx' || url.hostname.endsWith('.iskool.edu.mx') || url.hostname === 'iskool.edu.mx') {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
