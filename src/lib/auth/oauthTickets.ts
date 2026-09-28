/**
 * ============================================================================
 * GESTOR DE TICKETS CRIPTOGRÁFICOS DE AUTORIZACIÓN OAUTH2 / PKCE
 * Generación y validación sin estado (Stateless & Tamper-Proof)
 * ============================================================================
 */

import { TenantId, MultiTenantRole } from './multiTenantSession';

const OAUTH_SECRET =
  process.env.OAUTH_SECRET ||
  process.env.SESSION_SECRET ||
  'iskool_oauth_ticket_secret_key_2026_pkce_verified';

export interface OAuthTicketPayload {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  tenantId: TenantId;
  userId: string;
  email: string;
  role: MultiTenantRole;
  schoolId: string;
  firstName?: string;
  lastName?: string;
  iat: number;
  exp: number;
  nonce?: string;
}

// Registro en memoria de códigos consumidos para prevenir ataques de repetición (Replay Attacks)
const consumedCodes = new Set<string>();

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
 * Genera un código de autorización firmado con HMAC-SHA256 con vida útil de 120 segundos.
 */
export async function createAuthorizationCodeTicket(data: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  tenantId: TenantId;
  userId: string;
  email: string;
  role: MultiTenantRole;
  schoolId?: string;
  firstName?: string;
  lastName?: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: OAuthTicketPayload = {
    clientId: data.clientId,
    redirectUri: data.redirectUri,
    codeChallenge: data.codeChallenge,
    codeChallengeMethod: 'S256',
    tenantId: data.tenantId,
    userId: data.userId,
    email: data.email,
    role: data.role,
    schoolId: data.schoolId || (data.tenantId === 'ibime' ? 'sch-ibime-central' : 'sch-iskool-default'),
    firstName: data.firstName,
    lastName: data.lastName,
    iat: now,
    exp: now + 120, // 2 minutos máximo de vigencia
    nonce: globalThis.crypto.randomUUID()
  };

  const enc = new TextEncoder();
  const payloadEncoded = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await getCryptoKey(OAUTH_SECRET);
  const signatureBytes = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(payloadEncoded)
  );
  const signature = toBase64Url(new Uint8Array(signatureBytes));

  return `${payloadEncoded}.${signature}`;
}

/**
 * Valida el código de autorización, verifica la firma HMAC, evalúa el Code Verifier con PKCE (SHA-256)
 * y garantiza que no haya sido consumido previamente (Anti-Replay).
 */
export async function verifyAndConsumeAuthorizationCode(params: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<OAuthTicketPayload> {
  const { code, clientId, redirectUri, codeVerifier } = params;

  if (!code || typeof code !== 'string') {
    throw new Error('Código de autorización inválido o ausente.');
  }

  // 1. Detección de Replay Attack
  if (consumedCodes.has(code)) {
    throw new Error('Código de autorización ya consumido. Posible ataque de reproducción.');
  }

  const parts = code.split('.');
  if (parts.length !== 2) {
    throw new Error('Formato de código de autorización corrupto.');
  }

  const [payloadEncoded, signature] = parts;
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const key = await getCryptoKey(OAUTH_SECRET);
  const signatureBytes = fromBase64Url(signature);

  const isValidSignature = await globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes as unknown as BufferSource,
    enc.encode(payloadEncoded)
  );

  if (!isValidSignature) {
    throw new Error('Firma criptográfica del código de autorización inválida.');
  }

  const payload: OAuthTicketPayload = JSON.parse(
    dec.decode(fromBase64Url(payloadEncoded))
  );

  // 2. Validación de Expiración
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('El código de autorización ha expirado.');
  }

  // 3. Validación de Parámetros de Enlace
  if (payload.clientId !== clientId) {
    throw new Error('El client_id no coincide con el autorizado.');
  }

  if (payload.redirectUri !== redirectUri) {
    throw new Error('El redirect_uri no coincide con el registrado en el ticket.');
  }

  // 4. Verificación Estricta de PKCE (RFC 7636) con SHA-256
  const verifierBytes = enc.encode(codeVerifier);
  const verifierHashed = await globalThis.crypto.subtle.digest('SHA-256', verifierBytes);
  const computedChallenge = toBase64Url(new Uint8Array(verifierHashed));

  if (computedChallenge !== payload.codeChallenge) {
    throw new Error('Validación PKCE fallida: el code_verifier no corresponde al code_challenge.');
  }

  // 5. Invalida el código para consumo único
  consumedCodes.add(code);

  return payload;
}
