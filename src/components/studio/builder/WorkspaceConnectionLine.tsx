"use client";

import React, { useState } from 'react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlockType } from '@/types/studioBlocks';
import { Plus, Sparkles } from 'lucide-react';

interface Props {
  insertIndex: number;
}

export const WorkspaceConnectionLine: React.FC<Props> = ({ insertIndex }) => {
  const { addBlock, setIsExtendedMenuOpen } = useActivityBuilderStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center py-2 group"
    >
      {/* Línea vertical conectora estilo Scratch / Notion */}
      <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-purple-300 via-indigo-400 to-purple-300 dark:from-purple-900 dark:via-indigo-800 dark:to-purple-900" />

      {/* Botón flotante (+) para insertar bloque */}
      <div className={`relative z-10 transition-all transform ${isHovered ? 'scale-110 opacity-100' : 'scale-90 opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-850 p-1 rounded-full shadow-lg border border-purple-200 dark:border-purple-800/80">
          <button
            type="button"
            onClick={() => addBlock('quiz_question', insertIndex)}
            className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>+ Reactivo</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('text_narrative', insertIndex)}
            className="px-2 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            + Texto
          </button>
          <button
            type="button"
            onClick={() => addBlock('reward_chest', insertIndex)}
            className="px-2 py-1 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer"
          >
            + Recompensa
          </button>
          <button
            type="button"
            onClick={() => setIsExtendedMenuOpen(true)}
            title="Ver más herramientas"
            className="p-1 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
