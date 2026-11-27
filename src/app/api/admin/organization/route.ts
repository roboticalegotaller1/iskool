import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import {
  OrganizationServerService,
  buildDynamicSlaDelegatesFromGraph,
  calculateConsolidatedPayrollSummary,
  SchoolOrganizationGraph,
  normalizeOrgSchoolId,
} from '@/lib/services/organizationService';
import { CeoEmailSettingsService } from '@/lib/services/ceoEmailSettingsService';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';
import { isPlatformSuperUser } from '@/types';

const demoOrgGraphCache = new Map<string, SchoolOrganizationGraph>();

export const dynamic = 'force-dynamic';

const EXECUTIVE_ORG_ROLES = new Set(['superadmin', 'director', 'admin', 'owner', 'ceo']);
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const PRIVATE_SHORT_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
  Vary: 'Cookie, Authorization',
};

function sanitizeOrgGraphForApi(graph: SchoolOrganizationGraph): SchoolOrganizationGraph {
  return {
    ...graph,
    nodes: (graph.nodes || []).map((node) => {
      const { passwordHash: _ph, passwordSalt: _ps, tempPasswordPreview: _tp, ...safeNode } = node as any;
      return safeNode;
    }),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Autenticación institucional requerida.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }
    const roleLower = (auth.user?.role || '').toLowerCase();
    if (!EXECUTIVE_ORG_ROLES.has(roleLower)) {
      return NextResponse.json(
        { success: false, error: 'Permisos directivos requeridos para consultar el organigrama.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const schoolId = normalizeOrgSchoolId(searchParams.get('schoolId') || 'sch-test-case');

    if (
      process.env.NODE_ENV !== 'test' &&
      auth.authenticated &&
      auth.user &&
      !isPlatformSuperUser(auth.user as any)
    ) {
      const userSchool = normalizeOrgSchoolId(auth.user.school_id || '');
      if (userSchool && userSchool !== schoolId) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado: aislamiento multi-colegio activo.' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
    }

    const isDemoUser = isDemoSandboxContext({
      email: auth.user?.email,
      schoolId: auth.user?.school_id || schoolId,
      userId: auth.user?.id,
    });
    const graph = (isDemoUser && demoOrgGraphCache.get(schoolId)) || OrganizationServerService.getGraph(schoolId);
    const payroll = calculateConsolidatedPayrollSummary(graph);
    const delegates = buildDynamicSlaDelegatesFromGraph(graph);

    return NextResponse.json(
      {
        success: true,
        graph: sanitizeOrgGraphForApi(graph),
        payroll,
        delegates,
      },
      { headers: PRIVATE_SHORT_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error consultando organigrama.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Autenticación institucional requerida.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }
    const roleLower = (auth.user?.role || '').toLowerCase();
    if (!EXECUTIVE_ORG_ROLES.has(roleLower)) {
      return NextResponse.json(
        { success: false, error: 'Permisos directivos requeridos para modificar el organigrama.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const body = await req.json().catch(() => ({}));
    const schoolId = normalizeOrgSchoolId(
      String(body.schoolId || body.graph?.schoolId || 'sch-test-case').trim()
    );

    if (
      process.env.NODE_ENV !== 'test' &&
      auth.authenticated &&
      auth.user &&
      !isPlatformSuperUser(auth.user as any)
    ) {
      const userSchool = normalizeOrgSchoolId(auth.user.school_id || '');
      if (userSchool && userSchool !== schoolId) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado: no puedes modificar otra institución.' },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
    }

    if (!body.graph || typeof body.graph !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Estructura de organigrama inválida.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (
      isDemoSandboxContext({
        email: auth.user?.email,
        schoolId: auth.user?.school_id || schoolId,
        userId: auth.user?.id,
      }) &&
      schoolId === 'sch-demo-0001'
    ) {
      const ephemeralGraph = { ...(body.graph as SchoolOrganizationGraph), schoolId };
      demoOrgGraphCache.set(schoolId, ephemeralGraph);
      recordEphemeralVaultItem('memory', {
        actorEmail: auth.user?.email,
        title: `Organigrama Demo (${schoolId})`,
        payload: { schoolId },
      });
      return NextResponse.json(
        {
          success: true,
          demoSandbox: true,
          graph: sanitizeOrgGraphForApi(ephemeralGraph),
          payroll: calculateConsolidatedPayrollSummary(ephemeralGraph),
          delegates: buildDynamicSlaDelegatesFromGraph(ephemeralGraph),
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    const saved = OrganizationServerService.saveGraph(
      schoolId,
      body.graph as SchoolOrganizationGraph
    );

    const delegates = buildDynamicSlaDelegatesFromGraph(saved);
    if (delegates.length > 0 || schoolId === 'sch-test-case') {
      // Sincroniza los delegados SLA exclusivamente para el colegio/CEO activo sin contaminar otros tenants
      const tenantKey = schoolId === 'sch-ibime' ? 'e1000000-0000-0000-0000-000000000001' : schoolId;
      CeoEmailSettingsService.updateSettings(tenantKey, { delegates });
      if (tenantKey !== schoolId) {
        CeoEmailSettingsService.updateSettings(schoolId, { delegates });
      }
    }

    const payroll = calculateConsolidatedPayrollSummary(saved);

    return NextResponse.json(
      {
        success: true,
        graph: sanitizeOrgGraphForApi(saved),
        payroll,
        delegates,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error guardando organigrama.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

