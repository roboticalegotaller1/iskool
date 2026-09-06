"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest, ReadingQuestContent, SubmitReadingQuestResult } from '@/types';
import { useStudentStore, useCurrentStudentStats } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { 
  BookOpen, 
  Sparkles, 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Swords, 
  Zap, 
  Shield, 
  Coins, 
  Gauge, 
  FileText, 
  Brain,
  HelpCircle,
  Wand2,
  Lock,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { RpgCombatPayload } from './DataDrivenCombatView';

const DataDrivenCombatCanvas = dynamic(
  () => import('./DataDrivenCombatCanvas'),
  { ssr: false, loading: () => <div className="h-64 sm:h-80 w-full flex items-center justify-center bg-zinc-950 text-amber-400 font-serif animate-pulse">Invocando criatura en el Lienzo Mágico...</div> }
);

interface GrimoireReadingQuestViewProps {
  quest: Quest;
  onClose: () => void;
  onComplete?: (result: SubmitReadingQuestResult) => void;
}

export const GrimoireReadingQuestView: React.FC<GrimoireReadingQuestViewProps> = ({
  quest,
  onClose,
  onComplete
}) => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const studentStats = useCurrentStudentStats();
  const submitReadingQuest = useGamificationStore(state => state.submitReadingQuest);

  // Extraer datos del bloque de lectura
  const content = quest.content as ReadingQuestContent;
  const readingText = content.readingText || quest.description || '';
  const timeLimitSeconds = content.timeLimitSeconds || 60;
  const questions = content.questions || [];
  const bossName = content.bossName || 'Sombra del Olvido';
  const bossTotalHp = content.bossHp || 100;

  // Conteo de palabras automático
  const wordCount = useMemo(() => {
    if (content.wordCount && content.wordCount > 0) return content.wordCount;
    const trimmed = readingText.trim();
    return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  }, [readingText, content.wordCount]);

  // Fases del Reto Mágico: 'reading' -> 'combat' -> 'victory'
  const [phase, setPhase] = useState<'reading' | 'combat' | 'victory'>('reading');

  // Estados del Temporizador de Energía Mágica
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeLimitSeconds);
  const [timeSpentReading, setTimeSpentReading] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Estados de Batalla Mágica
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [currentBossHp, setCurrentBossHp] = useState<number>(bossTotalHp);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [combatState, setCombatState] = useState<'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat'>('idle');
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isCastingSpell, setIsCastingSpell] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<SubmitReadingQuestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Efectos de sonido Web Audio
  const playSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge' | 'spell') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'laser' || type === 'spell') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.15, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.25);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.25);
        });
      } else if (type === 'error' || type === 'defeat') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  };

  // Temporizador de Energía Mágica de Lectura
  useEffect(() => {
    if (phase !== 'reading') return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTransitionToCombat();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentReading(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Transición a la Fase de Combate (El texto del grimorio desaparece para medir retención)
  const handleTransitionToCombat = () => {
    setPhase('combat');
    playSound('spell');
    setBattleLogs([
      `🔮 ¡El Grimorio se ha cerrado! Las palabras residen en tu memoria.`,
      `⚔️ ¡${bossName} surge de las sombras para poner a prueba tu retención mágica!`
    ]);
  };

  // Cálculo en vivo de PPM del alumno
  const livePpm = useMemo(() => {
    const timeUsed = Math.max(5, timeSpentReading);
    const minutes = timeUsed / 60;
    return Math.round(wordCount / minutes);
  }, [wordCount, timeSpentReading]);

  // Manejar lanzamiento de respuesta / Hechizo en combate
  const handleCastSpellAnswer = (optionIdx: number) => {
    if (isAnswerSubmitted || isCastingSpell || phase !== 'combat') return;

    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);
    setIsCastingSpell(true);

    const isCorrect = optionIdx === currentQ.correctAnswerIndex;

    if (isCorrect) {
      // Hechizo certero: animar Pixi y bajar vida al enemigo
      setCorrectAnswersCount(prev => prev + 1);
      setCombatState('attacking');
      playSound('spell');

      const dmgPerQ = Math.ceil(bossTotalHp / Math.max(1, questions.length));
      const intelBonus = Math.round((studentStats?.attribute_intelligence || 1) * 2.5);
      const totalDmg = dmgPerQ + intelBonus;

      setTimeout(() => {
        setCurrentBossHp(prev => Math.max(0, prev - totalDmg));
        setCombatState('boss_hurt');
        playSound('hit');
        setBattleLogs(prev => [
          `✨ ¡HECHIZO CERTERO! Invocas una ráfaga de sabiduría infligiendo ${totalDmg} de daño mágico (Intelecto +${intelBonus}).`,
          ...prev
        ]);
      }, 500);

      setTimeout(() => {
        setCombatState('idle');
        setIsCastingSpell(false);
      }, 1300);

    } else {
      // Hechizo fallido: la criatura oscura contrataca
      setCombatState('idle');
      playSound('error');
      const counterDmg = 15;
      setPlayerHp(prev => Math.max(10, prev - counterDmg));
      setBattleLogs(prev => [
        `❌ El encantamiento flaqueó. ${bossName} resiste y contraataca (-${counterDmg} HP).`,
        ...prev
      ]);
      setTimeout(() => {
        setIsCastingSpell(false);
      }, 700);
    }
  };

  // Avanzar a la siguiente pregunta o concluir combate
  const handleNextCombatStep = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Conclusión del Reto y Llamada RPC
      setIsSubmitting(true);
      const totalQuestions = questions.length || 1;
      const finalScorePercent = Math.round((correctAnswersCount / totalQuestions) * 100);
      const timeSpent = Math.max(10, timeSpentReading);
      const finalWpm = Math.round(wordCount / (timeSpent / 60));

      setCombatState('victory');
      playSound('victory');

      try {
        const result = await submitReadingQuest(
          quest.id,
          finalWpm,
          finalScorePercent,
          timeSpent
        );

        setFinalResult(result);
        setPhase('victory');
        if (onComplete) onComplete(result);
      } catch (err) {
        console.error('Error enviando lectura mágica:', err);
        setPhase('victory');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Payload estructurado para el lienzo de Pixi.js
  const combatPayload: RpgCombatPayload = useMemo(() => ({
    mission_id: quest.mission_id || 'reading-mission',
    homework_id: quest.id,
    enemy_data: {
      enemy_id: 'dark-creature-1',
      name: bossName,
      hp_max: bossTotalHp,
      hp_remaining: currentBossHp,
      skin_id: 'blood_dragon'
    },
    attackers: [
      {
        student_id: activeStudentId,
        name: 'Mago Estudiante',
        role: 'Sage_Cyber',
        damage: 25,
        skin_texture_id: 'skin_marine'
      }
    ],
    server_calculated_total_damage: bossTotalHp - currentBossHp
  }), [quest, bossName, bossTotalHp, currentBossHp, activeStudentId]);

  // Porcentaje de energía mágica restante
  const energyPercent = Math.max(0, Math.min(100, (secondsRemaining / timeLimitSeconds) * 100));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-zinc-950 via-[#16121e] to-zinc-950 rounded-3xl border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.18)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Cabecera Mágica Superior con Barra de Maná */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-zinc-950/80 flex flex-col gap-3 relative">
          
          {/* Adorno rúnico superior */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Wand2 className="w-5 h-5 text-amber-200 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/90 flex items-center gap-1">
                  <span>✦ GRIMORIO DE COMPRENSIÓN LECTORA ✦</span>
                </span>
                <h3 className="text-sm sm:text-base font-black text-amber-100 font-serif tracking-wide">
                  {quest.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 transition-colors"
                title={soundEnabled ? 'Silenciar Hechizos' : 'Activar Sonido'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Barra de Energía Mágica / Maná Arcano en lugar de reloj estándar */}
          {phase === 'reading' && (() => {
            const isLow = secondsRemaining <= 10 || energyPercent <= 20;
            const isMid = secondsRemaining <= 25 || energyPercent <= 50;

            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black">
                  <span className={`flex items-center gap-1.5 transition-colors ${
                    isLow 
                      ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse' 
                      : isMid 
                      ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                      : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                  }`}>
                    <Sparkles className={`w-3.5 h-3.5 ${isLow ? 'text-rose-300 animate-spin' : isMid ? 'text-amber-200' : 'text-cyan-300 animate-spin'}`} />
                    <span>Energía Mágica del Pergamino: <strong>{secondsRemaining}s</strong> / {timeLimitSeconds}s</span>
                  </span>
                  <div className="flex items-center gap-3 text-amber-300/80">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {wordCount} palabras
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Gauge className="w-3.5 h-3.5" />
                      ~{livePpm} PPM
                    </span>
                  </div>
                </div>

                {/* Barra de maná con brillo de partículas */}
                <div className="relative w-full h-3 bg-zinc-900/90 rounded-full border border-cyan-500/30 overflow-hidden shadow-inner p-0.5">
                  <motion.div
                    className={`h-full rounded-full relative transition-all duration-1000 ease-linear ${
                      isLow 
                        ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(244,63,94,0.7)]' 
                        : isMid 
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400' 
                        : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600'
                    }`}
                    style={{ width: `${energyPercent}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white rounded-full blur-[2px] animate-pulse" />
                  </motion.div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Cuerpo Principal: Cambia dinámicamente según la fase */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ================= FASE 1: GRIMORIO DE LECTURA ================= */}
          {phase === 'reading' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Pergamino Antiguo con Glassmorphism Oscuro */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#211912]/90 via-[#18120c]/90 to-[#120d09]/95 border-2 border-amber-600/40 shadow-[0_0_40px_rgba(245,158,11,0.1)] space-y-4">
                
                {/* Sellos de esquinas rúnicas */}
                <div className="flex items-center justify-between text-amber-500/50 text-xs font-serif select-none">
                  <span>✦ ✧ LIBRO DE LOS SABERES ✧ ✦</span>
                  <span>Fase de Concentración Arcana</span>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-serif text-sm sm:text-base sm:leading-relaxed text-amber-100/95 tracking-wide whitespace-pre-line text-justify selection:bg-amber-500/30">
                    {readingText}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-amber-300/70">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Memoriza los detalles clave: el texto desaparecerá al iniciar la batalla.
                  </span>

                  <button
                    type="button"
                    onClick={handleTransitionToCombat}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>¡He memorizado el hechizo! Desatar Batalla</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= FASE 2: DUELO MÁGICO / COMBATE PIXI ================= */}
          {phase === 'combat' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Lienzo de Batalla Pixi.js (DataDrivenCombatCanvas) */}
              <div className="rounded-3xl overflow-hidden border border-purple-500/40 shadow-2xl bg-zinc-950 relative">
                <DataDrivenCombatCanvas
                  payload={combatPayload}
                  localStudentId={activeStudentId}
                  combatState={combatState}
                  volume={soundEnabled ? 0.6 : 0}
                  playSound={playSound}
                />
              </div>

              {/* Registro de Hechizos y Combate */}
              {battleLogs.length > 0 && (
                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-purple-900/50 text-xs font-mono text-purple-300 space-y-1 max-h-20 overflow-y-auto">
                  {battleLogs.slice(0, 3).map((log, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 truncate">
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pregunta de Comprensión Activa (Formato Hechizo de Combate) */}
              {questions[currentQIndex] && (
                <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-amber-500/30 shadow-xl space-y-4">
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Conjuro de Retención {currentQIndex + 1} de {questions.length}
                    </span>

                    <span className="text-xs font-bold text-slate-400">
                      Aciertos: <strong className="text-emerald-400">{correctAnswersCount}</strong> / {questions.length}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-amber-100 font-serif">
                    {questions[currentQIndex].question}
                  </h4>

                  {/* Opciones de Hechizo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {questions[currentQIndex].options.map((optionText, optIdx) => {
                      const isSelected = selectedOption === optIdx;
                      const isCorrect = optIdx === questions[currentQIndex].correctAnswerIndex;
                      const letter = String.fromCharCode(65 + optIdx);

                      let btnStyle = 'bg-zinc-950/90 border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-850';
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-md shadow-rose-500/20';
                        } else {
                          btnStyle = 'bg-zinc-950/50 border-zinc-900 text-zinc-600 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswerSubmitted || isCastingSpell}
                          onClick={() => handleCastSpellAnswer(optIdx)}
                          className={`p-3.5 rounded-2xl border font-semibold text-xs text-left flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px] flex items-center justify-center shrink-0">
                            {letter}
                          </span>
                          <span className="flex-1">{optionText}</span>
                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Retroalimentación didáctica tras responder */}
                  {isAnswerSubmitted && (
                    <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs font-medium text-amber-200 space-y-1 animate-scale-in">
                      <span className="font-black text-amber-400 block text-[10px] uppercase">
                        Fundamento Mágico:
                      </span>
                      <p>{questions[currentQIndex].explanation || 'Respuesta verificada en los anales del saber.'}</p>
                    </div>
                  )}

                  {/* Botón de Siguiente Hechizo o Conclusión */}
                  {isAnswerSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextCombatStep}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
                      >
                        {isSubmitting ? (
                          <span>Canalizando Sabiduría...</span>
                        ) : currentQIndex < questions.length - 1 ? (
                          <>
                            <span>Siguiente Hechizo de Comprensión</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>¡Triunfar y Reclamar Recompensas!</span>
                            <Trophy className="w-4 h-4 text-yellow-300" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ================= FASE 3: VICTORIA MÁGICA Y RECOMPENSAS ================= */}
          {phase === 'victory' && (
            <div className="p-6 sm:p-8 text-center space-y-6 rounded-3xl bg-gradient-to-b from-purple-950/60 via-zinc-950 to-zinc-950 border-2 border-amber-500/40 shadow-2xl animate-scale-in">
              
              {/* Emblema de Victoria */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/40">
                <Trophy className="w-10 h-10 text-yellow-200 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
                  ✦ ¡CRIATURA OSCURA DISIPADA! ✦
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
                  Victoria de Comprensión Lectora
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                  {finalResult?.feedback || 'Has demostrado una extraordinaria velocidad y retención cognitiva en el Grimorio Mágico.'}
                </p>
              </div>

              {/* Grilla de Métricas Obtenidas (PPM, Retención, XP, Monedas de Galeón) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                
                {/* Velocidad PPM */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/30 text-center shadow-lg">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
                    Velocidad
                  </span>
                  <span className="text-lg font-black text-cyan-200 mt-1 block">
                    {finalResult?.words_per_minute || livePpm} <span className="text-xs text-slate-400">PPM</span>
                  </span>
                </div>

                {/* Retención / Comprensión */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 text-center shadow-lg">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                    Retención
                  </span>
                  <span className="text-lg font-black text-indigo-200 mt-1 block">
                    {finalResult?.comprehension_score ?? Math.round((correctAnswersCount / Math.max(1, questions.length)) * 100)}%
                  </span>
                </div>

                {/* XP Ganado */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 text-center shadow-lg">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                    Experiencia
                  </span>
                  <span className="text-lg font-black text-purple-200 mt-1 block">
                    +{finalResult?.xp_earned || 80} XP
                  </span>
                </div>

                {/* Monedas de Galeón */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-center shadow-lg">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Galeones
                  </span>
                  <span className="text-lg font-black text-amber-300 mt-1 block">
                    +{finalResult?.coins_earned || 25} 🪙
                  </span>
                </div>

              </div>

              {/* Botón de Retorno */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform active:scale-95"
                >
                  <span>Cerrar Grimorio y Volver al Mapa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
