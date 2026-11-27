/**
 * @file imageCompressor.ts
 * @description Utilidad de compresión y optimización de imágenes en el cliente (Browser/Client-Side)
 * Cumple con la REGLA NO NEGOCIABLE 3: Compresión obligatoria previa al envío o almacenamiento
 * en infraestructura cloud (AWS S3/Almacenamiento Remoto) sin pérdida perceptible de fidelidad visual ni integridad.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default: 0.84)
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  maxSizeBytes?: number; // Límite objetivo en bytes (default: 400KB)
}

const HARD_FALLBACK_MAX_BYTES = 400 * 1024; // 400 KB máximo institucional
const MIN_DOWNSCALE_DIMENSION = 320;
const DOWNSCALE_FACTOR = 0.82;
const QUALITY_LADDER = [0.84, 0.76, 0.68, 0.6, 0.52];

const RASTER_IMAGE_EXT_RE = /\.(png|jpe?g|webp|bmp|avif)$/i;
const SAFE_COMPRESSED_EXT_RE = /\.(webp|jpe?g)$/i;
const SVG_EXT_RE = /\.svgz?$/i;

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.84,
  format: 'image/webp',
  maxSizeBytes: HARD_FALLBACK_MAX_BYTES
};

const SVG_REJECT_ERROR =
  'Por seguridad e integridad visual, no se permiten archivos SVG. Sube una imagen en formato PNG, JPG o WebP.';

/**
 * Valida que el archivo no contenga extensiones ejecutables maliciosas (PHP, CGI, etc.)
 * ni técnicas de evasión de doble extensión (e.g. shell.php.png, exploit.phtml)
 */
export function isSafeUploadFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') return false;
  // Bloquear extensiones PHP simples, compuestas o con caracteres de escape
  const dangerousPattern = /\.(php[0-9]?|phtml|phar|phps|inc|cgi|sh|bash|exe|cmd|bat)(\.|$)/i;
  return !dangerousPattern.test(fileName) && !fileName.includes('\0');
}

/**
 * Detecta si un archivo corresponde a SVG (por MIME o por extensión)
 */
export function isSvgFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mime = (file.type || '').toLowerCase().trim();
  return mime === 'image/svg+xml' || SVG_EXT_RE.test(file.name || '');
}

/**
 * Determina si un archivo es una imagen rasterizada comprimible, con respaldo por extensión
 * para dispositivos móviles donde `file.type` llega vacío o como `application/octet-stream`.
 */
export function isRasterImageFile(file: Pick<File, 'name' | 'type'>): boolean {
  if (isSvgFile(file)) return false;
  const mime = (file.type || '').toLowerCase().trim();
  if (mime.startsWith('image/')) return true;
  if (mime === '' || mime === 'application/octet-stream') {
    return RASTER_IMAGE_EXT_RE.test(file.name || '');
  }
  return false;
}

function buildQualitySteps(initialQuality: number): number[] {
  const clamped = Math.min(0.92, Math.max(0.4, initialQuality));
  return Array.from(
    new Set([clamped, ...QUALITY_LADDER].filter((q) => q <= clamped + 0.001 && q >= 0.4))
  ).sort((a, b) => b - a);
}

function canSafelyFallbackFile(file: File, maxBytes: number): boolean {
  const safeLimit = Math.min(maxBytes, HARD_FALLBACK_MAX_BYTES);
  if (file.size > safeLimit) return false;
  const mime = (file.type || '').toLowerCase().trim();
  if (mime === 'image/webp' || mime === 'image/jpeg') return true;
  if (mime === '' || mime === 'application/octet-stream') {
    return SAFE_COMPRESSED_EXT_RE.test(file.name || '');
  }
  return false;
}

function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl.length;
  const payload = dataUrl.slice(commaIdx + 1);
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}

function canSafelyFallbackDataUrl(dataUrl: string, maxBytes: number): boolean {
  const safeLimit = Math.min(maxBytes, HARD_FALLBACK_MAX_BYTES);
  const isCompressedRaster =
    dataUrl.startsWith('data:image/webp') || dataUrl.startsWith('data:image/jpeg');
  return isCompressedRaster && estimateDataUrlBytes(dataUrl) <= safeLimit;
}

/**
 * Comprime un archivo de imagen (File) antes de ser enviado al servidor
 */
