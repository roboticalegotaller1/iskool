import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader, TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';
import { CreateOrExtendPlanInput, UserAuditContext } from '@/lib/curriculum/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';

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
 * Endpoint REST: /api/v1/curriculum/plans
 * Gestiona la consulta federada y la creación/extensión de planeaciones didácticas.
 */

export async function GET(req: NextRequest) {
  try {
    // Autenticación Zero-Trust: validar credenciales criptográficas directamente desde el token
    const authResult = await validateApiAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Autenticación requerida para consultar planeaciones curriculares.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // Extraer tenant estrictamente del token verificado (Zero-Trust)
    const tenantId = (authResult.user.tenant_id || 'iskool') as TenantId;
    const searchParams = req.nextUrl.searchParams;

    const filter = {
      subject_code: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      phase: searchParams.get('phase') ? parseInt(searchParams.get('phase')!, 10) : undefined,
      framework: searchParams.get('framework') || undefined,
      searchQuery: searchParams.get('q') || undefined
    };

    // Consulta federada con resolución de Overlays
    const plans = await CurriculumFederationService.getPlansForTenant(tenantId, filter);
    const payload = {
      success: true,
      tenant: tenantId,
      total: plans.length,
      plans
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
      { error: err.message || 'Error consultando catálogo de planeaciones.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Autenticación requerida para registrar planeaciones.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // Solo directores, coordinadores y docentes pueden registrar/extender planeaciones
    const allowedRoles = ['teacher', 'coordinator', 'director', 'superadmin', 'admin', 'owner'];
    if (!allowedRoles.includes(authResult.user.role || '')) {
      return NextResponse.json(
        { error: 'Acceso denegado: El rol de usuario no tiene permisos para crear o modificar planeaciones.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const body: CreateOrExtendPlanInput = await req.json().catch(() => null);
    if (!body || !body.title || !body.subject_code || !body.sessions || !body.evaluation_rubric) {
      return NextResponse.json(
        { error: 'Datos incompletos: title, subject_code, sessions y evaluation_rubric son obligatorios.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const userContext: UserAuditContext = {
      user_id: authResult.user.id,
      name: `${authResult.user.first_name || ''} ${authResult.user.last_name || ''}`.trim() || 'Docente Titular',
      email: authResult.user.email || 'docente@institucion.mx',
      role: authResult.user.role || 'teacher',
      tenant_id: (authResult.user.tenant_id || 'iskool') as TenantId
    };

    if (
      isDemoSandboxContext({
        email: userContext.email,
        schoolId: authResult.user.school_id,
        userId: userContext.user_id,
        tenantId: userContext.tenant_id,
      })
    ) {
      const eph = recordEphemeralVaultItem('planning', {
        actorEmail: userContext.email,
        title: body.title,
        payload: { subject_code: body.subject_code },
      });
      return NextResponse.json(
        {
          success: true,
          demoSandbox: true,
          persistedInVault: false,
          message: 'Modo Demo Sandbox: planeación simulada en memoria sin guardar en Bóveda Curricular.',
          plan: {
            id: eph.id,
            ...body,
            created_at: new Date().toISOString(),
          },
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    const savedPlan = await CurriculumFederationService.saveOrExtendPlan(body, userContext);

    return NextResponse.json(
      {
        success: true,
        message: savedPlan.is_custom_overlay
          ? 'Planeación personalizada registrada exitosamente en el namespace de IBIME.'
          : 'Planeación registrada exitosamente.',
        plan: savedPlan
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    const status = err.name === 'PedagogicalPrivacyViolationError' ? 422 : 500;
    return NextResponse.json(
      { error: err.message || 'Error registrando planeación curricular.' },
      { status, headers: NO_STORE_HEADERS }
    );
  }
}
