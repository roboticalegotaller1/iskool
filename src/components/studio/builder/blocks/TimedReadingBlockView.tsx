"use client";

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TimedReadingBlock, ComprehensionQuestion } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { GrimorioTimedReadingPlayer } from '../../player/GrimorioTimedReadingPlayer';
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
  FileCheck,
  Play,
  X,
  Type,
  Image as ImageIcon,
  Compass
} from 'lucide-react';

interface Props {
  block: TimedReadingBlock;
}

// Textos de ejemplo para pruebas rápidas docentes con láminas ilustradas completas
const SAMPLE_READINGS = [
  {
    title: 'El Misterio Cinético del Calor',
    chapterTitle: 'El Misterio Cinético del Calor',
    discipline: 'FÍSICA ARCANO-TÉRMICA',
    faseNem: 'NEM FASE 6 · SABER FUNDAMENTAL',
    text: `En las profundidades del universo observable, la materia jamás reposa en absoluto estatismo. Lo que los antiguos hechiceros llamaban Fuego Primordial, los sabios contemporáneos de la física corpuscular lo conciben como la agitación molecular incesante.

La Temperatura no constituye un fluido corpóreo ni una sustancia misteriosa (como sugería el arcaico principio del calórico), sino la manifestación directa de la energía cinética promedio que poseen las partículas microscópicas en su ininterrumpida danza de choque y vibración.

![Lámina Científica: Teoría Cinética del Calor y Flujo Térmico](/images/studio/calor_termodinamica_folio.jpg)

Cuando dos cuerpos a distintas temperaturas entran en contacto térmico, el flujo espontáneo de energía siempre viaja desde la región de mayor excitación molecular hacia la de menor agitación, hasta alcanzar la perfecta quietud del Equilibrio Térmico (Te).

Al comprender que el calor representa la transferencia energética derivada de un desbalance térmico, el explorador reorganiza las colisiones moleculares de su entorno hacia el equilibrio dinámico y el dominio científico.`,
    time: 60,
    questions: [
      {
        question: '¿Qué es la Temperatura según la física corpuscular?',
        options: ['La energía cinética promedio de las partículas microscópicas', 'Un fluido misterioso llamado calórico', 'La masa atómica estática', 'Una vibración gravitacional sin materia'],
        correctIndex: 0,
        explanation: 'Refleja la agitación molecular incesante y la energía cinética promedio de las partículas.'
      },
      {
        question: '¿Hacia qué dirección viaja el flujo espontáneo de calor entre dos cuerpos?',
        options: ['Desde el cuerpo de menor agitación al de mayor agitación', 'Desde la región de mayor excitación molecular hacia la de menor agitación', 'Permanece invariable', 'Solo en el vacío interestelar'],
        correctIndex: 1,
        explanation: 'El calor siempre se transfiere espontáneamente del sistema más caliente (mayor agitación) al más frío.'
      },
      {
        question: '¿Cómo se denomina el estado donde cesa la transferencia neta de calor?',
        options: ['Entropía Absoluta', 'Equilibrio Térmico (Te)', 'Fluido Crítico', 'Calórico Residual'],
        correctIndex: 1,
        explanation: 'En el equilibrio térmico ambos cuerpos igualan su energía cinética media.'
      }
    ]
  },
  {
    title: 'El Gran Eclipse Solar y la Corona',
    chapterTitle: 'La Danza de las Sombras Celestes',
    discipline: 'ASTRONOMÍA & CIENCIAS',
    faseNem: 'NEM FASE 5 · FENÓMENOS NATURALES',
    text: `Un eclipse solar total ocurre cuando la Luna pasa directamente entre el Sol y la Tierra, bloqueando completamente la luz solar directa sobre una estrecha franja de la superficie terrestre.

Durante este fenómeno astronómico extraordinario, el disco solar queda oculto y el día se transforma momentáneamente en un crepúsculo estrellado donde la temperatura ambiental desciende de forma perceptible.

![Carta Astronómica: Corona Solar y Mecánica Celeste](/images/studio/sistema_solar_folio.jpg)

Es en ese instante de totalidad cuando la corona solar, la atmósfera exterior del astro rey compuesta de plasma a millones de grados centígrados, se hace visible a simple vista como un anillo brillante de filamentos resplandecientes.`,
    time: 60,
    questions: [
      {
        question: '¿Qué cuerpo celeste bloquea la luz del Sol durante un eclipse total?',
        options: ['La Luna', 'Marte', 'Júpiter', 'Venus'],
        correctIndex: 0,
        explanation: 'La Luna se interpone en la línea visual exacta entre la Tierra y el Sol.'
      },
      {
        question: '¿Qué parte del Sol se hace visible durante la totalidad del eclipse?',
        options: ['La corona solar', 'El núcleo solar', 'Las manchas solares', 'La fotosfera interna'],
        correctIndex: 0,
        explanation: 'La corona solar se aprecia como un halo blanco brillante de plasma alrededor de la silueta lunar.'
      }
    ]
  },
  {
    title: 'El Asombroso Ajolote de Xochimilco',
    chapterTitle: 'El Secreto Biológico de la Regeneración',
    discipline: 'BIOLOGÍA & ECOSISTEMAS',
    faseNem: 'NEM FASE 4 · BIODIVERSIDAD',
    text: `El ajolote (Ambystoma mexicanum) es una especie endémica de la cuenca lacustre del Valle de México, símbolo vivo de la riqueza ecológica y cultural de los canales ancestrales de Xochimilco.

A diferencia de otros anfibios que completan su metamorfosis hacia la vida terrestre, el ajolote conserva sus rasgos larvales durante toda su vida adulta, un fenómeno evolutivo conocido como neotenia.

![Grabado Naturalista: Anatomía y Hábitat del Ambystoma Mexicanum](/images/studio/ajolote_antiguo_folio.jpg)

Su rasgo biológico más fascinante es su asombrosa capacidad de regenerar extremidades completas, branquias externas, órganos vitales e incluso fragmentos de su tejido cardíaco y cerebral sin dejar cicatrices.`,
    time: 60,
    questions: [
      {
        question: '¿De qué ecosistema lacustre es endémico el ajolote?',
        options: ['Canales de Xochimilco', 'Selva Lacandona', 'Desierto de Sonora', 'Cañón del Sumidero'],
        correctIndex: 0,
        explanation: 'Es originario exclusivamente del sistema lacustre de Xochimilco en México.'
      },
      {
        question: '¿Cuál es la capacidad biológica más sorprendente del ajolote?',
        options: ['Regenerar órganos y extremidades completas sin cicatrices', 'Volar sobre el agua', 'Hibernar durante siglos', 'Cambiar de especie según la estación'],
        correctIndex: 0,
        explanation: 'Posee una capacidad única de regenerar tejidos celulares complejos de órganos y extremidades.'
      }
    ]
  }
];

