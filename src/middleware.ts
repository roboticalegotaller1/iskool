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
  '/api/admin',
  '/teacher',
  '/student',
  '/director',
  '/coordinator',
  '/portal-ceo',
  '/portal/ceo',
  '/parent',
  '/studio',
  '/billing',
  '/superadmin',
  '/superuser',
  '/api/vault/reassign',
  '/api/mail',
  '/api/fiscal',
  '/api/store',
  '/api/studio',
  '/api/oracle',
  '/api/billing',
  '/api/v1/curriculum',
  '/api/iskool',
  '/api/realtime'
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
    pathname === '/privacidad' ||
    pathname.startsWith('/privacidad/') ||
    pathname === '/politica-de-privacidad' ||
    pathname.startsWith('/politica-de-privacidad/') ||
    pathname === '/terminos' ||
    pathname.startsWith('/terminos/') ||
    pathname === '/condiciones-del-servicio' ||
    pathname.startsWith('/condiciones-del-servicio/') ||
    pathname === '/privacy' ||
    pathname.startsWith('/privacy/') ||
    pathname === '/terms' ||
    pathname.startsWith('/terms/') ||
    pathname === '/video' ||
    pathname.startsWith('/video/') ||
    pathname === '/api/video-config' ||
    pathname.startsWith('/api/video-config/') ||
    pathname === '/api/demo' ||
    pathname === '/api/demo/challenge' ||
    pathname === '/control-remoto-qr' ||
    pathname.startsWith('/control-remoto-qr/') ||
    pathname === '/api/languages/pocket-remote' ||
    pathname.startsWith('/api/languages/pocket-remote/') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/favicon') ||
    pathname === '/404' ||
    pathname === '/not-found'
  );
}

/**
 * ============================================================================
 * BLINDAJE PERIMETRAL ANTI-PHP (PHP ZERO-TOLERANCE SHIELD)
 * ============================================================================
 * iSkool opera 100% sobre arquitectura moderna Next.js / TypeScript / React.
 * No utiliza, no ejecuta y no expone ningún entorno ni intérprete PHP en el servidor.
 * Este filtro intercepta y neutraliza de forma inmediata y en O(1) cualquier sondeo
 * automatizado de botnets, escaneo de CMS vulnerables (.php, .phtml, .phar) o
 * inyección de argumentos CGI (CVE-2024-4577), protegiendo la CPU y memoria del sistema.
 */
function isPhpAttackVector(pathname: string, search: string): boolean {
  const lowerPath = pathname.toLowerCase();
  
  // 1. Extensiones PHP ejecutables y formatos afines
  if (/\.(php[0-9]?|phtml|phar|phps|inc|cgi)$/i.test(lowerPath)) {
    return true;
  }

  // 2. Rutas clásicas de sondeo de escáneres automáticos de vulnerabilidades PHP
  if (
    lowerPath.includes('/wp-login') ||
    lowerPath.includes('/wp-admin') ||
    lowerPath.includes('/xmlrpc') ||
    lowerPath.includes('/phpmyadmin') ||
    lowerPath.includes('/pma') ||
    lowerPath.includes('/adminer') ||
    lowerPath.includes('/eval-stdin') ||
    lowerPath.includes('/phpinfo') ||
    lowerPath.includes('/cgi-bin') ||
    lowerPath.includes('/phpunit') ||
    lowerPath.includes('/vendor/phpunit') ||
    lowerPath.includes('/alfa.php') ||
    lowerPath.includes('/c99.php') ||
    lowerPath.includes('/r57.php') ||
    lowerPath.includes('/wso.php') ||
    lowerPath.includes('/shell.php')
  ) {
    return true;
  }

  // 3. Inyección de argumentos PHP CGI (CVE-2024-4577) y directivas de inclusión remota
  const lowerSearch = search.toLowerCase();
  if (
    lowerSearch.includes('allow_url_include') ||
    lowerSearch.includes('auto_prepend_file') ||
    lowerSearch.includes('auto_append_file') ||
    lowerSearch.includes('php://input') ||
    lowerSearch.includes('php://filter') ||
    lowerSearch.includes('php-cgi') ||
    lowerSearch.includes('-d+allow_url_include') ||
    lowerSearch.includes('-d+auto_prepend_file')
  ) {
    return true;
  }

  return false;
}

function createBlockedPhpResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Not Found',
      code: 'RESOURCE_NOT_FOUND',
      message: 'El recurso solicitado no existe en la plataforma educativa.'
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Shield': 'ISKOOL-DEFENSE-PERIMETER'
      }
    }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercepción Inmediata: Blindaje Perimetral Anti-PHP
  if (isPhpAttackVector(pathname, request.nextUrl.search)) {
    return createBlockedPhpResponse();
  }

  // 0. Sanitización Perimetral Zero-Trust: Eliminar cabeceras de identidad/tenant spoofed del cliente entrante
  const strippedRequestHeaders = new Headers(request.headers);
  strippedRequestHeaders.delete('x-resolved-tenant');
  strippedRequestHeaders.delete('x-resolved-tenant-id');
  strippedRequestHeaders.delete('x-user-id');
  strippedRequestHeaders.delete('x-user-role');
  strippedRequestHeaders.delete('x-user-tenant');
  strippedRequestHeaders.delete('x-school-id');

  const isOAuthPopupRoute =
    pathname.startsWith('/api/auth/google') ||
    pathname.startsWith('/api/auth/callback/google');

  // Redirección canónica de alias legales públicos hacia rutas reales
  if (pathname === '/privacy') {
    const res = NextResponse.redirect(new URL('/privacidad', request.url));
    applyDefensiveSecurityHeaders(res, false);
    return res;
  }
  if (pathname === '/terms') {
    const res = NextResponse.redirect(new URL('/terminos', request.url));
    applyDefensiveSecurityHeaders(res, false);
    return res;
  }

  // Protección anti-CSRF en mutaciones HTTP hacia /api/* (excluyendo webhooks externos)
  const isApiMutation =
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase()) &&
    !pathname.startsWith('/api/webhooks/') &&
    !pathname.startsWith('/api/mail/inbound');
  const reqHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase().split(',')[0].trim();
  if (isApiMutation) {
    const originHeader = request.headers.get('origin');
    const secFetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
    let csrfBlocked = secFetchSite === 'cross-site';
    if (!csrfBlocked && originHeader && reqHost) {
      try {
        const originHost = new URL(originHeader).host.toLowerCase();
        if (originHost !== reqHost) {
          csrfBlocked = true;
        }
      } catch {
        csrfBlocked = true;
      }
    }
    if (csrfBlocked) {
      const csrfRes = NextResponse.json(
        { error: 'Solicitud de origen cruzado bloqueada por protección anti-CSRF.', code: 'CSRF_ORIGIN_MISMATCH' },
        { status: 403 }
      );
      applyDefensiveSecurityHeaders(csrfRes, false);
      return csrfRes;
    }
  }

  // Excluir únicamente la vitrina pública /crm (NO /admin/crm) tras limpiar cabeceras spoofed
  if (pathname === '/crm' || pathname.startsWith('/crm/')) {
    const res = NextResponse.next({ request: { headers: strippedRequestHeaders } });
    applyDefensiveSecurityHeaders(res, false, isOAuthPopupRoute);
    return res;
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

  const querySchoolId = request.nextUrl.searchParams.get('school_id') || request.nextUrl.searchParams.get('schoolId') || request.nextUrl.searchParams.get('tenantId');
  const isIbimeSchool = querySchoolId === 'sch-ibime' || querySchoolId === 'ibime' || querySchoolId === 'IBIME' || querySchoolId === 'e1000000-0000-0000-0000-000000000001';
  const isSharedAcademicPath =
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/planeaciones') ||
    pathname.startsWith('/portal-ceo') ||
    pathname.startsWith('/portal/ceo') ||
    pathname.startsWith('/api/admin/organization') ||
    pathname.startsWith('/api/mail') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api/studio') ||
    pathname.startsWith('/coordinator') ||
    pathname.startsWith('/api/billing') ||
    pathname.startsWith('/api/v1/curriculum') ||
    pathname.startsWith('/api/fiscal') ||
    pathname.startsWith('/api/store') ||
    pathname.startsWith('/api/oracle') ||
    pathname.startsWith('/control-remoto-qr') ||
    pathname.startsWith('/api/languages') ||
    pathname.startsWith('/checkout');
  const isIbimeCookieActive = Boolean(ibimeCookie && !iskoolCookie);

  const isIbimeHost = host.startsWith('ibime.') || host.includes('ibime');
  const isAppHost = host.startsWith('app.') || host.includes('app.iskool.mx');
  const isIbimePath = pathname.startsWith('/ibime') || pathname.startsWith('/api/v1/ibime') || pathname === '/02DJoUJSkwYQZjn' || pathname.startsWith('/02DJoUJSkwYQZjn/');

  // En app.iskool.mx, la raíz abre directamente el login para usuarios sin sesión activa
  if (isAppHost && pathname === '/') {
    if (!iskoolCookie && !ibimeCookie && !bearerToken) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
  }

  // Si un usuario o directivo de IBIME navega a /director, transferirlo limpiamente a su portal institucional
  if (pathname === '/director' || pathname.startsWith('/director/')) {
    if (ibimeCookie || isIbimeSchool || isIbimeHost) {
      const res = NextResponse.redirect(new URL('/ibime/portal', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
  }

  const targetTenantRequired: TenantId = (isIbimePath || isIbimeHost || isIbimeSchool || (isIbimeCookieActive && isSharedAcademicPath)) ? 'ibime' : 'iskool';

  const isIskoolProtected = ISKOOL_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isIbimeProtected = IBIME_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith('/api/v1/ibime');
  const isIntegrationApi = pathname.startsWith('/api/v1/integration');
  const isProtected = isIskoolProtected || isIbimeProtected || isIntegrationApi;

  const isInboundWebhookPost =
    pathname === '/api/mail/inbound' &&
    request.method.toUpperCase() === 'POST' &&
    Boolean(request.headers.get('x-inbound-webhook-secret')?.trim());

  // Si la ruta es pública, de autenticación o webhook entrante con cabecera secreta verificada en ruta,
  // permitir paso directo inyectando el tenant resuelto sanitizado.
  // NUNCA abortar con 404 en /login o /ibime/login ante presencia de cookies del tenant contrario
  if (isPublicOrAuthPath(pathname) || !isProtected || isInboundWebhookPost) {
    const requestHeaders = new Headers(strippedRequestHeaders);
    requestHeaders.set('x-resolved-tenant', targetTenantRequired);
    requestHeaders.set('x-resolved-tenant-id', targetTenantRequired);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.headers.set('x-resolved-tenant', targetTenantRequired);
    response.headers.set('x-resolved-tenant-id', targetTenantRequired);
    applyDefensiveSecurityHeaders(response, isAppHost, isOAuthPopupRoute);
    return response;
  }

  // 2. Extracción y Resolución Determinista de Credenciales Criptográficas Exclusivas
  let candidateToken: string | null = null;

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
    const response = NextResponse.json(
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
    applyDefensiveSecurityHeaders(response, isAppHost, isOAuthPopupRoute);
    return response;
  }

  // Helper para reescribir a /404 con cabeceras anti-caché y Vary (para navegaciones HTML y RSC de página)
  function createCrossTenantRewrite404Response() {
    const response = NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Vary', 'Accept, Next-Action, RSC, Cookie, x-tenant-id');
    applyDefensiveSecurityHeaders(response, isAppHost, isOAuthPopupRoute);
    return response;
  }

  if (!candidateToken) {
    if (isApiRequest) {
      const res = NextResponse.json(
        {
          error: 'Autenticación requerida. No se detectó una sesión válida para este recurso.',
          code: 'UNAUTHENTICATED'
        },
        { status: 401 }
      );
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }

    const loginUrl = new URL(targetTenantRequired === 'ibime' ? '/ibime/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('tenant', targetTenantRequired);
    const res = NextResponse.redirect(loginUrl);
    applyDefensiveSecurityHeaders(res, isAppHost);
    return res;
  }

  // 3. Verificación Criptográfica Estricta de la Carga Útil
  let verifiedUser = await verifyMultiTenantToken(candidateToken);
  let fallbackVerified: Awaited<ReturnType<typeof verifySessionToken>> = null;
  let userRole = verifiedUser?.role || '';
  let userTenant: TenantId = verifiedUser?.tenant_id || 'iskool';
  let userId = verifiedUser?.id || '';

  if (!verifiedUser) {
    fallbackVerified = await verifySessionToken(candidateToken);
    if (fallbackVerified) {
      userId = fallbackVerified.id;
      userRole = fallbackVerified.role;
      userTenant = (fallbackVerified.tenant_id as TenantId) || 'iskool';
    } else {
      if (isApiRequest) {
        const res = NextResponse.json(
          {
            error: 'Firma criptográfica de sesión inválida o token expirado.',
            code: 'INVALID_SESSION_SIGNATURE'
          },
          { status: 401 }
        );
        applyDefensiveSecurityHeaders(res, isAppHost);
        return res;
      }
      const loginUrl = new URL(targetTenantRequired === 'ibime' ? '/ibime/login' : '/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_session');
      const res = NextResponse.redirect(loginUrl);
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
  }

  const activeUser = verifiedUser || fallbackVerified;
  const userSchoolId = (activeUser?.school_id || '').toLowerCase();
  const userEmailLower = (activeUser?.email || '').toLowerCase();
  const isDemoAccount = userSchoolId === 'sch-demo-0001' || userEmailLower.startsWith('demo.');
  const isSuperUser = !isDemoAccount && userRole === 'superadmin';

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
    if (pathname === '/director' || pathname.startsWith('/director/')) {
      const res = NextResponse.redirect(new URL('/ibime/portal', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (!isSuperUser) {
      if (isJsonExpected) {
        return createCrossTenantNotFoundResponse();
      }
      return createCrossTenantRewrite404Response();
    }
  }

  // 5. Control de Acceso Basado en Roles (RBAC)
  if (userRole === 'student' || userRole === 'parent') {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/director') ||
      pathname.startsWith('/coordinator') ||
      pathname.startsWith('/portal-ceo') ||
      pathname.startsWith('/portal/ceo') ||
      pathname.startsWith('/billing') ||
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/superuser') ||
      pathname.startsWith('/ibime/admin') ||
      pathname.startsWith('/ibime/coordinacion') ||
      (userRole === 'parent' && pathname.startsWith('/student'))
    ) {
      const targetLanding = userRole === 'parent' ? '/parent' : '/student';
      const res = NextResponse.redirect(new URL(targetLanding, request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
  }

  if ((pathname.startsWith('/superadmin') || pathname.startsWith('/superuser')) && userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'ceo') {
    const fallbackUrl = userRole === 'teacher' ? '/teacher' : userRole === 'student' ? '/student' : '/admin';
    const res = NextResponse.redirect(new URL(fallbackUrl, request.url));
    applyDefensiveSecurityHeaders(res, isAppHost);
    return res;
  }

  // Redirección canónica de rutas lógicas hacia sus destinos oficiales (evita 404 en alias)
  if (!isJsonExpected && !isServerAction) {
    if (pathname === '/superadmin') {
      const res = NextResponse.redirect(new URL('/superuser', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/billing') {
      const res = NextResponse.redirect(new URL('/coordinator/billing', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/kardex') {
      const res = NextResponse.redirect(new URL('/ibime/portal?tab=academico', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/director' || pathname === '/ibime/admin') {
      const res = NextResponse.redirect(new URL('/ibime/portal?view=ceo', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/coordinacion') {
      const res = NextResponse.redirect(new URL('/ibime/portal?tab=sedes', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/billing') {
      const res = NextResponse.redirect(new URL('/ibime/portal?tab=finanzas', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/teacher') {
      const res = NextResponse.redirect(new URL('/teacher', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
    if (pathname === '/ibime/student') {
      const res = NextResponse.redirect(new URL('/student', request.url));
      applyDefensiveSecurityHeaders(res, isAppHost);
      return res;
    }
  }

  // 6. Inyección de Headers Confiables hacia Server Components
  const requestHeaders = new Headers(strippedRequestHeaders);
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
  applyDefensiveSecurityHeaders(response, isAppHost, isOAuthPopupRoute);

  return response;
}

function applyDefensiveSecurityHeaders(response: NextResponse, isAppHost = false, isOAuthPopupRoute = false) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), autoplay=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), geolocation=(), browsing-topics=()');
  response.headers.set('Cross-Origin-Opener-Policy', isOAuthPopupRoute ? 'same-origin-allow-popups' : 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('X-XSS-Protection', '0');

  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrcDirective = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.google.com https://www.gstatic.com https://www.youtube.com https://s.ytimg.com"
    : "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.google.com https://www.gstatic.com https://www.youtube.com https://s.ytimg.com";

  // CSP perimetral de máxima robustez según OWASP ASVS V14.4 / CASA Tier 3
  if (!response.headers.has('Content-Security-Policy')) {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        scriptSrcDirective,
        "style-src 'self' 'unsafe-inline' https:",
        "font-src 'self' data: https:",
        "img-src 'self' data: blob: https:",
        "media-src 'self' data: blob: https:",
        "connect-src 'self' https: wss:",
        "frame-src 'self' blob: https://www.youtube.com https://www.youtube-nocookie.com https://phet.colorado.edu https://www.walter-fendt.de https://www.ophysics.com https://www.falstad.com https://www.myphysicslab.com https://www.physicsclassroom.com https://www.geogebra.org https://www.desmos.com https://graspablemath.com https://visualgo.net https://demonstrations.wolfram.com https://toytheater.com https://www.mathopenref.com https://embed.molview.org https://ptable.com https://chemcollective.org https://www.rcsb.org https://learn.genetics.utah.edu https://stellarium-web.org https://www.solarsystemscope.com https://earth.nullschool.net https://wokwi.com https://makecode.microbit.org https://arcade.makecode.com https://snap.berkeley.edu https://trinket.io https://musiclab.chromeexperiments.com https://www.chronas.org https://www.gapminder.org https://www.beepbox.co",
        "frame-ancestors 'self'",
        "form-action 'self' https://accounts.google.com",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    );
  }

  // Directiva de búsqueda: en app.iskool.mx se aplica noindex estricto para evitar indexación de portales escolares
  if (isAppHost) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de la aplicación excluyendo explícitamente:
     * - _next/static, _next/image, _next/data (archivos de compilación de Next.js)
     * - /404, /not-found (páginas de error para prevenir bucles de rewrite infinitos)
     * - favicon.ico, sitemap.xml, manifest.webmanifest, robots.txt
     * - assets estáticos institucionales (brand/, .svg, .png, .webp, .avif, etc.)
     */
    '/((?!_next/static|_next/image|_next/data|_next/|favicon\\.ico|sitemap\\.xml|manifest\\.webmanifest|robots\\.txt|404|not-found|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|eot|mp4|webm|wav|mp3|pdf|txt)$).*)',
  ]
};
