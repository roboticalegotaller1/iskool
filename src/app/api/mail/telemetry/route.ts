import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { EmailTriageTelemetryService } from '@/lib/services/emailTriageTelemetry.service';

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

    const summary = EmailTriageTelemetryService.getSummary();
    const markdownReport = EmailTriageTelemetryService.formatCostReportMarkdown();

    return NextResponse.json({
      success: true,
      summary,
      markdownReport
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener telemetría' },
      { status: 500 }
    );
  }
}
