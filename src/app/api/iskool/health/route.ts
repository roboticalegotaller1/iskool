import { NextResponse } from 'next/server';
import { IskoolCore } from '@/lib/iskoolCore';

export async function GET() {
  try {
    const report = await IskoolCore.Health.runFullCheck();
    return NextResponse.json(report, {
      status: report.overall_status === 'FAILED' ? 503 : 200
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error interno ejecutando diagnóstico de salud', details: err.message },
      { status: 500 }
    );
  }
}
