'use client';

/**
 * @file InstitutionalMemoryOverview.tsx
 * @description Vista Macroscópica de Memoria Institucional para Coordinadores y Directivos de iSkool.
 * Diseñado conforme a UX_Teacher_Apple_Rule.md: Bento grid minimalista, alta legibilidad, cero saturación.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  BookOpen, 
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

interface MemoryItem {
  id: string;
  filePath: string;
  frontmatter: {
    academic_cycle: string;
    grade: number | string;
    subject: string;
    topic: string;
    group_cohort: string;
    author_display_name: string;
    activity_source?: string;
    metrics: {
      students_evaluated_count: number;
      mastery_rate: number;
      comprehension_friction_points: string[];
    };
  };
  sections: {
    contextoDiagnostico: string;
    friccionesErrores: string[];
    adaptacionesExitosas: string[];
    recomendacionesProximoCiclo: string[];
  };
  wikiLinks?: string[];
  createdAt: string;
}

export function InstitutionalMemoryOverview() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Carga reactiva de memorias (SWR / No-Store para sincronización multi-instancia en tiempo real)
  const loadMemories = React.useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const timestamp = Date.now();
      const res = await fetch(`/api/vault/memory?_t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memories)) {
          setMemories(data.memories);
          setLastSyncTime(new Date());
        }
      }
    } catch (err) {
      console.error('Error sincronizando memorias institucionales:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();

    // Revalidación periódica cada 30 segundos (SWR polling)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadMemories(true);
      }
    }, 30000);

    // Revalidación al volver a enfocar la ventana
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMemories(true);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadMemories]);

  // Extraer ciclos únicos y asignaturas únicas
  const availableCycles = useMemo(() => {
    const set = new Set<string>();
    memories.forEach(m => set.add(m.frontmatter.academic_cycle));
    return Array.from(set).sort().reverse();
  }, [memories]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    memories.forEach(m => set.add(m.frontmatter.subject));
    return Array.from(set).sort();
  }, [memories]);

  // Filtrado reactivo
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const fm = m.frontmatter;
      if (selectedCycle !== 'all' && fm.academic_cycle !== selectedCycle) return false;
      if (selectedSubject !== 'all' && fm.subject !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTopic = fm.topic.toLowerCase().includes(q);
        const matchesSubject = fm.subject.toLowerCase().includes(q);
        const matchesTeacher = fm.author_display_name.toLowerCase().includes(q);
        const matchesCohort = fm.group_cohort.toLowerCase().includes(q);
        const matchesFriction = fm.metrics.comprehension_friction_points.some(f => f.toLowerCase().includes(q));
        if (!matchesTopic && !matchesSubject && !matchesTeacher && !matchesCohort && !matchesFriction) {
          return false;
        }
      }
      return true;
    });
  }, [memories, selectedCycle, selectedSubject, searchQuery]);

  // Métricas Institucionales Agregadas
  const metrics = useMemo(() => {
    let totalStudents = 0;
    let weightedMasterySum = 0;
    const teachersSet = new Set<string>();
    const frictionCountMap = new Map<string, { count: number; subject: string }>();

    memories.forEach(m => {
      const fm = m.frontmatter;
      const count = fm.metrics?.students_evaluated_count || 0;
      const rate = fm.metrics?.mastery_rate || 0;

      totalStudents += count;
      weightedMasterySum += rate * count;
      teachersSet.add(fm.author_display_name);

      const frictions = fm.metrics?.comprehension_friction_points || [];
      frictions.forEach(f => {
        if (!f || f === 'ninguna_detectada') return;
        const current = frictionCountMap.get(f) || { count: 0, subject: fm.subject };
        current.count += 1;
        frictionCountMap.set(f, current);
      });
    });

    const averageMastery = totalStudents > 0 ? (weightedMasterySum / totalStudents) : 0;

    const topFrictions = Array.from(frictionCountMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([friction, data]) => ({ friction, count: data.count, subject: data.subject }));

    return {
      averageMastery: Math.round(averageMastery * 100),
      totalStudents,
      uniqueTeachersCount: teachersSet.size,
      totalMemories: memories.length,
      topFrictions
    };
  }, [memories]);

  // Agrupamiento por Ciclo y Grado
  const groupedMemories = useMemo(() => {
    const groups: Record<string, Record<string, MemoryItem[]>> = {};

    filteredMemories.forEach(mem => {
      const cycle = mem.frontmatter.academic_cycle;
      const grade = `Grado ${mem.frontmatter.grade}`;

      if (!groups[cycle]) groups[cycle] = {};
      if (!groups[cycle][grade]) groups[cycle][grade] = [];

      groups[cycle][grade].push(mem);
    });

    return groups;
  }, [filteredMemories]);

  const handleCopyWikiLink = (mem: MemoryItem) => {
    const link = `[[planeaciones/Memorias_Institucionales/${mem.frontmatter.academic_cycle}/${mem.filePath.split(/[\\/]/).pop()}]]`;
    navigator.clipboard.writeText(link);
    setCopiedLink(mem.id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* 1. Header Hero Minimalista Apple */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Memoria Institucional & Segundo Cerebro</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Inteligencia Pedagógica Acumulada
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            «Cada ciclo escolar que una institución utiliza iSkool, la institución sabe más sobre sí misma que el ciclo anterior.»
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMemories(true)}
            disabled={isRefreshing || loading}
            title={`Última sincronización: ${lastSyncTime.toLocaleTimeString()}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Bóveda Curricular Sincronizada
          </span>
        </div>
      </div>

      {/* 2. Bento Grid de Indicadores Macroscópicos (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dominio Promedio */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Dominio Global</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.averageMastery}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${metrics.averageMastery}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Promedio acumulado de evaluaciones NEM</p>
        </div>

        {/* Card 2: Alumnos Evaluados (Cero PII) */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Muestra Histórica</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.totalStudents.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>Alumnos evaluados (Cero PII)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">En {metrics.totalMemories} memorias consolidadas</p>
        </div>

        {/* Card 3: Docentes Colaboradores */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Docentes Autores</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.uniqueTeachersCount}
            </div>
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
              Profesores aportando sabiduría
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Continuidad pedagógica entre ciclos</p>
        </div>

        {/* Card 4: Puntos de Fricción Críticos */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fricciones Clave</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {metrics.topFrictions.length > 0 ? (
              metrics.topFrictions.map((f, i) => (
                <div key={i} className="text-xs text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate font-medium">{f.friction}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">Sin fricciones críticas</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Alertas prioritarias para capacitación</p>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda Rápida */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por tema, asignatura, docente o fricción..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Ciclo */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-xs px-1">Ciclo:</span>
            <select
              value={selectedCycle}
              onChange={e => setSelectedCycle(e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Todos los Ciclos</option>
              {availableCycles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Selector de Asignatura */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-xs px-1">Materia:</span>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 capitalize focus:outline-none"
            >
              <option value="all">Todas las Materias</option>
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Lista Agrupada de Memorias Institucionales */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Cargando sabiduría institucional de la Bóveda Curricular...</span>
        </div>
      ) : Object.keys(groupedMemories).length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No se encontraron memorias</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajusta los filtros de búsqueda o emite un nuevo lote desde el panel de evaluación.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMemories).map(([cycle, gradesMap]) => (
            <div key={cycle} className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Ciclo Escolar {cycle}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {Object.values(gradesMap).flat().length} memorias
                </span>
              </div>

              {Object.entries(gradesMap).map(([gradeName, items]) => (
                <div key={gradeName} className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-500/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {gradeName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(mem => {
                      const isExpanded = expandedId === mem.id;
                      const fm = mem.frontmatter;
                      const masteryPct = Math.round((fm.metrics?.mastery_rate || 0) * 100);

                      return (
                        <div 
                          key={mem.id} 
                          className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  {fm.subject}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">
                                  Grupo {fm.group_cohort}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  • {fm.author_display_name}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {fm.topic.replace(/_/g, ' ')}
                              </h4>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                                masteryPct >= 80 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                                  : masteryPct >= 65
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              }`}>
                                {masteryPct}% Dominio
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {fm.metrics.students_evaluated_count} alumnos
                              </div>
                            </div>
                          </div>

                          {/* Fricciones resumidas */}
                          {fm.metrics.comprehension_friction_points.length > 0 && fm.metrics.comprehension_friction_points[0] !== 'ninguna_detectada' && (
                            <div className="mt-3 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="truncate font-medium">{fm.metrics.comprehension_friction_points[0]}</span>
                            </div>
                          )}

                          {/* Botón expandir detalle */}
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : mem.id)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              {isExpanded ? 'Ocultar análisis pedagógico' : 'Ver adaptaciones probadas'}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleCopyWikiLink(mem)}
                              title="Copiar enlace bidireccional de Bóveda"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              {copiedLink === mem.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Detalle Expandible */}
                          {isExpanded && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-fadeIn">
                              <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                  💡 Intervenciones Exitosas de este Docente:
                                </span>
                                <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                                  {mem.sections.adaptacionesExitosas.map((a, idx) => (
                                    <li key={idx}>{a}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                  🔮 Recomendación para el Docente del Próximo Ciclo:
                                </span>
                                <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                                  {mem.sections.recomendacionesProximoCiclo.map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span>Captura: {new Date(mem.createdAt).toLocaleDateString()}</span>
                                <span className="font-mono text-[10px]">WikiLink: [[...]]</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
