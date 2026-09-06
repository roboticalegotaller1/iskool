"use client";

import React, { useState } from 'react';
import { CanvasActivityJSON } from '@/types';
import { HelpCircle, RotateCcw, Trophy, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AhorcadoPlayerProps {
  activity: CanvasActivityJSON;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

export const AhorcadoPlayer: React.FC<AhorcadoPlayerProps> = ({
  activity,
  onClose,
  onComplete
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = activity.questions || [];
  const currentQ = questions[currentIdx] || questions[0];

  // Extraer la palabra clave de la respuesta correcta (limpia de caracteres especiales)
  const targetWord = (currentQ.options[currentQ.correctIndex] || currentQ.options[0] || 'ISKOOL')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-ZÑ]/g, '');

  const maxMistakes = 6;

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || mistakes >= maxMistakes) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!targetWord.includes(letter)) {
      setMistakes(prev => prev + 1);
    }
  };

  const isWordGuessed = targetWord.split('').every(l => guessedLetters.has(l));
  const isFailed = mistakes >= maxMistakes;

  const handleNext = () => {
    if (isWordGuessed) setScore(prev => prev + 1);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setGuessedLetters(new Set());
      setMistakes(0);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score + (isWordGuessed ? 1 : 0));
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setGuessedLetters(new Set());
    setMistakes(0);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative select-none">
      
      {/* Header del Ahorcado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 text-xs font-black border border-amber-200/40">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ahorcado Educativo</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {activity.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            Pregunta {currentIdx + 1} / {questions.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            Oportunidades restantes: <strong>{maxMistakes - mistakes}</strong>
          </span>
        </div>
      </div>

      {isFinished ? (
        <div className="py-12 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              ¡Desafío de Palabras Completado!
            </h3>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Adivinaste correctamente <strong className="text-amber-600 font-bold">{score} de {questions.length} conceptos</strong>.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Intentar de Nuevo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pista / Pregunta Pedagógica */}
          <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 space-y-2 text-center">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              💡 Pista Pedagógica:
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Ranuras de la Palabra Oculta */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4">
            {targetWord.split('').map((letter, idx) => {
              const isRevealed = guessedLetters.has(letter) || isFailed;

              return (
                <div
                  key={idx}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-sm ${
                    isRevealed
                      ? 'bg-white dark:bg-zinc-800 border-amber-500 text-slate-900 dark:text-white'
                      : 'bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-zinc-700 text-transparent'
                  }`}
                >
                  {isRevealed ? letter : '_'}
                </div>
              );
            })}
          </div>

          {/* Feedback Visual de Victoria o Derrota */}
          {(isWordGuessed || isFailed) && (
            <div className={`p-4 rounded-2xl text-center space-y-2 font-bold text-sm ${
              isWordGuessed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <p>{isWordGuessed ? '✨ ¡Palabra correcta descubierta!' : `❌ Se agotaron los intentos. La palabra era: ${targetWord}`}</p>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-amber-700"
              >
                Siguiente Pregunta →
              </button>
            </div>
          )}

          {/* Teclado Virtual Interactivo */}
          {!isWordGuessed && !isFailed && (
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2 max-w-2xl mx-auto pt-2">
              {ALPHABET.map(letter => {
                const isUsed = guessedLetters.has(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={isUsed}
                    className={`py-2 sm:py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      isUsed
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 opacity-50 cursor-default'
                        : 'bg-slate-50 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 shadow-sm'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
