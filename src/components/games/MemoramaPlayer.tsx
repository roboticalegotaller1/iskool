"use client";

import React, { useState, useEffect } from 'react';
import { CanvasActivityJSON } from '@/types';
import { Grid, Sparkles, RotateCcw, Trophy, CheckCircle2, Star, Award, Heart } from 'lucide-react';

interface MemoramaPlayerProps {
  activity: CanvasActivityJSON;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

interface CardItem {
  id: string;
  pairId: number;
  text: string;
  type: 'question' | 'answer';
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoramaPlayer: React.FC<MemoramaPlayerProps> = ({
  activity,
  onClose,
  onComplete
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Inicializar tablero de memoria al azar
  useEffect(() => {
    const generatedCards: CardItem[] = [];
    const questions = activity.questions || [];

    questions.forEach((q, idx) => {
      const correctAnswer = q.options[q.correctIndex] || q.options[0];
      
      // Carta A: Pregunta
      generatedCards.push({
        id: `card-${idx}-q`,
        pairId: idx,
        text: q.question,
        type: 'question',
        imageUrl: q.imageUrl,
        isFlipped: false,
        isMatched: false
      });

      // Carta B: Respuesta Correcta
      generatedCards.push({
        id: `card-${idx}-a`,
        pairId: idx,
        text: `✓ ${correctAnswer}`,
        type: 'answer',
        isFlipped: false,
        isMatched: false
      });
    });

    // Mezclar cartas
    const shuffled = [...generatedCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [activity]);

  const handleCardClick = (index: number) => {
    if (
      flippedCards.length >= 2 || 
      cards[index].isFlipped || 
      cards[index].isMatched
    ) return;

    const newFlipped = [...flippedCards, index];
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Coincidencia correcta
        setTimeout(() => {
          setCards(prev => {
            const copy = [...prev];
            copy[firstIdx].isMatched = true;
            copy[secondIdx].isMatched = true;
            return copy;
          });
          setFlippedCards([]);
          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          if (newMatches === activity.questions.length) {
            setIsCompleted(true);
            if (onComplete) onComplete(100);
          }
        }, 500);
      } else {
        // No coinciden, voltear de regreso
        setTimeout(() => {
          setCards(prev => {
            const copy = [...prev];
            copy[firstIdx].isFlipped = false;
            copy[secondIdx].isFlipped = false;
            return copy;
          });
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const handleReset = () => {
    setMatchesCount(0);
    setAttempts(0);
    setIsCompleted(false);
    setFlippedCards([]);
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false, isMatched: false })).sort(() => Math.random() - 0.5));
  };

  const totalPairs = activity.questions.length;

  return (
    <div className="w-full space-y-6 animate-fade-in relative select-none">
      
      {/* Header del Memorama */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 text-xs font-black border border-purple-200/40">
            <Grid className="w-3.5 h-3.5" />
            <span>Memorama Visual Didáctico</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {activity.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-zinc-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
            Intentos: <strong className="text-purple-600 dark:text-purple-400">{attempts}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            Parejas: <strong>{matchesCount}/{totalPairs}</strong>
          </span>
        </div>
      </div>

      {/* Pantalla Final de Victoria */}
      {isCompleted ? (
        <div className="py-12 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              ¡Excelente Memoria Didáctica! 🎉
            </h3>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              Completaste todas las parejas en <strong className="text-purple-600">{attempts} intentos</strong>.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de Nuevo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Tablero de Cartas Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {cards.map((card, idx) => {
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`h-36 sm:h-40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform select-none ${
                  card.isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 scale-95 opacity-80'
                    : card.isFlipped
                    ? 'bg-white dark:bg-zinc-800 border-2 border-purple-500 shadow-xl scale-105'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border border-purple-400/30 hover:scale-105 shadow-md'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="space-y-2">
                    {card.imageUrl && (
                      <img 
                        src={card.imageUrl} 
                        alt="Ref visual" 
                        onError={(e) => { e.currentTarget.src = '/images/students/default.png'; }}
                        className="w-12 h-10 object-cover rounded-lg mx-auto" 
                      />
                    )}
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-4">
                      {card.text}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 opacity-80">
                    <Grid className="w-6 h-6 text-yellow-300" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-200">ISkool Memory</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
