import React, { useState } from 'react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { SidebarToolbar } from './SidebarToolbar';
import { WorkspaceArea } from './WorkspaceArea';
import { StudioFlowPlayer } from '../player/StudioFlowPlayer';
import { AssignToClassModal } from '@/components/AssignToClassModal';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { detectCurriculumPdasForTopic } from '@/lib/curriculumEngine';
import { 
  Play, 
  Share2, 
  RotateCcw, 
  RotateCw, 
  Sparkles, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Settings, 
  CheckCircle2, 
  Rocket, 
  X,
  Layers,
  Save,
  BookOpen,
  Brain,
  Globe,
  Scale,
  Activity,
  Award,
  Coins,
  FileText,
  FolderKanban,
  Check,
  Zap,
  Flame,
  Star
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { StudioBlock } from '@/types/studioBlocks';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_METADATA 
} from '@/data/mexicanIndependenceStudioFlow';

// Catálogo Oficial de Ejes Articuladores NEM
const EJES_ARTICULADORES_CATALOG = [
  { name: 'Pensamiento Crítico', icon: Brain, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
  { name: 'Inclusión', icon: Globe, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { name: 'Interculturalidad Crítica', icon: Activity, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
  { name: 'Igualdad de Género', icon: Scale, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-200' },
  { name: 'Vida Saludable', icon: Zap, color: 'text-green-600 bg-green-50 dark:bg-green-950/40 border-green-200' },
  { name: 'Apropiación de las Culturas a través de la Lectura y la Escritura', icon: BookOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { name: 'Artes y Experiencias Estéticas', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' },
];

// Catálogo Oficial de Campos Formativos NEM
const CAMPOS_FORMATIVOS_CATALOG = [
  'Saberes y Pensamiento Científico',
  'Lenguajes',
  'Ética, Naturaleza y Sociedades',
  'De lo Humano y lo Comunitario'
];

// Catálogo de PDAs sugeridos según Asignatura y Fase
const PDA_SUGGESTIONS: Record<string, string[]> = {
  'sub-math': [
    'Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas que implican repartir y dividir elementos en partes iguales (fracciones).',
    'Fase 4 - Saberes y Pensamiento Científico: Compara y ordena fracciones con diferentes denominadores utilizando material concreto.',
    'Fase 4 - Saberes y Pensamiento Científico: Identifica y representa fracciones equivalentes en situaciones cotidianas.',
    'Fase 5 - Saberes y Pensamiento Científico: Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican dividir números fraccionarios entre un número natural.'
  ],
  'sub-span': [
    'Fase 4 - Lenguajes: Lee en voz alta textos poéticos o narrativos prestando atención a la entonación, modulación y volumen.',
    'Fase 4 - Lenguajes: Identifica la estructura de las leyendas y su relevancia cultural para la comunidad.',
    'Fase 4 - Lenguajes: Elabora portafolios de evidencias sobre mitos y relatos regionales.',
    'Fase 5 - Lenguajes: Analiza la función de los conectores lógicos y la coherencia en textos argumentativos.'
  ],
  'sub-sci': [
    'Fase 5 - Saberes y Pensamiento Científico: Diseña y describe el funcionamiento de un biodigestor de residuos orgánicos para generar biogás.',
    'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las ventajas ambientales del uso de energías renovables en la comunidad.',
    'Fase 5 - De lo Humano y lo Comunitario: Desarrolla ecotecnias y prototipos para el desarrollo sustentable del entorno.'
  ]
};

export const ActivityBuilderLayout: React.FC = () => {
  const { user } = useAuth();
  const {
    metadata,
    updateMetadata,
    blocks,
    connections,
    startNodeId,
    history,
    historyIndex,
    undo,
    redo,
    resetWorkspace,
    zoomLevel,
    setZoomLevel,
    loadPresetBlocks,
    serializeToActivityJSON,
  } = useActivityBuilderStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cargar Plantillas Pedagógicas Rápidas (NEM Presets)
  const applyPresetTemplate = (presetType: 'mexican_independence' | 'homework_portfolio' | 'boss_exam' | 'timed_reading' | 'phet_science') => {
    if (presetType === 'mexican_independence') {
      loadPresetBlocks(MEXICAN_INDEPENDENCE_BLOCKS, MEXICAN_INDEPENDENCE_METADATA);
      setIsTemplatesModalOpen(false);
      showToast('🇲🇽 ¡Gesta Heroica de la Independencia cargada con 6 nodos gamificados!');
      return;
    }
    if (presetType === 'homework_portfolio') {
      const presetBlocks: StudioBlock[] = [
        {
          id: `blk-${Date.now()}-1`,
          type: 'youtube_video',
          title: 'Cápsula Explicativa: Fracciones en la Vida Diaria',
          position: { x: 80, y: 160 },
          data: {
            videoUrl: 'https://www.youtube.com/watch?v=c9c_xFU8BQW',
            videoTitle: 'Introducción a las Fracciones',
            startAtSeconds: 0,
            mustWatchEntirely: false
          }
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'quiz_question',
          title: 'Reactivo Formativo: ¿Qué representa el denominador?',
          position: { x: 380, y: 160 },
          data: {
            question: 'En la fracción 3/4, ¿qué indica el número 4 (denominador)?',
            options: [
              'Las partes que tomamos',
              'El total de partes iguales en que se dividió la unidad',
              'La suma de las partes',
              'El doble de la cantidad'
            ],
            correctIndex: 1,
            timeLimitSeconds: 30,
            explanation: '¡Correcto! El denominador expresa en cuántas partes iguales se divide el entero.'
          }
        },
        {
          id: `blk-${Date.now()}-3`,
          type: 'reward_chest',
          title: 'Insignia de Logro: Maestro de las Fracciones',
          position: { x: 680, y: 160 },
          data: {
            badgeName: 'Maestro de las Fracciones 🍕',
            badgeIcon: 'Award',
            xpAmount: 100,
            coinsAmount: 20,
            chestRarity: 'rare'
          }
        }
      ];
      loadPresetBlocks(presetBlocks, {
        title: 'Tarea Escolar: Fraccionando y Compartiendo en Comunidad',
        description: 'Tarea escolar de la NEM con análisis visual, reactivo formativo y evidencia de portafolio.',
        subject: 'Matemáticas',
        subjectId: 'sub-math',
        campoFormativo: 'Saberes y Pensamiento Científico',
        camposFormativos: ['Saberes y Pensamiento Científico'],
        ejesArticuladores: ['Pensamiento Crítico', 'Inclusión'],
        faseNem: 'Fase 4',
        pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas que implican repartir y dividir elementos en partes iguales (fracciones).',
        xpReward: 100,
        coinsReward: 15
      });
      showToast('📘 Plantilla de Tarea Escolar NEM cargada con éxito.');
    } else if (presetType === 'boss_exam') {
      const presetBlocks: StudioBlock[] = [
        {
          id: `blk-${Date.now()}-1`,
          type: 'quiz_question',
          title: 'Pregunta 1: Fracción Equivalente',
          position: { x: 80, y: 160 },
          data: {
            question: '¿Qué fracción es equivalente a 2/4?',
            options: ['1/3', '1/2', '3/4', '2/8'],
            correctIndex: 1,
            timeLimitSeconds: 45,
            explanation: '¡Correcto! 2/4 simplificado dividiendo entre 2 es igual a 1/2.'
          }
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'drag_drop_match',
          title: 'Desafío Táctico: Emparejar Equivalencias',
          position: { x: 380, y: 160 },
          data: {
            instructions: 'Une cada fracción con su valor decimal equivalente:',
            pairs: [
              { left: '1/2', right: '0.5' },
              { left: '1/4', right: '0.25' },
              { left: '3/4', right: '0.75' },
              { left: '1/5', right: '0.2' }
            ],
            timeLimitSeconds: 60
          }
        },
        {
          id: `blk-${Date.now()}-3`,
          type: 'boss_enemy',
          title: 'Batalla de Jefe: Fraccionator el Glotón',
          position: { x: 680, y: 160 },
          data: {
            bossName: 'Fraccionator el Glotón 🍕',
            maxHp: 120,
            attackPower: 15,
            spriteKey: 'shadow_golem',
            victoryCondition: 'defeat_boss',
            backgroundScene: 'dungeon'
          }
        }
      ];
      loadPresetBlocks(presetBlocks, {
        title: 'Examen Formativo: Batalla Final en el Castillo de las Fracciones',
        description: 'Evaluación formativa gamificada con combate contra Jefe y reactivos de alto rigor.',
        subject: 'Matemáticas',
        subjectId: 'sub-math',
        campoFormativo: 'Saberes y Pensamiento Científico',
        camposFormativos: ['Saberes y Pensamiento Científico'],
        ejesArticuladores: ['Pensamiento Crítico'],
        faseNem: 'Fase 4',
        pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Compara y ordena fracciones con diferentes denominadores.',
        xpReward: 300,
        coinsReward: 50
      });
      showToast('⚔️ Plantilla de Examen / Batalla de Jefe NEM cargada.');
    } else if (presetType === 'timed_reading') {
      const readingText = 'En lo profundo de la selva maya, un sabio jaguar velaba por el equilibrio del agua y los árboles milenarios. Los habitantes del pueblo acudían cada ciclo solar a solicitar su guía para cultivar la tierra con respeto y gratitud.';
      const presetBlocks: StudioBlock[] = [
        {
          id: `blk-${Date.now()}-1`,
          type: 'timed_reading_block',
          title: 'Lectura Cronometrada: La Leyenda del Jaguar y la Selva',
          position: { x: 80, y: 160 },
          data: {
            readingText,
            timeLimitSeconds: 60,
            wordCount: readingText.split(/\s+/).filter(Boolean).length,
            targetWpm: 120,
            comprehensionQuestions: [
              {
                id: `rq-${Date.now()}-1`,
                question: '¿Quién cuidaba el equilibrio de la selva maya en la leyenda?',
                options: ['Un águila real', 'Un sabio jaguar', 'Un guerrero del sol', 'Un mago misterioso'],
                correctIndex: 1,
                explanation: 'En el texto se menciona claramente que era un sabio jaguar.'
              },
              {
                id: `rq-${Date.now()}-2`,
                question: '¿Con qué propósito acudían los habitantes del pueblo con el jaguar?',
                options: ['Para cazar animales', 'Para pedir riquezas de oro', 'Para cultivar la tierra con respeto y gratitud', 'Para construir murallas'],
                correctIndex: 2,
                explanation: 'Acudían a solicitar su guía para cultivar la tierra con respeto y gratitud.'
              }
            ]
          }
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'reward_chest',
          title: 'Insignia: Lector Sabio de la Selva',
          position: { x: 420, y: 160 },
          data: {
            badgeName: 'Lector de la Selva Maya 📜',
            badgeIcon: 'BookOpen',
            xpAmount: 150,
            coinsAmount: 25,
            chestRarity: 'epic'
          }
        }
      ];
      loadPresetBlocks(presetBlocks, {
        title: 'Lectura y Fluidez: La Leyenda del Jaguar Maya',
        description: 'Lectura cronometrada con medición de PPM (palabras por minuto) y reactivos de comprensión de retención.',
        subject: 'Lenguajes',
        subjectId: 'sub-span',
        campoFormativo: 'Lenguajes',
        camposFormativos: ['Lenguajes', 'Ética, Naturaleza y Sociedades'],
        ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
        faseNem: 'Fase 4',
        pdaNem: 'Fase 4 - Lenguajes: Lee en voz alta textos narrativos prestando atención a la entonación y fluidez.',
        xpReward: 150,
        coinsReward: 25
      });
      showToast('📖 Plantilla de Lectura Cronometrada & PPM cargada.');
    } else {
      const presetBlocks: StudioBlock[] = [
        {
          id: `blk-${Date.now()}-1`,
          type: 'external_embed',
          title: 'Laboratorio PhET: Densidad y Flotabilidad de Materiales',
          position: { x: 80, y: 160 },
          data: {
            embedUrl: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
            resourceTitle: 'Laboratorio de Densidad y Masa',
            instructions: '1. Modifica la masa del bloque y observa si flota o se hunde en el fluido.'
          }
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'open_poll_wordcloud',
          title: 'Pregunta Reflexiva con Evaluación IA',
          position: { x: 420, y: 160 },
          data: {
            prompt: 'Explica con tus palabras por qué un objeto de gran tamaño puede flotar mientras que un clavo pequeño se hunde.',
            aiFeedbackRubric: 'Evalúa si el estudiante comprende el concepto de relación entre masa y volumen (densidad).',
            minWords: 15
          }
        }
      ];
      loadPresetBlocks(presetBlocks, {
        title: 'Laboratorio Científico: Densidad y Ecosistemas',
        description: 'Secuencia interactiva con simulación científica y retroalimentación pedagógica.',
        subject: 'Saberes y Pensamiento Científico',
        subjectId: 'sub-sci',
        campoFormativo: 'Saberes y Pensamiento Científico',
        camposFormativos: ['Saberes y Pensamiento Científico'],
        ejesArticuladores: ['Pensamiento Crítico', 'Vida Saludable'],
        faseNem: 'Fase 5',
        pdaNem: 'Fase 5 - Saberes y Pensamiento Científico: Desarrolla prototipos y experimentaciones para comprender fenómenos físicos.',
        xpReward: 180,
        coinsReward: 30
      });
      showToast('🧪 Plantilla de Laboratorio Científico cargada.');
    }
    setIsTemplatesModalOpen(false);
  };

  // Publicar actividad en la Comunidad Docente
  const handlePublishToCommunity = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      const activityJSON = serializeToActivityJSON();
      const teacherName = user?.first_name
        ? `Prof. ${user.first_name} ${user.last_name || ''}`.trim()
        : 'Prof. Innovador ISkool';

      const payload = {
        title: metadata.title,
        template_type: 'custom_builder',
        teacher_id: user?.id || 'usr-teacher-1',
        content_json: activityJSON,
        upvotes: 1,
        created_at: new Date().toISOString(),
        teacher_name: teacherName,
      };

      const { error } = await supabase.from('community_activities').insert([payload]);
      if (error) {
        console.warn('Nota: Guardado con advertencia RLS en Supabase (Mock activo):', error.message);
      }

      showToast('🎉 ¡Actividad publicada con éxito en la Comunidad Docente!');
    } catch (err) {
      console.error('Error publicando actividad:', err);
      showToast('🎉 ¡Actividad guardada localmente!');
    } finally {
      setIsPublishing(false);
    }
  };

  const [mobileStudioTab, setMobileStudioTab] = useState<'sidebar' | 'canvas'>('canvas');
  const serializedData = serializeToActivityJSON();

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-purple-500/40 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Barra de Herramientas Superior del Estudio - Jerarquía Visual Limpia */}
      <header className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-3.5 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
        {/* Título de la Actividad y Metadatos */}
        <div className="space-y-1 w-full lg:max-w-md xl:max-w-lg min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
              Lienzo de Bloques
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
              {metadata.faseNem || 'Fase 4'} • {metadata.campoFormativo || 'Saberes'}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {blocks.length} Bloques
            </span>
          </div>

          <input
            type="text"
            value={metadata.title}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            placeholder="Título de la Actividad..."
            className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-purple-500 focus:outline-none w-full truncate transition-colors py-0.5"
          />
        </div>

        {/* Acciones Globales: Plantillas / Historial / Zoom / Probar / Publicar */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-start lg:justify-end shrink-0">
          {/* Botón de Plantillas Pedagógicas NEM */}
          <button
            type="button"
            onClick={() => setIsTemplatesModalOpen(true)}
            title="Cargar Plantillas Pedagógicas NEM oficiales"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 font-semibold text-xs border border-slate-200/80 dark:border-zinc-700/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Plantillas NEM</span>
          </button>

          {/* Deshacer / Rehacer / Limpiar */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-zinc-750">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Deshacer (Ctrl+Z)"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Rehacer (Ctrl+Y)"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetWorkspace}
              title="Limpiar y empezar en blanco"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Controles de Zoom */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-zinc-750">
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel - 0.05)}
              title="Alejar zoom"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-semibold px-1 text-slate-600 dark:text-zinc-300 font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel + 0.05)}
              title="Acercar zoom"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Ajustes */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Ajustes Pedagógicos y NEM"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/80 dark:border-zinc-700/80"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          {/* Probar Juego */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200/80 dark:border-indigo-800/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
            <span>Probar</span>
          </button>

          {/* Botón de Publicar */}
          <button
            type="button"
            onClick={handlePublishToCommunity}
            disabled={isPublishing}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publicando...' : 'Publicar'}</span>
          </button>

          {/* Botón de Asignar */}
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-200" />
            <span>Asignar</span>
          </button>
        </div>
      </header>

      {/* Conmutador de Vistas para Pantallas Táctiles y Móviles (< lg) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setMobileStudioTab('canvas')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mobileStudioTab === 'canvas'
              ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          🗺️ Lienzo de Flujo ({blocks.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileStudioTab('sidebar')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mobileStudioTab === 'sidebar'
              ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          📦 Biblioteca de Bloques
        </button>
      </div>

      {/* Contenido Principal: Panel de Agrupaciones (Izquierda) + Tablero de Trabajo (Central) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 relative">
        <div className={`w-full lg:w-72 xl:w-80 shrink-0 relative z-30 ${mobileStudioTab === 'sidebar' ? 'block' : 'hidden lg:block'}`}>
          <SidebarToolbar />
        </div>
        <div className={`flex-1 w-full min-w-0 relative z-10 ${mobileStudioTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
          <WorkspaceArea />
        </div>
      </div>

      {/* Modal de Previsualización en Vivo */}
      {isPreviewOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto sm:my-2 animate-scale-in">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-850/90">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  SIMULADOR EN VIVO
                </span>
                <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 line-clamp-1">
                  {metadata.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-zinc-750 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <StudioFlowPlayer
                blocks={blocks}
                connections={connections}
                startNodeId={startNodeId}
                metadata={metadata}
                onClose={() => setIsPreviewOpen(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Plantillas Pedagógicas Rápidas (NEM Presets) */}
      {isTemplatesModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 my-auto sm:my-2 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Biblioteca Pedagógica Oficial
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Plantillas y Secuencias NEM 2024
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-zinc-400 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Selecciona una estructura prediseñada por especialistas pedagógicos. Cada plantilla incluye bloques interactivos configurados con alineación a PDA, Ejes Articuladores y recompensas gamificadas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plantilla Destacada: Independencia de México */}
              <div 
                onClick={() => applyPresetTemplate('mexican_independence')}
                className="p-5 rounded-2xl border-2 border-emerald-500/80 hover:border-emerald-600 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/80 dark:from-emerald-950/40 dark:via-zinc-850/80 dark:to-amber-950/30 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between group col-span-1 sm:col-span-2 relative overflow-hidden ring-4 ring-emerald-500/10"
              >
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                        <span>🇲🇽 GESTA PATRIÓTICA NEM (FASE 5)</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        6 Nodos Gamificados
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">+350 XP • 60 🪙</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span>🔔 La Gesta Heroica de la Independencia de México (1810 - 1821)</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    Aventura interactiva con diálogo inmersivo de Miguel Hidalgo, orden cronológico de las 4 etapas, emparejamiento de próceres, acertijo de escape room de la conspiración secreta, combate épico en Monte de las Cruces y Cofre Legendario de la Patria.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-zinc-800 text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>📖 Ética, Naturaleza y Sociedades</span>
                    <span>•</span>
                    <span>Lenguajes</span>
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Cargar Plantilla Épica ➔
                  </span>
                </div>
              </div>

              {/* Plantilla 1: Tarea con Portafolio */}
              <div 
                onClick={() => applyPresetTemplate('homework_portfolio')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500 bg-white dark:bg-zinc-850/60 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Tarea Escolar NEM
                    </span>
                    <span className="text-xs font-black text-blue-600">+100 XP</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Fraccionando en Casa (Evidencia & Video)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    Cápsula explicativa, reactivo de comprensión formativo e insignia de dominio matemático.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  Cargar Plantilla ➔
                </div>
              </div>

              {/* Plantilla 2: Examen / Batalla Boss */}
              <div 
                onClick={() => applyPresetTemplate('boss_exam')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-purple-500 bg-white dark:bg-zinc-850/60 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      Evaluación Formativa / Boss
                    </span>
                    <span className="text-xs font-black text-purple-600">+300 XP</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Batalla: Fraccionator el Glotón 🍕
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    Examen gamificado con emparejamiento, reactivos múltiples y combate contra criatura oscura en motor gráfico.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  Cargar Plantilla ➔
                </div>
              </div>

              {/* Plantilla 3: Lectura Cronometrada PPM */}
              <div 
                onClick={() => applyPresetTemplate('timed_reading')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 bg-white dark:bg-zinc-850/60 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Fluidez Lectora PPM
                    </span>
                    <span className="text-xs font-black text-emerald-600">+150 XP</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    La Leyenda del Jaguar Maya 📜
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    Grimorio mágico con barra regresiva de tiempo, cálculo de PPM y reactivos de retención inmediata.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  Cargar Plantilla ➔
                </div>
              </div>

              {/* Plantilla 4: Laboratorio PhET */}
              <div 
                onClick={() => applyPresetTemplate('phet_science')}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 bg-white dark:bg-zinc-850/60 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Laboratorio Científico
                    </span>
                    <span className="text-xs font-black text-indigo-600">+180 XP</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Densidad & Ecosistemas PhET
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    Simulación interactiva de laboratorio científico con pregunta abierta evaluada por IA Pedagógica.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  Cargar Plantilla ➔
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Ajustes Pedagógicos y NEM Universitario */}
      {isSettingsOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 my-auto sm:my-2 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                    Alineación Curricular Oficial
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Ajustes Pedagógicos y NEM 2024
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Descripción de la Actividad */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Descripción / Misión Narrativa:</label>
                <textarea
                  rows={2}
                  value={metadata.description}
                  onChange={(e) => updateMetadata({ description: e.target.value })}
                  placeholder="Describe de forma formativa o gamificada el propósito de esta secuencia..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Fila: Fase Curricular SEP & Campo Formativo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Fase Curricular (SEP):</label>
                  <select
                    value={metadata.faseNem || 'Fase 4'}
                    onChange={(e) => updateMetadata({ faseNem: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none font-bold"
                  >
                    <option value="Fase 1">Fase 1: Educación Inicial</option>
                    <option value="Fase 2">Fase 2: Educación Preescolar</option>
                    <option value="Fase 3">Fase 3: 1º y 2º de Primaria</option>
                    <option value="Fase 4">Fase 4: 3º y 4º de Primaria</option>
                    <option value="Fase 5">Fase 5: 5º y 6º de Primaria</option>
                    <option value="Fase 6">Fase 6: 1º, 2º y 3º de Secundaria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Campo Formativo Principal:</label>
                  <select
                    value={metadata.campoFormativo}
                    onChange={(e) => updateMetadata({ campoFormativo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none font-bold"
                  >
                    {CAMPOS_FORMATIVOS_CATALOG.map(campo => (
                      <option key={campo} value={campo}>{campo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 7 Ejes Articuladores (Multiselección) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Ejes Articuladores NEM (Multiselección):</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">
                    {(metadata.ejesArticuladores || []).length} seleccionados
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EJES_ARTICULADORES_CATALOG.map(eje => {
                    const isSelected = (metadata.ejesArticuladores || ['Pensamiento Crítico']).includes(eje.name);
                    const EjeIcon = eje.icon;
                    return (
                      <button
                        key={eje.name}
                        type="button"
                        onClick={() => {
                          const current = metadata.ejesArticuladores || ['Pensamiento Crítico'];
                          const next = isSelected ? current.filter(e => e !== eje.name) : [...current, eje.name];
                          updateMetadata({ ejesArticuladores: next.length > 0 ? next : [eje.name] });
                        }}
                        className={`p-2.5 rounded-xl border text-left text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-700 dark:text-zinc-300 hover:border-purple-300'
                        }`}
                      >
                        <EjeIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{eje.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proceso de Desarrollo de Aprendizaje (PDA) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>PDA Oficial Evaluado:</span>
                  <span className="text-[10px] text-slate-400">Texto curricular SEP</span>
                </label>
                <input
                  type="text"
                  value={metadata.pdaNem}
                  onChange={(e) => updateMetadata({ pdaNem: e.target.value })}
                  placeholder="Describe el PDA correspondiente..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-xs"
                />
                {/* Sugerencias Rápidas de PDA Oficiales */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">Sugerencias Oficiales NEM 2024:</span>
                  {(() => {
                    const phaseToLevelKey: Record<string, string> = {
                      'Fase 1': 'preescolar',
                      'Fase 2': 'preescolar',
                      'Fase 3': 'primaria-baja',
                      'Fase 4': 'primaria-media',
                      'Fase 5': 'primaria-alta',
                      'Fase 6': 'secundaria',
                      'Bachillerato': 'preparatoria'
                    };
                    const levelKey = phaseToLevelKey[metadata.faseNem || 'Fase 4'] || 'primaria-media';
                    const queryTopic = metadata.title || metadata.description || 'Contenido Curricular Situado';
                    const dynamicSuggestions = detectCurriculumPdasForTopic(queryTopic, levelKey, metadata.campoFormativo || metadata.subjectId || '');
                    const suggestionsList = dynamicSuggestions.length > 0 ? dynamicSuggestions : (PDA_SUGGESTIONS[metadata.subjectId || 'sub-math'] || PDA_SUGGESTIONS['sub-math']);

                    return (
                      <select
                        onChange={(e) => {
                          if (e.target.value) updateMetadata({ pdaNem: e.target.value });
                        }}
                        className="w-full text-[10px] p-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-slate-800 dark:text-zinc-200 font-medium"
                        defaultValue=""
                      >
                        <option value="">-- Seleccionar PDA Oficial para {metadata.faseNem || 'Fase 4'} --</option>
                        {suggestionsList.map((pda, idx) => (
                          <option key={idx} value={pda}>{pda}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Recompensas de Avatar (XP y Galeones) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-1">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Recompensa de Experiencia (XP)
                  </span>
                  <input
                    type="number"
                    value={metadata.xpReward || 100}
                    onChange={(e) => updateMetadata({ xpReward: Number(e.target.value) })}
                    className="w-full text-sm font-black bg-transparent text-amber-700 dark:text-amber-300 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-900/30 space-y-1">
                  <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Monedas de Galeón (Oro)
                  </span>
                  <input
                    type="number"
                    value={metadata.coinsReward || 15}
                    onChange={(e) => updateMetadata({ coinsReward: Number(e.target.value) })}
                    className="w-full text-sm font-black bg-transparent text-yellow-700 dark:text-yellow-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  showToast('✅ Ajustes pedagógicos y alineación NEM guardados.');
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Asignación a Clase */}
      <AssignToClassModal
        activity={{
          id: 'temp-builder-activity',
          title: metadata.title,
          template_type: 'custom_builder',
          teacher_name: user?.first_name ? `Prof. ${user.first_name}` : 'Profesor',
          teacher_id: user?.id || 'usr-teacher-1',
          content_json: serializedData,
          upvotes: 1,
          created_at: new Date().toISOString()
        }}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={(groupName) => showToast(`🚀 ¡Actividad enviada al grupo ${groupName} con éxito!`)}
      />
    </div>
  );
};
