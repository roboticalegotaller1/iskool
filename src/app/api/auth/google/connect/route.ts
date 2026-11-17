import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { validateApiAuth } from '@/lib/authValidator';
import { signOAuthState } from '@/lib/security/oauthState';
import { sanitizeInternalRedirectUrl } from '@/lib/security/htmlEscape';

export const runtime = 'nodejs';

/**
 * Endpoint oficial para que el personal directivo conecte su correo y calendario escolar.
 * Requiere sesión autenticada directiva (Zero-Trust) e Incremental Authorization.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación directiva requerida para vincular buzón o calendario.' },
        { status: 401 }
      );
    }

    const userRole = (auth.user.role || '').toLowerCase();
    if (!['superadmin', 'admin', 'director', 'owner', 'ceo', 'coordinator'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para vincular cuentas institucionales.' },
        { status: 403 }
      );
    }

    await GoogleOAuthService.ensureClientCredentials();
    const origin = GoogleOAuthService.resolveOAuthOrigin(req.nextUrl.origin, req.headers);
    const tenantId = auth.user.school_id || req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const rawEmail = req.nextUrl.searchParams.get('email') || undefined;
    const forceHint = req.nextUrl.searchParams.get('forceHint') === 'true';
    const email = forceHint ? rawEmail : undefined;
    const rawRedirect = req.nextUrl.searchParams.get('redirect') || '';
    const safeRedirect = sanitizeInternalRedirectUrl(rawRedirect, '');

    const statePayload = signOAuthState({
      flow: 'workspace_connect',
      tenantId,
      userId: auth.user.id,
      schoolId: auth.user.school_id || '',
      role: auth.user.role || 'director',
      email: rawEmail || auth.user.email || '',
      redirect: safeRedirect
    });

    // Blindaje OAuth: Siempre solicita únicamente los scopes sensibles verificados (gmail.send y calendar.events)
    const authUrl = GoogleOAuthService.getWorkspaceConnectUrl(
      origin,
      statePayload,
      email,
      false
    );

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar conexión de correo directivo' },
      { status: 500 }
    );
  }
}
