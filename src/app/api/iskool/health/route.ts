import { NextRequest, NextResponse } from 'next/server';
import { HealthCheckService, ProductionReadinessReport } from '@/lib/observability/healthCheckService';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

const HEALTH_CACHE_TTL_MS = 15_000;
const HEALTH_PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  Vary: 'Cookie, Authorization'
};
const ALLOWED_HEALTH_ROLES = new Set(['superadmin', 'admin', 'ceo', 'director', 'owner']);

let cachedHealthReport: { report: ProductionReadinessReport; expiresAt: number } | null = null;

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para consultar el diagnóstico de salud.' },
        { status: 401, headers: HEALTH_PRIVATE_HEADERS }
      );
    }

    const roleLower = (auth.user.role || '').toLowerCase();
    if (!isPlatformSuperUser(auth.user) && !ALLOWED_HEALTH_ROLES.has(roleLower)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requieren permisos directivos o administrativos para consultar diagnósticos.' },
        { status: 403, headers: HEALTH_PRIVATE_HEADERS }
      );
    }

    const now = Date.now();
    let report: ProductionReadinessReport;

    if (cachedHealthReport && cachedHealthReport.expiresAt > now) {
      report = cachedHealthReport.report;
    } else {
      report = await HealthCheckService.runFullCheck();
      if (report.overall_status === 'READY_FOR_PRODUCTION') {
        cachedHealthReport = { report, expiresAt: now + HEALTH_CACHE_TTL_MS };
      } else {
        cachedHealthReport = null;
      }
    }

    const status = report.overall_status === 'NOT_READY' ? 503 : 200;
    return NextResponse.json(report, {
      status,
      headers: HEALTH_PRIVATE_HEADERS
    });
  } catch (err: any) {
    cachedHealthReport = null;
    return NextResponse.json(
      {
        error: 'Error interno ejecutando diagnóstico de salud',
        ...(process.env.NODE_ENV !== 'production' ? { details: err?.message } : {})
      },
      { status: 500, headers: HEALTH_PRIVATE_HEADERS }
    );
  }
}
