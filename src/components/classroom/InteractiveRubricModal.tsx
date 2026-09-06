"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClassroomStore } from '@/store/useClassroomStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { 
  X, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Wand2, 
  Award, 
  Coins, 
  Brain, 
  BookOpen, 
  ShieldCheck, 
  MessageSquare,
  FileText,
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StudentSubmission } from '@/types/classroom';

interface Props {
  submissionId: string;
  onClose: () => void;
}

const RUBRIC_CRITERIA = [
  {
    key: 'technical',
    title: 'Poder de Saberes Científicos ⚡',
    levels: [
      { key: 'apoyo', label: 'Iniciado 🛡️', xp: 5, coins: 5, desc: 'Presenta dificultades en la fundamentación técnica del proyecto.' },
      { key: 'proceso', label: 'Aprendiz ⚔️', xp: 10, coins: 10, desc: 'Muestra noción básica pero requiere profundizar en los conceptos.' },
      { key: 'logrado', label: 'Héroe ⭐', xp: 25, coins: 15, desc: 'Describe correctamente las etapas principales y funcionamiento.' },
      { key: 'avanzado', label: 'Leyenda 👑', xp: 40, coins: 20, desc: 'Comprensión sobresaliente con propuestas innovadoras.' }
    ]
  },
  {
    key: 'reflection',
    title: 'Clarividencia & Autoevaluación 🔮',
    levels: [
      { key: 'apoyo', label: 'Iniciado 🛡️', xp: 5, coins: 5, desc: 'La autoevaluación es muy breve o superficial.' },
      { key: 'proceso', label: 'Aprendiz ⚔️', xp: 10, coins: 10, desc: 'Describe lo realizado sin profundizar en introspección.' },
      { key: 'logrado', label: 'Héroe ⭐', xp: 20, coins: 15, desc: 'Expresa reflexiones claras e identifica aprendizajes.' },
      { key: 'avanzado', label: 'Leyenda 👑', xp: 30, coins: 20, desc: 'Autoevaluación madura identificando retos y superación.' }
    ]
  },
  {
    key: 'evidence',
    title: 'Destreza del Artefacto (Evidencia) 🛡️',
    levels: [
      { key: 'apoyo', label: 'Iniciado 🛡️', xp: 5, coins: 5, desc: 'Evidencia poco legible o incompleta.' },
      { key: 'proceso', label: 'Aprendiz ⚔️', xp: 10, coins: 10, desc: 'Evidencia con detalles que dificultan su análisis.' },
      { key: 'logrado', label: 'Héroe ⭐', xp: 20, coins: 15, desc: 'Presentación clara y ordenada según los requisitos.' },
      { key: 'avanzado', label: 'Leyenda 👑', xp: 30, coins: 20, desc: 'Presentación impecable, estructurada y de alta calidad.' }
    ]
  }
];

