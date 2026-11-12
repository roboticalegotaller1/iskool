'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CharacterAnatomicalMouth,
  getHistoricalMouthConfig,
} from '@/lib/historicalVoiceEngine';

function getVoiceFormantLevels() {
  if (typeof window !== 'undefined' && (window as any).__iskoolActiveFormantLevels) {
    return (window as any).__iskoolActiveFormantLevels;
  }
  return { rms: 0, open: 0, spread: 0, rounded: 0, alveolar: false, bilabial: false };
}

export type AvatarGestureMode =
  | 'auto'
  | 'welcome'
  | 'explain'
  | 'exclaim'
  | 'inquire'
  | 'encourage'
  | 'celebrate'
  | 'point'
  | 'pronounce'
  | 'wave'
  | 'think'
  | 'calm'
  | 'listen';

export type ConcreteAvatarGesture = Exclude<AvatarGestureMode, 'auto'>;

export interface NanoBananaLipSyncCanvasProps {
  /** URL of the character's canonical portrait or 3D render */
  imageSrc: string;
  /** Character ID or name used to resolve calibrated anatomical landmarks */
  characterId: string;
  /** Whether the character is actively speaking */
  isSpeaking: boolean;
  /** Optional continuous 3D neural motion video (.mp4) URL */
  videoSrc?: string;
  /** Optional map of gesture-specific 3D neural motion video (.mp4) URLs */
  gestureVideoMap?: Partial<Record<ConcreteAvatarGesture, string>>;
  /** Optional explicit mouth config override */
  mouthConfig?: CharacterAnatomicalMouth;
  /** Optional external real-time mouth open ratio (0..1) from parent analyser */
  externalMouthOpen?: number;
  /** Optional external real-time mouth width/spread ratio (-0.5..0.5) from parent analyser */
  externalMouthSpread?: number;
  /** Optional text currently being spoken (used to drive phoneme-aware syllable envelopes) */
  spokenText?: string;
  /** Optional compendium of multi-gesture pose URLs keyed by gesture type */
  poseCompendium?: Partial<Record<ConcreteAvatarGesture | 'blink' | 'turn', string>>;
  /** Active gesture mode ('auto' cycles contextually & dynamically; or explicit gesture key) */
  activeGesture?: AvatarGestureMode;
  /** Optional callback notified whenever the resolved gesture changes */
  onResolvedGestureChange?: (gesture: ConcreteAvatarGesture) => void;
  /** Optional external trigger counter to force an immediate blink + gesture accent */
  impulseTrigger?: number;
  /** Optional CSS class for the outer container */
  className?: string;
  /** Optional fallback image if primary image fails */
  fallbackImageSrc?: string;
  /** Whether to apply bust framing automatically for full/half-body portraits */
  enableSmartBustCrop?: boolean;
  /** Optional callback when image finishes loading */
  onLoad?: () => void;
}

interface VisemeToken {
  open: number;
  spread: number;
  tongue: number;
  bilabial: boolean;
  durationWeight: number;
}

interface PoseEyeOffset {
  dxL: number;
  dyL: number;
  dxR: number;
  dyR: number;
}

interface EyelidSkinPalette {
  base: string;
  highlight: string;
  crease: string;
}

/**
 * Extracts a realistic phoneme-to-viseme sequence from text in English, French, or Spanish
 * so lip-sync matches actual bilabial closures (/m/, /b/, /p/), open vowels (/a/, /o/),
 * spread vowels (/e/, /i/), rounded vowels (/u/, /w/, 'ou'), and alveolar tongue lifts.
 */
function buildPhonemeVisemeSequence(text: string): VisemeToken[] {
  const clean = (text || '').trim();
  if (!clean) {
    return [
      { open: 0.65, spread: 0.15, tongue: 0.3, bilabial: false, durationWeight: 1 },
      { open: 0.02, spread: -0.08, tongue: 0.2, bilabial: true, durationWeight: 0.6 },
      { open: 0.82, spread: -0.18, tongue: 0.4, bilabial: false, durationWeight: 1.1 },
      { open: 0.45, spread: 0.28, tongue: 0.85, bilabial: false, durationWeight: 0.9 },
    ];
  }

  const tokens: VisemeToken[] = [];
  const lower = clean.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    const next = lower[i + 1] || '';

    if (ch === ' ' || ch === '\n') {
      tokens.push({ open: 0.12, spread: 0, tongue: 0.25, bilabial: false, durationWeight: 0.38 });
      i++;
      continue;
    }
    if (ch === ',' || ch === ';' || ch === ':' || ch === '.' || ch === '!' || ch === '?') {
      tokens.push({ open: 0.0, spread: 0, tongue: 0.2, bilabial: true, durationWeight: 0.85 });
      i++;
      continue;
    }
    if (ch === 'm' || ch === 'b' || ch === 'p') {
      tokens.push({ open: 0.0, spread: -0.08, tongue: 0.2, bilabial: true, durationWeight: 0.58 });
      i++;
      continue;
    }
    if (ch === 'f' || ch === 'v') {
      tokens.push({ open: 0.14, spread: 0.12, tongue: 0.25, bilabial: false, durationWeight: 0.52 });
      i++;
      continue;
    }
    if ((ch === 'o' && next === 'u') || (ch === 'o' && next === 'o')) {
      tokens.push({ open: 0.46, spread: -0.36, tongue: 0.3, bilabial: false, durationWeight: 1.05 });
      i += 2;
      continue;
    }
    if ('aáàâäoóòôö'.includes(ch)) {
      const isA = 'aáàâä'.includes(ch);
      tokens.push({
        open: isA ? 0.88 : 0.74,
        spread: isA ? 0.12 : -0.24,
        tongue: 0.32,
        bilabial: false,
        durationWeight: 1.05,
      });
      i++;
      continue;
    }
    if ('eéèêëiíìîïy'.includes(ch)) {
      const isI = 'iíìîïy'.includes(ch);
      tokens.push({
        open: isI ? 0.42 : 0.58,
        spread: isI ? 0.36 : 0.26,
        tongue: isI ? 0.72 : 0.52,
        bilabial: false,
        durationWeight: 0.95,
      });
      i++;
      continue;
    }
    if ('uúùûüw'.includes(ch)) {
      tokens.push({ open: 0.38, spread: -0.36, tongue: 0.35, bilabial: false, durationWeight: 0.92 });
      i++;
      continue;
    }
    if ('lntdrszc'.includes(ch)) {
      tokens.push({ open: 0.30, spread: 0.10, tongue: 0.88, bilabial: false, durationWeight: 0.55 });
      i++;
      continue;
    }

    tokens.push({ open: 0.34, spread: 0.04, tongue: 0.48, bilabial: false, durationWeight: 0.55 });
    i++;
  }

  return tokens.length > 0
    ? tokens
    : [{ open: 0.6, spread: 0.1, tongue: 0.4, bilabial: false, durationWeight: 1 }];
}

/**
 * Physiological asymmetrical human eyelid blink curve:
 * - Fast downward closure (0.00 -> 0.34): smooth cubic acceleration
 * - Brief natural tarsal seal (0.34 -> 0.48): 100% closed (1.0)
 * - Smooth organic opening (0.48 -> 1.00): smooth cubic deceleration back to 0.0
 */
