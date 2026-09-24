import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { InputSanitizer } from '@/lib/security/inputSanitizer';

/**
 * @route POST /api/iskool/tutor/chat
 * @description Procesa un turno de tutoría socrática individual con el AI Tutor.
 * Aplica inspección de seguridad de contenido, defensas contra inyección de prompts,
 * resolución determinista de contexto pedagógico y protección estricta Zero PII.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, studentId, grade = 'high_school_1', message } = body;

    // 1. Validación de parámetros requeridos
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El parámetro "message" es obligatorio y debe ser texto válido.' },
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
    const effectiveStudentId = session ? session.student_id : (studentId || 'std_anonymous');

    if (!session) {
      // Iniciar sesión nueva guiada por el objetivo de la lección
      session = IskoolCore.Tutor.startSession({
        studentId: effectiveStudentId,
        primaryLearningOutcome: 'Express and defend viewpoints using formal connectors',
        knowledgeTargetIds: ['node_hs1_spk_opinion_01']
      });
      await IskoolCore.Tutor.saveSession(session);
    }

    // 5. Cargar perfil académico adaptativo y competencias (Zero PII)
    const profile = await IskoolCore.Adaptive.getProfile(effectiveStudentId, grade);
    const comps = await IskoolCore.Adaptive.getCompetenciesMap(effectiveStudentId);

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
      { error: 'Error procesando turno de tutoría socrática', details: err.message },
      { status: 500 }
    );
  }
}
