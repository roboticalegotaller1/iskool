"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { CommunityActivity, CanvasActivityJSON } from '@/types';
import { ISkoolActivityPlayer } from './ISkoolActivityPlayer';
import { AssignToClassModal } from './AssignToClassModal';
import { getIndependenceCommunityActivities } from '@/data/mexicanIndependenceActivities';
import { getMathematicalLogicCommunityActivities } from '@/data/mathematicalLogicActivities';
import { 
  Heart, 
  Sparkles, 
  Globe, 
  Play, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  BrainCircuit, 
  Brain,
  User, 
  Search,
  MessageSquare,
  Award,
  Rocket,
  X,
  Binary,
  GraduationCap
} from 'lucide-react';

export const TeacherCommunityView: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [votedActivityIds, setVotedActivityIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<CommunityActivity | null>(null);
  const [assigningActivity, setAssigningActivity] = useState<CommunityActivity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'logic_math' | 'independencia' | 'quiz' | 'visual' | 'puzzle' | 'challenge'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'fase_3' | 'fase_4' | 'fase_5' | 'fase_6'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const teacherId = user?.id || 'usr-teacher-1';

  const deduplicateActivities = (list: CommunityActivity[]): CommunityActivity[] => {
    const map = new Map<string, CommunityActivity>();
    for (const item of list) {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  };

  // Cargar actividades comunitarias y votos del profesor
  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const independenceActivities = getIndependenceCommunityActivities();
      const logicActivities = getMathematicalLogicCommunityActivities();
      const mockActivities = getMockCommunityActivities();

      // Función para asegurar que la Clase Magistral (#1) y el Gimnasio Cerebral (#2) del Prof. Israel López Ángeles estén al frente
      const prioritizeMasterclasses = (list: CommunityActivity[]): CommunityActivity[] => {
        const master1 = list.find(a => 
          a.id === '18101821-cafe-4000-8000-000000000001' || 
          a.title.toLowerCase().includes('gesta heroica')
        );
        const master2 = list.find(a => 
          a.id === '18101821-cafe-4000-8000-000000000002' || 
          a.title.toLowerCase().includes('gimnasio cerebral') ||
          (a.title.toLowerCase().includes('héroes y heroínas') && a.template_type === 'custom_builder')
        );

        const priorityList: CommunityActivity[] = [];
        if (master1) priorityList.push(master1);
        if (master2) priorityList.push(master2);

        const priorityIds = new Set(priorityList.map(a => a.id));
        const others = list.filter(a => !priorityIds.has(a.id));
        others.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

        return [...priorityList, ...others];
      };

      // 1. Obtener actividades creadas en la BD
      const { data: activitiesData, error: actError } = await supabase
        .from('community_activities')
        .select('*')
        .order('upvotes', { ascending: false });

      if (actError) {
        console.warn('Supabase fetch notice, combinando con catalogos oficiales:', actError?.message || actError);
        const combined = deduplicateActivities([...independenceActivities, ...logicActivities, ...mockActivities]);
        setActivities(prioritizeMasterclasses(combined));
      } else if (activitiesData && activitiesData.length > 0) {
        // Combinar actividades creadas por usuarios en Supabase con los catálogos oficiales
        const dbIds = new Set(activitiesData.map(a => a.id));
        const combined = deduplicateActivities([
          ...(activitiesData as CommunityActivity[]),
          ...independenceActivities.filter(a => !dbIds.has(a.id)),
          ...logicActivities.filter(a => !dbIds.has(a.id)),
          ...mockActivities.filter(a => !dbIds.has(a.id))
        ]);
        setActivities(prioritizeMasterclasses(combined));
      } else {
        const combined = deduplicateActivities([...independenceActivities, ...logicActivities, ...mockActivities]);
        setActivities(prioritizeMasterclasses(combined));
      }

      // 2. Obtener votos emitidos por el profesor actual
      if (teacherId) {
        const { data: votesData } = await supabase
          .from('activity_votes')
          .select('activity_id')
          .eq('voter_teacher_id', teacherId);

        if (votesData) {
          const ids = new Set(votesData.map(v => v.activity_id));
          setVotedActivityIds(ids);
        }
      }
    } catch (err) {
      console.error('Error cargando comunidad:', err);
      setActivities(deduplicateActivities([...getIndependenceCommunityActivities(), ...getMockCommunityActivities()]));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [teacherId]);

  // Bloqueo de scroll en la página de fondo mientras un modal está abierto
  useEffect(() => {
    if (selectedActivity || assigningActivity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedActivity, assigningActivity]);

  // Manejador del Voto Antifraude
  const handleVote = async (activity: CommunityActivity) => {
    if (votedActivityIds.has(activity.id)) return;

    // Actualización optimista local
    setVotedActivityIds(prev => new Set(prev).add(activity.id));
    setActivities(prev =>
      prev.map(act => act.id === activity.id ? { ...act, upvotes: act.upvotes + 1 } : act)
    );

    try {
      const { error } = await supabase
        .from('activity_votes')
        .insert({
          activity_id: activity.id,
          voter_teacher_id: teacherId
        });

      if (error) {
        if (error.code === '23505') {
          showToast('Ya habías emitido tu voto en esta actividad.');
        } else {
          console.error('Error insertando voto:', error);
        }
      } else {
        showToast('❤️ ¡Voto registrado con éxito!');
      }
    } catch (err) {
      console.error('Error en votación:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Conteos dinámicos para las pestañas de filtros
  const counts = useMemo(() => {
    const logic_math = activities.filter(act => 
      act.template_type.toLowerCase() === 'logic_math' || 
      act.template_type.toLowerCase() === 'logica_matematica' || 
      act.id.startsWith('comm-logic-') ||
      Boolean((act.content_json as any)?.logicChallengeData)
    ).length;

    const indep = activities.filter(act => 
      act.id.startsWith('indep-') || 
      act.title.toLowerCase().includes('independencia') || 
      act.title.toLowerCase().includes('dolores') || 
      act.title.toLowerCase().includes('hidalgo') || 
      act.title.toLowerCase().includes('morelos') || 
      act.title.toLowerCase().includes('insurgente') ||
      (act.content_json?.description && act.content_json.description.toLowerCase().includes('independencia'))
    ).length;

    const quiz = activities.filter(act => ['trivia', 'ruleta', 'ordenamiento'].includes(act.template_type.toLowerCase())).length;
    const visual = activities.filter(act => ['memorama', 'flashcards', 'rompecabezas', 'mapa_interactivo'].includes(act.template_type.toLowerCase())).length;
    const puzzle = activities.filter(act => ['ahorcado', 'match', 'sentence_builder', 'escape_room', 'crucigrama', 'word_detective', 'sopa_letras', 'clasificacion'].includes(act.template_type.toLowerCase())).length;
    const challenge = activities.filter(act => ['carrera_math', 'tf_explosivo', 'simon_says', 'batalla_respuestas', 'treasure_hunt'].includes(act.template_type.toLowerCase())).length;

    return { total: activities.length, logic_math, indep, quiz, visual, puzzle, challenge };
  }, [activities]);

  // Filtrado de Actividades
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = act.title.toLowerCase().includes(q) ||
        act.template_type.toLowerCase().includes(q) ||
        (act.teacher_name && act.teacher_name.toLowerCase().includes(q)) ||
        (act.content_json?.description && act.content_json.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filtro por Nivel Educativo (Fases NEM)
      if (levelFilter !== 'all') {
        const actFase = (act.content_json as any)?.faseNem?.toLowerCase().replace(' ', '_');
        const matchesLevel = actFase === levelFilter || 
          (levelFilter === 'fase_3' && (act.title.includes('Fase 3') || (act.content_json as any)?.targetAge?.includes('6-8') || (act.content_json as any)?.targetAge?.includes('Primaria Baja'))) ||
          (levelFilter === 'fase_4' && (act.title.includes('Fase 4') || (act.content_json as any)?.targetAge?.includes('8-10') || (act.content_json as any)?.targetAge?.includes('Primaria Media') || (act.content_json as any)?.targetAge?.includes('Educación Básica'))) ||
          (levelFilter === 'fase_5' && (act.title.includes('Fase 5') || (act.content_json as any)?.targetAge?.includes('10-12') || (act.content_json as any)?.targetAge?.includes('Primaria Alta'))) ||
          (levelFilter === 'fase_6' && (act.title.includes('Fase 6') || (act.content_json as any)?.targetAge?.includes('12-15') || (act.content_json as any)?.targetAge?.includes('Secundaria')));
        if (!matchesLevel) return false;
      }

      if (categoryFilter === 'logic_math') {
        return act.template_type.toLowerCase() === 'logic_math' || 
          act.template_type.toLowerCase() === 'logica_matematica' || 
          act.id.startsWith('comm-logic-') ||
          Boolean((act.content_json as any)?.logicChallengeData);
      }

      if (categoryFilter === 'independencia') {
        return act.id.startsWith('indep-') || 
          act.title.toLowerCase().includes('independencia') || 
          act.title.toLowerCase().includes('dolores') || 
          act.title.toLowerCase().includes('hidalgo') || 
          act.title.toLowerCase().includes('morelos') || 
          act.title.toLowerCase().includes('insurgente') ||
          (act.content_json?.description && act.content_json.description.toLowerCase().includes('independencia'));
      }

      if (categoryFilter === 'quiz') {
        return ['trivia', 'ruleta', 'ordenamiento'].includes(act.template_type.toLowerCase());
      }

      if (categoryFilter === 'visual') {
        return ['memorama', 'flashcards', 'rompecabezas', 'mapa_interactivo'].includes(act.template_type.toLowerCase());
      }

      if (categoryFilter === 'puzzle') {
        return ['ahorcado', 'match', 'sentence_builder', 'escape_room', 'crucigrama', 'word_detective', 'sopa_letras', 'clasificacion'].includes(act.template_type.toLowerCase());
      }

      if (categoryFilter === 'challenge') {
        return ['carrera_math', 'tf_explosivo', 'simon_says', 'batalla_respuestas', 'treasure_hunt'].includes(act.template_type.toLowerCase());
      }

      return true;
    });
  }, [activities, searchQuery, categoryFilter, levelFilter]);

  return (
    <div className="w-full space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 font-bold text-sm flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header del Explorador de la Comunidad */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200/40">
            <Globe className="w-3.5 h-3.5" />
            <span>Red Global de Maestros ISkool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Comunidad Docente
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
            Explora más de 80 juegos y retos de lógica matemática catalogados por profesores, apóyalos con tu voto y clónalos a tus grupos.
          </p>
        </div>

        {/* Buscador & Reload */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar actividad o tema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Buscar actividad docente en la comunidad"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={fetchCommunityData}
            disabled={isLoading}
            aria-label="Actualizar listado de la comunidad docente"
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Actualizar comunidad"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barra de Filtros por Categoría */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            aria-label="Ver todas las actividades"
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
            }`}
          >
            Todas ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('logic_math')}
            aria-label="Filtrar por Lógica Matemática y Pensamiento Computacional"
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'logic_math'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400'
                : 'bg-white dark:bg-zinc-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-800/70 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>🧮 Lógica Matemática ({counts.logic_math})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('independencia')}
            aria-label="Filtrar por Independencia de México"
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'independencia'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                : 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <span>🇲🇽 Independencia de México ({counts.indep})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('quiz')}
            aria-label="Filtrar por tipo Quiz"
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'quiz'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            Quizzes & Ruletas ({counts.quiz})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('visual')}
            aria-label="Filtrar por tipo Visual"
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'visual'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            Visuales & Memoramas ({counts.visual})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('puzzle')}
            aria-label="Filtrar por tipo Puzzle"
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'puzzle'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            Puzzles & Escape Rooms ({counts.puzzle})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('challenge')}
            aria-label="Filtrar por tipo Challenge"
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'challenge'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            Desafíos & Carreras ({counts.challenge})
          </button>
        </div>

        {/* Sub-Filtros por Nivel Educativo (Fases NEM) */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
          <span className="font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 pr-2">
            <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Nivel Educativo:</span>
          </span>

          {[
            { id: 'all', label: 'Todos los Grados' },
            { id: 'fase_3', label: '🐣 Fase 3 (1º-2º Primaria)' },
            { id: 'fase_4', label: '🎨 Fase 4 (3º-4º Primaria)' },
            { id: 'fase_5', label: '🚀 Fase 5 (5º-6º Primaria)' },
            { id: 'fase_6', label: '⚡ Fase 6 (Secundaria)' }
          ].map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setLevelFilter(level.id as any)}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                levelFilter === level.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Reproductor Visual (Fábrica de Actividades ISkool) con Portal al Viewport */}
      {mounted && selectedActivity && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className={`relative w-full ${
            selectedActivity.template_type === 'custom_builder' || 
            selectedActivity.template_type === 'activity_flow' || 
            Boolean((selectedActivity.content_json as any)?.blocks) 
              ? 'max-w-5xl' 
              : 'max-w-2xl'
          } bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in my-auto sm:my-2`}>
            {/* Barra Superior Integrada y Compacta */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-850/90">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                  {selectedActivity.template_type === 'custom_builder' ? 'FLUJO STUDIO' : selectedActivity.template_type.toUpperCase()}
                </span>
                <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 line-clamp-1">
                  {selectedActivity.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                aria-label="Cerrar reproductor de juego"
                className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-zinc-750 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-zinc-300 transition-all cursor-pointer shadow-sm"
                title="Cerrar vista previa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido de la actividad con tamaño exacto */}
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
              <ISkoolActivityPlayer
                activity={selectedActivity.content_json}
                templateType={selectedActivity.template_type}
                onClose={() => setSelectedActivity(null)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Asignación Rápida a Clase (1 Clic) */}
      <AssignToClassModal
        activity={assigningActivity}
        isOpen={!!assigningActivity}
        onClose={() => setAssigningActivity(null)}
        onSuccess={(groupName) => {
          showToast(`🚀 ¡Juego asignado con éxito a ${groupName}!`);
        }}
      />

      {/* Grilla de Tarjetas de la Comunidad */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">Cargando la red docente...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <Globe className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-zinc-300">No se encontraron actividades en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deduplicateActivities(filteredActivities).map((activity, index) => {
            const hasVoted = votedActivityIds.has(activity.id);
            const isMasterclass = activity.id === '18101821-cafe-4000-8000-000000000001' || 
              activity.title.toLowerCase().includes('gesta heroica');
            const isCognitiveChallenge = activity.id === '18101821-cafe-4000-8000-000000000002' || 
              activity.title.toLowerCase().includes('gimnasio cerebral') ||
              activity.title.toLowerCase().includes('destrezas del pensamiento') ||
              (activity.title.toLowerCase().includes('héroes y heroínas') && activity.template_type === 'custom_builder');

            return (
              <div
                key={activity.id || `activity-${index}`}
                className={`group bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border ${
                  isMasterclass 
                    ? 'border-amber-400 dark:border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30' 
                    : isCognitiveChallenge
                    ? 'border-cyan-500 dark:border-cyan-400 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-400/30'
                    : 'border-slate-200/80 dark:border-zinc-800/80 shadow-sm hover:border-emerald-500/40'
                } rounded-3xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5`}
              >
                <div className="space-y-4">
                  {/* Badge de Actividad Destacada */}
                  {isMasterclass && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black tracking-wide shadow-sm w-fit">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>⭐ CLASE MAGISTRAL DESTACADA (6 NODOS)</span>
                    </div>
                  )}

                  {isCognitiveChallenge && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm w-fit">
                      <Brain className="w-3.5 h-3.5 fill-white" />
                      <span>⚡ GIMNASIO COGNITIVO Y LECTURA VELOZ (6 NODOS)</span>
                    </div>
                  )}

                  {/* Tipo de Plantilla & Votos */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                      isMasterclass 
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300' 
                        : isCognitiveChallenge
                        ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-300'
                        : 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border-purple-200/40'
                    }`}>
                      {isMasterclass 
                        ? '🎨 Flujo Multimodal Studio' 
                        : isCognitiveChallenge 
                        ? '🧠 Gimnasio Cognitivo PPM' 
                        : `🎮 ${activity.template_type}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVote(activity)}
                      disabled={hasVoted}
                      aria-label={`Votar por la actividad ${activity.title}`}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                        hasVoted 
                          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 border border-rose-200/60' 
                          : 'bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-500 text-slate-600 dark:text-zinc-300'
                      }`}
                      title={hasVoted ? 'Ya votaste por este juego' : 'Votar por este juego'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{activity.upvotes || 0}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {hasVoted ? 'Votado' : 'Votar'}
                      </span>
                    </button>
                  </div>

                  {/* Título & Autor */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {activity.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        Autor: {activity.teacher_name || 'Prof. Israel López Ángeles'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mt-2">
                      {activity.content_json?.description || 'Actividad interactiva para reforzar aprendizajes clave en el aula.'}
                    </p>
                  </div>

                  {/* Metadata de Preguntas / Nodos */}
                  {isMasterclass ? (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>6 Nodos Gamificados (Diálogo, Cronología, Match, Escape Room, Jefe RPG, Recompensa)</span>
                    </div>
                  ) : isCognitiveChallenge ? (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                      <Brain className="w-3.5 h-3.5 text-cyan-500" />
                      <span>6 Nodos Cognitivos: Lectura Veloz PPM, Inferencia Lógica, Criptografía, Jerarquía, Duelo Pixi, Medalla</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                      <span>{activity.content_json?.questions?.length || 4} Preguntas Interactivas</span>
                    </div>
                  )}
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(activity)}
                    aria-label={`Previsualizar y jugar ${activity.title}`}
                    className={`py-2.5 px-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isMasterclass 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20' 
                        : isCognitiveChallenge
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Previsualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssigningActivity(activity)}
                    aria-label={`Asignar ${activity.title} a mi clase`}
                    className="py-2.5 px-3.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-purple-200/50 dark:border-purple-800/50 shadow-sm cursor-pointer"
                    title="Asignar este juego a mis alumnos en 1 clic"
                  >
                    <Rocket className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                    <span>Asignar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

// Plantillas de ejemplo por defecto para previsualizar si la BD aún no tiene registros
function getMockCommunityActivities(): CommunityActivity[] {
  const baseActivities: CommunityActivity[] = [
    {
      id: 'act-mock-1',
      teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
      title: 'Desafío del Biodigestor Anaeróbico',
      template_type: 'trivia',
      upvotes: 42,
      created_at: new Date().toISOString(),
      teacher_name: 'Elena Rostova',
      content_json: {
        title: 'Desafío del Biodigestor Anaeróbico',
        description: 'Demuestra tus conocimientos sobre ecotecnias, descomposición de materia orgánica y generación de biogás para la comunidad.',
        questions: [
          {
            question: '¿Qué tipo de bacterias intervienen en la producción de biogás en ausencia de oxígeno?',
            options: ['Bacterias Anaeróbicas', 'Bacterias Aeróbicas', 'Hongos Filamentosos', 'Virus Sintéticos'],
            correctIndex: 0
          },
          {
            question: '¿Cuál es el gas principal resultante del proceso de digestión anaeróbica?',
            options: ['Dióxido de Carbono', 'Gas Metano (CH4)', 'Oxígeno Puro', 'Nitrógeno Líquido'],
            correctIndex: 1
          },
          {
            question: '¿Cuál es el uso principal del subproducto líquido conocido como biol?',
            options: ['Refrigerante industrial', 'Fertilizante orgánico foliar', 'Combustible de motores', 'Detergente ecológico'],
            correctIndex: 1
          }
        ]
      }
    },
    {
      id: 'act-mock-2',
      teacher_id: 'usr-teacher-2',
      title: 'La Pizza de Fracciones Equivalentes',
      template_type: 'memorama',
      upvotes: 38,
      created_at: new Date().toISOString(),
      teacher_name: 'Carlos Mendoza',
      content_json: {
        title: 'La Pizza de Fracciones Equivalentes',
        description: 'Resuelve problemas prácticos dividiendo pizzas y descubriendo fracciones equivalentes.',
        questions: [
          {
            question: 'Si dividimos una pizza en 8 rebanadas y comemos 4, ¿qué fracción equivalente representa?',
            options: ['1/4 de la pizza', '1/2 de la pizza', '3/4 de la pizza', '2/3 de la pizza'],
            correctIndex: 1
          },
          {
            question: '¿Cuál de las siguientes fracciones es equivalente a 2/4?',
            options: ['4/8', '3/5', '1/3', '5/6'],
            correctIndex: 0
          }
        ]
      }
    }
  ];

  return baseActivities;
}
