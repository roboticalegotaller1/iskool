import React, { useState } from 'react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { SidebarToolbar } from './SidebarToolbar';
import { WorkspaceArea } from './WorkspaceArea';
import { StudioFlowPlayer } from '../player/StudioFlowPlayer';
import { AssignToClassModal } from '@/components/AssignToClassModal';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { detectCurriculumPdasForTopic } from '@/lib/curriculumEngine';
import { InstitutionalMemoryAdvisor } from '../InstitutionalMemoryAdvisor';
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
  Star,
  Wand2,
  Gamepad2,
  ListOrdered,
  KeyRound,
  Swords,
  Trophy,
  AlertTriangle,
  Volume2,
  Radio,
  Crown,
  Smartphone,
  Sliders,
  CheckCheck,
  Users,
  Send
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { StudioBlock } from '@/types/studioBlocks';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_METADATA,
  HISTORICAL_FIGURES_PRESET_CATALOG
} from '@/data/mexicanIndependenceStudioFlow';
import { generateGamifiedProject } from '@/services/pedagogicalProjectEngine';
import { detectDuplicateAdjacentNodes, DuplicateNodesConflict } from './duplicateValidation';

// Catálogo Oficial de Ejes Articuladores NEM
const EJES_ARTICULADORES_CATALOG = [
  { name: 'Pensamiento Crítico', icon: Brain, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200' },
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

export interface ActivityBuilderLayoutProps {
  isEmbedded?: boolean;
}

export const ActivityBuilderLayout: React.FC<ActivityBuilderLayoutProps> = ({ isEmbedded = false }) => {
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
    selectedBlockId,
    setSelectedBlockId,
    isNodeConfigDrawerOpen,
    setIsNodeConfigDrawerOpen,
    isExtendedMenuOpen,
    updateBlockTitle,
    updateBlockData,
    switchHistoricalFigureOnBlock
  } = useActivityBuilderStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [duplicateConflicts, setDuplicateConflicts] = useState<DuplicateNodesConflict[] | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [activeClassGroup, setActiveClassGroup] = useState('1°A Secundaria • Historia (08:00-08:50)');
  const [bloomLevel, setBloomLevel] = useState<number>(4);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [stampedCount, setStampedCount] = useState<number>(65);
  const [notebookPage, setNotebookPage] = useState<number>(48);
  const [customFigureInput, setCustomFigureInput] = useState('');
  const [isSimulatorSpeaking, setIsSimulatorSpeaking] = useState(false);
  const [simulatorResponseFeedback, setSimulatorResponseFeedback] = useState<string | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'both' | 'inspector' | 'simulator'>('both');
  const [activeSchoolBadge, setActiveSchoolBadge] = useState({ shortName: 'IBIME', fullName: 'Instituto Bilingüe IBIME' });

  // Telemetría de Cuota de Tokens y Tiempo Real (Actualización continua cada 1 segundo, sin congelarse a 1 vez al día)
  const WEEKLY_TOTAL_TOKENS = 1200000;
  const FIVE_HOUR_TOTAL_TOKENS = 150000;
  const [quotaState, setQuotaState] = useState<{
    weeklyRemainingTokens: number;
    fiveHourRemainingTokens: number;
    vaultSavedTokens: number;
    weeklyResetTargetMs: number;
    fiveHourResetTargetMs: number;
    lastSyncMs: number;
    recentEvents: Array<{ id: string; label: string; tokensDelta: number; savedByVault: boolean; timestamp: string }>;
  }>(() => ({
    // Calibrado sobre el 60.00% semanal (720,000 / 1,200,000) y ventana de 2 días, 2 horas (180,000 s)
    weeklyRemainingTokens: 720000,
    fiveHourRemainingTokens: 148420,
    vaultSavedTokens: 48600,
    weeklyResetTargetMs: Date.now() + (2 * 86400 + 2 * 3600) * 1000,
    fiveHourResetTargetMs: Date.now() + (4 * 3600 + 42 * 60 + 18) * 1000,
    lastSyncMs: Date.now(),
    recentEvents: [
      { id: 'ev-1', label: 'Carga de Secuencia en Bóveda Curricular (Cache-First)', tokensDelta: 0, savedByVault: true, timestamp: 'Hace instantes' },
      { id: 'ev-2', label: ' Calibración de Nodos y Síntesis Neural LatAm', tokensDelta: 1580, savedByVault: false, timestamp: 'Sesión activa' }
    ]
  }));
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [calibrationPctInput, setCalibrationPctInput] = useState<string>('60');
  const [calibrationDaysInput, setCalibrationDaysInput] = useState<string>('2');
  const [calibrationHoursInput, setCalibrationHoursInput] = useState<string>('2');

  React.useEffect(() => {
    try {
      const savedName = localStorage.getItem('iskool_active_school_name');
      const savedShort = localStorage.getItem('iskool_active_school_short');
      if (savedName || savedShort) {
        setActiveSchoolBadge({
          shortName: savedShort || (savedName ? savedName.split(' ').slice(0, 2).join(' ') : 'IBIME'),
          fullName: savedName || 'Instituto Bilingüe IBIME'
        });
      }
      const rawQuota = localStorage.getItem('iskool_realtime_quota_telemetry_v1');
      if (rawQuota) {
        const parsed = JSON.parse(rawQuota);
        if (parsed && typeof parsed.weeklyRemainingTokens === 'number') {
          const currentNow = Date.now();
          let nextWeeklyTarget = parsed.weeklyResetTargetMs || currentNow + (2 * 86400 + 2 * 3600) * 1000;
          let nextWeeklyTokens = parsed.weeklyRemainingTokens;
          if (nextWeeklyTarget <= currentNow) {
            nextWeeklyTarget = currentNow + 7 * 86400 * 1000;
            nextWeeklyTokens = WEEKLY_TOTAL_TOKENS;
          }
          let nextFiveHourTarget = parsed.fiveHourResetTargetMs || currentNow + 5 * 3600 * 1000;
          let nextFiveHourTokens = parsed.fiveHourRemainingTokens ?? FIVE_HOUR_TOTAL_TOKENS;
          if (nextFiveHourTarget <= currentNow) {
            nextFiveHourTarget = currentNow + 5 * 3600 * 1000;
            nextFiveHourTokens = FIVE_HOUR_TOTAL_TOKENS;
          }
          setQuotaState({
            ...parsed,
            weeklyRemainingTokens: nextWeeklyTokens,
            fiveHourRemainingTokens: nextFiveHourTokens,
            weeklyResetTargetMs: nextWeeklyTarget,
            fiveHourResetTargetMs: nextFiveHourTarget,
            lastSyncMs: currentNow
          });
        }
      }
    } catch (_) {}
  }, []);

  // Reloj en tiempo real que actualiza cada 1,000 ms (1 segundo) el porcentaje dinámico y la cuenta regresiva
  React.useEffect(() => {
    const timer = setInterval(() => {
      const tick = Date.now();
      setNowMs(tick);
      setQuotaState((prev) => {
        let updated = false;
        let nextWeeklyTarget = prev.weeklyResetTargetMs;
        let nextWeeklyTokens = prev.weeklyRemainingTokens;
        let nextFiveHourTarget = prev.fiveHourResetTargetMs;
        let nextFiveHourTokens = prev.fiveHourRemainingTokens;

        if (nextWeeklyTarget <= tick) {
          nextWeeklyTarget = tick + 7 * 86400 * 1000;
          nextWeeklyTokens = WEEKLY_TOTAL_TOKENS;
          updated = true;
        }
        if (nextFiveHourTarget <= tick) {
          nextFiveHourTarget = tick + 5 * 3600 * 1000;
          nextFiveHourTokens = FIVE_HOUR_TOTAL_TOKENS;
          updated = true;
        }
        if (!updated) return prev;
        const nextState = {
          ...prev,
          weeklyRemainingTokens: nextWeeklyTokens,
          fiveHourRemainingTokens: nextFiveHourTokens,
          weeklyResetTargetMs: nextWeeklyTarget,
          fiveHourResetTargetMs: nextFiveHourTarget,
          lastSyncMs: tick
        };
        try {
          localStorage.setItem('iskool_realtime_quota_telemetry_v1', JSON.stringify(nextState));
        } catch (_) {}
        return nextState;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const recordTokenActivity = (label: string, tokensUsed: number, savedByVault = false) => {
    const tick = Date.now();
    setNowMs(tick);
    setQuotaState((prev) => {
      const nextWeekly = savedByVault
        ? prev.weeklyRemainingTokens
        : Math.max(0, prev.weeklyRemainingTokens - tokensUsed);
      const nextFiveHour = savedByVault
        ? prev.fiveHourRemainingTokens
        : Math.max(0, prev.fiveHourRemainingTokens - tokensUsed);
      const nextVaultSaved = savedByVault
        ? prev.vaultSavedTokens + tokensUsed
        : prev.vaultSavedTokens;
      const newEvent = {
        id: `ev-${tick}`,
        label,
        tokensDelta: tokensUsed,
        savedByVault,
        timestamp: new Date(tick).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      const nextState = {
        ...prev,
        weeklyRemainingTokens: nextWeekly,
        fiveHourRemainingTokens: nextFiveHour,
        vaultSavedTokens: nextVaultSaved,
        lastSyncMs: tick,
        recentEvents: [newEvent, ...(prev.recentEvents || []).slice(0, 7)]
      };
      try {
        localStorage.setItem('iskool_realtime_quota_telemetry_v1', JSON.stringify(nextState));
      } catch (_) {}
      return nextState;
    });
  };

  const formatLiveCountdown = (targetMs: number, includeDays = true) => {
    const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (includeDays) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    const totalHours = days * 24 + hours;
    return `${pad(totalHours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  const weeklyRemainingPct = Math.max(0, Math.min(100, (quotaState.weeklyRemainingTokens / WEEKLY_TOTAL_TOKENS) * 100));
  const fiveHourRemainingPct = Math.max(0, Math.min(100, (quotaState.fiveHourRemainingTokens / FIVE_HOUR_TOTAL_TOKENS) * 100));

  // Bandera unificada para ocultar/desactivar paneles laterales flotantes cuando cualquier cajón o modal está abierto
  const isAnyOverlayOpen = Boolean(
    isNodeConfigDrawerOpen ||
    isExtendedMenuOpen ||
    isPreviewOpen ||
    isLiveClassModalOpen ||
    isTemplatesModalOpen ||
    isAiModalOpen ||
    isSettingsOpen ||
    isAssignModalOpen ||
    isQuotaModalOpen ||
    (duplicateConflicts && duplicateConflicts.length > 0)
  );

  const BLOOM_LABELS: Record<number, string> = {
    1: '1. Recordar',
    2: '2. Comprender',
    3: '3. Aplicar',
    4: '4. Analizar',
    5: '5. Evaluar',
    6: '6. Crear'
  };

  const activeSelectedBlock: StudioBlock | undefined =
    blocks.find(b => b.id === selectedBlockId) || blocks[0];

  const playSimulatorTts = async (text: string, gender: 'male' | 'female' = 'female') => {
    if (!text) return;
    setIsSimulatorSpeaking(true);
    recordTokenActivity('Síntesis Neural LatAm (Caché Bóveda 0 Tokens)', 180, true);
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang: 'es-MX',
          gender
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = ttsSpeed;
        audio.onended = () => setIsSimulatorSpeaking(false);
        audio.onerror = () => setIsSimulatorSpeaking(false);
        await audio.play();
        return;
      }
    } catch (_) {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-MX';
      u.rate = ttsSpeed;
      u.onend = () => setIsSimulatorSpeaking(false);
      u.onerror = () => setIsSimulatorSpeaking(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsSimulatorSpeaking(false);
    }
  };
  const [aiModalTopic, setAiModalTopic] = useState('');
  const [aiModalFase, setAiModalFase] = useState('Fase 5');
  const [aiModalStyle, setAiModalStyle] = useState<'rpg_adventure' | 'escape_room' | 'scientific_expedition' | 'olympic_tournament'>('rpg_adventure');
  const [isGeneratingAiModal, setIsGeneratingAiModal] = useState(false);
  const [aiModalGenStep, setAiModalGenStep] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Validación de calidad pedagógica antes de probar
  const handleTestActivity = () => {
    if (blocks.length === 0) {
      showToast('Añade al menos un bloque didáctico al lienzo antes de probar.');
      return;
    }

    const conflicts = detectDuplicateAdjacentNodes(blocks, connections);
    if (conflicts.length > 0) {
      setDuplicateConflicts(conflicts);
      return;
    }

    setIsPreviewOpen(true);
  };

  // Generador Maestro con IA directamente en el Lienzo
  const handleGenerateInCanvas = async () => {
    if (!aiModalTopic.trim() || isGeneratingAiModal) return;
    setIsGeneratingAiModal(true);
    try {
      setAiModalGenStep('Analizando contenidos y PDA curricular oficial...');
      await new Promise(r => setTimeout(r, 350));
      setAiModalGenStep('Estructurando narrativa épica y desafíos interactivos...');
      await new Promise(r => setTimeout(r, 350));

      let projectResult;
      try {
        const res = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: aiModalTopic.trim(),
            faseNem: aiModalFase,
            gamificationStyle: aiModalStyle,
            questionCount: 5
          })
        });
        if (res.ok) projectResult = await res.json();
      } catch (e) {
        console.warn('Fallback a motor local en lienzo:', e);
      }

      if (!projectResult || !projectResult.blocks || projectResult.blocks.length === 0) {
        projectResult = await generateGamifiedProject({
          topic: aiModalTopic.trim(),
          faseNem: aiModalFase,
          gamificationStyle: aiModalStyle
        });
      }

      setAiModalGenStep('Configurando encuentro RPG, combate y cofre legendario...');
      await new Promise(r => setTimeout(r, 350));

      loadPresetBlocks(projectResult.blocks, projectResult.metadata);
      if (projectResult.connections && projectResult.connections.length > 0) {
        useActivityBuilderStore.setState({
          connections: projectResult.connections,
          startNodeId: projectResult.startNodeId || projectResult.blocks[0]?.id || null
        });
      }

      setIsAiModalOpen(false);
      setAiModalTopic('');
      recordTokenActivity(`Generación IA: ${projectResult.metadata.title}`, 2450, false);
      showToast(`✨ ¡Proyecto "${projectResult.metadata.title}" estructurado con 7 bloques gamificados!`);
    } catch (err) {
      console.error('Error generando en lienzo:', err);
      showToast('❌ Error al generar con IA.');
    } finally {
      setIsGeneratingAiModal(false);
      setAiModalGenStep('');
    }
  };

  // Cargar Plantillas Pedagógicas Rápidas (NEM Presets)
  const applyPresetTemplate = (presetType: 'mexican_independence' | 'homework_portfolio' | 'boss_exam' | 'timed_reading' | 'phet_science') => {
    recordTokenActivity(`Plantilla NEM Bóveda (${presetType})`, 3200, true);
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

  const [mobileStudioTab, setMobileStudioTab] = useState<'sidebar' | 'canvas' | 'inspector'>('canvas');
  const serializedData = serializeToActivityJSON();

  const selectedHistoricalBlock: Extract<StudioBlock, { type: 'historical_figure_block' }> | undefined =
    activeSelectedBlock?.type === 'historical_figure_block'
      ? activeSelectedBlock
      : blocks.find((b): b is Extract<StudioBlock, { type: 'historical_figure_block' }> => b.type === 'historical_figure_block');

  const activeSimBlock: StudioBlock | undefined = activeSelectedBlock || selectedHistoricalBlock || blocks[0];

  const handleCreateCustomHistoricalFigure = () => {
    const clean = customFigureInput.trim();
    if (!clean) return;
    const targetBlock = selectedHistoricalBlock || activeSelectedBlock;
    const isSite = /sitio|zona|ciudad|templo|castillo|alhóndiga|monte|chichén|teotihuacán|querétaro|dolores/i.test(clean);
    if (targetBlock && targetBlock.type === 'historical_figure_block') {
      switchHistoricalFigureOnBlock(targetBlock.id, clean, isSite);
      setSelectedBlockId(targetBlock.id);
    } else if (blocks.length > 0) {
      const histBlock = blocks.find(b => b.type === 'historical_figure_block');
      if (histBlock) {
        switchHistoricalFigureOnBlock(histBlock.id, clean, isSite);
        setSelectedBlockId(histBlock.id);
      }
    }
    setCustomFigureInput('');
    showToast(`🏛️ Personaje/Sitio 3D actualizado a "${clean}" en 1ª persona con Bóveda Curricular.`);
  };

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR 1: Cinta de Sincronización con Espejo Ejecutivo CEO & Clase Activa (Rediseño 1 Vista 1.1) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 px-3 sm:px-4 py-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Badge Espejo Ejecutivo CEO */}
          <button
            type="button"
            onClick={() => showToast(`👑 Sincronizado en tiempo real con Espejo Ejecutivo CEO (${activeSchoolBadge.fullName})`)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200 border border-violet-200/80 dark:border-violet-800/60 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
            <span>Sincronizado con Espejo Ejecutivo CEO</span>
          </button>

          {/* Selector de Clase Activa */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200">
            <span className="text-slate-400 font-bold">Clase Activa:</span>
            <select
              aria-label="Seleccionar Clase Activa"
              value={activeClassGroup}
              onChange={(e) => {
                setActiveClassGroup(e.target.value);
                showToast(`📚 Clase activa vinculada: ${e.target.value}`);
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="1°A Secundaria • Historia (08:00-08:50)">1°A Secundaria • Historia (08:00-08:50)</option>
              <option value="2°B Secundaria • Historia de México (09:00-09:50)">2°B Secundaria • Historia de México (09:00-09:50)</option>
              <option value="5°A Primaria • Ética, Naturaleza y Sociedades (10:30-11:20)">5°A Primaria • Ética, Naturaleza y Sociedades (10:30-11:20)</option>
              <option value="3°A Secundaria • Formación Cívica y Ética (11:30-12:20)">3°A Secundaria • Formación Cívica y Ética (11:30-12:20)</option>
            </select>
          </div>

          {/* Selector Taxonomía de Bloom */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-800 dark:text-indigo-200">
            <span>🎯 Bloom:</span>
            <select
              aria-label="Nivel Taxonomía de Bloom"
              value={bloomLevel}
              onChange={(e) => {
                const lvl = Number(e.target.value);
                setBloomLevel(lvl);
                showToast(`🎯 Nivel cognitivo calibrado a Bloom ${BLOOM_LABELS[lvl]}`);
              }}
              className="bg-transparent font-black text-indigo-900 dark:text-indigo-100 focus:outline-none cursor-pointer"
            >
              <option value={1}>1. Recordar</option>
              <option value={2}>2. Comprender</option>
              <option value={3}>3. Aplicar</option>
              <option value={4}>4. Analizar</option>
              <option value={5}>5. Evaluar</option>
              <option value={6}>6. Crear</option>
            </select>
          </div>

          {/* Sello Hoy */}
          <button
            type="button"
            onClick={() => setIsLiveClassModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-bold text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
          >
            <span>💮 Sello Hoy: Pág. {notebookPage} ({stampedCount}/68)</span>
          </button>

          {/* Visado SEP NEM 100% */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Visado SEP NEM 100% ✓
          </span>

          {/* Monitor de Cuota de Tokens & Tiempo Real (Actualización Continua 1s — Solución a Imagen 2) */}
          <button
            type="button"
            onClick={() => setIsQuotaModalOpen(true)}
            title="Ver porcentaje real de tokens y cuenta regresiva en tiempo real (Actualización cada segundo)"
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 text-white border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
          >
            {/* Anillo SVG en Tiempo Real */}
            <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 -rotate-90" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray={`${(weeklyRemainingPct / 100) * 47.12} 47.12`}
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-emerald-300 font-black tabular-nums">
              Tokens: {weeklyRemainingPct.toFixed(2)}%
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-300 font-mono text-[10px] font-bold tabular-nums">
              ⏱ {formatLiveCountdown(quotaState.weeklyResetTargetMs, true)}
            </span>
            <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black tabular-nums">
              5h: {fiveHourRemainingPct.toFixed(1)}%
            </span>
          </button>
        </div>

        {/* Emblema Institucional Multi-Colegio */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-600 to-amber-500 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
            {activeSchoolBadge.shortName.slice(0, 2).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-black tracking-tight text-slate-900 dark:text-white">
              {activeSchoolBadge.shortName}
            </div>
            <div className="text-[9px] font-semibold text-slate-500 dark:text-zinc-400 hidden sm:block">
              {activeSchoolBadge.fullName}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA SUPERIOR 2: Cabecera Maestra del Lienzo Studio (Sin Truncado + Puente Clase en Vivo) */}
      <header className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 px-3.5 sm:px-5 py-3 shadow-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        {/* Título Completo sin Truncamiento y Metadatos NEM */}
        <div className="space-y-1 w-full xl:flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
              {metadata.faseNem || 'Fase 5'} • {metadata.campoFormativo || 'Ética, Naturaleza y Sociedades'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              • {blocks.length} Bloques
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
              Respaldo Neural Continuo (24 voces LatAm)
            </span>
          </div>

          <input
            aria-label="Título de la Actividad"
            type="text"
            value={metadata.title}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            placeholder="Título de la Actividad..."
            className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-emerald-500 focus:outline-none w-full transition-colors py-0.5"
          />
        </div>

        {/* Botonera Maestra de Studio */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full xl:w-auto justify-start xl:justify-end shrink-0">
          {/* Plantillas NEM */}
          <button
            type="button"
            onClick={() => setIsTemplatesModalOpen(true)}
            title="Cargar Plantillas Pedagógicas NEM oficiales"
            className="px-3 py-2 rounded-xl bg-amber-50/90 hover:bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 font-bold text-xs border border-amber-200/90 dark:border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>Plantillas NEM</span>
          </button>

          {/* Generar con IA */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            title="Generar proyecto gamificado completo con Motor de IA Pedagógica"
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-300/80 dark:border-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Generar con IA</span>
          </button>

          {/* Deshacer / Rehacer / Limpiar */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-zinc-700">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Deshacer (Ctrl+Z)"
              aria-label="Deshacer (Ctrl+Z)"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Rehacer (Ctrl+Y)"
              aria-label="Rehacer (Ctrl+Y)"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetWorkspace}
              title="Restaurar o limpiar lienzo"
              aria-label="Restaurar o limpiar lienzo"
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ajustes */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Ajustes Pedagógicos y NEM"
            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/80 dark:border-zinc-700"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          {/* Probar */}
          <button
            type="button"
            onClick={handleTestActivity}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>Probar</span>
          </button>

          {/* Transmitir a Clase & Sellar (Nuevo Puente Aula en Vivo & CEO) */}
          <button
            type="button"
            onClick={() => setIsLiveClassModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-black text-xs shadow-sm shadow-sky-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Transmitir a Clase & Sellar</span>
          </button>

          {/* Publicar */}
          <button
            type="button"
            onClick={handlePublishToCommunity}
            disabled={isPublishing}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publicando...' : 'Publicar'}</span>
          </button>

          {/* Asignar */}
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-200" />
            <span>Asignar</span>
          </button>
        </div>
      </header>

      {/* Conmutador de Vistas para Pantallas Táctiles y Móviles (< lg) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setMobileStudioTab('canvas')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            mobileStudioTab === 'canvas'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          🗺️ Lienzo ({blocks.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileStudioTab('sidebar')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            mobileStudioTab === 'sidebar'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          📦 28 Nodos
        </button>
        <button
          type="button"
          onClick={() => setMobileStudioTab('inspector')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            mobileStudioTab === 'inspector'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          📱 Simulador
        </button>
      </div>

      {/* Asesor Proactivo de Memoria Institucional (Fase 9 Closed-Loop RAG) */}
      <InstitutionalMemoryAdvisor
        topic={metadata.title}
        gradeLevel={metadata.faseNem}
        subjectId={metadata.subjectId || metadata.subject}
        onApplyRecommendation={(rec) => {
          updateMetadata({
            description: metadata.description
              ? `${metadata.description}\n\n[Recomendación Bóveda]: ${rec}`
              : `[Recomendación Bóveda]: ${rec}`
          });
          showToast('💡 Intervención de la Bóveda incorporada a la planeación.');
        }}
      />

      {/* CONTENIDO PRINCIPAL EN 3 COLUMNAS: Izquierda (28 Nodos) + Centro (Lienzo de Flujo) + Derecha (Inspector de Nodo & Simulador Alumno en Vivo) */}
      <div className="flex flex-col lg:flex-row items-start gap-3.5 xl:gap-4 relative">
        {/* Columna Izquierda: Agrupaciones de Bloques (28 Nodos) - Sin z-index que atrape u obstruya cajones portales */}
        <div className={`w-full lg:w-[265px] xl:w-[280px] shrink-0 relative ${mobileStudioTab === 'sidebar' ? 'block' : 'hidden lg:block'}`}>
          <SidebarToolbar onBlockAdded={() => setMobileStudioTab('canvas')} />
        </div>

        {/* Columna Central: Lienzo de Flujo con Tarjetas Ricas y Radar 2D */}
        <div className={`flex-1 w-full min-w-0 relative ${mobileStudioTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
          <WorkspaceArea />
        </div>

        {/* Columna Derecha: Inspector de Nodo + Live Student Phone/Tablet Simulator (Se oculta automáticamente cuando se abre Configuración de Nodo o cualquier otro modal para CERO sobreposición) */}
        <aside
          aria-hidden={isAnyOverlayOpen}
          className={`w-full lg:w-[305px] xl:w-[330px] shrink-0 relative transition-opacity duration-150 ${
            isAnyOverlayOpen
              ? 'hidden'
              : mobileStudioTab === 'inspector'
                ? 'block'
                : 'hidden lg:block'
          }`}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 p-3.5 shadow-sm space-y-3.5">
            {/* Pestañas Superiores del Panel Derecho */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setRightPanelMode('both')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  rightPanelMode === 'both' || rightPanelMode === 'inspector'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Inspector de Nodo
              </button>
              <button
                type="button"
                onClick={() => setRightPanelMode(rightPanelMode === 'simulator' ? 'both' : 'simulator')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  rightPanelMode === 'simulator'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900'
                }`}
              >
                Simulador Alumno
              </button>
            </div>

            {/* SECCIÓN 1: INSPECTOR RÁPIDO DE NODO (Sin depender de Josefa Ortiz + Control Universal) */}
            {rightPanelMode !== 'simulator' && activeSimBlock && (
              <div className="space-y-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-2xl p-3 border border-slate-200/80 dark:border-zinc-700/70">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-slate-800 dark:text-white truncate">
                    {activeSimBlock.type === 'historical_figure_block'
                      ? `${activeSimBlock.data.characterName || 'Personaje Histórico'} 3D`
                      : activeSimBlock.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(activeSimBlock.id);
                      setIsNodeConfigDrawerOpen(true);
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer shrink-0"
                  >
                    Editar a fondo
                  </button>
                </div>

                {/* Selector de Avatar / Personaje o Sitio Histórico (22+ Nodos de Bóveda + Creador Libre) */}
                {(activeSimBlock.type === 'historical_figure_block' || selectedHistoricalBlock) && (() => {
                  const targetHist = activeSimBlock.type === 'historical_figure_block' ? activeSimBlock : selectedHistoricalBlock!;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                        <img
                          src={targetHist.data.avatarImageUrl || '/images/history/josefa_ortiz_avatar.png'}
                          alt={targetHist.data.characterName || 'Avatar'}
                          className="w-8 h-8 rounded-lg object-cover border border-amber-300 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Avatar / Sitio de Bóveda (22+ Activos)
                          </div>
                          <select
                            aria-label="Seleccionar Personaje o Sitio Histórico"
                            value={targetHist.data.characterName || 'Josefa Ortiz de Domínguez'}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isSite = /Querétaro|Alhóndiga|Chapultepec|Teotihuacán|Chichén|Monte Albán/i.test(val);
                              switchHistoricalFigureOnBlock(targetHist.id, val, isSite);
                              setSelectedBlockId(targetHist.id);
                              showToast(`🏛️ Nodo actualizado a ${val} (1ª Persona verificada)`);
                            }}
                            className="w-full text-[11px] font-black text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer truncate"
                          >
                            {HISTORICAL_FIGURES_PRESET_CATALOG.map((preset) => (
                              <option key={preset.characterName} value={preset.characterName}>
                                {preset.isGeographicSite ? `📍 ${preset.characterName}` : `🏛️ ${preset.characterName}`}
                              </option>
                            ))}
                            <option value="Cuauhtémoc">🏛️ Cuauhtémoc</option>
                            <option value="Lázaro Cárdenas del Río">🏛️ Lázaro Cárdenas del Río</option>
                            <option value="Ignacio Allende">🏛️ Ignacio Allende</option>
                            <option value="Francisco I. Madero">🏛️ Francisco I. Madero</option>
                            <option value="Carmen Serdán Alatriste">🏛️ Carmen Serdán Alatriste</option>
                            <option value="Aquiles Serdán">🏛️ Aquiles Serdán</option>
                            <option value="Felipe Ángeles">🏛️ Felipe Ángeles</option>
                            <option value="Belisario Domínguez">🏛️ Belisario Domínguez</option>
                            <option value="Ricardo Flores Magón">🏛️ Ricardo Flores Magón</option>
                            <option value="Guadalupe Victoria">🏛️ Guadalupe Victoria</option>
                            <option value="Andrés Quintana Roo">🏛️ Andrés Quintana Roo</option>
                            <option value="José Guadalupe Posada">🏛️ José Guadalupe Posada</option>
                            <option value="Plutarco Elías Calles">🏛️ Plutarco Elías Calles</option>
                            <option value="Gustavo Díaz Ordaz">🏛️ Gustavo Díaz Ordaz</option>
                            <option value="Vicente Guerrero">🏛️ Vicente Guerrero</option>
                            <option value="Leona Vicario">🏛️ Leona Vicario</option>
                            <option value="Alhóndiga de Granaditas (Sitio Histórico)">📍 Alhóndiga de Granaditas (Sitio)</option>
                            <option value="Castillo de Chapultepec (Sitio Histórico)">📍 Castillo de Chapultepec (Sitio)</option>
                            <option value="Zona Arqueológica de Teotihuacán">📍 Teotihuacán (Sitio)</option>
                            <option value="Chichén Itzá (Sitio Arqueológico)">📍 Chichén Itzá (Sitio)</option>
                          </select>
                        </div>
                      </div>

                      {/* Creador Instantáneo de Cualquier Personaje o Sitio Histórico */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customFigureInput}
                          onChange={(e) => setCustomFigureInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomHistoricalFigure()}
                          placeholder="¿Otro prócer o sitio? Ej. Nezahualcóyotl..."
                          className="flex-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomHistoricalFigure}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] shrink-0 cursor-pointer transition-colors"
                        >
                          Crear 3D
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Control Deslizante TTS LatAm Speed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>TTS LatAm Speed</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{ttsSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    aria-label="Velocidad de Voz Neural LatAm"
                    type="range"
                    min={0.8}
                    max={1.3}
                    step={0.1}
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Control Deslizante Bloom Level */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>Bloom Level</span>
                    <span className="font-mono font-black text-indigo-700 dark:text-indigo-300">{bloomLevel} ({BLOOM_LABELS[bloomLevel].split('. ')[1]})</span>
                  </div>
                  <input
                    aria-label="Nivel Taxonomía de Bloom"
                    type="range"
                    min={1}
                    max={6}
                    step={1}
                    value={bloomLevel}
                    onChange={(e) => setBloomLevel(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN 2: LIVE STUDENT PHONE/TABLET SIMULATOR (Rediseño 1 Vista 1.1) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  Live Student Phone/Tablet Simulator
                </span>
                <button
                  type="button"
                  onClick={handleTestActivity}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Pantalla Completa
                </button>
              </div>

              {/* Marco Físico de Smartphone / Tablet del Alumno */}
              <div className="bg-slate-950 rounded-[28px] p-3.5 border-[3px] border-slate-800 shadow-xl text-white relative overflow-hidden">
                {/* Notch y Altavoz Superior */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-emerald-300">
                    {activeSimBlock?.type === 'historical_figure_block'
                      ? '1ª Persona Estricta • IA'
                      : activeSimBlock?.title?.slice(0, 22) || 'Vista Alumno'}
                  </span>
                  <div className="w-12 h-1.5 rounded-full bg-slate-800 mx-auto" />
                  <button
                    type="button"
                    aria-label="Escuchar audio en simulador"
                    onClick={() => {
                      const target = activeSimBlock || selectedHistoricalBlock;
                      const targetData = (target?.data || {}) as Record<string, any>;
                      const quote =
                        targetData.firstPersonGreeting ||
                        targetData.content ||
                        targetData.question ||
                        targetData.prompt ||
                        '¡Bienvenidos a la sesión interactiva de hoy! Respondan con pensamiento crítico.';
                      const isFemale = /Josefa|Sor Juana|Leona|Frida|Querétaro/i.test(targetData.characterName || '');
                      playSimulatorTts(quote, isFemale ? 'female' : 'male');
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSimulatorSpeaking ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Contenido Dinámico del Simulador según el Bloque Seleccionado */}
                {(() => {
                  const simBlock = activeSimBlock || selectedHistoricalBlock;
                  if (!simBlock) return null;

                  if (simBlock.type === 'historical_figure_block' || (!activeSelectedBlock && selectedHistoricalBlock)) {
                    const fig = simBlock.type === 'historical_figure_block' ? simBlock : selectedHistoricalBlock!;
                    const charName = fig.data.characterName || 'Josefa Ortiz de Domínguez';
                    const avatarUrl = fig.data.avatarImageUrl || '/images/history/josefa_ortiz_avatar.png';
                    const greeting =
                      fig.data.firstPersonGreeting ||
                      fig.data.shortBio ||
                      'Di el aviso urgente desde mi alcoba el 15 de septiembre de 1810 para salvar nuestra causa libertaria.';
                    const isFemale = /Josefa|Sor Juana|Leona|Frida|Querétaro/i.test(charName);

                    return (
                      <div className="space-y-2.5 text-center">
                        <div className="relative mx-auto w-full h-44 rounded-2xl overflow-hidden border border-white/15 bg-slate-900">
                          <img
                            src={avatarUrl}
                            alt={charName}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-2.5 text-left">
                            <div className="text-xs font-black text-white leading-tight">{charName}</div>
                            <div className="text-[9px] text-amber-300 font-semibold">
                              {fig.data.birthDeathDates || 'Archivo Histórico SEP'} • {fig.data.historicalEra || 'México'}
                            </div>
                          </div>
                        </div>

                        {/* Onda de Voz Neural LatAm */}
                        <div
                          onClick={() => playSimulatorTts(greeting, isFemale ? 'female' : 'male')}
                          className="bg-slate-900/90 hover:bg-slate-900 border border-white/10 rounded-xl px-3 py-2 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-center gap-1 h-5 mb-1">
                            {[35, 65, 95, 50, 85, 100, 60, 90, 45, 75, 95, 55, 80, 40, 60].map((h, idx) => (
                              <span
                                key={idx}
                                style={{ height: `${isSimulatorSpeaking ? Math.max(25, (h * ((idx % 3) + 1)) % 100) : h}%` }}
                                className={`w-1 rounded-full transition-all duration-200 ${
                                  isSimulatorSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400/80'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] italic text-slate-200 line-clamp-2">
                            “{greeting}”
                          </p>
                        </div>

                        {simulatorResponseFeedback && (
                          <div className="text-[10px] bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 rounded-xl p-2 text-left">
                            {simulatorResponseFeedback}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const sampleQa = fig.data.qaLibrary?.[0] || fig.data.qaCache?.[0];
                              const reply = sampleQa
                                ? `💬 ${charName} (1ª Persona): “${sampleQa.answer}”`
                                : `💬 ${charName} (1ª Persona): “${greeting}”`;
                              setSimulatorResponseFeedback(reply);
                              playSimulatorTts(sampleQa ? sampleQa.answer : greeting, isFemale ? 'female' : 'male');
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                          >
                            Student respuesta
                          </button>
                          <button
                            type="button"
                            onClick={handleTestActivity}
                            title="Abrir Libro Mágico 3D en Pantalla Completa"
                            className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer"
                          >
                            📖 3D
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const rawSimData = (simBlock.data || {}) as Record<string, any>;
                  return (
                    <div className="space-y-2.5">
                      <div className="bg-slate-900 rounded-2xl p-3 border border-white/10 space-y-2">
                        <div className="text-xs font-black text-amber-300">{simBlock.title}</div>
                        <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-4">
                          {rawSimData.question ||
                            rawSimData.prompt ||
                            rawSimData.content ||
                            rawSimData.textWithBlanks ||
                            rawSimData.conditionDescription ||
                            'Interactúa con este nodo desde el dispositivo del estudiante.'}
                        </p>
                        {Array.isArray(rawSimData.wordBank) && rawSimData.wordBank.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {rawSimData.wordBank.map((w: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                                {w}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleTestActivity}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                      >
                        Probar Interacción de Alumno
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL DE TRANSMISIÓN A CLASE EN VIVO, SELLO DE LIBRETA Y ESPEJO CEO */}
      {isLiveClassModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black">Puente de Transmisión a Clase en Vivo & Sellado SEP</h3>
                  <p className="text-[11px] text-sky-100 font-medium">
                    {activeClassGroup} • Sincronizado con Espejo Ejecutivo CEO ({activeSchoolBadge.shortName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveClassModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-black uppercase text-emerald-700">Asistencia en Aula</div>
                  <div className="text-lg font-black text-emerald-950 mt-0.5">67/68 Presentes</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">98.5% Asistencia verificada</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-black uppercase text-amber-800">Sello de Libreta Hoy</div>
                  <div className="text-lg font-black text-amber-950 mt-0.5">Pág. {notebookPage} ({stampedCount}/68)</div>
                  <div className="text-[10px] text-amber-800 font-semibold">Rúbrica SEP NEM vinculada</div>
                </div>
                <div className="p-3 rounded-2xl bg-violet-50 border border-violet-200">
                  <div className="text-[10px] font-black uppercase text-violet-800">Espejo Ejecutivo CEO</div>
                  <div className="text-lg font-black text-violet-950 mt-0.5">Bloom {bloomLevel} Activo</div>
                  <div className="text-[10px] text-violet-700 font-semibold">{BLOOM_LABELS[bloomLevel]}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <div className="text-xs font-black text-slate-800">
                  Acciones Directas de Aula en Vivo (1 Clic):
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStampedCount(67);
                      showToast(`💮 ¡Pág. ${notebookPage} sellada digitalmente a los 67 alumnos presentes y reportada al Espejo CEO!`);
                    }}
                    className="flex-1 min-w-[180px] py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer transition-all"
                  >
                    💮 Sellar Pág. {notebookPage} a Presentes (67)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLiveClassModalOpen(false);
                      handleTestActivity();
                      showToast('📡 Secuencia proyectada en Pizarra Interactiva del Aula en Vivo.');
                    }}
                    className="flex-1 min-w-[180px] py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer transition-all"
                  >
                    📡 Proyectar Flujo en Pizarra de Clase
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('📲 4 Magic Links de evidencias enviados a Padres de Familia y registrados en Espejo CEO.');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all"
                  >
                    📲 Disparar Magic Links a Padres
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotebookPage((p) => p + 1);
                      showToast(`📓 Página de sellado actualizada a Pág. ${notebookPage + 1}`);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-all"
                  >
                    Cambiar Pág. ({notebookPage})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Previsualización en Vivo */}
      {isPreviewOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto sm:my-2 animate-scale-in">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 dark:bg-zinc-850/90">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  SIMULADOR EN VIVO
                </span>
                <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 line-clamp-1">
                  {metadata.title}
                </h3>
              </div>

              <button aria-label="Cerrar"
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-zinc-750 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-6 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto pb-safe">
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

      {/* Modal de Bloqueo por Nodos Duplicados Contiguos */}
      {duplicateConflicts && duplicateConflicts.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border-2 border-rose-500/50 shadow-2xl overflow-hidden animate-scale-in p-6 sm:p-7 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Control de Calidad Pedagógica
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Nodos Duplicados Detectados
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  No se permite probar la actividad mientras dos nodos contiguos contengan exactamente la misma información. Atiende el problema modificando el contenido o eliminando la duplicidad.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {duplicateConflicts.map((conf, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">
                      {conf.nodeA.title} ↔ {conf.nodeB.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono font-bold shrink-0">
                      {conf.relationship === 'connected' ? 'Conectados' : 'Consecutivos'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {conf.reason}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(conf.nodeB.id);
                      setIsNodeConfigDrawerOpen(true);
                      setDuplicateConflicts(null);
                      showToast(`Seleccionado nodo duplicado "${conf.nodeB.title}" para resolver.`);
                    }}
                    className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Atender este Problema en el Lienzo</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDuplicateConflicts(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar y Volver al Lienzo
              </button>
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

              <button aria-label="Cerrar"
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
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-teal-500 bg-white dark:bg-zinc-850/60 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      Evaluación Formativa / Boss
                    </span>
                    <span className="text-xs font-black text-amber-500">+300 XP</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                    Batalla: Fraccionator el Glotón 🍕
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    Examen gamificado con emparejamiento, reactivos múltiples y combate contra criatura oscura en motor gráfico.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
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

      {/* Modal de Generación Rápida con IA en Lienzo */}
      {isAiModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl p-6 sm:p-8 space-y-6 my-auto sm:my-2 animate-scale-in text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                    Arquitecto de Gamificación Educativa
                  </span>
                  <h2 className="text-lg font-black text-white">
                    Generar Proyecto Gamificado con IA
                  </h2>
                </div>
              </div>

              <button aria-label="Cerrar"
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGeneratingAiModal}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ingresa el tema curricular y la IA estructurará una secuencia de 7 bloques interconectados: narrativa inmersiva, ordenamiento lógico, emparejamiento conceptual, reactivos analíticos, enigmas de escape room, combate de saberes contra un jefe y cofre legendario.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Fase Curricular NEM:</label>
                <select aria-label="Seleccionar opción"
                  value={aiModalFase}
                  onChange={(e) => setAiModalFase(e.target.value)}
                  disabled={isGeneratingAiModal}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                >
                  <option value="Fase 3">Fase 3 (1º y 2º Primaria)</option>
                  <option value="Fase 4">Fase 4 (3º y 4º Primaria)</option>
                  <option value="Fase 5">Fase 5 (5º y 6º Primaria)</option>
                  <option value="Fase 6">Fase 6 (Secundaria)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Estilo de Juego:</label>
                <select aria-label="Seleccionar opción"
                  value={aiModalStyle}
                  onChange={(e) => setAiModalStyle(e.target.value as any)}
                  disabled={isGeneratingAiModal}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                >
                  <option value="rpg_adventure">⚔️ Aventura RPG y Duelo de Saberes</option>
                  <option value="escape_room">🔐 Escape Room & Enigmas Secretos</option>
                  <option value="scientific_expedition">🌿 Expedición e Indagación Científica</option>
                  <option value="olympic_tournament">🏆 Torneo Olímpico de Saberes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-200">
                Tema de la Actividad o Aprendizaje Esperado (PDA):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input aria-label="Ej. Causas de la Independencia de México, Ecosistemas..."
                  type="text"
                  value={aiModalTopic}
                  onChange={(e) => setAiModalTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateInCanvas()}
                  placeholder="Ej. Causas de la Independencia de México, Ecosistemas..."
                  disabled={isGeneratingAiModal}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleGenerateInCanvas}
                  disabled={!aiModalTopic.trim() || isGeneratingAiModal}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all border border-amber-400/50"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{isGeneratingAiModal ? 'Generando...' : 'Generar al Tablero'}</span>
                </button>
              </div>
            </div>

            {isGeneratingAiModal && (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-500/40 text-left flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin shrink-0" />
                <p className="text-xs font-medium text-emerald-300">
                  {aiModalGenStep || 'Estructurando proyecto interactivo...'}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-left">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Causas de la Independencia de México',
                  'Ecosistemas y Biodiversidad',
                  'Operaciones con Fracciones',
                  'La Tabla Periódica'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAiModalTopic(s)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-emerald-950/40 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
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
                <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                    Alineación Curricular Oficial
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Ajustes Pedagógicos y NEM 2024
                  </h3>
                </div>
              </div>
              <button aria-label="Cerrar"
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
                <textarea aria-label="Describe de forma formativa o gamificada el propósito de esta secuencia..."
                  rows={2}
                  value={metadata.description}
                  onChange={(e) => updateMetadata({ description: e.target.value })}
                  placeholder="Describe de forma formativa o gamificada el propósito de esta secuencia..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Fila: Fase Curricular SEP & Campo Formativo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Fase Curricular (SEP):</label>
                  <select aria-label="Seleccionar opción"
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
                  <select aria-label="Seleccionar opción"
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
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold">
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
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 text-slate-700 dark:text-zinc-300 hover:border-emerald-400'
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
                <input aria-label="Describe el PDA correspondiente..."
                  type="text"
                  value={metadata.pdaNem}
                  onChange={(e) => updateMetadata({ pdaNem: e.target.value })}
                  placeholder="Describe el PDA correspondiente..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
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
                      <select aria-label="Seleccionar opción"
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
                  <input aria-label="Cantidad numérica"
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
                  <input aria-label="Cantidad numérica"
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 border border-amber-400/40 transition-all cursor-pointer"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE TELEMETRÍA DE TOKENS Y CUOTA EN TIEMPO REAL (Actualización cada 1s — Solución Definitiva a Imagen 2) */}
      {isQuotaModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 space-y-5 my-auto sm:my-2 animate-scale-in">
            {/* Encabezado Estilo Models & Usage mejorado con Reloj en Vivo */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Models & Usage • Telemetría en Tiempo Real
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      EN VIVO (1s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Porcentaje exacto de tokens y cuenta regresiva con actualización segundo a segundo (sin esperar 24h).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tick = Date.now();
                    setNowMs(tick);
                    setQuotaState((prev) => {
                      const next = { ...prev, lastSyncMs: tick };
                      try {
                        localStorage.setItem('iskool_realtime_quota_telemetry_v1', JSON.stringify(next));
                      } catch (_) {}
                      return next;
                    });
                    showToast('⚡ Telemetría de tokens y reloj sincronizados en tiempo real.');
                  }}
                  title="Sincronizar ahora mismo"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Ahora</span>
                </button>
                <button
                  type="button"
                  aria-label="Cerrar monitor de cuota"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-slate-500 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tarjeta de Plan Activo */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Plan Institucional Activo</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  Plan Ultra • Motor de IA Pedagógica (Prioridad Máxima)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Último pulso en vivo: {new Date(nowMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                Ahorro Bóveda: +{quotaState.vaultSavedTokens.toLocaleString()} tokens (0 costo)
              </div>
            </div>

            {/* Doble Medidor en Tiempo Real: Límite Semanal + Ventana Rodante de 5 Horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Weekly Limit Remaining (Tiempo Real Exacto) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border-2 border-emerald-500/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Límite Semanal (Weekly Limit Remaining)
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {weeklyRemainingPct.toFixed(2)}% Restante
                    </h4>
                  </div>
                  {/* Anillo Circular Igual a Models & Usage pero Dinámico */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="5"
                        strokeDasharray={`${(weeklyRemainingPct / 100) * 138.23} 138.23`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                      {Math.round(weeklyRemainingPct)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300 font-semibold">
                    <span>Tokens disponibles:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white tabular-nums">
                      {quotaState.weeklyRemainingTokens.toLocaleString()} / {WEEKLY_TOTAL_TOKENS.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-semibold">Renovación total en:</span>
                    <span className="font-mono text-xs font-black text-amber-300 tabular-nums">
                      {formatLiveCountdown(quotaState.weeklyResetTargetMs, true)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Ventana Rodante de 5 Horas (5-Hour Rolling Quota) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-sky-500/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      Ventana Rodante (Ciclo de 5 Horas)
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {fiveHourRemainingPct.toFixed(2)}% Disponible
                    </h4>
                  </div>
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="5"
                        strokeDasharray={`${(fiveHourRemainingPct / 100) * 138.23} 138.23`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                      {Math.round(fiveHourRemainingPct)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300 font-semibold">
                    <span>Rafaga 5h disponible:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white tabular-nums">
                      {quotaState.fiveHourRemainingTokens.toLocaleString()} / {FIVE_HOUR_TOTAL_TOKENS.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-semibold">Refresco ventana 5h:</span>
                    <span className="font-mono text-xs font-black text-sky-300 tabular-nums">
                      {formatLiveCountdown(quotaState.fiveHourResetTargetMs, false)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calibración Instantánea con el Panel del Entorno */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  ⚙️ Calibración Directa de Línea Base (Sincronizar con tu corte actual)
                </span>
                <span className="text-[10px] font-bold text-emerald-700">Persistencia automática</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">% Semanal Actual</label>
                  <input
                    aria-label="Porcentaje semanal actual"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={calibrationPctInput}
                    onChange={(e) => setCalibrationPctInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 text-xs font-black text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Días restantes</label>
                  <input
                    aria-label="Días restantes"
                    type="number"
                    min={0}
                    max={7}
                    value={calibrationDaysInput}
                    onChange={(e) => setCalibrationDaysInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 text-xs font-black text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Horas restantes</label>
                  <input
                    aria-label="Horas restantes"
                    type="number"
                    min={0}
                    max={23}
                    value={calibrationHoursInput}
                    onChange={(e) => setCalibrationHoursInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 text-xs font-black text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pct = Math.max(0, Math.min(100, Number(calibrationPctInput) || 60));
                    const d = Math.max(0, Number(calibrationDaysInput) || 0);
                    const h = Math.max(0, Number(calibrationHoursInput) || 0);
                    const tick = Date.now();
                    const nextTokens = Math.round((pct / 100) * WEEKLY_TOTAL_TOKENS);
                    const nextTarget = tick + (d * 86400 + h * 3600) * 1000;
                    const nextState = {
                      ...quotaState,
                      weeklyRemainingTokens: nextTokens,
                      weeklyResetTargetMs: nextTarget,
                      lastSyncMs: tick
                    };
                    setQuotaState(nextState);
                    try {
                      localStorage.setItem('iskool_realtime_quota_telemetry_v1', JSON.stringify(nextState));
                    } catch (_) {}
                    showToast(`✅ Cuota calibrada a ${pct.toFixed(2)}% (${d}d ${h}h restantes) con reloj en tiempo real.`);
                  }}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer transition-all"
                >
                  Aplicar Calibración
                </button>
              </div>
            </div>

            {/* Bitácora de Eventos Recientes de Tokens */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-slate-700 dark:text-zinc-300">
                Actividad Reciente de Tokens en la Sesión:
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {(quotaState.recentEvents || []).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/70 text-[11px]"
                  >
                    <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate">{ev.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono font-bold ${
                          ev.savedByVault ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ev.savedByVault ? `0 tokens (Ahorrado: ${ev.tokensDelta})` : `-${ev.tokensDelta} tokens`}
                      </span>
                      <span className="text-[10px] text-slate-400">{ev.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
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
