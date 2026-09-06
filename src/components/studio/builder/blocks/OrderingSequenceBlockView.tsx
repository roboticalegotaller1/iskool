"use client";

import React from 'react';
import { OrderingSequenceBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { ListOrdered, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  block: OrderingSequenceBlock;
}

export const OrderingSequenceBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { instructions, stepsInCorrectOrder } = block.data;

  const handleUpdateStep = (index: number, val: string) => {
    const updated = [...stepsInCorrectOrder];
    updated[index] = val;
    updateBlockData(block.id, { stepsInCorrectOrder: updated });
  };

  const handleAddStep = () => {
    updateBlockData(block.id, {
      stepsInCorrectOrder: [...stepsInCorrectOrder, `Paso o evento ${stepsInCorrectOrder.length + 1}`]
    });
  };

  const handleRemoveStep = (index: number) => {
    if (stepsInCorrectOrder.length <= 2) return;
    updateBlockData(block.id, {
      stepsInCorrectOrder: stepsInCorrectOrder.filter((_, idx) => idx !== index)
    });
  };

  const handleMoveStep = (index: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stepsInCorrectOrder.length) return;
    const updated = [...stepsInCorrectOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateBlockData(block.id, { stepsInCorrectOrder: updated });
  };

  return (
    <div className="space-y-4">
      {/* Instrucciones */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <span>Instrucciones de la Secuencia:</span>
        </label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => updateBlockData(block.id, { instructions: e.target.value })}
          placeholder="Ej. Ordena cronológicamente los acontecimientos históricos:"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Pasos en Orden Correcto */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Pasos o Eventos (Escríbelos en el orden correcto; el juego los barajará automáticamente):
        </label>

        <div className="space-y-2">
          {stepsInCorrectOrder.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={step}
                onChange={(e) => handleUpdateStep(idx, e.target.value)}
                placeholder={`Acontecimiento o paso ${idx + 1}...`}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMoveStep(idx, 'up')}
                className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === stepsInCorrectOrder.length - 1}
                onClick={() => handleMoveStep(idx, 'down')}
                className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              {stepsInCorrectOrder.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Añadir siguiente paso</span>
        </button>
      </div>
    </div>
  );
};
