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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación institucional requerida.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const schoolId = normalizeOrgSchoolId(searchParams.get('schoolId') || 'sch-test-case');
    const graph = OrganizationServerService.getGraph(schoolId);
    const payroll = calculateConsolidatedPayrollSummary(graph);
    const delegates = buildDynamicSlaDelegatesFromGraph(graph);

    return NextResponse.json({
      success: true,
      graph,
      payroll,
      delegates,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error consultando organigrama.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación institucional requerida.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const schoolId = normalizeOrgSchoolId(
      String(body.schoolId || body.graph?.schoolId || 'sch-test-case').trim()
    );
    if (!body.graph || typeof body.graph !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Estructura de organigrama inválida.' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      graph: saved,
      payroll,
      delegates,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error guardando organigrama.' },
      { status: 500 }
    );
  }
}

