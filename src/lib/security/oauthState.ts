/**
 * @file oauthState.ts
 * @description Generador y verificador criptográfico de tokens de estado OAuth (Anti-CSRF).
 * Cumple con RFC 6749 Sección 10.12 para prevenir ataques de Cross-Site Request Forgery en flujos de login.
 */

import crypto from 'crypto';

function getStateSecret(): string {
  return process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || 'e7b4c91a02f83d6520b174ac5d893e214fa0c6791b84e3d5029a1f7c8b36d0e4';
}

export interface OAuthStatePayload {
  flow: 'login' | 'workspace_connect';
  tenantId: string;
  email?: string;
  redirect?: string;
  nonce?: string;
  ts?: number;
}

export function signOAuthState(payload: OAuthStatePayload): string {
  const secret = getStateSecret();
  const enriched: OAuthStatePayload = {
    ...payload,
    nonce: crypto.randomBytes(8).toString('hex'),
    ts: Date.now()
  };
  const jsonStr = JSON.stringify(enriched);
  const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifyOAuthState(stateRaw?: string | null): { valid: boolean; payload?: OAuthStatePayload } {
  if (!stateRaw || typeof stateRaw !== 'string') {
    return { valid: false };
  }

  const parts = stateRaw.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [base64Data, signature] = parts;
  const secret = getStateSecret();

  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf-8');
    const payload: OAuthStatePayload = JSON.parse(jsonStr);

    // Expiración mandatoria de 15 minutos para el estado de login (anti-replay)
    if (!payload.ts || Date.now() - payload.ts > 15 * 60 * 1000 || payload.ts > Date.now() + 60000) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
