import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/googleOAuthService';
import { injectEmailIntoCache } from '@/lib/services/imapClientService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    if (error) {
      return new NextResponse(
        `<html>
          <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2 style="color:#d93025;">Autorización denegada por Google</h2>
            <p>${error}</p>
            <script>setTimeout(function(){ window.close(); }, 3000);</script>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (!code) {
      return NextResponse.json({ error: 'Código de autorización faltante' }, { status: 400 });
    }

    // Parsear tenantId desde el parámetro state
    const stateRaw = searchParams.get('state');
    let targetTenantId = 'e1000000-0000-0000-0000-000000000001';
    if (stateRaw) {
      try {
        const parsed = JSON.parse(stateRaw);
        if (parsed.tenantId) targetTenantId = parsed.tenantId;
      } catch {
        if (stateRaw !== 'admin_inbox') targetTenantId = stateRaw;
      }
    }

    // 1. Intercambiar código por tokens reales con Google
    const tokens = await GoogleOAuthService.exchangeCodeForTokens(code, origin);

    // 2. Descargar correos reales de la cuenta de Google mediante la Gmail API
    const realEmails = await GoogleOAuthService.fetchRealGmailEmails(tokens.accessToken, tokens.email, 30);

    // 3. Inyectar correos reales en la caché del buzón para todos los tenants relevantes
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

    // 4. Retornar página de éxito y comunicar con la ventana principal de ISkool
    const safeEmail = JSON.stringify(tokens.email);
    const safeName = JSON.stringify(tokens.name || 'Google Workspace');
    const safeCount = realEmails.length;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Google OAuth Exitoso - ISkool</title>
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
    <p>Se autenticó exitosamente <strong>${tokens.email}</strong> y se sincronizaron <strong>${safeCount} correos reales</strong> desde tu Gmail.</p>
    <div class="badge">Sincronización en curso...</div>
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
        window.opener.postMessage(authData, '*');
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
  } catch (error: any) {
    console.error('Error en Google OAuth Callback:', error);
    return new NextResponse(
      `<html>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2 style="color:#d93025;">Error de Autenticación</h2>
          <p>${error.message || 'Error interno procesando Google OAuth'}</p>
          <a href="/admin" style="color:#1a73e8; font-weight:bold;">Volver a ISkool</a>
        </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
