import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { validateApiAuth } from '@/lib/authValidator';

/**
 * @route GET /api/iskool/analytics/group
 * @description Genera la radiografía pedagógica de un grupo escolar específico.
 * Computa de forma determinista la cobertura curricular impartida, el dominio real
 * acumulado (Knowledge Mastery), la brecha de instrucción (Instruction-Mastery Gap)
 * y los cuellos de botella formativos que requieren intervención docente inmediata.
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const PRIVATE_SHORT_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
  Vary: 'Cookie, Authorization'
};

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder a la radiografía de grupo.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }
    if (!['teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner', 'ceo'].includes((auth.user.role || '').toLowerCase())) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para consultar analítica de grupo.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'group_hs1_a';
    const grade = searchParams.get('grade') || 'high_school_1';

    // 1. Ejecutar consulta analítica consolidada en un solo pase (sin llamadas redundantes)
    const { summary, bottlenecks, instructionGap } = await IskoolCore.Analytics.queryGroupBundle(groupId);

    // 2. Retornar radiografía integral de grupo
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        groupId,
        grade,
        executive_summary: summary,
        curriculum_bottlenecks: bottlenecks,
        instruction_gap: instructionGap,
        pedagogical_diagnostics: {
          healthy: (instructionGap as any)?.gap_percentage !== undefined ? (instructionGap as any).gap_percentage < 15 : true,
          recommended_action: 'Programar sesión de consolidación focalizada en speaking para resolver el cuello de botella detectado.'
        }
      },
      { headers: PRIVATE_SHORT_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Error generando radiografía analítica de grupo',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
