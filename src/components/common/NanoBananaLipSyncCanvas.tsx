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
  | 'listen';

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
  gestureVideoMap?: Partial<Record<Exclude<AvatarGestureMode, 'auto'>, string>>;
  /** Optional explicit mouth config override */
  mouthConfig?: CharacterAnatomicalMouth;
  /** Optional external real-time mouth open ratio (0..1) from parent analyser */
  externalMouthOpen?: number;
  /** Optional external real-time mouth width/spread ratio (-0.5..0.5) from parent analyser */
  externalMouthSpread?: number;
  /** Optional text currently being spoken (used to drive phoneme-aware syllable envelopes) */
  spokenText?: string;
  /** Optional compendium of multi-gesture pose URLs keyed by gesture type */
  poseCompendium?: Partial<Record<Exclude<AvatarGestureMode, 'auto'> | 'blink' | 'turn', string>>;
  /** Active gesture mode ('auto' cycles contextually & randomly; or explicit gesture key) */
  activeGesture?: AvatarGestureMode;
  /** Optional callback notified whenever the resolved gesture changes */
  onResolvedGestureChange?: (gesture: Exclude<AvatarGestureMode, 'auto'>) => void;
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
    // Bilabial closure: m, b, p
    if (ch === 'm' || ch === 'b' || ch === 'p') {
      tokens.push({ open: 0.0, spread: -0.08, tongue: 0.2, bilabial: true, durationWeight: 0.58 });
      i++;
      continue;
    }
    // Labiodental: f, v
    if (ch === 'f' || ch === 'v') {
      tokens.push({ open: 0.14, spread: 0.12, tongue: 0.25, bilabial: false, durationWeight: 0.52 });
      i++;
      continue;
    }
    // Rounded digraphs: 'ou', 'oo', 'au', 'eau'
    if ((ch === 'o' && next === 'u') || (ch === 'o' && next === 'o')) {
      tokens.push({ open: 0.46, spread: -0.36, tongue: 0.3, bilabial: false, durationWeight: 1.05 });
      i += 2;
      continue;
    }
    // Wide open vowels: a, á, à, â, o, ó, ô
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
    // Spread front vowels: e, é, è, ê, i, í, î, y
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
    // Rounded vowels / glides: u, ú, ù, û, w
    if ('uúùûüw'.includes(ch)) {
      tokens.push({ open: 0.38, spread: -0.36, tongue: 0.35, bilabial: false, durationWeight: 0.92 });
      i++;
      continue;
    }
    // Alveolar / dental consonants: l, n, t, d, r, s, z
    if ('lntdrszc'.includes(ch)) {
      tokens.push({ open: 0.30, spread: 0.10, tongue: 0.88, bilabial: false, durationWeight: 0.55 });
      i++;
      continue;
    }

    // Other consonants (k, g, j, h, q, x)
    tokens.push({ open: 0.34, spread: 0.04, tongue: 0.48, bilabial: false, durationWeight: 0.55 });
    i++;
  }

  return tokens.length > 0
    ? tokens
    : [{ open: 0.6, spread: 0.1, tongue: 0.4, bilabial: false, durationWeight: 1 }];
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
  headYaw: number;
  headPitch: number;
  headRoll: number;
  chestBreath: number;
  handWaveL: number;
  handWaveR: number;
  saccadeX: number;
  saccadeY: number;
  gestureImpulse: number;
}

