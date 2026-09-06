"use client";

import React from 'react';
import { CheckpointGateBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface Props {
  block: CheckpointGateBlock;
}

export const CheckpointGateBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { checkpointTitle, reflectionPrompt, requiredScorePercent } = block.data;

  return (
    <div className="space-y-4">
      {/* Título del Checkpoint */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Título del Punto de Control / Checkpoint:</span>
        </label>
        <input
          type="text"
          value={checkpointTitle}
          onChange={(e) => updateBlockData(block.id, { checkpointTitle: e.target.value })}
          placeholder="Ej. Revisión de Saberes Intermedios y Metacognición"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Pregunta de Metacognición */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Pregunta de Autoevaluación o Reflexión Formativa:
        </label>
        <input
          type="text"
          value={reflectionPrompt}
          onChange={(e) => updateBlockData(block.id, { reflectionPrompt: e.target.value })}
          placeholder="Ej. ¿Qué tan seguro te sientes aplicando las leyes de Newton en problemas cotidianos?"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Porcentaje de Aciertos Requerido */}
      <div className="flex items-center gap-3 pt-1 text-xs">
        <label className="font-bold text-slate-600 dark:text-zinc-400">
          Porcentaje mínimo requerido para aprobar el checkpoint:
        </label>
        <input
          type="number"
          min="50"
          max="100"
          value={requiredScorePercent}
          onChange={(e) => updateBlockData(block.id, { requiredScorePercent: Number(e.target.value) })}
          className="w-20 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs font-bold text-slate-900 dark:text-white"
        />
        <span className="font-bold text-slate-400">%</span>
      </div>
    </div>
  );
};
