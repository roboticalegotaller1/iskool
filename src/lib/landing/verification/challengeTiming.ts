// Tiempos del pase de la solicitud de demostración. Viven aparte, sin dependencias del servidor,
// para que el formulario del navegador los use sin arrastrar el módulo de criptografía.

export const CHALLENGE_TTL_MS = 30 * 60_000
export const MIN_FILL_MS = 3_000
