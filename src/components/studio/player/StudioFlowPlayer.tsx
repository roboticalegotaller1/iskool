"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioBlock, ActivityBuilderMetadata, FlowConnection } from '@/types/studioBlocks';
import { LogicMathInteractivePlayer } from './LogicMathInteractivePlayer';
import { LogicActivityPreset } from '@/data/mathematicalLogicActivities';
import { 
  Sparkles, 
  Trophy, 
  Coins, 
  Flame, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  BookOpen, 
  Swords, 
  Video, 
  Globe, 
  Gamepad2, 
  Gift, 
  ExternalLink, 
  Play, 
  RotateCcw,
  Shield,
  Zap,
  Check,
  Link2,
  ListOrdered,
  FileEdit,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Award,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Star,
  GitBranch,
  Music,
  Flag,
  FileText,
  Gauge,
  Target,
  Shuffle
} from 'lucide-react';

interface Props {
  blocks: StudioBlock[];
  connections?: FlowConnection[];
  startNodeId?: string | null;
  metadata: ActivityBuilderMetadata;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

// Extraer ID y tiempo de inicio de YouTube de forma robusta
export function getYouTubeEmbedUrl(url: string, startAtSeconds?: number): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (!match || match[2].length !== 11) return null;
  const videoId = match[2];

  let start = startAtSeconds || 0;
  const tMatch = url.match(/[?&]t=(\d+)s?/);
  if (tMatch && tMatch[1]) {
    start = parseInt(tMatch[1], 10);
  }

