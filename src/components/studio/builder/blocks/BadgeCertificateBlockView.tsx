"use client";

import React from 'react';
import { BadgeCertificateBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { Award, Sparkles } from 'lucide-react';

interface Props {
  block: BadgeCertificateBlock;
}

export const BadgeCertificateBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { certificateTitle, recipientHonor, teacherSignatureName } = block.data;

  return (
    <div className="space-y-4">
      {/* Título del Certificado */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Título del Diploma / Reconocimiento Digital:</span>
        </label>
        <input
          type="text"
          value={certificateTitle}
          onChange={(e) => updateBlockData(block.id, { certificateTitle: e.target.value })}
          placeholder="Ej. Certificado de Honor en Ciencias Naturales"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Rango o Honor Otorgado */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Título de Honor o Grado de Maestría Otorgado:
        </label>
        <input
          type="text"
          value={recipientHonor}
          onChange={(e) => updateBlockData(block.id, { recipientHonor: e.target.value })}
          placeholder="Ej. Gran Maestro de la Física y el Movimiento"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-zinc-200"
        />
      </div>

      {/* Firma o Nombre del Docente */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
          Firma o Entidad Emisora:
        </label>
        <input
          type="text"
          value={teacherSignatureName}
          onChange={(e) => updateBlockData(block.id, { teacherSignatureName: e.target.value })}
          placeholder="Ej. Academia de Ciencias Colegio Anglo Mexicano"
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
};
