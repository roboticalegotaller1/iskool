"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CanvasActivityJSON, ISKOOL_TEMPLATES } from '@/types';
import { 
  Sparkles, Trophy, Coins, Flame, Heart, RefreshCw, 
  ArrowRight, CheckCircle2, XCircle, Clock, Volume2, 
  VolumeX, HelpCircle, KeyRound, ListOrdered, Link2, 
  Disc, Zap, Search, Grid3X3, MapPin, Compass, FolderKanban,
  RotateCcw, Play, Check
} from 'lucide-react';

interface InteractiveUniversalGamePlayerProps {
  activity: CanvasActivityJSON & {
    content?: {
      questions?: {
        question: string;
        options: string[];
        correctIndex?: number;
        explanation?: string;
      }[];
    };
    gamificationSettings?: {
      lives?: number;
      timePerQuestion?: number;
    };
  };
  templateType: string;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const InteractiveUniversalGamePlayer: React.FC<InteractiveUniversalGamePlayerProps> = ({
  activity,
  templateType,
  onClose,
  onComplete
}) => {
  const templateDef = ISKOOL_TEMPLATES.find(t => t.id === templateType) || {
    name: 'Reto Pedagógico',
    iconName: 'Sparkles',
    description: 'Actividad interactiva formativa.'
  };

  const questions = (activity.questions || activity.content?.questions || []) as {
    question: string;
    options: string[];
    correctIndex?: number;
    explanation?: string;
  }[];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(activity.gamificationSettings?.lives || 3);
  const [timeLeft, setTimeLeft] = useState<number>(activity.gamificationSettings?.timePerQuestion || 30);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [unlockedDoors, setUnlockedDoors] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [classifiedItems, setClassifiedItems] = useState<Record<number, string>>({});

  // Opciones revueltas dinámicamente para desafiar al alumno
  const shuffledOptionsData = useMemo(() => {
    const rawQ = questions[currentIdx];
    if (!rawQ || !rawQ.options || rawQ.options.length <= 1) {
      return { options: rawQ?.options || [], correctIndex: rawQ?.correctIndex ?? 0 };
    }
    
    const mapped = rawQ.options.map((opt: string, i: number) => ({
      text: opt,
      isCorrect: i === (rawQ.correctIndex ?? 0)
    }));
    
    const shuffled = [...mapped];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const newCorrectIndex = shuffled.findIndex(o => o.isCorrect);
    return {
      options: shuffled.map(o => o.text),
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
    };
  }, [currentIdx, questions]);

  const currentQ = useMemo(() => {
    const rawQ = questions[currentIdx] || {
      question: 'Pregunta pedagógica',
      options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correctIndex: 0
    };
    return {
      ...rawQ,
      options: shuffledOptionsData.options.length > 0 ? shuffledOptionsData.options : rawQ.options,
      correctIndex: shuffledOptionsData.options.length > 0 ? shuffledOptionsData.correctIndex : rawQ.correctIndex
    };
  }, [currentIdx, questions, shuffledOptionsData]);

  // Web Audio Synthesizer
  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'spin' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const oscN = ctx.createOscillator();
          const gainN = ctx.createGain();
          oscN.connect(gainN);
          gainN.connect(ctx.destination);
          oscN.frequency.setValueAtTime(freq, now + i * 0.1);
          gainN.gain.setValueAtTime(0.1, now + i * 0.1);
          gainN.gain.linearRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
          oscN.start(now + i * 0.1);
          oscN.stop(now + i * 0.1 + 0.15);
        });
      } else if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.4);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio Context not allowed:', e);
    }
  };

  // Temporizador por pregunta
  useEffect(() => {
    if (isAnswered || isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswered, isFinished, timeLeft]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    playSound('wrong');
    setStreak(0);
    setLives(prev => Math.max(0, prev - 1));
  };

  // Girar Ruleta
  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    playSound('spin');
    const randomTurns = 1440 + Math.floor(Math.random() * 360);
    setWheelAngle(prev => prev + randomTurns);
    setTimeout(() => {
      setSpinning(false);
    }, 1500);
  };

  // Selección de Respuesta
  const handleSelectOption = (idx: number) => {
    if (isAnswered || isFinished) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      playSound('correct');
      const comboBonus = (streak + 1) * 15;
      const points = 100 + comboBonus;
      setScore((prev: number) => prev + points);
      setStreak((prev: number) => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
      if (templateType === 'escape_room') {
        setUnlockedDoors((prev: number[]) => [...prev, currentIdx]);
      }
      if (templateType === 'match') {
        setMatchedPairs((prev: number[]) => [...prev, currentIdx]);
      }
    } else {
      playSound('wrong');
      setStreak(0);
      setLives((prev: number) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setTimeout(() => setIsFinished(true), 1200);
        }
        return Math.max(0, nextLives);
      });
    }
  };

  // Siguiente Reactivo
  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev: number) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setTimeLeft(25);
    } else {
      setIsFinished(true);
      playSound('victory');
      if (onComplete) onComplete(score);
    }
  };

  // Reiniciar
  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setTimeLeft(25);
    setIsFinished(false);
    setUnlockedDoors([]);
    setMatchedPairs([]);
  };

  return (
    <div className="w-full space-y-5 text-white animate-fade-in select-none relative">
      
      {/* Background Neon Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      {/* Top Gamification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
            {templateDef.name}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Reactivo {currentIdx + 1} de {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Vidas / HP */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-600'}`}
              />
            ))}
          </div>

          {/* Racha Combo */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border transition-all ${
            streak > 1 ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-bounce' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Flame className={`w-3.5 h-3.5 ${streak > 1 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
            <span>Combo x{streak}</span>
          </div>

          {/* Puntuación XP */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1 rounded-full border border-slate-700 text-xs font-black text-yellow-300">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>{score} XP</span>
          </div>

          {/* Temporizador */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            timeLeft <= 5 ? 'bg-rose-950 text-rose-400 animate-ping' : 'bg-slate-800 text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{timeLeft}s</span>
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Pantalla Final de Victoria / Fin del Juego */}
      {isFinished ? (
        <div className="text-center py-8 space-y-6 relative z-10 animate-scale-up">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <Trophy className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              ¡DESAFÍO COMPLETADO!
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {lives > 0 ? '¡Gran Trabajo, Héroe Insurgente!' : '¡Buen Intento! Sigue Entrenando'}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Has demostrado tus conocimientos en esta actividad interactiva de <span className="text-yellow-300 font-bold">{templateDef.name}</span>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Puntaje Total</span>
              <p className="text-xl font-black text-yellow-400">{score} XP</p>
            </div>
            <div className="text-center border-x border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Racha Máxima</span>
              <p className="text-xl font-black text-amber-400">x{maxStreak}</p>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vidas Restantes</span>
              <p className="text-xl font-black text-rose-400">{lives}/3</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              aria-label="Reiniciar actividad"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de Nuevo</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar reproductor"
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ÁREA DE JUEGO DINÁMICA POR MECÁNICA */
        <div className="space-y-6 relative z-10">
          
          {/* Mecánica Especial: Ruleta Giratoria */}
          {templateType === 'ruleta' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div 
                className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center bg-gradient-to-tr from-purple-600 via-rose-600 to-amber-500 transition-transform duration-1000 ease-out cursor-pointer hover:scale-105"
                style={{ transform: `rotate(${wheelAngle}deg)` }}
                onClick={spinWheel}
                title="Haz clic para girar la ruleta mágica"
              >
                <Disc className="w-12 h-12 text-white" />
              </div>
              <button
                type="button"
                onClick={spinWheel}
                disabled={spinning}
                aria-label="Girar ruleta mágica"
                className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 transition-all cursor-pointer"
              >
                {spinning ? '¡Girando la Ruleta...' : '🎲 ¡Girar Ruleta!'}
              </button>
            </div>
          )}

          {/* Mecánica Especial: Escape Room (Candados) */}
          {templateType === 'escape_room' && (
            <div className="flex items-center justify-center gap-3 py-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-yellow-400" />
                Puertas de Escape:
              </span>
              <div className="flex gap-2">
                {questions.map((_: unknown, i: number) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                      unlockedDoors.includes(i)
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : i === currentIdx
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {unlockedDoors.includes(i) ? '🔓' : '🔒'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Título de la Pregunta / Acertijo */}
          <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-inner space-y-2">
            <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider">
              {templateDef.name} • Reactivo #{currentIdx + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Grid de Opciones de Respuesta */}
          <div className={`grid gap-3 ${templateType === 'tf_explosivo' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {currentQ.options.map((opt: string, oIdx: number) => {
              const isCorrect = oIdx === currentQ.correctIndex;
              const isSelected = selectedOpt === oIdx;

              let btnClass = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/20';
                } else {
                  btnClass = 'bg-slate-850/40 border-slate-800 text-slate-500 opacity-40';
                }
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isAnswered}
                  aria-label={`Opción ${String.fromCharCode(65 + oIdx)}: ${opt}`}
                  className={`p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${btnClass} ${
                    !isAnswered ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900/80 text-slate-400 font-mono text-xs flex items-center justify-center group-hover:text-yellow-400 transition-colors">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explicación pedagógica y Botón Siguiente */}
          {isAnswered && (
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 animate-fade-in">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Retroalimentación Formativa</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentQ.explanation || (selectedOpt === currentQ.correctIndex ? '¡Excelente deducción histórica!' : 'Recuerda repasar los hechos fundamentales de la Independencia.')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Avanzar al siguiente reactivo"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-105 cursor-pointer shrink-0"
              >
                <span>{currentIdx + 1 < questions.length ? 'Siguiente Reactivo' : 'Ver Resultados'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
