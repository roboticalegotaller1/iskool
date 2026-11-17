/**
 * @file imageCompressor.ts
 * @description Utilidad de compresión y optimización de imágenes en el cliente (Browser/Client-Side)
 * Cumple con la REGLA NO NEGOCIABLE 3: Compresión obligatoria previa al envío o almacenamiento
 * en infraestructura cloud (AWS S3/Almacenamiento Remoto) sin pérdida perceptible de fidelidad visual ni integridad.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default: 0.85)
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  maxSizeBytes?: number; // Límite objetivo en bytes (default: 400KB)
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.85,
  format: 'image/webp',
  maxSizeBytes: 400 * 1024 // 400 KB
};

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
 * Comprime un archivo de imagen (File) antes de ser enviado al servidor
 */
export async function compressImageFile(
  file: File,
  customOptions?: ImageCompressionOptions
): Promise<File> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  // 1. Blindaje contra inyección de nombres ejecutables (PHP, Web Shells)
  if (!isSafeUploadFileName(file.name)) {
    throw new Error('Nombre de archivo o extensión no permitida por directivas de seguridad.');
  }

  // Si no es un tipo de imagen comprimible o es SVG, retornar intacto
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(file)
      : null;

    const handleLoadedImage = (img: HTMLImageElement, revokeOnFinish: boolean) => {
      const cleanup = () => {
        if (revokeOnFinish && objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch {}
        }
      };

      const renderScaledBlob = (maxW: number, maxH: number, format: string, quality: number): Promise<Blob | null> => {
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resBlob(blob), format, quality);
        });
      };

      (async () => {
        try {
          const targetFormat = options.format;
          const maxBytes = options.maxSizeBytes || DEFAULT_OPTIONS.maxSizeBytes;
          const qualitySteps = Array.from(
            new Set([options.quality, 0.74, 0.64, 0.54].filter((q) => q <= options.quality + 0.01 && q >= 0.4))
          );

          let bestBlob = await renderScaledBlob(options.maxWidth, options.maxHeight, targetFormat, options.quality);
          if (bestBlob && bestBlob.size > maxBytes) {
            for (const q of qualitySteps.slice(1)) {
              const candidate = await renderScaledBlob(options.maxWidth, options.maxHeight, targetFormat, q);
              if (candidate && candidate.size < bestBlob.size) {
                bestBlob = candidate;
              }
              if (bestBlob && bestBlob.size <= maxBytes) break;
            }
          }
          if (bestBlob && bestBlob.size > maxBytes) {
            const smaller = await renderScaledBlob(
              Math.round(options.maxWidth * 0.78),
              Math.round(options.maxHeight * 0.78),
              targetFormat,
              0.62
            );
            if (smaller && smaller.size < bestBlob.size) {
              bestBlob = smaller;
            }
          }

          cleanup();

          if (!bestBlob) {
            resolve(file);
            return;
          }

          if (bestBlob.size >= file.size && file.type === targetFormat) {
            resolve(file);
            return;
          }

          const cleanBaseName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 60) || 'imagen_optimizada';
          const ext = targetFormat === 'image/webp' ? '.webp' : targetFormat === 'image/png' ? '.png' : '.jpg';
          const compressedFile = new File([bestBlob], `${cleanBaseName}${ext}`, {
            type: targetFormat,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } catch (err) {
          cleanup();
          console.warn('Error en compresión de imagen, usando original:', err);
          resolve(file);
        }
      })();
    };

    if (objectUrl) {
      const img = new Image();
      img.onload = () => handleLoadedImage(img, true);
      img.onerror = () => {
        try { URL.revokeObjectURL(objectUrl); } catch {}
        resolve(file);
      };
      img.src = objectUrl;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => handleLoadedImage(img, false);
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen para compresión'));
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

  if (!dataUrl || !dataUrl.startsWith('data:image') || dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const { width, height } = calculateOptimalDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const maxBytes = options.maxSizeBytes || DEFAULT_OPTIONS.maxSizeBytes;
        const maxChars = Math.ceil((maxBytes * 4) / 3) + 64;
        const qualitySteps = Array.from(new Set([options.quality, 0.74, 0.62, 0.5]));
        let compressedDataUrl = canvas.toDataURL(options.format, options.quality);
        for (const q of qualitySteps.slice(1)) {
          if (compressedDataUrl.length <= maxChars) break;
          const nextUrl = canvas.toDataURL(options.format, q);
          if (nextUrl.length < compressedDataUrl.length) {
            compressedDataUrl = nextUrl;
          }
        }
        resolve(compressedDataUrl.length < dataUrl.length ? compressedDataUrl : dataUrl);
      } catch (err) {
        console.warn('Error en compresión de DataURL, usando original:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
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
  let width = srcWidth;
  let height = srcHeight;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}
