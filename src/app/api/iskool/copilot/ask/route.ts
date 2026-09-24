import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { InputSanitizer } from '@/lib/security/inputSanitizer';

/**
 * @route POST /api/iskool/copilot/ask
 * @description Procesa solicitudes en lenguaje natural del docente para el Teacher Copilot.
 * Genera planes de sesión, actividades diferenciadas, esquemas de evaluación o agrupaciones,
 * garantizando Human-in-the-Loop: todos los artefactos se crean con estado "draft" (borrador)
 * preservando la soberanía y criterio exclusivo del profesor.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherId = 'teacher_hs1_lead', courseId = 'course_hs1_eng_2026', sessionId, query } = body;

    // 1. Validación de parámetros requeridos
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'El parámetro "query" es obligatorio y debe contener la solicitud didáctica.' },
        { status: 400 }
      );
    }

    // 2. Sanitización perimetral de entrada
    const sanitized = InputSanitizer.sanitizeText(query);
    if (sanitized.hasInjectionAttempt) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'Solicitud descartada: Las directivas de gobernanza y el currículo oficial no pueden ser ignorados.',
        response: {
          intent: 'summary',
          summary: 'Como Asistente Pedagógico Institucional de iSchool, asisto exclusivamente en la gestión curricular oficial.',
          recommendations: ['Indique qué necesidad pedagógica desea atender (planeación, evaluación, agrupación o diferenciación).'],
          warnings: ['Intento de desvío o inyección neutralizado.'],
          resources: []
        },
        artifacts: []
      });
    }

    // 3. Resolver ID de sesión del docente
    const effectiveSessionId = sessionId || `copilot_sess_${teacherId}_${courseId}`;

    // 4. Procesar la petición mediante el orquestador
    const result = await IskoolCore.Copilot.processRequest(effectiveSessionId, sanitized.cleanText);

    // 5. Retornar respuesta estructurada con artefactos en estado borrador
    return NextResponse.json({
      success: true,
      sessionId: effectiveSessionId,
      teacherId,
      courseId,
      interactionId: result.interaction_id,
      response: result.response,
      artifacts: result.generated_artifacts,
      human_in_the_loop: {
        status: 'draft_pending_review',
        requires_teacher_approval: true
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error procesando solicitud del Teacher Copilot', details: err.message },
      { status: 500 }
    );
  }
}
