import { NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/portal-ceo/email?error=missing_code', req.url));
  }

  try {
    await GoogleAuthService.handleCallback(code, state);
    return NextResponse.redirect(new URL('/portal-ceo/email?connected=success', req.url));
  } catch (err: any) {
    console.error('Error en callback de integración:', err?.message || err);
    return NextResponse.redirect(new URL('/portal-ceo/email?error=oauth_callback_failed', req.url));
  }
}
