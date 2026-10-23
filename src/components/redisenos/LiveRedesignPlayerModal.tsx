// src/components/redisenos/LiveRedesignPlayerModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Sparkles, 
  Swords, 
  ShoppingBag, 
  Award, 
  RotateCcw, 
  Volume2, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Star, 
  Flame, 
  BookOpen, 
  ChevronRight,
  Layers,
  Heart
} from 'lucide-react';

import { 
  RedesignDetail, 
  StudentProfile, 
  INTERACTIVE_TASKS, 
  InteractiveTask,
  BOSS_ENEMIES,
  formatCoins
} from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  redesign: RedesignDetail | null;
  allRedesigns: RedesignDetail[];
  onSelectRedesign: (redesign: RedesignDetail) => void;
  student: StudentProfile;
  onRewardStudent: (coins: number, xp: number, stars: number) => void;
  onOpenStore: () => void;
  onOpenCombat: () => void;
  onOpenTeacherStudio: () => void;
  onOpenDocViewer: (redesign: RedesignDetail) => void;
}

export function LiveRedesignPlayerModal({
  isOpen,
  onClose,
  redesign,
  allRedesigns,
  onSelectRedesign,
  student,
  onRewardStudent,
  onOpenStore,
  onOpenCombat,
  onOpenTeacherStudio,
  onOpenDocViewer
}: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [enemyHp, setEnemyHp] = useState<number>(80);
  const [comboCount, setComboCount] = useState<number>(0);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [floatingDamage, setFloatingDamage] = useState<{ text: string; isCrit: boolean } | null>(null);

  // Mapear tarea interactiva según el rediseño seleccionado
  const getTaskForRedesign = (key: string): InteractiveTask => {
    switch (key) {
      case '01':
      case '02':
        return INTERACTIVE_TASKS.find(t => t.id === 'task-preschool-fruit') || INTERACTIVE_TASKS[4];
      case '03':
      case '04':
        return INTERACTIVE_TASKS.find(t => t.id === 'task-math-div') || INTERACTIVE_TASKS[0];
      case '05':
      case '06':
        return INTERACTIVE_TASKS.find(t => t.id === 'task-science-grav') || INTERACTIVE_TASKS[2];
      case '07':
      case '08':
        return INTERACTIVE_TASKS.find(t => t.id === 'task-history-rev') || INTERACTIVE_TASKS[1];
      case '09':
      case '10':
        return INTERACTIVE_TASKS.find(t => t.id === 'task-calc-limit') || INTERACTIVE_TASKS[3];
      default:
        return INTERACTIVE_TASKS[0];
    }
  };

  const activeRedesign = redesign || allRedesigns[2];
  const activeTask = getTaskForRedesign(activeRedesign.key);
  const activeBoss = (activeRedesign.key === '01' || activeRedesign.key === '02' || activeRedesign.key === '03' || activeRedesign.key === '04' || activeRedesign.key === '05')
    ? BOSS_ENEMIES[0]
    : BOSS_ENEMIES[1];

  // Reiniciar estado interactivo al cambiar de rediseño
  useEffect(() => {
    if (isOpen) {
      setSelectedOptionId(null);
      setFeedback(null);
      setEnemyHp(activeBoss.maxHp);
      setComboCount(0);
      setHasClaimedReward(false);
      setFloatingDamage(null);
    }
  }, [isOpen, activeRedesign.key]);

  if (!isOpen) return null;

  const handleSelectOption = (optId: string) => {
    gamificationAudio.playClickSound();
    setSelectedOptionId(optId);
  };

  const handleExecuteAction = () => {
    if (!selectedOptionId || hasClaimedReward) return;

    const opt = activeTask.options.find(o => o.id === selectedOptionId);
    if (!opt) return;

    if (opt.isCorrect) {
      gamificationAudio.playMagicCastSound();
      
      const damage = Math.round(35 * (1 + comboCount * 0.25));
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      setComboCount(prev => prev + 1);
      setFloatingDamage({ text: `-${damage} HP CRÍTICO!`, isCrit: true });

      setTimeout(() => {
        gamificationAudio.playEnemyHitSound();
      }, 120);

      setTimeout(() => {
        gamificationAudio.playLevelUpSound();
        setHasClaimedReward(true);
        onRewardStudent(activeTask.rewardCoins, activeTask.rewardXp, activeTask.rewardStars);
      }, 600);

      setFeedback({
        isCorrect: true,
        text: `¡Correcto! ${activeTask.explanation} Has activado el multiplicador de racha del Colegio Montessori.`
      });
    } else {
      gamificationAudio.playErrorSound();
      setComboCount(0);
      setFloatingDamage({ text: '¡Bloqueado!', isCrit: false });
      setFeedback({
        isCorrect: false,
        text: 'Respuesta incorrecta. El Asistente Pedagógico IA te sugiere revisar el concepto e intentar nuevamente.'
      });
    }
  };

  const handleResetChallenge = () => {
    gamificationAudio.playClickSound();
    setSelectedOptionId(null);
    setFeedback(null);
    setEnemyHp(activeBoss.maxHp);
    setHasClaimedReward(false);
    setFloatingDamage(null);
  };

  // Reproducir voz simulada amigable para preescolar
  const handlePlayVoice = (text: string) => {
    gamificationAudio.playLevelUpSound();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* 1. TOP HEADER DEL SIMULADOR */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Play className="w-5 h-5 fill-emerald-400 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Modo Prueba en Vivo Activo
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Simulación Didáctica ISkool
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {activeRedesign.title}
              </h2>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onOpenDocViewer(activeRedesign);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Ficha Técnica
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Cerrar Simulador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. SELECTOR RÁPIDO DE LOS 10 REDISEÑOS */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            Rediseño:
          </span>
          {allRedesigns.map((r) => {
            const isSelected = r.key === activeRedesign.key;
            return (
              <button
                key={r.key}
                onClick={() => {
                  gamificationAudio.playClickSound();
                  onSelectRedesign(r);
                }}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>#{r.key}</span>
                <span className="hidden sm:inline">{r.title.split('·')[1]?.trim() || r.title}</span>
              </button>
            );
          })}
        </div>

        {/* 3. SUB-BARRA: ESTADO DEL ALUMNO ACTIVO */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img 
              src={student.avatarImage} 
              alt={student.name} 
              className="w-8 h-8 rounded-xl object-cover border border-purple-500/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">{student.name}</span>
                <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                  {student.levelTitle}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Grado: {student.grade} · Atuendo: {student.equippedItems.outfit || 'Uniforme'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-bold">
            <div className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <span>🪙</span>
              <span suppressHydrationWarning>{formatCoins(student.coins)}</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              <span>{student.stars}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{student.streakDays}d</span>
            </div>
          </div>
        </div>

        {/* 4. ÁREA PRINCIPAL DE JUEGO INTERACTIVO (SIMULADOR DINÁMICO) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* BANNER / ESCENARIO VIVO DEL REDISEÑO */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 min-h-[220px] md:min-h-[260px] flex flex-col justify-between p-4 sm:p-6">
            <img 
              src={activeRedesign.hubImage} 
              alt={activeRedesign.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

            {/* Badges superiores sobre el escenario */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-600/80 backdrop-blur-md text-white font-black text-xs shadow-lg">
                  {activeRedesign.level} · {activeRedesign.ages}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs font-semibold border border-white/10">
                  Estilo: {activeRedesign.theme}
                </span>
              </div>

              {/* Botón de audio para síntesis de voz en preescolar / primaria */}
              {(activeRedesign.key === '01' || activeRedesign.key === '02') && (
                <button
                  onClick={() => handlePlayVoice(activeTask.question)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
                >
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Escuchar Instrucción por Voz
                </button>
              )}
            </div>

            {/* Panel de Jefe / Oponente interactivo */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-xl bg-slate-900 shrink-0">
                  <img src={activeBoss.image} alt={activeBoss.name} className="w-full h-full object-cover" />
                  {floatingDamage && (
                    <div className="absolute inset-0 bg-rose-600/40 flex items-center justify-center animate-ping">
                      <span className="text-xs font-black text-white">{floatingDamage.text}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Desafío en Vivo
                    </span>
                    {comboCount > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        ¡Combo x{comboCount}!
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {activeBoss.name}
                  </h3>
                  
                  {/* Barra de Salud del Oponente */}
                  <div className="w-44 sm:w-56 mt-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                      <span>Vitalidad Reto</span>
                      <span className="text-rose-300 font-bold">{enemyHp}/{activeBoss.maxHp} HP</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                        style={{ width: `${(enemyHp / activeBoss.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón para reiniciar reto */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetChallenge}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar Desafío
                </button>
              </div>
            </div>
          </div>

          {/* DESAFÍO PEDAGÓGICO JUGABLE */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                  {activeTask.subject} · {activeTask.gradeLevel}
                </span>
                <span className="text-xs text-slate-400">
                  Código Curricular: <strong className="text-slate-300">{activeTask.pdaCode}</strong>
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeTask.question}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {activeTask.pdaDescription}
              </p>
            </div>

            {/* Opciones de respuesta interactiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTask.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={hasClaimedReward}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-between border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-[1.01]'
                        : 'bg-slate-950/70 hover:bg-slate-800/80 text-slate-200 border-slate-800 hover:border-slate-700'
                    } ${hasClaimedReward ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-white bg-white/20' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botón de Ejecutar Acción Didáctica */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Recompensas al resolver:</span>
                <span className="font-bold text-amber-300">+{activeTask.rewardCoins} 🪙</span>
                <span className="font-bold text-purple-300">+{activeTask.rewardXp} XP</span>
                <span className="font-bold text-indigo-300">+{activeTask.rewardStars} ⭐</span>
              </div>

              <button
                disabled={!selectedOptionId || hasClaimedReward}
                onClick={handleExecuteAction}
                className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl ${
                  !selectedOptionId || hasClaimedReward
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 hover:scale-105 active:scale-95'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                {hasClaimedReward ? '¡Completado con Éxito!' : 'Lanzar Respuesta y Atacar'}
              </button>
            </div>

            {/* Feedback Didáctico */}
            {feedback && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in flex items-start gap-3 ${
                feedback.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block text-sm mb-0.5">
                    {feedback.isCorrect ? '¡Excelente Razonamiento!' : 'Oportunidad de Aprendizaje'}
                  </strong>
                  {feedback.text}
                </div>
              </div>
            )}
          </div>

          {/* BOTONERA DE MÓDULOS CONECTADOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onOpenCombat();
              }}
              className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Combate Total</span>
                <span className="text-xs font-bold text-white">Arena de Jefes Didácticos</span>
              </div>
              <Swords className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onOpenStore();
              }}
              className="p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Economía Virtual</span>
                <span className="text-xs font-bold text-white">Tienda de Atuendos & Mascotas</span>
              </div>
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onOpenTeacherStudio();
              }}
              className="p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Autoría Pedagógica</span>
                <span className="text-xs font-bold text-white">Estudio Docente Universal</span>
              </div>
              <Award className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>

        </div>

        {/* 5. FOOTER */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="hidden sm:inline">
            Colegio Montessori del Valle · Motor de Gamificación Adaptativa
          </span>
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors ml-auto"
          >
            Finalizar Simulación
          </button>
        </div>

      </div>
    </div>
  );
}
