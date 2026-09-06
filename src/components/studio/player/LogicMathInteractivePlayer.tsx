"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCcw,
  Play,
  Pause,
  StepForward,
  Brain,
  Lightbulb,
  BookOpen,
  Binary,
  Cpu,
  Network,
  Boxes,
  Bot,
  ToggleLeft,
  ToggleRight,
  Zap,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Share2
} from 'lucide-react';
import { LogicActivityPreset } from '@/data/mathematicalLogicActivities';

interface Props {
  activity: LogicActivityPreset;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const LogicMathInteractivePlayer: React.FC<Props> = ({
  activity,
  onClose,
  onComplete
}) => {
  // Gamification states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lives, setLives] = useState(activity.gamificationSettings.lives || 3);
  const [streak, setStreak] = useState(1);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPedagogy, setShowPedagogy] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState<number>(-1);
  const [timerSeconds, setTimerSeconds] = useState(activity.gamificationSettings.timeLimitSeconds || 60);

  // Simulation interactive states
  const [switchesState, setSwitchesState] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: true, 4: false, 5: false, 6: false, 7: false
  });
  const [tapeIndex, setTapeIndex] = useState(3); // Start near center
  const [tapeState, setTapeState] = useState<string[]>(
    activity.simulationConfig.initialState?.tape || ['🌸', '🌷', '🌻', 'X', '_', '_', '_']
  );
  const [isTapePlaying, setIsTapePlaying] = useState(false);
  const [activeBfsStep, setActiveBfsStep] = useState(0);

  // Synthesized Web Audio FX
  const playSoundEffect = (type: 'correct' | 'wrong' | 'click' | 'victory' | 'step') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'step') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Timer tick
  useEffect(() => {
    if (isAnswerSubmitted || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswerSubmitted, timerSeconds]);

  // Automated Turing Tape playback
  useEffect(() => {
    let timer: any;
    if (isTapePlaying) {
      timer = setInterval(() => {
        setTapeIndex(prev => {
          if (prev >= tapeState.length - 1) {
            setIsTapePlaying(false);
            return prev;
          }
          playSoundEffect('step');
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isTapePlaying, tapeState.length]);

  const handleToggleSwitch = (index: number) => {
    playSoundEffect('click');
    setSwitchesState(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    playSoundEffect('click');
    setSelectedOptionId(optId);
  };

  const handleSubmitVerification = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    const chosen = activity.simulationConfig.options.find(o => o.id === selectedOptionId);
    const correct = chosen?.isCorrect || false;

    setIsAnswerSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      playSoundEffect('correct');
      const earnedXp = Math.round(activity.gamificationSettings.xpBaseReward * (streak > 1 ? 1.5 : 1));
      const earnedCoins = activity.gamificationSettings.coinsReward;
      setXpEarned(earnedXp);
      setCoinsEarned(earnedCoins);
      setStreak(prev => prev + 1);
      if (onComplete) onComplete(100);
    } else {
      playSoundEffect('wrong');
      setLives(prev => Math.max(0, prev - 1));
      setStreak(1);
    }
  };

  const handleResetChallenge = () => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setTapeIndex(3);
    setActiveBfsStep(0);
    setTimerSeconds(activity.gamificationSettings.timeLimitSeconds || 60);
  };

  // Icon for category
  const renderCategoryIcon = () => {
    switch (activity.logicType) {
      case 'binary':
        return <Binary className="w-5 h-5 text-cyan-400" />;
      case 'boolean_algebra':
        return <ToggleLeft className="w-5 h-5 text-indigo-400" />;
      case 'graphs_networks':
        return <Network className="w-5 h-5 text-purple-400" />;
      case 'state_automaton':
        return <Bot className="w-5 h-5 text-teal-400" />;
      case 'csp_scheduler':
      case 'greedy_optimization':
        return <Boxes className="w-5 h-5 text-amber-400" />;
      default:
        return <Brain className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col my-4">
      {/* ========================================================================= */}
      {/* 1. HUD SUPERIOR GAMIFICADO */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 sm:px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            {renderCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300">
                {activity.levelLabel}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                • {activity.badgeReward.name}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Marcadores: Vidas, Racha, Tiempo, Audio */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Vidas */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-600 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Racha */}
          <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-xl text-xs font-black text-amber-400">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>x{streak}</span>
          </div>

          {/* Cronómetro */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border ${
            timerSeconds <= 15 
              ? 'bg-rose-950/80 border-rose-700 text-rose-300 animate-pulse' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timerSeconds}s</span>
          </div>

          {/* Sonido */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NARRATIVA Y PLANTEAMIENTO DEL RETO */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800/80 space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900/80 border border-indigo-800/40">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Contexto & Reglas del Desafío</span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {activity.problemLore}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-xs sm:text-sm font-black text-cyan-200">
              {activity.description}
            </p>
          </div>
          {activity.hints && activity.hints.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playSoundEffect('click');
                setActiveHintIndex(prev => (prev + 1) % activity.hints.length);
              }}
              className="px-3 py-1 rounded-xl bg-cyan-900/80 hover:bg-cyan-800 text-[11px] font-black text-cyan-200 border border-cyan-700/60 transition-colors flex items-center gap-1 shrink-0"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Pista {activeHintIndex >= 0 ? `(${activeHintIndex + 1}/${activity.hints.length})` : ''}</span>
            </button>
          )}
        </div>

        {/* Pista visible */}
        <AnimatePresence>
          {activeHintIndex >= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs font-semibold flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>💡 <strong>Pista pedagógica:</strong> {activity.hints[activeHintIndex]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMULADOR VISUAL ANIMADO INTERACTIVO */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
        
        {/* === CASO A: SIMULADOR DE COMPUERTAS & CIRCUITOS BOOLEANOS === */}
        {activity.simulationConfig.engine === 'circuit_gates' && (
          <div className="w-full max-w-xl p-5 rounded-2xl bg-slate-900 border border-indigo-800/60 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <span>⚡ Panel de Interruptores (Entradas Binarias)</span>
              <span>Compuertas: AND, OR, NOT, XOR</span>
            </div>

            {/* Fila de switches interactivos */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                const isOn = !!switchesState[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleSwitch(idx)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isOn 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/30 scale-105' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>
                    <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-600'}`} />
                    <span className="text-[9px] font-bold">{isOn ? '1' : '0'}</span>
                  </button>
                );
              })}
            </div>

            {/* Simulación de señal eléctrica hasta el foco final */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Zap className={`w-4 h-4 ${switchesState[0] && switchesState[1] ? 'text-amber-400 animate-bounce' : 'text-slate-600'}`} />
                <span>Estado de Corriente Lógica:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400">Bombilla Final:</span>
                <div className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  (switchesState[0] && switchesState[1])
                    ? 'bg-yellow-500 text-slate-950 shadow-[0_0_15px_#eab308]' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{(switchesState[0] && switchesState[1]) ? 'PRENDIDA' : 'APAGADA'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === CASO B: SIMULADOR DE MÁQUINA DE TURING / CINTA DE ROBOT === */}
        {activity.simulationConfig.engine === 'step_automaton' && (
          <div className="w-full max-w-2xl p-5 rounded-2xl bg-slate-900 border border-teal-800/60 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-teal-300">
                <Bot className="w-4 h-4" />
                <span>Cinta de Memoria & Cabezal Lector</span>
              </div>
              <span>Posición Actual: {tapeIndex + 1} / {tapeState.length}</span>
            </div>

            {/* Cinta Horizontal con animación */}
            <div className="relative overflow-x-auto py-4 px-2">
              <div className="flex items-center justify-center gap-2 min-w-max">
                {tapeState.map((symbol, idx) => {
                  const isCurrent = idx === tapeIndex;
                  return (
                    <motion.div
                      key={idx}
                      animate={{ scale: isCurrent ? 1.15 : 1 }}
                      className={`w-12 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-teal-950 border-teal-400 text-teal-200 shadow-lg shadow-teal-500/30'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{symbol}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">{idx + 1}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Indicador de Cabezal Lector */}
              <div className="flex justify-center mt-2">
                <div className="px-3 py-1 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md shadow-teal-500/20 animate-bounce">
                  <span>▲ Cabezal Lector [Pos {tapeIndex + 1}]</span>
                </div>
              </div>
            </div>

            {/* Controles de Ejecución */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTapePlaying(!isTapePlaying)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isTapePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTapePlaying ? 'Pausar' : 'Ejecutar Algoritmo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSoundEffect('step');
                  setTapeIndex(prev => (prev < tapeState.length - 1 ? prev + 1 : 0));
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>Paso a Paso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTapeIndex(0);
                  setIsTapePlaying(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>
        )}

        {/* === CASO C: SISTEMA BINARIO & CONTADOR DE FOCOS === */}
        {activity.simulationConfig.engine === 'binary_counter' && (
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-cyan-800/60 space-y-4 text-center">
            <span className="text-xs text-slate-400 font-bold">💡 Haz clic en los focos para sumar el valor binario</span>
            
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[
                { bit: 2, weight: 4, label: 'Izquierda' },
                { bit: 1, weight: 2, label: 'Centro' },
                { bit: 0, weight: 1, label: 'Derecha' }
              ].map(({ bit, weight, label }) => {
                const isOn = !!switchesState[bit];
                return (
                  <button
                    key={bit}
                    type="button"
                    onClick={() => handleToggleSwitch(bit)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isOn 
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xl shadow-amber-500/30 scale-110' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    <Lightbulb className={`w-8 h-8 ${isOn ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-slate-600'}`} />
                    <span className="text-xs font-black">+{weight} Palos</span>
                    <span className="text-[10px] font-bold text-slate-400">{label} (Bit {bit})</span>
                  </button>
                );
              })}
            </div>

            {/* Suma total acumulada */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Total de Palos Cargados:</span>
              <span className="text-base font-black text-amber-400">
                {(switchesState[2] ? 4 : 0) + (switchesState[1] ? 2 : 0) + (switchesState[0] ? 1 : 0)} Palos
              </span>
            </div>
          </div>
        )}

        {/* === CASO D: GRAFOS Y PROPAGACIÓN BFS === */}
        {activity.simulationConfig.engine === 'graph_explorer' && (
          <div className="w-full max-w-xl p-5 rounded-2xl bg-slate-900 border border-purple-800/60 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-purple-300">
                <Network className="w-4 h-4" />
                <span>Simulador de Propagación en Red (BFS)</span>
              </div>
              <span>Oleada: Día {activeBfsStep}</span>
            </div>

            {/* Red visual de nodos */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              {[
                { name: 'Pueblo J (Origen)', day: 0, color: 'border-cyan-500 bg-cyan-950 text-cyan-200' },
                { name: 'Pueblos E, G, H, M', day: 1, color: 'border-blue-500 bg-blue-950 text-blue-200' },
                { name: 'Pueblos B, C, D, I, K, N', day: 2, color: 'border-indigo-500 bg-indigo-950 text-indigo-200' },
                { name: 'Pueblos A, F, P, R', day: 3, color: 'border-purple-500 bg-purple-950 text-purple-200' },
                { name: 'Pueblo Q (Último)', day: 4, color: 'border-rose-500 bg-rose-950 text-rose-200' }
              ].map((group, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                    activeBfsStep >= group.day ? group.color : 'border-slate-800 bg-slate-900/50 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Día {group.day}</div>
                  <div>{group.name}</div>
                </div>
              ))}
            </div>

            {/* Botón para simular oleadas */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('step');
                  setActiveBfsStep(prev => (prev < 4 ? prev + 1 : 0));
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Avanzar Día de Entrega (+1 Salto BFS)</span>
              </button>
            </div>
          </div>
        )}

        {/* === CASO E: GRID DE PATRONES Y SELECCIÓN GENERAL === */}
        {(activity.simulationConfig.engine === 'grid_selector' || activity.simulationConfig.engine === 'sorter_tray' || activity.simulationConfig.engine === 'interactive_switches') && (
          <div className="w-full max-w-xl p-5 rounded-2xl bg-slate-900 border border-blue-800/60 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-black text-cyan-300">
              <Layers className="w-4 h-4" />
              <span>Tablero Interactivo de Análisis Algorítmico</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Examina las relaciones lógicas y selecciona la respuesta correcta en el tablero de opciones inferior.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DECK DE OPCIONES Y RESPUESTAS INTERACTIVAS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-4">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
          Selecciona la Solución Demostrada:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activity.simulationConfig.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let cardStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500';

            if (isAnswerSubmitted) {
              if (option.isCorrect) {
                cardStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-500/20';
              } else if (isSelected && !option.isCorrect) {
                cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-lg shadow-rose-500/20';
              } else {
                cardStyle = 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60';
              }
            } else if (isSelected) {
              cardStyle = 'bg-cyan-950 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/20 scale-[1.01]';
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(option.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${cardStyle}`}
              >
                <div className="text-xl shrink-0 mt-0.5">{option.icon || '🔹'}</div>
                <div className="space-y-1 flex-1">
                  <div className="text-xs sm:text-sm font-bold leading-snug">{option.label}</div>
                  {isAnswerSubmitted && option.detail && (
                    <div className="text-[11px] font-medium text-slate-300 pt-1 border-t border-slate-700/50">
                      {option.detail}
                    </div>
                  )}
                </div>
                {isAnswerSubmitted && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswerSubmitted && isSelected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botón de Verificación / Siguiente */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={handleSubmitVerification}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedOptionId
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verificar Respuesta</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetChallenge}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>Continuar Misión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Banner de recompensa al acertar */}
          {isAnswerSubmitted && isCorrect && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-emerald-500/40 p-2.5 px-4 rounded-2xl"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="text-xs font-black text-emerald-300">
                ¡Reto Superado! +{xpEarned} XP • +{coinsEarned} Monedas
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SEGUNDA MIRADA PEDAGÓGICA (DESGLOSE DE CIENCIAS COMPUTACIONALES) */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowPedagogy(!showPedagogy)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm text-cyan-300">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>Segunda Mirada: Fundamento Algorítmico & Actividad de Aula</span>
          </div>
          {showPedagogy ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {showPedagogy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-300">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>¿Cómo se relaciona con la Informática y el Pensamiento Computacional?</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {activity.pedagogicalExplanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Continúa Aprendiendo: Dinámica Física Desconectada para el Aula</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {activity.classroomActivity}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
