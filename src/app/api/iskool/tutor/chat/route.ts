import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { InputSanitizer } from '@/lib/security/inputSanitizer';
import { validateApiAuth } from '@/lib/authValidator';
import { checkRouteRateLimit, extractClientRateLimitKey } from '@/lib/security/routeRateLimit';

const MAX_TUTOR_MESSAGE_CHARS = 4000;
const MAX_TUTOR_ID_CHARS = 128;

/**
 * @route POST /api/iskool/tutor/chat
 * @description Procesa un turno de tutoría socrática individual con el AI Tutor.
 * Aplica inspección de seguridad de contenido, defensas contra inyección de prompts,
 * resolución determinista de contexto pedagógico y protección estricta Zero PII.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al Tutor Pedagógico Institucional' },
        { status: 401 }
      );
    }

    const rateCheck = checkRouteRateLimit('iskool:tutor:chat', extractClientRateLimitKey(req, auth.user.id), 30, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Límite de turnos por minuto alcanzado en el Tutor Pedagógico.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Cuerpo JSON inválido o malformado.' },
        { status: 400 }
      );
    }
    const { sessionId, studentId, grade = 'high_school_1', message } = body;
    const isStudent = (auth.user.role || '').toLowerCase() === 'student';
    if (isStudent && studentId && studentId !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para interactuar en nombre de otro estudiante.' },
        { status: 403 }
      );
    }

    // 1. Validación de parámetros requeridos y límites de carga
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El parámetro "message" es obligatorio y debe ser texto válido.' },
        { status: 400 }
      );
    }
    if (message.length > MAX_TUTOR_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `El mensaje excede el límite máximo de ${MAX_TUTOR_MESSAGE_CHARS} caracteres.` },
        { status: 400 }
      );
    }
    if (
      (typeof sessionId === 'string' && sessionId.length > MAX_TUTOR_ID_CHARS) ||
      (typeof studentId === 'string' && studentId.length > MAX_TUTOR_ID_CHARS) ||
      (typeof grade === 'string' && grade.length > 64)
    ) {
      return NextResponse.json(
        { error: 'Uno o más identificadores de sesión exceden la longitud permitida.' },
        { status: 400 }
      );
    }

    if (!sessionId && !studentId) {
      return NextResponse.json(
        { error: 'Debe especificarse al menos "sessionId" o "studentId" para identificar la interacción.' },
        { status: 400 }
      );
    }

    // 2. Sanitización perimetral de entrada (Anti-XSS y detección heurística de inyecciones)
    const sanitized = InputSanitizer.sanitizeText(message);
    if (sanitized.hasInjectionAttempt) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'Intento de desvío o inyección de prompt neutralizado por el Motor de IA Pedagógica.',
        tutor_response: 'Mi objetivo como tu Tutor iSkool es guiarte paso a paso en tu aprendizaje. Por favor comparte tu opinión o responde a la pregunta de nuestra clase de inglés.'
      });
    }

    // 3. Inspección de seguridad de contenido institucional (Content Safety)
    const safetyCheck = IskoolCore.Gateway.inspectContentSafety(sanitized.cleanText, {
      grade,
      isStudentChat: true
    });

    if (!safetyCheck.safe) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: safetyCheck.reason,
        requires_teacher_escalation: safetyCheck.requires_teacher_escalation,
        tutor_response: 'Mensaje no procesable por motivos de seguridad escolar institucional. Se ha notificado a tu profesor.'
      });
    }

    // 4. Obtención o inicialización de la sesión pedagógica
    let session = sessionId ? await IskoolCore.Tutor.getSession(sessionId) : null;
    if (isStudent && session && session.student_id !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a la sesión de tutoría de otro estudiante.' },
        { status: 403 }
      );
    }
    const effectiveStudentId = isStudent
      ? auth.user.id
      : (session ? session.student_id : (studentId || 'std_anonymous'));
    let isNewSession = false;

    if (!session) {
      // Iniciar sesión nueva guiada por el objetivo de la lección
      session = IskoolCore.Tutor.startSession({
        studentId: effectiveStudentId,
        primaryLearningOutcome: 'Express and defend viewpoints using formal connectors',
        knowledgeTargetIds: ['node_hs1_spk_opinion_01']
      });
      isNewSession = true;
    }

    // 5. Cargar perfil académico adaptativo y competencias en paralelo (Zero PII)
    const [profile, comps] = await Promise.all([
      IskoolCore.Adaptive.getProfile(effectiveStudentId, grade),
      IskoolCore.Adaptive.getCompetenciesMap(effectiveStudentId),
      isNewSession ? IskoolCore.Tutor.saveSession(session) : Promise.resolve()
    ]);

    // 6. Ejecutar el turno conversacional socrático
    const result = await IskoolCore.Tutor.processTurn(session, sanitized.cleanText, profile, comps);
    await IskoolCore.Tutor.saveSession(result.session);

    // 7. Retornar respuesta filtrada y segura
    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      studentId: effectiveStudentId,
      turn: result.output,
      session_state: {
        scaffolding_level: result.session.scaffolding_level,
        turn_count: result.session.conversation_state?.questions_attempted || 1,
        mastery_demonstrated: result.session.conversation_state?.demonstrated_understanding || false
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Error procesando turno de tutoría socrática',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500 }
    );
  }
}
