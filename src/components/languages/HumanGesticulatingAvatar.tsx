"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';
import { playUniversalIskoolVoice, stopAllIskoolAudio } from '@/lib/historicalVoiceEngine';

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
}

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
  className = ''
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const isPlaying = externalIsPlaying || internalPlaying;

  // Estados de animación facial
  const [mouthOpen, setMouthOpen] = useState<number>(0); // 0 a 1
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioControllerRef = useRef<any>(null);

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
        characterName: name,
        voiceId,
        language,
        gender,
        rate: speechRate,
        onStart: () => setInternalPlaying(true),
        onEnd: () => setInternalPlaying(false),
        onError: () => setInternalPlaying(false)
      });
    } catch {
      setInternalPlaying(false);
    }
  };

  // 1. Temporizador de Parpadeo Natural Humano (cada 3.5 a 6 segundos)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const interval = 3500 + Math.random() * 2500;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, interval);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  // 2. Conexión de Web Audio API para Lip-Sync Reactivo a la Voz
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
          // El elemento ya pudo estar conectado
        }
      }
    } catch (e) {
      console.warn('AudioAnalyser fallback activo:', e);
    }
  }, [audioElement]);

  // 3. Loop de Gesticulación Labial (Lip-sync) y Micro-movimientos
  useEffect(() => {
    let phase = 0;
    const updateLipSync = () => {
      if (isPlaying) {
        let volume = 0;

        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          // Enfocarse en frecuencias medias de voz humana (rango de formantes: bins 4 a 32)
          for (let i = 4; i < Math.min(36, dataArray.length); i++) {
            sum += dataArray[i];
          }
          const average = sum / 32;
          volume = Math.min(1, average / 110);
        }

        // Si no hay Web Audio Analyser conectado directamente (ej. CORS o audio en buffer),
        // generar onda fonética orgánica complementaria
        if (volume < 0.05) {
          phase += 0.22 * speechRate;
          const osc1 = Math.sin(phase) * 0.5 + 0.5;
          const osc2 = Math.sin(phase * 1.6 + 0.8) * 0.3;
          volume = Math.max(0.15, Math.min(0.9, osc1 + osc2));
        }

        // Interpolación suave (lerp)
        setMouthOpen(prev => prev + (volume - prev) * 0.4);

        // Micro-inclinación de cabeza conversacional
        setHeadTilt(Math.sin(phase * 0.6) * 1.8);
      } else {
        // En reposo regresa suavemente a sonrisa natural
        setMouthOpen(prev => Math.max(0, prev - 0.15));
        setHeadTilt(prev => prev * 0.85);
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

  // Imágenes de alta definición del mentor (en reposo y gesticulando al hablar)
  const avatarClosedImageSrc = gender === 'female' 
    ? '/images/languages/mentor_female.jpg' 
    : '/images/languages/mentor_male.jpg';

  const avatarSpeakingImageSrc = gender === 'female' 
    ? '/images/languages/mentor_female_speaking.jpg' 
    : '/images/languages/mentor_male_speaking.jpg';

  const avatarDisplayTitle = gender === 'female'
    ? (language === 'fr' ? 'Mme. Sophie' : 'Prof. Claire')
    : (language === 'fr' ? 'Prof. Henri' : 'Prof. Arthur');

  const languageLabel = language === 'fr' ? 'Français' : 'English';
  const languageFlag = language === 'fr' ? '🇫🇷' : '🇬🇧';

  // Opciones de velocidad
  const SPEED_OPTIONS = [
    { value: 0.6, label: '0.6x Lento' },
    { value: 0.75, label: '0.75x Didáctico' },
    { value: 0.9, label: '0.9x Pausado' },
    { value: 1.0, label: '1.0x Normal' },
    { value: 1.2, label: '1.2x Fluido' }
  ];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Contenedor del Avatar y Capa de Gesticulación */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/40 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 group">
        
        {/* Halo de luz ambiental cuando habla o escucha */}
        <div 
          className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
            isPlaying 
              ? 'bg-cyan-500/30 opacity-100 animate-pulse' 
              : isListening 
                ? 'bg-emerald-500/35 opacity-100 animate-pulse' 
                : avatarMood === 'celebrating'
                  ? 'bg-amber-400/40 opacity-100'
                  : 'bg-indigo-600/15 opacity-50'
          }`}
        />

        {/* Imagen del Avatar con Micro-movimientos de cabeza y Gesticulación Anatómica Real */}
        <div 
          className="relative w-full h-full transition-transform duration-150 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${headTilt}deg) translateY(${isPlaying ? Math.abs(headTilt) * 0.4 : 0}px)`
          }}
        >
          {/* Capa Base: Rostro en reposo / sonrisa atenta */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarClosedImageSrc}
            alt={name || avatarDisplayTitle}
            className="w-full h-full object-cover object-center absolute inset-0"
          />

          {/* Capa de Habla: Rostro con boca abierta y articulación exacta del personaje */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSpeakingImageSrc}
            alt="Articulación Labial"
            className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-75 ease-out pointer-events-none"
            style={{
              opacity: isPlaying ? Math.min(1, Math.max(0, mouthOpen * 1.35)) : 0
            }}
          />

          {/* Efectos de Partículas en Celebración */}
          {avatarMood === 'celebrating' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <Sparkles className="w-16 h-16 text-amber-300 animate-ping absolute" />
              <Award className="w-14 h-14 text-yellow-400 animate-bounce absolute" />
            </div>
          )}
        </div>

        {/* Badge Superior: Nombre, Bandera e Idioma */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-lg">
            <span className="text-base">{languageFlag}</span>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wide leading-none">{name || avatarDisplayTitle}</span>
              <span className="text-[10px] text-teal-300 font-semibold leading-none mt-0.5">{languageLabel}</span>
            </div>
          </div>

          {/* Indicador de Estado Gamificado */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold shadow-lg">
            {isPlaying && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-300 text-[11px] font-mono">Hablando...</span>
              </>
            )}
            {isListening && (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-[11px]">Escuchándote...</span>
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
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-slate-300 text-[11px]">Listo</span>
              </>
            )}
          </div>
        </div>

        {/* Ondas Sonoras Visuales en los costados mientras habla */}
        {isPlaying && (
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-center gap-1.5 h-6 pointer-events-none">
            {[40, 75, 95, 60, 85, 100, 70, 90, 50].map((heightPct, idx) => (
              <span
                key={idx}
                className="w-1.5 bg-gradient-to-t from-cyan-400 to-teal-300 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, heightPct * Math.max(0.2, mouthOpen))}px`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra de Control de Velocidad y Accesibilidad para Alumnos Rezagados */}
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
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={opt.label}
            >
              {opt.value}x
            </button>
          ))}
        </div>

        {/* Botón de Reproducción / Repetición Inmediata con Pronunciación Nativa */}
        <button
          type="button"
          onClick={handlePlayVoiceSample}
          className={`p-1.5 rounded-xl text-white transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1 ${
            isPlaying 
              ? 'bg-rose-600 hover:bg-rose-500 animate-pulse' 
              : 'bg-indigo-600/80 hover:bg-indigo-500'
          }`}
          title={isPlaying ? "Detener locución" : "Escuchar pronunciación nativa"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold">{isPlaying ? 'Detener' : 'Escuchar'}</span>
        </button>
      </div>

      {/* Globo de Diálogo / Subtítulo con Traducción Desplegable */}
      {currentText && (
        <div className="mt-3 w-full max-w-lg p-4 rounded-2xl bg-slate-900/95 border border-indigo-700/50 shadow-xl space-y-2 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
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
