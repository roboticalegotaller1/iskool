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
 * Comprime un archivo de imagen (File) antes de ser enviado al servidor
 */
export async function compressImageFile(
  file: File,
  customOptions?: ImageCompressionOptions
): Promise<File> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  // Si no es un tipo de imagen comprimible o es SVG, retornar intacto
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
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
            resolve(file); // Fallback seguro
            return;
          }

          // Filtros de calidad para escalado bicúbico nítido
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Dibujar en el lienzo
          ctx.drawImage(img, 0, 0, width, height);

          // Determinar formato compatible (preferir WebP para máxima fidelidad y compresión)
          const targetFormat = options.format;
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Si el archivo comprimido resultó ser mayor que el original, conservar el original
              if (blob.size >= file.size && file.type === targetFormat) {
                resolve(file);
                return;
              }

              const newFileName = file.name.replace(/\.[^/.]+$/, '') + (targetFormat === 'image/webp' ? '.webp' : '.jpg');
              const compressedFile = new File([blob], newFileName, {
                type: targetFormat,
                lastModified: Date.now()
              });

              resolve(compressedFile);
            },
            targetFormat,
            options.quality
          );
        } catch (err) {
          console.warn('Error en compresión de imagen, usando original:', err);
          resolve(file);
        }
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo de imagen para compresión'));
    };

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

  if (!dataUrl || !dataUrl.startsWith('data:image')) {
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

        const compressedDataUrl = canvas.toDataURL(options.format, options.quality);
        resolve(compressedDataUrl);
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
function calculateOptimalDimensions(
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