export async function compressImageFile(
  file: File,
  customOptions?: ImageCompressionOptions
): Promise<File> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const maxBytes = options.maxSizeBytes || DEFAULT_OPTIONS.maxSizeBytes;

  // 1. Blindaje contra inyección de nombres ejecutables (PHP, Web Shells)
  if (!isSafeUploadFileName(file.name)) {
    throw new Error('Nombre de archivo o extensión no permitida por directivas de seguridad.');
  }

  // 2. Bloqueo explícito de SVG (prevención XSS y evasión de compresión rasterizada)
  if (isSvgFile(file)) {
    throw new Error(SVG_REJECT_ERROR);
  }

  // 3. Si no es una imagen rasterizada (incluso con respaldo de extensión en móvil), retornar intacto
  if (!isRasterImageFile(file)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const objectUrl =
      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : null;

    const failOrSafeFallback = (reason?: string) => {
      if (canSafelyFallbackFile(file, maxBytes)) {
        resolve(file);
        return;
      }
      reject(
        new Error(
          reason ||
            `No fue posible comprimir la imagen por debajo del límite institucional de ${Math.round(
              Math.min(maxBytes, HARD_FALLBACK_MAX_BYTES) / 1024
            )} KB. Sube una imagen válida en formato PNG, JPG o WebP.`
        )
      );
    };

    const handleLoadedImage = (img: HTMLImageElement, revokeOnFinish: boolean) => {
      const cleanup = () => {
        if (revokeOnFinish && objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
        }
      };

      const renderScaledBlob = (
        maxW: number,
        maxH: number,
        format: 'image/webp' | 'image/jpeg' | 'image/png',
        quality: number
      ): Promise<Blob | null> => {
        return new Promise((resBlob) => {
          const { width, height } = calculateOptimalDimensions(img.width, img.height, maxW, maxH);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resBlob(null);
            return;
          }
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resBlob(blob), format, quality);
        });
      };

      (async () => {
        try {
          let activeFormat: 'image/webp' | 'image/jpeg' | 'image/png' = options.format;
          const qualitySteps = buildQualitySteps(options.quality);

          const encodeCandidate = async (
            maxW: number,
            maxH: number,
            quality: number
          ): Promise<{ blob: Blob; format: 'image/webp' | 'image/jpeg' | 'image/png' } | null> => {
            let blob = await renderScaledBlob(maxW, maxH, activeFormat, quality);
            if (!blob) return null;

            // Detectar respaldo silencioso a PNG cuando el navegador no soporta codificación WebP
            if (activeFormat === 'image/webp' && blob.type !== 'image/webp') {
              activeFormat = 'image/jpeg';
              blob = await renderScaledBlob(maxW, maxH, 'image/jpeg', quality);
              if (!blob) return null;
            }

            return { blob, format: activeFormat };
          };

          let bestBlob: Blob | null = null;
          let bestFormat: 'image/webp' | 'image/jpeg' | 'image/png' = activeFormat;
          let curMaxW = options.maxWidth;
          let curMaxH = options.maxHeight;

          for (let scaleIter = 0; scaleIter < 8; scaleIter++) {
            for (const q of qualitySteps) {
              const encoded = await encodeCandidate(curMaxW, curMaxH, q);
              if (encoded && (!bestBlob || encoded.blob.size < bestBlob.size)) {
                bestBlob = encoded.blob;
                bestFormat = encoded.format;
              }
              if (bestBlob && bestBlob.size <= maxBytes) break;
            }

            if (bestBlob && bestBlob.size <= maxBytes) break;

            const currentDims = calculateOptimalDimensions(img.width, img.height, curMaxW, curMaxH);
            if (Math.max(currentDims.width, currentDims.height) <= MIN_DOWNSCALE_DIMENSION) {
              break;
            }

            curMaxW = Math.max(MIN_DOWNSCALE_DIMENSION, Math.round(currentDims.width * DOWNSCALE_FACTOR));
            curMaxH = Math.max(MIN_DOWNSCALE_DIMENSION, Math.round(currentDims.height * DOWNSCALE_FACTOR));
          }

          cleanup();

          if (!bestBlob) {
            failOrSafeFallback();
            return;
          }

          if (bestBlob.size > maxBytes) {
            reject(
              new Error(
                `La imagen procesada supera el límite institucional de ${Math.round(
                  maxBytes / 1024
                )} KB incluso tras la compresión progresiva. Intenta con una imagen más ligera.`
              )
            );
            return;
          }

          const originalMatchesFormat =
            file.type === bestFormat ||
            ((!file.type || file.type === 'application/octet-stream') &&
              ((bestFormat === 'image/webp' && /\.webp$/i.test(file.name)) ||
                (bestFormat === 'image/jpeg' && /\.jpe?g$/i.test(file.name))));

          if (bestBlob.size >= file.size && file.size <= maxBytes && originalMatchesFormat) {
            resolve(file);
            return;
          }

          const cleanBaseName =
            file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_')
              .slice(0, 60) || 'imagen_optimizada';
          const ext =
            bestFormat === 'image/webp' ? '.webp' : bestFormat === 'image/png' ? '.png' : '.jpg';
          const compressedFile = new File([bestBlob], `${cleanBaseName}${ext}`, {
            type: bestFormat,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } catch (err) {
          cleanup();
          console.warn('Error en compresión de imagen:', err);
          failOrSafeFallback();
        }
      })();
    };

    if (objectUrl) {
      const img = new Image();
      img.onload = () => handleLoadedImage(img, true);
      img.onerror = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
        failOrSafeFallback(
          'No se pudo decodificar la imagen seleccionada. Asegúrate de subir un archivo PNG, JPG o WebP válido.'
        );
      };
      img.src = objectUrl;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => handleLoadedImage(img, false);
      img.onerror = () =>
        failOrSafeFallback(
          'No se pudo decodificar la imagen seleccionada. Asegúrate de subir un archivo PNG, JPG o WebP válido.'
        );
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen para compresión.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Comprime un DataURL o cadena Base64 antes de emitir payload JSON o multipart
 */
export async function compressImageDataUrl(
  dataUrl: string,
  customOptions?: ImageCompressionOptions
): Promise<string> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const maxBytes = options.maxSizeBytes || DEFAULT_OPTIONS.maxSizeBytes;

  if (!dataUrl) {
    return dataUrl;
  }

  if (dataUrl.startsWith('data:image/svg+xml')) {
    throw new Error(SVG_REJECT_ERROR);
  }

  if (!dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const failOrSafeFallback = (reason?: string) => {
      if (canSafelyFallbackDataUrl(dataUrl, maxBytes)) {
        resolve(dataUrl);
        return;
      }
      reject(
        new Error(
          reason ||
            `No fue posible comprimir la imagen por debajo del límite institucional de ${Math.round(
              Math.min(maxBytes, HARD_FALLBACK_MAX_BYTES) / 1024
            )} KB.`
        )
      );
    };

    const img = new Image();
    img.onload = () => {
      try {
        let activeFormat: 'image/webp' | 'image/jpeg' | 'image/png' = options.format;
        const qualitySteps = buildQualitySteps(options.quality);

        const renderDataUrl = (
          maxW: number,
          maxH: number,
          format: 'image/webp' | 'image/jpeg' | 'image/png',
          quality: number
        ): string | null => {
          const { width, height } = calculateOptimalDimensions(img.width, img.height, maxW, maxH);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL(format, quality);
        };

        let bestUrl: string | null = null;
        let bestBytes = Number.POSITIVE_INFINITY;
        let curMaxW = options.maxWidth;
        let curMaxH = options.maxHeight;

        for (let scaleIter = 0; scaleIter < 8; scaleIter++) {
          for (const q of qualitySteps) {
            let candidate = renderDataUrl(curMaxW, curMaxH, activeFormat, q);
            if (!candidate) continue;

            // Detectar respaldo silencioso a PNG cuando el navegador no soporta WebP
            if (activeFormat === 'image/webp' && !candidate.startsWith('data:image/webp')) {
              activeFormat = 'image/jpeg';
              candidate = renderDataUrl(curMaxW, curMaxH, 'image/jpeg', q);
              if (!candidate) continue;
            }

            const candidateBytes = estimateDataUrlBytes(candidate);
            if (candidateBytes < bestBytes) {
              bestUrl = candidate;
              bestBytes = candidateBytes;
            }
            if (bestBytes <= maxBytes) break;
          }

          if (bestBytes <= maxBytes) break;

          const currentDims = calculateOptimalDimensions(img.width, img.height, curMaxW, curMaxH);
          if (Math.max(currentDims.width, currentDims.height) <= MIN_DOWNSCALE_DIMENSION) {
            break;
          }

          curMaxW = Math.max(MIN_DOWNSCALE_DIMENSION, Math.round(currentDims.width * DOWNSCALE_FACTOR));
          curMaxH = Math.max(MIN_DOWNSCALE_DIMENSION, Math.round(currentDims.height * DOWNSCALE_FACTOR));
        }

        if (!bestUrl) {
          failOrSafeFallback();
          return;
        }

        if (bestBytes > maxBytes) {
          reject(
            new Error(
              `La imagen procesada supera el límite institucional de ${Math.round(
                maxBytes / 1024
              )} KB tras la compresión progresiva.`
            )
          );
          return;
        }

        const originalBytes = estimateDataUrlBytes(dataUrl);
        const originalMatchesFormat = dataUrl.startsWith(`data:${activeFormat}`);
        if (bestBytes >= originalBytes && originalBytes <= maxBytes && originalMatchesFormat) {
          resolve(dataUrl);
          return;
        }

        resolve(bestUrl);
      } catch (err) {
        console.warn('Error en compresión de DataURL:', err);
        failOrSafeFallback();
      }
    };

    img.onerror = () =>
      failOrSafeFallback('No se pudo decodificar la imagen proporcionada para su compresión.');
    img.src = dataUrl;
  });
}

/**
 * Calcula las dimensiones proporcionales respetando límites máximos
 */
export function calculateOptimalDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = Math.max(1, srcWidth);
  let height = Math.max(1, srcHeight);

  if (width > maxWidth) {
    height = Math.max(1, Math.round((height * maxWidth) / width));
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.max(1, Math.round((width * maxHeight) / height));
    height = maxHeight;
  }

  return { width, height };
}
