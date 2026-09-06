import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter, getAllStampedCfdis } from '@/lib/fiscal/pacAdapter';

/**
 * Endpoint de Estado del PAC y Bitácora de CFDIs Timbrados
 * GET /api/fiscal/status
 */
export async function GET(req: NextRequest) {
  try {
    const pac = getFiscalPacAdapter();
    const health = await pac.getHealth();
    const cfdis = getAllStampedCfdis();

    return NextResponse.json({
      success: true,
      pacHealth: health,
      totalStamped: cfdis.length,
      cfdis
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
