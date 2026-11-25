// Límite propio del camino de teclado: el borrado es automático, así que se
// acota cuántas solicitudes por teclado puede entregar una misma IP.
// Solo cuentan las entregas exitosas: un intento que falla al enviar el correo (502/503)
// no gasta el cupo de quien reintenta.
// Vive fuera de la ruta porque un archivo de ruta solo puede exportar sus manejadores.

export const KEYBOARD_LIMIT = 3
export const KEYBOARD_WINDOW_MS = 60 * 60_000

const keyboardTracker = new Map<string, { count: number; resetAtMs: number }>()

function limpiarVencidos(now: number): void {
  for (const [key, entry] of keyboardTracker) if (entry.resetAtMs <= now) keyboardTracker.delete(key)
}

/** `true` si `ip` ya entregó el máximo de solicitudes por teclado en la ventana vigente. No cuenta nada. */
export function isKeyboardLimited(ip: string, now: number = Date.now()): boolean {
  limpiarVencidos(now)
  const entry = keyboardTracker.get(ip)
  return entry !== undefined && entry.count >= KEYBOARD_LIMIT
}

/** Registra una entrega por teclado exitosa de `ip`. Llamar solo después de enviar el correo. */
export function recordKeyboardDelivery(ip: string, now: number = Date.now()): void {
  limpiarVencidos(now)
  const entry = keyboardTracker.get(ip)
  if (!entry) keyboardTracker.set(ip, { count: 1, resetAtMs: now + KEYBOARD_WINDOW_MS })
  else entry.count += 1
}

/** Solo para pruebas. */
export function __resetKeyboardLimit(): void {
  keyboardTracker.clear()
}
