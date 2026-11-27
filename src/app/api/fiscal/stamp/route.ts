import { NextRequest, NextResponse } from 'next/server';
import { getFiscalPacAdapter } from '@/lib/fiscal/pacAdapter';
import { CfdiStampRequest, isPlatformSuperUser } from '@/types';
import { validateApiAuth } from '@/lib/authValidator';

/**
 * Endpoint de Timbrado Fiscal SAT CFDI 4.0 con Complemento IEDU
 * POST /api/fiscal/stamp
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado. Se requiere sesión activa para timbrado fiscal.'
      }, { status: 401 });
    }

    const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'billing', 'owner', 'ceo'];
    if (!auth.user.role || !allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Prohibido: Rol no autorizado para emitir comprobantes fiscales.'
      }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as (CfdiStampRequest & { schoolId?: string }) | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Cuerpo JSON inválido o malformado.'
      }, { status: 400 });
    }

    if (!body.emisor || !body.receptor || !body.items || body.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Petición de timbrado incompleta. Se requieren emisor, receptor e items.'
      }, { status: 400 });
    }

    if (!isPlatformSuperUser(auth.user) && body.schoolId && auth.user.school_id && body.schoolId !== auth.user.school_id) {
      return NextResponse.json({
        success: false,
        error: 'Prohibido: No puedes timbrar comprobantes fiscales para otro plantel.'
      }, { status: 403 });
    }
    body.schoolId = isPlatformSuperUser(auth.user)
      ? (body.schoolId || auth.user.school_id)
      : auth.user.school_id;

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
