"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/navigation/BackButton';
import { useWritingEngineStore } from '@/store/useWritingEngineStore';
import { WritingLanguage, LanguageLevel, LEVEL_EXAM_SPECS } from '@/types/writingEngine';
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Send,
  RotateCcw,
  Trophy,
  Flame,
  Zap,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  Target,
  Wand2,
  Clock,
  UserCheck,
  Link2,
  BookA,
  Check
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
    applyLiveCorrection,
    unlockHintLevel,
    submitFinalEvaluation,
    resetDraft,
    generateNewPrompt
  } = useWritingEngineStore();

  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [selectedTopicInput, setSelectedTopicInput] = useState<string>('');
  const [showNewPromptModal, setShowNewPromptModal] = useState<boolean>(false);
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<number, boolean>>({ 0: true });
  const [expandedLiveIssues, setExpandedLiveIssues] = useState<Record<number, boolean>>({ 0: true });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'verb_tense' | 'person_agreement' | 'connector' | 'vocabulary'>('all');

  const currentSpecKey = `${selectedLanguage}-${selectedLevel}` as const;
  const currentSpec = LEVEL_EXAM_SPECS[currentSpecKey] || LEVEL_EXAM_SPECS['en-B2'];

  const liveCorrection = analysisOutput.correccion_en_tiempo_real;

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

  const toggleLiveIssueAccordion = (index: number) => {
    setExpandedLiveIssues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Indicador de longitud adaptado a modo claro
  const lengthBadgeColors = {
    deficiente: 'bg-amber-50 text-amber-700 border-amber-200',
    optimo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    excedido: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const lengthLabels = {
    deficiente: 'Borrador corto (debajo del mínimo)',
    optimo: 'Rango de palabras óptimo',
    excedido: 'Exceso de longitud (penalizable)'
  };

  const filteredDetails = liveCorrection?.details.filter(d => {
    if (selectedCategoryFilter === 'all') return true;
    return d.category === selectedCategoryFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
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
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Writing Copilot Socrático Activo
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Recompensa: +250 XP
            </span>
          </div>
        </div>

        {/* HERO BAR GAMIFICADA & SELECTORES DUALES (DISEÑO MODO CLARO) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/80 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  Estudio de Expresión Escrita
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentSpec.framework === 'cambridge' ? 'Cambridge Assessment English' : 'France Éducation International'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                <PenTool className="w-7 h-7 text-indigo-600" />
                Writing Studio: {currentSpec.examName}
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Redacta tu respuesta oficial. El Motor de IA Pedagógica te acompaña en tiempo real corrigiendo concordancias, tiempos verbales y andamiando tu aprendizaje socrático.
              </p>
            </div>

            {/* Selectores de Idioma y Nivel MCER */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-100/90 p-2 rounded-2xl border border-slate-200">
              {/* Idioma */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇬🇧 Inglés
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('fr')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedLanguage === 'fr'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇫🇷 Francés
                </button>
              </div>

              {/* Niveles MCER */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                {(['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as LanguageLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-teal-600 text-white shadow-sm scale-105'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: CONSIGNA + EDITOR CON CORRECCIÓN EN TIEMPO REAL + COPILOT SOCRÁTICO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUMNA IZQUIERDA: CONSIGNA OFICIAL Y EDITOR (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TARJETA DE LA CONSIGNA OFICIAL */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ID: {activePrompt.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Objetivo: {activePrompt.limitePalabras.min} - {activePrompt.limitePalabras.max} palabras
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {activePrompt.titulo}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewPromptModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Cambiar Tarea
                </button>
              </div>

              {/* Contexto y Enunciado */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-sm text-slate-800 leading-relaxed">
                <p className="font-semibold text-indigo-900 mb-1">Enunciado Oficial:</p>
                <p>{activePrompt.consignaOficial}</p>
              </div>

              {/* Puntos Clave Requeridos (Bullets) */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Puntos Clave Obligatorios a Desarrollar:
                </p>
                <div className="space-y-1.5">
                  {activePrompt.puntosClaveObligatorios.map((punto, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <Target className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{punto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EDITOR EN TIEMPO REAL */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              
              {/* Barra de Herramientas del Editor & Métricas en Vivo */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${lengthBadgeColors[analysisOutput.estado_longitud]}`}>
                    {analysisOutput.conteo_palabras} palabras ({lengthLabels[analysisOutput.estado_longitud]})
                  </span>
                  <span className="text-xs text-slate-500">
                    Rango: {activePrompt.limitePalabras.min} - {activePrompt.limitePalabras.max}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetDraft}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                    title="Reiniciar borrador"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    TTR: {analysisOutput.metricas_tiempo_real.diversidad_lexica_ttr}
                  </span>
                </div>
              </div>

              {/* Área de Texto Principal */}
              <div className="relative">
                <textarea
                  value={currentDraft}
                  onChange={handleTextChange}
                  placeholder={`Escribe aquí tu redacción en ${selectedLanguage === 'en' ? 'inglés' : 'francés'}... El Motor de IA Pedagógica analizará tus oraciones en tiempo real.`}
                  rows={13}
                  className="w-full bg-slate-50/40 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-900 placeholder-slate-400 font-sans text-base leading-relaxed focus:outline-none focus:ring-3 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-y shadow-xs"
                />

                {/* Barra de progreso de longitud inferior */}
                <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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

              {/* =========================================================================
                  PANEL EN TIEMPO REAL: TEXTO CORREGIDO & DIAGNÓSTICO LINGÜÍSTICO (IMAGEN 4)
                  ========================================================================= */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/70 shadow-xs space-y-4">
                
                {/* Cabecera del Panel con Acciones Rápidas */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">
                          Revisión Lingüística en Tiempo Real
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Motor IA Pedagógica
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Corrección sintáctica, tiempos verbales, concordancia de persona y conectores para certificación
                      </p>
                    </div>
                  </div>

                  {liveCorrection?.hasErrors && (
                    <button
                      type="button"
                      onClick={() => applyLiveCorrection(liveCorrection.correctedText)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Sustituir automáticamente en el borrador con la versión corregida"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      Aplicar Corrección al Borrador
                    </button>
                  )}
                </div>

                {/* Filtros / Contadores Rápidos por Categoría */}
                {liveCorrection && liveCorrection.originalText.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer border ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Todos ({liveCorrection.details.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('verb_tense')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                        selectedCategoryFilter === 'verb_tense'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      Tiempos Verbales ({liveCorrection.categoryCounts.verbTenses})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('person_agreement')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                        selectedCategoryFilter === 'person_agreement'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <UserCheck className="w-3 h-3" />
                      Concordancia y Persona ({liveCorrection.categoryCounts.personAgreement})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('connector')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                        selectedCategoryFilter === 'connector'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      <Link2 className="w-3 h-3" />
                      Conectores MCER ({liveCorrection.categoryCounts.connectors})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('vocabulary')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                        selectedCategoryFilter === 'vocabulary'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      <BookA className="w-3 h-3" />
                      Léxico & L1 ({liveCorrection.categoryCounts.vocabulary})
                    </button>
                  </div>
                )}

                {/* Vista del Texto Corregido Reconstruido */}
                {(!currentDraft || currentDraft.trim().length < 5) ? (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 text-slate-500">
                    <p className="text-xs font-semibold text-slate-700">
                      El asistente pedagógico está a la espera de tus frases.
                    </p>
                    <p className="text-[11px]">
                      Conforme redactes, aquí verás la reconstrucción palabra por palabra con tiempos verbales optimizados, concordancia de persona y conectores para examen.
                    </p>
                  </div>
                ) : !liveCorrection?.hasErrors ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      ¡Excelente redacción! No se detectan anomalías de tiempo verbal ni discordancia de persona en tu borrador actual.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Renderizado de tokens diferenciales */}
                    <div className="p-4 rounded-xl bg-white border border-indigo-100 text-sm leading-relaxed text-slate-800 shadow-inner">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Texto Oficial Sugerido (Con Correcciones Aplicadas):
                      </p>
                      <div className="font-sans leading-relaxed">
                        {liveCorrection.tokens.map((token, tIdx) => {
                          if (token.type === 'unchanged') {
                            return <span key={tIdx}>{token.corrected}</span>;
                          }

                          if (token.type === 'tense') {
                            return (
                              <span
                                key={tIdx}
                                className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-semibold cursor-help"
                                title={`Tiempo Verbal corregido: ${token.explanation}`}
                              >
                                {token.original && <s className="text-amber-500 mr-1 text-xs">{token.original}</s>}
                                <span>{token.corrected}</span>
                              </span>
                            );
                          }

                          if (token.type === 'person') {
                            return (
                              <span
                                key={tIdx}
                                className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-300 font-semibold cursor-help"
                                title={`Concordancia corregida: ${token.explanation}`}
                              >
                                {token.original && <s className="text-rose-500 mr-1 text-xs">{token.original}</s>}
                                <span>{token.corrected}</span>
                              </span>
                            );
                          }

                          if (token.type === 'connector') {
                            return (
                              <span
                                key={tIdx}
                                className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-300 font-semibold cursor-help"
                                title={`Conector elevado: ${token.explanation}`}
                              >
                                <span>{token.corrected}</span>
                              </span>
                            );
                          }

                          // Lexical / L1
                          return (
                            <span
                              key={tIdx}
                              className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-300 font-semibold cursor-help"
                              title={`Léxico / Falso amigo: ${token.explanation}`}
                            >
                              {token.original && <s className="text-teal-500 mr-1 text-xs">{token.original}</s>}
                              <span>{token.corrected}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Desglose explicativo de las correcciones detectadas */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Pistas y Justificaciones Lingüísticas Detectadas ({filteredDetails.length}):
                      </p>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {filteredDetails.map((detail, dIdx) => {
                          const isExp = !!expandedLiveIssues[dIdx];
                          const badgeColor = detail.category === 'verb_tense'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : detail.category === 'person_agreement'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : detail.category === 'connector'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : 'bg-teal-100 text-teal-800 border-teal-200';

                          return (
                            <div key={dIdx} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleLiveIssueAccordion(dIdx)}
                                className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                                    {detail.categoryLabel}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-rose-600 line-through">
                                    "{detail.original}"
                                  </span>
                                  <span className="text-xs text-slate-400">→</span>
                                  <span className="text-xs font-mono font-bold text-emerald-700">
                                    "{detail.suggested}"
                                  </span>
                                </div>
                                <div className="text-slate-400 shrink-0">
                                  {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </button>

                              {isExp && (
                                <div className="p-3 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-1.5 text-xs">
                                  <p className="text-slate-700 leading-relaxed">
                                    <strong className="text-slate-900">Fundamento: </strong>
                                    {detail.pedagogicalRule}
                                  </p>
                                  <p className="text-indigo-700 bg-indigo-50/80 p-2 rounded-lg border border-indigo-100 text-[11px] leading-relaxed">
                                    <strong>Impacto en Examen: </strong>
                                    {detail.examTip}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Conectores Detectados en Vivo */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-700">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Conectores Discursivos Detectados ({analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.length}):
                  </span>
                  <span className="text-[11px]">
                    Densidad Académica: <strong className="text-teal-700 uppercase font-black">{analysisOutput.metricas_tiempo_real.densidad_academica}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.length > 0 ? (
                    analysisOutput.metricas_tiempo_real.conectores_nivel_esperado.map((conn, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                        ✓ {conn}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Aún no se detectan conectores de nivel {selectedLevel}. Integra expresiones de enlace para elevar tu puntaje de Cohesión.
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de Envío Oficial */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500">
                  Al enviar, el Motor de IA Pedagógica emitirá la calificación analítica oficial estricta.
                </p>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || analysisOutput.conteo_palabras < 5}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Tutor Socrático en Vivo</h3>
                    <p className="text-[11px] text-slate-500">Andamiaje gradual en 3 niveles de pistas</p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {analysisOutput.diagnosticos_detectados.length} áreas de mejora
                </span>
              </div>

              {analysisOutput.diagnosticos_detectados.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">¡Borrador limpio y cohesionado!</p>
                  <p className="text-xs text-emerald-700">
                    No se detectaron errores obvios de interferencia con el español ni fallas de concordancia. Asegúrate de cumplir con los puntos obligatorios.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {analysisOutput.diagnosticos_detectados.map((diag, index) => {
                    const isExpanded = !!expandedDiagnostics[index];
                    const activeLevel = unlockedHintLevels[diag.segmento] || 1;

                    return (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden transition-all shadow-2xs"
                      >
                        {/* Cabecera del Diagnóstico */}
                        <button
                          type="button"
                          onClick={() => toggleDiagnosticAccordion(index)}
                          className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                {diag.tipo}
                              </span>
                              <span className="text-xs font-mono text-slate-800 font-bold truncate max-w-[180px]">
                                "{diag.segmento}"
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {diag.pista_nivel_1}
                            </p>
                          </div>

                          <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500 shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Contenido Desplegable: 3 Niveles de Pistas */}
                        {isExpanded && (
                          <div className="p-4 pt-0 space-y-3 border-t border-slate-200/80 bg-white">
                            
                            {/* Pista Nivel 1: Socrática */}
                            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                                  Nivel 1 · Pregunta Guía
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold">Activo</span>
                              </div>
                              <p className="text-xs text-slate-800 italic">
                                "{diag.pista_nivel_1}"
                              </p>
                            </div>

                            {/* Pista Nivel 2: Regla Lingüística & L1 */}
                            {activeLevel >= 2 ? (
                              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                    Nivel 2 · Regla Lingüística & L1
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-bold">Desbloqueado</span>
                                </div>
                                <p className="text-xs text-slate-800">
                                  {diag.pista_nivel_2}
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => unlockHintLevel(diag.segmento, 2)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-amber-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                Desbloquear Pista Nivel 2 (Regla Gramatical / Falso Amigo)
                              </button>
                            )}

                            {/* Pista Nivel 3: Modelo Correctivo Análogo */}
                            {activeLevel >= 3 ? (
                              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                                    Nivel 3 · Modelo Análogo
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-bold">Desbloqueado</span>
                                </div>
                                <p className="text-xs text-slate-800">
                                  {diag.pista_nivel_3_modelo}
                                </p>
                                <p className="text-[10px] text-slate-500 italic">
                                  *Observa la estructura sin copiarla textualmente. Aplica el mismo principio a tu idea.
                                </p>
                              </div>
                            ) : activeLevel >= 2 ? (
                              <button
                                type="button"
                                onClick={() => unlockHintLevel(diag.segmento, 3)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-teal-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
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
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Checklist Previo de Examen
              </h4>
              <div className="space-y-2">
                {activePrompt.checklistPrevio.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5 text-teal-700 font-bold">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-xs">
                    <Trophy className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      Dictamen Analítico Oficial
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Resultado de Evaluación {latestEvaluation.nivel} ({latestEvaluation.idioma === 'en' ? 'Cambridge' : 'DELF-DALF'})
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-600">
                    {latestEvaluation.calificacionGlobal}%
                  </div>
                  <span className="text-xs text-slate-500 font-bold">
                    +{latestEvaluation.xpGanados} XP Ganados
                  </span>
                </div>
              </div>

              {/* Rúbricas Oficiales Cambridge */}
              {latestEvaluation.rubricaCambridge && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Content</p>
                    <p className="text-xl font-black text-teal-700">{latestEvaluation.rubricaCambridge.content} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Comm. Achievement</p>
                    <p className="text-xl font-black text-indigo-700">{latestEvaluation.rubricaCambridge.communicativeAchievement} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Organisation</p>
                    <p className="text-xl font-black text-amber-700">{latestEvaluation.rubricaCambridge.organisation} / 5</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Language</p>
                    <p className="text-xl font-black text-rose-700">{latestEvaluation.rubricaCambridge.language} / 5</p>
                  </div>
                </div>
              )}

              {/* Rúbricas Oficiales DELF */}
              {latestEvaluation.rubricaDelf && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Prise de position</p>
                    <p className="text-xl font-black text-teal-700">{latestEvaluation.rubricaDelf.priseDePositionOuRespect} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Cohérence & Arg.</p>
                    <p className="text-xl font-black text-indigo-700">{latestEvaluation.rubricaDelf.coherenceEtCohesion} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Lexique</p>
                    <p className="text-xl font-black text-amber-700">{latestEvaluation.rubricaDelf.competenceLexicale} / 6</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[11px] font-bold text-slate-500">Morphosyntaxe</p>
                    <p className="text-xl font-black text-rose-700">{latestEvaluation.rubricaDelf.competenceMorphosyntaxique} / 7</p>
                  </div>
                </div>
              )}

              {/* Aciertos Notables */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Aciertos Notables Detectados:
                </h4>
                {latestEvaluation.desgloseCualitativo.aciertosNotables.map((ac, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 space-y-1">
                    <p className="font-mono text-emerald-800 font-bold">{ac.cita}</p>
                    <p className="text-slate-600">{ac.explicacion}</p>
                  </div>
                ))}
              </div>

              {/* Plan de Acción: 2 Micro-Objetivos */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Plan de Acción para tu Siguiente Sesión:
                </h4>
                <div className="space-y-2">
                  {latestEvaluation.planAccionSiguienteSesion.objetivosMicroLinguisticos.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-indigo-200/60 text-xs text-slate-600">
                  <strong>Ejercicio sugerido: </strong> {latestEvaluation.planAccionSiguienteSesion.ejercicioSugerido}
                </div>
              </div>

              {/* Botón de Cierre */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Continuar en el Estudio
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL PARA GENERAR NUEVA TAREA / CAMBIAR TEMA */}
        {showNewPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Generar Nueva Tarea Oficial
              </h3>
              <p className="text-xs text-slate-600">
                Selecciona un tema opcional para contextualizar la consigna del nivel {selectedLevel}:
              </p>

              <input
                type="text"
                value={selectedTopicInput}
                onChange={(e) => setSelectedTopicInput(e.target.value)}
                placeholder="Ej. Inteligencia Artificial, Cambio Climático, Viajes..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPromptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
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
