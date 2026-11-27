/**
 * Caché Persistente de Audio TTS Neural en el Navegador (ISkool)
 * -----------------------------------------------------------------------------
 * Combina dos capas seguras para reproducción instantánea (0 ms) incluso tras
 * recargas de página:
 *   1. Cache Storage API persistente (`iskool-tts-v10`), acotada a 180 entradas
 *      con desalojo FIFO automático y tolerancia total a entornos sin `caches`.
 *   2. Mapa LRU en memoria de Object URLs activas, acotado a 60 entradas con
 *      `URL.revokeObjectURL` inmediato al desalojar para evitar fugas de RAM.
 */

const PERSISTENT_CACHE_NAME = 'iskool-tts-v10';
const MAX_PERSISTENT_CACHE_ENTRIES = 180;
const MAX_ACTIVE_OBJECT_URLS = 60;
const MIN_VALID_AUDIO_BYTES = 256;

const activeObjectUrlCache = new Map<string, string>();
const inFlightTtsBlobs = new Map<string, Promise<Blob | null>>();

function normalizeTtsTextForKey(raw: unknown): string {
  return String(raw ?? '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/[*_#`~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeNumericParam(value: unknown, fallback = '1'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number(value.toFixed(3)).toString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

/**
 * Fallback determinista de 128 bits (doble FNV-1a) cuando `crypto.subtle`
 * no está disponible (por ejemplo, conexiones HTTP locales en red de aula).
 */
function deterministicFallbackHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= ch + (i & 0xff);
    h2 = Math.imul(h2, 0x01000193) >>> 0;
  }
  const lenHex = (input.length >>> 0).toString(16).padStart(8, '0');
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}${lenHex}`;
}

/**
 * Construye una clave canónica determinista (SHA-256) a partir de los
 * parámetros efectivos de voz, prosodia y texto normalizado.
 */
export async function computeTtsClientCacheKey(payload: Record<string, any>): Promise<string> {
  const voiceOrExplicit = String(payload.voice || payload.voiceId || '').trim();
  const lang = String(payload.language || payload.lang || 'es-MX').trim().toLowerCase();
  const gender = String(payload.gender || '').trim().toLowerCase();
  const characterName = String(payload.characterName || '').trim().toLowerCase();
  const role = String(payload.role || '').trim().toLowerCase();
  const narratorMode = String(payload.narratorMode || '').trim().toLowerCase();
  const historicalAge = payload.historicalAge !== undefined && payload.historicalAge !== null
    ? String(payload.historicalAge)
    : '';
  const variantIndex = payload.variantIndex !== undefined && payload.variantIndex !== null
    ? String(payload.variantIndex)
    : '0';
  const rate = normalizeNumericParam(payload.rate, '1');
  const pitch = normalizeNumericParam(payload.pitch, '1');
  const normalizedText = normalizeTtsTextForKey(payload.text || payload.ssml || '');

  // Si no viene una voz explícita, el servidor la resuelve desde personaje/rol/género/idioma
  const voiceFingerprint = voiceOrExplicit
    ? `v:${voiceOrExplicit}|l:${lang}`
    : `l:${lang}|g:${gender}|c:${characterName}|r:${role}|n:${narratorMode}|a:${historicalAge}|i:${variantIndex}`;

  const canonical = `iskool-tts-v10::${voiceFingerprint}::rate:${rate}::pitch:${pitch}::${normalizedText}`;

  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoded = new TextEncoder().encode(canonical);
      const digest = await window.crypto.subtle.digest('SHA-256', encoded);
      const bytes = new Uint8Array(digest);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    }
  } catch {
    // Fallback determinista fuera de contextos seguros
  }

  return deterministicFallbackHash(canonical);
}

function buildCacheStorageRequestUrl(keyHash: string): string {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://iskool.local';
  return `${origin}/__iskool_tts_cache__/${keyHash}.mp3`;
}

async function openPersistentTtsCache(): Promise<Cache | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    return await window.caches.open(PERSISTENT_CACHE_NAME);
  } catch {
    return null;
  }
}

async function readBlobFromPersistentCache(keyHash: string): Promise<Blob | null> {
  const cache = await openPersistentTtsCache();
  if (!cache) return null;
  try {
    const reqUrl = buildCacheStorageRequestUrl(keyHash);
    const match = await cache.match(reqUrl);
    if (!match) return null;
    const blob = await match.blob();
    if (blob && blob.size > MIN_VALID_AUDIO_BYTES) {
      return blob;
    }
    // Eliminar entrada corrupta o vacía
    await cache.delete(reqUrl).catch(() => {});
  } catch {
    // Ignorar errores de almacenamiento restringido o modo privado
  }
  return null;
}

async function writeBlobToPersistentCache(keyHash: string, blob: Blob): Promise<void> {
  if (!blob || blob.size <= MIN_VALID_AUDIO_BYTES) return;
  const cache = await openPersistentTtsCache();
  if (!cache) return;
  try {
    const reqUrl = buildCacheStorageRequestUrl(keyHash);
    const response = new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': blob.type || 'audio/mpeg',
        'X-TTS-Cached-At': String(Date.now()),
      },
    });
    await cache.put(reqUrl, response);

    // Desalojo acotado FIFO si supera el máximo permitido (180 entradas)
    const keys = await cache.keys();
    if (keys.length > MAX_PERSISTENT_CACHE_ENTRIES) {
      const overflow = keys.length - MAX_PERSISTENT_CACHE_ENTRIES;
      for (let i = 0; i < overflow; i++) {
        await cache.delete(keys[i]).catch(() => {});
      }
    }
  } catch {
    // Tolerancia silenciosa a cuota agotada o restricciones de privacidad
  }
}

/**
 * Obtiene una Object URL activa desde la caché LRU en memoria (promueve a MRU).
 */
export function getCachedTtsObjectUrl(keyHash: string): string | null {
  const url = activeObjectUrlCache.get(keyHash);
  if (!url) return null;
  activeObjectUrlCache.delete(keyHash);
  activeObjectUrlCache.set(keyHash, url);
  return url;
}

/**
 * Registra una Object URL en la caché LRU acotada a 60 entradas,
 * revocando automáticamente la entrada más antigua al desalojar.
 */
export function storeCachedTtsObjectUrl(keyHash: string, objectUrl: string): string {
  const existing = activeObjectUrlCache.get(keyHash);
  if (existing) {
    if (existing !== objectUrl) {
      try { URL.revokeObjectURL(existing); } catch {}
    }
    activeObjectUrlCache.delete(keyHash);
    activeObjectUrlCache.set(keyHash, objectUrl);
    return objectUrl;
  }

  while (activeObjectUrlCache.size >= MAX_ACTIVE_OBJECT_URLS) {
    const oldestKey = activeObjectUrlCache.keys().next().value;
    if (!oldestKey) break;
    const oldestUrl = activeObjectUrlCache.get(oldestKey);
    activeObjectUrlCache.delete(oldestKey);
    if (oldestUrl) {
      try { URL.revokeObjectURL(oldestUrl); } catch {}
    }
  }

  activeObjectUrlCache.set(keyHash, objectUrl);
  return objectUrl;
}

function awaitWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (val) => {
        signal.removeEventListener('abort', onAbort);
        resolve(val);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

/**
 * Obtiene el Blob de audio MP3 desde la caché persistente del navegador (`iskool-tts-v10`)
 * o, en caso de miss, solicita la síntesis a `/api/ai/tts` y persiste el resultado.
 * Totalmente tolerante a fallos: retorna `null` si se aborta o si falla la red.
 */
export async function fetchCachedNeuralTtsBlob(
  payload: Record<string, any>,
  signal?: AbortSignal
): Promise<{ blob: Blob; fromClientCache: boolean } | null> {
  if (typeof window === 'undefined') return null;
  if (signal?.aborted) return null;

  try {
    const keyHash = await computeTtsClientCacheKey(payload);
    if (signal?.aborted) return null;

    // 1. Verificar Cache Storage persistente del navegador (0 ms tras recarga)
    const cachedBlob = await readBlobFromPersistentCache(keyHash);
    if (signal?.aborted) return null;
    if (cachedBlob) {
      return { blob: cachedBlob, fromClientCache: true };
    }

    // 2. Reutilizar petición en vuelo idéntica (p. ej. pre-calentamiento activo)
    const existingInFlight = inFlightTtsBlobs.get(keyHash);
    if (existingInFlight) {
      const sharedBlob = await awaitWithAbort(existingInFlight, signal);
      if (signal?.aborted) return null;
      if (sharedBlob && sharedBlob.size > MIN_VALID_AUDIO_BYTES) {
        return { blob: sharedBlob, fromClientCache: false };
      }
      return null;
    }

    // 3. Solicitud de síntesis neuronal al servidor institucional
    const fetchPromise = (async (): Promise<Blob | null> => {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.size <= MIN_VALID_AUDIO_BYTES) return null;
      void writeBlobToPersistentCache(keyHash, blob);
      return blob;
    })().finally(() => {
      inFlightTtsBlobs.delete(keyHash);
    });

    inFlightTtsBlobs.set(keyHash, fetchPromise);

    const blob = await awaitWithAbort(fetchPromise, signal);
    if (signal?.aborted) return null;
    if (!blob) return null;
    return { blob, fromClientCache: false };
  } catch {
    return null;
  }
}

/**
 * Obtiene o crea una Object URL administrada por la caché LRU de 60 entradas
 * respaldada por Cache Storage persistente.
 */
export async function fetchCachedNeuralTtsObjectUrl(
  payload: Record<string, any>,
  signal?: AbortSignal
): Promise<{ url: string; fromClientCache: boolean } | null> {
  if (typeof window === 'undefined') return null;
  if (signal?.aborted) return null;

  try {
    const keyHash = await computeTtsClientCacheKey(payload);
    if (signal?.aborted) return null;

    const existingUrl = getCachedTtsObjectUrl(keyHash);
    if (existingUrl) {
      return { url: existingUrl, fromClientCache: true };
    }

    const result = await fetchCachedNeuralTtsBlob(payload, signal);
    if (signal?.aborted || !result?.blob) return null;

    const alreadyStored = getCachedTtsObjectUrl(keyHash);
    if (alreadyStored) {
      return { url: alreadyStored, fromClientCache: result.fromClientCache };
    }

    const url = URL.createObjectURL(result.blob);
    storeCachedTtsObjectUrl(keyHash, url);
    return { url, fromClientCache: result.fromClientCache };
  } catch {
    return null;
  }
}
