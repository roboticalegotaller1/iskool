import type { DemoChallenge } from './challenge'

// Busca en el navegador el número secreto del pase: el que cumple
// sha256(salt + número) === challenge. Corre por lotes y cede el hilo entre
// uno y otro para que la página siga respondiendo mientras la persona borra.

const LOTE = 500

const cederHilo = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

function aHex(buffer: ArrayBuffer): string {
  let hex = ''
  for (const byte of new Uint8Array(buffer)) hex += byte.toString(16).padStart(2, '0')
  return hex
}

function cancelado(): Error {
  return new Error('Búsqueda del pase cancelada')
}

export async function solveChallenge(c: DemoChallenge, signal?: AbortSignal): Promise<number> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error('El navegador no puede calcular el pase')
  const codificador = new TextEncoder()
  const buscado = c.challenge.toLowerCase()

  for (let inicio = 0; inicio <= c.max; inicio += LOTE) {
    if (signal?.aborted) throw cancelado()
    const fin = Math.min(c.max, inicio + LOTE - 1)
    const numeros: number[] = []
    for (let n = inicio; n <= fin; n++) numeros.push(n)
    const hashes = await Promise.all(numeros.map((n) => subtle.digest('SHA-256', codificador.encode(c.salt + String(n)))))
    for (let i = 0; i < hashes.length; i++) if (aHex(hashes[i]) === buscado) return numeros[i]
    await cederHilo()
  }
  if (signal?.aborted) throw cancelado()
  throw new Error('No se encontró el número del pase')
}
