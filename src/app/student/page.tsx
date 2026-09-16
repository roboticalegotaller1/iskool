"use client";

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { 
  useStudentStore, 
  useCurrentStudentStats, 
  useCurrentStudentAvatar, 
  useCurrentStudentAcademicLevel, 
  normalizeStudentId 
} from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { BADGES_SEED } from '@/store/seeds';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';
import SagaMap from '@/components/SagaMap';
import { Loader } from '@/components/Loader';
import { useHydration } from '@/hooks/useHydration';
import { useClassroomStore } from '@/store/useClassroomStore';
import { QuestCard } from '@/components/QuestCard';
import { Quest, CanvasActivityJSON } from '@/types';

// Carga diferida de componentes pesados del Entorno Inmersivo
const AvatarCustomizer = dynamic(
  () => import('@/components/AvatarCustomizer').then((mod) => mod.AvatarCustomizer),
  { ssr: false, loading: () => <Loader message="Cargando personalizador de avatar..." /> }
);

const PetSanctuary = dynamic(
  () => import('@/components/PetSanctuary').then((mod) => mod.PetSanctuary),
  { ssr: false, loading: () => <Loader message="Cargando santuario de mascotas..." /> }
);

const RpgCombatViewport = dynamic(
  () => import('@/components/RpgCombatViewport').then((mod) => mod.RpgCombatViewport),
  { ssr: false, loading: () => <Loader message="Iniciando arena de combate RPG..." /> }
);

const ISkoolActivityPlayer = dynamic(
  () => import('@/components/ISkoolActivityPlayer').then((mod) => mod.ISkoolActivityPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-16 text-center min-h-[420px]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-3xl">⚔️</span>
        </div>
        <h4 className="mt-5 text-xl font-black text-amber-300 animate-pulse tracking-wide">
          Preparando el desafío...
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Afilando espadas y conjurando reactivos pedagógicos para tu Entorno Inmersivo.
        </p>
      </div>
    )
  }
);

import { 
  Flame, 
  Coins, 
  Sparkles, 
  Compass, 
  Trophy, 
  Swords, 
  X, 
  CheckCircle2, 
  Heart, 
  Gamepad2, 
  Shield, 
  Brain, 
  BookOpen, 
  ShoppingBag,
  Filter,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LivingCompanionEngine } from '@/components/pet/LivingCompanionEngine';
