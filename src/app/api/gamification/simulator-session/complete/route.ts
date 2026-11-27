import { NextRequest, NextResponse } from 'next/server';
import {
  verifyGameSessionToken,
  consumedSessionsCache,
  validateGameTelemetry
} from '@/lib/gameSecurity';
import { SimulatorGamificationAdapter } from '@/services/simulatorGamificationAdapter';
import { broadcastTeacherMilestone } from '@/lib/teacherMilestoneBroadcaster';
import { validateApiAuth } from '@/lib/authValidator';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Finalización Segura de Simulador / Juego.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acreditar sesión de simulador.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Cuerpo JSON inválido o malformado.' },
        { status: 400 }
      );
    }
    const { sessionToken, score, durationMs, timeSpentSeconds, interactionCount, userActions } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Falta el token criptográfico de sesión (sessionToken requerido)' },
        { status: 400 }
      );
    }

    // 1. Verificación criptográfica del token, su expiración y coherencia de datos
    const verification = verifyGameSessionToken(sessionToken);
    if (!verification.isValid || !verification.payload) {
      return NextResponse.json(
        {
          error: verification.error || 'Token criptográfico inválido o manipulado',
          code: 'INVALID_SIGNATURE'
        },
        { status: 401 }
      );
    }

    const { payload } = verification;
    if ((auth.user.role || '').toLowerCase() === 'student' && payload.studentId !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado: el token de simulador pertenece a otro alumno.' },
        { status: 403 }
      );
    }

    // 2. Filtro Anti-Macro básico: Rechazar si durationMs es menor a 10 segundos (10,000 ms)
    const effectiveDurationMs = typeof durationMs === 'number'
      ? durationMs
      : (typeof timeSpentSeconds === 'number' ? timeSpentSeconds * 1000 : 0);

    if (effectiveDurationMs < 10000) {
      return NextResponse.json(
        {
          error: 'Rechazado por filtro anti-macro: La duración de juego es menor a 10 segundos requeridos.',
          code: 'DURATION_TOO_SHORT',
          details: { durationMs: effectiveDurationMs, minRequiredMs: 10000 }
        },
        { status: 403 }
      );
    }

    // 3. Comprobar si la sesión ya fue consumida previamente (Prevención de Replay Attacks)
    if (consumedSessionsCache.isConsumed(payload.sessionId)) {
      return NextResponse.json(
        { 
          error: 'Ataque de repetición detectado: Esta sesión de juego ya fue consumida y revocada.',
          code: 'REPLAY_ATTACK_DETECTED'
        },
        { status: 409 }
      );
    }

    // 4. Validación de Telemetría Biológicamente Plausible
    const effectiveTimeSpentSeconds = effectiveDurationMs / 1000;
    const telemetryValidation = validateGameTelemetry(
      {
        durationMs: effectiveDurationMs,
        timeSpentSeconds: effectiveTimeSpentSeconds,
        interactionCount: Number(interactionCount) || 0,
        userActions: Array.isArray(userActions) ? userActions : undefined
      },
      payload.difficulty
    );

    // Si el tiempo es insuficiente o la telemetría es inválida, se rechaza sin consumir la sesión
    // permitiendo al estudiante seguir jugando hasta alcanzar el aprendizaje requerido
    if (!telemetryValidation.isValid) {
      return NextResponse.json(
        {
          error: telemetryValidation.message,
          code: telemetryValidation.code,
          details: {
            durationMs: effectiveDurationMs,
            timeSpentSeconds: effectiveTimeSpentSeconds,
            interactionCount: Number(interactionCount) || 0,
            calculatedCps: telemetryValidation.calculatedCps
          }
        },
        { status: 403 }
      );
    }

    // 4. Consumir y revocar la sesión ÚNICAMENTE tras validar la telemetría con éxito
    const canConsume = consumedSessionsCache.consume(payload.sessionId);
    if (!canConsume) {
      return NextResponse.json(
        { 
          error: 'Ataque de repetición detectado: La sesión fue consumida concurrentemente.',
          code: 'REPLAY_ATTACK_DETECTED'
        },
        { status: 409 }
      );
    }

    // 5. Cálculo de Recompensas Autorizadas por el Servidor
    const verifiedScore = Math.min(100, Math.max(0, Number(score) || 100));
    const descriptor = SimulatorGamificationAdapter.getSimulator(payload.simulatorId || 'sim-circuits-v1');

    const performanceFactor = Math.max(0.2, verifiedScore / 100);
    const studentXp = Math.round(descriptor.xpBaseReward * performanceFactor);
    const studentCoins = Math.round(descriptor.coinsBaseReward * performanceFactor);

    // 6. Emisión de Hito Pedagógico en Tiempo Real hacia el Teacher Social Loop
    try {
      broadcastTeacherMilestone({
        schoolId: auth.user.school_id,
        teacherId: payload.teacherId,
        studentId: payload.studentId,
        studentName: `Alumno ${payload.studentId.substring(0, 7)}`,
        milestoneType: verifiedScore >= 90 ? 'simulator_mastered' : 'quest_completed',
        title: descriptor.name,
        score: verifiedScore,
        xpEarned: studentXp,
        coinsEarned: studentCoins,
        teacherKarmaReward: 2,
        teacherXpReward: 5,
        message: `🧪 Simulación completada y verificada: "${descriptor.name}" (${descriptor.provider}) con ${verifiedScore}% de desempeño en ${Math.round(effectiveTimeSpentSeconds)}s.`
      });
    } catch (sseErr) {
      console.warn('Aviso notificando Teacher Social Loop desde endpoint seguro:', sseErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      verifiedScore,
      studentEarned: {
        xp: studentXp,
        coins: studentCoins
      },
      teacherEarned: {
        xp: 5,
        karma: 2
      },
      sessionId: payload.sessionId,
      consumedAt: Date.now(),
      telemetrySummary: {
        durationMs: effectiveDurationMs,
        timeSpentSeconds: effectiveTimeSpentSeconds,
        interactionCount: Number(interactionCount),
        cps: telemetryValidation.calculatedCps
      }
    });
  } catch (error: any) {
    console.error('Error procesando canje seguro de simulador:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor procesando la sesión de juego',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message } : {})
      },
      { status: 500 }
    );
  }
}
