"use client";

import React, { useState } from 'react';
import { CanvasActivityJSON } from '@/types';
import { 
  Lock, 
  Unlock, 
  Key, 
  Scroll, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  DoorOpen,
  BookOpen
} from 'lucide-react';

interface EscapeRoomPlayerProps {
  activity: CanvasActivityJSON;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const EscapeRoomPlayer: React.FC<EscapeRoomPlayerProps> = ({
  activity,
  onClose,
  onComplete
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [unlockedLocks, setUnlockedLocks] = useState<boolean[]>(() => 
    new Array(activity.questions?.length || 1).fill(false)
  );
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isEscaped, setIsEscaped] = useState(false);

  const questions = activity.questions && activity.questions.length > 0
    ? activity.questions
    : [
        {
          question: "¿Cuál es el postulado central analizado en el texto de lectura?",
          options: [
            "La comprensión profunda articulando causas y consecuencias lógicas",
            "La memorización mecánica sin contraste de evidencias",
            "La dispersión de conceptos no relacionados",
            "El descarte de datos comprobados"
          ],
          correctIndex: 0,
          explanation: "El texto enfatiza la necesidad de articular causas y consecuencias para un aprendizaje significativo."
        }
      ];

  const currentQ = questions[currentQuestionIdx];

  // Texto base de lectura (formato 2 párrafos)
  const defaultReadingText = `El análisis sistemático y la comprensión lectora rigurosa constituyen los cimientos para resolver cualquier desafío pedagógico en el Estudio ISkool. Al explorar este contenido, se revela que los acontecimientos y fenómenos no suceden de forma aislada, sino mediante una red interconectada de causas directas, transformaciones conceptuales y repercusiones tangibles.\n\nPara desbloquear cada uno de los candados de esta sala de escape, es indispensable examinar minuciosamente la evidencia planteada en cada oración. Solo a través de la deducción lógica, el contraste crítico de ideas y la atención al detalle será posible descifrar los enigmas y abrir las puertas del conocimiento.`;

  const readingText: string = typeof activity.readingText === 'string' && activity.readingText.trim().length > 0
    ? activity.readingText
    : (typeof (activity.metadata as any)?.readingText === 'string' && (activity.metadata as any).readingText.trim().length > 0
        ? (activity.metadata as any).readingText
        : defaultReadingText);
  const readingParagraphs: string[] = readingText.split('\n\n').filter((p): p is string => Boolean(p && p.trim()));

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setAttempts(prev => prev + 1);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setUnlockedLocks(prev => {
        const next = [...prev];
        next[currentQuestionIdx] = true;
        return next;
      });
    }
  };

  const handleNextLock = () => {
    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsEscaped(true);
      if (onComplete) onComplete(score);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUnlockedLocks(new Array(questions.length).fill(false));
    setScore(0);
    setAttempts(0);
    setIsEscaped(false);
  };

  const allLocksOpen = unlockedLocks.every(Boolean);

  // Pantalla de Victoria / Escape
  if (isEscaped) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 md:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl animate-fade-in text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
          <DoorOpen className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
            Misión Cumplida • Escape Exitoso
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ¡Has Descifrado Todos los Candados!
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-sm md:text-base">
            Tu rigurosa comprensión lectora y deducción analítica te permitieron desbloquear los {questions.length} candados de la sala.
          </p>
        </div>

        {/* Candados desbloqueados */}
        <div className="flex items-center justify-center gap-3 py-4">
          {questions.map((_, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
            >
              <Unlock className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                Candado #{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Resumen de Recompensas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-center">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">Aciertos</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">{score} / {questions.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">XP Obtenida</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">+350 XP</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 block font-medium">Precisión</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {Math.round((score / Math.max(attempts, 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm font-bold transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Desafío
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              Finalizar Actividad
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in select-none">
      
      {/* Barra Superior Minimalista con Candados Visuales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold tracking-wide">
            <Key className="w-3.5 h-3.5" />
            <span>Escape Room Lógico • Estudio ISkool</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activity.title || 'Desafío de Comprensión Lectora y Escape'}
          </h1>
        </div>

        {/* Rastreador de Candados */}
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentQuestionIdx;
            const isUnlocked = unlockedLocks[idx];

            return (
              <div
                key={idx}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-700'
                }`}
                title={`Candado #${idx + 1}: ${isUnlocked ? 'Desbloqueado' : isCurrent ? 'En juego' : 'Bloqueado'}`}
              >
                {isUnlocked ? (
                  <Unlock className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                <span className="absolute -bottom-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Principal: Pergamino a la Izquierda, Preguntas a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: Pergamino de Comprensión Lectora */}
        <div className="lg:col-span-6 flex flex-col rounded-3xl bg-[#fdfaf2] dark:bg-[#1c1917] border-2 border-[#e8ddc4] dark:border-[#382f28] shadow-lg shadow-amber-950/5 relative overflow-hidden">
          {/* Adorno superior estilo pergamino */}
          <div className="p-4 md:p-5 border-b border-[#e8ddc4] dark:border-[#382f28] bg-[#f7f0e0]/70 dark:bg-[#25201c] flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <Scroll className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span className="text-xs md:text-sm font-black uppercase tracking-wider font-serif">
                Códice de Evidencias • Lectura Base
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800/80 dark:text-amber-300/80 px-2.5 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-950/50">
              <BookOpen className="w-3.5 h-3.5" />
              <span>2 Párrafos</span>
            </div>
          </div>

          {/* Cuerpo del Pergamino con tipografía Serif elegante */}
          <div className="p-6 md:p-8 space-y-5 overflow-y-auto max-h-[520px] text-[#2c2621] dark:text-[#f3ede4] font-serif leading-relaxed text-base md:text-lg select-text">
            {readingParagraphs.map((paragraph: string, pIdx: number) => (
              <p 
                key={pIdx} 
                className="first-letter:text-3xl first-letter:font-black first-letter:text-amber-800 dark:first-letter:text-amber-400 first-letter:mr-1 text-justify"
              >
                {paragraph}
              </p>
            ))}

            <div className="pt-4 border-t border-[#e8ddc4]/60 dark:border-[#382f28]/60 flex items-center gap-2 text-xs text-amber-800/70 dark:text-amber-400/70 italic">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pista pedagógica: Lee con atención los conectores lógicos y causas para desbloquear cada candado.</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Desafío de Reactivo y Desbloqueo de Candado */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          
          <div>
            {/* Encabezado del Desafío Actual */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-sm flex items-center justify-center">
                  #{currentQuestionIdx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Candado {currentQuestionIdx + 1} de {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400">
                <Lock className={`w-4 h-4 ${unlockedLocks[currentQuestionIdx] ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>{unlockedLocks[currentQuestionIdx] ? 'Desbloqueado' : 'Bloqueado'}</span>
              </div>
            </div>

            {/* Texto de la Pregunta / Enigma */}
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-4 leading-snug">
              {currentQ.question}
            </h3>

            {/* Opciones de Respuesta */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;

                let buttonStyle = "border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-800 dark:text-zinc-200";

                if (isAnswered) {
                  if (isCorrect) {
                    buttonStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-bold";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-bold";
                  } else {
                    buttonStyle = "border-slate-200 dark:border-zinc-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-sm md:text-base flex items-start gap-3 transition-all duration-200 ${buttonStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-snug">{option}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Retroalimentación Formativa Inmediata */}
            {isAnswered && (
              <div className={`p-4 rounded-2xl border mt-5 animate-fade-in ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-black text-sm mb-1">
                  {selectedOption === currentQ.correctIndex ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>¡Candado Desbloqueado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-rose-600" />
                      <span>Candado Atascado • Revisa la lectura</span>
                    </>
                  )}
                </div>
                <p className="text-xs md:text-sm leading-relaxed opacity-90">
                  {currentQ.explanation || 'Examina con cuidado el códice de la izquierda para contrastar la respuesta.'}
                </p>
              </div>
            )}
          </div>

          {/* Botón de Avance */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            {onClose ? (
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
              >
                Salir
              </button>
            ) : <div />}

            {isAnswered && (
              <button
                onClick={handleNextLock}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-black shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 animate-bounce-subtle"
              >
                <span>
                  {currentQuestionIdx + 1 < questions.length ? 'Abrir Siguiente Candado' : 'Finalizar Escape'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
