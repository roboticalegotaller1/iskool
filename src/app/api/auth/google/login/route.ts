import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = req.nextUrl.searchParams.get('email') || 'roboticalegotaller1@gmail.com';
    const statePayload = JSON.stringify({ tenantId, email });
    const authUrl = GoogleOAuthService.getAuthUrl(origin, statePayload, email);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al iniciar Google OAuth' }, { status: 500 });
  }
}
