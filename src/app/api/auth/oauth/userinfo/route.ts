import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader } from '@/lib/auth/multiTenantSession';

/**
 * Endpoint OAuth 2.0 / OIDC: /api/auth/oauth/userinfo
 * Retorna los claims del usuario autenticado y sus metadatos de institución de forma hermética.
 */
export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const headerTenantId = req.headers.get('x-tenant-id');
    const expectedTenant = resolveTenantFromHostOrHeader({ host, headerTenantId });

    const authResult = await validateApiAuth(req, { expectedTenant });

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'No autorizado. Token inválido o ausente.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      sub: authResult.user.id,
      id: authResult.user.id,
      email: authResult.user.email,
      role: authResult.user.role,
      school_id: authResult.user.school_id,
      tenant_id: authResult.user.tenant_id,
      first_name: authResult.user.first_name,
      last_name: authResult.user.last_name,
      institution_metadata: authResult.user.institution_metadata
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error consultando información de usuario.' },
      { status: 500 }
    );
  }
}
