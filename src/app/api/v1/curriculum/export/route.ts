import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const CURRICULUM_CACHE_CONTROL = 'private, max-age=60, stale-while-revalidate=300';
const EXPORT_STAFF_ROLES = new Set(['teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner', 'ceo']);

function matchesIfNoneMatch(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  const trimmed = ifNoneMatch.trim();
  if (trimmed === '*') return true;
  const normalize = (tag: string) => tag.trim().replace(/^W\//i, '');
  const target = normalize(etag);
  return trimmed.split(',').some((candidate) => normalize(candidate) === target);
}

/**
 * Endpoint REST: /api/v1/curriculum/export
 * Exporta un paquete curricular canónico, auditable y firmado en formato JSON.
 */

export async function GET(req: NextRequest) {
  try {
    // Autenticación Zero-Trust: validar credenciales directamente desde el token sin inferir tenant por Host
    const authResult = await validateApiAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para exportar contenidos curriculares.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const roleLower = (authResult.user.role || '').toLowerCase();
    if (!EXPORT_STAFF_ROLES.has(roleLower)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Solo personal docente o directivo puede exportar paquetes curriculares.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const tenantId = (authResult.user.tenant_id || 'iskool') as TenantId;
    const searchParams = req.nextUrl.searchParams;

    const filter = {
      subject_code: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      phase: searchParams.get('phase') ? parseInt(searchParams.get('phase')!, 10) : undefined
    };

    const curriculumPackage = await CurriculumFederationService.exportCurriculumPackage(tenantId, filter);
    const etag = `W/"${tenantId}-${curriculumPackage.package_checksum.slice(0, 24)}"`;
    const cacheHeaders = {
      'Cache-Control': CURRICULUM_CACHE_CONTROL,
      Vary: 'Cookie, Authorization',
      ETag: etag,
      'X-Curriculum-Checksum': curriculumPackage.package_checksum
    };

    if (matchesIfNoneMatch(req.headers.get('if-none-match'), etag)) {
      return new NextResponse(null, { status: 304, headers: cacheHeaders });
    }

    return NextResponse.json(curriculumPackage, {
      headers: {
        'Content-Type': 'application/json',
        ...cacheHeaders,
        'Content-Disposition': `attachment; filename="curriculum_${tenantId}_${Date.now()}.json"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error exportando paquete curricular.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