export const InteractiveRubricModal: React.FC<Props> = ({
  submissionId,
  onClose
}) => {
  const { submissionsList, evaluateSubmission } = useClassroomStore();
  const submission = submissionsList.find(s => s.id === submissionId);

  const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({
    technical: submission?.evaluatedRubricLevels?.technical || 'logrado',
    reflection: submission?.evaluatedRubricLevels?.reflection || 'logrado',
    evidence: submission?.evaluatedRubricLevels?.evidence || 'logrado'
  });

  const [feedbackText, setFeedbackText] = useState(
    submission?.teacherFeedback || ''
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!submission) return null;

  const handleSelectLevel = (criterionKey: string, levelKey: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [criterionKey]: levelKey
    }));
  };

  // Cálculo total de XP y Galeones
  let totalXp = 0;
  let totalCoins = 0;

  RUBRIC_CRITERIA.forEach(crit => {
    const chosenLevelKey = selectedLevels[crit.key];
    const lvl = crit.levels.find(l => l.key === chosenLevelKey);
    if (lvl) {
      totalXp += lvl.xp;
      totalCoins += lvl.coins;
    }
  });

  if (submission.isSubmittedOnTime) {
    totalXp += 20; // Bono por entrega a tiempo
    totalCoins += 10;
  }

  // Generador de Observación con Asistente Pedagógico IA
  const handleGenerateAiFeedback = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setIsGeneratingAi(false);
      const studentFirstName = submission.studentName.split(' ')[0];
      const reflectionHighlight = submission.reflection.prideHighlight || 'tu perseverancia';
      
      const aiGenerated = `¡Felicidades ${studentFirstName}! Tu evidencia sobre "${submission.questTitle}" demuestra un notable compromiso formativo. Me alegra ver que te sientes orgulloso de ${reflectionHighlight.toLowerCase()}. Has alcanzado un gran dominio en los saberes requeridos. Te invito a seguir experimentando con soluciones creativas en las próximas misiones comunitarias.`;
      
      setFeedbackText(aiGenerated);
    }, 800);
  };

  const handleSaveEvaluation = () => {
    evaluateSubmission(
      submission.id,
      selectedLevels,
      feedbackText.trim(),
      totalXp,
      totalCoins
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in my-auto flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Rúbrica Formativa NEM
                </span>
                {submission.isSubmittedOnTime && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    ⏱️ Entrega a Tiempo
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Evaluando a: {submission.studentName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Evidencia Entregada & Autoevaluación Metacognitiva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-2">
              <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evidencia del Artefacto</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium">
                {submission.evidenceText || 'El estudiante subió una evidencia gráfica del proyecto.'}
              </p>
              {submission.evidenceUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-h-40">
                  <img src={submission.evidenceUrl} alt="Evidencia" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
              <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Autoevaluación del Alumno</span>
              </span>
              <div className="space-y-1 text-xs">
                <div>
                  <strong className="text-slate-700 dark:text-zinc-300">Mayor Reto:</strong>{' '}
                  <span className="text-slate-600 dark:text-zinc-400">{submission.reflection.mainChallengeFaced}</span>
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-zinc-300">Estrategia:</strong>{' '}
                  <span className="text-slate-600 dark:text-zinc-400">{submission.reflection.strategyUsed}</span>
                </div>
                <div>
                  <strong className="text-slate-700 dark:text-zinc-300">Orgullo:</strong>{' '}
                  <span className="text-slate-600 dark:text-zinc-400">{submission.reflection.prideHighlight}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Criterios de Rúbrica en Listas Desplegables */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Criterios de Evaluación Formativa:
            </h3>

            <div className="space-y-3">
              {RUBRIC_CRITERIA.map((crit) => {
                const selectedLevelKey = selectedLevels[crit.key];
                const currentLvl = crit.levels.find(l => l.key === selectedLevelKey) || crit.levels[2];

                return (
                  <div 
                    key={crit.key} 
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-2 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-black text-slate-800 dark:text-zinc-200">
                        {crit.title}
                      </label>

                      {/* Lista Desplegable del Criterio */}
                      <div className="relative">
                        <select
                          value={selectedLevelKey}
                          onChange={(e) => handleSelectLevel(crit.key, e.target.value)}
                          className="w-full sm:w-80 px-3.5 py-2 bg-white dark:bg-zinc-900 border-2 border-indigo-200 dark:border-indigo-800/70 hover:border-indigo-500 rounded-xl text-xs font-black text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm cursor-pointer"
                        >
                          {crit.levels.map((lvl) => (
                            <option key={lvl.key} value={lvl.key}>
                              {lvl.label} (+{lvl.xp} XP / +{lvl.coins} 🪙)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Descripción del nivel seleccionado */}
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium flex items-start gap-1.5 pl-1 pt-0.5">
                      <span className="text-indigo-500 font-bold shrink-0">💡 Detalle:</span>
                      <span>{currentLvl.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Observaciones & Asistente Pedagógico IA */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Observación y Retroalimentación Cualitativa:
              </label>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiFeedback}
                className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black hover:bg-purple-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Wand2 className={`w-3.5 h-3.5 text-purple-500 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Redactando...' : '✨ Sugerir con Asistente IA'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Escribe comentarios formativos para el alumno y su familia..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Pie del Modal con Recompensas */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-black">
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Trophy className="w-4 h-4" />
              <span>+{totalXp} XP Ganada</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Coins className="w-4 h-4" />
              <span>+{totalCoins} Galeones</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEvaluation}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Evaluación Formativa</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
