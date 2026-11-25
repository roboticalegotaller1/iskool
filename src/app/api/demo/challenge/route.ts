import { createChallenge } from '@/lib/landing/verification/challenge'

// Cada visita al formulario pide un pase nuevo; nunca debe servirse desde caché.
export const dynamic = 'force-dynamic'

export async function GET() {
  const challenge = createChallenge()
  if (!challenge) {
    console.error('Verificación del formulario no disponible: falta la clave de firma.')
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  return Response.json(challenge, { headers: { 'Cache-Control': 'no-store' } })
}
