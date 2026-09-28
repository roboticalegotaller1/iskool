"use client";

import React, { useState } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Award, 
  History, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { InstitutionalMemorySynthesis } from '@/lib/institutionalMemory/types';

export interface InstitutionalMemoryBannerProps {
  memory: InstitutionalMemorySynthesis | null;
  className?: string;
}

export const InstitutionalMemoryBanner: React.FC<InstitutionalMemoryBannerProps> = ({
  memory,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!memory || memory.totalMemoriesFound === 0) {
    return null;
  }

  const masteryPercent = (memory.averageMasteryRate * 100).toFixed(0);

  return (
    <div 
      className={`mb-6 rounded-3xl bg-gradient-to-br from-violet-50/90 via-purple-50/40 to-indigo-50/90 dark:from-zinc-900/90 dark:via-purple-950/20 dark:to-zinc-900/90 border-2 border-purple-200/80 dark:border-purple-800/60 shadow-lg shadow-purple-500/5 overflow-hidden transition-all print-section ${className}`}
    >
      {/* Barra de Título y Metadatos Institucionales (Apple Header) */}
      <div className="p-5 pb-4 border-b border-purple-200/50 dark:border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Segunda Memoria Institucional • Cero Amnesia
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-purple-600 text-white uppercase tracking-wider">
                {memory.cyclesCovered.join(' ➔ ')}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white leading-tight mt-0.5">
              Aprendizaje Pedagógico Acumulado en la Escuela
            </h3>
          </div>
        </div>

        {/* Insignias de Métricas Agregadas (Bento Header) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-purple-150 dark:border-purple-900/40 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span><strong>{memory.totalStudentsEvaluated}</strong> alumnos en muestra</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span><strong>{masteryPercent}%</strong> dominio promedio</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 text-purple-700 dark:text-purple-300 transition-colors"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Contenido Desplegable: Tríada Bento de Apple (Regla de 3 Tarjetas) */}
      {isExpanded && (
        <div className="p-5 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Fricciones y Bloqueos Previos */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Fricciones Recurrentes
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                  Errores conceptuales detectados en cohortes anteriores que debes prevenir desde el inicio:
                </p>

                <ul className="space-y-1.5 text-xs text-zinc-800 dark:text-zinc-200">
                  {memory.recurrentFrictionPoints.slice(0, 3).map((fric, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      <span className="font-medium capitalize">
                        {fric.friction.replace(/_/g, ' ')}
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">
                          ({fric.occurrences} {fric.occurrences === 1 ? 'ciclo' : 'ciclos'})
                        </span>
                      </span>
                    </li>
                  ))}
                  {memory.recurrentFrictionPoints.length === 0 && (
                    <li className="text-zinc-400 text-xs italic">Sin fricciones anómalas registradas.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Tarjeta 2: Intervenciones Exitosas de Colegas */}
            <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold">
                    <Lightbulb className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-violet-900 dark:text-violet-300">
                    Intervenciones Probadas
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                  Estrategias didácticas validadas por docentes de tu escuela que elevaron el aprendizaje:
                </p>

                <ul className="space-y-2 text-xs text-zinc-800 dark:text-zinc-200">
                  {memory.provenInterventions.slice(0, 3).map((inv, idx) => (
                    <li key={idx} className="leading-snug bg-white/60 dark:bg-zinc-900/40 p-2 rounded-xl border border-violet-100 dark:border-violet-900/30">
                      <p className="font-semibold text-zinc-900 dark:text-white text-[11.5px]">
                        &quot;{inv.intervention}&quot;
                      </p>
                      <span className="text-[9.5px] text-purple-600 dark:text-purple-400 font-medium block mt-1">
                        Reportado por: {inv.reportedBy.join(', ')}
                      </span>
                    </li>
                  ))}
                  {memory.provenInterventions.length === 0 && (
                    <li className="text-zinc-400 text-xs italic">Se utilizó la secuencia canónica.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Tarjeta 3: Recomendaciones para tu Aula */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                    Guía para tu Ciclo
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                  Consejos prácticos para aplicar en tu secuencia didáctica de este ciclo escolar:
                </p>

                <ul className="space-y-1.5 text-xs text-zinc-800 dark:text-zinc-200">
                  {memory.recommendationsForNextTeacher.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-150">{rec}</span>
                    </li>
                  ))}
                  {memory.recommendationsForNextTeacher.length === 0 && (
                    <li className="text-zinc-400 text-xs italic">Realizar evaluación diagnóstica en Sesión 1.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Pie de Trazabilidad y Linaje de Memorias Citadas */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-purple-200/40 dark:border-purple-900/30">
            <div className="flex items-center gap-1.5">
              <History className="w-3 h-3 text-purple-500" />
              <span>
                <strong>Linaje de la Bóveda:</strong> {memory.citedMemories.length} {memory.citedMemories.length === 1 ? 'memoria auditada' : 'memorias auditadas'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {memory.citedMemories.map((cited, cIdx) => (
                <span 
                  key={cIdx} 
                  className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-purple-200 dark:border-purple-800/40 text-[9.5px] font-medium"
                >
                  Ciclo {cited.cycle} (Grupo {cited.cohort}) • {cited.teacher}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
