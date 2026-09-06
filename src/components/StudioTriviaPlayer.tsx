"use client";

import React, { useState } from 'react';
import { StudioActivityJSON } from '@/types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  HelpCircle,
  Award,
  Volume2,
  BrainCircuit
} from 'lucide-react';

interface StudioTriviaPlayerProps {
  activity: StudioActivityJSON;
  onComplete?: (finalScore: number, totalQuestions: number) => void;
  onClose?: () => void;
}

import { ErrorBoundary } from './ErrorBoundary';

export const StudioTriviaPlayer: React.FC<StudioTriviaPlayerProps> = (props) => {
  return (
    <ErrorBoundary>
      <StudioTriviaPlayerInner {...props} />
    </ErrorBoundary>
  );
};

const StudioTriviaPlayerInner: React.FC<StudioTriviaPlayerProps> = ({
  activity,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = activity.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (onComplete) {
        onComplete(score, questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!currentQuestion && !isFinished) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <p className="text-zinc-500 font-bold">No hay preguntas disponibles en esta actividad.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in relative select-none">

      {/* Pantalla Final de Resultados */}
      {isFinished ? (
        <div className="text-center space-y-6 py-6 relative z-10 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              🏆 ¡Trivia Completada!
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activity.title}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              Puntaje Final: <span className="font-black text-purple-600 dark:text-purple-400 text-lg">{score} / {questions.length}</span> correctas
            </p>
          </div>

          {/* Calificación y Estrellas */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 max-w-sm mx-auto space-y-1">
            <div className="flex justify-center gap-2 text-amber-400">
              {[...Array(3)].map((_, i) => (
                <Sparkles key={i} className={`w-6 h-6 ${i < Math.ceil((score / questions.length) * 3) ? 'fill-amber-400' : 'text-slate-300 dark:text-zinc-600'}`} />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 pt-1">
              {score === questions.length ? '¡Puntaje Perfecto! Eres una Leyenda 👑' :
               score >= questions.length / 2 ? '¡Buen trabajo! Rango Héroe ⭐' : '¡Sigue practicando! Rango Aprendiz ⚔️'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a Jugar</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-sm transition-all"
              >
                Cerrar Previsualización
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Pantalla de Juego de la Pregunta */
        <div className="space-y-6 relative z-10">
          
          {/* Cabecera y Barra de Progreso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <BrainCircuit className="w-4 h-4" />
                <span>Pregunta {currentIndex + 1} de {questions.length}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                Puntos: <strong className="text-purple-600 dark:text-purple-400">{score}</strong>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tarjeta de la Pregunta (Estilo Minimalista) */}
          <div className="bg-gradient-to-b from-slate-50 to-white dark:from-zinc-850 dark:to-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Referencia pedagógica"
                onError={(e) => { e.currentTarget.src = '/images/students/default.png'; }}
                className="w-full max-h-48 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm mx-auto"
              />
            )}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* 4 Opciones de Respuesta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              
              let buttonStyle = "bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-100 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20";
              
              if (isAnswered) {
                if (isCorrect) {
                  buttonStyle = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/30 scale-[1.02]";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/30";
                } else {
                  buttonStyle = "bg-slate-100 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500 border-slate-200/50 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all duration-200 flex items-start gap-3 justify-between ${buttonStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isAnswered && isCorrect ? 'bg-white/20 text-white' : 
                      isAnswered && isSelected && !isCorrect ? 'bg-white/20 text-white' : 
                      'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="pt-0.5 leading-snug">{option}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Pie de Página y Retroalimentación */}
          {isAnswered && (
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                {selectedOption === currentQuestion.correctIndex ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> ¡Respuesta Correcta! (+1 punto)
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-black text-sm flex items-center gap-1.5">
                    <XCircle className="w-5 h-5" /> Respuesta Incorrecta
                  </span>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <span>{currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
