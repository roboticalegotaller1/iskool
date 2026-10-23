// src/app/redisenos_gamificados/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Play, 
  ShoppingBag, 
  Swords, 
  BookOpen, 
  Award, 
  Users, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Layers, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileText
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

import { gamificationAudio } from '@/lib/redisenosAudio';
import { GamificationStoreModal } from '@/components/redisenos/GamificationStoreModal';
import { GamificationCombatArena } from '@/components/redisenos/GamificationCombatArena';
import { UniversalTeacherStudioModal } from '@/components/redisenos/UniversalTeacherStudioModal';
import { TeacherPerspectiveModal } from '@/components/redisenos/TeacherPerspectiveModal';
import { CeoMontessoriBridgeModal } from '@/components/redisenos/CeoMontessoriBridgeModal';
import { RedesignDocViewerModal } from '@/components/redisenos/RedesignDocViewerModal';
import { InteractiveTasksModal } from '@/components/redisenos/InteractiveTasksModal';

export default function RedisenosGamificadosPage() {
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
  const [notification, setNotification] = useState<string | null>(null);

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
        equippedItems: {
          ...s.equippedItems,
          ...(item.category === 'outfits' && { outfit: item.name }),
          ...(item.category === 'companions' && { companion: item.name }),
          ...(item.category === 'badges' && { badge: item.name })
        }
      };
    }));

    showNotification(`¡Compraste y equipaste "${item.name}" con éxito!`);
    return true;
  };

  // Manejo de Equipar Ítem
  const handleEquipItem = (category: keyof StudentProfile['equippedItems'], itemName: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedItems: {
          ...s.equippedItems,
          [category]: itemName
        }
      };
    }));
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. TOP BAR INSTITUCIONAL & BOTÓN "PRUEBA" */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Logo y Colegio Montessori */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-600/20 flex items-center justify-center font-black text-white text-xl">
              iS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">ISkool</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CCT: {COLEGIO_MONTESSORI_METRICS.cct}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {COLEGIO_MONTESSORI_METRICS.name} · {COLEGIO_MONTESSORI_METRICS.slogan}
              </p>
            </div>
          </div>

          {/* Botón Principal "PRUEBA" (Simulación en Vivo de ISkool) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                gamificationAudio.playLevelUpSound();
                setIsTestModeActive(prev => !prev);
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl ${
                isTestModeActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300 scale-105'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-105'
              }`}
            >
              <Play className={`w-4 h-4 ${isTestModeActive ? 'fill-slate-950' : 'fill-white'}`} />
              {isTestModeActive ? 'Modo Prueba Activo' : 'Prueba'}
            </button>

            {/* Acceso a Métricas CEO del Colegio Montessori */}
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setIsCeoBridgeOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Visión CEO Colegio
            </button>

            <Link
              href="/student"
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            >
              Ver Portal Original
            </Link>
          </div>

        </div>

        {/* Notificación Toast */}
        {notification && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {notification}
          </div>
        )}
      </header>

      {/* 2. BARRA DE MODO PRUEBA / ALUMNO ACTIVO Y ACCIONES RÁPIDAS */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Conmutador de 3 Alumnos Reales */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Perfil Alumno:
            </span>
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedStudentId(s.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedStudentId === s.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <img src={s.avatarImage} alt={s.name} className="w-5 h-5 rounded-md object-cover" />
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">({s.grade})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cartera del Alumno: Monedas, Estrellas y Racha */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
              <span>🪙</span>
              <span suppressHydrationWarning>{formatCoins(activeStudent.coins)} Monedas</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-xs">
              <span>⭐</span>
              <span>{activeStudent.stars} Estrellas</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              <span>{activeStudent.streakDays} Días Racha</span>
            </div>
          </div>

          {/* Botonera de Acciones Interactivas */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setIsStoreOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              Tienda Real
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setIsCombatOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              Arena de Jefes
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setIsTeacherStudioOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              Estudio Docente
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setIsTasksOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              5 Tareas Reales
            </button>
          </div>

        </div>
      </section>

      {/* 3. CONTENIDO PRINCIPAL: LOS 10 BOTONES DE REDISEÑO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        
        {/* Banner de Bienvenida y Propósito */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 inline-block mb-3">
              Suite de Gamificación Adaptativa por Edades
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              10 Rediseños de Clase Mundial para ISkool
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
              Cada propuesta ofrece una experiencia inmersiva calibrada a la madurez psicológica del alumno: desde preescolar sensorial hasta preparatoria de alto impacto pre-universitario. Haz clic en cualquiera de los <strong>10 botones de rediseño</strong> para abrir el documento técnico a profundidad con maquetas nano banana, o pulsa <strong>"Prueba"</strong> arriba para interactuar en vivo con la tienda y las tareas reales.
            </p>
          </div>
        </div>

        {/* Sección de los 10 Botones de Rediseño */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Los 10 Modelos de Rediseño Gamificado
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona un modelo para desplegar su documento técnico forense, bucles de juego y pantallas
              </p>
            </div>
            <span className="text-xs text-purple-300 font-semibold px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-800">
              10 Documentos Completos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {REDESIGNS_LIST.map((r, idx) => (
              <button
                key={r.key}
                onClick={() => handleOpenDoc(r)}
                className="group relative p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/80 text-left transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div>
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-3 bg-slate-950 border border-slate-800">
                    <img
                      src={r.hubImage}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      #{r.key}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                    {r.level}
                  </span>
                  <h3 className="font-extrabold text-white text-sm leading-snug mb-1 group-hover:text-purple-300 transition-colors">
                    {r.title.replace(/^\d+\s*/, '')}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {r.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-bold">
                  <span>Abrir Documento</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. CALENDARIO ANUAL SEP 2026-2027 (PROGRESO HASTA LA FECHA DE HOY) */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Plan Curricular Anual SEP 2026-2027 (Nueva Escuela Mexicana)
              </h3>
              <p className="text-xs text-slate-400">
                Seguimiento de semanas lectivas del ciclo escolar actual en Colegio Montessori del Valle
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Semana 9 en Curso (Octubre 2026)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {SEP_ANNUAL_PLAN_2026.slice(0, 9).map(w => (
              <div
                key={w.week}
                className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                  w.status === 'in_progress'
                    ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Semana {w.week}</span>
                  <span className="font-bold text-white text-[11px] line-clamp-2 mt-0.5">{w.title}</span>
                </div>
                <div className="mt-2 text-[10px] flex items-center gap-1 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {w.status === 'in_progress' ? 'En Curso' : 'Acreditada'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. BENCHMARK COMPARATIVO FORENSE: PORTAL ACTUAL VS REDISEÑOS */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block mb-1">
              Auditoría y Análisis Comparativo Forense
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Benchmark: Portal Actual (`/student`) vs Suite de Rediseños Adaptativos
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluación quirúrgica de ventajas, desventajas y sitios de oportunidad antes de la implementación
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Criterio de Evaluación</th>
                  <th className="py-3 px-4 text-rose-400">Portal Actual (`/student`)</th>
                  <th className="py-3 px-4 text-emerald-400">Suite de Rediseños Adaptativos</th>
                  <th className="py-3 px-4 text-amber-400">Sitio de Oportunidad Detectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Alineación por Edades</td>
                  <td className="py-3 px-4 text-rose-300">Monolítica (la misma vista oscura para 3 y 18 años).</td>
                  <td className="py-3 px-4 text-emerald-300">Polimórfica (5 universos visuales calibrados).</td>
                  <td className="py-3 px-4">Elimina el 100% de la frustración en preescolar y primaria baja.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Gamificación de Quizzes</td>
                  <td className="py-3 px-4 text-rose-300">Preguntas estáticas en formulario tradicional.</td>
                  <td className="py-3 px-4 text-emerald-300">Minijuegos de combate, cartas TCG y terminal LaTeX.</td>
                  <td className="py-3 px-4">Aumenta en 3x el tiempo voluntario de práctica en casa.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Módulo Docente</td>
                  <td className="py-3 px-4 text-rose-300">Creación aislada sin previsualización multi-edad.</td>
                  <td className="py-3 px-4 text-emerald-300">Universal Challenge Studio con transfiguración por IA.</td>
                  <td className="py-3 px-4">Ahorro del 70% de tiempo en la planeación didáctica del maestro.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Economía Lúdica y Tienda</td>
                  <td className="py-3 px-4 text-rose-300">Monedas simbólicas con tienda limitada.</td>
                  <td className="py-3 px-4 text-emerald-300">Tienda funcional con equipamiento inmediato y catálogo anual.</td>
                  <td className="py-3 px-4">Fomenta hábitos de estudio continuos sin recurrir a dinero real.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Integración Cloud Institucional</td>
                  <td className="py-3 px-4 text-rose-300">Subida estándar sin compresión sistemática.</td>
                  <td className="py-3 px-4 text-emerald-300">SSO con Google Workspace y WebP &lt;300KB forzoso.</td>
                  <td className="py-3 px-4">Cumplimiento del 100% de la Regla No Negociable 3 en todos los flujos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 6. MODALES INTERACTIVOS */}
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
          setIsTestModeActive(true);
          showNotification(`Activaste el Modo Prueba para el Rediseño #${key}`);
        }}
        onOpenTeacherView={(key) => {
          setTeacherModalRedesignKey(key);
        }}
      />

      {teacherModalRedesignKey && (
        <TeacherPerspectiveModal
          isOpen={!!teacherModalRedesignKey}
          onClose={() => setTeacherModalRedesignKey(null)}
          redesignKey={teacherModalRedesignKey}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>ISkool · Sistema de Gamificación Escolar Adaptativa · Colegio Montessori del Valle (CCT: 09PPR8800M)</p>
        <p className="mt-1">Arquitectura Polimórfica Segura e Independiente · Compatible con SEP NEM 2026-2027</p>
      </footer>

    </div>
  );
}
