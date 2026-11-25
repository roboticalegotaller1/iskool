import { NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth.service';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

export async function GET(req: Request) {
  const parsedUrl = new URL(req.url);
  const { searchParams } = parsedUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const publicOrigin = GoogleOAuthService.resolveOAuthOrigin(parsedUrl.origin, req.headers);

  if (!code || !state) {
    return NextResponse.redirect(new URL('/portal-ceo/email?error=missing_code', publicOrigin));
  }

  try {
    await GoogleAuthService.handleCallback(code, state);
    return NextResponse.redirect(new URL('/portal-ceo/email?connected=success', publicOrigin));
  } catch (err: any) {
    console.error('Error en callback de integración:', err?.message || err);
    return NextResponse.redirect(new URL('/portal-ceo/email?error=oauth_callback_failed', publicOrigin));
  }
}
