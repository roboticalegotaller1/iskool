/**
 * @file secretManager.ts
 * @description Gestor centralizado de secretos criptográficos conforme a OWASP ASVS v4.0 (V6.4) y CASA Tier 2/3.
 * Garantiza que ninguna clave o secreto criptográfico esté hardcodeado en el código fuente (CWE-798).
 * En entornos de producción exige estrictamente la presencia de variables de entorno seguras.
 */

import crypto from 'crypto';

// Búfer en memoria para entornos de prueba/desarrollo temporal sin romper suites CI
let ephemeralDevSecret: string | null = null;

export function getSecuritySecret(keyName: 'SESSION_SECRET' | 'TOKEN_ENCRYPTION_SECRET' | 'OAUTH_SECRET' = 'SESSION_SECRET'): string {
  // 1. Intentar obtener de variables de entorno configuradas
  const envVal =
    process.env[keyName] ||
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.TOKEN_ENCRYPTION_SECRET;

  if (envVal && envVal.trim().length >= 32) {
    return envVal.trim();
  }

  // 2. En producción, la ausencia de una clave secreta segura es un bloqueo no negociable
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `[CASA Security Exception]: La variable de entorno requerida '${keyName}' no está configurada o tiene entropía insuficiente (mínimo 32 caracteres).`
    );
  }

  // 3. En entorno de desarrollo o pruebas locales sin variable inyectada,
  // generar una clave criptográfica aleatoria efímera por ciclo de vida del proceso
  // evitando estrictamente cualquier cadena estática hardcodeada (CWE-798).
  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[DevSecOps Aviso]: Variable '${keyName}' no detectada en entorno de desarrollo. Utilizando clave efímera de memoria de alta entropía.`
      );
    }
  }

  return ephemeralDevSecret;
}
