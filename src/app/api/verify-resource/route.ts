import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import { validateApiAuth } from '@/lib/authValidator';
import { isPrivateOrReservedIp } from '@/lib/security/ssrfValidator';

export const runtime = 'nodejs';

// Limitador de tasa acotado en memoria por IP (30 req/min, mapa <= 1000 IPs)
const VERIFY_RATE_LIMIT_MAX_REQ = 30;
const VERIFY_RATE_LIMIT_WINDOW_MS = 60_000;
const VERIFY_RATE_LIMIT_MAX_KEYS = 1000;
const verifyRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'local-client';
}

function checkVerifyRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (verifyRateLimitBuckets.size >= VERIFY_RATE_LIMIT_MAX_KEYS && !verifyRateLimitBuckets.has(ip)) {
    for (const [k, v] of verifyRateLimitBuckets) {
      if (v.resetAt <= now) verifyRateLimitBuckets.delete(k);
    }
    while (verifyRateLimitBuckets.size >= VERIFY_RATE_LIMIT_MAX_KEYS) {
      const oldestKey = verifyRateLimitBuckets.keys().next().value;
      if (!oldestKey) break;
      verifyRateLimitBuckets.delete(oldestKey);
    }
  }
  const existing = verifyRateLimitBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    verifyRateLimitBuckets.set(ip, { count: 1, resetAt: now + VERIFY_RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= VERIFY_RATE_LIMIT_MAX_REQ) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Validador anti-SSRF para peticiones de verificación de recursos.
 * Bloquea esquemas no HTTP/HTTPS, loopback, metadatos en la nube y rangos privados RFC 1918.
 */
function isSafeUrl(rawUrl: string): { safe: boolean; reason?: string; parsed?: URL } {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Esquema de protocolo no permitido. Solo se admite http: y https:' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Bloqueo de localhost, loopback y hostnames de metadatos cloud
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === 'metadata.google.internal' ||
      hostname === '169.254.169.254'
    ) {
      return { safe: false, reason: 'Acceso a direcciones locales o metadatos restringido' };
    }

    // Bloqueo de rangos IPv4 privados (RFC 1918 y Link-Local)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const oct1 = Number(ipMatch[1]);
      const oct2 = Number(ipMatch[2]);
      if (oct1 === 10) return { safe: false, reason: 'Rango privado RFC 1918 (10.0.0.0/8) bloqueado' };
      if (oct1 === 127) return { safe: false, reason: 'Dirección de loopback bloqueada' };
      if (oct1 === 169 && oct2 === 254) return { safe: false, reason: 'Dirección link-local/metadatos (169.254.0.0/16) bloqueada' };
      if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return { safe: false, reason: 'Rango privado RFC 1918 (172.16.0.0/12) bloqueado' };
      if (oct1 === 192 && oct2 === 168) return { safe: false, reason: 'Rango privado RFC 1918 (192.168.0.0/16) bloqueado' };
      if (oct1 === 0) return { safe: false, reason: 'Dirección reservada (0.0.0.0/8) bloqueada' };
    }

    // Bloqueo de IPv6 privadas
    if (hostname.startsWith('[') || hostname.includes(':')) {
      return { safe: false, reason: 'Dirección IPv6 privada no permitida' };
    }

    return { safe: true, parsed };
  } catch {
    return { safe: false, reason: 'URL malformada o inválida' };
  }
}

/**
 * Endpoint de Verificación Forzada de Recursos en Tiempo Real con Protección SSRF
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkVerifyRateLimit(extractClientIp(req));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Límite de solicitudes de verificación de recursos excedido temporalmente. Intenta en unos segundos.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } }
      );
    }

    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'No autorizado. Se requiere sesión activa.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo JSON inválido o malformado.' }, { status: 400 });
    }
    const rawUrls: string[] = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);
    const urls: string[] = rawUrls
      .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      .slice(0, 25);

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    const results: Record<string, {
      isValid: boolean;
      statusCode?: number;
      title?: string;
      author?: string;
      checkedAt: string;
      error?: string;
    }> = {};

    await Promise.all(
      urls.map(async (rawUrl) => {
        const url = rawUrl.trim();
        const now = new Date().toISOString();

        // Verificación anti-SSRF preventiva
        const safetyCheck = isSafeUrl(url);
        if (!safetyCheck.safe) {
          results[url] = {
            isValid: false,
            error: `Bloqueado por política anti-SSRF: ${safetyCheck.reason}`,
            checkedAt: now
          };
          return;
        }

        // Blindaje contra DNS Rebinding: Resolver IP y validar que no pertenezca a redes privadas/internas
        if (safetyCheck.parsed?.hostname) {
          try {
            const lookups = await dns.lookup(safetyCheck.parsed.hostname, { all: true });
            const blockedIp = lookups.find((entry) => isPrivateOrReservedIp(entry.address));
            if (blockedIp || lookups.length === 0) {
              results[url] = {
                isValid: false,
                error: blockedIp
                  ? `Bloqueado por política anti-SSRF: Dirección IP resuelta (${blockedIp.address}) es privada o reservada`
                  : 'Sin registros DNS válidos',
                checkedAt: now
              };
              return;
            }
          } catch {
            results[url] = {
              isValid: false,
              error: 'No se pudo resolver el nombre de host en DNS',
              checkedAt: now
            };
            return;
          }
        }

        // 1. Caso: Video de YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(oembedUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
              },
            });
            clearTimeout(timeoutId);

            if (res.status === 200) {
              const data = await res.json();
              results[url] = {
                isValid: true,
                statusCode: 200,
                title: data.title,
                author: data.author_name,
                checkedAt: now,
              };
            } else {
              results[url] = {
                isValid: false,
                statusCode: res.status,
                error: res.status === 404 ? 'Video no encontrado o privado en YouTube' : `HTTP ${res.status}`,
                checkedAt: now,
              };
            }
          } catch (err: any) {
            results[url] = {
              isValid: false,
              error: err.name === 'AbortError' ? 'Tiempo de espera agotado al contactar YouTube' : err.message,
              checkedAt: now,
            };
          }
          return;
        }

        // 2. Caso: Portal Web o Enlace General
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
            },
          });
          clearTimeout(timeoutId);

          const isValid = res.status < 400;
          results[url] = {
            isValid,
            statusCode: res.status,
            checkedAt: now,
            error: isValid ? undefined : `HTTP ${res.status}`,
          };
        } catch (err: any) {
          // Si HEAD falla por CORS o restricciones del servidor, intentar GET ligero
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const getRes = await fetch(url, {
              method: 'GET',
              redirect: 'manual',
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISkoolVerifier/1.0',
              },
            });
            clearTimeout(timeoutId);
            const isValid = getRes.status < 400;
            results[url] = {
              isValid,
              statusCode: getRes.status,
              checkedAt: now,
              error: isValid ? undefined : `HTTP ${getRes.status}`,
            };
          } catch (innerErr: any) {
            results[url] = {
              isValid: false,
              error: innerErr.message,
              checkedAt: now,
            };
          }
        }
      })
    );

    return NextResponse.json({
      success: true,
      verifiedCount: Object.keys(results).length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error interno en la verificación',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message } : {})
      },
      { status: 500 }
    );
  }
}
