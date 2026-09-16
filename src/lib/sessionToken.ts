const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || 'iskool_zerotrust_hmac_secret_2026_institutional_secure';

export interface SecureSessionPayload {
  id: string;
  email?: string;
  role: string;
  school_id?: string;
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

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
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
  first_name?: string;
  last_name?: string;
}, expiresInSeconds: number = 7 * 24 * 3600): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SecureSessionPayload = {
    ...data,
    iat: now,
    exp: now + expiresInSeconds
  };

  const enc = new TextEncoder();
  const payloadEncoded = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await getCryptoKey(SESSION_SECRET);
  const signatureBytes = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payloadEncoded));
  const signature = toBase64Url(new Uint8Array(signatureBytes));

  return `${payloadEncoded}.${signature}`;
}

/**
 * Valida la firma criptográfica HMAC y la expiración de un token de sesión.
 * Utiliza comparación criptográfica en tiempo constante nativa de WebCrypto.
 * Compatible universalmente con Node.js y Edge Runtime.
 */
export async function verifySessionToken(token: string): Promise<SecureSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const key = await getCryptoKey(SESSION_SECRET);
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
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
