"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AvatarGender, LanguageCode } from '@/store/useLanguagesStore';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  Gauge, 
  Pause,
  Award
} from 'lucide-react';
import { 
  playUniversalIskoolVoice, 
  stopAllIskoolAudio,
  MULTILINGUAL_HISTORICAL_FIGURES,
  getHistoricalMouthConfig,
  CharacterAnatomicalMouth
} from '@/lib/historicalVoiceEngine';

interface Props {
  gender: AvatarGender;
  name: string;
  language: LanguageCode;
  voiceId: string;
  speechRate?: number;
  onSpeechRateChange?: (rate: number) => void;
  isPlaying?: boolean;
  isListening?: boolean;
  avatarMood?: 'idle' | 'speaking' | 'listening' | 'celebrating' | 'encouraging';
  currentText?: string;
  translationText?: string;
  phoneticTip?: string;
  onRepeat?: () => void;
  onStop?: () => void;
  audioElement?: HTMLAudioElement | null;
  className?: string;
  avatarImage?: string;
  historicalFigureId?: string;
  historicalEra?: string;
  isLightMode?: boolean;
  variant?: 'card' | 'stage';
}

type IdleGesture = 'breathe' | 'look_left' | 'look_right' | 'subtle_nod' | 'brow_focus' | 'attentive_lean';

interface AvatarKineticRig {
  head: { cx: number; cy: number; rx: number; ry: number; pivotX: number; pivotY: number };
  leftHand: { cx: number; cy: number; rx: number; ry: number; pivotX: number; pivotY: number };
  rightHand: { cx: number; cy: number; rx: number; ry: number; pivotX: number; pivotY: number };
  eyes: { cx: number; cy: number; rx: number; ry: number };
}

