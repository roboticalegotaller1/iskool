import { NextRequest, NextResponse } from 'next/server';
import { verifyAndConsumeAuthorizationCode } from '@/lib/auth/oauthTickets';
import {
  signMultiTenantToken,
  getDefaultMetadataForTenant
} from '@/lib/auth/multiTenantSession';

/**
 * Endpoint OAuth 2.0 / OIDC: /api/auth/oauth/token
 * Intercambio atómico de Authorization Code por Tokens Multi-Tenant mediante PKCE (RFC 7636).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud JSON inválido o vacío.' },
        { status: 400 }
      );
    }

    const { grant_type, client_id, code, code_verifier, redirect_uri } = body;

    if (grant_type !== 'authorization_code') {
      return NextResponse.json(
        { error: 'grant_type no soportado. Debe ser grant_type=authorization_code.' },
        { status: 400 }
      );
    }

    if (!client_id || !code || !code_verifier || !redirect_uri) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: client_id, code, code_verifier y redirect_uri son obligatorios.' },
        { status: 400 }
      );
    }

    // 1. Validar firma del código, expiración y PKCE SHA-256
    const ticketPayload = await verifyAndConsumeAuthorizationCode({
      code,
      clientId: client_id,
      redirectUri: redirect_uri,
      codeVerifier: code_verifier
    });

    const tenantId = ticketPayload.tenantId;
    const metadata = getDefaultMetadataForTenant(tenantId);

    // 2. Generar el Access Token Multi-Tenant Firmado
    const accessToken = await signMultiTenantToken({
      id: ticketPayload.userId,
      email: ticketPayload.email,
      tenant_id: tenantId,
      role: ticketPayload.role,
      school_id: ticketPayload.schoolId,
      first_name: ticketPayload.firstName,
      last_name: ticketPayload.lastName,
      institution_metadata: metadata
    });

    const expiresInSeconds = 7 * 24 * 3600; // 7 días

    const response = NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      tenant_id: tenantId,
      user: {
        id: ticketPayload.userId,
        email: ticketPayload.email,
        role: ticketPayload.role,
        school_id: ticketPayload.schoolId,
        tenant_id: tenantId,
        first_name: ticketPayload.firstName,
        last_name: ticketPayload.lastName,
        institution_metadata: metadata
      }
    });

    // 3. Inyectar Cookie HttpOnly Segura y Particionada según el Tenant
    const cookieName = tenantId === 'ibime' ? 'ibime_session' : 'iskool_session';
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: cookieName,
      value: accessToken,
      httpOnly: true,
      secure: isProduction || req.url.startsWith('https://'),
      sameSite: 'lax', // Lax para permitir redirecciones OIDC seguras entre subdominios
      path: '/',
      maxAge: expiresInSeconds
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error durante el intercambio de token OAuth.' },
      { status: 400 }
    );
  }
}
