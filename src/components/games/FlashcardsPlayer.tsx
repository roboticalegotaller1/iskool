"use client";

import React, { useState } from 'react';
import { CanvasActivityJSON } from '@/types';
import { Layers, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface FlashcardsPlayerProps {
  activity: CanvasActivityJSON;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const FlashcardsPlayer: React.FC<FlashcardsPlayerProps> = ({
  activity,
  onClose,
  onComplete
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const questions = activity.questions || [];
  const currentQ = questions[currentIdx] || questions[0];
  const correctAnswer = currentQ.options[currentQ.correctIndex] || currentQ.options[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (onComplete) onComplete(masteredCards.size);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const toggleMastered = () => {
    const newSet = new Set(masteredCards);
    if (newSet.has(currentIdx)) {
      newSet.delete(currentIdx);
    } else {
      newSet.add(currentIdx);
    }
    setMasteredCards(newSet);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative select-none">
      
      {/* Header de Flashcards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-black border border-blue-200/40">
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards Animadas 3D</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {activity.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            Tarjeta {currentIdx + 1} / {questions.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            Dominadas: <strong>{masteredCards.size}/{questions.length}</strong>
          </span>
        </div>
      </div>

      {/* Tarjeta 3D Interactiva */}
      <div className="perspective-1000 min-h-[320px] flex items-center justify-center py-4">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full max-w-2xl min-h-[280px] rounded-3xl p-8 transition-all duration-500 transform cursor-pointer border shadow-xl flex flex-col justify-between ${
            isFlipped
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400/40 rotate-y-180'
              : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white border-blue-400/40 hover:scale-[1.02]'
          }`}
        >
          {/* FRENTE: PREGUNTA */}
          {!isFlipped ? (
            <div className="space-y-6 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-yellow-300">
                  Pregunta / Concepto
                </span>
                <span className="text-xs font-bold text-blue-200">Haz clic para voltear 🔄</span>
              </div>

              <div className="space-y-4 text-center my-auto">
                {currentQ.imageUrl && (
                  <img 
                    src={currentQ.imageUrl} 
                    alt="Ref visual" 
                    onError={(e) => { e.currentTarget.src = '/images/students/default.png'; }}
                    className="w-32 h-24 object-cover rounded-2xl mx-auto shadow-md border border-white/20" 
                  />
                )}
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentQ.question}
                </h3>
              </div>

              <div className="text-center text-xs font-semibold text-blue-200 pt-2 border-t border-white/15">
                Toca la tarjeta para ver la respuesta correcta y fundamentación
              </div>
            </div>
          ) : (
            /* REVERSO: RESPUESTA CORRECTA */
            <div className="space-y-6 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-200">
                  ✓ Respuesta Correcta
                </span>
                <span className="text-xs font-bold text-teal-100">Haz clic para voltear 🔄</span>
              </div>

              <div className="space-y-3 text-center my-auto">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-yellow-300">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {correctAnswer}
                </h3>
                <p className="text-xs font-medium text-teal-100 max-w-md mx-auto">
                  Fundamento pedagógico verificado para el aprendizaje adaptativo.
                </p>
              </div>

              <div className="text-center text-xs font-semibold text-teal-200 pt-2 border-t border-white/15">
                Voltea la tarjeta o avanza a la siguiente
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Control y Navegación */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={toggleMastered}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
            masteredCards.has(currentIdx)
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{masteredCards.has(currentIdx) ? '¡Dominada!' : 'Marcar como Dominada'}</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>{currentIdx + 1 < questions.length ? 'Siguiente' : 'Finalizar'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