function getAvatarKineticRig(key?: string): AvatarKineticRig {
  const norm = (key || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (norm.includes('arthur') || (norm.includes('male') && !norm.includes('ada') && !norm.includes('claire') && !norm.includes('female'))) {
    return {
      head: { cx: 45, cy: 23, rx: 19, ry: 21, pivotX: 45, pivotY: 38 },
      leftHand: { cx: 36, cy: 69, rx: 16, ry: 16, pivotX: 30, pivotY: 74 },
      rightHand: { cx: 80, cy: 56, rx: 18, ry: 18, pivotX: 74, pivotY: 66 },
      eyes: { cx: 45, cy: 21, rx: 16, ry: 6 }
    };
  }

  if (norm.includes('claire') || norm.includes('sophie') || norm.includes('female')) {
    return {
      head: { cx: 52, cy: 25, rx: 21, ry: 23, pivotX: 52, pivotY: 42 },
      leftHand: { cx: 14, cy: 67, rx: 16, ry: 16, pivotX: 20, pivotY: 74 },
      rightHand: { cx: 84, cy: 64, rx: 16, ry: 16, pivotX: 78, pivotY: 74 },
      eyes: { cx: 52, cy: 26, rx: 18, ry: 7 }
    };
  }

  if (norm.includes('shakespeare')) {
    return {
      head: { cx: 51, cy: 22, rx: 20, ry: 22, pivotX: 51, pivotY: 37 },
      leftHand: { cx: 16, cy: 58, rx: 16, ry: 16, pivotX: 20, pivotY: 68 },
      rightHand: { cx: 76, cy: 66, rx: 20, ry: 22, pivotX: 70, pivotY: 74 },
      eyes: { cx: 51, cy: 22, rx: 16, ry: 6 }
    };
  }

  if (norm.includes('ada') || norm.includes('lovelace')) {
    return {
      head: { cx: 50, cy: 24, rx: 21, ry: 23, pivotX: 50, pivotY: 40 },
      leftHand: { cx: 18, cy: 68, rx: 16, ry: 16, pivotX: 24, pivotY: 76 },
      rightHand: { cx: 82, cy: 74, rx: 18, ry: 20, pivotX: 76, pivotY: 80 },
      eyes: { cx: 50, cy: 27, rx: 18, ry: 6 }
    };
  }

  if (norm.includes('lincoln') || norm.includes('abraham')) {
    return {
      head: { cx: 51, cy: 20, rx: 18, ry: 21, pivotX: 51, pivotY: 36 },
      leftHand: { cx: 24, cy: 68, rx: 16, ry: 16, pivotX: 28, pivotY: 75 },
      rightHand: { cx: 78, cy: 64, rx: 18, ry: 18, pivotX: 74, pivotY: 72 },
      eyes: { cx: 51, cy: 20, rx: 16, ry: 6 }
    };
  }

  if (norm.includes('napoleon')) {
    return {
      head: { cx: 50, cy: 24, rx: 21, ry: 22, pivotX: 50, pivotY: 38 },
      leftHand: { cx: 28, cy: 70, rx: 16, ry: 16, pivotX: 32, pivotY: 76 },
      rightHand: { cx: 78, cy: 60, rx: 18, ry: 18, pivotX: 72, pivotY: 68 },
      eyes: { cx: 50, cy: 24, rx: 16, ry: 6 }
    };
  }

  if (norm.includes('curie') || norm.includes('marie')) {
    return {
      head: { cx: 52, cy: 19, rx: 20, ry: 21, pivotX: 52, pivotY: 32 },
      leftHand: { cx: 40, cy: 68, rx: 16, ry: 16, pivotX: 42, pivotY: 74 },
      rightHand: { cx: 62, cy: 68, rx: 16, ry: 16, pivotX: 60, pivotY: 74 },
      eyes: { cx: 52, cy: 19, rx: 16, ry: 6 }
    };
  }

  return {
    head: { cx: 50, cy: 24, rx: 20, ry: 22, pivotX: 50, pivotY: 38 },
    leftHand: { cx: 22, cy: 68, rx: 16, ry: 16, pivotX: 25, pivotY: 74 },
    rightHand: { cx: 78, cy: 64, rx: 18, ry: 18, pivotX: 75, pivotY: 70 },
    eyes: { cx: 50, cy: 22, rx: 16, ry: 6 }
  };
}

export const HumanGesticulatingAvatar: React.FC<Props> = ({
  gender,
  name,
  language,
  voiceId,
  speechRate: externalSpeechRate = 1.0,
  onSpeechRateChange,
  isPlaying: externalIsPlaying = false,
  isListening = false,
  avatarMood = 'idle',
  currentText = '',
  translationText = '',
  phoneticTip = '',
  onRepeat,
  onStop,
  audioElement,
  className = '',
  avatarImage,
  historicalFigureId,
  historicalEra,
  isLightMode = false,
  variant = 'card'
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const [internalSpeechRate, setInternalSpeechRate] = useState<number>(externalSpeechRate);
  const isPlaying = externalIsPlaying || internalPlaying;
  const speechRate = externalSpeechRate ?? internalSpeechRate;

  // Estados de animación biológica y cinemática en tiempo real
  const [mouthOpenRatio, setMouthOpenRatio] = useState<number>(0);
  const [mouthWidthRatio, setMouthWidthRatio] = useState<number>(0.5);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  // Estados dinámicos de gesticulación: Cabeza, Manos y Tórax
  const [chestElevation, setChestElevation] = useState<number>(0);
  const [chestScale, setChestScale] = useState<number>(1.0);
  const [headMotion, setHeadMotion] = useState<{ pitch: number; roll: number; yaw: number; y: number }>({ pitch: 0, roll: 0, yaw: 0, y: 0 });
  const [leftHandMotion, setLeftHandMotion] = useState<{ x: number; y: number; rot: number; scale: number }>({ x: 0, y: 0, rot: 0, scale: 1 });
  const [rightHandMotion, setRightHandMotion] = useState<{ x: number; y: number; rot: number; scale: number }>({ x: 0, y: 0, rot: 0, scale: 1 });

  const [activeGesture, setActiveGesture] = useState<IdleGesture | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioControllerRef = useRef<any>(null);

  // 1. Identificar personaje histórico y su configuración anatómica
  const matchedFigure = useMemo(() => {
    if (historicalFigureId) {
      return MULTILINGUAL_HISTORICAL_FIGURES.find(f => f.id === historicalFigureId);
    }
    const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return MULTILINGUAL_HISTORICAL_FIGURES.find(f => {
      const fNorm = f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const fId = f.id.toLowerCase();
      return norm.includes(fId) || fNorm.includes(norm) || norm.includes(fNorm);
    });
  }, [historicalFigureId, name]);

  const isHistorical = Boolean(matchedFigure || avatarImage?.includes('/historical/'));

  const mouthCfg: CharacterAnatomicalMouth = useMemo(() => {
    const targetKey = matchedFigure?.id || historicalFigureId || name || avatarImage || (gender === 'female' ? 'female' : 'male');
    return getHistoricalMouthConfig(targetKey);
  }, [matchedFigure, historicalFigureId, name, avatarImage, gender]);

  const avatarKineticRig: AvatarKineticRig = useMemo(() => {
    const targetKey = matchedFigure?.id || historicalFigureId || name || avatarImage || (gender === 'female' ? 'claire' : 'arthur');
    return getAvatarKineticRig(targetKey);
  }, [matchedFigure, historicalFigureId, name, avatarImage, gender]);

  // Resolución de la imagen del avatar en 3D
  const avatarImageSrc = useMemo(() => {
    if (matchedFigure?.avatarImage && matchedFigure.avatarImage.includes('/3d/')) {
      return matchedFigure.avatarImage;
    }
    if (avatarImage && avatarImage.includes('/3d/')) {
      return avatarImage;
    }
    const figureId = matchedFigure?.id || historicalFigureId;
    if (figureId === 'shakespeare') return '/images/languages/3d/shakespeare_3d.webp';
    if (figureId === 'ada_lovelace') return '/images/languages/3d/ada_lovelace_3d.webp';
    if (figureId === 'abraham_lincoln') return '/images/languages/3d/abraham_lincoln_3d.webp';
    if (figureId === 'marie_curie') return '/images/languages/3d/marie_curie_3d.webp';
    if (figureId === 'napoleon') return '/images/languages/3d/napoleon_3d.webp';

    if (avatarImage && !avatarImage.includes('/historical/')) return avatarImage;

    return gender === 'female' 
      ? '/images/languages/3d/mentor_female_3d.webp' 
      : '/images/languages/3d/mentor_male_3d_v2.webp';
  }, [avatarImage, matchedFigure, historicalFigureId, gender]);

  const avatarDisplayTitle = useMemo(() => {
    if (matchedFigure?.name) return matchedFigure.name;
    if (name) return name;
    if (gender === 'female') {
      return language === 'fr' ? 'Mme. Sophie' : 'Prof. Claire';
    }
    return language === 'fr' ? 'Prof. Henri' : 'Prof. Arthur';
  }, [matchedFigure, name, gender, language]);

  const displayedEra = matchedFigure?.era || historicalEra || (language === 'fr' ? 'Atelier de Français' : 'English Masterclass');

  // Control de reproducción de voz para modo tarjeta
  const handlePlayVoiceSample = async () => {
    if (isPlaying) {
      stopAllIskoolAudio();
      audioControllerRef.current?.stop();
      setInternalPlaying(false);
      onStop?.();
      return;
    }
    if (onRepeat) {
      onRepeat();
      return;
    }
    if (!currentText) return;
    try {
      setInternalPlaying(true);
      audioControllerRef.current = await playUniversalIskoolVoice({
        text: currentText,
        characterName: avatarDisplayTitle,
        voiceId: matchedFigure?.voiceId || voiceId,
        language,
        gender: matchedFigure?.gender || gender,
        rate: speechRate,
        onStart: () => setInternalPlaying(true),
        onEnd: () => setInternalPlaying(false),
        onError: () => setInternalPlaying(false)
      });
    } catch {
      setInternalPlaying(false);
    }
  };

  // Parpadeo espontáneo biológico (cada 3.2s a 5.2s)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let isSubscribed = true;

    const scheduleNextBlink = () => {
      const interval = 3200 + Math.random() * 2000;
      blinkTimer = setTimeout(() => {
        if (!isSubscribed) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (!isSubscribed) return;
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, interval);
    };

    scheduleNextBlink();
    return () => {
      isSubscribed = false;
      clearTimeout(blinkTimer);
    };
  }, []);

  // Micro-gestos en reposo (mirada, asentimiento sutil, inclinación atenta)
  useEffect(() => {
    if (isPlaying) {
      setActiveGesture(null);
      return;
    }

    let gestureTimer: NodeJS.Timeout;
    let isSubscribed = true;
    const idleGestures: IdleGesture[] = ['look_left', 'look_right', 'subtle_nod', 'brow_focus'];

    const scheduleNextGesture = () => {
      const interval = 4500 + Math.random() * 4000;
      gestureTimer = setTimeout(() => {
        if (!isSubscribed || isPlaying) return;
        const chosen = idleGestures[Math.floor(Math.random() * idleGestures.length)];
        setActiveGesture(chosen);

        setTimeout(() => {
          if (!isSubscribed) return;
          setActiveGesture(null);
          scheduleNextGesture();
        }, 1200 + Math.random() * 800);
      }, interval);
    };

    scheduleNextGesture();
    return () => {
      isSubscribed = false;
      clearTimeout(gestureTimer);
    };
  }, [isPlaying]);

  // Analizador Espectral DSP con Web Audio API (F1 y F2 Formants)
  useEffect(() => {
    if (!audioElement || typeof window === 'undefined') return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.65;
        }
      }

      if (audioContextRef.current && analyserRef.current && !sourceNodeRef.current) {
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch {
          // Nodo ya conectado
        }
      }
    } catch (e) {
      console.warn('DSP AudioAnalyser fallback activo:', e);
    }
  }, [audioElement]);

  // =========================================================================
  // MOTOR KINÉTICO INTEGRAL: MANOS, CABEZA, GESTOS Y LIP-SYNC EN 60 FPS
  // =========================================================================
  useEffect(() => {
    let phase = 0;
    let smoothedF1 = 0;
    let smoothedF2 = 0.5;

    let curHeadPitch = 0;
    let curHeadRoll = 0;
    let curHeadYaw = 0;
    let curHeadY = 0;

    let curLeftHandX = 0;
    let curLeftHandY = 0;
    let curLeftHandRot = 0;
    let curLeftHandScale = 1;

    let curRightHandX = 0;
    let curRightHandY = 0;
    let curRightHandRot = 0;
    let curRightHandScale = 1;

    const updateKineticPuppetry = () => {
      phase += isPlaying ? (0.16 * speechRate) : 0.035;

      // 1. Respiración pulmonar sinusoidal continua
      const breathSin = Math.sin(phase * 0.7);
      const targetChestY = breathSin * 2.2;
      const targetChestScale = 1.0 + breathSin * 0.005;
      setChestElevation(targetChestY);
      setChestScale(targetChestScale);

      // 2. Modulación Fonética y Formantes
      let f1Energy = 0;
      let f2Energy = 0;

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let f1Sum = 0; let f1Count = 0;
        for (let i = 4; i <= Math.min(14, bufferLength - 1); i++) {
          f1Sum += dataArray[i]; f1Count++;
        }
        f1Energy = f1Count > 0 ? f1Sum / f1Count : 0;

        let f2Sum = 0; let f2Count = 0;
        for (let i = 16; i <= Math.min(34, bufferLength - 1); i++) {
          f2Sum += dataArray[i]; f2Count++;
        }
        f2Energy = f2Count > 0 ? f2Sum / f2Count : 0;
      }

      // Síntesis orgánica de amplitud fonética en habla
      const oscA = Math.sin(phase * 1.5) * 0.45 + 0.5;
      const oscB = Math.sin(phase * 2.8 + 0.6) * 0.25;
      const speechPulse = isPlaying ? Math.max(0.12, Math.min(0.96, oscA + oscB)) : 0;
      const rawF1 = f1Energy > 10 ? Math.min(1, Math.max(0, (f1Energy - 10) / 45)) : speechPulse;
      const rawF2 = f1Energy > 10 ? Math.min(1, Math.max(0.1, (f2Energy / (f1Energy + 0.1)) * 0.95)) : (0.5 + Math.sin(phase * 0.8) * 0.2);

      smoothedF1 = smoothedF1 * 0.68 + rawF1 * 0.32;
      smoothedF2 = smoothedF2 * 0.75 + rawF2 * 0.25;

      setMouthOpenRatio(smoothedF1);
      setMouthWidthRatio(smoothedF2);

      // 3. Articulación Dinámica de la Cabeza
      let targetHeadPitch = 0;
      let targetHeadRoll = 0;
      let targetHeadYaw = 0;
      let targetHeadY = targetChestY * 0.5;

      if (isPlaying) {
        // Asentimiento rítmico, inclinación didáctica y sutil giro en 3D
        targetHeadPitch = Math.sin(phase * 2.2) * 3.6 + Math.cos(phase * 3.8) * 1.4;
        targetHeadRoll = Math.sin(phase * 0.9) * 2.8;
        targetHeadYaw = Math.cos(phase * 0.6) * 3.2;
        targetHeadY += Math.sin(phase * 2.2) * 1.6;
      } else if (isListening) {
        targetHeadRoll = 2.4;
        targetHeadPitch = 2.0;
        targetHeadY -= 1.5;
      } else if (activeGesture === 'look_left') {
        targetHeadYaw = -4.5;
        targetHeadRoll = -1.2;
      } else if (activeGesture === 'look_right') {
        targetHeadYaw = 4.5;
        targetHeadRoll = 1.2;
      } else if (activeGesture === 'subtle_nod') {
        targetHeadPitch = 4.0;
        targetHeadY += 2.0;
      } else if (activeGesture === 'brow_focus') {
        targetHeadPitch = -2.5;
        targetHeadY -= 1.5;
      }

      // 4. Gesticulación Dinámica de Manos (Izquierda y Derecha)
      let targetLeftHandY = targetChestY;
      let targetLeftHandX = 0;
      let targetLeftHandRot = 0;
      let targetLeftHandScale = 1.0;

      let targetRightHandY = targetChestY;
      let targetRightHandX = 0;
      let targetRightHandRot = 0;
      let targetRightHandScale = 1.0;

      if (isPlaying) {
        // Mano izquierda (pantalla): elevación y barrido en cadencia oratoria
        targetLeftHandY = -8 - Math.sin(phase * 1.6) * 14 - smoothedF1 * 8;
        targetLeftHandX = Math.cos(phase * 1.2) * 5;
        targetLeftHandRot = -3 + Math.sin(phase * 1.6) * 7;
        targetLeftHandScale = 1.02 + smoothedF1 * 0.03;

        // Mano derecha (pantalla): palma abierta acogedora / énfasis
        targetRightHandY = -12 - Math.cos(phase * 1.4 + 0.5) * 16 - smoothedF1 * 10;
        targetRightHandX = 4 + Math.sin(phase * 1.4) * 6;
        targetRightHandRot = 4 + Math.cos(phase * 1.4) * 8;
        targetRightHandScale = 1.03 + smoothedF1 * 0.04;
      } else {
        // En reposo: micro-ondulación flotante acompasada con la respiración
        targetLeftHandY = targetChestY * 1.2;
        targetRightHandY = targetChestY * 1.2;
      }

      // 5. Inercia IIR Orgánica (Filtro Suavizador de Masa Muscular)
      curHeadPitch = curHeadPitch * 0.72 + targetHeadPitch * 0.28;
      curHeadRoll = curHeadRoll * 0.72 + targetHeadRoll * 0.28;
      curHeadYaw = curHeadYaw * 0.72 + targetHeadYaw * 0.28;
      curHeadY = curHeadY * 0.72 + targetHeadY * 0.28;

      curLeftHandX = curLeftHandX * 0.75 + targetLeftHandX * 0.25;
      curLeftHandY = curLeftHandY * 0.75 + targetLeftHandY * 0.25;
      curLeftHandRot = curLeftHandRot * 0.75 + targetLeftHandRot * 0.25;
      curLeftHandScale = curLeftHandScale * 0.75 + targetLeftHandScale * 0.25;

      curRightHandX = curRightHandX * 0.75 + targetRightHandX * 0.25;
      curRightHandY = curRightHandY * 0.75 + targetRightHandY * 0.25;
      curRightHandRot = curRightHandRot * 0.75 + targetRightHandRot * 0.25;
      curRightHandScale = curRightHandScale * 0.75 + targetRightHandScale * 0.25;

      setHeadMotion({
        pitch: curHeadPitch,
        roll: curHeadRoll,
        yaw: curHeadYaw,
        y: curHeadY
      });

      setLeftHandMotion({
        x: curLeftHandX,
        y: curLeftHandY,
        rot: curLeftHandRot,
        scale: curLeftHandScale
      });

      setRightHandMotion({
        x: curRightHandX,
        y: curRightHandY,
        rot: curRightHandRot,
        scale: curRightHandScale
      });

      animationFrameRef.current = requestAnimationFrame(updateKineticPuppetry);
    };

    animationFrameRef.current = requestAnimationFrame(updateKineticPuppetry);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isListening, activeGesture, speechRate]);

  const languageLabel = language === 'fr' ? 'Français' : 'English';
  const languageFlag = language === 'fr' ? '🇫🇷' : '🇬🇧';

  const SPEED_OPTIONS = [
    { value: 0.6, label: '0.6x Lento' },
    { value: 0.75, label: '0.75x Didáctico' },
    { value: 0.9, label: '0.9x Pausado' },
    { value: 1.0, label: '1.0x Normal' },
    { value: 1.2, label: '1.2x Fluido' }
  ];

  // Componente interno del Personaje Articulado (utilizado en ambos modos)
  const renderLivingPuppet = () => {
    const rig = avatarKineticRig;

    return (
      <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
        {/* 1. Capa Base: Torso y Cuerpo (Respiración diafragmática) */}
        <div 
          className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none"
          style={{
            transform: `translate3d(0, ${chestElevation}px, 0) scale(${chestScale})`,
            transformOrigin: '50% 88%',
            transition: 'transform 80ms ease-out'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageSrc}
            alt={avatarDisplayTitle}
            className="w-full h-full object-contain object-bottom select-none pointer-events-none drop-shadow-2xl"
          />
        </div>

        {/* 2. Capa Cinética de Cabeza y Cuello (Asentimientos 3D, inclinación didáctica y sutil giro) */}
        <div
          className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none"
          style={{
            maskImage: `radial-gradient(ellipse ${rig.head.rx}% ${rig.head.ry}% at ${rig.head.cx}% ${rig.head.cy}%, black 65%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${rig.head.rx}% ${rig.head.ry}% at ${rig.head.cx}% ${rig.head.cy}%, black 65%, transparent 100%)`,
            transform: `perspective(650px) translate3d(0, ${headMotion.y}px, 0) rotateX(${headMotion.pitch}deg) rotateY(${headMotion.yaw}deg) rotateZ(${headMotion.roll}deg)`,
            transformOrigin: `${rig.head.pivotX}% ${rig.head.pivotY}%`,
            transition: 'transform 60ms ease-out'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageSrc}
            alt=""
            className="w-full h-full object-contain object-bottom select-none pointer-events-none"
          />
        </div>

        {/* 3. Capa Cinética de Mano Izquierda (Gesticulación oratoria, elevación y muñeca) */}
        <div
          className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none"
          style={{
            maskImage: `radial-gradient(ellipse ${rig.leftHand.rx}% ${rig.leftHand.ry}% at ${rig.leftHand.cx}% ${rig.leftHand.cy}%, black 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${rig.leftHand.rx}% ${rig.leftHand.ry}% at ${rig.leftHand.cx}% ${rig.leftHand.cy}%, black 60%, transparent 100%)`,
            transform: `translate3d(${leftHandMotion.x}px, ${leftHandMotion.y}px, 0) rotate(${leftHandMotion.rot}deg) scale(${leftHandMotion.scale})`,
            transformOrigin: `${rig.leftHand.pivotX}% ${rig.leftHand.pivotY}%`,
            transition: 'transform 65ms ease-out'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageSrc}
            alt=""
            className="w-full h-full object-contain object-bottom select-none pointer-events-none"
          />
        </div>

        {/* 4. Capa Cinética de Mano Derecha (Gesticulación abierta, barrido y énfasis) */}
        <div
          className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none"
          style={{
            maskImage: `radial-gradient(ellipse ${rig.rightHand.rx}% ${rig.rightHand.ry}% at ${rig.rightHand.cx}% ${rig.rightHand.cy}%, black 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${rig.rightHand.rx}% ${rig.rightHand.ry}% at ${rig.rightHand.cx}% ${rig.rightHand.cy}%, black 60%, transparent 100%)`,
            transform: `translate3d(${rightHandMotion.x}px, ${rightHandMotion.y}px, 0) rotate(${rightHandMotion.rot}deg) scale(${rightHandMotion.scale})`,
            transformOrigin: `${rig.rightHand.pivotX}% ${rig.rightHand.pivotY}%`,
            transition: 'transform 65ms ease-out'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageSrc}
            alt=""
            className="w-full h-full object-contain object-bottom select-none pointer-events-none"
          />
        </div>

        {/* 5. Capa de Pestañeo Realista Natural */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-120 ease-in-out"
          style={{
            opacity: isBlinking ? 0.95 : 0,
            maskImage: `radial-gradient(ellipse ${rig.eyes.rx}% ${rig.eyes.ry}% at ${rig.eyes.cx}% ${rig.eyes.cy}%, black 50%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${rig.eyes.rx}% ${rig.eyes.ry}% at ${rig.eyes.cx}% ${rig.eyes.cy}%, black 50%, transparent 100%)`,
            backgroundColor: 'rgba(30, 20, 25, 0.88)',
            transform: `perspective(650px) translate3d(0, ${headMotion.y}px, 0) rotateX(${headMotion.pitch}deg) rotateY(${headMotion.yaw}deg) rotateZ(${headMotion.roll}deg)`,
            transformOrigin: `${rig.head.pivotX}% ${rig.head.pivotY}%`
          }}
        />

        {/* 6. LIP-SYNC ANATÓMICO SVG DE ALTA PRECISIÓN (Espacio 1024x1024) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
          style={{
            transform: `perspective(650px) translate3d(0, ${headMotion.y}px, 0) rotateX(${headMotion.pitch}deg) rotateY(${headMotion.yaw}deg) rotateZ(${headMotion.roll}deg)`,
            transformOrigin: `${rig.head.pivotX}% ${rig.head.pivotY}%`,
            transition: 'transform 60ms ease-out'
          }}
        >
          <svg 
            viewBox="0 0 1024 1024" 
            className="w-full h-full pointer-events-none select-none"
          >
            <defs>
              <filter 
                id={`avatarFeather_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                x="-20%" 
                y="-20%" 
                width="140%" 
                height="140%"
              >
                <feGaussianBlur stdDeviation="0.9" />
              </filter>

              <radialGradient 
                id={`avatarCavity_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                cx="50%" 
                cy="35%" 
                r="65%"
              >
                <stop offset="0%" stopColor={mouthCfg.cavityDarkColor} />
                <stop offset="65%" stopColor={mouthCfg.cavityMidColor} />
                <stop offset="100%" stopColor={mouthCfg.cavityRimColor} />
              </radialGradient>

              <linearGradient 
                id={`avatarTeeth_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={mouthCfg.teethColor} stopOpacity="0.96" />
                <stop offset="70%" stopColor="#ded5c4" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#8a7864" stopOpacity="0.10" />
              </linearGradient>

              <linearGradient 
                id={`avatarLowerLip_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={mouthCfg.lowerLipRimColor} />
                <stop offset="65%" stopColor="rgba(190, 80, 85, 0.70)" />
                <stop offset="100%" stopColor="rgba(215, 110, 105, 0.15)" />
              </linearGradient>
            </defs>

            {isPlaying && mouthOpenRatio > 0.05 && (() => {
              const widthOffset = (mouthWidthRatio - 0.5) * 6;
              const effX1 = mouthCfg.x1 - widthOffset;
              const effX2 = mouthCfg.x2 + widthOffset;
              const verticalDrop = mouthOpenRatio * mouthCfg.maxOpening;

              const halfMouthWidth = (effX2 - effX1) / 2;
              const teethHalfWidth = halfMouthWidth * 0.62;
              const teethHeight = Math.min(verticalDrop * 0.45, 5.0);
              const lipThickness = Math.min(4.0, 2.0 + verticalDrop * 0.2);
              const upperArchY = mouthCfg.mustacheCover 
                ? mouthCfg.cy 
                : mouthCfg.cy - mouthOpenRatio * 1.5;

              return (
                <g filter={`url(#avatarFeather_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`}>
                  {/* 1. Cavidad Bucal Profunda */}
                  <path 
                    d={`M ${effX1} ${mouthCfg.y1} Q ${mouthCfg.cx} ${upperArchY} ${effX2} ${mouthCfg.y2} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop} ${effX1} ${mouthCfg.y1} Z`} 
                    fill={`url(#avatarCavity_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                  />

                  {/* 2. Dientes Superiores Naturales */}
                  <path 
                    d={`M ${mouthCfg.cx - teethHalfWidth} ${mouthCfg.cy - 0.8} Q ${mouthCfg.cx} ${mouthCfg.cy - 1.8} ${mouthCfg.cx + teethHalfWidth} ${mouthCfg.cy - 1.0} Q ${mouthCfg.cx + teethHalfWidth} ${mouthCfg.cy - 0.8 + teethHeight} Q ${mouthCfg.cx} ${mouthCfg.cy + teethHeight} ${mouthCfg.cx - teethHalfWidth} ${mouthCfg.cy - 0.8 + teethHeight} Z`} 
                    fill={`url(#avatarTeeth_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                  />

                  {/* 3. Sombra de Lengua Interior */}
                  {mouthOpenRatio > 0.32 && (
                    <ellipse 
                      cx={mouthCfg.cx} 
                      cy={mouthCfg.cy + verticalDrop * 0.68} 
                      rx={halfMouthWidth * 0.46} 
                      ry={Math.min(verticalDrop * 0.35, 3.2)} 
                      fill="#3d0a10" 
                      opacity={0.90} 
                    />
                  )}

                  {/* 4. Labio Inferior Acompañando el Descenso Mandibular */}
                  <path 
                    d={`M ${effX1 + 1.2} ${mouthCfg.y1 + 0.3} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop} ${effX2 - 1.2} ${mouthCfg.y2 + 0.3} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop + lipThickness} ${effX1 + 1.2} ${mouthCfg.y1 + 0.3} Z`} 
                    fill={`url(#avatarLowerLip_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                    opacity={0.95} 
                  />
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    );
  };

  // =========================================================================
  // MODO 1: ESCENARIO DEL STUDIO (variant === 'stage')
  // Se inserta limpiamente en el panel del taller pedagógico
  // =========================================================================
  if (variant === 'stage') {
    return (
      <div className={`relative w-full h-full flex items-end justify-start select-none ${className}`}>
        {renderLivingPuppet()}
      </div>
    );
  }

  // =========================================================================
  // MODO 2: TARJETA COMPLETA GAMIFICADA (variant === 'card')
  // =========================================================================
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Marco Principal Gamificado del Avatar */}
      <div className={`relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 ${
        isHistorical ? 'border-amber-500/50 shadow-amber-500/20' : 'border-indigo-500/40 shadow-indigo-500/20'
      } bg-gradient-to-b from-slate-900 via-slate-950 to-black group`}>
        
        {/* Halo de luz ambiental reactivo */}
        <div 
          className={`absolute -inset-4 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isPlaying 
              ? (isHistorical ? 'bg-amber-500/35 opacity-100 animate-pulse' : 'bg-cyan-500/35 opacity-100 animate-pulse')
              : isListening 
                ? 'bg-emerald-500/40 opacity-100 animate-pulse' 
                : avatarMood === 'celebrating'
                  ? 'bg-yellow-400/45 opacity-100'
                  : (isHistorical ? 'bg-amber-600/20 opacity-60' : 'bg-indigo-600/20 opacity-60')
          }`}
        />

        {/* Contenedor del Personaje Articulado */}
        {renderLivingPuppet()}

        {/* Badge Superior: Personaje, Época y Bandera */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white shadow-xl max-w-[65%]">
            <span className="text-base shrink-0">{matchedFigure?.avatarEmoji || languageFlag}</span>
            <div className="flex flex-col truncate">
              <span className="text-xs font-black tracking-wide leading-none truncate text-white">
                {avatarDisplayTitle}
              </span>
              <span className="text-[10px] text-amber-300 font-semibold leading-none mt-0.5 truncate">
                {isHistorical ? displayedEra : `${languageLabel} · Mentor`}
              </span>
            </div>
          </div>

          {/* Indicador de Estado Gamificado */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-xs font-bold shadow-xl shrink-0">
            {isPlaying && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-300 text-[11px] font-mono">
                  {isHistorical ? '1ª Persona' : 'Hablando...'}
                </span>
              </>
            )}
            {isListening && (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-[11px]">Escuchando...</span>
              </>
            )}
            {!isPlaying && !isListening && avatarMood === 'celebrating' && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-[11px]">¡Excelente!</span>
              </>
            )}
            {!isPlaying && !isListening && avatarMood !== 'celebrating' && (
              <>
                <span className={`w-2 h-2 rounded-full ${isHistorical ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className={`${isHistorical ? 'text-amber-300' : 'text-slate-300'} text-[11px]`}>
                  {activeGesture ? 'Atento...' : 'Listo'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Ondas Sonoras Visuales mientras habla */}
        {isPlaying && (
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-center gap-1.5 h-7 pointer-events-none z-20">
            {[45, 80, 100, 65, 90, 100, 75, 95, 55].map((heightPct, idx) => (
              <span
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-75 shadow-xs ${
                  isHistorical 
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-300' 
                    : 'bg-gradient-to-t from-cyan-400 to-teal-300'
                }`}
                style={{
                  height: `${Math.max(5, heightPct * Math.max(0.2, mouthOpenRatio))}px`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra de Control de Velocidad y Accesibilidad Didáctica */}
      <div className={`mt-3.5 w-full max-w-sm flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border shadow-md text-xs transition-colors ${
        isLightMode 
          ? 'bg-white border-slate-200 text-slate-800' 
          : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
      }`}>
        <div className={`flex items-center gap-1.5 font-bold shrink-0 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
          <Gauge className="w-4 h-4" />
          <span>Velocidad:</span>
        </div>

        <div className="flex items-center gap-1 py-0.5">
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setInternalSpeechRate(opt.value);
                onSpeechRateChange?.(opt.value);
              }}
              className={`px-2 py-1 rounded-lg font-mono font-bold text-[10px] transition-all cursor-pointer ${
                Math.abs(speechRate - opt.value) < 0.05
                  ? (isHistorical ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105' : 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105')
                  : (isLightMode 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700')
              }`}
              title={opt.label}
            >
              {opt.value}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePlayVoiceSample}
          className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1 ${
            isPlaying 
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
              : (isHistorical ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black' : 'bg-indigo-600 hover:bg-indigo-500 text-white')
          }`}
          title={isPlaying ? "Detener locución" : "Escuchar pronunciación del personaje"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold">{isPlaying ? 'Detener' : 'Escuchar'}</span>
        </button>
      </div>

      {/* Globo de Diálogo / Subtítulo con Traducción */}
      {currentText && (
        <div className={`mt-3 w-full max-w-lg p-4 rounded-2xl border shadow-xl space-y-2 backdrop-blur-md transition-colors ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
            : (isHistorical ? 'bg-slate-900/95 border-amber-500/40 shadow-amber-500/10' : 'bg-slate-900/95 border-indigo-700/50')
        }`}>
          <div className="flex items-start justify-between gap-3">
            <p className={`text-sm sm:text-base font-medium leading-relaxed font-serif ${
              isLightMode ? 'text-slate-800' : 'text-white'
            }`}>
              &ldquo;{currentText}&rdquo;
            </p>
            {translationText && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`text-[11px] px-2 py-0.5 rounded-md border shrink-0 cursor-pointer font-bold transition-colors ${
                  isLightMode
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-indigo-950 border-indigo-700/60 text-indigo-300 hover:text-white'
                }`}
              >
                {showTranslation ? 'Ocultar' : 'Traducir'}
              </button>
            )}
          </div>

          {showTranslation && translationText && (
            <p className={`text-xs font-serif italic border-t pt-2 ${
              isLightMode ? 'text-teal-700 border-slate-200' : 'text-teal-300 border-indigo-900/60'
            }`}>
              Traducción: {translationText}
            </p>
          )}

          {phoneticTip && (
            <div className={`text-[11px] font-mono p-2 rounded-xl flex items-center gap-1.5 border ${
              isLightMode
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300/90'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Tip fonético: {phoneticTip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
