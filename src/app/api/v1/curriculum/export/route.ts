import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader, TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';

/**
 * Endpoint REST: /api/v1/curriculum/export
 * Exporta un paquete curricular canónico, auditable y firmado en formato JSON.
 */

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const headerTenantId = req.headers.get('x-tenant-id');
    const expectedTenant = resolveTenantFromHostOrHeader({ host, headerTenantId });

    const authResult = await validateApiAuth(req, { expectedTenant });
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para exportar contenidos curriculares.' },
        { status: 401 }
      );
    }

    const tenantId = (authResult.user.tenant_id || expectedTenant) as TenantId;
    const searchParams = req.nextUrl.searchParams;

    const filter = {
      subject_code: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      phase: searchParams.get('phase') ? parseInt(searchParams.get('phase')!, 10) : undefined
    };

    const curriculumPackage = await CurriculumFederationService.exportCurriculumPackage(tenantId, filter);

    return NextResponse.json(curriculumPackage, {
      headers: {
        'Content-Type': 'application/json',
        'X-Curriculum-Checksum': curriculumPackage.package_checksum,
        'Content-Disposition': `attachment; filename="curriculum_${tenantId}_${Date.now()}.json"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error exportando paquete curricular.' },
      { status: 500 }
    );
  }
}
