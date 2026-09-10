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
      <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-400 dark:from-emerald-900 dark:via-teal-800 dark:to-emerald-900" />

      {/* Botón flotante (+) para insertar bloque */}
      <div className={`relative z-10 transition-all transform ${isHovered ? 'scale-110 opacity-100' : 'scale-90 opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-full shadow-lg border border-emerald-200 dark:border-emerald-800/80">
          <button
            type="button"
            onClick={() => addBlock('quiz_question', insertIndex)}
            className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
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
            className="p-1 rounded-full text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
