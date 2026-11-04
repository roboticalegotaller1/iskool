// src/app/redisenos_gamificados/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Play, 
  ShoppingBag, 
  Swords, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Calendar, 
  Flame, 
  Layers, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';

import { 
  INITIAL_STUDENTS, 
  StudentProfile, 
  REDESIGNS_LIST, 
  RedesignDetail, 
  COLEGIO_MONTESSORI_METRICS,
  SEP_ANNUAL_PLAN_2026,
  StoreItem,
  InteractiveTask,
  formatCoins
} from '@/lib/redisenosSandboxData';

import { REDESIGNS_EXECUTIVE_SPECS } from '@/lib/redisenosComprehensiveData';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { GamificationStoreModal } from '@/components/redisenos/GamificationStoreModal';
import { GamificationCombatArena } from '@/components/redisenos/GamificationCombatArena';
import { UniversalTeacherStudioModal } from '@/components/redisenos/UniversalTeacherStudioModal';
import { TeacherPerspectiveModal } from '@/components/redisenos/TeacherPerspectiveModal';
import { CeoMontessoriBridgeModal } from '@/components/redisenos/CeoMontessoriBridgeModal';
import { RedesignDocViewerModal } from '@/components/redisenos/RedesignDocViewerModal';
import { InteractiveTasksModal } from '@/components/redisenos/InteractiveTasksModal';
import { LiveRedesignPlayerModal } from '@/components/redisenos/LiveRedesignPlayerModal';
import { ISkoolOfficialLogo } from '@/components/brand/ISkoolOfficialLogo';

