"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar, useCurrentStudentAcademicLevel, normalizeStudentId } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { BADGES_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';
import SagaMap from '@/components/SagaMap';
import { Loader } from '@/components/Loader';
import { useHydration } from '@/hooks/useHydration';
import { useClassroomStore } from '@/store/useClassroomStore';

// Carga diferida de componentes pesados e interactivos bajo demanda
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

const QuestCardModal = dynamic(
  () => import('@/components/QuestCardModal'),
  { ssr: false }
);
import { 
  Flame, Coins, Sparkles, Compass, Trophy, Star, ArrowRight, 
  Lock, Heart, HelpCircle, Gamepad2, Dumbbell, Brain, Shield,
  FileText, Landmark, User, ExternalLink, Award, Sparkle, Users, Swords
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LivingCompanionEngine } from '@/components/pet/LivingCompanionEngine';
import { HatchingCinematicModal } from '@/components/pet/HatchingCinematicModal';
import { PetHomeSanctuaryModal } from '@/components/pet/PetHomeSanctuaryModal';
import { ELEMENTAL_PET_RACES } from '@/components/pet/types';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const feedPet = useStudentStore(state => state.feedPet);
  const playWithPet = useStudentStore(state => state.playWithPet);
  const feedPetRpg = useStudentStore(state => state.feedPetRpg);
  const trainPetRpg = useStudentStore(state => state.trainPetRpg);
  const hatchStudentEgg = useStudentStore(state => state.hatchStudentEgg);
  const petCompanionTouch = useStudentStore(state => state.petCompanionTouch);
  const evolvePetStage = useStudentStore(state => state.evolvePetStage);
  const levelUpAttribute = useStudentStore(state => state.levelUpAttribute);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const studentMessages = useStudentStore(state => state.studentMessages);
  const markStudentMessageAsRead = useStudentStore(state => state.markStudentMessageAsRead);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const subscribeToStudentStats = useStudentStore(state => state.subscribeToStudentStats);
  const unsubscribeFromStudentStats = useStudentStore(state => state.unsubscribeFromStudentStats);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const subscribeToPortfolioChanges = usePortfolioStore(state => state.subscribeToPortfolioChanges);
  const unsubscribeFromPortfolioChanges = usePortfolioStore(state => state.unsubscribeFromPortfolioChanges);
  const fetchMissions = useGamificationStore(state => state.fetchMissions);
  
  const edictosList = useClassroomStore(state => state.edictosList);
  const recordSocioemotionalCheckin = useClassroomStore(state => state.recordSocioemotionalCheckin);
  const [studentMoodFeedback, setStudentMoodFeedback] = useState<string | null>(null);
  const [isHatchingModalOpen, setIsHatchingModalOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const rawStats = useCurrentStudentStats();
  const rawAvatar = useCurrentStudentAvatar();

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
    avatar_name: 'Estudiante',
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
    pet_name: 'Mascota',
    pet_hunger: 50,
    pet_happiness: 50,
    pet_outfit: 'none',
    updated_at: new Date().toISOString()
  };

  const stats = rawStats ? { ...defaultStats, ...rawStats } : defaultStats;
  const avatar = rawAvatar ? { ...defaultAvatar, ...rawAvatar } : defaultAvatar;

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user && user.role === 'student') {
      // Sincronizar activeStudentId con el id real del usuario en Zustand
      const currentActiveId = useStudentStore.getState().activeStudentId;
      if (currentActiveId !== user.id) {
        useStudentStore.setState({ activeStudentId: user.id });
      }

      // Validar si existen estadísticas en Zustand para este usuario y disparar fetch si no
      const localStats = useStudentStore.getState().allStats[user.id];
      if (!localStats) {
        fetchStats();
      }

      fetchPortfolioItems(undefined, user.id);
      fetchMissions();

      // Cargar los intentos de retos (quest attempts) en tiempo real
      const gamificationStore = useGamificationStore.getState();
      gamificationStore.fetchQuestAttempts(user.id);

      // Suscribirse a las actualizaciones de gamificación en tiempo real
      const unsubscribe = gamificationStore.subscribeToGamificationChanges(user.id);
      
      // Suscribirse a las actualizaciones del portafolio en tiempo real
      subscribeToPortfolioChanges();

      // Suscribirse a las estadísticas del estudiante en tiempo real
      subscribeToStudentStats(user.id);

      return () => {
        unsubscribe();
        unsubscribeFromPortfolioChanges();
        unsubscribeFromStudentStats();
      };
    }
  }, [user?.id, loading, fetchStats, fetchPortfolioItems, fetchMissions, subscribeToPortfolioChanges, unsubscribeFromPortfolioChanges, subscribeToStudentStats, unsubscribeFromStudentStats]);

  const purchaseArtifact = async (studentId: string, artifactId: string) => {
    await useStudentStore.getState().purchaseArtifact(studentId, artifactId);
  };

  const missions = useGamificationStore(state => state.missionsList);
  const shopArtifacts = useGamificationStore(state => state.shopArtifacts);
  const rawStudentBadges = useGamificationStore(state => state.studentBadges);
  const studentBadges = rawStudentBadges.filter(sb => sb.student_id === activeStudentId).map(sb => ({
    ...sb,
    badge: BADGES_SEED.find(b => b.id === sb.badge_id)
  }));
  const badges = BADGES_SEED;

  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const submitPeerReview = usePortfolioStore(state => state.submitPeerReview);

  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);

  const normalizedId = normalizeStudentId(activeStudentId);
  const ownedArtifactIds = studentInventoryMap[activeStudentId] || studentInventoryMap[normalizedId] || [];

  const academicLevel = useCurrentStudentAcademicLevel();
  const activeStudent = detailedStudents?.find(s => 
    s.id === normalizedId || 
    s.id === activeStudentId ||
    (user?.id && s.id === user.id) ||
    (user?.email && s.email?.toLowerCase() === user.email.toLowerCase())
  );
  const activeLevel = academicLevel.level;
  const activeGrade = academicLevel.grade;

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isSanctuaryHomeOpen, setIsSanctuaryHomeOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [peerScore, setPeerScore] = useState('9.0');
  const [peerComment, setPeerComment] = useState('');

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && activeLevel === 'secundaria') {
      const completed = localStorage.getItem('iskool_rpg_tour_completed');
      if (!completed) {
        setShowTour(true);
      }
    }
  }, [activeLevel]);

  const isHydrated = useHydration();

  if (!isHydrated || loading || !user) {
    return <Loader />;
  }


  // Calcular el progreso del nivel
  const xpForCurrentLevel = (stats?.level ?? 1) * 200;
  const progressPercent = Math.min(100, Math.round(((stats?.xp ?? 0) / xpForCurrentLevel) * 100));

  // Renderizador estático del Avatar en SVG con Contorno Neón Pegado a la Silueta (Estilo Neón Cian/Magenta)
  const renderAvatarPreview = (width = 120, height = 120, customViewBox?: string) => {
    return (
      <div 
        className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-cyan-500/30 shadow-xl select-none" 
        style={{ width, height }}
      >
        {/* Sutil resplandor de fondo ambiental */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.15)_0%,rgba(236,72,153,0.1)_50%,transparent_80%)] pointer-events-none" />

        {/* Sprite del Avatar con Contorno Neón Pegado a su Silueta */}
        <div className="w-full h-full p-1 relative z-10 neon-hero-contour">
          <AnimeAvatarSprite 
            gender={(avatar as any)?.gender ?? 'female'}
            rpgClass={(avatar as any)?.rpg_class ?? avatar?.outfit_style ?? 'mago'}
            headType={(avatar as any)?.head_type ?? avatar?.eyes_style ?? 'standard'}
            skinTone={(avatar as any)?.skin_tone ?? 'light'}
            hairColor={avatar?.hair_color ?? 'pink'}
            hairStyle={avatar?.hair_style ?? 'spiky'}
            eyesStyle={avatar?.eyes_style ?? 'determined'}
            raceFeature={avatar?.race_feature}
            bodyScale={(avatar as any)?.body_scale ?? 'normal'}
            equippedShoes={avatar?.equipped_shoes}
            equippedBottom={avatar?.equipped_bottom}
            equippedTop={avatar?.equipped_top}
            equippedOuterwear={avatar?.equipped_outerwear}
            equippedHat={avatar?.equipped_hat}
            equippedAccessory={avatar?.equipped_accessory}
            equippedArtifacts={ownedArtifactIds}
            viewBox={customViewBox}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };

  const renderPetSVG = (type = 'dragon', stage?: string) => {
    if (stage === 'egg') {
      return (
        <>
          <ellipse cx="50" cy="55" rx="23" ry="32" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
          <circle cx="43" cy="42" r="3.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="57" cy="52" r="5.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="45" cy="68" r="4.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="50" cy="60" r="2.5" fill="#FBBF24" opacity="0.6" />
        </>
      );
    }
    switch (type) {
      case 'lobo':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#9CA3AF" />
            <circle cx="50" cy="56" r="14" fill="#E5E7EB" />
            <circle cx="50" cy="36" r="16" fill="#D1D5DB" />
            <polygon points="34,30 32,14 44,22" fill="#9CA3AF" />
            <polygon points="36,28 35,18 42,23" fill="#FCA5A5" />
            <polygon points="66,30 68,14 56,22" fill="#9CA3AF" />
            <polygon points="64,28 65,18 58,23" fill="#FCA5A5" />
            <circle cx="38" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="62" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="44" cy="33" r="2" fill="#1F2937" />
            <circle cx="56" cy="33" r="2" fill="#1F2937" />
            <ellipse cx="50" cy="39" rx="4" ry="2.5" fill="#F3F4F6" />
            <polygon points="48,38 52,38 50,40" fill="#111827" />
            <path d="M49 41 Q 50 42.5 51 41" stroke="#111827" strokeWidth="1" fill="none" />
          </>
        );
      case 'venado':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#D97706" />
            <circle cx="42" cy="48" r="2" fill="#FFFFFF" />
            <circle cx="58" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="40" cy="58" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="62" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="36" r="16" fill="#F59E0B" />
            <ellipse cx="33" cy="26" rx="5" ry="10" transform="rotate(-30, 33, 26)" fill="#D97706" />
            <ellipse cx="33" cy="26" rx="2.5" ry="7" transform="rotate(-30, 33, 26)" fill="#FCA5A5" />
            <ellipse cx="67" cy="26" rx="5" ry="10" transform="rotate(30, 67, 26)" fill="#D97706" />
            <ellipse cx="67" cy="26" rx="2.5" ry="7" transform="rotate(30, 67, 26)" fill="#FCA5A5" />
            <circle cx="43" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="42.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <circle cx="57" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="56.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <ellipse cx="50" cy="40" rx="3" ry="2" fill="#FEF3C7" />
            <circle cx="50" cy="39" r="1" fill="#111827" />
          </>
        );
      case 'gusano':
        return (
          <>
            <circle cx="38" cy="65" r="12" fill="#EC4899" />
            <circle cx="46" cy="59" r="11" fill="#F43F5E" />
            <circle cx="56" cy="55" r="12" fill="#F472B6" />
            <circle cx="62" cy="40" r="14" fill="#FB7185" />
            <path d="M58 28 Q 54 20 48 22" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="47" cy="22" r="2.5" fill="#FBBF24" />
            <circle cx="58" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="58" cy="38" r="0.8" fill="#111827" />
            <circle cx="67" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="67" cy="38" r="0.8" fill="#111827" />
            <path d="M60 45 Q 64 48 68 44" stroke="#881337" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'gatito':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#F59E0B" />
            <circle cx="50" cy="58" r="13" fill="#FEF3C7" />
            <circle cx="50" cy="35" r="16" fill="#FBBF24" />
            <polygon points="34,26 31,10 45,20" fill="#F59E0B" />
            <polygon points="36,23 34,14 42,20" fill="#FCA5A5" />
            <polygon points="66,26 69,10 55,20" fill="#F59E0B" />
            <polygon points="64,23 66,14 58,20" fill="#FCA5A5" />
            <circle cx="43" cy="33" r="2" fill="#065F46" />
            <circle cx="57" cy="33" r="2" fill="#065F46" />
            <path d="M46 40 Q 50 43 54 40" stroke="#78350F" strokeWidth="1.2" fill="none" />
            <line x1="33" y1="38" x2="25" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="33" y1="41" x2="24" y2="41" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="38" x2="75" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="41" x2="76" y2="41" stroke="#78350F" strokeWidth="1" />
          </>
        );
      case 'dragon':
      default:
        return (
          <>
            <circle cx="50" cy="55" r="24" fill="#34D399" />
            <circle cx="50" cy="35" r="16" fill="#6EE7B7" />
            <circle cx="44" cy="32" r="2" fill="#065F46" />
            <circle cx="56" cy="32" r="2" fill="#065F46" />
            <path d="M46 41 Q 50 44 54 41" stroke="#065F46" strokeWidth="1.5" fill="none" />
            <polygon points="40,22 44,14 47,22" fill="#FBBF24" />
            <polygon points="60,22 56,14 53,22" fill="#FBBF24" />
          </>
        );
    }
  };

  const renderPetAccessories = (type = 'dragon', outfit = 'none') => {
    if (outfit === 'none') return null;

    if (type === 'gusano') {
      return (
        <>
          {outfit === 'hat' && (
            <polygon points="48,24 62,6 76,24" fill="#B91C1C" />
          )}
          {outfit === 'glasses' && (
            <rect x="50" y="34" width="22" height="4" rx="1" fill="#111827" />
          )}
          {outfit === 'cape' && (
            <path d="M30 60 L 12 85 L 75 85 L 60 60 Z" fill="#4F46E5" opacity="0.8" />
          )}
        </>
      );
    }

    return (
      <>
        {outfit === 'hat' && (
          <polygon points="32,18 50,0 68,18" fill="#B91C1C" />
        )}
        {outfit === 'glasses' && (
          <rect x="38" y="30" width="24" height="4" rx="1" fill="#111827" />
        )}
        {outfit === 'cape' && (
          <path d="M25 60 L 10 90 L 90 90 L 75 60 Z" fill="#4F46E5" opacity="0.8" />
        )}
      </>
    );
  };

  // --- RENDER 1: PRIMARIA BAJA (MASCOTAS VIRTUALES) ---
  // --- RENDER 1: PRIMARIA (MASCOTAS VIRTUALES Y AVATARES) ---
  const renderPrimariaBaja = () => {
    // Ropa de mascota seleccionada
    const petOutfit = avatar?.pet_outfit || 'none';
    const petHunger = avatar?.pet_hunger ?? 50;
    const petHappiness = avatar?.pet_happiness ?? 50;

    return (
      <div className="flex flex-col gap-8">
        {/* Banner Mascota y Avatar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-3.5 sm:p-4 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 max-w-6xl mx-auto">
            
            {/* Visualización de Avatar y Mascota con Proporción Oficial y marco ultra ceñido */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
              {/* Bloque del Avatar ceñido con fidelidad completa (220% de escala) */}
              <div className="flex flex-col items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm shadow-inner w-fit">
                <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-yellow-200">
                  Avatar: {avatar?.avatar_name ?? 'Estudiante'}
                </span>
                
                {/* Avatar Preview ceñido sin margen sobrante con fondo claro radiante */}
                <div className="relative">
                  {renderAvatarPreview(200, 252, "20 4 110 138")}
                </div>

                {/* Botón Personalizar */}
                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  className="w-full py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-450 hover:to-indigo-500 text-white font-black rounded-lg text-[11px] uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Personalizar Traje
                </button>
              </div>

              {/* Bloque del Compañero Místico Vivo ceñido con escala proporcional oficial */}
              <div className="flex flex-col items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm shadow-inner w-fit">
                <span className="text-[10px] font-black bg-gradient-to-r from-teal-300 to-cyan-300 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-cyan-100">
                  Mascota: {avatar?.pet_name || 'Compañero'}
                </span>
                <div className="relative">
                  <LivingCompanionEngine
                    raceId={avatar?.pet_type || 'cryo_dragon'}
                    stage={stats?.pet_stage || 'egg'}
                    petName={avatar?.pet_name || 'Compañero'}
                    happiness={avatar?.pet_happiness ?? stats?.pet_happiness ?? 85}
                    friendshipExp={stats?.friendship_exp || 120}
                    tasksCompleted={stats?.tasks_completed_count || 0}
                    onPetTouch={() => petCompanionTouch(activeStudentId)}
                    onOpenSanctuary={() => setIsSanctuaryHomeOpen(true)}
                    onTriggerHatch={() => setIsHatchingModalOpen(true)}
                    onEvolveStage={() => evolvePetStage(activeStudentId)}
                    avatarHeight={252}
                  />
                </div>
              </div>
            </div>

            {/* Acciones de Mascota e Info */}
            <div className="flex-1 w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¡Hola, {avatar?.avatar_name ?? 'Estudiante'}!</h1>
              <p className="text-emerald-100 text-xs mt-0.5">Cuida de {avatar?.pet_name ?? 'Mascota'} resolviendo tus retos escolares.</p>
              
              {/* Barras de Estado */}
              <div className="grid grid-cols-2 gap-3 mt-3 max-w-sm">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                    <span>Hambre</span>
                    <span>{petHunger}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full transition-all duration-300" style={{ width: `${petHunger}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                    <span>Felicidad</span>
                    <span>{petHappiness}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${petHappiness}%` }} />
                  </div>
                </div>
              </div>

              {/* Botones de Cuidado */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 mt-4 w-full">
                <button
                  onClick={() => feedPet(activeStudentId)}
                  className="px-3.5 py-2.5 bg-white text-emerald-800 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Alimentar (5 🪙)</span>
                </button>
                <button
                  onClick={() => playWithPet(activeStudentId)}
                  className="px-3.5 py-2.5 bg-emerald-950/45 text-white border border-white/25 rounded-xl text-xs font-bold hover:bg-emerald-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Heart className="h-4 w-4 fill-current text-rose-300" />
                  <span>Jugar (2 🪙)</span>
                </button>
                <button
                  onClick={() => setIsPetModalOpen(true)}
                  className="col-span-2 sm:col-span-1 px-3.5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-current text-rose-650" />
                  <span>Centro de Cuidado ❤️</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Laberinto de Misiones */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-500" />
            Mapa del Laberinto Académico
          </h2>
          <SagaMap missions={missions} activeLevel={activeLevel} activeGrade={activeGrade} />
        </div>
      </div>
    );
  };

  // --- RENDER 2: PRIMARIA ALTA (EXPLORACIÓN ESPACIAL - YA DETALLADO) ---
  const renderPrimariaAlta = () => {
    return (
      <div className="flex flex-col gap-8">
        {/* Banner de Bienvenida Espacial */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              {renderAvatarPreview(110, 110)}
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all"
              >
                Cambiar Traje
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Explorador Académico
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">¡Hola, {avatar?.avatar_name ?? 'Estudiante'}!</h1>
              <p className="text-blue-100 mt-1 text-xs">Tu racha de {stats?.current_streak ?? 1} días está activa. ¡Viaja por la galaxia escolar!</p>

              {/* XP */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Nivel {stats?.level ?? 1}</span>
                  <span>{stats?.xp ?? 0} / {xpForCurrentLevel} XP</span>
                </div>
                <div className="h-3 w-full bg-white/25 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa de Misiones */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-500" />
            Ruta Intergaláctica de Misiones
          </h2>
          <SagaMap missions={missions} activeLevel={activeLevel} activeGrade={activeGrade} />
        </div>
      </div>
    );
  };

  // --- RENDER 3: SECUNDARIA (RPG HEROES OF ISKOOL) ---
  const renderSecundariaRPG = () => {
    const rpgClass = stats?.rpg_class || 'mago';
    const strength = stats?.attribute_strength ?? 10;
    const intelligence = stats?.attribute_intelligence ?? 10;
    const defense = stats?.attribute_defense ?? 10;
    const skillPoints = stats?.skill_points ?? 0;

    return (
      <div className="flex flex-col gap-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-2xl border border-emerald-500/30">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch w-full">
            
            {/* Hoja de Atributos */}
            <div id="rpg-attributes-panel" className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-2xl w-full lg:w-72 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <User className="h-4 w-4 text-emerald-400" />
                  Hoja de Héroe
                </span>
                <span className="text-[10px] font-bold text-yellow-500">Clase: {rpgClass.toUpperCase()}</span>
              </div>

              {/* Atributos */}
              <div className="flex flex-col gap-3">
                {/* Fuerza */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Dumbbell className="h-3.5 w-3.5 text-rose-500" />
                    Fuerza
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{strength}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('strength')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Inteligencia */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Brain className="h-3.5 w-3.5 text-blue-500" />
                    Inteligencia
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{intelligence}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('intelligence')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Defensa */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    Defensa
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{defense}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('defense')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {skillPoints > 0 ? (
                <div className="text-[10px] text-emerald-400 font-bold text-center border-t border-zinc-800 pt-2 animate-bounce">
                  ¡Tienes {skillPoints} puntos de habilidad disponibles!
                </div>
              ) : (
                <div className="text-[9px] text-zinc-500 text-center border-t border-zinc-800 pt-2">
                  Completa misiones para ganar puntos de habilidad.
                </div>
              )}
            </div>

            {/* Info principal RPG */}
            <div className="flex-1 flex flex-col justify-between items-start w-full gap-6">
              <div>
                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
                  Gremio de Héroes
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2">{avatar?.avatar_name || (activeStudent ? `${activeStudent.first_name} ${activeStudent.last_name_1}` : 'Elena la Sabia')}</h1>
                <p className="text-zinc-300 text-xs mt-1">Completa contratos académicos para subir tus estadísticas de rol.</p>

                {/* XP RPG */}
                <div className="mt-4 w-64 sm:w-80">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Nivel {stats?.level ?? 1} ({rpgClass})</span>
                    <span>{stats?.xp ?? 0} / {xpForCurrentLevel} XP</span>
                  </div>
                  <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Botón de la Tienda de Artefactos y Personalización */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  id="rpg-avatar-edit-button"
                  href="/student/avatar"
                  className="relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-950/20 transition-all duration-300 border border-emerald-500/35 active:scale-95 flex flex-col items-center gap-1.5 min-w-[140px]"
                >
                  <span className="text-2xl">🧙‍♂️</span>
                  <span className="relative z-10 flex items-center gap-2">
                    Edita tu Avatar
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>

                <Link
                  id="rpg-shop-banner-button"
                  href="/student/shop"
                  className="relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/30 transition-all duration-300 border border-amber-400/40 active:scale-95 flex flex-col items-center gap-1.5 min-w-[140px]"
                >
                  <span className="text-2xl">🏬</span>
                  <span className="relative z-10 flex items-center gap-2">
                    Tienda Mágica
                  </span>
                  <div className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>

                <button
                  id="rpg-sanctuary-banner-button"
                  type="button"
                  onClick={() => setIsSanctuaryHomeOpen(true)}
                  className="relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-teal-950/20 transition-all duration-300 border border-teal-400/40 active:scale-95 flex flex-col items-center gap-1.5 min-w-[140px] cursor-pointer"
                >
                  <span className="text-2xl">🏠</span>
                  <span className="relative z-10 flex items-center gap-2">
                    Ver Santuario
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </button>
              </div>
            </div>

            {/* Mascota de Combate / Tamagotchi RPG */}
            <PetSanctuary onOpenHome={() => setIsSanctuaryHomeOpen(true)} />

          </div>
        </div>

        {/* Tablero de Gremios / Contratos de Secundaria - Saga Map */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-500" />
            Sendero del Héroe: Contratos Activos
          </h2>
          <SagaMap missions={missions} activeLevel={activeLevel} activeGrade={activeGrade} />
        </div>

        {/* Campo de Batalla del Gremio */}
        <div id="rpg-combat-arena" className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Swords className="h-5 w-5 text-teal-400" />
            Arena del Gremio: Batalla Sincrónica
          </h2>
          <RpgCombatViewport />
        </div>


      </div>
    );
  };

  // --- RENDER 4: PREPARATORIA (STARTUPS E INNOVACIÓN) ---
  const renderPreparatoriaStartup = () => {
    const funding = stats?.funding_credits ?? 1000;
    
    // Buscar entregas del portafolio que el estudiante actual puede "coevaluar" (de otros alumnos)
    // Para simplificar la demo, listamos items de portafolio que no pertenecen a este alumno y que no tienen coevaluación registrada
    const peerItemsToReview = portfolioItems.filter(item => item.student_id !== activeStudentId && !item.peer_review_score);

    return (
      <div className="flex flex-col gap-8">
        {/* Banner Startup */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-white shadow-xl">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-blue-500/10 blur-xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div>
              <span className="bg-blue-500/25 border border-blue-500/30 text-blue-400 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Incubadora de Innovación
              </span>
              <h1 className="text-3xl font-black mt-2">{avatar?.avatar_name || (activeStudent ? `${activeStudent.first_name} ${activeStudent.last_name_1}` : 'Mateo Díaz')}</h1>
              <p className="text-xs text-zinc-400 mt-1">Simula proyectos profesionales, coevalúa propuestas y acumula créditos de inversión.</p>
            </div>

            {/* Créditos de Inversión */}
            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 text-center">
              <Landmark className="h-8 w-8 text-blue-500" />
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Créditos de Financiamiento</span>
                <span className="text-xl font-black text-white">{funding} 💰</span>
              </div>
            </div>

          </div>
        </div>

        {/* Sección de Coevaluación (Peer Review) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Evaluación de Proyectos por Pares (Simulación Laboral)
          </h2>

          {peerItemsToReview.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-400">
              No hay proyectos de compañeros pendientes de evaluar por tu parte. ¡Gran trabajo!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peerItemsToReview.map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 p-5 flex flex-col justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        {item.subject?.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold">De: {item.student_profile?.first_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.self_reflection}</p>
                  </div>

                  <button
                    onClick={() => setSelectedReviewItem(item)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    Coevaluar Propuesta
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Misiones / Hitos de Proyecto */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-sky-500" />
            Red de Hitos de Proyecto
          </h2>
          <SagaMap missions={missions} activeLevel={activeLevel} activeGrade={activeGrade} />
        </div>

        {/* Modal de Coevaluación */}
        {selectedReviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              
              <h3 className="text-md font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Coevaluar: {selectedReviewItem.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Autor: {selectedReviewItem.student_profile?.first_name} {selectedReviewItem.student_profile?.last_name}</p>

              {/* Formulario */}
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Calificación sugerida del proyecto (0.0 a 10.0)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={peerScore}
                    onChange={(e) => setPeerScore(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent mt-1 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Comentarios y Feedback de Innovación</label>
                  <textarea
                    required
                    value={peerComment}
                    onChange={(e) => setPeerComment(e.target.value)}
                    placeholder="Escribe comentarios objetivos. ¿Qué se puede mejorar? ¿Qué valor aporta la propuesta al mercado escolar?"
                    className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent mt-1 min-h-[90px] text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setSelectedReviewItem(null)}
                    className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await submitPeerReview(selectedReviewItem.id, parseFloat(peerScore), peerComment);
                        setSelectedReviewItem(null);
                        setPeerComment('');
                        alert('¡Coevaluación registrada exitosamente! Ganaste +100 XP.');
                      } catch (error: any) {
                        alert(`Error al registrar coevaluación: ${error.message || error}`);
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold"
                  >
                    Registrar Coevaluación (+100 XP)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
          <p className="text-xs font-bold text-zinc-400">Verificando sesión del alumno...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* BANNER DEL GREMIO: EDICTO ACTIVO & PULSO SOCIOEMOCIONAL */}
        {edictosList.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-emerald-500/40 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 shrink-0 mt-0.5 border border-teal-400/30">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
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

            {/* Termómetro Socioemocional Rápido del Alumno */}
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto text-center space-y-1.5">
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

        {/* Renderizado Condicional por Nivel */}
        {activeLevel === 'primaria' && renderPrimariaBaja()}
        {activeLevel === 'secundaria' && renderSecundariaRPG()}
        {activeLevel === 'preparatoria' && renderPreparatoriaStartup()}

      </main>

      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              ✨ Centro de Cuidado de tu Mascota
            </h3>

            {/* Estadísticas de la Mascota */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 mb-6 flex flex-col gap-3">
              <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Estado de {avatar?.pet_name || 'Mascota'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1 text-zinc-650 dark:text-zinc-350">
                    <span>Hambre</span>
                    <span>{avatar?.pet_hunger ?? 50}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${avatar?.pet_hunger ?? 50}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1 text-zinc-650 dark:text-zinc-350">
                    <span>Felicidad</span>
                    <span>{avatar?.pet_happiness ?? 50}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${avatar?.pet_happiness ?? 50}%` }} />
                  </div>
                </div>
              </div>

              {/* Botones de Acción de Cuidado */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => feedPet(activeStudentId)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Alimentar (5 🪙)
                </button>
                <button
                  type="button"
                  onClick={() => playWithPet(activeStudentId)}
                  className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Heart className="h-4 w-4 fill-current text-rose-300" />
                  Jugar (2 🪙)
                </button>
              </div>
            </div>

            {/* Opciones de Mascota: 10 Razas Elementales */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block">10 Razas Elementales de Compañero</label>
                <button
                  type="button"
                  onClick={() => setIsHatchingModalOpen(true)}
                  className="text-[10px] text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
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
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/35 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-300'
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
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1.5">Nombre de la Mascota</label>
              <input
                type="text"
                value={avatar?.pet_name || ''}
                onChange={(e) => changeAvatar({ pet_name: e.target.value })}
                placeholder="Ej. Llamita"
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => setIsPetModalOpen(false)}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-xl text-xs font-black transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Overlay de Gamificación */}
      {showTour && activeLevel === 'secundaria' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative max-w-md w-full mx-4 p-6 rounded-3xl border border-emerald-500/50 bg-gradient-to-br from-slate-900 to-blue-950/90 text-white shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Step indicator */}
            <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <span>Guía del Gremio (Paso {tourStep + 1} de 4)</span>
              <button 
                onClick={() => {
                  setShowTour(false);
                  localStorage.setItem('iskool_rpg_tour_completed', 'true');
                }}
                className="hover:text-emerald-300 transition-colors"
              >
                Saltar Tour ✕
              </button>
            </div>

            {/* Mentor Avatar and Dialogue */}
            <div className="flex gap-4 items-start bg-zinc-950/40 p-4 rounded-2xl border border-emerald-900/30">
              <div className="text-4xl p-2 bg-emerald-950/50 rounded-2xl border border-emerald-500/30 shadow-inner select-none">🧙‍♂️</div>
              <div className="flex-1">
                <strong className="text-emerald-300 text-xs font-bold block mb-1">Sombra (Mentor de Rol)</strong>
                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  {tourStep === 0 && "🔮 ¡Bienvenido al Gremio de Héroes! Aquí verás tu Hoja de Héroe. Al completar contratos de tareas y subir de nivel, obtendrás puntos para mejorar tu Fuerza, Inteligencia y Defensa."}
                  {tourStep === 1 && "🏬 Esta es la Tienda de Artefactos. Compra objetos mágicos con las monedas que ganes. ¡Cada artefacto te otorga una oportunidad extra de reintentar el examen final!"}
                  {tourStep === 2 && "👾 En la Arena, tus tareas pendientes cobran vida como monstruos en el lado derecho. ¡Completa las tareas para aumentar tu Poder Académico y golpear con fuerza!"}
                  {tourStep === 3 && "👑 El Examen es el Jefe Final. Si no completas tus tareas, tu Poder Académico será 0% y tus ataques harán 0 de daño. ¡Véncelo en menos turnos para obtener mejor calificación!"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-2">
              <button
                disabled={tourStep === 0}
                onClick={() => setTourStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Atrás
              </button>
              
              <button
                onClick={() => {
                  if (tourStep < 3) {
                    setTourStep(prev => prev + 1);
                    // Highlight corresponding element if needed
                    const targets = ["rpg-attributes-panel", "rpg-shop-banner-button", "rpg-combat-arena", "rpg-combat-arena"];
                    const targetId = targets[tourStep + 1];
                    const el = document.getElementById(targetId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-yellow-400/60', 'duration-500');
                      setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400/60'), 2000);
                    }
                  } else {
                    setShowTour(false);
                    localStorage.setItem('iskool_rpg_tour_completed', 'true');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {tourStep === 3 ? "¡Entendido!" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinemática de Eclosión del Huevo Místico al Cumplir la Primera Tarea */}
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

      {/* Experiencia Inmersiva del Santuario y Hogar del Compañero */}
      <PetHomeSanctuaryModal
        isOpen={isSanctuaryHomeOpen}
        onClose={() => setIsSanctuaryHomeOpen(false)}
      />

      <QuestCardModal />
    </div>
  );
}
