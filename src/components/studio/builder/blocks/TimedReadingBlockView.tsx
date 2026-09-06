"use client";

import React, { useState, useMemo } from 'react';
import { TimedReadingBlock, ComprehensionQuestion } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  HelpCircle, 
  Sparkles, 
  Gauge, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Lightbulb,
  Zap,
  Target,
  FileCheck
} from 'lucide-react';

interface Props {
  block: TimedReadingBlock;
}

// Textos de ejemplo para pruebas rápidas docentes
const SAMPLE_READINGS = [
  {
    title: 'El Gran Eclipse Solar',
    text: 'Un eclipse solar total ocurre cuando la Luna pasa directamente entre el Sol y la Tierra, bloqueando completamente la luz solar directa. Durante este fenómeno astronómico, la corona solar, que es la atmósfera exterior del Sol, se vuelve visible a simple vista como un anillo brillante y resplandeciente.',
    time: 60,
    questions: [
      {
        question: '¿Qué cuerpo celeste bloquea la luz del Sol durante un eclipse total?',
        options: ['La Luna', 'Marte', 'Júpiter', 'Venus'],
        correctIndex: 0,
        explanation: 'La Luna se interpone en la línea visual entre la Tierra y el Sol.'
      },
      {
        question: '¿Qué parte del Sol se hace visible durante el eclipse total?',
        options: ['La corona solar', 'El núcleo solar', 'Las manchas solares', 'La fotosfera interna'],
        correctIndex: 0,
        explanation: 'La corona solar se aprecia como un halo blanco brillante alrededor de la silueta lunar.'
      }
    ]
  },
  {
    title: 'El Ajolote de Xochimilco',
    text: 'El ajolote (Ambystoma mexicanum) es una especie endémica de la cuenca lacustre de Xochimilco en México. Posee una extraordinaria capacidad biológica de regenerar extremidades perdidas, órganos vitales e incluso fragmentos de su corazón y tejido cerebral sin dejar cicatrices.',
    time: 60,
    questions: [
      {
        question: '¿De qué ecosistema es endémico el ajolote?',
        options: ['Lago de Xochimilco', 'Selva Lacandona', 'Desierto de Sonora', 'Cañón del Sumidero'],
        correctIndex: 0,
        explanation: 'Es originario exclusivamente de los canales y lagos de Xochimilco.'
      },
      {
        question: '¿Cuál es la habilidad biológica más sorprendente del ajolote?',
        options: ['Regenerar órganos y extremidades', 'Volar a gran altura', 'Cambiar de color como camaleón', 'Invernar por años'],
        correctIndex: 0,
        explanation: 'Puede regenerar tejidos complejos como corazón, cerebro y extremidades completas.'
      }
    ]
  }
];

