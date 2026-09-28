import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveTenantFromHostOrHeader, TenantId } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';
import { CreateOrExtendPlanInput, UserAuditContext } from '@/lib/curriculum/types';

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
        { status: 401 }
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

    return NextResponse.json({
      success: true,
      tenant: tenantId,
      total: plans.length,
      plans
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error consultando catálogo de planeaciones.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Autenticación requerida para registrar planeaciones.' },
        { status: 401 }
      );
    }

    // Solo directores, coordinadores y docentes pueden registrar/extender planeaciones
    const allowedRoles = ['teacher', 'coordinator', 'director', 'superadmin', 'admin', 'owner'];
    if (!allowedRoles.includes(authResult.user.role || '')) {
      return NextResponse.json(
        { error: 'Acceso denegado: El rol de usuario no tiene permisos para crear o modificar planeaciones.' },
        { status: 403 }
      );
    }

    const body: CreateOrExtendPlanInput = await req.json().catch(() => null);
    if (!body || !body.title || !body.subject_code || !body.sessions || !body.evaluation_rubric) {
      return NextResponse.json(
        { error: 'Datos incompletos: title, subject_code, sessions y evaluation_rubric son obligatorios.' },
        { status: 400 }
      );
    }

    const userContext: UserAuditContext = {
      user_id: authResult.user.id,
      name: `${authResult.user.first_name || ''} ${authResult.user.last_name || ''}`.trim() || 'Docente Titular',
      email: authResult.user.email || 'docente@institucion.mx',
      role: authResult.user.role || 'teacher',
      tenant_id: (authResult.user.tenant_id || 'iskool') as TenantId
    };

    const savedPlan = await CurriculumFederationService.saveOrExtendPlan(body, userContext);

    return NextResponse.json({
      success: true,
      message: savedPlan.is_custom_overlay
        ? 'Planeación personalizada registrada exitosamente en el namespace de IBIME.'
        : 'Planeación registrada exitosamente.',
      plan: savedPlan
    }, { status: 201 });
  } catch (err: any) {
    const status = err.name === 'PedagogicalPrivacyViolationError' ? 422 : 500;
    return NextResponse.json(
      { error: err.message || 'Error registrando planeación curricular.' },
      { status }
    );
  }
}
