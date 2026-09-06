"use client";

import React from 'react';
import { RewardChestBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Gift, Coins, Sparkles, Award } from 'lucide-react';

interface Props {
  block: RewardChestBlock;
}

export const RewardChestBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { xpAmount, coinsAmount, badgeName, chestRarity } = block.data;

  const rarities = [
    { id: 'common', name: 'Común', color: 'border-slate-300 text-slate-700 bg-slate-100 dark:bg-zinc-800' },
    { id: 'rare', name: 'Raro (Azul)', color: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { id: 'epic', name: 'Épico (Púrpura)', color: 'border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950' },
    { id: 'legendary', name: 'Legendario (Oro)', color: 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950' },
  ];

  return (
    <div className="space-y-4">
      {/* Selector de Rareza del Cofre */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Rareza del Cofre de Botín:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {rarities.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => updateBlockData(block.id, { chestRarity: r.id })}
              className={`p-2 rounded-xl text-xs font-black border transition-all text-center cursor-pointer ${
                chestRarity === r.id
                  ? `${r.color} ring-2 ring-purple-500 shadow-md`
                  : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-600 dark:text-zinc-400 opacity-70 hover:opacity-100'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Valores de XP y Monedas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 space-y-1.5">
          <label className="text-xs font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Puntos de Experiencia (XP):</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={25}
              max={500}
              step={25}
              value={xpAmount}
              onChange={(e) => updateBlockData(block.id, { xpAmount: Number(e.target.value) })}
              className="flex-1 accent-purple-600"
            />
            <span className="text-sm font-black text-purple-700 dark:text-purple-300 w-16 text-right">
              +{xpAmount} XP
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 space-y-1.5">
          <label className="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Monedas de Oro Recompensadas:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={coinsAmount}
              onChange={(e) => updateBlockData(block.id, { coinsAmount: Number(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="text-sm font-black text-amber-700 dark:text-amber-300 w-16 text-right">
              🪙 {coinsAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Insignia / Título Desbloqueable */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-indigo-500" />
          <span>Insignia o Medalla Desbloqueable (Opcional):</span>
        </label>
        <input
          type="text"
          value={badgeName || ''}
          onChange={(e) => updateBlockData(block.id, { badgeName: e.target.value })}
          placeholder="Ej. Explorador Insurgente, Mente Brillante..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
};
