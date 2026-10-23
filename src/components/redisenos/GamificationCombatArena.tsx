// src/components/redisenos/GamificationCombatArena.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Swords, Shield, Zap, Sparkles, Trophy, Heart, Flame, RefreshCw } from 'lucide-react';
import { BOSS_ENEMIES, BossEnemy, INTERACTIVE_TASKS, StudentProfile } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onVictory: (coinsWon: number, xpWon: number) => void;
}

export function GamificationCombatArena({ isOpen, onClose, student, onVictory }: Props) {
  const [selectedEnemy, setSelectedEnemy] = useState<BossEnemy>(BOSS_ENEMIES[0]);
  const [enemyHp, setEnemyHp] = useState(BOSS_ENEMIES[0].maxHp);
  const [studentHp, setStudentHp] = useState(100);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [floatingDamage, setFloatingDamage] = useState<{ text: string; isEnemy: boolean; key: number } | null>(null);
  const [battleState, setBattleState] = useState<'fighting' | 'victory' | 'defeat'>('fighting');
  const [hint, setHint] = useState<string | null>(null);

  const currentTask = INTERACTIVE_TASKS[currentTaskIndex % INTERACTIVE_TASKS.length];

  useEffect(() => {
    if (isOpen) {
      resetBattle(selectedEnemy);
    }
  }, [isOpen]);

  const resetBattle = (enemy: BossEnemy) => {
    setSelectedEnemy(enemy);
    setEnemyHp(enemy.maxHp);
    setStudentHp(100);
    setComboMultiplier(1);
    setBattleState('fighting');
    setFloatingDamage(null);
    setHint(null);
  };

  if (!isOpen) return null;

  const handleAnswer = (isCorrect: boolean) => {
    if (battleState !== 'fighting') return;

    if (isCorrect) {
      gamificationAudio.playMagicCastSound();
      const damage = Math.round(25 * comboMultiplier);
      const newEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(newEnemyHp);
      setComboMultiplier(prev => Math.min(5, prev + 1));
      setHint(null);

      // Sonido de golpe
      setTimeout(() => {
        gamificationAudio.playEnemyHitSound();
      }, 100);

      // Mostrar daño flotante
      setFloatingDamage({ text: `-${damage} HP! ¡Impacto Crítico!`, isEnemy: true, key: Date.now() });

      if (newEnemyHp <= 0) {
        setBattleState('victory');
        gamificationAudio.playLevelUpSound();
        onVictory(selectedEnemy.rewardCoins, 150);
      } else {
        // Pasar a la siguiente pregunta
        setTimeout(() => {
          setCurrentTaskIndex(prev => prev + 1);
        }, 1200);
      }
    } else {
      gamificationAudio.playErrorSound();
      setComboMultiplier(1);
      const newStudentHp = Math.max(10, studentHp - 15);
      setStudentHp(newStudentHp);
      setHint(`Pista Pedagógica: Revisa con atención el reactivo de ${currentTask.subject}. ¡Vuelve a intentarlo!`);

      setFloatingDamage({ text: `-15 HP`, isEnemy: false, key: Date.now() });

      if (newStudentHp <= 10) {
        // En ISkool nunca muere el alumno; entra en modo recuperación
        setHint('¡El mentor histórico interviene para protegerte! Respira hondo y selecciona la respuesta correcta.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header de Combate */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Arena de Desafíos & Jefes Curriculares
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  {selectedEnemy.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Resuelve preguntas oficiales para lanzar hechizos y habilidades de conocimiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Jefe */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
              {BOSS_ENEMIES.map(boss => (
                <button
                  key={boss.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    resetBattle(boss);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedEnemy.id === boss.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {boss.id === 'boss-golem' ? 'Golem del Bosque' : 'Dragón Ciber-Glitch'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport del Campo de Batalla */}
        <div className="relative h-64 md:h-72 w-full overflow-hidden bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 flex items-center justify-between px-8 border-b border-slate-800">
          
          {/* Fondo con imagen del enemigo o tema */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${selectedEnemy.image})` }}
          />

          {/* Lado Izquierdo: Alumno */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl border-2 border-purple-500/80 shadow-lg shadow-purple-500/20 overflow-hidden bg-slate-900">
              <img 
                src={student.avatarImage} 
                alt={student.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-white block">{student.name}</span>
              <span className="text-[10px] text-purple-300 font-medium">{student.levelTitle}</span>
            </div>

            {/* Barra de Vida del Alumno */}
            <div className="w-32 mt-2">
              <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                <span className="flex items-center gap-1 font-semibold text-rose-400"><Heart className="w-3 h-3 fill-rose-500" /> HP</span>
                <span className="font-bold">{studentHp}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${studentHp}%` }}
                />
              </div>
            </div>

            {/* Multiplicador de Racha */}
            {comboMultiplier > 1 && (
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold flex items-center gap-1 animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                x{comboMultiplier} ¡Racha Sabia!
              </div>
            )}
          </div>

          {/* Centro: Versus y Daño Flotante */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {floatingDamage && (
              <div className={`text-base font-black px-3 py-1 rounded-xl shadow-xl animate-fade-in ${
                floatingDamage.isEnemy 
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' 
                  : 'bg-rose-600 text-white ring-2 ring-rose-400'
              }`}>
                {floatingDamage.text}
              </div>
            )}

            {battleState === 'victory' && (
              <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-center animate-in zoom-in-95">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-1 animate-pulse" />
                <h3 className="text-lg font-black text-emerald-300">¡VICTORIA DIDÁCTICA!</h3>
                <p className="text-xs text-slate-300">Has derrotado al jefe del saber</p>
                <div className="mt-2 text-xs font-bold text-amber-300">
                  + {selectedEnemy.rewardCoins} Monedas ISkool · +150 XP
                </div>
                <button
                  onClick={() => resetBattle(selectedEnemy)}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Jugar Otra Batalla
                </button>
              </div>
            )}
          </div>

          {/* Lado Derecho: Jefe Enemigo */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl border-2 border-rose-500/80 shadow-lg shadow-rose-500/30 overflow-hidden bg-slate-900">
              <img 
                src={selectedEnemy.image} 
                alt={selectedEnemy.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-white block">{selectedEnemy.name}</span>
              <span className="text-[10px] text-rose-300 font-medium">{selectedEnemy.affinity}</span>
            </div>

            {/* Barra de Vida del Jefe */}
            <div className="w-36 mt-2">
              <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                <span className="font-semibold text-rose-400">Jefe HP</span>
                <span className="font-bold">{enemyHp}/{selectedEnemy.maxHp}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-300"
                  style={{ width: `${(enemyHp / selectedEnemy.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-[9px] text-slate-400 mt-1">Débil ante: {selectedEnemy.weakness}</span>
          </div>

        </div>

        {/* Sección Inferior: Pregunta Curricular y Opciones */}
        <div className="p-6 bg-slate-900/90 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {currentTask.subject} · {currentTask.gradeLevel}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {currentTask.pdaCode}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-white mb-4">
              {currentTask.question}
            </h3>

            {hint && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                {hint}
              </div>
            )}

            {/* Botones de Opción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTask.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.isCorrect)}
                  disabled={battleState !== 'fighting'}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-purple-950/50 border border-slate-700 hover:border-purple-500 text-left text-xs md:text-sm font-semibold text-slate-100 hover:text-white transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <span>{opt.label}</span>
                  <Zap className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 mt-4">
            <span>Colegio Montessori del Valle · Motor de Combate Didáctico Seguro</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resetBattle(selectedEnemy)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reiniciar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
