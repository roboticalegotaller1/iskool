"use client";

import React from 'react';
import { OpenPollWordcloudBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { MessageSquare, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  block: OpenPollWordcloudBlock;
}

export const OpenPollWordcloudBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { prompt, minWords, aiFeedbackRubric } = block.data;

  return (
    <div className="space-y-4">
      {/* Pregunta o Detonador */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-fuchsia-600" />
          <span>Pregunta Detonadora o Reflexión Abierta:</span>
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => updateBlockData(block.id, { prompt: e.target.value })}
          placeholder="Ej. Explica con tus propias palabras qué sucedería si no existiera la gravedad..."
          className="w-full p-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-slate-900 dark:text-white leading-relaxed"
        />
      </div>

      {/* Rúbrica de Evaluación Automática IA */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
          <span>Criterios de Evaluación Pedagógica por IA (Rúbrica Formativa):</span>
        </label>
        <input
          type="text"
          value={aiFeedbackRubric || ''}
          onChange={(e) => updateBlockData(block.id, { aiFeedbackRubric: e.target.value })}
          placeholder="Ej. Valora si menciona atracción gravitacional y consecuencias en la atmósfera..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Mínimo de Palabras */}
      <div className="flex items-center gap-3 pt-1 text-xs">
        <label className="font-bold text-slate-600 dark:text-zinc-400">
          Mínimo de palabras requeridas:
        </label>
        <input
          type="number"
          min="5"
          max="100"
          value={minWords}
          onChange={(e) => updateBlockData(block.id, { minWords: Number(e.target.value) })}
          className="w-20 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs font-bold text-slate-900 dark:text-white"
        />
      </div>
    </div>
  );
};
