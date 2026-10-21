import { getSecuritySecret } from '@/lib/security/secretManager';

function getSessionSecret(): string {
  return getSecuritySecret('SESSION_SECRET');
}

export interface SecureSessionPayload {
  id: string;
  email?: string;
  role: string;
  school_id?: string;
  tenant_id?: 'iskool' | 'ibime';
  institution_metadata?: Record<string, any>;
  first_name?: string;
  last_name?: string;
  iat: number;
  exp: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

// Caché de clave criptográfica en memoria para evitar reimportaciones continuas en WebCrypto
let cachedSecret: string | null = null;
let cachedCryptoKeyPromise: Promise<CryptoKey> | null = null;

// Caché LRU de tokens validados para responder en < 0.01ms en peticiones paralelas / middleware
const tokenVerificationLru = new Map<string, { payload: SecureSessionPayload; expiresAtMs: number }>();
const MAX_VERIFIED_TOKENS = 1000;

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  if (cachedSecret === secret && cachedCryptoKeyPromise) {
    return cachedCryptoKeyPromise;
  }
  cachedSecret = secret;
  const enc = new TextEncoder();
  cachedCryptoKeyPromise = globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return cachedCryptoKeyPromise;
}

/**
 * Genera un token de sesión firmado criptográficamente con HMAC-SHA256.
 * Previene la manipulación de cargas útiles y garantiza autenticidad en Cookies HttpOnly.
 * Compatible universalmente con Node.js y Edge Runtime (V8 isolates).
 */
export async function signSessionToken(data: {
  id: string;
  email?: string;
  role: string;
  school_id?: string;
  tenant_id?: 'iskool' | 'ibime';
  institution_metadata?: Record<string, any>;
  first_name?: string;
  last_name?: string;
}, expiresInSeconds: number = 7 * 24 * 3600): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SecureSessionPayload = {
    ...data,
    tenant_id: data.tenant_id || 'iskool',
    iat: now,
    exp: now + expiresInSeconds
  };

  const enc = new TextEncoder();
  const payloadEncoded = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await getCryptoKey(getSessionSecret());
  const signatureBytes = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payloadEncoded));
  const signature = toBase64Url(new Uint8Array(signatureBytes));

  const fullToken = `${payloadEncoded}.${signature}`;
  
  // Registrar de inmediato en caché LRU para evitar verificación subsiguiente
  if (tokenVerificationLru.size >= MAX_VERIFIED_TOKENS) {
    const oldestKey = tokenVerificationLru.keys().next().value;
    if (oldestKey) tokenVerificationLru.delete(oldestKey);
  }
  tokenVerificationLru.set(fullToken, {
    payload,
    expiresAtMs: Math.min(Date.now() + 60_000, payload.exp * 1000)
  });

  return fullToken;
}

/**
 * Valida la firma criptográfica HMAC y la expiración de un token de sesión.
 * Utiliza comparación criptográfica en tiempo constante nativa de WebCrypto con aceleración LRU.
 * Compatible universalmente con Node.js y Edge Runtime.
 */
export async function verifySessionToken(token: string): Promise<SecureSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const nowMs = Date.now();
  const cached = tokenVerificationLru.get(token);
  if (cached) {
    if (cached.expiresAtMs > nowMs) {
      return cached.payload;
    }
    tokenVerificationLru.delete(token);
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const key = await getCryptoKey(getSessionSecret());
    const signatureBytes = fromBase64Url(signature);

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(payloadEncoded)
    );

    if (!isValid) return null;

    const payloadJson = dec.decode(fromBase64Url(payloadEncoded));
    const payload: SecureSessionPayload = JSON.parse(payloadJson);

    // Verificar expiración temporal
    const nowSec = Math.floor(nowMs / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null;
    }

    // Almacenar en caché LRU para subsecuentes lecturas en la misma ventana de tiempo
    if (tokenVerificationLru.size >= MAX_VERIFIED_TOKENS) {
      const oldestKey = tokenVerificationLru.keys().next().value;
      if (oldestKey) tokenVerificationLru.delete(oldestKey);
    }
    tokenVerificationLru.set(token, {
      payload,
      expiresAtMs: Math.min(nowMs + 60_000, payload.exp * 1000)
    });

    return payload;
  } catch {
    return null;
  }
}
