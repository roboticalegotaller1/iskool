"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/navigation/BackButton';
import { useWritingEngineStore } from '@/store/useWritingEngineStore';
import { WritingLanguage, LanguageLevel, LEVEL_EXAM_SPECS } from '@/types/writingEngine';
import {
  PenTool,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
  RotateCcw,
  Trophy,
  Flame,
  Award,
  Zap,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  Clock,
  Target
} from 'lucide-react';

export default function StudentWritingStudioPage() {
  const {
    selectedLanguage,
    selectedLevel,
    activePrompt,
    currentDraft,
    analysisOutput,
    latestEvaluation,
    isSubmitting,
    unlockedHintLevels,
    setSelectedLanguage,
    setSelectedLevel,
    updateDraft,
    unlockHintLevel,
    submitFinalEvaluation,
    resetDraft,
    generateNewPrompt
  } = useWritingEngineStore();

  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [selectedTopicInput, setSelectedTopicInput] = useState<string>('');
  const [showNewPromptModal, setShowNewPromptModal] = useState<boolean>(false);
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<number, boolean>>({ 0: true });

  const currentSpecKey = `${selectedLanguage}-${selectedLevel}` as const;
  const currentSpec = LEVEL_EXAM_SPECS[currentSpecKey] || LEVEL_EXAM_SPECS['en-B2'];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDraft(e.target.value);
  };

  const handleSubmit = () => {
    if (analysisOutput.conteo_palabras < 5) return;
    submitFinalEvaluation();
    setShowEvaluationModal(true);
  };

  const toggleDiagnosticAccordion = (index: number) => {
    setExpandedDiagnostics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Estado del indicador de longitud
  const lengthBadgeColors = {
    deficiente: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    optimo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    excedido: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
  };

  const lengthLabels = {
    deficiente: 'Borrador corto (debajo del mínimo)',
    optimo: 'Rango de palabras óptimo',
    excedido: 'Exceso de longitud (penalizable)'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Cabecera y Retorno */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackButton
            fallbackUrl="/student/idiomas"
            label="Volver a Academia de Idiomas"
            variant="header"
          />

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Writing Copilot Socrático Activo
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Recompensa: +250 XP
            </span>
          </div>
        </div>

        {/* HERO BAR GAMIFICADA & SELECTORES DUALES */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Estudio de Expresión Escrita
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {currentSpec.framework === 'cambridge' ? 'Cambridge Assessment English' : 'France Éducation International'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <PenTool className="w-7 h-7 text-indigo-400" />
                Writing Studio: {currentSpec.examName}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Redacta tu respuesta oficial. El Motor Autónomo te acompañará mediante preguntas socráticas y pistas lingüísticas sin resolver el texto por ti.
              </p>
            </div>

            {/* Selectores de Idioma y Nivel MCER */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-2 rounded-2xl border border-indigo-500/30 backdrop-blur-md">
              {/* Idioma */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedLanguage === 'en'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 Inglés
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('fr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedLanguage === 'fr'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇫🇷 Francés
                </button>
              </div>

              {/* Niveles */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                {(['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as LanguageLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      selectedLevel === lvl
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/30 scale-105'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: CONSIGNA + EDITOR + COPILOT SOCRÁTICO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUMNA IZQUIERDA: CONSIGNA OFICIAL Y EDITOR (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TARJETA DE LA CONSIGNA OFICIAL */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ID: {activePrompt.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Objetivo: {activePrompt.limitePalabras.min} - {activePrompt.limitePalabras.max} palabras
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {activePrompt.titulo}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewPromptModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Cambiar Tarea
                </button>
              </div>

              {/* Contexto y Enunciado */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-sm text-slate-200 leading-relaxed">
                <p className="font-semibold text-indigo-300 mb-1">Enunciado Oficial:</p>
                <p>{activePrompt.consignaOficial}</p>
              </div>

              {/* Puntos Clave Requeridos (Bullets) */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Puntos Clave Obligatorios a Desarrollar:
                </p>
                <div className="space-y-1.5">
                  {activePrompt.puntosClaveObligatorios.map((punto, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <Target className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{punto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EDITOR EN TIEMPO REAL */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
              
              {/* Barra de Herramientas del Editor & Métricas en Vivo */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${lengthBadgeColors[analysisOutput.estado_longitud]}`}>
                    {analysisOutput.conteo_palabras} palabras ({lengthLabels[analysisOutput.estado_longitud]})
                  </span>
                  <span className="text-xs text-slate-400">
                    Rango: {activePrompt.limitePalabras.min} - {activePrompt.limitePalabras.max}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetDraft}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Reiniciar borrador"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    TTR: {analysisOutput.metricas_tiempo_real.diversidad_lexica_ttr}
                  </span>
                </div>
              </div>

              {/* Área de Texto Principal */}
              <div className="relative">
                <textarea
                  value={currentDraft}
                  onChange={handleTextChange}
                  placeholder={`Escribe aquí tu redacción en ${selectedLanguage === 'en' ? 'inglés' : 'francés'}... El motor te dará pistas sin resolver tus frases.`}
                  rows={14}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-slate-100 placeholder-slate-500 font-sans text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                />

                {/* Barra de progreso de longitud inferior */}
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysisOutput.estado_longitud === 'optimo'
                        ? 'bg-emerald-500'
                        : analysisOutput.estado_longitud === 'excedido'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, analysisOutput.progreso_porcentaje)}%` }}
                  />
                </div>
              </div>

              {/* Conectores Detectados en Vivo */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Conectores Discursivos Detectados ({analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.length}):
                  </span>
                  <span className="text-[11px]">
                    Densidad Académica: <strong className="text-teal-400 uppercase">{analysisOutput.metricas_tiempo_real.densidad_academica}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.length > 0 ? (
                    analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.map((conn, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                        ✓ {conn}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Aún no se detectan conectores de nivel {selectedLevel}. Integra expresiones de enlace para elevar tu puntaje de Cohesión.
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de Envío Oficial */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Al enviar, el motor emitirá la calificación analítica oficial estricta.
                </p>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || analysisOutput.conteo_palabras < 5}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Evaluando...' : 'Enviar a Evaluación Oficial'}
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: COPILOT SOCRÁTICO (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">

            {/* PANEL DE ANDAMIAJE SOCRÁTICO */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tutor Socrático en Vivo</h3>
                    <p className="text-[11px] text-slate-400">Andamiaje gradual en 3 niveles de pistas</p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {analysisOutput.diagnosticos_detectados.length} áreas de mejora
                </span>
              </div>

              {analysisOutput.diagnosticos_detectados.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">¡Borrador limpio y cohesionado!</p>
                  <p className="text-xs text-slate-300">
                    No se detectaron errores obvios de interferencia con el español ni fallas de concordancia. Asegúrate de cumplir con los puntos obligatorios.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {analysisOutput.diagnosticos_detectados.map((diag, index) => {
                    const isExpanded = !!expandedDiagnostics[index];
                    const activeLevel = unlockedHintLevels[diag.segmento] || 1;

                    return (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all shadow-md"
                      >
                        {/* Cabecera del Diagnóstico */}
                        <button
                          type="button"
                          onClick={() => toggleDiagnosticAccordion(index)}
                          className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-900/60 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {diag.tipo}
                              </span>
                              <span className="text-xs font-mono text-slate-300 font-bold truncate max-w-[180px]">
                                "{diag.segmento}"
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {diag.pista_nivel_1}
                            </p>
                          </div>

                          <div className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Contenido Desplegable: 3 Niveles de Pistas */}
                        {isExpanded && (
                          <div className="p-4 pt-0 space-y-3 border-t border-slate-900 bg-slate-950/90">
                            
                            {/* Pista Nivel 1: Socrática */}
                            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                                  Nivel 1 · Pregunta Guía
                                </span>
                                <span className="text-[10px] text-emerald-400 font-bold">Activo</span>
                              </div>
                              <p className="text-xs text-slate-200 italic">
                                "{diag.pista_nivel_1}"
                              </p>
                            </div>

                            {/* Pista Nivel 2: Regla Lingüística & L1 */}
                            {activeLevel >= 2 ? (
                              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                                    Nivel 2 · Regla Lingüística & L1
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-bold">Desbloqueado</span>
                                </div>
                                <p className="text-xs text-slate-200">
                                  {diag.pista_nivel_2}
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => unlockHintLevel(diag.segmento, 2)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                Desbloquear Pista Nivel 2 (Regla Gramatical / Falso Amigo)
                              </button>
                            )}

                            {/* Pista Nivel 3: Modelo Correctivo Análogo */}
                            {activeLevel >= 3 ? (
                              <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                                    Nivel 3 · Modelo Análogo
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-bold">Desbloqueado</span>
                                </div>
                                <p className="text-xs text-slate-200">
                                  {diag.pista_nivel_3_modelo}
                                </p>
                                <p className="text-[10px] text-slate-400 italic">
                                  *Observa la estructura sin copiarla textualmente. Aplica el mismo principio a tu idea.
                                </p>
                              </div>
                            ) : activeLevel >= 2 ? (
                              <button
                                type="button"
                                onClick={() => unlockHintLevel(diag.segmento, 3)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-teal-300 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-400" />
                                Desbloquear Pista Nivel 3 (Ver Ejemplo Análogo)
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CHECKLIST DE AUTO-EVALUACIÓN PREVIA */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Checklist Previo de Examen
              </h4>
              <div className="space-y-2">
                {activePrompt.checklistPrevio.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-teal-400 font-bold">
                      ✓
                    </span>
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* MODAL DE RESULTADOS DE EVALUACIÓN FINAL */}
        {showEvaluationModal && latestEvaluation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Dictamen Analítico Oficial
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Resultado de Evaluación {latestEvaluation.nivel} ({latestEvaluation.idioma === 'en' ? 'Cambridge' : 'DELF-DALF'})
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
                    {latestEvaluation.calificacionGlobal}%
                  </div>
                  <span className="text-xs text-slate-400 font-bold">
                    +{latestEvaluation.xpGanados} XP Ganados
                  </span>
                </div>
              </div>

              {/* Rúbricas Oficiales */}
              {latestEvaluation.rubricaCambridge && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Content</p>
                    <p className="text-xl font-black text-teal-400">{latestEvaluation.rubricaCambridge.content} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Comm. Achievement</p>
                    <p className="text-xl font-black text-indigo-400">{latestEvaluation.rubricaCambridge.communicativeAchievement} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Organisation</p>
                    <p className="text-xl font-black text-amber-400">{latestEvaluation.rubricaCambridge.organisation} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Language</p>
                    <p className="text-xl font-black text-rose-400">{latestEvaluation.rubricaCambridge.language} / 5</p>
                  </div>
                </div>
              )}

              {latestEvaluation.rubricaDelf && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Prise de position</p>
                    <p className="text-xl font-black text-teal-400">{latestEvaluation.rubricaDelf.priseDePositionOuRespect} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Cohérence & Arg.</p>
                    <p className="text-xl font-black text-indigo-400">{latestEvaluation.rubricaDelf.coherenceEtCohesion} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Lexique</p>
                    <p className="text-xl font-black text-amber-400">{latestEvaluation.rubricaDelf.competenceLexicale} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-400">Morphosyntaxe</p>
                    <p className="text-xl font-black text-rose-400">{latestEvaluation.rubricaDelf.competenceMorphosyntaxique} / 7</p>
                  </div>
                </div>
              )}

              {/* Aciertos Notables */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Aciertos Notables Detectados:
                </h4>
                {latestEvaluation.desgloseCualitativo.aciertosNotables.map((ac, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-200 space-y-1">
                    <p className="font-mono text-emerald-300 font-bold">{ac.cita}</p>
                    <p className="text-slate-400">{ac.explicacion}</p>
                  </div>
                ))}
              </div>

              {/* Plan de Acción: 2 Micro-Objetivos */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Plan de Acción para tu Siguiente Sesión:
                </h4>
                <div className="space-y-2">
                  {latestEvaluation.planAccionSiguienteSesion.objetivosMicroLinguisticos.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-indigo-900/60 text-xs text-slate-400">
                  <strong>Ejercicio sugerido:</strong> {latestEvaluation.planAccionSiguienteSesion.ejercicioSugerido}
                </div>
              </div>

              {/* Botón de Cierre */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Continuar en el Estudio
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL PARA GENERAR NUEVA TAREA / CAMBIAR TEMA */}
        {showNewPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Generar Nueva Tarea Oficial
              </h3>
              <p className="text-xs text-slate-300">
                Selecciona un tema opcional para contextualizar la consigna del nivel {selectedLevel}:
              </p>

              <input
                type="text"
                value={selectedTopicInput}
                onChange={(e) => setSelectedTopicInput(e.target.value)}
                placeholder="Ej. Inteligencia Artificial, Cambio Climático, Viajes..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPromptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    generateNewPrompt(selectedLanguage, selectedLevel, selectedTopicInput || undefined);
                    setShowNewPromptModal(false);
                    setSelectedTopicInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Generar Consigna
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
