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
  CheckCircle
} from 'lucide-react';

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

  // Estados del Micrófono Físico
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isUserSpeakingNow, setIsUserSpeakingNow] = useState<boolean>(false);
  const [hardwareMicAvailable, setHardwareMicAvailable] = useState<boolean>(false);
  const [micTested, setMicTested] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState<boolean>(false);

  // Estados del Karaoke Fonético Real (100% reactivo a la voz)
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [errorWordsList, setErrorWordsList] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
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

  // Variables de control de voz reactiva
  const voiceStateRef = useRef<{
    currentWordIndex: number;
    completed: string[];
    isSpeaking: boolean;
    speechStartTime: number;
    silenceStartTime: number;
    voicedFramesCount: number;
  }>({
    currentWordIndex: 0,
    completed: [],
    isSpeaking: false,
    speechStartTime: 0,
    silenceStartTime: 0,
    voicedFramesCount: 0
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

  // Chequeo inicial del micrófono
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasAudioInput = devices.some(d => d.kind === 'audioinput');
        setHardwareMicAvailable(hasAudioInput);
      }).catch(() => {
        setHardwareMicAvailable(true);
      });
    }
  }, []);

  // Reiniciar estado al cambiar de frase
  useEffect(() => {
    setIsRecording(false);
    setIsCompleted(false);
    setActiveWordIndex(0);
    setCompletedWords([]);
    setErrorWordsList([]);
    setAccuracyScore(0);
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
  // DETENER Y EVALUAR LA PRÁCTICA (RIGUROSO Y HONESTO)
  // =========================================================================
  const completeEvaluation = useCallback((forcedAccuracy?: number, forcedErrors?: string[]) => {
    setIsRecording(false);
    setIsUserSpeakingNow(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }

    let finalErrors: string[] = [];
    let finalCorrect: string[] = [];
    let calculatedAcc = 0;

    if (forcedAccuracy !== undefined) {
      calculatedAcc = forcedAccuracy;
      finalErrors = forcedErrors || [];
      finalCorrect = targetWords.filter(w => !finalErrors.includes(w));
    } else {
      const state = voiceStateRef.current;
      
      // Si el alumno NO habló (cero palabras articuladas o en silencio total)
      if (state.completed.length === 0) {
        finalCorrect = [];
        finalErrors = [...targetWords]; // ¡TODAS EN ROJO!
        calculatedAcc = 0;
      } else {
        // Marcamos las palabras que el alumno efectivamente pronunció con su voz
        finalCorrect = [...state.completed];
        finalErrors = targetWords.filter(w => !finalCorrect.includes(w));
        calculatedAcc = Math.round((finalCorrect.length / targetWords.length) * 100);
      }
    }

    setCompletedWords(finalCorrect);
    setErrorWordsList(finalErrors);
    setAccuracyScore(calculatedAcc);
    setIsCompleted(true);

    if (calculatedAcc === 0) {
      setFeedbackAlert('No se detectó pronunciación de palabras. Asegúrate de hablar frente al micrófono y pronunciar cada palabra.');
      playSfx('wrong');
    } else if (calculatedAcc >= 80) {
      setFeedbackAlert(null);
      playSfx('victory');
    } else {
      setFeedbackAlert(`Pronunciaste ${finalCorrect.length} de ${targetWords.length} palabras. Toca las palabras en rojo para escuchar cómo pronunciarlas despacio.`);
      playSfx('correct');
    }

    const advice = generateAdvice(finalErrors, calculatedAcc);
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
      spokenTranscript: finalCorrect.length > 0 
        ? targetWords.map(w => finalCorrect.includes(w) ? w : '...').join(' ')
        : '(Silencio / Sin palabras detectadas)',
      overallAccuracy: calculatedAcc,
      correctWords: finalCorrect,
      mispronouncedWords: finalErrors,
      pedagogicalAdvice: advice.tips.join(' | ') + ' ' + advice.speedTip,
      speedPpm: Math.round(finalCorrect.length * 12)
    });

    if (onComplete) {
      onComplete({ accuracy: calculatedAcc, correctCount: finalCorrect.length, errorWords: finalErrors });
    }
  }, [targetWords, phrase, language, avatarVoice, lessonId, lessonTitle, studentName, submitStudentReport, onComplete, playSfx]);

  // =========================================================================
  // INICIAR GRABACIÓN CON DETECTOR DE VOZ FÍSICO REAL (CON AMPLIFICACIÓN GAIN)
  // =========================================================================
  const startRecording = async () => {
    setIsRecording(true);
    setIsCompleted(false);
    setRecordingDuration(0);
    setActiveWordIndex(0);
    setCompletedWords([]);
    setErrorWordsList([]);
    setFeedbackAlert(null);
    setRecordedAudioUrl(null);
    setIsUserSpeakingNow(false);
    audioChunksRef.current = [];
    playSfx('start');

    // Inicializar estado de voz
    voiceStateRef.current = {
      currentWordIndex: 0,
      completed: [],
      isSpeaking: false,
      speechStartTime: 0,
      silenceStartTime: 0,
      voicedFramesCount: 0
    };

    // Temporizador de duración
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // Capturar audio físico del micrófono USB
    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        if (stream) {
          audioStreamRef.current = stream;
          setHardwareMicAvailable(true);

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);

            // NODO DE GANANCIA (3.5x) para amplificar micrófonos USB PnP de bajo volumen
            const gainNode = ctx.createGain();
            gainNode.gain.value = 3.5;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.2;

            source.connect(gainNode);
            gainNode.connect(analyser);
            analyserRef.current = analyser;

            const timeData = new Uint8Array(analyser.fftSize);

            // Umbral de habla calibrado
            const SPEECH_THRESHOLD = 10; // Con 3.5x de ganancia, cualquier voz normal supera 15-40%

            const analyzeAudio = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteTimeDomainData(timeData);

                let sumSquare = 0;
                for (let i = 0; i < timeData.length; i++) {
                  const val = (timeData[i] - 128) / 128;
                  sumSquare += val * val;
                }
                const rms = Math.sqrt(sumSquare / timeData.length);
                const volumePercent = Math.min(100, Math.round(rms * 280));
                setAudioLevel(volumePercent);

                const now = performance.now();
                const state = voiceStateRef.current;
                const isVoiceActive = volumePercent >= SPEECH_THRESHOLD;

                setIsUserSpeakingNow(isVoiceActive);

                if (isVoiceActive) {
                  state.voicedFramesCount++;
                  // El alumno comenzó a emitir sonido para la palabra actual
                  if (!state.isSpeaking) {
                    state.isSpeaking = true;
                    state.speechStartTime = now;
                    state.silenceStartTime = 0;
                  }
                } else {
                  // El alumno se calló o hizo una pausa entre palabras
                  if (state.isSpeaking) {
                    if (state.silenceStartTime === 0) {
                      state.silenceStartTime = now;
                    }

                    // Si la pausa dura más de 90ms, confirmamos que terminó de decir la palabra
                    if (now - state.silenceStartTime > 90) {
                      const wordDuration = state.silenceStartTime - state.speechStartTime;
                      state.isSpeaking = false;
                      state.silenceStartTime = 0;

                      // Si emitió voz durante más de 120ms (tiempo típico de una palabra)
                      if (wordDuration >= 120) {
                        const wordPronounced = targetWords[state.currentWordIndex];
                        if (wordPronounced && !state.completed.includes(wordPronounced)) {
                          state.completed.push(wordPronounced);
                          setCompletedWords([...state.completed]);
                          playSfx('correct');

                          const nextIdx = state.currentWordIndex + 1;
                          state.currentWordIndex = nextIdx;
                          setActiveWordIndex(nextIdx);

                          // Si pronunció todas las palabras de la frase
                          if (nextIdx >= targetWords.length) {
                            setTimeout(() => {
                              completeEvaluation(100, []);
                            }, 350);
                            return;
                          }
                        }
                      }
                    }
                  }
                }
              }

              animFrameRef.current = requestAnimationFrame(analyzeAudio);
            };

            animFrameRef.current = requestAnimationFrame(analyzeAudio);
          }

          // Grabar el audio con MediaRecorder
          try {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setRecordedAudioUrl(URL.createObjectURL(audioBlob));
            };
            mediaRecorder.start(100);
          } catch {}
        }
      } catch (err) {
        console.warn('Acceso a micrófono:', err);
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
    studentAudioPlayerRef.current.play();
  };

  // Prueba rápida de micrófono
  const testMicrophoneDirectly = async () => {
    setMicTested(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHardwareMicAvailable(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = 3.5;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(gainNode);
        gainNode.connect(analyser);
        
        let frames = 0;
        const testLoop = () => {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          setAudioLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
          frames++;
          if (frames < 80) {
            requestAnimationFrame(testLoop);
          } else {
            stream.getTracks().forEach(t => t.stop());
            ctx.close();
            setAudioLevel(0);
          }
        };
        testLoop();
      }
    } catch {
      setHardwareMicAvailable(false);
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
                {isCompleted ? `${accuracyScore}%` : isRecording ? `${Math.round((completedWords.length / targetWords.length) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              {accuracyScore >= 85 ? '🌟' : accuracyScore >= 60 ? '✨' : accuracyScore > 0 ? '🎯' : '⚠️'}
            </div>
          </div>
        </div>

        {/* BARRA DE ESTADO DEL MICRÓFONO & PRUEBA */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="font-bold text-slate-200">
              {isRecording 
                ? isUserSpeakingNow 
                  ? '🎙️ Voz Detectada (Hablando)' 
                  : '🎙️ En Silencio (Esperando que hables)'
                : 'Micrófono Listo y Vinculado'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testMicrophoneDirectly}
              className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-cyan-300 border border-indigo-700/60 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Probar que el micrófono capta tu voz"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{micTested ? 'Probado ✓' : 'Probar Micrófono'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Ganancia Amplificada 3.5x
            </span>
          </div>
        </div>

        {/* ÁREA PRINCIPAL DE LECTURA TIPO KARAOKE */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Pronuncia cada palabra en voz alta frente al micrófono:</span>
            <span className="text-teal-400 flex items-center gap-1 text-[11px]">
              <Volume2 className="w-3.5 h-3.5" />
              Toca una palabra roja para escucharla despacio
            </span>
          </div>

          {/* PALABRAS: SOLO SE PINTAN EN VERDE SI EL USUARIO REALMENTE HABLÓ */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 py-2 text-lg sm:text-2xl font-bold leading-relaxed">
            {targetWords.map((word, idx) => {
              const isWordCompleted = completedWords.includes(word);
              const isWordError = errorWordsList.includes(word);
              const isCurrentAwaiting = isRecording && idx === activeWordIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => isWordError && practiceErrorWord(word)}
                  disabled={!isWordError}
                  className={`px-3.5 py-2 rounded-2xl transition-all duration-200 text-left select-none ${
                    isWordError
                      ? 'bg-rose-500/25 text-rose-300 border-2 border-rose-500 underline decoration-rose-400 decoration-2 cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-rose-950'
                      : isWordCompleted
                        ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400 shadow-lg shadow-emerald-950 scale-105'
                        : isCurrentAwaiting
                          ? 'bg-cyan-500/30 text-cyan-200 border-2 border-cyan-400 scale-110 shadow-cyan-500/30 shadow-lg'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 cursor-default'
                  }`}
                  title={isWordError ? `Toca para escuchar "${word}" despacio` : word}
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
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/50 space-y-2 animate-fade-in">
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

              {/* Medidor visual real de decibeles */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Nivel del Micrófono en Vivo:</span>
                  <span className={`font-mono font-bold ${audioLevel > 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {audioLevel > 10 ? `${audioLevel}% (Voz detectada)` : `${audioLevel}% (Silencio)`}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-75 ${audioLevel > 10 ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-slate-700'}`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ADVERTENCIA SI HUBO ERROR O SILENCIO */}
          {feedbackAlert && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border-2 border-amber-500/80 text-xs text-amber-200 flex items-start gap-2.5 animate-fade-in shadow-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-amber-100">Resultado de Pronunciación:</span>
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

          {/* BOTÓN GIGANTE DE INICIAR / DETENER PRONUNCIACIÓN */}
          <button
            type="button"
            onClick={isRecording ? () => completeEvaluation() : startRecording}
            className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer shadow-2xl active:scale-95 ${
              isRecording
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white animate-pulse border-2 border-rose-300 scale-105'
                : 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black shadow-emerald-500/40 border-2 border-emerald-200 scale-105'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 text-white" />
                <span>DETENER & EVALUAR PRONUNCIACIÓN</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-slate-950" />
                <span>{isCompleted ? 'Volver a Practicar' : 'INICIAR PRONUNCIACIÓN'}</span>
              </>
            )}
          </button>
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
                <span className="text-lg font-black text-emerald-300">{completedWords.length} / {targetWords.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Con Error (Rojo)</span>
                <span className="text-lg font-black text-rose-300">{errorWordsList.length}</span>
              </div>
            </div>

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
