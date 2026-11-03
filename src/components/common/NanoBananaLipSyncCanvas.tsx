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
  /** Optional CSS class for the outer container */
  className?: string;
  /** Optional fallback image if primary image fails */
  fallbackImageSrc?: string;
  /** Whether to apply bust framing automatically for full/half-body portraits */
  enableSmartBustCrop?: boolean;
  /** Optional callback when image finishes loading */
  onLoad?: () => void;
}

interface SpringState {
  open: number;
  openVel: number;
  spread: number;
  spreadVel: number;
  tongue: number;
  tongueVel: number;
  blink: number;
  headTiltX: number;
  headBobY: number;
}

/**
 * Motor Quirúrgico de Sincronización Labial y Deformación Mandibular a 60 FPS
 * ("Nano Banana 2.1" Anatomical Strip-Mesh Jaw Warper & Formant-Viseme Engine)
 *
 * Analiza y anima individualmente la anatomía bucal, labial, mandibular y ocular
 * de cada personaje histórico o mentor 3D a 60 cuadros por segundo reales
 * (requestAnimationFrame con física de resortes amortiguados), preservando
 * el fondo, manos y objetos 100% estables sin parpadeos ni saltos.
 */
export const NanoBananaLipSyncCanvas: React.FC<NanoBananaLipSyncCanvasProps> = ({
  imageSrc,
  characterId,
  isSpeaking,
  mouthConfig,
  externalMouthOpen = 0,
  externalMouthSpread = 0,
  spokenText = '',
  className = '',
  fallbackImageSrc = '/images/history/personaje_generico_avatar.png',
  enableSmartBustCrop = true,
  onLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const stripCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const externalOpenRef = useRef<number>(externalMouthOpen);
  const externalSpreadRef = useRef<number>(externalMouthSpread);
  const spokenTextRef = useRef<string>(spokenText);

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
  }, [spokenText]);

  // Resolve calibrated anatomical landmarks in 1024x1024 space
  // Prioritizes explicit mouthConfig or characterId first so image filename never causes false collisions
  const resolvedConfig = React.useMemo(() => {
    if (mouthConfig) return mouthConfig;
    const key = characterId || imageSrc;
    return getHistoricalMouthConfig(key);
  }, [characterId, imageSrc, mouthConfig]);

  // Load canonical image into 1024x1024 offscreen canvas
  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;
      const off = document.createElement('canvas');
      off.width = 1024;
      off.height = 1024;
      const octx = off.getContext('2d');
      if (octx) {
        octx.imageSmoothingEnabled = true;
        octx.imageSmoothingQuality = 'high';
        octx.drawImage(img, 0, 0, 1024, 1024);
      }
      offscreenRef.current = off;

      if (!stripCanvasRef.current) {
        const sc = document.createElement('canvas');
        sc.width = 512;
        sc.height = 512;
        stripCanvasRef.current = sc;
      }

      setLoadedSrc(imageSrc);
      onLoad?.();
    };

    img.onerror = () => {
      if (cancelled || !fallbackImageSrc || imageSrc === fallbackImageSrc) return;
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        if (cancelled) return;
        const off = document.createElement('canvas');
        off.width = 1024;
        off.height = 1024;
        const octx = off.getContext('2d');
        if (octx) {
          octx.drawImage(fallbackImg, 0, 0, 1024, 1024);
        }
        offscreenRef.current = off;
        setLoadedSrc(fallbackImageSrc);
        onLoad?.();
      };
      fallbackImg.src = fallbackImageSrc;
    };

    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc, fallbackImageSrc, onLoad]);

  // 60 FPS RequestAnimationFrame Surgical Lip-Sync & Mandible Warp Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = performance.now();
    let nextBlinkAt = lastTime + 2400 + Math.random() * 2600;
    let blinkStartAt = -1;
    const BLINK_DURATION_MS = 155; // 60fps 9-frame natural blink

    const spring: SpringState = {
      open: resolvedConfig.baseOpen ?? 0,
      openVel: 0,
      spread: 0,
      spreadVel: 0,
      tongue: 0.25,
      tongueVel: 0,
      blink: 0,
      headTiltX: 0,
      headBobY: 0,
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      const off = offscreenRef.current;
      if (!off) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const cfg = resolvedConfig;
      const baseOpen = cfg.baseOpen ?? 0;
      const speaking = isSpeakingRef.current;

      // 1. Compute target mouth state from Web Audio Formants + Phonetic Prosody Oscillator at 60 FPS
      let targetOpen = speaking ? 0.15 : Math.min(baseOpen, 0.08);
      let targetSpread = 0;
      let targetTongue = 0.25;

      if (speaking) {
        const formants = getVoiceFormantLevels();
        const extOpen = externalOpenRef.current;
        const extSpread = externalSpreadRef.current;
        const tSec = now * 0.001;

        // 60 FPS Syllabic Viseme Articulator (~4.8 syllables/sec with natural bilabial closures & vowel peaks)
        const sylWave1 = Math.sin(tSec * 9.8);
        const sylWave2 = Math.sin(tSec * 15.6 + 0.9);
        const sylWave3 = Math.cos(tSec * 6.3 - 0.5);
        const phraseGate = Math.sin(tSec * 2.2) > -0.84 ? 1.0 : 0.06;
        const rawEnvelope = 0.48 * sylWave1 + 0.34 * sylWave2 + 0.18 * sylWave3;

        let oscOpen = 0.02;
        let oscSpread = -0.10;
        let oscTongue = 0.35;
        if (rawEnvelope >= -0.22 && phraseGate >= 0.2) {
          const normEnv = Math.min(1, Math.max(0, (rawEnvelope + 0.22) / 1.12));
          oscOpen = (0.18 + 0.80 * Math.pow(normEnv, 1.05)) * phraseGate;
          oscSpread = 0.28 * Math.sin(tSec * 7.6 + 0.4) - 0.20 * Math.cos(tSec * 11.5);
          oscTongue = 0.45 + 0.42 * Math.sin(tSec * 18.5);
        }

        if (formants.rms > 0.015) {
          // Hybrid Real-Time Formant + Syllabic Viseme Articulation
          if (formants.bilabial || rawEnvelope < -0.32) {
            targetOpen = 0.02; // Full lip closure on /m/, /b/, /p/
            targetSpread = -0.10;
          } else {
            const formantOpen = Math.min(0.98, Math.max(0.18, formants.open * 1.15));
            targetOpen = Math.min(0.98, formantOpen * 0.65 + oscOpen * 0.35);
            targetSpread = (formants.spread - formants.rounded * 0.85) * 0.42 + oscSpread * 0.25;
            targetTongue = formants.alveolar ? 0.85 : oscTongue;
          }
        } else if (extOpen > 0.03) {
          if (rawEnvelope < -0.30) {
            targetOpen = 0.02;
            targetSpread = -0.08;
          } else {
            targetOpen = Math.min(0.98, Math.max(0.22, extOpen * 1.25) * 0.62 + oscOpen * 0.38);
            targetSpread = extSpread * 0.65 + oscSpread * 0.35;
            targetTongue = oscTongue;
          }
        } else {
          targetOpen = oscOpen;
          targetSpread = oscSpread;
          targetTongue = oscTongue;
        }
      } else {
        // Idle state: gentle relaxed mouth (slightly more closed than open smile so character looks natural)
        targetOpen = baseOpen > 0.15 ? baseOpen * 0.72 : 0.0;
        targetSpread = 0;
        targetTongue = 0.2;
      }

      // 2. Damped 60 FPS Spring Physics Integration (stiffness: 380, damping: 24)
      const stiffness = 380;
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

      // 3. Natural Eyelid Blink Timing at 60 FPS
      if (now >= nextBlinkAt && blinkStartAt < 0) {
        blinkStartAt = now;
        nextBlinkAt = now + (speaking ? 2200 + Math.random() * 2400 : 3200 + Math.random() * 3000);
      }
      if (blinkStartAt >= 0) {
        const elapsed = now - blinkStartAt;
        if (elapsed >= BLINK_DURATION_MS) {
          spring.blink = 0;
          blinkStartAt = -1;
        } else {
          spring.blink = Math.sin((elapsed / BLINK_DURATION_MS) * Math.PI);
        }
      } else {
        spring.blink = 0;
      }

      // 4. Subtle 60 FPS Breathing & Prosodic Head Micro-Motion
      const tSec = now * 0.001;
      const breathBob = Math.sin(tSec * 1.65) * 1.4;
      const speechBob = speaking ? Math.sin(tSec * 5.2) * 2.2 * spring.open : 0;
      const targetBobY = breathBob + speechBob;
      const targetTiltX = speaking ? Math.sin(tSec * 3.1) * 1.4 * spring.open : Math.sin(tSec * 0.8) * 0.4;
      spring.headBobY += (targetBobY - spring.headBobY) * Math.min(1, dt * 10);
      spring.headTiltX += (targetTiltX - spring.headTiltX) * Math.min(1, dt * 10);

      // 5. Render to Display Canvas (1024x1024 internal coordinate system)
      ctx.save();
      ctx.clearRect(0, 0, 1024, 1024);

      // Apply smart bust crop if enabled and configured for full/half-body portraits
      if (enableSmartBustCrop && cfg.bustCrop) {
        const { focusX, focusY, zoom } = cfg.bustCrop;
        ctx.translate(512, 512);
        ctx.scale(zoom, zoom);
        ctx.translate(-focusX + spring.headTiltX, -focusY + spring.headBobY);
      } else {
        ctx.translate(spring.headTiltX, spring.headBobY);
      }

      // Draw canonical base portrait
      ctx.drawImage(off, 0, 0, 1024, 1024);

      // 6. Surgical Strip-Mesh Upper Lip + Lower Lip & Mandible Warping + Anatomical Oral Cavity
      const mouthW = cfg.x2 - cfg.x1;
      const halfW = mouthW * 0.5;
      const chinY = cfg.chinY ?? cfg.cy + Math.max(48, mouthW * 0.85);
      const jawHeight = Math.max(36, chinY - cfg.cy);
      const maxJawDrop = Math.min(38, Math.max(cfg.maxOpening * 2.15, jawHeight * 0.44));

      const deltaOpen = spring.open - baseOpen;
      const isClosedBase = baseOpen < 0.12;

      // Displace the character's REAL upper lip, lower lip, mandible, and chin
      if (Math.abs(deltaOpen) > 0.01 || Math.abs(spring.spread) > 0.01) {
        const warpWidth = halfW * 2.55;
        const warpLeft = cfg.cx - warpWidth * 0.5;
        const horizScale = 1 + spring.spread * 0.24;

        // 6A. Upper lip micro-lift (8 horizontal micro-strips above stomion)
        if (!cfg.mustacheCover && deltaOpen > 0.01) {
          const upStrips = 8;
          const upSpanY = Math.max(14, jawHeight * 0.28);
          const upStripH = upSpanY / upStrips;
          const upperLiftPx = (isClosedBase ? spring.open : deltaOpen) * maxJawDrop * 0.22;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cfg.cx, cfg.cy - upSpanY * 0.45, halfW * 1.15, upSpanY * 0.65, 0, 0, Math.PI * 2);
          ctx.clip();
          for (let i = 0; i < upStrips; i++) {
            const normY = i / upStrips; // 0 at top of philtrum, 1 at stomion (cy)
            const falloff = Math.pow(Math.sin(normY * Math.PI * 0.5), 1.5);
            const dy = -upperLiftPx * falloff;
            const srcY = (cfg.cy - upSpanY) + i * upStripH;
            const dstY = srcY + dy;
            const dstW = warpWidth * (1 + (horizScale - 1) * falloff);
            const dstX = cfg.cx - dstW * 0.5;
            ctx.drawImage(off, warpLeft, srcY, warpWidth, upStripH + 1.2, dstX, dstY, dstW, upStripH + 1.4);
          }
          ctx.restore();
        }

        // 6B. Lower lip, mandible, and chin drop (28 horizontal micro-strips below stomion)
        const numStrips = 28;
        const warpTop = cfg.cy;
        const warpSpanY = jawHeight * 1.24;
        const stripH = warpSpanY / numStrips;

        const lowerDropPx = isClosedBase
          ? spring.open * maxJawDrop * 0.78
          : deltaOpen * maxJawDrop * 0.82;

        ctx.save();
        // Soft elliptical clip around the lower lip, mandible, and chin so cheeks/background never tear
        ctx.beginPath();
        ctx.ellipse(
          cfg.cx,
          cfg.cy + jawHeight * 0.54,
          halfW * 1.26,
          jawHeight * 0.76,
          0,
          0,
          Math.PI * 2
        );
        ctx.clip();

        for (let i = 0; i < numStrips; i++) {
          const normY = i / numStrips; // 0 at stomion (cy), 1 at bottom of chin
          const falloff = Math.pow(Math.cos(normY * Math.PI * 0.5), 1.65);
          const dy = lowerDropPx * falloff;
          const sScaleX = 1 + (horizScale - 1) * Math.sin(normY * Math.PI);

          const srcY = warpTop + i * stripH;
          const dstY = srcY + dy;
          const dstW = warpWidth * sScaleX;
          const dstX = cfg.cx - dstW * 0.5;

          ctx.drawImage(
            off,
            warpLeft,
            srcY,
            warpWidth,
            stripH + 1.2,
            dstX,
            dstY,
            dstW,
            stripH + 1.4
          );
        }
        ctx.restore();
      }

      // 7. Render Feathered Anatomical Oral Cavity, Upper Teeth & Tongue Dorsum inside the Parted Stomion
      const effectiveOpen = isClosedBase
        ? spring.open
        : Math.max(0, spring.open - baseOpen * 0.65);

      if (effectiveOpen > 0.03) {
        const activeHalfW = halfW * (0.92 + spring.spread * 0.18);
        const upperLiftPx = effectiveOpen * maxJawDrop * (cfg.mustacheCover ? 0.06 : 0.22);
        const lowerDropPx = effectiveOpen * maxJawDrop * 0.74;
        const cornerY = (cfg.y1 + cfg.y2) * 0.5 + lowerDropPx * 0.12;
        const stomionCenterY = cfg.cy;

        const leftX = cfg.cx - activeHalfW;
        const rightX = cfg.cx + activeHalfW;
        const topCtrlY = stomionCenterY - upperLiftPx * 1.38;
        const botCtrlY = stomionCenterY + lowerDropPx * 1.48;

        ctx.save();

        // Define smooth anatomical lip-parting path
        const buildStomionPath = () => {
          ctx.beginPath();
          ctx.moveTo(leftX, cornerY);
          ctx.quadraticCurveTo(cfg.cx, topCtrlY, rightX, cornerY);
          ctx.quadraticCurveTo(cfg.cx, botCtrlY, leftX, cornerY);
          ctx.closePath();
        };

        buildStomionPath();
        ctx.clip();

        // 7A. Deep palatal/pharyngeal shadow gradient
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

        ctx.globalAlpha = baseOpen > 0.15 ? 0.72 : 0.94;
        ctx.fillStyle = cavGrad;
        ctx.fillRect(leftX - 4, topCtrlY - 4, activeHalfW * 2 + 8, botCtrlY - topCtrlY + 12);

        // 7B. Animated Tongue Dorsum (elevates on alveolar consonants /l/, /n/, /t/, /d/, /r/)
        const apertureH = lowerDropPx + upperLiftPx;
        if (apertureH > 3.2) {
          const tongueW = activeHalfW * 0.64;
          const tongueH = apertureH * (0.42 + spring.tongue * 0.22);
          const tongueCenterY = stomionCenterY + lowerDropPx * (0.72 - spring.tongue * 0.22);

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

        // 7C. Subtle Upper Dental Arch (natural warm ivory with soft sub-labial shadow)
        if (!cfg.mustacheCover && apertureH > 4.2 && baseOpen < 0.22) {
          const teethW = activeHalfW * 0.72;
          const teethH = Math.min(apertureH * 0.28, 5.5);
          const teethTopY = stomionCenterY - upperLiftPx * 0.65;

          const teethGrad = ctx.createLinearGradient(cfg.cx - teethW, teethTopY, cfg.cx + teethW, teethTopY);
          teethGrad.addColorStop(0, 'rgba(180, 168, 155, 0.35)');
          teethGrad.addColorStop(0.2, cfg.teethColor);
          teethGrad.addColorStop(0.5, '#ffffff');
          teethGrad.addColorStop(0.8, cfg.teethColor);
          teethGrad.addColorStop(1, 'rgba(180, 168, 155, 0.35)');

          ctx.globalAlpha = Math.min(0.68, (apertureH - 3.5) / 8);
          ctx.beginPath();
          ctx.roundRect(cfg.cx - teethW, teethTopY - 1, teethW * 2, teethH, [0, 0, 3, 3]);
          ctx.fillStyle = teethGrad;
          ctx.fill();
        }

        // 7D. Inner Lip Mucosal Shadow Vignette (eliminates any hard border between cavity and real lips)
        buildStomionPath();
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = cfg.mustacheCover ? 3.2 : 2.4;
        ctx.strokeStyle = cfg.cavityRimColor;
        ctx.stroke();

        ctx.restore();

        // 7E. Soft Lower Lip Mucosal Rim & Specular Highlight
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(leftX + activeHalfW * 0.12, cornerY + 0.5);
        ctx.quadraticCurveTo(
          cfg.cx,
          botCtrlY + 1.2,
          rightX - activeHalfW * 0.12,
          cornerY + 0.5
        );
        ctx.strokeStyle = cfg.lowerLipRimColor;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.72 * Math.min(1, effectiveOpen * 2.5);
        ctx.stroke();
        ctx.restore();

        // 7F. Mustache Overhang Preservation (if character has a prominent mustache, redraw upper stomion fringe from original image)
        if (cfg.mustacheCover) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cfg.cx, stomionCenterY - upperLiftPx * 0.55, activeHalfW * 0.96, Math.max(3, upperLiftPx * 1.15), 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(off, 0, 0, 1024, 1024);
          ctx.restore();
        }
      }

      // 8. Localized 60 FPS Eyelid Blinking (warps only the character's actual upper eyelid skin!)
      if (spring.blink > 0.03 && cfg.eyeY && cfg.leftEyeX && cfg.rightEyeX) {
        const eyeR = cfg.eyeRadius ?? 20;
        const eyes = [cfg.leftEyeX, cfg.rightEyeX];
        for (const ex of eyes) {
          const lidW = eyeR * 2.3;
          const lidH = eyeR * 1.65 * spring.blink;
          const lidTop = cfg.eyeY - eyeR * 0.82;

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(ex, cfg.eyeY, eyeR * 1.15, eyeR * 0.82, 0, 0, Math.PI * 2);
          ctx.clip();

          // Stretch upper eyelid skin patch smoothly over the eye
          ctx.drawImage(
            off,
            ex - lidW * 0.5,
            cfg.eyeY - eyeR * 1.15,
            lidW,
            eyeR * 0.55,
            ex - lidW * 0.5,
            lidTop,
            lidW,
            lidH + 2
          );

          // Subtle eyelash crease at the lower edge of the blinking lid
          ctx.beginPath();
          ctx.moveTo(ex - eyeR * 0.95, lidTop + lidH);
          ctx.quadraticCurveTo(ex, lidTop + lidH + eyeR * 0.18 * spring.blink, ex + eyeR * 0.95, lidTop + lidH);
          ctx.strokeStyle = 'rgba(28, 16, 14, 0.65)';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          ctx.restore();
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
      className={`w-full h-full object-cover select-none pointer-events-none ${className}`}
      data-character-id={characterId}
      data-speaking={isSpeaking ? 'true' : 'false'}
      data-engine="nanobanana-2.1-60fps"
    />
  );
};

export default NanoBananaLipSyncCanvas;
