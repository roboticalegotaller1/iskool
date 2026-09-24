import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';

/**
 * @route GET /api/iskool/analytics/group
 * @description Genera la radiografía pedagógica de un grupo escolar específico.
 * Computa de forma determinista la cobertura curricular impartida, el dominio real
 * acumulado (Knowledge Mastery), la brecha de instrucción (Instruction-Mastery Gap)
 * y los cuellos de botella formativos que requieren intervención docente inmediata.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'group_hs1_a';
    const grade = searchParams.get('grade') || 'high_school_1';

    // 1. Ejecutar consultas analíticas deterministas en paralelo
    const [summary, bottlenecks, instructionGap] = await Promise.all([
      IskoolCore.Analytics.query({
        metric: 'executive_summary',
        scopeType: 'group',
        scopeId: groupId
      }),
      IskoolCore.Analytics.query({
        metric: 'curriculum_bottlenecks',
        scopeType: 'group',
        scopeId: groupId
      }),
      IskoolCore.Analytics.query({
        metric: 'instruction_gap',
        scopeType: 'group',
        scopeId: groupId
      })
    ]);

    // 2. Retornar radiografía integral de grupo
    return NextResponse.json({
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
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error generando radiografía analítica de grupo', details: err.message },
      { status: 500 }
    );
  }
}
