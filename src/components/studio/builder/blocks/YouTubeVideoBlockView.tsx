"use client";

import React from 'react';
import { YouTubeVideoBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Video, Clock, CheckSquare } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../../player/StudioFlowPlayer';

interface Props {
  block: YouTubeVideoBlock;
}

export const YouTubeVideoBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { videoUrl, videoTitle, startAtSeconds } = block.data;

  const embedUrl = getYouTubeEmbedUrl(videoUrl, startAtSeconds);

  return (
    <div className="space-y-4">
      {/* URL del Video */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Video className="w-4 h-4 text-rose-600" />
          <span>Enlace de Video (YouTube):</span>
        </label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => updateBlockData(block.id, { videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=wmC0wF8WuqU"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Título de la Cápsula */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Título de la Cápsula Audiovisual:
        </label>
        <input
          type="text"
          value={videoTitle || ''}
          onChange={(e) => updateBlockData(block.id, { videoTitle: e.target.value })}
          placeholder="Ej. Fuerza: Elementos y Tipos explicados..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Vista previa incrustada en vivo */}
      {embedUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-750 bg-black shadow-md">
          <iframe
            src={embedUrl}
            title={videoTitle || 'Vista previa YouTube'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : videoUrl ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-200">
          Verifica que el enlace sea un video válido de YouTube (ej. https://www.youtube.com/watch?v=wmC0wF8WuqU).
        </div>
      ) : null}
    </div>
  );
};