export function computePhysiologicalBlink(normProgress: number): number {
  if (normProgress <= 0 || normProgress >= 1) return 0;
  if (normProgress < 0.34) {
    const t = normProgress / 0.34;
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  if (normProgress <= 0.48) {
    return 1.0;
  }
  const tOpen = (normProgress - 0.48) / 0.52;
  return Math.max(0, Math.pow(1 - tOpen, 2.15));
}

/**
 * Contextual 12-movement pedagogical choreographer for 'auto' mode.
 */
export function buildContextualMovementSequence(text: string): ConcreteAvatarGesture[] {
  const clean = (text || '').trim();
  const hasExclaim =
    clean.includes('!') ||
    clean.includes('¡') ||
    /bravo|excellent|wonderful|magnifique|super|congrat|felicidades|genial|perfect/i.test(clean);
  const hasQuestion =
    clean.includes('?') ||
    clean.includes('¿') ||
    /\b(comment|pourquoi|where|how|what|why|would|could|can you|quel|quelle|quien|como|donde)\b/i.test(clean);
  const hasGreeting =
    /\b(hello|hi|good morning|good afternoon|welcome|bonjour|salut|bienvenue|goodbye|bye|au revoir|hola|buenos dias)\b/i.test(
      clean
    );
  const hasPhonetic =
    /\b(repeat|listen|pronounce|sound|syllable|accent|stress|ecoute|repete|prononce|repite|escucha)\b/i.test(clean);
  const hasCalm =
    /\b(slow|step by step|calm|relax|breathe|lentement|doucement|despacio|calma|paso a paso)\b/i.test(clean);

  if (hasPhonetic) {
    return ['pronounce', 'explain', 'calm', 'point', 'encourage', 'listen', 'think', 'celebrate'];
  }
  if (hasCalm) {
    return ['calm', 'welcome', 'explain', 'pronounce', 'encourage', 'listen'];
  }
  if (hasGreeting && hasQuestion) {
    return ['welcome', 'wave', 'inquire', 'explain', 'point', 'encourage', 'celebrate', 'think'];
  }
  if (hasExclaim) {
    return ['exclaim', 'celebrate', 'encourage', 'wave', 'explain', 'think', 'welcome', 'point'];
  }
  if (hasQuestion) {
    return ['inquire', 'think', 'point', 'explain', 'pronounce', 'encourage', 'welcome', 'listen'];
  }
  return [
    'welcome',
    'wave',
    'explain',
    'point',
    'think',
    'inquire',
    'pronounce',
    'exclaim',
    'celebrate',
    'encourage',
    'calm',
    'listen',
  ];
}

function measureDarkPupilCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): { x: number; y: number } | null {
  try {
    const x0 = Math.max(0, Math.floor(cx - rx * 1.1));
    const y0 = Math.max(0, Math.floor(cy - ry * 0.95));
    const w = Math.min(1024 - x0, Math.ceil(rx * 2.2));
    const h = Math.min(1024 - y0, Math.ceil(ry * 1.9));
    if (w <= 4 || h <= 4) return null;
    const img = ctx.getImageData(x0, y0, w, h);
    const data = img.data;
    let minLuma = 255;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luma < minLuma) minLuma = luma;
    }
    const thresh = minLuma + 26;
    let sumX = 0;
    let sumY = 0;
    let sumW = 0;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const idx = (py * w + px) * 4;
        if (data[idx + 3] < 128) continue;
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (luma <= thresh) {
          const weight = (thresh - luma + 1) * (thresh - luma + 1);
          sumX += (x0 + px) * weight;
          sumY += (y0 + py) * weight;
          sumW += weight;
        }
      }
    }
    if (sumW <= 0) return null;
    return { x: sumX / sumW, y: sumY / sumW };
  } catch {
    return null;
  }
}

function sampleEyelidSkinPalette(
  canvas: HTMLCanvasElement,
  lx: number,
  ly: number,
  ry: number
): EyelidSkinPalette {
  const fallback: EyelidSkinPalette = {
    base: 'rgb(226, 178, 156)',
    highlight: 'rgb(240, 196, 176)',
    crease: 'rgb(168, 118, 98)',
  };
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return fallback;
    const sx = Math.max(0, Math.min(1018, Math.round(lx - 6)));
    const sy = Math.max(0, Math.min(1018, Math.round(ly - ry * 0.78)));
    const data = ctx.getImageData(sx, sy, 12, 6).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
    if (n === 0) return fallback;
    r = Math.round(r / n);
    g = Math.round(g / n);
    b = Math.round(b / n);
    return {
      base: `rgb(${r}, ${g}, ${b})`,
      highlight: `rgb(${Math.min(255, r + 16)}, ${Math.min(255, g + 14)}, ${Math.min(255, b + 12)})`,
      crease: `rgb(${Math.max(0, r - 48)}, ${Math.max(0, g - 44)}, ${Math.max(0, b - 40)})`,
    };
  } catch {
    return fallback;
  }
}

interface SpringState {
  open: number;
  openVel: number;
  spread: number;
  spreadVel: number;
  tongue: number;
  tongueVel: number;
  blink: number;
  browLift: number;
  browLiftVel: number;
  browAsym: number;
  saccadeX: number;
  saccadeY: number;
  gestureImpulse: number;
}

/**
 * Motor Neuronal 3D Institucional a 60 FPS:
 * Combina Streams de Video Neuronal 3D (.mp4) Simétricos + Compendio de 12 Movimientos 3D +
 * Cortina Palpebral Periorbital Anatómica sin Deformación de Pupila + Lip-Sync Fonético en Tiempo Real.
 */
