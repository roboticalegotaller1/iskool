import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter } from '@/lib/fiscal/pacAdapter';
import { CfdiStampRequest } from '@/types';

/**
 * Endpoint de Timbrado Fiscal SAT CFDI 4.0 con Complemento IEDU
 * POST /api/fiscal/stamp
 */
export async function POST(req: NextRequest) {
  try {
    const body: CfdiStampRequest = await req.json();

    if (!body || !body.emisor || !body.receptor || !body.items || body.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Petición de timbrado incompleta. Se requieren emisor, receptor e items.'
      }, { status: 400 });
    }

    const pac = getFiscalPacAdapter();
    const stampResult = await pac.stampInvoice(body);

    if (!stampResult.success) {
      return NextResponse.json({
        success: false,
        errorCode: stampResult.errorCode,
        error: stampResult.errorMessage
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: 'CFDI 4.0 timbrado exitosamente ante el SAT.',
      data: stampResult
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno en el motor de timbrado fiscal.'
    }, { status: 500 });
  }
}
