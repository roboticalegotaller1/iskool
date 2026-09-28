import { NextRequest, NextResponse } from 'next/server';
import { createAuthorizationCodeTicket } from '@/lib/auth/oauthTickets';
import { validateApiAuth } from '@/lib/authValidator';
import { TenantId } from '@/lib/auth/multiTenantSession';

/**
 * Endpoint OAuth 2.0 / OIDC: /api/auth/oauth/authorize
 * Inicia el flujo de autorización federada para aplicaciones cliente de IBIME o iSkool.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');
    const state = searchParams.get('state');
    const requestedTenant = (searchParams.get('tenant_id') || 'ibime') as TenantId;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Parámetros obligatorios faltantes: client_id y redirect_uri son requeridos.' },
        { status: 400 }
      );
    }

    if (responseType !== 'code') {
      return NextResponse.json(
        { error: 'Tipo de respuesta no soportado. Debe ser response_type=code.' },
        { status: 400 }
      );
    }

    if (!codeChallenge || codeChallengeMethod !== 'S256') {
      return NextResponse.json(
        { error: 'Seguridad PKCE obligatoria: code_challenge y code_challenge_method=S256 son requeridos.' },
        { status: 400 }
      );
    }

    // Verificar si existe una sesión activa del usuario
    const authResult = await validateApiAuth(req, { expectedTenant: requestedTenant });

    if (!authResult.authenticated || !authResult.user) {
      // Si el usuario no tiene sesión activa, redirigir a la pantalla de login con los parámetros de retorno
      const loginUrl = new URL(requestedTenant === 'ibime' ? '/ibime/login' : '/login', req.url);
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
      loginUrl.searchParams.set('tenant', requestedTenant);
      return NextResponse.redirect(loginUrl);
    }

    // Generar el código de autorización firmado con PKCE
    const code = await createAuthorizationCodeTicket({
      clientId,
      redirectUri,
      codeChallenge,
      tenantId: requestedTenant,
      userId: authResult.user.id,
      email: authResult.user.email || `${authResult.user.id}@${requestedTenant}.mx`,
      role: (authResult.user.role as any) || 'student',
      schoolId: authResult.user.school_id,
      firstName: authResult.user.first_name,
      lastName: authResult.user.last_name
    });

    // Redirigir de regreso al cliente con el código y el estado CSRF
    const returnUrl = new URL(redirectUri);
    returnUrl.searchParams.set('code', code);
    if (state) {
      returnUrl.searchParams.set('state', state);
    }

    return NextResponse.redirect(returnUrl);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error procesando solicitud de autorización OAuth.' },
      { status: 500 }
    );
  }
}
