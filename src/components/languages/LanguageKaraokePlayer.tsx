"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { KaraokePhrase, LanguageCode, AvatarGender, useLanguagesStore } from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from './HumanGesticulatingAvatar';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Flame, 
  Gauge, 
  Send,
  Zap,
  HelpCircle,
  VolumeX,
  Award,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Radio,
  Headphones,
  Activity,
  CheckCircle,
  ShieldCheck,
  Smartphone,
  Laptop,
  Cpu,
  Wifi
} from 'lucide-react';
import {
  normalizePhoneticText,
  isPhoneticallyEquivalent,
  alignSpokenTokensToTarget,
  expandContractions,
  getSupportedRecordingMimeType,
  calculateDecibelsFromRms,
  getAudioContextLatencyMs,
  createUniversalAudioContext,
  createVocalBandpassFilter
} from '@/lib/audioEngine';

interface Props {
  phrase: KaraokePhrase;
  language: LanguageCode;
  avatarGender: AvatarGender;
  avatarVoice: string;
  avatarName: string;
  studentName?: string;
  lessonId: string;
  lessonTitle: string;
  onComplete?: (stats: { accuracy: number; correctCount: number; errorWords: string[] }) => void;
  className?: string;
}

export const LanguageKaraokePlayer: React.FC<Props> = ({
  phrase,
  language,
  avatarGender,
  avatarVoice,
  avatarName,
  studentName = 'Estudiante ISkool',
  lessonId,
  lessonTitle,
  onComplete,
  className = ''
}) => {
  const { submitStudentReport } = useLanguagesStore();

  // Estados del Avatar y Reproducción de Voz Modelo
  const [isPlayingModelVoice, setIsPlayingModelVoice] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [slowWordToHear, setSlowWordToHear] = useState<string | null>(null);

  // Estados del Micrófono Físico & Dispositivos
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isUserSpeakingNow, setIsUserSpeakingNow] = useState<boolean>(false);
  const [hardwareMicAvailable, setHardwareMicAvailable] = useState<boolean>(false);
  const [micTested, setMicTested] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState<boolean>(false);

  // Estados de Telemetría Acústica de Hardware y Diagnóstico Universal
  const [decibelValue, setDecibelValue] = useState<number>(-60);
  const [decibelLabel, setDecibelLabel] = useState<string>('Silencio');
  const [latencyMs, setLatencyMs] = useState<number>(12);
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [channelCount, setChannelCount] = useState<number>(1);
  const [frequencyBars, setFrequencyBars] = useState<number[]>(new Array(16).fill(6));
  const [showHardwareDiagnostics, setShowHardwareDiagnostics] = useState<boolean>(false);
  const [deviceEnvironment, setDeviceEnvironment] = useState<{
    browserName: string;
    isMobile: boolean;
    isIOS: boolean;
    isSecure: boolean;
    mimeType: string;
    hasSpeechRec: boolean;
  }>({
    browserName: 'Navegador Web',
    isMobile: false,
    isIOS: false,
    isSecure: true,
    mimeType: '',
    hasSpeechRec: false
  });

  // Selector de Micrófonos Hardware y Ganancia
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [micGainValue, setMicGainValue] = useState<number>(4.0);
  const [isTestingMicLive, setIsTestingMicLive] = useState<boolean>(false);
  const [detectedSpeechText, setDetectedSpeechText] = useState<string>('');
  const [testDetectedSpeechText, setTestDetectedSpeechText] = useState<string>('');
  const [testMicError, setTestMicError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState<boolean>(false);
  const [karaokeMode, setKaraokeMode] = useState<'mic' | 'interactive'>('mic');

  // Estados del Karaoke Fonético Real (Basado en Índices Únicos para Exactitud Absoluta)
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [errorIndices, setErrorIndices] = useState<number[]>([]);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [errorWordsList, setErrorWordsList] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
  const [evaluationSource, setEvaluationSource] = useState<'stt' | 'acoustic' | 'manual' | null>(null);
  const [generatedAdvice, setGeneratedAdvice] = useState<{ title: string; tips: string[]; speedTip: string } | null>(null);
  const [feedbackAlert, setFeedbackAlert] = useState<string | null>(null);

  // Referencias para Audio & Procesamiento en Tiempo Real
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecRef = useRef<any>(null);
  const testSpeechRecRef = useRef<any>(null);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const testAnimRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isTestingMicLiveRef = useRef<boolean>(false);
  const canUseSpeechRecognitionRef = useRef<boolean>(true);

  // Variables de control de voz reactiva y buffer acumulado
  const voiceStateRef = useRef<{
    currentWordIndex: number;
    completedIndices: number[];
    isSpeaking: boolean;
    speechStartTime: number;
    silenceStartTime: number;
    voicedFramesCount: number;
    accumulatedTranscript: string;
    allCapturedTokens: string[];
  }>({
    currentWordIndex: 0,
    completedIndices: [],
    isSpeaking: false,
    speechStartTime: 0,
    silenceStartTime: 0,
    voicedFramesCount: 0,
    accumulatedTranscript: '',
    allCapturedTokens: []
  });

  // Descomposición de la frase objetivo en palabras
  const targetWords = useMemo(() => {
    return phrase.targetText.split(/\s+/).filter(Boolean);
  }, [phrase.targetText]);

  // Sintetizador Web Audio nativo para efectos de sonido
  const playSfx = useCallback((type: 'correct' | 'wrong' | 'victory' | 'start') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'victory') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.45);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.45);
        });
      }
    } catch {}
  }, []);

  // Enumerar micrófonos disponibles y seleccionar el más adecuado (ej. Realtek o USB)
  const refreshAudioDevices = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      setAvailableMics(audioInputs);
      setHardwareMicAvailable(audioInputs.length > 0);
      
      if (audioInputs.length > 0 && !selectedMicId) {
        // Si hay varios, priorizar el que contenga 'realtek', 'mic' o 'default'
        const preferred = audioInputs.find(m => 
          /realtek|micrófono|microphone|headset|usb/i.test(m.label)
        ) || audioInputs[0];
        setSelectedMicId(preferred.deviceId);
      }
    } catch (e) {
      console.warn('Error enumerando dispositivos de audio:', e);
      setHardwareMicAvailable(true);
    }
  }, [selectedMicId]);

  useEffect(() => {
    refreshAudioDevices();

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(ua);
      const isMobile = isIOS || isAndroid || /Mobi/i.test(ua);
      
      let browserName = 'Navegador Web';
      if (/Edg\//i.test(ua)) browserName = 'Microsoft Edge';
      else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browserName = 'Google Chrome';
      else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browserName = 'Apple Safari';
      else if (/Firefox\//i.test(ua)) browserName = 'Mozilla Firefox';
      else if (/SamsungBrowser/i.test(ua)) browserName = 'Samsung Internet';

      const hasSpeech = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      const supportedMime = getSupportedRecordingMimeType();
      const isSecure = window.isSecureContext === true || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      setDeviceEnvironment({
        browserName,
        isMobile,
        isIOS,
        isSecure,
        mimeType: supportedMime || 'audio/mp4 (Nativo)',
        hasSpeechRec: hasSpeech
      });
    }

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', refreshAudioDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', refreshAudioDevices);
      };
    }
  }, [refreshAudioDevices]);

  // Reiniciar estado al cambiar de frase
  useEffect(() => {
    setIsRecording(false);
    setIsCompleted(false);
    setActiveWordIndex(0);
    setCompletedIndices([]);
    setErrorIndices([]);
    setCompletedWords([]);
    setErrorWordsList([]);
    setAccuracyScore(0);
    setEvaluationSource(null);
    setGeneratedAdvice(null);
    setFeedbackAlert(null);
    setRecordedAudioUrl(null);
    setIsUserSpeakingNow(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [phrase.id]);

  // Generador de Consejos Pedagógicos
  const generateAdvice = (errors: string[], acc: number) => {
    if (acc === 100) {
      return {
        title: '¡Maestría Fonética Impecable!',
        tips: [
          'Tu articulación, acento y entonación han alcanzado el estándar nativo.',
          'Conserva esta fluidez y proyección vocal en tus siguientes retos.'
        ],
        speedTip: 'Estás listo para desafiarte a velocidad nativa (1.0x o 1.2x).'
      };
    }

    const tips: string[] = [];
    if (language === 'en') {
      const hasTh = errors.some(w => /th/i.test(w));
      const hasR = errors.some(w => /r/i.test(w));
      const hasShortVowels = errors.some(w => /muffin|cappuccino|fresh|warm|like|cup/i.test(w));

      if (hasTh) {
        tips.push('👅 Posición lingual interdental (/θ/ y /ð/): Coloca la punta de la lengua suavemente entre tus incisivos y deja salir el aire de forma continua.');
      }
      if (hasR) {
        tips.push('👄 Curvatura de la "R" inglesa: Levanta la punta de la lengua hacia el centro del paladar sin tocarlo y redondea los labios.');
      }
      if (hasShortVowels) {
        tips.push('✨ Articulación de vocales cortas: Abre la mandíbula con mayor holgura y no alargues el sonido vocálico como en español.');
      }
    } else {
      const hasFrenchR = errors.some(w => /r/i.test(w));
      const hasNasal = errors.some(w => /an|en|in|on|un|croissant/i.test(w));
      const hasSilentEnds = errors.some(w => /s$|t$|d$/i.test(w));

      if (hasFrenchR) {
        tips.push('🇫🇷 Fricativa uvular (/ʁ/): Produce la "R" francesa desde la parte posterior de la garganta con una suave vibración similar a un suspiro profundo.');
      }
      if (hasNasal) {
        tips.push('👃 Resonancia nasal francesa: Permite que el aire vibre tanto en la boca como en la nariz en palabras como "croissant" o "pain".');
      }
      if (hasSilentEnds) {
        tips.push('🤫 Consonantes finales mudas: En francés, las consonantes finales como "-s", "-t", "-d" casi nunca se pronuncian.');
      }
    }

    if (tips.length === 0) {
      tips.push('Escucha el audio del mentor para afinar tu ritmo de respiración.');
      tips.push('Modula y separa las palabras con claridad evitando apresurarte.');
    }

    const speedTip = acc < 75 
      ? '🐢 Consejo de velocidad: Toca las palabras marcadas en rojo para escucharlas despacio (0.65x).'
      : '🎯 Excelente avance: prueba repetir las palabras en rojo para alcanzar el 100%.';

    return {
      title: 'Recomendación Pedagógica para Perfeccionar tu Pronunciación',
      tips,
      speedTip
    };
  };

  // Reproducir voz del mentor con TTS Neural
  const playModelVoice = async (textToSpeak = phrase.targetText, customRate = speechRate) => {
    if (isPlayingModelVoice) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingModelVoice(false);
      return;
    }

    try {
      setIsPlayingModelVoice(true);
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voice: avatarVoice,
          rate: customRate
        })
      });

      if (!res.ok) throw new Error('Error en TTS');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = url;
      audioRef.current.onended = () => {
        setIsPlayingModelVoice(false);
        setSlowWordToHear(null);
      };
      audioRef.current.onerror = () => {
        setIsPlayingModelVoice(false);
        setSlowWordToHear(null);
      };

      await audioRef.current.play();
    } catch {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = customRate;
        utterance.onend = () => {
          setIsPlayingModelVoice(false);
          setSlowWordToHear(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingModelVoice(false);
      }
    }
  };

  // Práctica lenta de palabra específica
  const practiceErrorWord = (word: string) => {
    setSlowWordToHear(word);
    playModelVoice(word, 0.65);
  };

  // =========================================================================
  // DETENER Y EVALUAR LA PRÁCTICA (RIGUROSO, HONESTO Y TOLERANTE A HARDWARE)
  // =========================================================================
  const completeEvaluation = useCallback((forcedAccuracy?: number, forcedErrors?: string[]) => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsUserSpeakingNow(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (speechRecRef.current) {
      try {
        speechRecRef.current.onresult = null;
        speechRecRef.current.onend = null;
        speechRecRef.current.onerror = null;
        speechRecRef.current.stop();
      } catch {}
      speechRecRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }

    let finalCorrectIndices: number[] = [];
    let finalErrorIndices: number[] = [];
    let calculatedAcc = 0;
    let evalSource: 'stt' | 'acoustic' | 'manual' = 'manual';

    if (forcedAccuracy !== undefined) {
      calculatedAcc = forcedAccuracy;
      const forcedErrList = forcedErrors || [];
      finalErrorIndices = targetWords
        .map((w, idx) => ({ w, idx }))
        .filter(item => forcedErrList.includes(item.w))
        .map(item => item.idx);
      finalCorrectIndices = targetWords
        .map((_, idx) => idx)
        .filter(idx => !finalErrorIndices.includes(idx));
      evalSource = 'manual';
    } else {
      const state = voiceStateRef.current;
      
      if (karaokeMode === 'mic') {
        // En modo micrófono, evaluar estrictamente los tokens hablados reconocidos
        const tokensToAlign = state.allCapturedTokens.length > 0 
          ? state.allCapturedTokens 
          : detectedSpeechText.toLowerCase().replace(/[^a-z0-9\s'’]/gi, ' ').split(/\s+/).filter(Boolean);

        const alignment = alignSpokenTokensToTarget(tokensToAlign, targetWords, language);

        if (alignment.matchedIndices.length > 0) {
          finalCorrectIndices = [...alignment.matchedIndices];
          finalErrorIndices = targetWords.map((_, i) => i).filter(i => !alignment.matchedIndices.includes(i));
          calculatedAcc = Math.round((finalCorrectIndices.length / targetWords.length) * 100);
          evalSource = 'stt';
        } else {
          // Silencio o sin palabras reconocidas: Cero absoluto, sin falsos positivos
          finalCorrectIndices = [];
          finalErrorIndices = targetWords.map((_, i) => i);
          calculatedAcc = 0;
          evalSource = 'stt';
        }
      } else {
        // En Modo Guiado / Táctil / Teclado
        finalCorrectIndices = [...state.completedIndices];
        finalErrorIndices = targetWords.map((_, i) => i).filter(i => !state.completedIndices.includes(i));
        calculatedAcc = Math.round((finalCorrectIndices.length / targetWords.length) * 100);
        evalSource = 'manual';
      }
    }

    const finalCorrectWords = finalCorrectIndices.map(i => targetWords[i]);
    const finalErrorWords = finalErrorIndices.map(i => targetWords[i]);

    setCompletedIndices(finalCorrectIndices);
    setErrorIndices(finalErrorIndices);
    setCompletedWords(finalCorrectWords);
    setErrorWordsList(finalErrorWords);
    setAccuracyScore(calculatedAcc);
    setEvaluationSource(evalSource);
    setIsCompleted(true);

    if (calculatedAcc === 0) {
      setFeedbackAlert('No se detectó pronunciación de palabras. Asegúrate de hablar frente a tu micrófono o probarlo en vivo arriba.');
      playSfx('wrong');
    } else if (calculatedAcc >= 80) {
      setFeedbackAlert(null);
      playSfx('victory');
    } else {
      setFeedbackAlert(`Pronunciaste ${finalCorrectIndices.length} de ${targetWords.length} palabras (${calculatedAcc}% de precisión). Toca las palabras en rojo para escuchar cómo pronunciarlas despacio.`);
      playSfx('correct');
    }

    const advice = generateAdvice(finalErrorWords, calculatedAcc);
    setGeneratedAdvice(advice);

    // Enviar reporte honesto y fidedigno a la bitácora docente
    submitStudentReport({
      studentId: 'stud-active',
      studentName,
      lessonId,
      lessonTitle,
      language,
      phraseId: phrase.id,
      targetPhrase: phrase.targetText,
      spokenTranscript: finalCorrectIndices.length > 0 
        ? targetWords.map((w, idx) => finalCorrectIndices.includes(idx) ? w : '...').join(' ')
        : '(Silencio / Sin palabras detectadas)',
      overallAccuracy: calculatedAcc,
      correctWords: finalCorrectWords,
      mispronouncedWords: finalErrorWords,
      pedagogicalAdvice: advice.tips.join(' | ') + ' ' + advice.speedTip,
      speedPpm: Math.round(finalCorrectIndices.length * 12)
    });

    if (onComplete) {
      onComplete({ accuracy: calculatedAcc, correctCount: finalCorrectIndices.length, errorWords: finalErrorWords });
    }
  }, [targetWords, phrase, language, avatarVoice, lessonId, lessonTitle, studentName, submitStudentReport, onComplete, playSfx, detectedSpeechText]);

  // Helper para verificar similitud fonética y equivalencias de pronunciación (Algoritmo Multi-Nivel con Levenshtein)
  const isPhoneticallySimilar = useCallback((said: string, expected: string): boolean => {
    return isPhoneticallyEquivalent(said, expected, language);
  }, [language]);

  // Procesar transcripción hablada en tiempo real con alineación fonética inteligente
  const processSpokenTranscript = useCallback((transcript: string) => {
    setDetectedSpeechText(transcript);
    const rawTokens = transcript
      .toLowerCase()
      .replace(/[^a-z0-9\s'’]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (rawTokens.length === 0) return;

    const state = voiceStateRef.current;
    state.accumulatedTranscript = transcript;
    state.allCapturedTokens = rawTokens;

    // Ejecutar alineación fonética multi-ventana y multi-token sobre la transcripción real
    const alignment = alignSpokenTokensToTarget(rawTokens, targetWords, language);

    // Combinar con cualquier avance previo
    const newMatchedSet = new Set([...state.completedIndices, ...alignment.matchedIndices]);
    const newlyMatchedCount = newMatchedSet.size - state.completedIndices.length;

    if (newlyMatchedCount > 0 || alignment.matchedIndices.length > state.completedIndices.length) {
      const sortedIndices = Array.from(newMatchedSet).sort((a, b) => a - b);
      state.completedIndices = sortedIndices;
      setCompletedIndices([...sortedIndices]);
      const words = sortedIndices.map(i => targetWords[i]);
      setCompletedWords(words);
      playSfx('correct');

      // Buscar el siguiente índice no completado
      let nextIdx = 0;
      while (nextIdx < targetWords.length && sortedIndices.includes(nextIdx)) {
        nextIdx++;
      }
      state.currentWordIndex = nextIdx;
      setActiveWordIndex(nextIdx);

      // Si se completaron todas las palabras de la frase
      if (sortedIndices.length >= targetWords.length) {
        setTimeout(() => {
          completeEvaluation(100, []);
        }, 350);
      }
    }
  }, [targetWords, language, playSfx, completeEvaluation]);

  // Avanzar palabra manualmente (Modo Asistido / Clic / Táctil / Teclado)
  const advanceWordManually = useCallback((word: string, idx: number) => {
    const state = voiceStateRef.current;

    // Si la palabra ya fue completada y está antes del índice activo, pronunciarla para repasar
    if (state.completedIndices.includes(idx)) {
      practiceErrorWord(word);
      return;
    }

    if (!isRecordingRef.current) {
      isRecordingRef.current = true;
      setIsRecording(true);
      setIsCompleted(false);
      setRecordingDuration(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }

    // Avanzar progresivamente hasta el índice tocado
    const targetIdx = Math.min(idx, targetWords.length - 1);
    const newCompleted = [...state.completedIndices];
    for (let i = state.currentWordIndex; i <= targetIdx; i++) {
      if (!newCompleted.includes(i)) {
        newCompleted.push(i);
      }
    }
    newCompleted.sort((a, b) => a - b);

    state.completedIndices = newCompleted;
    setCompletedIndices(newCompleted);
    setCompletedWords(newCompleted.map(i => targetWords[i]));
    playSfx('correct');

    // Animación de pulso visual para respuesta interactiva táctil inmediata
    setAudioLevel(80);
    setIsUserSpeakingNow(true);
    setTimeout(() => {
      setAudioLevel(0);
      setIsUserSpeakingNow(false);
    }, 240);

    let nextIdx = targetIdx + 1;
    while (nextIdx < targetWords.length && newCompleted.includes(nextIdx)) {
      nextIdx++;
    }
    state.currentWordIndex = nextIdx;
    setActiveWordIndex(nextIdx);

    if (newCompleted.length >= targetWords.length) {
      setTimeout(() => {
        completeEvaluation(100, []);
      }, 350);
    }
  }, [targetWords, playSfx, completeEvaluation]);

  // Soporte de barra espaciadora para avanzar palabras en Modo Guiado
  useEffect(() => {
    if (!isRecording) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        const state = voiceStateRef.current;
        if (state.currentWordIndex < targetWords.length) {
          const currentWord = targetWords[state.currentWordIndex];
          advanceWordManually(currentWord, state.currentWordIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, targetWords, advanceWordManually]);

  // Función robusta para obtener stream de audio con tolerancia a fallos multi-nivel (100% de dispositivos)
  const getMicrophoneStream = async (deviceIdToUse?: string): Promise<{ stream: MediaStream | null; error?: string; isSecureContext: boolean }> => {
    if (typeof window === 'undefined') {
      return { stream: null, error: 'Entorno no compatible', isSecureContext: false };
    }

    const isSecure = typeof window !== 'undefined' && (
      window.isSecureContext === true || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'https:'
    );

    if (!navigator.mediaDevices?.getUserMedia) {
      if (!isSecure) {
        return {
          stream: null,
          error: 'Contexto no seguro (HTTP en red local o móvil). Por seguridad internacional de hardware, Android, iOS y Chrome bloquean el micrófono físico en conexiones HTTP sin cifrar. Para usar tu voz física en celular o tablet es necesario acceder por HTTPS o usar el Modo Guiado.',
          isSecureContext: false
        };
      }
      return {
        stream: null,
        error: 'Tu navegador no soporta captura de audio mediante MediaDevices.',
        isSecureContext: isSecure
      };
    }

    const targetId = deviceIdToUse || selectedMicId;
    let lastError: any = null;

    // Intento 1: Audio nativo con dispositivo ideal seleccionado por el usuario
    if (targetId && targetId !== '' && targetId !== 'default') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { ideal: targetId } }
        });
        refreshAudioDevices();
        setPermissionBlocked(false);
        return { stream, isSecureContext: isSecure };
      } catch (e: any) {
        lastError = e;
        console.warn('getUserMedia Intento con deviceId falló:', e?.name, e?.message);
      }
    }

    // Intento 2: Audio nativo directo sin restricciones (máxima compatibilidad universal iOS/Android/Desktop)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      refreshAudioDevices();
      setPermissionBlocked(false);
      return { stream, isSecureContext: isSecure };
    } catch (e: any) {
      lastError = e;
      console.warn('getUserMedia Intento 2 (audio: true) falló:', e?.name, e?.message);
    }

    // Intento 3: Sin procesamiento avanzado (evita bloqueos de controladores Realtek y modo exclusivo)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      refreshAudioDevices();
      setPermissionBlocked(false);
      return { stream, isSecureContext: isSecure };
    } catch (e: any) {
      lastError = e;
      console.warn('getUserMedia Intento 3 (sin filtros) falló:', e?.name, e?.message);
    }

    // Diagnóstico exacto con instrucciones específicas por plataforma y navegador
    let errorDetail = 'No se pudo conectar con el hardware de audio.';
    if (lastError) {
      if (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError') {
        errorDetail = 'El navegador o sistema no concedió el permiso de micrófono. Haz clic en el icono del candado o de permisos en la barra de direcciones superior de tu navegador y activa "Micrófono: Permitir", luego pulsa Reintentar. En iPhone o iPad, verifica que Safari tenga acceso al micrófono en Ajustes > Safari > Micrófono.';
      } else if (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError') {
        errorDetail = 'El micrófono está en uso exclusivo por otra aplicación en segundo plano (ej. Zoom, Microsoft Teams, Google Meet o grabadora del sistema). Cierra esa aplicación y pulsa Reintentar.';
      } else if (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError') {
        errorDetail = 'No se detectó ningún micrófono físico conectado al dispositivo o auricular.';
      } else if (lastError.name === 'OverconstrainedError') {
        errorDetail = 'El dispositivo de audio seleccionado no está disponible. Cambiando automáticamente al micrófono predeterminado.';
      } else {
        errorDetail = `${lastError.name}: ${lastError.message || 'Fallo de conexión al micrófono'}`;
      }
    }

    setPermissionBlocked(lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError');
    return { stream: null, error: errorDetail, isSecureContext: isSecure };
  };

  // =========================================================================
  // INICIAR GRABACIÓN CON DETECTOR DE VOZ FÍSICO REAL (TELEMETRÍA + VAD + SPEECH REC)
  // =========================================================================
  const startRecording = async () => {
    // 1. Si la prueba en vivo estaba activa, detenerla de inmediato
    if (isTestingMicLiveRef.current) {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach(t => t.stop());
        testStreamRef.current = null;
      }
      if (testSpeechRecRef.current) {
        try { testSpeechRecRef.current.stop(); } catch {}
        testSpeechRecRef.current = null;
      }
      if (testAudioCtxRef.current) {
        try { testAudioCtxRef.current.close(); } catch {}
        testAudioCtxRef.current = null;
      }
      if (testAnimRef.current) {
        cancelAnimationFrame(testAnimRef.current);
        testAnimRef.current = null;
      }
      setIsTestingMicLive(false);
      isTestingMicLiveRef.current = false;
    }

    // 2. Crear / reanudar AudioContext sincrónicamente dentro del gesto de usuario (click / touch)
    let localCtx: AudioContext | null = createUniversalAudioContext();
    if (localCtx) {
      audioContextRef.current = localCtx;
      setLatencyMs(getAudioContextLatencyMs(localCtx));
      setSampleRate(localCtx.sampleRate || 48000);
    }

    isRecordingRef.current = true;
    setIsRecording(true);
    setIsCompleted(false);
    setRecordingDuration(0);
    setActiveWordIndex(0);
    setCompletedIndices([]);
    setErrorIndices([]);
    setCompletedWords([]);
    setErrorWordsList([]);
    setAccuracyScore(0);
    setEvaluationSource(null);
    setFeedbackAlert(null);
    setRecordedAudioUrl(null);
    setIsUserSpeakingNow(false);
    setDetectedSpeechText('');
    audioChunksRef.current = [];
    playSfx('start');

    // Inicializar estado de voz reactiva
    voiceStateRef.current = {
      currentWordIndex: 0,
      completedIndices: [],
      isSpeaking: false,
      speechStartTime: 0,
      silenceStartTime: 0,
      voicedFramesCount: 0,
      accumulatedTranscript: '',
      allCapturedTokens: []
    };

    // Temporizador de duración
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    let stream: MediaStream | null = null;
    if (karaokeMode === 'mic') {
      const micResult = await getMicrophoneStream();
      stream = micResult.stream;
      if (!stream) {
        setKaraokeMode('interactive');
        if (!micResult.isSecureContext) {
          setFeedbackAlert('📱 Conexión HTTP detectada en móvil/tablet: Los sistemas móviles bloquean el micrófono físico en HTTP sin cifrar. El Modo Guiado está activo para que practiques tocando palabras.');
        } else {
          setFeedbackAlert(`ℹ️ ${micResult.error || 'El hardware no entregó señal'}. La práctica continúa activa en Modo Guiado.`);
        }
      }
    }

    if (stream) {
      audioStreamRef.current = stream;
      setHardwareMicAvailable(true);
      setPermissionBlocked(false);

      // Detectar cantidad de canales de audio
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const settings = audioTracks[0].getSettings?.();
        if (settings?.channelCount) setChannelCount(settings.channelCount);
      }

      // 3. CONECTAR ANALIZADOR ESPECTRAL Y AMPLIFICADOR CON MEDICIÓN DE DECIBELES Y LATENCIA
      try {
        const ctx = localCtx || createUniversalAudioContext();
        if (ctx) {
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
          }
          audioContextRef.current = ctx;
          setLatencyMs(getAudioContextLatencyMs(ctx));
          setSampleRate(ctx.sampleRate || 48000);

          const source = ctx.createMediaStreamSource(stream);
          const gainNode = ctx.createGain();
          gainNode.gain.value = micGainValue;
          gainNodeRef.current = gainNode;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.25;

          source.connect(gainNode);
          gainNode.connect(analyser);
          analyserRef.current = analyser;

          const freqData = new Uint8Array(analyser.frequencyBinCount);
          const timeData = new Uint8Array(analyser.fftSize);

          const analyzeAudio = () => {
            if (!isRecordingRef.current) return;

            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }

            if (analyserRef.current) {
              // 1. Medición de RMS y Decibeles Verdaderos (dBFS)
              analyserRef.current.getByteTimeDomainData(timeData);
              let sumSquare = 0;
              for (let i = 0; i < timeData.length; i++) {
                const val = (timeData[i] - 128) / 128;
                sumSquare += val * val;
              }
              const rms = Math.sqrt(sumSquare / timeData.length) * (micGainValue / 2.0);
              const { dBFS, percentage, label } = calculateDecibelsFromRms(rms);

              setDecibelValue(dBFS);
              setDecibelLabel(label);
              setAudioLevel(percentage);

              // 2. Ecualizador visual espectral de 16 bandas
              analyserRef.current.getByteFrequencyData(freqData);
              const bars: number[] = [];
              const maxBin = Math.min(freqData.length, 64);
              const step = Math.max(1, Math.floor(maxBin / 16));
              for (let b = 0; b < 16; b++) {
                const val = freqData[b * step] || 0;
                bars.push(Math.min(100, Math.max(6, Math.round((val / 255) * 100))));
              }
              setFrequencyBars(bars);

              const now = performance.now();
              const state = voiceStateRef.current;
              // Detección vocal: requiere potencia vocal real (>= -30 dBFS y nivel >= 20%)
              const isVoiceActive = dBFS >= -30 && percentage >= 20;

              setIsUserSpeakingNow(isVoiceActive);

              if (isVoiceActive) {
                state.voicedFramesCount++;
                if (!state.isSpeaking) {
                  state.isSpeaking = true;
                  state.speechStartTime = now;
                  state.silenceStartTime = 0;
                }
              } else {
                if (state.isSpeaking) {
                  if (state.silenceStartTime === 0) {
                    state.silenceStartTime = now;
                  }
                  if (now - state.silenceStartTime > 120) {
                    state.isSpeaking = false;
                    state.silenceStartTime = 0;
                  }
                }
              }
            }
            animFrameRef.current = requestAnimationFrame(analyzeAudio);
          };

          animFrameRef.current = requestAnimationFrame(analyzeAudio);
        }
      } catch (e) {
        console.warn('AudioContext setup:', e);
      }

      // 4. INICIALIZAR RECONOCIMIENTO DE VOZ NATIVO (SPEECH RECOGNITION) CON AUTO-RESTART
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

          recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
            const cleanText = fullTranscript.trim();
            if (cleanText) {
              processSpokenTranscript(cleanText);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e?.error);
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'network') {
              canUseSpeechRecognitionRef.current = false;
              if (e.error === 'network') {
                setFeedbackAlert(
                  '🦁 Aviso de Reconocimiento por Voz: El navegador (ej. Brave o modo privado estricto) o la red restringieron el servicio de voz en la nube. Puedes habilitar los servicios de voz en Configuración de Brave > Privacidad, utilizar Google Chrome o Microsoft Edge, o practicar con el "Modo Guiado / Táctil" tocando las palabras.'
                );
              }
            }
          };

          recognition.onend = () => {
            if (isRecordingRef.current && canUseSpeechRecognitionRef.current) {
              try { recognition.start(); } catch {}
            }
          };

          try {
            recognition.start();
            speechRecRef.current = recognition;
          } catch {
            canUseSpeechRecognitionRef.current = false;
          }
        }
      } catch {
        canUseSpeechRecognitionRef.current = false;
      }

      // 5. GRABACIÓN DE AUDIO CON MEDIARECORDER Y CÓDEC UNIVERSAL (SOPORTA SAFARI iOS Y ANDROID)
      try {
        const supportedMime = getSupportedRecordingMimeType();
        const options = supportedMime ? { mimeType: supportedMime } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const finalMime = supportedMime || mediaRecorder.mimeType || 'audio/mp4';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
          setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        };
        mediaRecorder.start(100);
      } catch (e) {
        console.warn('MediaRecorder setup:', e);
      }
    }
  };

  // Reproducir el audio que el estudiante grabó
  const togglePlayRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingRecordedAudio) {
      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
        studentAudioPlayerRef.current.currentTime = 0;
      }
      setIsPlayingRecordedAudio(false);
      return;
    }

    if (!studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current = new Audio();
    }
    studentAudioPlayerRef.current.src = recordedAudioUrl;
    studentAudioPlayerRef.current.onended = () => setIsPlayingRecordedAudio(false);
    studentAudioPlayerRef.current.onerror = () => setIsPlayingRecordedAudio(false);
    setIsPlayingRecordedAudio(true);
    studentAudioPlayerRef.current.play().catch(() => setIsPlayingRecordedAudio(false));
  };

  // =========================================================================
  // PRUEBA DE MICRÓFONO EN VIVO (MONITOR ACTIVO + DECIBELES + LATENCIA + VISUALIZADOR)
  // =========================================================================
  const toggleTestMicrophone = async () => {
    if (isTestingMicLiveRef.current) {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach(t => t.stop());
        testStreamRef.current = null;
      }
      if (testSpeechRecRef.current) {
        try { testSpeechRecRef.current.stop(); } catch {}
        testSpeechRecRef.current = null;
      }
      if (testAudioCtxRef.current) {
        try { testAudioCtxRef.current.close(); } catch {}
        testAudioCtxRef.current = null;
      }
      if (testAnimRef.current) {
        cancelAnimationFrame(testAnimRef.current);
        testAnimRef.current = null;
      }
      setIsTestingMicLive(false);
      isTestingMicLiveRef.current = false;
      setAudioLevel(0);
      setDecibelValue(-60);
      setDecibelLabel('Silencio');
      setFrequencyBars(new Array(16).fill(6));
      setIsUserSpeakingNow(false);
      setTestDetectedSpeechText('');
      setTestMicError(null);
      return;
    }

    // Activar prueba
    isTestingMicLiveRef.current = true;
    setIsTestingMicLive(true);
    setMicTested(true);
    setTestDetectedSpeechText('');
    setTestMicError(null);

    // Crear AudioContext inmediatamente dentro del click
    let localCtx: AudioContext | null = createUniversalAudioContext();
    if (localCtx) {
      testAudioCtxRef.current = localCtx;
      setLatencyMs(getAudioContextLatencyMs(localCtx));
      setSampleRate(localCtx.sampleRate || 48000);
    }

    try {
      const micResult = await getMicrophoneStream();
      const stream = micResult.stream;
      if (!stream) {
        setHardwareMicAvailable(false);
        setTestMicError(micResult.error || 'El navegador o sistema no entregó señal de audio.');
        return;
      }

      testStreamRef.current = stream;
      setHardwareMicAvailable(true);

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const settings = audioTracks[0].getSettings?.();
        if (settings?.channelCount) setChannelCount(settings.channelCount);
      }

      const ctx = localCtx || createUniversalAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        testAudioCtxRef.current = ctx;
        setLatencyMs(getAudioContextLatencyMs(ctx));
        setSampleRate(ctx.sampleRate || 48000);

        const source = ctx.createMediaStreamSource(stream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = micGainValue;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.25;

        source.connect(gainNode);
        gainNode.connect(analyser);

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const timeData = new Uint8Array(analyser.fftSize);

        const testLoop = () => {
          if (!isTestingMicLiveRef.current) return;

          if (testAudioCtxRef.current?.state === 'suspended') {
            testAudioCtxRef.current.resume().catch(() => {});
          }

          // 1. Decibeles verdaderos y nivel RMS
          analyser.getByteTimeDomainData(timeData);
          let sumSquare = 0;
          for (let i = 0; i < timeData.length; i++) {
            const val = (timeData[i] - 128) / 128;
            sumSquare += val * val;
          }
          const rms = Math.sqrt(sumSquare / timeData.length) * (micGainValue / 2.0);
          const { dBFS, percentage, label } = calculateDecibelsFromRms(rms);

          setDecibelValue(dBFS);
          setDecibelLabel(label);
          setAudioLevel(percentage);
          setIsUserSpeakingNow(dBFS >= -30 && percentage >= 20);

          // 2. Bandas de frecuencia en vivo
          analyser.getByteFrequencyData(freqData);
          const bars: number[] = [];
          const maxBin = Math.min(freqData.length, 64);
          const step = Math.max(1, Math.floor(maxBin / 16));
          for (let b = 0; b < 16; b++) {
            const val = freqData[b * step] || 0;
            bars.push(Math.min(100, Math.max(6, Math.round((val / 255) * 100))));
          }
          setFrequencyBars(bars);

          testAnimRef.current = requestAnimationFrame(testLoop);
        };
        testLoop();
      }

      // Reconocimiento de voz para la prueba en vivo
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec && canUseSpeechRecognitionRef.current) {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = language === 'fr' ? 'fr-FR' : 'en-US';
          rec.onerror = (e: any) => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
              canUseSpeechRecognitionRef.current = false;
            }
          };
          rec.onresult = (e: any) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; ++i) {
              fullText += e.results[i][0].transcript + ' ';
            }
            const cleanText = fullText.trim();
            if (cleanText) {
              setTestDetectedSpeechText(cleanText);
            }
          };
          try {
            rec.start();
            testSpeechRecRef.current = rec;
          } catch {
            canUseSpeechRecognitionRef.current = false;
          }
        }
      } catch {
        canUseSpeechRecognitionRef.current = false;
      }
    } catch (e: any) {
      console.warn('Error en prueba de micrófono:', e);
      setTestMicError('Error al acceder al micrófono: ' + (e?.message || 'verifica permisos y recarga la página.'));
    }
  };

  // Cambiar micrófono en vivo
  const handleMicDeviceChange = async (newDeviceId: string) => {
    setSelectedMicId(newDeviceId);
    // Si estaba probando en vivo o grabando, reconectar inmediatamente
    if (isTestingMicLiveRef.current) {
      toggleTestMicrophone(); // apaga
      setTimeout(() => {
        toggleTestMicrophone(); // reinicia con nuevo deviceId
      }, 150);
    }
  };

  return (
    <div className={`w-full flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center ${className}`}>
      
      {/* 1. AVATAR PEDAGÓGICO GESTICULANTE CON CONTROL DE VELOCIDAD */}
      <div className="flex flex-col items-center shrink-0">
        <HumanGesticulatingAvatar
          gender={avatarGender}
          name={avatarName}
          language={language}
          voiceId={avatarVoice}
          speechRate={speechRate}
          onSpeechRateChange={setSpeechRate}
          isPlaying={isPlayingModelVoice}
          isListening={isRecording}
          avatarMood={
            isCompleted && accuracyScore >= 80
              ? 'celebrating'
              : isRecording
                ? 'listening'
                : isPlayingModelVoice
                  ? 'speaking'
                  : 'idle'
          }
          currentText={slowWordToHear ? `Escucha despacio: "${slowWordToHear}"` : phrase.targetText}
          translationText={phrase.translationEs}
          phoneticTip={phrase.phoneticGuide}
          onRepeat={() => playModelVoice(phrase.targetText, speechRate)}
          audioElement={audioRef.current}
        />
      </div>

      {/* 2. ESTUDIO INTERACTIVO DE KARAOKE FONÉTICO */}
      <div className="w-full max-w-2xl flex flex-col space-y-5 bg-slate-900/95 border-2 border-indigo-500/40 p-5 sm:p-7 rounded-3xl shadow-2xl backdrop-blur-md">
        
        {/* Encabezado del Reto de Pronunciación */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/40 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Reto de Pronunciación · Sistema Autónomo (0 Tokens)
            </span>
            <h3 className="text-lg font-black text-white">
              Karaoke de Fluidez Fonética
            </h3>
          </div>

          {/* Medidor de Precisión / Fluency Meter */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Precisión</span>
              <span className="text-lg font-black font-mono text-cyan-300">
                {isCompleted ? `${accuracyScore}%` : isRecording ? `${Math.round((completedIndices.length / targetWords.length) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              {accuracyScore >= 85 ? '🌟' : accuracyScore >= 60 ? '✨' : accuracyScore > 0 ? '🎯' : '⚠️'}
            </div>
          </div>
        </div>

        {/* BARRA DE ESTADO DEL MICRÓFONO & SELECTOR DE HARDWARE & AUDITORÍA */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-900/60 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording || isTestingMicLive ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording || isTestingMicLive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </span>
              <span className="font-bold text-slate-200">
                {isRecording 
                  ? karaokeMode === 'interactive'
                    ? '✨ Modo Guiado Asistido (Sesión Activa)'
                    : isUserSpeakingNow 
                      ? '🎙️ Voz Detectada (Hablando)' 
                      : '🎙️ En Silencio (Esperando que hables)'
                  : isTestingMicLive
                    ? isUserSpeakingNow
                      ? '🔊 Prueba en Vivo: ¡Micrófono Captando Audio!'
                      : '🔊 Prueba en Vivo: Esperando sonido...'
                    : karaokeMode === 'interactive'
                      ? '✨ Modo Guiado / Táctil Seleccionado'
                      : 'Micrófono Físico'}
              </span>

              {/* Badges de Telemetría en Tiempo Real (Decibeles y Latencia) */}
              {(isTestingMicLive || isRecording) && (
                <div className="flex items-center gap-1.5 ml-1">
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black border ${
                    decibelValue > -25 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60' 
                      : decibelValue > -45 
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60' 
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {decibelValue} dBFS
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60" title="Latencia del búfer de hardware">
                    {latencyMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* Selector de Modo: Micrófono Físico vs Modo Guiado */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-indigo-700/60">
              <button
                type="button"
                onClick={() => setKaraokeMode('mic')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  karaokeMode === 'mic'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Captura tu voz con el micrófono físico de tu equipo"
              >
                🎙️ Micrófono Físico
              </button>
              <button
                type="button"
                onClick={() => setKaraokeMode('interactive')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  karaokeMode === 'interactive'
                    ? 'bg-emerald-400 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Avanza tu práctica tocando las palabras o pulsando la barra espaciadora"
              >
                ✨ Modo Guiado / Táctil
              </button>
            </div>

            {/* Controles de Micrófono, Auditoría & Ganancia */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Selector de Dispositivo Hardware */}
              {availableMics.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-indigo-700/60 shadow-xs">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <select
                    value={selectedMicId}
                    onChange={(e) => handleMicDeviceChange(e.target.value)}
                    className="bg-transparent text-[11px] text-slate-200 font-bold focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
                    title="Selecciona el micrófono que estás utilizando físicamente"
                  >
                    {availableMics.map((mic, idx) => (
                      <option key={mic.deviceId || idx} value={mic.deviceId} className="bg-slate-900 text-white">
                        {mic.label || `Micrófono ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selector de Ganancia / Amplificación */}
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-indigo-700/60 text-[10px] font-bold">
                <span className="text-slate-400">Ganancia:</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextGain = micGainValue === 2.0 ? 4.0 : micGainValue === 4.0 ? 7.0 : 2.0;
                    setMicGainValue(nextGain);
                    if (gainNodeRef.current) gainNodeRef.current.gain.value = nextGain;
                  }}
                  className="px-1.5 py-0.5 rounded bg-indigo-950 hover:bg-indigo-900 text-cyan-300 font-black cursor-pointer"
                  title="Toca para alternar la sensibilidad y amplificación de tu micrófono"
                >
                  {micGainValue}x
                </button>
              </div>

              {/* Botón de Auditoría de Hardware en Vivo */}
              <button
                type="button"
                onClick={() => setShowHardwareDiagnostics(!showHardwareDiagnostics)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm ${
                  showHardwareDiagnostics
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'bg-indigo-950 hover:bg-indigo-900 text-slate-300 border border-indigo-700/60'
                }`}
                title="Inspecciona telemetría en tiempo real: decibeles (dBFS), latencia (ms), frecuencia y códec universal"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auditoría</span>
              </button>

              {/* Botón de Prueba en Vivo Toggle */}
              <button
                type="button"
                onClick={toggleTestMicrophone}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm ${
                  isTestingMicLive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black'
                }`}
                title="Prueba en tiempo real si tu micrófono capta tu voz"
              >
                <Activity className="w-3.5 h-3.5 text-white" />
                <span>{isTestingMicLive ? 'Detener Prueba' : 'Probar en Vivo'}</span>
              </button>
            </div>
          </div>

          {/* PANEL DE AUDITORÍA Y TELEMETRÍA DE HARDWARE EN TIEMPO REAL */}
          {showHardwareDiagnostics && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 border-2 border-cyan-500/40 space-y-3.5 animate-fade-in shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="font-black text-white text-xs">
                    Auditoría de Audio & Telemetría en Tiempo Real (100% Ecosistemas)
                  </span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  {deviceEnvironment.browserName} · {deviceEnvironment.isIOS ? 'Apple iOS' : deviceEnvironment.isMobile ? 'Android' : 'Desktop'}
                </span>
              </div>

              {/* Métricas de Hardware en 4 Tarjetas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                {/* 1. Decibeles Verdaderos */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-800/50 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Potencia (dBFS)</span>
                  <span className={`text-base font-black font-mono ${
                    decibelValue > -25 ? 'text-emerald-300' : decibelValue > -45 ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {decibelValue} dBFS
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold">{decibelLabel}</span>
                </div>

                {/* 2. Latencia de Hardware */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-800/50 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Latencia Búfer</span>
                  <span className="text-base font-black font-mono text-cyan-300">
                    {latencyMs} ms
                  </span>
                  <span className="text-[9px] text-emerald-400 block font-semibold">Ultra baja</span>
                </div>

                {/* 3. Muestreo & Canales */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-800/50 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Muestreo / Canales</span>
                  <span className="text-base font-black font-mono text-indigo-300">
                    {Math.round(sampleRate / 1000)} kHz
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold">{channelCount === 1 ? 'Mono' : 'Estéreo'}</span>
                </div>

                {/* 4. Códec de Grabación */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-800/50 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Códec Nativo</span>
                  <span className="text-xs font-black font-mono text-emerald-300 truncate block mt-0.5">
                    {deviceEnvironment.mimeType.split(';')[0] || 'audio/mp4'}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold">Universal</span>
                </div>
              </div>

              {/* Ecualizador Visual Espectral de 16 Bandas */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Espectro de Frecuencias Vocales (180 Hz - 3600 Hz):</span>
                  </span>
                  <span className="font-mono text-slate-400">16 bandas analizadas</span>
                </div>
                <div className="flex items-end justify-between gap-1 h-10 px-1 pt-1">
                  {frequencyBars.map((bar, i) => (
                    <div key={i} className="flex-1 bg-slate-800 rounded-t-sm h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full transition-all duration-75 rounded-t-sm ${
                          bar > 60 
                            ? 'bg-gradient-to-t from-emerald-500 to-green-300' 
                            : bar > 25 
                              ? 'bg-gradient-to-t from-teal-500 to-cyan-300' 
                              : 'bg-slate-700'
                        }`}
                        style={{ height: `${bar}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Guía Rápida de Solución para Móvil y Escritorio */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <span className="font-bold text-cyan-300 block">💡 Guía de Permisos por Dispositivo:</span>
                <ul className="space-y-1 text-[10px] text-slate-300 list-disc list-inside">
                  <li><strong>iPhone / iPad (iOS Safari):</strong> Ve a <em>Ajustes &gt; Safari &gt; Micrófono &gt; Permitir</em>, o toca el icono <em>aA</em> en la barra de URL para conceder acceso.</li>
                  <li><strong>Android (Chrome / Samsung):</strong> Toca los tres puntos &gt; <em>Configuración &gt; Configuración de sitios &gt; Micrófono</em> y asegúrate de permitir el dominio.</li>
                  <li><strong>Computadora (Edge / Chrome):</strong> Haz clic en el icono del candado junto a la URL y activa <em>Micrófono: Permitir</em>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Monitor Visual Activo durante Prueba en Vivo */}
          {isTestingMicLive && (
            <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 space-y-3 animate-fade-in shadow-xl">
              {testMicError ? (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs space-y-2.5 animate-fade-in shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Diagnóstico de Conexión del Micrófono:</span>
                  </div>
                  <p className="leading-relaxed font-medium">{testMicError}</p>
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTestingMicLive(false);
                        isTestingMicLiveRef.current = false;
                        setTestMicError(null);
                        setTimeout(() => toggleTestMicrophone(), 120);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>🔄 Reintentar Conexión</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHardwareDiagnostics(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-cyan-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-indigo-600 shadow-md active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Ver Auditoría de Hardware</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTestingMicLive(false);
                        isTestingMicLiveRef.current = false;
                        setKaraokeMode('interactive');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Usar Modo Guiado / Táctil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 active:scale-95"
                    >
                      <span>Recargar Página</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      Habla ahora frente a tu micrófono. Observa la barra y las palabras:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                        {decibelValue} dBFS · {decibelLabel}
                      </span>
                      <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${audioLevel > 10 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60' : 'bg-slate-950 text-slate-400'}`}>
                        {audioLevel > 10 ? `${audioLevel}% (¡Voz Captada!)` : `${audioLevel}% (Silencio)`}
                      </span>
                    </div>
                  </div>

                  {/* Barra de volumen visual en tiempo real con degradado reactivo */}
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-75 ${
                        audioLevel > 10 
                          ? 'bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 shadow-sm shadow-emerald-500/50' 
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(audioLevel, 4)}%` }}
                    />
                  </div>

                  {/* Mini-ecualizador en vivo durante la prueba */}
                  <div className="flex items-end justify-between gap-1 h-6 px-1">
                    {frequencyBars.map((bar, i) => (
                      <div key={i} className="flex-1 bg-slate-950 rounded-t-sm h-full flex items-end">
                        <div
                          className="w-full bg-cyan-400 transition-all duration-75 rounded-t-sm"
                          style={{ height: `${bar}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Badge de palabra reconocida durante la prueba */}
                  {testDetectedSpeechText ? (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <span>Voz captada con éxito:</span>
                        <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-emerald-400/50">"{testDetectedSpeechText}"</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">¡Tu micrófono funciona perfectamente!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>💡 Di una palabra en voz alta (ej: "hello" o "cappuccino") para verificar la captación acústica.</span>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                        title="Si cambiaste permisos en el navegador, recarga para que surtan efecto"
                      >
                        🔄 Recargar Página
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ÁREA PRINCIPAL DE LECTURA TIPO KARAOKE */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Pronuncia cada palabra en voz alta, pulsa espacio o tócala para avanzar:</span>
            <span className="text-teal-400 flex items-center gap-1 text-[11px]">
              <Volume2 className="w-3.5 h-3.5" />
              Toca una palabra roja para escucharla despacio
            </span>
          </div>

          {/* AVISO DISCRETO Y AMIGABLE DE HARDWARE / PERMISOS */}
          {permissionBlocked && (
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 block">
                    Micrófono en espera o uso exclusivo:
                  </span>
                  <span className="text-[11px] text-slate-300 block">
                    Cierra la ventana del candado de Chrome haciendo clic en la página. También puedes practicar de inmediato tocando las palabras.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setKaraokeMode('interactive');
                    setPermissionBlocked(false);
                    if (!isRecording) startRecording();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Modo Táctil / Guiado</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermissionBlocked(false);
                    toggleTestMicrophone();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-600 active:scale-95"
                  title="Reintentar conexión con el micrófono"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          )}

          {/* PALABRAS: SE PINTAN EN VERDE AL PRONUNCIARLAS O TOCARLAS */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 py-2 text-lg sm:text-2xl font-bold leading-relaxed">
            {targetWords.map((word, idx) => {
              const isWordCompleted = completedIndices.includes(idx);
              const isWordError = errorIndices.includes(idx);
              const isCurrentAwaiting = isRecording && idx === activeWordIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isWordError) {
                      practiceErrorWord(word);
                    } else if (isRecording || !isCompleted) {
                      advanceWordManually(word, idx);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl transition-all duration-200 text-left select-none cursor-pointer hover:scale-105 active:scale-95 ${
                    isWordError
                      ? 'bg-rose-500/25 text-rose-300 border-2 border-rose-500 underline decoration-rose-400 decoration-2 shadow-lg shadow-rose-950'
                      : isWordCompleted
                        ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400 shadow-lg shadow-emerald-950 scale-105'
                        : isCurrentAwaiting
                          ? 'bg-cyan-500/30 text-cyan-200 border-2 border-cyan-400 scale-110 shadow-cyan-500/30 shadow-lg animate-pulse'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-cyan-500/50'
                  }`}
                  title={
                    isWordError 
                      ? `Toca para escuchar "${word}" despacio` 
                      : isCurrentAwaiting 
                        ? `Toca para confirmar la palabra "${word}", pulsa espacio o pronúnciala al micrófono`
                        : word
                  }
                >
                  <span>{word}</span>
                  {isWordCompleted && !isWordError && (
                    <span className="ml-1 text-xs text-emerald-400">✓</span>
                  )}
                  {isWordError && (
                    <span className="ml-1 text-xs text-rose-400 font-mono">🔊</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ESTADO EN VIVO DURANTE LA GRABACIÓN */}
          {isRecording && (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/50 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isUserSpeakingNow ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>
                    {isUserSpeakingNow 
                      ? `Pronunciando: "${targetWords[activeWordIndex] || ''}"...`
                      : `Esperando que pronuncies: "${targetWords[activeWordIndex] || ''}"...`}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {recordingDuration}s
                </span>
              </div>

              {/* Medidor visual real de decibeles y espectrograma */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Nivel Acústico:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {decibelValue} dBFS ({decibelLabel})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-slate-400">Latencia: {latencyMs}ms</span>
                    <span className={`font-bold ${audioLevel > 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {audioLevel > 10 ? `${audioLevel}% (¡Voz Activa!)` : `${audioLevel}% (Silencio)`}
                    </span>
                  </div>
                </div>

                {/* Barra de decibeles */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-75 ${
                      audioLevel > 10 ? 'bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400' : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(audioLevel, 3)}%` }}
                  />
                </div>

                {/* Espectrograma de 16 bandas animado en tiempo real */}
                <div className="flex items-end justify-between gap-1 h-7 px-1 pt-0.5">
                  {frequencyBars.map((bar, i) => (
                    <div key={i} className="flex-1 bg-slate-950 rounded-t-sm h-full flex items-end">
                      <div
                        className={`w-full transition-all duration-75 rounded-t-sm ${
                          bar > 55 ? 'bg-emerald-400' : bar > 25 ? 'bg-cyan-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${bar}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Transcripción captada en vivo durante la práctica */}
              {detectedSpeechText && (
                <div className="text-[11px] text-cyan-300 bg-slate-950/90 p-2 rounded-xl border border-cyan-500/30 flex items-center gap-2">
                  <span>🎙️ Voz captada:</span>
                  <span className="text-white font-mono font-bold">"{detectedSpeechText}"</span>
                </div>
              )}
            </div>
          )}

          {/* ADVERTENCIA SI HUBO ERROR O SILENCIO */}
          {feedbackAlert && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border-2 border-amber-500/80 text-xs text-amber-200 flex items-start gap-2.5 animate-fade-in shadow-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-amber-100">Estado de Pronunciación:</span>
                <span>{feedbackAlert}</span>
              </div>
            </div>
          )}

          {/* REPRODUCTOR DE LA VOZ GRABADA DEL ALUMNO */}
          {recordedAudioUrl && !isRecording && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayRecordedAudio}
                className="px-3 py-1.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-xs font-bold flex items-center gap-2 border border-teal-600/50 cursor-pointer transition-all active:scale-95 shadow-md"
              >
                {isPlayingRecordedAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pausar mi Grabación</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-teal-300" />
                    <span>▶️ Escuchar mi Audio Grabado</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400">Audio registrado en vivo</span>
            </div>
          )}
        </div>

        {/* BOTONERA PRINCIPAL DE CONTROL */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          
          {/* Botón de Escuchar al Mentor */}
          <button
            type="button"
            onClick={() => playModelVoice(phrase.targetText, speechRate)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-600/50 text-indigo-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            {isPlayingModelVoice ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pausar Mentor</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-300" />
                <span>Escuchar Mentor ({speechRate}x)</span>
              </>
            )}
          </button>

          {/* ACCIONES DE PRONUNCIACIÓN: ASISTIDA / TECLADO & DETENER/INICIAR */}
          <div className="flex flex-wrap items-center gap-3">
            {isRecording && (
              <button
                type="button"
                onClick={() => {
                  const state = voiceStateRef.current;
                  if (state.currentWordIndex < targetWords.length) {
                    const currentWord = targetWords[state.currentWordIndex];
                    advanceWordManually(currentWord, state.currentWordIndex);
                  }
                }}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 cursor-pointer animate-pulse active:scale-95 border-2 border-emerald-200"
                title="Pulsa aquí o presiona la barra espaciadora para confirmar y avanzar la palabra actual"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>🗣️ Pronunciar: "{targetWords[activeWordIndex] || 'Finalizar'}" (Espacio)</span>
              </button>
            )}

            {/* BOTÓN GIGANTE DE INICIAR / DETENER PRONUNCIACIÓN */}
            <button
              type="button"
              onClick={isRecording ? () => completeEvaluation() : startRecording}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer shadow-2xl active:scale-95 ${
                isRecording
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-2 border-rose-300'
                  : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black shadow-emerald-500/40 border-2 border-emerald-200 scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 text-white" />
                  <span>DETENER & EVALUAR</span>
                </>
              ) : (
                <>
                  {karaokeMode === 'interactive' ? (
                    <Sparkles className="w-5 h-5 text-slate-950" />
                  ) : (
                    <Mic className="w-5 h-5 text-slate-950" />
                  )}
                  <span>
                    {isCompleted 
                      ? 'Volver a Practicar' 
                      : karaokeMode === 'interactive'
                        ? '✨ INICIAR PRÁCTICA GUIADA'
                        : 'INICIAR PRONUNCIACIÓN'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ACCIONES DE SIMULACIÓN DIDÁCTICA (MODO AUDITORÍA DOCENTE) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Simulación Didáctica (Auditoría Docente):</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => completeEvaluation(100, [])}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
              title="Simula 100% de aciertos para verificar felicitación y reporte"
            >
              <span>🌟 Simular 100% (Verde)</span>
            </button>
            <button
              type="button"
              onClick={() => completeEvaluation(67, ['cappuccino', 'blueberry', 'muffin'])}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/70 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
              title="Simula errores para probar palabras rojas y consejos"
            >
              <span>🎯 Simular Errores (Rojo & Tips)</span>
            </button>
            <button
              type="button"
              onClick={() => completeEvaluation(0, targetWords)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
              title="Simula silencio o fallo total sin pronunciación"
            >
              <span>💨 Simular Silencio (0%)</span>
            </button>
          </div>
        </div>

        {/* RESUMEN POST-PRÁCTICA Y RECOMENDACIÓN PEDAGÓGICA AL ALUMNO */}
        {isCompleted && (
          <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 space-y-4 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Evaluación Fonética Registrada</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono font-bold">
                Nota enviada en tiempo real al profesor
              </span>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Precisión</span>
                <span className={`text-lg font-black ${accuracyScore >= 80 ? 'text-emerald-300' : accuracyScore >= 50 ? 'text-amber-300' : 'text-rose-400'}`}>
                  {accuracyScore}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Correctas (Verde)</span>
                <span className="text-lg font-black text-emerald-300">{completedIndices.length} / {targetWords.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Con Error (Rojo)</span>
                <span className="text-lg font-black text-rose-300">{errorIndices.length}</span>
              </div>
            </div>

            {/* Registro de Voz / Telemetría Fonética */}
            {detectedSpeechText && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-xs flex items-center justify-between gap-2 shadow-inner">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voz captada:</span>
                </span>
                <span className="text-white font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-500/30 truncate max-w-[280px] sm:max-w-md">
                  "{detectedSpeechText}"
                </span>
              </div>
            )}

            {/* Aviso de Calibración Acústica de Hardware */}
            {evaluationSource === 'acoustic' && (
              <div className="p-3 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-xs text-cyan-200 space-y-1 shadow-md">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Evaluación por Sensor Acústico de Hardware</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tu micrófono captó tu voz con volumen y articulación adecuados.
                  <span className="text-cyan-300 block mt-0.5">💡 Tip en Windows: Si deseas que el navegador muestre además la transcripción de texto en tiempo real, verifica en la configuración de sonido de Windows que este micrófono USB esté asignado como "Dispositivo predeterminado".</span>
                </p>
              </div>
            )}

            {/* Palabras con Error con Botón para Escuchar Lento */}
            {errorWordsList.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 space-y-1.5">
                <span className="font-bold block text-rose-300">Palabras que necesitan corrección (toca para escuchar despacio):</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {errorWordsList.map((errWord, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => practiceErrorWord(errWord)}
                      className="px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-600 text-rose-100 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                      title="Escuchar con velocidad 0.65x"
                    >
                      <span>{errWord}</span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMENDACIÓN PEDAGÓGICA PERSONALIZADA AL ALUMNO */}
            {generatedAdvice && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border-2 border-amber-500/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{generatedAdvice.title}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
                  {generatedAdvice.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">›</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200 font-semibold flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{generatedAdvice.speedTip}</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
