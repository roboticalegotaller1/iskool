import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter, getAllStampedCfdis } from '@/lib/fiscal/pacAdapter';
import { validateApiAuth } from '@/lib/authValidator';

/**
 * Endpoint de Estado del PAC y Bitácora de CFDIs Timbrados
 * GET /api/fiscal/status
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para acceder al estado fiscal.' },
        { status: 401 }
      );
    }

    const role = (auth.user.role || '').toLowerCase();
    const isAuthorized = ['admin', 'superadmin', 'director', 'billing', 'owner', 'ceo', 'coordinator'].includes(role);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Se requieren permisos administrativos o fiscales.' },
        { status: 403 }
      );
    }

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
