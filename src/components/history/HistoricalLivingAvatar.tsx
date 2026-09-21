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
  HelpCircle
} from 'lucide-react';

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

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mouthIntervalRef = useRef<any>(null);

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

  // Sincronización de labios (Lip-sync simulado armónico)
  const startLipSyncAnimation = useCallback(() => {
    setIsSpeaking(true);
    let step = 0;
    if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);

    mouthIntervalRef.current = setInterval(() => {
      step++;
      // Variación orgánica de apertura de boca y gesticulación mandibular
      const ratio = (Math.sin(step * 0.8) + 1) / 2 * 0.85 + (Math.sin(step * 1.5) * 0.15);
      setMouthOpenRatio(Math.max(0.1, Math.min(1, ratio)));
    }, 120);
  }, []);

  const stopLipSyncAnimation = useCallback(() => {
    if (mouthIntervalRef.current) {
      clearInterval(mouthIntervalRef.current);
      mouthIntervalRef.current = null;
    }
    setIsSpeaking(false);
    setMouthOpenRatio(0);
  }, []);

  // Reproducción de voz con SpeechSynthesis
  const speakText = useCallback((text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Buscar voz adecuada en español
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Sabina') || v.name.includes('Jorge') || v.name.includes('Mexico')));
    if (esVoice) utterance.voice = esVoice;

    utterance.lang = 'es-MX';
    utterance.rate = 0.95; // Tono solemne y pausado
    utterance.pitch = characterName.toLowerCase().includes('josefa') ? 1.05 : 0.9;

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
  }, [audioEnabled, characterName, startLipSyncAnimation, stopLipSyncAnimation]);

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
      const res = await fetch('/api/ai/historical-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_persona',
          characterName,
          slug,
          question: query
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
              setAudioEnabled(!audioEnabled);
              if (audioEnabled) window.speechSynthesis?.cancel();
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-all text-amber-400"
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

            {/* Capa de Movimiento Mandibular / Boca (Lip-sync orgánico) */}
            {isSpeaking && (
              <motion.div 
                className="absolute bottom-6 w-12 h-3.5 rounded-full bg-stone-900/90 border-t border-amber-700/60 shadow-inner blur-[0.5px]"
                animate={{
                  scaleY: 0.4 + mouthOpenRatio * 1.6,
                  scaleX: 0.9 + mouthOpenRatio * 0.2,
                  opacity: 0.85
                }}
                transition={{ duration: 0.08 }}
              />
            )}

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
      <div className="flex-1 flex flex-col justify-between h-[420px] sm:h-[460px] bg-black/40 rounded-2xl border border-amber-500/20 p-3 sm:p-4 overflow-hidden">
        {/* Cabecera del Chat */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide text-amber-100 uppercase">
              Entrevista Histórica en Vivo
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
            Responde en 1ª Persona
          </span>
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
                    {msg.isCached && (
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                        <Database className="w-2.5 h-2.5" /> 0 Tokens (Bóveda)
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
    </div>
  );
};
