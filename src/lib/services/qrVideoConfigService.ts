import initialConfig from '@/data/qrVideoConfig.json';

export interface QrVideoConfig {
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
  ctaUrl: string;
  autoplay: boolean;
  loop: boolean;
  updatedAt: string;
}

export interface QrVideoPreset {
  id: string;
  label: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  subtitle: string;
}

export const QR_VIDEO_PRESETS: QrVideoPreset[] = [
  {
    id: 'preset-nature-4k',
    label: 'Vídeo Genérico de Prueba 1 (Ultra HD 4K)',
    description: 'Vídeo genérico de prueba de alta definición con soporte universal de reproducción automática.',
    youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    youtubeId: 'LXb3EKWsInQ',
    title: 'Presentación Institucional ISkool (Vídeo de Prueba 1)',
    subtitle: 'La plataforma integral para colegios privados en México. Este vídeo se reproduce automáticamente desde el código QR permanente.'
  },
  {
    id: 'preset-animation-60fps',
    label: 'Vídeo Genérico de Prueba 2 (Animación 60 FPS)',
    description: 'Segundo vídeo genérico para comprobar que al cambiar el enlace el código QR (iskool.mx/video) se mantiene intacto.',
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    youtubeId: 'aqz-KE-bpKQ',
    title: 'Experiencia Educativa Gamificada ISkool (Vídeo de Prueba 2)',
    subtitle: 'Comprobación de actualización dinámica: el vídeo ha cambiado sin modificar la URL iskool.mx/video del código QR.'
  },
  {
    id: 'preset-iskool-demo',
    label: 'Vídeo Demo Institucional ISkool',
    description: 'Vídeo demostrativo registrado previamente en el canal oficial.',
    youtubeUrl: 'https://youtu.be/TvHe4phSYKc',
    youtubeId: 'TvHe4phSYKc',
    title: 'Demostración de Plataforma ISkool',
    subtitle: 'Recorrido por las funciones de gestión escolar, planeaciones curriculares y comunicación institucional.'
  }
];

/**
 * Extrae el ID de 11 caracteres de cualquier formato de URL de YouTube:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ?si=...
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ
 * - ID directo de 11 caracteres
 */
export function extractYouTubeId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Si ya es exactamente un ID válido de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      const segments = parsed.pathname.split('/').filter(Boolean);
      const markerIndex = segments.findIndex((s) =>
        ['embed', 'shorts', 'live', 'v'].includes(s.toLowerCase())
      );
      if (markerIndex !== -1 && segments[markerIndex + 1]) {
        const candidate = segments[markerIndex + 1].split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Fallback con expresión regular si no es una URL estándar
  }

  const regexMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (regexMatch && regexMatch[1]) {
    return regexMatch[1];
  }

  return null;
}

function getNodeFs() {
  if (typeof window === 'undefined') {
    try {
      const nodeFs = eval('require')('fs');
      const nodePath = eval('require')('path');
      return { fs: nodeFs, path: nodePath };
    } catch {
      return null;
    }
  }
  return null;
}

const DEFAULT_CONFIG: QrVideoConfig = {
  youtubeUrl: initialConfig.youtubeUrl || 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  youtubeId: initialConfig.youtubeId || 'LXb3EKWsInQ',
  title: initialConfig.title || 'Presentación Institucional ISkool',
  subtitle:
    initialConfig.subtitle ||
    'La plataforma integral para colegios privados en México. Escanea, conoce nuestra visión y descubre cómo transformamos la gestión escolar.',
  badgeText: initialConfig.badgeText || 'Vídeo Oficial · Acceso QR Directo',
  ctaText: initialConfig.ctaText || 'Explorar Plataforma ISkool',
  ctaUrl: initialConfig.ctaUrl || 'https://iskool.mx',
  autoplay: initialConfig.autoplay ?? true,
  loop: initialConfig.loop ?? true,
  updatedAt: initialConfig.updatedAt || new Date().toISOString()
};

function loadConfigFromDisk(): QrVideoConfig | null {
  const node = getNodeFs();
  if (!node) return null;

  try {
    // 1. Priorizar el archivo de persistencia en tiempo de ejecución (.data/qr_video_config.json)
    const runtimePath = node.path.join(process.cwd(), '.data', 'qr_video_config.json');
    if (node.fs.existsSync(runtimePath)) {
      const raw = node.fs.readFileSync(runtimePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.youtubeId) {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }

    // 2. Fallback al archivo fuente en src/data/qrVideoConfig.json
    const sourcePath = node.path.join(process.cwd(), 'src', 'data', 'qrVideoConfig.json');
    if (node.fs.existsSync(sourcePath)) {
      const raw = node.fs.readFileSync(sourcePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.youtubeId) {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Aviso al leer configuración de video QR desde disco:', err);
  }

  return null;
}

function saveConfigToDisk(config: QrVideoConfig): void {
  const node = getNodeFs();
  if (!node) return;

  const serialized = JSON.stringify(config, null, 2);

  try {
    const dataDir = node.path.join(process.cwd(), '.data');
    if (!node.fs.existsSync(dataDir)) {
      node.fs.mkdirSync(dataDir, { recursive: true });
    }
    const runtimePath = node.path.join(dataDir, 'qr_video_config.json');
    node.fs.writeFileSync(runtimePath, serialized, 'utf8');
  } catch (err) {
    console.warn('Aviso al guardar .data/qr_video_config.json:', err);
  }
}

export const QrVideoConfigService = {
  getConfig(): QrVideoConfig {
    const diskConfig = loadConfigFromDisk();
    if (diskConfig) {
      (globalThis as any).__iskoolQrVideoConfig = diskConfig;
      return diskConfig;
    }
    const memConfig = (globalThis as any).__iskoolQrVideoConfig as QrVideoConfig | undefined;
    if (memConfig) {
      return memConfig;
    }
    return DEFAULT_CONFIG;
  },

  updateConfig(partial: Partial<QrVideoConfig> & { youtubeInput?: string }): QrVideoConfig {
    const current = this.getConfig();
    const rawInput = partial.youtubeInput || partial.youtubeUrl || current.youtubeUrl;
    const extractedId = extractYouTubeId(rawInput) || extractYouTubeId(partial.youtubeId || '') || current.youtubeId;

    const normalizedUrl = rawInput.startsWith('http')
      ? rawInput.trim()
      : `https://www.youtube.com/watch?v=${extractedId}`;

    const updated: QrVideoConfig = {
      ...current,
      youtubeUrl: normalizedUrl,
      youtubeId: extractedId,
      title: typeof partial.title === 'string' && partial.title.trim() ? partial.title.trim() : current.title,
      subtitle:
        typeof partial.subtitle === 'string' && partial.subtitle.trim() ? partial.subtitle.trim() : current.subtitle,
      badgeText:
        typeof partial.badgeText === 'string' && partial.badgeText.trim()
          ? partial.badgeText.trim()
          : current.badgeText,
      ctaText:
        typeof partial.ctaText === 'string' && partial.ctaText.trim() ? partial.ctaText.trim() : current.ctaText,
      ctaUrl: typeof partial.ctaUrl === 'string' && partial.ctaUrl.trim() ? partial.ctaUrl.trim() : current.ctaUrl,
      autoplay: typeof partial.autoplay === 'boolean' ? partial.autoplay : current.autoplay,
      loop: typeof partial.loop === 'boolean' ? partial.loop : current.loop,
      updatedAt: new Date().toISOString()
    };

    (globalThis as any).__iskoolQrVideoConfig = updated;
    saveConfigToDisk(updated);
    return updated;
  }
};

