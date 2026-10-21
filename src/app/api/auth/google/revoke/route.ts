import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { validateApiAuth } from '@/lib/authValidator';

export const runtime = 'nodejs';

/**
 * Endpoint oficial de revocación de credenciales Google OAuth (RFC 7009).
 * Requisito indispensable para Google Cloud Verification y certificación CASA Tier 2/3.
 * Desvincula la cuenta escolar, invoca https://oauth2.googleapis.com/revoke y purga datos locales.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para revocar accesos institucionales.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = body.email || auth.user?.email || 'roboticalegotaller1@gmail.com';

    const revokeResult = await GoogleOAuthService.revokeTokens(targetEmail);

    if (!revokeResult.success) {
      return NextResponse.json(
        { success: false, error: revokeResult.error || 'Error al revocar credenciales' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Credenciales de Google OAuth para ${targetEmail} revocadas exitosamente y eliminadas del sistema.`,
      revokedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al procesar revocación' },
      { status: 500 }
    );
  }
}
