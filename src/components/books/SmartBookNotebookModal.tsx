"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  SchoolDigitalBook, 
  BookVoiceQueryResponse 
} from '@/types/schoolBooks';
import { generateGroundedVoiceResponse } from '@/lib/schoolBookMapper';
import { 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  FileText, 
  Bookmark, 
  MessageSquare,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SmartBookNotebookModalProps {
  book: SchoolDigitalBook;
  isOpen?: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'notebook';
  text: string;
  timestamp: string;
  responsePayload?: BookVoiceQueryResponse;
}

export const SmartBookNotebookModal: React.FC<SmartBookNotebookModalProps> = ({
  book,
  isOpen = true,
  onClose,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          // Ejecutar consulta automáticamente al recibir voz
          handleSendQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Mensaje de bienvenida al abrir
  useEffect(() => {
    if (isOpen) {
      const welcomeText = `¡Hola! Soy tu Cuaderno de Estudio Inteligente para el libro "${book.titulo}". Puedes hacerme cualquier pregunta por voz o texto sobre los temas, ejercicios o conceptos de sus ${book.capitulos.length} capítulos y te responderé con sustento exacto de páginas.`;
      
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        sender: 'notebook',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (initialQuery) {
        setMessages([welcomeMsg]);
        handleSendQuery(initialQuery);
      } else {
        setMessages([welcomeMsg]);
      }
    }
  }, [isOpen, book, initialQuery]);

  // Scroll al final del chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detener voz al cerrar
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsSpeaking(false);
      setIsListening(false);
    }
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("El reconocimiento por voz no está disponible en este navegador. Puedes escribir tu pregunta en el campo de texto.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error al iniciar reconocimiento:", err);
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendQuery = (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Consulta fundamentada a 0 Tokens
    const groundedResponse = generateGroundedVoiceResponse(book, query);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'notebook',
      text: groundedResponse.respuestaNatural,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsePayload: groundedResponse
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputQuery('');

    // Reproducir en voz si el usuario preguntó con voz
    if (isListening || queryText) {
      handleSpeakText(groundedResponse.respuestaNatural);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl h-[88vh] max-h-[780px] flex flex-col overflow-hidden relative">
        
        {/* Cabecera del Cuaderno */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-850">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${book.portadaColor} text-white flex items-center justify-center font-black shadow-md shadow-purple-500/20`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  Cuaderno de Estudio Inteligente
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {book.faseNEM} • {book.materia}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {book.titulo}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSpeakText(messages[messages.length - 1]?.text || '')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSpeaking 
                  ? 'bg-purple-600 text-white border-purple-600 animate-pulse' 
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
              title={isSpeaking ? "Silenciar voz" : "Escuchar última respuesta"}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sugerencias Rápidas de Preguntas */}
        <div className="px-4 py-2 bg-purple-50/60 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
          <span className="font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Preguntas sugeridas:
          </span>
          {book.capitulos.slice(0, 3).map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuery(c.preguntasDetonadoras[0] || `¿Qué temas trata el Capítulo ${c.numero}?`)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-purple-200 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors whitespace-nowrap cursor-pointer"
            >
              {c.titulo.length > 35 ? c.titulo.substring(0, 35) + '...' : c.titulo}
            </button>
          ))}
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 space-y-2 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-none border border-slate-200 dark:border-zinc-750'
              }`}>
                <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-black text-[10px] uppercase opacity-75">
                    {msg.sender === 'user' ? 'Tu Pregunta' : 'Cuaderno Fundamentado'}
                  </span>
                  <span className="text-[9px] opacity-60">
                    {msg.timestamp}
                  </span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Tarjeta de Sustento Curricular y Páginas */}
                {msg.responsePayload && msg.responsePayload.citas.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700 space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-purple-600 dark:text-purple-400 block">
                      📖 Sustento Bibliográfico del Libro:
                    </span>
                    {msg.responsePayload.citas.map((cita, cIdx) => (
                      <div 
                        key={cIdx}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-zinc-300 space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="font-bold text-slate-900 dark:text-white">
                            Capítulo {cita.capituloNumero}: {cita.capituloTitulo}
                          </strong>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[10px]">
                            Páginas {cita.rangoPaginas}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                          {cita.textoReferencia}
                        </p>
                      </div>
                    ))}

                    {msg.responsePayload.conceptosRelacionados.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.responsePayload.conceptosRelacionados.map((conc, kIdx) => (
                          <span 
                            key={kIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-[9px] font-bold text-slate-700 dark:text-zinc-300"
                          >
                            #{conc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Barra de Entrada (Voz y Texto) */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
          {/* Botón de Micrófono */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800'
            }`}
            title={isListening ? "Escuchando... Haz clic para detener" : "Preguntar por voz (Micrófono)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Campo de Texto */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuery();
                }
              }}
              placeholder={isListening ? "Escuchando tu voz..." : `Pregunta algo sobre "${book.titulo}"...`}
              className="w-full pl-4 pr-10 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>

          {/* Botón de Enviar */}
          <button
            type="button"
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim()}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              inputQuery.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de Modo 0 Tokens */}
        <div className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-850 border-t border-slate-200 dark:border-zinc-800 text-center text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 font-bold">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>Búsqueda e indexación local a 0 tokens • Sustento curricular verificado</span>
        </div>
      </div>
    </div>
  );
};
