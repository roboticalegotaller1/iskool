import fs from 'fs';
import path from 'path';

const GLOBAL_ENV_LOCAL_CACHE_KEY = '__iskoolEnvLocalCache';

interface EnvLocalCacheState {
  cwd: string;
  loaded: boolean;
  values: Map<string, string>;
}

/**
 * Carga y parsea `.env.local` una sola vez por proceso en memoria.
 * Seguro en entornos serverless o sistemas de archivos de solo lectura.
 */
function getCachedEnvLocalMap(): Map<string, string> {
  const g = globalThis as unknown as Record<string, EnvLocalCacheState | undefined>;
  const cwd = process.cwd();
  const existing = g[GLOBAL_ENV_LOCAL_CACHE_KEY];
  if (existing && existing.loaded && existing.cwd === cwd) {
    return existing.values;
  }

  const values = new Map<string, string>();
  try {
    const envPath = path.join(/*turbopackIgnore: true*/ cwd, '.env.local');
    if (fs.existsSync(/*turbopackIgnore: true*/ envPath)) {
      const rawContent = fs.readFileSync(/*turbopackIgnore: true*/ envPath, 'utf8');
      for (const rawLine of rawContent.split(/\r?\n/)) {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
        const eqIdx = normalized.indexOf('=');
        if (eqIdx <= 0) continue;

        const key = normalized.slice(0, eqIdx).trim();
        let val = normalized.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && val) {
          values.set(key, val);
        }
      }
    }
  } catch {
    // Entorno de solo lectura o sin archivo local: degradación silenciosa sin lecturas repetidas
  }

  g[GLOBAL_ENV_LOCAL_CACHE_KEY] = { cwd, loaded: true, values };
  return values;
}

/**
 * Resuelve el primer valor no vacío entre `varNames`, priorizando `process.env`
 * y consultando la caché de proceso única de `.env.local` como respaldo.
 */
export function resolveServerEnvKey(varNames: string[]): string {
  for (const name of varNames) {
    if (!name) continue;
    const fromEnv = process.env[name]?.trim();
    if (fromEnv) return fromEnv;
  }

  const fileMap = getCachedEnvLocalMap();
  for (const name of varNames) {
    if (!name) continue;
    const fromFile = fileMap.get(name)?.trim();
    if (fromFile) return fromFile;
  }

  return '';
}
