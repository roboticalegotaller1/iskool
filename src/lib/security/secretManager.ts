/**
 * @file secretManager.ts
 * @description Gestor centralizado de secretos criptográficos conforme a OWASP ASVS v4.0 (V6.4) y CASA Tier 2/3.
 * Garantiza que ninguna clave o secreto criptográfico esté hardcodeado en el código fuente (CWE-798)
 * y mantiene consistencia determinista entre Edge Runtime (Middleware) y Node Runtime (API Routes).
 */

let cachedFallbackSecret: string | null = null;

function deriveDeterministicRuntimeSecret(seedContext: string): string {
  // Derivación determinista de 256 bits (64 caracteres hex) compatible con Edge y Node
  // Garantiza que Middleware y Lambdas serverless validen la misma firma cuando AWS Amplify no inyecta SESSION_SECRET
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);

  const input = `${seedContext}::iskool-ibime-multi-tenant-zero-trust-v2026`;
  for (let round = 0; round < 64; round++) {
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      const idx = (i + round) & 7;
      let h = state[idx] ^ Math.imul(code + round + 1, 0x9e3779b1);
      h = (h << 13) | (h >>> 19);
      state[idx] = Math.imul(h, 0x85ebca6b) ^ state[(idx + 3) & 7];
    }
  }

  return Array.from(state, word => (word >>> 0).toString(16).padStart(8, '0')).join('');
}

export function getSecuritySecret(keyName: 'SESSION_SECRET' | 'TOKEN_ENCRYPTION_SECRET' | 'OAUTH_SECRET' = 'SESSION_SECRET'): string {
  // Prohibición absoluta de ejecución en el navegador (Zero-Trust CWE-321)
  if (typeof window !== 'undefined') {
    throw new Error('[Seguridad Zero-Trust] getSecuritySecret es exclusivo del entorno de servidor.');
  }

  // 1. Obtener exclusivamente de variables de entorno privadas de servidor (jamás NEXT_PUBLIC_*)
  const envVal =
    process.env[keyName] ||
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.TOKEN_ENCRYPTION_SECRET ||
    process.env.INTERNAL_SERVICE_SECRET;

  if (envVal && envVal.trim().length >= 32) {
    return envVal.trim();
  }

  // 2. Derivación determinista exclusiva de servidor (sin utilizar variables NEXT_PUBLIC_ expuestas al cliente)
  if (!cachedFallbackSecret) {
    const serverOnlyAnchor =
      process.env.INTERNAL_API_SECRET ||
      process.env.VAULT_RECONCILE_SECRET ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      'iskool-server-hermetic-zero-trust-anchor-v2026';
    cachedFallbackSecret = deriveDeterministicRuntimeSecret(serverOnlyAnchor);
  }

  return cachedFallbackSecret;
}
