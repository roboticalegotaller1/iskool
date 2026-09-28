import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/sessionToken';
import {
  verifyMultiTenantToken,
  TenantId
} from '@/lib/auth/multiTenantSession';

/**
 * ============================================================================
 * MIDDLEWARE PERIMETRAL ZERO-TRUST CON AISLAMIENTO HERMÉTICO iSkool & IBIME
 * ============================================================================
 * 
 * Principios de Seguridad Aplicados:
 * 1. Cero Confianza en Headers de Cliente: Se elimina cualquier decisión de seguridad
 *    basada en 'X-Tenant-ID' enviado por el cliente para evitar Header Spoofing.
 * 2. Validación Criptográfica Exclusiva: La identidad y el tenant del usuario se extraen
 *    estrictamente del JWT firmado en cookies HttpOnly ('ibime_session' o 'iskool_session').
 * 3. Prevención de Enumeración Cross-Tenant (HTTP 404): Si un usuario de un tenant intenta
 *    acceder a recursos de otro tenant, se responde con HTTP 404 Not Found (en lugar de 403)
 *    para evitar que un atacante determine la existencia de endpoints o rutas privadas.
 * 4. Inyección de Header Interno Confiable: Inyecta 'x-resolved-tenant' para Server Components.
 */

// Rutas protegidas de iSkool Core
const ISKOOL_PROTECTED_PREFIXES = [
  '/admin',
  '/teacher',
  '/student',
  '/director',
  '/billing',
  '/superadmin'
];

// Rutas protegidas de IBIME
const IBIME_PROTECTED_PREFIXES = [
  '/ibime/admin',
  '/ibime/teacher',
  '/ibime/student',
  '/ibime/director',
  '/ibime/billing',
  '/ibime/portal',
  '/ibime/kardex',
  '/ibime/coordinacion'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();

  // 1. Determinar el Tenant Requerido según el recurso objetivo (Ruta o Subdominio)
  // NUNCA depender de headers arbitrarios del cliente (como X-Tenant-ID)
  const isIbimePath = pathname.startsWith('/ibime') || pathname.startsWith('/api/v1/ibime');
  const isIbimeHost = host.startsWith('ibime.') || host.includes('ibime');
  const targetTenantRequired: TenantId = (isIbimePath || isIbimeHost) ? 'ibime' : 'iskool';

  const isIskoolProtected = ISKOOL_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isIbimeProtected = IBIME_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith('/api/v1/ibime');
  const isIntegrationApi = pathname.startsWith('/api/v1/integration');
  const isProtected = isIskoolProtected || isIbimeProtected || isIntegrationApi;

  // Si la ruta es pública, permitir paso directo inyectando el tenant resuelto
  if (!isProtected) {
    const response = NextResponse.next();
    response.headers.set('x-resolved-tenant', targetTenantRequired);
    applyDefensiveSecurityHeaders(response);
    return response;
  }

  // 2. Extracción de Credenciales Criptográficas Exclusivas
  const iskoolCookie = request.cookies.get('iskool_session')?.value;
  const ibimeCookie = request.cookies.get('ibime_session')?.value;
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const bearerToken = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7).trim()
    : null;

  // Seleccionar token candidato
  const candidateToken = targetTenantRequired === 'ibime'
    ? (ibimeCookie || bearerToken || iskoolCookie)
    : (iskoolCookie || bearerToken || ibimeCookie);

  if (!candidateToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Autenticación requerida. No se detectó una sesión válida para este recurso.',
          code: 'UNAUTHENTICATED'
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL(targetTenantRequired === 'ibime' ? '/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('tenant', targetTenantRequired);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verificación Criptográfica Estricta de la Carga Útil
  let verifiedUser = await verifyMultiTenantToken(candidateToken);
  let userRole = verifiedUser?.role || '';
  let userTenant: TenantId = verifiedUser?.tenant_id || 'iskool';
  let userId = verifiedUser?.id || '';

  if (!verifiedUser) {
    const fallbackVerified = await verifySessionToken(candidateToken);
    if (fallbackVerified) {
      userId = fallbackVerified.id;
      userRole = fallbackVerified.role;
      userTenant = (fallbackVerified.tenant_id as TenantId) || 'iskool';
    } else {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Firma criptográfica de sesión inválida o token expirado.',
            code: 'INVALID_SESSION_SIGNATURE'
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_session');
      return NextResponse.redirect(loginUrl);
    }
  }

  const isSuperUser = userRole === 'superadmin' || userRole === 'admin';

  // 4. BARRERA DE SEGURIDAD ZERO-TRUST (ANTI-ENUMERACIÓN HTTP 404 NOT FOUND)
  // Si el usuario autenticado pertenece a un tenant distinto al recurso solicitado
  // respondemos con 404 NOT FOUND para evitar la enumeración de recursos privados
  if (targetTenantRequired === 'ibime' && userTenant !== 'ibime') {
    if (!isSuperUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Recurso no encontrado.',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
    }
  }

  if (targetTenantRequired === 'iskool' && (isIskoolProtected || isIntegrationApi) && userTenant !== 'iskool') {
    if (!isSuperUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Recurso no encontrado.',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
    }
  }

  // 5. Control de Acceso Basado en Roles (RBAC)
  if (userRole === 'student') {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/director') ||
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/ibime/admin') ||
      pathname.startsWith('/ibime/coordinacion')
    ) {
      const studentLanding = userTenant === 'ibime' ? '/ibime/student' : '/student';
      return NextResponse.redirect(new URL(studentLanding, request.url));
    }
  }

  if (pathname.startsWith('/superadmin') && userRole !== 'superadmin' && userRole !== 'admin') {
    const fallbackUrl = userRole === 'teacher' ? '/teacher' : userRole === 'student' ? '/student' : '/admin';
    return NextResponse.redirect(new URL(fallbackUrl, request.url));
  }

  // 6. Inyección de Headers Confiables hacia Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-resolved-tenant', targetTenantRequired);
  requestHeaders.set('x-resolved-tenant-id', targetTenantRequired);
  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-role', userRole);
  requestHeaders.set('x-user-tenant', userTenant);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  // Cabecera de respuesta para trazabilidad perimetral
  response.headers.set('x-resolved-tenant', targetTenantRequired);
  response.headers.set('x-resolved-tenant-id', targetTenantRequired);
  applyDefensiveSecurityHeaders(response);

  return response;
}

function applyDefensiveSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/director/:path*',
    '/billing/:path*',
    '/superadmin/:path*',
    '/ibime/:path*',
    '/api/v1/integration/:path*',
    '/api/v1/ibime/:path*'
  ]
};
