import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { validateApiAuth } from '@/lib/authValidator';

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Autenticación requerida para acceder al Copiloto Pedagógico.' }, { status: 401 });
    }

    const body = await req.json();
    const { teacherId, sessionId, query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'El parámetro "query" es obligatorio' },
        { status: 400 }
      );
    }

    const effectiveSessionId = sessionId || `copilot_sess_${teacherId || 'tch_general'}_${Date.now()}`;
    const result = await IskoolCore.Copilot.processRequest(effectiveSessionId, query);

    return NextResponse.json({
      success: true,
      sessionId: effectiveSessionId,
      response: result.response,
      interactionId: result.interaction_id,
      artifacts: result.generated_artifacts
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error procesando consulta del Teacher Copilot', details: err.message },
      { status: 500 }
    );
  }
}
