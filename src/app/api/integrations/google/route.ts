import { NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId') || '938fa492-4ddc-4f6f-80d7-1bd054af8536';
  const userId = searchParams.get('userId') || 'ceo-israel-lopez';

  const authUrl = GoogleAuthService.generateAuthUrl(schoolId, userId);
  return NextResponse.redirect(authUrl);
}
