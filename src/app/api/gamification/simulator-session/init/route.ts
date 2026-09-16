import { NextRequest, NextResponse } from 'next/server';
import { createGameSessionToken, getMinimumPlausibleTime } from '@/lib/gameSecurity';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Handshake Criptográfico para Simuladores y Juegos.
 * Genera un token efímero firmado con HMAC-SHA256 y un Nonce aleatorio único.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, simulatorId, difficulty, teacherId } = body;

    if (!studentId || !simulatorId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: studentId y simulatorId' },
        { status: 400 }
      );
    }

    // Generar token firmado con Nonce y SessionId
    const { token, payload } = createGameSessionToken({
      studentId: String(studentId),
      simulatorId: String(simulatorId),
      difficulty: difficulty ? String(difficulty) : 'medium',
      teacherId: teacherId ? String(teacherId) : undefined
    });

    const minTimeSpentSeconds = getMinimumPlausibleTime(payload.difficulty);

    return NextResponse.json({
      success: true,
      sessionToken: token,
      sessionId: payload.sessionId,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      minTimeSpentSeconds,
      difficulty: payload.difficulty
    });
  } catch (error: any) {
    console.error('Error inicializando sesión de simulador:', error);
    return NextResponse.json(
      { error: 'Error interno generando sesión criptográfica', details: error.message },
      { status: 500 }
    );
  }
}
