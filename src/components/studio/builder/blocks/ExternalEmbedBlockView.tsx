"use client";

import React from 'react';
import { ExternalEmbedBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Globe, ExternalLink, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  block: ExternalEmbedBlock;
}

export const ExternalEmbedBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { embedUrl, resourceTitle, instructions } = block.data;

  // Sugerencias de simuladores populares PhET
  const handleSelectPreset = (url: string, title: string, instr: string) => {
    updateBlockData(block.id, {
      embedUrl: url,
      resourceTitle: title,
      instructions: instr
    });
  };

  return (
    <div className="space-y-4">
      {/* URL del Iframe o Simulador */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span>URL del Simulador o Recurso Web:</span>
          </div>
          {embedUrl && (
            <a
              href={embedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Abrir enlace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </label>
        <input
          type="text"
          value={embedUrl}
          onChange={(e) => updateBlockData(block.id, { embedUrl: e.target.value })}
          placeholder="https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Sugerencias Rápidas de Simuladores */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-500" />
          <span>Sugerencias PhET:</span>
        </span>
        <button
          type="button"
          onClick={() => handleSelectPreset(
            'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
            'Fuerzas y Movimiento: Fundamentos',
            'Aplica diferentes fuerzas sobre el objeto y observa la aceleración resultante.'
          )}
          className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200/60 hover:bg-cyan-100 transition-colors cursor-pointer"
        >
          Fuerza y Movimiento
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset(
            'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_es.html',
            'Laboratorio de Circuitos Eléctricos DC',
            'Conecta una batería, cables y una bombilla para cerrar el circuito.'
          )}
          className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200/60 hover:bg-cyan-100 transition-colors cursor-pointer"
        >
          Circuitos Eléctricos
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset(
            'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_es.html',
            'Estados de la Materia',
            'Aumenta la temperatura y observa el comportamiento de los átomos.'
          )}
          className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200/60 hover:bg-cyan-100 transition-colors cursor-pointer"
        >
          Estados de la Materia
        </button>
      </div>

      {/* Título del Recurso */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Nombre del Recurso:
        </label>
        <input
          type="text"
          value={resourceTitle}
          onChange={(e) => updateBlockData(block.id, { resourceTitle: e.target.value })}
          placeholder="Ej. Simulador de Fuerzas y Movimiento PhET..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Instrucciones */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Instrucciones para la interacción:</span>
        </label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => updateBlockData(block.id, { instructions: e.target.value })}
          placeholder="Ej. Interactúa con los controles del simulador antes de continuar con la siguiente pregunta."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Vista Previa en Vivo del Iframe dentro del Editor */}
      {embedUrl && (
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">
            Vista Previa en Vivo del Simulador:
          </label>
          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-950 shadow-md">
            <iframe
              src={embedUrl}
              title={resourceTitle || 'Simulador Web'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  );
};
