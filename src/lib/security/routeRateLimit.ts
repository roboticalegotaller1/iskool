/**
 * Limitador de tasa acotado en memoria por clave (IP/usuario) para endpoints del Motor de IA.
 * Incluye poda automática de entradas expiradas y tope duro de memoria para evitar fugas en contenedores.
 */
interface RateLimitBucket {
  count: number;
  resetAtMs: number;
}

const bucketsByScope = new Map<string, Map<string, RateLimitBucket>>();
const MAX_BUCKETS_PER_SCOPE = 2000;
const SWEEP_THRESHOLD = 400;

export interface RouteRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRouteRateLimit(
  scope: string,
  key: string,
  maxRequests: number,
  windowMs: number = 60_000
): RouteRateLimitResult {
  let store = bucketsByScope.get(scope);
  if (!store) {
    store = new Map<string, RateLimitBucket>();
    bucketsByScope.set(scope, store);
  }

  const now = Date.now();
  if (store.size >= SWEEP_THRESHOLD) {
    for (const [k, v] of store) {
      if (v.resetAtMs <= now) {
        store.delete(k);
      }
    }
    while (store.size >= MAX_BUCKETS_PER_SCOPE) {
      const oldestKey = store.keys().next().value;
      if (oldestKey === undefined) break;
      store.delete(oldestKey);
    }
  }

  const normalizedKey = (key || 'anonymous').slice(0, 160);
  const existing = store.get(normalizedKey);
  if (!existing || existing.resetAtMs <= now) {
    store.set(normalizedKey, { count: 1, resetAtMs: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
  if (existing.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds,
  };
}

export function extractClientRateLimitKey(req: Request, userId?: string): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  return `ip:${fwd.split(',')[0].trim()}`;
}
