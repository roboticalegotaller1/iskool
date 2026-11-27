import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter, getAllStampedCfdis } from '@/lib/fiscal/pacAdapter';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const PRIVATE_SHORT_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
  Vary: 'Cookie, Authorization'
};

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
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const role = (auth.user.role || '').toLowerCase();
    const isAuthorized = ['admin', 'superadmin', 'director', 'billing', 'owner', 'ceo', 'coordinator'].includes(role);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Se requieren permisos administrativos o fiscales.' },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const pac = getFiscalPacAdapter();
    const health = await pac.getHealth();
    const allCfdis = getAllStampedCfdis();
    const cfdis = isPlatformSuperUser(auth.user)
      ? allCfdis
      : allCfdis.filter((c: any) => Boolean(auth.user?.school_id && c.schoolId === auth.user.school_id));

    return NextResponse.json(
      {
        success: true,
        pacHealth: health,
        totalStamped: cfdis.length,
        cfdis
      },
      { headers: PRIVATE_SHORT_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error consultando el estado fiscal.',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message } : {})
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
