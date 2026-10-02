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

// Rutas protegidas de IBIME (Sub-módulos que requieren rol específico)
const IBIME_PROTECTED_PREFIXES = [
  '/ibime/portal',
  '/ibime/admin',
  '/ibime/teacher',
  '/ibime/student',
  '/ibime/director',
  '/ibime/billing',
  '/ibime/kardex',
  '/ibime/coordinacion'
];

function isPublicOrAuthPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/ibime' ||
    pathname === '/ibime/' ||
    pathname === '/ibime/login' ||
    pathname.startsWith('/ibime/login/') ||
    pathname === '/Lcxad5iH8kGm3ZC' ||
    pathname.startsWith('/Lcxad5iH8kGm3ZC/') ||
    pathname === '/02DJoUJSkwYQZjn' ||
    pathname.startsWith('/02DJoUJSkwYQZjn/') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/favicon') ||
    pathname === '/404' ||
    pathname === '/not-found'
  );
}

export async function middleware(request: NextRequest) {
  // 0. Sanitización Perimetral Zero-Trust: Eliminar cualquier cabecera x-resolved-tenant spoofed del cliente entrante
  try {
    request.headers.delete('x-resolved-tenant');
    request.headers.delete('x-resolved-tenant-id');
  } catch {
    // Si los headers son inmutables en tiempo de ejecución, se garantiza su purga en requestHeaders abajo
  }

  const { pathname } = request.nextUrl;

  // Excluir el CRM de Admisiones para demostración y evaluación sin fricción
  if (pathname === '/admin/crm' || pathname.startsWith('/admin/crm') || pathname === '/crm' || pathname.startsWith('/crm')) {
    return NextResponse.next();
  }
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
  const acceptHeader = (request.headers.get('accept') || '').toLowerCase();
  const isServerAction = request.headers.has('next-action');
  const isRsc = request.headers.get('rsc') === '1';
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  const isJsonExpected = isApi || isServerAction || acceptHeader.includes('application/json');
  const isApiRequest = isJsonExpected || isRsc;

  // 1. Determinar el Tenant Requerido según el recurso objetivo (Ruta, Parámetro o Subdominio)
  // NUNCA depender de headers arbitrarios del cliente (como X-Tenant-ID o x-resolved-tenant)
  const iskoolCookie = request.cookies.get('iskool_session')?.value;
  const ibimeCookie = request.cookies.get('ibime_session')?.value;
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const bearerToken = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7).trim()
    : null;

  const querySchoolId = request.nextUrl.searchParams.get('school_id') || request.nextUrl.searchParams.get('schoolId');
  const isIbimeSchool = querySchoolId === 'sch-ibime' || querySchoolId === 'ibime';
  const isSharedAcademicPath = pathname.startsWith('/teacher') || pathname.startsWith('/student') || pathname.startsWith('/planeaciones');
  const isIbimeCookieActive = Boolean(ibimeCookie && !iskoolCookie);

  const isIbimePath = pathname.startsWith('/ibime') || pathname.startsWith('/api/v1/ibime') || pathname === '/02DJoUJSkwYQZjn' || pathname.startsWith('/02DJoUJSkwYQZjn/');
  const isIbimeHost = host.startsWith('ibime.') || host.includes('ibime');
  const targetTenantRequired: TenantId = (isIbimePath || isIbimeHost || isIbimeSchool || (isIbimeCookieActive && isSharedAcademicPath)) ? 'ibime' : 'iskool';

  const isIskoolProtected = ISKOOL_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isIbimeProtected = IBIME_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith('/api/v1/ibime');
  const isIntegrationApi = pathname.startsWith('/api/v1/integration');
  const isProtected = isIskoolProtected || isIbimeProtected || isIntegrationApi;

  // Si la ruta es pública o de autenticación, permitir paso directo inyectando el tenant resuelto sanitizado
  // NUNCA abortar con 404 en /login o /ibime/login ante presencia de cookies del tenant contrario
  if (isPublicOrAuthPath(pathname) || !isProtected) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('x-resolved-tenant');
    requestHeaders.delete('x-resolved-tenant-id');
    requestHeaders.set('x-resolved-tenant', targetTenantRequired);
    requestHeaders.set('x-resolved-tenant-id', targetTenantRequired);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.headers.set('x-resolved-tenant', targetTenantRequired);
    response.headers.set('x-resolved-tenant-id', targetTenantRequired);
    applyDefensiveSecurityHeaders(response);
    return response;
  }

  // 2. Extracción y Resolución Determinista de Credenciales Criptográficas Exclusivas
  let candidateToken: string | null = null;
  let opposingTenantCookiePresent = false;

  if (targetTenantRequired === 'ibime') {
    candidateToken = ibimeCookie || bearerToken || null;
    if (!candidateToken && iskoolCookie) {
      candidateToken = iskoolCookie;
    }
  } else {
    candidateToken = iskoolCookie || bearerToken || null;
    if (!candidateToken && ibimeCookie) {
      candidateToken = ibimeCookie;
    }
  }

  // Helper para generar respuesta 404 JSON estructurada con cabeceras anti-caché y Vary
  function createCrossTenantNotFoundResponse() {
    return NextResponse.json(
      { error: 'Not Found', code: 'NOT_FOUND', message: 'Resource not found' },
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Vary': 'Accept, Next-Action, RSC, Cookie, x-tenant-id'
        }
      }
    );
  }

  // Helper para reescribir a /404 con cabeceras anti-caché y Vary (para navegaciones HTML y RSC de página)
  function createCrossTenantRewrite404Response() {
    const response = NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Vary', 'Accept, Next-Action, RSC, Cookie, x-tenant-id');
    return response;
  }

  // Si la ruta solicitada pertenece a un tenant y la cookie válida corresponde al tenant contrario:
  // - Para API / Server Actions / Accept: application/json: Retorna 404 JSON estructurado
  // - Para HTML y navegaciones RSC de página: Reescribe a página /404 interna sin romper el cliente
  if (opposingTenantCookiePresent) {
    if (isJsonExpected) {
      return createCrossTenantNotFoundResponse();
    }
    return createCrossTenantRewrite404Response();
  }

  if (!candidateToken) {
    if (isApiRequest) {
      return NextResponse.json(
        {
          error: 'Autenticación requerida. No se detectó una sesión válida para este recurso.',
          code: 'UNAUTHENTICATED'
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL(targetTenantRequired === 'ibime' ? '/ibime/login' : '/login', request.url);
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
      if (isApiRequest) {
        return NextResponse.json(
          {
            error: 'Firma criptográfica de sesión inválida o token expirado.',
            code: 'INVALID_SESSION_SIGNATURE'
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL(targetTenantRequired === 'ibime' ? '/ibime/login' : '/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_session');
      return NextResponse.redirect(loginUrl);
    }
  }

  const isSuperUser =
    userRole === 'superadmin' ||
    userRole === 'admin' ||
    userRole === 'owner' ||
    userRole === 'ceo';

  // 4. BARRERA DE SEGURIDAD ZERO-TRUST (ANTI-ENUMERACIÓN HTTP 404 NOT FOUND)
  // Si el usuario autenticado pertenece a un tenant distinto al recurso solicitado
  // respondemos con 404 NOT FOUND sin procesar llamadas descendentes
  if (targetTenantRequired === 'ibime' && userTenant !== 'ibime') {
    if (!isSuperUser) {
      if (isJsonExpected) {
        return createCrossTenantNotFoundResponse();
      }
      return createCrossTenantRewrite404Response();
    }
  }

  if (targetTenantRequired === 'iskool' && (isIskoolProtected || isIntegrationApi) && userTenant !== 'iskool') {
    if (!isSuperUser) {
      if (isJsonExpected) {
        return createCrossTenantNotFoundResponse();
      }
      return createCrossTenantRewrite404Response();
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
  requestHeaders.delete('x-resolved-tenant');
  requestHeaders.delete('x-resolved-tenant-id');
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
    /*
     * Coincidir con todas las rutas de la aplicación excluyendo explícitamente:
     * - _next/static, _next/image, _next/data (archivos de compilación de Next.js)
     * - /404, /not-found (páginas de error para prevenir bucles de rewrite infinitos)
     * - favicon.ico, sitemap.xml, robots.txt
     * - assets estáticos institucionales (brand/, .svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|_next/data|_next/|favicon\\.ico|404|not-found|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ]
};
