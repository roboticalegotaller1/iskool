import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

import { signOAuthState } from '@/lib/security/oauthState';
import { sanitizeInternalRedirectUrl } from '@/lib/security/htmlEscape';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await GoogleOAuthService.ensureClientCredentials();
    const origin = GoogleOAuthService.resolveOAuthOrigin(req.nextUrl.origin, req.headers);
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = req.nextUrl.searchParams.get('email') || undefined;
    const rawRedirect = req.nextUrl.searchParams.get('redirect') || '';
    const safeRedirect = sanitizeInternalRedirectUrl(rawRedirect, '');
    // Blindaje OAuth: este endpoint público emite exclusivamente flujo 'login' (openid, email, profile).
    // La vinculación directiva (workspace_connect) exige sesión autenticada vía /api/auth/google/connect.
    const flow: 'login' = 'login';

    const statePayload = signOAuthState({
      flow,
      tenantId,
      email: email || '',
      redirect: safeRedirect
    });

    const authUrl = GoogleOAuthService.getLoginAuthUrl(origin, statePayload, email);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al iniciar Google OAuth' }, { status: 500 });
  }
}
