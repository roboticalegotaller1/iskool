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
    id: 'preset-iskool-comercial-oficial',
    label: 'Vídeo Comercial Oficial iSkool® (Con Voz)',
    description: 'Presentación ejecutiva oficial de iSkool® en alta definición para directivos y colegios privados.',
    youtubeUrl: 'https://youtu.be/WgeQVmHDNJ4',
    youtubeId: 'WgeQVmHDNJ4',
    title: 'iSkool® — El Cerebro Vivo de tu Escuela',
    subtitle: 'Plataforma educativa integral potenciada con Inteligencia Artificial y tecnología creada en Canadá para colegios privados en México.'
  },
  {
    id: 'preset-iskool-demo',
    label: 'Vídeo Demo Institucional iSkool®',
    description: 'Vídeo demostrativo registrado previamente en el canal oficial.',
    youtubeUrl: 'https://youtu.be/TvHe4phSYKc',
    youtubeId: 'TvHe4phSYKc',
    title: 'Demostración de Plataforma iSkool®',
    subtitle: 'Recorrido por las funciones de gestión escolar, planeaciones curriculares y comunicación institucional.'
  },
  {
    id: 'preset-nature-4k',
    label: 'Vídeo de Respaldo Ultra HD',
    description: 'Vídeo de respaldo en alta definición con soporte universal de reproducción automática.',
    youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    youtubeId: 'LXb3EKWsInQ',
    title: 'Presentación Institucional iSkool®',
    subtitle: 'La plataforma integral para colegios privados en México.'
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
  youtubeUrl: initialConfig.youtubeUrl || 'https://youtu.be/WgeQVmHDNJ4',
  youtubeId: initialConfig.youtubeId || 'WgeQVmHDNJ4',
  title: initialConfig.title || 'iSkool® — El Cerebro Vivo de tu Escuela',
  subtitle:
    initialConfig.subtitle ||
    'Plataforma educativa integral potenciada con Inteligencia Artificial y tecnología creada en Canadá para colegios privados en México.',
  badgeText: initialConfig.badgeText || 'Presentación Ejecutiva Oficial · Alta Definición',
  ctaText: initialConfig.ctaText || 'Agendar Demostración',
  ctaUrl: initialConfig.ctaUrl || 'https://iskool.mx',
  autoplay: initialConfig.autoplay ?? true,
  loop: initialConfig.loop ?? true,
  updatedAt: initialConfig.updatedAt || new Date().toISOString()
};

function loadConfigFromDisk(): QrVideoConfig | null {
  const node = getNodeFs();
  if (!node) return null;

  try {
    const runtimePath = node.path.join(process.cwd(), '.data', 'qr_video_config.json');
    const sourcePath = node.path.join(process.cwd(), 'src', 'data', 'qrVideoConfig.json');

    let runtimeConfig: QrVideoConfig | null = null;
    let sourceConfig: QrVideoConfig | null = null;

    if (node.fs.existsSync(runtimePath)) {
      const parsed = JSON.parse(node.fs.readFileSync(runtimePath, 'utf8'));
      if (parsed && parsed.youtubeId) {
        runtimeConfig = { ...DEFAULT_CONFIG, ...parsed };
      }
    }

    if (node.fs.existsSync(sourcePath)) {
      const parsed = JSON.parse(node.fs.readFileSync(sourcePath, 'utf8'));
      if (parsed && parsed.youtubeId) {
        sourceConfig = { ...DEFAULT_CONFIG, ...parsed };
      }
    }

    if (runtimeConfig && sourceConfig) {
      const rtTime = Date.parse(runtimeConfig.updatedAt || '') || 0;
      const srcTime = Date.parse(sourceConfig.updatedAt || '') || 0;
      return rtTime > srcTime ? runtimeConfig : sourceConfig;
    }

    return sourceConfig || runtimeConfig;
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

