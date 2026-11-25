// Límite propio del camino de teclado: el borrado es automático, así que se
// acota cuántas solicitudes por teclado puede entregar una misma IP.
// Vive fuera de la ruta porque un archivo de ruta solo puede exportar sus manejadores.

export const KEYBOARD_LIMIT = 3
export const KEYBOARD_WINDOW_MS = 60 * 60_000

const keyboardTracker = new Map<string, { count: number; resetAtMs: number }>()

/** Cuenta un envío por teclado de `ip`; devuelve `false` a partir del que rebasa el límite. */
export function checkKeyboardLimit(ip: string, now: number = Date.now()): boolean {
  for (const [key, entry] of keyboardTracker) if (entry.resetAtMs <= now) keyboardTracker.delete(key)
  const entry = keyboardTracker.get(ip)
  if (!entry) {
    keyboardTracker.set(ip, { count: 1, resetAtMs: now + KEYBOARD_WINDOW_MS })
    return true
  }
  entry.count += 1
  return entry.count <= KEYBOARD_LIMIT
}

/** Solo para pruebas. */
export function __resetKeyboardLimit(): void {
  keyboardTracker.clear()
}
