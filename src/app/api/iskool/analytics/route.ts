import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { validateApiAuth } from '@/lib/authValidator';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Autenticación requerida para acceder a métricas analíticas.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const metricParam = searchParams.get('metric') || 'executive_summary';
    const scopeType = (searchParams.get('scopeType') || 'grade') as 'grade' | 'group' | 'course' | 'student';
    const scopeId = searchParams.get('scopeId') || 'high_school_1';

    const validMetrics = ['executive_summary', 'skill_mastery', 'curriculum_bottlenecks', 'instruction_gap', 'group_health'];
    const metric = validMetrics.includes(metricParam)
      ? (metricParam as any)
      : 'executive_summary';

    const data = await IskoolCore.Analytics.query({
      metric,
      scopeType,
      scopeId
    });

    return NextResponse.json({ success: true, metric, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error recuperando datos analíticos', details: err.message },
      { status: 500 }
    );
  }
}
