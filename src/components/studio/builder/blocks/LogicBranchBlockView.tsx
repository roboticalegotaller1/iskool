"use client";

import React from 'react';
import { LogicBranchBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { GitBranch, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  block: LogicBranchBlock;
}

export const LogicBranchBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData, blocks } = useActivityBuilderStore();
  const { condition, thresholdValue, ifTrueNextBlockId, ifFalseNextBlockId } = block.data;

  // Otros bloques disponibles para bifurcación
  const otherBlocks = blocks.filter((b) => b.id !== block.id);

  return (
    <div className="space-y-4">
      {/* Condición */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-indigo-500" />
          <span>Regla de Ramificación Pedagógica:</span>
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={condition}
            onChange={(e) => updateBlockData(block.id, { condition: e.target.value })}
            className="flex-1 w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="score_above_percentage">Si el alumno obtiene un puntaje &gt;= al umbral</option>
            <option value="has_lives_left">Si al alumno le quedan vidas disponibles</option>
            <option value="item_collected">Si el alumno completó la actividad anterior sin fallos</option>
          </select>

          {condition === 'score_above_percentage' && (
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Umbral:</span>
              <input
                type="number"
                min={10}
                max={100}
                step={5}
                value={thresholdValue}
                onChange={(e) => updateBlockData(block.id, { thresholdValue: Number(e.target.value) })}
                className="w-14 px-1.5 py-0.5 rounded text-xs font-black text-center bg-white dark:bg-zinc-800 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
              />
              <span className="text-xs font-bold text-indigo-500">%</span>
            </div>
          )}
        </div>
      </div>

      {/* Destinos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camino SI CUMPLE */}
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 space-y-1.5">
          <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Si se cumple la condición:</span>
          </label>
          <select
            value={ifTrueNextBlockId || ''}
            onChange={(e) => updateBlockData(block.id, { ifTrueNextBlockId: e.target.value || null })}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-850 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="">Avanzar al siguiente bloque normal</option>
            {otherBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                Saltar a: {b.title} ({b.type})
              </option>
            ))}
          </select>
        </div>

        {/* Camino SI NO CUMPLE */}
        <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50 dark:border-rose-800/40 space-y-1.5">
          <label className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Si NO se cumple (Refuerzo):</span>
          </label>
          <select
            value={ifFalseNextBlockId || ''}
            onChange={(e) => updateBlockData(block.id, { ifFalseNextBlockId: e.target.value || null })}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-850 border border-rose-200 dark:border-rose-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="">Continuar flujo secuencial</option>
            {otherBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                Enviar a refuerzo: {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