export default function RedisenosGamificadosPage() {
  const router = useRouter();

  // Estado del Estudiante Activo (Mateo, Sofía o Rodrigo)
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);

  // Modales
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isCombatOpen, setIsCombatOpen] = useState(false);
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isCeoBridgeOpen, setIsCeoBridgeOpen] = useState(false);
  
  // Doc Viewer & Teacher View
  const [selectedRedesign, setSelectedRedesign] = useState<RedesignDetail | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [teacherModalRedesignKey, setTeacherModalRedesignKey] = useState<string | null>(null);

  // Modo Prueba en Vivo Activado
  const [isTestModeActive, setIsTestModeActive] = useState(false);
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);
  const [livePlayerRedesign, setLivePlayerRedesign] = useState<RedesignDetail | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Estado del Carrusel Principal (Sin necesidad de bajar)
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [cardsPerView, setCardsPerView] = useState<2 | 3>(2);
  const [viewMode, setViewMode] = useState<'carousel_detailed' | 'carousel_compact'>('carousel_detailed');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showBottomSections, setShowBottomSections] = useState<boolean>(false);

  const maxStartIndex = Math.max(0, REDESIGNS_LIST.length - (viewMode === 'carousel_compact' ? 4 : cardsPerView));

  const handlePrevSlide = useCallback(() => {
    gamificationAudio.playClickSound();
    setCarouselIndex(prev => (prev <= 0 ? maxStartIndex : prev - 1));
  }, [maxStartIndex]);

  const handleNextSlide = useCallback(() => {
    gamificationAudio.playClickSound();
    setCarouselIndex(prev => (prev >= maxStartIndex ? 0 : prev + 1));
  }, [maxStartIndex]);

  const handleJumpToRedesign = (index: number) => {
    gamificationAudio.playClickSound();
    const clamped = Math.min(index, maxStartIndex);
    setCarouselIndex(clamped);
  };

  // Navegación con flechas del teclado para el carrusel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isStoreOpen ||
        isCombatOpen ||
        isTeacherStudioOpen ||
        isTasksOpen ||
        isCeoBridgeOpen ||
        isDocViewerOpen ||
        isLivePlayerOpen ||
        !!teacherModalRedesignKey
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePrevSlide,
    handleNextSlide,
    isStoreOpen,
    isCombatOpen,
    isTeacherStudioOpen,
    isTasksOpen,
    isCeoBridgeOpen,
    isDocViewerOpen,
    isLivePlayerOpen,
    teacherModalRedesignKey
  ]);

  const toggleCard = (key: string) => {
    gamificationAudio.playClickSound();
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Manejo de Compra en Tienda
  const handlePurchaseItem = (item: StoreItem): boolean => {
    if (activeStudent.coins < item.price) return false;

    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        coins: s.coins - item.price,
        avatarImage: item.equippedAvatarImage || s.avatarImage,
        equippedItems: {
          ...s.equippedItems,
          ...(item.category === 'outfits' && { outfit: item.name }),
          ...(item.category === 'companions' && { companion: item.name }),
          ...(item.category === 'powerups' && { accessory: item.name }),
          ...(item.category === 'badges' && { badge: item.name })
        }
      };
    }));

    showNotification(`¡Compraste y equipaste "${item.name}" en el avatar de ${activeStudent.name}!`);
    return true;
  };

  // Manejo de Equipar Ítem
  const handleEquipItem = (category: keyof StudentProfile['equippedItems'], itemName: string, avatarUrl?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        avatarImage: avatarUrl || s.avatarImage,
        equippedItems: {
          ...s.equippedItems,
          [category]: itemName
        }
      };
    }));
    showNotification(`¡Equipaste "${itemName}" en el avatar de ${activeStudent.name}!`);
  };

  // Recompensa de Combate
  const handleBattleVictory = (coinsWon: number, xpWon: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        coins: s.coins + coinsWon,
        xp: s.xp + xpWon,
        stars: s.stars + 5
      };
    }));
    showNotification(`¡Victoria en Arena! Ganaste +${coinsWon} Monedas y +${xpWon} XP`);
  };

  // Tarea completada
  const handleTaskCompleted = (task: InteractiveTask) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        coins: s.coins + task.rewardCoins,
        xp: s.xp + task.rewardXp,
        stars: s.stars + task.rewardStars,
        stats: {
          ...s.stats,
          tasksCompleted: s.stats.tasksCompleted + 1
        }
      };
    }));
    showNotification(`¡Tarea "${task.title}" completada! +${task.rewardCoins} Monedas ganadas.`);
  };

  // Abrir documento de rediseño
  const handleOpenDoc = (redesign: RedesignDetail) => {
    gamificationAudio.playClickSound();
    setSelectedRedesign(redesign);
    setIsDocViewerOpen(true);
  };

  // Ejecutar Entorno en Vivo Dedicado
  const handleLaunchLive = (redesign: RedesignDetail) => {
    gamificationAudio.playLevelUpSound();
    if (redesign.key === '01') {
      router.push('/redisenos_gamificados/el_reino_de_las_huellitas');
      return;
    }
    if (redesign.key === '02') {
      router.push('/redisenos_gamificados/la_isla_de_los_juguetes_magicos');
      return;
    }
    if (redesign.key === '03') {
      router.push('/redisenos_gamificados/Guardianes_Elementales');
      return;
    }
    if (redesign.key === '04') {
      router.push('/redisenos_gamificados/El_Libro_de_aventuras_y_album');
      return;
    }
    if (redesign.key === '05') {
      router.push('/redisenos_gamificados/cronicas_de_exploradores');
      return;
    }
    if (redesign.key === '06') {
      router.push('/redisenos_gamificados/torneo_de_saberes_tcg');
      return;
    }
    if (redesign.key === '07') {
      router.push('/redisenos_gamificados/gremio_cyber_esports');
      return;
    }
    if (redesign.key === '08') {
      router.push('/redisenos_gamificados/metropolis_de_inventores');
      return;
    }
    if (redesign.key === '09') {
      router.push('/redisenos_gamificados/apex_academy_venture_studio');
      return;
    }
    if (redesign.key === '10') {
      router.push('/redisenos_gamificados/nexus_protocol_research_guild');
      return;
    }
    setLivePlayerRedesign(redesign);
    setIsLivePlayerOpen(true);
    setIsTestModeActive(true);
    showNotification(`¡Simulador en Vivo Activado: ${redesign.title}!`);
  };

  const visibleCount = viewMode === 'carousel_compact' ? 4 : cardsPerView;
  const visibleRedesigns = REDESIGNS_LIST.slice(carouselIndex, carouselIndex + visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/40 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* 1. CABECERA INSTITUCIONAL COMPACTA EN TEMA CLARO (DAYLIGHT) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo Institucional y Colegio Montessori */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <ISkoolOfficialLogo variant="horizontal" theme="light" size={24} showTagline={false} />
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                CCT: {COLEGIO_MONTESSORI_METRICS.cct}
              </span>
            </div>
            <div className="hidden xl:block pl-2.5 border-l border-slate-200">
              <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">
                {COLEGIO_MONTESSORI_METRICS.name} · <span className="text-indigo-600 font-bold">10 Rediseños Gamificados por Edades</span>
              </p>
            </div>
          </div>

          {/* Selector de Alumno + Cartera + Acciones Rápidas Integrados */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Conmutador de 3 Alumnos Reales */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedStudentId(s.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedStudentId === s.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <img src={s.avatarImage} alt={s.name} className="w-4 h-4 rounded object-cover" />
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-80 hidden md:inline">({s.grade.split(' ')[0]})</span>
                </button>
              ))}
            </div>

            {/* Indicadores Rápidos */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                <span>🪙</span>
                <span suppressHydrationWarning>{formatCoins(activeStudent.coins)}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]">
                <span>⭐</span>
                <span>{activeStudent.stars}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>{activeStudent.streakDays}d</span>
              </div>
            </div>

            {/* Botones de Módulos Interactivos */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setIsStoreOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-sm transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tienda</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setIsCombatOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-all"
              >
                <Swords className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Arena</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setIsTeacherStudioOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-sm transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Estudio Docente</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setIsTasksOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">5 Tareas</span>
              </button>
            </div>

            {/* Botón Principal "PRUEBA" + Visión CEO */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
              <button
                onClick={() => {
                  const target = REDESIGNS_LIST[carouselIndex] || REDESIGNS_LIST[0];
                  handleLaunchLive(target);
                }}
                className="px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Probar en Vivo</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setIsCeoBridgeOpen(true);
                }}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>CEO</span>
              </button>

              <Link
                href="/student"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Portal Original
              </Link>
            </div>
          </div>

        </div>

        {/* Notificación Toast */}
        {notification && (
          <div className="bg-emerald-50 border-t border-emerald-200 text-emerald-800 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {notification}
          </div>
        )}
      </header>

      {/* 2. CONTENIDO PRINCIPAL: CARRUSEL INTERACTIVO SIN NECESIDAD DE BAJAR */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex-1 w-full flex flex-col justify-between space-y-2.5">
        
        {/* BARRA SUPERIOR DEL CARRUSEL: TÍTULO + SELECTOR DIRECTO #01..#10 + CONTROLES */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            
            {/* Encabezado Ejecutivo Compacto */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Carrusel de los 10 Rediseños de Clase Mundial (Bóveda Curricular)
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Mostrando #{REDESIGNS_LIST[carouselIndex]?.key} a #{REDESIGNS_LIST[Math.min(REDESIGNS_LIST.length - 1, carouselIndex + visibleCount - 1)]?.key} de 10
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Desliza con las flechas o selecciona directamente cualquier propuesta del <strong>#01 al #10</strong> sin necesidad de bajar en la página.
                </p>
              </div>
            </div>

            {/* Controles de Vista y Navegación del Carrusel */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Selector de Densidad (2 tarjetas detalladas, 3 tarjetas detalladas o 4 compactas) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setViewMode('carousel_detailed');
                    setCardsPerView(2);
                    setCarouselIndex(prev => Math.min(prev, REDESIGNS_LIST.length - 2));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'carousel_detailed' && cardsPerView === 2
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2 por Vista (Forense)</span>
                </button>

                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setViewMode('carousel_detailed');
                    setCardsPerView(3);
                    setCarouselIndex(prev => Math.min(prev, REDESIGNS_LIST.length - 3));
                  }}
                  className={`hidden xl:flex px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all items-center gap-1 ${
                    viewMode === 'carousel_detailed' && cardsPerView === 3
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3 por Vista</span>
                </button>

                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setViewMode('carousel_compact');
                    setCarouselIndex(prev => Math.min(prev, REDESIGNS_LIST.length - 4));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'carousel_compact'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
                  <span>4 por Vista (Compacto)</span>
                </button>
              </div>

              {/* Botones Anterior / Siguiente */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevSlide}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                  title="Anterior rediseño (Flecha Izquierda)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                  title="Siguiente rediseño (Flecha Derecha)"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TIRA INTERACTIVA DE ACCESO DIRECTO A LOS 10 REDISEÑOS (#01 AL #10) */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1.5 border-t border-slate-100">
            {REDESIGNS_LIST.map((item, idx) => {
              const isVisible = idx >= carouselIndex && idx < carouselIndex + visibleCount;
              const isPrimary = idx === carouselIndex;
              const shortName = item.title.replace(/^\d+\s*[^·]+·\s*/, '');
              return (
                <button
                  key={item.key}
                  onClick={() => handleJumpToRedesign(idx)}
                  className={`group relative px-2 py-1 rounded-xl border text-left transition-all flex items-center gap-1.5 overflow-hidden ${
                    isPrimary
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : isVisible
                      ? 'bg-indigo-50/90 text-indigo-950 border-indigo-300 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <img
                    src={item.hubImage}
                    alt={item.title}
                    className="w-6 h-6 rounded-lg object-cover shrink-0 border border-white/40"
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`text-[9px] font-black leading-none ${isPrimary ? 'text-amber-300' : isVisible ? 'text-indigo-700' : 'text-slate-500'}`}>
                      #{item.key} · {item.level.split(' ')[0]}
                    </div>
                    <div className="text-[10px] font-bold truncate leading-tight mt-0.5">
                      {shortName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENEDOR DEL CARRUSEL ACTIVO (VISIBLE 100% EN PRIMERA PANTALLA SIN BAJAR) */}
        <div className="relative">
          {/* Flecha Flotante Izquierda */}
          <button
            onClick={handlePrevSlide}
            aria-label="Anterior propuesta"
            className="hidden xl:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white hover:bg-indigo-600 text-slate-800 hover:text-white border border-slate-300 shadow-xl items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Flecha Flotante Derecha */}
          <button
            onClick={handleNextSlide}
            aria-label="Siguiente propuesta"
            className="hidden xl:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white hover:bg-indigo-600 text-slate-800 hover:text-white border border-slate-300 shadow-xl items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* MODO 1: CARRUSEL FORENSE DETALLADO (2 O 3 TARJETAS LUMINOSAS EN PANTALLA) */}
          {viewMode === 'carousel_detailed' ? (
            <div className={`grid grid-cols-1 ${cardsPerView === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
              {visibleRedesigns.map((r) => {
                const spec = REDESIGNS_EXECUTIVE_SPECS[r.key];
                const isExpanded = !!expandedCards[r.key];

                return (
                  <div
                    key={r.key}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 transition-all duration-300 shadow-lg shadow-slate-200/60 flex flex-col justify-between space-y-2.5 relative group"
                  >
                    <div className="space-y-2.5">
                      
                      {/* Imagen Maestra del Rediseño */}
                      <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                        <img
                          src={r.hubImage}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-black text-indigo-700 border border-indigo-200 shadow-md">
                          Propuesta #{r.key}
                        </div>
                        <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 shadow-md">
                          {r.level} · {spec?.ages || r.ages}
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-bold text-slate-800 border border-slate-200/90 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-1.5 truncate">
                            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{spec?.worldBenchmarkSummary || r.worldBenchmark}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-black uppercase shrink-0 ml-2">
                            {r.theme}
                          </span>
                        </div>
                      </div>

                      {/* Título y Tagline Curricular */}
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {r.title}
                        </h2>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium leading-snug line-clamp-1">
                          {r.tagline}
                        </p>
                      </div>

                      {/* Metáfora Lúdica y Mecánica Central Compactas en 2 Columnas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 leading-snug">
                          <strong className="text-indigo-800 block mb-0.5 text-[10px] uppercase tracking-wide">
                            1. Metáfora Lúdica:
                          </strong>
                          <span className="line-clamp-2 text-[11px]">{spec?.identity.gameMetaphor || r.summary}</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700 leading-snug">
                          <strong className="text-emerald-800 block mb-0.5 text-[10px] uppercase tracking-wide">
                            2. Mecánica Central:
                          </strong>
                          <span className="line-clamp-2 text-[11px]">{spec?.identity.coreLevelMechanic || r.tagline}</span>
                        </div>
                      </div>

                      {/* Benchmarks Mundiales Resumidos en Píldoras Interactivas */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                            Benchmarks Mundiales (.md):
                          </span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                            {spec?.globalBenchmarks?.length || 1} Referentes
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          {spec?.globalBenchmarks?.map((gb, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200/80 text-[11px] shadow-2xs">
                              <div className="font-extrabold text-slate-900 truncate">{gb.name}</div>
                              <div className="text-[10px] text-indigo-600 font-semibold truncate">{gb.origin}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                                {gb.iskoolAdvantage}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desglose Desplegable Opcional de 4 Pantallas y Viabilidad Cloud */}
                      <div>
                        <button
                          onClick={() => toggleCard(r.key)}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold flex items-center justify-between transition-colors border border-slate-200"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            {isExpanded ? 'Ocultar 4 Pantallas Operativas y Viabilidad Cloud' : 'Ver 4 Pantallas Operativas, Bóveda y Viabilidad Cloud'}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-xl bg-white border border-slate-200">
                                <span className="font-bold text-sky-700 block">Pantalla 1: Hub</span>
                                <p className="text-slate-600 line-clamp-2">{spec?.screens.hub.title}</p>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-200">
                                <span className="font-bold text-emerald-700 block">Pantalla 2: Desafío</span>
                                <p className="text-slate-600 line-clamp-2">{spec?.screens.quiz.title}</p>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-200">
                                <span className="font-bold text-amber-700 block">Pantalla 3: Avatar</span>
                                <p className="text-slate-600 line-clamp-2">{spec?.screens.avatar.title}</p>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-200">
                                <span className="font-bold text-purple-700 block">Pantalla 4: Docente</span>
                                <p className="text-slate-600 line-clamp-2">{spec?.screens.teacherStudio.title}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                              <p><strong className="text-slate-900">Bóveda Curricular:</strong> {spec?.iskoolIntegration.vaultIntegration}</p>
                              <p><strong className="text-slate-900">Viabilidad Cloud:</strong> {spec?.cloudViability.cloudStorage}</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Botonera de Acción de la Tarjeta */}
                    <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenDoc(r)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-indigo-200"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Abrir Documento Forense (.md)</span>
                      </button>

                      <button
                        onClick={() => handleLaunchLive(r)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Probar en Vivo (Prueba)</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* MODO 2: CARRUSEL COMPACTO (4 TARJETAS SIMULTÁNEAS EN PANTALLA) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleRedesigns.map((r) => {
                const spec = REDESIGNS_EXECUTIVE_SPECS[r.key];
                return (
                  <div
                    key={r.key}
                    onClick={() => handleOpenDoc(r)}
                    className="group relative p-4 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-400 text-left transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl cursor-pointer"
                  >
                    <div>
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                        <img
                          src={r.hubImage}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-[11px] font-black text-indigo-700 border border-indigo-200 shadow-sm">
                          Propuesta #{r.key}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-800 border border-slate-200 truncate flex items-center gap-1">
                          <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{spec?.worldBenchmarkSummary || r.worldBenchmark}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                          {r.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {spec?.ages || r.ages}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors">
                        {r.title.replace(/^\d+\s*/, '')}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                        {r.tagline}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 space-y-1">
                        <div className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                          <strong className="text-slate-900">Metáfora:</strong> {spec?.identity.gameMetaphor || r.summary}
                        </div>
                        <div className="text-[11px] text-slate-600 leading-tight line-clamp-2">
                          <strong className="text-indigo-700">Mecánica:</strong> {spec?.identity.coreLevelMechanic || r.tagline}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDoc(r);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-black"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ficha (.md)</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchLive(r);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Probar en Vivo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. BARRA INFERIOR PLEGABLE: PLAN CURRICULAR SEP Y TABLA COMPARATIVA FORENSE */}
        <div className="pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-extrabold text-slate-800">
                Plan Curricular Anual SEP 2026-2027 (Semana 9 en Curso) & Benchmark Comparativo Forense
              </span>
            </div>
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setShowBottomSections(prev => !prev);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>{showBottomSections ? 'Ocultar Calendario SEP y Tabla Benchmark' : 'Desplegar Calendario SEP y Tabla Benchmark'}</span>
              {showBottomSections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showBottomSections && (
            <div className="mt-4 space-y-6 animate-in fade-in duration-200">
              {/* CALENDARIO ANUAL SEP 2026-2027 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Plan Curricular Anual SEP 2026-2027 (Nueva Escuela Mexicana)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seguimiento de semanas lectivas del ciclo escolar actual en Colegio Montessori del Valle
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Semana 9 en Curso (Octubre 2026)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
                  {SEP_ANNUAL_PLAN_2026.slice(0, 9).map(w => (
                    <div
                      key={w.week}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        w.status === 'in_progress'
                          ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-1 ring-indigo-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Semana {w.week}</span>
                        <span className="font-bold text-slate-900 text-[11px] line-clamp-2 mt-0.5">{w.title}</span>
                      </div>
                      <div className="mt-2 text-[10px] flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {w.status === 'in_progress' ? 'En Curso' : 'Acreditada'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BENCHMARK COMPARATIVO FORENSE */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block mb-1">
                    Auditoría y Análisis Comparativo Forense
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Benchmark: Portal Actual (`/student`) vs Suite de Rediseños Adaptativos
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] bg-slate-50">
                        <th className="py-3 px-4">Criterio de Evaluación</th>
                        <th className="py-3 px-4 text-rose-700">Portal Actual (`/student`)</th>
                        <th className="py-3 px-4 text-emerald-700">Suite de Rediseños Adaptativos</th>
                        <th className="py-3 px-4 text-amber-700">Sitio de Oportunidad Detectado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Alineación por Edades</td>
                        <td className="py-3 px-4 text-rose-700">Monolítica (la misma vista para 3 y 18 años).</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">Polimórfica (5 universos visuales calibrados).</td>
                        <td className="py-3 px-4">Elimina el 100% de la frustración en preescolar y primaria baja.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Gamificación de Quizzes</td>
                        <td className="py-3 px-4 text-rose-700">Preguntas estáticas en formulario tradicional.</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">Minijuegos de combate, cartas TCG y terminal LaTeX.</td>
                        <td className="py-3 px-4">Aumenta en 3x el tiempo voluntario de práctica en casa.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Módulo Docente</td>
                        <td className="py-3 px-4 text-rose-700">Creación aislada sin previsualización multi-edad.</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">Estudio de Actividades con transfiguración por Motor de IA Pedagógica.</td>
                        <td className="py-3 px-4">Ahorro del 70% de tiempo en la planeación didáctica del maestro.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Economía Lúdica y Tienda</td>
                        <td className="py-3 px-4 text-rose-700">Monedas simbólicas con tienda limitada.</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">Tienda funcional con equipamiento inmediato y catálogo anual.</td>
                        <td className="py-3 px-4">Fomenta hábitos de estudio continuos sin recurrir a dinero real.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Integración Cloud Institucional</td>
                        <td className="py-3 px-4 text-rose-700">Subida estándar sin compresión sistemática.</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">Acceso Único Institucional y compresión WebP &lt;300KB forzosa.</td>
                        <td className="py-3 px-4">Cumplimiento del 100% de la Regla No Negociable 3 en todos los flujos.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* 4. MODALES INTERACTIVOS */}
      <GamificationStoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        student={activeStudent}
        onPurchaseItem={handlePurchaseItem}
        onEquipItem={handleEquipItem}
      />

      <GamificationCombatArena
        isOpen={isCombatOpen}
        onClose={() => setIsCombatOpen(false)}
        student={activeStudent}
        onVictory={handleBattleVictory}
      />

      <UniversalTeacherStudioModal
        isOpen={isTeacherStudioOpen}
        onClose={() => setIsTeacherStudioOpen(false)}
        onChallengeAssigned={(prompt) => {
          showNotification(`¡Desafío "${prompt.slice(0, 30)}..." asignado con éxito a la clase!`);
        }}
      />

      <InteractiveTasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        student={activeStudent}
        onTaskCompleted={handleTaskCompleted}
      />

      <CeoMontessoriBridgeModal
        isOpen={isCeoBridgeOpen}
        onClose={() => setIsCeoBridgeOpen(false)}
      />

      <RedesignDocViewerModal
        redesign={selectedRedesign}
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        onLaunchTestMode={(key) => {
          const target = REDESIGNS_LIST.find(r => r.key === key) || selectedRedesign || REDESIGNS_LIST[0];
          setLivePlayerRedesign(target);
          setIsLivePlayerOpen(true);
          setIsTestModeActive(true);
          showNotification(`¡Simulador en Vivo Activado: ${target.title}!`);
        }}
        onOpenTeacherView={(key) => {
          setTeacherModalRedesignKey(key);
        }}
      />

      <LiveRedesignPlayerModal
        isOpen={isLivePlayerOpen}
        onClose={() => setIsLivePlayerOpen(false)}
        redesign={livePlayerRedesign}
        allRedesigns={REDESIGNS_LIST}
        onSelectRedesign={(r) => setLivePlayerRedesign(r)}
        student={activeStudent}
        onRewardStudent={(coins, xp, stars) => {
          setStudents(prev => prev.map(s => {
            if (s.id !== activeStudent.id) return s;
            const newXp = s.xp + xp;
            const didLevelUp = newXp >= s.maxXp;
            return {
              ...s,
              coins: s.coins + coins,
              xp: didLevelUp ? newXp - s.maxXp : newXp,
              stars: s.stars + stars,
              stats: {
                ...s.stats,
                tasksCompleted: s.stats.tasksCompleted + 1
              }
            };
          }));
          showNotification(`¡Recompensa ganada en simulación! +${coins} 🪙 y +${xp} XP`);
        }}
        onOpenStore={() => {
          setIsLivePlayerOpen(false);
          setIsStoreOpen(true);
        }}
        onOpenCombat={() => {
          setIsLivePlayerOpen(false);
          setIsCombatOpen(true);
        }}
        onOpenTeacherStudio={() => {
          setIsLivePlayerOpen(false);
          setIsTeacherStudioOpen(true);
        }}
        onOpenDocViewer={(r) => {
          setIsLivePlayerOpen(false);
          setSelectedRedesign(r);
          setIsDocViewerOpen(true);
        }}
      />

      {teacherModalRedesignKey && (
        <TeacherPerspectiveModal
          isOpen={!!teacherModalRedesignKey}
          onClose={() => setTeacherModalRedesignKey(null)}
          redesignKey={teacherModalRedesignKey}
        />
      )}

      {/* Footer Luminoso */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-[11px] text-slate-500">
        <p>ISkool · Sistema de Gamificación Escolar Adaptativa · Colegio Montessori del Valle (CCT: 09PPR8800M) · Compatible con SEP NEM 2026-2027</p>
      </footer>

    </div>
  );
}
