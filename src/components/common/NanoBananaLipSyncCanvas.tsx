'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CharacterAnatomicalMouth,
  getHistoricalMouthConfig,
} from '@/lib/historicalVoiceEngine';

function getVoiceFormantLevels(): {
  rms: number;
  open: number;
  spread: number;
  rounded: number;
  alveolar: boolean;
  bilabial: boolean;
  audioGraphActive?: boolean;
} {
  if (typeof window !== 'undefined' && (window as any).__iskoolActiveFormantLevels) {
    return (window as any).__iskoolActiveFormantLevels;
  }
  return { rms: 0, open: 0, spread: 0, rounded: 0, alveolar: false, bilabial: false, audioGraphActive: false };
}

function isVoiceAudiblySpeaking(): boolean {
  if (typeof window !== 'undefined' && typeof (window as any).__iskoolVoiceAudiblySpeaking === 'boolean') {
    return Boolean((window as any).__iskoolVoiceAudiblySpeaking);
  }
  return true;
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
  /** True only when the companion .mp4 video stream already bakes native 3D lip-sync and blinks (e.g. Claire) */
  videoHasNativeLipSync?: boolean;
  /** True for non-human geographic sites / monuments so facial overlays stay disabled */
  isGeographicSite?: boolean;
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
    return ['pronounce', 'explain', 'calm', 'point', 'encourage', 'think', 'celebrate', 'welcome'];
  }
  if (hasCalm) {
    return ['calm', 'welcome', 'explain', 'pronounce', 'encourage', 'wave'];
  }
  if (hasGreeting && hasQuestion) {
    return ['welcome', 'wave', 'inquire', 'explain', 'point', 'encourage', 'celebrate', 'think'];
  }
  if (hasExclaim) {
    return ['exclaim', 'celebrate', 'encourage', 'wave', 'explain', 'think', 'welcome', 'point'];
  }
  if (hasQuestion) {
    return ['inquire', 'think', 'point', 'explain', 'pronounce', 'encourage', 'welcome', 'wave'];
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

interface PoseMouthAnatomy {
  numCols: number;
  patchHalfW: number;
  hasTeeth: boolean;
  poseBaseOpen: number;
  srcUpperLipBotY: Float32Array;
  srcTeethBotY: Float32Array;
  srcLowerLipY: Float32Array;
}

function computeUpperFaceBridgeShift(
  refCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  mouthCy: number
): { dx: number; dy: number } | null {
  try {
    const rCtx = refCanvas.getContext('2d', { willReadFrequently: true }) || refCanvas.getContext('2d');
    const tCtx = targetCanvas.getContext('2d', { willReadFrequently: true }) || targetCanvas.getContext('2d');
    if (!rCtx || !tCtx) return null;

    const centerX = (lx + rx) * 0.5;
    const topY = Math.max(0, Math.round(Math.min(ly, ry) - 24));
    const botY = Math.min(1020, Math.max(topY + 36, Math.round(mouthCy - 18)));
    const patchW = Math.min(240, Math.max(72, Math.round(Math.abs(rx - lx) * 1.62)));
    const patchH = Math.min(180, Math.max(36, botY - topY));
    const rx0 = Math.max(0, Math.min(1024 - patchW, Math.round(centerX - patchW * 0.5)));
    const ry0 = topY;

    const maxShiftX = 80;
    const maxShiftY = 34;
    const searchX0 = Math.max(0, rx0 - maxShiftX);
    const searchY0 = Math.max(0, ry0 - maxShiftY);
    const searchW = Math.min(1024 - searchX0, patchW + maxShiftX * 2);
    const searchH = Math.min(1024 - searchY0, patchH + maxShiftY * 2);

    const refData = rCtx.getImageData(rx0, ry0, patchW, patchH).data;
    const tgtData = tCtx.getImageData(searchX0, searchY0, searchW, searchH).data;

    // Stage 1: Coarse Pyramid Search (4px grid, 6px patch stride -> <1.2ms on main thread)
    const coarseShiftStep = 4;
    const coarsePatchStep = 6;
    let coarseBest1Score = Infinity;
    let coarseBest1Dx = 0;
    let coarseBest1Dy = 0;
    let coarseBest2Score = Infinity;
    let coarseBest2Dx = 0;
    let coarseBest2Dy = 0;

    for (let dy = -maxShiftY; dy <= maxShiftY; dy += coarseShiftStep) {
      const tyBase = ry0 + dy - searchY0;
      if (tyBase < 0 || tyBase + patchH >= searchH) continue;
      for (let dx = -maxShiftX; dx <= maxShiftX; dx += coarseShiftStep) {
        const txBase = rx0 + dx - searchX0;
        if (txBase < 0 || txBase + patchW >= searchW) continue;

        let sad = 0;
        for (let py = 0; py < patchH; py += coarsePatchStep) {
          const rRow = py * patchW;
          const tRow = (tyBase + py) * searchW + txBase;
          for (let px = 0; px < patchW; px += coarsePatchStep) {
            const ri = (rRow + px) * 4;
            const ti = (tRow + px) * 4;
            sad +=
              Math.abs(refData[ri] - tgtData[ti]) +
              Math.abs(refData[ri + 1] - tgtData[ti + 1]) +
              Math.abs(refData[ri + 2] - tgtData[ti + 2]);
          }
        }
        const score = sad + (Math.abs(dx) + Math.abs(dy)) * 0.5;
        if (score < coarseBest1Score) {
          coarseBest2Score = coarseBest1Score;
          coarseBest2Dx = coarseBest1Dx;
          coarseBest2Dy = coarseBest1Dy;
          coarseBest1Score = score;
          coarseBest1Dx = dx;
          coarseBest1Dy = dy;
        } else if (score < coarseBest2Score && (Math.abs(dx - coarseBest1Dx) > 6 || Math.abs(dy - coarseBest1Dy) > 6)) {
          coarseBest2Score = score;
          coarseBest2Dx = dx;
          coarseBest2Dy = dy;
        }
      }
    }

    // Stage 2: Exact 1px Fine Refinement around top coarse candidate + origin (stride 5 -> <4ms, 0 LongTasks!)
    let bestScore = Infinity;
    let bestDx = coarseBest1Dx;
    let bestDy = coarseBest1Dy;
    const fineStep = 5;
    const seeds: Array<[number, number]> =
      Math.abs(coarseBest1Dx) > 4 || Math.abs(coarseBest1Dy) > 4
        ? [
            [coarseBest1Dx, coarseBest1Dy],
            [0, 0],
          ]
        : [[coarseBest1Dx, coarseBest1Dy]];

    for (let s = 0; s < seeds.length; s++) {
      const [seedDx, seedDy] = seeds[s];
      const minDy = Math.max(-maxShiftY, seedDy - 3);
      const maxDy = Math.min(maxShiftY, seedDy + 3);
      const minDx = Math.max(-maxShiftX, seedDx - 3);
      const maxDx = Math.min(maxShiftX, seedDx + 3);

      for (let dy = minDy; dy <= maxDy; dy += 1) {
        const tyBase = ry0 + dy - searchY0;
        if (tyBase < 0 || tyBase + patchH >= searchH) continue;
        for (let dx = minDx; dx <= maxDx; dx += 1) {
          const txBase = rx0 + dx - searchX0;
          if (txBase < 0 || txBase + patchW >= searchW) continue;

          let sad = 0;
          for (let py = 0; py < patchH; py += fineStep) {
            const rRow = py * patchW;
            const tRow = (tyBase + py) * searchW + txBase;
            for (let px = 0; px < patchW; px += fineStep) {
              const ri = (rRow + px) * 4;
              const ti = (tRow + px) * 4;
              sad +=
                Math.abs(refData[ri] - tgtData[ti]) +
                Math.abs(refData[ri + 1] - tgtData[ti + 1]) +
                Math.abs(refData[ri + 2] - tgtData[ti + 2]);
            }
          }
          const penalty = (Math.abs(dx) + Math.abs(dy)) * 1.8;
          const score = sad + penalty;
          if (score < bestScore) {
            bestScore = score;
            bestDx = dx;
            bestDy = dy;
          }
        }
      }
    }

    return { dx: bestDx, dy: bestDy };
  } catch {
    return null;
  }
}

/**
 * Aligns a closed-eye blink sprite against canonical using strictly non-eyelid facial anchors
 * (upper forehead / brow ridge + nasal tip / upper cheek bridge), preventing eyelid closure
 * from biasing alignment while eliminating 4–6px vertical blink sprite misalignments.
 */
function computeBlinkSpriteBridgeShift(
  refCanvas: HTMLCanvasElement,
  blinkCanvas: HTMLCanvasElement,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  mouthCy: number
): { dx: number; dy: number } | null {
  try {
    const rCtx = refCanvas.getContext('2d', { willReadFrequently: true }) || refCanvas.getContext('2d');
    const bCtx = blinkCanvas.getContext('2d', { willReadFrequently: true }) || blinkCanvas.getContext('2d');
    if (!rCtx || !bCtx) return null;

    const centerX = (lx + rx) * 0.5;
    const eyeMidY = (ly + ry) * 0.5;
    // Lower nasal bridge / cheek strip strictly below lower eyelids and above upper lip
    const topY = Math.max(0, Math.round(eyeMidY + Math.max(16, (mouthCy - eyeMidY) * 0.34)));
    const botY = Math.min(1020, Math.max(topY + 24, Math.round(mouthCy - 10)));
    const patchW = Math.min(220, Math.max(68, Math.round(Math.abs(rx - lx) * 1.48)));
    const patchH = Math.min(120, Math.max(24, botY - topY));
    const rx0 = Math.max(0, Math.min(1024 - patchW, Math.round(centerX - patchW * 0.5)));
    const ry0 = topY;

    const maxShift = 12;
    const searchX0 = Math.max(0, rx0 - maxShift);
    const searchY0 = Math.max(0, ry0 - maxShift);
    const searchW = Math.min(1024 - searchX0, patchW + maxShift * 2);
    const searchH = Math.min(1024 - searchY0, patchH + maxShift * 2);

    const refData = rCtx.getImageData(rx0, ry0, patchW, patchH).data;
    const tgtData = bCtx.getImageData(searchX0, searchY0, searchW, searchH).data;

    let bestScore = Infinity;
    let bestDx = 0;
    let bestDy = 0;
    const stride = 3;

    for (let dy = -maxShift; dy <= maxShift; dy++) {
      const tyBase = ry0 + dy - searchY0;
      if (tyBase < 0 || tyBase + patchH >= searchH) continue;
      for (let dx = -maxShift; dx <= maxShift; dx++) {
        const txBase = rx0 + dx - searchX0;
        if (txBase < 0 || txBase + patchW >= searchW) continue;
        let sad = 0;
        for (let py = 0; py < patchH; py += stride) {
          const rRow = py * patchW;
          const tRow = (tyBase + py) * searchW + txBase;
          for (let px = 0; px < patchW; px += stride) {
            const ri = (rRow + px) * 4;
            const ti = (tRow + px) * 4;
            sad +=
              Math.abs(refData[ri] - tgtData[ti]) +
              Math.abs(refData[ri + 1] - tgtData[ti + 1]) +
              Math.abs(refData[ri + 2] - tgtData[ti + 2]);
          }
        }
        const score = sad + (Math.abs(dx) + Math.abs(dy)) * 2.4;
        if (score < bestScore) {
          bestScore = score;
          bestDx = dx;
          bestDy = dy;
        }
      }
    }
    return { dx: bestDx, dy: bestDy };
  } catch {
    return null;
  }
}

const MOUTH_PATCH_WIDTH_MULT = 1.46;

function measurePoseMouthAnatomy(
  poseCanvas: HTMLCanvasElement,
  cfg: CharacterAnatomicalMouth,
  dx: number,
  dy: number,
  isCanonical: boolean
): PoseMouthAnatomy {
  const numCols = 48;
  const mouthW = Math.max(24, cfg.x2 - cfg.x1);
  const halfW = mouthW * 0.5;
  const patchHalfW = halfW * MOUTH_PATCH_WIDTH_MULT;
  const mouthMidX = (cfg.x1 + cfg.x2) * 0.5;
  const cx = mouthMidX + dx;
  const cy = cfg.cy + dy;
  const y1 = cfg.y1 + dy;
  const y2 = cfg.y2 + dy;
  const cornerAvgY = (y1 + y2) * 0.5;

  const srcUpperLipBotY = new Float32Array(numCols);
  const srcTeethBotY = new Float32Array(numCols);
  const srcLowerLipY = new Float32Array(numCols);

  const buildFallbackClosed = (): PoseMouthAnatomy => {
    for (let c = 0; c < numCols; c++) {
      const u = ((c + 0.5) / numCols) * 2 - 1;
      const m = Math.max(-1, Math.min(1, u * MOUTH_PATCH_WIDTH_MULT));
      const cornerSideY = m < 0 ? y1 : y2;
      const curveY = cy + (cornerSideY - cy) * (m * m);
      srcUpperLipBotY[c] = curveY;
      srcTeethBotY[c] = curveY;
      srcLowerLipY[c] = curveY + 1.0;
    }
    return { numCols, patchHalfW, hasTeeth: false, poseBaseOpen: 0, srcUpperLipBotY, srcTeethBotY, srcLowerLipY };
  };

  try {
    const ctx = poseCanvas.getContext('2d');
    if (!ctx) return buildFallbackClosed();

    const scanTop = Math.max(0, Math.round(Math.min(y1, y2, cy) - 12));
    const scanBot = Math.min(1023, Math.round(Math.max(y1, y2, cy) + 30));
    const scanH = scanBot - scanTop + 1;
    const scanLeft = Math.max(0, Math.round(cx - patchHalfW - 2));
    const scanRight = Math.min(1023, Math.round(cx + patchHalfW + 2));
    const scanW = scanRight - scanLeft + 1;
    if (scanW <= 8 || scanH <= 8) return buildFallbackClosed();

    const img = ctx.getImageData(scanLeft, scanTop, scanW, scanH).data;
    const sampleLumaAndSat = (pxAbs: number, pyAbs: number): { luma: number; sat: number; r: number; g: number } => {
      const lx = Math.max(0, Math.min(scanW - 1, Math.round(pxAbs) - scanLeft));
      const ly = Math.max(0, Math.min(scanH - 1, Math.round(pyAbs) - scanTop));
      const idx = (ly * scanW + lx) * 4;
      const r = img[idx];
      const g = img[idx + 1];
      const b = img[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      return { luma, sat, r, g };
    };

    const isTeethPixel = (luma: number, sat: number) => luma > 152 && sat < 64;

    // 1. Inspect central columns around cfg.cx to classify open/clenched teeth vs closed mouth
    const probeX = cfg.cx + dx;
    let centerHasTeeth = false;
    let centerMinTeethY = 9999;
    let centerMaxTeethY = -1;
    let centerMinDarkY = 9999;
    let centerMaxDarkY = -1;
    let darkestY = cy;
    let darkestLuma = 999;

    for (let y = Math.round(cy - 6); y <= Math.round(cy + 18); y++) {
      let lSum = 0;
      let sSum = 0;
      for (let ox = -4; ox <= 4; ox += 2) {
        const s = sampleLumaAndSat(probeX + ox, y);
        lSum += s.luma;
        sSum += s.sat;
      }
      const lAvg = lSum / 5;
      const sAvg = sSum / 5;
      if (lAvg < darkestLuma && y <= cy + 12) {
        darkestLuma = lAvg;
        darkestY = y;
      }
      if (isTeethPixel(lAvg, sAvg) && y >= cy - 5 && y <= cy + 14) {
        centerHasTeeth = true;
        if (y < centerMinTeethY) centerMinTeethY = y;
        if (y > centerMaxTeethY) centerMaxTeethY = y;
      }
      if (lAvg < 78 && y >= cy - 2 && y <= cy + 18) {
        if (y < centerMinDarkY) centerMinDarkY = y;
        if (y > centerMaxDarkY) centerMaxDarkY = y;
      }
    }

    const useCanonicalOpen =
      isCanonical &&
      (cfg.baseOpen ?? 0) > 0.08 &&
      cfg.lowerLipTopY !== undefined;

    const isOpenPose = useCanonicalOpen || centerHasTeeth || (centerMaxDarkY - centerMinDarkY >= 3 && !cfg.mustacheCover);

    if (!isOpenPose) {
      // Closed-mouth pose: lock strictly to the single darkest stomion line!
      const centerStomionY = Math.max(cy - 5, Math.min(cy + 7, darkestY));
      for (let c = 0; c < numCols; c++) {
        const u = ((c + 0.5) / numCols) * 2 - 1;
        const m = Math.max(-1, Math.min(1, u * MOUTH_PATCH_WIDTH_MULT));
        const cornerSideY = m < 0 ? y1 : y2;
        const curveY = centerStomionY + (cornerSideY - centerStomionY) * (m * m);
        srcUpperLipBotY[c] = curveY;
        srcTeethBotY[c] = curveY;
        srcLowerLipY[c] = curveY + 1.0;
      }
      return { numCols, patchHalfW, hasTeeth: false, poseBaseOpen: 0, srcUpperLipBotY, srcTeethBotY, srcLowerLipY };
    }

    // Open-smile / Clenched-teeth pose:
    // Cap upper teeth thickness strictly to anatomical upper incisors so clenched 2-row smiles (e.g. encourage/celebrate)
    // NEVER drag lower teeth into the upper slice or detach the lower lip!
    const canonicalUpperTeethH =
      cfg.upperLipBottomY !== undefined && cfg.teethBottomY !== undefined && cfg.teethBottomY > cfg.upperLipBottomY
        ? Math.min(7.5, Math.max(3.5, cfg.teethBottomY - cfg.upperLipBottomY))
        : 6.0;

    const cUpperLipY = useCanonicalOpen && cfg.upperLipBottomY !== undefined
      ? cfg.upperLipBottomY + dy
      : centerHasTeeth && centerMinTeethY < 9999
        ? Math.max(cy - 4, Math.min(cy + 4, centerMinTeethY - 0.6))
        : cy;

    const isClenchedTwoRowTeeth = centerHasTeeth && centerMaxDarkY < 0;
    const cTeethBotY = useCanonicalOpen && cfg.teethBottomY !== undefined
      ? cfg.teethBottomY + dy
      : centerHasTeeth
        ? Math.min(centerMaxTeethY + 0.4, cUpperLipY + canonicalUpperTeethH)
        : cUpperLipY + 1;

    let cLowerLipY = useCanonicalOpen && cfg.lowerLipTopY !== undefined
      ? cfg.lowerLipTopY + dy
      : centerMaxDarkY > 0
        ? Math.max(centerMaxDarkY + 1.2, centerMaxTeethY > 0 ? centerMaxTeethY + 1.0 : 0)
        : isClenchedTwoRowTeeth
          ? centerMaxTeethY + 1.6
          : cTeethBotY + 3.5;

    // Guarantee cLowerLipY at center is strictly below BOTH dark oral cavity AND any white lower teeth!
    for (let guard = 0; guard < 10; guard++) {
      const s = sampleLumaAndSat(probeX, cLowerLipY);
      if (s.luma >= 84 && !isTeethPixel(s.luma, s.sat)) break;
      cLowerLipY += 0.9;
    }

    for (let c = 0; c < numCols; c++) {
      const u = ((c + 0.5) / numCols) * 2 - 1;
      const colX = cx + u * patchHalfW;
      const m = u * MOUTH_PATCH_WIDTH_MULT;
      if (Math.abs(m) >= 1) {
        const sideY = m < 0 ? y1 : y2;
        srcUpperLipBotY[c] = sideY;
        srcTeethBotY[c] = sideY;
        srcLowerLipY[c] = sideY + 0.5;
        continue;
      }

      const cornerSideY = m < 0 ? y1 : y2;
      const arch = 1 - m * m;
      const baseCurveY = cornerSideY + (cUpperLipY - cornerSideY) * arch;
      const teethCurveY = cornerSideY + (cTeethBotY - cornerSideY) * arch;
      let lowerCurveY = cornerSideY + 0.8 + (cLowerLipY - cornerSideY - 0.8) * Math.pow(arch, 0.80);

      // Sub-pixel per-column dark oral slit & lower-teeth guard strictly tapered by arch so labial corner shadows NEVER cause a step/notch!
      if (Math.abs(m) < 0.80) {
        const maxSteps = Math.max(1, Math.round(9 * Math.max(0, 1 - (m / 0.80) * (m / 0.80))));
        for (let g = 0; g < maxSteps; g++) {
          const s = sampleLumaAndSat(colX, lowerCurveY);
          if (s.luma >= 84 && !isTeethPixel(s.luma, s.sat)) break;
          lowerCurveY += 0.85;
        }
      }

      // Smoothly clamp lowerCurveY to converge seamlessly into cornerSideY as |m| -> 1
      const maxCornerOffset = Math.max(0.8, (cLowerLipY - cornerSideY) * Math.pow(Math.max(0, arch), 0.72) + 2.4 * arch);
      lowerCurveY = Math.min(cornerSideY + maxCornerOffset, lowerCurveY);

      srcUpperLipBotY[c] = baseCurveY;
      srcTeethBotY[c] = Math.max(baseCurveY, teethCurveY);
      srcLowerLipY[c] = Math.max(srcTeethBotY[c] + 0.6, lowerCurveY);
    }

    // 5-tap Gaussian horizontal smoothing across all three curves so corners are 100% C2 silky smooth (zero corner steps!)
    const smooth5 = (arr: Float32Array) => {
      const out = new Float32Array(arr);
      for (let c = 2; c < numCols - 2; c++) {
        out[c] = 0.10 * arr[c - 2] + 0.22 * arr[c - 1] + 0.36 * arr[c] + 0.22 * arr[c + 1] + 0.10 * arr[c + 2];
      }
      arr.set(out);
    };
    smooth5(srcUpperLipBotY);
    smooth5(srcTeethBotY);
    smooth5(srcLowerLipY);
    for (let c = 0; c < numCols; c++) {
      srcTeethBotY[c] = Math.max(srcUpperLipBotY[c], srcTeethBotY[c]);
      srcLowerLipY[c] = Math.max(srcTeethBotY[c] + 0.5, srcLowerLipY[c]);
    }

    const measuredGap = Math.max(1, cLowerLipY - cUpperLipY);
    const poseBaseOpen = useCanonicalOpen
      ? (cfg.baseOpen ?? 0.28)
      : Math.min(0.44, Math.max(0.16, (measuredGap - Math.max(0, cornerAvgY - cy)) / 26));

    return {
      numCols,
      patchHalfW,
      hasTeeth: centerHasTeeth || useCanonicalOpen,
      poseBaseOpen,
      srcUpperLipBotY,
      srcTeethBotY,
      srcLowerLipY,
    };
  } catch {
    return buildFallbackClosed();
  }
}

interface LipSealPalette {
  upperLip: string;
  lowerLip: string;
  stomionLine: string;
}

function sampleLipSealPalette(
  canvas: HTMLCanvasElement,
  cx: number,
  cy: number,
  chinY: number,
  mustacheCover?: boolean
): LipSealPalette {
  const fallback: LipSealPalette = mustacheCover
    ? {
        upperLip: 'rgb(88, 52, 46)',
        lowerLip: 'rgb(148, 78, 72)',
        stomionLine: 'rgba(42, 16, 18, 0.88)',
      }
    : {
        upperLip: 'rgb(192, 92, 98)',
        lowerLip: 'rgb(206, 102, 108)',
        stomionLine: 'rgba(78, 22, 30, 0.85)',
      };
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return fallback;
    const jawSpan = Math.max(28, chinY - cy);
    // Sample lower lip vermilion slightly below stomion (avoiding white upper teeth!)
    const sampleY = Math.max(0, Math.min(1018, Math.round(cy + Math.min(14, jawSpan * 0.24))));
    const sampleX = Math.max(0, Math.min(1014, Math.round(cx - 5)));
    const data = ctx.getImageData(sampleX, sampleY, 10, 5).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      // Skip bright white tooth pixels if any
      if (data[i] > 225 && data[i + 1] > 215 && data[i + 2] > 205) continue;
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
      upperLip: `rgb(${Math.max(0, r - 12)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 8)})`,
      lowerLip: `rgb(${Math.min(255, r + 8)}, ${Math.min(255, g + 4)}, ${Math.min(255, b + 4)})`,
      stomionLine: `rgba(${Math.max(0, Math.round(r * 0.36))}, ${Math.max(0, Math.round(g * 0.24))}, ${Math.max(0, Math.round(b * 0.26))}, 0.86)`,
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

interface CachedProcessedPoseEntry {
  canvas: HTMLCanvasElement;
  eyeOffset?: PoseEyeOffset;
  mouthAnatomy?: PoseMouthAnatomy;
  refPupils?: { lx: number; ly: number; rx: number; ry: number } | null;
  eyelidSkin?: EyelidSkinPalette;
  lipSealPalette?: LipSealPalette;
}

const GLOBAL_PROCESSED_POSE_CACHE = new Map<string, CachedProcessedPoseEntry>();
const MAX_GLOBAL_PROCESSED_POSES = 180;

function putGlobalProcessedPose(key: string, entry: CachedProcessedPoseEntry): void {
  if (GLOBAL_PROCESSED_POSE_CACHE.has(key)) {
    GLOBAL_PROCESSED_POSE_CACHE.delete(key);
  } else if (GLOBAL_PROCESSED_POSE_CACHE.size >= MAX_GLOBAL_PROCESSED_POSES) {
    const oldest = GLOBAL_PROCESSED_POSE_CACHE.keys().next().value;
    if (oldest) GLOBAL_PROCESSED_POSE_CACHE.delete(oldest);
  }
  GLOBAL_PROCESSED_POSE_CACHE.set(key, entry);
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
  videoHasNativeLipSync = false,
  isGeographicSite = false,
  onLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const videoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Zero-allocation reusable scratch buffers for cinema-grade C2 feathered facial compositing at 60 FPS
  const blendFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouthPatchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const browPatchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const eyePatchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const poseEyeOffsetRef = useRef<Map<HTMLCanvasElement, PoseEyeOffset>>(new Map());
  const poseMouthAnatomyRef = useRef<Map<HTMLCanvasElement, PoseMouthAnatomy>>(new Map());
  const pendingVideoEyeSeedRef = useRef<PoseEyeOffset | null>(null);
  const refPupilsRef = useRef<{ lx: number; ly: number; rx: number; ry: number } | null>(null);
  const canonicalPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const speechStartMsRef = useRef<number>(0);
  const lipSealPaletteRef = useRef<LipSealPalette>({
    upperLip: 'rgb(192, 92, 98)',
    lowerLip: 'rgb(206, 102, 108)',
    stomionLine: 'rgba(78, 22, 30, 0.85)',
  });
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
  const videoHasNativeLipSyncRef = useRef(videoHasNativeLipSync);
  const isGeographicSiteRef = useRef(isGeographicSite);
  const onResolvedGestureChangeRef = useRef(onResolvedGestureChange);

  const prevPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currPoseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionStartRef = useRef<number>(0);
  const forceBlinkRef = useRef<boolean>(false);

  useEffect(() => {
    if (isSpeaking && !isSpeakingRef.current) {
      speechStartMsRef.current = performance.now();
    }
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
    speechStartMsRef.current = performance.now();
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
    videoHasNativeLipSyncRef.current = videoHasNativeLipSync;
  }, [videoHasNativeLipSync]);

  useEffect(() => {
    isGeographicSiteRef.current = isGeographicSite;
  }, [isGeographicSite]);

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
      const cfg = resolvedConfig;
      const ctx = poseCanvas.getContext('2d');
      if (!ctx) return;

      if (isBlinkSprite) {
        if (
          canonicalPoseCanvasRef.current &&
          cfg.leftEyeX &&
          cfg.rightEyeX &&
          (cfg.leftEyeY || cfg.eyeY)
        ) {
          const blinkShift = computeBlinkSpriteBridgeShift(
            canonicalPoseCanvasRef.current,
            poseCanvas,
            cfg.leftEyeX,
            cfg.leftEyeY ?? cfg.eyeY ?? 260,
            cfg.rightEyeX,
            cfg.rightEyeY ?? cfg.eyeY ?? 260,
            cfg.cy
          );
          if (blinkShift) {
            poseEyeOffsetRef.current.set(poseCanvas, {
              dxL: blinkShift.dx,
              dyL: blinkShift.dy,
              dxR: blinkShift.dx,
              dyR: blinkShift.dy,
            });
            return;
          }
        }
        poseEyeOffsetRef.current.set(poseCanvas, { dxL: 0, dyL: 0, dxR: 0, dyR: 0 });
        return;
      }

      if (!cfg.leftEyeX || !cfg.rightEyeX || !(cfg.leftEyeY || cfg.eyeY)) {
        poseEyeOffsetRef.current.set(poseCanvas, { dxL: 0, dyL: 0, dxR: 0, dyR: 0 });
        poseMouthAnatomyRef.current.set(
          poseCanvas,
          measurePoseMouthAnatomy(poseCanvas, cfg, 0, 0, isCanonical)
        );
        return;
      }

      const lx = cfg.leftEyeX;
      const ly = cfg.leftEyeY ?? cfg.eyeY ?? 260;
      const rx = cfg.rightEyeX;
      const ry = cfg.rightEyeY ?? cfg.eyeY ?? 260;
      const eRx = cfg.eyeRx ?? cfg.eyeRadius ?? 30;
      const eRy = cfg.eyeRy ?? cfg.eyeRadius ?? 28;

      if (isCanonical || !canonicalPoseCanvasRef.current) {
        canonicalPoseCanvasRef.current = poseCanvas;
        const pL = measureDarkPupilCenter(ctx, lx, ly, eRx, eRy);
        const pR = measureDarkPupilCenter(ctx, rx, ry, eRx, eRy);
        if (pL && pR) {
          refPupilsRef.current = { lx: pL.x, ly: pL.y, rx: pR.x, ry: pR.y };
        }
        poseEyeOffsetRef.current.set(poseCanvas, { dxL: 0, dyL: 0, dxR: 0, dyR: 0 });
        poseMouthAnatomyRef.current.set(
          poseCanvas,
          measurePoseMouthAnatomy(poseCanvas, cfg, 0, 0, true)
        );
        eyelidSkinRef.current = sampleEyelidSkinPalette(poseCanvas, lx, ly, eRy);
        lipSealPaletteRef.current = sampleLipSealPalette(
          poseCanvas,
          cfg.cx,
          cfg.cy,
          cfg.chinY ?? cfg.cy + 56,
          cfg.mustacheCover
        );
        return;
      }

      // Upper-Face Bridge 2D SAD Alignment (strictly above mouth so open/closed pose smiles never bias shift!)
      const bridgeShift = computeUpperFaceBridgeShift(
        canonicalPoseCanvasRef.current,
        poseCanvas,
        lx,
        ly,
        rx,
        ry,
        cfg.cy
      );

      if (bridgeShift) {
        poseEyeOffsetRef.current.set(poseCanvas, {
          dxL: bridgeShift.dx,
          dyL: bridgeShift.dy,
          dxR: bridgeShift.dx,
          dyR: bridgeShift.dy,
        });
        poseMouthAnatomyRef.current.set(
          poseCanvas,
          measurePoseMouthAnatomy(poseCanvas, cfg, bridgeShift.dx, bridgeShift.dy, false)
        );
        return;
      }

      const pL = measureDarkPupilCenter(ctx, lx, ly, eRx, eRy);
      const pR = measureDarkPupilCenter(ctx, rx, ry, eRx, eRy);
      let dx = 0;
      let dy = 0;
      if (pL && pR && refPupilsRef.current) {
        const ref = refPupilsRef.current;
        const clampShift = (v: number) => Math.max(-26, Math.min(26, v));
        const dxL = clampShift(pL.x - ref.lx);
        const dyL = clampShift(pL.y - ref.ly);
        const dxR = clampShift(pR.x - ref.rx);
        const dyR = clampShift(pR.y - ref.ry);
        dx = (dxL + dxR) * 0.5;
        dy = (dyL + dyR) * 0.5;
        poseEyeOffsetRef.current.set(poseCanvas, { dxL, dyL, dxR, dyR });
      }
      poseMouthAnatomyRef.current.set(
        poseCanvas,
        measurePoseMouthAnatomy(poseCanvas, cfg, dx, dy, false)
      );
    },
    [resolvedConfig]
  );

  // Helper to load an image URL into a 1024x1024 offscreen canvas and cache it globally across mounts
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  const loadPoseToCanvas = React.useCallback(
    (src: string, onDone?: (canvas: HTMLCanvasElement) => void, isCanonical = false, isBlinkSprite = false) => {
      if (!src) return;
      const cached = poseCacheRef.current.get(src);
      if (cached) {
        onDone?.(cached);
        return;
      }

      const globalKey = `${characterId || imageSrc}::${isCanonical ? 'canon' : isBlinkSprite ? 'blink' : 'pose'}::${src}`;
      const globalHit = GLOBAL_PROCESSED_POSE_CACHE.get(globalKey);
      if (globalHit) {
        poseCacheRef.current.set(src, globalHit.canvas);
        if (isCanonical || !canonicalPoseCanvasRef.current) {
          canonicalPoseCanvasRef.current = globalHit.canvas;
          if (globalHit.refPupils) refPupilsRef.current = globalHit.refPupils;
          if (globalHit.eyelidSkin) eyelidSkinRef.current = globalHit.eyelidSkin;
          if (globalHit.lipSealPalette) lipSealPaletteRef.current = globalHit.lipSealPalette;
        }
        if (globalHit.eyeOffset) {
          poseEyeOffsetRef.current.set(globalHit.canvas, globalHit.eyeOffset);
        }
        if (globalHit.mouthAnatomy) {
          poseMouthAnatomyRef.current.set(globalHit.canvas, globalHit.mouthAnatomy);
        }
        onDone?.(globalHit.canvas);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = 1024;
        off.height = 1024;
        const octx = off.getContext('2d', { willReadFrequently: true }) || off.getContext('2d');
        if (octx) {
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = 'high';
          octx.drawImage(img, 0, 0, 1024, 1024);
        }
        poseCacheRef.current.set(src, off);
        registerPoseEyeAlignment(off, isCanonical, isBlinkSprite);
        putGlobalProcessedPose(globalKey, {
          canvas: off,
          eyeOffset: poseEyeOffsetRef.current.get(off),
          mouthAnatomy: poseMouthAnatomyRef.current.get(off),
          refPupils: isCanonical ? refPupilsRef.current : undefined,
          eyelidSkin: isCanonical ? eyelidSkinRef.current : undefined,
          lipSealPalette: isCanonical ? lipSealPaletteRef.current : undefined,
        });
        onDone?.(off);
      };
      img.onerror = () => {
        if (fallbackImageSrc && src !== fallbackImageSrc) {
          loadPoseToCanvas(fallbackImageSrc, onDone, isCanonical, isBlinkSprite);
        }
      };
      img.src = src;
    },
    [characterId, imageSrc, fallbackImageSrc, registerPoseEyeAlignment]
  );

  // Helper to obtain an LRU-bounded cached <video> element (max 3 active decoders per tab)
  const getOrCreatePooledVideo = React.useCallback((url: string): HTMLVideoElement => {
    const pool = videoPoolRef.current;
    const existing = pool.get(url);
    if (existing) {
      pool.delete(url);
      pool.set(url, existing);
      if (!existing.getAttribute('src') || existing.networkState === 3) {
        existing.src = url;
        existing.load();
      }
      return existing;
    }

    while (pool.size >= 3) {
      let victimKey: string | undefined;
      for (const k of pool.keys()) {
        if (k !== activeVideoUrlRef.current && k !== url) {
          victimKey = k;
          break;
        }
      }
      if (!victimKey) {
        for (const k of pool.keys()) {
          if (k !== url) {
            victimKey = k;
            break;
          }
        }
      }
      if (!victimKey) break;
      const victim = pool.get(victimKey);
      if (victim) {
        victim.onloadeddata = null;
        victim.oncanplay = null;
        victim.onerror = null;
        victim.pause();
        victim.removeAttribute('src');
        victim.load();
      }
      pool.delete(victimKey);
    }

    const vid = document.createElement('video');
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.preload = 'auto';
    vid.src = url;
    vid.load();
    pool.set(url, vid);
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
      if (
        activeVideoUrlRef.current === targetVideoUrl &&
        videoElementRef.current &&
        videoElementRef.current.getAttribute('src') === targetVideoUrl &&
        videoElementRef.current.networkState !== 3
      ) {
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
      vid.playbackRate = isSpeakingRef.current ? 1.12 : 0.98;

      if (vid.readyState >= 2) {
        vid.onloadeddata = null;
        vid.oncanplay = null;
        videoReadyRef.current = true;
        if (vid.currentTime > 0.12) {
          try {
            vid.currentTime = 0;
          } catch {}
        }
        vid.play().catch(() => {});
      } else {
        videoReadyRef.current = false;
        const markReady = () => {
          vid.onloadeddata = null;
          vid.oncanplay = null;
          if (activeVideoUrlRef.current === targetVideoUrl) {
            videoReadyRef.current = true;
            vid.play().catch(() => {});
          }
        };
        vid.onloadeddata = markReady;
        vid.oncanplay = markReady;
        vid.onerror = () => {
          vid.onloadeddata = null;
          vid.oncanplay = null;
          if (activeVideoUrlRef.current === targetVideoUrl) {
            videoReadyRef.current = false;
          }
        };
      }
    },
    [getOrCreatePooledVideo]
  );

  // Preload canonical image immediately + time-slice secondary poseCompendium in idle frames (zero LongTasks!)
  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;
    let idleTimerId: ReturnType<typeof setTimeout> | null = null;
    refPupilsRef.current = null;

    const enqueueSecondaryPoses = () => {
      if (cancelled || !poseCompendium) return;
      const entries = Object.entries(poseCompendium).filter(
        ([, url]) => Boolean(url) && url !== imageSrc
      ) as Array<[string, string]>;
      let idx = 0;

      const stepNext = () => {
        if (cancelled || idx >= entries.length) return;
        const w = typeof window !== 'undefined'
          ? (window as unknown as { __iskoolVoiceSynthesisPending?: boolean })
          : undefined;
        if (w?.__iskoolVoiceSynthesisPending) {
          idleTimerId = setTimeout(stepNext, 60);
          return;
        }
        const [key, url] = entries[idx++];
        loadPoseToCanvas(
          url,
          () => {
            if (!cancelled) {
              idleTimerId = setTimeout(stepNext, 20);
            }
          },
          false,
          key === 'blink'
        );
      };

      idleTimerId = setTimeout(stepNext, 24);
    };

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
        onLoadRef.current?.();
        enqueueSecondaryPoses();
      },
      true,
      false
    );

    return () => {
      cancelled = true;
      if (idleTimerId) clearTimeout(idleTimerId);
    };
  }, [imageSrc, poseCompendium, loadPoseToCanvas]);

  // Cleanup pooled video elements on unmount
  useEffect(() => {
    const pool = videoPoolRef.current;
    return () => {
      pool.forEach((v) => {
        v.onloadeddata = null;
        v.oncanplay = null;
        v.onerror = null;
        v.pause();
        v.removeAttribute('src');
        v.load();
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
      const cachedTarget = poseCacheRef.current.get(targetUrl);
      const targetCanvas = cachedTarget || offscreenRef.current;

      if (!cachedTarget && targetUrl && targetUrl !== imageSrc) {
        loadPoseToCanvas(
          targetUrl,
          (loadedCanvas) => {
            if (resolvedGestureRef.current === gesture) {
              prevPoseCanvasRef.current = currPoseCanvasRef.current;
              currPoseCanvasRef.current = loadedCanvas;
              transitionStartRef.current = performance.now();
            }
          },
          false,
          false
        );
      }

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
        pendingVideoEyeSeedRef.current = poseEyeOffsetRef.current.get(targetCanvas) || {
          dxL: 0,
          dyL: 0,
          dxR: 0,
          dyR: 0,
        };
      }

      // For 3D multi-pose compendium rigs, render crisp 1024x1024 3D poses + 60 FPS real-time formant lip-sync
      // without un-synced .mp4 mouth loops fighting the anatomical mouth rig or opening while silent.
      const has3DCompendium = Boolean(compendium && Object.keys(compendium).length > 0);
      const gMap = gestureVideoMapRef.current;
      const masterVid = videoSrcRef.current;
      if (has3DCompendium || gesture === 'listen') {
        loadActiveVideoStream(undefined);
      } else if (isSpeakingRef.current && activeGestureRef.current === 'auto' && masterVid) {
        loadActiveVideoStream(masterVid);
      } else if (gMap && gMap[gesture]) {
        loadActiveVideoStream(gMap[gesture]);
      } else if (!gMap && masterVid && isSpeakingRef.current && (gesture === 'welcome' || gesture === 'explain' || gesture === 'exclaim')) {
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

    if (isGeographicSiteRef.current) {
      switchToGesturePose('welcome', now);
      return;
    }

    if (activeGesture !== 'auto') {
      switchToGesturePose(activeGesture, now);
      return;
    }

    if (!isSpeaking) {
      if (poseCompendiumRef.current) {
        switchToGesturePose('welcome', now);
        return;
      }
      if (gestureVideoMapRef.current?.calm) {
        switchToGesturePose('calm', now);
        return;
      }
      switchToGesturePose('welcome', now);
      return;
    }

    const rawSequence = buildContextualMovementSequence(spokenText || '');
    const compendium = poseCompendiumRef.current;
    const gMap = gestureVideoMapRef.current;

    const availableSequence = rawSequence.filter((g) =>
      Boolean(compendium?.[g] || gMap?.[g] || g === 'welcome')
    );
    const cycleSequence: ConcreteAvatarGesture[] =
      availableSequence.length > 0 ? availableSequence : ['welcome'];

    let step = 0;
    switchToGesturePose(cycleSequence[0], now);

    const timer = setInterval(() => {
      if (activeGestureRef.current !== 'auto') return;
      step = (step + 1) % cycleSequence.length;
      switchToGesturePose(cycleSequence[step], performance.now());
    }, 3400);

    return () => clearInterval(timer);
  }, [activeGesture, isSpeaking, spokenText, switchToGesturePose, videoSrc, gestureVideoMap, isGeographicSite, videoHasNativeLipSync]);

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

    const liveVideoEyeOffset = { dxL: 0, dyL: 0, dxR: 0, dyR: 0 };
    let videoTrackTick = 0;

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

          if (pendingVideoEyeSeedRef.current) {
            liveVideoEyeOffset.dxL = pendingVideoEyeSeedRef.current.dxL;
            liveVideoEyeOffset.dyL = pendingVideoEyeSeedRef.current.dyL;
            liveVideoEyeOffset.dxR = pendingVideoEyeSeedRef.current.dxR;
            liveVideoEyeOffset.dyR = pendingVideoEyeSeedRef.current.dyR;
            pendingVideoEyeSeedRef.current = null;
          }

          // Lightweight pupil center tracking over non-native .mp4 motion loops (every 2 frames when eyes open)
          if (
            !videoHasNativeLipSyncRef.current &&
            !isGeographicSiteRef.current &&
            spring.blink < 0.15 &&
            resolvedConfig.leftEyeX &&
            resolvedConfig.rightEyeX &&
            refPupilsRef.current &&
            videoTrackTick++ % 2 === 0
          ) {
            const lx = resolvedConfig.leftEyeX;
            const ly = resolvedConfig.leftEyeY ?? resolvedConfig.eyeY ?? 260;
            const rx = resolvedConfig.rightEyeX;
            const ry = resolvedConfig.rightEyeY ?? resolvedConfig.eyeY ?? 260;
            const eRx = resolvedConfig.eyeRx ?? resolvedConfig.eyeRadius ?? 28;
            const eRy = resolvedConfig.eyeRy ?? resolvedConfig.eyeRadius ?? 24;
            const pL = measureDarkPupilCenter(vCtx, lx, ly, eRx, eRy);
            const pR = measureDarkPupilCenter(vCtx, rx, ry, eRx, eRy);
            if (pL && pR) {
              const ref = refPupilsRef.current;
              const clampVideoShift = (val: number) => Math.max(-26, Math.min(26, val));
              const alpha = 0.35;
              liveVideoEyeOffset.dxL = liveVideoEyeOffset.dxL * (1 - alpha) + clampVideoShift(pL.x - ref.lx) * alpha;
              liveVideoEyeOffset.dyL = liveVideoEyeOffset.dyL * (1 - alpha) + clampVideoShift(pL.y - ref.ly) * alpha;
              liveVideoEyeOffset.dxR = liveVideoEyeOffset.dxR * (1 - alpha) + clampVideoShift(pR.x - ref.rx) * alpha;
              liveVideoEyeOffset.dyR = liveVideoEyeOffset.dyR * (1 - alpha) + clampVideoShift(pR.y - ref.ry) * alpha;
            }
          }
        }
      }

      if (!hasLiveVideoFrame) {
        liveVideoEyeOffset.dxL *= 0.85;
        liveVideoEyeOffset.dyL *= 0.85;
        liveVideoEyeOffset.dxR *= 0.85;
        liveVideoEyeOffset.dyR *= 0.85;
      }

      const staticPoseOff = currPoseCanvasRef.current || offscreenRef.current;
      const baseOff = hasLiveVideoFrame && vOff ? vOff : staticPoseOff;
      if (!baseOff) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const cfg = resolvedConfig;
      const speaking = isSpeakingRef.current;
      const currentGesture = resolvedGestureRef.current;
      const tSec = now * 0.001;

      const activeStaticAnatomy = staticPoseOff
        ? poseMouthAnatomyRef.current.get(staticPoseOff)
        : undefined;
      const effectiveBaseOpen = activeStaticAnatomy
        ? activeStaticAnatomy.poseBaseOpen
        : (cfg.baseOpen ?? 0);
      const audiblySpeaking =
        speaking && (isVoiceAudiblySpeaking() || externalOpenRef.current > 0.03);

      let targetOpen = effectiveBaseOpen;
      let targetSpread = 0;
      let targetTongue = 0.22;

      if (audiblySpeaking) {
        const formants = getVoiceFormantLevels();
        const extOpen = externalOpenRef.current;
        const extSpread = externalSpreadRef.current;

        // Advance through weighted viseme tokens anchored to speech start time
        const tokens = visemeTokensRef.current;
        const elapsedSpeechSec = Math.max(0, (now - speechStartMsRef.current) * 0.001);
        let totalWeight = 0;
        for (let ti = 0; ti < tokens.length; ti++) {
          totalWeight += tokens[ti].durationWeight || 0.7;
        }
        const safeTotalWeight = Math.max(0.5, totalWeight);
        const cursorWeight = (elapsedSpeechSec * 7.8) % safeTotalWeight;
        let accum = 0;
        let tok = tokens[0] || { open: 0.5, spread: 0, tongue: 0.3, bilabial: false, durationWeight: 1 };
        for (let ti = 0; ti < tokens.length; ti++) {
          accum += tokens[ti].durationWeight || 0.7;
          if (cursorWeight <= accum) {
            tok = tokens[ti];
            break;
          }
        }

        const sylMod = 0.84 + 0.22 * Math.sin(elapsedSpeechSec * 15.2);
        const oscOpen = tok.bilabial ? 0.0 : Math.min(0.98, tok.open * sylMod);
        const oscSpread = tok.spread + 0.07 * Math.sin(elapsedSpeechSec * 8.4);
        const oscTongue = tok.tongue;

        if (formants.audioGraphActive) {
          // Real-time Web Audio DSP formant tracking: closes naturally on pauses/commas!
          if (formants.rms <= 0.012 || formants.bilabial) {
            targetOpen = 0.0;
            targetSpread = formants.bilabial ? -0.14 : 0;
            targetTongue = 0.2;
          } else if (tok.bilabial && formants.rms < 0.065) {
            targetOpen = 0.0;
            targetSpread = -0.12;
            targetTongue = 0.2;
          } else {
            const formantOpen = Math.min(0.98, Math.max(0.18, formants.open * 1.28));
            targetOpen = Math.min(0.98, formantOpen * 0.72 + oscOpen * 0.28);
            targetSpread = (formants.spread - formants.rounded * 0.85) * 0.52 + oscSpread * 0.30;
            targetTongue = formants.alveolar ? 0.90 : oscTongue;
          }
        } else if (extOpen > 0.03) {
          if (tok.bilabial) {
            targetOpen = 0.0;
            targetSpread = -0.12;
          } else {
            targetOpen = Math.min(0.98, Math.max(0.22, extOpen * 1.25) * 0.62 + oscOpen * 0.38);
            targetSpread = extSpread * 0.55 + oscSpread * 0.45;
            targetTongue = oscTongue;
          }
        } else {
          // Punctuation-aware phoneme sequencer fallback (when WebAudio graph is bypassed)
          targetOpen = oscOpen;
          targetSpread = oscSpread;
          targetTongue = oscTongue;
        }

        if (targetOpen > 0.05) {
          if (currentGesture === 'exclaim' || currentGesture === 'celebrate') {
            targetOpen = Math.min(1.0, targetOpen * 1.14);
            targetSpread = Math.max(targetSpread, 0.16);
          } else if (currentGesture === 'pronounce') {
            targetOpen = Math.min(1.0, targetOpen * 1.20);
            targetSpread = targetSpread * 1.22;
          }
        }
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

      // Eye gaze micro-saccades (physiological amplitude scaled to eye size inside Render Stage 10B)
      if (now >= nextSaccadeAt) {
        nextSaccadeAt = now + 1150 + Math.random() * 1650;
        targetSaccadeX = currentGesture === 'point' ? -0.78 + (Math.random() - 0.5) * 0.35 : (Math.random() - 0.5) * 1.65;
        targetSaccadeY = (Math.random() - 0.5) * 1.1;
      }
      spring.saccadeX += (targetSaccadeX - spring.saccadeX) * Math.min(1, dt * 11);
      spring.saccadeY += (targetSaccadeY - spring.saccadeY) * Math.min(1, dt * 11);

      // Helper for zero-allocation reusable offscreen scratch canvases
      const ensureScratchCanvas = (
        ref: React.MutableRefObject<HTMLCanvasElement | null>,
        w: number,
        h: number
      ): HTMLCanvasElement => {
        if (!ref.current) {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          ref.current = c;
        } else if (ref.current.width < w || ref.current.height < h) {
          ref.current.width = Math.max(ref.current.width, w);
          ref.current.height = Math.max(ref.current.height, h);
        }
        return ref.current;
      };

      // =======================================================================
      // 5. FOREGROUND-DECOUPLED 3D COMPOSITOR (BACKGROUND & HANDS 100% UNDISTORTED)
      // =======================================================================
      ctx.save();
      ctx.clearRect(0, 0, 1024, 1024);

      if (enableSmartBustCrop && cfg.bustCrop) {
        const { focusX, focusY, zoom } = cfg.bustCrop;
        // Clamp focus strictly inside zoomed bounds so the portrait fills 100% of the 1024x1024 viewport with zero blank top/side bars
        const minFocus = zoom > 1 ? 512 / zoom : 512;
        const maxFocus = zoom > 1 ? 1024 - 512 / zoom : 512;
        const clampedFocusX = Math.max(minFocus, Math.min(maxFocus, focusX));
        const clampedFocusY = Math.max(minFocus, Math.min(maxFocus, focusY));
        ctx.translate(512, 512);
        ctx.scale(zoom, zoom);
        ctx.translate(-clampedFocusX, -clampedFocusY);
      }

      // IMPORTANT: Never swap the full 1024x1024 body to blinkPoseCanvas (prevents arm/mouth teleportation!)
      const activeFrameCanvas = baseOff;

      // LAYER 0: Locked Static Background
      const staticBgRef = offscreenRef.current || activeFrameCanvas;
      ctx.globalAlpha = 1;
      ctx.drawImage(staticBgRef, 0, 0, 1024, 1024);

      // LAYER 1: Active 3D Video Stream or High-Precision 3D Pose with Unified 200ms Cross-Dissolve
      // (Composites prevPose + currPose into blendFrameCanvas FIRST so facial rig never ghosts during transitions!)
      const transElapsed = now - transitionStartRef.current;
      const TRANS_DURATION = 200;
      const isCrossDissolving = Boolean(
        prevPoseCanvasRef.current &&
          prevPoseCanvasRef.current !== activeFrameCanvas &&
          transElapsed < TRANS_DURATION
      );

      // Subtle 60 FPS organic chest/head breathing on static 3D pose rigs (100% locked to landmarks)
      const subtleBreathY =
        !hasLiveVideoFrame && !isGeographicSiteRef.current
          ? Math.sin(tSec * (audiblySpeaking ? 2.4 : 1.55)) * (audiblySpeaking ? 1.55 : 0.95)
          : 0;

      let renderSourceCanvas: HTMLCanvasElement = activeFrameCanvas;
      if (isCrossDissolving && prevPoseCanvasRef.current) {
        const alpha = Math.min(1, Math.max(0, transElapsed / TRANS_DURATION));
        const smoothAlpha = alpha * alpha * (3 - 2 * alpha);
        const blendCanvas = ensureScratchCanvas(blendFrameCanvasRef, 1024, 1024);
        const bCtx = blendCanvas.getContext('2d');
        if (bCtx) {
          bCtx.clearRect(0, 0, 1024, 1024);
          bCtx.globalAlpha = 1;
          bCtx.drawImage(prevPoseCanvasRef.current, 0, 0, 1024, 1024);
          bCtx.globalAlpha = smoothAlpha;
          bCtx.drawImage(activeFrameCanvas, 0, 0, 1024, 1024);
          bCtx.globalAlpha = 1;
          renderSourceCanvas = blendCanvas;
          ctx.drawImage(blendCanvas, 0, subtleBreathY, 1024, 1024);
        } else {
          ctx.drawImage(prevPoseCanvasRef.current, 0, subtleBreathY, 1024, 1024);
          ctx.globalAlpha = smoothAlpha;
          ctx.drawImage(activeFrameCanvas, 0, subtleBreathY, 1024, 1024);
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.drawImage(activeFrameCanvas, 0, subtleBreathY, 1024, 1024);
      }

      const mouthW = cfg.x2 - cfg.x1;
      const halfW = mouthW * 0.5;
      const chinY = cfg.chinY ?? cfg.cy + Math.max(48, mouthW * 0.85);
      const headShiftX = 0;
      const headShiftY = subtleBreathY / 0.72;

      // Compute active 3D-tracked facial landmarks for all rigs EXCEPT native-lip-sync 3D videos and geographic sites
      const shouldRenderFacialRig =
        !isGeographicSiteRef.current &&
        !(hasLiveVideoFrame && videoHasNativeLipSyncRef.current);

      if (shouldRenderFacialRig) {
        const poseOffsets = hasLiveVideoFrame
          ? liveVideoEyeOffset
          : poseEyeOffsetRef.current.get(activeFrameCanvas) || {
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

        // 8 & 9. Cinema-Grade Feathered Parabolic-Mandible 3D Mouth Shader
        //        (0.00% Horizontal Beard/Collar Cut Seams, Organic Soft Feathering, Recessed 3D Oral Cavity)
        if (audiblySpeaking) {
          let anatomy = !hasLiveVideoFrame
            ? poseMouthAnatomyRef.current.get(activeFrameCanvas)
            : undefined;
          if (!anatomy) {
            anatomy = measurePoseMouthAnatomy(
              activeFrameCanvas,
              cfg,
              avgPoseDx,
              avgPoseDy,
              activeFrameCanvas === canonicalPoseCanvasRef.current
            );
            if (!hasLiveVideoFrame) {
              poseMouthAnatomyRef.current.set(activeFrameCanvas, anatomy);
            }
          }

          const numCols = anatomy.numCols;
          const patchHalfW = anatomy.patchHalfW;
          const patchW = patchHalfW * 2;
          const colW = patchW / numCols;
          const mouthMidX = (cfg.x1 + cfg.x2) * 0.5;
          const srcMouthCx = mouthMidX + avgPoseDx;
          const dstMouthMidX = mouthMidX + activeHeadOffsetX;
          const srcMouthMidY = cfg.cy + avgPoseDy;
          const srcPatchLeft = srcMouthCx - patchHalfW;

          const srcMinLipY = Math.min(cfg.y1, cfg.y2, cfg.cy) + avgPoseDy;
          const srcChinBotY = Math.max(srcMinLipY + 26, chinY + avgPoseDy);
          const jawSpan = srcChinBotY - srcMouthMidY;
          const srcAnchorTopY = Math.max(0, srcMinLipY - Math.max(18, jawSpan * 0.36));
          const srcAnchorBotY = Math.min(1022, srcChinBotY);

          const maxGapPx = Math.min(20, Math.max(11, cfg.maxOpening * 1.22, jawSpan * 0.34));
          const desiredCenterGapPx = Math.max(0, Math.min(maxGapPx, spring.open * maxGapPx));
          const spreadScale = 1 + spring.spread * 0.14;

          const dstColCenterX = new Float32Array(numCols);
          const dstUpperCurveY = new Float32Array(numCols);
          const dstLowerCurveY = new Float32Array(numCols);
          let firstMouthCol = -1;
          let lastMouthCol = -1;

          // Prepare feathered offscreen mandible scratch buffer in exact 1024-space coordinates
          const padX = 14;
          const padY = 12;
          const patchBoxLeft = Math.floor(dstMouthMidX - patchHalfW - padX);
          const patchBoxTop = Math.floor(srcAnchorTopY + subtleBreathY - padY);
          const patchBoxW = Math.ceil(patchW + padX * 2);
          const patchBoxH = Math.ceil(srcAnchorBotY - srcAnchorTopY + padY * 2);
          const mCanvas = ensureScratchCanvas(mouthPatchCanvasRef, Math.max(256, patchBoxW), Math.max(256, patchBoxH));
          const mCtx = mCanvas.getContext('2d');

          if (mCtx) {
            mCtx.save();
            mCtx.globalCompositeOperation = 'source-over';
            mCtx.globalAlpha = 1;
            mCtx.clearRect(0, 0, patchBoxW, patchBoxH);
            mCtx.translate(-patchBoxLeft, -patchBoxTop);

            // Seed scratch buffer with exact unwarped surrounding skin/beard so parabolic taper blends cleanly
            mCtx.drawImage(
              renderSourceCanvas,
              Math.max(0, patchBoxLeft),
              Math.max(0, patchBoxTop - subtleBreathY),
              patchBoxW,
              patchBoxH,
              Math.max(0, patchBoxLeft),
              Math.max(0, patchBoxTop),
              patchBoxW,
              patchBoxH
            );

            // STEP A: Continuous Monotonic Upper-Lip & Parabolic-Jaw Mandible Column Slices
            //         Parabolic colAnchorBotY(u) tapers upward along the anatomical jawline, NEVER cutting collars or beards!
            for (let c = 0; c < numCols; c++) {
              const u = ((c + 0.5) / numCols) * 2 - 1; // -1 .. +1 across patch
              const m = u * MOUTH_PATCH_WIDTH_MULT; // -1 .. +1 strictly between true mouth corners x1..x2
              const cheekTaper = Math.pow(Math.max(0, Math.cos(u * Math.PI * 0.5)), 1.65);
              const jawOval = Math.pow(Math.max(0, 1 - u * u * 0.88), 0.62);
              const colAnchorTopY = Math.max(0, srcMinLipY - Math.max(15, jawSpan * (0.24 + 0.12 * jawOval)));
              const colAnchorBotY = Math.min(1022, srcMouthMidY + Math.max(18, jawSpan * (0.48 + 0.52 * jawOval)));

              const srcX = srcPatchLeft + c * colW;
              const relCenterX = srcX + colW * 0.5 - srcMouthCx;
              const localScaleX = 1 + (spreadScale - 1) * cheekTaper;
              const dstW = colW * localScaleX;
              const dstCenterX = dstMouthMidX + relCenterX * localScaleX;
              const dstX = dstCenterX - dstW * 0.5;
              dstColCenterX[c] = dstCenterX;

              const insideMouth = Math.abs(m) < 0.96;
              if (insideMouth) {
                if (firstMouthCol < 0) firstMouthCol = c;
                lastMouthCol = c;
              }

              const normM = m / 0.96;
              const apertureProfile = insideMouth
                ? Math.pow(Math.max(0, Math.cos(normM * Math.PI * 0.5)), 1.35)
                : 0;

              const sUpperLipY = anatomy.srcUpperLipBotY[c];
              const sTeethBotY = anatomy.srcTeethBotY[c];
              const sLowerLipY = anatomy.srcLowerLipY[c];
              const nativeGap = insideMouth ? Math.max(0, sLowerLipY - sTeethBotY) : 0;
              const targetGap = desiredCenterGapPx * apertureProfile;

              let srcUpperEnd: number;
              let dstUpperEnd: number;
              let dstLowerStart: number;

              if (targetGap >= nativeGap) {
                const extraGap = targetGap - nativeGap;
                const upperLift = cfg.mustacheCover
                  ? 0
                  : Math.min(2.0, extraGap * 0.11) * apertureProfile;
                srcUpperEnd = sTeethBotY;
                dstUpperEnd = sTeethBotY + subtleBreathY - upperLift;
                dstLowerStart = dstUpperEnd + targetGap;
              } else {
                const closeBlend = nativeGap > 0.15
                  ? Math.min(1, (nativeGap - targetGap) / nativeGap)
                  : 0;
                srcUpperEnd = sTeethBotY * (1 - closeBlend) + sUpperLipY * closeBlend;
                const meetY = sUpperLipY * 0.42 + sLowerLipY * 0.58 + subtleBreathY;
                dstUpperEnd =
                  (sTeethBotY + subtleBreathY) * (1 - closeBlend) +
                  (meetY - targetGap * 0.45) * closeBlend;
                dstLowerStart =
                  (sLowerLipY + subtleBreathY) * (1 - closeBlend) +
                  (meetY + targetGap * 0.55) * closeBlend;
              }

              // Clamp dstLowerStart strictly above parabolic jawline contour
              dstLowerStart = Math.min(colAnchorBotY + subtleBreathY - 4, dstLowerStart);
              dstUpperCurveY[c] = dstUpperEnd;
              dstLowerCurveY[c] = dstLowerStart;

              const innerOverlap = insideMouth && targetGap > 1.2 ? 1.35 : 0.65;

              // 1. Upper slice: [colAnchorTopY .. srcUpperEnd] -> [colAnchorTopY + breath .. dstUpperEnd + overlap]
              const srcUpH = Math.max(2, srcUpperEnd - colAnchorTopY);
              const dstUpTop = colAnchorTopY + subtleBreathY;
              const dstUpH = Math.max(2, dstUpperEnd + innerOverlap - dstUpTop);
              mCtx.drawImage(
                renderSourceCanvas,
                srcX,
                colAnchorTopY,
                colW + 0.9,
                srcUpH,
                dstX,
                dstUpTop,
                dstW + 0.95,
                dstUpH
              );

              // 2. Lower parabolic mandible slice: [sLowerLipY .. colAnchorBotY] -> [dstLowerStart - overlap .. colAnchorBotY + breath]
              const srcLowH = Math.max(2, colAnchorBotY - sLowerLipY);
              const dstLowTop = dstLowerStart - innerOverlap;
              const dstLowBot = colAnchorBotY + subtleBreathY;
              const dstLowH = Math.max(2, dstLowBot - dstLowTop);
              mCtx.drawImage(
                renderSourceCanvas,
                srcX,
                sLowerLipY,
                colW + 0.9,
                srcLowH,
                dstX,
                dstLowTop,
                dstW + 0.95,
                dstLowH
              );
            }

            // STEP B: Hardware Anti-Aliased Smooth Spline Oral Cavity, Upper-Lip AO Shadow, 3D Tongue & Soft Teeth
            if (firstMouthCol >= 0 && lastMouthCol > firstMouthCol && desiredCenterGapPx > 1.15) {
              const midCol = Math.floor((firstMouthCol + lastMouthCol) * 0.5);
              const cavTopMid = dstUpperCurveY[midCol];
              const cavBotMid = dstLowerCurveY[midCol];
              const cavSpanH = Math.max(2, cavBotMid - cavTopMid);
              const activeHalfSpanX = Math.max(
                10,
                (dstColCenterX[lastMouthCol] - dstColCenterX[firstMouthCol]) * 0.5
              );

              const traceOralSpline = () => {
                mCtx.beginPath();
                const leftCornerY = (dstUpperCurveY[firstMouthCol] + dstLowerCurveY[firstMouthCol]) * 0.5;
                const rightCornerY = (dstUpperCurveY[lastMouthCol] + dstLowerCurveY[lastMouthCol]) * 0.5;
                mCtx.moveTo(dstColCenterX[firstMouthCol], leftCornerY);
                for (let c = firstMouthCol + 1; c < lastMouthCol; c++) {
                  mCtx.lineTo(dstColCenterX[c], dstUpperCurveY[c]);
                }
                mCtx.lineTo(dstColCenterX[lastMouthCol], rightCornerY);
                for (let c = lastMouthCol - 1; c > firstMouthCol; c--) {
                  mCtx.lineTo(dstColCenterX[c], dstLowerCurveY[c]);
                }
                mCtx.closePath();
              };

              mCtx.save();
              traceOralSpline();
              mCtx.clip();

              const cavGrad = mCtx.createRadialGradient(
                activeMouthCx,
                (cavTopMid + cavBotMid) * 0.48,
                1,
                activeMouthCx,
                (cavTopMid + cavBotMid) * 0.52,
                Math.max(activeHalfSpanX, cavSpanH)
              );
              cavGrad.addColorStop(0, cfg.cavityDarkColor);
              cavGrad.addColorStop(0.68, cfg.cavityMidColor);
              cavGrad.addColorStop(1, cfg.cavityRimColor);
              mCtx.fillStyle = cavGrad;
              mCtx.fillRect(
                dstColCenterX[firstMouthCol] - 4,
                cavTopMid - 6,
                activeHalfSpanX * 2 + 8,
                cavSpanH + 12
              );

              // Volumetric 3D Tongue inside lower cavity
              if (cavSpanH > 3.2) {
                const tongueW = activeHalfSpanX * (cfg.mustacheCover ? 0.54 : 0.60);
                const tongueH = cavSpanH * (0.35 + spring.tongue * 0.17);
                const tongueY = cavBotMid - tongueH * 0.46;
                const tGrad = mCtx.createRadialGradient(
                  activeMouthCx,
                  tongueY - tongueH * 0.2,
                  1,
                  activeMouthCx,
                  tongueY,
                  tongueW
                );
                tGrad.addColorStop(0, cfg.mustacheCover ? '#782a33' : '#c65862');
                tGrad.addColorStop(0.68, cfg.mustacheCover ? '#461319' : '#8f323d');
                tGrad.addColorStop(1, cfg.cavityMidColor);

                mCtx.beginPath();
                mCtx.ellipse(activeMouthCx, tongueY, tongueW, tongueH, 0, 0, Math.PI * 2);
                mCtx.fillStyle = tGrad;
                mCtx.fill();
              }

              // Subtle feathered upper teeth arch ONLY for closed-base portraits without native 3D teeth
              if (!anatomy.hasTeeth && !cfg.mustacheCover && cavSpanH > 4.2) {
                const teethW = activeHalfSpanX * 0.62;
                const teethH = Math.min(cavSpanH * 0.24, 4.2);
                const teethGrad = mCtx.createLinearGradient(
                  activeMouthCx - teethW,
                  cavTopMid,
                  activeMouthCx + teethW,
                  cavTopMid
                );
                teethGrad.addColorStop(0, 'rgba(210, 198, 186, 0)');
                teethGrad.addColorStop(0.22, cfg.teethColor);
                teethGrad.addColorStop(0.5, '#fffdf9');
                teethGrad.addColorStop(0.78, cfg.teethColor);
                teethGrad.addColorStop(1, 'rgba(210, 198, 186, 0)');

                mCtx.save();
                mCtx.globalAlpha = Math.min(0.60, (cavSpanH - 3.8) / 8.2);
                mCtx.beginPath();
                mCtx.ellipse(activeMouthCx, cavTopMid + teethH * 0.15, teethW, teethH, 0, 0, Math.PI * 2);
                mCtx.fillStyle = teethGrad;
                mCtx.fill();
                mCtx.restore();
              }

              // 3D Recessed Upper-Lip Ambient Occlusion Shadow (depth cue inside upper oral arch)
              const aoH = Math.min(5.5, cavSpanH * 0.42);
              const aoGrad = mCtx.createLinearGradient(0, cavTopMid - 1, 0, cavTopMid + aoH);
              aoGrad.addColorStop(0, 'rgba(8, 2, 3, 0.72)');
              aoGrad.addColorStop(1, 'rgba(8, 2, 3, 0)');
              mCtx.fillStyle = aoGrad;
              mCtx.fillRect(
                dstColCenterX[firstMouthCol] - 2,
                cavTopMid - 1,
                activeHalfSpanX * 2 + 4,
                aoH + 1
              );

              // Soft inner mucosal rim shadow along smooth spline border
              traceOralSpline();
              mCtx.globalAlpha = cfg.mustacheCover ? 0.52 : 0.66;
              mCtx.lineWidth = 1.4;
              mCtx.strokeStyle = cfg.cavityRimColor;
              mCtx.stroke();
              mCtx.restore();

              // Subtle dynamic mentolabial lower-lip depth shadow as jaw opens
              if (cavSpanH > 3.5 && !cfg.mustacheCover) {
                const shadowY = cavBotMid + Math.min(11, jawSpan * 0.20);
                const mlGrad = mCtx.createRadialGradient(
                  activeMouthCx,
                  shadowY,
                  1,
                  activeMouthCx,
                  shadowY,
                  activeHalfSpanX * 0.78
                );
                const mlAlpha = Math.min(0.14, (cavSpanH / maxGapPx) * 0.14);
                mlGrad.addColorStop(0, `rgba(28, 12, 10, ${mlAlpha.toFixed(3)})`);
                mlGrad.addColorStop(1, 'rgba(28, 12, 10, 0)');
                mCtx.fillStyle = mlGrad;
                mCtx.beginPath();
                mCtx.ellipse(activeMouthCx, shadowY, activeHalfSpanX * 0.78, Math.max(3.5, jawSpan * 0.08), 0, 0, Math.PI * 2);
                mCtx.fill();
              }
            } else if (
              firstMouthCol >= 0 &&
              lastMouthCol > firstMouthCol &&
              desiredCenterGapPx <= 1.15 &&
              anatomy.poseBaseOpen > 0.05
            ) {
              // STEP C: Feathered natural stomion parting line when an open-smile 3D rig seals lips on /m/, /b/, /p/
              mCtx.save();
              mCtx.beginPath();
              for (let c = firstMouthCol; c <= lastMouthCol; c++) {
                const my = (dstUpperCurveY[c] + dstLowerCurveY[c]) * 0.5;
                if (c === firstMouthCol) mCtx.moveTo(dstColCenterX[c], my);
                else mCtx.lineTo(dstColCenterX[c], my);
              }
              const sealGrad = mCtx.createLinearGradient(
                dstColCenterX[firstMouthCol],
                0,
                dstColCenterX[lastMouthCol],
                0
              );
              sealGrad.addColorStop(0, 'rgba(62, 18, 24, 0)');
              sealGrad.addColorStop(0.22, 'rgba(62, 18, 24, 0.44)');
              sealGrad.addColorStop(0.5, 'rgba(62, 18, 24, 0.54)');
              sealGrad.addColorStop(0.78, 'rgba(62, 18, 24, 0.44)');
              sealGrad.addColorStop(1, 'rgba(62, 18, 24, 0)');
              mCtx.strokeStyle = sealGrad;
              mCtx.lineWidth = 1.25;
              mCtx.lineCap = 'round';
              mCtx.stroke();
              mCtx.restore();
            }

            // STEP D: Soft Feathered Mustache Overhang (ZERO hard elliptical sticker edge!)
            if (cfg.mustacheCover && desiredCenterGapPx > 1.0) {
              const mustacheBottomY = cfg.cy + avgPoseDy + subtleBreathY + 1.0;
              const mustRx = halfW * 1.14;
              const mustRy = 8.4;
              const mustW = Math.ceil(mustRx * 2 + 8);
              const mustH = Math.ceil(mustRy * 2 + 8);
              const mustLeft = activeMouthCx - mustW * 0.5;
              const mustTop = mustacheBottomY - 5.8 - mustH * 0.5;
              const eScratch = ensureScratchCanvas(eyePatchCanvasRef, Math.max(200, mustW), Math.max(140, mustH));
              const eCtx = eScratch.getContext('2d');
              if (eCtx) {
                eCtx.save();
                eCtx.globalCompositeOperation = 'source-over';
                eCtx.clearRect(0, 0, mustW, mustH);
                eCtx.drawImage(
                  renderSourceCanvas,
                  mustLeft,
                  mustTop - subtleBreathY,
                  mustW,
                  mustH,
                  0,
                  0,
                  mustW,
                  mustH
                );
                // Soft feathered elliptical alpha mask so mustache bristles blend invisibly over cavity shadow
                eCtx.globalCompositeOperation = 'destination-in';
                eCtx.save();
                eCtx.translate(mustW * 0.5, mustH * 0.5);
                eCtx.scale(mustRx, mustRy);
                const mMask = eCtx.createRadialGradient(0, 0, 0.45, 0, 0, 1.0);
                mMask.addColorStop(0, 'rgba(0,0,0,1)');
                mMask.addColorStop(0.72, 'rgba(0,0,0,0.85)');
                mMask.addColorStop(1, 'rgba(0,0,0,0)');
                eCtx.fillStyle = mMask;
                eCtx.beginPath();
                eCtx.arc(0, 0, 1, 0, Math.PI * 2);
                eCtx.fill();
                eCtx.restore();
                eCtx.restore();

                mCtx.drawImage(eScratch, 0, 0, mustW, mustH, mustLeft, mustTop, mustW, mustH);
              }
            }

            // FINAL FEATHER PASS: C2 smooth elliptical radial alpha feather strictly outside mouth corners & lips
            // Inner 80% is 100% opaque (guarantees zero ghost teeth bleed-through on corners/lips); outer 20% dissolves seamlessly!
            mCtx.globalCompositeOperation = 'destination-in';
            const maskCx = dstMouthMidX;
            const maskCy = (srcAnchorTopY + srcAnchorBotY) * 0.5 + subtleBreathY;
            const maskRx = patchHalfW + padX * 0.68;
            const maskRy = (srcAnchorBotY - srcAnchorTopY) * 0.5 + padY * 0.65;
            mCtx.save();
            mCtx.translate(maskCx, maskCy);
            mCtx.scale(maskRx, maskRy);
            const featherGrad = mCtx.createRadialGradient(0, 0, 0.80, 0, 0, 1.0);
            featherGrad.addColorStop(0, 'rgba(0,0,0,1)');
            featherGrad.addColorStop(0.50, 'rgba(0,0,0,0.68)');
            featherGrad.addColorStop(0.84, 'rgba(0,0,0,0.20)');
            featherGrad.addColorStop(1, 'rgba(0,0,0,0)');
            mCtx.fillStyle = featherGrad;
            mCtx.beginPath();
            mCtx.arc(0, 0, 1, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.restore();
            mCtx.restore();

            // Blit seamless feathered mouth/mandible composite onto main canvas
            ctx.drawImage(
              mCanvas,
              0,
              0,
              patchBoxW,
              patchBoxH,
              patchBoxLeft,
              patchBoxTop,
              patchBoxW,
              patchBoxH
            );
          }
        }

        // 10. Feathered Supraorbital Eyebrow Articulation, Sclera-Locked Micro-Saccades & Bilateral Periorbital Blinking
        if (cfg.leftEyeX && cfg.rightEyeX && (cfg.leftEyeY || cfg.eyeY)) {
          const eRx = cfg.eyeRx ?? cfg.eyeRadius ?? 24;
          const eRy = cfg.eyeRy ?? cfg.eyeRadius ?? 22;
          const srcLeftY = cfg.leftEyeY ?? cfg.eyeY ?? 260;
          const srcRightY = cfg.rightEyeY ?? cfg.eyeY ?? 260;

          const eyeSockets = [
            {
              side: 'L' as const,
              srcEx: cfg.leftEyeX,
              srcEy: srcLeftY,
              poseEx: cfg.leftEyeX + poseOffsets.dxL,
              poseEy: srcLeftY + poseOffsets.dyL,
              dstEx: cfg.leftEyeX + poseOffsets.dxL + headShiftX * 0.72,
              dstEy: srcLeftY + poseOffsets.dyL + headShiftY * 0.72,
              liftMult: 1 - spring.browAsym * 0.35,
            },
            {
              side: 'R' as const,
              srcEx: cfg.rightEyeX,
              srcEy: srcRightY,
              poseEx: cfg.rightEyeX + poseOffsets.dxR,
              poseEy: srcRightY + poseOffsets.dyR,
              dstEx: cfg.rightEyeX + poseOffsets.dxR + headShiftX * 0.72,
              dstEy: srcRightY + poseOffsets.dyR + headShiftY * 0.72,
              liftMult: 1 + spring.browAsym * 0.45,
            },
          ];

          // 10A. Feathered Supraorbital Eyebrow Gesticulation (zero elliptical clip rings on textured foreheads!)
          if (Math.abs(spring.browLift) > 0.04) {
            for (const { poseEx, poseEy, dstEx, dstEy, liftMult } of eyeSockets) {
              const browW = eRx * 1.62;
              const browH = eRy * 0.96;
              const srcBrowTopY = poseEy - eRy * 1.72;
              const dstBrowTopY = dstEy - eRy * 1.72;
              const browShiftPx = -spring.browLift * liftMult * Math.max(2.6, Math.min(5.0, eRy * 0.14));
              const bw = Math.ceil(browW + 12);
              const bh = Math.ceil(browH + 14);
              const bLeft = dstEx - bw * 0.5;
              const bTop = dstBrowTopY - 7;

              const bScratch = ensureScratchCanvas(browPatchCanvasRef, Math.max(220, bw), Math.max(140, bh));
              const bCtx = bScratch.getContext('2d');
              if (bCtx) {
                bCtx.save();
                bCtx.globalCompositeOperation = 'source-over';
                bCtx.clearRect(0, 0, bw, bh);
                bCtx.translate(-bLeft, -bTop);

                const bStrips = 9;
                const bStripH = browH / bStrips;
                for (let i = 0; i < bStrips; i++) {
                  const normY = (i + 0.5) / bStrips;
                  const bell = Math.pow(Math.sin(normY * Math.PI), 1.85);
                  const srcY = srcBrowTopY + i * bStripH;
                  const dstY = dstBrowTopY + i * bStripH + browShiftPx * bell;
                  bCtx.drawImage(
                    renderSourceCanvas,
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

                // Soft elliptical radial alpha feather so brow motion dissolves invisibly into forehead texture
                bCtx.globalCompositeOperation = 'destination-in';
                bCtx.save();
                bCtx.translate(dstEx, dstBrowTopY + browH * 0.5);
                bCtx.scale(browW * 0.48, browH * 0.46);
                const brMask = bCtx.createRadialGradient(0, 0, 0.50, 0, 0, 1.0);
                brMask.addColorStop(0, 'rgba(0,0,0,1)');
                brMask.addColorStop(0.75, 'rgba(0,0,0,0.55)');
                brMask.addColorStop(1, 'rgba(0,0,0,0)');
                bCtx.fillStyle = brMask;
                bCtx.beginPath();
                bCtx.arc(0, 0, 1, 0, Math.PI * 2);
                bCtx.fill();
                bCtx.restore();
                bCtx.restore();

                ctx.drawImage(bScratch, 0, 0, bw, bh, bLeft, bTop, bw, bh);
              }
            }
          }

          // 10B. Sclera-Locked Feathered Iris Micro-Saccades + Corneal Catchlight (NEVER drags eyelid margins!)
          const scaledSacX = Math.max(-2.1, Math.min(2.1, spring.saccadeX * Math.min(1.65, eRx * 0.068)));
          const scaledSacY = Math.max(-1.1, Math.min(1.1, spring.saccadeY * Math.min(1.0, eRy * 0.052)));
          if (spring.blink < 0.08 && (Math.abs(scaledSacX) > 0.16 || Math.abs(scaledSacY) > 0.14)) {
            for (const { poseEx, poseEy, dstEx, dstEy } of eyeSockets) {
              const sacRx = eRx * 0.44;
              const sacRy = eRy * 0.36;
              const sw = Math.ceil(sacRx * 2 + 12);
              const sh = Math.ceil(sacRy * 2 + 12);
              const eScratch = ensureScratchCanvas(eyePatchCanvasRef, Math.max(200, sw), Math.max(140, sh));
              const eCtx = eScratch.getContext('2d');
              if (eCtx) {
                eCtx.save();
                eCtx.globalCompositeOperation = 'source-over';
                eCtx.clearRect(0, 0, sw, sh);
                eCtx.drawImage(
                  renderSourceCanvas,
                  poseEx - sw * 0.5 - scaledSacX,
                  poseEy - sh * 0.5 - scaledSacY,
                  sw,
                  sh,
                  0,
                  0,
                  sw,
                  sh
                );
                // Subtle warm corneal specular catchlight (life-like eye sparkle)
                const glintR = Math.max(1.1, Math.min(2.1, eRy * 0.085));
                const glintX = sw * 0.5 - eRx * 0.11 + scaledSacX * 0.55;
                const glintY = sh * 0.5 - eRy * 0.12 + scaledSacY * 0.45;
                const gGrad = eCtx.createRadialGradient(glintX, glintY, 0, glintX, glintY, glintR * 1.8);
                gGrad.addColorStop(0, 'rgba(255, 252, 245, 0.24)');
                gGrad.addColorStop(1, 'rgba(255, 252, 245, 0)');
                eCtx.fillStyle = gGrad;
                eCtx.beginPath();
                eCtx.arc(glintX, glintY, glintR * 1.8, 0, Math.PI * 2);
                eCtx.fill();

                // Soft feathered iris mask strictly inside sclera (zero eyelid skin dragging!)
                eCtx.globalCompositeOperation = 'destination-in';
                eCtx.save();
                eCtx.translate(sw * 0.5, sh * 0.5);
                eCtx.scale(sacRx, sacRy);
                const sMask = eCtx.createRadialGradient(0, 0, 0.52, 0, 0, 1.0);
                sMask.addColorStop(0, 'rgba(0,0,0,1)');
                sMask.addColorStop(0.78, 'rgba(0,0,0,0.52)');
                sMask.addColorStop(1, 'rgba(0,0,0,0)');
                eCtx.fillStyle = sMask;
                eCtx.beginPath();
                eCtx.arc(0, 0, 1, 0, Math.PI * 2);
                eCtx.fill();
                eCtx.restore();
                eCtx.restore();

                ctx.drawImage(eScratch, 0, 0, sw, sh, dstEx - sw * 0.5, dstEy - sh * 0.5, sw, sh);
              }
            }
          }

          // 10C. Aligned & Feathered Bilateral Periorbital Eyelid Blinking (85% Upper Lid + 15% Lower Lid Rise)
          const b = spring.blink;
          if (b > 0.04) {
            const blinkUrl = poseCompendiumRef.current?.blink;
            const blinkCanvas = blinkUrl ? poseCacheRef.current.get(blinkUrl) : null;
            const blinkOffsets = blinkCanvas
              ? poseEyeOffsetRef.current.get(blinkCanvas) || { dxL: 0, dyL: 0, dxR: 0, dyR: 0 }
              : { dxL: 0, dyL: 0, dxR: 0, dyR: 0 };
            const skin = eyelidSkinRef.current;

            for (const { side, srcEx, srcEy, dstEx, dstEy } of eyeSockets) {
              const bOffDx = side === 'L' ? blinkOffsets.dxL : blinkOffsets.dxR;
              const bOffDy = side === 'L' ? blinkOffsets.dyL : blinkOffsets.dyR;
              const alignedBlinkEx = srcEx + bOffDx;
              const alignedBlinkEy = srcEy + bOffDy;

              const creaseRelY = -eRy * 0.84;
              const openMarginRelY = -eRy * 0.56;
              // Bilateral human blink: upper lid descends 85% toward meet line, lower lid rises 15%
              const closedMeetRelY = eRy * 0.36;
              const openLowerRelY = eRy * 0.62;
              const currUpperMarginRelY = openMarginRelY + b * (closedMeetRelY - openMarginRelY);
              const currLowerMarginRelY = openLowerRelY - b * (openLowerRelY - closedMeetRelY) * 0.85;
              const lowerSocketRelY = eRy * 0.88;
              const cornerRelY = openMarginRelY * 0.25 + b * (closedMeetRelY * 0.52);

              const bw = Math.ceil(eRx * 2.36);
              const bh = Math.ceil(eRy * 2.28);
              const bLeft = dstEx - bw * 0.5;
              const bTop = dstEy - bh * 0.5;
              const eScratch = ensureScratchCanvas(eyePatchCanvasRef, Math.max(200, bw), Math.max(140, bh));
              const eCtx = eScratch.getContext('2d');

              if (eCtx) {
                eCtx.save();
                eCtx.globalCompositeOperation = 'source-over';
                eCtx.clearRect(0, 0, bw, bh);
                eCtx.translate(-bLeft, -bTop);

                if (blinkCanvas) {
                  // Mode A: Aligned & Feathered 3D Closed-Eyelid Sprite Curtain (Zero vertical drift!)
                  eCtx.save();
                  eCtx.beginPath();
                  eCtx.moveTo(dstEx - eRx * 0.98, dstEy + cornerRelY);
                  eCtx.quadraticCurveTo(dstEx, dstEy + creaseRelY * 1.24, dstEx + eRx * 0.98, dstEy + cornerRelY);
                  eCtx.quadraticCurveTo(dstEx, dstEy + currUpperMarginRelY * 1.22, dstEx - eRx * 0.98, dstEy + cornerRelY);
                  eCtx.closePath();
                  eCtx.clip();

                  const lidStrips = 14;
                  const srcSpan = closedMeetRelY + eRy * 0.16 - creaseRelY;
                  const dstSpan = Math.max(2, currUpperMarginRelY - creaseRelY);
                  const srcStep = srcSpan / lidStrips;
                  const dstStep = dstSpan / lidStrips;
                  const patchW = eRx * 2.08;

                  for (let s = 0; s < lidStrips; s++) {
                    eCtx.drawImage(
                      blinkCanvas,
                      alignedBlinkEx - patchW * 0.5,
                      alignedBlinkEy + creaseRelY + s * srcStep,
                      patchW,
                      srcStep + 1.4,
                      dstEx - patchW * 0.5,
                      dstEy + creaseRelY + s * dstStep,
                      patchW,
                      dstStep + 1.5
                    );
                  }
                  eCtx.restore();

                  // Seamless full tarsal seal when lid nears complete closure
                  if (b > 0.58) {
                    const sealAlpha = Math.min(1, (b - 0.58) / 0.34);
                    eCtx.save();
                    eCtx.globalAlpha = sealAlpha;
                    eCtx.drawImage(
                      blinkCanvas,
                      alignedBlinkEx - eRx * 1.06,
                      alignedBlinkEy - eRy * 0.96,
                      eRx * 2.12,
                      eRy * 1.92,
                      dstEx - eRx * 1.06,
                      dstEy - eRy * 0.96,
                      eRx * 2.12,
                      eRy * 1.92
                    );
                    eCtx.restore();
                  }

                  // Crisp anti-aliased curved upper eyelash margin during descent/opening
                  if (b < 0.86) {
                    eCtx.save();
                    eCtx.beginPath();
                    eCtx.moveTo(dstEx - eRx * 0.84, dstEy + cornerRelY + 1.2);
                    eCtx.quadraticCurveTo(
                      dstEx,
                      dstEy + currUpperMarginRelY * 1.14,
                      dstEx + eRx * 0.84,
                      dstEy + cornerRelY + 1.2
                    );
                    eCtx.strokeStyle = 'rgba(24, 14, 12, 0.68)';
                    eCtx.lineWidth = Math.max(1.6, eRy * 0.072);
                    eCtx.lineCap = 'round';
                    eCtx.stroke();
                    eCtx.restore();
                  }
                } else {
                  // Mode B: Bilateral Anatomical 3D Eyelid Dome + Subtle Lower-Lid Rise (for Historical Portraits)
                  // 1. Upper Eyelid Dome (85% closure)
                  eCtx.save();
                  eCtx.beginPath();
                  eCtx.moveTo(dstEx - eRx * 0.94, dstEy + cornerRelY);
                  eCtx.quadraticCurveTo(dstEx, dstEy + creaseRelY * 1.18, dstEx + eRx * 0.94, dstEy + cornerRelY);
                  eCtx.quadraticCurveTo(dstEx, dstEy + currUpperMarginRelY * 1.20, dstEx - eRx * 0.94, dstEy + cornerRelY);
                  eCtx.closePath();
                  eCtx.clip();

                  const lidGrad = eCtx.createLinearGradient(
                    dstEx,
                    dstEy + creaseRelY,
                    dstEx,
                    dstEy + currUpperMarginRelY + 2
                  );
                  lidGrad.addColorStop(0, skin.crease);
                  lidGrad.addColorStop(0.32, skin.highlight);
                  lidGrad.addColorStop(0.84, skin.base);
                  lidGrad.addColorStop(1, skin.crease);

                  eCtx.fillStyle = lidGrad;
                  eCtx.fillRect(
                    dstEx - eRx,
                    dstEy + creaseRelY - 2,
                    eRx * 2,
                    currUpperMarginRelY - creaseRelY + 8
                  );
                  eCtx.restore();

                  // 2. Subtle Lower Eyelid Upward Lift (15% bilateral orbicularis closure)
                  if (b > 0.25) {
                    eCtx.save();
                    eCtx.globalAlpha = Math.min(0.92, (b - 0.20) * 1.15);
                    eCtx.beginPath();
                    eCtx.moveTo(dstEx - eRx * 0.88, dstEy + cornerRelY + 1);
                    eCtx.quadraticCurveTo(dstEx, dstEy + currLowerMarginRelY, dstEx + eRx * 0.88, dstEy + cornerRelY + 1);
                    eCtx.quadraticCurveTo(dstEx, dstEy + lowerSocketRelY * 1.05, dstEx - eRx * 0.88, dstEy + cornerRelY + 1);
                    eCtx.closePath();
                    eCtx.clip();
                    const lowGrad = eCtx.createLinearGradient(dstEx, dstEy + currLowerMarginRelY, dstEx, dstEy + lowerSocketRelY);
                    lowGrad.addColorStop(0, skin.base);
                    lowGrad.addColorStop(1, skin.crease);
                    eCtx.fillStyle = lowGrad;
                    eCtx.fillRect(dstEx - eRx, dstEy + currLowerMarginRelY - 2, eRx * 2, lowerSocketRelY - currLowerMarginRelY + 6);
                    eCtx.restore();
                  }

                  // 3. Soft Curved Upper Eyelash Margin & Orbital Shadow
                  eCtx.save();
                  eCtx.beginPath();
                  eCtx.moveTo(dstEx - eRx * 0.84, dstEy + cornerRelY + 0.8);
                  eCtx.quadraticCurveTo(
                    dstEx,
                    dstEy + currUpperMarginRelY * 1.16,
                    dstEx + eRx * 0.84,
                    dstEy + cornerRelY + 0.8
                  );
                  eCtx.strokeStyle = 'rgba(22, 13, 12, 0.78)';
                  eCtx.lineWidth = Math.max(1.5, eRy * 0.08);
                  eCtx.lineCap = 'round';
                  eCtx.stroke();
                  eCtx.restore();
                }

                // Soft periorbital alpha feathering around outer socket border (ZERO pasted oval rings!)
                eCtx.globalCompositeOperation = 'destination-in';
                eCtx.save();
                eCtx.translate(dstEx, dstEy + eRy * 0.02);
                eCtx.scale(eRx * 1.08, eRy * 1.04);
                const orbMask = eCtx.createRadialGradient(0, 0, 0.72, 0, 0, 1.0);
                orbMask.addColorStop(0, 'rgba(0,0,0,1)');
                orbMask.addColorStop(0.84, 'rgba(0,0,0,0.68)');
                orbMask.addColorStop(1, 'rgba(0,0,0,0)');
                eCtx.fillStyle = orbMask;
                eCtx.beginPath();
                eCtx.arc(0, 0, 1, 0, Math.PI * 2);
                eCtx.fill();
                eCtx.restore();
                eCtx.restore();

                ctx.drawImage(eScratch, 0, 0, bw, bh, bLeft, bTop, bw, bh);
              }
            }
          }
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (!document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
      }
    } else {
      rafId = requestAnimationFrame(renderFrame);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
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
