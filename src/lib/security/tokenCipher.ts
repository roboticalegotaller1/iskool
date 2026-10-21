/**
 * @file tokenCipher.ts
 * @description Módulo de cifrado simétrico autenticado AES-256-GCM para protección de secretos en reposo.
 * Cumple rigurosamente con OWASP ASVS v4.0 (V6.2 - Storing sensitive data) y CASA Tier 2/3.
 * Garantiza confidencialidad, integridad y autenticidad para tokens OAuth (refresh_token, access_token).
 */

import crypto from 'crypto';

import { getSecuritySecret } from './secretManager';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const PREFIX = 'enc:v1:';

function getEncryptionKey(): Buffer {
  const rawKey = getSecuritySecret('TOKEN_ENCRYPTION_SECRET');
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Cifra un secreto o token OAuth en texto claro utilizando AES-256-GCM.
 * Formato de salida: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */
export function encryptToken(plaintext?: string | null): string {
  if (!plaintext || typeof plaintext !== 'string') {
    return '';
  }

  // Si ya está cifrado con la versión actual, no re-cifrar
  if (plaintext.startsWith(PREFIX)) {
    return plaintext;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descifra un secreto o token OAuth previamente cifrado con AES-256-GCM.
 * Si el texto no cuenta con el prefijo 'enc:v1:', se interpreta como dato heredado en texto claro
 * para garantizar compatibilidad retroactiva durante migraciones en caliente.
 */
export function decryptToken(ciphertext?: string | null): string {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return '';
  }

  // Compatibilidad hacia atrás: si no tiene el prefijo de cifrado, retornarlo directo
  if (!ciphertext.startsWith(PREFIX)) {
    return ciphertext;
  }

  try {
    const rawBody = ciphertext.slice(PREFIX.length);
    const parts = rawBody.split(':');
    if (parts.length !== 3) {
      return '';
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.warn('Fallo de integridad al descifrar token OAuth (tag GCM alterado o corrupto):', error);
    return '';
  }
}
