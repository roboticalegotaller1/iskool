"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Lightbulb,
  PlusCircle,
  CheckCircle2,
  Minus
} from 'lucide-react';
import { AIPedagogicalService, PedagogicalChatMessage, StudentContextProfile } from '@/services/aiPedagogicalService';
import { useAuth } from '@/context/AuthContext';
import { StudioActivityQuestion } from '@/types';

interface ContextualAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  questTitle?: string;
  subject?: string;
  mode?: 'modal' | 'floating';
}

export const ContextualAIAssistantModal: React.FC<ContextualAIAssistantModalProps> = ({
  isOpen,
  onClose,
  questTitle,
  subject
}) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [studentContext, setStudentContext] = useState<StudentContextProfile | null>(null);
  const [messages, setMessages] = useState<PedagogicalChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [injectedQuestionIds, setInjectedQuestionIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isTeacher = ['teacher', 'coordinator', 'director', 'admin'].includes(user?.role || '');

  // Cierre accesible con tecla Escape (WCAG 2.1)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setMounted(true);
    const ctx = AIPedagogicalService.getSynthesizedStudentContext();
    setStudentContext(ctx);

    // Mensaje de bienvenida inicial de acuerdo al rol y reglas de AGENTS.md
    let welcomeText = `¡Hola ${ctx.name}! Soy tu **Asistente Pedagógico IA**. Estoy listo para guiarte en tus actividades de ${ctx.gradeLabel}. ¿En qué te puedo apoyar hoy?`;
    
    if (isTeacher) {
      welcomeText = `Estimado docente, bienvenido a la **Inteligencia Artificial Pedagógica**. Puedo orientarte en la creación de reactivos para el **Estudio**, consulta en la **Bóveda Curricular** y alineación con los PDAs de la Nueva Escuela Mexicana.`;
    } else if (ctx.rpgClass) {
      welcomeText = `¡Saludos, ${ctx.name}! Como **${ctx.rpgClass.toUpperCase()}** de Nivel ${ctx.playerLevel}, tus atributos de inteligencia te permiten resolver acertijos complejos. ¿Necesitas una pista para tu misión?`;
    }

    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setSuggestions(
      isTeacher
        ? ['Crear reactivo para el Estudio ISkool', '¿Cómo consultar la Bóveda Curricular?', 'Rúbrica analítica para este contenido']
        : ctx.rpgClass
        ? ['Estrategia para mi clase RPG', '¿Cómo subir de nivel en esta misión?', 'Explícame este desafío']
        : ['¿Cómo gano más estrellas?', 'Dame una pista de la lección', 'Revisar mi racha escolar']
    );
  }, [user]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen || !mounted) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: PedagogicalChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await AIPedagogicalService.sendPedagogicalPrompt({
        message: query,
        contextType: isTeacher ? 'teacher' : 'student',
        conversationHistory: messages.slice(-4),
        activeQuestContext: {
          questTitle: questTitle || 'Misión Activa',
          subject: subject || 'General'
        }
      });

      // Si el docente pidió un reactivo para el Estudio, adjuntamos la estructura
      let sampleQuestion: StudioActivityQuestion | undefined = undefined;
      if (isTeacher && (query.toLowerCase().includes('reactivo') || query.toLowerCase().includes('estudio'))) {
        sampleQuestion = {
          question: `¿Cuál es el propósito formativo central de este contenido pedagógico?`,
          options: [
            `Analizar el impacto directo del fenómeno en la comunidad`,
            `Memorizar fechas sin contextualización histórica`,
            `Ignorar los campos formativos de la NEM`,
            `Procedimiento aleatorio de cálculo`
          ],
          correctIndex: 0
        };
      }

      const assistantMsg: PedagogicalChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestion: sampleQuestion
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      console.error('Error procesando respuesta del Asistente:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInjectIntoStudio = (msgId: string, question: StudioActivityQuestion) => {
    const success = AIPedagogicalService.injectQuestionIntoStudio(question);
    if (success) {
      setInjectedQuestionIds(prev => new Set(prev).add(msgId));
    }
  };

  // Si está minimizado, muestra una píldora flotante compacta (Cero Fricción / Apple Minimalist)
  if (isMinimized) {
    return createPortal(
      <div className="fixed bottom-5 right-5 z-[99999] animate-fade-in">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-zinc-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Asistente Pedagógico IA
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      className="fixed bottom-4 right-4 z-[99999] flex flex-col items-end animate-fade-in pointer-events-auto"
    >
      <div 
        ref={chatContainerRef}
        className={`w-[94vw] sm:w-[420px] transition-all duration-300 ease-out flex flex-col rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-900/20 overflow-hidden ${
          isExpanded ? 'h-[85vh] sm:h-[620px] sm:w-[520px]' : 'h-[520px]'
        }`}
      >
        {/* Cabecera Estilo Apple HIG */}
        <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/50 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 id="ai-assistant-title" className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
                  Asistente Pedagógico IA
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate max-w-[220px]">
                {isTeacher 
                  ? 'Guía Curricular Docente • NEM 2024'
                  : `${studentContext?.name} • ${studentContext?.gradeLabel || 'Estudiante'} ${studentContext?.rpgClass ? `(${studentContext.rpgClass})` : ''}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimizar a píldora flotante"
              title="Minimizar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Reducir ventana" : "Ampliar ventana"}
              title={isExpanded ? "Reducir" : "Maximizar"}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar asistente pedagógico"
              title="Cerrar (Esc)"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 dark:border-blue-900/40">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                    : 'bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-sm border border-zinc-200/50 dark:border-zinc-700/40'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Acoplamiento con ISkool_Studio_Architecture: Transferencia al Estudio en 1 Clic */}
                {msg.suggestedQuestion && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
                    <button
                      type="button"
                      disabled={injectedQuestionIds.has(msg.id)}
                      onClick={() => handleInjectIntoStudio(msg.id, msg.suggestedQuestion!)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-xs ${
                        injectedQuestionIds.has(msg.id)
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {injectedQuestionIds.has(msg.id) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Inyectado al Estudio ISkool</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                          <span>📥 Inyectar reactivo al Estudio</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1 text-right font-mono ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="text-[11px]">Consultando Bóveda Curricular e IA...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Sugerencias Rápidas (1 Clic) */}
        {suggestions.length > 0 && (
          <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 ml-1" />
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors shrink-0 shadow-xs"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Formulario de Entrada Ergonómico */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={isTeacher ? "Formula tu duda pedagógica o curricular..." : "Pregunta sobre tu reto, atributos o lección..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-zinc-800/90 border border-transparent focus:border-blue-500 transition-all duration-150"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            aria-label="Enviar consulta"
            className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
