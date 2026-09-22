"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Database, 
  Clock, 
  RotateCcw,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  Key,
  X,
  Check
} from 'lucide-react';
import { configureHistoricalUtterance, getPersonaGender } from '@/lib/historicalVoiceEngine';

interface CharacterAnatomicalMouth {
  x1: number;         // Comisura izquierda en espacio 1024
  y1: number;
  cx: number;         // Centro anatómico
  cy: number;
  x2: number;         // Comisura derecha en espacio 1024
  y2: number;
  maxOpening: number; // Apertura vertical máxima en px
  cavityDarkColor: string;
  cavityMidColor: string;
  cavityRimColor: string;
  lowerLipRimColor: string;
  teethColor: string;
}

function getCharacterMouthConfig(name: string): CharacterAnatomicalMouth {
  const norm = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('josefa') || norm.includes('corregidora')) {
    return {
      x1: 454,
      y1: 374,
      cx: 491,
      cy: 374,
      x2: 528,
      y2: 373,
      maxOpening: 12.5,
      cavityDarkColor: '#0a0102',
      cavityMidColor: '#240407',
      cavityRimColor: '#450d13',
      lowerLipRimColor: 'rgba(150, 48, 54, 0.92)',
      teethColor: '#f2ede4'
    };
  }
  if (norm.includes('villa') || norm.includes('doroteo') || norm.includes('arango') || norm.includes('centauro')) {
    return {
      x1: 490,
      y1: 343,
      cx: 516,
      cy: 343,
      x2: 542,
      y2: 343,
      maxOpening: 11,
      cavityDarkColor: '#080102',
      cavityMidColor: '#1f0306',
      cavityRimColor: '#3d0b11',
      lowerLipRimColor: 'rgba(145, 60, 50, 0.92)',
      teethColor: '#ede5d8'
    };
  }
  if (norm.includes('hidalgo')) {
    return {
      x1: 456,
      y1: 358,
      cx: 500,
      cy: 358,
      x2: 544,
      y2: 358,
      maxOpening: 13.5,
      cavityDarkColor: '#090203',
      cavityMidColor: '#210508',
      cavityRimColor: '#3c0f14',
      lowerLipRimColor: 'rgba(165, 80, 75, 0.88)',
      teethColor: '#eee6da'
    };
  }
  return {
    x1: 460,
    y1: 370,
    cx: 500,
    cy: 370,
    x2: 540,
    y2: 370,
    maxOpening: 13,
    cavityDarkColor: '#0a0102',
    cavityMidColor: '#240407',
    cavityRimColor: '#450d13',
    lowerLipRimColor: 'rgba(160, 60, 65, 0.88)',
    teethColor: '#f0ece2'
  };
}

export interface HistoricalLivingAvatarProps {
  characterName: string;
  slug?: string;
  avatarImageUrl?: string;
  initialGreeting?: string;
  isGeographicSite?: boolean;
  onQuestionAsked?: (question: string, answer: string, fromCache: boolean) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  text: string;
  isCached?: boolean;
  timestamp: string;
}

type IdleGesture = 'look_left' | 'look_right' | 'subtle_nod' | 'deep_breath' | 'brow_focus';