import { PetSvgRenderer } from '@/components/pet/PetSvgRenderer';
import { HatchingCinematicModal } from '@/components/pet/HatchingCinematicModal';
import { PetHomeSanctuaryModal } from '@/components/pet/PetHomeSanctuaryModal';
import { ELEMENTAL_PET_RACES } from '@/components/pet/types';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const feedPet = useStudentStore(state => state.feedPet);
  const playWithPet = useStudentStore(state => state.playWithPet);
  const hatchStudentEgg = useStudentStore(state => state.hatchStudentEgg);
  const petCompanionTouch = useStudentStore(state => state.petCompanionTouch);
  const evolvePetStage = useStudentStore(state => state.evolvePetStage);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const addXpAndCoins = useStudentStore(state => state.addXpAndCoins);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const subscribeToStudentStats = useStudentStore(state => state.subscribeToStudentStats);
  const unsubscribeFromStudentStats = useStudentStore(state => state.unsubscribeFromStudentStats);

  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const subscribeToPortfolioChanges = usePortfolioStore(state => state.subscribeToPortfolioChanges);
  const unsubscribeFromPortfolioChanges = usePortfolioStore(state => state.unsubscribeFromPortfolioChanges);

  const missions = useGamificationStore(state => state.missionsList);
  const questAttempts = useGamificationStore(state => state.questAttempts);
  const fetchMissions = useGamificationStore(state => state.fetchMissions);
  const submitQuiz = useGamificationStore(state => state.submitQuiz);
  const rawStudentBadges = useGamificationStore(state => state.studentBadges);

  const edictosList = useClassroomStore(state => state.edictosList);
  const recordSocioemotionalCheckin = useClassroomStore(state => state.recordSocioemotionalCheckin);

  const [studentMoodFeedback, setStudentMoodFeedback] = useState<string | null>(null);
  const [isHatchingModalOpen, setIsHatchingModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isSanctuaryHomeOpen, setIsSanctuaryHomeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  
  // Estado para la actividad en curso (Reproductor ISkoolActivityPlayer)
  const [activePlayingQuest, setActivePlayingQuest] = useState<Quest | null>(null);
  const [victoryCelebration, setVictoryCelebration] = useState<{ xp: number; coins: number; title: string } | null>(null);

  // Subvistas adicionales de la experiencia RPG
  const [activeSubView, setActiveSubView] = useState<'board' | 'map' | 'arena'>('board');

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const rawStats = useCurrentStudentStats();
  const rawAvatar = useCurrentStudentAvatar();
  const academicLevel = useCurrentStudentAcademicLevel();
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);

  const normalizedId = normalizeStudentId(activeStudentId);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const ownedArtifactIds = studentInventoryMap[activeStudentId] || studentInventoryMap[normalizedId] || [];

  const defaultStats = {
    student_id: activeStudentId || '',
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 1,
    max_streak: 1,
    rpg_class: 'mago' as const,
    attribute_strength: 10,
    attribute_intelligence: 10,
    attribute_defense: 10,
    skill_points: 0,
    funding_credits: 1000,
    pet_stage: 'egg' as any,
    pet_energy: 100,
    pet_happiness: 50,
    friendship_exp: 100,
    tasks_completed_count: 0,
    updated_at: new Date().toISOString()
  };

  const defaultAvatar = {
    student_id: activeStudentId || '',
    avatar_name: 'Héroe Estudiante',
    hair_style: 'spiky_hero',
    hair_color: '#4B5563',
    eyes_style: 'determined',
    outfit_style: 'explorer',
    outfit_color: '#3B82F6',
    background_style: 'forest',
    unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    race_feature: 'human',
    body_scale: 'normal' as const,
    equipped_shoes: 'shoes_basic',
    equipped_bottom: 'bottom_basic',
    equipped_top: 'top_basic',
    equipped_outerwear: 'outerwear_none',
    equipped_hat: 'hat_none',
    equipped_accessory: 'acc_none',
    pet_type: 'dragon' as const,
    pet_name: 'Compañero',
    pet_hunger: 50,
    pet_happiness: 50,
    pet_outfit: 'none',
    updated_at: new Date().toISOString()
  };

  const stats = rawStats ? { ...defaultStats, ...rawStats } : defaultStats;
  const avatar = rawAvatar ? { ...defaultAvatar, ...rawAvatar } : defaultAvatar;

  // Sincronización en tiempo real
  React.useEffect(() => {
    if (user && user.role === 'student') {
      const currentActiveId = useStudentStore.getState().activeStudentId;
      if (currentActiveId !== user.id) {
        useStudentStore.setState({ activeStudentId: user.id });
      }

      fetchStats();
      fetchPortfolioItems(undefined, user.id);
      fetchMissions();

      const gamificationStore = useGamificationStore.getState();
      gamificationStore.fetchQuestAttempts(user.id);
      const unsubGamification = gamificationStore.subscribeToGamificationChanges(user.id);
      subscribeToPortfolioChanges();
      subscribeToStudentStats(user.id);

      return () => {
        unsubGamification();
        unsubscribeFromPortfolioChanges();
        unsubscribeFromStudentStats();
      };
    }
  }, [user?.id, fetchStats, fetchPortfolioItems, fetchMissions, subscribeToPortfolioChanges, unsubscribeFromPortfolioChanges, subscribeToStudentStats, unsubscribeFromStudentStats]);

  const isHydrated = useHydration();

  // Cálculo de XP y Progreso
  const currentLevel = stats?.level || 1;
  const currentXp = stats?.xp || 0;
  const xpForNextLevel = currentLevel * 500;
  const xpCurrentProgress = currentXp % 500;
  const progressPercent = Math.min(Math.round((xpCurrentProgress / 500) * 100), 100);
  const xpRemaining = Math.max(0, 500 - xpCurrentProgress);

  // Lista aplanada de todas las misiones y asignaciones
  const allQuests: Quest[] = useMemo(() => {
    return missions.flatMap(m => m.quests || []);
  }, [missions]);

  // Consulta de estado de cada misión
  const getQuestStatus = useCallback((questId: string): 'pending' | 'completed' | 'failed' => {
    const attempt = questAttempts.find(
      qa => qa.quest_id === questId && (qa.student_id === activeStudentId || qa.student_id === normalizedId)
    );
    if (attempt?.is_completed) return 'completed';
    if (attempt && !attempt.is_completed) return 'failed';
    return 'pending';
  }, [questAttempts, activeStudentId, normalizedId]);

  // Filtrado de misiones con Revelación Progresiva
  const filteredQuests = useMemo(() => {
    return allQuests.filter(quest => {
      const status = getQuestStatus(quest.id);
      
      // Filtro de estado
      if (activeTab === 'pending' && status === 'completed') return false;
      if (activeTab === 'completed' && status !== 'completed') return false;

      // Filtro por campo formativo
      if (selectedSubjectFilter !== 'all') {
        const campo = quest.campos_formativos?.[0]?.toLowerCase() || '';
        if (!campo.includes(selectedSubjectFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [allQuests, activeTab, selectedSubjectFilter, getQuestStatus]);

  const completedCount = useMemo(() => {
    return allQuests.filter(q => getQuestStatus(q.id) === 'completed').length;
  }, [allQuests, getQuestStatus]);

  const pendingCount = allQuests.length - completedCount;

  // Conversión de Quest a CanvasActivityJSON para ISkoolActivityPlayer
  const convertedActivityData = useMemo((): { activity: CanvasActivityJSON; templateType: string } | null => {
    if (!activePlayingQuest) return null;
    const content = activePlayingQuest.content as any;
    const rawQuestions = content?.questions || [];

    const questions = rawQuestions.map((q: any) => ({
      question: q.question || 'Pregunta del Reto',
      options: q.options || ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correctIndex: q.correctAnswerIndex ?? q.correctIndex ?? q.correct_answer ?? 0,
      explanation: q.explanation || 'Excelente razonamiento lógico.',
      imageUrl: q.imageUrl
    }));

    // Fallback pedagógico si la tarea no tiene preguntas estructuradas
    const fallbackQuestions = questions.length > 0 ? questions : [
      {
        question: `¿Cuál es el objetivo principal del desafío "${activePlayingQuest.title}"?`,
        options: [
          activePlayingQuest.description?.slice(0, 80) || 'Comprender y dominar el concepto clave',
          'Avanzar sin reflexionar sobre el aprendizaje',
          'Memorizar respuestas sin análisis crítico',
          'Ignorar las orientaciones pedagógicas'
        ],
        correctIndex: 0,
        explanation: 'El aprendizaje significativo requiere vincular la teoría con la resolución práctica de retos.'
      },
      {
        question: '¿Qué destreza consolidas al resolver esta misión en el Entorno Inmersivo?',
        options: [
          'Pensamiento crítico y comprensión reflexiva',
          'Presionar botones al azar sin leer',
          'Desconexión de los saberes de clase',
          'Ninguna habilidad académica'
        ],
        correctIndex: 0,
        explanation: 'Los desafíos interactivos estimulan la retención a largo plazo y la autonomía del estudiante.'
      }
    ];

    let templateType = 'trivia';
    if (activePlayingQuest.type === 'reading' || activePlayingQuest.type === 'timed_reading') {
      templateType = 'escape_room';
    } else if (activePlayingQuest.type === 'logic_math' as any) {
      templateType = 'logic_math';
    } else if ((activePlayingQuest as any).template_type) {
      templateType = (activePlayingQuest as any).template_type;
    }

    const activity: CanvasActivityJSON = {
      title: activePlayingQuest.title,
      description: activePlayingQuest.description,
      questions: fallbackQuestions,
      readingText: content?.readingText,
      task_type: templateType
    };

    return { activity, templateType };
  }, [activePlayingQuest]);

  // Manejador al completar actividad en el reproductor
  const handleActivityComplete = async (score: number) => {
    if (!activePlayingQuest) return;
    const isSuccess = score >= 60;

    if (isSuccess) {
      const xpEarned = activePlayingQuest.xp_reward || 50;
      const coinsEarned = activePlayingQuest.coins_reward || 25;

      // Recompensa en estado de Zustand
      await addXpAndCoins(activeStudentId, xpEarned, coinsEarned);
      try {
        await submitQuiz(activePlayingQuest.id, score, { completed_score: score });
      } catch (err) {
        console.warn('Registro local de quiz:', err);
      }

      setVictoryCelebration({
        xp: xpEarned,
        coins: coinsEarned,
        title: activePlayingQuest.title
      });
    }

    setActivePlayingQuest(null);
  };

  if (!isHydrated || loading || !user) {
    return <Loader message="Sincronizando Entorno Inmersivo..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-amber-500 selection:text-black">
      
      {/* Fondo ambiental cósmico / gamer */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-0" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* =========================================================================
            ZONA 1: HUD DEL HÉROE Y REVELACIÓN PROGRESIVA
            ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 backdrop-blur-xl">
          {/* Brillos ambientales */}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* HÉROE & COMPAÑERO VIVO */}
            <div className="flex items-start gap-4 sm:gap-6 shrink-0 w-full lg:w-auto justify-center sm:justify-start">
              
              {/* BLOQUE DÚO: AVATAR Y MASCOTA PERFECTAMENTE ALINEADOS */}
              <div className="flex items-start gap-3 sm:gap-4 shrink-0">
                
                {/* 1. Retrato del Avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative group/avatar cursor-pointer" onClick={() => setIsCustomizerOpen(true)}>
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900/90 border-2 border-amber-400/60 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center p-1 relative">
                      <div className="w-full h-full relative flex items-center justify-center">
                        <AnimeAvatarSprite 
                          gender={(avatar as any)?.gender ?? 'female'}
                          rpgClass={(avatar as any)?.rpg_class ?? avatar?.outfit_style ?? 'mago'}
                          headType={(avatar as any)?.head_type ?? avatar?.eyes_style ?? 'standard'}
                          skinTone={(avatar as any)?.skin_tone ?? 'light'}
                          hairColor={avatar?.hair_color ?? 'yellow'}
                          hairStyle={avatar?.hair_style ?? 'spiky'}
                          eyesStyle={avatar?.eyes_style ?? 'determined'}
                          raceFeature={avatar?.race_feature}
                          bodyScale={(avatar as any)?.body_scale ?? 'normal'}
                          equippedShoes={avatar?.equipped_shoes || 'shoes_tan_boots'}
                          equippedBottom={avatar?.equipped_bottom || 'bottom_ripped_jeans'}
                          equippedTop={avatar?.equipped_top || 'top_dia_de_muertos'}
                          equippedOuterwear={avatar?.equipped_outerwear}
                          equippedHat={avatar?.equipped_hat || 'hat_snapback_trainer'}
                          equippedAccessory={avatar?.equipped_accessory || 'acc_red_backpack'}
                          equippedArtifacts={ownedArtifactIds}
                          showPedestal={false}
                          zoom="upper"
                          viewBox="45 25 110 150"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Insignia de Nivel */}
                    <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-yellow-200 shadow-md">
                      Nv.{currentLevel}
                    </span>
                  </div>

                  {/* Badge inferior del Avatar para perfecta simetría y alineación con la mascota */}
                  <div className="w-28 sm:w-32 mt-2 flex items-center justify-center h-8 bg-slate-950/85 px-2 rounded-xl border border-amber-500/30 text-center shadow-xs">
                    <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider truncate">
                      ⭐ {stats?.rpg_class?.toUpperCase() || 'HÉROE'}
                    </span>
                  </div>
                </div>

                {/* 2. Compañero Místico: Recuadro del mismo tamaño exacto que el avatar y perfectamente continuo */}
                <div className="flex flex-col items-center shrink-0">
                  <div 
                    className="relative group/pet cursor-pointer"
                    onClick={() => setIsSanctuaryHomeOpen(true)}
                    title="Cuidar Mascota (Clic para abrir Santuario)"
                  >
                    {/* Recuadro con IDÉNTICO tamaño que el del avatar del alumno: w-28 h-28 sm:w-32 sm:h-32 */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-teal-950/80 border-2 border-teal-400/60 shadow-xl shadow-teal-500/20 group-hover:scale-105 transition-transform flex items-center justify-center p-2 relative">
                      {/* Resplandor místico */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(20,184,166,0.25)_0%,transparent_75%)] pointer-events-none" />

                      <div className="relative z-10 w-full h-full flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(20,184,166,0.5)]">
                        <PetSvgRenderer
                          raceId={avatar?.pet_type || 'cryo_dragon'}
                          stage={stats?.pet_stage || 'egg'}
                          actionId="idle"
                          className="w-full h-full"
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                      {/* Insignia de Etapa Evolutiva */}
                      <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 border border-teal-200 shadow-md uppercase">
                        {stats?.pet_stage === 'egg' ? 'Huevo' : stats?.pet_stage === 'baby' ? 'Bebé' : stats?.pet_stage === 'child' ? 'Cría' : stats?.pet_stage === 'teen' ? 'Joven' : 'Adulto'}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas Visibles Debajo del Avatar de la Mascota */}
                  <div className="w-28 sm:w-32 mt-2 flex flex-col justify-center h-8 bg-slate-950/85 px-2 rounded-xl border border-teal-500/30 text-center shadow-xs">
                    <div className="flex items-center justify-between text-[9px] font-black text-teal-300">
                      <span className="truncate max-w-[65px]">{avatar?.pet_name || 'Compañero'}</span>
                      <span className="text-rose-400 flex items-center gap-0.5">
                        ❤️ {avatar?.pet_happiness ?? stats?.pet_happiness ?? 85}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, avatar?.pet_happiness ?? stats?.pet_happiness ?? 85)}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Datos de Nombre e Identidad del Héroe */}
              <div className="flex flex-col min-w-0 text-left pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-300">
                    {academicLevel.fullGradeLabel}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {stats?.rpg_class?.toUpperCase() || 'MAGO ACADÉMICO'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 truncate">
                  {avatar?.avatar_name || 'Estudiante Héroe'}
                </h1>
                
                <p className="text-xs text-slate-300/90 font-medium">
                  Rango de Aventura: <strong className="text-amber-300">Nivel {currentLevel}</strong>
                </p>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setIsCustomizerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>Editar Avatar</span>
                  </button>

                  <button
                    onClick={() => setIsPetModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-black uppercase tracking-wider transition-all border border-slate-700 flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Mascota</span>
                  </button>

                  <Link
                    href="/student/shop"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tienda</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* BARRA DE PROGRESO DE XP CON GRADIENTES Y BRILLOS RADIANTES */}
            <div className="flex-1 w-full lg:max-w-md flex flex-col gap-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-indigo-500/25 shadow-inner">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-amber-300 flex items-center gap-1.5 tracking-wider uppercase text-[11px]">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  Progreso al Siguiente Rango
                </span>
                <span className="text-slate-300 font-mono">
                  {xpCurrentProgress} / 500 XP <strong className="text-amber-400">({progressPercent}%)</strong>
                </span>
              </div>

              {/* Barra radiante */}
              <div className="h-4 w-full bg-slate-900 rounded-full p-0.5 border border-indigo-500/30 shadow-inner overflow-hidden relative">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all duration-700 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>¡Faltan <strong className="text-amber-300 font-bold">{xpRemaining} XP</strong> para Nivel {currentLevel + 1}!</span>
                <span className="text-indigo-300">Total: {currentXp} XP</span>
              </div>

              {/* Rejilla de métricas de juego */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-base font-black text-orange-400 flex items-center gap-1">
                    <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
                    {stats?.current_streak || 1}d
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Racha</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-base font-black text-yellow-300 flex items-center gap-1">
                    <Coins className="w-4 h-4 fill-yellow-400 text-yellow-300" />
                    {stats?.coins || 500}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Oro</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {completedCount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Superadas</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            BANNER DE AULA: EDICTO ACTIVO & PULSO SOCIOEMOCIONAL
            ========================================================================= */}
        {edictosList.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 border border-amber-400/30">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
                    📜 Edicto del Aula
                  </span>
                  {edictosList[0].xpBonusPercent && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/30">
                      +{edictosList[0].xpBonusPercent}% XP Activo
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  {edictosList[0].title}
                </h3>
                <p className="text-xs text-indigo-200/90 line-clamp-2">
                  {edictosList[0].content}
                </p>
              </div>
            </div>

            {/* Termómetro Socioemocional Rápido */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-indigo-500/20 shrink-0 w-full md:w-auto text-center space-y-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-200 block">
                {studentMoodFeedback ? studentMoodFeedback : '¿Cómo te sientes hoy?'}
              </span>
              <div className="flex items-center justify-center gap-2">
                {[
                  { mood: 'energized' as const, icon: '🚀', label: 'Enérgico' },
                  { mood: 'motivated' as const, icon: '😊', label: 'Motivado' },
                  { mood: 'peaceful' as const, icon: '🧘', label: 'Tranquilo' },
                  { mood: 'tired' as const, icon: '🥱', label: 'Cansado' },
                  { mood: 'support_needed' as const, icon: '🆘', label: 'Apoyo' }
                ].map(item => (
                  <button
                    key={item.mood}
                    type="button"
                    onClick={() => {
                      recordSocioemotionalCheckin({
                        studentId: activeStudentId || 'std-current',
                        studentName: avatar?.avatar_name || 'Estudiante',
                        groupId: 'grp-4a',
                        date: new Date().toISOString().split('T')[0],
                        mood: item.mood
                      });
                      setStudentMoodFeedback(`¡Ánimo ${item.icon}! +10 XP registrado`);
                      setTimeout(() => setStudentMoodFeedback(null), 4000);
                    }}
                    title={item.label}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-lg transition-transform hover:scale-125 cursor-pointer"
                  >
                    <span>{item.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SELECTOR DE VISTA RPG: TABLERO / MAPA / ARENA
            ========================================================================= */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubView('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeSubView === 'board'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Tablero de Misiones</span>
            </button>

            <button
              onClick={() => setActiveSubView('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeSubView === 'map'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Mapa de la Saga</span>
            </button>

            <button
              onClick={() => setActiveSubView('arena')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeSubView === 'arena'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Arena del Gremio</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-black text-slate-400 uppercase tracking-widest">
            🛡️ ENTORNO INMERSIVO ISKOOL
          </span>
        </div>

        {/* =========================================================================
            ZONA 2: QUEST LOG / TABLERO DE MISIONES ÉPICAS (REVELACIÓN PROGRESIVA)
            ========================================================================= */}
        {activeSubView === 'board' && (
          <section className="space-y-6 animate-fade-in">
            {/* Cabecera del Tablero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                    Contratos Curriculares
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  Tablero de Misiones Épicas
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Acepta contratos académicos, supera desafíos y reclama tu gloria en el Entorno Inmersivo.
                </p>
              </div>

              {/* Filtros de Revelación Progresiva */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({allQuests.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Por Conquistar ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Superadas ({completedCount})
                </button>
              </div>
            </div>

            {/* Cuadrícula de Tarjetas de Misión (QuestCard) */}
            {filteredQuests.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📜</span>
                <h3 className="text-lg font-black text-white">Tu diario de misiones está al día</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  No hay contratos pendientes en esta categoría. ¡Sigue explorando el mapa o repasa tus misiones superadas!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuests.map((quest, idx) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    status={getQuestStatus(quest.id)}
                    index={idx}
                    onSelect={(selected) => setActivePlayingQuest(selected)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* MAPA DE LA SAGA ACADÉMICA */}
        {activeSubView === 'map' && (
          <section className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-400" />
              Ruta del Laberinto y Mapa de la Saga
            </h2>
            <SagaMap 
              missions={missions} 
              activeLevel={academicLevel.level} 
              activeGrade={academicLevel.grade} 
            />
          </section>
        )}

        {/* ARENA DE COMBATE RPG */}
        {activeSubView === 'arena' && (
          <section className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-rose-400" />
              Arena del Gremio: Batalla Sincrónica
            </h2>
            <RpgCombatViewport />
          </section>
        )}

      </main>

      {/* =========================================================================
          ZONA 3: REPRODUCTOR INTERACTIVO EN SUSPENSE (PATRÓN FACTORY)
          ========================================================================= */}
      {activePlayingQuest && convertedActivityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl h-[90vh] bg-slate-950 rounded-3xl border border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header del Modal del Reproductor */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/30 bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-lg">
                  ⚔️
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Desafío en Progreso • Entorno Inmersivo
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate max-w-md sm:max-w-lg">
                    {activePlayingQuest.title}
                  </h3>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setActivePlayingQuest(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Cerrar Desafío"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor del Reproductor envuelto en Suspense */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-full min-h-[420px] text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl">⚔️</span>
                  </div>
                  <h4 className="mt-5 text-xl font-black text-amber-300 animate-pulse tracking-wide">
                    Preparando el desafío...
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Afilando espadas y conjurando reactivos pedagógicos para tu Entorno Inmersivo.
                  </p>
                </div>
              }>
                <ISkoolActivityPlayer
                  activity={convertedActivityData.activity}
                  templateType={convertedActivityData.templateType}
                  onClose={() => setActivePlayingQuest(null)}
                  onComplete={handleActivityComplete}
                />
              </Suspense>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CELEBRACIÓN DE VICTORIA / RECOMPENSA
          ========================================================================= */}
      {victoryCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 animate-bounce">
              🏆
            </div>

            <h3 className="text-2xl font-black text-white">¡Misión Conquistada!</h3>
            <p className="text-xs text-slate-300">
              Completaste exitosamente: <strong className="text-amber-300">{victoryCelebration.title}</strong>
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-around">
              <div className="text-center">
                <span className="text-[10px] font-black text-amber-200/80 uppercase block">Experiencia</span>
                <span className="text-xl font-black text-amber-300">+{victoryCelebration.xp} XP</span>
              </div>
              <div className="h-8 w-px bg-amber-500/30" />
              <div className="text-center">
                <span className="text-[10px] font-black text-yellow-200/80 uppercase block">Botín Obtenido</span>
                <span className="text-xl font-black text-yellow-300">+{victoryCelebration.coins} Oro</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVictoryCelebration(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Reclamar y Continuar Aventura ⚔️
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALES EXISTENTES: PERSONALIZACIÓN, MASCOTAS Y SANTUARIO
          ========================================================================= */}
      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl shadow-2xl p-5 sm:p-6 border border-slate-800 text-white">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              ✨ Centro de Cuidado de tu Mascota
            </h3>

            {/* Estadísticas de la Mascota */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col gap-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado de {avatar?.pet_name || 'Mascota'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-300">
                    <span>Hambre</span>
                    <span>{avatar?.pet_hunger ?? 50}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${avatar?.pet_hunger ?? 50}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-300">
                    <span>Felicidad</span>
                    <span>{avatar?.pet_happiness ?? 50}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${avatar?.pet_happiness ?? 50}%` }} />
                  </div>
                </div>
              </div>

              {/* Botones de Acción de Cuidado */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => feedPet(activeStudentId)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Alimentar (5 🪙)
                </button>
                <button
                  type="button"
                  onClick={() => playWithPet(activeStudentId)}
                  className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-current text-rose-300" />
                  Jugar (2 🪙)
                </button>
              </div>
            </div>

            {/* 10 Razas Elementales */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">10 Razas Elementales de Compañero</label>
                <button
                  type="button"
                  onClick={() => setIsHatchingModalOpen(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Cinemática de Eclosión</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ELEMENTAL_PET_RACES.map(option => {
                  const isSelected = (avatar?.pet_type || 'cryo_dragon') === option.id || (avatar?.pet_type === 'dragon' && option.id === 'cryo_dragon');
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => changeAvatar({ pet_type: option.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-xs'
                          : 'border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-2xl">{option.badgeEmoji}</span>
                      <span className="text-[10px] font-black mt-1 text-center truncate w-full">{option.name}</span>
                      <span className="text-[8px] opacity-75 truncate w-full text-center">{option.element}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nombre de la Mascota */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Nombre de la Mascota</label>
              <input aria-label="Ej. Llamita"
                type="text"
                value={avatar?.pet_name || ''}
                onChange={(e) => changeAvatar({ pet_name: e.target.value })}
                placeholder="Ej. Llamita"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsPetModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinemática de Eclosión */}
      <HatchingCinematicModal
        isOpen={isHatchingModalOpen}
        assignedRace={avatar?.pet_type || 'cryo_dragon'}
        studentName={avatar?.avatar_name || user?.first_name || 'Estudiante'}
        onConfirmBond={async (race, petName) => {
          await hatchStudentEgg(activeStudentId, race, petName);
          setIsHatchingModalOpen(false);
        }}
        onClose={() => setIsHatchingModalOpen(false)}
      />

      {/* Santuario y Hogar del Compañero */}
      <PetHomeSanctuaryModal
        isOpen={isSanctuaryHomeOpen}
        onClose={() => setIsSanctuaryHomeOpen(false)}
      />

    </div>
  );
}
