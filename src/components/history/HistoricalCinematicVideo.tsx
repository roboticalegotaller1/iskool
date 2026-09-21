"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/components/studio/player/StudioFlowPlayer';

export interface HistoricalCinematicVideoProps {
  videoUrl?: string;
  durationSeconds?: number;
  title?: string;
  narratorScript?: string;
  characterName: string;
  className?: string;
}

export const HistoricalCinematicVideo: React.FC<HistoricalCinematicVideoProps> = ({
  videoUrl = 'https://youtu.be/25cq1V8AsTg',
  durationSeconds = 15,
  title = 'Cápsula Cinematográfica Histórica',
  narratorScript = 'Santiago de Querétaro, septiembre de 1810. Cuando la traición amenazaba con apagar el anhelo de libertad, una mujer valiente desafió al encierro. Con un golpe firme en el piso y una carta en la noche, Josefa encendió el fuego de nuestra independencia.',
  characterName,
  className = ''
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentCapsuleIndex, setCurrentCapsuleIndex] = useState(0);

  // Opciones de hasta 4 cápsulas históricas de 15-20 segundos
  const capsules = [
    {
      title: `${characterName}: La Chispa de la Libertad`,
      videoUrl: videoUrl,
      duration: durationSeconds,
      script: narratorScript
    },
    {
      title: 'El Ideario Clandestino de 1810',
      videoUrl: 'https://youtu.be/25cq1V8AsTg',
      duration: 18,
      script: 'En la penumbra de las tertulias, la independencia dejó de ser un susurro para convertirse en el destino irrevocable de un pueblo.'
    },
    {
      title: 'La Cabalgata por la Soberanía',
      videoUrl: 'https://youtu.be/25cq1V8AsTg',
      duration: 16,
      script: 'Bajo el manto de la noche, cada galope llevó el mensaje que despertó a Hidalgo y Allende antes del cateo realista.'
    },
    {
      title: 'El Eco Perpetuo de la Patria',
      videoUrl: 'https://youtu.be/25cq1V8AsTg',
      duration: 20,
      script: 'Los sacrificios del pasado son la raíz de nuestra libertad presente. Su memoria vive en cada aula mexicana.'
    }
  ];

  const activeCapsule = capsules[currentCapsuleIndex] || capsules[0];
  const embedUrl = getYouTubeEmbedUrl(activeCapsule.videoUrl);

  const handleToggleNarratorVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeCapsule.script);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Cabecera de la Cápsula Cinematográfica */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-100 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-[11px] text-amber-400/70">
              Video cinemático de corta duración (Máx. 20 seg) con audio y Ken Burns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activeCapsule.duration}s Duración</span>
          </span>

          <a 
            href={activeCapsule.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/30 transition-all"
            title="Ver video original"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Visor de Video Cinematográfico */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black aspect-video max-h-[420px]">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={activeCapsule.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-amber-300/80 bg-slate-950">
            <Film className="w-12 h-12 text-amber-500 mb-2 animate-pulse" />
            <p className="font-bold text-sm">Cápsula audiovisual preparada para reproducción</p>
          </div>
        )}
      </div>

      {/* Subtítulo / Guion Narrado de la Cápsula */}
      <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-400/80 tracking-wider">
            Guion Narrativo de la Cápsula:
          </span>
          <p className="text-xs text-amber-100/90 font-serif leading-relaxed italic">
            "{activeCapsule.script}"
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleNarratorVoice}
          className={`px-4 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            isPlayingAudio 
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
          }`}
        >
          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingAudio ? 'Detener Locución' : 'Escuchar Voz Narrada'}</span>
        </button>
      </div>

      {/* Selector de las 4 Cápsulas de Momentos */}
      <div className="space-y-2 pt-1">
        <h5 className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
          Cápsulas Disponibles de {characterName} (Hasta 4 Momentos):
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {capsules.map((cap, idx) => {
            const isSel = idx === currentCapsuleIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsPlayingAudio(false);
                  setCurrentCapsuleIndex(idx);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSel 
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-md' 
                    : 'bg-black/40 hover:bg-black/60 border-amber-500/20 text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Cápsula {idx + 1}: {cap.title}</p>
                  <p className="text-[10px] text-amber-400/60">{cap.duration}s de video</p>
                </div>
                <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
