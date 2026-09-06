"use client";

import React from 'react';
import { DragDropMatchBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Link2, Plus, Trash2, Clock, HelpCircle, Shuffle } from 'lucide-react';

interface Props {
  block: DragDropMatchBlock;
}

export const DragDropMatchBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { instructions, pairs, timeLimitSeconds } = block.data;

  const handleUpdatePair = (index: number, side: 'left' | 'right', val: string) => {
    const updated = [...pairs];
    updated[index] = { ...updated[index], [side]: val };
    updateBlockData(block.id, { pairs: updated });
  };

  const handleAddPair = () => {
    updateBlockData(block.id, {
      pairs: [...pairs, { left: `Concepto ${pairs.length + 1}`, right: `Definición ${pairs.length + 1}` }]
    });
  };

  const handleRemovePair = (index: number) => {
    if (pairs.length <= 2) return;
    updateBlockData(block.id, {
      pairs: pairs.filter((_, idx) => idx !== index)
    });
  };

  return (
    <div className="space-y-4">
      {/* Aviso de aleatorización automática */}
      <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-850 flex items-center gap-2.5 text-xs text-violet-700 dark:text-violet-300">
        <Shuffle className="w-4 h-4 shrink-0 text-violet-600 dark:text-violet-400 animate-spin-slow" />
        <span>
          <strong>Dificultad Dinámica:</strong> En la vista del estudiante, las respuestas de la columna derecha se revolverán automáticamente de forma aleatoria para fomentar la retención y el análisis.
        </span>
      </div>

      {/* Instrucciones */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-violet-600" />
          <span>Instrucción del Emparejamiento:</span>
        </label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => updateBlockData(block.id, { instructions: e.target.value })}
          placeholder="Ej. Conecta cada concepto con su definición correcta:"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Lista de Pares Concepto <-> Definición */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Pares para Conectar (Concepto e Información correspondiente):
        </label>

        <div className="space-y-2">
          {pairs.map((pair, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-black flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={pair.left}
                onChange={(e) => handleUpdatePair(idx, 'left', e.target.value)}
                placeholder="Término / Concepto..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
              />
              <span className="text-slate-400 font-black text-xs">↔️</span>
              <input
                type="text"
                value={pair.right}
                onChange={(e) => handleUpdatePair(idx, 'right', e.target.value)}
                placeholder="Definición o Imagen..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-zinc-200"
              />
              {pairs.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemovePair(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddPair}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Añadir otro par</span>
        </button>
      </div>

      {/* Tiempo Límite */}
      <div className="flex items-center gap-3 pt-1 text-xs">
        <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Tiempo Límite (segundos):</span>
        </label>
        <input
          type="number"
          min="10"
          max="120"
          value={timeLimitSeconds}
          onChange={(e) => updateBlockData(block.id, { timeLimitSeconds: Number(e.target.value) })}
          className="w-20 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs font-bold text-slate-900 dark:text-white"
        />
      </div>
    </div>
  );
};