export const TimedReadingBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { 
    readingText = '', 
    timeLimitSeconds = 60, 
    comprehensionQuestions = [],
    chapterTitle = '',
    faseNem = '',
    discipline = '',
    pedagogicalAxiom = '',
    pedagogicalAxiomTitle = ''
  } = block.data;
  const [showStudentPreview, setShowStudentPreview] = useState<boolean>(false);

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    comprehensionQuestions[0]?.id || null
  );

  // Conteo automático de palabras reales (excluyendo markdown de imágenes)
  const currentWordCount = useMemo(() => {
    const clean = readingText.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    if (!clean) return 0;
    return clean.split(/\s+/).filter(Boolean).length;
  }, [readingText]);

  // Detección automática de láminas e imágenes insertadas
  const detectedImagesCount = useMemo(() => {
    const matches = readingText.match(/!\[.*?\]\(.*?\)/g);
    return matches ? matches.length : 0;
  }, [readingText]);

  // Estimación de páginas/folios generados en automático
  const estimatedFoliosCount = useMemo(() => {
    const cleanParagraphs = readingText
      .split(/!\[.*?\]\(.*?\)/g)
      .flatMap(chunk => chunk.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean));
    const textFolios = Math.max(1, Math.ceil(cleanParagraphs.length / 2));
    return textFolios + detectedImagesCount;
  }, [readingText, detectedImagesCount]);

  // Cálculo de velocidad requerida en PPM
  const estimatedPpm = useMemo(() => {
    if (!currentWordCount || timeLimitSeconds <= 0) return 0;
    const minutes = timeLimitSeconds / 60;
    return Math.round(currentWordCount / minutes);
  }, [currentWordCount, timeLimitSeconds]);

  const handleTextChange = (text: string) => {
    const clean = text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    const count = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    updateBlockData(block.id, {
      readingText: text,
      wordCount: count
    });
  };

  const handleLoadSample = (sample: typeof SAMPLE_READINGS[0]) => {
    const clean = sample.text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    const count = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    updateBlockData(block.id, {
      readingText: sample.text,
      wordCount: count,
      timeLimitSeconds: sample.time,
      chapterTitle: sample.chapterTitle,
      discipline: sample.discipline,
      faseNem: sample.faseNem,
      comprehensionQuestions: sample.questions.map((q, idx) => ({
        id: `q-sample-${Date.now()}-${idx}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }))
    });
  };

  // Inserción de una lámina ilustrada de hoja completa
  const handleInsertImage = (url: string, caption: string) => {
    const imageMarkdown = `\n\n![${caption}](${url})\n\n`;
    const newText = readingText ? `${readingText.trimEnd()}${imageMarkdown}` : imageMarkdown.trim();
    handleTextChange(newText);
  };

  const handlePromptCustomImage = () => {
    const url = window.prompt('Pega la URL de la imagen o recurso visual pedagógico:');
    if (!url) return;
    const caption = window.prompt('Título o descripción pedagógica de la lámina:') || 'Lámina Curricular Ilustrada';
    handleInsertImage(url.trim(), caption.trim());
  };

  // Gestión de preguntas de comprensión
  const handleAddQuestion = () => {
    const newQ: ComprehensionQuestion = {
      id: `q-${Date.now()}`,
      question: '¿Qué afirmación resume la idea central del fragmento?',
      options: [
        'Opción correcta con sustento textual',
        'Distractor verosímil 1',
        'Distractor verosímil 2',
        'Distractor opuesto'
      ],
      correctIndex: 0,
      explanation: 'Sustentado en el párrafo principal del texto.'
    };
    updateBlockData(block.id, {
      comprehensionQuestions: [...comprehensionQuestions, newQ]
    });
    setExpandedQuestionId(newQ.id);
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<ComprehensionQuestion>) => {
    const nextList = comprehensionQuestions.map(q => q.id === qId ? { ...q, ...updates } : q);
    updateBlockData(block.id, { comprehensionQuestions: nextList });
  };

  const handleRemoveQuestion = (qId: string) => {
    const nextList = comprehensionQuestions.filter(q => q.id !== qId);
    updateBlockData(block.id, { comprehensionQuestions: nextList });
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(nextList[0]?.id || null);
    }
  };

  const handleAddOptionToQuestion = (qId: string) => {
    const targetQ = comprehensionQuestions.find(q => q.id === qId);
    if (!targetQ || targetQ.options.length >= 5) return;
    const nextOptions = [...targetQ.options, `Nueva opción ${targetQ.options.length + 1}`];
    handleUpdateQuestion(qId, { options: nextOptions });
  };

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
      
      {/* Botón de Acceso Directo para que el Docente Pruebe la Experiencia del Alumno */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
              Vista del Alumno Gamificada
            </span>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              Grimorio Arcano &amp; Combate RPG
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowStudentPreview(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer transform active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>Probar como Alumno</span>
        </button>
      </div>

      {/* =========================================================================
          CAMPOS DE TÍTULO Y METADATOS ESCRITOS DEL CAPÍTULO (REQUERIMIENTO 1)
          ========================================================================= */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-750 space-y-2.5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-500" />
              <span>Título del Capítulo / Lectura:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Aparecerá escrito en el Grimorio
            </span>
          </label>
          <input
            type="text"
            value={chapterTitle || block.title || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateBlockData(block.id, { chapterTitle: val });
            }}
            placeholder="Ej: El Misterio Cinético del Calor..."
            className="w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-teal-500" />
              <span>Disciplina / Folio:</span>
            </label>
            <input
              type="text"
              value={discipline || 'FÍSICA ARCANO-TÉRMICA'}
              onChange={(e) => updateBlockData(block.id, { discipline: e.target.value })}
              placeholder="Ej: FÍSICA ARCANO-TÉRMICA"
              className="w-full px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Fase Curricular NEM:</span>
            </label>
            <input
              type="text"
              value={faseNem || 'NEM FASE 6 · SABER FUNDAMENTAL'}
              onChange={(e) => updateBlockData(block.id, { faseNem: e.target.value })}
              placeholder="Ej: NEM FASE 6"
              className="w-full px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Barra Superior de Métricas en Tiempo Real */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-blue-950/60 dark:to-emerald-950/40 border border-teal-200/70 dark:border-teal-800/60 shadow-xs">
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
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-teal-100 dark:border-teal-900/40 text-center shadow-2xs">
          <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Tiempo</span>
          </div>
          <select aria-label="Seleccionar opción"
            value={timeLimitSeconds}
            onChange={(e) => updateBlockData(block.id, { timeLimitSeconds: Number(e.target.value) })}
            className="text-xs font-black text-teal-700 dark:text-teal-300 bg-transparent focus:outline-none cursor-pointer mt-0.5"
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

      {/* =========================================================================
          HERRAMIENTA PARA INCLUIR LÁMINAS DE HOJA COMPLETA (REQUERIMIENTO 4)
          ========================================================================= */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-black text-amber-900 dark:text-amber-200">
              Láminas Ilustradas de Hoja Completa:
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
            Cubren una página completa
          </span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
          Inserta grabados antiguos o diagramas científicos en cualquier parte del texto. El sistema detectará las imágenes y creará en automático las páginas necesarias para el documento.
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <button
            type="button"
            onClick={() => handleInsertImage('/images/studio/calor_termodinamica_folio.jpg', 'Lámina Científica: Teoría Cinética del Calor y Flujo Térmico')}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
            title="Insertar Lámina de Termodinámica"
          >
            + Lámina Termodinámica
          </button>
          <button
            type="button"
            onClick={() => handleInsertImage('/images/studio/ajolote_antiguo_folio.jpg', 'Grabado Naturalista: Anatomía y Hábitat del Ambystoma Mexicanum')}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
            title="Insertar Grabado del Ajolote"
          >
            + Grabado Ajolote
          </button>
          <button
            type="button"
            onClick={() => handleInsertImage('/images/studio/sistema_solar_folio.jpg', 'Carta Astronómica: Corona Solar y Mecánica Celeste')}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
            title="Insertar Carta Celeste"
          >
            + Carta Celeste
          </button>
          <button
            type="button"
            onClick={handlePromptCustomImage}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer shadow-2xs"
            title="Pegar URL de Imagen Propia"
          >
            + Pegar URL
          </button>
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
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 hover:bg-teal-100 transition-all cursor-pointer"
                title={`Cargar lectura de ejemplo: ${sample.title}`}
              >
                {sample.title.split(' ')[1] || sample.title}
              </button>
            ))}
          </div>
        </div>

        <textarea aria-label="Pega aquí el fragmento, cuento, artículo o texto científico que el alumno leerá con cronómetro..."
          rows={6}
          value={readingText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Pega aquí el texto que el alumno leerá en el Grimorio. Puedes insertar imágenes con el botón superior para crear láminas de página completa..."
          className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-y transition-all font-mono"
        />

        {/* Indicador de Paginación Inteligente Detectada */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 px-1 pt-0.5">
          <span className="flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Paginación Automática: {estimatedFoliosCount} folios ({detectedImagesCount} láminas completas)</span>
          </span>
          {readingText && (
            <button
              type="button"
              onClick={() => handleTextChange('')}
              className="text-rose-500 hover:underline cursor-pointer font-bold text-[10px]"
            >
              Borrar texto
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          AXIOMA PEDAGÓGICO / CLAVE DE RETENCIÓN (CONFIGURABLE POR EL DOCENTE)
          Solo se mostrará en el libro si el profesor redacta un contenido.
          ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>Axioma o Clave de Retención Pedagógica</span>
                <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.2 rounded-md">
                  Opcional
                </span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Esta sección solo aparecerá en el libro si la redactas. Si la dejas vacía, no se mostrará al alumno.
              </p>
            </div>
          </div>

          {pedagogicalAxiom && (
            <button
              type="button"
              onClick={() => updateBlockData(block.id, { pedagogicalAxiom: '', pedagogicalAxiomTitle: '' })}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Quitar sección
            </button>
          )}
        </div>

        <div className="space-y-2 pt-1 border-t border-amber-200/50 dark:border-amber-900/30">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center justify-between">
              <span>Título del Encabezado (Opcional):</span>
              <span className="text-[9px] text-slate-400 font-normal">Por defecto: Axioma de Comprensión Pedagógica</span>
            </label>
            <input
              type="text"
              value={pedagogicalAxiomTitle || ''}
              onChange={(e) => updateBlockData(block.id, { pedagogicalAxiomTitle: e.target.value })}
              placeholder="Ej: Axioma de Comprensión Pedagógica (o Clave de Retención)"
              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">
              Contenido del Axioma o Nota Destacada:
            </label>
            <textarea
              rows={2}
              value={pedagogicalAxiom || ''}
              onChange={(e) => updateBlockData(block.id, { pedagogicalAxiom: e.target.value })}
              placeholder="Escribe la clave pedagógica o postulado memorable que el alumno verá enmarcado en el libro... (Dejar en blanco si no deseas que aparezca)"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          </div>
        </div>
      </div>

      {/* Sección de Preguntas de Comprensión */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Preguntas de Comprensión ({comprehensionQuestions.length})</span>
          </label>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Pregunta</span>
          </button>
        </div>

        {comprehensionQuestions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/60 border border-dashed border-slate-200 dark:border-zinc-750 text-center space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No hay preguntas de comprensión configuradas aún.
            </p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              + Añadir primera pregunta de comprensión
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {comprehensionQuestions.map((q, qIndex) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 overflow-hidden shadow-2xs transition-all"
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuestion(q.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-3 bg-slate-50/40 dark:bg-zinc-900/30">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          Enunciado del Reactivo:
                        </label>
                        <input aria-label="Escribe la pregunta sobre el texto leído..."
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                          placeholder="Escribe la pregunta sobre el texto leído..."
                          className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            Opciones (Selecciona la correcta con el check verde):
                          </label>
                          {q.options.length < 5 && (
                            <button
                              type="button"
                              onClick={() => handleAddOptionToQuestion(q.id)}
                              className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                            >
                              + Añadir Opción
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctIndex === optIdx;
                            const letter = String.fromCharCode(65 + optIdx);

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                                  isCorrect 
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
                                    : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(q.id, { correctIndex: optIdx })}
                                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                                    isCorrect 
                                      ? 'bg-emerald-600 text-white shadow-2xs' 
                                      : 'bg-slate-100 dark:bg-zinc-750 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                                  }`}
                                  title={isCorrect ? 'Opción correcta' : 'Marcar como correcta'}
                                >
                                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : letter}
                                </button>

                                <input aria-label={`Opción ${letter}`}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...q.options];
                                    next[optIdx] = e.target.value;
                                    handleUpdateQuestion(q.id, { options: next });
                                  }}
                                  className="flex-1 bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
                                />

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(q.id, optIdx)}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                                    title="Eliminar opción"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-blue-500" />
                          <span>Retroalimentación pedagógica explicativa:</span>
                        </label>
                        <input aria-label="Por qué esta respuesta es la correcta..."
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

      {/* Modal de Simulación Directa del Alumno (Grimorio Arcano) */}
      {showStudentPreview && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-6xl my-auto animate-scale-in">
            <GrimorioTimedReadingPlayer
              block={block}
              onClose={() => setShowStudentPreview(false)}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
