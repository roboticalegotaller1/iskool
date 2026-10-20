import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth.service';
import { validateApiAuth } from '@/lib/authValidator';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: 'Autenticación requerida para vincular integraciones.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId') || auth.user.school_id || '938fa492-4ddc-4f6f-80d7-1bd054af8536';
  const userId = auth.user.id || searchParams.get('userId') || 'ceo-israel-lopez';

  const authUrl = GoogleAuthService.generateAuthUrl(schoolId, userId);
  return NextResponse.redirect(authUrl);
}
