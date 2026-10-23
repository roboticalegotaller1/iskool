// src/components/redisenos/InteractiveTasksModal.tsx
"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Award, Zap, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { INTERACTIVE_TASKS, InteractiveTask, StudentProfile } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onTaskCompleted: (task: InteractiveTask) => void;
}

export function InteractiveTasksModal({ isOpen, onClose, student, onTaskCompleted }: Props) {
  const [tasks, setTasks] = useState<InteractiveTask[]>(INTERACTIVE_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string>(INTERACTIVE_TASKS[0].id);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentTask = tasks.find(t => t.id === activeTaskId) || tasks[0];

  const handleSelectOption = (optId: string) => {
    gamificationAudio.playClickSound();
    setSelectedOptionId(optId);
  };

  const handleValidate = () => {
    if (!selectedOptionId) return;
    const option = currentTask.options.find(o => o.id === selectedOptionId);
    if (!option) return;

    if (option.isCorrect) {
      gamificationAudio.playLevelUpSound();
      setFeedback({ isCorrect: true, text: `¡Correcto! ${currentTask.explanation}` });
      setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, completed: true } : t));
      onTaskCompleted(currentTask);
    } else {
      gamificationAudio.playErrorSound();
      setFeedback({ isCorrect: false, text: 'Opción incorrecta. Revisa el concepto e inténtalo de nuevo.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                5 Desafíos Curriculares Gamificados
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Plan SEP NEM 2026-2027
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Resuelve tareas reales para subir de nivel y obtener recompensas en la tienda
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* Lista de Tareas (col-span-5) */}
          <div className="md:col-span-5 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Tareas Asignadas ({tasks.filter(t => t.completed).length}/{tasks.length} Completadas)
            </span>

            {tasks.map((task, idx) => (
              <button
                key={task.id}
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveTaskId(task.id);
                  setSelectedOptionId(null);
                  setFeedback(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  activeTaskId === task.id
                    ? 'bg-slate-800 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    task.completed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block line-clamp-1">{task.title}</span>
                    <span className="text-[10px] text-purple-300 font-medium">{task.subject}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <span>+{task.rewardCoins} 🪙</span>
                </div>
              </button>
            ))}
          </div>

          {/* Área de Resolución Activa (col-span-7) */}
          <div className="md:col-span-7 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  {currentTask.gradeLevel}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {currentTask.pdaCode}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{currentTask.title}</h3>
                <p className="text-xs text-slate-400">{currentTask.pdaDescription}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-sm font-semibold text-slate-100">{currentTask.question}</p>
              </div>

              {/* Opciones */}
              <div className="space-y-2">
                {currentTask.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      selectedOptionId === opt.id
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedOptionId === opt.id && <Zap className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  feedback.isCorrect 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {feedback.text}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Recompensas: <strong className="text-amber-300">+{currentTask.rewardCoins} Monedas</strong> · <strong className="text-purple-300">+{currentTask.rewardXp} XP</strong>
              </div>

              <button
                onClick={handleValidate}
                disabled={!selectedOptionId}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedOptionId
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 hover:scale-105'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Comprobar Respuesta
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Alumno: <strong className="text-slate-200">{student.name}</strong> · Colegio Montessori del Valle</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar Tareas
          </button>
        </div>

      </div>
    </div>
  );
}
