"use client";

import React from 'react';
import { BossEnemyBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Swords, ShieldAlert, Heart, Flame, Image as ImageIcon } from 'lucide-react';

interface Props {
  block: BossEnemyBlock;
}

export const BossEnemyBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { bossName, spriteKey, maxHp, attackPower, backgroundScene } = block.data;

  const bosses = [
    { id: 'blood_dragon', name: 'Dragón Carmesí', preview: '🐉', theme: 'Fuego / Desafío Mayor' },
    { id: 'shadow_golem', name: 'Gólem de las Sombras', preview: '🗿', theme: 'Tierra / Resistencia' },
    { id: 'cyber_brux', name: 'Brux Guardián', preview: '🧙‍♂️', theme: 'Magia / Estrategia' },
  ];

  const scenes = [
    { id: 'volcano', name: '🌋 Volcán Activo' },
    { id: 'dungeon', name: '🏰 Calabozo Ancestral' },
    { id: 'forest', name: '🌲 Bosque Prohibido' },
    { id: 'temple', name: '🏛️ Templo Sagrado' },
  ];

  return (
    <div className="space-y-4">
      {/* Nombre del Jefe */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
          Nombre del Jefe o Guardián de la Prueba:
        </label>
        <input
          type="text"
          value={bossName}
          onChange={(e) => updateBlockData(block.id, { bossName: e.target.value })}
          placeholder="Nombre del rival..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Selector de Sprite / Modelo PixiJS */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Modelo Visual de Combate PixiJS:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {bosses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => updateBlockData(block.id, { spriteKey: b.id })}
              className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                spriteKey === b.id
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500 shadow-md'
                  : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{b.preview}</span>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{b.name}</p>
                <p className="text-[10px] text-slate-400">{b.theme}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas de Batalla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 space-y-1.5">
          <label className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Puntos de Vida del Jefe (HP):</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={300}
              step={25}
              value={maxHp}
              onChange={(e) => updateBlockData(block.id, { maxHp: Number(e.target.value) })}
              className="flex-1 accent-rose-500"
            />
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 w-16 text-right">
              {maxHp} HP
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-750 space-y-1.5">
          <label className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Escenario de Fondo:</span>
          </label>
          <select
            value={backgroundScene}
            onChange={(e) => updateBlockData(block.id, { backgroundScene: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
