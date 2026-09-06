"use client";

import React from 'react';
import { CanvasActivityJSON, ISKOOL_TEMPLATES } from '@/types';
import { Sparkles, Gamepad2, Wrench, ArrowRight, Play } from 'lucide-react';

interface GenericGameStubProps {
  activity: CanvasActivityJSON;
  templateType: string;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const GenericGameStub: React.FC<GenericGameStubProps> = ({
  activity,
  templateType,
  onClose
}) => {
  const templateDef = ISKOOL_TEMPLATES.find(t => t.id === templateType) || {
    name: templateType,
    description: 'Plantilla interactiva pedagógica en desarrollo.',
    category: 'quiz'
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-8 shadow-2xl space-y-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/25 animate-pulse">
        <Wrench className="w-10 h-10 text-yellow-300" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300/40">
          🎮 Módulo Gamificado • {templateDef.name}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {activity.title}
        </h2>

        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
          {templateDef.description}
        </p>
      </div>

      {/* Muestra de reactivo que alimentará esta plantilla */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
          Reactivo preparado para alimentar esta plantilla ({activity.questions?.length || 0} preguntas en el JSON):
        </span>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {activity.questions?.[0]?.question || 'Pregunta de ejemplo'}
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 font-bold text-xs cursor-pointer"
          >
            Cerrar Vista
          </button>
        )}
      </div>
    </div>
  );
};
