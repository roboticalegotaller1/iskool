const DEFAULT_CANONICAL_ORIGIN = 'https://iskool.mx';

function getAllowedOriginHostnames(): Set<string> {
  const allowed = new Set<string>([
    'iskool.mx',
    'www.iskool.mx',
    'app.iskool.mx',
    'ibime.iskool.mx',
  ]);

  for (const envUrl of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (envUrl) {
      try {
        const parsed = new URL(envUrl.trim());
        if (parsed.hostname) {
          allowed.add(parsed.hostname.toLowerCase());
        }
      } catch {
        // Ignorar variable de entorno con URL inválida
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    allowed.add('localhost');
    allowed.add('127.0.0.1');
  }

  return allowed;
}

function validateAllowedHostHeader(
  rawHost: string,
  allowedHostnames: Set<string>
): { host: string; hostname: string } | null {
  const trimmed = rawHost.trim().toLowerCase();
  if (!trimmed || /[\s/@\\?#]/.test(trimmed)) {
    return null;
  }
  try {
    const parsed = new URL(`https://${trimmed}`);
    if (
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (!allowedHostnames.has(hostname)) {
      return null;
    }
    return { host: parsed.host.toLowerCase(), hostname };
  } catch {
    return null;
  }
}

export function resolveOAuthOrigin(reqOrigin?: string, headers?: Headers): string {
  const fallbackOrigin = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CANONICAL_ORIGIN).replace(/\/$/, '');
  const allowedHostnames = getAllowedOriginHostnames();

  const rawForwardedHost = headers?.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (rawForwardedHost) {
    const validated = validateAllowedHostHeader(rawForwardedHost, allowedHostnames);
    if (!validated) {
      return fallbackOrigin;
    }

    const isLocalHost = validated.hostname === 'localhost' || validated.hostname === '127.0.0.1';
    if (!isLocalHost) {
      return `https://${validated.host}`;
    }

    const isBehindProxy =
      Boolean(headers?.get('cloudfront-viewer-country')) ||
      Boolean(headers?.get('via')?.toLowerCase().includes('cloudfront'));
    if (!isBehindProxy && process.env.NODE_ENV !== 'production') {
      return `http://${validated.host}`;
    }
    return fallbackOrigin;
  }

  const rawOrigin = (reqOrigin || 'http://localhost:3000').replace(/\/$/, '');
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(rawOrigin);
  } catch {
    return fallbackOrigin;
  }

  const originHostname = parsedOrigin.hostname.toLowerCase();
  const isLocal = originHostname === 'localhost' || originHostname === '127.0.0.1';
  const isProxyOrHttpsLocal =
    (isLocal && parsedOrigin.protocol === 'https:') ||
    Boolean(headers?.get('cloudfront-viewer-country')) ||
    Boolean(headers?.get('via')?.toLowerCase().includes('cloudfront')) ||
    (isLocal && process.env.NODE_ENV === 'production' && !process.env.VITEST);

  if (isLocal && isProxyOrHttpsLocal) {
    return fallbackOrigin;
  }

  if (!allowedHostnames.has(originHostname)) {
    return fallbackOrigin;
  }

  return `${parsedOrigin.protocol}//${parsedOrigin.host}`;
}
