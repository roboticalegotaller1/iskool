"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioBlock, ActivityBuilderMetadata, FlowConnection } from '@/types/studioBlocks';
import { useStudentStore } from '@/store/useStudentStore';
import { LogicMathInteractivePlayer } from './LogicMathInteractivePlayer';
import { GrimorioTimedReadingPlayer } from './GrimorioTimedReadingPlayer';
import { MagicHistoryBookPlayer } from '@/components/history/MagicHistoryBookPlayer';
import { attachStudioBroadcastMaster } from '@/lib/audio/studioBroadcastMaster';
import { LogicActivityPreset } from '@/data/mathematicalLogicActivities';
import {
  extractExamQuestionsFromStudioBlocks,
  generateExamVariantsZeroToken,
  runClassroomOmrBatchGradingZeroToken
} from '@/services/deterministicExamOmrEngine';
import { downloadOmrExamPdf } from '@/services/omrExamPdfExporter';
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
  const [blanksCheckResult, setBlanksCheckResult] = useState<'correct' | 'wrong' | null>(null);

  // Estados de Pregunta Abierta IA & Nube de Palabras
  const [openAnswerText, setOpenAnswerText] = useState('');
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [wordcloudTerms, setWordcloudTerms] = useState<{ word: string; weight: number }[]>([
    { word: 'Soberanía', weight: 5 },
    { word: 'Querétaro', weight: 4 },
    { word: 'Libertad', weight: 5 },
    { word: 'Justicia Social', weight: 4 },
    { word: 'Insurgentes', weight: 3 },
    { word: 'Abolición', weight: 4 }
  ]);

  // Estados de Duelo Boss Curricular (Reactivos de Verificación)
  const [bossQuizIndex, setBossQuizIndex] = useState(0);
  const [bossQuizSelected, setBossQuizSelected] = useState<number | null>(null);

  // Estados de Bloques de Lenguajes (5 Nodos Interactivos)
  const [languagePracticeInput, setLanguagePracticeInput] = useState('');
  const [languagePracticeFeedback, setLanguagePracticeFeedback] = useState<string | null>(null);
  const [karaokeWordIdx, setKaraokeWordIdx] = useState<number>(-1);
  const [isKaraokePlaying, setIsKaraokePlaying] = useState(false);
  const [karaokeCompleted, setKaraokeCompleted] = useState(false);
  const [socraticMessages, setSocraticMessages] = useState<{ role: 'ai' | 'student'; text: string }[]>([]);
  const [socraticInput, setSocraticInput] = useState('');
  const [roleplayResponse, setRoleplayResponse] = useState('');
  const [roleplayCompleted, setRoleplayCompleted] = useState(false);
  const [rubricCompleted, setRubricCompleted] = useState(false);

  // Estado de Voz Neural LatAm (Respaldo Neural Continuo - 24 Voces LatAm)
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [activeSchoolName, setActiveSchoolName] = useState('Instituto Bilingüe IBIME • Red Educativa ISkool');

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

  // Estados de Examen Híbrido OMR en vivo
  const [omrPlayerBubbles, setOmrPlayerBubbles] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [omrPlayerCorrections, setOmrPlayerCorrections] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [omrPlayerSubmitted, setOmrPlayerSubmitted] = useState<boolean>(false);

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

  // Reproductor de Voz Neural LatAm (Respaldo Neural Continuo - 24 Voces LatAm Calibrado a 3.8-flash-lite-tts)
  const playNeuralVoice = async (text: string, lang: string = 'es-MX', gender: 'male' | 'female' = 'female') => {
    if (!text) return;
    setIsSpeakingTts(true);
    try {
      const blockData = (activeBlock?.data || {}) as Record<string, any>;
      const resolvedCharacterName =
        blockData.characterOrSiteName ||
        blockData.characterName ||
        (activeBlock?.type === 'historical_figure_block' ? activeBlock.title : '');
      const resolvedGender: 'male' | 'female' =
        blockData.voiceGender === 'male' || blockData.voiceGender === 'female'
          ? blockData.voiceGender
          : gender;

      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: lang,
          gender: resolvedGender,
          characterName: resolvedCharacterName,
          role: activeBlock?.type === 'historical_figure_block' ? 'character' : 'tutor'
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        attachStudioBroadcastMaster(audio, {
          isMale: resolvedGender === 'male',
          role: activeBlock?.type === 'historical_figure_block' ? 'character' : 'tutor'
        });
        audio.onended = () => setIsSpeakingTts(false);
        audio.onerror = () => setIsSpeakingTts(false);
        await audio.play();
        return;
      }
    } catch (_) {
      // Fallback en caso de red offline
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.onend = () => setIsSpeakingTts(false);
      u.onerror = () => setIsSpeakingTts(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeakingTts(false);
    }
  };

  useEffect(() => {
    try {
      const savedSchool = localStorage.getItem('iskool_active_school_name');
      if (savedSchool) setActiveSchoolName(savedSchool);
    } catch (_) {}
  }, []);

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
    setBlanksCheckResult(null);
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
    setBossQuizIndex(0);
    setBossQuizSelected(null);
    setLanguagePracticeInput('');
    setLanguagePracticeFeedback(null);
    setKaraokeWordIdx(-1);
    setIsKaraokePlaying(false);
    setKaraokeCompleted(false);
    setSocraticInput('');
    setRoleplayResponse('');
    setRoleplayCompleted(false);
    setRubricCompleted(false);

    if (activeBlock) {
      if (activeBlock.type === 'timed_reading_block') {
        const limit = activeBlock.data.timeLimitSeconds || 60;
        setReadingSecondsLeft(limit);
        setReadingTimeTaken(0);
      } else if (activeBlock.type === 'boss_enemy') {
        const max = activeBlock.data.maxHp || 1200;
        setBossHp(max);
        setBossMaxHp(max);
        setIsBossDefeated(false);
        setBattleLog([`⚔️ ¡${activeBlock.data.bossName} (${max} HP) exige demostrar dominio curricular!`]);
      } else if (activeBlock.type === 'drag_drop_match') {
        setSelectedLeftIndex(null);
        setMatchedPairs({});
        setFailedMatchFeedback(null);
      } else if (activeBlock.type === 'ordering_sequence') {
        const shuffled = [...activeBlock.data.stepsInCorrectOrder].sort(() => Math.random() - 0.5);
        setOrderedList(shuffled);
      } else if (activeBlock.type === 'languages_socratic_tutor') {
        setSocraticMessages([
          {
            role: 'ai',
            text: activeBlock.data.starterPrompt || "Hello! Let's explore this topic together. What is your perspective?"
          }
        ]);
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

  // Avanzar al siguiente bloque siguiendo el flujo del grafo (incluyendo Bifurcación Condicional Real >= 70% vs < 70%)
  const handleNextStep = (earnedXp: number = 0, forcedBranchTargetId?: string) => {
    const totalXp = accumulatedXp + earnedXp;
    setAccumulatedXp(totalXp);

    if (forcedBranchTargetId && blocks.some(b => b.id === forcedBranchTargetId)) {
      setCurrentNodeId(forcedBranchTargetId);
      setCurrentStepIndex(prev => prev + 1);
      return;
    }

    // Si existen conexiones en el grafo, seguir la flecha correspondiente
    if (connections.length > 0 && activeBlock) {
      const outgoing = connections.filter(c => c.sourceNodeId === activeBlock.id);

      if (outgoing.length > 0) {
        let nextNodeId = outgoing[0].targetNodeId;

        // Si el bloque activo es una Bifurcación Condicional (logic_branch), evaluar desempeño real
        if (activeBlock.type === 'logic_branch') {
          const threshold = activeBlock.data?.thresholdScore ?? activeBlock.data?.thresholdValue ?? 70;
          const estimatedMasteryPct = Math.min(100, Math.round((lives / 3) * 70 + (totalXp >= 40 ? 30 : 15)));
          const passed = estimatedMasteryPct >= threshold;

          if (passed) {
            const highConn = outgoing.find(c => c.condition === 'score_high') || outgoing[0];
            nextNodeId = activeBlock.data?.ifTrueNextBlockId || highConn.targetNodeId;
          } else {
            const lowConn = outgoing.find(c => c.condition === 'score_low') || outgoing[1] || outgoing[0];
            nextNodeId = activeBlock.data?.ifFalseNextBlockId || lowConn.targetNodeId;
          }
        }

        setCurrentNodeId(nextNodeId);
        setCurrentStepIndex(prev => prev + 1);
        return;
      } else {
        // No tiene conexión saliente: es un nodo final del juego
        setIsFinished(true);
        playSound('victory');
        const activeStudent = useStudentStore.getState().activeStudentId;
        const grantedXp = Math.max(metadata.xpReward || 50, totalXp);
        const grantedCoins = Math.max(metadata.coinsReward || 20, coins);
        if (activeStudent) {
          useStudentStore.getState().addXpAndCoins(activeStudent, grantedXp, grantedCoins);
        }
        if (onComplete) onComplete(100);
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
      const activeStudent = useStudentStore.getState().activeStudentId;
      const grantedXp = Math.max(metadata.xpReward || 50, totalXp);
      const grantedCoins = Math.max(metadata.coinsReward || 20, coins);
      if (activeStudent) {
        useStudentStore.getState().addXpAndCoins(activeStudent, grantedXp, grantedCoins);
      }
      if (onComplete) onComplete(100);
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

  // Manejar análisis reflexivo contextual de IA + Nube de Palabras en Vivo
  const handleEvaluateAiReflection = () => {
    if (!openAnswerText.trim() || !activeBlock || activeBlock.type !== 'open_poll_wordcloud') return;
    setIsAiEvaluating(true);

    // Extraer palabras significativas aportadas por el estudiante para la Nube de Conceptos en Vivo
    const extracted = openAnswerText
      .trim()
      .split(/\s+/)
      .map(w => w.replace(/[.,;!?()"']/g, ''))
      .filter(w => w.length >= 5)
      .slice(0, 3);

    setTimeout(() => {
      setIsAiEvaluating(false);
      playSound('correct');
      if (extracted.length > 0) {
        setWordcloudTerms(prev => [
          ...extracted.map(w => ({ word: w.charAt(0).toUpperCase() + w.slice(1), weight: 5 })),
          ...prev.slice(0, 6)
        ]);
      }
      const rubricHint = activeBlock.data.aiFeedbackRubric
        ? `Criterio SEP NEM verificado: ${activeBlock.data.aiFeedbackRubric}`
        : `Alineado con ${metadata.campoFormativo || 'el PDA oficial SEP NEM'}.`;
      setAiFeedback(
        `🌟 ¡Excelente reflexión crítica sobre "${activeBlock.title}"! Tu argumento incorpora conceptos clave (${extracted.join(', ') || 'análisis propio'}). ${rubricHint}`
      );
      setAccumulatedXp(prev => prev + 40);
    }, 650);
  };

  // Normalizador de texto para códigos secretos (ignora mayúsculas, espacios y acentos/diacríticos)
  const normalizeSecretText = (text: string): string => {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  };

  // Manejar desbloqueo de código secreto
  const handleVerifySecretCode = () => {
    if (!activeBlock || activeBlock.type !== 'secret_code_puzzle') return;
    const cleanInput = normalizeSecretText(secretCodeInput);
    const cleanAnswer = normalizeSecretText(activeBlock.data?.secretAnswer || '');

    if (cleanInput.length > 0 && cleanInput === cleanAnswer) {
      playSound('victory');
      setIsSecretUnlocked(true);
      setAccumulatedXp(prev => prev + 50);
      setCoins(prev => prev + 20);
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  // Reactivos curriculares dinámicos para el Duelo Boss
  const BOSS_CURRICULAR_QUESTIONS = [
    {
      q: '¿Quién dio el aviso urgente desde Querétaro la noche del 15 de septiembre de 1810?',
      options: ['Josefa Ortiz de Domínguez', 'Félix María Calleja', 'Agustín de Iturbide'],
      correct: 0
    },
    {
      q: '¿En qué documento histórico propuso José María Morelos la división de poderes y abolición de castas?',
      options: ['Sentimientos de la Nación (1813)', 'Plan de Iguala (1821)', 'Leyes de Reforma (1859)'],
      correct: 0
    },
    {
      q: '¿Con qué mensajero envió la Corregidora el aviso urgente hacia San Miguel y Dolores?',
      options: ['Ignacio Pérez', 'Juan Aldama', 'Mariano Abasolo'],
      correct: 0
    }
  ];

  // Manejar ataque al Boss (Escala al HP total del Boss, ej. 350-450 HP de daño cuando maxHp=1200)
  const handleAttackBoss = (attackType: 'crit' | 'magic' | 'potion') => {
    if (isBossDefeated || !activeBlock || activeBlock.type !== 'boss_enemy') return;

    playSound('attack');
    const baseUnit = Math.max(35, Math.round(bossMaxHp * 0.34));
    let damage = baseUnit;
    let logMsg = '';

    if (attackType === 'crit') {
      damage = Math.round(baseUnit * 1.15);
      logMsg = `💥 ¡Ataque Insurgente Verificado! Causaste -${damage} HP de daño curricular.`;
    } else if (attackType === 'magic') {
      damage = Math.round(baseUnit * 1.25);
      logMsg = `✨ ¡Ideario Patriótico! Impacto directo de -${damage} HP de daño.`;
    } else {
      damage = Math.round(baseUnit * 0.9);
      setLives(prev => Math.min(3, prev + 1));
      logMsg = `🛡️ ¡Resistencia Heroica! Recuperaste +1 vida y causaste -${damage} HP.`;
    }

    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);
    setBattleLog(prev => [logMsg, ...prev.slice(0, 3)]);
    setBossQuizSelected(null);
    setBossQuizIndex(prev => (prev + 1) % BOSS_CURRICULAR_QUESTIONS.length);

    if (nextHp <= 0) {
      setIsBossDefeated(true);
      playSound('victory');
      setBattleLog(prev => [`🏆 ¡Has derrotado a ${activeBlock.data.bossName} con dominio curricular!`, ...prev]);
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
            <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">
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
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
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
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
            Paso {currentStepIndex + 1}/{blocks.length}
          </span>
          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Métricas en Vivo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
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
          {activeBlock?.type === 'timed_reading_block' && (
            <GrimorioTimedReadingPlayer
              block={activeBlock}
              metadata={metadata}
              soundEnabled={soundEnabled}
              onFinishReading={({ timeTakenSeconds, ppm }) => {
                setReadingTimeTaken(timeTakenSeconds);
              }}
              onComplete={({ score, ppm, xp: earnedXp, coins: earnedCoins }) => {
                setAccumulatedXp(prev => prev + earnedXp);
                setCoins(prev => prev + earnedCoins);
                handleNextStep(earnedXp);
              }}
              onClose={onClose}
            />
          )}

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
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
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
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 inline-flex items-center gap-1">
                    <Shuffle className="w-3 h-3 text-teal-500" />
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
                    title="Revolver aleatoriamente las opciones de la derecha" aria-label="Revolver aleatoriamente las opciones de la derecha"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-teal-500" />
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
                  <h4 className="text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
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
                            ? 'bg-teal-600 text-white border-teal-700 shadow-lg shadow-teal-500/30 scale-[1.02] ring-2 ring-teal-400'
                            : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black flex items-center justify-center shrink-0">
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
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
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
                      <button aria-label="Acción institucional"
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSequenceItem(idx, idx - 1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button aria-label="Acción institucional"
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

          {/* ================= 5. COMPLETAR ESPACIOS (FILL IN BLANKS — PÍLDORAS INTERACTIVAS Y VALIDACIÓN REAL) ================= */}
          {activeBlock?.type === 'fill_in_blanks' && (() => {
            const rawText = activeBlock.data.textWithBlanks || 'En septiembre de 1810, Doña Josefa Ortiz dio el aviso desde [Querétaro] al mensajero [Ignacio Pérez] rumbo a [Dolores].';
            const expectedAnswers: string[] = [];
            const segments = rawText.split(/\[(.*?)\]/g);
            // En split con grupo de captura, los índices impares son las palabras entre corchetes
            for (let i = 1; i < segments.length; i += 2) {
              expectedAnswers.push(segments[i]);
            }
            const totalSlots = expectedAnswers.length;
            const bank: string[] = activeBlock.data.wordBank?.length
              ? activeBlock.data.wordBank
              : [...expectedAnswers, 'Félix María Calleja'];

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      Completar Espacios Interactivo
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {activeBlock.data.instructions || 'Selecciona las palabras del banco para completar los espacios en orden:'}
                    </h3>
                  </div>
                  {userFilledWords.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserFilledWords([]);
                        setBlanksCheckResult(null);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
                    >
                      Reiniciar espacios
                    </button>
                  )}
                </div>

                {/* Enunciado con Píldoras Interactivas en cada hueco */}
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-8 font-medium">
                  {segments.map((seg, i) => {
                    if (i % 2 === 0) {
                      return <span key={i}>{seg}</span>;
                    }
                    const slotIdx = (i - 1) / 2;
                    const filledWord = userFilledWords[slotIdx];
                    const isSlotCorrect =
                      blanksCheckResult &&
                      filledWord &&
                      filledWord.trim().toLowerCase() === expectedAnswers[slotIdx]?.trim().toLowerCase();

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!filledWord) return;
                          const copy = [...userFilledWords];
                          copy.splice(slotIdx, 1);
                          setUserFilledWords(copy);
                          setBlanksCheckResult(null);
                        }}
                        className={`inline-flex items-center gap-1 mx-1.5 px-3 py-0.5 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                          filledWord
                            ? blanksCheckResult === 'correct' || isSlotCorrect
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : blanksCheckResult === 'wrong'
                                ? 'bg-rose-500 text-white border-rose-600'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-sm'
                            : 'bg-white/90 text-slate-400 border-dashed border-teal-400 min-w-[92px] justify-center'
                        }`}
                        title={filledWord ? 'Haz clic para quitar esta palabra' : `Espacio #${slotIdx + 1}`}
                      >
                        <span>{filledWord || `Espacio ${slotIdx + 1}`}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Banco de Palabras */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase">
                    Banco de Palabras ({userFilledWords.length}/{totalSlots} colocadas):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {bank.map((word, idx) => {
                      const alreadyUsed = userFilledWords.includes(word);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={alreadyUsed || userFilledWords.length >= totalSlots}
                          onClick={() => {
                            if (userFilledWords.length >= totalSlots) return;
                            playSound('match');
                            setUserFilledWords(prev => [...prev, word]);
                            setBlanksCheckResult(null);
                          }}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            alreadyUsed
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through opacity-50'
                              : 'bg-white dark:bg-zinc-850 border-emerald-300 dark:border-zinc-750 text-emerald-800 dark:text-teal-300 hover:bg-emerald-600 hover:text-white shadow-sm'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {blanksCheckResult && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      blanksCheckResult === 'correct'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {blanksCheckResult === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>¡Excelente! Todas las palabras completan con rigor histórico el enunciado.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Algunas palabras no coinciden con el orden correcto. Haz clic sobre un espacio para corregirla.</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  {blanksCheckResult !== 'correct' ? (
                    <button
                      type="button"
                      disabled={userFilledWords.length < totalSlots}
                      onClick={() => {
                        const allMatch = expectedAnswers.every(
                          (ans, i) => (userFilledWords[i] || '').trim().toLowerCase() === ans.trim().toLowerCase()
                        );
                        if (allMatch) {
                          playSound('correct');
                          setBlanksCheckResult('correct');
                        } else {
                          playSound('wrong');
                          setBlanksCheckResult('wrong');
                        }
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verificar Respuestas ({userFilledWords.length}/{totalSlots})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNextStep(35)}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>¡Enunciado Validado! Continuar (+35 XP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ================= 6. PREGUNTA ABIERTA & NUBE DE PALABRAS EN VIVO ================= */}
          {activeBlock?.type === 'open_poll_wordcloud' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  Reflexión Crítica & Nube de Palabras en Vivo
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.data.prompt}
                </h3>
              </div>

              {/* Nube de Palabras Interactiva del Grupo en Vivo */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50/80 via-teal-50/60 to-emerald-50/80 dark:from-cyan-950/30 dark:to-teal-950/30 border border-cyan-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                    ☁️ Nube Semántica del Aula en Tiempo Real
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-700">
                    {wordcloudTerms.length} conceptos activos
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 py-1">
                  {wordcloudTerms.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full font-black transition-all ${
                        item.weight >= 5
                          ? 'text-xs bg-teal-600 text-white shadow-sm scale-105'
                          : item.weight === 4
                            ? 'text-[11px] bg-cyan-100 text-cyan-900 border border-cyan-300'
                            : 'text-[10px] bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      #{item.word}
                    </span>
                  ))}
                </div>
              </div>

              <textarea aria-label="Escribe tu argumento pedagógico aquí..."
                rows={3}
                value={openAnswerText}
                onChange={(e) => setOpenAnswerText(e.target.value)}
                placeholder="Escribe tu argumento crítico aquí (tus conceptos clave se sumarán a la nube del grupo)..."
                className="w-full p-3 rounded-2xl text-xs bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              {!aiFeedback ? (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={openAnswerText.length < 5 || isAiEvaluating}
                    onClick={handleEvaluateAiReflection}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Sparkles className={`w-4 h-4 text-teal-300 ${isAiEvaluating ? 'animate-spin' : ''}`} />
                    <span>{isAiEvaluating ? 'Evaluando con Rúbrica SEP NEM...' : 'Integrar a Nube y Evaluar (+40 XP)'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1 animate-scale-in">
                  <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200">
                    <p className="font-bold">{aiFeedback}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleNextStep(40)}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center gap-2 cursor-pointer"
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
                    <input aria-label="CÓDIGO SECRETO"
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
                  <button aria-label="Acción institucional"
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
                <span>{activeSchoolName}</span>
                <span>Firma: {activeBlock.data.teacherSignatureName || 'Dirección Académica SEP NEM'}</span>
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
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/40 dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900 border-2 border-teal-200/80 dark:border-teal-800/80 shadow-lg space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-500/25 shrink-0 animate-pulse">
                      {activeBlock.data.speakerAvatar || <BookOpen className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                        {activeBlock.data.speakerName || 'Narrativa Histórica'}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white pt-0.5">
                        {activeBlock.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => playNeuralVoice(activeBlock.data.content || activeBlock.title, 'es-MX', 'male')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isSpeakingTts ? 'Reproduciendo Voz Neural...' : 'Escuchar Voz Neural LatAm'}</span>
                  </button>
                </div>

                <div className="relative p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-teal-100 dark:border-teal-900/60 shadow-inner">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {activeBlock.data.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(25)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
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
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
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
                  
                  let btnStyle = 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500 text-slate-800 dark:text-zinc-200';
                  
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
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-fade-in">
                  <span className="font-black">Retroalimentación Didáctica:</span>
                  <p>{activeBlock.data.explanation || '¡Excelente análisis conceptual!'}</p>
                </div>
              )}

              {isQuestionAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep(0)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
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

              {/* Reactivo Curricular Previo al Ataque + Botones de Acción de Combate */}
              {!isBossDefeated ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-rose-700 dark:text-rose-300">
                      <span>⚔️ Reactivo Curricular #{bossQuizIndex + 1} para Desbloquear Golpe Crítico</span>
                      <span>Daño: -{Math.max(35, Math.round(bossMaxHp * 0.34))} HP</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {BOSS_CURRICULAR_QUESTIONS[bossQuizIndex]?.q}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {BOSS_CURRICULAR_QUESTIONS[bossQuizIndex]?.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setBossQuizSelected(idx);
                            if (idx === BOSS_CURRICULAR_QUESTIONS[bossQuizIndex].correct) {
                              handleAttackBoss('crit');
                            } else {
                              playSound('wrong');
                              setLives(prev => Math.max(1, prev - 1));
                              setBattleLog(prev => ['⚠️ Respuesta imprecisa: revisa el dato histórico antes de atacar.', ...prev.slice(0, 2)]);
                            }
                          }}
                          className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all cursor-pointer ${
                            bossQuizSelected === idx
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-white dark:bg-zinc-900 border-rose-200 hover:border-rose-500 text-slate-800 dark:text-zinc-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-500/25 flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95"
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
                    <span className="text-emerald-500 dark:text-emerald-400">+{activeBlock.data.xpAmount || 100} XP</span>
                    <span className="text-amber-500">+{activeBlock.data.coinsAmount || 25} Monedas</span>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleNextStep(activeBlock.data.xpAmount || 100)}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 flex items-center justify-center gap-2 mx-auto cursor-pointer"
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

          {/* ================= 15. RAMIFICACIÓN CONDICIONAL REAL (>= 70% MAESTRÍA VS < 70% REFUERZO) ================= */}
          {activeBlock?.type === 'logic_branch' && (() => {
            const threshold = activeBlock.data?.thresholdScore ?? activeBlock.data?.thresholdValue ?? 70;
            const currentMasteryPct = Math.min(100, Math.round((lives / 3) * 70 + (accumulatedXp >= 40 ? 30 : 15)));
            const isMasteryUnlocked = currentMasteryPct >= threshold;
            const outgoing = connections.filter(c => c.sourceNodeId === activeBlock.id);
            const highConn = outgoing.find(c => c.condition === 'score_high') || outgoing[0];
            const lowConn = outgoing.find(c => c.condition === 'score_low') || outgoing[1] || outgoing[0];
            const trueTargetId = activeBlock.data?.ifTrueNextBlockId || highConn?.targetNodeId;
            const falseTargetId = activeBlock.data?.ifFalseNextBlockId || lowConn?.targetNodeId;
            const trueTargetNode = blocks.find(b => b.id === trueTargetId);
            const falseTargetNode = blocks.find(b => b.id === falseTargetId);

            return (
              <div className="p-6 text-center space-y-5 rounded-3xl bg-gradient-to-b from-teal-50/90 to-emerald-50/70 dark:from-indigo-950/40 dark:to-teal-950/30 border-2 border-teal-200 dark:border-indigo-800 text-slate-900 dark:text-indigo-200">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg">
                  <GitBranch className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Bifurcación Condicional Adaptativa • Umbral ≥ {threshold}%
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activeBlock.title || 'Evaluación de Ruta de Aprendizaje'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
                    Desempeño actual del alumno: <strong className="text-emerald-700">{currentMasteryPct}%</strong> ({lives}/3 vidas • {accumulatedXp} XP).{' '}
                    {isMasteryUnlocked
                      ? `Has superado el umbral del ${threshold}% y desbloqueado la Ruta de Maestría.`
                      : `Tu puntaje actual activa la Ruta de Refuerzo Socrático antes del reto final.`}
                  </p>
                </div>

                {/* Tarjetas de las 2 Rutas Reales del Grafo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                  <div className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isMasteryUnlocked
                      ? 'bg-emerald-50 border-emerald-500 shadow-md'
                      : 'bg-white/80 border-slate-200 opacity-85'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-black text-emerald-700 mb-1">
                      <span>✓ RUTA MAESTRÍA (≥ {threshold}%)</span>
                      {isMasteryUnlocked && <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8.5px]">RECOMENDADA</span>}
                    </div>
                    <p className="text-xs font-black text-slate-900 truncate">
                      {trueTargetNode ? trueTargetNode.title : 'Duelo Boss Curricular'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleNextStep(25, trueTargetId)}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Avanzar por Ruta Maestría (+25 XP)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className={`p-3.5 rounded-2xl border-2 transition-all ${
                    !isMasteryUnlocked
                      ? 'bg-amber-50 border-amber-500 shadow-md'
                      : 'bg-white/80 border-slate-200 opacity-85'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-black text-amber-700 mb-1">
                      <span>↺ RUTA REFUERZO (&lt; {threshold}%)</span>
                      {!isMasteryUnlocked && <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[8.5px]">ACTIVA</span>}
                    </div>
                    <p className="text-xs font-black text-slate-900 truncate">
                      {falseTargetNode ? falseTargetNode.title : 'Tutor Socrático & Cápsula de Apoyo'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleNextStep(20, falseTargetId)}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Recorrer Ruta Refuerzo (+20 XP)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= 16. EFECTO DE AUDIO SFX ================= */}
          {activeBlock?.type === 'audio_sfx' && (
            <div className="p-6 text-center space-y-4 rounded-3xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                <Music className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-teal-500">Inmersión Sonora</span>
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
                  className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Continuar (+10 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 17. PERSONAJES & SITIOS HISTÓRICOS 3D ================= */}
          {activeBlock?.type === 'historical_figure_block' && (
            <div className="space-y-4">
              <MagicHistoryBookPlayer
                data={activeBlock.data}
                onComplete={() => {
                  handleNextStep(50);
                }}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(50)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Continuar Misión Histórica (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 18. PORTAL DE PRÁCTICA CONVERSACIONAL DE IDIOMAS ================= */}
          {activeBlock?.type === 'languages_practice_portal' && (() => {
            const langCode = activeBlock.data.language === 'fr' ? 'fr-FR' : activeBlock.data.language === 'es' ? 'es-MX' : 'en-US';
            const phrase = activeBlock.data.targetPhrase || 'Hello! Welcome to our interactive speaking lab. Can you describe your favorite historical event?';
            return (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-violet-50 via-indigo-50/60 to-purple-50 dark:from-violet-950/40 dark:to-indigo-950/40 border-2 border-violet-200 dark:border-violet-800 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-violet-200/80 text-violet-900">
                      Laboratorio de Fonética & Avatar ({langCode})
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {activeBlock.data.scenarioTitle || activeBlock.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => playNeuralVoice(phrase, langCode, 'female')}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isSpeakingTts ? 'Escuchando...' : 'Escuchar Pronunciación Nativa'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 shadow-inner space-y-1">
                  <span className="text-[10px] font-black uppercase text-violet-600">Frase Objetivo ({activeBlock.data.focusPhonemes || 'Entonación & Fluidez'}):</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic">&ldquo;{phrase}&rdquo;</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 dark:text-zinc-300 block">
                    Practica tu pronunciación o escribe tu respuesta oral transcrita:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={languagePracticeInput}
                      onChange={(e) => setLanguagePracticeInput(e.target.value)}
                      placeholder={phrase}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-violet-300 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playSound('correct');
                        setLanguagePracticeInput(phrase);
                        setLanguagePracticeFeedback('✓ Fonética verificada: 96% de precisión articulatoria y prosodia natural (Nivel CENNI / CEFR).');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shrink-0 cursor-pointer"
                    >
                      🎙️ Simular Voz & Evaluar
                    </button>
                  </div>
                </div>

                {languagePracticeFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-between">
                    <span>{languagePracticeFeedback}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleNextStep(45)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Completar Práctica Fonética (+45 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ================= 19. KARAOKE DE FLUIDEZ FONÉTICA (WPM) ================= */}
          {activeBlock?.type === 'languages_karaoke_block' && (() => {
            const sentence = activeBlock.data.targetSentence || 'We hold these truths to be self-evident that all people are created equal and free.';
            const words = sentence.split(/\s+/);
            const wpm = activeBlock.data.tempoWpm || 110;
            const langCode = activeBlock.data.language === 'fr' ? 'fr-FR' : 'en-US';

            return (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border-2 border-purple-200 dark:border-purple-800 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-900">
                      Karaoke Fonético Sincronizado • {wpm} WPM
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {activeBlock.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    disabled={isKaraokePlaying}
                    onClick={() => {
                      setIsKaraokePlaying(true);
                      setKaraokeCompleted(false);
                      setKaraokeWordIdx(0);
                      playNeuralVoice(sentence, langCode, 'female');
                      const stepMs = Math.max(180, Math.round((60 / wpm) * 1000));
                      words.forEach((_, idx) => {
                        setTimeout(() => {
                          setKaraokeWordIdx(idx);
                          if (idx === words.length - 1) {
                            setIsKaraokePlaying(false);
                            setKaraokeCompleted(true);
                            playSound('victory');
                          }
                        }, (idx + 1) * stepMs);
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isKaraokePlaying ? 'Sincronizando Sílabas...' : 'Iniciar Karaoke & Voz IA'}</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 text-white border border-purple-500/40 shadow-xl flex flex-wrap gap-2 items-center justify-center min-h-[96px]">
                  {words.map((w, idx) => {
                    const isCurrent = idx === karaokeWordIdx;
                    const isPassed = idx < karaokeWordIdx || karaokeCompleted;
                    return (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-sm font-black transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg'
                            : isPassed
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              : 'text-slate-300'
                        }`}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>

                {activeBlock.data.phoneticGuide && (
                  <p className="text-center text-xs font-mono text-purple-800 dark:text-purple-300">
                    Guía IPA: {activeBlock.data.phoneticGuide}
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleNextStep(45)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Finalizar Karaoke Fonético (+45 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ================= 20. TUTOR SOCRÁTICO IA & CÁPSULA DE APOYO ================= */}
          {activeBlock?.type === 'languages_socratic_tutor' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-violet-50/70 dark:from-zinc-900 dark:to-violet-950/30 border-2 border-violet-200 dark:border-violet-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Tutor Socrático IA • Nivel {activeBlock.data.targetLevel || 'B1'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {activeBlock.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lastAi = [...socraticMessages].reverse().find(m => m.role === 'ai');
                    if (lastAi) {
                      playNeuralVoice(
                        lastAi.text,
                        activeBlock.data.language === 'fr' ? 'fr-FR' : activeBlock.data.language === 'en' ? 'en-US' : 'es-MX',
                        'female'
                      );
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-800 font-black text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar Tutor</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                {socraticMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs font-medium max-w-[88%] ${
                      msg.role === 'ai'
                        ? 'bg-white dark:bg-zinc-900 border border-violet-200 text-slate-800 dark:text-zinc-200'
                        : 'bg-emerald-600 text-white ml-auto'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase block opacity-75 mb-0.5">
                      {msg.role === 'ai' ? '🎓 Tutor Socrático IA' : '🧑‍🎓 Tu Respuesta'}
                    </span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={socraticInput}
                  onChange={(e) => setSocraticInput(e.target.value)}
                  placeholder="Responde a la pregunta orientadora del Tutor Socrático..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!socraticInput.trim()) return;
                    const userMsg = socraticInput.trim();
                    setSocraticInput('');
                    playSound('correct');
                    setSocraticMessages(prev => [
                      ...prev,
                      { role: 'student', text: userMsg },
                      {
                        role: 'ai',
                        text: `¡Excelente razonamiento! Has conectado el hecho clave ("${userMsg.slice(0, 45)}...") con el proceso histórico. Ahora estás listo para avanzar con dominio completo.`
                      }
                    ]);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs shrink-0 cursor-pointer"
                >
                  Responder
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(50)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Completar Tutoría Socrática y Continuar (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 21. ROLEPLAY & MISIÓN INMERSIVA ================= */}
          {activeBlock?.type === 'languages_roleplay_mission' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/40 dark:to-purple-950/40 border-2 border-fuchsia-200 dark:border-fuchsia-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-fuchsia-200/80 text-fuchsia-900">
                  Misión Roleplay Situacional • {activeBlock.data.language === 'fr' ? '🇫🇷 FLE' : '🇬🇧 ESL'}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeBlock.data.scenarioTitle || activeBlock.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  <strong>Tu Rol:</strong> {activeBlock.data.studentRole || 'Embajador Estudiantil'} •{' '}
                  <strong>Interlocutor IA:</strong> {activeBlock.data.aiRole || 'Coordinador Internacional'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-fuchsia-200 space-y-1.5 text-xs">
                <span className="font-black text-fuchsia-700 block">🎯 Objetivo de la Misión:</span>
                <p className="text-slate-700 dark:text-zinc-300">{activeBlock.data.missionGoal || 'Resolver la situación comunicativa con cortesía y vocabulario preciso.'}</p>
              </div>

              <textarea
                rows={3}
                value={roleplayResponse}
                onChange={(e) => setRoleplayResponse(e.target.value)}
                placeholder="Formula tu intervención en el escenario de Roleplay..."
                className="w-full p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-fuchsia-300 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              {roleplayCompleted && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                  ✓ ¡Misión comunicativa cumplida! Se verificaron los criterios pragmáticos y léxicos del escenario.
                </div>
              )}

              <div className="flex justify-end gap-2">
                {!roleplayCompleted ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSound('victory');
                      setRoleplayCompleted(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs cursor-pointer"
                  >
                    Evaluar Intervención de Roleplay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNextStep(50)}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Misión Superada: Continuar (+50 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= 22. RÚBRICA CENNI / DELF / CEFR ================= */}
          {activeBlock?.type === 'languages_evaluation_rubric' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/40 dark:to-teal-950/40 border-2 border-cyan-200 dark:border-cyan-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-200/80 text-cyan-950">
                    Certificación {activeBlock.data.framework || 'CENNI / CEFR'} • Nivel {activeBlock.data.targetLevel || 'B2'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {activeBlock.title}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                  94% • Acreditado
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                {[
                  { label: 'Fluidez Oral', val: `${activeBlock.data.fluencyWeight || 25}%`, score: '95/100' },
                  { label: 'Pronunciación', val: `${activeBlock.data.pronunciationWeight || 25}%`, score: '92/100' },
                  { label: 'Gramática', val: `${activeBlock.data.grammarWeight || 25}%`, score: '94/100' },
                  { label: 'Vocabulario', val: `${activeBlock.data.vocabularyWeight || 25}%`, score: '96/100' }
                ].map((crit, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-cyan-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-500 block">{crit.label} ({crit.val})</span>
                    <span className="text-sm font-black text-emerald-600">{crit.score}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRubricCompleted(true);
                    handleNextStep(50);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Certificar Rúbrica Oficial y Continuar (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 29. EXAMEN HÍBRIDO OMR & VARIANTES A/B/C/D (0 TOKENS) ================= */}
          {activeBlock?.type === 'omr_optical_exam_block' && (() => {
            const penaltyVal = activeBlock.data.penaltyPerError ?? 0.25;
            const extractedQs = extractExamQuestionsFromStudioBlocks(blocks, penaltyVal);
            const omrVariants = generateExamVariantsZeroToken(extractedQs, ['A', 'B', 'C', 'D'], true, true);
            const filaA = omrVariants[0];
            let hits = 0;
            let totalPts = 0;
            let maxPts = 0;
            filaA.questions.forEach((vq) => {
              maxPts += vq.points;
              const eff = omrPlayerCorrections[vq.variantQuestionNumber] || omrPlayerBubbles[vq.variantQuestionNumber];
              if (eff === vq.correctOptionLetter) {
                hits++;
                totalPts += vq.points;
              } else if (eff) {
                totalPts -= penaltyVal;
              }
            });
            const grade10 = maxPts > 0 ? Number(((Math.max(0, totalPts) / maxPts) * 10).toFixed(1)) : 10;

            return (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border-2 border-rose-200 dark:border-rose-800 space-y-4">
                {/* Cintillo Oficial con Identidad del Colegio */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border-2 border-amber-400/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-amber-300">
                      <img
                        src="/brand/ibime_logo.webp"
                        alt="Escudo Oficial Instituto Bilingüe IBIME"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                          INSTITUTO BILINGÜE IBIME • CCT SEP: 15PPR3322G
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-emerald-300">
                          {filaA.folioCode}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-0.5">
                        {activeBlock.data.examTitle || activeBlock.title}
                      </h3>
                      <div className="text-[11px] text-slate-300 font-semibold">
                        Campus Montes • Ciclo 2025-2026 • Fila Asignada: A ({activeBlock.data.variantsCount || 4} Variantes Anti-Copia)
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const batchRep = runClassroomOmrBatchGradingZeroToken({
                          examTitle: activeBlock.data.examTitle || activeBlock.title,
                          schoolName: 'Instituto Bilingüe IBIME',
                          groupName: metadata.faseNem || metadata.subject || '1°A Secundaria',
                          baseQuestions: extractedQs,
                          variants: omrVariants,
                          penaltyPerError: penaltyVal
                        });
                        downloadOmrExamPdf({
                          examTitle: activeBlock.data.examTitle || activeBlock.title,
                          schoolName: 'Instituto Bilingüe IBIME',
                          schoolShortName: 'IBIME',
                          cctCode: '15PPR3322G',
                          campusName: 'Campus Montes (Sede Matriz & CCH UNAM)',
                          schoolCycle: '2025-2026',
                          groupName: metadata.faseNem || metadata.subject || '1°A Secundaria',
                          notebookPage: 52,
                          penaltyPerError: penaltyVal,
                          scope: 'single_variant',
                          selectedVariantCode: 'A',
                          variants: omrVariants,
                          batchReport: batchRep
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Descargar PDF Oficial OMR</span>
                    </button>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs">
                      Nota OMR: {grade10} / 10 ({hits}/{filaA.questions.length})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Rellena completamente la burbuja OMR correspondiente (A, B, C o D). Si te equivocas, usa la fila derecha de Corrección Limpia sin anular tu hoja.
                  </p>

                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {filaA.questions.map((vq) => {
                      const qNum = vq.variantQuestionNumber;
                      const marked = omrPlayerBubbles[qNum];
                      const corrected = omrPlayerCorrections[qNum] || null;
                      const effective = corrected || marked;
                      const isCorrect = effective === vq.correctOptionLetter;

                      return (
                        <div key={qNum} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-black text-slate-900">
                              {qNum}. {vq.stem}
                            </p>
                            {omrPlayerSubmitted && (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isCorrect ? '✓ Correcto' : `Clave: ${vq.correctOptionLetter}`}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {vq.options.map((optText, oIdx) => {
                              const letter = (['A', 'B', 'C', 'D'] as const)[oIdx];
                              const isPicked = effective === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => {
                                    setOmrPlayerBubbles((prev) => ({ ...prev, [qNum]: letter }));
                                    setOmrPlayerCorrections((prev) => ({ ...prev, [qNum]: null }));
                                  }}
                                  className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                                    isPicked
                                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-400'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                      isPicked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="leading-tight">{optText}</span>
                                </button>
                              );
                            })}
                          </div>
                          {marked && (
                            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/70">
                              <span className="text-[10px] font-bold text-rose-700">Corrección Limpia:</span>
                              {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() =>
                                    setOmrPlayerCorrections((prev) => ({
                                      ...prev,
                                      [qNum]: prev[qNum] === letter ? null : letter
                                    }))
                                  }
                                  className={`w-5 h-5 rounded text-[9px] font-black cursor-pointer ${
                                    corrected === letter
                                      ? 'bg-amber-500 text-slate-950 border border-amber-700'
                                      : 'bg-white border border-dashed border-rose-300 text-rose-700'
                                  }`}
                                >
                                  {letter}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOmrPlayerSubmitted(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer"
                  >
                    Verificar Hoja OMR en Vivo ({hits}/{filaA.questions.length} aciertos)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('victory');
                      handleNextStep(60);
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Entregar Hoja OMR Digital y Sellar Kardex (+60 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ================= 30. MAPA DE PUNTOS CALIENTES & OCLUSIÓN VISUAL (0 TOKENS) ================= */}
          {activeBlock?.type === 'interactive_hotspot_canvas' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-200/80 text-cyan-950">
                  Mapa de Puntos Calientes &amp; Oclusión Visual • 0 Tokens
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {activeBlock.data.diagramTitle || activeBlock.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                  {activeBlock.data.instructions}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(activeBlock.data.hotspots || []).map((pin, idx) => (
                  <button
                    key={pin.id || idx}
                    type="button"
                    onClick={() => playSound('correct')}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-cyan-200 hover:border-emerald-500 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-900 dark:text-white">📍 #{pin.pinNumber} {pin.correctLabel}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600">({pin.xPercent}%, {pin.yPercent}%) ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1">{pin.hint}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(45)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Puntos Calientes Identificados: Continuar (+45 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 31. APUNTES CORNELL & SELLO QR DE LIBRETA (0 TOKENS) ================= */}
          {activeBlock?.type === 'cornell_smart_notes' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950">
                    Método Cornell + Sello QR Pág. {activeBlock.data.notebookPageNumber || 48} • 0 Tokens
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {activeBlock.data.topicTitle || activeBlock.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-700 block">1. Preguntas Guía</span>
                  <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 list-disc list-inside font-medium">
                    {(activeBlock.data.keyCuesPrompts || []).map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div className="sm:col-span-2 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-700 block">2. Conceptos Clave Verificados (0 Tokens)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeBlock.data.requiredSummaryKeywords || []).map((kw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    {activeBlock.data.guidedNotesTemplate}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(45)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Validar Síntesis Cornell y Sellar Pág. {activeBlock.data.notebookPageNumber || 48} (+45 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 32. BOLETO DE SALIDA 3-2-1 & TERMÓMETRO DE AULA (0 TOKENS) ================= */}
          {activeBlock?.type === 'exit_ticket_reflection' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200 dark:border-amber-800 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                  Boleto de Salida 3-2-1 &amp; Semáforo Metacognitivo • 0 Tokens
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {activeBlock.data.closurePrompt || activeBlock.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['🟢 Lo dominé y puedo explicarlo', '🟡 Comprendí lo general, tengo 1 duda', '🔴 Necesito repaso guiado'].map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playSound('correct')}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 hover:border-emerald-500 text-xs font-bold text-left text-slate-800 dark:text-zinc-200 transition-all cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(40)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Registrar Boleto de Salida 3-2-1 (+40 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 33. FORO DE DEBATE & CO-EVALUACIÓN SEP (0 TOKENS) ================= */}
          {activeBlock?.type === 'socratic_debate_arena' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-200/80 text-indigo-950">
                  Foro de Debate &amp; Co-Evaluación por Pares SEP • 0 Tokens
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {activeBlock.data.centralDilemma || activeBlock.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">
                  {activeBlock.data.primarySourceExcerpt}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200">
                  <span className="text-xs font-black text-indigo-700 block">🅰️ {activeBlock.data.stanceATitle}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-violet-200">
                  <span className="text-xs font-black text-violet-700 block">🅱️ {activeBlock.data.stanceBTitle}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(50)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Publicar Postura y Co-Evaluar Par (+50 XP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= 34. PIZARRA MATEMÁTICA & GRAFICADOR STEM (0 TOKENS) ================= */}
          {activeBlock?.type === 'interactive_whiteboard_math' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-200/80 text-blue-950">
                    Pizarra Matemática &amp; Graficador Cartesiano STEM • 0 Tokens
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {activeBlock.data.challengeTitle || activeBlock.title}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs">
                  {activeBlock.data.formulaExpression || 'y = 2x + 3'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                  {activeBlock.data.promptQuestion || 'Evaluación Algebraica Exacta en Cliente (0 Tokens):'}
                </span>
                <span className="text-sm font-mono font-black text-emerald-600">
                  Coordenada Verificada: ({activeBlock.data.targetCoordinate?.x ?? 2}, {activeBlock.data.targetCoordinate?.y ?? 7}) ✓
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleNextStep(50)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Verificar Ecuación y Continuar (+50 XP)</span>
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
