import { NextRequest, NextResponse } from 'next/server';
import { EmailTriageTelemetryService } from '@/lib/services/emailTriageTelemetry.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
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
