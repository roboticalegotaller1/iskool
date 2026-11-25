import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth.service';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';

const INTEGRATION_ROLES = new Set(['superadmin', 'ceo', 'owner', 'director', 'admin']);

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: 'Autenticación requerida para vincular integraciones.' }, { status: 401 });
  }
  if (!INTEGRATION_ROLES.has((auth.user.role || '').toLowerCase())) {
    return NextResponse.json({ error: 'Permisos directivos requeridos para vincular integraciones.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requestedSchoolId = searchParams.get('schoolId') || auth.user.school_id || '938fa492-4ddc-4f6f-80d7-1bd054af8536';
  if (!isPlatformSuperUser(auth.user as any) && auth.user.school_id && requestedSchoolId !== auth.user.school_id) {
    return NextResponse.json({ error: 'Acceso denegado: aislamiento multi-colegio activo.' }, { status: 403 });
  }

  const schoolId = isPlatformSuperUser(auth.user as any) ? requestedSchoolId : (auth.user.school_id || requestedSchoolId);
  const userId = auth.user.id || 'ceo-israel-lopez';

  const authUrl = GoogleAuthService.generateAuthUrl(schoolId, userId);
  return NextResponse.redirect(authUrl);
}
