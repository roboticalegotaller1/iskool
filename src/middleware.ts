import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/sessionToken';
import {
  resolveTenantFromHostOrHeader,
  verifyMultiTenantToken,
  TenantId
} from '@/lib/auth/multiTenantSession';

/**
 * Middleware Perimetral Zero-Trust y Multi-Tenant de Next.js.
 * Garantiza Aislamiento Hermético entre iSkool Core e IBIME:
 * 1. Resuelve el contexto de Tenant a partir del subdominio (Host/X-Forwarded-Host), Header (x-tenant-id) o ruta.
 * 2. Bloquea perimetralmente accesos cruzados (Cross-Tenant Leakage) entre usuarios de iSkool e IBIME.
 * 3. Valida Cookies HttpOnly particionadas ('iskool_session', 'ibime_session') o tokens Bearer firmados.
 * 4. Aplica Control de Acceso Basado en Roles (RBAC) e inyecta cabeceras defensivas.
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
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const headerTenantId = request.headers.get('x-tenant-id');

  // 1. Resolución determinista del Tenant esperado
  const resolvedTenant: TenantId = resolveTenantFromHostOrHeader({
    host,
    headerTenantId,
    pathname
  });

  const isIskoolProtected = ISKOOL_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isIbimeProtected = IBIME_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith('/api/v1/ibime');
  const isIntegrationApi = pathname.startsWith('/api/v1/integration');
  const isProtected = isIskoolProtected || isIbimeProtected || isIntegrationApi;

  // Si la ruta es pública y no está en un subdominio restringido, permitir paso directo con cabeceras de seguridad
  if (!isProtected) {
    const response = NextResponse.next();
    response.headers.set('X-Resolved-Tenant-ID', resolvedTenant);
    applyDefensiveSecurityHeaders(response);
    return response;
  }

  // 2. Extracción de Credenciales de Sesión (Cookies Particionadas o Header Bearer)
  const iskoolCookie = request.cookies.get('iskool_session')?.value;
  const ibimeCookie = request.cookies.get('ibime_session')?.value;
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const bearerToken = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7).trim()
    : null;

  // Seleccionar token prioritario según el tenant esperado
  const candidateToken = resolvedTenant === 'ibime'
    ? (ibimeCookie || bearerToken || iskoolCookie)
    : (iskoolCookie || bearerToken || ibimeCookie);

  if (!candidateToken) {
    // Redirección o rechazo por falta de credenciales
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Autenticación requerida. No se detectó una sesión válida para este recurso.',
          code: 'UNAUTHENTICATED',
          tenant: resolvedTenant
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL(resolvedTenant === 'ibime' ? '/ibime/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('tenant', resolvedTenant);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verificación Criptográfica de la Carga Útil del Token
  // Intentar primero verificación formal con el esquema Multi-Tenant estricto
  let multiTenantUser = await verifyMultiTenantToken(candidateToken);
  let userRole = multiTenantUser?.role || '';
  let userTenant: TenantId = multiTenantUser?.tenant_id || 'iskool';
  let userId = multiTenantUser?.id || '';

  // Fallback con el verificador universal de sesión existente
  if (!multiTenantUser) {
    const fallbackVerified = await verifySessionToken(candidateToken);
    if (fallbackVerified) {
      userId = fallbackVerified.id;
      userRole = fallbackVerified.role;
      userTenant = (fallbackVerified.tenant_id as TenantId) || 'iskool';
    } else {
      // Token inválido o firma HMAC manipulada
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Firma criptográfica de sesión inválida o token expirado.',
            code: 'INVALID_SESSION_SIGNATURE'
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL(resolvedTenant === 'ibime' ? '/ibime/login' : '/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_session');
      return NextResponse.redirect(loginUrl);
    }
  }

  const isSuperUser = userRole === 'superadmin' || userRole === 'admin';

  // 4. BARRERA DE SEGURIDAD CROSS-TENANT (AISLAMIENTO HERMÉTICO)
  // Caso A: El recurso pertenece a IBIME pero el usuario pertenece a iSkool
  if (resolvedTenant === 'ibime' && userTenant !== 'ibime') {
    if (!isSuperUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Acceso denegado: Violación de frontera multi-tenant. Tu sesión de iSkool no tiene permisos para acceder a recursos de IBIME.',
            code: 'CROSS_TENANT_VIOLATION',
            userTenant,
            targetTenant: resolvedTenant
          },
          { status: 403 }
        );
      }
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'cross_tenant_denied');
      redirectUrl.searchParams.set('tenant', 'ibime');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Caso B: El recurso pertenece a iSkool pero el usuario pertenece a IBIME
  if (resolvedTenant === 'iskool' && (isIskoolProtected || isIntegrationApi) && userTenant !== 'iskool') {
    if (!isSuperUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Acceso denegado: Violación de frontera multi-tenant. Tu sesión de IBIME no tiene permisos para acceder a recursos de iSkool Core.',
            code: 'CROSS_TENANT_VIOLATION',
            userTenant,
            targetTenant: resolvedTenant
          },
          { status: 403 }
        );
      }
      const redirectUrl = new URL('/ibime/portal', request.url);
      redirectUrl.searchParams.set('error', 'cross_tenant_denied');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Control de Acceso Basado en Roles (RBAC) Perimetral
  if (userRole === 'student') {
    // Bloquear acceso de alumnos a paneles administrativos o docentes en ambos contextos
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

  // 6. Configurar Petición Downstream con Cabeceras de Identidad Inyectadas
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-resolved-tenant-id', resolvedTenant);
  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-role', userRole);
  requestHeaders.set('x-user-tenant', userTenant);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  // Cabecera de respuesta para trazabilidad perimetral
  response.headers.set('X-Resolved-Tenant-ID', resolvedTenant);
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
    /*
     * Aplica a rutas protegidas de iSkool, IBIME y pasarelas de integración,
     * excluyendo archivos estáticos (_next, imágenes, favicon, fuentes).
     */
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
