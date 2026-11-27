import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const CURRICULUM_CACHE_CONTROL = 'private, max-age=60, stale-while-revalidate=300';

function matchesIfNoneMatch(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  const trimmed = ifNoneMatch.trim();
  if (trimmed === '*') return true;
  const normalize = (tag: string) => tag.trim().replace(/^W\//i, '');
  const target = normalize(etag);
  return trimmed.split(',').some((candidate) => normalize(candidate) === target);
}

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

    // Autenticación Zero-Trust: validar credenciales directamente desde el token sin inferir tenant por Host
    const authResult = await validateApiAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al detalle de la planeación.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const tenantId = (authResult.user.tenant_id || 'iskool') as TenantId;
    const plan = await CurriculumFederationService.resolvePlan(id, tenantId);

    if (!plan) {
      return NextResponse.json(
        { error: `Planeación '${id}' no encontrada en el catálogo institucional.` },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    const payload = {
      success: true,
      tenant: tenantId,
      plan
    };
    const bodyJson = JSON.stringify(payload);
    const etag = `W/"${crypto.createHash('sha256').update(bodyJson).digest('base64url').slice(0, 22)}"`;
    const cacheHeaders = {
      'Cache-Control': CURRICULUM_CACHE_CONTROL,
      Vary: 'Cookie, Authorization',
      ETag: etag
    };

    if (matchesIfNoneMatch(req.headers.get('if-none-match'), etag)) {
      return new NextResponse(null, { status: 304, headers: cacheHeaders });
    }

    return new NextResponse(bodyJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...cacheHeaders
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error resolviendo la planeación solicitada.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
