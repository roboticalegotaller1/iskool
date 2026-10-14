"use client";

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Network, 
  BarChart3, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Award,
  Volume2,
  Filter,
  Check,
  Compass
} from 'lucide-react';
import { english40WeeksCurriculum } from './data/english40WeeksCurriculum';
import { french40WeeksCurriculum } from './data/french40WeeksCurriculum';
import { CurricularWeek, CurricularLesson } from './data/curriculumTypes';

interface Curriculum12PhasesExplorerProps {
  language: 'en' | 'fr';
  isLightMode?: boolean;
  onSelectLessonTemplate?: (template: {
    title: string;
    topic: string;
    level: string;
    language: 'en' | 'fr';
    dialogue: any[];
    karaokePhrases: any[];
  }) => void;
}

export const Curriculum12PhasesExplorer: React.FC<Curriculum12PhasesExplorerProps> = ({ 
  language,
  isLightMode = true,
  onSelectLessonTemplate 
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(6); // Por defecto Fase 6 (Planeación 40 Semanas)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [selectedTrimester, setSelectedTrimester] = useState<'all' | 1 | 2 | 3>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mapeo detallado de las 12 Fases pedagógicas de ISkool
  const phases = [
    {
      id: 1,
      name: 'Fase 1: Bóveda Curricular',
      tag: 'Segundo Cerebro',
      desc: 'Base de conocimiento estructurada en Markdown y Frontmatter YAML con enlaces bidireccionales y persistencia institucional.',
      metric: language === 'fr' ? '36 Nodos FLE' : '222 Nodos ESL'
    },
    {
      id: 2,
      name: 'Fase 2: Grafo Académico Políglota',
      tag: 'Grafo Dirigido',
      desc: 'Topología de prerrequisitos sin ciclos, coherencia de dependencias y taxocodificación oficial.',
      metric: '258 Nodos Globales (0 ciclos)'
    },
    {
      id: 3,
      name: 'Fase 3: Generación Académica NEM',
      tag: 'Alineación SEP',
      desc: 'Estructuración pedagógica oficial: Inicio (10m), Desarrollo (30m), Cierre (10m) y PDA oficial de la SEP.',
      metric: '100% Calidad Aprobada'
    },
    {
      id: 4,
      name: 'Fase 4: Matriz de Certificación',
      tag: 'Equivalencia Oficial',
      desc: language === 'fr' 
        ? 'Alineación oficial France Éducation International (DELF Prim/Junior A1-B2) y SEP CENNI 1 a 20.' 
        : 'Alineación oficial Cambridge English (A1-C1) y SEP CENNI 1 a 20.',
      metric: 'CEFR A1-C1 / CENNI 1-20'
    },
    {
      id: 5,
      name: 'Fase 5: Escalamiento del Banco Curricular',
      tag: 'Cobertura Completa',
      desc: 'Cobertura total de 640 ranuras didácticas especializadas para Primaria Alta, Secundaria y Preparatoria.',
      metric: '640 Ranuras Curriculares'
    },
    {
      id: 6,
      name: 'Fase 6: Course Planning Layer (40 Semanas)',
      tag: 'Planeación Anual',
      desc: 'Distribución balanceada de 40 semanas lectivas (160 lecciones formales) con evaluaciones trimestrales.',
      metric: '160 Lecciones / 40 Semanas'
    },
    {
      id: 7,
      name: 'Fase 7: Adaptive Learning & Mastery',
      tag: 'Motor Adaptativo',
      desc: 'Diagnóstico en tiempo real, modelado de maestría BKT/IRT y sugerencias automáticas de remediación.',
      metric: 'BKT & IRT Activos'
    },
    {
      id: 8,
      name: 'Fase 8: Tutor Conversacional Socrático',
      tag: 'Diálogo Pedagógico',
      desc: 'Tutor 1 a 1 que orienta mediante preguntas detonadoras, detecta interferencias fonéticas y no da respuestas masticadas.',
      metric: 'Procesamiento de Voz Local'
    },
    {
      id: 9,
      name: 'Fase 9: Teacher Copilot (FLE & ESL)',
      tag: 'Human-in-the-Loop',
      desc: 'Asistente docente que redacta secuencias didácticas, rúbricas DELF/CENNI y sugerencias accionales en borrador.',
      metric: 'Copiloto Asistido'
    },
    {
      id: 10,
      name: 'Fase 10: Academic Analytics Engine',
      tag: 'Analítica Forense',
      desc: 'Detección de alumnos en riesgo, radares de competencias lingüísticas y distribución de cohortes.',
      metric: 'Radar & Cohortes'
    },
    {
      id: 11,
      name: 'Fase 11: Leadership Dashboard',
      tag: 'Supervisión Directiva',
      desc: 'Tablero para directores y coordinadores con KPIs institucionales de cumplimiento curricular y certificación.',
      metric: 'Gobierno Directivo'
    },
    {
      id: 12,
      name: 'Fase 12: Production Readiness & Governance',
      tag: 'Infraestructura Segura',
      desc: 'Aislamiento multi-tenant estricto, Circuit Breakers, Libro de Costos (Cost Ledger) y cumplimiento sin marcas comerciales.',
      metric: 'Marca Blanca Institucional'
    }
  ];

  // Base curricular completa de 40 semanas
  const allWeeks: CurricularWeek[] = useMemo(() => {
    return language === 'fr' ? french40WeeksCurriculum : english40WeeksCurriculum;
  }, [language]);

  // Filtrado reactivo por trimestre, nivel CEFR y búsqueda
  const filteredWeeks = useMemo(() => {
    return allWeeks.filter((week) => {
      // Filtro de Trimestre
      if (selectedTrimester !== 'all' && week.trimester !== selectedTrimester) {
        return false;
      }

      // Filtro de Nivel
      if (selectedLevel !== 'all' && !week.cefr.startsWith(selectedLevel)) {
        return false;
      }

      // Filtro de Búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesWeek = 
          week.title.toLowerCase().includes(query) ||
          week.level.toLowerCase().includes(query) ||
          week.certificationTarget.toLowerCase().includes(query) ||
          week.pda.toLowerCase().includes(query) ||
          `s${week.weekNumber}`.toLowerCase().includes(query) ||
          `semana ${week.weekNumber}`.toLowerCase().includes(query) ||
          `semaine ${week.weekNumber}`.toLowerCase().includes(query);

        const matchesLesson = week.lessons.some((lesson) =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.target.toLowerCase().includes(query) ||
          lesson.translationEs.toLowerCase().includes(query) ||
          (lesson.phoneticTip && lesson.phoneticTip.toLowerCase().includes(query))
        );

        return matchesWeek || matchesLesson;
      }

      return true;
    });
  }, [allWeeks, selectedTrimester, selectedLevel, searchQuery]);

  // Total de lecciones disponibles en la vista actual
  const totalLessonsInView = useMemo(() => {
    return filteredWeeks.reduce((acc, week) => acc + week.lessons.length, 0);
  }, [filteredWeeks]);

  return (
    <div className="space-y-6">
      {/* Selector de las 12 Fases */}
      <div className={`p-5 rounded-3xl border space-y-4 transition-all ${
        isLightMode 
          ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
          : 'bg-slate-900 border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
          isLightMode ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
              Ecosistema Integral ISkool (12 Fases)
            </span>
            <h3 className={`text-base font-black flex items-center gap-2 ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Arquitectura Curricular de 12 Fases ({language === 'fr' ? 'Francés FLE' : 'Inglés ESL'})</span>
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
            isLightMode 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-indigo-950 border-indigo-700 text-indigo-300'
          }`}>
            {language === 'fr' ? '🇫🇷 Français Langue Étrangère' : '🇬🇧 English as a Second Language'}
          </span>
        </div>

        {/* Cuadrícula de las 12 Fases */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {phases.map((phase) => {
            const isSelected = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(phase.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? (isLightMode 
                        ? 'bg-gradient-to-b from-indigo-50 to-indigo-100/90 border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.02]' 
                        : 'bg-gradient-to-b from-indigo-900/80 to-purple-950/80 border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.02]')
                    : (isLightMode 
                        ? 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-700 hover:bg-slate-100/80' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : (isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400')
                  }`}>
                    Fase {phase.id}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>

                <div>
                  <h5 className={`text-[11px] font-black line-clamp-1 ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    {phase.name.replace(/^Fase \d+: /, '')}
                  </h5>
                  <span className={`text-[9px] block font-bold truncate ${
                    isLightMode ? 'text-indigo-600' : 'text-indigo-300'
                  }`}>
                    {phase.metric}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de la Fase Seleccionada */}
        {selectedPhase && (
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isLightMode 
              ? 'bg-indigo-50/70 border-indigo-200 text-slate-800' 
              : 'bg-indigo-950/30 border-indigo-700/40 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-black flex items-center gap-1.5 ${
                isLightMode ? 'text-indigo-900' : 'text-indigo-300'
              }`}>
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{phases[selectedPhase - 1]?.name}: {phases[selectedPhase - 1]?.tag}</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${
                isLightMode ? 'text-cyan-700' : 'text-cyan-300'
              }`}>
                {phases[selectedPhase - 1]?.metric}
              </span>
            </div>
            <p className={`leading-relaxed text-[11px] ${
              isLightMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {phases[selectedPhase - 1]?.desc}
            </p>
          </div>
        )}
      </div>

      {/* Explorador de Semanas del Curso (Fase 6: Course Planning Layer - 40 Semanas Completas) */}
      <div className={`p-5 rounded-3xl border space-y-5 transition-all ${
        isLightMode 
          ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
          : 'bg-slate-900 border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
          isLightMode ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isLightMode 
                  ? 'bg-teal-50 border-teal-200 text-teal-800' 
                  : 'bg-teal-950 border-teal-600/40 text-teal-300'
              }`}>
                Planificación Completa de 40 Semanas
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                isLightMode 
                  ? 'bg-purple-50 border-purple-200 text-purple-800' 
                  : 'bg-purple-950 border-purple-600/40 text-purple-300'
              }`}>
                {language === 'fr' ? 'DELF Prim/Junior A1-B2 & CENNI 1-14' : 'Cambridge Starters/Key/PET/FCE & CENNI 1-14'}
              </span>
            </div>
            <h4 className={`text-base font-black flex items-center gap-2 mt-1 ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Banco de 40 Semanas Lectivas y Unidades Didácticas (160 Lecciones)</span>
            </h4>
            <p className={`text-[12px] ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Trayecto curricular continuo sin omisiones intermedias para el aprendizaje y certificación internacional en {language === 'fr' ? 'francés' : 'inglés'}.
            </p>
          </div>
          
          <div className="text-right">
            <span className={`text-xs font-mono font-bold block ${
              isLightMode ? 'text-teal-700' : 'text-teal-400'
            }`}>
              {totalLessonsInView} / 160 Lecciones {filteredWeeks.length < 40 ? 'Filtradas' : 'Disponibles'}
            </span>
            <span className={`text-[10px] font-medium ${
              isLightMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              40 Semanas Formales (4 lecciones por semana)
            </span>
          </div>
        </div>

        {/* Barra de Filtros: Trimestres, Niveles y Buscador en Tiempo Real */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-2xl border ${
          isLightMode 
            ? 'bg-slate-50/90 border-slate-200' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          {/* Selector de Trimestre */}
          <div className={`md:col-span-4 flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedTrimester('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                selectedTrimester === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              Todas (1-40)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrimester(1)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                selectedTrimester === 1
                  ? 'bg-teal-600 text-white shadow-xs'
                  : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
              title="Semanas 1 a 13: Fundamentos A1/A1+"
            >
              Trim. 1 (A1)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrimester(2)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                selectedTrimester === 2
                  ? 'bg-sky-600 text-white shadow-xs'
                  : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
              title="Semanas 14 a 26: Consolidación A2/A2+"
            >
              Trim. 2 (A2)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrimester(3)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                selectedTrimester === 3
                  ? 'bg-purple-600 text-white shadow-xs'
                  : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
              title="Semanas 27 a 40: Autonomía & Certificación B1/B2"
            >
              Trim. 3 (B1/B2)
            </button>
          </div>

          {/* Selector de Nivel CEFR */}
          <div className={`md:col-span-3 flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold transition-all text-center ${
                selectedLevel === 'all' 
                  ? (isLightMode ? 'bg-slate-200 text-slate-900' : 'bg-slate-700 text-white')
                  : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              Niveles
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('A1')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold transition-all text-center ${
                selectedLevel === 'A1' 
                  ? 'bg-emerald-600 text-white' 
                  : (isLightMode ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-400 hover:text-emerald-300')
              }`}
            >
              A1
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('A2')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold transition-all text-center ${
                selectedLevel === 'A2' 
                  ? 'bg-sky-600 text-white' 
                  : (isLightMode ? 'text-slate-600 hover:text-sky-700' : 'text-slate-400 hover:text-sky-300')
              }`}
            >
              A2
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('B1')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold transition-all text-center ${
                selectedLevel === 'B1' 
                  ? 'bg-indigo-600 text-white' 
                  : (isLightMode ? 'text-slate-600 hover:text-indigo-700' : 'text-slate-400 hover:text-indigo-300')
              }`}
            >
              B1
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('B2')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg font-bold transition-all text-center ${
                selectedLevel === 'B2' 
                  ? 'bg-purple-600 text-white' 
                  : (isLightMode ? 'text-slate-600 hover:text-purple-700' : 'text-slate-400 hover:text-purple-300')
              }`}
            >
              B2
            </button>
          </div>

          {/* Buscador de Lecciones o Temas */}
          <div className="md:col-span-5 relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLightMode ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'fr' ? 'Filtrer par semaine, objectif ou phonétique...' : 'Search week, grammar, phonetics or PDA...'}
              className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                isLightMode 
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-xs' 
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Selector de Salto Rápido a Semanas (S1 a S40) */}
        <div className="space-y-1.5">
          <div className={`flex items-center justify-between text-[11px] px-1 ${
            isLightMode ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <span className={`flex items-center gap-1 font-bold ${
              isLightMode ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Navegación Rápida por Semanas (1 - 40):</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandedWeek(expandedWeek === null ? 1 : null)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
              >
                {expandedWeek === null ? 'Expandir primera' : 'Colapsar activa'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((weekNum) => {
              const isSelected = expandedWeek === weekNum;
              const weekData = allWeeks.find((w) => w.weekNumber === weekNum);
              const trimesterBorder = isLightMode 
                ? (weekNum <= 13 ? 'border-teal-200' : (weekNum <= 26 ? 'border-sky-200' : 'border-purple-200'))
                : (weekNum <= 13 ? 'border-teal-800/60' : (weekNum <= 26 ? 'border-sky-800/60' : 'border-purple-800/60'));
              
              return (
                <button
                  key={weekNum}
                  type="button"
                  onClick={() => {
                    setExpandedWeek(weekNum);
                    if (selectedTrimester !== 'all') {
                      const weekTrimester = weekNum <= 13 ? 1 : (weekNum <= 26 ? 2 : 3);
                      if (selectedTrimester !== weekTrimester) {
                        setSelectedTrimester(weekTrimester as any);
                      }
                    }
                  }}
                  title={weekData ? `${weekData.title} (${weekData.level})` : `Semana ${weekNum}`}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105'
                      : (isLightMode 
                          ? `bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 ${trimesterBorder}` 
                          : `bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 ${trimesterBorder}`)
                  }`}
                >
                  S{weekNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de las 40 Semanas */}
        <div className="space-y-3">
          {filteredWeeks.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className={`text-sm font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                No se encontraron semanas con los criterios actuales
              </p>
              <p className="text-xs text-slate-500">Prueba ajustando los filtros de trimestre o buscando con otro término.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTrimester('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            filteredWeeks.map((week) => {
              const isExpanded = expandedWeek === week.weekNumber;
              const isCapstoneWeek = week.weekNumber === 13 || week.weekNumber === 26 || week.weekNumber === 40;

              // Colorimetría por nivel CEFR
              const levelBadgeStyle = isLightMode
                ? (week.cefr.startsWith('A1')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : (week.cefr.startsWith('A2')
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : (week.cefr.startsWith('B1')
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200')))
                : (week.cefr.startsWith('A1')
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800/80'
                  : (week.cefr.startsWith('A2')
                    ? 'bg-sky-950 text-sky-300 border-sky-800/80'
                    : (week.cefr.startsWith('B1')
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-800/80'
                      : 'bg-purple-950 text-purple-300 border-purple-800/80')));

              return (
                <div
                  key={week.weekNumber}
                  id={`week-${week.weekNumber}`}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isCapstoneWeek
                      ? (isLightMode 
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/40 shadow-xs' 
                          : 'border-amber-600/40 bg-gradient-to-r from-slate-950 via-amber-950/10 to-slate-950 shadow-md shadow-amber-900/10')
                      : (isLightMode 
                          ? 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs' 
                          : 'border-slate-800 bg-slate-950')
                  }`}
                >
                  <div
                    onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isLightMode ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 border ${
                        isCapstoneWeek
                          ? (isLightMode ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-900/60 border-amber-500 text-amber-200')
                          : (isLightMode 
                              ? (week.trimester === 1
                                ? 'bg-teal-50 border-teal-200 text-teal-800'
                                : (week.trimester === 2
                                  ? 'bg-sky-50 border-sky-200 text-sky-800'
                                  : 'bg-purple-50 border-purple-200 text-purple-800'))
                              : (week.trimester === 1
                                ? 'bg-teal-950 border-teal-700/60 text-teal-300'
                                : (week.trimester === 2
                                  ? 'bg-sky-950 border-sky-700/60 text-sky-300'
                                  : 'bg-purple-950 border-purple-700/60 text-purple-300')))
                      }`}>
                        S{week.weekNumber}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className={`text-xs sm:text-sm font-black ${
                            isLightMode ? 'text-slate-900' : 'text-white'
                          }`}>
                            {week.title}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${levelBadgeStyle}`}>
                            {week.level}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            isLightMode 
                              ? 'bg-amber-50 border border-amber-200 text-amber-800' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            <Award className="w-3 h-3 text-amber-500" />
                            <span>{week.certificationTarget}</span>
                          </span>
                        </div>
                        <span className={`text-[11px] block mt-1 leading-snug ${
                          isLightMode ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          <strong className={isLightMode ? 'text-slate-800' : 'text-slate-300'}>PDA SEP:</strong> {week.pda}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`text-[10px] font-bold hidden md:inline ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {week.lessons.length} Lecciones
                      </span>
                      {isExpanded ? (
                        <ChevronDown className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </div>

                  {/* Lista de las 4 Lecciones de la Semana */}
                  {isExpanded && (
                    <div className={`p-4 pt-1 border-t space-y-2.5 ${
                      isLightMode 
                        ? 'border-slate-100 bg-slate-50/50' 
                        : 'border-slate-900 bg-slate-950/80'
                    }`}>
                      {week.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className={`p-3.5 rounded-xl border flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-xs transition-colors ${
                            isLightMode 
                              ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300' 
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-[280px]">
                            <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isLightMode ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div className="space-y-1">
                              <span className={`font-bold block text-xs sm:text-sm ${
                                isLightMode ? 'text-slate-900' : 'text-white'
                              }`}>
                                {lesson.title}
                              </span>
                              <div className={`text-[12px] font-medium flex items-center gap-1.5 flex-wrap ${
                                isLightMode ? 'text-indigo-900' : 'text-cyan-300'
                              }`}>
                                <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 flex-shrink-0" />
                                <span>&ldquo;{lesson.target}&rdquo;</span>
                              </div>
                              <span className={`text-[11px] block italic ${
                                isLightMode ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                                Soporte: {lesson.translationEs}
                              </span>
                              {lesson.phoneticTip && (
                                <div className={`text-[10px] px-2 py-1 rounded-md inline-block mt-1 border ${
                                  isLightMode 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800' 
                                    : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300'
                                }`}>
                                  <strong>Guía Fonética:</strong> {lesson.phoneticTip}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectLessonTemplate?.({
                                title: lesson.title,
                                topic: week.title,
                                level: week.cefr,
                                language,
                                dialogue: [
                                  {
                                    id: `d-${Date.now()}-1`,
                                    speaker: 'avatar',
                                    text: lesson.target,
                                    translationEs: lesson.translationEs,
                                    phoneticTip: lesson.phoneticTip
                                  },
                                  {
                                    id: `d-${Date.now()}-2`,
                                    speaker: 'student',
                                    text: language === 'fr' 
                                      ? 'Merci professeur, je comprends parfaitement la leçon et je répète avec assurance.' 
                                      : 'Thank you teacher, I understand the concept clearly and I will practice with confidence.'
                                  }
                                ],
                                karaokePhrases: [
                                  {
                                    id: `k-${Date.now()}-1`,
                                    targetText: lesson.target,
                                    translationEs: lesson.translationEs,
                                    difficulty: week.cefr.startsWith('A') 
                                      ? 'beginner' 
                                      : (week.cefr.startsWith('B1') ? 'intermediate' : 'advanced')
                                  }
                                ]
                              });
                            }}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105 ml-auto"
                          >
                            <span>Cargar en Taller</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
