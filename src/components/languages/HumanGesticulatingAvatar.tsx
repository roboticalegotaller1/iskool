"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AvatarGender, LanguageCode } from '@/store/useLanguagesStore';
import { 
  Volume2, 
  Sparkles, 
  Mic, 
  Gauge, 
  Pause,
  Award
} from 'lucide-react';
import { 
  playUniversalIskoolVoice, 
  stopAllIskoolAudio,
  MULTILINGUAL_HISTORICAL_FIGURES
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

interface Character3DRig {
  id: string;
  idle: string;
  talkFrames: string[];
}

// =========================================================================
// REGISTRO DE FRAMES 3D REALES RENDERIZADOS CON GESTICULACIÓN Y BOCAS NATURALES
// =========================================================================
const CHARACTER_3D_RIGS: Record<string, Character3DRig> = {
  claire: {
    id: 'claire',
    idle: '/images/languages/3d/mentor_female_3d.webp',
    talkFrames: [
      '/images/languages/3d/mentor_female_3d_talk_a.webp',
      '/images/languages/3d/mentor_female_3d_talk_b.webp',
      '/images/languages/3d/mentor_female_3d_talk_c.webp'
    ]
  },
  arthur: {
    id: 'arthur',
    idle: '/images/languages/3d/mentor_male_3d_v2.webp',
    talkFrames: [
      '/images/languages/3d/mentor_male_3d_talk_a.webp',
      '/images/languages/3d/mentor_male_3d_talk_b.webp',
      '/images/languages/3d/mentor_male_3d_talk_c.webp'
    ]
  },
  shakespeare: {
    id: 'shakespeare',
    idle: '/images/languages/3d/shakespeare_3d.webp',
    talkFrames: [
      '/images/languages/3d/shakespeare_3d_talk.webp',
      '/images/languages/3d/shakespeare_3d_talk_b.webp'
    ]
  },
  ada_lovelace: {
    id: 'ada_lovelace',
    idle: '/images/languages/3d/ada_lovelace_3d.webp',
    talkFrames: [
      '/images/languages/3d/ada_lovelace_3d_talk.webp',
      '/images/languages/3d/ada_lovelace_3d_talk_b.webp'
    ]
  },
  abraham_lincoln: {
    id: 'abraham_lincoln',
    idle: '/images/languages/3d/abraham_lincoln_3d.webp',
    talkFrames: [
      '/images/languages/3d/abraham_lincoln_3d_talk.webp',
      '/images/languages/3d/abraham_lincoln_3d_talk_b.webp'
    ]
  },
  napoleon: {
    id: 'napoleon',
    idle: '/images/languages/3d/napoleon_3d.webp',
    talkFrames: [
      '/images/languages/3d/napoleon_3d_talk.webp',
      '/images/languages/3d/napoleon_3d_talk_b.webp'
    ]
  },
  marie_curie: {
    id: 'marie_curie',
    idle: '/images/languages/3d/marie_curie_3d.webp',
    talkFrames: [
      '/images/languages/3d/marie_curie_3d_talk.webp'
    ]
  }
};

function resolveCharacter3DRig(
  histId?: string,
  name?: string,
  gender?: AvatarGender,
  avatarImg?: string
): Character3DRig {
  const normKey = `${histId || ''} ${name || ''} ${avatarImg || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (normKey.includes('shakespeare')) return CHARACTER_3D_RIGS.shakespeare;
  if (normKey.includes('ada') || normKey.includes('lovelace')) return CHARACTER_3D_RIGS.ada_lovelace;
  if (normKey.includes('lincoln') || normKey.includes('abraham')) return CHARACTER_3D_RIGS.abraham_lincoln;
  if (normKey.includes('napoleon')) return CHARACTER_3D_RIGS.napoleon;
  if (normKey.includes('curie') || normKey.includes('marie')) return CHARACTER_3D_RIGS.marie_curie;

  if (normKey.includes('arthur') || normKey.includes('henri') || (normKey.includes('male') && !normKey.includes('female'))) {
    return CHARACTER_3D_RIGS.arthur;
  }

  if (normKey.includes('claire') || normKey.includes('sophie') || normKey.includes('female')) {
    return CHARACTER_3D_RIGS.claire;
  }

  if (gender === 'female') return CHARACTER_3D_RIGS.claire;
  return CHARACTER_3D_RIGS.arthur;
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

  // Estados de animación y cinemática 3D
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [audioEnergy, setAudioEnergy] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioControllerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Identificar personaje histórico y su configuración
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

  // 2. Resolver Rig 3D del personaje con poses reales
  const characterRig: Character3DRig = useMemo(() => {
    return resolveCharacter3DRig(matchedFigure?.id || historicalFigureId, name, gender, avatarImage);
  }, [matchedFigure, historicalFigureId, name, gender, avatarImage]);

  // Lista de todos los frames (0: idle, 1+: talk frames)
  const allFrames = useMemo(() => {
    return [characterRig.idle, ...characterRig.talkFrames];
  }, [characterRig]);

  // Precarga de todos los frames 3D para evitar parpadeos o pantallas en blanco
  useEffect(() => {
    if (typeof window !== 'undefined') {
      allFrames.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [allFrames]);

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

  // Analizador Espectral DSP con Web Audio API
  useEffect(() => {
    if (!audioElement || typeof window === 'undefined') return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 128;
          analyserRef.current.smoothingTimeConstant = 0.6;
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
  // MOTOR DE SECUENCIACIÓN DE POSES Y GESTOS 3D (MOVIMIENTO FLUIDO Y NATURAL)
  // =========================================================================
  useEffect(() => {
    if (!isPlaying) {
      setActiveFrameIndex(0); // Volver al frame Idle
      return;
    }

    const talkFrameCount = characterRig.talkFrames.length;
    if (talkFrameCount === 0) {
      setActiveFrameIndex(0);
      return;
    }

    let currentTalkIndex = 0;
    // Seleccionar de inmediato el primer frame de gesticulación para reaccionar al habla
    setActiveFrameIndex(1);

    // Intervalo de cadencia oratoria natural: cambia entre poses de gesticulación
    // aproximadamente cada 550ms a 750ms modulado por la velocidad del habla
    const baseCadence = Math.max(380, Math.min(850, Math.floor(620 / speechRate)));

    const gestureInterval = setInterval(() => {
      currentTalkIndex = (currentTalkIndex + 1) % talkFrameCount;
      setActiveFrameIndex(1 + currentTalkIndex);
    }, baseCadence);

    return () => {
      clearInterval(gestureInterval);
    };
  }, [isPlaying, characterRig, speechRate]);

  // Ciclo continuo de micro-respiración orgánica y análisis de audio (60 FPS)
  useEffect(() => {
    let p = 0;

    const renderLoop = () => {
      p += 0.04;
      setBreathPhase(p);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (bufferLength * 255);
        setAudioEnergy(avg);
      } else {
        setAudioEnergy(isPlaying ? 0.65 : 0.05);
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const languageLabel = language === 'fr' ? 'Français' : 'English';
  const languageFlag = language === 'fr' ? '🇫🇷' : '🇬🇧';

  const SPEED_OPTIONS = [
    { value: 0.6, label: '0.6x Lento' },
    { value: 0.75, label: '0.75x Didáctico' },
    { value: 0.9, label: '0.9x Pausado' },
    { value: 1.0, label: '1.0x Normal' },
    { value: 1.2, label: '1.2x Fluido' }
  ];

  // Cálculo sutil de micro-respiración diafragmática (NUNCA mueve la tarjeta, sólo el personaje)
  const breathY = Math.sin(breathPhase) * 1.5;
  const breathScale = 1.0 + Math.sin(breathPhase) * 0.003;

  // Renderizador del Personaje 3D con Transición Suave de Fotogramas (Cross-Fade Fluid)
  const renderLivingPuppet = () => {
    return (
      <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
        {allFrames.map((frameSrc, idx) => {
          const isActive = idx === activeFrameIndex;

          return (
            <div
              key={frameSrc}
              className={`absolute inset-0 w-full h-full flex items-end justify-center pointer-events-none transition-opacity duration-240 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{
                transform: `translate3d(0, ${breathY}px, 0) scale(${breathScale})`,
                transformOrigin: '50% 90%'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frameSrc}
                alt={avatarDisplayTitle}
                className="w-full h-full object-contain object-bottom select-none pointer-events-none drop-shadow-2xl"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // =========================================================================
  // MODO 1: ESCENARIO DEL STUDIO (variant === 'stage')
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
      {/* Marco Principal Gamificado del Avatar (Totalmente Fijo, sin sacudidas) */}
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

        {/* Contenedor del Personaje Articulado 3D */}
        {renderLivingPuppet()}

        {/* Badge Superior: Personaje, Época y Bandera */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-xl max-w-[65%]">
            <span className="text-base shrink-0">{matchedFigure?.avatarEmoji || languageFlag}</span>
            <div className="flex flex-col truncate">
              <span className="text-xs font-black tracking-wide leading-none truncate text-white">
                {avatarDisplayTitle}
              </span>
              <span className="text-[10px] text-amber-300 font-semibold leading-none mt-0.5 truncate">
                {isHistorical ? displayedEra : `${languageLabel} · Mentor 3D`}
              </span>
            </div>
          </div>

          {/* Indicador de Estado Gamificado */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-xs font-bold shadow-xl shrink-0">
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
                  Listo
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
                  height: `${Math.max(5, heightPct * Math.max(0.25, audioEnergy))}px`
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
