import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { injectEmailIntoCache } from '@/lib/services/imapClientService';
import { signSessionToken } from '@/lib/sessionToken';
import { resolveCanonicalDemoUser } from '@/lib/auth/demoCatalog';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    if (error) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>Autorización denegada</title>
          </head>
          <body style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc;">
            <h2 style="color:#d93025;">Autorización denegada por Google</h2>
            <p>${error}</p>
            <script>setTimeout(function(){ if (window.opener) { window.close(); } else { window.location.href = '/login'; } }, 3000);</script>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (!code) {
      return NextResponse.json({ error: 'Código de autorización faltante' }, { status: 400 });
    }

    // 1. Parsear el estado enviado a Google
    const stateRaw = searchParams.get('state');
    let targetTenantId = 'e1000000-0000-0000-0000-000000000001';
    let flow: 'login' | 'workspace_connect' = 'login';
    let redirectUrl = '';

    if (stateRaw) {
      try {
        const parsed = JSON.parse(stateRaw);
        if (parsed.tenantId) targetTenantId = parsed.tenantId;
        if (parsed.flow) flow = parsed.flow;
        if (parsed.redirect) redirectUrl = parsed.redirect;
      } catch {
        if (stateRaw === 'admin_inbox') {
          flow = 'workspace_connect';
        } else {
          targetTenantId = stateRaw;
        }
      }
    }

    // 2. Intercambiar código por tokens de Google
    const tokens = await GoogleOAuthService.exchangeCodeForTokens(code, origin);

    // =========================================================================
    // FLUJO A: Conexión de Correo Directivo (Workspace Connect)
    // =========================================================================
    if (flow === 'workspace_connect') {
      let realEmailsCount = 0;
      try {
        const realEmails = await GoogleOAuthService.fetchRealGmailEmails(
          tokens.accessToken,
          tokens.email,
          30,
          targetTenantId
        );
        realEmailsCount = realEmails.length;

        const tenantIdsToInject = Array.from(new Set([
          targetTenantId,
          'e1000000-0000-0000-0000-000000000001',
          'sch-ibime',
          'sch-default'
        ]));

        for (const tId of tenantIdsToInject) {
          for (const em of realEmails) {
            injectEmailIntoCache(tId, em);
          }
        }
      } catch (mailSyncErr) {
        console.warn('Nota: Sincronización de lectura Gmail no disponible o sin scope readonly:', mailSyncErr);
      }

      const safeEmail = JSON.stringify(tokens.email);
      const safeName = JSON.stringify(tokens.name || 'Google Workspace');
      const safeCount = realEmailsCount;
      const safeOrigin = JSON.stringify(origin);

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cuenta Institucional Conectada - ISkool</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; max-width: 420px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; color: #15803d; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
    h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: 800; }
    p { margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.5; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h2>Cuenta de Google Conectada</h2>
    <p>Se vinculó exitosamente <strong>${tokens.email}</strong> para la gestión institucional y comunicados de dirección.</p>
    <div class="badge">Conexión completada</div>
  </div>
  <script>
    (function() {
      var authData = {
        type: 'PROVIDER_OAUTH_SUCCESS',
        provider: 'google',
        email: ${safeEmail},
        providerName: ${safeName},
        emailsCount: ${safeCount},
        timestamp: new Date().toISOString()
      };

      if (window.opener) {
        window.opener.postMessage(authData, ${safeOrigin});
        setTimeout(function() {
          window.close();
        }, 1200);
      } else {
        setTimeout(function() {
          window.location.href = '/admin?tab=inbox&auth=success&email=' + encodeURIComponent(${safeEmail});
        }, 1500);
      }
    })();
  </script>
</body>
</html>`;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // =========================================================================
    // FLUJO B: Inicio de Sesión Institucional Limpio (Login SSO)
    // =========================================================================
    const userEmail = tokens.email.toLowerCase().trim();
    const isIbimeUser = userEmail.includes('ibime');
    const resolvedTenant = isIbimeUser ? 'ibime' : 'iskool';

    // Resolver usuario canónico institucional si existe en catálogo
    const canonicalUser = resolveCanonicalDemoUser(userEmail);

    let resolvedRole = canonicalUser?.role || 'student';
    if (!canonicalUser) {
      if (userEmail.includes('profesor') || userEmail.includes('docente') || userEmail.includes('teacher')) {
        resolvedRole = 'teacher';
      } else if (userEmail.includes('director') || userEmail.includes('directora')) {
        resolvedRole = 'director';
      } else if (userEmail.includes('coordinacion') || userEmail.includes('coord')) {
        resolvedRole = 'coordinator';
      } else if (userEmail.includes('cobranza') || userEmail.includes('finanzas')) {
        resolvedRole = 'billing';
      } else if (userEmail.includes('admin') || userEmail.includes('superadmin')) {
        resolvedRole = 'admin';
      } else if (userEmail.includes('padre') || userEmail.includes('tutor') || userEmail.includes('familia')) {
        resolvedRole = 'parent';
      }
    }

    const nameParts = (tokens.name || 'Usuario').trim().split(' ');
    const firstName = canonicalUser?.first_name || nameParts[0] || 'Usuario';
    const lastName = canonicalUser?.last_name || nameParts.slice(1).join(' ') || '';
    const userId = canonicalUser?.id || `usr-g-${Buffer.from(userEmail).toString('hex').slice(0, 16)}`;
    const schoolId = canonicalUser?.school_id || (isIbimeUser ? 'sch-ibime' : 'sch-default');

    // Firmar token de sesión criptográfico HMAC-SHA256
    const sessionToken = await signSessionToken({
      id: userId,
      email: userEmail,
      role: resolvedRole,
      school_id: schoolId,
      tenant_id: resolvedTenant,
      first_name: firstName,
      last_name: lastName
    });

    // Determinar ruta de destino
    let targetPath = '/student';
    if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
      targetPath = redirectUrl;
    } else {
      switch (resolvedRole) {
        case 'superadmin':
        case 'admin':
        case 'owner':
        case 'ceo':
          targetPath = '/admin';
          break;
        case 'director':
          targetPath = isIbimeUser ? '/ibime/portal?view=ceo' : '/director';
          break;
        case 'coordinator':
          targetPath = isIbimeUser ? '/ibime/portal?tab=sedes' : '/coordinator';
          break;
        case 'billing':
          targetPath = isIbimeUser ? '/ibime/portal?tab=finanzas' : '/coordinator/billing';
          break;
        case 'teacher':
          targetPath = isIbimeUser ? '/ibime/portal?tab=docentes' : '/teacher';
          break;
        case 'parent':
          targetPath = '/parent';
          break;
        case 'student':
        default:
          targetPath = '/student';
          break;
      }
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = resolvedTenant === 'ibime' ? 'ibime_session' : 'iskool_session';
    const safeTarget = JSON.stringify(targetPath);
    const safeOrigin = JSON.stringify(origin);

    const loginHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Acceso Correcto - ISkool</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 36px; max-width: 420px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.4); }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); color: #60a5fa; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
    h2 { margin: 0 0 8px 0; font-size: 19px; font-weight: 800; color: white; }
    p { margin: 0 0 20px 0; font-size: 13px; color: #94a3b8; line-height: 1.5; }
    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #38bdf8; border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <h2>Sesión Iniciada</h2>
    <p>Bienvenido, <strong>${firstName} ${lastName}</strong>. Ingresando a tu portal institucional...</p>
    <div class="spinner"></div>
  </div>
  <script>
    (function() {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS', target: ${safeTarget} }, ${safeOrigin});
        setTimeout(function() {
          window.close();
        }, 800);
      } else {
        setTimeout(function() {
          window.location.replace(${safeTarget});
        }, 700);
      }
    })();
  </script>
</body>
</html>`;

    const response = new NextResponse(loginHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

    // Inyectar cookie HttpOnly de sesión
    response.cookies.set({
      name: cookieName,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction || origin.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600
    });

    // Inyectar cookie de tenant
    response.cookies.set({
      name: 'tenant-id',
      value: resolvedTenant,
      httpOnly: false,
      secure: isProduction || origin.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600
    });

    return response;
  } catch (error: any) {
    console.error('Error en Google OAuth Callback:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Error de Autenticación</title>
        </head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2 style="color:#d93025;">Error de Autenticación</h2>
          <p>${error.message || 'Error interno procesando Google OAuth'}</p>
          <a href="/login" style="color:#1a73e8; font-weight:bold;">Volver al Inicio</a>
        </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
