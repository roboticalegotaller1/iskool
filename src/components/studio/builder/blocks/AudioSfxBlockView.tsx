"use client";

import React from 'react';
import { AudioSfxBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Volume2, Music, Sparkles } from 'lucide-react';

interface Props {
  block: AudioSfxBlock;
}

export const AudioSfxBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { soundType, volume, autoPlay } = block.data;

  const sounds = [
    { id: 'victory_fanfare', name: '🎺 Fanfarria de Victoria', desc: 'Sonido épico al superar un desafío' },
    { id: 'battle_drums', name: '🥁 Tambores de Batalla', desc: 'Tensión para combate contra el Boss' },
    { id: 'mystery_ambient', name: '🌌 Ambiente Misterioso', desc: 'Misterio para pistas o escape room' },
    { id: 'level_up', name: '✨ Ascenso de Nivel', desc: 'Efecto de subida de nivel / XP' },
  ];

  return (
    <div className="space-y-4">
      {/* Selector de Audio */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Efecto Sonoro / Pista de Ambiente:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sounds.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => updateBlockData(block.id, { soundType: s.id })}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                soundType === s.id
                  ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-400 dark:border-violet-600 ring-2 ring-violet-500 shadow-md'
                  : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
              }`}
            >
              <p className="text-xs font-black text-slate-900 dark:text-white">{s.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Control de Volumen y Autoplay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-750 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-violet-500" />
            <span>Volumen:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.1}
              value={volume}
              onChange={(e) => updateBlockData(block.id, { volume: Number(e.target.value) })}
              className="flex-1 accent-violet-500"
            />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-750 flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Reproducir automáticamente al llegar a este bloque:
          </label>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => updateBlockData(block.id, { autoPlay: e.target.checked })}
            className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
