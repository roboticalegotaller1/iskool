"use client";

import React from 'react';
import { FillInBlanksBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { FileEdit, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  block: FillInBlanksBlock;
}

export const FillInBlanksBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { instructions, textWithBlanks, wordBank } = block.data;

  // Extraer palabras entre corchetes [palabra] para generar banco automático
  const handleTextChange = (newText: string) => {
    const matches = newText.match(/\[(.*?)\]/g);
    const extracted = matches ? matches.map(m => m.slice(1, -1).trim()).filter(Boolean) : [];
    updateBlockData(block.id, {
      textWithBlanks: newText,
      wordBank: Array.from(new Set([...extracted, ...wordBank.slice(extracted.length)]))
    });
  };

  const handleWordBankChange = (newWordsStr: string) => {
    const words = newWordsStr.split(',').map(w => w.trim()).filter(Boolean);
    updateBlockData(block.id, { wordBank: words });
  };

  return (
    <div className="space-y-4">
      {/* Instrucción */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <FileEdit className="w-4 h-4 text-teal-600" />
          <span>Instrucción de la Actividad:</span>
        </label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => updateBlockData(block.id, { instructions: e.target.value })}
          placeholder="Ej. Rellena los espacios en blanco con la palabra adecuada:"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Texto con Espacios entre Corchetes */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Texto con palabras clave entre corchetes [ ]:</span>
          <span className="text-[10px] text-teal-600 font-bold">Usa [palabra] para ocultar</span>
        </label>
        <textarea
          rows={3}
          value={textWithBlanks}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Ej. La [gravedad] atrae a los cuerpos hacia el centro de la [Tierra]."
          className="w-full p-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white leading-relaxed"
        />
      </div>

      {/* Banco de Palabras (Opciones para el Alumno) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Banco de Palabras (Separadas por coma, incluye distractores):</span>
        </label>
        <input
          type="text"
          value={wordBank.join(', ')}
          onChange={(e) => handleWordBankChange(e.target.value)}
          placeholder="gravedad, Tierra, fricción, masa..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
};
