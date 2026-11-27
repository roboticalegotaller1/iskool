import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { EmailTriageTelemetryService } from '@/lib/services/emailTriageTelemetry.service';
import { isPlatformSuperUser } from '@/types';
import { isSchoolTenantAllowed } from '@/lib/security/tenantAccess';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para consultar telemetría de correo.' },
        { status: 401 }
      );
    }
    const roleLower = (auth.user.role || '').toLowerCase();
    if (!['superadmin', 'ceo', 'owner', 'director', 'admin', 'coordinator'].includes(roleLower)) {
      return NextResponse.json(
        { success: false, error: 'Permisos insuficientes para consultar telemetría.' },
        { status: 403 }
      );
    }

    const fullSummary = EmailTriageTelemetryService.getSummary();
    if (isPlatformSuperUser(auth.user as any)) {
      const markdownReport = EmailTriageTelemetryService.formatCostReportMarkdown();
      return NextResponse.json(
        {
          success: true,
          summary: fullSummary,
          markdownReport
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
            'Vary': 'Cookie, Authorization'
          }
        }
      );
    }

    // Filtrado estricto por plantel escolar para evitar fuga de telemetría cross-tenant
    const scopedRecords = (fullSummary.records || []).filter(
      (rec) => Boolean(rec.tenant_id) && isSchoolTenantAllowed(auth.user as any, rec.tenant_id)
    );
    const totalPromptTokens = scopedRecords.reduce((acc, r) => acc + (r.prompt_tokens || 0), 0);
    const totalCandidatesTokens = scopedRecords.reduce((acc, r) => acc + (r.candidates_tokens || 0), 0);
    const totalTokens = scopedRecords.reduce((acc, r) => acc + (r.total_tokens || 0), 0);
    const totalCostUsd = Number(scopedRecords.reduce((acc, r) => acc + (r.cost_usd || 0), 0).toFixed(8));
    const totalCostMxn = Number(scopedRecords.reduce((acc, r) => acc + (r.cost_mxn || 0), 0).toFixed(6));
    const totalOverrides = scopedRecords.filter((r) => r.was_overridden).length;

    const scopedSummary = {
      ...fullSummary,
      total_requests: scopedRecords.length,
      total_prompt_tokens: totalPromptTokens,
      total_candidates_tokens: totalCandidatesTokens,
      total_tokens: totalTokens,
      total_cost_usd: totalCostUsd,
      total_cost_mxn: totalCostMxn,
      total_overrides: totalOverrides,
      tokens_saved_by_learning: 0,
      money_saved_usd: 0,
      money_saved_mxn: 0,
      records: scopedRecords
    };

    const markdownReport = `### 📊 Reporte de Consumo y Costo de Triage de Correo (Motor de IA)

- **Total de Correos Evaluados con IA:** ${scopedSummary.total_requests}
- **Tokens de Entrada (Prompt):** ${scopedSummary.total_prompt_tokens.toLocaleString()} tokens
- **Tokens de Salida (Respuesta):** ${scopedSummary.total_candidates_tokens.toLocaleString()} tokens
- **Tokens Totales Consumidos:** ${scopedSummary.total_tokens.toLocaleString()} tokens
- **Gasto Acumulado en USD:** $${scopedSummary.total_cost_usd.toFixed(6)} USD
- **Gasto Acumulado en MXN:** $${scopedSummary.total_cost_mxn.toFixed(4)} MXN
- **Correos Reclasificados por IA:** ${scopedSummary.total_overrides}`;

    return NextResponse.json(
      {
        success: true,
        summary: scopedSummary,
        markdownReport
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
          'Vary': 'Cookie, Authorization'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener telemetría' },
      { status: 500 }
    );
  }
}
