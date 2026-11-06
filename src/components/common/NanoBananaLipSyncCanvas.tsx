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
  /** Optional explicit mouth config override */
  mouthConfig?: CharacterAnatomicalMouth;
  /** Optional external real-time mouth open ratio (0..1) from parent analyser */
  externalMouthOpen?: number;
  /** Optional external real-time mouth width/spread ratio (-0.5..0.5) from parent analyser */
  externalMouthSpread?: number;
  /** Optional text currently being spoken (used to drive phoneme-aware syllable envelopes) */
  spokenText?: string;
  /** Optional compendium of multi-gesture pose URLs keyed by gesture type */
  poseCompendium?: Partial<Record<Exclude<AvatarGestureMode, 'auto'> | 'blink', string>>;
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
  headTiltX: number;
  headBobY: number;
  headRoll: number;
  handWaveL: number;
  handWaveR: number;
  saccadeX: number;
  saccadeY: number;
  gestureImpulse: number;
}

/**
 * Motor Cinemático Híbrido a 60 FPS con Compendio Multi-Pose, Gesticulación de Manos,
 * Parpadeo Involuntario (Simple y Doble), Articulación de Cejas y Lip-Sync Formántico/Fonético.
 */
export const NanoBananaLipSyncCanvas: React.FC<NanoBananaLipSyncCanvasProps> = ({
  imageSrc,
  characterId,
  isSpeaking,
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
  const poseCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const externalOpenRef = useRef<number>(externalMouthOpen);
  const externalSpreadRef = useRef<number>(externalMouthSpread);
  const spokenTextRef = useRef<string>(spokenText);
  const visemeTokensRef = useRef<VisemeToken[]>(buildPhonemeVisemeSequence(spokenText));
  const activeGestureRef = useRef<AvatarGestureMode>(activeGesture);
  const resolvedGestureRef = useRef<Exclude<AvatarGestureMode, 'auto'>>('welcome');
  const poseCompendiumRef = useRef(poseCompendium);
  const onResolvedGestureChangeRef = useRef(onResolvedGestureChange);

  // Cross-dissolve state between poses in the compendium
  const prevPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionStartRef = useRef<number>(0);
  const forceBlinkRef = useRef<boolean>(false);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
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

  // Preload canonical image + entire poseCompendium into 1024x1024 offscreen cache
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

    return () => {
      cancelled = true;
    };
  }, [imageSrc, poseCompendium, loadPoseToCanvas, onLoad]);

  // Switch active pose canvas smoothly when gesture changes
  const switchToGesturePose = React.useCallback(
    (gesture: Exclude<AvatarGestureMode, 'auto'>, now: number) => {
      const compendium = poseCompendiumRef.current;
      const targetUrl = (compendium && compendium[gesture]) || imageSrc;
      const targetCanvas = poseCacheRef.current.get(targetUrl) || offscreenRef.current;

      if (resolvedGestureRef.current !== gesture) {
        resolvedGestureRef.current = gesture;
        onResolvedGestureChangeRef.current?.(gesture);
      }

      if (targetCanvas && currPoseCanvasRef.current !== targetCanvas) {
        prevPoseCanvasRef.current = currPoseCanvasRef.current || offscreenRef.current;
        currPoseCanvasRef.current = targetCanvas;
        transitionStartRef.current = now;
        forceBlinkRef.current = true;
      }
    },
    [imageSrc]
  );

  // Automatic & Contextual Gesture Director:
  // Ensures animations vary every time the character is invoked, reacts to ! and ?,
  // and keeps subtle living transitions even in idle mode.
  useEffect(() => {
    const now = performance.now();

    if (activeGesture !== 'auto') {
      switchToGesturePose(activeGesture, now);
      return;
    }

    // Determine initial contextual gesture based on text punctuation & speaking state
    const text = spokenText || '';
    const hasExclaim = text.includes('!') || text.includes('¡') || /bravo|excellent|wonderful|magnifique|bienvenue|welcome/i.test(text);
    const hasQuestion = text.includes('?') || text.includes('¿') || /^(comment|pourquoi|where|how|what|why|quel)/i.test(text.trim());

    if (!isSpeaking) {
      // In idle/listening mode: alternate gently between 'listen', 'welcome', and 'inquire' so never static
      const idleSequence: Array<Exclude<AvatarGestureMode, 'auto'>> = ['listen', 'welcome', 'encourage', 'listen', 'inquire'];
      let step = Math.floor(Math.random() * idleSequence.length);
      switchToGesturePose(hasQuestion ? 'inquire' : hasExclaim ? 'welcome' : 'listen', now);

      const idleTimer = setInterval(() => {
        if (activeGestureRef.current !== 'auto') return;
        step = (step + 1) % idleSequence.length;
        switchToGesturePose(idleSequence[step], performance.now());
      }, 4200);

      return () => clearInterval(idleTimer);
    }

    // When speaking in 'auto' mode: start with punctuation-appropriate gesture, then cycle dynamically
    const initialGesture: Exclude<AvatarGestureMode, 'auto'> = hasExclaim
      ? 'exclaim'
      : hasQuestion
        ? 'inquire'
        : 'explain';
    switchToGesturePose(initialGesture, now);

    const speechPool: Array<Exclude<AvatarGestureMode, 'auto'>> = hasExclaim
      ? ['exclaim', 'welcome', 'encourage', 'explain']
      : hasQuestion
        ? ['inquire', 'explain', 'welcome', 'inquire']
        : ['explain', 'welcome', 'encourage', 'inquire', 'exclaim'];

    let idx = 0;
    const speechTimer = setInterval(() => {
      if (activeGestureRef.current !== 'auto') return;
      idx = (idx + 1) % speechPool.length;
      switchToGesturePose(speechPool[idx], performance.now());
    }, 2400);

    return () => clearInterval(speechTimer);
  }, [activeGesture, isSpeaking, spokenText, switchToGesturePose]);

  // 60 FPS RequestAnimationFrame Surgical Kinematic, Ocular, Hand & Lip-Sync Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = performance.now();
    // Frequent natural involuntary blinking (every 2.0s - 3.5s) + double-blink capability
    let nextBlinkAt = lastTime + 900 + Math.random() * 1400;
    let blinkStartAt = -1;
    let pendingDoubleBlink = false;
    const BLINK_DURATION_MS = 165;

    // Natural eye gaze micro-saccade timer
    let nextSaccadeAt = lastTime + 1200;
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
      headTiltX: 0,
      headBobY: 0,
      headRoll: 0,
      handWaveL: 0,
      handWaveR: 0,
      saccadeX: 0,
      saccadeY: 0,
      gestureImpulse: 0,
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      const baseOff = currPoseCanvasRef.current || offscreenRef.current;
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

        // Walk through the phoneme viseme sequence of spokenText at ~7.2 phonemes/sec
        const tokens = visemeTokensRef.current;
        const seqIndex = Math.floor(tSec * 7.2) % tokens.length;
        const tok = tokens[seqIndex] || { open: 0.5, spread: 0, tongue: 0.3, bilabial: false };

        // Continuous organic syllable micro-modulation
        const sylMod = 0.82 + 0.24 * Math.sin(tSec * 14.5);
        const oscOpen = tok.bilabial ? 0.0 : Math.min(0.98, tok.open * sylMod);
        const oscSpread = tok.spread + 0.08 * Math.sin(tSec * 8.4);
        const oscTongue = tok.tongue;

        if (formants.rms > 0.015) {
          if (formants.bilabial || tok.bilabial) {
            targetOpen = 0.0; // Complete bilabial closure on /m/, /b/, /p/
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

        // Exclamation boost
        if (currentGesture === 'exclaim') {
          targetOpen = Math.min(1.0, targetOpen * 1.15);
          targetSpread = Math.max(targetSpread, 0.16);
        }
      }

      // Adjust effective baseOpen depending on whether current pose is a closed-lip pose ('listen' / 'inquire')
      const poseIsClosedSmile =
        currentGesture === 'listen' || currentGesture === 'inquire';
      const effectiveBaseOpen = poseIsClosedSmile ? 0.04 : baseOpen;

      if (!speaking) {
        // When not actively speaking, preserve the 100% native Pixar 3D mouth expression of each keyframe pose
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

      // 3. Eyebrow Expression Physics (lifts on exclamations, arches asymmetrically on questions)
      let targetBrowLift = speaking ? Math.sin(tSec * 2.4) * 0.18 + spring.open * 0.35 : Math.sin(tSec * 1.5) * 0.06;
      let targetBrowAsym = 0;
      if (speaking && currentGesture === 'exclaim') {
        targetBrowLift = 0.55 + Math.sin(tSec * 5.5) * 0.12;
      } else if (speaking && currentGesture === 'inquire') {
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
          // Immediately trigger a visible Pixar blink when user clicks 'Parpadeo'
          blinkStartAt = now;
          pendingDoubleBlink = true;
          nextBlinkAt = now + activeBlinkDuration + 220;
        } else {
          // On other pose switches (Explain, Exclaim, Inquire, Encourage), schedule next natural blink after 1.4s
          // so the user immediately sees the character's open-eyed expression first
          blinkStartAt = -1;
          spring.blink = 0;
          nextBlinkAt = now + 1400 + Math.random() * 1100;
        }
      } else if (now >= nextBlinkAt && blinkStartAt < 0) {
        blinkStartAt = now;
        // 35% chance of natural double-blink (or 65% in explicit blink demo mode)
        if (!pendingDoubleBlink && Math.random() < (isExplicitBlinkDemo ? 0.65 : 0.35)) {
          pendingDoubleBlink = true;
          nextBlinkAt = now + activeBlinkDuration + 180;
        } else {
          pendingDoubleBlink = false;
          nextBlinkAt =
            now +
            (isExplicitBlinkDemo
              ? 850 + Math.random() * 450
              : speaking
                ? 1900 + Math.random() * 1500
                : 2200 + Math.random() * 1600);
        }
      }

      if (blinkStartAt >= 0) {
        const elapsed = now - blinkStartAt;
        if (elapsed >= activeBlinkDuration) {
          spring.blink = 0;
          blinkStartAt = -1;
        } else {
          // Fast upper-lid close, slightly softer open
          const normB = elapsed / activeBlinkDuration;
          spring.blink = Math.pow(Math.sin(normB * Math.PI), 0.72);
        }
      } else {
        spring.blink = 0;
      }

      // Decay gesture transition impulse
      spring.gestureImpulse *= Math.max(0, 1 - dt * 5.5);

      // Eye gaze micro-saccades
      if (now >= nextSaccadeAt) {
        nextSaccadeAt = now + 1100 + Math.random() * 1600;
        targetSaccadeX = (Math.random() - 0.5) * 4.4;
        targetSaccadeY = (Math.random() - 0.5) * 2.4;
      }
      spring.saccadeX += (targetSaccadeX - spring.saccadeX) * Math.min(1, dt * 12);
      spring.saccadeY += (targetSaccadeY - spring.saccadeY) * Math.min(1, dt * 12);

      // 5. Continuous 60 FPS Diaphragmatic Breathing, Postural Sway & Hand Gesticulation Kinematics
      const breathWave = Math.sin(tSec * 1.95);
      const swayWave = Math.sin(tSec * 1.15) * Math.cos(tSec * 0.65);

      const energyMult = speaking ? 1.65 : currentGesture === 'exclaim' ? 1.45 : 1.0;
      const targetBobY =
        breathWave * 4.6 * energyMult +
        (speaking ? Math.sin(tSec * 5.8) * 5.2 * spring.open : 0) -
        spring.gestureImpulse * 6.5;

      const targetTiltX =
        swayWave * 4.2 * energyMult +
        (speaking ? Math.sin(tSec * 3.4) * 3.8 * spring.open : 0);

      let targetRoll = swayWave * 0.014;
      if (currentGesture === 'inquire') {
        targetRoll += 0.028 + Math.sin(tSec * 2.1) * 0.008;
      } else if (currentGesture === 'exclaim') {
        targetRoll += Math.sin(tSec * 4.2) * 0.018;
      } else if (speaking) {
        targetRoll += Math.sin(tSec * 2.8) * 0.016;
      }

      spring.headBobY += (targetBobY - spring.headBobY) * Math.min(1, dt * 10);
      spring.headTiltX += (targetTiltX - spring.headTiltX) * Math.min(1, dt * 10);
      spring.headRoll += (targetRoll - spring.headRoll) * Math.min(1, dt * 8);

      // Left & Right Forearm/Hand Kinematic Gesture Waves (60 FPS)
      const handAmp = speaking
        ? 13.5 + spring.open * 9.5
        : currentGesture === 'exclaim'
          ? 14.0
          : currentGesture === 'explain' || currentGesture === 'welcome'
            ? 8.5
            : 5.2;
      const targetHandL =
        Math.sin(tSec * (speaking ? 4.6 : 2.2)) * handAmp - spring.gestureImpulse * 11;
      const targetHandR =
        Math.cos(tSec * (speaking ? 4.9 : 2.35) + 0.8) * handAmp - spring.gestureImpulse * 11;

      spring.handWaveL += (targetHandL - spring.handWaveL) * Math.min(1, dt * 11);
      spring.handWaveR += (targetHandR - spring.handWaveR) * Math.min(1, dt * 11);

      // 6. Compose Base + Cross-Dissolve Pose on Display Canvas (1024x1024)
      ctx.save();
      ctx.clearRect(0, 0, 1024, 1024);

      // Apply smart bust crop or full-stage kinematic transform without clipping top of head
      const breathScaleY = 1.0 + Math.max(0, breathWave) * 0.0065 + spring.gestureImpulse * 0.005;
      const breathScaleX = 1.0 + Math.max(0, breathWave) * 0.0035;

      if (enableSmartBustCrop && cfg.bustCrop) {
        const { focusX, focusY, zoom } = cfg.bustCrop;
        ctx.translate(512, 512);
        ctx.rotate(spring.headRoll);
        ctx.scale(zoom * breathScaleX, zoom * breathScaleY);
        ctx.translate(-focusX + spring.headTiltX, -focusY + spring.headBobY);
      } else {
        // Keep full 1024x1024 headroom so the top of the hair is never cropped
        const safeTiltX = Math.max(-8, Math.min(8, spring.headTiltX * 0.65));
        const safeBobY = Math.max(-3, Math.min(8, spring.headBobY * 0.65 + 2));
        ctx.translate(512 + safeTiltX, 560 + safeBobY);
        ctx.rotate(spring.headRoll * 0.75);
        ctx.scale(0.992 * breathScaleX, 0.992 * breathScaleY);
        ctx.translate(-512, -560);
      }

      // If a dedicated Nano Banana 2.1 blink keyframe exists in compendium and the character is in
      // 'listen' (Parpadeo) or 'welcome' mode during a blink peak, swap cleanly to the Pixar blink frame
      const compendium = poseCompendiumRef.current;
      const blinkPoseUrl = compendium?.blink;
      const blinkPoseCanvas = blinkPoseUrl ? poseCacheRef.current.get(blinkPoseUrl) : null;
      const useDedicatedBlinkFrame =
        Boolean(blinkPoseCanvas) &&
        (currentGesture === 'listen' || currentGesture === 'welcome') &&
        spring.blink > 0.38;

      const activeFrameCanvas = useDedicatedBlinkFrame && blinkPoseCanvas ? blinkPoseCanvas : baseOff;

      // Crisp blink-synced pose cut (zero multi-arm alpha ghosting)
      ctx.globalAlpha = 1;
      ctx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);

      // 7. Localized 60 FPS Left & Right Hand / Forearm Kinematic Strip-Warp
      // Animates the character's hands and forearms smoothly while preserving background edges
      const handZones = [
        { cx: 215, cy: 655, rx: 185, ry: 225, dy: spring.handWaveL, dx: spring.handWaveL * 0.28 },
        { cx: 809, cy: 655, rx: 185, ry: 225, dy: spring.handWaveR, dx: -spring.handWaveR * 0.28 },
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
          // Smooth bell falloff (0 at top/bottom boundary, 1 at center of hand/forearm)
          const bell = Math.pow(Math.sin(normY * Math.PI), 1.65);
          const offsetY = hz.dy * bell;
          const offsetX = hz.dx * bell;
          const srcY = topY + i * sH;
          ctx.drawImage(
            baseOff,
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

      // 8. Surgical Strip-Mesh Upper Lip + Lower Lip & Mandible Warping + Anatomical Oral Cavity
      const mouthW = cfg.x2 - cfg.x1;
      const halfW = mouthW * 0.5;
      const chinY = cfg.chinY ?? cfg.cy + Math.max(48, mouthW * 0.85);
      const jawHeight = Math.max(36, chinY - cfg.cy);
      const maxJawDrop = Math.min(40, Math.max(cfg.maxOpening * 2.25, jawHeight * 0.46));

      const deltaOpen = speaking ? spring.open - effectiveBaseOpen : 0;
      const isClosedBase = effectiveBaseOpen < 0.12;

      if (speaking && (Math.abs(deltaOpen) > 0.01 || Math.abs(spring.spread) > 0.01)) {
        const warpWidth = halfW * 2.55;
        const warpLeft = cfg.cx - warpWidth * 0.5;
        const horizScale = 1 + spring.spread * 0.26;

        // 8A. Upper lip micro-lift
        if (!cfg.mustacheCover && Math.abs(deltaOpen) > 0.01) {
          const upStrips = 8;
          const upSpanY = Math.max(14, jawHeight * 0.28);
          const upStripH = upSpanY / upStrips;
          const upperLiftPx = (isClosedBase ? spring.open : deltaOpen) * maxJawDrop * 0.24;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cfg.cx, cfg.cy - upSpanY * 0.45, halfW * 1.15, upSpanY * 0.65, 0, 0, Math.PI * 2);
          ctx.clip();
          for (let i = 0; i < upStrips; i++) {
            const normY = i / upStrips;
            const falloff = Math.pow(Math.sin(normY * Math.PI * 0.5), 1.5);
            const dy = -upperLiftPx * falloff;
            const srcY = cfg.cy - upSpanY + i * upStripH;
            const dstY = srcY + dy;
            const dstW = warpWidth * (1 + (horizScale - 1) * falloff);
            const dstX = cfg.cx - dstW * 0.5;
            ctx.drawImage(baseOff, warpLeft, srcY, warpWidth, upStripH + 1.2, dstX, dstY, dstW, upStripH + 1.4);
          }
          ctx.restore();
        }

        // 8B. Bidirectional Lower Lip, Mandible, and Chin Warp (closes upward on bilabials, drops downward on vowels)
        const numStrips = 28;
        const warpTop = cfg.cy - (deltaOpen < 0 ? 6 : 0);
        const warpSpanY = jawHeight * 1.26;
        const stripH = warpSpanY / numStrips;

        const lowerDropPx = isClosedBase
          ? spring.open * maxJawDrop * 0.82
          : deltaOpen * maxJawDrop * 0.88;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          cfg.cx,
          cfg.cy + jawHeight * 0.52,
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
          const dstX = cfg.cx - dstW * 0.5;

          ctx.drawImage(
            baseOff,
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
        const cornerY = (cfg.y1 + cfg.y2) * 0.5 + lowerDropPx * 0.12;
        const stomionCenterY = cfg.cy;

        const leftX = cfg.cx - activeHalfW;
        const rightX = cfg.cx + activeHalfW;
        const topCtrlY = stomionCenterY - upperLiftPx * 1.38;
        const botCtrlY = stomionCenterY + lowerDropPx * 1.48;

        ctx.save();

        const buildStomionPath = () => {
          ctx.beginPath();
          ctx.moveTo(leftX, cornerY);
          ctx.quadraticCurveTo(cfg.cx, topCtrlY, rightX, cornerY);
          ctx.quadraticCurveTo(cfg.cx, botCtrlY, leftX, cornerY);
          ctx.closePath();
        };

        buildStomionPath();
        ctx.clip();

        // 9A. Deep palatal/pharyngeal shadow gradient
        const cavGrad = ctx.createRadialGradient(
          cfg.cx,
          stomionCenterY + lowerDropPx * 0.28,
          1,
          cfg.cx,
          stomionCenterY + lowerDropPx * 0.28,
          Math.max(activeHalfW, lowerDropPx + upperLiftPx)
        );
        cavGrad.addColorStop(0, cfg.cavityDarkColor);
        cavGrad.addColorStop(0.68, cfg.cavityMidColor);
        cavGrad.addColorStop(1, cfg.cavityRimColor);

        ctx.globalAlpha = effectiveBaseOpen > 0.15 ? 0.82 : 0.95;
        ctx.fillStyle = cavGrad;
        ctx.fillRect(leftX - 4, topCtrlY - 4, activeHalfW * 2 + 8, botCtrlY - topCtrlY + 12);

        // 9B. Animated Tongue Dorsum (elevates on alveolar consonants /l/, /n/, /t/, /d/, /r/)
        const apertureH = lowerDropPx + upperLiftPx;
        if (apertureH > 3.0) {
          const tongueW = activeHalfW * 0.64;
          const tongueH = apertureH * (0.42 + spring.tongue * 0.24);
          const tongueCenterY = stomionCenterY + lowerDropPx * (0.72 - spring.tongue * 0.24);

          const tGrad = ctx.createRadialGradient(
            cfg.cx,
            tongueCenterY - tongueH * 0.2,
            1,
            cfg.cx,
            tongueCenterY,
            tongueW
          );
          tGrad.addColorStop(0, '#c85a64');
          tGrad.addColorStop(0.65, '#943540');
          tGrad.addColorStop(1, cfg.cavityMidColor);

          ctx.beginPath();
          ctx.ellipse(cfg.cx, tongueCenterY, tongueW, tongueH, 0, 0, Math.PI * 2);
          ctx.fillStyle = tGrad;
          ctx.fill();
        }

        // 9C. Upper Dental Arch
        if (!cfg.mustacheCover && apertureH > 3.8 && effectiveBaseOpen < 0.25) {
          const teethW = activeHalfW * 0.72;
          const teethH = Math.min(apertureH * 0.28, 5.8);
          const teethTopY = stomionCenterY - upperLiftPx * 0.65;

          const teethGrad = ctx.createLinearGradient(cfg.cx - teethW, teethTopY, cfg.cx + teethW, teethTopY);
          teethGrad.addColorStop(0, 'rgba(180, 168, 155, 0.35)');
          teethGrad.addColorStop(0.2, cfg.teethColor);
          teethGrad.addColorStop(0.5, '#ffffff');
          teethGrad.addColorStop(0.8, cfg.teethColor);
          teethGrad.addColorStop(1, 'rgba(180, 168, 155, 0.35)');

          ctx.globalAlpha = Math.min(0.72, (apertureH - 3.2) / 7.5);
          ctx.beginPath();
          ctx.roundRect(cfg.cx - teethW, teethTopY - 1, teethW * 2, teethH, [0, 0, 3, 3]);
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
        ctx.quadraticCurveTo(cfg.cx, botCtrlY + 1.2, rightX - activeHalfW * 0.12, cornerY + 0.5);
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
            cfg.cx,
            stomionCenterY - upperLiftPx * 0.55,
            activeHalfW * 0.96,
            Math.max(3, upperLiftPx * 1.15),
            0,
            0,
            Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(baseOff, 0, 0, 1024, 1024);
          ctx.restore();
        }
      }

      // 10. 60 FPS Supraorbital Eyebrow Articulation & Eye Gaze Micro-Saccades + Full Eyelid Blinking
      if (!useDedicatedBlinkFrame && cfg.eyeY && cfg.leftEyeX && cfg.rightEyeX) {
        const eyeR = cfg.eyeRadius ?? 22;
        const eyePairs = [
          { ex: cfg.leftEyeX, liftMult: 1 - spring.browAsym * 0.35 },
          { ex: cfg.rightEyeX, liftMult: 1 + spring.browAsym * 0.45 },
        ];

        // 10A. Eyebrow Gesticulation Strip-Warp (arches eyebrows on exclamations, inquiries, and speech peaks)
        if (Math.abs(spring.browLift) > 0.03) {
          for (const { ex, liftMult } of eyePairs) {
            const browW = eyeR * 2.3;
            const browH = eyeR * 1.15;
            const browTopY = cfg.eyeY - eyeR * 1.82;
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
                baseOff,
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

        // 10B. Subtle 60 FPS Iris/Pupil Gaze Micro-Saccades (when eyes are open)
        if (spring.blink < 0.25 && (Math.abs(spring.saccadeX) > 0.25 || Math.abs(spring.saccadeY) > 0.2)) {
          for (const { ex } of eyePairs) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, cfg.eyeY, eyeR * 0.68, eyeR * 0.58, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              baseOff,
              ex - eyeR * 0.72,
              cfg.eyeY - eyeR * 0.62,
              eyeR * 1.44,
              eyeR * 1.24,
              ex - eyeR * 0.72 + spring.saccadeX,
              cfg.eyeY - eyeR * 0.62 + spring.saccadeY,
              eyeR * 1.44,
              eyeR * 1.24
            );
            ctx.restore();
          }
        }

        // 10C. Natural 60 FPS Strip-Mesh Upper Eyelid Blinking (stretches real 3D upper eyelid skin cleanly)
        if (spring.blink > 0.08) {
          for (const { ex } of eyePairs) {
            const lidW = eyeR * 2.15;
            const lidSpanY = eyeR * 1.55;
            const lidTopY = cfg.eyeY - eyeR * 0.85;
            const maxLidDrop = eyeR * 1.18 * spring.blink;
            const lStrips = 10;
            const lStripH = lidSpanY / lStrips;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, cfg.eyeY, eyeR * 1.05, eyeR * 0.82, 0, 0, Math.PI * 2);
            ctx.clip();

            for (let i = 0; i < lStrips; i++) {
              const normY = (i + 0.5) / lStrips;
              const bell = Math.sin(normY * Math.PI);
              const srcY = lidTopY + i * lStripH - maxLidDrop * bell * 0.55;
              const dstY = lidTopY + i * lStripH + maxLidDrop * bell * 0.45;
              ctx.drawImage(
                baseOff,
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
      data-engine="nanobanana-2.1-60fps-kinematic"
    />
  );
};

export default NanoBananaLipSyncCanvas;
