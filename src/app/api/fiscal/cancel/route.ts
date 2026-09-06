import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter } from '@/lib/fiscal/pacAdapter';
import { CfdiCancelRequest } from '@/types';

/**
 * Endpoint de Cancelación Fiscal ante el SAT
 * POST /api/fiscal/cancel
 */
export async function POST(req: NextRequest) {
  try {
    const body: CfdiCancelRequest = await req.json();

    if (!body || !body.uuid || !body.motivo || !body.rfcEmisor) {
      return NextResponse.json({
        success: false,
        error: 'Petición de cancelación incompleta. Se requiere uuid, motivo y rfcEmisor.'
      }, { status: 400 });
    }

    const pac = getFiscalPacAdapter();
    const cancelResult = await pac.cancelInvoice(body);

    if (!cancelResult.success) {
      return NextResponse.json({
        success: false,
        error: cancelResult.errorMessage || 'No fue posible procesar la cancelación ante el SAT.'
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: 'Comprobante fiscal cancelado exitosamente ante el SAT.',
      data: cancelResult
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno al procesar la cancelación fiscal.'
    }, { status: 500 });
  }
}
