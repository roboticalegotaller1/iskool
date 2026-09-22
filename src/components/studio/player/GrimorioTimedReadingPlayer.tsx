"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimedReadingBlock, ComprehensionQuestion } from '@/types/studioBlocks';
import { selectHistoricalSpeechVoice, stopAllIskoolAudio } from '@/lib/historicalVoiceEngine';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Pause, 
  Play, 
  Zap, 
  ShieldAlert, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Bookmark, 
  Gauge, 
  Type, 
  Info, 
  X,
  Target,
  Trophy,
  Maximize2,
  Image as ImageIcon,
  Swords
} from 'lucide-react';

interface Props {
  block: TimedReadingBlock;
  metadata?: any;
  onFinishReading?: (stats: { timeTakenSeconds: number; ppm: number }) => void;
  onComplete?: (results: { score: number; ppm: number; xp: number; coins: number; feedback: string }) => void;
  soundEnabled?: boolean;
  onClose?: () => void;
}

// Tipo polimórfico de folio en el grimorio
export type GrimoireFolio = 
  | {
      type: 'text';
      content: string;
      isFirstPageOfBook?: boolean;
    }
  | {
      type: 'illustration';
      imageUrl: string;
      caption: string;
    };

export const GrimorioTimedReadingPlayer: React.FC<Props> = ({
  block,
  metadata,
  onFinishReading,
  onComplete,
  soundEnabled = true,
  onClose
}) => {
  const {
    readingText = '',
    timeLimitSeconds = 60,
    comprehensionQuestions = [],
    wordCount = 0,
    chapterTitle = '',
    faseNem = '',
    discipline = '',
    pedagogicalAxiom = '',
    pedagogicalAxiomTitle = ''
  } = block.data;

  // Valores dinámicos del título y encabezados configurados por el docente
  const dynamicChapterTitle = chapterTitle || block.title || 'El Misterio Cinético del Calor';
  const dynamicFaseNem = faseNem || metadata?.faseNem || 'NEM FASE 6 · SABER FUNDAMENTAL';
  const dynamicDiscipline = discipline || metadata?.subject || 'FÍSICA ARCANO-TÉRMICA';
  const dynamicAxiomText = pedagogicalAxiom?.trim() || '';
  const dynamicAxiomTitle = pedagogicalAxiomTitle?.trim() || 'Axioma de Comprensión Pedagógica';

  // Texto canónico por defecto si el docente aún no ha ingresado texto
  const defaultCanonText = `En las profundidades del universo observable, la materia jamás reposa en absoluto estatismo. Lo que los antiguos hechiceros llamaban Fuego Primordial, los sabios contemporáneos de la física corpuscular lo conciben como la agitación molecular incesante.

La Temperatura no constituye un fluido corpóreo ni una sustancia misteriosa (como sugería el arcaico principio del calórico), sino la manifestación directa de la energía cinética promedio que poseen las partículas microscópicas en su ininterrumpida danza de choque y vibración.

![Lámina Científica: Teoría Cinética del Calor y Flujo Térmico](/images/studio/calor_termodinamica_folio.jpg)

Cuando dos cuerpos a distintas temperaturas entran en contacto térmico, el flujo espontáneo de energía siempre viaja desde la región de mayor excitación molecular hacia la de menor agitación, hasta alcanzar la perfecta quietud del Equilibrio Térmico (Te).

Al comprender que el calor representa la transferencia energética derivada de un desbalance térmico, el explorador del saber no invoca fuegos mágicos de la nada: reorganiza las colisiones moleculares de su entorno hacia el Equilibrio Dinámico y el Dominio Científico.`;

  const activeReadingText = readingText.trim() ? readingText : defaultCanonText;

  // Cálculo de palabras reales (excluyendo la sintaxis markdown de imágenes)
  const totalWords = useMemo(() => {
    if (wordCount) return wordCount;
    const cleanText = activeReadingText.replace(/!\[.*?\]\(.*?\)/g, '');
    return cleanText.trim().split(/\s+/).filter(Boolean).length;
  }, [activeReadingText, wordCount]);

  // Estados del Reproductor
  const [phase, setPhase] = useState<'reading' | 'combat' | 'results'>('reading');
  const [secondsLeft, setSecondsLeft] = useState<number>(timeLimitSeconds || 60);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'base' | 'lg'>('base');
  const [showRuneGuide, setShowRuneGuide] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption: string } | null>(null);

  // Estados del Ebook 3D y Paginación
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [mobileActiveFolio, setMobileActiveFolio] = useState<'left' | 'right'>('left');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // =========================================================================
  // MOTOR DE VOZ 100% HUMANA NEURAL DE ESTUDIO (Sin sintetizador robótico)
  // =========================================================================
  const HUMAN_NEURAL_VOICES = useMemo(() => [
    { id: 'es-MX-DaliaNeural', label: 'Dalia (México) · Mentora', badge: '100% Humana', tag: 'Femenina Cálida & Dulce' },
    { id: 'es-MX-JorgeNeural', label: 'Jorge (México) · Profesor', badge: '100% Humana', tag: 'Masculina Serena & Madura' },
    { id: 'es-US-PalomaNeural', label: 'Paloma (Latina) · Narradora', badge: '100% Humana', tag: 'Femenina Dinámica & Moderna' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Colombia) · Cronista', badge: '100% Humana', tag: 'Masculina Elegante & Serena' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Colombia) · Didáctica', badge: '100% Humana', tag: 'Femenina Acento Neutro' },
    { id: 'es-AR-ElenaNeural', label: 'Elena (Argentina) · Expresiva', badge: '100% Humana', tag: 'Femenina Rioplatense' },
  ], []);

  const [selectedNeuralVoice, setSelectedNeuralVoice] = useState<string>('es-MX-DaliaNeural');
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sintetizador Web Audio nativo para efectos de libro antiguo y combate
  const playSfx = (type: 'page_flip' | 'seal' | 'hit' | 'correct' | 'wrong' | 'victory') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'page_flip') {
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25);
        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start();
      } else if (type === 'seal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'correct') {
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'victory') {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
        });
      }
    } catch {
      // Ignorar fallback
    }
  };

  // =========================================================================
  // MOTOR DE PAGINACIÓN AUTOMÁTICA INTELIGENTE & DETECCIÓN DE IMÁGENES
  // =========================================================================
  const bookFolios = useMemo<GrimoireFolio[]>(() => {
    const folios: GrimoireFolio[] = [];
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const processTextChunk = (chunk: string) => {
      const paragraphs = chunk.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      if (paragraphs.length === 0) return;

      // Agrupar párrafos en folios legibles (~1 o 2 párrafos por folio)
      for (let i = 0; i < paragraphs.length; i += 2) {
        const pageText = paragraphs.slice(i, i + 2).join('\n\n');
        folios.push({
          type: 'text',
          content: pageText,
          isFirstPageOfBook: folios.length === 0
        });
      }
    };

    while ((match = imageRegex.exec(activeReadingText)) !== null) {
      // 1. Procesar el texto previo a la imagen
      const textBefore = activeReadingText.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        processTextChunk(textBefore);
      }

      // 2. La imagen detectada crea en automático un FOLIO COMPLETO DEDICADO
      folios.push({
        type: 'illustration',
        caption: match[1] || 'Lámina Curricular Ilustrada',
        imageUrl: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // 3. Procesar el texto restante posterior a la última imagen
    const remainingText = activeReadingText.substring(lastIndex);
    if (remainingText.trim()) {
      processTextChunk(remainingText);
    }

    if (folios.length === 0) {
      folios.push({
        type: 'text',
        content: activeReadingText,
        isFirstPageOfBook: true
      });
    }

    return folios;
  }, [activeReadingText]);

  // Identificador del último folio de texto para colocar el axioma solo si fue redactado
  const lastTextFolioIndex = useMemo(() => {
    for (let i = bookFolios.length - 1; i >= 0; i--) {
      if (bookFolios[i].type === 'text') return i;
    }
    return -1;
  }, [bookFolios]);

  // Emparejamiento en Spreads de doble página (Folio Izquierdo y Folio Derecho)
  const spreads = useMemo<{ 
    leftFolio: GrimoireFolio; 
    rightFolio: GrimoireFolio | null; 
    leftIdx: number; 
    rightIdx: number | null 
  }[]>(() => {
    const res = [];
    for (let i = 0; i < bookFolios.length; i += 2) {
      res.push({
        leftFolio: bookFolios[i],
        rightFolio: bookFolios[i + 1] || null,
        leftIdx: i,
        rightIdx: i + 1 < bookFolios.length ? i + 1 : null
      });
    }
    return res.length > 0 ? res : [{ 
      leftFolio: { type: 'text', content: activeReadingText, isFirstPageOfBook: true }, 
      rightFolio: null, 
      leftIdx: 0, 
      rightIdx: null 
    }];
  }, [bookFolios, activeReadingText]);

  const currentSpread = spreads[currentSpreadIndex] || spreads[0];

  // Cronómetro y conteo de tiempo
  useEffect(() => {
    if (phase !== 'reading' || isPaused) return;

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSealAndCombat();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  // PPM calculado en tiempo real
  const currentPpm = useMemo(() => {
    const minutes = Math.max(0.08, secondsElapsed / 60);
    const estimatedProgress = Math.min(1, (currentSpreadIndex + 1) / spreads.length);
    const estimatedReadWords = Math.max(20, Math.round(totalWords * estimatedProgress));
    return Math.round(estimatedReadWords / minutes);
  }, [secondsElapsed, currentSpreadIndex, totalWords, spreads.length]);

  const readingProgressPercent = useMemo(() => {
    return Math.min(100, Math.round(((currentSpreadIndex + 1) / spreads.length) * 100));
  }, [currentSpreadIndex, spreads.length]);

  // Detención completa y segura de cualquier audio activo
  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    stopAllIskoolAudio();
    setIsSpeaking(false);
    setIsAudioLoading(false);
  };

  // Navegación con efecto Ebook 3D
  const handleNextPage = () => {
    stopAllAudio();
    if (currentSpreadIndex < spreads.length - 1 && !isFlipping) {
      setIsFlipping(true);
      playSfx('page_flip');
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev + 1);
        setMobileActiveFolio('left');
        setIsFlipping(false);
      }, 350);
    }
  };

  const handlePrevPage = () => {
    stopAllAudio();
    if (currentSpreadIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      playSfx('page_flip');
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev - 1);
        setMobileActiveFolio('left');
        setIsFlipping(false);
      }, 350);
    }
  };

  const handleNextMobileFolio = () => {
    if (mobileActiveFolio === 'left' && currentSpread.rightFolio) {
      setMobileActiveFolio('right');
      playSfx('page_flip');
    } else {
      handleNextPage();
    }
  };

  const handlePrevMobileFolio = () => {
    if (mobileActiveFolio === 'right') {
      setMobileActiveFolio('left');
      playSfx('page_flip');
    } else {
      handlePrevPage();
      if (currentSpreadIndex > 0) {
        setMobileActiveFolio('right');
      }
    }
  };

  // Reproducción de Voz 100% Humana Neural (Calidad Estudio HD)
  const toggleSpeech = async () => {
    if (isSpeaking) {
      stopAllAudio();
      return;
    }

    // Extraer texto a narrar de las páginas actuales del spread
    const texts: string[] = [];
    if (currentSpread.leftFolio.type === 'text') {
      texts.push(currentSpread.leftFolio.content);
    } else {
      texts.push(`Lámina ilustrada: ${currentSpread.leftFolio.caption}`);
    }

    if (currentSpread.rightFolio) {
      if (currentSpread.rightFolio.type === 'text') {
        texts.push(currentSpread.rightFolio.content);
      } else {
        texts.push(`Lámina ilustrada: ${currentSpread.rightFolio.caption}`);
      }
    }

    const rawText = texts.join('. ');
    const cleanText = rawText
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/[*_#`~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    setIsAudioLoading(true);
    const cacheKey = `${selectedNeuralVoice}_${speechRate}_${cleanText}`;

    try {
      let audioUrl = audioCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: selectedNeuralVoice,
            rate: speechRate,
            role: 'narrator',
            narratorMode: 'wisdom_guide'
          })
        });

        if (!response.ok) {
          throw new Error(`TTS server responded with ${response.status}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      }

      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }

      const audio = audioPlayerRef.current;
      audio.src = audioUrl;
      audio.playbackRate = speechRate;

      audio.onended = () => {
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsAudioLoading(false);
      };

      await audio.play();
      setIsAudioLoading(false);
      setIsSpeaking(true);
    } catch (err) {
      console.warn('Fallback a síntesis local debido a:', err);
      setIsAudioLoading(false);

      // Fallback a SpeechSynthesis del navegador con bloqueo anti-castellano
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const isMaleVoice = /jorge|gonzalo|alex|alonso|tomas|luis|emilio|juan|manuel/i.test(selectedNeuralVoice);
        const certifiedVoice = selectHistoricalSpeechVoice(isMaleVoice ? 'male' : 'female');
        if (certifiedVoice) {
          utterance.voice = certifiedVoice;
        }
        utterance.lang = 'es-MX';
        utterance.rate = 0.95 * speechRate;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleSealAndCombat = () => {
    stopAllAudio();
    playSfx('seal');
    if (onFinishReading) {
      onFinishReading({ timeTakenSeconds: secondsElapsed, ppm: currentPpm });
    }
    setPhase('combat');
  };

  // Preguntas de comprensión formativas
  const questionsList = useMemo<ComprehensionQuestion[]>(() => {
    if (comprehensionQuestions && comprehensionQuestions.length > 0) {
      return comprehensionQuestions;
    }
    return [
      {
        id: 'q-canon-1',
        question: '¿Qué es la Temperatura según la física corpuscular?',
        options: [
          'La energía cinética promedio de las partículas en constante choque y vibración',
          'Un fluido misterioso e invisible llamado calórico',
          'La masa total acumulada en reposo dentro del átomo',
          'Una corriente magnética generada por la quietud de la materia'
        ],
        correctIndex: 0,
        explanation: 'La temperatura refleja directamente la agitación y energía cinética promedio de las partículas moleculares.'
      },
      {
        id: 'q-canon-2',
        question: '¿Hacia qué dirección viaja el flujo espontáneo de calor entre dos cuerpos?',
        options: [
          'Desde la región de menor agitación hacia la de mayor excitación',
          'Desde el cuerpo con mayor excitación molecular hacia el de menor agitación',
          'Permanece estático sin importar las diferencias de temperatura',
          'Únicamente se transmite si existe gravedad cero'
        ],
        correctIndex: 1,
        explanation: 'El flujo térmico espontáneo se transfiere de la zona con mayor energía térmica a la de menor temperatura.'
      },
      {
        id: 'q-canon-3',
        question: '¿Cómo se denomina el estado donde cesa la transferencia neta de calor?',
        options: [
          'Entropía Máxima de Destrucción',
          'Fluido Calórico Congelado',
          'Equilibrio Térmico (Te)',
          'Fuego Primordial Absoluto'
        ],
        correctIndex: 2,
        explanation: 'El Equilibrio Térmico se alcanza cuando ambos cuerpos igualan su energía cinética media.'
      }
    ];
  }, [comprehensionQuestions]);

  // Estados de Combate contra el Boss
  const maxBossHp = 1200;
  const [bossHp, setBossHp] = useState<number>(maxBossHp);
  const [bossIsDamaged, setBossIsDamaged] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [questionFeedback, setQuestionFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  const [finalReport, setFinalReport] = useState<{
    scorePercent: number;
    ppm: number;
    xpEarned: number;
    coinsEarned: number;
    speedTier: string;
  } | null>(null);

  const handleAnswerCombatQuestion = (optionIdx: number) => {
    const currentQ = questionsList[currentQuestionIdx];
    if (!currentQ || answeredQuestions[currentQ.id]) return;

    const isCorrect = optionIdx === currentQ.correctIndex;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optionIdx }));
    setAnsweredQuestions(prev => ({ ...prev, [currentQ.id]: true }));

    if (isCorrect) {
      playSfx('hit');
      playSfx('correct');
      setBossIsDamaged(true);
      const damagePerHit = Math.ceil(maxBossHp / questionsList.length);
      setBossHp(prev => Math.max(0, prev - damagePerHit));

      setQuestionFeedback({
        isCorrect: true,
        text: `¡GOLPE CRÍTICO! -${damagePerHit} HP. ${currentQ.explanation || '¡Respuesta impecable!'}`
      });

      setTimeout(() => setBossIsDamaged(false), 600);
    } else {
      playSfx('wrong');
      setQuestionFeedback({
        isCorrect: false,
        text: `¡Defensa del Boss resiste! ${currentQ.explanation || 'La respuesta correcta era: ' + currentQ.options[currentQ.correctIndex]}`
      });
    }

    setTimeout(() => {
      setQuestionFeedback(null);
      if (currentQuestionIdx < questionsList.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        concludeBattle();
      }
    }, 1800);
  };

  const concludeBattle = () => {
    let correctCount = 0;
    questionsList.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const totalQ = questionsList.length || 1;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const minutes = Math.max(0.15, secondsElapsed / 60);
    const finalPpm = Math.round(totalWords / minutes);

    let speedTier = 'Adecuado';
    if (finalPpm >= 160) speedTier = 'Avanzado / Maestro';
    else if (finalPpm >= 130) speedTier = 'Óptimo (130-160 PPM)';
    else if (finalPpm >= 90) speedTier = 'Adecuado';
    else speedTier = 'En Formación';

    const xpEarned = Math.round(150 * (scorePct / 100)) + (finalPpm >= 130 ? 50 : 20);
    const coinsEarned = Math.round(35 * (scorePct / 100)) + (finalPpm >= 130 ? 15 : 5);

    const report = {
      scorePercent: scorePct,
      ppm: finalPpm,
      xpEarned,
      coinsEarned,
      speedTier
    };

    setFinalReport(report);
    setPhase('results');
    playSfx('victory');

    if (onComplete) {
      onComplete({
        score: scorePct,
        ppm: finalPpm,
        xp: xpEarned,
        coins: coinsEarned,
        feedback: `¡Misión completada a ${finalPpm} PPM con ${scorePct}% de comprensión!`
      });
    }
  };

  const toRoman = (num: number) => {
    const lookup: Record<string, number> = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    let n = num;
    for (const i in lookup) {
      while (n >= lookup[i]) {
        roman += i;
        n -= lookup[i];
      }
    }
    return roman || 'I';
  };

  // Renderizado dinámico de un Folio individual (Texto o Lámina Ilustrada Completa)
  const renderFolio = (folio: GrimoireFolio | null, folioIndex: number, isRightSide: boolean) => {
    const lateralPadding = isRightSide 
      ? 'pl-3 sm:pl-6 pr-6 sm:pr-10 py-1' 
      : 'pl-6 sm:pl-10 pr-3 sm:pr-6 py-1';

    if (!folio) {
      // Folio final de cierre con Sello Arcano
      return (
        <div className={`flex-1 flex flex-col justify-start relative z-10 text-[#2b1810] h-full ${lateralPadding}`}>
          {/* Cabecera del Folio de Cierre */}
          <div className="border-b border-[#8c6d48]/40 pb-2 mb-3 flex items-center justify-between text-[11px] font-serif font-black tracking-widest uppercase text-[#5a3825]">
            <span className="flex items-center gap-1">
              {dynamicDiscipline} ✧
            </span>
            <span className="font-bold text-[#7d5236]">
              Folio {toRoman(folioIndex + 1)}
            </span>
          </div>

          {/* Subtítulo de Cierre */}
          <div className="space-y-1 mb-3 pb-2 border-b border-[#8c6d48]/25 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8b5a2b] block">
              {dynamicFaseNem} · CONCLUSIÓN DEL SABER
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1f120c] leading-tight">
              Sello del Tratado Curricular
            </h3>
          </div>

          {/* Contenido Central del Cierre */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full mx-auto bg-gradient-to-br from-[#8c6d48]/25 to-[#5c2416]/20 border-2 border-[#8c6d48] flex items-center justify-center shadow-md">
                <Bookmark className="w-8 h-8 sm:w-9 sm:h-9 text-[#5c2416]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600 border border-amber-300 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#2e170c]">
                Fin de la Lectura Guiada
              </h4>
              <p className="font-serif text-xs text-[#523320] leading-relaxed">
                Has recorrido la totalidad de los folios y láminas de este saber. Revisa los conceptos o pulsa <strong>¡Sellar y Combatir!</strong> para iniciar el reto de retención cognitiva.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSealAndCombat}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#5c2416] to-[#8b3a24] hover:from-[#732e1d] hover:to-[#a2452d] text-amber-100 font-serif font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 border border-amber-600/40 hover:scale-105 active:scale-95"
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span>¡Sellar y Combatir!</span>
            </button>
          </div>

          {/* Pie de Folio de Cierre */}
          <div className="pt-3 border-t border-[#8c6d48]/40 flex items-center justify-between text-[10px] font-serif text-[#7d5236] font-bold mt-auto">
            <span>Sello Arcano de Sabiduría</span>
            <span>Folio {toRoman(folioIndex + 1)}</span>
          </div>
        </div>
      );
    }

    // CASO A: LÁMINA ILUSTRADA DE HOJA COMPLETA
    if (folio.type === 'illustration') {
      return (
        <div className={`flex-1 flex flex-col justify-between relative z-10 text-[#2b1810] h-full ${lateralPadding}`}>
          {/* Cabecera de la Lámina */}
          <div className="border-b border-[#8c6d48]/40 pb-2 mb-2 flex items-center justify-between text-[11px] font-serif font-black tracking-widest uppercase text-[#5a3825]">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#8b3a24]" />
              {isRightSide ? `${dynamicDiscipline} ✧` : `✦ ${dynamicDiscipline}`}
            </span>
            <span className="font-bold text-[#7d5236]">
              Folio {toRoman(folioIndex + 1)}
            </span>
          </div>

          <div className="space-y-0.5 mb-2 pb-1.5 border-b border-[#8c6d48]/25">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8b5a2b] block">
              {dynamicFaseNem} · LÁMINA ILUSTRADA
            </span>
          </div>

          {/* Marco Artístico de Hoja Completa */}
          <div className="relative w-full flex-1 min-h-[340px] sm:min-h-[390px] rounded-xl overflow-hidden border-2 border-[#8c6d48]/70 shadow-md bg-[#241711] flex flex-col justify-between group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={folio.imageUrl}
              alt={folio.caption}
              className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Botón de Zoom / Pantalla Completa */}
            <button
              type="button"
              onClick={() => setZoomedImage({ url: folio.imageUrl, caption: folio.caption })}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 transition-all cursor-pointer shadow-md backdrop-blur-xs"
              title="Ampliar Lámina de Estudio"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Cinta / Pie de grabado antiguo */}
            <div className="bg-[#1b1009]/90 border-t border-[#8c6d48]/60 p-2 text-center text-amber-200">
              <span className="text-[11px] sm:text-xs font-serif italic text-amber-300 block font-semibold">
                &ldquo;{folio.caption}&rdquo;
              </span>
            </div>
          </div>

          {/* Pie de Folio */}
          <div className="pt-3 border-t border-[#8c6d48]/40 flex items-center justify-between text-[10px] font-serif text-[#7d5236] font-bold mt-auto">
            <span>Ilustración Científica NEM</span>
            <span>Folio {toRoman(folioIndex + 1)}</span>
          </div>
        </div>
      );
    }

    // CASO B: FOLIO DE TEXTO DINÁMICO ESCRITO
    const paragraphs = folio.content.split('\n\n').map(p => p.trim()).filter(Boolean);
    const shouldShowAxiom = Boolean(dynamicAxiomText) && folioIndex === lastTextFolioIndex;

    return (
      <div className={`flex-1 flex flex-col justify-start relative z-10 text-[#2b1810] h-full ${lateralPadding}`}>
        {/* Cabecera del Folio */}
        <div className="border-b border-[#8c6d48]/40 pb-2 mb-2 flex items-center justify-between text-[11px] font-serif font-black tracking-widest uppercase text-[#5a3825]">
          <span className="flex items-center gap-1">
            {isRightSide ? `${dynamicDiscipline} ✧` : `✦ ${dynamicDiscipline}`}
          </span>
          <span className="font-bold text-[#7d5236]">
            Folio {toRoman(folioIndex + 1)}
          </span>
        </div>

        {/* Encabezado del Capítulo o Continuación - Presente en TODAS las páginas para mantener estructura noble */}
        <div className="space-y-1 mb-3 pb-2 border-b border-[#8c6d48]/25">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8b5a2b] block flex items-center justify-between">
            <span>{dynamicFaseNem}</span>
            <span className="text-[#8c6d48] font-serif italic text-[10px]">
              {folio.isFirstPageOfBook ? 'Inicio del Tratado' : `Sección ${toRoman(folioIndex + 1)}`}
            </span>
          </span>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#1f120c] leading-tight flex items-baseline gap-2">
            <span>
              {folio.isFirstPageOfBook ? `Capítulo I: ${dynamicChapterTitle}` : dynamicChapterTitle}
            </span>
            {!folio.isFirstPageOfBook && (
              <span className="text-xs font-serif font-normal italic text-[#7d5236]">
                (Continuación)
              </span>
            )}
          </h3>
        </div>

        {/* Cuerpo del Folio con Texto Escrito Real - Flujo natural de arriba a abajo */}
        <div className="flex-1 flex flex-col justify-start space-y-3">
          <div className={`font-serif text-[#2a1b12] leading-relaxed space-y-3.5 ${
            fontSizeLevel === 'sm' ? 'text-xs sm:text-sm' : fontSizeLevel === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}>
            {paragraphs.map((paragraph, pIdx) => {
              // Cada folio inicia su primer párrafo con una Letra Capitular (Drop Cap) iluminada
              if (pIdx === 0) {
                const firstLetter = paragraph.charAt(0);
                const restOfPara = paragraph.slice(1);
                return (
                  <p key={pIdx} className="text-justify relative leading-relaxed text-[#23150d]">
                    <span className="float-left text-3xl sm:text-4xl font-black font-serif text-[#5c2416] pr-2.5 pt-0.5 leading-none drop-shadow-xs select-none">
                      {firstLetter}
                    </span>
                    {restOfPara}
                  </p>
                );
              }

              return (
                <p key={pIdx} className="text-justify leading-relaxed text-[#23150d] indent-4 sm:indent-6">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Cuadro de Axioma / Marginalia Grimoire: ÚNICAMENTE si fue redactado por el docente */}
          {shouldShowAxiom && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-[#5c2416]/5 border border-[#8c6d48]/35 shadow-inner space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-1.5 text-[11px] font-serif font-black uppercase text-[#5c2416] tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#8c6d48]" />
                <span>{dynamicAxiomTitle}</span>
              </div>
              <p className="text-xs font-serif italic text-[#523320] leading-relaxed">
                &ldquo;{dynamicAxiomText}&rdquo;
              </p>
              <div className="text-[10px] text-[#7d5236] font-sans font-semibold pt-1 border-t border-[#8c6d48]/20 flex items-center justify-between">
                <span>✦ Retención Nemotécnica</span>
                <span>Enfoque Cognitivo ✦</span>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Folio */}
        <div className="pt-3 border-t border-[#8c6d48]/40 flex items-center justify-between text-[10px] font-serif text-[#7d5236] font-bold mt-auto">
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-[#7d5236]" />
            Anotar en Grimorio Personal
          </span>
          <span>Folio {toRoman(folioIndex + 1)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-3xl bg-[#090d16] text-slate-100 border border-indigo-900/60 shadow-2xl overflow-hidden font-sans select-none">
      {/* =========================================================================
          CABECERA SUPERIOR: HUD GAMIFICADO DE MISIÓN
          ========================================================================= */}
      <div className="bg-[#0b1220]/95 border-b border-indigo-900/40 px-4 py-3 sm:px-6 sm:py-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Lado Izquierdo: Misión y Título Dinámico */}
        <div className="space-y-0.5 min-w-[200px]">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-400">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300">
              {dynamicFaseNem}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-teal-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              {dynamicDiscipline}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="truncate">{dynamicChapterTitle}</span>
          </h2>
        </div>

        {/* Centro: Métricas en Tiempo Real (PPM & Maná Lector) */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 shadow-inner">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-indigo-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-400 transition-all duration-500"
                  strokeDasharray={`${Math.min(100, Math.round((currentPpm / 180) * 100))}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Gauge className="w-3.5 h-3.5 text-teal-300 absolute" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-teal-400 tracking-wider">
                {currentPpm} PPM
              </div>
              <div className="text-[9px] font-semibold text-slate-300">
                Óptimo (130-160)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                Maná Lector
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col justify-center min-w-[140px]">
            <div className="flex justify-between text-[10px] font-black text-amber-400">
              <span>{Math.round((totalWords * readingProgressPercent) / 100)} / {totalWords} palabras</span>
              <span>{readingProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800/40 my-0.5">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-amber-500 transition-all duration-300"
                style={{ width: `${readingProgressPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              +20% Daño Crítico Desbloqueado
            </span>
          </div>
        </div>

        {/* Lado Derecho: Controles de Accesibilidad */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRuneGuide(!showRuneGuide)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Guía Rúnica de Lectura"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guía Rúnica</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFontSizeLevel(prev => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'));
            }}
            className="p-1.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 text-indigo-200 text-xs font-black flex items-center justify-center transition-all cursor-pointer w-8 h-8"
            title="Ajustar Tamaño de Texto"
          >
            <Type className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer"
              title="Cerrar Simulador"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showRuneGuide && (
        <div className="bg-indigo-950/95 border-b border-indigo-800/80 p-4 text-xs space-y-2 text-indigo-200 animate-fade-in relative z-20">
          <div className="flex items-center justify-between font-black text-amber-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              PROTOCOLO DE LECTURA DEL GRIMORIO ARCANO
            </span>
            <button onClick={() => setShowRuneGuide(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            1. <strong>Lectura Dinámica Continua:</strong> Las páginas del libro se llenan con el texto escrito y las láminas creadas por el docente.
          </p>
          <p className="text-slate-300 leading-relaxed">
            2. <strong>Voz Natural Femenina:</strong> Escucha la entonación refinada y pausada de la mentora pedagógica.
          </p>
          <p className="text-slate-300 leading-relaxed">
            3. <strong>Protocolo de Retención:</strong> Al pulsar <em>&quot;Sellar y Combatir&quot;</em>, las páginas se bloquearán y responderás de memoria.
          </p>
        </div>
      )}

      {/* =========================================================================
          CUERPO PRINCIPAL: GRIMORIO DE DOBLE FOLIO LLENADO CON TEXTO ESCRITO
          ========================================================================= */}
      {phase === 'reading' && (
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* EL TOMO / GRIMORIO 3D */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#3e2723] bg-[#1a120b]">
              {/* Selector táctil de folios para pantallas móviles */}
              {currentSpread.rightFolio && (
                <div className="flex md:hidden items-center justify-between bg-[#120a06] border-b border-[#3e2723] px-3 py-2 w-full">
                  <span className="text-[11px] font-serif text-amber-300/80 font-bold">
                    Modo Lectura Portátil:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMobileActiveFolio('left')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                        mobileActiveFolio === 'left'
                          ? 'bg-[#5c2416] text-amber-100 border border-amber-500/60 shadow-xs'
                          : 'bg-[#241711] text-[#8c6d48] border border-[#3e2723]'
                      }`}
                    >
                      Folio {toRoman(currentSpread.leftIdx + 1)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileActiveFolio('right')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                        mobileActiveFolio === 'right'
                          ? 'bg-[#5c2416] text-amber-100 border border-amber-500/60 shadow-xs'
                          : 'bg-[#241711] text-[#8c6d48] border border-[#3e2723]'
                      }`}
                    >
                      Folio {toRoman((currentSpread.rightIdx ?? currentSpread.leftIdx + 1) + 1)}
                    </button>
                  </div>
                </div>
              )}

              <div 
                className="relative w-full min-h-[520px] sm:min-h-[580px] p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-10 transition-transform duration-500"
                style={{
                  backgroundImage: `url('/images/studio/ancient_parchment_book.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-amber-900/10 pointer-events-none mix-blend-multiply" />
                <div 
                  className="hidden md:block absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to right, rgba(40,20,10,0.02) 0%, rgba(20,10,5,0.35) 45%, rgba(10,5,2,0.55) 50%, rgba(20,10,5,0.35) 55%, rgba(40,20,10,0.02) 100%)'
                  }}
                />

                {isFlipping && (
                  <div className="absolute inset-0 z-20 pointer-events-none bg-black/25 transition-opacity duration-300 animate-pulse" />
                )}

                {/* FOLIO IZQUIERDO */}
                <div className={`w-full ${mobileActiveFolio === 'right' ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
                  {renderFolio(currentSpread.leftFolio, currentSpread.leftIdx, false)}
                </div>

                {/* FOLIO DERECHO (AHORA TOTALMENTE DINÁMICO Y LLENADO CON TEXTO ESCRITO O LÁMINA) */}
                {currentSpread.rightFolio && (
                  <div className={`w-full ${mobileActiveFolio === 'left' ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
                    {renderFolio(currentSpread.rightFolio, currentSpread.rightIdx ?? currentSpread.leftIdx + 1, true)}
                  </div>
                )}
              </div>

              {/* BARRA INFERIOR DE PASO DE PÁGINAS EBOOK 3D */}
              <div className="bg-[#120a06] border-t border-[#3e2723] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span className="font-bold text-teal-300 text-[11px]">
                    Lectura Guiada por IA Pedagógica activada
                  </span>
                </div>

                {/* Controles en móvil */}
                <div className="flex md:hidden items-center gap-2 w-full justify-between pt-1 border-t border-[#3e2723]/50">
                  <button
                    type="button"
                    onClick={handlePrevMobileFolio}
                    disabled={(currentSpreadIndex === 0 && mobileActiveFolio === 'left') || isFlipping}
                    className="px-2.5 py-1.5 rounded-xl bg-[#2a170d] hover:bg-[#3d2214] disabled:opacity-30 disabled:pointer-events-none text-amber-300 font-bold text-xs flex items-center gap-1 border border-[#522d1b] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Folio Ant.</span>
                  </button>

                  <span className="font-serif text-xs font-bold text-amber-400">
                    Folio {mobileActiveFolio === 'left' ? toRoman(currentSpread.leftIdx + 1) : toRoman((currentSpread.rightIdx ?? currentSpread.leftIdx + 1) + 1)} de {toRoman(bookFolios.length)}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMobileFolio}
                    disabled={(currentSpreadIndex >= spreads.length - 1 && (mobileActiveFolio === 'right' || !currentSpread.rightFolio)) || isFlipping}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1 border border-teal-500/40 transition-all cursor-pointer"
                  >
                    <span>Folio Sig.</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Controles en Desktop / Tablet */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentSpreadIndex === 0 || isFlipping}
                    className="px-3 py-1.5 rounded-xl bg-[#2a170d] hover:bg-[#3d2214] disabled:opacity-30 disabled:pointer-events-none text-amber-300 font-bold flex items-center gap-1 border border-[#522d1b] transition-all cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Folio Anterior</span>
                  </button>

                  <span className="px-2 font-mono text-[11px] font-bold text-amber-400">
                    Spreads {currentSpreadIndex + 1} de {spreads.length} ({bookFolios.length} folios)
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentSpreadIndex >= spreads.length - 1 || isFlipping}
                    className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center gap-1 border border-teal-500/40 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Pasar Página</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SIDEBAR DERECHO: PROTOCOLO DE RETENCIÓN & VOZ HUMANA FEMENINA REFINADA
              ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tarjeta 1: PROTOCOLO DE RETENCIÓN */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 space-y-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Protocolo de Retención</span>
              </div>
              <p className="text-[11px] text-rose-200 leading-relaxed">
                Al pulsar <strong>&quot;Sellar Grimorio&quot;</strong>, las páginas se bloquearán y comenzará de inmediato el combate cognitivo de <strong>{questionsList.length} reactivos</strong> sin texto a la vista.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-rose-300/80">
                <div className="w-3.5 h-3.5 rounded-md bg-rose-900/60 border border-rose-700 flex items-center justify-center text-rose-400">
                  ✓
                </div>
                <span>Retención a corto plazo bajo evaluación</span>
              </div>
            </div>

            {/* Tarjeta 2: ENEMIGO DE MISIÓN (BOSS NIVEL 10) */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-indigo-900/60 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-slate-400 uppercase tracking-wider">Enemigo de Misión</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-600/30 border border-rose-500/50 text-rose-400 text-[10px]">
                  BOSS NIVEL 10
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/70 shadow-lg shadow-amber-500/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/studio/ignis_boss_avatar.jpg"
                    alt="Ignis-Thermos"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Ignis-Thermos</span>
                  </h4>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Señor del Foco Entrópico
                  </p>
                  <div className="text-[10px] text-teal-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-teal-400" />
                    <span>Vulnerabilidad: Comprensión Lectora</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 pt-1 border-t border-slate-800">
                <span>Ventaja de Daño:</span>
                <span className="text-emerald-400 font-black">+20% Daño Crítico</span>
              </div>
            </div>

            {/* Tarjeta 3: VOZ DE LA MENTORA PEDAGÓGICA (100% HUMANA NEURAL DE ESTUDIO) */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-teal-500/40 space-y-3 shadow-lg shadow-teal-950/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-teal-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-teal-400" />
                  <span>Voz de la Mentora Arcana</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/50 text-teal-300 text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>100% Humana Neural</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Lectura asistida con <strong className="text-teal-300 font-bold">locución humana real de estudio</strong>, entonación pedagógica cálida y respiración natural (sin sintetizador robótico).
              </p>

              {/* Selector de Voces 100% Humanas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                  <span>Voz Humana de Narración:</span>
                  <span className="text-teal-400 text-[9px] font-semibold">Calidad Estudio 96kbps</span>
                </label>
                <select
                  aria-label="Seleccionar voz humana de estudio"
                  value={selectedNeuralVoice}
                  onChange={(e) => {
                    stopAllAudio();
                    setSelectedNeuralVoice(e.target.value);
                  }}
                  className="w-full text-xs font-bold text-teal-200 bg-slate-950 border border-teal-500/50 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition-all shadow-inner"
                >
                  {HUMAN_NEURAL_VOICES.map(v => (
                    <option key={v.id} value={v.id}>
                      🎙️ {v.label} ({v.tag})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ecualizador Gráfico Dinámico */}
              <div className="flex items-center justify-center gap-1 py-1.5 h-7 bg-black/40 rounded-xl border border-teal-900/40">
                {[40, 75, 100, 60, 90, 50, 80, 45, 95, 65, 35, 85, 55, 90].map((height, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isSpeaking ? 'bg-gradient-to-t from-teal-500 to-emerald-300 animate-pulse' : 'bg-slate-700/60'
                    }`}
                    style={{
                      height: isSpeaking ? `${Math.max(25, Math.round(height * (0.6 + Math.random() * 0.4)))}%` : '20%'
                    }}
                  />
                ))}
              </div>

              {/* Controles de Reproducción y Velocidad */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-indigo-900/40">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  disabled={isAudioLoading}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isSpeaking
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black'
                      : isAudioLoading
                      ? 'bg-teal-900 text-teal-300 opacity-80 cursor-wait'
                      : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white'
                  }`}
                >
                  {isAudioLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                      <span>Cargando Voz Humana...</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pausar Lectura</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Escuchar Folios</span>
                    </>
                  )}
                </button>

                {/* Control de Velocidad de la Voz */}
                <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-indigo-900/60 shrink-0">
                  {[0.9, 1.0, 1.25].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        stopAllAudio();
                        setSpeechRate(rate);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        speechRate === rate
                          ? 'bg-teal-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicador de Estado en Vivo */}
              <div className="flex items-center justify-between text-[10px] text-teal-300/90 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-teal-500'}`} />
                  <span className="font-semibold">
                    {isSpeaking ? 'Narrando con voz humana de estudio' : 'Lista para narrar folios actuales'}
                  </span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">100% Humana</span>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL ESTELAR: SELLAR Y COMBATIR */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSealAndCombat}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer border border-amber-300"
              >
                <Flame className="w-5 h-5 fill-slate-950 text-slate-950 animate-bounce" />
                <span>¡Sellar y Combatir!</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-teal-400" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Reanudar Lectura' : 'Pausar Lectura (Sin Pérdida de PPM)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 2: COMBATE COGNITIVO RPG CONTRA EL BOSS (RETENCIÓN SELLADA)
          ========================================================================= */}
      {phase === 'combat' && (
        <div className="p-6 sm:p-10 space-y-6 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Grimorio sellado por Protocolo de Retención: Demuestra lo aprendido de memoria.
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80">
              Combate en Curso
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-800/60 text-center space-y-4 shadow-xl">
            <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden border-4 border-amber-500 shadow-2xl shadow-amber-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studio/ignis_boss_avatar.jpg"
                alt="Ignis-Thermos"
                className={`w-full h-full object-cover transition-transform ${bossIsDamaged ? 'scale-110 brightness-150 animate-bounce' : ''}`}
              />
              {bossIsDamaged && (
                <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center font-black text-white text-xs">
                  ¡CRÍTICO!
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Ignis-Thermos</h3>
              <p className="text-xs text-amber-400 font-bold">Señor del Foco Entrópico · Boss Nivel 10</p>
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <div className="flex justify-between text-xs font-black">
                <span className="text-rose-400">Puntos de Vida (HP)</span>
                <span className="font-mono text-white">{bossHp} / {maxBossHp} HP</span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((bossHp / maxBossHp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {questionsList[currentQuestionIdx] && (() => {
            const currentQ = questionsList[currentQuestionIdx];
            return (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-800/60 space-y-5 shadow-xl">
                <div className="flex items-center justify-between text-xs font-black text-slate-400 border-b border-slate-800 pb-3">
                  <span className="text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    Reactivo de Retención {currentQuestionIdx + 1} de {questionsList.length}
                  </span>
                  <span>Impacto: -{Math.ceil(maxBossHp / questionsList.length)} HP</span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentQ.question}
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    const isAnswered = answeredQuestions[currentQ.id];

                    let btnStyle = "bg-slate-800/80 hover:bg-slate-750 text-slate-200 border-slate-700";
                    if (isAnswered) {
                      if (optIdx === currentQ.correctIndex) {
                        btnStyle = "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-600 text-white border-rose-500";
                      } else {
                        btnStyle = "bg-slate-800/40 text-slate-500 border-slate-800 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerCombatQuestion(optIdx)}
                        disabled={isAnswered}
                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-black/30 font-black text-xs flex items-center justify-center shrink-0">
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {questionFeedback && (
                  <div className={`p-3.5 rounded-2xl text-xs font-bold animate-fade-in ${
                    questionFeedback.isCorrect 
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300' 
                      : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                  }`}>
                    {questionFeedback.text}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          FASE 3: VICTORIA Y REPORTE DE MAESTRÍA LECTORA
          ========================================================================= */}
      {phase === 'results' && finalReport && (
        <div className="p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-teal-400">
              ¡Misión Cumplida!
            </span>
            <h3 className="text-2xl font-black text-white">
              Guardián Entrópico Derrotado
            </h3>
            <p className="text-xs text-slate-300">
              Has dominado el Grimorio Arcano con alta fluidez y retención conceptual.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 space-y-1">
              <span className="text-[10px] font-black uppercase text-teal-400">Velocidad Registrada</span>
              <div className="text-2xl font-black text-white">{finalReport.ppm} PPM</div>
              <span className="text-[10px] text-slate-400 block font-bold">{finalReport.speedTier}</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400">Comprensión Lectora</span>
              <div className="text-2xl font-black text-white">{finalReport.scorePercent}%</div>
              <span className="text-[10px] text-slate-400 block font-bold">Retención Exitosa</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-around text-xs font-black text-amber-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{finalReport.xpEarned} XP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>+{finalReport.coinsEarned} Gemas</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPhase('reading');
                setBossHp(maxBossHp);
                setCurrentQuestionIdx(0);
                setSelectedAnswers({});
                setAnsweredQuestions({});
                setSecondsLeft(timeLimitSeconds || 60);
                setSecondsElapsed(0);
                setCurrentSpreadIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Releer Grimorio</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Continuar Aventura</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AMPLIACIÓN DE LÁMINA / ZOOM */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] p-2 bg-[#2a170d] rounded-2xl border-2 border-amber-500/60 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage.url}
              alt={zoomedImage.caption}
              className="w-full h-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center bg-[#1b1009] text-amber-200 text-xs font-serif italic border-t border-[#8c6d48]/50">
              {zoomedImage.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
