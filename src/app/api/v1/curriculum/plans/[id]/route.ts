import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader, TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';

/**
 * Endpoint REST: /api/v1/curriculum/plans/[id]
 * Resuelve una planeación individual aplicando la herencia contextual del Tenant.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const headerTenantId = req.headers.get('x-tenant-id');
    const expectedTenant = resolveTenantFromHostOrHeader({ host, headerTenantId });

    const authResult = await validateApiAuth(req, { expectedTenant });
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al detalle de la planeación.' },
        { status: 401 }
      );
    }

    const tenantId = (authResult.user.tenant_id || expectedTenant) as TenantId;
    const plan = await CurriculumFederationService.resolvePlan(id, tenantId);

    if (!plan) {
      return NextResponse.json(
        { error: `Planeación '${id}' no encontrada en el catálogo institucional.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: tenantId,
      plan
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error resolviendo la planeación solicitada.' },
      { status: 500 }
    );
  }
}
