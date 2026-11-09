'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ScanLine,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Shuffle,
  FileText,
  Camera,
  BarChart3,
  Plus,
  Trash2,
  Sparkles,
  QrCode,
  ShieldCheck,
  Send,
  Award,
  Download
} from 'lucide-react';
import { StudioBlock } from '@/types/studioBlocks';
import {
  ExamQuestionItem,
  ExamVariantCode,
  generateExamVariantsZeroToken,
  extractExamQuestionsFromStudioBlocks,
  runClassroomOmrBatchGradingZeroToken,
  evaluateOpenAnswerDeterministically,
  ClassroomOmrBatchReport
} from '@/services/deterministicExamOmrEngine';
import { downloadOmrExamPdf, OmrPdfExportScope } from '@/services/omrExamPdfExporter';

export interface StudioOpticalExamSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  schoolName: string;
  schoolShortName: string;
  groupName: string;
  notebookPage: number;
  studioBlocks: StudioBlock[];
  onStampAndSyncKardex?: (report: ClassroomOmrBatchReport) => void;
  onSaveQuestionsToBlock?: (questions: ExamQuestionItem[], penalty: number) => void;
}

export const StudioOpticalExamSuiteModal: React.FC<StudioOpticalExamSuiteModalProps> = ({
  isOpen,
  onClose,
  examTitle,
  schoolName,
  schoolShortName,
  groupName,
  notebookPage,
  studioBlocks,
  onStampAndSyncKardex,
  onSaveQuestionsToBlock
}) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'omr_scanner' | 'psychometrics'>('variants');
  const [selectedVariantCode, setSelectedVariantCode] = useState<ExamVariantCode>('A');
  const [penaltyPerError, setPenaltyPerError] = useState<number>(0.25);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [deliveryMode, setDeliveryMode] = useState<'hybrid' | 'paper_only' | 'digital_kiosk'>('hybrid');
  const [questions, setQuestions] = useState<ExamQuestionItem[]>(() =>
    extractExamQuestionsFromStudioBlocks(studioBlocks, 0.25)
  );

  // Estado interactivo de la hoja OMR de demostración
  const [interactiveBubbles, setInteractiveBubbles] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({
    1: 'A',
    2: 'C',
    3: 'B',
    4: 'D',
    5: 'A'
  });
  const [correctedBubbles, setCorrectedBubbles] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({
    2: 'A' // Ejemplo de casilla corregida limpiamente por el alumno
  });
  const [studentIdDigits, setStudentIdDigits] = useState<number[]>([0, 2, 4, 8]);
  const [isScanningAnimation, setIsScanningAnimation] = useState<boolean>(false);
  const [openAnswerSample, setOpenAnswerSample] = useState<string>(
    'La soberanía dimana directamente del pueblo para garantizar la libertad, la igualdad social y la división de poderes en la Constitución.'
  );
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studioBlocks.length > 0) {
      const extracted = extractExamQuestionsFromStudioBlocks(studioBlocks, penaltyPerError);
      if (extracted.length > 0) {
        setQuestions(extracted);
      }
    }
  }, [isOpen, studioBlocks]);

  const variants = useMemo(
    () => generateExamVariantsZeroToken(questions, ['A', 'B', 'C', 'D'], shuffleQuestions, shuffleOptions),
    [questions, shuffleQuestions, shuffleOptions]
  );

  const activeVariant = useMemo(
    () => variants.find((v) => v.variantCode === selectedVariantCode) || variants[0],
    [variants, selectedVariantCode]
  );

  const batchReport = useMemo(
    () =>
      runClassroomOmrBatchGradingZeroToken({
        examTitle: examTitle || 'Evaluación Curricular SEP NEM',
        schoolName,
        groupName,
        baseQuestions: questions,
        variants,
        penaltyPerError
      }),
    [examTitle, schoolName, groupName, questions, variants, penaltyPerError]
  );

  const openRubricEval = useMemo(
    () => evaluateOpenAnswerDeterministically(openAnswerSample, ['soberanía', 'pueblo', 'igualdad', 'libertad'], 2),
    [openAnswerSample]
  );

  const handleExportPdf = (scope: OmrPdfExportScope) => {
    const result = downloadOmrExamPdf({
      examTitle: examTitle || 'Evaluación Curricular Híbrida SEP NEM',
      schoolName: schoolName || 'Instituto Bilingüe IBIME',
      schoolShortName: schoolShortName || 'IBIME',
      cctCode: '15PPR3322G',
      campusName: 'Campus Montes (Sede Matriz & CCH UNAM)',
      schoolCycle: '2025-2026',
      groupName: groupName || '1°A Secundaria',
      notebookPage: notebookPage || 48,
      penaltyPerError,
      scope,
      selectedVariantCode,
      variants,
      batchReport
    });
    triggerBanner(
      `📥 Archivo PDF Oficial con Identidad Institucional generado en 0 Tokens: "${result.fileName}" (${result.pageCount} pág${result.pageCount > 1 ? 's' : ''} • ${(result.byteLength / 1024).toFixed(1)} KB).`
    );
  };

  const isIbimeSchool = useMemo(
    () => `${schoolName} ${schoolShortName}`.toUpperCase().includes('IBIME'),
    [schoolName, schoolShortName]
  );

  const detectedExamBlockTypes = useMemo(() => {
    const evalTypes = new Set<string>();
    studioBlocks.forEach((b) => {
      if (
        [
          'omr_optical_exam_block',
          'quiz_question',
          'historical_figure_block',
          'timed_reading_block',
          'drag_drop_match',
          'ordering_sequence',
          'fill_in_blanks',
          'boss_enemy',
          'interactive_hotspot_canvas',
          'interactive_whiteboard_math',
          'cornell_smart_notes',
          'exit_ticket_reflection',
          'socratic_debate_arena',
          'open_poll_wordcloud',
          'secret_code_puzzle',
          'checkpoint_gate',
          'languages_evaluation_rubric',
          'languages_karaoke_block',
          'languages_socratic_tutor',
          'languages_roleplay_mission',
          'languages_practice_portal'
        ].includes(b.type)
      ) {
        evalTypes.add(b.type);
      }
    });
    return Array.from(evalTypes);
  }, [studioBlocks]);

  if (!isOpen || typeof document === 'undefined') return null;

  const triggerBanner = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4000);
  };

  const handleRunOpticalScan = () => {
    setIsScanningAnimation(true);
    setTimeout(() => {
      setIsScanningAnimation(false);
      setActiveTab('psychometrics');
      triggerBanner(
        `📷 ¡Escaneo óptico OMR completado en ${batchReport.totalScanTimeMs}ms (0 Tokens)! ${batchReport.totalStudentsScanned} hojas calificadas con promedio ${batchReport.averageGrade10}.`
      );
    }, 850);
  };

  // Calcular puntaje en vivo de la hoja OMR interactiva
  const interactiveSheetScore = (() => {
    if (!activeVariant) return { hits: 0, total: 0, grade10: 10 };
    let pts = 0;
    let maxPts = 0;
    let hits = 0;
    activeVariant.questions.forEach((vq) => {
      maxPts += vq.points;
      const effectiveChoice = correctedBubbles[vq.variantQuestionNumber] || interactiveBubbles[vq.variantQuestionNumber];
      if (effectiveChoice === vq.correctOptionLetter) {
        pts += vq.points;
        hits++;
      } else if (effectiveChoice) {
        pts -= penaltyPerError;
      }
    });
    const clamped = Math.max(0, pts);
    return {
      hits,
      total: activeVariant.questions.length,
      grade10: maxPts > 0 ? Number(((clamped / maxPts) * 10).toFixed(1)) : 10
    };
  })();

  return createPortal(
    <div className="fixed inset-0 z-[9998] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Cabecera Ejecutiva Daylight */}
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isIbimeSchool ? (
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-amber-400 p-1 flex items-center justify-center shadow-md shrink-0">
                <img
                  src="/brand/ibime_logo.webp"
                  alt="Escudo Oficial Instituto Bilingüe IBIME"
                  className="w-9 h-9 object-contain"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 text-white flex items-center justify-center shadow-md shrink-0">
                <ScanLine className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  MÓDULO INTEGRAL DE EXÁMENES HÍBRIDOS & ESCÁNER OMR • 0 TOKENS IA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {schoolShortName} • {groupName}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  CCT SEP: 15PPR3322G • Ciclo 2025-2026
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {examTitle || 'Evaluación Curricular Híbrida (Papel OMR + Digital Bloqueado)'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunOpticalScan}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear Lote OMR (0.8s • 0 Tokens)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportPdf('single_variant')}
              title="Descargar archivo .PDF vectorial de la Fila seleccionada con Hoja Óptica OMR y Marcas Fiduciales"
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>PDF Fila {selectedVariantCode}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportPdf('all_4_variants_pack')}
              title="Descargar Paquete Maestro en un solo archivo .PDF multipágina (Filas A, B, C, D + Hoja de Claves del Docente)"
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>PDF 4 Filas (A-D) + Claves</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              aria-label="Cerrar suite de exámenes OMR"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {toastBanner && (
          <div className="bg-emerald-900 text-emerald-100 px-5 py-2.5 text-xs font-bold flex items-center justify-between border-b border-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastBanner}</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-800 text-emerald-300">
              Motor Determinista • 0 Tokens
            </span>
          </div>
        )}

        {/* Barra de Pestañas del Módulo de Exámenes */}
        <div className="bg-slate-100/90 dark:bg-zinc-850 px-5 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'variants'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-300/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>1. Generador de Variantes A/B/C/D & Reactivos ({questions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('omr_scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'omr_scanner'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-300/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>2. Hoja Óptica OMR & Corrección Limpia en Vivo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('psychometrics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'psychometrics'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-300/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Psicometría, Calificaciones & Sellado Kardex SEP</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-black">
              ⚡ Algoritmo Fisher-Yates & OMR Determinista: 0 Tokens
            </span>
          </div>
        </div>

        {/* CONTENIDO DE LAS 3 PESTAÑAS */}
        <div className="p-5 max-h-[78vh] overflow-y-auto">
          {/* ================================================================= */}
          {/* PESTAÑA 1: GENERADOR DE VARIANTES A/B/C/D Y BANCO DE REACTIVOS     */}
          {/* ================================================================= */}
          {activeTab === 'variants' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Columna Izquierda (5 cols): Controles de Variantes, Penalización y Banco */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                      Variantes Anti-Copia (1 Clic • 0 Tokens)
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      4 Filas Activas
                    </span>
                  </div>

                  {/* Selector de las 4 Filas A, B, C, D */}
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((v) => {
                      const isSel = v.variantCode === selectedVariantCode;
                      return (
                        <button
                          key={v.variantCode}
                          type="button"
                          onClick={() => setSelectedVariantCode(v.variantCode)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">Fila {v.variantCode}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isSel ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                              #{v.seed}
                            </span>
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isSel ? 'text-emerald-100' : 'text-slate-500'}`}>
                            Clave: {v.answerKey.map((k) => `${k.questionNumber}${k.correctLetter}`).join(' · ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Controles de Penalización y Modalidad Híbrida */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Penalización por respuesta errónea:</span>
                        <span className="font-mono font-black text-rose-600">-{penaltyPerError.toFixed(2)} pts</span>
                      </div>
                      <input
                        aria-label="Penalización por respuesta errónea"
                        type="range"
                        min={0}
                        max={0.5}
                        step={0.05}
                        value={penaltyPerError}
                        onChange={(e) => setPenaltyPerError(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shuffleQuestions}
                          onChange={(e) => setShuffleQuestions(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span>Barajar Preguntas</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shuffleOptions}
                          onChange={(e) => setShuffleOptions(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span>Barajar Incisos A-D</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Modalidad de Aplicación:</label>
                      <select
                        aria-label="Modalidad de aplicación del examen"
                        value={deliveryMode}
                        onChange={(e) => setDeliveryMode(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value="hybrid">Híbrido: Papel Impreso OMR + Enlace Digital Bloqueado</option>
                        <option value="paper_only">Solo Papel Impreso + Escaneo Óptico con Cámara</option>
                        <option value="digital_kiosk">Solo Examen Digital en Modo Kiosco Anti-Copia</option>
                      </select>
                    </div>
                  </div>

                  {/* Acciones de Sincronización con el Lienzo Studio */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const extracted = extractExamQuestionsFromStudioBlocks(studioBlocks, penaltyPerError);
                        setQuestions(extracted);
                        triggerBanner(`✅ ${extracted.length} reactivos extraídos automáticamente de los bloques de tu clase en 0 Tokens.`);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-black cursor-pointer transition-all"
                    >
                      🔄 Extraer de Bloques de Clase (0 Tokens)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newQ: ExamQuestionItem = {
                          id: `omr-custom-${Date.now()}`,
                          type: 'single_choice',
                          stem: `Nuevo reactivo curricular SEP #${questions.length + 1}: ¿Qué principio constitucional se fortaleció en esta etapa?`,
                          options: [
                            'La soberanía popular y división de poderes',
                            'El monopolio comercial virreinal',
                            'La centralización absolutista',
                            'El sistema de encomiendas'
                          ],
                          correctOptionIndex: 0,
                          points: 2,
                          penaltyPerError,
                          bloomLevel: 4,
                          pdaReference: 'NEM-SEP-2024',
                          explanation: 'Reactivo alineado al PDA oficial.'
                        };
                        const next = [...questions, newQ];
                        setQuestions(next);
                        onSaveQuestionsToBlock?.(next, penaltyPerError);
                        triggerBanner('➕ Nuevo reactivo añadido a las 4 variantes A/B/C/D.');
                      }}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Reactivo</span>
                    </button>
                  </div>
                </div>

                {/* Evaluador Determinista 0 Tokens para Pregunta Abierta */}
                <div className="bg-white dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-800">
                      ✍️ Calificador Determinista de Pregunta Abierta (0 Tokens)
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Puntaje: {openRubricEval.score} / 2.0 pts
                    </span>
                  </div>
                  <textarea
                    aria-label="Respuesta abierta del alumno para calificación determinista"
                    rows={2}
                    value={openAnswerSample}
                    onChange={(e) => setOpenAnswerSample(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2 font-medium">
                    {openRubricEval.feedback}
                  </div>
                </div>
              </div>

              {/* Columna Derecha (7 cols): Vista Previa Imprimible de la Variante Seleccionada + Clave */}
              <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4">
                {/* Cintillo Oficial de Identidad del Colegio (Idéntico al PDF Vectorial) */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border-2 border-amber-400/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    {isIbimeSchool ? (
                      <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-amber-300">
                        <img
                          src="/brand/ibime_logo.webp"
                          alt="Escudo Oficial Instituto Bilingüe IBIME"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black text-xs shrink-0 border border-amber-300">
                        {schoolShortName}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                          {schoolName} ({schoolShortName})
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-emerald-300">
                          CCT SEP: 15PPR3322G
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white leading-snug mt-0.5">
                        {examTitle || 'Examen Curricular'} — VARIANTE FILA {activeVariant.variantCode}
                      </h3>
                      <div className="text-[11px] text-slate-300 font-semibold">
                        Campus Montes (Sede Matriz &amp; CCH UNAM) • Grupo: {groupName} • Ciclo 2025-2026 • Sello Libreta Pág. {notebookPage}
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-center border border-emerald-400 shrink-0">
                    <div className="text-[9px] uppercase font-bold text-emerald-100">Versión Anti-Copia</div>
                    <div className="text-base font-black leading-none mt-0.5">FILA {activeVariant.variantCode}</div>
                    <div className="text-[9px] font-mono font-bold text-emerald-100 mt-0.5">{activeVariant.folioCode}</div>
                  </div>
                </div>

                {/* Indicador de Bloques de Examen Conectados y Layout Anti-Colisión PDF */}
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Layout PDF Vectorial 2 Columnas OMR Anti-Colisión • Sin texto sobrepuesto • Paginación Automática
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-[10px] font-black text-emerald-800">
                    {detectedExamBlockTypes.length > 0
                      ? `${detectedExamBlockTypes.length} tipos de bloque vinculados (${questions.length} reactivos únicos)`
                      : `${questions.length} reactivos curriculares activos`}
                  </span>
                </div>

                {/* Lista de Preguntas Barajadas para esta Variante */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {activeVariant.questions.map((vq) => (
                    <div
                      key={`${activeVariant.variantCode}-${vq.variantQuestionNumber}`}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-black text-slate-900 leading-snug">
                          {vq.variantQuestionNumber}. {vq.stem}
                        </p>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                          Clave {activeVariant.variantCode}: {vq.correctOptionLetter} ({vq.points} pts)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                        {vq.options.map((optText, oIdx) => {
                          const letter = (['A', 'B', 'C', 'D'] as const)[oIdx];
                          const isCorrect = letter === vq.correctOptionLetter;
                          return (
                            <div
                              key={letter}
                              className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="leading-tight">{optText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Matriz Rápida de Claves de Respuesta de la Variante */}
                <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-amber-300">
                    🔑 Hoja de Claves Oficial (Fila {activeVariant.variantCode}):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeVariant.answerKey.map((item) => (
                      <span
                        key={item.questionNumber}
                        className="px-2 py-0.5 rounded bg-white/15 text-xs font-mono font-black"
                      >
                        {item.questionNumber}:{item.correctLetter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: HOJA DE RESPUESTAS ÓPTICA OMR & CORRECCIÓN LIMPIA      */}
          {/* ================================================================= */}
          {activeTab === 'omr_scanner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Hoja Óptica OMR con Marcas Fiduciales y Alveolos Interactivos (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-900 p-5 relative overflow-hidden shadow-md">
                {/* 4 Marcas Fiduciales de Esquina para Escaneo de Cámara */}
                <div className="w-5 h-5 bg-slate-950 absolute top-3 left-3" />
                <div className="w-5 h-5 bg-slate-950 absolute top-3 right-3" />
                <div className="w-5 h-5 bg-slate-950 absolute bottom-3 left-3" />
                <div className="w-5 h-5 bg-slate-950 absolute bottom-3 right-3" />

                {/* Haz Láser de Escaneo Óptico cuando está activo */}
                {isScanningAnimation && (
                  <div className="absolute inset-x-0 top-1/2 h-2 bg-emerald-400 shadow-[0_0_25px_8px_rgba(16,185,129,0.85)] animate-pulse z-20" />
                )}

                <div className="px-6 py-2 space-y-4">
                  {/* Encabezado de la Hoja OMR con Identidad Oficial del Colegio */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      {isIbimeSchool ? (
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-400 p-1 flex items-center justify-center shrink-0">
                          <img
                            src="/brand/ibime_logo.webp"
                            alt="Escudo Oficial Instituto Bilingüe IBIME"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                          {schoolShortName}
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          HOJA DE LECTURA ÓPTICA OMR • {schoolName} • CCT: 15PPR3322G
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          Folio: {activeVariant.folioCode} • Variante Fila {activeVariant.variantCode}
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          Campus Montes • Ciclo 2025-2026 • Alumno en prueba: <strong className="text-slate-900">Santiago Gómez Pérez (#0248)</strong>
                        </p>
                      </div>
                    </div>

                    {/* QR Simulado y Calificación Instantánea */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                        <div className="text-[9px] font-black uppercase text-emerald-700">Nota OMR en Vivo</div>
                        <div className="text-lg font-black text-emerald-950">{interactiveSheetScore.grade10} / 10</div>
                        <div className="text-[9px] font-bold text-emerald-700">
                          {interactiveSheetScore.hits}/{interactiveSheetScore.total} aciertos
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-1">
                        <QrCode className="w-7 h-7" />
                        <span className="text-[7px] font-mono">OMR-{activeVariant.variantCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Matriz de Identificador de Estudiante (0-9) */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-700">
                        Identificador Codificado de Estudiante (Matrícula / N° Lista): #{studentIdDigits.join('')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">Asignación Automática a Kardex</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {studentIdDigits.map((digit, colIdx) => (
                        <div key={colIdx} className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                          <div className="text-[9px] font-bold text-slate-400 mb-1">Dígito {colIdx + 1}</div>
                          <div className="flex flex-wrap justify-center gap-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  const next = [...studentIdDigits];
                                  next[colIdx] = num;
                                  setStudentIdDigits(next);
                                }}
                                className={`w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center cursor-pointer ${
                                  digit === num
                                    ? 'bg-slate-900 text-white'
                                    : 'border border-slate-300 text-slate-500 hover:border-slate-500'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matriz de Alveolos de Respuesta (A B C D) + Columna de Corrección Limpia */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 px-2">
                      <span>Reactivo & Alveolos Principales (A · B · C · D)</span>
                      <span>Casilla de Corrección Limpia (Sin Anular Hoja)</span>
                    </div>

                    {activeVariant.questions.map((vq) => {
                      const qNum = vq.variantQuestionNumber;
                      const marked = interactiveBubbles[qNum];
                      const corrected = correctedBubbles[qNum] || null;
                      const effective = corrected || marked;
                      const isHit = effective === vq.correctOptionLetter;

                      return (
                        <div
                          key={qNum}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                        >
                          {/* Alveolos Principales */}
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 text-xs font-black text-slate-900">{qNum}.</span>
                            <div className="flex items-center gap-1.5">
                              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                                const isMarked = marked === letter;
                                const isCrossedOut = isMarked && corrected !== null;
                                return (
                                  <button
                                    key={letter}
                                    type="button"
                                    onClick={() => {
                                      setInteractiveBubbles((prev) => ({ ...prev, [qNum]: letter }));
                                      setCorrectedBubbles((prev) => ({ ...prev, [qNum]: null }));
                                    }}
                                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                                      isCrossedOut
                                        ? 'bg-rose-200 text-rose-800 line-through border-2 border-rose-500'
                                        : isMarked
                                          ? 'bg-slate-900 text-white shadow-xs'
                                          : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-emerald-500'
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Casilla de Corrección Limpia (Permite corregir un error de marcaje) */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400">Corregir:</span>
                            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                              const isCorr = corrected === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() =>
                                    setCorrectedBubbles((prev) => ({
                                      ...prev,
                                      [qNum]: prev[qNum] === letter ? null : letter
                                    }))
                                  }
                                  className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${
                                    isCorr
                                      ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-2xs'
                                      : 'bg-white border border-dashed border-slate-300 text-slate-400 hover:text-slate-700'
                                  }`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                            <span
                              className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black ${
                                isHit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isHit ? '✓ Correcta' : `✗ Clave ${vq.correctOptionLetter}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Panel Derecho (5 cols): Instrucciones de Escaneo Óptico y Ventajas 0 Tokens */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-zinc-850 rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <h4 className="text-sm font-black text-slate-900">
                    📷 Escáner Óptico Instantáneo con Corrección Limpia
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Haz clic en cualquier alveolo <strong>(A, B, C, D)</strong> para simular el rellenado del alumno. Si el estudiante se equivoca en papel, tacha el círculo y marca la <strong>Casilla de Corrección</strong> a la derecha sin invalidar su hoja.
                  </p>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                    <div className="font-black text-emerald-900">
                      ⚡ Velocidad de Procesamiento de Aula:
                    </div>
                    <ul className="space-y-1 text-[11px] text-emerald-800 font-medium list-disc pl-4">
                      <li>Reconoce automáticamente la variante (Fila A, B, C o D) por el código QR.</li>
                      <li>Vincula la nota al alumno mediante los 4 dígitos de matrícula/lista.</li>
                      <li>Califica un grupo completo en <strong>menos de 1 segundo</strong> consumiendo <strong>0 Tokens</strong>.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunOpticalScan}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Simular Escaneo Óptico de Todo el Salón Ahora (0 Tokens)</span>
                  </button>

                  {/* Botonera de Exportación PDF Nativa (0 Tokens) */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      📄 Exportación en Formato PDF Vectorial (0 Tokens):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExportPdf('single_variant')}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Descargar PDF: Hoja OMR + Examen Fila {activeVariant.variantCode}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPdf('all_4_variants_pack')}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Descargar Paquete PDF: 4 Filas (A, B, C, D) + Claves</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPdf('teacher_answer_key')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Solo Hoja Maestra de Claves Docente (.PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 3: PSICOMETRÍA DE REACTIVOS, KARDEX SEP & ESPEJO CEO      */}
          {/* ================================================================= */}
          {activeTab === 'psychometrics' && (
            <div className="space-y-5">
              {/* Tarjetas de Resumen Grupal */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400">Promedio Grupal SEP</span>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">{batchReport.averageGrade10} / 10</div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {batchReport.totalStudentsScanned} hojas OMR procesadas
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400">Tasa de Aprobación</span>
                  <div className="text-2xl font-black text-indigo-700 mt-0.5">{batchReport.approvalRatePercent}%</div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Tiempo de cómputo: {batchReport.totalScanTimeMs}ms (0 Tokens)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reactivo con Mayor Oportunidad de Refuerzo:</span>
                  </div>
                  <div className="text-xs font-black text-amber-950 mt-1 line-clamp-1">
                    {batchReport.hardestQuestion?.stem || 'Sin alertas críticas'}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    Índice de acierto: {batchReport.hardestQuestion?.correctRatePercent ?? 80}% • Distractor frecuente:{' '}
                    {batchReport.hardestQuestion?.mostFrequentDistractor}
                  </div>
                </div>
              </div>

              {/* Psicometría por Reactivo + Acciones de Kardex SEP */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    📊 Análisis Psicométrico por Reactivo (Normalizado A/B/C/D)
                  </h4>
                  <div className="space-y-2.5">
                    {batchReport.itemPsychometrics.map((item, idx) => (
                      <div key={item.originalQuestionId} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 truncate max-w-[230px]">
                            R{idx + 1}. {item.stem}
                          </span>
                          <span className="font-mono font-black text-emerald-700">{item.correctRatePercent}% acierto</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${item.correctRatePercent}%` }}
                            className={`h-full rounded-full ${
                              item.correctRatePercent >= 80
                                ? 'bg-emerald-500'
                                : item.correctRatePercent >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onStampAndSyncKardex?.(batchReport);
                        triggerBanner(
                          `💮 ¡Calificaciones selladas en Kardex SEP (Pág. ${notebookPage}), Magic Links enviados a padres y promedio ${batchReport.averageGrade10} sincronizado con el Espejo Ejecutivo CEO!`
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Award className="w-4 h-4" />
                      <span>💮 Sellar Calificaciones en Kardex SEP (Pág. {notebookPage}) & Enviar Magic Links</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportPdf('psychometrics_kardex_report')}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>📄 Descargar Acta Oficial de Calificaciones &amp; Psicometría en PDF</span>
                    </button>
                  </div>
                </div>

                {/* Tabla de Resultados por Estudiante (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      📋 Padrón de Alumnos Calificados por Escáner OMR
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700">
                      Variantes A, B, C y D conciliadas automáticamente
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                          <th className="py-2 px-3">N° / Alumno</th>
                          <th className="py-2 px-2">Fila</th>
                          <th className="py-2 px-2">Aciertos</th>
                          <th className="py-2 px-2">Correcciones</th>
                          <th className="py-2 px-3 text-right">Nota SEP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {batchReport.studentResults.map((stu) => (
                          <tr key={stu.studentId} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-800">
                              #{String(stu.listNumber).padStart(2, '0')} · {stu.studentName}
                            </td>
                            <td className="py-2 px-2">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono font-black text-[10px]">
                                Fila {stu.variantCode}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-semibold text-slate-700">
                              {stu.correctCount}/{stu.correctCount + stu.incorrectCount + stu.blankCount}
                            </td>
                            <td className="py-2 px-2 text-[11px] text-amber-700 font-semibold">
                              {stu.correctedBubblesCount > 0 ? `${stu.correctedBubblesCount} limpia(s)` : '—'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-lg font-black ${
                                  stu.finalGrade10 >= 9
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : stu.finalGrade10 >= 8
                                      ? 'bg-sky-100 text-sky-900'
                                      : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {stu.finalGrade10.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

