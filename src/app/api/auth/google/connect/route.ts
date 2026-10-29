import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

import { signOAuthState } from '@/lib/security/oauthState';
import { sanitizeInternalRedirectUrl } from '@/lib/security/htmlEscape';

export const runtime = 'nodejs';

/**
 * Endpoint oficial para que el personal directivo conecte su correo y calendario escolar.
 * Utiliza Incremental Authorization (include_granted_scopes=true) y evita scopes restringidos (CASA).
 */
export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const rawEmail = req.nextUrl.searchParams.get('email') || undefined;
    const forceHint = req.nextUrl.searchParams.get('forceHint') === 'true';
    const email = forceHint ? rawEmail : undefined;
    const rawRedirect = req.nextUrl.searchParams.get('redirect') || '';
    const safeRedirect = sanitizeInternalRedirectUrl(rawRedirect, '');
    const includeReadonly = req.nextUrl.searchParams.get('includeReadonly') === 'true';

    const statePayload = signOAuthState({
      flow: 'workspace_connect',
      tenantId,
      email: rawEmail || '',
      redirect: safeRedirect
    });

    const authUrl = GoogleOAuthService.getWorkspaceConnectUrl(
      origin,
      statePayload,
      email,
      includeReadonly
    );

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar conexión de correo directivo' },
      { status: 500 }
    );
  }
}
