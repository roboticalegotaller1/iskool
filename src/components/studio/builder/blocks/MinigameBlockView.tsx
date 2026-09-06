"use client";

import React, { useState } from 'react';
import { MinigameActionBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Gamepad2, Plus, X, Sparkles } from 'lucide-react';

interface Props {
  block: MinigameActionBlock;
}

export const MinigameBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { minigameType, difficulty, items } = block.data;
  const [newItemText, setNewItemText] = useState('');

  const minigames = [
    { id: 'ruleta', name: '🎲 Ruleta de Saberes', desc: 'Gira para seleccionar un reactivo al azar' },
    { id: 'memorama', name: '🃏 Memorama Visual', desc: 'Encuentra las parejas de conceptos' },
    { id: 'ahorcado', name: '🔤 Ahorcado Educativo', desc: 'Descubre la palabra o concepto clave' },
    { id: 'escape_room', name: '🔐 Candado de Escape', desc: 'Resuelve el código para abrir la puerta' },
  ];

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    updateBlockData(block.id, { items: [...items, newItemText.trim()] });
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    updateBlockData(block.id, { items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Selector de Minijuego */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Tipo de Mecánica de Minijuego:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {minigames.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => updateBlockData(block.id, { minigameType: m.id })}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                minigameType === m.id
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-500 shadow-md'
                  : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
              }`}
            >
              <p className="text-xs font-black text-slate-900 dark:text-white">{m.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dificultad */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Dificultad:</span>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateBlockData(block.id, { difficulty: d })}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                difficulty === d
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Media' : 'Avanzada'}
            </button>
          ))}
        </div>
      </div>

      {/* Conceptos / Palabras Clave */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Elementos o Conceptos del Minijuego:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="hover:text-rose-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Añadir concepto..."
            className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
