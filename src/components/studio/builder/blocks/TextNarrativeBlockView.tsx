"use client";

import React from 'react';
import { TextNarrativeBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { BookOpen, MessageSquare, Sparkles, User } from 'lucide-react';

interface Props {
  block: TextNarrativeBlock;
}

export const TextNarrativeBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { content, style, speakerName } = block.data;

  return (
    <div className="space-y-4">
      {/* Selector de Estilo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Estilo del Texto:</span>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => updateBlockData(block.id, { style: 'instruction' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              style === 'instruction'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            📋 Instrucción
          </button>
          <button
            type="button"
            onClick={() => updateBlockData(block.id, { style: 'narrative_lore' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              style === 'narrative_lore'
                ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            🔮 Narrativa / Lore
          </button>
          <button
            type="button"
            onClick={() => updateBlockData(block.id, { style: 'dialogue' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              style === 'dialogue'
                ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            💬 Diálogo
          </button>
        </div>
      </div>

      {/* Nombre del Personaje (Si es diálogo o lore) */}
      {style !== 'instruction' && (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-500" />
          <input
            type="text"
            value={speakerName || ''}
            onChange={(e) => updateBlockData(block.id, { speakerName: e.target.value })}
            placeholder="Nombre del personaje o guía (ej. Sabio Lucas, Prof. Garza)..."
            className="w-full sm:w-72 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-zinc-200"
          />
        </div>
      )}

      {/* Área de Texto Principal */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
          Contenido de la lectura o instrucción:
        </label>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => updateBlockData(block.id, { content: e.target.value })}
          placeholder="Escribe aquí las instrucciones o la historia que leerá el estudiante..."
          className="w-full px-3.5 py-2.5 rounded-2xl text-sm font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 resize-y"
        />
      </div>
    </div>
  );
};