export const NanoBananaLipSyncCanvas: React.FC<NanoBananaLipSyncCanvasProps> = ({
  imageSrc,
  characterId,
  isSpeaking,
  videoSrc,
  gestureVideoMap,
  mouthConfig,
  externalMouthOpen = 0,
  externalMouthSpread = 0,
  spokenText = '',
  poseCompendium,
  activeGesture = 'auto',
  onResolvedGestureChange,
  impulseTrigger = 0,
  className = '',
  fallbackImageSrc = '/images/history/personaje_generico_avatar.png',
  enableSmartBustCrop = true,
  onLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const videoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const poseEyeOffsetRef = useRef<Map<HTMLCanvasElement, PoseEyeOffset>>(new Map());
  const refPupilsRef = useRef<{ lx: number; ly: number; rx: number; ry: number } | null>(null);
  const eyelidSkinRef = useRef<EyelidSkinPalette>({
    base: 'rgb(226, 178, 156)',
    highlight: 'rgb(240, 196, 176)',
    crease: 'rgb(168, 118, 98)',
  });

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoPoolRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const videoReadyRef = useRef<boolean>(false);
  const activeVideoUrlRef = useRef<string>('');

  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const externalOpenRef = useRef<number>(externalMouthOpen);
  const externalSpreadRef = useRef<number>(externalMouthSpread);
  const spokenTextRef = useRef<string>(spokenText);
  const visemeTokensRef = useRef<VisemeToken[]>(buildPhonemeVisemeSequence(spokenText));
  const activeGestureRef = useRef<AvatarGestureMode>(activeGesture);
  const resolvedGestureRef = useRef<ConcreteAvatarGesture>('welcome');
  const poseCompendiumRef = useRef(poseCompendium);
  const gestureVideoMapRef = useRef(gestureVideoMap);
  const videoSrcRef = useRef(videoSrc);
  const onResolvedGestureChangeRef = useRef(onResolvedGestureChange);

  const prevPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionStartRef = useRef<number>(0);
  const forceBlinkRef = useRef<boolean>(false);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = isSpeaking ? 1.12 : 0.86;
      if (videoElementRef.current.paused) {
        videoElementRef.current.play().catch(() => {});
      }
    }
  }, [isSpeaking]);

  useEffect(() => {
    externalOpenRef.current = externalMouthOpen;
  }, [externalMouthOpen]);

  useEffect(() => {
    externalSpreadRef.current = externalMouthSpread;
  }, [externalMouthSpread]);

  useEffect(() => {
    spokenTextRef.current = spokenText;
    visemeTokensRef.current = buildPhonemeVisemeSequence(spokenText);
  }, [spokenText]);

  useEffect(() => {
    activeGestureRef.current = activeGesture;
    if (activeGesture === 'listen') {
      forceBlinkRef.current = true;
    }
  }, [activeGesture]);

  useEffect(() => {
    poseCompendiumRef.current = poseCompendium;
  }, [poseCompendium]);

  useEffect(() => {
    gestureVideoMapRef.current = gestureVideoMap;
  }, [gestureVideoMap]);

  useEffect(() => {
    videoSrcRef.current = videoSrc;
  }, [videoSrc]);

  useEffect(() => {
    onResolvedGestureChangeRef.current = onResolvedGestureChange;
  }, [onResolvedGestureChange]);

  useEffect(() => {
    if (impulseTrigger > 0) {
      forceBlinkRef.current = true;
    }
  }, [impulseTrigger]);

  // Resolve calibrated anatomical landmarks in 1024x1024 space
  const resolvedConfig = React.useMemo(() => {
    if (mouthConfig) return mouthConfig;
    const key = characterId || imageSrc;
    return getHistoricalMouthConfig(key);
  }, [characterId, imageSrc, mouthConfig]);

  const registerPoseEyeAlignment = React.useCallback(
    (poseCanvas: HTMLCanvasElement, isCanonical: boolean, isBlinkSprite: boolean) => {
      if (isBlinkSprite) return;
      const cfg = resolvedConfig;
      if (!cfg.leftEyeX || !cfg.rightEyeX || !(cfg.leftEyeY || cfg.eyeY)) return;
      const ctx = poseCanvas.getContext('2d');
      if (!ctx) return;

      const lx = cfg.leftEyeX;
      const ly = cfg.leftEyeY ?? cfg.eyeY ?? 260;
      const rx = cfg.rightEyeX;
      const ry = cfg.rightEyeY ?? cfg.eyeY ?? 260;
      const eRx = cfg.eyeRx ?? cfg.eyeRadius ?? 30;
      const eRy = cfg.eyeRy ?? cfg.eyeRadius ?? 28;

      const pL = measureDarkPupilCenter(ctx, lx, ly, eRx, eRy);
      const pR = measureDarkPupilCenter(ctx, rx, ry, eRx, eRy);
      if (!pL || !pR) return;

      if (isCanonical || !refPupilsRef.current) {
        refPupilsRef.current = { lx: pL.x, ly: pL.y, rx: pR.x, ry: pR.y };
        poseEyeOffsetRef.current.set(poseCanvas, { dxL: 0, dyL: 0, dxR: 0, dyR: 0 });
        eyelidSkinRef.current = sampleEyelidSkinPalette(poseCanvas, lx, ly, eRy);
      } else {
        const ref = refPupilsRef.current;
        const clampShift = (v: number) => Math.max(-26, Math.min(26, v));
        poseEyeOffsetRef.current.set(poseCanvas, {
          dxL: clampShift(pL.x - ref.lx),
          dyL: clampShift(pL.y - ref.ly),
          dxR: clampShift(pR.x - ref.rx),
          dyR: clampShift(pR.y - ref.ry),
        });
      }
    },
    [resolvedConfig]
  );

  // Helper to load an image URL into a 1024x1024 offscreen canvas and cache it
  const loadPoseToCanvas = React.useCallback(
    (src: string, onDone?: (canvas: HTMLCanvasElement) => void, isCanonical = false, isBlinkSprite = false) => {
      if (!src) return;
      const cached = poseCacheRef.current.get(src);
      if (cached) {
        onDone?.(cached);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = 1024;
        off.height = 1024;
        const octx = off.getContext('2d');
        if (octx) {
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = 'high';
          octx.drawImage(img, 0, 0, 1024, 1024);
        }
        poseCacheRef.current.set(src, off);
        registerPoseEyeAlignment(off, isCanonical, isBlinkSprite);
        onDone?.(off);
      };
      img.onerror = () => {
        if (fallbackImageSrc && src !== fallbackImageSrc) {
          loadPoseToCanvas(fallbackImageSrc, onDone, isCanonical, isBlinkSprite);
        }
      };
      img.src = src;
    },
    [fallbackImageSrc, registerPoseEyeAlignment]
  );

  // Helper to obtain or pre-warm a cached <video> element for instant zero-flash 3D gesture switching
  const getOrCreatePooledVideo = React.useCallback((url: string): HTMLVideoElement => {
    const existing = videoPoolRef.current.get(url);
    if (existing) return existing;
    const vid = document.createElement('video');
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.preload = 'auto';
    vid.src = url;
    vid.load();
    videoPoolRef.current.set(url, vid);
    return vid;
  }, []);

  // Initialize and manage the 3D Neural Motion <video> stream
  const loadActiveVideoStream = React.useCallback(
    (targetVideoUrl?: string) => {
      if (typeof window === 'undefined') return;
      if (!targetVideoUrl) {
        if (videoElementRef.current && !videoElementRef.current.paused) {
          videoElementRef.current.pause();
        }
        videoReadyRef.current = false;
        activeVideoUrlRef.current = '';
        return;
      }
      if (activeVideoUrlRef.current === targetVideoUrl && videoElementRef.current) {
        videoReadyRef.current = videoElementRef.current.readyState >= 2;
        if (videoElementRef.current.paused) {
          videoElementRef.current.play().catch(() => {});
        }
        return;
      }

      if (!videoFrameCanvasRef.current) {
        const vOff = document.createElement('canvas');
        vOff.width = 1024;
        vOff.height = 1024;
        videoFrameCanvasRef.current = vOff;
      }

      if (videoElementRef.current && !videoElementRef.current.paused) {
        videoElementRef.current.pause();
      }

      const vid = getOrCreatePooledVideo(targetVideoUrl);
      videoElementRef.current = vid;
      activeVideoUrlRef.current = targetVideoUrl;
      vid.currentTime = 0;
      vid.playbackRate = isSpeakingRef.current ? 1.12 : 0.98;

      if (vid.readyState >= 2) {
        videoReadyRef.current = true;
        vid.play().catch(() => {});
      } else {
        videoReadyRef.current = false;
        const markReady = () => {
          if (activeVideoUrlRef.current === targetVideoUrl) {
            videoReadyRef.current = true;
            vid.play().catch(() => {});
          }
        };
        vid.onloadeddata = markReady;
        vid.oncanplay = markReady;
        vid.onerror = () => {
          if (activeVideoUrlRef.current === targetVideoUrl) {
            videoReadyRef.current = false;
          }
        };
      }
    },
    [getOrCreatePooledVideo]
  );

  // Preload canonical image + entire poseCompendium + pre-warm 3D video pool
  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;
    refPupilsRef.current = null;

    loadPoseToCanvas(
      imageSrc,
      (off) => {
        if (cancelled) return;
        offscreenRef.current = off;
        if (!currPoseCanvasRef.current) {
          currPoseCanvasRef.current = off;
        } else if (currPoseCanvasRef.current !== off) {
          prevPoseCanvasRef.current = currPoseCanvasRef.current;
          currPoseCanvasRef.current = off;
          transitionStartRef.current = performance.now();
        }
        setLoadedSrc(imageSrc);
        onLoad?.();
      },
      true,
      false
    );

    if (poseCompendium) {
      Object.entries(poseCompendium).forEach(([key, url]) => {
        if (url) {
          loadPoseToCanvas(url, undefined, false, key === 'blink');
        }
      });
    }

    if (typeof window !== 'undefined' && gestureVideoMap) {
      Object.values(gestureVideoMap).forEach((vUrl) => {
        if (vUrl) getOrCreatePooledVideo(vUrl);
      });
    }

    const desiredVideo =
      activeGesture !== 'auto'
        ? gestureVideoMap?.[activeGesture]
        : gestureVideoMap?.welcome || videoSrc;
    loadActiveVideoStream(desiredVideo);

    return () => {
      cancelled = true;
    };
  }, [
    imageSrc,
    poseCompendium,
    videoSrc,
    gestureVideoMap,
    activeGesture,
    loadPoseToCanvas,
    loadActiveVideoStream,
    getOrCreatePooledVideo,
    onLoad,
  ]);

  // Cleanup pooled video elements on unmount
  useEffect(() => {
    const pool = videoPoolRef.current;
    return () => {
      pool.forEach((v) => {
        v.pause();
        v.src = '';
      });
      pool.clear();
      videoElementRef.current = null;
    };
  }, []);

  // Switch active pose canvas and/or gesture video stream smoothly when gesture changes
  const switchToGesturePose = React.useCallback(
    (gesture: ConcreteAvatarGesture, now: number) => {
      const compendium = poseCompendiumRef.current;
      const targetUrl = (compendium && compendium[gesture]) || imageSrc;
      const targetCanvas = poseCacheRef.current.get(targetUrl) || offscreenRef.current;

      if (resolvedGestureRef.current !== gesture) {
        resolvedGestureRef.current = gesture;
        onResolvedGestureChangeRef.current?.(gesture);
      }

      // Snapshot current visible state for smooth 250ms cross-dissolve
      if (videoReadyRef.current && videoFrameCanvasRef.current) {
        const snap = document.createElement('canvas');
        snap.width = 1024;
        snap.height = 1024;
        snap.getContext('2d')?.drawImage(videoFrameCanvasRef.current, 0, 0);
        prevPoseCanvasRef.current = snap;
      } else if (currPoseCanvasRef.current) {
        prevPoseCanvasRef.current = currPoseCanvasRef.current;
      }

      if (targetCanvas) {
        currPoseCanvasRef.current = targetCanvas;
        transitionStartRef.current = now;
      }

      // Resolve dedicated 3D motion clip if one exists for this specific movement;
      // otherwise render the high-precision 1024x1024 3D pose with 60 FPS bespoke kinematics!
      const gMap = gestureVideoMapRef.current;
      const masterVid = videoSrcRef.current;
      if (gesture === 'listen') {
        loadActiveVideoStream(undefined);
      } else if (gMap && gMap[gesture]) {
        loadActiveVideoStream(gMap[gesture]);
      } else if (!gMap && masterVid && (gesture === 'welcome' || gesture === 'explain' || gesture === 'exclaim')) {
        loadActiveVideoStream(masterVid);
      } else {
        loadActiveVideoStream(undefined);
      }
    },
    [imageSrc, loadActiveVideoStream]
  );

  // Automatic & Contextual 12-Movement 3D Gesture Director
  useEffect(() => {
    const now = performance.now();

    if (activeGesture !== 'auto') {
      switchToGesturePose(activeGesture, now);
      return;
    }

    const rawSequence = buildContextualMovementSequence(spokenText || '');
    const compendium = poseCompendiumRef.current;
    const gMap = gestureVideoMapRef.current;

    // Filter to movements supported by this character's compendium or video map
    const availableSequence = rawSequence.filter(
      (g) => Boolean(compendium?.[g] || gMap?.[g] || g === 'welcome')
    );
    const cycleSequence: ConcreteAvatarGesture[] =
      availableSequence.length > 0 ? availableSequence : ['welcome'];

    let step = 0;
    switchToGesturePose(cycleSequence[0], now);

    const timer = setInterval(() => {
      if (activeGestureRef.current !== 'auto') return;
      step = (step + 1) % cycleSequence.length;
      switchToGesturePose(cycleSequence[step], performance.now());
    }, 3100);

    return () => clearInterval(timer);
  }, [activeGesture, isSpeaking, spokenText, switchToGesturePose]);

  // 60 FPS RequestAnimationFrame 3D Neural Video + Multi-Movement Skeletal & Periorbital Eyelid Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = performance.now();
    let nextBlinkAt = lastTime + 950 + Math.random() * 1250;
    let blinkStartAt = -1;
    let pendingDoubleBlink = false;
    const NORMAL_BLINK_MS = 195;
    const DEMO_BLINK_MS = 320;

    let nextSaccadeAt = lastTime + 1100;
    let targetSaccadeX = 0;
    let targetSaccadeY = 0;

    const spring: SpringState = {
      open: resolvedConfig.baseOpen ?? 0,
      openVel: 0,
      spread: 0,
      spreadVel: 0,
      tongue: 0.25,
      tongueVel: 0,
      blink: 0,
      browLift: 0,
      browLiftVel: 0,
      browAsym: 0,
      saccadeX: 0,
      saccadeY: 0,
      gestureImpulse: 0,
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      const vid = videoElementRef.current;
      const vOff = videoFrameCanvasRef.current;
      const isExplicitBlinkHold = activeGestureRef.current === 'listen';
      let hasLiveVideoFrame = false;

      if (
        vid &&
        vOff &&
        Boolean(activeVideoUrlRef.current) &&
        videoReadyRef.current &&
        vid.readyState >= 2 &&
        !isExplicitBlinkHold
      ) {
        const vCtx = vOff.getContext('2d');
        if (vCtx) {
          vCtx.drawImage(vid, 0, 0, 1024, 1024);
          hasLiveVideoFrame = true;
        }
      }

      const staticPoseOff = currPoseCanvasRef.current || offscreenRef.current;
      const baseOff = hasLiveVideoFrame && vOff ? vOff : staticPoseOff;
      if (!baseOff) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const cfg = resolvedConfig;
      const baseOpen = cfg.baseOpen ?? 0;
      const speaking = isSpeakingRef.current;
      const currentGesture = resolvedGestureRef.current;
      const tSec = now * 0.001;

      // 1. Phoneme-Viseme Sequencer + Real-Time Web Audio Formant Lip-Sync at 60 FPS
      let targetOpen = 0.04;
      let targetSpread = 0;
      let targetTongue = 0.25;

      if (speaking) {
        const formants = getVoiceFormantLevels();
        const extOpen = externalOpenRef.current;
        const extSpread = externalSpreadRef.current;

        const tokens = visemeTokensRef.current;
        const seqIndex = Math.floor(tSec * 7.2) % tokens.length;
        const tok = tokens[seqIndex] || { open: 0.5, spread: 0, tongue: 0.3, bilabial: false };

        const sylMod = 0.82 + 0.24 * Math.sin(tSec * 14.5);
        const oscOpen = tok.bilabial ? 0.0 : Math.min(0.98, tok.open * sylMod);
        const oscSpread = tok.spread + 0.08 * Math.sin(tSec * 8.4);
        const oscTongue = tok.tongue;

        if (formants.rms > 0.015) {
          if (formants.bilabial || tok.bilabial) {
            targetOpen = 0.0;
            targetSpread = -0.12;
          } else {
            const formantOpen = Math.min(0.98, Math.max(0.20, formants.open * 1.2));
            targetOpen = Math.min(0.98, formantOpen * 0.62 + oscOpen * 0.38);
            targetSpread = (formants.spread - formants.rounded * 0.85) * 0.45 + oscSpread * 0.35;
            targetTongue = formants.alveolar ? 0.88 : oscTongue;
          }
        } else if (extOpen > 0.03) {
          if (tok.bilabial) {
            targetOpen = 0.0;
            targetSpread = -0.10;
          } else {
            targetOpen = Math.min(0.98, Math.max(0.22, extOpen * 1.25) * 0.58 + oscOpen * 0.42);
            targetSpread = extSpread * 0.55 + oscSpread * 0.45;
            targetTongue = oscTongue;
          }
        } else {
          targetOpen = oscOpen;
          targetSpread = oscSpread;
          targetTongue = oscTongue;
        }

        if (currentGesture === 'exclaim' || currentGesture === 'celebrate') {
          targetOpen = Math.min(1.0, targetOpen * 1.14);
          targetSpread = Math.max(targetSpread, 0.16);
        } else if (currentGesture === 'pronounce') {
          targetOpen = Math.min(1.0, targetOpen * 1.22);
          targetSpread = targetSpread * 1.25;
        }
      }

      const poseIsClosedSmile =
        currentGesture === 'listen' || currentGesture === 'inquire';
      const effectiveBaseOpen = poseIsClosedSmile ? 0.04 : baseOpen;

      if (!speaking) {
        targetOpen = effectiveBaseOpen;
        targetSpread = 0;
        targetTongue = 0.22;
      }

      // 2. Damped 60 FPS Spring Physics Integration
      const stiffness = 390;
      const damping = 24;

      const openForce = (targetOpen - spring.open) * stiffness - spring.openVel * damping;
      spring.openVel += openForce * dt;
      spring.open = Math.max(0, Math.min(1.0, spring.open + spring.openVel * dt));

      const spreadForce = (targetSpread - spring.spread) * (stiffness * 0.85) - spring.spreadVel * damping;
      spring.spreadVel += spreadForce * dt;
      spring.spread = Math.max(-0.45, Math.min(0.45, spring.spread + spring.spreadVel * dt));

      const tongueForce = (targetTongue - spring.tongue) * 280 - spring.tongueVel * 22;
      spring.tongueVel += tongueForce * dt;
      spring.tongue = Math.max(0, Math.min(1, spring.tongue + spring.tongueVel * dt));

      // Modulate live 3D video cadence naturally with gesture rhythm & voice syllable energy
      if (hasLiveVideoFrame && vid) {
        const briskGesture = currentGesture === 'wave' || currentGesture === 'celebrate';
        const baseIdleRate = briskGesture ? 1.12 : 0.98;
        const desiredRate = speaking
          ? Math.min(1.36, baseIdleRate + 0.08 + spring.open * 0.26)
          : baseIdleRate;
        if (Math.abs(vid.playbackRate - desiredRate) > 0.04) {
          vid.playbackRate = desiredRate;
        }
      }

      if (canvas.dataset.gesture !== currentGesture) {
        canvas.dataset.gesture = currentGesture;
      }
      const videoActiveFlag = hasLiveVideoFrame ? 'true' : 'false';
      if (canvas.dataset.videoActive !== videoActiveFlag) {
        canvas.dataset.videoActive = videoActiveFlag;
      }

      // 3. Eyebrow Expression Physics (used strictly on static 3D pose rig)
      let targetBrowLift = speaking ? Math.sin(tSec * 2.4) * 0.16 + spring.open * 0.30 : Math.sin(tSec * 1.5) * 0.06;
      let targetBrowAsym = 0;
      if (currentGesture === 'exclaim' || currentGesture === 'celebrate' || currentGesture === 'think') {
        targetBrowLift = 0.45 + Math.sin(tSec * 4.6) * 0.10;
      } else if (currentGesture === 'inquire') {
        targetBrowLift = 0.34;
        targetBrowAsym = 0.42;
      } else if (currentGesture === 'calm') {
        targetBrowLift = 0.12;
      }
      targetBrowLift -= spring.blink * 0.12;

      const browForce = (targetBrowLift - spring.browLift) * 240 - spring.browLiftVel * 20;
      spring.browLiftVel += browForce * dt;
      spring.browLift = Math.max(-0.22, Math.min(0.75, spring.browLift + spring.browLiftVel * dt));
      spring.browAsym += (targetBrowAsym - spring.browAsym) * Math.min(1, dt * 8);

      // 4. Physiological Symmetrical Eyelid Blinking (Single + Occasional Natural Double Blink)
      const isExplicitBlinkDemo = activeGestureRef.current === 'listen';
      const activeBlinkDuration = isExplicitBlinkDemo ? DEMO_BLINK_MS : NORMAL_BLINK_MS;

      if (forceBlinkRef.current) {
        forceBlinkRef.current = false;
        spring.gestureImpulse = 1.0;
        blinkStartAt = now;
        pendingDoubleBlink = isExplicitBlinkDemo;
        nextBlinkAt = now + activeBlinkDuration + (isExplicitBlinkDemo ? 240 : 1850 + Math.random() * 1100);
      } else if (now >= nextBlinkAt && blinkStartAt < 0) {
        blinkStartAt = now;
        if (!pendingDoubleBlink && Math.random() < (isExplicitBlinkDemo ? 0.55 : 0.28)) {
          pendingDoubleBlink = true;
          nextBlinkAt = now + activeBlinkDuration + 190;
        } else {
          pendingDoubleBlink = false;
          nextBlinkAt =
            now +
            (isExplicitBlinkDemo
              ? 1050 + Math.random() * 500
              : speaking
                ? 2100 + Math.random() * 1450
                : 2400 + Math.random() * 1600);
        }
      }

      if (blinkStartAt >= 0) {
        const elapsed = now - blinkStartAt;
        if (elapsed >= activeBlinkDuration) {
          spring.blink = 0;
          blinkStartAt = -1;
        } else {
          spring.blink = computePhysiologicalBlink(elapsed / activeBlinkDuration);
        }
      } else {
        spring.blink = 0;
      }

      spring.gestureImpulse *= Math.max(0, 1 - dt * 5.2);

      // Eye gaze micro-saccades
      if (now >= nextSaccadeAt) {
        nextSaccadeAt = now + 1150 + Math.random() * 1550;
        targetSaccadeX = currentGesture === 'point' ? -3.4 + (Math.random() - 0.5) * 2.0 : (Math.random() - 0.5) * 4.2;
        targetSaccadeY = (Math.random() - 0.5) * 2.2;
      }
      spring.saccadeX += (targetSaccadeX - spring.saccadeX) * Math.min(1, dt * 12);
      spring.saccadeY += (targetSaccadeY - spring.saccadeY) * Math.min(1, dt * 12);

      // =======================================================================
      // 5. FOREGROUND-DECOUPLED 3D COMPOSITOR (BACKGROUND & HANDS 100% UNDISTORTED)
      // =======================================================================
      ctx.save();
      ctx.clearRect(0, 0, 1024, 1024);

      if (enableSmartBustCrop && cfg.bustCrop) {
        const { focusX, focusY, zoom } = cfg.bustCrop;
        ctx.translate(512, 512);
        ctx.scale(zoom, zoom);
        ctx.translate(-focusX, -focusY);
      }

      // IMPORTANT: Never swap the full 1024x1024 body to blinkPoseCanvas (prevents arm/mouth teleportation!)
      const activeFrameCanvas = baseOff;

      // LAYER 0: Locked Static Background
      const staticBgRef = offscreenRef.current || activeFrameCanvas;
      ctx.globalAlpha = 1;
      ctx.drawImage(staticBgRef, 0, 0, 1024, 1024);

      // LAYER 1: Active 3D Video Stream or High-Precision 3D Pose with Smooth 160ms Cross-Dissolve
      // (Zero 2D limb shearing or background-crossing ellipse strip-warping — 100% undistorted hands & props!)
      const transElapsed = now - transitionStartRef.current;
      const TRANS_DURATION = 160;
      const isCrossDissolving = Boolean(
        prevPoseCanvasRef.current &&
          prevPoseCanvasRef.current !== activeFrameCanvas &&
          transElapsed < TRANS_DURATION
      );

      if (isCrossDissolving && prevPoseCanvasRef.current) {
        const alpha = Math.min(1, Math.max(0, transElapsed / TRANS_DURATION));
        const smoothAlpha = alpha * alpha * (3 - 2 * alpha);
        ctx.drawImage(prevPoseCanvasRef.current, 0, 0, 1024, 1024);
        ctx.globalAlpha = smoothAlpha;
        ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
      }

      const mouthW = cfg.x2 - cfg.x1;
      const halfW = mouthW * 0.5;
      const chinY = cfg.chinY ?? cfg.cy + Math.max(48, mouthW * 0.85);
      const headShiftX = 0;
      const headShiftY = 0;

      // Compute active 3D-tracked facial landmarks (strictly applied when rendering 3D Pose Rig;
      // live 3D video already contains native 3D lip motion and symmetrical 3D blinks!)
      if (!hasLiveVideoFrame) {
        const poseOffsets = poseEyeOffsetRef.current.get(activeFrameCanvas) || {
          dxL: 0,
          dyL: 0,
          dxR: 0,
          dyR: 0,
        };
        const avgPoseDx = (poseOffsets.dxL + poseOffsets.dxR) * 0.5;
        const avgPoseDy = (poseOffsets.dyL + poseOffsets.dyR) * 0.5;

        const activeHeadOffsetX = headShiftX * 0.72 + avgPoseDx;
        const activeHeadOffsetY = headShiftY * 0.72 + avgPoseDy;
        const activeMouthCx = cfg.cx + activeHeadOffsetX;
        const activeMouthCy = cfg.cy + activeHeadOffsetY;
        const activeChinY = chinY + activeHeadOffsetY;

        // 8. Surgical 60 FPS Strip-Mesh Lip & Mandible Warping
        const jawHeight = Math.max(36, activeChinY - activeMouthCy);
        const maxJawDrop = Math.min(40, Math.max(cfg.maxOpening * 2.25, jawHeight * 0.46));

        const deltaOpen = speaking ? spring.open - effectiveBaseOpen : 0;
        const isClosedBase = effectiveBaseOpen < 0.12;

        if (speaking && (Math.abs(deltaOpen) > 0.01 || Math.abs(spring.spread) > 0.01)) {
          const warpWidth = halfW * 2.55;
          const warpLeft = activeMouthCx - warpWidth * 0.5;
          const horizScale = 1 + spring.spread * 0.26;

          if (!cfg.mustacheCover && Math.abs(deltaOpen) > 0.01) {
            const upStrips = 8;
            const upSpanY = Math.max(14, jawHeight * 0.28);
            const upStripH = upSpanY / upStrips;
            const upperLiftPx = (isClosedBase ? spring.open : deltaOpen) * maxJawDrop * 0.24;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(activeMouthCx, activeMouthCy - upSpanY * 0.45, halfW * 1.15, upSpanY * 0.65, 0, 0, Math.PI * 2);
            ctx.clip();
            for (let i = 0; i < upStrips; i++) {
              const normY = i / upStrips;
              const falloff = Math.pow(Math.sin(normY * Math.PI * 0.5), 1.5);
              const dy = -upperLiftPx * falloff;
              const srcY = activeMouthCy - upSpanY + i * upStripH;
              const dstY = srcY + dy;
              const dstW = warpWidth * (1 + (horizScale - 1) * falloff);
              const dstX = activeMouthCx - dstW * 0.5;
              ctx.drawImage(activeFrameCanvas, warpLeft, srcY, warpWidth, upStripH + 1.2, dstX, dstY, dstW, upStripH + 1.4);
            }
            ctx.restore();
          }

          const numStrips = 28;
          const warpTop = activeMouthCy - (deltaOpen < 0 ? 6 : 0);
          const warpSpanY = jawHeight * 1.26;
          const stripH = warpSpanY / numStrips;

          const lowerDropPx = isClosedBase
            ? spring.open * maxJawDrop * 0.82
            : deltaOpen * maxJawDrop * 0.88;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            activeMouthCx,
            activeMouthCy + jawHeight * 0.52,
            halfW * 1.28,
            jawHeight * 0.78,
            0,
            0,
            Math.PI * 2
          );
          ctx.clip();

          for (let i = 0; i < numStrips; i++) {
            const normY = i / numStrips;
            const falloff = Math.pow(Math.cos(normY * Math.PI * 0.5), 1.6);
            const dy = lowerDropPx * falloff;
            const sScaleX = 1 + (horizScale - 1) * Math.sin(normY * Math.PI);

            const srcY = warpTop + i * stripH;
            const dstY = srcY + dy;
            const dstW = warpWidth * sScaleX;
            const dstX = activeMouthCx - dstW * 0.5;

            ctx.drawImage(
              activeFrameCanvas,
              warpLeft,
              srcY,
              warpWidth,
              stripH + 1.3,
              dstX,
              dstY,
              dstW,
              stripH + 1.5
            );
          }
          ctx.restore();
        }

        // 9. Feathered Anatomical Oral Cavity, Upper Teeth & Tongue Dorsum
        const effectiveOpen = !speaking
          ? 0
          : isClosedBase
            ? spring.open
            : Math.max(0, spring.open - effectiveBaseOpen * 0.38);

        if (speaking && effectiveOpen > 0.04) {
          const activeHalfW = halfW * (0.92 + spring.spread * 0.20);
          const upperLiftPx = effectiveOpen * maxJawDrop * (cfg.mustacheCover ? 0.06 : 0.24);
          const lowerDropPx = effectiveOpen * maxJawDrop * 0.78;
          const cornerY = (cfg.y1 + cfg.y2) * 0.5 + activeHeadOffsetY + lowerDropPx * 0.12;
          const stomionCenterY = activeMouthCy;

          const leftX = activeMouthCx - activeHalfW;
          const rightX = activeMouthCx + activeHalfW;
          const topCtrlY = stomionCenterY - upperLiftPx * 1.38;
          const botCtrlY = stomionCenterY + lowerDropPx * 1.48;

          ctx.save();

          const buildStomionPath = () => {
            ctx.beginPath();
            ctx.moveTo(leftX, cornerY);
            ctx.quadraticCurveTo(activeMouthCx, topCtrlY, rightX, cornerY);
            ctx.quadraticCurveTo(activeMouthCx, botCtrlY, leftX, cornerY);
            ctx.closePath();
          };

          buildStomionPath();
          ctx.clip();

          const cavGrad = ctx.createRadialGradient(
            activeMouthCx,
            stomionCenterY + lowerDropPx * 0.28,
            1,
            activeMouthCx,
            stomionCenterY + lowerDropPx * 0.28,
            Math.max(activeHalfW, lowerDropPx + upperLiftPx)
          );
          cavGrad.addColorStop(0, cfg.cavityDarkColor);
          cavGrad.addColorStop(0.68, cfg.cavityMidColor);
          cavGrad.addColorStop(1, cfg.cavityRimColor);

          ctx.globalAlpha = effectiveBaseOpen > 0.15 ? 0.82 : 0.95;
          ctx.fillStyle = cavGrad;
          ctx.fillRect(leftX - 4, topCtrlY - 4, activeHalfW * 2 + 8, botCtrlY - topCtrlY + 12);

          const apertureH = lowerDropPx + upperLiftPx;
          if (apertureH > 3.0) {
            const tongueW = activeHalfW * 0.64;
            const tongueH = apertureH * (0.42 + spring.tongue * 0.24);
            const tongueCenterY = stomionCenterY + lowerDropPx * (0.72 - spring.tongue * 0.24);

            const tGrad = ctx.createRadialGradient(
              activeMouthCx,
              tongueCenterY - tongueH * 0.2,
              1,
              activeMouthCx,
              tongueCenterY,
              tongueW
            );
            tGrad.addColorStop(0, '#c85a64');
            tGrad.addColorStop(0.65, '#943540');
            tGrad.addColorStop(1, cfg.cavityMidColor);

            ctx.beginPath();
            ctx.ellipse(activeMouthCx, tongueCenterY, tongueW, tongueH, 0, 0, Math.PI * 2);
            ctx.fillStyle = tGrad;
            ctx.fill();
          }

          if (!cfg.mustacheCover && apertureH > 3.8 && effectiveBaseOpen < 0.25) {
            const teethW = activeHalfW * 0.72;
            const teethH = Math.min(apertureH * 0.28, 5.8);
            const teethTopY = stomionCenterY - upperLiftPx * 0.65;

            const teethGrad = ctx.createLinearGradient(activeMouthCx - teethW, teethTopY, activeMouthCx + teethW, teethTopY);
            teethGrad.addColorStop(0, 'rgba(180, 168, 155, 0.35)');
            teethGrad.addColorStop(0.2, cfg.teethColor);
            teethGrad.addColorStop(0.5, '#ffffff');
            teethGrad.addColorStop(0.8, cfg.teethColor);
            teethGrad.addColorStop(1, 'rgba(180, 168, 155, 0.35)');

            ctx.globalAlpha = Math.min(0.72, (apertureH - 3.2) / 7.5);
            ctx.beginPath();
            ctx.roundRect(activeMouthCx - teethW, teethTopY - 1, teethW * 2, teethH, [0, 0, 3, 3]);
            ctx.fillStyle = teethGrad;
            ctx.fill();
          }

          buildStomionPath();
          ctx.globalAlpha = 0.85;
          ctx.lineWidth = cfg.mustacheCover ? 3.2 : 2.4;
          ctx.strokeStyle = cfg.cavityRimColor;
          ctx.stroke();

          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(leftX + activeHalfW * 0.12, cornerY + 0.5);
          ctx.quadraticCurveTo(activeMouthCx, botCtrlY + 1.2, rightX - activeHalfW * 0.12, cornerY + 0.5);
          ctx.strokeStyle = cfg.lowerLipRimColor;
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.globalAlpha = 0.74 * Math.min(1, effectiveOpen * 2.5);
          ctx.stroke();
          ctx.restore();

          if (cfg.mustacheCover) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(
              activeMouthCx,
              stomionCenterY - upperLiftPx * 0.55,
              activeHalfW * 0.96,
              Math.max(3, upperLiftPx * 1.15),
              0,
              0,
              Math.PI * 2
            );
            ctx.clip();
            ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
            ctx.restore();
          }
        }

        // 10. Supraorbital Eyebrow Articulation, Micro-Saccades & Periorbital Eyelid Curtain Blinking
        if (cfg.leftEyeX && cfg.rightEyeX && (cfg.leftEyeY || cfg.eyeY)) {
          const eRx = cfg.eyeRx ?? cfg.eyeRadius ?? 24;
          const eRy = cfg.eyeRy ?? cfg.eyeRadius ?? 22;
          const srcLeftY = cfg.leftEyeY ?? cfg.eyeY ?? 260;
          const srcRightY = cfg.rightEyeY ?? cfg.eyeY ?? 260;

          const eyeSockets = [
            {
              srcEx: cfg.leftEyeX,
              srcEy: srcLeftY,
              poseEx: cfg.leftEyeX + poseOffsets.dxL,
              poseEy: srcLeftY + poseOffsets.dyL,
              dstEx: cfg.leftEyeX + poseOffsets.dxL + headShiftX * 0.72,
              dstEy: srcLeftY + poseOffsets.dyL + headShiftY * 0.72,
              liftMult: 1 - spring.browAsym * 0.35,
            },
            {
              srcEx: cfg.rightEyeX,
              srcEy: srcRightY,
              poseEx: cfg.rightEyeX + poseOffsets.dxR,
              poseEy: srcRightY + poseOffsets.dyR,
              dstEx: cfg.rightEyeX + poseOffsets.dxR + headShiftX * 0.72,
              dstEy: srcRightY + poseOffsets.dyR + headShiftY * 0.72,
              liftMult: 1 + spring.browAsym * 0.45,
            },
          ];

          // 10A. Supraorbital Eyebrow Gesticulation (source-aligned to poseEx/poseEy so zero forehead seam ever appears)
          if (Math.abs(spring.browLift) > 0.04) {
            for (const { poseEx, poseEy, dstEx, dstEy, liftMult } of eyeSockets) {
              const browW = eRx * 1.58;
              const browH = eRy * 0.88;
              const srcBrowTopY = poseEy - eRy * 1.68;
              const dstBrowTopY = dstEy - eRy * 1.68;
              const browShiftPx = -spring.browLift * liftMult * Math.max(3.2, eRy * 0.15);

              ctx.save();
              ctx.beginPath();
              ctx.ellipse(dstEx, dstBrowTopY + browH * 0.5, browW * 0.48, browH * 0.46, 0, 0, Math.PI * 2);
              ctx.clip();

              const bStrips = 7;
              const bStripH = browH / bStrips;
              for (let i = 0; i < bStrips; i++) {
                const normY = (i + 0.5) / bStrips;
                const bell = Math.pow(Math.sin(normY * Math.PI), 1.8);
                const srcY = srcBrowTopY + i * bStripH;
                const dstY = dstBrowTopY + i * bStripH + browShiftPx * bell;
                ctx.drawImage(
                  activeFrameCanvas,
                  poseEx - browW * 0.5,
                  srcY,
                  browW,
                  bStripH + 1.2,
                  dstEx - browW * 0.5,
                  dstY,
                  browW,
                  bStripH + 1.4
                );
              }
              ctx.restore();
            }
          }

          // 10B. Subtle 60 FPS Iris/Pupil Gaze Micro-Saccades (only when eyes are wide open)
          if (spring.blink < 0.08 && (Math.abs(spring.saccadeX) > 0.25 || Math.abs(spring.saccadeY) > 0.2)) {
            for (const { poseEx, poseEy, dstEx, dstEy } of eyeSockets) {
              ctx.save();
              ctx.beginPath();
              ctx.ellipse(dstEx, dstEy, eRx * 0.54, eRy * 0.48, 0, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(
                activeFrameCanvas,
                poseEx - eRx * 0.60,
                poseEy - eRy * 0.54,
                eRx * 1.20,
                eRy * 1.08,
                dstEx - eRx * 0.60 + spring.saccadeX,
                dstEy - eRy * 0.54 + spring.saccadeY,
                eRx * 1.20,
                eRy * 1.08
              );
              ctx.restore();
            }
          }

          // 10C. Anatomical 60 FPS Periorbital Eyelid Curtain Blinking (Zero Pupil Smearing / Zero Body Teleport!)
          const b = spring.blink;
          if (b > 0.04) {
            const blinkUrl = poseCompendiumRef.current?.blink;
            const blinkCanvas = blinkUrl ? poseCacheRef.current.get(blinkUrl) : null;
            const skin = eyelidSkinRef.current;

            for (const { srcEx, srcEy, dstEx, dstEy } of eyeSockets) {
              const creaseRelY = -eRy * 0.80;
              const openMarginRelY = -eRy * 0.54;
              const closedMarginRelY = eRy * 0.52;
              const lowerSocketRelY = eRy * 0.86;
              const currMarginRelY = openMarginRelY + b * (closedMarginRelY - openMarginRelY);
              const cornerRelY = openMarginRelY * 0.35 + b * (closedMarginRelY * 0.55);

              if (blinkCanvas) {
                // Mode A: High-Precision Periorbital 3D Closed-Eyelid Sprite Curtain
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dstEx - eRx * 0.98, dstEy + cornerRelY);
                ctx.quadraticCurveTo(dstEx, dstEy + creaseRelY * 1.22, dstEx + eRx * 0.98, dstEy + cornerRelY);
                ctx.quadraticCurveTo(dstEx, dstEy + currMarginRelY * 1.24, dstEx - eRx * 0.98, dstEy + cornerRelY);
                ctx.closePath();
                ctx.clip();

                const lidStrips = 14;
                const srcSpan = closedMarginRelY - creaseRelY;
                const dstSpan = Math.max(2, currMarginRelY - creaseRelY);
                const srcStep = srcSpan / lidStrips;
                const dstStep = dstSpan / lidStrips;
                const patchW = eRx * 2.04;

                for (let s = 0; s < lidStrips; s++) {
                  ctx.drawImage(
                    blinkCanvas,
                    srcEx - patchW * 0.5,
                    srcEy + creaseRelY + s * srcStep,
                    patchW,
                    srcStep + 1.4,
                    dstEx - patchW * 0.5,
                    dstEy + creaseRelY + s * dstStep,
                    patchW,
                    dstStep + 1.5
                  );
                }
                ctx.restore();

                // Seal lower lash shadow smoothly as eyelid reaches complete tarsal closure
                if (b > 0.65) {
                  const sealAlpha = Math.min(1, (b - 0.65) / 0.30);
                  ctx.save();
                  ctx.globalAlpha = sealAlpha;
                  ctx.beginPath();
                  ctx.ellipse(dstEx, dstEy + eRy * 0.04, eRx * 0.96, lowerSocketRelY * 0.96, 0, 0, Math.PI * 2);
                  ctx.clip();
                  ctx.drawImage(
                    blinkCanvas,
                    srcEx - eRx,
                    srcEy - eRy * 0.92,
                    eRx * 2,
                    eRy * 1.84,
                    dstEx - eRx,
                    dstEy - eRy * 0.92,
                    eRx * 2,
                    eRy * 1.84
                  );
                  ctx.restore();
                }

                // Crisp anti-aliased curved upper eyelash margin during mid-descent / mid-opening
                if (b < 0.88) {
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(dstEx - eRx * 0.84, dstEy + cornerRelY + 1.5);
                  ctx.quadraticCurveTo(
                    dstEx,
                    dstEy + currMarginRelY * 1.14,
                    dstEx + eRx * 0.84,
                    dstEy + cornerRelY + 1.5
                  );
                  ctx.strokeStyle = 'rgba(24, 14, 12, 0.72)';
                  ctx.lineWidth = Math.max(1.8, eRy * 0.075);
                  ctx.lineCap = 'round';
                  ctx.stroke();
                  ctx.restore();
                }
              } else {
                // Mode B: Sampled Anatomical 3D Eyelid Dome + Curved Lash Line (for Portraits without Blink Sprite)
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dstEx - eRx * 0.94, dstEy + cornerRelY);
                ctx.quadraticCurveTo(dstEx, dstEy + creaseRelY * 1.15, dstEx + eRx * 0.94, dstEy + cornerRelY);
                ctx.quadraticCurveTo(dstEx, dstEy + currMarginRelY * 1.22, dstEx - eRx * 0.94, dstEy + cornerRelY);
                ctx.closePath();
                ctx.clip();

                const lidGrad = ctx.createLinearGradient(
                  dstEx,
                  dstEy + creaseRelY,
                  dstEx,
                  dstEy + currMarginRelY + 2
                );
                lidGrad.addColorStop(0, skin.crease);
                lidGrad.addColorStop(0.35, skin.highlight);
                lidGrad.addColorStop(0.88, skin.base);
                lidGrad.addColorStop(1, skin.crease);

                ctx.fillStyle = lidGrad;
                ctx.fillRect(
                  dstEx - eRx,
                  dstEy + creaseRelY - 2,
                  eRx * 2,
                  currMarginRelY - creaseRelY + 8
                );
                ctx.restore();

                // Curved upper eyelash margin
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dstEx - eRx * 0.86, dstEy + cornerRelY + 1);
                ctx.quadraticCurveTo(
                  dstEx,
                  dstEy + currMarginRelY * 1.16,
                  dstEx + eRx * 0.86,
                  dstEy + cornerRelY + 1
                );
                ctx.strokeStyle = 'rgba(22, 13, 12, 0.84)';
                ctx.lineWidth = Math.max(1.8, eRy * 0.085);
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [resolvedConfig, enableSmartBustCrop, loadedSrc]);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={1024}
      className={`w-full h-full object-contain select-none pointer-events-none ${className}`}
      data-character-id={characterId}
      data-speaking={isSpeaking ? 'true' : 'false'}
      data-gesture={resolvedGestureRef.current}
      data-video-active={videoReadyRef.current ? 'true' : 'false'}
      data-engine="institutional-neural-3d-60fps"
    />
  );
};

export default NanoBananaLipSyncCanvas;
