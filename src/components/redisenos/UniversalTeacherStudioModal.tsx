// src/components/redisenos/UniversalTeacherStudioModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Wand2, Layers, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onChallengeAssigned: (prompt: string) => void;
}

export function UniversalTeacherStudioModal({ isOpen, onClose, onChallengeAssigned }: Props) {
  const [questionPrompt, setQuestionPrompt] = useState('¿En qué año comenzó la Revolución Mexicana?');
  const [selectedPda, setSelectedPda] = useState('PDA-HIST.6.1: Analiza los antecedentes y etapas del movimiento de 1910');
  const [answers, setAnswers] = useState([
    { id: 1, text: '1810', isCorrect: false },
    { id: 2, text: '1910', isCorrect: true },
    { id: 3, text: '1857', isCorrect: false },
    { id: 4, text: '1920', isCorrect: false }
  ]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerateVariants = () => {
    gamificationAudio.playMagicCastSound();
    setIsGeneratingAi(true);
    setTimeout(() => {
      setQuestionPrompt('¿Cuál es la ley que explica por qué los planetas orbitan alrededor del Sol?');
      setSelectedPda('PDA-CN.5.3: Comprende el efecto de la gravitación universal en el Sistema Solar');
      setAnswers([
        { id: 1, text: 'Ley de Gravitación Universal (Newton)', isCorrect: true },
        { id: 2, text: 'Segunda Ley de la Termodinámica', isCorrect: false },
        { id: 3, text: 'Teoría Celular de los Organismos', isCorrect: false },
        { id: 4, text: 'Principio de Pascal', isCorrect: false }
      ]);
      setIsGeneratingAi(false);
    }, 600);
  };

  const handlePublish = () => {
    gamificationAudio.playLevelUpSound();
    setAssignedSuccess(true);
    onChallengeAssigned(questionPrompt);
    setTimeout(() => {
      setAssignedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg">
              U
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Universal Challenge Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Módulo Docente Unificado
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Colegio Montessori del Valle · El maestro crea el desafío una sola vez y se transfigura para las 4 etapas escolares
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/teacher/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Ver Estudio de Bloques (Lienzo)
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

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
        </div>

        {/* Success Alert */}
        {assignedSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ¡Desafío publicado y asignado a los alumnos de Colegio Montessori del Valle con transfiguración exitosa!
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Panel Izquierdo: Autoría Docente (col-span-4) */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Panel de Autoría Docente
                </span>
                <button
                  onClick={handleGenerateVariants}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  {isGeneratingAi ? 'Generando...' : 'Sugerir con IA'}
                </button>
              </div>

              {/* Input de la Pregunta */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Pregunta o Reactivo Curricular:
                </label>
                <textarea
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Escribe la pregunta central..."
                />
              </div>

              {/* Selector de PDA SEP */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Objetivo Curricular SEP (PDA):
                </label>
                <select
                  value={selectedPda}
                  onChange={(e) => setSelectedPda(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="PDA-HIST.6.1: Analiza los antecedentes y etapas del movimiento de 1910">
                    Fase 6: Historia · Movimiento Revolucionario 1910
                  </option>
                  <option value="PDA-CN.5.3: Comprende el efecto de la gravitación universal en el Sistema Solar">
                    Fase 5: Ciencias · Gravedad y Sistema Solar
                  </option>
                  <option value="PDA-MAT.3.2: Resuelve divisiones con números naturales en contexto">
                    Fase 3: Matemáticas · Cálculo Mental y División
                  </option>
                  <option value="PDA-PRE.2.1: Identifica figuras y colores en su entorno cotidiano">
                    Fase 2: Preescolar · Exploración Sensorial
                  </option>
                </select>
              </div>

              {/* Opciones de Respuesta */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Opciones de Respuesta (Marca la correcta):
                </label>
                <div className="space-y-2">
                  {answers.map((ans, idx) => (
                    <div key={ans.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers(prev => prev.map((a, i) => ({ ...a, isCorrect: i === idx })));
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          ans.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {ans.isCorrect ? '✓' : idx + 1}
                      </button>
                      <input
                        type="text"
                        value={ans.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, text: val } : a));
                        }}
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón de Publicar */}
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={handlePublish}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar y Asignar a la Clase
              </button>
            </div>
          </div>

          {/* Panel Derecho: Previsualización Polimórfica Cuádruple (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Panel de Previsualización Polimórfica en Tiempo Real
              </span>
              <span className="text-[11px] text-slate-400">
                Se adapta automáticamente a la edad del estudiante
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* 1. Preescolar */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
                    <span>1. Preescolar (3 a 5 Años)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">Táctil & Voz</span>
                  </div>
                  <div className="h-28 rounded-xl bg-amber-950/20 border border-amber-900/40 p-2.5 flex items-center gap-3">
                    <img
                      src="/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg"
                      alt="Preschool"
                      className="w-20 h-20 rounded-lg object-cover border border-amber-500/30"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white mb-1">Amiguito Zorrito Guía:</p>
                      <p className="text-slate-300 italic text-[11px]">
                        "{questionPrompt.slice(0, 48)}..."
                      </p>
                      <div className="flex gap-1.5 mt-2">
                        {answers.slice(0, 3).map((a, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-200 text-[10px] font-bold">
                            {a.text.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Sin texto obligatorio; botones hápticos suaves de plastilina.
                </span>
              </div>

              {/* 2. Primaria */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2">
                    <span>2. Primaria (6 a 10 Años)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">RPG Boss Battle</span>
                  </div>
                  <div className="h-28 rounded-xl bg-emerald-950/20 border border-emerald-900/40 p-2.5 flex items-center gap-3">
                    <img
                      src="/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg"
                      alt="Elementary"
                      className="w-20 h-20 rounded-lg object-cover border border-emerald-500/30"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white mb-1">¡Resuelve el Hechizo!</p>
                      <p className="text-slate-300 text-[11px] line-clamp-1">{questionPrompt}</p>
                      <div className="grid grid-cols-2 gap-1 mt-1.5">
                        {answers.slice(0, 2).map((a, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-center ${a.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {a.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Monstruo elemental con HP y runas mágicas.
                </span>
              </div>

              {/* 3. Secundaria */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-2">
                    <span>3. Secundaria (11 a 13 Años)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">Esports Cyber Arena</span>
                  </div>
                  <div className="h-28 rounded-xl bg-cyan-950/20 border border-cyan-900/40 p-2.5 flex items-center gap-3">
                    <img
                      src="/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg"
                      alt="Middle school"
                      className="w-20 h-20 rounded-lg object-cover border border-cyan-500/30"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-bold text-white mb-0.5">Duelo Clan Phoenix</p>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-cyan-400 h-full w-3/4"></div>
                      </div>
                      <p className="text-[10px] text-cyan-200">Speed Bonus Bar · Racha x5</p>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Temporizador dinámico y chat de espectadores en vivo.
                </span>
              </div>

              {/* 4. Preparatoria */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-2">
                    <span>4. Preparatoria (14 a 18 Años)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">Executive Terminal</span>
                  </div>
                  <div className="h-28 rounded-xl bg-purple-950/20 border border-purple-900/40 p-2.5 flex items-center gap-3">
                    <img
                      src="/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg"
                      alt="High school"
                      className="w-20 h-20 rounded-lg object-cover border border-purple-500/30"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white mb-0.5">LaTeX Scratchpad</p>
                      <p className="text-[10px] text-slate-300 font-mono">UNAM/Tec Predictor: 94%</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">Peer Benchmark: Top 5%</p>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Demostraciones analíticas formales y radar de egreso.
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Colegio Montessori del Valle · Universal Authoring Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar Estudio
          </button>
        </div>

      </div>
    </div>
  );
}
