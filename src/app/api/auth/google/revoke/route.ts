import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';

export const runtime = 'nodejs';

/**
 * Endpoint oficial de revocación de credenciales OAuth (RFC 7009).
 * Desvincula la cuenta escolar, invoca el endpoint oficial de revocación y purga datos locales.
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

    if (
      auth.authenticated &&
      auth.user &&
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: auth.user.school_id,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    ) {
      return NextResponse.json(
        { success: false, error: 'Operación restringida en cuentas de demostración.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (body !== null && typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Cuerpo JSON inválido.' },
        { status: 400 }
      );
    }

    const requestedEmail = String(body?.email || auth.user?.email || '').trim().toLowerCase();
    if (!requestedEmail) {
      return NextResponse.json(
        { success: false, error: 'Se requiere especificar el correo electrónico de la cuenta a revocar.' },
        { status: 400 }
      );
    }

    // Verificación estricta de propiedad (Anti-IDOR): únicamente Super Usuario puede revocar cuentas ajenas
    if (auth.authenticated && auth.user) {
      const isSuperUser = isPlatformSuperUser(auth.user as any);
      const currentUserEmail = (auth.user.email || '').toLowerCase().trim();
      if (!isSuperUser && (!currentUserEmail || currentUserEmail !== requestedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Acceso no autorizado: No cuenta con permisos para revocar credenciales de otra cuenta.' },
          { status: 403 }
        );
      }
    }

    const targetEmail = requestedEmail;
    const revokeResult = await GoogleOAuthService.revokeTokens(targetEmail);

    if (!revokeResult.success) {
      return NextResponse.json(
        { success: false, error: revokeResult.error || 'Error al revocar credenciales' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Credenciales OAuth para ${targetEmail} revocadas exitosamente y eliminadas del sistema.`,
      revokedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al procesar revocación' },
      { status: 500 }
    );
  }
}
