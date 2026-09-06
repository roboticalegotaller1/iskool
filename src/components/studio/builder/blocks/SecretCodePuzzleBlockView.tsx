"use client";

import React from 'react';
import { SecretCodePuzzleBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { KeyRound, HelpCircle, Lock } from 'lucide-react';

interface Props {
  block: SecretCodePuzzleBlock;
}

export const SecretCodePuzzleBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { clueText, secretAnswer, hintText } = block.data;

  return (
    <div className="space-y-4">
      {/* Pista del Acertijo */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Enigma o Pista del Código Secreto (Escape Room):</span>
        </label>
        <textarea
          rows={2}
          value={clueText}
          onChange={(e) => updateBlockData(block.id, { clueText: e.target.value })}
          placeholder="Ej. Descifra la palabra secreta de 6 letras: F _ _ _ Z A"
          className="w-full p-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white leading-relaxed"
        />
      </div>

      {/* Palabra o Código Secreto */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Respuesta Secreta Correcta (No distingue mayúsculas):</span>
        </label>
        <input
          type="text"
          value={secretAnswer}
          onChange={(e) => updateBlockData(block.id, { secretAnswer: e.target.value.toUpperCase() })}
          placeholder="FUERZA"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-black tracking-widest bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-700 dark:text-amber-300"
        />
      </div>

      {/* Pista Adicional Opcional */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Pista de Auxilio Opcional (Si el alumno se bloquea):
        </label>
        <input
          type="text"
          value={hintText || ''}
          onChange={(e) => updateBlockData(block.id, { hintText: e.target.value })}
          placeholder="Ej. Es la magnitud que medimos en Newtons (N)."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
};
