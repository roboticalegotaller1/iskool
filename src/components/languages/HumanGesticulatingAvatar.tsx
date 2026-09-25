"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarGender, LanguageCode } from '@/store/useLanguagesStore';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  Gauge, 
  RotateCcw, 
  Play, 
  Pause,
  Award,
  BookOpen,
  Crown,
  Scroll,
  Shield,
  Compass
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
  audioElement?: HTMLAudioElement | null;
  className?: string;
  avatarImage?: string;
  historicalFigureId?: string;
  historicalEra?: string;
}

type IdleGesture = 'breathe' | 'look_left' | 'look_right' | 'subtle_nod' | 'brow_focus' | 'attentive_lean';

export const HumanGesticulatingAvatar: React.FC<Props> = ({
  gender,
  name,
  language,
  voiceId,
  speechRate = 1.0,
  onSpeechRateChange,
  isPlaying: externalIsPlaying = false,
  isListening = false,
  avatarMood = 'idle',
  currentText = '',
  translationText = '',
  phoneticTip = '',
  onRepeat,
  audioElement,
  className = '',
  avatarImage,
  historicalFigureId,
  historicalEra
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const isPlaying = externalIsPlaying || internalPlaying;

  // Estados de articulación anatómica labial
  const [mouthOpenRatio, setMouthOpenRatio] = useState<number>(0); // 0 a 1
  const [mouthWidthRatio, setMouthWidthRatio] = useState<number>(0.5); // F2 formants / smile
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  // Estados de gesticulación en reposo / tiempos de espera (idle)
  const [activeGesture, setActiveGesture] = useState<IdleGesture | null>(null);
  const [chestElevation, setChestElevation] = useState<number>(0); // Micro-respiración sinusoidal
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [headYaw, setHeadYaw] = useState<number>(0);

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
    return getHistoricalMouthConfig(matchedFigure?.id || name);
  }, [matchedFigure, name]);

  // Resolución de la imagen del avatar
  const avatarImageSrc = useMemo(() => {
    if (avatarImage) return avatarImage;
    if (matchedFigure?.avatarImage) return matchedFigure.avatarImage;
    return gender === 'female' 
      ? '/images/languages/mentor_female.jpg' 
      : '/images/languages/mentor_male.jpg';
  }, [avatarImage, matchedFigure, gender]);

  const avatarDisplayTitle = useMemo(() => {
    if (matchedFigure?.name) return matchedFigure.name;
    if (name) return name;
    if (gender === 'female') {
      return language === 'fr' ? 'Mme. Sophie' : 'Prof. Claire';
    }
    return language === 'fr' ? 'Prof. Henri' : 'Prof. Arthur';
  }, [matchedFigure, name, gender, language]);

  const displayedEra = matchedFigure?.era || historicalEra || (language === 'fr' ? 'Atelier de Français' : 'English Masterclass');

  // Control de audio
  const handlePlayVoiceSample = async () => {
    if (isPlaying) {
      stopAllIskoolAudio();
      audioControllerRef.current?.stop();
      setInternalPlaying(false);
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

  // 2. Loop de Micro-Respiración Pulmonar y Tiempos de Espera (Idle)
  useEffect(() => {
    let breathTime = 0;
    let breathFrame: number;

    const animateBreathing = () => {
      breathTime += 0.035;
      // Ondulación sinusoidal orgánica de pecho/clavícula (~14 respiraciones por minuto)
      const sinVal = Math.sin(breathTime);
      setChestElevation(sinVal * 1.5);

      breathFrame = requestAnimationFrame(animateBreathing);
    };

    breathFrame = requestAnimationFrame(animateBreathing);
    return () => cancelAnimationFrame(breathFrame);
  }, []);

  // 3. Parpadeo Espontáneo Humano (Reflejo biológico cada 3.2s a 5.4s)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let isSubscribed = true;

    const scheduleNextBlink = () => {
      const interval = 3200 + Math.random() * 2200;
      blinkTimer = setTimeout(() => {
        if (!isSubscribed) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (!isSubscribed) return;
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, interval);
    };

    scheduleNextBlink();
    return () => {
      isSubscribed = false;
      clearTimeout(blinkTimer);
    };
  }, []);

  // 4. Micro-Gesticulaciones Ocasionales en Reposo (Saccades & Micro-Tilts en Tiempos de Espera)
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

        // Desvanecimiento natural del micro-gesto
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

  // 5. Analizador Espectral DSP con Web Audio API para F1 / F2 Formants
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
          // El nodo ya pudo haber sido enlazado
        }
      }
    } catch (e) {
      console.warn('DSP AudioAnalyser fallback activo:', e);
    }
  }, [audioElement]);

  // 6. Loop de Lip-Sync de Alta Precisión (F1 Apertura + F2 Comisuras + Inercia IIR)
  useEffect(() => {
    let phase = 0;
    let smoothedF1 = 0;
    let smoothedF2 = 0.5;

    const updateLipSync = () => {
      if (isPlaying) {
        let f1Energy = 0;
        let f2Energy = 0;

        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          // F1: Formante Mandibular (bins 4 a 14 ~ 300Hz - 900Hz)
          let f1Sum = 0;
          let f1Count = 0;
          for (let i = 4; i <= Math.min(14, bufferLength - 1); i++) {
            f1Sum += dataArray[i];
            f1Count++;
          }
          f1Energy = f1Count > 0 ? f1Sum / f1Count : 0;

          // F2: Formante de Sonrisa / Comisura (bins 16 a 34 ~ 1200Hz - 2800Hz)
          let f2Sum = 0;
          let f2Count = 0;
          for (let i = 16; i <= Math.min(34, bufferLength - 1); i++) {
            f2Sum += dataArray[i];
            f2Count++;
          }
          f2Energy = f2Count > 0 ? f2Sum / f2Count : 0;
        }

        // Síntesis fonética armónica complementaria para cadencia natural humana
        phase += 0.24 * speechRate;
        const acousticOsc1 = Math.sin(phase) * 0.45 + 0.5;
        const acousticOsc2 = Math.sin(phase * 1.8 + 0.6) * 0.28;
        const organicEnergy = Math.max(0.08, Math.min(0.92, acousticOsc1 + acousticOsc2));

        const rawF1 = f1Energy > 10 
          ? Math.min(1, Math.max(0, (f1Energy - 10) / 45))
          : organicEnergy;

        const rawF2 = f1Energy > 10 
          ? Math.min(1, Math.max(0.1, (f2Energy / (f1Energy + 0.1)) * 0.95))
          : 0.5 + Math.sin(phase * 0.8) * 0.2;

        // Inercia IIR orgánica (simula masa muscular de la mandíbula y labios)
        smoothedF1 = smoothedF1 * 0.68 + rawF1 * 0.32;
        smoothedF2 = smoothedF2 * 0.75 + rawF2 * 0.25;

        setMouthOpenRatio(smoothedF1);
        setMouthWidthRatio(smoothedF2);

        // Micro-inclinación de cabeza conversacional
        setHeadTilt(Math.sin(phase * 0.5) * 1.6);
        setHeadYaw(Math.cos(phase * 0.35) * 1.2);
      } else {
        // En reposo regresa suavemente a labios sellados naturales
        setMouthOpenRatio(prev => Math.max(0, prev - 0.18));
        setMouthWidthRatio(prev => prev + (0.5 - prev) * 0.2);
        setHeadTilt(prev => prev * 0.85);
        setHeadYaw(prev => prev * 0.85);
      }

      animationFrameRef.current = requestAnimationFrame(updateLipSync);
    };

    animationFrameRef.current = requestAnimationFrame(updateLipSync);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speechRate]);

  // 7. Transformaciones cinemáticas compuestas del avatar
  const getAvatarMotionStyle = () => {
    let tx = 0;
    let ty = chestElevation; // Respiración continua
    let rZ = headTilt;
    let rY = headYaw;
    let rX = 0;
    let scale = 1 + (chestElevation * 0.003);

    // Ajustes por gestos de espera
    if (activeGesture === 'look_left') {
      rY -= 4;
      tx -= 3;
      rZ -= 0.8;
    } else if (activeGesture === 'look_right') {
      rY += 4;
      tx += 3;
      rZ += 0.8;
    } else if (activeGesture === 'subtle_nod') {
      rX += 4;
      ty += 2;
    } else if (activeGesture === 'brow_focus') {
      scale += 0.012;
      ty -= 1.5;
      rX -= 2;
    }

    // Si el alumno está hablando / grabando, inclinación de escucha atenta
    if (isListening) {
      rZ = 2.4;
      rX = 2;
      ty -= 2;
      scale = 1.018;
    }

    // Si el avatar está hablando, ligero ritmo oratorio
    if (isPlaying) {
      ty += mouthOpenRatio * 1.5;
    }

    return {
      transform: `perspective(600px) translate3d(${tx}px, ${ty}px, 0px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg) scale(${scale})`,
      transition: isPlaying ? 'transform 75ms ease-out' : 'transform 260ms cubic-bezier(0.25, 1, 0.5, 1)'
    };
  };

  const languageLabel = language === 'fr' ? 'Français' : 'English';
  const languageFlag = language === 'fr' ? '🇫🇷' : '🇬🇧';

  const SPEED_OPTIONS = [
    { value: 0.6, label: '0.6x Lento' },
    { value: 0.75, label: '0.75x Didáctico' },
    { value: 0.9, label: '0.9x Pausado' },
    { value: 1.0, label: '1.0x Normal' },
    { value: 1.2, label: '1.2x Fluido' }
  ];

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

        {/* Contenedor Anatómico Cinético */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          style={getAvatarMotionStyle()}
        >
          {/* Retrato Base del Personaje Histórico o Mentor */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageSrc}
            alt={avatarDisplayTitle}
            onError={(e) => {
              (e.target as HTMLImageElement).src = gender === 'female' 
                ? '/images/languages/mentor_female.jpg' 
                : '/images/languages/mentor_male.jpg';
            }}
            className="w-full h-full object-cover object-center absolute inset-0 select-none pointer-events-none filter contrast-105 brightness-95"
          />

          {/* Capa de Párpados / Pestañeo Realista Natural */}
          <div 
            className="absolute inset-0 bg-slate-950/75 mix-blend-multiply pointer-events-none transition-opacity duration-100 ease-in-out"
            style={{
              opacity: isBlinking ? 0.94 : 0
            }}
          />

          {/* =========================================================================
              LIP-SYNC ANATÓMICO SVG DE ALTA PRECISIÓN (Espacio 1024x1024)
              Modulación F1 (Apertura Mandibular) + F2 (Comisuras y Sonrisa)
              ========================================================================= */}
          <svg 
            viewBox="0 0 1024 1024" 
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
          >
            <defs>
              <radialGradient 
                id={`avatarCavity_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                cx="50%" 
                cy="30%" 
                r="65%"
              >
                <stop offset="0%" stopColor={mouthCfg.cavityDarkColor} />
                <stop offset="55%" stopColor={mouthCfg.cavityMidColor} />
                <stop offset="100%" stopColor={mouthCfg.cavityRimColor} />
              </radialGradient>

              <linearGradient 
                id={`avatarTeeth_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={mouthCfg.teethColor} stopOpacity="0.95" />
                <stop offset="65%" stopColor="#ded5c4" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#9e8d78" stopOpacity="0.15" />
              </linearGradient>

              <linearGradient 
                id={`avatarLowerLip_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={mouthCfg.lowerLipRimColor} />
                <stop offset="60%" stopColor="rgba(180, 75, 75, 0.65)" />
                <stop offset="100%" stopColor="rgba(205, 105, 100, 0.15)" />
              </linearGradient>
            </defs>

            {isPlaying && mouthOpenRatio > 0.06 && (() => {
              // Cálculo dinámico bifactorial F1/F2
              const widthOffset = (mouthWidthRatio - 0.5) * 8;
              const effX1 = mouthCfg.x1 - widthOffset;
              const effX2 = mouthCfg.x2 + widthOffset;
              const verticalDrop = mouthOpenRatio * mouthCfg.maxOpening;

              const halfMouthWidth = (effX2 - effX1) / 2;
              const teethHalfWidth = halfMouthWidth * 0.58;
              const teethHeight = Math.min(verticalDrop * 0.44, 4.2);
              const lipThickness = Math.min(3.2, 1.8 + verticalDrop * 0.18);

              return (
                <g>
                  {/* 1. Cavidad Bucal Anatómica Profunda */}
                  <path 
                    d={`M ${effX1} ${mouthCfg.y1} Q ${mouthCfg.cx} ${mouthCfg.cy - mouthOpenRatio * 1.4} ${effX2} ${mouthCfg.y2} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop} ${effX1} ${mouthCfg.y1} Z`} 
                    fill={`url(#avatarCavity_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                  />

                  {/* 2. Fila Superior de Dientes Naturales Nacardados Proporcionales */}
                  <path 
                    d={`M ${mouthCfg.cx - teethHalfWidth} ${mouthCfg.cy - 0.8} Q ${mouthCfg.cx} ${mouthCfg.cy - 1.8} ${mouthCfg.cx + teethHalfWidth} ${mouthCfg.cy - 1.0} Q ${mouthCfg.cx + teethHalfWidth} ${mouthCfg.cy - 0.8 + teethHeight} Q ${mouthCfg.cx} ${mouthCfg.cy + teethHeight} ${mouthCfg.cx - teethHalfWidth} ${mouthCfg.cy - 0.8 + teethHeight} Z`} 
                    fill={`url(#avatarTeeth_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                  />

                  {/* 3. Sombra de Lengua Interior en Fonemas Abiertos */}
                  {mouthOpenRatio > 0.35 && (
                    <ellipse 
                      cx={mouthCfg.cx} 
                      cy={mouthCfg.cy + verticalDrop * 0.7} 
                      rx={halfMouthWidth * 0.44} 
                      ry={Math.min(verticalDrop * 0.32, 2.8)} 
                      fill="#481015" 
                      opacity={0.88} 
                    />
                  )}

                  {/* 4. Labio Inferior Carnoso Acompañando el Descenso Mandibular */}
                  <path 
                    d={`M ${effX1 + 1.5} ${mouthCfg.y1 + 0.4} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop} ${effX2 - 1.5} ${mouthCfg.y2 + 0.4} Q ${mouthCfg.cx} ${mouthCfg.cy + verticalDrop + lipThickness} ${effX1 + 1.5} ${mouthCfg.y1 + 0.4} Z`} 
                    fill={`url(#avatarLowerLip_${avatarDisplayTitle.replace(/[^a-zA-Z0-9]/g, '_')})`} 
                    opacity={0.94} 
                  />
                </g>
              );
            })()}
          </svg>

          {/* Velo Dramático y Textura de Retrato Clásico */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

          {/* Celebración / Logro Gamificado */}
          {avatarMood === 'celebrating' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
              <Sparkles className="w-16 h-16 text-amber-300 animate-ping absolute" />
              <Award className="w-14 h-14 text-yellow-400 animate-bounce absolute" />
            </div>
          )}
        </div>

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

        {/* Ondas Sonoras Visuales en Tiempo Real mientras habla */}
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
      <div className="mt-3.5 w-full max-w-sm flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-lg text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0">
          <Gauge className="w-4 h-4 text-amber-400" />
          <span>Velocidad:</span>
        </div>

        {/* Selector de Velocidad */}
        <div className="flex items-center gap-1 py-0.5">
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSpeechRateChange && onSpeechRateChange(opt.value)}
              className={`px-2 py-1 rounded-lg font-mono font-bold text-[10px] transition-all cursor-pointer ${
                Math.abs(speechRate - opt.value) < 0.05
                  ? (isHistorical ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105' : 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105')
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={opt.label}
            >
              {opt.value}x
            </button>
          ))}
        </div>

        {/* Botón de Reproducción / Repetición */}
        <button
          type="button"
          onClick={handlePlayVoiceSample}
          className={`p-1.5 rounded-xl text-white transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1 ${
            isPlaying 
              ? 'bg-rose-600 hover:bg-rose-500 animate-pulse' 
              : (isHistorical ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black' : 'bg-indigo-600/80 hover:bg-indigo-500')
          }`}
          title={isPlaying ? "Detener locución" : "Escuchar pronunciación del personaje"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold">{isPlaying ? 'Detener' : 'Escuchar'}</span>
        </button>
      </div>

      {/* Globo de Diálogo / Subtítulo con Traducción Desplegable */}
      {currentText && (
        <div className={`mt-3 w-full max-w-lg p-4 rounded-2xl bg-slate-900/95 border ${
          isHistorical ? 'border-amber-500/40 shadow-amber-500/10' : 'border-indigo-700/50 shadow-xl'
        } shadow-xl space-y-2 backdrop-blur-md`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm sm:text-base font-medium text-white leading-relaxed font-serif">
              &ldquo;{currentText}&rdquo;
            </p>
            {translationText && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-700/60 text-indigo-300 hover:text-white shrink-0 cursor-pointer font-bold"
              >
                {showTranslation ? 'Ocultar' : 'Traducir'}
              </button>
            )}
          </div>

          {showTranslation && translationText && (
            <p className="text-xs text-teal-300 font-serif italic border-t border-indigo-900/60 pt-2">
              Traducción: {translationText}
            </p>
          )}

          {phoneticTip && (
            <div className="text-[11px] text-amber-300/90 font-mono bg-amber-950/30 border border-amber-800/40 p-2 rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tip fonético: {phoneticTip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