  const queryParams = new URLSearchParams();
  queryParams.set('rel', '0');
  queryParams.set('modestbranding', '1');
  if (start > 0) {
    queryParams.set('start', String(start));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${queryParams.toString()}`;
}

export const StudioFlowPlayer: React.FC<Props> = ({
  blocks,
  connections = [],
  startNodeId,
  metadata,
  onClose,
  onComplete
}) => {
  // Determinar nodo inicial del grafo
  const initialNodeId = startNodeId || blocks.find(b => b.isStartNode)?.id || blocks[0]?.id || null;
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(initialNodeId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [accumulatedXp, setAccumulatedXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados de Pregunta (Quiz)
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

  // Estados de Combate contra Boss
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [isBossDefeated, setIsBossDefeated] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Estados de Recompensa
  const [isChestOpened, setIsChestOpened] = useState(false);

  // Estados de Emparejamiento (Drag & Drop Match)
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<number, number>>({});
  const [shuffleKey, setShuffleKey] = useState<number>(0);
  const [failedMatchFeedback, setFailedMatchFeedback] = useState<{ left?: number; right?: number } | null>(null);

  // Estados de Ordenamiento (Secuencia Cronológica)
  const [orderedList, setOrderedList] = useState<string[]>([]);
  const [isSequenceChecked, setIsSequenceChecked] = useState(false);
  const [isSequenceCorrect, setIsSequenceCorrect] = useState(false);

  // Estados de Completar Espacios
  const [userFilledWords, setUserFilledWords] = useState<string[]>([]);

  // Estados de Pregunta Abierta IA
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Estados de Código Secreto / Escape Room
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Estados de Checkpoint
  const [confidenceRating, setConfidenceRating] = useState<number>(5);

  // Estados de Minijuego Ruleta
  const [spinning, setSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  // Estados de Lectura Cronometrada (PPM)
  const [readingPhase, setReadingPhase] = useState<'reading' | 'questions' | 'results'>('reading');
  const [readingSecondsLeft, setReadingSecondsLeft] = useState<number>(60);
  const [readingTimeTaken, setReadingTimeTaken] = useState<number>(0);
  const [readingSelectedAnswers, setReadingSelectedAnswers] = useState<Record<string, number>>({});
  const [readingResults, setReadingResults] = useState<{ score: number; ppm: number; xp: number; coins: number; feedback: string } | null>(null);

  const activeBlock: StudioBlock | undefined = 
    (currentNodeId ? blocks.find(b => b.id === currentNodeId) : undefined) || 
    blocks[currentStepIndex] || 
    blocks[0];

  // Cálculo sincrónico garantizado de pares revueltos para Drag & Drop Match
  const pairsJson = activeBlock?.type === 'drag_drop_match' ? JSON.stringify(activeBlock.data.pairs) : '';
  const shuffledRightPairs = useMemo<{ originalIndex: number; rightText: string }[]>(() => {
    if (!activeBlock || activeBlock.type !== 'drag_drop_match') return [];
    const pairs = activeBlock.data.pairs || [];
    if (pairs.length === 0) return [];

    const mapped = pairs.map((p, idx) => ({
      originalIndex: idx,
      rightText: p.right
    }));

    if (mapped.length <= 1) return mapped;

    // Barajado Fisher-Yates
    const shuffled = [...mapped];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Si por coincidencia aleatoria todos coinciden 1:1 con el orden original,
    // desplazamos 1 posición cíclicamente para garantizar dificultad pedagógica real.
    const isIdentical = shuffled.every((item, idx) => item.originalIndex === idx);
    if (isIdentical && shuffled.length > 1) {
      const first = shuffled.shift()!;
      shuffled.push(first);
    }

    return shuffled;
  }, [activeBlock?.id, activeBlock?.type, pairsJson, shuffleKey]);

  // Sintetizador Web Audio
  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'attack' | 'chest' | 'match' | 'fanfare') => {
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

      if (type === 'correct' || type === 'match') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'attack') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'chest' || type === 'victory' || type === 'fanfare') {
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
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  };

  // Inicializar estado al cambiar de bloque
  useEffect(() => {
    setSelectedOption(null);
    setIsQuestionAnswered(false);
    setIsChestOpened(false);
    setSelectedLeftIndex(null);
    setMatchedPairs({});
    setIsSequenceChecked(false);
    setIsSequenceCorrect(false);
    setUserFilledWords([]);
    setOpenAnswerText('');
    setIsAiEvaluating(false);
    setAiFeedback(null);
    setSecretCodeInput('');
    setIsSecretUnlocked(false);
    setShowHint(false);
    setSelectedPrize(null);
    setReadingPhase('reading');
    setReadingSelectedAnswers({});
    setReadingResults(null);

    if (activeBlock) {
      if (activeBlock.type === 'timed_reading_block') {
        const limit = activeBlock.data.timeLimitSeconds || 60;
        setReadingSecondsLeft(limit);
        setReadingTimeTaken(0);
      } else if (activeBlock.type === 'boss_enemy') {
        const max = activeBlock.data.maxHp || 100;
        setBossHp(max);
        setBossMaxHp(max);
        setIsBossDefeated(false);
        setBattleLog([`⚔️ ¡Un ${activeBlock.data.bossName} ha aparecido para desafiarte!`]);
      } else if (activeBlock.type === 'drag_drop_match') {
        setSelectedLeftIndex(null);
        setMatchedPairs({});
        setFailedMatchFeedback(null);
      } else if (activeBlock.type === 'ordering_sequence') {
        const shuffled = [...activeBlock.data.stepsInCorrectOrder].sort(() => Math.random() - 0.5);
        setOrderedList(shuffled);
      } else if (activeBlock.type === 'audio_sfx') {
        playSound('fanfare');
      }
    }
  }, [currentNodeId, currentStepIndex, activeBlock]);

  // Cronómetro regresivo para lectura cronometrada
  useEffect(() => {
    if (!activeBlock || activeBlock.type !== 'timed_reading_block' || readingPhase !== 'reading') {
      return;
    }

    const interval = setInterval(() => {
      setReadingSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setReadingPhase('questions');
          playSound('fanfare');
          return 0;
        }
        return prev - 1;
      });
      setReadingTimeTaken(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBlock, readingPhase]);

  // Avanzar al siguiente bloque siguiendo el flujo del grafo
  const handleNextStep = (earnedXp: number = 0) => {
    const totalXp = accumulatedXp + earnedXp;
    setAccumulatedXp(totalXp);

    // Si existen conexiones en el grafo, seguir la flecha correspondiente
    if (connections.length > 0 && activeBlock) {
      const outgoing = connections.filter(c => c.sourceNodeId === activeBlock.id);

      if (outgoing.length > 0) {
        // Enlazar al nodo objetivo de la flecha
        const nextNodeId = outgoing[0].targetNodeId;
        setCurrentNodeId(nextNodeId);
        setCurrentStepIndex(prev => prev + 1);
        return;
      } else {
        // No tiene conexión saliente: es un nodo final del juego
        setIsFinished(true);
        playSound('victory');
        if (onComplete) onComplete(totalXp);
        return;
      }
    }

    // Fallback para recorrido lineal
    if (currentStepIndex + 1 < blocks.length) {
      const nextBlock = blocks[currentStepIndex + 1];
      setCurrentNodeId(nextBlock.id);
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      playSound('victory');
      if (onComplete) onComplete(totalXp);
    }
  };

  // Manejar respuesta de pregunta
  const handleAnswerQuestion = (index: number) => {
    if (isQuestionAnswered || !activeBlock || activeBlock.type !== 'quiz_question') return;
    setSelectedOption(index);
    setIsQuestionAnswered(true);

    const isCorrect = index === activeBlock.data.correctIndex;
    if (isCorrect) {
      playSound('correct');
      setStreak(prev => prev + 1);
      setAccumulatedXp(prev => prev + 30 + (streak > 0 ? 15 : 0));
    } else {
      playSound('wrong');
      setStreak(0);
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  // Manejar emparejamiento (Drag & Drop Match) con aleatorización de respuestas
  const handleMatchClick = (side: 'left' | 'right', itemOriginalIndex: number) => {
    if (!activeBlock || activeBlock.type !== 'drag_drop_match') return;

    if (side === 'left') {
      if (matchedPairs[itemOriginalIndex] !== undefined) return;
      setSelectedLeftIndex(itemOriginalIndex);
      setFailedMatchFeedback(null);
    } else if (side === 'right' && selectedLeftIndex !== null) {
      if (Object.values(matchedPairs).includes(itemOriginalIndex)) return;

      const isCorrectMatch = selectedLeftIndex === itemOriginalIndex;
      if (isCorrectMatch) {
        playSound('match');
        const newMatched = { ...matchedPairs, [selectedLeftIndex]: itemOriginalIndex };
        setMatchedPairs(newMatched);
        setSelectedLeftIndex(null);
        setFailedMatchFeedback(null);
        setAccumulatedXp(prev => prev + 15);
        setStreak(prev => prev + 1);
      } else {
        playSound('wrong');
        setFailedMatchFeedback({ left: selectedLeftIndex, right: itemOriginalIndex });
        setStreak(0);
        setTimeout(() => {
          setSelectedLeftIndex(null);
          setFailedMatchFeedback(null);
        }, 750);
      }
    }
  };

  const handleReshuffleMatchPairs = () => {
    if (!activeBlock || activeBlock.type !== 'drag_drop_match') return;
    playSound('match');
    setShuffleKey(prev => prev + 1);
    setSelectedLeftIndex(null);
    setFailedMatchFeedback(null);
  };

  // Manejar ordenamiento de secuencia
  const handleMoveSequenceItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedList.length) return;
    const updated = [...orderedList];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setOrderedList(updated);
  };

  const handleVerifySequence = () => {
    if (!activeBlock || activeBlock.type !== 'ordering_sequence') return;
    const isExact = orderedList.every((item, idx) => item === activeBlock.data.stepsInCorrectOrder[idx]);
    setIsSequenceChecked(true);
    setIsSequenceCorrect(isExact);
    if (isExact) {
      playSound('correct');
      setAccumulatedXp(prev => prev + 35);
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  // Manejar análisis reflexivo de IA
  const handleEvaluateAiReflection = () => {
    if (!openAnswerText.trim() || !activeBlock || activeBlock.type !== 'open_poll_wordcloud') return;
    setIsAiEvaluating(true);
    setTimeout(() => {
      setIsAiEvaluating(false);
      playSound('correct');
      setAiFeedback(
        `🌟 ¡Excelente reflexión pedagógica! Has articulado de forma clara la importancia de las fuerzas y el movimiento en el entorno cotidiano.`
      );
      setAccumulatedXp(prev => prev + 40);
    }, 1000);
  };

  // Manejar desbloqueo de código secreto
  const handleVerifySecretCode = () => {
    if (!activeBlock || activeBlock.type !== 'secret_code_puzzle') return;
    const cleanInput = secretCodeInput.trim().toUpperCase();
    const cleanAnswer = activeBlock.data.secretAnswer.trim().toUpperCase();

    if (cleanInput === cleanAnswer) {
      playSound('victory');
      setIsSecretUnlocked(true);
      setAccumulatedXp(prev => prev + 50);
      setCoins(prev => prev + 20);
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  // Manejar ataque al Boss
  const handleAttackBoss = (attackType: 'crit' | 'magic' | 'potion') => {
    if (isBossDefeated || !activeBlock || activeBlock.type !== 'boss_enemy') return;

    playSound('attack');
    let damage = 35;
    let logMsg = '';

    if (attackType === 'crit') {
      damage = Math.floor(Math.random() * 20) + 35;
      logMsg = `💥 ¡Ataque Crítico de Sabiduría! Causaste ${damage} de daño.`;
    } else if (attackType === 'magic') {
      damage = 45;
      logMsg = `✨ ¡Hechizo Didáctico! Impacto directo de ${damage} puntos de daño.`;
    } else {
      damage = 25;
      setLives(prev => Math.min(3, prev + 1));
      logMsg = `🧪 ¡Poción de Enfoque! Curaste 1 vida y causaste ${damage} de daño.`;
    }

    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);
    setBattleLog(prev => [logMsg, ...prev.slice(0, 3)]);

    if (nextHp <= 0) {
      setIsBossDefeated(true);
      playSound('victory');
      setBattleLog(prev => [`🏆 ¡Has derrotado al ${activeBlock.data.bossName}!`, ...prev]);
    }
  };

  // Si no hay bloques
  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200">
          No hay bloques para reproducir
        </h3>
        <p className="text-xs text-slate-500">
          Añade al menos un bloque didáctico al espacio de trabajo antes de probar.
        </p>
      </div>
    );
  }

  // Pantalla de Victoria / Finalización
  if (isFinished) {
    return (
      <div className="p-6 sm:p-10 text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/25 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
            ¡MISIÓN LMS COMPLETADA CON ÉXITO!
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {metadata.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Has experimentado las mecánicas pedagógicas e interactivas tal como las vivirán tus alumnos.
          </p>
        </div>

        {/* Resumen de Recompensas */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
          <div className="text-center">
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              +{accumulatedXp}
            </span>
            <p className="text-[9px] font-bold uppercase text-slate-400">XP Ganada</p>
          </div>
          <div className="text-center">
            <span className="text-xs font-black text-amber-500">
              +{coins}
            </span>
            <p className="text-[9px] font-bold uppercase text-slate-400">Monedas</p>
          </div>
          <div className="text-center">
            <span className="text-xs font-black text-rose-500">
              {lives}/3
            </span>
            <p className="text-[9px] font-bold uppercase text-slate-400">Vidas</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setCurrentStepIndex(0);
              setAccumulatedXp(0);
              setCoins(0);
              setStreak(0);
              setLives(3);
              setIsFinished(false);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Misión</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Finalizar y Volver al Estudio</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStepIndex) / blocks.length) * 100);

  return (
    <div className="space-y-5 select-none">
      {/* Barra Superior del Simulador: Progreso + XP + Vidas */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
        {/* Progreso */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 shrink-0">
            Paso {currentStepIndex + 1}/{blocks.length}
          </span>
          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Métricas en Vivo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{accumulatedXp} XP</span>
          </div>

          <div className="flex items-center gap-0.5">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-3.5 h-3.5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-zinc-600'}`} 
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Renderizado Polimórfico del Bloque Activo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBlock?.id || currentStepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* ================= 0. RETOS DE LÓGICA MATEMÁTICA & ALGORITMIA ================= */}
          {(activeBlock?.type === 'logic_challenge_interactive' || 
            activeBlock?.type === 'boolean_circuit_builder' || 
            activeBlock?.type === 'graph_network_path' || 
            activeBlock?.type === 'turing_step_simulator' || 
            activeBlock?.type === 'constraint_scheduler') && (() => {
            const bData = (activeBlock as any).data || {};
            const preset: LogicActivityPreset = {
              id: activeBlock.id,
              templateType: 'logic_math',
              title: activeBlock.title || 'Reto de Lógica Matemática',
              level: 'primaria_media',
              faseNem: 'Fase 4',
              levelLabel: 'Lógica & Algoritmia',
              targetAge: metadata.targetAge || 'Educación Básica',
              description: bData.problemQuestion || bData.instructions || bData.storyPrompt || bData.scenarioDescription || 'Resuelve el desafío aplicando pensamiento computacional.',
              problemLore: bData.storyText || bData.storyPrompt || bData.scenarioDescription || bData.instructions || 'Analiza el escenario lógico.',
              pdaNem: metadata.pdaNem || 'Desarrolla habilidades de pensamiento lógico y algorítmico.',
              campoFormativo: metadata.campoFormativo || 'Saberes y Pensamiento Científico',
              badgeReward: { name: 'Pensador Algorítmico', icon: '🧠', description: '¡Reto de lógica superado!' },
              gamificationSettings: {
                timeLimitSeconds: bData.timeLimitSeconds || 60,
                lives: 3,
                streakMultiplier: true,
                passScorePercentage: 75,
                xpBaseReward: 150,
                coinsReward: 30
              },
              logicType: bData.logicCategory || 'conditions',
              simulationConfig: {
                engine: bData.interactiveEngine || (activeBlock.type === 'boolean_circuit_builder' ? 'circuit_gates' : activeBlock.type === 'graph_network_path' ? 'graph_explorer' : activeBlock.type === 'turing_step_simulator' ? 'step_automaton' : 'grid_selector'),
                initialState: bData.initialTape ? { tape: bData.initialTape } : bData.nodes ? { nodes: bData.nodes } : {},
                targetState: bData.targetGoalDescription ? { target: bData.targetGoalDescription } : {},
                options: bData.options || [
                  { id: 'opt-1', label: 'Solución correcta demostrada', isCorrect: true, icon: '✅', detail: 'Satisface todas las reglas del problema' },
                  { id: 'opt-2', label: 'Configuración alternativa no viable', isCorrect: false, icon: '❌', detail: 'Rompe una condición previa' }
                ]
              },
              pedagogicalExplanation: bData.pedagogicalExplanation || 'Las computadoras evalúan reglas y patrones para resolver problemas eficientemente.',
              classroomActivity: bData.classroomActivity || 'Modela este problema en el pizarrón o con tarjetas físicas.',
              hints: bData.hints || ['Examina cada regla con calma antes de decidir.', 'Prueba descartar las opciones imposibles.']
            };

            return (
              <div className="space-y-4">
                <LogicMathInteractivePlayer
                  activity={preset}
                  onComplete={(score) => {
                    handleNextStep(score > 0 ? 150 : 0);
                  }}
                  onClose={() => {
                    handleNextStep(100);
                  }}
                />
              </div>
            );
          })()}

          {/* ================= 0.1 LECTURA CRONOMETRADA & COMPRENSIÓN (PPM) ================= */}
          {activeBlock?.type === 'timed_reading_block' && (() => {
            const { readingText = '', timeLimitSeconds = 60, comprehensionQuestions = [], wordCount = 0 } = activeBlock.data;
            const actualWords = wordCount || (readingText.trim() ? readingText.trim().split(/\s+/).length : 0);

            // Manejar finalización de la lectura
            const handleFinishReading = () => {
              setReadingPhase('questions');
              playSound('correct');
            };

            // Manejar selección de respuesta
            const handleSelectQuestionOption = (qId: string, optIdx: number) => {
              setReadingSelectedAnswers(prev => ({
                ...prev,
                [qId]: optIdx
              }));
            };

            // Evaluar respuestas de comprensión
            const handleEvaluateReading = () => {
              let correctCount = 0;
              comprehensionQuestions.forEach(q => {
                if (readingSelectedAnswers[q.id] === q.correctIndex) {
                  correctCount++;
                }
              });

              const totalQuestions = comprehensionQuestions.length || 1;
              const scorePercent = Math.round((correctCount / totalQuestions) * 100);
              
              const minutes = Math.max(0.1, (readingTimeTaken || 15) / 60);
              const calculatedPpm = Math.round(actualWords / minutes);

              // Cálculo de XP y Monedas
              const baseXp = 60;
              let speedBonusXp = 0;
              let speedBonusCoins = 0;

              if (calculatedPpm >= 200) {
                speedBonusXp = 40;
                speedBonusCoins = 15;
              } else if (calculatedPpm >= 140) {
                speedBonusXp = 25;
                speedBonusCoins = 10;
              } else if (calculatedPpm >= 90) {
                speedBonusXp = 15;
                speedBonusCoins = 5;
              }

              const earnedXp = Math.round((baseXp * (scorePercent / 100)) + speedBonusXp);
              const earnedCoins = Math.round((15 * (scorePercent / 100)) + speedBonusCoins);

              let feedbackMsg = `¡Lectura completada a ${calculatedPpm} PPM con ${scorePercent}% de comprensión!`;
              if (scorePercent === 100) {
                feedbackMsg += ' ¡Puntaje perfecto, has ganado el bono de Galeón!';
              }

              setReadingResults({
                score: scorePercent,
                ppm: calculatedPpm,
                xp: earnedXp,
                coins: earnedCoins,
                feedback: feedbackMsg
              });

              setReadingPhase('results');
              setCoins(prev => prev + earnedCoins);
              playSound(scorePercent >= 60 ? 'victory' : 'wrong');
            };

            return (
              <div className="space-y-4">
                {/* Cabecera del bloque */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        Comprensión Lectora & Fluidez (PPM)
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {activeBlock.title || 'Lectura Cronometrada'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 text-xs font-black text-blue-600 dark:text-blue-300 border border-blue-200/50 shadow-2xs flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {actualWords} palabras
                    </span>
                    {readingPhase === 'reading' && (
                      <span className={`px-2.5 py-1 rounded-xl text-white text-xs font-black flex items-center gap-1 shadow-md transition-all ${
                        readingSecondsLeft <= 10 
                          ? 'bg-rose-600 shadow-rose-500/30 animate-pulse' 
                          : readingSecondsLeft <= 25 
                          ? 'bg-amber-600 shadow-amber-500/25' 
                          : 'bg-purple-600 shadow-purple-500/20 animate-pulse'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {readingSecondsLeft}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Fase 1: Lectura del texto con Barra de Tiempo que se agota */}
                {readingPhase === 'reading' && (() => {
                  const timeLimit = timeLimitSeconds || 60;
                  const timePercent = Math.max(0, Math.min(100, (readingSecondsLeft / timeLimit) * 100));
                  const isLowTime = readingSecondsLeft <= 10 || timePercent <= 20;
                  const isMidTime = readingSecondsLeft <= 25 || timePercent <= 50;

                  return (
                    <div className="space-y-4">
                      {/* Barra de Tiempo Dinámica que se agota con el segundero */}
                      <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-750 shadow-inner">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className={`flex items-center gap-1.5 transition-colors ${
                            isLowTime 
                              ? 'text-rose-600 dark:text-rose-400 animate-pulse' 
                              : isMidTime
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}>
                            <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'animate-spin' : ''}`} />
                            <span>Tiempo Restante: <strong>{readingSecondsLeft}s</strong> / {timeLimit}s</span>
                          </span>
                          
                          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400">
                            {Math.round(timePercent)}% disponible
                          </span>
                        </div>

                        {/* Pista de la barra con resplandor */}
                        <div className="relative w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${
                              isLowTime
                                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                                : isMidTime
                                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500'
                                : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400'
                            }`}
                            style={{ width: `${timePercent}%` }}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/90 rounded-full blur-[1px] shadow-sm animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 shadow-sm space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-zinc-800 pb-2">
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <Gauge className="w-3.5 h-3.5" />
                            Lee con atención y concentración
                          </span>
                          <span>Tiempo límite: {timeLimitSeconds}s</span>
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed font-serif text-slate-800 dark:text-zinc-100 whitespace-pre-line">
                          {readingText}
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleFinishReading}
                          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Terminé de Leer! Ir a las Preguntas</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Fase 2: Preguntas de comprensión */}
                {readingPhase === 'questions' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 text-xs font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Responde las preguntas para evaluar tu nivel de comprensión lectora:</span>
                    </div>

                    <div className="space-y-3">
                      {comprehensionQuestions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 shadow-2xs space-y-2.5"
                        >
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center">
                              {qIdx + 1}
                            </span>
                            {q.question}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = readingSelectedAnswers[q.id] === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectQuestionOption(q.id, optIdx)}
                                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-500/20'
                                      : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-purple-300'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                    isSelected ? 'bg-white text-purple-700' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleEvaluateReading}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Validar Respuestas y Calcular Recompensas</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Fase 3: Resultados y Recompensas */}
                {readingPhase === 'results' && readingResults && (
                  <div className="p-6 text-center space-y-4 rounded-3xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 shadow-md animate-scale-in">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
                      <Trophy className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        ¡Módulo de Comprensión Concluido!
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
                        {readingResults.feedback}
                      </p>
                    </div>

                    {/* Métricas obtenidas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto pt-2">
                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Velocidad</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-300">{readingResults.ppm} PPM</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Comprensión</span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-300">{readingResults.score}%</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">XP Ganado</span>
                        <span className="text-base font-black text-purple-600 dark:text-purple-300">+{readingResults.xp} XP</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Galeones</span>
                        <span className="text-base font-black text-amber-500">+{readingResults.coins} 🪙</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleNextStep(readingResults.xp)}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        <span>Continuar Aventura (+{readingResults.xp} XP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ================= 1. VIDEO DE YOUTUBE ================= */}
          {activeBlock?.type === 'youtube_video' && (() => {
            const embedUrl = getYouTubeEmbedUrl(activeBlock.data.videoUrl, activeBlock.data.startAtSeconds);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                      Cápsula Audiovisual
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {activeBlock.data.videoTitle || activeBlock.title}
                    </h3>
                  </div>
                </div>

                {embedUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-750 bg-black shadow-lg">
                    <iframe
                      src={embedUrl}
                      title={activeBlock.data.videoTitle || 'Video Educativo'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
                    <p className="text-xs text-slate-500">Ingresa un enlace de YouTube válido en el editor para reproducirlo.</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep(25)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white font-black text-xs shadow-md shadow-red-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Completar Video y Continuar (+25 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ================= 2. SIMULADOR / RECURSO WEB ================= */}
          {activeBlock?.type === 'external_embed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">
                      Laboratorio / Simulador Interactivo
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {activeBlock.data.resourceTitle || activeBlock.title}
                    </h3>
                  </div>
                </div>

                {activeBlock.data.embedUrl && (
                  <a
                    href={activeBlock.data.embedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pestaña Externa</span>
                  </a>
                )}
              </div>

              {activeBlock.data.instructions && (
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-800 dark:text-cyan-200 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{activeBlock.data.instructions}</span>
                </div>
              )}

              {activeBlock.data.embedUrl ? (
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-950 shadow-md">
                  <iframe
                    src={activeBlock.data.embedUrl}
                    title={activeBlock.data.resourceTitle || 'Simulador Web'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
                  <p className="text-xs text-slate-500">Ingresa la URL del simulador PhET / GeoGebra en el editor para interactuar.</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(30)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 text-white font-black text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>Completar Simulación y Continuar (+30 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. EMPAREJAMIENTO (DRAG & DROP MATCH) CON RESPUESTAS REVUELTAS ================= */}
          {activeBlock?.type === 'drag_drop_match' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 inline-flex items-center gap-1">
                    <Shuffle className="w-3 h-3 text-violet-500" />
                    <span>Emparejamiento Aleatorizado</span>
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activeBlock.data.instructions}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Las definiciones han sido revueltas aleatoriamente. Haz clic en un concepto (izquierda) y luego en su definición correspondiente (derecha).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReshuffleMatchPairs}
                    title="Revolver aleatoriamente las opciones de la derecha"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-violet-500" />
                    <span>Revolver</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-zinc-850 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-750">
                    {Object.keys(matchedPairs).length} / {activeBlock.data.pairs.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Columna Izquierda: Conceptos */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Conceptos / Términos</span>
                  </h4>
                  {activeBlock.data.pairs.map((pair, idx) => {
                    const isMatched = matchedPairs[idx] !== undefined;
                    const isSelected = selectedLeftIndex === idx;
                    const isError = failedMatchFeedback?.left === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleMatchClick('left', idx)}
                        className={`w-full p-3.5 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isMatched 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 line-through opacity-85 shadow-sm' 
                            : isError
                            ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 animate-shake'
                            : isSelected
                            ? 'bg-violet-600 text-white border-violet-700 shadow-lg shadow-violet-500/30 scale-[1.02] ring-2 ring-violet-400'
                            : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 hover:border-violet-400 hover:bg-violet-50/40 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{pair.left}</span>
                        </span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Columna Derecha: Definiciones (Revueltas Aleatoriamente) */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Definiciones (Revueltas)</span>
                  </h4>
                  {shuffledRightPairs.map((item, shuffledIdx) => {
                    const isMatched = Object.values(matchedPairs).includes(item.originalIndex);
                    const isError = failedMatchFeedback?.right === item.originalIndex;

                    return (
                      <button
                        key={`${item.originalIndex}-${shuffledIdx}`}
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleMatchClick('right', item.originalIndex)}
                        className={`w-full p-3.5 rounded-2xl border text-left font-medium text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 line-through opacity-85 shadow-sm'
                            : isError
                            ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 animate-shake'
                            : selectedLeftIndex !== null
                            ? 'bg-white dark:bg-zinc-850 border-indigo-300 dark:border-indigo-700 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-zinc-800 hover:scale-[1.01]'
                            : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 hover:border-indigo-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + shuffledIdx)}
                          </span>
                          <span>{item.rightText}</span>
                        </span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {Object.keys(matchedPairs).length === activeBlock.data.pairs.length && (
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => handleNextStep(35)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>¡Todos Conectados con Éxito! Continuar (+35 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 4. ORDENAR SECUENCIA / CRONOLOGÍA ================= */}
          {activeBlock?.type === 'ordering_sequence' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Mecánica de Secuencia
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.data.instructions}
                </h3>
                <p className="text-xs text-slate-500">
                  Usa las flechas para mover los elementos al orden cronológico o procedimental correcto:
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {orderedList.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSequenceItem(idx, idx - 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedList.length - 1}
                        onClick={() => handleMoveSequenceItem(idx, idx + 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!isSequenceChecked ? (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleVerifySequence}
                    className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Comprobar Orden Secuencial</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    isSequenceCorrect 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300'
                  }`}>
                    {isSequenceCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{isSequenceCorrect ? '¡Secuencia ordenada a la perfección!' : 'El orden no es correcto, revisa la cronología de nuevo.'}</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleNextStep(isSequenceCorrect ? 35 : 10)}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Siguiente Etapa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. COMPLETAR ESPACIOS (FILL IN BLANKS) ================= */}
          {activeBlock?.type === 'fill_in_blanks' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  Completar Espacios
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.data.instructions}
                </h3>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
                {activeBlock.data.textWithBlanks.replace(/\[(.*?)\]/g, '_____')}
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-black text-slate-400 uppercase">Banco de Palabras Didáctico:</h4>
                <div className="flex flex-wrap gap-2">
                  {activeBlock.data.wordBank.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playSound('match');
                        setUserFilledWords(prev => [...prev, word]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-500 hover:text-white transition-all cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(25)}
                  className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>Validar Enunciado y Continuar (+25 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 6. PREGUNTA ABIERTA & REFLEXIÓN IA ================= */}
          {activeBlock?.type === 'open_poll_wordcloud' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300">
                  Reflexión & Evaluación Formativa IA
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.data.prompt}
                </h3>
              </div>

              <textarea
                rows={3}
                value={openAnswerText}
                onChange={(e) => setOpenAnswerText(e.target.value)}
                placeholder="Escribe tu argumento pedagógico aquí..."
                className="w-full p-3 rounded-2xl text-xs bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              {!aiFeedback ? (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={openAnswerText.length < 5 || isAiEvaluating}
                    onClick={handleEvaluateAiReflection}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 text-white font-black text-xs shadow-md shadow-fuchsia-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isAiEvaluating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isAiEvaluating ? 'Analizando con IA...' : 'Enviar y Recibir Feedback IA (+40 XP)'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1 animate-scale-in">
                  <div className="p-3.5 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/40 border border-fuchsia-200 text-xs text-fuchsia-900 dark:text-fuchsia-200">
                    <p className="font-bold">{aiFeedback}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleNextStep(40)}
                      className="px-6 py-2.5 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continuar al Siguiente Paso</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 7. MISTERIO & CÓDIGO SECRETO (ESCAPE ROOM) ================= */}
          {activeBlock?.type === 'secret_code_puzzle' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  {isSecretUnlocked ? <Unlock className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {activeBlock.data.clueText}
                </h3>

                {!isSecretUnlocked ? (
                  <div className="space-y-3 max-w-xs mx-auto">
                    <input
                      type="text"
                      value={secretCodeInput}
                      onChange={(e) => setSecretCodeInput(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO SECRETO"
                      className="w-full px-4 py-2.5 rounded-xl text-center text-sm font-black tracking-widest bg-white dark:bg-zinc-900 border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-700 dark:text-amber-300"
                    />

                    {showHint && activeBlock.data.hintText && (
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-bold bg-amber-100/80 dark:bg-amber-900/40 p-2 rounded-xl">
                        💡 {activeBlock.data.hintText}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleVerifySecretCode}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                      >
                        Abrir Candado
                      </button>
                      {activeBlock.data.hintText && !showHint && (
                        <button
                          type="button"
                          onClick={() => setShowHint(true)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
                        >
                          Ver Pista
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-scale-in">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      🎉 ¡Candado abierto con éxito! Has desbloqueado el paso secreto.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleNextStep(50)}
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <span>Avanzar al siguiente bloque</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= 8. PUNTO DE CONTROL & CHECKPOINT ================= */}
          {activeBlock?.type === 'checkpoint_gate' && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Punto de Control Metacognitivo</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {activeBlock.data.checkpointTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {activeBlock.data.reflectionPrompt}
                </p>
              </div>

              {/* Escala de Confianza (Estrellas) */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setConfidenceRating(star);
                      playSound('match');
                    }}
                    className={`p-2 rounded-xl transition-transform hover:scale-125 cursor-pointer ${
                      star <= confidenceRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-600'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(20)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Confirmar Autoevaluación y Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 9. DIPLOMA & CERTIFICADO ================= */}
          {activeBlock?.type === 'badge_certificate' && (
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-yellow-50 to-amber-100 dark:from-yellow-950/40 dark:to-amber-900/40 border-2 border-yellow-400/80 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/30">
                <Award className="w-8 h-8 text-slate-950" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-yellow-800 dark:text-yellow-300 tracking-widest">
                  DISTINCIÓN DE HONOR ACADÉMICO
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeBlock.data.certificateTitle}
                </h2>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  Otorgado con el grado de: {activeBlock.data.recipientHonor}
                </p>
              </div>

              <div className="pt-3 border-t border-yellow-300/60 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                <span>Colegio Anglo Mexicano</span>
                <span>Firma: {activeBlock.data.teacherSignatureName}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(50)}
                  className="px-6 py-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Reclamar Diploma (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 10. TEXTO / NARRATIVA ================= */}
          {activeBlock?.type === 'text_narrative' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/60 dark:from-blue-950/40 dark:via-zinc-850 dark:to-indigo-950/40 border-2 border-blue-200/80 dark:border-blue-800/80 shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/25 shrink-0 animate-pulse">
                    {activeBlock.data.speakerAvatar || <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {activeBlock.data.speakerName || 'Narrativa Histórica'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white pt-0.5">
                      {activeBlock.title}
                    </h3>
                  </div>
                </div>

                <div className="relative p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-blue-900/60 shadow-inner">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {activeBlock.data.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(25)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>¡Comprendido, Libertador! Avanzar (+25 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 11. PREGUNTA DE OPCIÓN MÚLTIPLE ================= */}
          {activeBlock?.type === 'quiz_question' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Pregunta de Evaluación
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {activeBlock.data.question}
                </h3>
              </div>

              {activeBlock.data.imageUrl && (
                <div className="relative w-full max-h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100">
                  <img 
                    src={activeBlock.data.imageUrl} 
                    alt="Ilustración" 
                    className="w-full h-full object-contain mx-auto"
                  />
                </div>
              )}

              {/* Opciones */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {activeBlock.data.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === activeBlock.data.correctIndex;
                  
                  let btnStyle = 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 text-slate-800 dark:text-zinc-200';
                  
                  if (isQuestionAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500 text-white border-rose-600';
                    } else {
                      btnStyle = 'opacity-50 border-slate-200 dark:border-zinc-800';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isQuestionAnswered}
                      onClick={() => handleAnswerQuestion(optIdx)}
                      className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-black text-[10px] flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isQuestionAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      )}
                      {isQuestionAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explicación formativa tras responder */}
              {isQuestionAnswered && (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1 animate-fade-in">
                  <span className="font-black">Retroalimentación Didáctica:</span>
                  <p>{activeBlock.data.explanation || '¡Excelente análisis conceptual!'}</p>
                </div>
              )}

              {isQuestionAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep(0)}
                    className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Siguiente Reactivo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 12. COMBATE CONTRA BOSS PIXI ================= */}
          {activeBlock?.type === 'boss_enemy' && (
            <div className="space-y-4">
              <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-rose-950 text-white border border-rose-800/60 shadow-xl overflow-hidden">
                {/* Cabecera del Boss */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-rose-900/60">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-black uppercase text-rose-300">
                      {activeBlock.data.bossName}
                    </h3>
                  </div>
                  <span className="text-xs font-black text-rose-400">
                    {bossHp} / {bossMaxHp} HP
                  </span>
                </div>

                {/* Barra de Vida del Boss */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden my-3 border border-rose-900">
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                  />
                </div>

                {/* Avatar del Monstruo o Jefe Histórico */}
                <div className="py-4 text-center">
                  <div className={`w-20 h-20 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center mx-auto shadow-2xl text-3xl transition-transform ${isBossDefeated ? 'opacity-40 grayscale scale-75' : 'animate-pulse'}`}>
                    {activeBlock.data.bossName?.toLowerCase().includes('realista') || activeBlock.data.bossName?.toLowerCase().includes('trujillo') || activeBlock.data.bossName?.toLowerCase().includes('comandante')
                      ? '💂‍♂️⚔️' 
                      : activeBlock.data.spriteKey === 'blood_dragon' ? '🐉' 
                      : activeBlock.data.spriteKey === 'shadow_golem' ? '🗿' 
                      : '👾'}
                  </div>
                </div>

                {/* Registro de Batalla */}
                <div className="p-2.5 rounded-xl bg-black/40 text-[11px] text-slate-300 space-y-1 font-mono">
                  {battleLog.map((log, idx) => (
                    <p key={idx}>{log}</p>
                  ))}
                </div>
              </div>

              {/* Botones de Acción de Combate */}
              {!isBossDefeated ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAttackBoss('crit')}
                    className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/25 flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Ataque Insurgente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttackBoss('magic')}
                    className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/25 flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Ideario Patriótico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttackBoss('potion')}
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    <Shield className="w-4 h-4 text-emerald-200" />
                    <span>Resistencia Heroica</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep(50)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>Victoria: Reclamar Victoria (+50 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 13. COFRE DE RECOMPENSAS ================= */}
          {activeBlock?.type === 'reward_chest' && (
            <div className="p-6 text-center space-y-5 rounded-3xl bg-gradient-to-b from-amber-500/10 to-amber-500/20 border border-amber-300 dark:border-amber-700">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Recompensa Especial
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.title}
                </h3>
              </div>

              <div 
                onClick={() => {
                  if (!isChestOpened) {
                    setIsChestOpened(true);
                    playSound('chest');
                    setCoins(prev => prev + (activeBlock.data.coinsAmount || 25));
                  }
                }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 text-4xl cursor-pointer transition-all transform hover:scale-110 active:scale-95 ${isChestOpened ? 'rotate-6 scale-105' : 'animate-bounce'}`}
              >
                {isChestOpened ? '💎' : '🎁'}
              </div>

              {isChestOpened ? (
                <div className="space-y-2 animate-scale-in">
                  <h4 className="text-sm font-black text-amber-700 dark:text-amber-300">
                    ¡Has desbloqueado: {activeBlock.data.badgeName || 'Insignia de Honor'}!
                  </h4>
                  <div className="flex items-center justify-center gap-3 text-xs font-black">
                    <span className="text-purple-600 dark:text-purple-400">+{activeBlock.data.xpAmount || 100} XP</span>
                    <span className="text-amber-500">+{activeBlock.data.coinsAmount || 25} Monedas</span>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleNextStep(activeBlock.data.xpAmount || 100)}
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <span>Reclamar Recompensa y Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-800 dark:text-amber-200 font-bold">
                  ¡Haz clic en el cofre para abrir tu botín de aprendizaje!
                </p>
              )}
            </div>
          )}

          {/* ================= 14. MINIJUEGO ARCADE ================= */}
          {activeBlock?.type === 'minigame_action' && (
            <div className="p-6 text-center space-y-4 rounded-3xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {activeBlock.title} ({activeBlock.data.minigameType.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500">
                Gira la ruleta de saberes o desafía tus reflejos pedagógicos:
              </p>

              {/* Ruleta interactiva */}
              <div className="py-2">
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => {
                    setSpinning(true);
                    playSound('attack');
                    setTimeout(() => {
                      setSpinning(false);
                      const items = activeBlock.data.items || ['Sabiduría +50 XP', 'Escudo de Enfoque', 'Gema Épica'];
                      const winner = items[Math.floor(Math.random() * items.length)];
                      setSelectedPrize(winner);
                      playSound('victory');
                    }, 1200);
                  }}
                  className={`px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-transform cursor-pointer ${
                    spinning ? 'animate-spin' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {spinning ? '🎰 Girando...' : '🎲 ¡Girar Ruleta de Saberes!'}
                </button>
              </div>

              {selectedPrize && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-xs font-black text-emerald-800 dark:text-emerald-200 animate-scale-in">
                  🎉 ¡Premio obtenido: {selectedPrize}!
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(30)}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Continuar Misión (+30 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 15. RAMIFICACIÓN CONDICIONAL ================= */}
          {activeBlock?.type === 'logic_branch' && (
            <div className="p-6 text-center space-y-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <GitBranch className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-500">Ruta Adaptativa</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Evaluación de Ruta de Aprendizaje
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Condición: Aciertos &ge; {activeBlock.data.thresholdValue}%. ¡Has superado el umbral con éxito y desbloqueado la ruta de maestría!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(20)}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Avanzar por Ruta de Maestría (+20 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 16. EFECTO DE AUDIO SFX ================= */}
          {activeBlock?.type === 'audio_sfx' && (
            <div className="p-6 text-center space-y-4 rounded-3xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-950 dark:text-violet-200">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                <Music className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-violet-500">Inmersión Sonora</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Fanfarria de victoria y efectos auditivos reproducidos con éxito.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(10)}
                  className="px-6 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Continuar (+10 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
