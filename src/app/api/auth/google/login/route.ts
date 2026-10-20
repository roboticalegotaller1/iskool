import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

import { signOAuthState } from '@/lib/security/oauthState';
import { sanitizeInternalRedirectUrl } from '@/lib/security/htmlEscape';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = req.nextUrl.searchParams.get('email') || undefined;
    const rawRedirect = req.nextUrl.searchParams.get('redirect') || '';
    const safeRedirect = sanitizeInternalRedirectUrl(rawRedirect, '');
    const rawFlow = req.nextUrl.searchParams.get('flow') || req.nextUrl.searchParams.get('mode') || 'login';
    const flow: 'login' | 'workspace_connect' = (rawFlow === 'workspace_connect' || rawFlow === 'connect') ? 'workspace_connect' : 'login';

    const statePayload = signOAuthState({
      flow,
      tenantId,
      email: email || '',
      redirect: safeRedirect
    });

    // Login general pide exclusivamente openid email profile (cumpliendo política de privacidad y evitando CASA)
    const isWorkspaceConnect = flow === 'workspace_connect';
    const authUrl = isWorkspaceConnect
      ? GoogleOAuthService.getWorkspaceConnectUrl(origin, statePayload, email)
      : GoogleOAuthService.getLoginAuthUrl(origin, statePayload, email);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al iniciar Google OAuth' }, { status: 500 });
  }
}
