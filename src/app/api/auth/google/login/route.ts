import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = req.nextUrl.searchParams.get('email') || undefined;
    const redirectUrl = req.nextUrl.searchParams.get('redirect') || '';
    const flow = req.nextUrl.searchParams.get('flow') || req.nextUrl.searchParams.get('mode') || 'login';

    const statePayload = JSON.stringify({
      flow,
      tenantId,
      email: email || '',
      redirect: redirectUrl
    });

    // Login general pide exclusivamente openid email profile (cumpliendo política de privacidad y evitando CASA)
    const isWorkspaceConnect = flow === 'workspace_connect' || flow === 'connect';
    const authUrl = isWorkspaceConnect
      ? GoogleOAuthService.getWorkspaceConnectUrl(origin, statePayload, email)
      : GoogleOAuthService.getLoginAuthUrl(origin, statePayload, email);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al iniciar Google OAuth' }, { status: 500 });
  }
}
