import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sessionId, studentId, grade, targetKnowledgeId, primaryLearningOutcome, message } = body;

    // 1. Iniciar sesión nueva
    if (action === 'start') {
      if (!studentId || !targetKnowledgeId) {
        return NextResponse.json(
          { error: 'Faltan parámetros requeridos (studentId, targetKnowledgeId)' },
          { status: 400 }
        );
      }

      const session = IskoolCore.Tutor.startSession({
        studentId,
        primaryLearningOutcome: primaryLearningOutcome || 'Express personal opinions with reasons',
        knowledgeTargetIds: [targetKnowledgeId]
      });

      await IskoolCore.Tutor.saveSession(session);
      return NextResponse.json({ success: true, session });
    }

    // 2. Procesar turno del estudiante
    if (action === 'chat') {
      if (!sessionId || !message) {
        return NextResponse.json(
          { error: 'Faltan parámetros requeridos (sessionId, message)' },
          { status: 400 }
        );
      }

      // Inspección perimetral de seguridad de contenido
      const safetyCheck = IskoolCore.Gateway.inspectContentSafety(message, { grade: grade || 'high_school_1', isStudentChat: true });
      if (!safetyCheck.safe) {
        return NextResponse.json({
          success: false,
          blocked: true,
          reason: safetyCheck.reason,
          requires_teacher_escalation: safetyCheck.requires_teacher_escalation,
          tutor_response: 'Mensaje no procesable por motivos de seguridad institucional. Se ha notificado a tu docente.'
        });
      }

      const session = await IskoolCore.Tutor.getSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
      }

      const profile = await IskoolCore.Adaptive.getProfile(session.student_id, grade);
      const comps = await IskoolCore.Adaptive.getCompetenciesMap(session.student_id);

      const result = await IskoolCore.Tutor.processTurn(session, message, profile, comps);
      await IskoolCore.Tutor.saveSession(result.session);

      return NextResponse.json({ success: true, turn: result.output, session: result.session });
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error procesando solicitud del AI Tutor', details: err.message },
      { status: 500 }
    );
  }
}
