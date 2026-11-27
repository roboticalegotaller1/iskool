import { NextRequest, NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';
import { UserAcademicContext } from '@/lib/leadership/scopeService';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

/**
 * @route GET /api/iskool/leadership/dashboard
 * @description Entrega las métricas consolidadas del Leadership Dashboard y el Daily Brief
 * para Directores de Plantel y Coordinadores Académicos.
 * Garantiza:
 * 1. Control de acceso estricto por rol y colegio (Multi-tenant RBAC Scoping).
 * 2. Cero PII en vistas ejecutivas agregadas.
 * 3. Principio ético institucional: Cero evaluaciones laborales punitivas a docentes.
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const PRIVATE_SHORT_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
  Vary: 'Cookie, Authorization'
};

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al Leadership Dashboard', code: 'UNAUTHORIZED' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const userRole = (authResult.user.role || '').toLowerCase();
    const isLeadershipRole = ['superadmin', 'admin', 'director', 'coordinator', 'coordinador', 'owner', 'ceo', 'teacher'].includes(userRole);
    if (!isLeadershipRole) {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requieren permisos de liderazgo o coordinación académica.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedSchoolId = searchParams.get('schoolId');
    const userSchoolId = authResult.user.school_id;
    const isSuperUser = isPlatformSuperUser(authResult.user);

    if (!isSuperUser && requestedSchoolId && requestedSchoolId !== userSchoolId) {
      return NextResponse.json(
        { error: 'Violación de Aislamiento: No tiene autorización para consultar métricas de otro plantel.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const effectiveSchoolId = isSuperUser
      ? (requestedSchoolId || userSchoolId || 'sch-jjrosseau')
      : (userSchoolId || 'sch-jjrosseau');

    const grade = searchParams.get('grade') || 'high_school_1';
    const effectiveUserId = authResult.user.id || 'coord_dir_lead';

    const userProfile: UserAcademicContext = {
      userId: effectiveUserId,
      role: (authResult.user.role as any) || 'coordinator',
      schoolId: effectiveSchoolId,
      assignedGrades: [grade]
    };

    // Invocar cabina de liderazgo unificada
    const cockpit = await IskoolCore.getCoordinatorCockpit(effectiveSchoolId, grade, userProfile);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        school_id: effectiveSchoolId,
        grade,
        cockpit
      },
      { headers: PRIVATE_SHORT_CACHE_HEADERS }
    );
  } catch (err: any) {
    const status = err.message?.includes('Violación de Aislamiento') || err.message?.includes('Acceso denegado')
      ? 403
      : 500;

    return NextResponse.json(
      {
        error: 'Error recuperando métricas del Leadership Dashboard',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status, headers: NO_STORE_HEADERS }
    );
  }
}