export const HistoricalLivingAvatar: React.FC<HistoricalLivingAvatarProps> = ({
  characterName,
  slug,
  avatarImageUrl = '/images/history/josefa_ortiz_avatar.png',
  initialGreeting,
  isGeographicSite = false,
  onQuestionAsked,
  className = ''
}) => {
  // Estados de animación del avatar
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpenRatio, setMouthOpenRatio] = useState(0);
  const [activeGesture, setActiveGesture] = useState<IdleGesture | null>(null);
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());

  // Estados de conversación
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-msg',
      sender: 'character',
      text: initialGreeting || (isGeographicSite 
        ? `Bienvenido a ${characterName}. Soy la memoria viva de este enclave histórico. Pregúntame sobre los acontecimientos, héroes y batallas que aquí tuvieron lugar.`
        : `Soy ${characterName}. Con el honor y el deber republicano que rigieron mi vida, estoy aquí para responder a tus inquietudes históricas. ¿Qué deseas saber sobre nuestro tiempo?`),
      isCached: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [tokenFeedback, setTokenFeedback] = useState<{ cost: number; source: string } | null>({
    cost: 0,
    source: 'Bóveda Curricular (0 Tokens)'
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Inicializar estado de API Key desde almacenamiento de sesión
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('iskool_ai_api_key') || localStorage.getItem('iskool_ai_api_key') || '';
      setHasApiKey(Boolean(stored));
      setApiKeyInput(stored);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      const cleanKey = key.trim();
      if (cleanKey) {
        sessionStorage.setItem('iskool_ai_api_key', cleanKey);
        setHasApiKey(true);
      } else {
        sessionStorage.removeItem('iskool_ai_api_key');
        localStorage.removeItem('iskool_ai_api_key');
        setHasApiKey(false);
      }
    }
    setIsKeyModalOpen(false);
  };

  const mouthCfg = getCharacterMouthConfig(characterName);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mouthIntervalRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (mouthIntervalRef.current) {
        clearInterval(mouthIntervalRef.current);
        mouthIntervalRef.current = null;
      }
    };
  }, []);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // =========================================================================
  // GESTOS ALEATORIOS CADA 15-20 SEGUNDOS CUANDO ESTÁ INACTIVO (REGLA 4)
  // =========================================================================
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const scheduleNextIdleGesture = () => {
      // Intervalo aleatorio entre 15 y 20 segundos
      const nextDelayMs = Math.floor(15000 + Math.random() * 5000);

      idleTimer = setTimeout(() => {
        if (!isSpeaking) {
          const gestures: IdleGesture[] = ['look_left', 'look_right', 'subtle_nod', 'deep_breath', 'brow_focus'];
          // Selección aleatoria para que nunca haya un patrón repetitivo
          const chosen = gestures[Math.floor(Math.random() * gestures.length)];
          setActiveGesture(chosen);

          // Pestañeo sutil acompañando el gesto
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 240);

          // Duración del gesto: 2.2 a 3.0 segundos
          setTimeout(() => {
            setActiveGesture(null);
            scheduleNextIdleGesture();
          }, 2600);
        } else {
          scheduleNextIdleGesture();
        }
      }, nextDelayMs);
    };

    scheduleNextIdleGesture();

    return () => {
      clearTimeout(idleTimer);
    };
  }, [lastInteractionTime, isSpeaking]);

  // Pestañeo natural periódico (cada 4-7 segundos)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isBlinking) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, Math.floor(4000 + Math.random() * 3000));

    return () => clearInterval(blinkInterval);
  }, [isBlinking]);

  // Sincronización de labios (Lip-sync simulado armónico de respaldo)
  const startLipSyncAnimation = useCallback(() => {
    setIsSpeaking(true);
    let step = 0;
    if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);

    mouthIntervalRef.current = setInterval(() => {
      step++;
      // Variación orgánica de apertura de boca y gesticulación mandibular
      const ratio = (Math.sin(step * 0.8) + 1) / 2 * 0.85 + (Math.sin(step * 1.5) * 0.15);
      setMouthOpenRatio(Math.max(0.15, Math.min(1, ratio)));
    }, 110);
  }, []);

  const stopLipSyncAnimation = useCallback(() => {
    if (mouthIntervalRef.current) {
      clearInterval(mouthIntervalRef.current);
      mouthIntervalRef.current = null;
    }
    setIsSpeaking(false);
    setMouthOpenRatio(0);
  }, []);

  // Fallback de síntesis de voz en navegador
  const fallbackSpeechSynthesis = useCallback((cleanText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    configureHistoricalUtterance(utterance, characterName);

    utterance.onstart = () => {
      startLipSyncAnimation();
    };
    utterance.onend = () => {
      stopLipSyncAnimation();
    };
    utterance.onerror = () => {
      stopLipSyncAnimation();
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [characterName, startLipSyncAnimation, stopLipSyncAnimation]);

  // Reproducción de voz humana neural ultra-realista con sincronización de ondas sonoras
  const speakText = useCallback(async (text: string) => {
    if (!audioEnabled || typeof window === 'undefined') return;

    // Detener cualquier audio previo
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/\[\[(.*?)\]\]/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const gender = getPersonaGender(characterName);
    // Voz femenina adulta, solemne y cálida (Dalia Neural mexicana) o masculina (Jorge Neural)
    const selectedVoice = gender === 'female' ? 'es-MX-DaliaNeural' : 'es-MX-JorgeNeural';

    try {
      const ttsRes = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: selectedVoice,
          rate: gender === 'female' ? 0.94 : 0.93, // Cadencia solemne y pausada (femenina virreinal o masculina militar)
          pitch: gender === 'female' ? 0.98 : 0.96 // -2Hz para voz femenina adulta madura, -4Hz para voz masculina grave y autoritaria
        })
      });

      if (ttsRes.ok) {
        const audioBlob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        let setupAnalyserSuccess = false;
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const src = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            src.connect(analyser);
            analyser.connect(ctx.destination);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkAudioLevel = () => {
              if (audio.paused || audio.ended) return;
              analyser.getByteFrequencyData(dataArray);
              let total = 0;
              for (let i = 0; i < bufferLength; i++) {
                total += dataArray[i];
              }
              const avg = total / bufferLength;
              const ratio = Math.min(1, Math.max(0, (avg - 8) / 36));
              setMouthOpenRatio(ratio);
              animFrameRef.current = requestAnimationFrame(checkAudioLevel);
            };

            audio.onplay = () => {
              setIsSpeaking(true);
              if (ctx.state === 'suspended') {
                ctx.resume();
              }
              checkAudioLevel();
            };
            setupAnalyserSuccess = true;
          }
        } catch (analyserErr) {
          console.warn('AudioContext analyser falló, usando sincronización armónica:', analyserErr);
        }

        if (!setupAnalyserSuccess) {
          audio.onplay = () => {
            startLipSyncAnimation();
          };
        }

        audio.onended = () => {
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }
          stopLipSyncAnimation();
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }
          stopLipSyncAnimation();
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          fallbackSpeechSynthesis(cleanText);
        };

        await audio.play();
        return;
      }
    } catch (ttsErr) {
      console.warn('Fallo al solicitar voz neural humana, recurriendo a voz de navegador:', ttsErr);
    }

    fallbackSpeechSynthesis(cleanText);
  }, [audioEnabled, characterName, startLipSyncAnimation, stopLipSyncAnimation, fallbackSpeechSynthesis]);

  // Envío de pregunta al avatar
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    setLastInteractionTime(Date.now());

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const clientApiKey = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('iskool_ai_api_key') || localStorage.getItem('iskool_ai_api_key') || '')
        : '';

      const res = await fetch('/api/ai/historical-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_persona',
          characterName,
          slug,
          question: query,
          userApiKey: clientApiKey
        })
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const charMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          sender: 'character',
          text: data.answer,
          isCached: data.cached,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, charMsg]);
        setTokenFeedback({
          cost: data.tokenCost || 0,
          source: data.cached ? 'Bóveda Curricular (0 Tokens)' : 'Motor de IA Pedagógica'
        });

        if (onQuestionAsked) {
          onQuestionAsked(query, data.answer, Boolean(data.cached));
        }

        speakText(data.answer);
      } else {
        const fallbackMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          sender: 'character',
          text: 'Las vicisitudes del tiempo nublan mi respuesta en este instante. Permíteme reflexionar y pregúntame de nuevo sobre los sucesos de nuestra patria.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (err) {
      console.error('Error al dialogar con el avatar histórico:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Micrófono con Web Speech API
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta entrada de voz directa. Puedes escribir tu pregunta en el recuadro.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Reconocimiento de voz:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error iniciando micrófono:', e);
      setIsListening(false);
    }
  };

  // Determinar transformaciones de gesticulación visual
  const getAvatarTransform = () => {
    if (activeGesture === 'look_left') {
      return { rotateY: -8, rotateZ: -1, x: -6, y: -2 };
    }
    if (activeGesture === 'look_right') {
      return { rotateY: 8, rotateZ: 1, x: 6, y: -2 };
    }
    if (activeGesture === 'subtle_nod') {
      return { rotateX: 6, y: 4, scale: 1.01 };
    }
    if (activeGesture === 'deep_breath') {
      return { y: -4, scale: 1.025 };
    }
    if (activeGesture === 'brow_focus') {
      return { y: -2, scale: 1.015, rotateX: -3 };
    }
    if (isSpeaking) {
      return { y: Math.sin(Date.now() / 200) * 2, rotateZ: Math.sin(Date.now() / 400) * 1 };
    }
    return { x: 0, y: 0, rotateY: 0, rotateZ: 0, scale: 1 };
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/95 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl ${className}`}>
      {/* ================= PANEL IZQUIERDO: AVATAR VIVO GESTICULANTE ================= */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/60 to-black/80 border border-amber-500/20 relative overflow-hidden">
        {/* Halo de luz mística de época */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Indicador de Estado y Gesticulación */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-amber-300/80 pb-2 border-b border-amber-500/20 z-10">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span className="font-bold">{isSpeaking ? 'Hablando en 1ª Persona' : activeGesture ? 'Reflexionando...' : 'Atento al Estudiante'}</span>
          </div>
          <button 
            type="button" 
            onClick={() => {
              const nextState = !audioEnabled;
              setAudioEnabled(nextState);
              if (!nextState) {
                if (currentAudioRef.current) {
                  currentAudioRef.current.pause();
                  currentAudioRef.current = null;
                }
                if (animFrameRef.current) {
                  cancelAnimationFrame(animFrameRef.current);
                  animFrameRef.current = null;
                }
                if (audioContextRef.current) {
                  audioContextRef.current.close().catch(() => {});
                  audioContextRef.current = null;
                }
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                stopLipSyncAnimation();
              }
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-all text-amber-400 cursor-pointer"
            title={audioEnabled ? 'Silenciar voz' : 'Activar voz'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>
        </div>

        {/* Lienzo del Avatar Anatómico con Gesticulaciones */}
        <div className="relative my-4 w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 border-amber-500/40 p-1 shadow-2xl shadow-amber-500/20 bg-slate-950 overflow-hidden flex items-center justify-center">
          <motion.div 
            className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
            animate={getAvatarTransform()}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <img 
              src={avatarImageUrl || '/images/history/josefa_ortiz_avatar.png'} 
              alt={characterName} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/history/josefa_ortiz_avatar.png';
              }}
              className="w-full h-full object-cover select-none pointer-events-none filter contrast-105 brightness-95"
            />

            {/* Capa de Párpados / Pestañeo Realista */}
            <motion.div 
              className="absolute inset-0 bg-amber-950/80 mix-blend-multiply pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isBlinking ? 0.95 : 0 }}
              transition={{ duration: 0.12 }}
            />

            {/* Capa de Movimiento Mandibular / Boca (Lip-sync anatómico de precisión con SVG en espacio 1024) */}
            <svg 
              viewBox="0 0 1024 1024" 
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
            >
              <defs>
                <radialGradient id={`avatarCavity_${(characterName || 'char').replace(/\s+/g, '_')}`} cx="48%" cy="30%" r="65%">
                  <stop offset="0%" stopColor={mouthCfg.cavityDarkColor} />
                  <stop offset="55%" stopColor={mouthCfg.cavityMidColor} />
                  <stop offset="100%" stopColor={mouthCfg.cavityRimColor} />
                </radialGradient>
                <linearGradient id={`avatarTeeth_${(characterName || 'char').replace(/\s+/g, '_')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={mouthCfg.teethColor} stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#ded4c3" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#aa9680" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id={`avatarLowerLip_${(characterName || 'char').replace(/\s+/g, '_')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={mouthCfg.lowerLipRimColor} />
                  <stop offset="60%" stopColor="rgba(185, 78, 80, 0.65)" />
                  <stop offset="100%" stopColor="rgba(210, 110, 105, 0.15)" />
                </linearGradient>
              </defs>

              {isSpeaking && mouthOpenRatio > 0.04 && (
                <g>
                  {/* Cavidad bucal anatómica (sombra interior de boca abierta) */}
                  <path 
                    d={`M ${mouthCfg.x1} ${mouthCfg.y1} Q ${mouthCfg.cx} ${mouthCfg.cy - mouthOpenRatio * 1.5} ${mouthCfg.x2} ${mouthCfg.y2} Q ${mouthCfg.cx} ${mouthCfg.cy + mouthOpenRatio * mouthCfg.maxOpening} ${mouthCfg.x1} ${mouthCfg.y1} Z`} 
                    fill={`url(#avatarCavity_${(characterName || 'char').replace(/\s+/g, '_')})`} 
                  />
                  
                  {/* Fila superior de dientes naturales nacarados */}
                  <path 
                    d={`M ${mouthCfg.cx - 18} ${mouthCfg.cy - 1} Q ${mouthCfg.cx} ${mouthCfg.cy - 2.2} ${mouthCfg.cx + 18} ${mouthCfg.cy - 1.5} Q ${mouthCfg.cx + 18} ${mouthCfg.cy - 1 + Math.min(mouthOpenRatio * mouthCfg.maxOpening * 0.45, 5)} Q ${mouthCfg.cx} ${mouthCfg.cy + Math.min(mouthOpenRatio * mouthCfg.maxOpening * 0.45, 5)} ${mouthCfg.cx - 18} ${mouthCfg.cy - 1 + Math.min(mouthOpenRatio * mouthCfg.maxOpening * 0.45, 5)} Z`} 
                    fill={`url(#avatarTeeth_${(characterName || 'char').replace(/\s+/g, '_')})`} 
                  />
                  
                  {/* Sombra de lengua / fondo bucal para fonemas abiertos */}
                  {mouthOpenRatio > 0.45 && (
                    <ellipse 
                      cx={mouthCfg.cx} 
                      cy={mouthCfg.cy + mouthOpenRatio * mouthCfg.maxOpening * 0.75} 
                      rx={10 + mouthOpenRatio * 4} 
                      ry={1.5 + mouthOpenRatio * 1.5} 
                      fill="#54141b" 
                      opacity={0.85} 
                    />
                  )}
                  
                  {/* Reborde carnoso y textura del labio inferior descendiendo de forma natural con la mandíbula */}
                  <path 
                    d={`M ${mouthCfg.x1 + 2} ${mouthCfg.y1 + 0.5} Q ${mouthCfg.cx} ${mouthCfg.cy + mouthOpenRatio * mouthCfg.maxOpening} ${mouthCfg.x2 - 2} ${mouthCfg.y2 + 0.5} Q ${mouthCfg.cx} ${mouthCfg.cy + mouthOpenRatio * mouthCfg.maxOpening + 3} ${mouthCfg.x1 + 2} ${mouthCfg.y1 + 0.5} Z`} 
                    fill={`url(#avatarLowerLip_${(characterName || 'char').replace(/\s+/g, '_')})`} 
                    opacity={0.88} 
                  />
                </g>
              )}
            </svg>

            {/* Sombra de época y velo dramático */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          </motion.div>
        </div>

        {/* Ficha del Personaje */}
        <div className="text-center z-10 space-y-1">
          <h4 className="text-sm font-black text-amber-200 tracking-wide">
            {characterName}
          </h4>
          <p className="text-[11px] text-amber-400/70 font-serif italic">
            {isGeographicSite ? 'Sitio Histórico Emblemático' : 'Voz Histórica Republicana'}
          </p>
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <Database className="w-3 h-3" />
            <span>{tokenFeedback?.source || 'Bóveda Curricular'}</span>
          </div>
        </div>
      </div>

      {/* ================= PANEL DERECHO: INTERFAZ DE DIÁLOGO HISTÓRICO ================= */}
      <div className="flex-1 flex flex-col justify-between h-[420px] sm:h-[460px] bg-black/40 rounded-2xl border border-amber-500/20 p-3 sm:p-4 overflow-hidden relative">
        {/* Cabecera del Chat */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide text-amber-100 uppercase">
              Entrevista Histórica en Vivo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                hasApiKey
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80 shadow-sm'
                  : 'bg-amber-950/60 text-amber-300/80 border-amber-500/30 hover:bg-amber-900/60'
              }`}
              title="Configurar clave para generación con tokens de Inteligencia Artificial"
            >
              <Key className="w-2.5 h-2.5" />
              <span>{hasApiKey ? 'Tokens IA Activos' : 'Configurar Clave IA'}</span>
            </button>
            <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
              Responde en 1ª Persona
            </span>
          </div>
        </div>

        {/* Historial de Mensajes con Scroll */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 scroll-smooth">
          {messages.map((msg) => {
            const isChar = msg.sender === 'character';
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isChar ? 'justify-start' : 'justify-end'}`}
              >
                {isChar && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs text-amber-300 shrink-0 mt-0.5">
                    🏛️
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isChar 
                    ? 'bg-slate-900/90 text-amber-50 border border-amber-500/25 shadow-md' 
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                }`}>
                  <p className="font-serif">{msg.text}</p>
                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/10 text-[9px] text-amber-300/60">
                    <span>{msg.timestamp}</span>
                    {msg.isCached ? (
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                        <Database className="w-2.5 h-2.5" /> 0 Tokens (Bóveda)
                      </span>
                    ) : (
                      <span className="text-amber-300 font-mono font-bold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Tokens IA (Guardado en Bóveda)
                      </span>
                    )}
                  </div>
                </div>
                {!isChar && (
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xs text-blue-200 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 items-center text-xs text-amber-300 animate-pulse pl-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>{characterName} está evocando sus memorias...</span>
            </div>
          )}
        </div>

        {/* Sugerencias Rápidas de Preguntas */}
        <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            '¿Cuál fue tu momento más difícil?',
            '¿Qué te motivó a luchar por la patria?',
            '¿Qué mensaje le das a los jóvenes de hoy?'
          ].map((sug, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => handleSendMessage(sug)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 transition-all cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Barra de Entrada de Texto y Voz */}
        <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30' 
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-500/30'
            }`}
            title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Pregúntale algo a ${characterName}...`}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-400 transition-all"
          />

          <button
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de Configuración de Clave de Tokens */}
      <AnimatePresence>
        {isKeyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 rounded-3xl"
          >
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Tokens e Inteligencia Artificial</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Las preguntas que ya existen en la <strong className="text-amber-300">Bóveda Curricular</strong> se responden al instante con <span className="text-emerald-400 font-bold">0 Tokens</span>.
                Para preguntas inéditas en tiempo real, puedes vincular tu clave del <strong className="text-amber-300">Motor de IA Pedagógica</strong> (se almacena de forma segura solo en tu sesión).
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                  Clave de Inferencia IA (Opcional)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Introduce tu clave de IA..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                {hasApiKey ? (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('');
                      handleSaveApiKey('');
                    }}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer font-bold"
                  >
                    Eliminar Clave
                  </button>
                ) : <span />}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveApiKey(apiKeyInput)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
