"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MapPin, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Sparkles,
  Quote
} from 'lucide-react';
import { HistoricalFigureMoment } from '@/types/studioBlocks';
import { 
  configureHistoricalUtterance,
  playUniversalIskoolVoice,
  stopAllIskoolAudio,
  UniversalAudioController 
} from '@/lib/historicalVoiceEngine';

export interface HistoricalTimelineComicProps {
  moments: HistoricalFigureMoment[];
  characterName: string;
  avatarImageUrl?: string;
  onSelectMomentOnMap?: (moment: HistoricalFigureMoment) => void;
  className?: string;
}

export const HistoricalTimelineComic: React.FC<HistoricalTimelineComicProps> = ({
  moments,
  characterName,
  avatarImageUrl,
  onSelectMomentOnMap,
  className = ''
}) => {
  const [activeMomentIndex, setActiveMomentIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioCtrlRef = React.useRef<UniversalAudioController | null>(null);

  // Reiniciar momento activo si cambia el personaje
  useEffect(() => {
    setActiveMomentIndex(0);
    audioCtrlRef.current?.stop();
    stopAllIskoolAudio();
  }, [characterName]);

  // Detener audio al desmontar
  useEffect(() => {
    return () => {
      audioCtrlRef.current?.stop();
      stopAllIskoolAudio();
    };
  }, []);

  const resolveMomentImage = (mom: HistoricalFigureMoment, idx: number): string => {
    if (mom.imageUrl && mom.imageUrl.trim()) {
      return mom.imageUrl;
    }

    const norm = (characterName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm.includes('villa') || norm.includes('doroteo') || norm.includes('centauro')) {
      const villaMoments = [
        '/images/history/villa_toma_juarez_comic_1.png',
        '/images/history/villa_batalla_zacatecas_comic_2.png',
        '/images/history/villa_pacto_xochimilco_comic_3.png',
        '/images/history/villa_columbus_comic_4.png'
      ];
      return villaMoments[idx % villaMoments.length];
    }

    if (norm.includes('josefa') || norm.includes('corregidora')) {
      const josefaMoments = [
        '/images/history/josefa_conspiracion_comic_1.png',
        '/images/history/josefa_taconeo_comic_2.png',
        '/images/history/josefa_alerta_comic_3.png',
        '/images/history/hidalgo_grito_comic_4.png'
      ];
      return josefaMoments[idx % josefaMoments.length];
    }

    return avatarImageUrl || '/images/history/francisco_villa_avatar.png';
  };

  const activeMoment = moments[activeMomentIndex] || moments[0] || {
    id: 'def-mom',
    yearOrPeriod: 'Historia',
    title: `${characterName}: Hito Fundamental`,
    description: `${characterName} en la historia patria.`,
    imageUrl: avatarImageUrl || '/images/history/francisco_villa_avatar.png',
    locationName: 'México',
    narrativeCaption: `${characterName} en la historia patria.`
  };
  const activeMomentImage = resolveMomentImage(activeMoment, activeMomentIndex);

  const handlePlayNarrativeAudio = (text: string) => {
    if (isPlayingAudio) {
      audioCtrlRef.current?.stop();
      stopAllIskoolAudio();
      setIsPlayingAudio(false);
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    playUniversalIskoolVoice({
      text: cleanText,
      characterName,
      role: 'character',
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    }).then(ctrl => {
      audioCtrlRef.current = ctrl;
    });
  };

  return (
    <div className={`flex flex-col gap-5 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Cabecera del Timelapse / Novela Gráfica */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-100 uppercase tracking-wide">
              Timelapse Histórico: 4 Momentos Decisivos
            </h3>
            <p className="text-[11px] text-amber-400/70">
              Novela gráfica ilustrada de la gesta de {characterName}
            </p>
          </div>
        </div>

        {/* Controles de Navegación Rápida */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeMomentIndex === 0}
            onClick={() => {
              audioCtrlRef.current?.stop();
              stopAllIskoolAudio();
              setIsPlayingAudio(false);
              setActiveMomentIndex(prev => Math.max(0, prev - 1));
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            title="Momento anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-300 px-2">
            Momento {activeMomentIndex + 1} de {moments.length}
          </span>
          <button
            type="button"
            disabled={activeMomentIndex === moments.length - 1}
            onClick={() => {
              audioCtrlRef.current?.stop();
              stopAllIskoolAudio();
              setIsPlayingAudio(false);
              setActiveMomentIndex(prev => Math.min(moments.length - 1, prev + 1));
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            title="Momento siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visor Principal Estilo Cómic de Época */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black flex flex-col">
        {/* Imagen del Panel Ilustrado (100% libre de capas de texto encimadas para preservar el arte y globos de diálogo) */}
        <div className="relative w-full h-[300px] sm:h-[440px] md:h-[480px] bg-stone-950 overflow-hidden flex items-center justify-center">
          <motion.img 
            key={`${activeMoment.id}-${activeMomentIndex}`}
            src={activeMomentImage} 
            alt={activeMoment.title}
            onError={(e) => {
              if (avatarImageUrl) {
                (e.target as HTMLImageElement).src = avatarImageUrl;
              }
            }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-contain sm:object-cover filter contrast-105 brightness-95"
          />

          {/* Sombra sutil inferior para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Distintivo Numérico del Panel en Esquina Inferior Derecha */}
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-amber-400 border border-stone-900 text-stone-950 font-black text-xs flex items-center justify-center shadow-lg font-mono">
            #{activeMomentIndex + 1}
          </div>

          {/* Badge de Fecha y Lugar (Inferior Izquierda, compacto) */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-md">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{activeMoment.yearOrPeriod}</span>
            </span>

            {activeMoment.locationName && (
              <button
                type="button"
                onClick={() => onSelectMomentOnMap && onSelectMomentOnMap(activeMoment)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 backdrop-blur-md text-amber-200 border border-amber-500/40 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                title="Ver en el mapa"
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[130px] sm:max-w-none">{activeMoment.locationName}</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel Narrativo Pedagógico de la Novela Gráfica (Ubicado DEBAJO de la imagen para jamás encimarse con el arte o globos) */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-stone-950 via-slate-900 to-black border-t border-amber-500/30 flex flex-col gap-3.5">
          {/* Bloque de Crónica Narrativa */}
          {(activeMoment.narrativeCaption || activeMoment.description) && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                  <Quote className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                    Crónica Narrativa del Momento {activeMomentIndex + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-amber-100 font-serif leading-relaxed italic">
                    "{activeMoment.narrativeCaption || activeMoment.description}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadatos del Momento y Botón de Audio */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <div className="space-y-0.5 max-w-xl">
              <h4 className="text-sm sm:text-base font-black text-amber-100 font-serif">
                {activeMoment.title}
              </h4>
              {activeMoment.description && activeMoment.description !== activeMoment.narrativeCaption && (
                <p className="text-xs text-amber-300/80 font-serif leading-relaxed">
                  {activeMoment.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handlePlayNarrativeAudio(activeMoment.narrativeCaption || activeMoment.description)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md ${
                isPlayingAudio 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-500/30' 
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Detener Crónica' : 'Escuchar Crónica'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Miniaturas de los 4 Momentos (Timelapse Secuencial) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {moments.map((mom, idx) => {
          const isSelected = idx === activeMomentIndex;
          return (
            <button
              key={mom.id || idx}
              type="button"
              onClick={() => {
                audioCtrlRef.current?.stop();
                stopAllIskoolAudio();
                setIsPlayingAudio(false);
                setActiveMomentIndex(idx);
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                isSelected 
                  ? 'bg-amber-500/25 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]' 
                  : 'bg-black/40 hover:bg-black/60 border-amber-500/20 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/20">
                <img 
                  src={resolveMomentImage(mom, idx)} 
                  alt={mom.title} 
                  onError={(e) => {
                    if (avatarImageUrl) {
                      (e.target as HTMLImageElement).src = avatarImageUrl;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black font-mono">
                  {idx + 1}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-amber-400/80">{mom.yearOrPeriod}</p>
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-100' : 'text-slate-300'}`}>
                  {mom.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
