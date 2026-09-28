import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader, TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';
import { CurriculumExportPackage, UserAuditContext } from '@/lib/curriculum/types';

/**
 * Endpoint REST: /api/v1/curriculum/import
 * Ingesta de forma hermética un paquete de planeaciones o rúbricas hacia el namespace
 * del Tenant receptor, con validación de integridad, sanitización PII y auditoría.
 */

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const headerTenantId = req.headers.get('x-tenant-id');
    const expectedTenant = resolveTenantFromHostOrHeader({ host, headerTenantId });

    const authResult = await validateApiAuth(req, { expectedTenant });
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para importar paquetes curriculares.' },
        { status: 401 }
      );
    }

    const allowedRoles = ['coordinator', 'director', 'superadmin', 'admin', 'owner'];
    if (!allowedRoles.includes(authResult.user.role || '')) {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requieren privilegios de coordinación o dirección académica para importar planes.' },
        { status: 403 }
      );
    }

    const pkg: CurriculumExportPackage = await req.json().catch(() => null);
    if (!pkg || !pkg.package_checksum || !Array.isArray(pkg.plans)) {
      return NextResponse.json(
        { error: 'Paquete curricular corrupto o malformado: package_checksum y plans son requeridos.' },
        { status: 400 }
      );
    }

    const userContext: UserAuditContext = {
      user_id: authResult.user.id,
      name: `${authResult.user.first_name || ''} ${authResult.user.last_name || ''}`.trim() || 'Coordinador Académico',
      email: authResult.user.email || 'coordinacion@institucion.mx',
      role: authResult.user.role || 'coordinator',
      tenant_id: (authResult.user.tenant_id || expectedTenant) as TenantId
    };

    const importResult = await CurriculumFederationService.importCurriculumPackage(pkg, userContext);

    return NextResponse.json({
      success: true,
      message: `Paquete curricular importado exitosamente en el namespace de ${userContext.tenant_id.toUpperCase()}.`,
      importedCount: importResult.importedCount,
      planIds: importResult.planIds
    }, { status: 201 });
  } catch (err: any) {
    const status = err.name === 'PedagogicalPrivacyViolationError' ? 422 : 400;
    return NextResponse.json(
      { error: err.message || 'Error durante la importación del paquete curricular.' },
      { status }
    );
  }
}