/**
 * Motor Neuronal 3D LHM-Grade a 60 FPS:
 * Combina Streams de Video Neuronal 3D (.mp4) + Malla Esquelética 3D con Perspectiva (Yaw/Pitch/Roll)
 * Desacoplada del Fondo (Fondo 100% Fijo) + Parpadeo Involuntario y Lip-Sync Fonético/Formántico en Tiempo Real.
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
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoReadyRef = useRef<boolean>(false);
  const activeVideoUrlRef = useRef<string>('');

  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const externalOpenRef = useRef<number>(externalMouthOpen);
  const externalSpreadRef = useRef<number>(externalMouthSpread);
  const spokenTextRef = useRef<string>(spokenText);
  const visemeTokensRef = useRef<VisemeToken[]>(buildPhonemeVisemeSequence(spokenText));
  const activeGestureRef = useRef<AvatarGestureMode>(activeGesture);
  const resolvedGestureRef = useRef<Exclude<AvatarGestureMode, 'auto'>>('welcome');
  const poseCompendiumRef = useRef(poseCompendium);
  const gestureVideoMapRef = useRef(gestureVideoMap);
  const videoSrcRef = useRef(videoSrc);
  const onResolvedGestureChangeRef = useRef(onResolvedGestureChange);

  // Smooth transition state between poses/streams
  const prevPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionStartRef = useRef<number>(0);
  const forceBlinkRef = useRef<boolean>(false);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = isSpeaking ? 1.15 : 0.88;
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

  // Helper to load an image URL into a 1024x1024 offscreen canvas and cache it
  const loadPoseToCanvas = React.useCallback((src: string, onDone?: (canvas: HTMLCanvasElement) => void) => {
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
      onDone?.(off);
    };
    img.src = src;
  }, []);

  // Initialize and manage the 3D Neural Motion <video> stream
  const loadActiveVideoStream = React.useCallback((targetVideoUrl?: string) => {
    if (typeof window === 'undefined') return;
    if (!targetVideoUrl) {
      videoReadyRef.current = false;
      activeVideoUrlRef.current = '';
      return;
    }
    if (activeVideoUrlRef.current === targetVideoUrl && videoElementRef.current) {
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

    let vid = videoElementRef.current;
    if (!vid) {
      vid = document.createElement('video');
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.crossOrigin = 'anonymous';
      vid.preload = 'auto';
      videoElementRef.current = vid;
    }

    videoReadyRef.current = false;
    activeVideoUrlRef.current = targetVideoUrl;
    vid.src = targetVideoUrl;
    vid.playbackRate = isSpeakingRef.current ? 1.15 : 0.88;

    vid.onloadeddata = () => {
      videoReadyRef.current = true;
      vid?.play().catch(() => {});
    };
    vid.oncanplay = () => {
      videoReadyRef.current = true;
      vid?.play().catch(() => {});
    };
    vid.onerror = () => {
      videoReadyRef.current = false;
    };
    vid.load();
  }, []);

  // Preload canonical image + entire poseCompendium + initial 3D video stream
  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;

    loadPoseToCanvas(imageSrc, (off) => {
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
    });

    if (poseCompendium) {
      Object.values(poseCompendium).forEach((url) => {
        if (url) loadPoseToCanvas(url);
      });
    }

    const desiredVideo =
      activeGesture !== 'auto' && gestureVideoMap?.[activeGesture]
        ? gestureVideoMap[activeGesture]
        : videoSrc;
    loadActiveVideoStream(desiredVideo);

    return () => {
      cancelled = true;
    };
  }, [imageSrc, poseCompendium, videoSrc, gestureVideoMap, activeGesture, loadPoseToCanvas, loadActiveVideoStream, onLoad]);

  // Cleanup video element on unmount
  useEffect(() => {
    return () => {
      if (videoElementRef.current) {
        videoElementRef.current.pause();
        videoElementRef.current.src = '';
        videoElementRef.current = null;
      }
    };
  }, []);

  // Switch active pose canvas and/or gesture video stream smoothly when gesture changes
  const switchToGesturePose = React.useCallback(
    (gesture: Exclude<AvatarGestureMode, 'auto'>, now: number) => {
      const compendium = poseCompendiumRef.current;
      const targetUrl = (compendium && compendium[gesture]) || imageSrc;
      const targetCanvas = poseCacheRef.current.get(targetUrl) || offscreenRef.current;

      if (resolvedGestureRef.current !== gesture) {
        resolvedGestureRef.current = gesture;
        onResolvedGestureChangeRef.current?.(gesture);
      }

      // Snapshot current visible state for smooth 280ms foreground cross-morph
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
        forceBlinkRef.current = true;
      }

      // If explicit gesture mode is selected and has a dedicated 3D motion clip, load it;
      // if in 'auto' mode, keep playing the full master 3D motion movie!
      const gMap = gestureVideoMapRef.current;
      const masterVid = videoSrcRef.current;
      if (activeGestureRef.current === 'auto') {
        if (masterVid) loadActiveVideoStream(masterVid);
      } else if (gMap && gMap[gesture]) {
        loadActiveVideoStream(gMap[gesture]);
      } else if (masterVid && (gesture === 'welcome' || gesture === 'explain' || gesture === 'exclaim')) {
        loadActiveVideoStream(masterVid);
      } else {
        loadActiveVideoStream(undefined);
      }
    },
    [imageSrc, loadActiveVideoStream]
  );

  // Automatic & Contextual 3D Gesture Director:
  // Syncs resolved gesture indicator with the continuous 3D motion cycle
  useEffect(() => {
    const now = performance.now();

    if (activeGesture !== 'auto') {
      switchToGesturePose(activeGesture, now);
      return;
    }

    const text = spokenText || '';
    const hasExclaim = text.includes('!') || text.includes('¡') || /bravo|excellent|wonderful|magnifique|bienvenue|welcome/i.test(text);
    const hasQuestion = text.includes('?') || text.includes('¿') || /^(comment|pourquoi|where|how|what|why|quel)/i.test(text.trim());

    const cycleSequence: Array<Exclude<AvatarGestureMode, 'auto'>> = hasExclaim
      ? ['exclaim', 'welcome', 'explain', 'encourage', 'inquire']
      : hasQuestion
        ? ['inquire', 'explain', 'welcome', 'encourage']
        : ['welcome', 'explain', 'exclaim', 'inquire', 'encourage'];

    let step = 0;
    switchToGesturePose(cycleSequence[0], now);

    const timer = setInterval(() => {
      if (activeGestureRef.current !== 'auto') return;
      step = (step + 1) % cycleSequence.length;
      const nextG = cycleSequence[step];
      if (resolvedGestureRef.current !== nextG) {
        resolvedGestureRef.current = nextG;
        onResolvedGestureChangeRef.current?.(nextG);
      }
      const compendium = poseCompendiumRef.current;
      const targetUrl = (compendium && compendium[nextG]) || imageSrc;
      const targetCanvas = poseCacheRef.current.get(targetUrl) || offscreenRef.current;
      if (targetCanvas && currPoseCanvasRef.current !== targetCanvas) {
        prevPoseCanvasRef.current = currPoseCanvasRef.current;
        currPoseCanvasRef.current = targetCanvas;
        transitionStartRef.current = performance.now();
      }
    }, 2600);

    return () => clearInterval(timer);
  }, [activeGesture, isSpeaking, spokenText, imageSrc, switchToGesturePose]);

  // 60 FPS RequestAnimationFrame LHM-Grade 3D Neural Video + Perspective Mesh & Lip-Sync Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = performance.now();
    let nextBlinkAt = lastTime + 900 + Math.random() * 1300;
    let blinkStartAt = -1;
    let pendingDoubleBlink = false;
    const BLINK_DURATION_MS = 165;

    let nextSaccadeAt = lastTime + 1100;
    let targetSaccadeX = 0;
    let targetSaccadeY = 0;

    // Reusable head offscreen buffer for 3D Perspective Yaw/Pitch/Roll warping without background distortion
    const headBuffer = document.createElement('canvas');
    headBuffer.width = 1024;
    headBuffer.height = 1024;
    const headCtx = headBuffer.getContext('2d');

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
      headYaw: 0,
      headPitch: 0,
      headRoll: 0,
      chestBreath: 0,
      handWaveL: 0,
      handWaveR: 0,
      saccadeX: 0,
      saccadeY: 0,
      gestureImpulse: 0,
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      // 0. Sample active 3D neural <video> frame if ready and playing
      const vid = videoElementRef.current;
      const vOff = videoFrameCanvasRef.current;
      const isExplicitBlinkHold = activeGestureRef.current === 'listen';
      let hasLiveVideoFrame = false;

      if (
        vid &&
        vOff &&
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

        if (currentGesture === 'exclaim') {
          targetOpen = Math.min(1.0, targetOpen * 1.15);
          targetSpread = Math.max(targetSpread, 0.16);
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

      // 3. Eyebrow Expression Physics
      let targetBrowLift = speaking ? Math.sin(tSec * 2.4) * 0.18 + spring.open * 0.35 : Math.sin(tSec * 1.5) * 0.08;
      let targetBrowAsym = 0;
      if (currentGesture === 'exclaim') {
        targetBrowLift = 0.52 + Math.sin(tSec * 5.2) * 0.12;
      } else if (currentGesture === 'inquire') {
        targetBrowLift = 0.38;
        targetBrowAsym = 0.45;
      }
      targetBrowLift -= spring.blink * 0.18;

      const browForce = (targetBrowLift - spring.browLift) * 240 - spring.browLiftVel * 20;
      spring.browLiftVel += browForce * dt;
      spring.browLift = Math.max(-0.25, Math.min(0.85, spring.browLift + spring.browLiftVel * dt));
      spring.browAsym += (targetBrowAsym - spring.browAsym) * Math.min(1, dt * 8);

      // 4. Natural Involuntary Eyelid Blinking (Single + Double Blinks) & Gaze Saccades at 60 FPS
      const isExplicitBlinkDemo = activeGestureRef.current === 'listen';
      const activeBlinkDuration = isExplicitBlinkDemo ? 420 : BLINK_DURATION_MS;

      if (forceBlinkRef.current) {
        forceBlinkRef.current = false;
        spring.gestureImpulse = 1.0;
        if (isExplicitBlinkDemo) {
          blinkStartAt = now;
          pendingDoubleBlink = true;
          nextBlinkAt = now + activeBlinkDuration + 220;
        } else {
          blinkStartAt = -1;
          spring.blink = 0;
          nextBlinkAt = now + 1300 + Math.random() * 1000;
        }
      } else if (now >= nextBlinkAt && blinkStartAt < 0) {
        blinkStartAt = now;
        if (!pendingDoubleBlink && Math.random() < (isExplicitBlinkDemo ? 0.65 : 0.38)) {
          pendingDoubleBlink = true;
          nextBlinkAt = now + activeBlinkDuration + 180;
        } else {
          pendingDoubleBlink = false;
          nextBlinkAt =
            now +
            (isExplicitBlinkDemo
              ? 820 + Math.random() * 420
              : speaking
                ? 1800 + Math.random() * 1400
                : 2100 + Math.random() * 1500);
        }
      }

      if (blinkStartAt >= 0) {
        const elapsed = now - blinkStartAt;
        if (elapsed >= activeBlinkDuration) {
          spring.blink = 0;
          blinkStartAt = -1;
        } else {
          const normB = elapsed / activeBlinkDuration;
          spring.blink = Math.pow(Math.sin(normB * Math.PI), 0.72);
        }
      } else {
        spring.blink = 0;
      }

      spring.gestureImpulse *= Math.max(0, 1 - dt * 5.2);

      // Eye gaze micro-saccades
      if (now >= nextSaccadeAt) {
        nextSaccadeAt = now + 1000 + Math.random() * 1500;
        targetSaccadeX = (Math.random() - 0.5) * 4.8;
        targetSaccadeY = (Math.random() - 0.5) * 2.5;
      }
      spring.saccadeX += (targetSaccadeX - spring.saccadeX) * Math.min(1, dt * 12);
      spring.saccadeY += (targetSaccadeY - spring.saccadeY) * Math.min(1, dt * 12);

      // 5. Continuous LHM-Grade 3D Head Yaw, Pitch, Roll & Articulated Hand Kinematics
      // Even when the neural <video> is playing, we layer subtle 3D perspective micro-kinematics;
      // when static keyframes are active, we drive full 3D perspective turnaround & arm motion!
      const videoScale = hasLiveVideoFrame ? 0.38 : 1.0;
      const energyMult = speaking ? 1.45 : 1.05;

      const targetYaw =
        (Math.sin(tSec * 1.35) * 0.14 + Math.cos(tSec * 0.78) * 0.08) *
        energyMult *
        videoScale;
      const targetPitch =
        (Math.sin(tSec * 2.1) * 5.5 + (speaking ? Math.sin(tSec * 5.8) * 4.8 * spring.open : 0)) *
        videoScale -
        spring.gestureImpulse * 5.0;
      let targetRoll = Math.sin(tSec * 1.15) * 0.022 * energyMult * videoScale;
      if (currentGesture === 'inquire') {
        targetRoll += 0.025 * videoScale;
      }

      spring.headYaw += (targetYaw - spring.headYaw) * Math.min(1, dt * 9);
      spring.headPitch += (targetPitch - spring.headPitch) * Math.min(1, dt * 10);
      spring.headRoll += (targetRoll - spring.headRoll) * Math.min(1, dt * 8);
      spring.chestBreath = Math.sin(tSec * 2.05) * 0.008 * energyMult;

      const handAmp = (speaking ? 15.0 + spring.open * 8.0 : 9.5) * (hasLiveVideoFrame ? 0.25 : 1.0);
      const targetHandL = Math.sin(tSec * (speaking ? 4.2 : 2.4)) * handAmp - spring.gestureImpulse * 9;
      const targetHandR = Math.cos(tSec * (speaking ? 4.5 : 2.55) + 0.9) * handAmp - spring.gestureImpulse * 9;

      spring.handWaveL += (targetHandL - spring.handWaveL) * Math.min(1, dt * 11);
      spring.handWaveR += (targetHandR - spring.handWaveR) * Math.min(1, dt * 11);

      // =======================================================================
      // 6. FOREGROUND-DECOUPLED 3D COMPOSITOR (BACKGROUND 100% ROCK-STEADY)
      // =======================================================================
      ctx.save();
      ctx.clearRect(0, 0, 1024, 1024);

      if (enableSmartBustCrop && cfg.bustCrop) {
        const { focusX, focusY, zoom } = cfg.bustCrop;
        ctx.translate(512, 512);
        ctx.scale(zoom, zoom);
        ctx.translate(-focusX, -focusY);
      }

      const compendium = poseCompendiumRef.current;
      const blinkPoseUrl = compendium?.blink;
      const blinkPoseCanvas = blinkPoseUrl ? poseCacheRef.current.get(blinkPoseUrl) : null;
      const useDedicatedBlinkFrame =
        Boolean(blinkPoseCanvas) &&
        !hasLiveVideoFrame &&
        (currentGesture === 'listen' || currentGesture === 'welcome') &&
        spring.blink > 0.38;

      const activeFrameCanvas = useDedicatedBlinkFrame && blinkPoseCanvas ? blinkPoseCanvas : baseOff;

      // LAYER 0: Draw 100% Locked Static Background (Bookshelf, Globe, WELCOME! Sign NEVER Wobble)
      const staticBgRef = offscreenRef.current || activeFrameCanvas;
      ctx.globalAlpha = 1;
      ctx.drawImage(staticBgRef, 0, 0, 1024, 1024);

      // LAYER 1: Draw Active 3D Neural Video / Pose Silhouette over Locked Background
      // Smooth 260ms cross-fade when switching between explicit gesture clips
      const transElapsed = now - transitionStartRef.current;
      const TRANS_DURATION = 260;
      if (
        !hasLiveVideoFrame &&
        prevPoseCanvasRef.current &&
        prevPoseCanvasRef.current !== activeFrameCanvas &&
        transElapsed < TRANS_DURATION
      ) {
        const alpha = Math.min(1, Math.max(0, transElapsed / TRANS_DURATION));
        const smoothAlpha = alpha * alpha * (3 - 2 * alpha);
        ctx.drawImage(prevPoseCanvasRef.current, 0, 0, 1024, 1024);
        ctx.globalAlpha = smoothAlpha;
        ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
      }

      // LAYER 2: Localized 3D Torso Breathing & Articulated Forearm/Hand Kinematics
      // Strictly clipped to lower foreground body region so the background wall/shelf above y=560 is untouched
      if (!hasLiveVideoFrame) {
        const handZones = [
          { cx: 215, cy: 720, rx: 175, ry: 210, dy: spring.handWaveL, dx: spring.handWaveL * 0.34 },
          { cx: 809, cy: 720, rx: 175, ry: 210, dy: spring.handWaveR, dx: -spring.handWaveR * 0.34 },
        ];

        for (const hz of handZones) {
          if (Math.abs(hz.dy) < 0.4) continue;
          const hStrips = 14;
          const topY = hz.cy - hz.ry;
          const spanY = hz.ry * 2;
          const sH = spanY / hStrips;
          const leftX = hz.cx - hz.rx;
          const spanX = hz.rx * 2;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(hz.cx, hz.cy, hz.rx, hz.ry, 0, 0, Math.PI * 2);
          ctx.clip();

          for (let i = 0; i < hStrips; i++) {
            const normY = (i + 0.5) / hStrips;
            const bell = Math.pow(Math.sin(normY * Math.PI), 1.75);
            const offsetY = hz.dy * bell;
            const offsetX = hz.dx * bell;
            const srcY = topY + i * sH;
            ctx.drawImage(
              activeFrameCanvas,
              leftX,
              srcY,
              spanX,
              sH + 1.5,
              leftX + offsetX,
              srcY + offsetY,
              spanX,
              sH + 1.8
            );
          }
          ctx.restore();
        }
      }

      // LAYER 3: 3D Perspective Head Yaw, Pitch & Roll Mesh (Decoupled from Background!)
      // Pivots strictly inside the head/hair silhouette around the cervical vertebra (C7)
      // so the bookshelf and WELCOME! sign on the left and right remain 100% immobile!
      const mouthW = cfg.x2 - cfg.x1;
      const halfW = mouthW * 0.5;
      const chinY = cfg.chinY ?? cfg.cy + Math.max(48, mouthW * 0.85);
      const eyeY = cfg.eyeY ?? cfg.cy - 95;
      const headCenterY = (eyeY + cfg.cy) * 0.5 - 25;
      const headRx = Math.max(175, mouthW * 2.05);
      const headRy = Math.max(225, (chinY - eyeY) * 1.65);

      const headShiftX = spring.headYaw * 34;
      const headShiftY = spring.headPitch * 0.65;

      if (
        headCtx &&
        !hasLiveVideoFrame &&
        (Math.abs(spring.headYaw) > 0.004 ||
          Math.abs(spring.headPitch) > 0.3 ||
          Math.abs(spring.headRoll) > 0.002)
      ) {
        headCtx.clearRect(0, 0, 1024, 1024);
        const cols = 18;
        const leftEdge = cfg.cx - headRx;
        const totalW = headRx * 2;
        const colW = totalW / cols;
        const topEdge = Math.max(10, headCenterY - headRy);
        const totalH = Math.min(1000 - topEdge, headRy * 2);

        // Render 3D Horizontal Perspective Foreshortening Columns into headBuffer
        let accumDstX = leftEdge + headShiftX;
        for (let c = 0; c < cols; c++) {
          const normX = (c + 0.5) / cols; // 0..1 from left to right of head
          const centeredX = (normX - 0.5) * 2; // -1..1
          const horizBell = Math.sin(normX * Math.PI);
          // 3D Yaw perspective: near side expands, far side compresses
          const perspScale = 1 + spring.headYaw * centeredX * 0.38 * horizBell;
          const dstColW = colW * perspScale;
          const srcX = leftEdge + c * colW;
          const parallaxY = headShiftY * horizBell;

          headCtx.drawImage(
            activeFrameCanvas,
            srcX,
            topEdge,
            colW + 1.2,
            totalH,
            accumDstX,
            topEdge + parallaxY,
            dstColW + 1.2,
            totalH
          );
          accumDstX += dstColW;
        }

        // Composite 3D perspective head inside feathered head silhouette around neck pivot
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cfg.cx, headCenterY, headRx * 0.94, headRy * 0.94, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(cfg.cx, chinY + 18);
        ctx.rotate(spring.headRoll * 0.65);
        ctx.translate(-cfg.cx, -(chinY + 18));
        ctx.drawImage(headBuffer, 0, 0);
        ctx.restore();
      }

      // Compute active 3D-tracked facial landmarks for Lip-Sync & Blink
      const activeHeadOffsetX = !hasLiveVideoFrame ? headShiftX * 0.72 : 0;
      const activeHeadOffsetY = !hasLiveVideoFrame ? headShiftY * 0.72 : 0;
      const activeMouthCx = cfg.cx + activeHeadOffsetX;
      const activeMouthCy = cfg.cy + activeHeadOffsetY;
      const activeChinY = chinY + activeHeadOffsetY;

      // 8. Surgical 60 FPS Strip-Mesh Upper Lip + Lower Lip & Mandible Warping + Anatomical Oral Cavity
      const jawHeight = Math.max(36, activeChinY - activeMouthCy);
      const maxJawDrop = Math.min(40, Math.max(cfg.maxOpening * 2.25, jawHeight * 0.46));

      const deltaOpen = speaking ? spring.open - effectiveBaseOpen : 0;
      const isClosedBase = effectiveBaseOpen < 0.12;

      if (speaking && (Math.abs(deltaOpen) > 0.01 || Math.abs(spring.spread) > 0.01)) {
        const warpWidth = halfW * 2.55;
        const warpLeft = activeMouthCx - warpWidth * 0.5;
        const horizScale = 1 + spring.spread * 0.26;

        // 8A. Upper lip micro-lift
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

        // 8B. Bidirectional Lower Lip, Mandible, and Chin Warp
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

      // 9. Render Feathered Anatomical Oral Cavity, Upper Teeth & Tongue Dorsum inside the Parted Stomion
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

        // 9A. Deep palatal/pharyngeal shadow gradient
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

        // 9B. Animated Tongue Dorsum
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

        // 9C. Upper Dental Arch
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

        // 9D. Inner Lip Mucosal Shadow Vignette
        buildStomionPath();
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = cfg.mustacheCover ? 3.2 : 2.4;
        ctx.strokeStyle = cfg.cavityRimColor;
        ctx.stroke();

        ctx.restore();

        // 9E. Soft Lower Lip Mucosal Rim
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

      // 10. 60 FPS Supraorbital Eyebrow Articulation & Eye Gaze Micro-Saccades + Full Eyelid Blinking
      if (!useDedicatedBlinkFrame && cfg.eyeY && cfg.leftEyeX && cfg.rightEyeX) {
        const eyeR = cfg.eyeRadius ?? 22;
        const activeEyeY = cfg.eyeY + activeHeadOffsetY;
        const eyePairs = [
          { ex: cfg.leftEyeX + activeHeadOffsetX, liftMult: 1 - spring.browAsym * 0.35 },
          { ex: cfg.rightEyeX + activeHeadOffsetX, liftMult: 1 + spring.browAsym * 0.45 },
        ];

        // 10A. Eyebrow Gesticulation Strip-Warp
        if (Math.abs(spring.browLift) > 0.03) {
          for (const { ex, liftMult } of eyePairs) {
            const browW = eyeR * 2.3;
            const browH = eyeR * 1.15;
            const browTopY = activeEyeY - eyeR * 1.82;
            const browShiftPx = -spring.browLift * liftMult * Math.max(4.5, eyeR * 0.22);

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, browTopY + browH * 0.5, browW * 0.48, browH * 0.48, 0, 0, Math.PI * 2);
            ctx.clip();

            const bStrips = 8;
            const bStripH = browH / bStrips;
            for (let i = 0; i < bStrips; i++) {
              const normY = (i + 0.5) / bStrips;
              const bell = Math.pow(Math.sin(normY * Math.PI), 1.8);
              const srcY = browTopY + i * bStripH;
              ctx.drawImage(
                activeFrameCanvas,
                ex - browW * 0.5,
                srcY,
                browW,
                bStripH + 1.2,
                ex - browW * 0.5,
                srcY + browShiftPx * bell,
                browW,
                bStripH + 1.4
              );
            }
            ctx.restore();
          }
        }

        // 10B. Subtle 60 FPS Iris/Pupil Gaze Micro-Saccades
        if (!hasLiveVideoFrame && spring.blink < 0.25 && (Math.abs(spring.saccadeX) > 0.25 || Math.abs(spring.saccadeY) > 0.2)) {
          for (const { ex } of eyePairs) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, activeEyeY, eyeR * 0.68, eyeR * 0.58, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              activeFrameCanvas,
              ex - eyeR * 0.72,
              activeEyeY - eyeR * 0.62,
              eyeR * 1.44,
              eyeR * 1.24,
              ex - eyeR * 0.72 + spring.saccadeX,
              activeEyeY - eyeR * 0.62 + spring.saccadeY,
              eyeR * 1.44,
              eyeR * 1.24
            );
            ctx.restore();
          }
        }

        // 10C. Natural 60 FPS Strip-Mesh Upper Eyelid Blinking
        if (spring.blink > 0.08) {
          for (const { ex } of eyePairs) {
            const lidW = eyeR * 2.15;
            const lidSpanY = eyeR * 1.55;
            const lidTopY = activeEyeY - eyeR * 0.85;
            const maxLidDrop = eyeR * 1.18 * spring.blink;
            const lStrips = 10;
            const lStripH = lidSpanY / lStrips;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, activeEyeY, eyeR * 1.05, eyeR * 0.82, 0, 0, Math.PI * 2);
            ctx.clip();

            for (let i = 0; i < lStrips; i++) {
              const normY = (i + 0.5) / lStrips;
              const bell = Math.sin(normY * Math.PI);
              const srcY = lidTopY + i * lStripH - maxLidDrop * bell * 0.55;
              const dstY = lidTopY + i * lStripH + maxLidDrop * bell * 0.45;
              ctx.drawImage(
                activeFrameCanvas,
                ex - lidW * 0.5,
                srcY,
                lidW,
                lStripH + 1.4,
                ex - lidW * 0.5,
                dstY,
                lidW,
                lStripH + 1.6
              );
            }
            ctx.restore();
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
      data-engine="nanobanana-2.1-lhm-3d-60fps"
    />
  );
};

export default NanoBananaLipSyncCanvas;
