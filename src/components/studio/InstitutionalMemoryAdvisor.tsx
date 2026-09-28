"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Plus, 
  Sparkles, 
  ExternalLink,
  RotateCcw,
  Target,
  Users,
  Compass
} from 'lucide-react';
import type { 
  PedagogicalInsightsResponse, 
  FrictionPointInsight, 
  ProvenInterventionInsight 
} from '@/app/api/vault/pedagogical-insights/route';

export interface InstitutionalMemoryAdvisorProps {
  subjectId?: string;
  gradeLevel?: string;
  topic?: string;
  topicKeywords?: string[];
  onApplyRecommendation?: (text: string) => void;
  className?: string;
  initialCollapsed?: boolean;
}

export function InstitutionalMemoryAdvisor({
  subjectId,
  gradeLevel,
  topic,
  topicKeywords,
  onApplyRecommendation,
  className = '',
  initialCollapsed = false
}: InstitutionalMemoryAdvisorProps) {
  const [insights, setInsights] = useState<PedagogicalInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  // Cache en memoria para prevenir peticiones redundantes
  const cacheRef = useRef<Map<string, PedagogicalInsightsResponse>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clave de consulta derivada
  const queryKey = useMemo(() => {
    const s = (subjectId || '').trim().toLowerCase();
    const g = (gradeLevel || '').trim().toLowerCase();
    const t = (topic || '').trim().toLowerCase();
    const k = (topicKeywords || []).map(x => x.trim().toLowerCase()).sort().join(',');
    return `${s}__${g}__${t}__${k}`;
  }, [subjectId, gradeLevel, topic, topicKeywords]);

  // Búsqueda con debounce de 600ms para evitar flickering durante la escritura en vivo
  useEffect(() => {
    const trimmedTopic = (topic || '').trim();
    const hasKeywords = (topicKeywords && topicKeywords.length > 0);

    // Si el tema es muy corto y no hay keywords, resetear
    if (trimmedTopic.length < 3 && !hasKeywords) {
      setInsights(null);
      setIsLoading(false);
      return;
    }

    // Verificar caché
    if (cacheRef.current.has(queryKey)) {
      setInsights(cacheRef.current.get(queryKey)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const debounceTimer = setTimeout(async () => {
      // Cancelar petición anterior si aún estaba en vuelo
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/vault/pedagogical-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            subjectId,
            gradeLevel,
            topic: trimmedTopic,
            topicKeywords: topicKeywords || []
          })
        });

        if (res.ok) {
          const data = (await res.json()) as PedagogicalInsightsResponse;
          cacheRef.current.set(queryKey, data);
          setInsights(data);
          // Si encontramos hallazgos y estaba colapsado inicialmente por defecto, lo abrimos
          if (data.found && initialCollapsed === false) {
            setIsCollapsed(false);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[InstitutionalMemoryAdvisor] Advertencia al consultar lecciones:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey, subjectId, gradeLevel, topic, topicKeywords, initialCollapsed]);

  // Si fue desestimado por el usuario, mostrar un disparador compacto para reabrir
  if (isDismissed) {
    return (
      <div className={`flex items-center justify-end ${className}`}>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer group"
          title="Ver lecciones aprendidas de la Bóveda Curricular"
        >
          <Brain className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Bóveda Institucional ({insights?.totalMemoriesFound || 0} memorias)</span>
        </button>
      </div>
    );
  }

  // Si no está cargando y no se encontraron memorias, ocultar silenciosamente sin perturbar el lienzo
  if (!isLoading && (!insights || !insights.found)) {
    return null;
  }

  const highFrictionPoints = insights?.frictionPoints.filter(f => f.severity === 'alta') || [];
  const averageMasteryPct = Math.round((insights?.metrics.averageMasteryRate || 0) * 100);

  const handleApply = (text: string) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(text);
    }
    setAppliedRecommendations(prev => {
      const next = new Set(prev);
      next.add(text);
      return next;
    });
  };

  return (
    <aside aria-label="Bóveda Institucional: Lecciones Aprendidas"
      className={`w-full rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-850/95 to-slate-900/95 border border-emerald-500/40 shadow-xl shadow-slate-950/50 backdrop-blur-md transition-all overflow-hidden ${className}`}
    >
      {/* Barra Superior / Encabezado de la Tarjeta */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
            <Brain className="w-4 h-4" />
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h4 className="text-xs font-black text-white tracking-wide truncate">
              Bóveda Institucional: Lecciones Aprendidas
            </h4>

            {/* Badges de Alerta de Fricción y Tasa de Dominio */}
            {highFrictionPoints.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] tracking-wide animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{highFrictionPoints.length} Fricción{highFrictionPoints.length > 1 ? 'es' : ''} Alta</span>
              </span>
            )}

            {insights?.metrics.totalStudentsEvaluated ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-semibold text-[10px] hidden sm:inline-flex">
                <Target className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{averageMasteryPct}% Dominio Histórico ({insights.metrics.totalStudentsEvaluated} alumnos)</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Acciones: Colapsar / Desestimar */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mr-1" />
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir lecciones' : 'Colapsar lecciones'}
            aria-label={isCollapsed ? 'Expandir lecciones' : 'Colapsar lecciones'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Desestimar lecciones por ahora"
            aria-label="Desestimar lecciones por ahora"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido Expandible */}
      {!isCollapsed && insights && insights.found && (
        <div className="p-4 space-y-4 text-xs">
          {/* 1. Sección de Fricciones Pedagógicas Recurrentes */}
          {insights.frictionPoints.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Fricciones Conceptuales Detectadas en Ciclos Anteriores:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {insights.frictionPoints.slice(0, 4).map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-amber-400/40 transition-colors flex items-start gap-2"
                  >
                    <span className="text-amber-400 text-sm mt-0.5 shrink-0">⚠️</span>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-slate-200 leading-snug">
                        {f.friction.replace(/_/g, ' ')}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-amber-300/90">
                          {f.occurrences} ciclo{f.occurrences > 1 ? 's' : ''} recurrente
                        </span>
                        <span>•</span>
                        <span>{f.cycles.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Sección de Estrategias e Intervenciones Exitosas Comprobadas */}
          {insights.interventions.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Estrategias de Intervención Probadas con Éxito:
              </span>
              <div className="space-y-2">
                {insights.interventions.slice(0, 3).map((item, idx) => {
                  const isApplied = appliedRecommendations.has(item.intervention);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-slate-200 font-medium leading-relaxed">
                          💡 {item.intervention}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Reportado por: <strong className="text-slate-300">{item.reportedBy.join(', ')}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">
                            Dominio: {(item.impactScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {onApplyRecommendation && (
                        <button
                          type="button"
                          onClick={() => handleApply(item.intervention)}
                          disabled={isApplied}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-600/30 active:scale-95'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Incorporada</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                              <span>Incorporar a Planeación</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Trazabilidad Institucional y Enlaces Wiki [[...]] */}
          {insights.citedMemories && insights.citedMemories.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-400">Linaje en Bóveda:</span>
                {insights.citedMemories.slice(0, 3).map((cite, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-[10px] text-teal-300/90 inline-flex items-center gap-1"
                    title={`Memoria ${cite.cycle} - Cohorte ${cite.cohort} (${cite.teacher})`}
                  >
                    <span>{cite.wikiLink}</span>
                  </span>
                ))}
              </div>

              <span className="text-[10px] text-slate-400 italic">
                {insights.cyclesCovered.join(', ')} • {insights.totalMemoriesFound} registros consolidados
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default InstitutionalMemoryAdvisor;
