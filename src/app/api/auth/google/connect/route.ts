import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';

export const runtime = 'nodejs';

/**
 * Endpoint oficial para que el personal directivo conecte su correo y calendario escolar.
 * Utiliza Incremental Authorization (include_granted_scopes=true) y evita scopes restringidos (CASA).
 */
export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
    const email = req.nextUrl.searchParams.get('email') || undefined;
    const includeReadonly = req.nextUrl.searchParams.get('includeReadonly') === 'true';

    const statePayload = JSON.stringify({
      flow: 'workspace_connect',
      tenantId,
      email: email || ''
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
