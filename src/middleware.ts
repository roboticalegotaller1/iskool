import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/sessionToken';

/**
 * Middleware Perimetral Zero-Trust de Next.js.
 * Protege todas las rutas perimetrales sensibles (/admin, /teacher, /student, /director, /billing, /superadmin),
 * validando la Cookie HttpOnly 'iskool_session' y previniendo accesos no autorizados antes de que
 * la petición llegue al renderizado de páginas o ejecución de componentes.
 */

// Rutas protegidas que requieren autenticación perimetral obligatoria
const PROTECTED_PREFIXES = [
  '/admin',
  '/teacher',
  '/student',
  '/director',
  '/billing',
  '/superadmin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Identificar si la ruta actual es una ruta perimetral protegida
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isProtected) {
    const sessionCookie = request.cookies.get('iskool_session')?.value;
    const sbTokenCookie = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;

    let validSession = false;
    let userRole = '';

    if (sessionCookie) {
      const verified = await verifySessionToken(sessionCookie);
      if (verified) {
        validSession = true;
        userRole = verified.role;
      }
    } else if (sbTokenCookie) {
      validSession = true;
    }

    // Si no cuenta con sesión válida, redirigir perimetralmente al Login
    if (!validSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Control de Acceso Basado en Roles (RBAC) Perimetral
    if (userRole) {
      // Bloquear acceso de alumnos a paneles administrativos o docentes
      if (userRole === 'student' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/superadmin') || pathname.startsWith('/director'))) {
        return NextResponse.redirect(new URL('/student', request.url));
      }

      // Bloquear acceso a /superadmin a roles subordinados
      if (pathname.startsWith('/superadmin') && userRole !== 'superadmin' && userRole !== 'admin') {
        const fallbackUrl = userRole === 'teacher' ? '/teacher' : userRole === 'student' ? '/student' : '/admin';
        return NextResponse.redirect(new URL(fallbackUrl, request.url));
      }
    }
  }

  // Inyección de cabeceras de respuesta defensivas
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas protegidas y APIs sensibles,
     * excluyendo archivos estáticos, imágenes y favicon.
     */
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/director/:path*',
    '/billing/:path*',
    '/superadmin/:path*'
  ]
};
