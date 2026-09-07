"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSchoolAdminStore, getSchoolStudents, getSchoolSchedules, resolveEffectiveSchoolId } from '@/store/useSchoolAdminStore';
import { getStudentAcademicLevelInfo } from '@/lib/academicLevels';
import { STATS_MAP_SEED, AVATAR_MAP_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { 
  Award, CheckCircle2, Settings, Save, Info, Sparkles, Swords, 
  X, MapPin, Phone, Mail, User, Activity, Dumbbell, Brain, Shield, ChevronDown, ChevronUp, Coins, Lock
} from 'lucide-react';
import { DetailedStudent, StudentStats } from '@/types';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useStudentStore, normalizeStudentId } from '@/store/useStudentStore';
import { supabase } from '@/lib/supabaseClient';

// Custom Avatar Preview component for RPG styling
const PlayerAvatarPreview = ({ avatar, name }: { avatar: any; name: string }) => {
  const getBgGradient = (bg: string) => {
    if (bg === 'forest') return 'from-emerald-950 via-teal-900 to-zinc-950';
    if (bg === 'space') return 'from-indigo-950 via-blue-900 to-purple-950';
    if (bg === 'sunset') return 'from-orange-950 via-red-900 to-zinc-950';
    return 'from-zinc-900 to-slate-950';
  };
  
  const initials = name.substring(0, 2).toUpperCase();
  const hairColor = avatar?.hair_color || '#4B5563';
  const outfitColor = avatar?.outfit_color || '#3B82F6';

  return (
    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getBgGradient(avatar?.background_style)} border-2 border-amber-500/40 flex items-center justify-center relative overflow-hidden shadow-lg shadow-black/60 group`}>
      {/* Decorative JRPG background highlights */}
      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
      
      {/* SVG Character Representation using student customizer choices */}
      <svg className="absolute inset-0 w-full h-full p-2.5 opacity-40 select-none pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#FDBA74" />
        {/* Hair */}
        <path d="M20 50C20 30 80 30 80 50C80 20 20 20 20 50Z" fill={hairColor} />
        {/* Outfit */}
        <path d="M25 80C35 70 65 70 75 80L50 95L25 80Z" fill={outfitColor} />
      </svg>

      {/* Initials with glowing font */}
      <span className="text-xs font-black font-serif text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.85)] group-hover:scale-110 transition-transform duration-300 relative z-10">
        {initials}
      </span>
      
      {/* Mini badge for RPG class */}
      <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-[6px] font-black text-center text-zinc-400 uppercase tracking-widest leading-none border-t border-zinc-800">
        {avatar?.outfit_style?.substring(0, 5) || 'HERO'}
      </div>
    </div>
  );
};

export default function TeacherGrades() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const statsMap = useStudentStore(state => state.allStats);
  const avatarsMap = useStudentStore(state => state.allAvatars);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const schedulesList = useSchoolAdminStore(state => state.schedulesList);
  const groupsList = useSchoolAdminStore(state => state.groupsList);
  const activeSchoolId = useSchoolAdminStore(state => state.activeSchoolId);
  const targetSchoolId = useMemo(() => {
    return resolveEffectiveSchoolId(user, activeSchoolId, 'sch-jjrosseau');
  }, [user, activeSchoolId]);

  const schoolDetailedStudents = useMemo(() => {
    return getSchoolStudents(detailedStudents, targetSchoolId);
  }, [detailedStudents, targetSchoolId]);

  const schoolSchedulesList = useMemo(() => {
    return getSchoolSchedules(schedulesList, targetSchoolId);
  }, [schedulesList, targetSchoolId]);
  
  const missionsList = useGamificationStore(state => state.missionsList);
  const fetchMissions = useGamificationStore(state => state.fetchMissions);

  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, 'En proceso' | 'Avanzando' | 'Logrado'>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [evaluatingIds, setEvaluatingIds] = useState<Record<string, boolean>>({});
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});

  const allQuests = useMemo(() => {
    return missionsList.flatMap(m => m.quests || []);
  }, [missionsList]);

  const fetchAllAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('quest_attempts')
        .select('*');
      if (!error && data) {
        setAllAttempts(data);
      }
    } catch (err) {
      console.error('Error fetching all quest attempts:', err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'student') {
        router.push('/student');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchPortfolioItems();
      fetchStats();
      fetchMissions();
      fetchAllAttempts();
    }
  }, [user, fetchPortfolioItems, fetchStats, fetchMissions]);

  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const totalQuests = 4;

  const handleSendFormativeEvaluation = async (studentId: string, questId: string) => {
    const key = `${studentId}-${questId}`;
    const evaluation = evaluations[key] || 'En proceso';
    const feedback = feedbacks[key] || '';
    
    setEvaluatingIds(prev => ({ ...prev, [key]: true }));
    try {
      const grantFormativeLoot = useGamificationStore.getState().grantFormativeLoot;
      const res = await grantFormativeLoot(studentId, questId, evaluation, feedback);
      
      if (res.success) {
        let msg = `¡Evaluación enviada! `;
        if (evaluation === 'Logrado') {
          msg += `El alumno recibió 💎 +${res.xpEarned} XP y 🪙 +${res.coinsEarned} Monedas (¡2x multiplicador!).`;
        } else if (evaluation === 'Avanzando') {
          msg += `El alumno recibió 💎 +${res.xpEarned} XP y 🪙 +${res.coinsEarned} Monedas.`;
        } else {
          msg += `El alumno recibió 💎 +${res.xpEarned} XP, 🪙 +${res.coinsEarned} Monedas y un ítem "Poción de perseverancia".`;
        }
        setSuccessMessages(prev => ({ ...prev, [key]: msg }));
        
        // Recargar datos
        await fetchStats();
        await fetchAllAttempts();
        
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, [key]: '' }));
        }, 8000);
      } else {
        alert(`Error al guardar la evaluación: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || err}`);
    } finally {
      setEvaluatingIds(prev => ({ ...prev, [key]: false }));
    }
  };

  // Mappings between UUIDs and seed IDs
  const denormalizeStudentId = (id: string): string => {
    if (id === 'std-pa') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (id === 'std-sec') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22';
    if (id === 'std-pb') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33';
    if (id === 'std-prep') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44';
    return id;
  };

  const getStudentStats = (studentId: string): StudentStats => {
    const norm = normalizeStudentId(studentId);
    const denorm = denormalizeStudentId(studentId);
    return statsMap[studentId] || statsMap[norm] || statsMap[denorm] || STATS_MAP_SEED[studentId] || STATS_MAP_SEED[norm] || {
      student_id: studentId,
      xp: 0,
      level: 1,
      coins: 0,
      current_streak: 1,
      max_streak: 1,
      rpg_class: 'mago',
      attribute_strength: 10,
      attribute_intelligence: 10,
      attribute_defense: 10,
      skill_points: 0,
      funding_credits: 1000,
      updated_at: new Date().toISOString()
    };
  };

  const getStudentAvatar = (studentId: string) => {
    const norm = normalizeStudentId(studentId);
    const denorm = denormalizeStudentId(studentId);
    return avatarsMap[studentId] || avatarsMap[norm] || avatarsMap[denorm] || AVATAR_MAP_SEED[studentId] || AVATAR_MAP_SEED[norm];
  };

  const formatStudentName = (student: DetailedStudent | { first_name: string; last_name: string; second_name?: string; last_name_1?: string; last_name_2?: string }) => {
    if ('last_name_1' in student && student.last_name_1) {
      const ap1 = student.last_name_1;
      const ap2 = student.last_name_2 ? ` ${student.last_name_2}` : '';
      const n1 = student.first_name;
      const n2 = student.second_name ? ` ${student.second_name}` : '';
      return `${ap1}${ap2}, ${n1}${n2}`.trim();
    } else {
      const lastName = ('last_name' in student) ? student.last_name : '';
      const firstName = student.first_name || '';
      return `${lastName}, ${firstName}`.trim();
    }
  };

  // Auth Group Filtering - Directly using user.id mapping for seed schedules matching
  const teacherId = user?.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' ? 'usr-teacher-1' : user?.id;
  const teacherGroupIds = schoolSchedulesList
    .filter(s => s.teacherId === teacherId)
    .map(s => s.groupId);

  const myStudents = schoolDetailedStudents.filter(s => s.group_id && teacherGroupIds.includes(s.group_id));

  const sortedStudents = useMemo(() => {
    return [...myStudents].sort((a, b) => {
      return formatStudentName(a).localeCompare(formatStudentName(b));
    });
  }, [myStudents]);

  const getStudentLevelLabel = (id: string) => {
    const norm = normalizeStudentId(id);
    const studentProfile = schoolDetailedStudents?.find(s => s.id === id || s.id === norm);
    if (studentProfile) {
      return getStudentAcademicLevelInfo(studentProfile).fullGradeLabel;
    }
    if (norm === 'std-pb') return '1º Primaria (Baja)';
    if (norm === 'std-pa') return '4º Primaria (Alta)';
    if (norm === 'std-sec') return '2º Secundaria';
    if (norm === 'std-prep') return '4º Semestre Preparatoria';
    return getStudentAcademicLevelInfo({ level: 'primaria', grade: '1º' }).fullGradeLabel;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
          <p className="text-sm font-medium text-zinc-400">Verificando sesión docente...</p>
        </div>
      </div>
    );
  }

  const isTeacherOrStaff = ['teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner'].includes(user.role);

  if (!isTeacherOrStaff) {
    const getRedirectInfo = () => {
      switch (user.role) {
        case 'student':
          return { label: 'Ir a mi Portal de Alumno', path: '/student' };
        case 'parent':
        case 'tutor':
          return { label: 'Ir a mi Portal Familiar', path: '/parent' };
        case 'billing':
          return { label: 'Ir a mi Portal de Cobranza', path: '/coordinator/billing' };
        default:
          return { label: 'Iniciar Sesión', path: '/login' };
      }
    };

    const redirectInfo = getRedirectInfo();

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-white/10 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-white">Acceso Restringido</h2>
          <p className="text-xs text-zinc-400">Esta sección de calificaciones y rúbricas es exclusiva para el personal docente.</p>
          <button
            onClick={() => router.push(redirectInfo.path)}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg cursor-pointer"
          >
            {redirectInfo.label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans relative overflow-hidden">
      <Header />

      {/* Starry Dark Theme RPG background with blurred color blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                LISTA DE JUGADORES DEL GREMIO
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider font-serif bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent mt-1 uppercase">
              Panel del Administrador de Aventuras
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Gestión cualitativa y formativa. Inspecciona las estadísticas del gremio, evalúa sus contratos y firma la boleta SEP oficial.
            </p>
          </div>
        </div>



        {/* Lista de Jugadores */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              JUGADORES DEL GREMIO ({sortedStudents.length})
            </span>
            <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              ESTATUS Y BOLETA
            </span>
          </div>

          {sortedStudents.map((student) => {
            const normId = normalizeStudentId(student.id);
            const denormId = denormalizeStudentId(student.id);
            const isExpanded = expandedStudentId === student.id;
            
            const stats = getStudentStats(student.id);
            const avatar = getStudentAvatar(student.id);

            // Fetch student attempts
            const attempts = allAttempts.filter(a => 
              a.student_id === student.id || a.student_id === normId || a.student_id === denormId
            );

            // Math to show XP Progress
            const xpForCurrentLevel = (stats.level || 1) * 200;
            const progressPercent = Math.min(100, Math.round(((stats.xp || 0) / xpForCurrentLevel) * 100));

            return (
              <div
                key={student.id}
                onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                className={`rounded-2xl border transition-all duration-300 bg-zinc-900/30 backdrop-blur-md overflow-hidden ${
                  isExpanded 
                    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-zinc-900/50' 
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] cursor-pointer'
                }`}
              >
                {/* Row Header Content */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Player Info (Avatar / Name / Class) */}
                  <div className="flex items-center gap-4 text-left">
                    <PlayerAvatarPreview avatar={avatar} name={student.first_name} />

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-md font-bold text-zinc-100 font-serif leading-snug">
                          {formatStudentName(student)}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-purple-950/60 border border-purple-500/20 text-purple-400">
                          {stats.rpg_class?.toUpperCase() || 'EXPLORADOR'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                        {getStudentLevelLabel(student.id)}
                      </p>
                    </div>
                  </div>

                  {/* Level & XP Progress bar */}
                  <div className="flex flex-col gap-1 w-full md:w-44 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                      <span>NIVEL {stats.level}</span>
                      <span>{stats.xp} / {xpForCurrentLevel} XP</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950/60 rounded-full overflow-hidden border border-zinc-900">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Coins & Quests Complete Count */}
                  <div className="flex items-center gap-6 justify-between md:justify-start">
                    <div className="flex items-center gap-1.5" title="Monedas">
                      <Coins className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-xs font-black text-zinc-200">{stats.coins}</span>
                    </div>

                    <div className="w-[1px] h-6 bg-zinc-800 hidden md:block" />

                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">RETOS RESUELTOS</span>
                      <span className="text-xs font-bold text-zinc-300">
                        {attempts.filter(a => a.score >= 60).length} / {totalQuests}
                      </span>
                    </div>
                  </div>

                  {/* Formative Evaluation Progress and Toggle */}
                  <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-900">
                    <div className="text-center md:text-right flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">EVALUACIÓN FORMATIVA</span>
                      <span className="text-xs font-black text-amber-500 font-mono">
                        {(() => {
                          const evaluatedCount = attempts.filter(a => a.feedback).length;
                          return `${evaluatedCount} / ${totalQuests} Evaluados`;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedStudentId(isExpanded ? null : student.id);
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                      >
                        {isExpanded ? 'Cerrar Panel' : 'Evaluar Retos'}
                      </button>
                      
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500 hidden md:block" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500 hidden md:block" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section Accordion */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 bg-zinc-950/40 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-3 duration-250 text-left">
                    
                    {/* Column 1: Hero Stats / Attributes */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-purple-400" />
                        Estadísticas de Héroe
                      </h4>

                      <div className="space-y-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 shadow-inner">
                        {/* strength */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5 text-rose-500" /> Fuerza</span>
                            <span className="text-zinc-200">{stats.attribute_strength}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_strength || 10) * 5)}%` }} />
                          </div>
                        </div>

                        {/* intelligence */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Brain className="h-3.5 w-3.5 text-blue-500" /> Inteligencia</span>
                            <span className="text-zinc-200">{stats.attribute_intelligence}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_intelligence || 10) * 5)}%` }} />
                          </div>
                        </div>

                        {/* defense */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-amber-500" /> Defensa</span>
                            <span className="text-zinc-200">{stats.attribute_defense}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_defense || 10) * 5)}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-zinc-900 pt-3 text-[10px] font-bold text-zinc-500">
                          <span>Puntos de Habilidad: {stats.skill_points}</span>
                          <span>Créditos Startup: {stats.funding_credits} 🪙</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 & 3: Panel de Evaluación Formativa (col-span-2) */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Swords className="h-4 w-4 text-purple-400" />
                          Panel de Evaluación Formativa cualitativa (Rúbricas NEM)
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                        >
                          Ver Expediente Dossier
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
                        {allQuests.length === 0 ? (
                          <div className="text-center py-8 text-xs text-zinc-500 italic bg-zinc-950/40 border border-zinc-900/60 rounded-2xl">
                            No hay misiones (Quests) registradas en el sistema para evaluar.
                          </div>
                        ) : (
                          allQuests.map((quest) => {
                            const attempt = attempts.find(a => a.quest_id === quest.id);
                            const key = `${student.id}-${quest.id}`;
                            
                            // Determinar valor inicial del estado local o base de datos
                            const selectedEval = evaluations[key] || (attempt?.score === 100 ? 'Logrado' : attempt?.score === 70 ? 'Avanzando' : attempt?.score === 40 ? 'En proceso' : 'En proceso');
                            const feedbackText = feedbacks[key] !== undefined ? feedbacks[key] : (attempt?.feedback || '');
                            const isEvaluating = !!evaluatingIds[key];
                            const successMsg = successMessages[key] || '';

                            return (
                              <div 
                                key={quest.id} 
                                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col gap-3 text-left shadow-xs hover:border-zinc-700/60 transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-2">
                                  <div>
                                    <h5 className="text-xs font-black text-zinc-200 flex items-center gap-1.5">
                                      <span>{quest.title}</span>
                                      {attempt ? (
                                        <span className="px-1.5 py-0.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[7.5px] font-black uppercase rounded">Entregado</span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 bg-zinc-950/40 border border-zinc-800 text-zinc-550 text-[7.5px] font-black uppercase rounded">Sin entrega</span>
                                      )}
                                    </h5>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{quest.description}</p>
                                  </div>

                                  {/* Tipo y recompensas base */}
                                  <div className="flex items-center gap-2.5 text-[8.5px] font-mono text-zinc-400 font-bold uppercase">
                                    <span>🎯 {quest.type === 'quiz' ? 'Quiz' : 'Portafolio'}</span>
                                    <span>•</span>
                                    <span>💎 {quest.xp_reward} XP</span>
                                    <span>🪙 {quest.coins_reward}</span>
                                  </div>
                                </div>

                                {/* Formulario: Rúbrica Cualitativa y Comentarios */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                  {/* Rúbrica */}
                                  <div className="md:col-span-5 flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-zinc-505 uppercase tracking-wide">Rúbrica Cualitativa NEM</label>
                                    <div className="flex flex-col gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEvaluations(prev => ({ ...prev, [key]: 'En proceso' }));
                                        }}
                                        className={`w-full py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
                                          selectedEval === 'En proceso'
                                            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                            : 'bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                      >
                                        <Shield className="h-3.5 w-3.5" />
                                        En proceso
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEvaluations(prev => ({ ...prev, [key]: 'Avanzando' }));
                                        }}
                                        className={`w-full py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
                                          selectedEval === 'Avanzando'
                                            ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                            : 'bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                      >
                                        <Activity className="h-3.5 w-3.5" />
                                        Avanzando
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEvaluations(prev => ({ ...prev, [key]: 'Logrado' }));
                                        }}
                                        className={`w-full py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
                                          selectedEval === 'Logrado'
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                            : 'bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                      >
                                        <Award className="h-3.5 w-3.5" />
                                        Logrado
                                      </button>
                                    </div>
                                  </div>

                                  {/* Comentarios */}
                                  <div className="md:col-span-7 flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-zinc-505 uppercase tracking-wide">Retroalimentación Cualitativa (Reportes SEP)</label>
                                    <textarea
                                      rows={2}
                                      onClick={(e) => e.stopPropagation()}
                                      value={feedbackText}
                                      onChange={(e) => setFeedbacks(prev => ({ ...prev, [key]: e.target.value }))}
                                      placeholder="Escribe comentarios formativos..."
                                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-200 focus:border-purple-500 focus:outline-none min-h-[65px] font-semibold leading-relaxed"
                                    ></textarea>

                                    <button
                                      type="button"
                                      disabled={isEvaluating}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendFormativeEvaluation(student.id, quest.id);
                                      }}
                                      className={`mt-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5 self-end transition-all ${
                                        isEvaluating
                                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:scale-[1.01]'
                                      }`}
                                    >
                                      {isEvaluating ? 'Guardando...' : 'Enviar Evaluación'}
                                    </button>
                                  </div>
                                </div>

                                {/* Mensajes de éxito */}
                                {successMsg && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[10.5px] font-semibold text-emerald-400 leading-relaxed text-left mt-2">
                                    {successMsg}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Detalle de Alumno - Dossier */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-opacity duration-300 text-left">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] text-white">
            
            {/* Cabecera del Modal */}
            <div className="relative p-6 border-b border-zinc-800 flex flex-col md:flex-row items-center gap-6 bg-zinc-950/40">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Foto de Perfil con borde según nivel */}
              <div className={`relative h-24 w-24 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-lg ${
                selectedStudent.level === 'primaria' ? 'border-blue-500' :
                selectedStudent.level === 'secundaria' ? 'border-purple-500' : 'border-amber-500'
              }`}>
                <img 
                  src={getStudentAvatarUrl(selectedStudent)} 
                  alt={`${selectedStudent.first_name} ${selectedStudent.last_name_1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedStudent.level === 'primaria' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/25' :
                    selectedStudent.level === 'secundaria' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/25' : 
                    'bg-amber-950/40 text-amber-400 border border-amber-500/25'
                  }`}>
                    {selectedStudent.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-850 border border-zinc-800 text-zinc-300 text-[10px] font-bold">
                    {selectedStudent.grade}
                  </span>
                  {selectedStudent.group_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-450 text-[10px] font-bold">
                      Grupo {groupsList.find(g => g.id === selectedStudent.group_id)?.name || ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-850 border border-zinc-800 text-zinc-400 text-[10px] font-bold">
                    Turno {selectedStudent.shift || 'matutino'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-100 font-serif mt-1">
                  {formatStudentName(selectedStudent)}
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-zinc-455 font-semibold">
                  <span className="font-mono"><strong>Matrícula:</strong> {selectedStudent.enrollment_id}</span>
                  <span className="font-mono"><strong>CURP:</strong> {selectedStudent.curp}</span>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-purple-400" />
                    Datos Personales
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Fecha de Nacimiento</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Edad Calculada</span>
                      <span className="text-xs font-semibold text-zinc-300">
                        {(() => {
                          if (!selectedStudent.birth_date) return 0;
                          const birthDate = new Date(selectedStudent.birth_date);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                             age--;
                          }
                          return age;
                        })()} años
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Género</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.gender || 'Masculino'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Escuela de Procedencia</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.previous_school || 'Ninguna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Estado en el Sistema</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase mt-1">
                        ● {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTACTO Y FAMILIA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-purple-400" />
                    Contacto y Familiares
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Dirección</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0 mt-0.5" /> {selectedStudent.address || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-zinc-500" /> {selectedStudent.phone || 'S/T'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-500" /> {selectedStudent.email || 'S/C'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Padres / Tutores</span>
                      <div className="mt-1 text-[11px] text-zinc-400 leading-tight space-y-1">
                        {selectedStudent.mother_name && <div>• <strong>Madre:</strong> {selectedStudent.mother_name}</div>}
                        {selectedStudent.father_name && <div>• <strong>Padre:</strong> {selectedStudent.father_name}</div>}
                        {selectedStudent.tutor_name && <div>• <strong>Tutor Legal:</strong> {selectedStudent.tutor_name}</div>}
                      </div>
                    </div>
                    {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_phone) && (
                      <div className="border-t border-zinc-800 pt-2 mt-2">
                        <span className="text-[10px] font-black text-rose-450 uppercase block">Contacto de Emergencia</span>
                        <span className="text-[11px] font-bold text-zinc-200 block">{selectedStudent.emergency_contact_name || 'S/N'}</span>
                        <span className="text-[10.5px] text-zinc-500 block">{selectedStudent.emergency_contact_phone || 'S/T'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: EXPEDIENTE MÉDICO Y ADMINISTRATIVO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-purple-400" />
                    Expediente Escolar
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pagos Pendientes */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Pagos y Adeudos</span>
                      {selectedStudent.pending_payments && selectedStudent.pending_payments.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedStudent.pending_payments.map((p, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-950/30 border border-amber-500/25 text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/25 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Sin adeudos registrados.
                        </div>
                      )}
                    </div>

                    {/* Reportes de Conducta */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Reportes de Conducta</span>
                      {selectedStudent.behavior_reports && selectedStudent.behavior_reports.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.behavior_reports.map((r, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-rose-955/20 border border-rose-500/20 text-[10.5px]">
                              <div className="flex justify-between font-bold text-rose-400 mb-1 text-[9.5px]">
                                <span>Reporta: {r.reporter}</span>
                                <span>{r.date}</span>
                              </div>
                              <p className="text-zinc-350">{r.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No cuenta con incidencias disciplinarias.</p>
                      )}
                    </div>

                    {/* Notas del Profesor */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Notas de Profesores</span>
                      {selectedStudent.teacher_notes && selectedStudent.teacher_notes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.teacher_notes.map((n, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-purple-955/20 border border-purple-500/20 text-[10.5px]">
                              <div className="flex justify-between font-bold text-purple-400 mb-1 text-[9.5px]">
                                <span>Prof. {n.teacher_name}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-zinc-350 italic">"{n.note}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-505 italic">Sin anotaciones de maestros.</p>
                      )}
                    </div>

                    {/* Médico */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-505 uppercase">Tipo de Sangre</span>
                        <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/25 text-red-400 text-xs font-extrabold">{selectedStudent.blood_type || 'S/D'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1">Alergias / Restricciones</span>
                        {selectedStudent.medical_notes ? (
                          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/25 text-red-400 text-xs font-medium">
                            {selectedStudent.medical_notes}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-450">Ninguna alergia reportada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Modal */}
            <div className="p-4 px-6 border-t border-zinc-850 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-all"
              >
                Cerrar Expediente
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
