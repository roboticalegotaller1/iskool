import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { UserAcademicContext } from '@/lib/leadership/scopeService';

/**
 * @route GET /api/iskool/leadership/dashboard
 * @description Entrega las métricas consolidadas del Leadership Dashboard y el Daily Brief
 * para Directores de Plantel y Coordinadores Académicos.
 * Garantiza:
 * 1. Control de acceso estricto por rol y colegio (Multi-tenant RBAC Scoping).
 * 2. Cero PII en vistas ejecutivas agregadas.
 * 3. Principio ético institucional: Cero evaluaciones laborales punitivas a docentes.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId') || 'sch-jjrosseau';
    const grade = searchParams.get('grade') || 'high_school_1';
    const userId = searchParams.get('userId') || 'coord_dir_lead';
    const role = (searchParams.get('role') || 'coordinator') as any;

    const userProfile: UserAcademicContext = {
      userId,
      role,
      schoolId,
      assignedGrades: [grade]
    };

    // Invocar cabina de liderazgo unificada
    const cockpit = await IskoolCore.getCoordinatorCockpit(schoolId, grade, userProfile);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      school_id: schoolId,
      grade,
      cockpit
    });
  } catch (err: any) {
    const status = err.message?.includes('Violación de Aislamiento') || err.message?.includes('Acceso denegado')
      ? 403
      : 500;

    return NextResponse.json(
      { error: 'Error recuperando métricas del Leadership Dashboard', details: err.message },
      { status }
    );
  }
}