export const TimedReadingBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { readingText = '', timeLimitSeconds = 60, comprehensionQuestions = [] } = block.data;

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    comprehensionQuestions[0]?.id || null
  );

  // Cálculo automático y en tiempo real del conteo de palabras
  const currentWordCount = useMemo(() => {
    const trimmed = readingText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [readingText]);

  // Cálculo de velocidad requerida en PPM (Palabras por minuto)
  const estimatedPpm = useMemo(() => {
    if (!currentWordCount || timeLimitSeconds <= 0) return 0;
    const minutes = timeLimitSeconds / 60;
    return Math.round(currentWordCount / minutes);
  }, [currentWordCount, timeLimitSeconds]);

  // Manejar cambio de texto con actualización automática de wordCount
  const handleTextChange = (text: string) => {
    const trimmed = text.trim();
    const count = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    updateBlockData(block.id, {
      readingText: text,
      wordCount: count
    });
  };

  // Cargar lectura muestra
  const handleLoadSample = (sample: typeof SAMPLE_READINGS[0]) => {
    const count = sample.text.trim().split(/\s+/).length;
    const formattedQuestions: ComprehensionQuestion[] = sample.questions.map((q, idx) => ({
      id: `q-${Date.now()}-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation
    }));

    updateBlockData(block.id, {
      readingText: sample.text,
      wordCount: count,
      timeLimitSeconds: sample.time,
      comprehensionQuestions: formattedQuestions
    });

    if (formattedQuestions.length > 0) {
      setExpandedQuestionId(formattedQuestions[0].id);
    }
  };

  // Agregar nueva pregunta de comprensión
  const handleAddQuestion = () => {
    const newQ: ComprehensionQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: '¿Qué aspecto clave describe el texto?',
      options: ['Opción A (Respuesta correcta)', 'Opción B', 'Opción C'],
      correctIndex: 0,
      explanation: 'Explicación de retroalimentación formativa para el alumno.'
    };

    const nextQuestions = [...comprehensionQuestions, newQ];
    updateBlockData(block.id, { comprehensionQuestions: nextQuestions });
    setExpandedQuestionId(newQ.id);
  };

  // Eliminar pregunta
  const handleRemoveQuestion = (qId: string) => {
    const nextQuestions = comprehensionQuestions.filter(q => q.id !== qId);
    updateBlockData(block.id, { comprehensionQuestions: nextQuestions });
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(nextQuestions[0]?.id || null);
    }
  };

  // Modificar pregunta
  const handleUpdateQuestion = (qId: string, partial: Partial<ComprehensionQuestion>) => {
    const nextQuestions = comprehensionQuestions.map(q => {
      if (q.id === qId) {
        return { ...q, ...partial };
      }
      return q;
    });
    updateBlockData(block.id, { comprehensionQuestions: nextQuestions });
  };

  // Modificar opción
  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
    const targetQ = comprehensionQuestions.find(q => q.id === qId);
    if (!targetQ) return;
    const nextOptions = [...targetQ.options];
    nextOptions[optIndex] = value;
    handleUpdateQuestion(qId, { options: nextOptions });
  };

  // Agregar opción a una pregunta
  const handleAddOptionToQuestion = (qId: string) => {
    const targetQ = comprehensionQuestions.find(q => q.id === qId);
    if (!targetQ || targetQ.options.length >= 5) return;
    const nextOptions = [...targetQ.options, `Opción ${String.fromCharCode(65 + targetQ.options.length)}`];
    handleUpdateQuestion(qId, { options: nextOptions });
  };

  // Eliminar opción de una pregunta
  const handleRemoveOptionFromQuestion = (qId: string, optIndex: number) => {
    const targetQ = comprehensionQuestions.find(q => q.id === qId);
    if (!targetQ || targetQ.options.length <= 2) return;
    const nextOptions = targetQ.options.filter((_, i) => i !== optIndex);
    let nextCorrect = targetQ.correctIndex;
    if (targetQ.correctIndex === optIndex) {
      nextCorrect = 0;
    } else if (targetQ.correctIndex > optIndex) {
      nextCorrect = targetQ.correctIndex - 1;
    }
    handleUpdateQuestion(qId, { options: nextOptions, correctIndex: nextCorrect });
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* Barra Superior de Métricas en Tiempo Real (Contador de Palabras + PPM + Tiempo) */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/70 dark:border-indigo-800/60 shadow-xs">
        
        {/* Conteo de Palabras */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-zinc-800 text-center shadow-2xs">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Palabras</span>
          </div>
          <span className="text-sm font-black text-slate-800 dark:text-zinc-100 mt-0.5">
            {currentWordCount}
          </span>
        </div>

        {/* Velocidad Estimada (PPM) */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-zinc-800 text-center shadow-2xs">
          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Ritmo PPM</span>
          </div>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
            {estimatedPpm} <span className="text-[9px] font-bold text-slate-400">PPM</span>
          </span>
        </div>

        {/* Límite de Tiempo */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-purple-100 dark:border-zinc-800 text-center shadow-2xs">
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Tiempo</span>
          </div>
          <select
            value={timeLimitSeconds}
            onChange={(e) => updateBlockData(block.id, { timeLimitSeconds: Number(e.target.value) })}
            className="text-xs font-black text-purple-700 dark:text-purple-300 bg-transparent focus:outline-none cursor-pointer mt-0.5"
            title="Seleccionar tiempo límite de lectura"
          >
            <option value={30}>30 seg</option>
            <option value={45}>45 seg</option>
            <option value={60}>60 seg (1 min)</option>
            <option value={90}>90 seg (1.5 min)</option>
            <option value={120}>120 seg (2 min)</option>
            <option value={180}>180 seg (3 min)</option>
            <option value={240}>240 seg (4 min)</option>
            <option value={300}>300 seg (5 min)</option>
          </select>
        </div>

      </div>

      {/* Área de Texto Principal de la Lectura */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Texto de Lectura Cronometrada:</span>
          </label>

          {/* Plantillas de Ejemplo Rápido */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">Ejemplos:</span>
            {SAMPLE_READINGS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100 transition-all cursor-pointer"
                title={`Cargar lectura de ejemplo: ${sample.title}`}
              >
                {sample.title.split(' ')[1] || sample.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          value={readingText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Pega aquí el fragmento, cuento, artículo o texto científico que el alumno leerá con cronómetro..."
          className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-y transition-all"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            El cronómetro se iniciará automáticamente cuando el alumno abra el reto.
          </span>
          {readingText && (
            <button
              type="button"
              onClick={() => handleTextChange('')}
              className="text-rose-500 hover:underline cursor-pointer font-bold"
            >
              Borrar texto
            </button>
          )}
        </div>
      </div>

      {/* Sección de Preguntas de Validación / Comprensión Lectora */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200">
              Preguntas de Comprensión ({comprehensionQuestions.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xs hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Pregunta</span>
          </button>
        </div>

        {/* Lista de Preguntas en Formato Acordeón */}
        {comprehensionQuestions.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-1.5 bg-slate-50/50 dark:bg-zinc-850/50">
            <HelpCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
              No has configurado preguntas de comprensión aún.
            </p>
            <p className="text-[10px] text-slate-400">
              Haz clic en &ldquo;Agregar Pregunta&rdquo; para validar la retención del estudiante.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {comprehensionQuestions.map((q, qIndex) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'border-purple-300 dark:border-purple-700/80 bg-white dark:bg-zinc-850 shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 hover:border-purple-200'
                  }`}
                >
                  {/* Cabecera de la Pregunta */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-2.5 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {q.question || `Pregunta ${qIndex + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuestion(q.id);
                        }}
                        aria-label={`Eliminar pregunta ${qIndex + 1}`}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Cuerpo de Configuración de la Pregunta */}
                  {isExpanded && (
                    <div className="p-3 space-y-3 border-t border-slate-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-850/50">
                      
                      {/* Enunciado del Reactivo */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Enunciado del Reactivo:
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                          placeholder="Escribe la pregunta sobre la lectura..."
                          className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      {/* Opciones de Respuesta */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Opciones (Selecciona la correcta con el Check verde):
                        </label>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctIndex;
                            const letter = String.fromCharCode(65 + optIdx);

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(q.id, { correctIndex: optIdx })}
                                  title={isCorrect ? 'Respuesta correcta' : 'Marcar como correcta'}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-zinc-700 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : letter}
                                </button>

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                                  placeholder={`Opción ${letter}...`}
                                  className="flex-1 text-xs font-medium bg-transparent focus:outline-none text-slate-800 dark:text-zinc-100"
                                />

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(q.id, optIdx)}
                                    aria-label={`Eliminar opción ${letter}`}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Botón para añadir opción */}
                        {q.options.length < 5 && (
                          <button
                            type="button"
                            onClick={() => handleAddOptionToQuestion(q.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Añadir otra opción ({q.options.length}/5)</span>
                          </button>
                        )}
                      </div>

                      {/* Explicación de Retroalimentación */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-blue-500" />
                          <span>Retroalimentación pedagógica explicativa:</span>
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                          placeholder="Por qué esta respuesta es la correcta..."
                          className="w-full px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none"
                        />
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
