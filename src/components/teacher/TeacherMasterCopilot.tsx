"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Sparkles, Clock, Users, CheckCircle2, AlertCircle, BookOpen, Send, Zap, 
  Play, Pause, SkipForward, Palette, Layers, Search, Filter, ArrowRight, 
  ExternalLink, Shield, Award, Eye, Check, X, ChevronRight, Calendar, 
  Stamp, FileCheck2, Flame, RefreshCw, SlidersHorizontal, Phone, 
  MessageCircle, FileText, LayoutDashboard, Gamepad2, Share2, 
  GraduationCap, Building2, Volume2, Lock, Unlock, Printer, Heart,
  ThumbsUp, UserCheck, AlertTriangle, ArrowLeft, Copy, Plus,
  Smartphone, Brain, ListChecks, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { DetailedStudent, PortfolioItem, Group, UserProfile } from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { usePlanningStore } from '@/store/usePlanningStore';
import { SUBJECTS_SEED } from '@/store/seeds';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';
import { ISkoolOfficialLogo } from '@/components/brand/ISkoolOfficialLogo';

const PlanningTab = dynamic(
  () => import('@/app/teacher/PlanningTab').then((mod) => mod.PlanningTab),
  { ssr: false }
);

export type CopilotTheme = 'daylight' | 'suizo' | 'esmeralda' | 'carbon' | 'heritage';
export type BloomLevelKey = 'recordar' | 'comprender' | 'aplicar' | 'analizar' | 'evaluar' | 'crear';

export interface PreparedClassSession {
  id: string;
  scheduleType: 'en_curso' | 'horario_diferido' | 'dia_diferido';
  dayLabel: string;
  timeRange: string;
  groupLabel: string;
  subjectName: string;
  topicTitle: string;
  pdaCode: string;
  pdaDescription: string;
  bloomLevel: BloomLevelKey;
  stampPage: string;
  primarySourceText: string;
  primarySourceCitation: string;
  detonatingQuestion: string;
  moments: {
    inicio: string;
    desarrollo: string;
    cierre: string;
  };
  vaultSynced?: boolean;
}

export const BLOOM_TAXONOMY_MATRIX: Record<BloomLevelKey, {
  order: number;
  label: string;
  shortTag: string;
  cognitiveProcess: string;
  colorPillLight: string;
  colorPillDark: string;
  verbs: string[];
  questionTemplate: (topic: string) => string;
  notebookDeliverable: (page: string) => string;
  rubricCriterion: string;
}> = {
  recordar: {
    order: 1,
    label: '1. Recordar',
    shortTag: 'Memoria Base',
    cognitiveProcess: 'Recuperar hechos, fechas y conceptos esenciales de la memoria a largo plazo.',
    colorPillLight: 'bg-slate-100 text-slate-800 border-slate-300',
    colorPillDark: 'bg-slate-800 text-slate-200 border-slate-600',
    verbs: ['Identificar', 'Fechar', 'Nombrar', 'Enlistar', 'Ubicar'],
    questionTemplate: (topic) => `¿Cuáles son las fechas, personajes y lugares clave que dieron origen a "${topic}"?`,
    notebookDeliverable: (page) => `${page}: Línea del tiempo cronológica con 5 hechos verificables.`,
    rubricCriterion: 'Identifica con exactitud cronológica los datos históricos fundamentales (+30 XP).'
  },
  comprender: {
    order: 2,
    label: '2. Comprender',
    shortTag: 'Interpretación',
    cognitiveProcess: 'Construir significado a partir de fuentes históricas, explicando causas con palabras propias.',
    colorPillLight: 'bg-sky-50 text-sky-800 border-sky-300',
    colorPillDark: 'bg-sky-950/70 text-sky-300 border-sky-700',
    verbs: ['Explicar', 'Parafrasear', 'Clasificar', 'Relacionar', 'Resumir'],
    questionTemplate: (topic) => `¿Cómo explicarías con tus propias palabras el mensaje central y las causas de "${topic}"?`,
    notebookDeliverable: (page) => `${page}: Mapa conceptual de causas y consecuencias explicadas por el alumno.`,
    rubricCriterion: 'Interpreta y relaciona causas históricas sin repetir de memoria (+40 XP).'
  },
  aplicar: {
    order: 3,
    label: '3. Aplicar',
    shortTag: 'Transferencia',
    cognitiveProcess: 'Utilizar el conocimiento adquirido para resolver un problema práctico o trazar un esquema.',
    colorPillLight: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    colorPillDark: 'bg-emerald-950/70 text-emerald-300 border-emerald-700',
    verbs: ['Trazar', 'Resolver', 'Dramatizar', 'Ejemplificar', 'Demostrar'],
    questionTemplate: (topic) => `¿Cómo aplicarías los principios de "${topic}" para resolver un dilema ciudadano actual en tu comunidad?`,
    notebookDeliverable: (page) => `${page}: Resolución práctica de estudio de caso y trazado en libreta.`,
    rubricCriterion: 'Aplica los conceptos del PDA en ejercicios prácticos de libreta (+50 XP).'
  },
  analizar: {
    order: 4,
    label: '4. Analizar',
    shortTag: 'Pensamiento Crítico',
    cognitiveProcess: 'Desglosar el fenómeno en sus partes e investigar motivaciones económicas, sociales y políticas.',
    colorPillLight: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    colorPillDark: 'bg-indigo-950/70 text-indigo-300 border-indigo-700',
    verbs: ['Contrastar', 'Desglosar', 'Debatir', 'Investigar', 'Diferenciar'],
    questionTemplate: (topic) => `¿Qué intereses sociales y económicos movieron a los distintos grupos en "${topic}" y cómo se contrastan sus posturas?`,
    notebookDeliverable: (page) => `${page}: Cuadro analítico comparativo de actores sociales y fuentes primarias.`,
    rubricCriterion: 'Analiza críticamente intereses y evidencias primarias con rigor histórico (+50 XP).'
  },
  evaluar: {
    order: 5,
    label: '5. Evaluar',
    shortTag: 'Juicio Fundamentado',
    cognitiveProcess: 'Emitir juicios críticos basados en criterios éticos, constitucionales y evidencia histórica.',
    colorPillLight: 'bg-amber-50 text-amber-900 border-amber-300',
    colorPillDark: 'bg-amber-950/70 text-amber-300 border-amber-700',
    verbs: ['Argumentar', 'Justificar', 'Valorar', 'Defender', 'Criticar'],
    questionTemplate: (topic) => `¿Cuál es tu postura argumentada sobre el impacto de "${topic}" y qué evidencias respaldan tu juicio?`,
    notebookDeliverable: (page) => `${page}: Ensayo breve de posicionamiento crítico con 3 argumentos verificables.`,
    rubricCriterion: 'Sustenta juicios propios con evidencia documental y pensamiento ético (+60 XP).'
  },
  crear: {
    order: 6,
    label: '6. Crear',
    shortTag: 'Síntesis y Producción NEM',
    cognitiveProcess: 'Integrar elementos para diseñar una propuesta original, manifiesto o proyecto comunitario.',
    colorPillLight: 'bg-purple-50 text-purple-900 border-purple-300',
    colorPillDark: 'bg-purple-950/70 text-purple-300 border-purple-700',
    verbs: ['Diseñar', 'Proponer', 'Redactar', 'Construir', 'Formular'],
    questionTemplate: (topic) => `A partir de "${topic}", ¿qué propuesta, proclama o proyecto comunitario diseñarías hoy para transformar tu entorno escolar?`,
    notebookDeliverable: (page) => `${page}: Diseño de proclama o prototipo de solución comunitaria NEM.`,
    rubricCriterion: 'Crea una propuesta original articulada con los ejes de la Nueva Escuela Mexicana (+75 XP).'
  }
};

const INITIAL_PREPARED_CLASSES: PreparedClassSession[] = [
  {
    id: 'prep-cls-1',
    scheduleType: 'en_curso',
    dayLabel: 'Hoy Lunes',
    timeRange: '08:00 - 08:50 AM',
    groupLabel: '1°A Secundaria',
    subjectName: 'Historia & Ciencias',
    topicTitle: 'Proclama de Dolores & Fuentes Primarias de 1810',
    pdaCode: 'NEM-HIS-F6-01',
    pdaDescription: 'Analiza las causas sociales, económicas y políticas de la gesta de Independencia de 1810 mediante fuentes primarias.',
    bloomLevel: 'analizar',
    stampPage: 'Pág. 48 - Ecuaciones y Cronología 1810',
    primarySourceText: '¡Hijos míos! una nueva dispensación nos viene hoy en este día... ¿os queréis ser libres? ¿Queréis libertar vuestras tierras que hace trescientos años os despojaron?',
    primarySourceCitation: 'Gesta de Dolores, 16 de septiembre de 1810 (Archivo Histórico Nacional)',
    detonatingQuestion: '¿Qué intereses sociales y económicos movieron a campesinos y criollos a unirse a la causa de Hidalgo en el Bajío?',
    moments: {
      inicio: 'Pase de lista visual (2 min) y lectura dramatizada de la Proclama de Dolores (8 min).',
      desarrollo: 'Análisis en equipos bajo Taxonomía de Bloom (Nivel 4: Analizar) y sellado de Pág. 48 en libreta física (30 min).',
      cierre: 'Puesta en común con Ruleta de Aula, rúbrica formativa (+50 XP) y envío de Magic Links (10 min).'
    },
    vaultSynced: true
  },
  {
    id: 'prep-cls-2',
    scheduleType: 'horario_diferido',
    dayLabel: 'Hoy Lunes (Horario Diferido)',
    timeRange: '11:20 AM - 12:10 PM',
    groupLabel: '2°B Secundaria',
    subjectName: 'Historia de México II',
    topicTitle: 'Constitución de 1917: Garantías Sociales (Arts. 3°, 27° y 123°)',
    pdaCode: 'NEM-HIS-F6-08',
    pdaDescription: 'Evalúa el impacto histórico y vigente de los artículos sociales del Congreso Constituyente de Querétaro de 1917.',
    bloomLevel: 'evaluar',
    stampPage: 'Pág. 52 - Cuadro Constitucional 1917',
    primarySourceText: 'La Nación tendrá en todo tiempo el derecho de imponer a la propiedad privada las modalidades que dicte el interés público, así como el de regular el aprovechamiento de los elementos naturales.',
    primarySourceCitation: 'Artículo 27 de la Constitución Política de los Estados Unidos Mexicanos (5 de febrero de 1917)',
    detonatingQuestion: '¿Por qué la Constitución Mexicana de 1917 fue reconocida mundialmente como la primera carta magna social del siglo XX?',
    moments: {
      inicio: 'Activación de conocimientos previos y contraste entre la Constitución de 1857 y 1917 (10 min).',
      desarrollo: 'Debate estructurado (Bloom Nivel 5: Evaluar) sobre educación laica, tierra y derechos laborales + Sello Pág. 52 (28 min).',
      cierre: 'Juicio crítico escrito en libreta y certificación de evidencias en portafolio (12 min).'
    },
    vaultSynced: true
  },
  {
    id: 'prep-cls-3',
    scheduleType: 'dia_diferido',
    dayLabel: 'Mañana Martes (Día Diferido)',
    timeRange: '08:00 - 08:50 AM',
    groupLabel: '1°A Secundaria',
    subjectName: 'Historia & Ciencias',
    topicTitle: 'Conspiración de Querétaro y el Liderazgo de Doña Josefa Ortiz',
    pdaCode: 'NEM-HIS-F6-02',
    pdaDescription: 'Aplica el análisis de redes epistolares para comprender la organización clandestina de las tertulias de Querétaro.',
    bloomLevel: 'aplicar',
    stampPage: 'Pág. 50 - Red Insurgente del Bajío',
    primarySourceText: 'No teniendo otro medio para avisar el peligro en que se hallaba la causa, di tres golpes en el suelo con el tacón de mi calzado para que el alcaide Pérez acudiera al llamado.',
    primarySourceCitation: 'Memoria Histórica de Doña Josefa Ortiz de Domínguez, Querétaro (Septiembre de 1810)',
    detonatingQuestion: '¿Cómo logró la red de Querétaro articular mensajes estratégicos hacia San Miguel el Grande y Dolores en menos de 12 horas?',
    moments: {
      inicio: 'Diálogo inmersivo en primera persona con Doña Josefa Ortiz y planteamiento del reto (10 min).',
      desarrollo: 'Trazado de la ruta Querétaro-San Miguel-Dolores en libreta (Bloom Nivel 3: Aplicar) y sellado de Pág. 50 (25 min).',
      cierre: 'Retroalimentación formativa y asignación de insignias de participación (15 min).'
    },
    vaultSynced: true
  },
  {
    id: 'prep-cls-4',
    scheduleType: 'dia_diferido',
    dayLabel: 'Jueves (Día Diferido)',
    timeRange: '09:30 - 10:20 AM',
    groupLabel: '1°A Secundaria',
    subjectName: 'Formación Cívica y Ética',
    topicTitle: 'Proyecto NEM: Cabildo Escolar y Soluciones Comunitarias',
    pdaCode: 'NEM-FCE-F6-12',
    pdaDescription: 'Crea propuestas colectivas de mejora escolar mediante mecanismos de democracia participativa y deliberación pacífica.',
    bloomLevel: 'crear',
    stampPage: 'Pág. 54 - Acta de Cabildo Escolar',
    primarySourceText: 'La democracia no es solamente una estructura jurídica y un régimen político, sino un sistema de vida fundado en el constante mejoramiento económico, social y cultural del pueblo.',
    primarySourceCitation: 'Artículo 3° Constitucional • Principios de la Nueva Escuela Mexicana',
    detonatingQuestion: '¿Qué iniciativa concreta podemos diseñar y ejecutar este mes en nuestra escuela para fortalecer la convivencia y el cuidado ambiental?',
    moments: {
      inicio: 'Diagnóstico participativo de necesidades del plantel (10 min).',
      desarrollo: 'Diseño de pliego propositivo por gremios (Bloom Nivel 6: Crear) y registro en Pág. 54 (30 min).',
      cierre: 'Votación en aula, firma de compromisos y envío de boletín por Magic Link a familias (10 min).'
    },
    vaultSynced: true
  }
];

interface TeacherMasterCopilotProps {
  teacher: UserProfile;
  students: DetailedStudent[];
  groups: Group[];
  portfolioItems: PortfolioItem[];
  onOpenClassicHub?: () => void;
  onOpenPlanning?: () => void;
  onOpenEmergency?: () => void;
}

export const TeacherMasterCopilot: React.FC<TeacherMasterCopilotProps> = ({
  teacher,
  students,
  groups,
  portfolioItems,
  onOpenPlanning,
  onOpenEmergency
}) => {
  const router = useRouter();
  const { saveAttendanceList, schedulesList, subjectsList } = useSchoolAdminStore();
  const { reviewPortfolioItem } = usePortfolioStore();
  const { addCampaign } = usePlanningStore();
  const effectiveSubjects = useMemo(
    () => (Array.isArray(subjectsList) && subjectsList.length > 0 ? subjectsList : SUBJECTS_SEED),
    [subjectsList]
  );
  const effectiveSchedules = useMemo(
    () => (Array.isArray(schedulesList) ? schedulesList : []),
    [schedulesList]
  );

  const getStudentFullName = (s?: DetailedStudent | null) => {
    if (!s) return 'Estudiante';
    return `${s.first_name} ${s.last_name_1 || ''} ${s.last_name_2 || ''}`.trim();
  };

  // -------------------------------------------------------------
  // 1. TEMA Y APARIENCIA VISUAL (REDISEÑO 3: DAYLIGHT STUDIO PRO POR DEFECTO)
  // -------------------------------------------------------------
  const [theme, setTheme] = useState<CopilotTheme>('daylight');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'projector'>('standard');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [autoSyncVault, setAutoSyncVault] = useState<boolean>(true);
  const [autoBloomSuggestions, setAutoBloomSuggestions] = useState<boolean>(true);
  const [highContrastBorders, setHighContrastBorders] = useState<boolean>(false);

  // Cargar preferencias persistidas del docente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('iskool_teacher_copilot_prefs_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (typeof parsed.sidebarExpanded === 'boolean') setSidebarExpanded(parsed.sidebarExpanded);
        if (typeof parsed.autoSyncVault === 'boolean') setAutoSyncVault(parsed.autoSyncVault);
        if (typeof parsed.autoBloomSuggestions === 'boolean') setAutoBloomSuggestions(parsed.autoBloomSuggestions);
        if (typeof parsed.highContrastBorders === 'boolean') setHighContrastBorders(parsed.highContrastBorders);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = (updates: Partial<{
    theme: CopilotTheme;
    fontSize: 'compact' | 'standard' | 'projector';
    sidebarExpanded: boolean;
    autoSyncVault: boolean;
    autoBloomSuggestions: boolean;
    highContrastBorders: boolean;
  }>) => {
    if (typeof window === 'undefined') return;
    try {
      const next = {
        theme: updates.theme ?? theme,
        fontSize: updates.fontSize ?? fontSize,
        sidebarExpanded: updates.sidebarExpanded ?? sidebarExpanded,
        autoSyncVault: updates.autoSyncVault ?? autoSyncVault,
        autoBloomSuggestions: updates.autoBloomSuggestions ?? autoBloomSuggestions,
        highContrastBorders: updates.highContrastBorders ?? highContrastBorders,
      };
      localStorage.setItem('iskool_teacher_copilot_prefs_v3', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // 2. NAVEGACIÓN PRINCIPAL
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'timeline' | 'stamps' | 'evidences' | 'planning' | 'classroom' | 'enlace' | 'settings'>('timeline');
  const [planningSubView, setPlanningSubView] = useState<'overview' | 'generator'>('overview');

  // -------------------------------------------------------------
  // 3. MOTOR DE CLASES PREPARADAS (HORARIOS Y DÍAS DIFERIDOS) + TAXONOMÍA DE BLOOM
  // -------------------------------------------------------------
  const [preparedClasses, setPreparedClasses] = useState<PreparedClassSession[]>(INITIAL_PREPARED_CLASSES);
  const [activePreparedClassId, setActivePreparedClassId] = useState<string>(INITIAL_PREPARED_CLASSES[0].id);
  const [activeBloomLevel, setActiveBloomLevel] = useState<BloomLevelKey>('analizar');
  const [showNewClassForm, setShowNewClassForm] = useState<boolean>(false);
  const [isQueryingVault, setIsQueryingVault] = useState<boolean>(false);
  const [vaultStatusBanner, setVaultStatusBanner] = useState<string | null>(null);

  // Estado para el formulario de nueva clase diferida
  const [newClassDraft, setNewClassDraft] = useState<{
    scheduleType: 'en_curso' | 'horario_diferido' | 'dia_diferido';
    dayLabel: string;
    timeRange: string;
    groupLabel: string;
    subjectName: string;
    topicTitle: string;
    pdaDescription: string;
    bloomLevel: BloomLevelKey;
    stampPage: string;
    momentsInicio: string;
    momentsDesarrollo: string;
    momentsCierre: string;
  }>({
    scheduleType: 'dia_diferido',
    dayLabel: 'Miércoles (Día Diferido)',
    timeRange: '10:00 - 10:50 AM',
    groupLabel: '1°A Secundaria',
    subjectName: 'Historia & Ciencias',
    topicTitle: 'Sentimientos de la Nación y el Congreso de Chilpancingo (1813)',
    pdaDescription: 'Analiza los postulados de soberanía popular, abolición de la esclavitud y división de poderes en los Sentimientos de la Nación.',
    bloomLevel: 'analizar',
    stampPage: 'Pág. 51 - Postulados de Morelos 1813',
    momentsInicio: 'Pase de lista visual y lectura de los puntos esenciales de Morelos en Chilpancingo (10 min).',
    momentsDesarrollo: 'Análisis comparativo en libreta bajo Taxonomía de Bloom y sellado de Pág. 51 (30 min).',
    momentsCierre: 'Síntesis colectiva, evaluación rápida (+50 XP) y notificación preventiva a tutores (10 min).'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedClasses = localStorage.getItem('iskool_prepared_classes_v1');
      if (savedClasses) {
        const parsed = JSON.parse(savedClasses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPreparedClasses(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const activePreparedClass = useMemo(() => {
    return preparedClasses.find(c => c.id === activePreparedClassId) || preparedClasses[0];
  }, [preparedClasses, activePreparedClassId]);

  const activeBloomConfig = useMemo(() => {
    return BLOOM_TAXONOMY_MATRIX[activeBloomLevel] || BLOOM_TAXONOMY_MATRIX.analizar;
  }, [activeBloomLevel]);

  // Reloj institucional en vivo
  const [currentTime, setCurrentTime] = useState<string>('09:35 AM');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Control de reproducción del Timeline
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(true);
  const [timelineProgress, setTimelineProgress] = useState<number>(68);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(1);

  const classNodes = useMemo(() => {
    const cls = activePreparedClass;
    const bloomCfg = BLOOM_TAXONOMY_MATRIX[activeBloomLevel];
    return [
      {
        id: 'node-1',
        title: '1. Inicio & Pase de Lista Visual',
        type: 'Asistencia',
        duration: '10 min',
        status: activeNodeIndex > 0 ? 'completed' : 'active',
        pda: cls?.moments?.inicio || 'Pase de lista con fotografía y activación diagnóstica.'
      },
      {
        id: 'node-2',
        title: `2. ${cls?.topicTitle?.slice(0, 32) || 'Análisis NEM'} (${bloomCfg.label})`,
        type: `Bloom: ${bloomCfg.shortTag}`,
        duration: '15 min',
        status: activeNodeIndex === 1 ? 'active' : activeNodeIndex > 1 ? 'completed' : 'upcoming',
        pda: `${cls?.pdaCode || 'PDA SEP'}: Verbo rector "${bloomCfg.verbs[0]}"`
      },
      {
        id: 'node-3',
        title: `3. Taller & Sello (${cls?.stampPage?.split(' - ')[0] || 'Pág. 48'})`,
        type: 'Práctica / Libreta',
        duration: '15 min',
        status: activeNodeIndex === 2 ? 'active' : activeNodeIndex > 2 ? 'completed' : 'upcoming',
        pda: bloomCfg.notebookDeliverable(cls?.stampPage?.split(' - ')[0] || 'Pág. 48')
      },
      {
        id: 'node-4',
        title: '4. Cierre, Rúbrica & Magic Links',
        type: 'Evaluación SEP',
        duration: '10 min',
        status: activeNodeIndex === 3 ? 'active' : 'upcoming',
        pda: bloomCfg.rubricCriterion
      }
    ];
  }, [activePreparedClass, activeBloomLevel, activeNodeIndex]);

  // -------------------------------------------------------------
  // 4. CONTROL DE ASISTENCIA & SELLOS DE LIBRETA (UNIVERSAL STAMPER)
  // -------------------------------------------------------------
  const [todayStampPage, setTodayStampPage] = useState<string>('Pág. 48 - Ecuaciones y Cronología 1810');
  const [stampedMap, setStampedMap] = useState<Record<string, { stamped: boolean; page: string; time: string }>>(() => {
    const initialStamps: Record<string, { stamped: boolean; page: string; time: string }> = {};
    students.forEach((std, idx) => {
      const isAbsent = idx === 6;
      const isUnstamped = idx === 4 || idx === 8;
      initialStamps[std.id] = {
        stamped: !isAbsent && !isUnstamped,
        page: 'Pág. 48',
        time: '09:12 AM'
      };
    });
    return initialStamps;
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'late' | 'absent' | 'excused'>>(() => {
    const initialAttendance: Record<string, 'present' | 'late' | 'absent' | 'excused'> = {};
    students.forEach((std, idx) => {
      initialAttendance[std.id] = idx === 6 ? 'absent' : idx === 2 ? 'late' : 'present';
    });
    return initialAttendance;
  });

  const [onlyUnstampedFilter, setOnlyUnstampedFilter] = useState<boolean>(false);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<DetailedStudent | null>(() => students[0] || null);

  // Activar cualquier clase preparada (en curso o diferida) con 1 clic
  const handleActivatePreparedClass = (cls: PreparedClassSession, goToTimeline = false) => {
    setActivePreparedClassId(cls.id);
    setActiveBloomLevel(cls.bloomLevel);
    setTodayStampPage(cls.stampPage);
    setVaultStatusBanner(`✓ Clase cargada en aula: "${cls.topicTitle}" (${cls.dayLabel} • ${cls.timeRange}) con Taxonomía de Bloom en nivel ${BLOOM_TAXONOMY_MATRIX[cls.bloomLevel].label}.`);
    setTimeout(() => setVaultStatusBanner(null), 6500);
    if (goToTimeline) {
      setActiveTab('timeline');
    }
  };

  // Consultar Bóveda Curricular (/api/vault) y autocompletar planeación con Bloom
  const handleConsultVaultForDraft = async () => {
    setIsQueryingVault(true);
    try {
      const query = encodeURIComponent(newClassDraft.topicTitle || 'Independencia');
      const res = await fetch(`/api/vault?q=${query}`, { credentials: 'include' });
      const bloomCfg = BLOOM_TAXONOMY_MATRIX[newClassDraft.bloomLevel];
      const pageShort = newClassDraft.stampPage.split(' - ')[0] || 'Pág. 51';

      if (res.ok) {
        const data = await res.json();
        const vaultNote = data?.note || (Array.isArray(data?.results) && data.results.length > 0 ? data.results[0] : null);
        if (vaultNote) {
          setNewClassDraft(prev => ({
            ...prev,
            pdaDescription: vaultNote.pda || vaultNote.summary || prev.pdaDescription,
            momentsInicio: vaultNote.inicio || `Activación desde Bóveda Curricular (${vaultNote.title || prev.topicTitle}): contextualización histórica y pregunta detonadora (10 min).`,
            momentsDesarrollo: `Actividad cognitiva de Bloom (${bloomCfg.label} — Verbos: ${bloomCfg.verbs.slice(0, 3).join(', ')}): ${bloomCfg.notebookDeliverable(pageShort)} (30 min).`,
            momentsCierre: vaultNote.cierre || `Evaluación formativa SEP: ${bloomCfg.rubricCriterion} y despacho de Magic Links (10 min).`
          }));
          setVaultStatusBanner(`✓ Nodo recuperado de la Bóveda Curricular ("${vaultNote.title || newClassDraft.topicTitle}") con 0 consumo innecesario y calibrado a ${bloomCfg.label}.`);
        } else {
          setNewClassDraft(prev => ({
            ...prev,
            momentsInicio: `Encuadre pedagógico NEM y activación diagnóstica sobre "${prev.topicTitle}" (10 min).`,
            momentsDesarrollo: `Secuencia de aprendizaje con Taxonomía de Bloom (${bloomCfg.label} — ${bloomCfg.verbs.slice(0, 3).join(', ')}): ${bloomCfg.notebookDeliverable(pageShort)} (30 min).`,
            momentsCierre: `Cierre metacognitivo: ${bloomCfg.rubricCriterion} (10 min).`
          }));
          setVaultStatusBanner(`✓ Estructura SEP NEM generada y calibrada automáticamente con Taxonomía de Bloom (${bloomCfg.label}).`);
        }
      }
    } catch {
      const bloomCfg = BLOOM_TAXONOMY_MATRIX[newClassDraft.bloomLevel];
      const pageShort = newClassDraft.stampPage.split(' - ')[0] || 'Pág. 51';
      setNewClassDraft(prev => ({
        ...prev,
        momentsDesarrollo: `Secuencia Bloom (${bloomCfg.label}): ${bloomCfg.notebookDeliverable(pageShort)} (30 min).`,
        momentsCierre: `Rúbrica formativa: ${bloomCfg.rubricCriterion} (10 min).`
      }));
    } finally {
      setIsQueryingVault(false);
      setTimeout(() => setVaultStatusBanner(null), 6500);
    }
  };

  // Guardar nueva clase preparada en horario o día diferido + persistir en Bóveda y Store
  const handleSaveNewPreparedClass = async () => {
    if (!newClassDraft.topicTitle.trim()) return;
    const bloomCfg = BLOOM_TAXONOMY_MATRIX[newClassDraft.bloomLevel];
    const created: PreparedClassSession = {
      id: `prep-cls-${Date.now().toString(36)}`,
      scheduleType: newClassDraft.scheduleType,
      dayLabel: newClassDraft.dayLabel,
      timeRange: newClassDraft.timeRange,
      groupLabel: newClassDraft.groupLabel,
      subjectName: newClassDraft.subjectName,
      topicTitle: newClassDraft.topicTitle.trim(),
      pdaCode: `NEM-${newClassDraft.subjectName.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      pdaDescription: newClassDraft.pdaDescription.trim(),
      bloomLevel: newClassDraft.bloomLevel,
      stampPage: newClassDraft.stampPage.trim() || 'Pág. 51',
      primarySourceText: `Documento curricular preparado para la sesión "${newClassDraft.topicTitle.trim()}" bajo el enfoque humanista y crítico de la Nueva Escuela Mexicana.`,
      primarySourceCitation: `Bóveda Curricular iSkool • ${newClassDraft.subjectName} (${newClassDraft.groupLabel})`,
      detonatingQuestion: bloomCfg.questionTemplate(newClassDraft.topicTitle.trim()),
      moments: {
        inicio: newClassDraft.momentsInicio,
        desarrollo: newClassDraft.momentsDesarrollo,
        cierre: newClassDraft.momentsCierre,
      },
      vaultSynced: true
    };

    const nextList = [created, ...preparedClasses];
    setPreparedClasses(nextList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('iskool_prepared_classes_v1', JSON.stringify(nextList));
      } catch {
        // ignore
      }
    }

    // Sincronizar con usePlanningStore global de ISkool
    try {
      addCampaign({
        id: created.id,
        subject_id: 'sub-his',
        subject_name: created.subjectName,
        level: created.groupLabel,
        reality_diagnosis: created.moments.inicio,
        problematic: created.detonatingQuestion,
        student_needs: `Taxonomía de Bloom: ${bloomCfg.label} (${bloomCfg.shortTag})`,
        campo_formativo_id: 'cf-etica',
        campo_formativo_name: 'Ética, Naturaleza y Sociedades',
        selected_pda_ids: [created.pdaCode],
        quests: [
          {
            title: created.topicTitle,
            description: created.pdaDescription,
            type: 'portfolio_submission',
            xp_reward: 50,
            coins_reward: 25,
            pda_ids: [created.pdaCode]
          }
        ],
        published_at: new Date().toISOString()
      });
    } catch {
      // ignore
    }

    // Persistir en Bóveda Curricular (/api/vault) con esquema oficial VaultPlanningSchema
    if (autoSyncVault) {
      fetch('/api/vault', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: created.topicTitle,
          teacherName: `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() || 'Docente Titular iSkool',
          gradeName: created.groupLabel,
          subjectName: created.subjectName,
          pda: created.pdaDescription,
          preguntasDetonadoras: [created.detonatingQuestion],
          inicio: created.moments.inicio,
          desarrollo: created.moments.desarrollo,
          cierre: created.moments.cierre,
          evaluacion: bloomCfg.rubricCriterion,
          materiales: `Libreta física (${created.stampPage}) y Orquestador Daylight Studio Pro`
        })
      }).catch(() => {});
    }

    setShowNewClassForm(false);
    setActivePreparedClassId(created.id);
    setActiveBloomLevel(created.bloomLevel);
    setTodayStampPage(created.stampPage);
    setVaultStatusBanner(`✓ Nueva clase diferida "${created.topicTitle}" (${created.dayLabel} • ${created.timeRange}) guardada en tu Agenda y sincronizada con la Bóveda Curricular.`);
    setTimeout(() => setVaultStatusBanner(null), 7000);
  };

  // Sellar página universal a todos los presentes
  const handleStampAllPresent = () => {
    const updated = { ...stampedMap };
    const shortPage = todayStampPage.split(' - ')[0] || 'Pág. 48';
    const timeNow = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    students.forEach(std => {
      const status = attendanceMap[std.id] || 'present';
      if (status === 'present' || status === 'late') {
        updated[std.id] = {
          stamped: true,
          page: shortPage,
          time: timeNow
        };
      }
    });
    setStampedMap(updated);
    setMagicLinkSentToast(`✓ Sello Gráfico Oficial (${shortPage}) aplicado a los ${presentCount} alumnos presentes en el aula.`);
    setTimeout(() => setMagicLinkSentToast(null), 5000);
  };

  // Conmutar sello individual
  const toggleStudentStamp = (studentId: string) => {
    const shortPage = todayStampPage.split(' - ')[0] || 'Pág. 48';
    setStampedMap(prev => {
      const current = prev[studentId];
      const isStamped = current?.stamped;
      return {
        ...prev,
        [studentId]: {
          stamped: !isStamped,
          page: shortPage,
          time: !isStamped ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
        }
      };
    });
  };

  // Conmutar presencia de alumno y sincronizar con useSchoolAdminStore (fuera del render updater)
  const toggleAttendanceStatus = (studentId: string, status: 'present' | 'late' | 'absent' | 'excused') => {
    const next = { ...attendanceMap, [studentId]: status };
    setAttendanceMap(next);
    setTimeout(() => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const records = students.map(s => ({
          student_id: s.id,
          group_id: groups[0]?.id || 'grp-sec-a',
          date: todayStr,
          status: (next[s.id] === 'late' ? 'retardo' : next[s.id] === 'absent' ? 'falta' : next[s.id] === 'excused' ? 'justificado' : 'presente') as 'presente' | 'retardo' | 'falta' | 'justificado',
          notes: `Pase de lista Daylight Studio Pro (${todayStampPage.split(' - ')[0]})`
        }));
        saveAttendanceList(records);
      } catch {
        // ignore
      }
    }, 0);
  };

  // Alumnos filtrados para sellos
  const studentsForStamps = useMemo(() => {
    if (!onlyUnstampedFilter) return students;
    return students.filter(std => !stampedMap[std.id]?.stamped);
  }, [students, onlyUnstampedFilter, stampedMap]);

  // =========================================================================
  // 4.5. MOTOR DE CALENDARIO DE CLASES, COMPENDIO DE ASISTENCIAS DIVIDIDAS
  //      Y TRAZABILIDAD DE SELLOS POR FECHA Y PERIODO (DAYLIGHT STUDIO PRO)
  // =========================================================================
  const [stampsSubView, setStampsSubView] = useState<'attendance_calendar' | 'stamps_calendar' | 'live_board'>('live_board');
  const [periodStartDate, setPeriodStartDate] = useState<string>('2026-10-16');
  const [periodEndDate, setPeriodEndDate] = useState<string>('2026-11-02');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-11-02');
  const [compendiumSearch, setCompendiumSearch] = useState<string>('');
  const [compendiumQuickFilter, setCompendiumQuickFilter] = useState<'all' | 'attendance_alert' | 'pending_stamps'>('all');
  const [countRetardoAsAttendance, setCountRetardoAsAttendance] = useState<boolean>(true);
  const [showAddStampDateModal, setShowAddStampDateModal] = useState<boolean>(false);
  const [newSessionDateInput, setNewSessionDateInput] = useState<string>('2026-11-04');
  const [newSessionPageInput, setNewSessionPageInput] = useState<string>('Pág. 50');
  const [newSessionWorkInput, setNewSessionWorkInput] = useState<string>('Cuadro Analítico de Garantías');
  const [newSessionTopicInput, setNewSessionTopicInput] = useState<string>('Consumación de la Independencia (1821)');

  const [customClassSessions, setCustomClassSessions] = useState<Array<{
    date: string;
    dayShort: string;
    weekday: string;
    stampPage: string;
    stampWorkTitle: string;
    topicTitle: string;
    bloomTag: string;
  }>>([]);

  // Catálogo cronológico de días en que el grupo tuvo clase y qué sello se asignó cada día
  const groupClassSessions = useMemo(() => {
    const activeTodayShortPage = todayStampPage.split(' - ')[0] || 'Pág. 48';
    const activeTodayWork = todayStampPage.includes(' - ') ? todayStampPage.split(' - ')[1] : 'Ecuaciones y Cronología 1810';
    const baseSessions = [
      {
        date: '2026-10-05',
        dayShort: 'Lun 05 Oct',
        weekday: 'Lunes',
        stampPage: 'Pág. 28',
        stampWorkTitle: 'Mapa de Intendencias Virreinales',
        topicTitle: 'Reformas Borbónicas y Organización Territorial',
        bloomTag: '2. Comprender'
      },
      {
        date: '2026-10-07',
        dayShort: 'Mié 07 Oct',
        weekday: 'Miércoles',
        stampPage: 'Pág. 30',
        stampWorkTitle: 'Cuadro Comparativo del Criollismo',
        topicTitle: 'Identidad Criolla y Tensiones Sociales',
        bloomTag: '3. Aplicar'
      },
      {
        date: '2026-10-09',
        dayShort: 'Vie 09 Oct',
        weekday: 'Viernes',
        stampPage: 'Pág. 32',
        stampWorkTitle: 'Línea del Tiempo Crisis de 1808',
        topicTitle: 'Invasión Napoleónica y Crisis de Soberanía',
        bloomTag: '4. Analizar'
      },
      {
        date: '2026-10-12',
        dayShort: 'Lun 12 Oct',
        weekday: 'Lunes',
        stampPage: 'Pág. 34',
        stampWorkTitle: 'Esquema Conjura de Valladolid',
        topicTitle: 'Primeras Conspiraciones Autonomistas (1809)',
        bloomTag: '3. Aplicar'
      },
      {
        date: '2026-10-14',
        dayShort: 'Mié 14 Oct',
        weekday: 'Miércoles',
        stampPage: 'Pág. 36',
        stampWorkTitle: 'Red de Actores de Querétaro',
        topicTitle: 'La Conspiración de Querétaro y Doña Josefa Ortiz',
        bloomTag: '4. Analizar'
      },
      {
        date: '2026-10-16',
        dayShort: 'Vie 16 Oct',
        weekday: 'Viernes',
        stampPage: 'Pág. 38',
        stampWorkTitle: 'Análisis de Fuentes Primarias 1810',
        topicTitle: 'El Estallido Insurgente en Dolores',
        bloomTag: '4. Analizar'
      },
      {
        date: '2026-10-19',
        dayShort: 'Lun 19 Oct',
        weekday: 'Lunes',
        stampPage: 'Pág. 40',
        stampWorkTitle: 'Croquis de la Ruta de Hidalgo',
        topicTitle: 'Marcha Insurgente y Toma de la Alhóndiga',
        bloomTag: '3. Aplicar'
      },
      {
        date: '2026-10-21',
        dayShort: 'Mié 21 Oct',
        weekday: 'Miércoles',
        stampPage: 'Pág. 41',
        stampWorkTitle: 'Bando de Abolición en Guadalajara',
        topicTitle: 'Decretos Sociales de Miguel Hidalgo',
        bloomTag: '5. Evaluar'
      },
      {
        date: '2026-10-23',
        dayShort: 'Vie 23 Oct',
        weekday: 'Viernes',
        stampPage: 'Pág. 42',
        stampWorkTitle: 'Fracciones Equivalentes & Estadística Insurgente',
        topicTitle: 'Proporción Demográfica del Ejército Insurgente',
        bloomTag: '3. Aplicar'
      },
      {
        date: '2026-10-26',
        dayShort: 'Lun 26 Oct',
        weekday: 'Lunes',
        stampPage: 'Pág. 44',
        stampWorkTitle: 'Síntesis Sentimientos de la Nación',
        topicTitle: 'José María Morelos y los 23 Puntos de Chilpancingo',
        bloomTag: '5. Evaluar'
      },
      {
        date: '2026-10-28',
        dayShort: 'Mié 28 Oct',
        weekday: 'Miércoles',
        stampPage: 'Pág. 45',
        stampWorkTitle: 'Sistema de Coordenadas y Campañas del Sur',
        topicTitle: 'Geometría Cartográfica de las Campañas de Morelos',
        bloomTag: '4. Analizar'
      },
      {
        date: '2026-10-30',
        dayShort: 'Vie 30 Oct',
        weekday: 'Viernes',
        stampPage: 'Pág. 47',
        stampWorkTitle: 'Mapa Conceptual Constitución de Apatzingán',
        topicTitle: 'División de Poderes en el Decreto de 1814',
        bloomTag: '6. Crear'
      },
      {
        date: '2026-11-02',
        dayShort: 'Lun 02 Nov (Hoy)',
        weekday: 'Lunes',
        stampPage: activeTodayShortPage,
        stampWorkTitle: activeTodayWork,
        topicTitle: activePreparedClass?.topicTitle || 'Proclama de Dolores & Fuentes Primarias de 1810',
        bloomTag: activeBloomConfig.label
      },
      ...customClassSessions
    ];
    return baseSessions
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s, idx) => ({ ...s, stampOrder: idx + 1 }));
  }, [todayStampPage, activePreparedClass, activeBloomConfig, customClassSessions]);

  // Overrides editables por fecha (YYYY-MM-DD -> studentId -> estado/sello)
  const [historicalAttendanceOverrides, setHistoricalAttendanceOverrides] = useState<
    Record<string, Record<string, 'present' | 'late' | 'absent' | 'excused'>>
  >({});
  const [historicalStampOverrides, setHistoricalStampOverrides] = useState<
    Record<string, Record<string, boolean>>
  >({});

  // Función determinista + overrides en vivo para obtener la asistencia de un alumno en cualquier fecha de clase
  const getStudentAttendanceOnDate = React.useCallback(
    (studentId: string, studentIdx: number, dateStr: string): 'present' | 'late' | 'absent' | 'excused' => {
      if (dateStr === '2026-11-02') {
        return attendanceMap[studentId] || 'present';
      }
      const override = historicalAttendanceOverrides[dateStr]?.[studentId];
      if (override) return override;

      // Patrón determinista realista por alumno y fecha
      const dateSeed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
      const combined = (studentIdx * 7 + dateSeed * 3) % 29;
      if (studentIdx === 6 && (dateStr === '2026-10-23' || dateStr === '2026-10-30')) return 'absent';
      if (studentIdx === 4 && dateStr === '2026-10-21') return 'absent';
      if (combined === 0) return 'absent';
      if (combined === 1 || combined === 14) return 'late';
      return 'present';
    },
    [attendanceMap, historicalAttendanceOverrides]
  );

  // Función determinista + overrides en vivo para saber si un alumno obtuvo el sello de una fecha específica
  const getStudentStampOnDate = React.useCallback(
    (studentId: string, studentIdx: number, dateStr: string): boolean => {
      if (dateStr === '2026-11-02') {
        return !!stampedMap[studentId]?.stamped;
      }
      const override = historicalStampOverrides[dateStr]?.[studentId];
      if (override !== undefined) return override;

      const attOnDay = getStudentAttendanceOnDate(studentId, studentIdx, dateStr);
      if (attOnDay === 'absent') return false;

      const dateSeed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
      const combined = (studentIdx * 11 + dateSeed * 5) % 23;
      if ((studentIdx === 4 || studentIdx === 8) && (dateStr === '2026-10-23' || dateStr === '2026-10-30')) {
        return false;
      }
      return combined !== 0;
    },
    [stampedMap, historicalStampOverrides, getStudentAttendanceOnDate]
  );

  // Cambiar asistencia de un alumno en cualquier fecha del calendario (hoy o histórica)
  const setStudentAttendanceForDate = (
    dateStr: string,
    studentId: string,
    status: 'present' | 'late' | 'absent' | 'excused'
  ) => {
    if (dateStr === '2026-11-02') {
      toggleAttendanceStatus(studentId, status);
      return;
    }
    setHistoricalAttendanceOverrides(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [studentId]: status
      }
    }));
  };

  // Alternar el sello de un alumno en cualquier fecha del calendario (hoy o histórica)
  const toggleStudentStampForDate = (dateStr: string, studentId: string, studentIdx: number) => {
    if (dateStr === '2026-11-02') {
      toggleStudentStamp(studentId);
      return;
    }
    const current = getStudentStampOnDate(studentId, studentIdx, dateStr);
    setHistoricalStampOverrides(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [studentId]: !current
      }
    }));
    const sessionObj = groupClassSessions.find(s => s.date === dateStr);
    setMagicLinkSentToast(
      `✓ Sello ${!current ? 'estampado' : 'retirado'} en fecha ${sessionObj?.dayShort || dateStr} (${sessionObj?.stampPage || 'Libreta'}) y compendio del periodo actualizado.`
    );
    setTimeout(() => setMagicLinkSentToast(null), 4500);
  };

  // Sellar a todos los presentes de la fecha seleccionada en el calendario
  const handleStampAllPresentOnDate = (dateStr: string) => {
    if (dateStr === '2026-11-02') {
      handleStampAllPresent();
      return;
    }
    const nextDateStamps: Record<string, boolean> = { ...(historicalStampOverrides[dateStr] || {}) };
    students.forEach((std, idx) => {
      const att = getStudentAttendanceOnDate(std.id, idx, dateStr);
      if (att !== 'absent') {
        nextDateStamps[std.id] = true;
      }
    });
    setHistoricalStampOverrides(prev => ({
      ...prev,
      [dateStr]: nextDateStamps
    }));
    const sessionObj = groupClassSessions.find(s => s.date === dateStr);
    setMagicLinkSentToast(
      `✓ Todos los alumnos presentes el ${sessionObj?.dayShort || dateStr} han sido sellados en ${sessionObj?.stampPage || 'su libreta'}.`
    );
    setTimeout(() => setMagicLinkSentToast(null), 5000);
  };

  // Registrar una nueva fecha de clase con sello en el calendario
  const handleAddCustomClassSession = () => {
    if (!newSessionDateInput || !newSessionPageInput.trim()) return;
    const dObj = new Date(`${newSessionDateInput}T12:00:00`);
    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dayShort = `${dayNamesShort[dObj.getDay()]} ${String(dObj.getDate()).padStart(2, '0')} ${monthNamesShort[dObj.getMonth()]}`;
    const weekday = dayNamesFull[dObj.getDay()];

    setCustomClassSessions(prev => [
      ...prev.filter(s => s.date !== newSessionDateInput),
      {
        date: newSessionDateInput,
        dayShort,
        weekday,
        stampPage: newSessionPageInput.trim(),
        stampWorkTitle: newSessionWorkInput.trim() || 'Actividad Sellada en Libreta',
        topicTitle: newSessionTopicInput.trim() || 'Sesión Curricular SEP NEM',
        bloomTag: activeBloomConfig.label
      }
    ]);

    if (newSessionDateInput > periodEndDate) {
      setPeriodEndDate(newSessionDateInput);
    }
    if (newSessionDateInput < periodStartDate) {
      setPeriodStartDate(newSessionDateInput);
    }
    setSelectedCalendarDate(newSessionDateInput);
    setShowAddStampDateModal(false);
    setMagicLinkSentToast(`✓ Nueva fecha de clase y sello (${dayShort} • ${newSessionPageInput.trim()}) agregada al Calendario y al Compendio del Periodo.`);
    setTimeout(() => setMagicLinkSentToast(null), 5500);
  };

  // Sesiones filtradas dentro del periodo seleccionado [periodStartDate, periodEndDate]
  const sessionsInSelectedPeriod = useMemo(() => {
    const start = periodStartDate <= periodEndDate ? periodStartDate : periodEndDate;
    const end = periodStartDate <= periodEndDate ? periodEndDate : periodStartDate;
    const filtered = groupClassSessions.filter(s => s.date >= start && s.date <= end);
    return filtered.length > 0 ? filtered : groupClassSessions.slice(-1);
  }, [groupClassSessions, periodStartDate, periodEndDate]);

  // Sesión actualmente seleccionada en el calendario interactivo
  const activeCalendarSession = useMemo(() => {
    return (
      groupClassSessions.find(s => s.date === selectedCalendarDate) ||
      sessionsInSelectedPeriod[sessionsInSelectedPeriod.length - 1] ||
      groupClassSessions[groupClassSessions.length - 1]
    );
  }, [groupClassSessions, selectedCalendarDate, sessionsInSelectedPeriod]);

  // Compendio Matemático por Alumno en el Periodo Seleccionado (Asistencias Divididas + Sellos Obtenidos)
  const studentPeriodCompendium = useMemo(() => {
    const totalClasses = Math.max(1, sessionsInSelectedPeriod.length);
    const totalStamps = Math.max(1, sessionsInSelectedPeriod.length);

    return students.map((std, idx) => {
      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;
      let excusedDays = 0;
      let stampsObtained = 0;

      const perSessionDetails = sessionsInSelectedPeriod.map(sess => {
        const attStatus = getStudentAttendanceOnDate(std.id, idx, sess.date);
        const hasStamp = getStudentStampOnDate(std.id, idx, sess.date);
        if (attStatus === 'present') presentDays += 1;
        else if (attStatus === 'late') lateDays += 1;
        else if (attStatus === 'absent') absentDays += 1;
        else excusedDays += 1;

        if (hasStamp) stampsObtained += 1;

        return {
          date: sess.date,
          dayShort: sess.dayShort,
          stampPage: sess.stampPage,
          stampWorkTitle: sess.stampWorkTitle,
          topicTitle: sess.topicTitle,
          attStatus,
          hasStamp
        };
      });

      const effectiveAttendances = countRetardoAsAttendance
        ? presentDays + lateDays + excusedDays
        : presentDays + excusedDays;
      const attendancePercentage = Number(((effectiveAttendances / totalClasses) * 100).toFixed(1));
      const stampsPending = Math.max(0, totalStamps - stampsObtained);
      const stampsPercentage = Number(((stampsObtained / totalStamps) * 100).toFixed(1));

      const selectedDayAtt = getStudentAttendanceOnDate(std.id, idx, activeCalendarSession.date);
      const selectedDayStamp = getStudentStampOnDate(std.id, idx, activeCalendarSession.date);

      return {
        student: std,
        studentIdx: idx,
        presentDays,
        lateDays,
        absentDays,
        excusedDays,
        effectiveAttendances,
        totalClasses,
        attendanceFractionLabel: `${effectiveAttendances} / ${totalClasses}`,
        attendancePercentage,
        stampsObtained,
        stampsPending,
        totalStamps,
        stampsFractionLabel: `${stampsObtained} / ${totalStamps}`,
        stampsPercentage,
        perSessionDetails,
        selectedDayAtt,
        selectedDayStamp
      };
    });
  }, [
    students,
    sessionsInSelectedPeriod,
    getStudentAttendanceOnDate,
    getStudentStampOnDate,
    countRetardoAsAttendance,
    activeCalendarSession
  ]);

  // Mapa rápido por ID de alumno para enriquecer las tarjetas en vivo con sus métricas del periodo
  const studentCompendiumMap = useMemo(() => {
    const map: Record<string, (typeof studentPeriodCompendium)[number]> = {};
    studentPeriodCompendium.forEach(item => {
      map[item.student.id] = item;
    });
    return map;
  }, [studentPeriodCompendium]);

  // Resumen global del grupo en el periodo seleccionado y en el día seleccionado del calendario
  const periodGroupSummary = useMemo(() => {
    const totalStudentsCount = Math.max(1, studentPeriodCompendium.length);
    const totalClasses = Math.max(1, sessionsInSelectedPeriod.length);
    const totalStamps = Math.max(1, sessionsInSelectedPeriod.length);

    const sumPresent = studentPeriodCompendium.reduce((acc, r) => acc + r.presentDays, 0);
    const sumLate = studentPeriodCompendium.reduce((acc, r) => acc + r.lateDays, 0);
    const sumAbsent = studentPeriodCompendium.reduce((acc, r) => acc + r.absentDays, 0);
    const sumEffectiveAtt = studentPeriodCompendium.reduce((acc, r) => acc + r.effectiveAttendances, 0);
    const sumStamps = studentPeriodCompendium.reduce((acc, r) => acc + r.stampsObtained, 0);

    const totalPossiblePersonClasses = totalStudentsCount * totalClasses;
    const groupAttendancePct = Number(((sumEffectiveAtt / totalPossiblePersonClasses) * 100).toFixed(1));
    const groupStampsPct = Number(((sumStamps / totalPossiblePersonClasses) * 100).toFixed(1));

    const selectedDayPresent = studentPeriodCompendium.filter(r => r.selectedDayAtt !== 'absent').length;
    const selectedDayLate = studentPeriodCompendium.filter(r => r.selectedDayAtt === 'late').length;
    const selectedDayAbsent = studentPeriodCompendium.filter(r => r.selectedDayAtt === 'absent').length;
    const selectedDayStamped = studentPeriodCompendium.filter(r => r.selectedDayStamp).length;

    return {
      totalClasses,
      totalStamps,
      sumPresent,
      sumLate,
      sumAbsent,
      sumEffectiveAtt,
      sumStamps,
      totalPossiblePersonClasses,
      groupAttendancePct,
      groupStampsPct,
      selectedDayPresent,
      selectedDayLate,
      selectedDayAbsent,
      selectedDayStamped
    };
  }, [studentPeriodCompendium, sessionsInSelectedPeriod]);

  // Filtrado de alumnos para la tabla de compendio
  const filteredCompendiumRows = useMemo(() => {
    return studentPeriodCompendium.filter(row => {
      const fullName = getStudentFullName(row.student).toLowerCase();
      if (compendiumSearch.trim() && !fullName.includes(compendiumSearch.trim().toLowerCase())) {
        return false;
      }
      if (compendiumQuickFilter === 'attendance_alert' && row.attendancePercentage >= 85) {
        return false;
      }
      if (compendiumQuickFilter === 'pending_stamps' && row.stampsPending === 0) {
        return false;
      }
      return true;
    });
  }, [studentPeriodCompendium, compendiumSearch, compendiumQuickFilter]);

  // -------------------------------------------------------------
  // 5. AUDITORÍA DE ENTREGAS Y PORTAFOLIO EN ISKOOL (CONECTADO A STORE REAL)
  // -------------------------------------------------------------
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'pending' | 'approved' | 'needs_revision'>('all');
  const [locallyApprovedIds, setLocallyApprovedIds] = useState<Record<string, boolean>>({});

  const filteredEvidences = useMemo(() => {
    return portfolioItems.filter(item => {
      const effectiveStatus = locallyApprovedIds[item.id] ? 'approved' : item.status;
      if (evidenceFilter === 'all') return true;
      return effectiveStatus === evidenceFilter;
    });
  }, [portfolioItems, evidenceFilter, locallyApprovedIds]);

  const handleApproveEvidenceItem = async (item: PortfolioItem) => {
    setLocallyApprovedIds(prev => ({ ...prev, [item.id]: true }));
    try {
      await reviewPortfolioItem(
        item.id,
        'approved',
        `Excelente trabajo verificado con Sello Digital iSkool (${todayStampPage.split(' - ')[0]}) bajo nivel cognitivo ${activeBloomConfig.label}.`,
        50,
        ['Ética, Naturaleza y Sociedades'],
        [activePreparedClass?.pdaCode || 'NEM-PDA-2026'],
        ['Pensamiento Crítico'],
        { critical: 25, communication: 25 }
      );
    } catch {
      // ignore fallback
    }
    setMagicLinkSentToast(`✓ Evidencia "${item.title}" aprobada y sellada (+50 XP sincronizados en el expediente del alumno).`);
    setTimeout(() => setMagicLinkSentToast(null), 5000);
  };

  // -------------------------------------------------------------
  // 6. ENLACE INSTITUCIONAL, SIMULADOR MÓVIL 1-TAP & MAGIC LINKS A PADRES
  // -------------------------------------------------------------
  const [directionCircularConfirmed, setDirectionCircularConfirmed] = useState<boolean>(false);
  const [magicLinkModalStudent, setMagicLinkModalStudent] = useState<DetailedStudent | null>(null);
  const [modalCustomPhone, setModalCustomPhone] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [magicLinkSentToast, setMagicLinkSentToast] = useState<string | null>(null);
  const [lastDispatchedMagicUrl, setLastDispatchedMagicUrl] = useState<string | null>(null);
  const [regularizedStampsMap, setRegularizedStampsMap] = useState<Record<string, Record<string, boolean>>>({});
  const [mobileSimSignedMap, setMobileSimSignedMap] = useState<Record<string, { signedAt: string; reply: string }>>({});
  const [mobileSimReplyInput, setMobileSimReplyInput] = useState<string>('Enterado profesor, revisaremos la libreta en casa hoy mismo. ¡Gracias!');

  const [enlaceStudentId, setEnlaceStudentId] = useState<string>(() => students[0]?.id || 's1');
  const [enlaceIncidentType, setEnlaceIncidentType] = useState<'conducta' | 'tarea' | 'merito' | 'citatorio'>('conducta');
  const [enlacePhone, setEnlacePhone] = useState<string>('+52 55 4829 8921');
  const [enlaceMessage, setEnlaceMessage] = useState<string>(
    'Estimado tutor: Se informa que en la sesión de hoy se revisó la libreta (Pág. 48) y el alumno mostró un avance sobresaliente en el análisis histórico.'
  );

  // Supervisión Espejo CEO en Tiempo Real
  const [ceoEndorsementBanner, setCeoEndorsementBanner] = useState<{ supervisor: string; timestamp: string; message: string } | null>(null);

  const getTutorInfoForStudent = (student?: DetailedStudent | null) => {
    if (!student) {
      return {
        tutorName: 'Jorge Ramírez (Padre de Familia)',
        phoneDisplay: '+52 55 4829 8921',
        phoneRaw: '525548298921',
      };
    }
    const lastName = student.last_name_1 || student.last_name_2 || 'Ramírez';
    const tutorFirstNames = ['Jorge', 'Claudia', 'Roberto', 'Mariana', 'Alejandro', 'Patricia', 'Fernando', 'Gabriela'];
    const hashIdx = student.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % tutorFirstNames.length;
    const roleLabel = hashIdx % 2 === 0 ? 'Padre de Familia' : 'Madre de Familia';
    const tutorName = student.tutor_name || `${tutorFirstNames[hashIdx]} ${lastName} (${roleLabel})`;
    const rawDigits = (student.phone || student.emergency_contact_phone || `554829${String(1000 + (hashIdx * 937) % 8999)}`).replace(/\D/g, '');
    const tenDigits = rawDigits.length >= 10 ? rawDigits.slice(-10) : '5548298921';
    return {
      tutorName,
      phoneDisplay: `+52 ${tenDigits.slice(0, 2)} ${tenDigits.slice(2, 6)} ${tenDigits.slice(6)}`,
      phoneRaw: `52${tenDigits}`,
    };
  };

  const activeEnlaceStudent = useMemo(() => {
    return students.find(s => s.id === enlaceStudentId) || selectedStudentForDossier || students[0] || null;
  }, [students, enlaceStudentId, selectedStudentForDossier]);

  const buildIncidentMessageTemplate = (
    student: DetailedStudent | null,
    type: 'conducta' | 'tarea' | 'merito' | 'citatorio'
  ) => {
    const fullName = getStudentFullName(student);
    const pageNum = todayStampPage.split(' - ')[0] || 'Pág. 48';
    const isStamped = student ? !!stampedMap[student.id]?.stamped : true;

    switch (type) {
      case 'conducta':
        return `Estimado tutor de ${fullName}: Se informa que en la sesión de hoy se revisó la libreta (${pageNum}) y damos seguimiento puntual a su participación y conducta formativa en el aula.`;
      case 'tarea':
        return `Estimado tutor de ${fullName}: Le notificamos que en la auditoría de cuaderno de hoy (${pageNum})${isStamped ? ' se registró observación de seguimiento' : ' quedó pendiente el sello de entrega'}. Solicitamos su apoyo en casa para regularizar la actividad y firmar de enterado.`;
      case 'merito':
        return `¡Felicidades familia de ${fullName}! En la sesión de hoy otorgamos una insignia de Mérito Académico (+50 XP) por su excelente desempeño en nivel ${activeBloomConfig.label} y libreta impecable en la ${pageNum}.`;
      case 'citatorio':
        return `Estimado tutor de ${fullName}: Por medio del presente enlace institucional le extendemos un atento citatorio de acompañamiento pedagógico para dialogar sobre el seguimiento académico del alumno. Por favor confirme de enterado con un toque.`;
    }
  };

  const handleSelectEnlaceStudent = (studentId: string) => {
    setEnlaceStudentId(studentId);
    const found = students.find(s => s.id === studentId) || null;
    if (found) {
      setSelectedStudentForDossier(found);
      const info = getTutorInfoForStudent(found);
      setEnlacePhone(info.phoneDisplay);
      setEnlaceMessage(buildIncidentMessageTemplate(found, enlaceIncidentType));
    }
  };

  const handleSelectIncidentType = (type: 'conducta' | 'tarea' | 'merito' | 'citatorio') => {
    setEnlaceIncidentType(type);
    setEnlaceMessage(buildIncidentMessageTemplate(activeEnlaceStudent, type));
  };

  // =========================================================================
  // SINCRONIZACIÓN 360° CON EL GENERADOR MAESTRO DE PLANEACIONES SEP NEM + IA
  // Convierte automáticamente la planeación y sus sesiones cronometradas en:
  // 1) Tarjetas de Agenda Multi-Clase (En Curso, Horario Diferido y Días Diferidos)
  // 2) Timeline en Vivo + Pizarra de Fuentes Primarias SEP + Pregunta Detonadora
  // 3) Nivel Activo de Taxonomía de Bloom + Página Oficial de Sello de Libreta
  // 4) Plantilla de Magic Link para Padres + Telemetría CEO en Tiempo Real
  // =========================================================================
  const handleSyncFromMasterGenerator = React.useCallback((payload: {
    planning: any;
    topic?: string;
    subjectName?: string;
    groupLabel: string;
    bloomLevel: BloomLevelKey;
    scheduleType: 'en_curso' | 'horario_diferido' | 'dia_diferido';
    dayLabel: string;
    timeRange: string;
    stampPage: string;
    sessionIndex?: number;
    goToTab?: 'timeline' | 'stamps' | 'evidences' | 'planning' | 'classroom' | 'enlace' | 'settings';
  }) => {
    const plan = payload.planning;
    if (!plan) return;
    const bloomKey: BloomLevelKey = payload.bloomLevel || 'analizar';
    const bloomCfg = BLOOM_TAXONOMY_MATRIX[bloomKey] || BLOOM_TAXONOMY_MATRIX.analizar;
    const rawSessions: Array<any> = Array.isArray(plan.sesiones) && plan.sesiones.length > 0
      ? plan.sesiones
      : [
          {
            numero: 1,
            titulo: payload.topic || plan.proyectoNombre || 'Sesión Curricular SEP NEM',
            inicio: 'Activación diagnóstica y encuadre pedagógico (10 min).',
            desarrollo: `Secuencia didáctica bajo Taxonomía de Bloom (${bloomCfg.label}) y trabajo en libreta (30 min).`,
            cierre: 'Puesta en común, evaluación formativa (+50 XP) y Magic Links (10 min).',
            entregableTangibles: payload.stampPage || 'Pág. 48'
          }
        ];

    const deferredScheduleTemplates: Array<{
      scheduleType: 'en_curso' | 'horario_diferido' | 'dia_diferido';
      dayLabel: string;
      timeRange: string;
    }> = [
      {
        scheduleType: payload.scheduleType || 'en_curso',
        dayLabel: payload.dayLabel || 'Hoy Lunes (En Curso)',
        timeRange: payload.timeRange || '08:00 - 08:50 AM'
      },
      {
        scheduleType: 'horario_diferido',
        dayLabel: 'Hoy (Horario Diferido)',
        timeRange: '11:20 AM - 12:10 PM'
      },
      {
        scheduleType: 'dia_diferido',
        dayLabel: 'Mañana (Día Diferido • Sesión 3)',
        timeRange: '08:00 - 08:50 AM'
      },
      {
        scheduleType: 'dia_diferido',
        dayLabel: 'Jueves (Día Diferido • Sesión 4)',
        timeRange: '09:30 - 10:20 AM'
      }
    ];

    const baseId = `gen-plan-${Date.now().toString(36)}`;
    const generatedSessions: PreparedClassSession[] = rawSessions.slice(0, 4).map((ses, idx) => {
      const slot = deferredScheduleTemplates[idx] || deferredScheduleTemplates[deferredScheduleTemplates.length - 1];
      const basePageMatch = (payload.stampPage || 'Pág. 48').match(/\d+/);
      const basePageNum = basePageMatch ? parseInt(basePageMatch[0], 10) : 48;
      const sessionPage = idx === 0
        ? (payload.stampPage || `Pág. ${basePageNum} - ${ses.entregableTangibles || payload.topic}`)
        : `Pág. ${basePageNum + idx * 2} - ${(ses.entregableTangibles || ses.titulo || payload.topic).slice(0, 32)}`;

      const cleanInicio = String(ses.inicio || '').replace(/\*\*/g, '').slice(0, 210);
      const cleanDesarrollo = String(ses.desarrollo || '').replace(/\*\*/g, '').slice(0, 240);
      const cleanCierre = String(ses.cierre || '').replace(/\*\*/g, '').slice(0, 210);

      return {
        id: `${baseId}-s${idx + 1}`,
        scheduleType: slot.scheduleType,
        dayLabel: slot.dayLabel,
        timeRange: slot.timeRange,
        groupLabel: payload.groupLabel || plan.gradoFase?.split('•')[0]?.trim() || '1°A Secundaria',
        subjectName: payload.subjectName || plan.disciplina || 'Historia & Ciencias',
        topicTitle: ses.titulo ? `S${ses.numero || idx + 1}: ${ses.titulo}` : `${payload.topic} (Sesión ${idx + 1})`,
        pdaCode: `NEM-${(payload.subjectName || 'SEP').slice(0, 3).toUpperCase()}-S${idx + 1}`,
        pdaDescription: String(plan.pdaOficial || 'Proceso de Desarrollo de Aprendizaje oficial SEP NEM sincronizado con Bóveda Curricular.'),
        bloomLevel: bloomKey,
        stampPage: sessionPage,
        primarySourceText: String(plan.diagnosticoPedagogico || plan.pdaOficial || `Proyecto NEM: "${plan.proyectoNombre || payload.topic}".`),
        primarySourceCitation: plan.libroSep?.titulo
          ? `Libro SEP: ${plan.libroSep.titulo} (${plan.libroSep.paginas || sessionPage.split(' - ')[0]})`
          : `Bóveda Curricular iSkool • ${plan.metodologiaNem || 'Aprendizaje Basado en Proyectos'}`,
        detonatingQuestion: bloomCfg.questionTemplate(ses.titulo || payload.topic || plan.proyectoNombre),
        moments: {
          inicio: cleanInicio || 'Encuadre pedagógico y pase de lista visual (10 min).',
          desarrollo: cleanDesarrollo || `Desarrollo cognitivo de Bloom (${bloomCfg.label}) y sellado de ${sessionPage.split(' - ')[0]} (30 min).`,
          cierre: cleanCierre || 'Evaluación formativa con rúbrica SEP (+50 XP) y Magic Links (10 min).'
        },
        vaultSynced: true
      };
    });

    const targetIdx = typeof payload.sessionIndex === 'number' && generatedSessions[payload.sessionIndex]
      ? payload.sessionIndex
      : 0;
    const primarySession = generatedSessions[targetIdx] || generatedSessions[0];

    setPreparedClasses(prev => {
      const filtered = prev.filter(item => !item.id.startsWith('gen-plan-'));
      const updated = [...generatedSessions, ...filtered].slice(0, 8);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('iskool_prepared_classes_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });

    setActivePreparedClassId(primarySession.id);
    setActiveBloomLevel(bloomKey);
    setTodayStampPage(primarySession.stampPage);
    setEnlaceMessage(
      `Estimado tutor: Hoy trabajamos en "${primarySession.topicTitle}" (${primarySession.subjectName}) en el nivel cognitivo ${bloomCfg.label} y revisamos en libreta la ${primarySession.stampPage.split(' - ')[0]}.`
    );

    setVaultStatusBanner(
      `✓ Sincronización 360° Completada: "${plan.proyectoNombre || payload.topic}" integrada en Bóveda (.MD), ${generatedSessions.length} Sesiones en Agenda Diferida, Pizarra de Mi Clase, Sello (${primarySession.stampPage.split(' - ')[0]}), Misión (+50 XP) y Magic Links.`
    );
    setTimeout(() => setVaultStatusBanner(null), 9000);

    if (payload.goToTab) {
      setActiveTab(payload.goToTab);
      if (payload.goToTab === 'planning') {
        setPlanningSubView('overview');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onGeneratorSync = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (customEvt.detail) {
        handleSyncFromMasterGenerator(customEvt.detail);
      }
    };
    window.addEventListener('iskool-planning-generated-sync', onGeneratorSync as EventListener);
    return () => {
      window.removeEventListener('iskool-planning-generated-sync', onGeneratorSync as EventListener);
    };
  }, [handleSyncFromMasterGenerator]);

  const [auditLogList, setAuditLogList] = useState<Array<{
    id: string;
    token: string;
    studentId: string;
    studentName: string;
    action: string;
    customMessage?: string;
    time: string;
    status: 'sent' | 'opened' | 'signed';
    signedBy?: string;
    parentReply?: string;
    magicUrl: string;
  }>>([
    {
      id: 'aud-1',
      token: 'ml_s3_seed_diego',
      studentId: 's3',
      studentName: 'Diego Ramírez',
      action: 'Reporte de Asistencia & Sello Pág. 48',
      time: '09:15 AM',
      status: 'signed',
      signedBy: 'Jorge Ramírez',
      parentReply: 'Enterado profesor, felicidades por el seguimiento.',
      magicUrl: '/parent?student_id=s3&token=ml_s3_seed_diego&auth=magic',
    },
    {
      id: 'aud-2',
      token: 'ml_s2_seed_mateo',
      studentId: 's2',
      studentName: 'Mateo Morales',
      action: 'Alerta de Retardo (08:08 AM) & Tarea Sellada',
      time: '08:20 AM',
      status: 'signed',
      signedBy: 'Claudia Morales',
      magicUrl: '/parent?student_id=s2&token=ml_s2_seed_mateo&auth=magic',
    },
    {
      id: 'aud-3',
      token: 'ml_s1_seed_sofia',
      studentId: 's1',
      studentName: 'Sofía Hernández',
      action: 'Felicitación Mérito Formativo (+50 XP)',
      time: '09:40 AM',
      status: 'sent',
      magicUrl: '/parent?student_id=s1&token=ml_s1_seed_sofia&auth=magic',
    },
  ]);

  // Sincronización bidireccional en vivo con /api/parent/magic-link, localStorage y BroadcastChannel
  useEffect(() => {
    const mapRecordsToAudit = (records: Array<Record<string, unknown>>) => {
      return records.map((r, idx) => ({
        id: String(r.token || `aud-${idx}`),
        token: String(r.token || `ml_seed_${idx}`),
        studentId: String(r.studentId || 's1'),
        studentName: String(r.studentName || 'Alumno'),
        action: String(r.incidentLabel || 'Reporte de Seguimiento'),
        customMessage: r.customMessage ? String(r.customMessage) : undefined,
        time: String(r.timeLabel || '09:30 AM'),
        status: (r.status === 'signed' ? 'signed' : r.status === 'opened' ? 'opened' : 'sent') as 'sent' | 'opened' | 'signed',
        signedBy: r.signedBy ? String(r.signedBy) : undefined,
        parentReply: r.parentReply ? String(r.parentReply) : undefined,
        magicUrl: String(r.magicUrl || `/parent?student_id=${encodeURIComponent(String(r.studentId || 's1'))}&token=${encodeURIComponent(String(r.token || ''))}&auth=magic`),
      }));
    };

    const fetchAuditTrail = async () => {
      try {
        const res = await fetch('/api/parent/magic-link', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.records) && data.records.length > 0) {
            setAuditLogList(mapRecordsToAudit(data.records));
            if (typeof window !== 'undefined') {
              localStorage.setItem('iskool_magic_links_v1', JSON.stringify(data.records));
            }
          }
        }
      } catch {
        if (typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem('iskool_magic_links_v1');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setAuditLogList(mapRecordsToAudit(parsed));
              }
            }
          } catch {
            // ignore
          }
        }
      }
    };

    fetchAuditTrail();

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('iskool_magic_links_channel');
      bc.onmessage = () => {
        fetchAuditTrail();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'iskool_magic_links_v1') {
        fetchAuditTrail();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    const pollInterval = setInterval(fetchAuditTrail, 5000);

    return () => {
      if (bc) bc.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
      clearInterval(pollInterval);
    };
  }, []);

  const openMagicLinkModal = (student: DetailedStudent) => {
    setMagicLinkModalStudent(student);
    const tutorInfo = getTutorInfoForStudent(student);
    setModalCustomPhone(student.phone || student.emergency_contact_phone || tutorInfo.phoneDisplay);
    setCopiedLink(false);
  };

  // Firma en 1-Tap desde el Simulador Móvil Integrado
  const handleSimulateOneTapParentSignature = async () => {
    const targetStudent = activeEnlaceStudent || students[0];
    if (!targetStudent) return;
    const tutorInfo = getTutorInfoForStudent(targetStudent);
    const fullName = getStudentFullName(targetStudent);
    const timeNow = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    const existingRecord = auditLogList.find(a => a.studentId === targetStudent.id);
    const tokenToSign = existingRecord?.token || `ml_${targetStudent.id}_${Date.now().toString(36)}`;
    const activePageShort = todayStampPage.split(' - ')[0] || 'Pág. 48';

    // Si no existía aún en el servidor, crearlo primero y luego firmarlo
    await fetch('/api/parent/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenToSign,
        studentId: targetStudent.id,
        studentName: fullName,
        groupLabel: activePreparedClass?.groupLabel || '1°A Secundaria',
        tutorName: tutorInfo.tutorName,
        phone: tutorInfo.phoneRaw,
        channel: 'whatsapp',
        incidentType: enlaceIncidentType,
        incidentLabel: `Reporte ${activePageShort} (${enlaceIncidentType.toUpperCase()})`,
        customMessage: enlaceMessage,
        attendanceStatus: 'present',
        stampPage: activePageShort,
        isStamped: !!stampedMap[targetStudent.id]?.stamped,
        xpAwarded: 50,
        teacherName: `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() || 'Docente Titular',
        subjectName: activePreparedClass?.subjectName || 'Historia & Ciencias',
        status: 'signed',
        signedAt: new Date().toISOString(),
        signedBy: tutorInfo.tutorName,
        parentReply: mobileSimReplyInput,
        timeLabel: timeNow,
        magicUrl: `/parent?student_id=${encodeURIComponent(targetStudent.id)}&token=${encodeURIComponent(tokenToSign)}&auth=magic`
      })
    }).catch(() => {});

    await fetch('/api/parent/magic-link', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenToSign,
        studentId: targetStudent.id,
        signedBy: tutorInfo.tutorName,
        parentReply: mobileSimReplyInput
      })
    }).catch(() => {});

    setMobileSimSignedMap(prev => ({
      ...prev,
      [targetStudent.id]: {
        signedAt: timeNow,
        reply: mobileSimReplyInput
      }
    }));

    setAuditLogList(prev => {
      const updated = prev.map(item =>
        item.studentId === targetStudent.id || item.token === tokenToSign
          ? { ...item, status: 'signed' as const, signedBy: tutorInfo.tutorName, parentReply: mobileSimReplyInput, time: timeNow }
          : item
      );
      const exists = updated.some(item => item.studentId === targetStudent.id || item.token === tokenToSign);
      if (!exists) {
        updated.unshift({
          id: tokenToSign,
          token: tokenToSign,
          studentId: targetStudent.id,
          studentName: fullName,
          action: `Firma 1-Tap Móvil • ${activePageShort}`,
          customMessage: enlaceMessage,
          time: timeNow,
          status: 'signed',
          signedBy: tutorInfo.tutorName,
          parentReply: mobileSimReplyInput,
          magicUrl: `/parent?student_id=${encodeURIComponent(targetStudent.id)}&token=${encodeURIComponent(tokenToSign)}&auth=magic`
        });
      }
      return updated;
    });

    setMagicLinkSentToast(`✓ Firma Digital 1-Tap recibida de ${tutorInfo.tutorName} (${fullName}) y sincronizada en Bitácora Oficial.`);
    setTimeout(() => setMagicLinkSentToast(null), 6000);
  };

  // Enviar y Disparar Magic Link Real Inmediato
  const handleSendMagicLink = async (
    student: DetailedStudent | null,
    channel: 'whatsapp' | 'sms' | 'direct',
    targetPhone?: string,
    fromEnlacePanel?: boolean
  ) => {
    const targetStudent = student || activeEnlaceStudent || students[0];
    if (!targetStudent) return;

    const fullName = getStudentFullName(targetStudent);
    const tutorInfo = getTutorInfoForStudent(targetStudent);
    const att = attendanceMap[targetStudent.id] || 'present';
    const attLabel = att === 'present' ? 'Presente en Aula (08:00 AM) ✓' :
                     att === 'late' ? 'Retardo Registrado (08:15 AM) ⚠' :
                     att === 'absent' ? 'Falta en Aula ✗' : 'Justificado ℹ';

    const stamp = stampedMap[targetStudent.id];
    const activePage = stamp?.page || todayStampPage;
    const activePageShort = activePage.split(' - ')[0] || 'Pág. 48';
    const isStamped = !!stamp?.stamped;
    const stampLabel = isStamped 
      ? `${activePage} (Sellada y Aprobada) ✓` 
      : `${activePageShort} (Sin Sello / Pendiente) ✗`;

    const incidentType = fromEnlacePanel ? enlaceIncidentType : 'asistencia';
    const incidentLabelMap: Record<string, string> = {
      conducta: `Seguimiento de Conducta & Libreta (${activePageShort})`,
      tarea: `Alerta de Tarea Pendiente (${activePageShort})`,
      merito: `Felicitación Mérito Formativo (+50 XP) • ${activePageShort}`,
      citatorio: `Citatorio de Acompañamiento Escolar`,
      asistencia: `Reporte de Asistencia & Sello ${activePageShort}`,
    };
    const incidentLabel = incidentLabelMap[incidentType] || `Reporte de Seguimiento (${activePageShort})`;
    const customMsg = fromEnlacePanel
      ? enlaceMessage.trim()
      : `Estimado(a) ${tutorInfo.tutorName}: Se comparte el reporte de asistencia (${attLabel}) y auditoría de libreta física (${stampLabel}) de ${fullName}.`;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://iskool.edu.mx';
    const token = `ml_${targetStudent.id}_${Date.now().toString(36)}`;
    const relativeMagicUrl = `/parent?student_id=${encodeURIComponent(targetStudent.id)}&token=${encodeURIComponent(token)}&auth=magic`;
    const magicLinkUrl = `${origin}${relativeMagicUrl}`;

    const rawPhoneInput = targetPhone || (fromEnlacePanel ? enlacePhone : modalCustomPhone) || tutorInfo.phoneRaw;
    const rawPhone = rawPhoneInput.replace(/\D/g, '') || '525548298921';
    const intlPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;

    const timeNow = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const payloadRecord = {
      token,
      studentId: targetStudent.id,
      studentName: fullName,
      groupLabel: activePreparedClass?.groupLabel || '1°A Secundaria',
      tutorName: tutorInfo.tutorName,
      phone: intlPhone,
      channel,
      incidentType,
      incidentLabel,
      customMessage: customMsg,
      attendanceStatus: att === 'excused' ? 'present' : att,
      stampPage: activePageShort,
      isStamped,
      xpAwarded: incidentType === 'merito' ? 50 : 0,
      teacherName: `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() || 'Docente Titular ISkool',
      subjectName: activePreparedClass?.subjectName || 'Historia & Ciencias',
      createdAt: new Date().toISOString(),
      timeLabel: timeNow,
      status: 'sent' as const,
      magicUrl: relativeMagicUrl,
    };

    if (typeof window !== 'undefined') {
      try {
        const existingRaw = localStorage.getItem('iskool_magic_links_v1');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const updatedLocal = [payloadRecord, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem('iskool_magic_links_v1', JSON.stringify(updatedLocal));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('iskool_magic_links_channel');
          bc.postMessage({ type: 'MAGIC_LINK_CREATED', record: payloadRecord });
          bc.close();
        }
      } catch {
        // ignore
      }
    }

    fetch('/api/parent/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRecord),
    }).catch(() => {});

    const newEntry = {
      id: token,
      token,
      studentId: targetStudent.id,
      studentName: fullName,
      action: `${incidentLabel} • (${channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'Link Directo'})`,
      customMessage: customMsg,
      time: timeNow,
      status: 'sent' as const,
      magicUrl: relativeMagicUrl,
    };
    setAuditLogList(prev => [newEntry, ...prev.filter(item => item.token !== token)]);
    setLastDispatchedMagicUrl(relativeMagicUrl);

    if (channel === 'whatsapp') {
      const waMessage = 
`🏫 *ISkool - ${incidentLabel}*
Estimado(a) *${tutorInfo.tutorName}*:

${customMsg}

📅 *Fecha:* ${dateStr}
👤 *Alumno:* ${fullName} (${activePreparedClass?.groupLabel || '1°A Secundaria'})
📍 *Asistencia:* ${attLabel}
📖 *Libreta Física:* ${stampLabel}
${incidentType === 'merito' ? '🏆 *Mérito Otorgado:* +50 XP Formativos\n' : ''}
⚡ *Firme de enterado con 1 toque en su Magic Link Seguro (sin contraseñas):*
👉 ${magicLinkUrl}

_Reporte oficial emitido con sello criptográfico desde ISkool._`;

      const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(waMessage)}`;

      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(magicLinkUrl).catch(() => {});
        }
      }
      setMagicLinkSentToast(`✓ Magic Link (${incidentLabel}) enviado a ${tutorInfo.tutorName} (+${intlPhone}) y copiado al portapapeles.`);
    } else if (channel === 'sms') {
      const smsMessage = `ISkool [${incidentLabel}] ${fullName}: ${customMsg} Firme de enterado en 1 toque: ${magicLinkUrl}`;
      const smsUrl = `sms:${rawPhone}?body=${encodeURIComponent(smsMessage)}`;

      if (typeof window !== 'undefined') {
        window.open(smsUrl, '_blank');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(magicLinkUrl).catch(() => {});
        }
      }
      setMagicLinkSentToast(`✓ Magic Link enviado por SMS Seguro a (+${rawPhone}) y copiado al portapapeles.`);
    } else {
      if (typeof window !== 'undefined') {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(magicLinkUrl).catch(() => {});
        }
        window.open(relativeMagicUrl, '_blank');
      }
      setMagicLinkSentToast(`✓ Magic Link de ${fullName} generado y abierto en vista de Padre de Familia.`);
    }

    setTimeout(() => setMagicLinkSentToast(null), 8000);
    setMagicLinkModalStudent(null);
  };

  // -------------------------------------------------------------
  // 7. AULA GAMIFICADA (RULETA & GREMIOS SOBRIOS)
  // -------------------------------------------------------------
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSpotlightStudent, setSelectedSpotlightStudent] = useState<DetailedStudent | null>(students[0] || null);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleSpinWheel = () => {
    if (isSpinning || students.length === 0) return;
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedSpotlightStudent(students[randomIndex]);
      setIsSpinning(false);
      setTimerSeconds(30);
      setIsTimerRunning(true);
    }, 1400);
  };

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimeout(() => setIsTimerRunning(false), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Total de alumnos presentes y sellados
  const presentCount = useMemo(() => {
    return students.filter(s => (attendanceMap[s.id] || 'present') !== 'absent').length;
  }, [students, attendanceMap]);

  const stampedCount = useMemo(() => {
    return Object.values(stampedMap).filter(s => s.stamped).length;
  }, [stampedMap]);

  // -------------------------------------------------------------
  // 8. TELEMETRÍA ESPEJO EN TIEMPO REAL CON SUPERVISIÓN CEO
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const activeNodeObj = classNodes[activeNodeIndex] || classNodes[0];
    const signedCount = auditLogList.filter(a => a.status === 'signed').length;
    const pendingReviewsCount = portfolioItems.filter(p => !locallyApprovedIds[p.id] && p.status !== 'approved').length;
    const detail = {
      activeTab,
      groupLabel: activePreparedClass?.groupLabel || '1°A Secundaria',
      subjectLabel: activePreparedClass?.subjectName || 'Historia & Ciencias',
      activeSessionTitle: activePreparedClass?.topicTitle || 'Sesión Activa SEP NEM',
      scheduleSlot: `${activePreparedClass?.dayLabel || 'Hoy'} • ${activePreparedClass?.timeRange || '08:00 AM'}`,
      activeNodeTitle: `${activeNodeObj.title} (${timelineProgress}%)`,
      bloomLevel: `${activeBloomConfig.label} (${activeBloomConfig.shortTag})`,
      bloomVerb: activeBloomConfig.verbs.slice(0, 2).join(' / '),
      presentCount,
      totalStudents: students.length || 68,
      stampedCount,
      stampPage: todayStampPage.split(' - ')[0] || 'Pág. 48',
      pendingReviews: pendingReviewsCount,
      signedMagicLinks: signedCount,
      totalMagicLinks: auditLogList.length,
      deferredClassesCount: preparedClasses.length,
    };
    window.dispatchEvent(new CustomEvent('iskool-ceo-mirror-telemetry', { detail }));
  }, [
    activeTab,
    activeNodeIndex,
    timelineProgress,
    activeBloomConfig,
    activePreparedClass,
    presentCount,
    stampedCount,
    students.length,
    todayStampPage,
    auditLogList,
    preparedClasses.length,
    portfolioItems,
    locallyApprovedIds,
    classNodes
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onCeoEndorse = (e: Event) => {
      const custom = e as CustomEvent<{
        endorsed?: boolean;
        endorsedBy?: string;
        endorsedAt?: string;
        supervisor?: string;
        timestamp?: string;
        message?: string;
      }>;
      if (custom.detail) {
        if (custom.detail.endorsed === false) {
          setCeoEndorsementBanner(null);
        } else {
          const sup = custom.detail.endorsedBy || custom.detail.supervisor || 'Dirección General CEO';
          const ts = custom.detail.endorsedAt || custom.detail.timestamp || currentTime;
          setCeoEndorsementBanner({
            supervisor: sup,
            timestamp: ts,
            message: custom.detail.message || `Sesión auditada y visada en vivo por ${sup} (${ts}).`
          });
          setMagicLinkSentToast(`👑 Visado Ejecutivo CEO recibido en tiempo real: ${sup} (${ts}).`);
          setTimeout(() => setMagicLinkSentToast(null), 6000);
        }
      }
    };
    window.addEventListener('iskool-ceo-endorsement-action', onCeoEndorse);
    return () => window.removeEventListener('iskool-ceo-endorsement-action', onCeoEndorse);
  }, [currentTime]);

  // -------------------------------------------------------------
  // 9. CLASES DE TEMA (DAYLIGHT STUDIO PRO Y EDITORIAL SUIZO BIEN DIFERENCIADOS)
  // -------------------------------------------------------------
  const isLightMode = theme === 'daylight' || theme === 'suizo';

  // Escala tipográfica global real sobre el documento y contenedor para respuesta visual inmediata
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const rootHtml = document.documentElement;
    if (fontSize === 'projector') {
      rootHtml.style.fontSize = '18.5px';
    } else if (fontSize === 'compact') {
      rootHtml.style.fontSize = '14px';
    } else {
      rootHtml.style.fontSize = '16px';
    }
    return () => {
      rootHtml.style.fontSize = '16px';
    };
  }, [fontSize]);

  const themeClasses = useMemo(() => {
    switch (theme) {
      case 'daylight':
        return {
          bg: 'bg-gradient-to-br from-[#DBEAFE] via-[#EFF6FF] to-[#E0F2FE]',
          text: 'text-slate-900',
          subtext: 'text-slate-600',
          card: `bg-white ${highContrastBorders ? 'border-sky-600 border-2' : 'border-sky-300'} shadow-sm`,
          cardHover: 'hover:border-sky-500 hover:shadow-md',
          rail: 'bg-[#F0F7FF] border-r-2 border-sky-300',
          header: 'bg-[#F0F7FF]/95 backdrop-blur-md border-b-2 border-sky-300',
          accent: 'text-sky-700',
          accentBg: 'bg-gradient-to-r from-[#0284C7] to-[#1D63FF] text-white',
          pill: 'bg-sky-100 text-sky-950 border-sky-300',
          surfaceMuted: 'bg-[#E0F2FE]/65 border-sky-300 text-slate-900',
          surfaceElevated: 'bg-sky-100/90 border-sky-400 text-slate-900',
          inputBg: 'bg-white border-sky-300 text-slate-900 focus:border-sky-600',
          btnSecondary: 'bg-sky-100/80 hover:bg-sky-200/80 text-sky-950 border border-sky-300',
          divider: 'border-sky-200',
        };
      case 'suizo':
        return {
          bg: 'bg-gradient-to-br from-[#E6D7BE] via-[#EFE4CE] to-[#E2D1B3]',
          text: 'text-[#261E14]',
          subtext: 'text-[#6B563E]',
          card: `bg-[#FBF6EC] ${highContrastBorders ? 'border-[#9A3412] border-2' : 'border-[#C8B28B]'} shadow-sm`,
          cardHover: 'hover:border-[#C2410C] hover:shadow-md',
          rail: 'bg-[#EAE0C8] border-r-2 border-[#C8B28B]',
          header: 'bg-[#EAE0C8]/95 backdrop-blur-md border-b-2 border-[#C8B28B]',
          accent: 'text-[#9A3412]',
          accentBg: 'bg-gradient-to-r from-[#C2410C] to-[#9A3412] text-white',
          pill: 'bg-[#FDE68A]/70 text-[#78350F] border-[#D97706]',
          surfaceMuted: 'bg-[#EFE4CE] border-[#C8B28B] text-[#261E14]',
          surfaceElevated: 'bg-[#FDE68A]/50 border-[#D97706] text-[#261E14]',
          inputBg: 'bg-[#FFFDF9] border-[#C8B28B] text-[#261E14] focus:border-[#C2410C]',
          btnSecondary: 'bg-[#E5D5B5] hover:bg-[#DAC59E] text-[#261E14] border border-[#C8B28B]',
          divider: 'border-[#D4C09B]',
        };
      case 'heritage':
        return {
          bg: 'bg-[#160808]',
          text: 'text-amber-50',
          subtext: 'text-amber-200/70',
          card: 'bg-[#220E0E]/90 border-red-950/80 shadow-md',
          cardHover: 'hover:border-amber-500/40',
          rail: 'bg-[#1C0A0A] border-r border-red-950',
          header: 'bg-[#1C0A0A] border-b border-red-950',
          accent: 'text-amber-400',
          accentBg: 'bg-gradient-to-r from-red-800 to-amber-700 text-white',
          pill: 'bg-red-950/80 text-amber-300 border-red-900/60',
          surfaceMuted: 'bg-[#190909] border-red-950 text-amber-100',
          surfaceElevated: 'bg-red-950/50 border-amber-500/40 text-amber-100',
          inputBg: 'bg-[#140606] border-red-900 text-amber-50 focus:border-amber-400',
          btnSecondary: 'bg-red-950/80 hover:bg-red-900/80 text-amber-200 border border-red-900',
          divider: 'border-red-950',
        };
      case 'esmeralda':
        return {
          bg: 'bg-[#051C14]',
          text: 'text-emerald-50',
          subtext: 'text-emerald-200/70',
          card: 'bg-[#0A2E22]/90 border-emerald-950/80 shadow-md',
          cardHover: 'hover:border-emerald-500/40',
          rail: 'bg-[#06241A] border-r border-emerald-950',
          header: 'bg-[#06241A] border-b border-emerald-950',
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-600 text-white',
          pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-900/60',
          surfaceMuted: 'bg-[#062118] border-emerald-900/80 text-emerald-100',
          surfaceElevated: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100',
          inputBg: 'bg-[#041811] border-emerald-800 text-emerald-50 focus:border-emerald-400',
          btnSecondary: 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800',
          divider: 'border-emerald-900/70',
        };
      case 'carbon':
      default:
        return {
          bg: 'bg-[#070F1E]',
          text: 'text-slate-100',
          subtext: 'text-slate-400',
          card: 'bg-[#0D1829]/90 border-slate-800/80 shadow-md',
          cardHover: 'hover:border-cyan-500/40',
          rail: 'bg-[#0A1322] border-r border-slate-800',
          header: 'bg-[#0A1322] border-b border-slate-800',
          accent: 'text-cyan-400',
          accentBg: 'bg-cyan-500 text-slate-950',
          pill: 'bg-slate-900 text-cyan-300 border-slate-800',
          surfaceMuted: 'bg-slate-900/70 border-slate-800 text-slate-200',
          surfaceElevated: 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100',
          inputBg: 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400',
          btnSecondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
          divider: 'border-slate-800/70',
        };
    }
  }, [theme, highContrastBorders]);

  const zoomScale = fontSize === 'projector' ? 1.12 : fontSize === 'compact' ? 0.91 : 1;

  const unstampedCount = useMemo(() => {
    return students.filter(s => !stampedMap[s.id]?.stamped).length;
  }, [students, stampedMap]);

  return (
    <div
      style={{ zoom: zoomScale }}
      className={`min-h-screen w-full flex flex-col md:flex-row ${themeClasses.bg} ${themeClasses.text} transition-colors duration-200 font-sans antialiased overflow-x-clip rounded-2xl sm:rounded-3xl`}
    >
      
      {/* =========================================================================
          1. BARRA LATERAL IZQUIERDA PERMANENTE (DAYLIGHT STUDIO PRO)
          - Optimizada para Celular (barra horizontal táctil), Tablet, Laptop y Desktop
          - Logo oficial iSkool con fondo blanco arriba a la izquierda
          - Etiquetas claras en español + Contadores en Vivo
          - Ajustes del Sistema INMEDIATAMENTE ABAJO DE COMUNIDAD
          ========================================================================= */}
      <aside className={`w-full ${sidebarExpanded ? 'md:w-52 lg:w-60' : 'md:w-20'} shrink-0 ${themeClasses.rail} flex md:flex-col items-center md:items-stretch p-2 sm:p-2.5 md:p-3 z-40 shadow-xs border-b md:border-b-0 sticky top-0 md:top-2 md:max-h-[calc(100vh-1rem)] md:overflow-y-auto md:self-start no-scrollbar transition-all duration-200`}>
        <div className="w-full flex md:flex-col items-center md:items-stretch justify-start gap-2">
        
          {/* Cabecera del Sidebar: Logo Oficial iSkool Fondo Blanco + Botón Colapsar */}
          <div className={`flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 md:pb-2 md:border-b ${themeClasses.divider} shrink-0`}>
            <button 
              onClick={() => setActiveTab('timeline')}
              className="flex items-center gap-2 rounded-xl cursor-pointer group text-left min-w-0"
              title="iSkool Daylight Studio Pro — Ir a Mi Clase"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/brand/iskool-logo-fondo-blanco.jpg"
                  alt="iSkool Oficial"
                  className="w-8 h-8 md:w-9 md:h-9 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {sidebarExpanded && (
                <div className="min-w-0 hidden md:block">
                  <div className="font-black text-sm tracking-tight leading-none truncate">
                    iSkool<span className="text-sky-600">®</span> Studio
                  </div>
                  <div className={`text-[10px] font-bold ${themeClasses.subtext} truncate mt-0.5`}>
                    Daylight Studio Pro
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                const next = !sidebarExpanded;
                setSidebarExpanded(next);
                savePreferences({ sidebarExpanded: next });
              }}
              className={`hidden md:flex p-1.5 rounded-lg ${themeClasses.btnSecondary} cursor-pointer shrink-0`}
              title={sidebarExpanded ? 'Compactar barra lateral' : 'Expandir barra lateral con contadores'}
            >
              {sidebarExpanded ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navegación Principal de Aula con Contadores en Vivo (Táctil en Celular/Tablet y Vertical en Laptop/Desktop) */}
          <nav className="flex-1 md:flex-initial w-full flex md:flex-col items-center md:items-stretch gap-1 overflow-x-auto no-scrollbar py-0.5 md:py-1">
            {sidebarExpanded && (
              <div className={`hidden md:block text-[10px] font-black uppercase tracking-wider px-2 pt-1 pb-0.5 ${themeClasses.subtext}`}>
                Gestión de Clase en Vivo
              </div>
            )}

            {/* 1. Mi Clase (Timeline & Pizarra) */}
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'timeline' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="1. Mi Clase (Timeline, Fuente Primaria y Taxonomía de Bloom)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Mi Clase</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                  activeTab === 'timeline' ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-600'
                }`}>
                  En curso
                </span>
              )}
            </button>

            {/* 2. Sellos de Libreta & Asistencia */}
            <button
              onClick={() => setActiveTab('stamps')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer relative shrink-0 ${
                activeTab === 'stamps' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="2. Control de Asistencia y Sello Gráfico de Libreta"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Stamp className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Sellos Libreta</span>}
              </div>
              {sidebarExpanded ? (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                  activeTab === 'stamps'
                    ? 'bg-white/25 text-white'
                    : unstampedCount > 0
                      ? 'bg-rose-500/15 text-rose-600'
                      : 'bg-emerald-500/15 text-emerald-600'
                }`}>
                  {stampedCount}/{students.length || 68}
                </span>
              ) : (
                unstampedCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* 3. Tareas y Portafolio Digital */}
            <button
              onClick={() => setActiveTab('evidences')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'evidences' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="3. Tareas y Portafolio Digital iSkool"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Tareas y Portafolio</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                  activeTab === 'evidences' ? 'bg-white/25 text-white' : 'bg-sky-500/15 text-sky-700'
                }`}>
                  {portfolioItems.length}
                </span>
              )}
            </button>

            {/* 4. Planeación SEP NEM + Taxonomía de Bloom + Horarios/Días Diferidos */}
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'planning' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="4. Planeación SEP NEM, Taxonomía de Bloom y Clases en Horarios/Días Diferidos"
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Planeación SEP</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                  activeTab === 'planning' ? 'bg-white/25 text-white' : 'bg-indigo-500/15 text-indigo-700'
                }`}>
                  Bloom • {preparedClasses.length}
                </span>
              )}
            </button>

            {/* 5. Ruleta y Aula Gamificada */}
            <button
              onClick={() => setActiveTab('classroom')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'classroom' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="5. Ruleta de Participación, Gremios y Méritos XP"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gamepad2 className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Ruleta y Aula</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                  activeTab === 'classroom' ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-700'
                }`}>
                  +50 XP
                </span>
              )}
            </button>

            {/* 6. Magic Links Padres + Simulador Móvil 1-Tap */}
            <button
              onClick={() => setActiveTab('enlace')}
              className={`px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer relative shrink-0 ${
                activeTab === 'enlace' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.text} hover:bg-sky-500/10 font-bold`
              }`}
              title="6. Magic Links a Padres y Simulador Móvil 1-Tap"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Share2 className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Magic Links</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                  activeTab === 'enlace' ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-700'
                }`}>
                  {auditLogList.length}
                </span>
              )}
            </button>

            <div className={`w-full h-px my-1.5 hidden md:block border-t ${themeClasses.divider}`} />

            {sidebarExpanded && (
              <div className={`hidden md:block text-[10px] font-black uppercase tracking-wider px-2 pb-0.5 ${themeClasses.subtext}`}>
                Estudios Especializados
              </div>
            )}

            {/* Pilar 1: Centro de Idiomas y Fonética */}
            <button
              onClick={() => router.push('/teacher/idiomas')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer font-bold shrink-0`}
              title="Centro de Idiomas & Fonética Avanzada (/teacher/idiomas)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Volume2 className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Idiomas y Voz</span>}
              </div>
              {sidebarExpanded && (
                <span className="hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-black">
                  Fonética
                </span>
              )}
            </button>

            {/* Pilar 2: Estudio de Actividades Interactivas */}
            <button
              onClick={() => router.push('/teacher/studio')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 text-purple-600 hover:bg-purple-500/10 transition-all cursor-pointer font-bold shrink-0`}
              title="Estudio de Actividades y Libros Vivos (/teacher/studio)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Palette className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Estudio Bloques</span>}
              </div>
              {sidebarExpanded && (
                <span className="hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-black">
                  Studio
                </span>
              )}
            </button>

            {/* Pilar 3: Comunidad Docente */}
            <button
              onClick={() => router.push('/teacher/community')}
              className={`px-2.5 py-1.5 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 text-teal-600 hover:bg-teal-500/10 transition-all cursor-pointer font-bold shrink-0`}
              title="Comunidad Docente (80+ Recursos y Juegos)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Comunidad</span>}
              </div>
              {sidebarExpanded && (
                <span className="hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 font-black">
                  80+
                </span>
              )}
            </button>

            {/* =====================================================================
                AJUSTES DEL SISTEMA (INMEDIATAMENTE ABAJO DE COMUNIDAD)
                ===================================================================== */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`md:mt-1 px-2.5 py-2 rounded-xl flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'settings' 
                  ? `${themeClasses.accentBg} shadow-sm font-black` 
                  : `${themeClasses.surfaceMuted} border hover:border-sky-400 font-bold`
              }`}
              title="Ajustes del Sistema (Paletas de Color Internacionales, Tipografía WCAG 2.2 AAA, Bóveda y Preferencias)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                {sidebarExpanded && <span className="text-[11px] md:text-xs truncate">Ajustes del Sistema</span>}
              </div>
              {sidebarExpanded && (
                <span className={`hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded font-black ${
                  activeTab === 'settings' ? 'bg-white/25 text-white' : 'bg-sky-500/15 text-sky-700'
                }`}>
                  WCAG
                </span>
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* =========================================================================
          2. ÁREA DE TRABAJO PRINCIPAL & BARRA SUPERIOR DE COMANDO DOCENTE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Barra Superior de Comando Docente Unificada */}
        <header className={`w-full ${themeClasses.header} px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-30 shadow-xs`}>
          
          <div className="flex items-center gap-2 min-w-0 flex-wrap flex-1">
            {activeTab !== 'timeline' && (
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl ${themeClasses.accentBg} text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs`}
                title="Regresar a Mi Clase (Timeline & Pizarra)"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Volver a Mi Clase</span>
              </button>
            )}

            {/* Selector Rápido de Clases Preparadas (En Curso + Horarios/Días Diferidos) */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <select
                value={activePreparedClassId}
                onChange={(e) => {
                  const found = preparedClasses.find(c => c.id === e.target.value);
                  if (found) handleActivatePreparedClass(found, false);
                }}
                className={`w-full sm:w-auto max-w-[230px] sm:max-w-[340px] lg:max-w-[440px] truncate px-2.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer outline-hidden ${themeClasses.inputBg}`}
                title="Cambiar entre clase actual y clases preparadas en horarios o días diferidos"
              >
                {preparedClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.dayLabel} ({cls.timeRange}) • {cls.groupLabel} — {cls.topicTitle.slice(0, 38)}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicador de Nivel Cognitivo de Bloom Activo */}
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                isLightMode ? activeBloomConfig.colorPillLight : activeBloomConfig.colorPillDark
              }`}
              title="Nivel Cognitivo de la Taxonomía de Bloom activo en la clase (Clic para abrir matriz Bloom)"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Bloom: {activeBloomConfig.label}</span>
              <span className="opacity-75 hidden xl:inline">({activeBloomConfig.shortTag})</span>
            </button>
          </div>

          {/* Telemetría Rápida y Botones de 1 Clic en Cabecera */}
          <div className="flex items-center gap-2 flex-wrap">
            {ceoEndorsementBanner && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Visado CEO ({ceoEndorsementBanner.timestamp})</span>
              </span>
            )}

            <button
              onClick={() => {
                setActiveTab('stamps');
                setStampsSubView('attendance_calendar');
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'stamps' && stampsSubView === 'attendance_calendar'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : `${themeClasses.surfaceMuted} hover:border-emerald-500`
              }`}
              title="Abrir Calendario de Clases y Compendio de Asistencias Divididas por Periodo"
            >
              <UserCheck className={`w-3.5 h-3.5 ${activeTab === 'stamps' && stampsSubView === 'attendance_calendar' ? 'text-white' : 'text-emerald-600'}`} />
              <span>
                Asistencia: <strong className={activeTab === 'stamps' && stampsSubView === 'attendance_calendar' ? 'text-white' : 'text-emerald-600'}>{presentCount}/{students.length || 68}</strong>
                <span className="hidden lg:inline ml-1 opacity-85">• {periodGroupSummary.groupAttendancePct}% Periodo</span>
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stamps');
                setStampsSubView('stamps_calendar');
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'stamps' && stampsSubView === 'stamps_calendar'
                  ? `${themeClasses.accentBg} border-transparent shadow-xs`
                  : `${themeClasses.pill} hover:border-sky-500`
              }`}
              title="Abrir Calendario de Qué Día Fue Qué Sello y Compendio de Sellos por Periodo"
            >
              <Stamp className={`w-3.5 h-3.5 ${activeTab === 'stamps' && stampsSubView === 'stamps_calendar' ? 'text-white' : 'text-sky-600'}`} />
              <span>
                Sello Hoy: <strong>{todayStampPage.split(' - ')[0]}</strong> ({stampedCount}/{students.length || 68})
                <span className="hidden xl:inline ml-1 opacity-85">• {periodGroupSummary.totalStamps} Sellos Periodo</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('enlace')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Abrir Magic Links y Simulador Móvil 1-Tap"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Magic Link</span>
            </button>

            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                title="Protocolo de Emergencia Escolar Inmediato"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS</span>
              </button>
            )}
          </div>
        </header>

        {/* Banner Toast de Notificación / Bóveda / Magic Link */}
        {(magicLinkSentToast || vaultStatusBanner) && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shadow-md animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{magicLinkSentToast || vaultStatusBanner}</span>
            </span>
            <button
              onClick={() => {
                setMagicLinkSentToast(null);
                setVaultStatusBanner(null);
              }}
              className="cursor-pointer p-0.5 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            3. VISTA 1: MI CLASE (TIMELINE 2.0 + TAXONOMÍA DE BLOOM EN LAS ENTRAÑAS)
            ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            {/* Barra de Secuencia Didáctica (4 Nodos Conectados a Planeación SEP y Bloom) */}
            <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-3`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-black uppercase tracking-wider ${themeClasses.subtext}`}>
                    Secuencia Didáctica SEP NEM:
                  </span>
                  <span className="font-black text-xs md:text-sm">
                    {activePreparedClass?.topicTitle}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${themeClasses.pill}`}>
                    {activePreparedClass?.dayLabel} • {activePreparedClass?.timeRange}
                  </span>
                </div>

                {/* Controles de Ritmo de Clase */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                    className={`p-1.5 rounded-lg ${themeClasses.btnSecondary} transition-all cursor-pointer`}
                    title={isTimelinePlaying ? 'Pausar Cronómetro de Clase' : 'Reanudar Clase'}
                  >
                    {isTimelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button 
                    onClick={() => {
                      const next = Math.min(activeNodeIndex + 1, classNodes.length - 1);
                      setActiveNodeIndex(next);
                      setTimelineProgress(Math.round(((next + 0.65) / classNodes.length) * 100));
                    }}
                    className={`p-1.5 rounded-lg ${themeClasses.btnSecondary} transition-all cursor-pointer`}
                    title="Avanzar al Siguiente Momento Pedagógico"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${themeClasses.pill}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {currentTime}
                  </span>
                </div>
              </div>

              {/* 4 Nodos Interactivos del Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {classNodes.map((node, idx) => {
                  const isActive = idx === activeNodeIndex;
                  const isCompleted = idx < activeNodeIndex;

                  return (
                    <div 
                      key={node.id}
                      onClick={() => {
                        setActiveNodeIndex(idx);
                        setTimelineProgress(Math.round(((idx + 0.65) / classNodes.length) * 100));
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                        isActive 
                          ? `${themeClasses.surfaceElevated} border-2 border-sky-500 shadow-xs` 
                          : isCompleted 
                            ? `${themeClasses.surfaceMuted} border-emerald-500/50` 
                            : `${themeClasses.surfaceMuted} opacity-75 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold opacity-75">{node.duration}</span>
                        {isCompleted && <span className="text-emerald-600 font-black flex items-center gap-0.5"><Check className="w-3 h-3 stroke-[3]" /> Completado</span>}
                        {isActive && <span className="text-sky-600 font-black flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" /> En Pizarra</span>}
                        {!isActive && !isCompleted && <span className="opacity-50 font-semibold">Siguiente</span>}
                      </div>

                      <div className="font-black text-xs md:text-sm truncate">
                        {node.title}
                      </div>
                      
                      <div className={`text-[11px] ${themeClasses.subtext} truncate mt-0.5`}>
                        {node.pda}
                      </div>

                      {isActive && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-sky-600 h-full rounded-full transition-all duration-300" style={{ width: `${timelineProgress}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lienzo Activo del Nodo (72%) + Co-Pilot Dock de Acción Rápida (28%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* 72% Lienzo Didáctico Central con Escalera Cognitiva de Bloom Integrada */}
              <div className={`lg:col-span-8 p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className={`flex items-start sm:items-center justify-between border-b pb-3 ${themeClasses.divider} gap-2 flex-wrap`}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700">
                        PDA Oficial SEP: {activePreparedClass?.pdaCode}
                      </span>
                      <span className={`text-[10px] font-bold ${themeClasses.subtext}`}>
                        {activePreparedClass?.groupLabel} • {activePreparedClass?.subjectName}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black tracking-tight mt-1">
                      {activePreparedClass?.topicTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('planning')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${themeClasses.btnSecondary}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Horarios Diferidos ({preparedClasses.length})</span>
                    </button>
                    <button
                      onClick={() => router.push('/teacher/studio')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Abrir en Studio</span>
                    </button>
                  </div>
                </div>

                {/* ===============================================================
                    BARRA COGNITIVA DE LA TAXONOMÍA DE BLOOM EN VIVO (6 NIVELES)
                    En las entrañas de iSkool sin quitar el foco del gran diseño
                    =============================================================== */}
                <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} space-y-2`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>Andamiaje Cognitivo — Taxonomía de Bloom en Aula:</span>
                    </div>
                    <span className={`text-[11px] font-bold ${themeClasses.subtext}`}>
                      Verbos rectores: <strong className={themeClasses.text}>{activeBloomConfig.verbs.join(' • ')}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                    {(Object.keys(BLOOM_TAXONOMY_MATRIX) as BloomLevelKey[]).map((key) => {
                      const item = BLOOM_TAXONOMY_MATRIX[key];
                      const isSelected = activeBloomLevel === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveBloomLevel(key)}
                          className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? `${themeClasses.accentBg} border-transparent shadow-xs`
                              : `${themeClasses.card} hover:border-sky-400`
                          }`}
                        >
                          <div className="text-[11px] font-black leading-tight truncate">{item.label}</div>
                          <div className={`text-[9px] truncate ${isSelected ? 'text-white/90' : themeClasses.subtext}`}>
                            {item.verbs[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fuente Primaria Oficial para Proyección / Lectura */}
                <div className={`p-4 rounded-xl border ${themeClasses.surfaceMuted} space-y-2`}>
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <span>Lectura y Fuente Primaria en Pizarra:</span>
                    <span>PDA SEP NEM</span>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed italic font-serif">
                    &ldquo;{activePreparedClass?.primarySourceText}&rdquo;
                  </p>
                  <div className={`text-[11px] ${themeClasses.subtext} text-right font-medium`}>
                    — {activePreparedClass?.primarySourceCitation}
                  </div>
                </div>

                {/* Pregunta Detonadora Calibrada por Taxonomía de Bloom */}
                <div className={`p-4 rounded-xl border ${themeClasses.surfaceElevated} space-y-2`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-sky-800 dark:text-cyan-300">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>Pregunta Detonadora ({activeBloomConfig.label} — {activeBloomConfig.shortTag}):</span>
                    </label>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700">
                      Entregable: {todayStampPage.split(' - ')[0]}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm font-bold leading-snug">
                    {autoBloomSuggestions
                      ? activeBloomConfig.questionTemplate(activePreparedClass?.topicTitle || 'la sesión de hoy')
                      : activePreparedClass?.detonatingQuestion}
                  </div>
                  <div className={`text-[11px] ${themeClasses.subtext} pt-1 flex items-center justify-between flex-wrap gap-2`}>
                    <span>📋 <strong>Evidencia en Libreta:</strong> {activeBloomConfig.notebookDeliverable(todayStampPage.split(' - ')[0])}</span>
                    <span className="text-emerald-600 font-black">✓ {activeBloomConfig.rubricCriterion}</span>
                  </div>
                </div>
              </div>

              {/* 28% Co-Pilot Dock Derecho (Acciones de Aula en 1 Toque) */}
              <div className={`lg:col-span-4 p-4 rounded-2xl border ${themeClasses.card} space-y-4 flex flex-col justify-between`}>
                <div className="space-y-4">
                  <div className={`text-xs font-black uppercase tracking-wider ${themeClasses.subtext} border-b pb-2 ${themeClasses.divider} flex items-center justify-between`}>
                    <span>Acciones Directas de Aula</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-black">1-Clic</span>
                  </div>

                  {/* 1. Sellado Masivo de Libreta */}
                  <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} space-y-2`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black">Sello Gráfico de Libreta:</span>
                      <span className="font-mono font-black text-emerald-600">{stampedCount}/{students.length || 68}</span>
                    </div>
                    <button
                      onClick={handleStampAllPresent}
                      className={`w-full py-2.5 px-3 rounded-xl ${themeClasses.accentBg} font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      <Stamp className="w-4 h-4" />
                      <span>Sellar {todayStampPage.split(' - ')[0]} a Presentes ({presentCount})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('stamps')}
                      className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold ${themeClasses.btnSecondary} cursor-pointer`}
                    >
                      Auditar Cuadernos Individuales ({unstampedCount} sin sello)
                    </button>
                  </div>

                  {/* 2. Ruleta Rápida de Participación */}
                  <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} space-y-2`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black">Turno de Participación:</span>
                      {isTimerRunning && <span className="text-amber-600 font-mono font-black">{timerSeconds}s</span>}
                    </div>

                    {selectedSpotlightStudent && (
                      <div className={`p-2 rounded-lg border ${themeClasses.card} flex items-center gap-2.5`}>
                        <img
                          src={getStudentAvatarUrl(selectedSpotlightStudent)}
                          alt={selectedSpotlightStudent.first_name}
                          className="w-9 h-9 rounded-full object-cover border border-sky-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-[10px] uppercase font-black ${themeClasses.subtext}`}>Alumno en Turno:</div>
                          <div className="font-black text-xs truncate">
                            {getStudentFullName(selectedSpotlightStudent)}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSpinWheel}
                      disabled={isSpinning}
                      className={`w-full py-2 px-3 rounded-xl ${themeClasses.btnSecondary} font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSpinning ? 'animate-spin' : ''}`} />
                      <span>{isSpinning ? 'Seleccionando alumno...' : 'Sortear Turno con Ruleta'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Disparador Directo de Magic Link */}
                <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceElevated} space-y-2`}>
                  <div className="text-xs font-black flex items-center justify-between">
                    <span>Comunicación con Tutores:</span>
                    <span className="text-[10px] text-emerald-700 font-black">Cifrado 1-Tap</span>
                  </div>
                  <button
                    onClick={() => openMagicLinkModal(selectedSpotlightStudent || students[0])}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Enviar Magic Link al Tutor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. VISTA 2: SELLOS DE LIBRETA, CALENDARIO DE CLASES & COMPENDIO ANALÍTICO POR PERIODO
            ========================================================================= */}
        {activeTab === 'stamps' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            {/* 1. CABECERA MAESTRA + CONMUTADOR DE 3 VISTAS (CALENDARIO ASISTENCIAS / CALENDARIO SELLOS / TABLERO EN VIVO) */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stamp className="w-5 h-5 text-sky-600 shrink-0" />
                    <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight">
                      Centro de Asistencia, Calendario de Clases & Trazabilidad de Sellos de Libreta
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                      Cálculo Automático por Periodo
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${themeClasses.subtext} flex-wrap`}>
                    <span className="font-black text-sky-700">{activePreparedClass?.groupLabel || '1°A Secundaria'}</span>
                    <span>•</span>
                    <span>{students.length} Alumnos</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-black">
                      Hoy: {presentCount}/{students.length} Presentes ({periodGroupSummary.groupAttendancePct}% Asistencia en Periodo)
                    </span>
                    <span>•</span>
                    <span className="text-sky-700 font-black">
                      Sellos en Periodo ({periodStartDate} a {periodEndDate}): {periodGroupSummary.totalStamps} Sellos Oficiales ({periodGroupSummary.groupStampsPct}% Cumplimiento)
                    </span>
                  </div>
                </div>

                {/* Acciones rápidas de sellado de hoy y registro de nueva fecha/sello */}
                <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto justify-start xl:justify-end">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${themeClasses.inputBg}`}>
                    <span className="opacity-70 text-[11px] font-black">Sello Hoy:</span>
                    <input
                      type="text"
                      value={todayStampPage}
                      onChange={(e) => setTodayStampPage(e.target.value)}
                      className="bg-transparent font-black text-xs outline-hidden w-40 sm:w-44"
                      placeholder="Ej. Pág. 48 - Ecuaciones"
                    />
                  </div>

                  <button
                    onClick={() => handleStampAllPresentOnDate(activeCalendarSession.date)}
                    className={`px-3.5 py-2 rounded-xl ${themeClasses.accentBg} font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer`}
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>
                      Sellar Presentes ({activeCalendarSession.date === '2026-11-02' ? 'Hoy' : activeCalendarSession.dayShort}: {periodGroupSummary.selectedDayPresent})
                    </span>
                  </button>

                  <button
                    onClick={() => setShowAddStampDateModal(!showAddStampDateModal)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${themeClasses.btnSecondary}`}
                    title="Registrar una nueva fecha de clase y sello en el calendario del grupo"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                    <span>+ Nueva Fecha / Sello</span>
                  </button>
                </div>
              </div>

              {/* Barra Conmutadora de las 3 Vistas Especializadas */}
              <div className={`pt-3 border-t ${themeClasses.divider} grid grid-cols-1 md:grid-cols-3 gap-2`}>
                <button
                  onClick={() => setStampsSubView('attendance_calendar')}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    stampsSubView === 'attendance_calendar'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : `${themeClasses.surfaceMuted} hover:border-emerald-500`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="truncate">1. Calendario & Compendio de Asistencias</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                    stampsSubView === 'attendance_calendar' ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-700'
                  }`}>
                    {periodGroupSummary.totalClasses} Clases • {periodGroupSummary.groupAttendancePct}%
                  </span>
                </button>

                <button
                  onClick={() => setStampsSubView('stamps_calendar')}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    stampsSubView === 'stamps_calendar'
                      ? `${themeClasses.accentBg} border-transparent shadow-sm`
                      : `${themeClasses.surfaceMuted} hover:border-sky-500`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Stamp className="w-4 h-4 shrink-0" />
                    <span className="truncate">2. ¿Qué Día Fue Qué Sello? & Compendio Sellos</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                    stampsSubView === 'stamps_calendar' ? 'bg-white/20 text-white' : 'bg-sky-500/15 text-sky-700'
                  }`}>
                    {periodGroupSummary.totalStamps} Sellos • {periodGroupSummary.groupStampsPct}%
                  </span>
                </button>

                <button
                  onClick={() => setStampsSubView('live_board')}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    stampsSubView === 'live_board'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : `${themeClasses.surfaceMuted} hover:border-indigo-500`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">3. Tarjetas de Aula & Hoja de Libreta Escaneada</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                    stampsSubView === 'live_board' ? 'bg-white/20 text-white' : 'bg-indigo-500/15 text-indigo-700'
                  }`}>
                    {stampedCount}/{students.length} Hoy
                  </span>
                </button>
              </div>

              {/* Formulario rápido desplegable para agregar una nueva fecha de clase con sello */}
              {showAddStampDateModal && (
                <div className={`p-4 rounded-xl border ${themeClasses.surfaceElevated} space-y-3 animate-fade-in`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>Registrar Nueva Fecha de Clase y Sello Oficial en el Calendario</span>
                    </span>
                    <button onClick={() => setShowAddStampDateModal(false)} className="p-1 rounded hover:bg-black/10 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-1">Fecha de la Clase:</label>
                      <input
                        type="date"
                        value={newSessionDateInput}
                        onChange={(e) => setNewSessionDateInput(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${themeClasses.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-1">Página del Sello:</label>
                      <input
                        type="text"
                        value={newSessionPageInput}
                        onChange={(e) => setNewSessionPageInput(e.target.value)}
                        placeholder="Ej. Pág. 50"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${themeClasses.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-1">Trabajo / Entregable Sellado:</label>
                      <input
                        type="text"
                        value={newSessionWorkInput}
                        onChange={(e) => setNewSessionWorkInput(e.target.value)}
                        placeholder="Ej. Mapa Conceptual"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${themeClasses.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-1">Tema SEP de la Clase:</label>
                      <input
                        type="text"
                        value={newSessionTopicInput}
                        onChange={(e) => setNewSessionTopicInput(e.target.value)}
                        placeholder="Ej. Plan de Iguala"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${themeClasses.inputBg}`}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddCustomClassSession}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        Guardar en Calendario
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                2. BARRA MAESTRA DE SELECTOR DE TIEMPOS / PERIODO (ENTRE QUÉ DÍA Y QUÉ DÍA)
                   + FÓRMULAS DE DIVISIÓN AUTOMÁTICA EN VIVO
                ========================================================================= */}
            <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-3`}>
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                {/* Selector de Rango de Fechas (Entre qué día y qué día) */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-black text-sky-800">
                    <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Selector de Periodo (Entre qué día y qué día):</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${themeClasses.inputBg}`}>
                      <span className="text-[10px] font-black uppercase text-sky-700">Desde:</span>
                      <input
                        type="date"
                        value={periodStartDate}
                        onChange={(e) => setPeriodStartDate(e.target.value)}
                        className="bg-transparent font-black text-xs outline-hidden cursor-pointer"
                      />
                    </label>
                    <span className="font-black text-xs opacity-60">→</span>
                    <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${themeClasses.inputBg}`}>
                      <span className="text-[10px] font-black uppercase text-sky-700">Hasta:</span>
                      <input
                        type="date"
                        value={periodEndDate}
                        onChange={(e) => setPeriodEndDate(e.target.value)}
                        className="bg-transparent font-black text-xs outline-hidden cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Atajos Rápidos de Periodo */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-black uppercase ${themeClasses.subtext} mr-1`}>Periodos Rápidos:</span>
                  <button
                    onClick={() => { setPeriodStartDate('2026-10-26'); setPeriodEndDate('2026-11-02'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                      periodStartDate === '2026-10-26' && periodEndDate === '2026-11-02'
                        ? `${themeClasses.accentBg} border-transparent`
                        : `${themeClasses.btnSecondary}`
                    }`}
                  >
                    Última Semana (4 Clases / 4 Sellos)
                  </button>
                  <button
                    onClick={() => { setPeriodStartDate('2026-10-19'); setPeriodEndDate('2026-11-02'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                      periodStartDate === '2026-10-19' && periodEndDate === '2026-11-02'
                        ? `${themeClasses.accentBg} border-transparent`
                        : `${themeClasses.btnSecondary}`
                    }`}
                  >
                    Quincena (7 Clases / 7 Sellos)
                  </button>
                  <button
                    onClick={() => { setPeriodStartDate('2026-10-16'); setPeriodEndDate('2026-11-02'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                      periodStartDate === '2026-10-16' && periodEndDate === '2026-11-02'
                        ? `${themeClasses.accentBg} border-transparent`
                        : `${themeClasses.btnSecondary}`
                    }`}
                  >
                    8 Sesiones SEP (8 Clases / 8 Sellos)
                  </button>
                  <button
                    onClick={() => { setPeriodStartDate('2026-10-05'); setPeriodEndDate('2026-11-02'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                      periodStartDate === '2026-10-05' && periodEndDate === '2026-11-02'
                        ? `${themeClasses.accentBg} border-transparent`
                        : `${themeClasses.btnSecondary}`
                    }`}
                  >
                    Mes Completo (13 Clases / 13 Sellos)
                  </button>
                </div>
              </div>

              {/* Tarjetas KPI de División Matemática del Periodo (Asistencias Divididas + Sellos en el Periodo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
                {/* KPI 1: Días de Clase del Grupo en el Periodo */}
                <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-700">
                    <span>1. Clases Impartidas en el Periodo</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15">Lun • Mié • Vie</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black mt-1">
                    {periodGroupSummary.totalClasses} Días de Clase
                  </div>
                  <div className={`text-[11px] ${themeClasses.subtext} mt-0.5`}>
                    Entre <strong>{periodStartDate}</strong> y <strong>{periodEndDate}</strong>
                  </div>
                </div>

                {/* KPI 2: Conteo Dividido de Asistencias + Fórmula de Porcentaje */}
                <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-700">
                    <span>2. Asistencias Divididas ÷ Total</span>
                    <button
                      onClick={() => setCountRetardoAsAttendance(!countRetardoAsAttendance)}
                      className="underline cursor-pointer text-[9px] font-bold"
                      title="Alternar si los retardos suman como asistencia efectiva en la división"
                    >
                      {countRetardoAsAttendance ? 'Retardo = Asistencia ✓' : 'Solo Presentes'}
                    </button>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <span className="text-lg sm:text-xl font-black text-emerald-700">
                      {periodGroupSummary.groupAttendancePct}% Asistencia
                    </span>
                    <span className="text-xs font-mono font-black text-slate-700">
                      ({periodGroupSummary.sumEffectiveAtt} ÷ {periodGroupSummary.totalPossiblePersonClasses})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700">
                      P: {periodGroupSummary.sumPresent}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700">
                      R: {periodGroupSummary.sumLate}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700">
                      F: {periodGroupSummary.sumAbsent}
                    </span>
                  </div>
                </div>

                {/* KPI 3: Total de Sellos que Existen en el Periodo + Qué Día Fue Qué Sello */}
                <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-sky-700">
                    <span>3. Total de Sellos en el Periodo</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15">Trazabilidad por Día</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-sky-800 mt-1">
                    {periodGroupSummary.totalStamps} Sellos Oficiales
                  </div>
                  <div className={`text-[11px] ${themeClasses.subtext} mt-0.5 truncate`}>
                    Desde <strong>{sessionsInSelectedPeriod[0]?.stampPage}</strong> ({sessionsInSelectedPeriod[0]?.dayShort}) hasta <strong>{sessionsInSelectedPeriod[sessionsInSelectedPeriod.length - 1]?.stampPage}</strong>
                  </div>
                </div>

                {/* KPI 4: División Sellos Obtenidos ÷ Total de Sellos en el Periodo = % */}
                <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-sky-700">
                    <span>4. Sellos Obtenidos ÷ Total Periodo</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 font-mono">X / {periodGroupSummary.totalStamps}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <span className="text-lg sm:text-xl font-black text-sky-700">
                      {periodGroupSummary.groupStampsPct}% Sellos
                    </span>
                    <span className="text-xs font-mono font-black text-slate-700">
                      ({periodGroupSummary.sumStamps} ÷ {periodGroupSummary.totalPossiblePersonClasses})
                    </span>
                  </div>
                  <div className={`text-[11px] ${themeClasses.subtext} mt-0.5`}>
                    Fórmula por alumno: <strong>Sellos Alumno ÷ {periodGroupSummary.totalStamps} = %</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. VISTA A & B: CALENDARIO INTERACTIVO DE DÍAS DE CLASE Y SELLOS + COMPENDIO POR ALUMNO
                ========================================================================= */}
            {(stampsSubView === 'attendance_calendar' || stampsSubView === 'stamps_calendar') && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                
                {/* COLUMNA IZQUIERDA (5 COLS): CALENDARIO INTERACTIVO DE DÍAS DE CLASE Y QUÉ DÍA FUE QUÉ SELLO */}
                <div className={`xl:col-span-5 p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                  <div className="flex items-center justify-between gap-2 border-b pb-3 border-sky-200">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-sky-700">
                        <Calendar className="w-4 h-4" />
                        <span>Calendario de Días de Clase del Grupo</span>
                      </div>
                      <p className={`text-[11px] ${themeClasses.subtext} mt-0.5`}>
                        Haz clic en cualquier día que tuvo clase el grupo para ver su asistencia y qué sello se entregó ese día.
                      </p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-800 shrink-0">
                      Oct – Nov 2026
                    </span>
                  </div>

                  {/* Cuadrícula Visual de Calendario de Octubre / Noviembre 2026 */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-500 pb-1">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {[
                        { date: '2026-10-05', dayNum: '05', monthLabel: 'Oct' },
                        { date: '2026-10-06', dayNum: '06', monthLabel: 'Oct' },
                        { date: '2026-10-07', dayNum: '07', monthLabel: 'Oct' },
                        { date: '2026-10-08', dayNum: '08', monthLabel: 'Oct' },
                        { date: '2026-10-09', dayNum: '09', monthLabel: 'Oct' },
                        { date: '2026-10-10', dayNum: '10', monthLabel: 'Oct' },
                        { date: '2026-10-11', dayNum: '11', monthLabel: 'Oct' },
                        { date: '2026-10-12', dayNum: '12', monthLabel: 'Oct' },
                        { date: '2026-10-13', dayNum: '13', monthLabel: 'Oct' },
                        { date: '2026-10-14', dayNum: '14', monthLabel: 'Oct' },
                        { date: '2026-10-15', dayNum: '15', monthLabel: 'Oct' },
                        { date: '2026-10-16', dayNum: '16', monthLabel: 'Oct' },
                        { date: '2026-10-17', dayNum: '17', monthLabel: 'Oct' },
                        { date: '2026-10-18', dayNum: '18', monthLabel: 'Oct' },
                        { date: '2026-10-19', dayNum: '19', monthLabel: 'Oct' },
                        { date: '2026-10-20', dayNum: '20', monthLabel: 'Oct' },
                        { date: '2026-10-21', dayNum: '21', monthLabel: 'Oct' },
                        { date: '2026-10-22', dayNum: '22', monthLabel: 'Oct' },
                        { date: '2026-10-23', dayNum: '23', monthLabel: 'Oct' },
                        { date: '2026-10-24', dayNum: '24', monthLabel: 'Oct' },
                        { date: '2026-10-25', dayNum: '25', monthLabel: 'Oct' },
                        { date: '2026-10-26', dayNum: '26', monthLabel: 'Oct' },
                        { date: '2026-10-27', dayNum: '27', monthLabel: 'Oct' },
                        { date: '2026-10-28', dayNum: '28', monthLabel: 'Oct' },
                        { date: '2026-10-29', dayNum: '29', monthLabel: 'Oct' },
                        { date: '2026-10-30', dayNum: '30', monthLabel: 'Oct' },
                        { date: '2026-10-31', dayNum: '31', monthLabel: 'Oct' },
                        { date: '2026-11-01', dayNum: '01', monthLabel: 'Nov' },
                        { date: '2026-11-02', dayNum: '02', monthLabel: 'Nov' },
                        { date: '2026-11-03', dayNum: '03', monthLabel: 'Nov' },
                        { date: '2026-11-04', dayNum: '04', monthLabel: 'Nov' },
                        { date: '2026-11-05', dayNum: '05', monthLabel: 'Nov' },
                        { date: '2026-11-06', dayNum: '06', monthLabel: 'Nov' },
                        { date: '2026-11-07', dayNum: '07', monthLabel: 'Nov' },
                        { date: '2026-11-08', dayNum: '08', monthLabel: 'Nov' }
                      ].map(cell => {
                        const classSession = groupClassSessions.find(s => s.date === cell.date);
                        const isInPeriod = cell.date >= periodStartDate && cell.date <= periodEndDate;
                        const isSelectedDay = activeCalendarSession.date === cell.date;

                        if (!classSession) {
                          return (
                            <div
                              key={cell.date}
                              className="p-1.5 rounded-xl border border-slate-200/70 bg-slate-100/50 text-center opacity-45 select-none min-h-[60px] flex flex-col justify-between"
                            >
                              <span className="text-[10px] font-bold text-slate-400">
                                {cell.dayNum} {cell.monthLabel}
                              </span>
                              <span className="text-[8px] text-slate-400">Sin clase</span>
                            </div>
                          );
                        }

                        // Conteo de asistencia y sellos de ese día específico
                        const dayPresentCount = students.filter((s, idx) => getStudentAttendanceOnDate(s.id, idx, cell.date) !== 'absent').length;
                        const dayStampedCount = students.filter((s, idx) => getStudentStampOnDate(s.id, idx, cell.date)).length;

                        return (
                          <button
                            key={cell.date}
                            onClick={() => setSelectedCalendarDate(cell.date)}
                            className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer min-h-[64px] flex flex-col justify-between relative ${
                              isSelectedDay
                                ? 'bg-sky-600 text-white border-2 border-sky-900 shadow-md scale-[1.02] z-10'
                                : isInPeriod
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/50 text-slate-900'
                                  : `${themeClasses.card} opacity-70 hover:opacity-100`
                            }`}
                            title={`${classSession.dayShort}: ${classSession.topicTitle} • Sello: ${classSession.stampPage} (${classSession.stampWorkTitle})`}
                          >
                            <div className="flex items-center justify-between gap-0.5 w-full">
                              <span className="text-[10px] font-black leading-none">
                                {cell.dayNum} {cell.monthLabel}
                              </span>
                              {isInPeriod && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelectedDay ? 'bg-white' : 'bg-emerald-500'}`} />
                              )}
                            </div>

                            <div className={`text-[9px] font-black px-1 py-0.5 rounded truncate mt-1 ${
                              isSelectedDay
                                ? 'bg-white/20 text-white'
                                : 'bg-sky-500/15 text-sky-800'
                            }`}>
                              {classSession.stampPage}
                            </div>

                            <div className={`text-[8px] font-bold truncate mt-0.5 ${
                              isSelectedDay ? 'text-white/90' : 'text-emerald-700'
                            }`}>
                              {stampsSubView === 'stamps_calendar'
                                ? `✒️ ${dayStampedCount}/${students.length}`
                                : `👤 ${dayPresentCount}/${students.length}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tarjeta de Inspección del Día Seleccionado en el Calendario */}
                  <div className={`p-3.5 rounded-xl border-2 border-sky-400 ${themeClasses.surfaceElevated} space-y-2.5`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-600 text-white">
                        Día Seleccionado: {activeCalendarSession.dayShort}
                      </span>
                      <span className="text-[10px] font-mono font-black text-sky-800">
                        Sello #{activeCalendarSession.stampOrder} del Ciclo • Bloom: {activeCalendarSession.bloomTag}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-black">
                        {activeCalendarSession.topicTitle}
                      </div>
                      <div className="text-xs font-bold text-sky-800 mt-0.5 flex items-center gap-1.5">
                        <Stamp className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>
                          Sello de ese día: <strong>{activeCalendarSession.stampPage}</strong> — {activeCalendarSession.stampWorkTitle}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-white/80 border border-emerald-300">
                        <div className="text-[10px] font-black uppercase text-emerald-700">Asistencia Día</div>
                        <div className="text-sm font-black text-emerald-700">
                          {periodGroupSummary.selectedDayPresent} / {students.length}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 border border-amber-300">
                        <div className="text-[10px] font-black uppercase text-amber-700">Retardos / Faltas</div>
                        <div className="text-sm font-black text-amber-700">
                          {periodGroupSummary.selectedDayLate}R • {periodGroupSummary.selectedDayAbsent}F
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 border border-sky-300">
                        <div className="text-[10px] font-black uppercase text-sky-700">Sellos del Día</div>
                        <div className="text-sm font-black text-sky-700">
                          {periodGroupSummary.selectedDayStamped} / {students.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Catálogo Cronológico en Lista: "¿Qué Día Fue Qué Sello en el Periodo?" */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                      <span className="text-sky-800">
                        Catálogo del Periodo: ¿Qué Día Fue Qué Sello? ({sessionsInSelectedPeriod.length} Sellos)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700">Clic para inspeccionar</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {sessionsInSelectedPeriod.map((sess, idx) => {
                        const isSelected = sess.date === activeCalendarSession.date;
                        const dayPresent = students.filter((s, sIdx) => getStudentAttendanceOnDate(s.id, sIdx, sess.date) !== 'absent').length;
                        const dayStamped = students.filter((s, sIdx) => getStudentStampOnDate(s.id, sIdx, sess.date)).length;

                        return (
                          <div
                            key={sess.date}
                            onClick={() => setSelectedCalendarDate(sess.date)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                                : `${themeClasses.surfaceMuted} hover:border-sky-400`
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 text-xs font-black">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-sky-500/15 text-sky-800'
                                }`}>
                                  Sello #{idx + 1} • {sess.dayShort}
                                </span>
                                <span className="truncate">{sess.stampPage}: {sess.stampWorkTitle}</span>
                              </div>
                              <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/85' : themeClasses.subtext}`}>
                                Clase: {sess.topicTitle}
                              </div>
                            </div>

                            <div className="text-right shrink-0 text-[10px] font-black">
                              <div>👤 {dayPresent}/{students.length}</div>
                              <div>✒️ {dayStamped}/{students.length}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA (7 COLS): COMPENDIO MATEMÁTICO DIVIDIDO DE ASISTENCIAS Y SELLOS POR ALUMNO */}
                <div className={`xl:col-span-7 p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-sky-200">
                    <div>
                      <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
                        {stampsSubView === 'attendance_calendar' ? (
                          <>
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span>Compendio de Asistencias Divididas y Porcentaje ({periodStartDate} a {periodEndDate})</span>
                          </>
                        ) : (
                          <>
                            <Stamp className="w-4 h-4 text-sky-600" />
                            <span>Compendio de Sellos del Alumno ÷ Total de Sellos del Periodo ({periodGroupSummary.totalStamps} Sellos)</span>
                          </>
                        )}
                      </h3>
                      <p className={`text-[11px] ${themeClasses.subtext} mt-0.5`}>
                        Haz clic en cualquier fecha o botón de un alumno para actualizar su asistencia o su sello en vivo; la división y el porcentaje se recalculan automáticamente.
                      </p>
                    </div>

                    {/* Buscador y Filtros del Compendio */}
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${themeClasses.inputBg}`}>
                        <Search className="w-3.5 h-3.5 opacity-60" />
                        <input
                          type="text"
                          value={compendiumSearch}
                          onChange={(e) => setCompendiumSearch(e.target.value)}
                          placeholder="Buscar alumno..."
                          className="bg-transparent font-bold text-xs outline-hidden w-28 sm:w-36"
                        />
                      </div>

                      <select
                        value={compendiumQuickFilter}
                        onChange={(e) => setCompendiumQuickFilter(e.target.value as 'all' | 'attendance_alert' | 'pending_stamps')}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer ${themeClasses.inputBg}`}
                      >
                        <option value="all">Todos ({studentPeriodCompendium.length})</option>
                        <option value="attendance_alert">Alerta Asistencia (&lt; 85%)</option>
                        <option value="pending_stamps">Con Sellos Pendientes</option>
                      </select>
                    </div>
                  </div>

                  {/* Lista / Tabla de Alumnos con Conteo Dividido, Fracción Explícita (X / Total) y Porcentaje (%) */}
                  <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
                    {filteredCompendiumRows.map(row => {
                      const fullName = getStudentFullName(row.student);
                      const isLowAttendance = row.attendancePercentage < 85;
                      const isLowStamps = row.stampsPercentage < 85;

                      return (
                        <div
                          key={row.student.id}
                          className={`p-3.5 rounded-2xl border transition-all ${themeClasses.surfaceMuted} hover:border-sky-400 space-y-2.5`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            {/* Datos del Alumno + Controles del Día Seleccionado en el Calendario */}
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={getStudentAvatarUrl(row.student)}
                                alt={row.student.first_name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-sky-500 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-black text-xs sm:text-sm truncate flex items-center gap-2">
                                  <span>{fullName}</span>
                                  {isLowAttendance && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 font-black">
                                      Alerta SEP &lt;85%
                                    </span>
                                  )}
                                </div>

                                {/* Controles rápidos del día activo en el calendario */}
                                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                  <span className="text-[10px] font-black text-sky-800">
                                    En {activeCalendarSession.dayShort}:
                                  </span>
                                  <button
                                    onClick={() => setStudentAttendanceForDate(activeCalendarSession.date, row.student.id, 'present')}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer ${
                                      row.selectedDayAtt === 'present'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white/80 text-slate-700 border border-slate-300'
                                    }`}
                                  >
                                    Presente
                                  </button>
                                  <button
                                    onClick={() => setStudentAttendanceForDate(activeCalendarSession.date, row.student.id, 'late')}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer ${
                                      row.selectedDayAtt === 'late'
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-white/80 text-slate-700 border border-slate-300'
                                    }`}
                                  >
                                    Retardo
                                  </button>
                                  <button
                                    onClick={() => setStudentAttendanceForDate(activeCalendarSession.date, row.student.id, 'absent')}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer ${
                                      row.selectedDayAtt === 'absent'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white/80 text-slate-700 border border-slate-300'
                                    }`}
                                  >
                                    Falta
                                  </button>

                                  <button
                                    onClick={() => toggleStudentStampForDate(activeCalendarSession.date, row.student.id, row.studentIdx)}
                                    className={`text-[9px] px-2 py-0.5 rounded-md font-black cursor-pointer border border-dashed flex items-center gap-1 ${
                                      row.selectedDayStamp
                                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-600'
                                        : 'bg-rose-500/15 text-rose-700 border-rose-500'
                                    }`}
                                  >
                                    <Stamp className="w-2.5 h-2.5" />
                                    <span>
                                      {row.selectedDayStamp
                                        ? `${activeCalendarSession.stampPage} Sellada ✓`
                                        : `${activeCalendarSession.stampPage} Sin Sello ✗`}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Bloques Matemáticos: 1) Asistencias Divididas + %  y  2) Sellos Alumno / Total Periodo + % */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
                              {/* Bloque A: Conteo Dividido de Asistencias + División + Porcentaje */}
                              <div className={`p-2.5 rounded-xl border bg-white/90 ${
                                stampsSubView === 'attendance_calendar' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-sky-200'
                              }`}>
                                <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase text-slate-600">
                                  <span>Asistencias Periodo:</span>
                                  <span className="font-mono text-emerald-700">{row.attendanceFractionLabel} clases</span>
                                </div>
                                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                                  <div className="flex items-center gap-1 text-[10px] font-black">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700" title="Asistencias (Presente)">
                                      {row.presentDays} Asist.
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700" title="Retardos">
                                      {row.lateDays} Ret.
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700" title="Faltas">
                                      {row.absentDays} Faltas
                                    </span>
                                  </div>
                                  <span className={`text-sm font-black ${isLowAttendance ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {row.attendancePercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isLowAttendance ? 'bg-rose-500' : 'bg-emerald-600'}`}
                                    style={{ width: `${Math.min(100, row.attendancePercentage)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Bloque B: Sellos del Alumno ÷ Total de Sellos en el Periodo = % */}
                              <div className={`p-2.5 rounded-xl border bg-white/90 ${
                                stampsSubView === 'stamps_calendar' ? 'border-sky-600 ring-1 ring-sky-500/30' : 'border-sky-200'
                              }`}>
                                <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase text-slate-600">
                                  <span>Sellos en Periodo:</span>
                                  <span className="font-mono text-sky-700">{row.stampsFractionLabel} sellos</span>
                                </div>
                                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                                  <div className="flex items-center gap-1 text-[10px] font-black">
                                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-800">
                                      {row.stampsObtained} Obtenidos
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700">
                                      {row.stampsPending} Sin Sello
                                    </span>
                                  </div>
                                  <span className={`text-sm font-black ${isLowStamps ? 'text-amber-600' : 'text-sky-700'}`}>
                                    {row.stampsPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isLowStamps ? 'bg-amber-500' : 'bg-sky-600'}`}
                                    style={{ width: `${Math.min(100, row.stampsPercentage)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tira Cronológica Interactiva Día por Día (Muestra qué día tuvo clase y qué sello obtuvo cada fecha) */}
                          <div className="pt-2 border-t border-sky-200/70 flex items-center gap-1.5 overflow-x-auto pb-1">
                            <span className="text-[9px] font-black uppercase text-slate-500 shrink-0 mr-1">
                              {stampsSubView === 'stamps_calendar' ? 'Sellos por Fecha:' : 'Historial Periodo:'}
                            </span>
                            {row.perSessionDetails.map(det => {
                              const isCurrentDay = det.date === activeCalendarSession.date;
                              if (stampsSubView === 'stamps_calendar') {
                                return (
                                  <button
                                    key={det.date}
                                    onClick={() => {
                                      setSelectedCalendarDate(det.date);
                                      toggleStudentStampForDate(det.date, row.student.id, row.studentIdx);
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black shrink-0 cursor-pointer border transition-all flex items-center gap-1 ${
                                      det.hasStamp
                                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/50'
                                        : 'bg-rose-500/15 text-rose-700 border-rose-500/50'
                                    } ${isCurrentDay ? 'ring-2 ring-sky-600' : ''}`}
                                    title={`${det.dayShort} • ${det.stampPage} (${det.stampWorkTitle}) — Clic para sellar o retirar sello`}
                                  >
                                    <span>{det.dayShort.replace(' (Hoy)', '')}:</span>
                                    <strong>{det.stampPage}</strong>
                                    <span>{det.hasStamp ? '✓' : '✗'}</span>
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={det.date}
                                  onClick={() => {
                                    setSelectedCalendarDate(det.date);
                                    const nextStatus =
                                      det.attStatus === 'present' ? 'late' : det.attStatus === 'late' ? 'absent' : 'present';
                                    setStudentAttendanceForDate(det.date, row.student.id, nextStatus);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-black shrink-0 cursor-pointer border transition-all flex items-center gap-1 ${
                                    det.attStatus === 'present'
                                      ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/50'
                                      : det.attStatus === 'late'
                                        ? 'bg-amber-500/20 text-amber-900 border-amber-500/50'
                                        : 'bg-rose-500/15 text-rose-700 border-rose-500/50'
                                  } ${isCurrentDay ? 'ring-2 ring-sky-600' : ''}`}
                                  title={`${det.dayShort} (${det.stampPage}) — Estado: ${det.attStatus.toUpperCase()}. Clic para alternar Presente/Retardo/Falta`}
                                >
                                  <span>{det.dayShort.replace(' (Hoy)', '')}</span>
                                  <span>
                                    {det.attStatus === 'present' ? '✓ P' : det.attStatus === 'late' ? '⚠ R' : '✗ F'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                4. VISTA C: TABLERO DE AULA EN VIVO (TARJETAS DE ALUMNOS + HOJA ESCANEADA)
                   Enriquecida con los porcentajes y divisiones del periodo en cada alumno
                ========================================================================= */}
            {stampsSubView === 'live_board' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-900">
                    <span>Inspeccionando Fecha en Tarjetas:</span>
                    <select
                      value={activeCalendarSession.date}
                      onChange={(e) => setSelectedCalendarDate(e.target.value)}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-black cursor-pointer ${themeClasses.inputBg}`}
                    >
                      {groupClassSessions.map(s => (
                        <option key={s.date} value={s.date}>
                          {s.dayShort} — {s.stampPage} ({s.stampWorkTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setOnlyUnstampedFilter(!onlyUnstampedFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                      onlyUnstampedFilter
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{onlyUnstampedFilter ? 'Ver Todos los Alumnos' : `Filtrar Sin Sello Hoy (${unstampedCount})`}</span>
                  </button>
                </div>

                {/* Cuadrícula de Alumnos con Sello Gráfico de Goma (65%) + Inspector de Hoja de Libreta Escaneada (35%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* 65% Tarjetas de Alumnos con Sello Gráfico Táctil + Compendio del Periodo */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
                    {studentsForStamps.map((student, sIdx) => {
                      const compRow = studentCompendiumMap[student.id];
                      const isStamped = compRow ? compRow.selectedDayStamp : !!stampedMap[student.id]?.stamped;
                      const attendanceStatus = compRow ? compRow.selectedDayAtt : (attendanceMap[student.id] || 'present');
                      const isSelected = selectedStudentForDossier?.id === student.id;
                      const shortPage = activeCalendarSession.stampPage;

                      return (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudentForDossier(student)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                            isSelected 
                              ? `${themeClasses.surfaceElevated} border-2 border-sky-500 shadow-sm` 
                              : `${themeClasses.card} ${themeClasses.cardHover}`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={getStudentAvatarUrl(student)}
                                alt={student.first_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-slate-700"
                              />
                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                attendanceStatus === 'present' ? 'bg-emerald-500' :
                                attendanceStatus === 'late' ? 'bg-amber-500' :
                                attendanceStatus === 'absent' ? 'bg-rose-500' : 'bg-sky-500'
                              }`} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="font-black text-xs md:text-sm truncate">
                                {getStudentFullName(student)}
                              </div>
                              
                              {/* Botones de Pase de Lista 1-Toque (Sincronizados con la fecha seleccionada) */}
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStudentAttendanceForDate(activeCalendarSession.date, student.id, 'present'); }}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-all ${
                                    attendanceStatus === 'present'
                                      ? 'bg-emerald-600 text-white'
                                      : `${themeClasses.btnSecondary} opacity-70 hover:opacity-100`
                                  }`}
                                >
                                  Presente
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStudentAttendanceForDate(activeCalendarSession.date, student.id, 'late'); }}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-all ${
                                    attendanceStatus === 'late'
                                      ? 'bg-amber-500 text-slate-950'
                                      : `${themeClasses.btnSecondary} opacity-70 hover:opacity-100`
                                  }`}
                                >
                                  Retardo
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStudentAttendanceForDate(activeCalendarSession.date, student.id, 'absent'); }}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-all ${
                                    attendanceStatus === 'absent'
                                      ? 'bg-rose-600 text-white'
                                      : `${themeClasses.btnSecondary} opacity-70 hover:opacity-100`
                                  }`}
                                >
                                  Falta
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Píldoras de Compendio del Periodo (Asistencias Divididas + Sellos Obtenidos ÷ Total) */}
                          {compRow && (
                            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px]">
                              <div
                                onClick={(e) => { e.stopPropagation(); setStampsSubView('attendance_calendar'); }}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 font-black flex items-center justify-between hover:bg-emerald-500/20"
                                title={`Asistencias en el periodo: ${compRow.presentDays} Presentes, ${compRow.lateDays} Retardos, ${compRow.absentDays} Faltas (${compRow.attendanceFractionLabel} = ${compRow.attendancePercentage}%)`}
                              >
                                <span>Asist: {compRow.attendanceFractionLabel}</span>
                                <span>{compRow.attendancePercentage}%</span>
                              </div>
                              <div
                                onClick={(e) => { e.stopPropagation(); setStampsSubView('stamps_calendar'); }}
                                className="px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-800 font-black flex items-center justify-between hover:bg-sky-500/20"
                                title={`Sellos obtenidos en el periodo: ${compRow.stampsFractionLabel} (${compRow.stampsPercentage}%)`}
                              >
                                <span>Sellos: {compRow.stampsFractionLabel}</span>
                                <span>{compRow.stampsPercentage}%</span>
                              </div>
                            </div>
                          )}

                          {/* SELLO GRÁFICO DE GOMA DE LIBRETA + MAGIC LINK */}
                          <div className={`mt-2.5 pt-2.5 border-t ${themeClasses.divider} flex items-center justify-between gap-2`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStudentStampForDate(activeCalendarSession.date, student.id, compRow ? compRow.studentIdx : sIdx); }}
                              className={`px-2.5 py-1 rounded-xl border-2 border-dashed text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
                                isStamped
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/70 -rotate-1 shadow-2xs'
                                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/70'
                              }`}
                              title="Clic para estampar o retirar el sello gráfico de libreta"
                            >
                              <Stamp className="w-3.5 h-3.5 shrink-0" />
                              <span>{isStamped ? `SELLO APROBADO • ${shortPage}` : `SIN SELLO • ${shortPage}`}</span>
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); openMagicLinkModal(student); }}
                              className="px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-cyan-300 text-[10px] font-black flex items-center gap-1 cursor-pointer shrink-0"
                              title="Enviar Magic Link directo al padre de familia"
                            >
                              <Zap className="w-3 h-3 fill-current" />
                              <span>Magic Link</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 35% Inspector de Hoja de Libreta Escaneada & Historial Cronológico del Periodo */}
                  <div className={`lg:col-span-4 p-4 rounded-2xl border ${themeClasses.card} space-y-4 h-fit sticky top-16`}>
                    {selectedStudentForDossier ? (() => {
                      const compRow = studentCompendiumMap[selectedStudentForDossier.id];
                      const isStampedActiveDate = compRow ? compRow.selectedDayStamp : !!stampedMap[selectedStudentForDossier.id]?.stamped;
                      const activePageNumber = activeCalendarSession.stampPage;

                      return (
                        <>
                          <div className={`flex items-center justify-between border-b pb-3 ${themeClasses.divider}`}>
                            <div className="flex items-center gap-3">
                              <img
                                src={getStudentAvatarUrl(selectedStudentForDossier)}
                                alt={selectedStudentForDossier.first_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-sky-500"
                              />
                              <div>
                                <h3 className="font-black text-sm">
                                  {getStudentFullName(selectedStudentForDossier)}
                                </h3>
                                <div className={`text-[11px] ${themeClasses.subtext}`}>
                                  Inspección de Cuaderno • {activeCalendarSession.dayShort} ({activePageNumber})
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Resumen de Asistencia y Sellos del Alumno en el Periodo Seleccionado */}
                          {compRow && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <div className="text-[9px] font-black uppercase text-emerald-800">
                                  Asistencia Periodo
                                </div>
                                <div className="text-sm font-black text-emerald-700">
                                  {compRow.attendanceFractionLabel} ({compRow.attendancePercentage}%)
                                </div>
                                <div className="text-[9px] font-bold text-emerald-800/80">
                                  {compRow.presentDays}P • {compRow.lateDays}R • {compRow.absentDays}F
                                </div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
                                <div className="text-[9px] font-black uppercase text-sky-800">
                                  Sellos en Periodo
                                </div>
                                <div className="text-sm font-black text-sky-700">
                                  {compRow.stampsFractionLabel} ({compRow.stampsPercentage}%)
                                </div>
                                <div className="text-[9px] font-bold text-sky-800/80">
                                  {compRow.stampsObtained} sellados • {compRow.stampsPending} pend.
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PREVISUALIZACIÓN TÁCTIL DE HOJA DE LIBRETA ESCANEADA CON SELLO GRÁFICO */}
                          <div
                            onClick={() => toggleStudentStampForDate(activeCalendarSession.date, selectedStudentForDossier.id, compRow ? compRow.studentIdx : 0)}
                            className="relative rounded-xl border-2 border-amber-200/80 bg-[#FFFDF7] text-slate-800 p-4 shadow-inner cursor-pointer select-none overflow-hidden"
                            style={{
                              backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)',
                              backgroundSize: '18px 18px'
                            }}
                            title="Haz clic sobre la hoja de libreta para estampar o retirar el Sello Oficial iSkool"
                          >
                            {/* Margen rojo izquierdo de libreta escolar */}
                            <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-rose-400/70" />

                            <div className="pl-6 space-y-2 relative z-10">
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-300 pb-1">
                                <span className="font-bold text-slate-700">{activePageNumber} • {activeCalendarSession.stampWorkTitle}</span>
                                <span>Fecha: {activeCalendarSession.dayShort}</span>
                              </div>
                              <div className="font-serif italic text-xs text-slate-700 leading-snug">
                                Tema: {activeCalendarSession.topicTitle}
                              </div>
                              <div className="text-[11px] font-mono text-slate-600 bg-white/80 p-2 rounded border border-slate-200">
                                1. Nivel Bloom ({activeCalendarSession.bloomTag})<br />
                                2. Entregable: {activeCalendarSession.stampWorkTitle}.<br />
                                3. Verificado en libreta física ({activePageNumber}).
                              </div>
                            </div>

                            {/* SELLO DE GOMA CIRCULAR/OVALADO ESTAMPADO SOBRE EL CUADERNO */}
                            <div className="mt-3 flex justify-end">
                              {isStampedActiveDate ? (
                                <div className="px-3 py-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/95 text-emerald-800 font-black text-[10px] uppercase tracking-wider -rotate-6 shadow-sm flex flex-col items-center">
                                  <span className="text-[8px] tracking-widest">★ REPÚBLICA ESCOLAR iSKOOL ★</span>
                                  <span className="text-xs font-black">SELLO APROBADO • {activePageNumber}</span>
                                  <span className="text-[8px] font-mono">{activeCalendarSession.dayShort} • +50 XP</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1.5 rounded-xl border-2 border-dashed border-rose-500 bg-rose-50/95 text-rose-700 font-black text-[10px] uppercase tracking-wider -rotate-2 flex flex-col items-center">
                                  <span>PENDIENTE DE SELLO ({activePageNumber})</span>
                                  <span className="text-[8px]">Toca aquí para sellar cuaderno</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Historial de todos los sellos del periodo con fecha exacta y regularización en 1 clic */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                              <span className={themeClasses.subtext}>
                                Sellos del Periodo ({compRow?.stampsFractionLabel || ''}):
                              </span>
                              <span className="text-sky-600 font-mono">1-Clic Sellar / Fecha</span>
                            </div>

                            <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                              {(compRow?.perSessionDetails || []).slice().reverse().map(det => (
                                <div
                                  key={det.date}
                                  onClick={() => {
                                    setSelectedCalendarDate(det.date);
                                    toggleStudentStampForDate(det.date, selectedStudentForDossier.id, compRow ? compRow.studentIdx : 0);
                                  }}
                                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                    det.hasStamp
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-300'
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="font-black truncate">
                                      {det.dayShort} • {det.stampPage}
                                    </div>
                                    <div className="text-[10px] opacity-80 truncate">
                                      {det.stampWorkTitle}
                                    </div>
                                  </div>
                                  <span className="font-black text-[10px] shrink-0">
                                    {det.hasStamp ? 'Sellada ✓' : 'Sellar ahora ✗'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => openMagicLinkModal(selectedStudentForDossier)}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Enviar Reporte de Libreta por Magic Link</span>
                          </button>
                        </>
                      );
                    })() : (
                      <div className="py-12 text-center text-xs opacity-60 space-y-2">
                        <Users className="w-8 h-8 mx-auto opacity-40" />
                        <p>Selecciona un alumno para inspeccionar y sellar su hoja de libreta.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            5. VISTA 3: TAREAS Y PORTAFOLIO DIGITAL EN ISKOOL (CONECTADO A STORE)
            ========================================================================= */}
        {activeTab === 'evidences' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2 flex-wrap">
                  <FileCheck2 className="w-5 h-5 text-sky-600" />
                  <span>Auditoría de Tareas y Portafolio Digital iSkool</span>
                </h2>
                <p className={`text-xs ${themeClasses.subtext} mt-0.5`}>
                  Revisión en 1 clic conectada con el expediente del alumno, medallas y puntos de experiencia (+50 XP).
                </p>
              </div>

              <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${themeClasses.surfaceMuted}`}>
                <button
                  onClick={() => setEvidenceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-black cursor-pointer transition-all ${
                    evidenceFilter === 'all' ? `${themeClasses.accentBg} shadow-2xs` : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Todas ({portfolioItems.length})
                </button>
                <button
                  onClick={() => setEvidenceFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-black cursor-pointer transition-all ${
                    evidenceFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Por Revisar
                </button>
                <button
                  onClick={() => setEvidenceFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-black cursor-pointer transition-all ${
                    evidenceFilter === 'approved' ? 'bg-emerald-600 text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Aprobadas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvidences.map(item => {
                const isApproved = locallyApprovedIds[item.id] || item.status === 'approved';
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border ${themeClasses.card} ${themeClasses.cardHover} flex flex-col justify-between gap-3 transition-all`}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                            : item.status === 'needs_revision'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40'
                        }`}>
                          {isApproved ? 'Sello Aprobado ✓' : item.status === 'needs_revision' ? 'Requiere Apoyo' : 'Pendiente de Revisión'}
                        </span>

                        <span className={`text-[10px] ${themeClasses.subtext} font-mono font-bold`}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('es-MX') : 'Reciente'}
                        </span>
                      </div>

                      <h4 className="font-black text-sm">{item.title}</h4>
                      <p className={`text-xs ${themeClasses.subtext} line-clamp-2`}>
                        {item.description}
                      </p>
                    </div>

                    <div className={`pt-2.5 border-t ${themeClasses.divider} flex items-center justify-between text-xs gap-2`}>
                      <span className="text-sky-600 dark:text-cyan-400 font-black text-[11px] truncate">
                        PDA • {activeBloomConfig.label}
                      </span>

                      <button
                        onClick={() => handleApproveEvidenceItem(item)}
                        disabled={isApproved}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }`}
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Calificada (+50 XP) ✓' : 'Aprobar y Sellar (+50 XP)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. VISTA 4: PLANEACIÓN SEP NEM + TAXONOMÍA DE BLOOM + GENERADOR MAESTRO 360°
            ========================================================================= */}
        {activeTab === 'planning' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            {/* Cabecera Principal del Centro de Planeación SEP NEM y Sincronización 360° (100% Responsiva Multi-Dispositivo) */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
              
              {/* Fila 1: Título y Descripción en Ancho Completo (Nunca comprimido en ninguna pantalla) */}
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-tight leading-snug">
                      Centro Maestro de Planeación SEP NEM, Taxonomía de Bloom & Generador Curricular IA 360°
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      Vault-First • Sincronización Total Ecosistema iSkool
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Sello Activo: {todayStampPage.split(' - ')[0]}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      Bloom: {activeBloomConfig.label}
                    </span>
                  </div>
                </div>

                <p className={`text-xs sm:text-[13px] ${themeClasses.subtext} leading-relaxed max-w-5xl`}>
                  Diseña, consulta en Bóveda o genera con Inteligencia Artificial Pedagógica tu planeación oficial SEP NEM; al generarla se sincroniza automáticamente con <strong>Agenda Diferida, Pizarra de Mi Clase, Sellos de Libreta, Misiones (+50 XP), Magic Links y Espejo CEO</strong>.
                </p>
              </div>

              {/* Fila 2: Barra de Modos y Acciones Rápidas (Optimizada para Celular, Tablet, Laptop y Desktop) */}
              <div className={`pt-3.5 border-t ${themeClasses.divider} flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3`}>
                
                {/* Selector Dual de Sub-Vistas de Planeación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setPlanningSubView('overview')}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                      planningSubView === 'overview'
                        ? `${themeClasses.accentBg} border-transparent shadow-sm`
                        : `${themeClasses.btnSecondary}`
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">1. Agenda Multi-Clase & Matriz Bloom</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      planningSubView === 'overview' ? 'bg-white/25 text-white' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                    }`}>
                      {preparedClasses.length} sesiones
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanningSubView('generator')}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                      planningSubView === 'generator'
                        ? 'bg-linear-to-r from-sky-600 via-indigo-600 to-emerald-600 text-white border-transparent shadow-sm ring-2 ring-indigo-300'
                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 border-indigo-500/30'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">2. ✨ Generador Curricular SEP + IA (360°)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      planningSubView === 'generator' ? 'bg-white/25 text-white' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      7 Módulos
                    </span>
                  </button>
                </div>

                {/* Botones de Acción Rápida */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                  {planningSubView === 'overview' && (
                    <button
                      onClick={() => setShowNewClassForm(!showNewClassForm)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        showNewClassForm
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          : `${themeClasses.btnSecondary}`
                      }`}
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>{showNewClassForm ? 'Cerrar Constructor' : '+ Clase Rápida Diferida'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleActivatePreparedClass(activePreparedClass, true)}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl ${themeClasses.accentBg} font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                  >
                    <Zap className="w-4 h-4 fill-white shrink-0" />
                    <span>Proyectar en Mi Aula Ahora</span>
                  </button>
                </div>
              </div>
            </div>

            {planningSubView === 'overview' && (
              <>

            {/* Constructor Rápido de Nueva Clase en Horario o Día Diferido (Con Consulta a Bóveda Curricular) */}
            {showNewClassForm && (
              <div className={`p-5 rounded-2xl border-2 border-sky-500 ${themeClasses.card} space-y-4 animate-fade-in`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-black text-sm md:text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>Programar Nueva Clase en Horario Diferido o Día Diferido</span>
                    </h3>
                    <p className={`text-xs ${themeClasses.subtext}`}>
                      Consulta primero la Bóveda Curricular para autocompletar los 3 momentos SEP NEM y el nivel de Bloom en 1 segundo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConsultVaultForDraft}
                    disabled={isQueryingVault}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isQueryingVault ? 'Consultando Bóveda...' : 'Autocompletar desde Bóveda Curricular + Bloom'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Modalidad de Programación:</label>
                    <select
                      value={newClassDraft.scheduleType}
                      onChange={(e) => setNewClassDraft(prev => ({ ...prev, scheduleType: e.target.value as 'en_curso' | 'horario_diferido' | 'dia_diferido' }))}
                      className={`w-full p-2 rounded-xl border font-bold outline-hidden ${themeClasses.inputBg}`}
                    >
                      <option value="horario_diferido">Horario Diferido (Mismo Día)</option>
                      <option value="dia_diferido">Día Diferido (Próximos Días)</option>
                      <option value="en_curso">Clase Inmediata (En Curso)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Día Programado:</label>
                    <input
                      type="text"
                      value={newClassDraft.dayLabel}
                      onChange={(e) => setNewClassDraft(prev => ({ ...prev, dayLabel: e.target.value }))}
                      className={`w-full p-2 rounded-xl border font-bold outline-hidden ${themeClasses.inputBg}`}
                      placeholder="Ej. Mañana Martes / Jueves"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Horario de la Sesión:</label>
                    <input
                      type="text"
                      value={newClassDraft.timeRange}
                      onChange={(e) => setNewClassDraft(prev => ({ ...prev, timeRange: e.target.value }))}
                      className={`w-full p-2 rounded-xl border font-bold outline-hidden ${themeClasses.inputBg}`}
                      placeholder="Ej. 11:20 AM - 12:10 PM"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Grupo y Asignatura:</label>
                    <input
                      type="text"
                      value={`${newClassDraft.groupLabel} • ${newClassDraft.subjectName}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('•');
                        setNewClassDraft(prev => ({
                          ...prev,
                          groupLabel: (parts[0] || '1°A Secundaria').trim(),
                          subjectName: (parts[1] || 'Historia').trim()
                        }));
                      }}
                      className={`w-full p-2 rounded-xl border font-bold outline-hidden ${themeClasses.inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Tema / Contenido Curricular SEP NEM:</label>
                    <input
                      type="text"
                      value={newClassDraft.topicTitle}
                      onChange={(e) => setNewClassDraft(prev => ({ ...prev, topicTitle: e.target.value }))}
                      className={`w-full p-2.5 rounded-xl border font-black outline-hidden ${themeClasses.inputBg}`}
                      placeholder="Título de la sesión..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black uppercase text-[10px] opacity-75">Nivel Taxonomía de Bloom + Página Libreta:</label>
                    <div className="flex gap-2">
                      <select
                        value={newClassDraft.bloomLevel}
                        onChange={(e) => setNewClassDraft(prev => ({ ...prev, bloomLevel: e.target.value as BloomLevelKey }))}
                        className={`flex-1 p-2.5 rounded-xl border font-black outline-hidden ${themeClasses.inputBg}`}
                      >
                        {(Object.keys(BLOOM_TAXONOMY_MATRIX) as BloomLevelKey[]).map(k => (
                          <option key={k} value={k}>{BLOOM_TAXONOMY_MATRIX[k].label} ({BLOOM_TAXONOMY_MATRIX[k].shortTag})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newClassDraft.stampPage}
                        onChange={(e) => setNewClassDraft(prev => ({ ...prev, stampPage: e.target.value }))}
                        className={`w-28 p-2.5 rounded-xl border font-bold outline-hidden ${themeClasses.inputBg}`}
                        placeholder="Pág. 51"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewClassForm(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${themeClasses.btnSecondary} cursor-pointer`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewPreparedClass}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar en Agenda Diferida y Bóveda Curricular</span>
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                COLA MULTI-CLASE: CLASE EN CURSO + HORARIOS DIFERIDOS + DÍAS DIFERIDOS
                ===================================================================== */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Tus Clases Preparadas (En Curso, Horarios Diferidos y Días Diferidos):</span>
                </div>
                <span className={`text-[11px] font-bold ${themeClasses.subtext}`}>
                  Selecciona cualquier tarjeta para inspeccionar su planeación o activarla en el aula
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {preparedClasses.map((cls) => {
                  const isCurrent = cls.id === activePreparedClassId;
                  const bloomInfo = BLOOM_TAXONOMY_MATRIX[cls.bloomLevel];
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleActivatePreparedClass(cls, false)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? `${themeClasses.surfaceElevated} border-2 border-sky-500 shadow-sm`
                          : `${themeClasses.card} ${themeClasses.cardHover}`
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            cls.scheduleType === 'en_curso'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : cls.scheduleType === 'horario_diferido'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                : 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                          }`}>
                            {cls.dayLabel}
                          </span>
                          <span className="text-[10px] font-mono font-bold opacity-75">
                            {cls.timeRange}
                          </span>
                        </div>

                        <div className="font-black text-xs md:text-sm leading-snug line-clamp-2">
                          {cls.topicTitle}
                        </div>

                        <div className={`text-[11px] ${themeClasses.subtext} font-bold`}>
                          {cls.groupLabel} • {cls.subjectName}
                        </div>
                      </div>

                      <div className={`pt-2 border-t ${themeClasses.divider} space-y-2`}>
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            Bloom: {bloomInfo.label}
                          </span>
                          <span className="text-emerald-600">
                            {cls.stampPage.split(' - ')[0]}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivatePreparedClass(cls, true);
                          }}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                            isCurrent
                              ? `${themeClasses.accentBg}`
                              : `${themeClasses.btnSecondary}`
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{isCurrent ? 'Activa en Mi Clase (Ir)' : 'Cargar en Mi Clase'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =====================================================================
                MATRIZ PEDAGÓGICA DE LA TAXONOMÍA DE BLOOM + 3 MOMENTOS SEP NEM
                ===================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* 7 Columnas: Desglose Oficial SEP NEM en 3 Momentos Cronometrados */}
              <div className={`lg:col-span-7 p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-sky-600 tracking-wider">
                      Ficha Curricular Oficial SEP NEM • {activePreparedClass?.pdaCode}
                    </span>
                    <h3 className="font-black text-base md:text-lg">
                      {activePreparedClass?.topicTitle}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 text-xs font-black">
                    Sello Asociado: {activePreparedClass?.stampPage}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} text-xs space-y-1`}>
                  <div className="font-black uppercase text-[10px] text-sky-700 dark:text-cyan-400">
                    Proceso de Desarrollo de Aprendizaje (PDA Textual SEP):
                  </div>
                  <p className="font-medium leading-relaxed">
                    {activePreparedClass?.pdaDescription}
                  </p>
                </div>

                {/* Los 3 Momentos Pedagógicos Cronometrados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-600 uppercase text-[11px]">1. Inicio</span>
                      <span className="font-mono font-bold text-[10px] opacity-70">10 min</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{activePreparedClass?.moments.inicio}</p>
                  </div>

                  <div className={`p-3.5 rounded-xl border-2 border-sky-500/50 ${themeClasses.surfaceElevated} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sky-700 dark:text-cyan-300 uppercase text-[11px]">2. Desarrollo (Bloom)</span>
                      <span className="font-mono font-bold text-[10px] opacity-70">30 min</span>
                    </div>
                    <p className="leading-relaxed font-medium">{activePreparedClass?.moments.desarrollo}</p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-600 uppercase text-[11px]">3. Cierre SEP</span>
                      <span className="font-mono font-bold text-[10px] opacity-70">10 min</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{activePreparedClass?.moments.cierre}</p>
                  </div>
                </div>

                {/* Tarjeta Hero CTA: Abrir Generador Curricular Extendido SEP NEM + IA 360° */}
                <div className="mt-2 p-4 rounded-2xl border-2 border-indigo-500/40 bg-linear-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-black tracking-tight">
                        Generador Curricular Extendido SEP NEM + IA (Sincronización 360° iSkool)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                        Estándar Internacional
                      </span>
                    </div>
                    <p className={`text-[11px] ${themeClasses.subtext} leading-snug`}>
                      Genera el Documento Oficial A4 (con firma, rúbrica analítica, LTG de la SEP y sesiones cronometradas) e inyecta automáticamente sus sesiones en toda la plataforma.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setPlanningSubView('generator')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-linear-to-r from-sky-600 via-indigo-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Abrir Generador Curricular Extendido</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Columnas: Acompañamiento Docente con la Taxonomía de Bloom */}
              <div className={`lg:col-span-5 p-5 rounded-2xl border ${themeClasses.card} space-y-3.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-black text-sm md:text-base">
                      Guía Activa de Taxonomía de Bloom
                    </h3>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700">
                    6 Niveles Cognitivos
                  </span>
                </div>

                <p className={`text-xs ${themeClasses.subtext}`}>
                  Elige el nivel cognitivo que deseas trabajar hoy; iSkool adapta al instante los verbos, la pregunta detonadora en pizarra y el entregable de libreta:
                </p>

                <div className="space-y-1.5">
                  {(Object.keys(BLOOM_TAXONOMY_MATRIX) as BloomLevelKey[]).map((key) => {
                    const b = BLOOM_TAXONOMY_MATRIX[key];
                    const isSelected = activeBloomLevel === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setActiveBloomLevel(key)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? `${themeClasses.surfaceElevated} border-2 border-indigo-500 shadow-2xs`
                            : `${themeClasses.surfaceMuted} hover:border-slate-400`
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black">{b.label} — {b.shortTag}</span>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300">
                            {b.verbs.slice(0, 3).join(' / ')}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="mt-1.5 pt-1.5 border-t border-indigo-500/20 text-[11px] space-y-1">
                            <div><strong>Proceso:</strong> {b.cognitiveProcess}</div>
                            <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                              <strong>Libreta:</strong> {b.notebookDeliverable(todayStampPage.split(' - ')[0])}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
              </>
            )}

            {/* =====================================================================
                SUB-VISTA 2: GENERADOR CURRICULAR EXTENDIDO SEP NEM + IA (INTEGRADO 360°)
                ===================================================================== */}
            {planningSubView === 'generator' && (
              <div className="space-y-4 animate-fade-in">
                <div className={`p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-500/30 ${themeClasses.surfaceElevated} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black">
                        Generador Maestro de Planeaciones SEP NEM + IA • Integrado en Daylight Studio Pro
                      </div>
                      <div className={`text-[11px] ${themeClasses.subtext} leading-snug`}>
                        Al presionar <strong>&ldquo;Generar Planeación SEP + Integrar en Todo iSkool 360°&rdquo;</strong>, el documento oficial A4 actualiza automáticamente tu Agenda Diferida, Pizarra de Aula, Sello de Libreta, Misión (+50 XP) y Magic Links.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => setPlanningSubView('overview')}
                      className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-black ${themeClasses.btnSecondary} cursor-pointer flex items-center justify-center gap-1.5`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Ver Tarjetas en Agenda ({preparedClasses.length})</span>
                    </button>
                  </div>
                </div>

                <div className={`rounded-2xl sm:rounded-3xl border ${themeClasses.surfaceMuted} shadow-xs p-2.5 sm:p-4 lg:p-5 overflow-x-clip`}>
                  <PlanningTab
                    currentTeacher={teacher}
                    subjects={effectiveSubjects}
                    schedulesList={effectiveSchedules}
                    groupsList={groups}
                    initialTopic={activePreparedClass?.topicTitle || 'La Independencia de México'}
                    initialBloomLevel={activeBloomLevel}
                    onSyncPlanningToEcosystem={handleSyncFromMasterGenerator}
                    onNavigateToCopilotTab={(tab) => {
                      setActiveTab(tab);
                      if (tab === 'planning') {
                        setPlanningSubView('overview');
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            7. VISTA 5: RULETA Y AULA GAMIFICADA (PARTICIPACIÓN Y GREMIOS)
            ========================================================================= */}
        {activeTab === 'classroom' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1640px] mx-auto w-full animate-fade-in">
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex items-center justify-between flex-wrap gap-3`}>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-amber-500" />
                  <span>Ruleta de Participación & Gremios Cooperativos</span>
                </h2>
                <p className={`text-xs ${themeClasses.subtext}`}>
                  Dinámicas ágiles de participación vinculadas con la pregunta detonadora de Bloom ({activeBloomConfig.label}).
                </p>
              </div>

              {isTimerRunning && (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-mono font-black text-sm">
                  Tiempo de Respuesta: {timerSeconds}s
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${themeClasses.card} text-center space-y-4`}>
                <div className={`text-xs font-black uppercase tracking-wider ${themeClasses.subtext}`}>
                  Sorteo Imparcial de Participación en Pizarra
                </div>

                <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
                  <div className={`w-full h-full rounded-full border-4 border-sky-500 shadow-lg flex items-center justify-center overflow-hidden ${isSpinning ? 'animate-spin' : ''}`}>
                    <div className="grid grid-cols-2 w-full h-full">
                      <div className="bg-sky-500/20 border border-sky-500/30" />
                      <div className="bg-indigo-500/20 border border-indigo-500/30" />
                      <div className="bg-amber-500/20 border border-amber-500/30" />
                      <div className="bg-emerald-500/20 border border-emerald-500/30" />
                    </div>
                  </div>
                  <div className="absolute top-0 w-3.5 h-6 bg-amber-500 rounded-b-md shadow-md z-10" />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSpinning ? 'Girando ruleta...' : 'Girar Ruleta de Aula'}
                  </button>
                </div>

                {selectedSpotlightStudent && (
                  <div className={`p-3.5 rounded-2xl border-2 border-amber-500/60 ${themeClasses.surfaceElevated} max-w-md mx-auto flex items-center justify-between gap-3 text-left`}>
                    <div className="flex items-center gap-3">
                      <img
                        src={getStudentAvatarUrl(selectedSpotlightStudent)}
                        alt={selectedSpotlightStudent.first_name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-amber-500"
                      />
                      <div>
                        <div className="text-[10px] text-amber-600 font-black uppercase">Turno Activo en Aula:</div>
                        <div className="font-black text-sm">
                          {getStudentFullName(selectedSpotlightStudent)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toggleStudentStamp(selectedSpotlightStudent.id);
                        setMagicLinkSentToast(`✓ +50 XP y Sello otorgados a ${getStudentFullName(selectedSpotlightStudent)} por su participación.`);
                        setTimeout(() => setMagicLinkSentToast(null), 4000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shrink-0"
                    >
                      +50 XP y Sellar
                    </button>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className={`text-xs font-black uppercase tracking-wider ${themeClasses.subtext} border-b pb-2 ${themeClasses.divider}`}>
                  Gremios del Grupo & Méritos Formativos
                </div>

                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} space-y-1.5`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black">🦅 Gremio Quetzal</span>
                      <span className="text-amber-600 font-mono font-black">1,450 XP</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} space-y-1.5`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black">🐆 Gremio Jaguar</span>
                      <span className="text-sky-600 font-mono font-black">1,620 XP</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>
                </div>

                <div className={`space-y-2 pt-2 border-t ${themeClasses.divider}`}>
                  <div className="text-xs font-black">Otorgar Insignia Rápida ({activeBloomConfig.label}):</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMagicLinkSentToast(`✓ +50 XP otorgados por Pensamiento Crítico (${activeBloomConfig.label}).`);
                        setTimeout(() => setMagicLinkSentToast(null), 4000);
                      }}
                      className={`p-2.5 rounded-xl ${themeClasses.btnSecondary} text-left text-xs font-black cursor-pointer transition-all`}
                    >
                      💡 +50 XP Crítica
                    </button>
                    <button
                      onClick={() => {
                        setMagicLinkSentToast('✓ +30 XP otorgados por Trabajo Cooperativo en Gremio.');
                        setTimeout(() => setMagicLinkSentToast(null), 4000);
                      }}
                      className={`p-2.5 rounded-xl ${themeClasses.btnSecondary} text-left text-xs font-black cursor-pointer transition-all`}
                    >
                      🤝 +30 XP Equipo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            8. VISTA 6: MAGIC LINKS A PADRES + SIMULADOR MÓVIL 1-TAP EN VIVO
            ========================================================================= */}
        {activeTab === 'enlace' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            {/* Aviso Oficial de Dirección General */}
            <div className={`p-4 rounded-2xl border-2 border-amber-400/80 ${themeClasses.card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-amber-600">
                    Circular Oficial de Dirección General & Consejo Técnico (CTE)
                  </div>
                  <div className="text-sm font-black">
                    Circular 04: Cierre de Evaluaciones Formativas SEP y Sellos de Libreta
                  </div>
                  <div className={`text-xs ${themeClasses.subtext}`}>
                    Dirección General solicita confirmar de enterado la programación de reportes a padres.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDirectionCircularConfirmed(true);
                  setMagicLinkSentToast('✓ Acuse registrado: Dirección General recibió tu confirmación de la Circular 04.');
                  setTimeout(() => setMagicLinkSentToast(null), 5000);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  directionCircularConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                }`}
              >
                {directionCircularConfirmed ? '✓ Confirmado de Enterado' : 'Confirmar de Enterado'}
              </button>
            </div>

            {/* Layout Principal: Despacho Criptográfico (7 Columnas) + Simulador Móvil 1-Tap del Padre (5 Columnas) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* 7 Columnas: Consola de Despacho de Magic Links y Bitácora en Vivo */}
              <div className={`lg:col-span-7 p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className={`border-b pb-3 ${themeClasses.divider} flex items-center justify-between flex-wrap gap-2`}>
                  <div>
                    <h3 className="font-black text-base md:text-lg flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-sky-600" />
                      <span>Despacho de Magic Links a Padres de Familia</span>
                    </h3>
                    <p className={`text-xs ${themeClasses.subtext}`}>
                      Envío instantáneo sin exponer el número personal del docente, con acuse criptográfico en 1 toque.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 text-[11px] font-black">
                    ● Cifrado Activo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-75">1. Seleccionar Alumno:</label>
                    <select 
                      value={activeEnlaceStudent?.id || students[0]?.id || ''}
                      className={`w-full rounded-xl p-2.5 text-xs font-black border outline-hidden cursor-pointer ${themeClasses.inputBg}`}
                      onChange={(e) => handleSelectEnlaceStudent(e.target.value)}
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {getStudentFullName(s)} ({activePreparedClass?.groupLabel || '1°A'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-75">2. Teléfono Verificado del Tutor:</label>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${themeClasses.inputBg}`}>
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        value={enlacePhone}
                        onChange={(e) => setEnlacePhone(e.target.value)}
                        className="bg-transparent font-black text-xs outline-hidden w-full"
                        placeholder="+52 55 4829 8921"
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Categorías de Reporte */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase opacity-75">3. Motivo del Magic Link:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {([
                      { id: 'conducta', label: 'Seguimiento Aula' },
                      { id: 'tarea', label: 'Libreta / Tarea' },
                      { id: 'merito', label: 'Mérito (+50 XP)' },
                      { id: 'citatorio', label: 'Citatorio' }
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectIncidentType(tab.id)}
                        className={`p-2 rounded-xl font-black text-xs cursor-pointer transition-all border ${
                          enlaceIncidentType === tab.id
                            ? `${themeClasses.accentBg} border-transparent shadow-xs`
                            : `${themeClasses.btnSecondary}`
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase opacity-75">4. Mensaje Institucional (Editable):</label>
                  <textarea
                    rows={3}
                    value={enlaceMessage}
                    onChange={(e) => setEnlaceMessage(e.target.value)}
                    className={`w-full rounded-xl p-3 text-xs font-medium border outline-hidden ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSendMagicLink(activeEnlaceStudent, 'whatsapp', enlacePhone, true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Disparar Magic Link por WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMagicLink(activeEnlaceStudent, 'sms', enlacePhone, true)}
                    className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${themeClasses.btnSecondary}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Enviar SMS Seguro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMagicLink(activeEnlaceStudent, 'direct', enlacePhone, true)}
                    className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${themeClasses.pill}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Portal Completo del Padre</span>
                  </button>
                </div>

                {/* Bitácora de Trazabilidad en Vivo */}
                <div className={`pt-3 border-t ${themeClasses.divider} space-y-2`}>
                  <div className="text-xs font-black uppercase tracking-wider opacity-75">
                    Bitácora de Trazabilidad en Vivo (Acuses de Tutores):
                  </div>
                  <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                    {auditLogList.map(item => (
                      <div key={item.id} className={`p-2.5 rounded-xl border ${themeClasses.surfaceMuted} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'signed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="font-black">{item.studentName}:</span>
                            <span className="opacity-85 font-medium truncate">{item.action}</span>
                          </div>
                          {item.parentReply && (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-4 italic font-medium">
                              💬 {item.signedBy || 'Tutor'}: &ldquo;{item.parentReply}&rdquo;
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[10px] opacity-60">{item.time}</span>
                          {item.status === 'signed' ? (
                            <span className="text-emerald-700 dark:text-emerald-300 font-black text-[10px] bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              Firmado 1-Tap ✓
                            </span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-300 font-black text-[10px] bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                              Enviado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================================
                  5 Columnas: SIMULADOR MÓVIL INTERACTIVO 1-TAP DEL PADRE DE FAMILIA
                  ================================================================= */}
              <div className={`lg:col-span-5 p-5 rounded-2xl border ${themeClasses.card} flex flex-col items-center justify-between space-y-3`}>
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Simulador Móvil en Vivo (Vista del Padre)</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700">
                    Interactivo 1:1
                  </span>
                </div>

                {/* Carcasa de Smartphone */}
                {(() => {
                  const simStudent = activeEnlaceStudent || students[0];
                  const tutorInfo = getTutorInfoForStudent(simStudent);
                  const isStamped = simStudent ? !!stampedMap[simStudent.id]?.stamped : true;
                  const shortPage = todayStampPage.split(' - ')[0] || 'Pág. 48';
                  const signedRecord = simStudent ? mobileSimSignedMap[simStudent.id] : undefined;

                  return (
                    <div className="w-full max-w-[330px] rounded-[32px] border-[6px] border-slate-800 bg-[#ECE5DD] text-slate-900 shadow-xl overflow-hidden flex flex-col">
                      {/* Barra superior de WhatsApp / Celular */}
                      <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img src="/brand/iskool-logo-fondo-blanco.jpg" alt="iSkool" className="w-6 h-6 object-contain" />
                          </div>
                          <div>
                            <div className="font-black text-xs leading-tight">iSkool® Oficial</div>
                            <div className="text-[9px] text-emerald-200">Cuenta Escolar Verificada ✓</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">{currentTime}</span>
                      </div>

                      {/* Cuerpo de la tarjeta en el celular del tutor */}
                      <div className="p-3.5 space-y-2.5 text-xs">
                        <div className="bg-white rounded-2xl p-3 shadow-xs space-y-2 border border-slate-200">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-[10px] font-black uppercase text-sky-700">
                              Magic Link Escolar • 1-Tap
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">Sin Contraseñas</span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {simStudent && (
                              <img
                                src={getStudentAvatarUrl(simStudent)}
                                alt={simStudent.first_name}
                                className="w-10 h-10 rounded-full object-cover border border-sky-500"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-black text-xs text-slate-900 truncate">
                                {getStudentFullName(simStudent)}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                Tutor: {tutorInfo.tutorName}
                              </div>
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-snug">
                            {enlaceMessage}
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-center">
                              Asistencia: Presente ✓
                            </div>
                            <div className={`p-1.5 rounded-lg font-bold text-center border ${
                              isStamped
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {shortPage}: {isStamped ? 'Sellada ✓' : 'Sin Sello ✗'}
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <input
                              type="text"
                              value={mobileSimReplyInput}
                              onChange={(e) => setMobileSimReplyInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] text-slate-800 bg-white outline-hidden"
                              placeholder="Comentario opcional del padre..."
                            />
                          </div>

                          {signedRecord ? (
                            <div className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-black text-[11px] text-center flex items-center justify-center gap-1.5 shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>FIRMADO POR TUTOR ({signedRecord.signedAt})</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSimulateOneTapParentSignature}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#1D63FF] hover:opacity-95 text-white font-black text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Confirmar y Firmar con 1-Tap</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <p className={`text-[11px] ${themeClasses.subtext} text-center`}>
                  Puedes pulsar <strong>&ldquo;Confirmar y Firmar con 1-Tap&rdquo;</strong> aquí mismo para comprobar en tiempo real cómo impacta la firma del padre en la bitácora del profesor y en el Espejo CEO.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            9. VISTA 7: AJUSTES DEL SISTEMA (ESTÁNDARES INTERNACIONALES ISO / WCAG 2.2 AAA)
            Ubicado abajo de todos los menús de la barra lateral izquierda
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 max-w-[1640px] mx-auto w-full animate-fade-in">
            
            <div className={`p-5 rounded-2xl border ${themeClasses.card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base md:text-lg font-black tracking-tight">
                    Ajustes del Sistema & Estándares Internacionales (WCAG 2.2 AAA / ISO-9241)
                  </h2>
                </div>
                <p className={`text-xs ${themeClasses.subtext} mt-0.5`}>
                  Personaliza la ergonomía visual, paletas cromáticas, escala de proyección en aula y automatizaciones pedagógicas.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                Preferencias Guardadas Automáticamente
              </span>
            </div>

            {/* 1. Selección de Paleta Cromática Internacional */}
            <div className={`p-5 rounded-2xl border ${themeClasses.card} space-y-3.5`}>
              <div className="text-xs font-black uppercase tracking-wider flex items-center justify-between">
                <span>1. Paleta Cromática del Estudio Docente:</span>
                <span className="text-sky-600 font-bold">Activa: {theme.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Opción 1: iSkool Daylight Studio Pro (Predeterminada) */}
                <div
                  onClick={() => { setTheme('daylight'); savePreferences({ theme: 'daylight' }); }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    theme === 'daylight' ? 'border-sky-600 bg-[#E0F2FE] shadow-md ring-2 ring-sky-500/30' : 'border-sky-200 bg-[#F0F7FF] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl bg-gradient-to-r from-[#DBEAFE] to-[#E0F2FE] border border-sky-300 p-2 mb-2 flex flex-col justify-between">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1D63FF]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                    </div>
                    <div className="text-[10px] font-mono text-sky-800 font-black">#E0F2FE Azul Cielo</div>
                  </div>
                  <div className="font-black text-xs text-slate-900">Daylight Studio Pro ★</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Bento azul luminoso oficial de alto contraste.</div>
                </div>

                {/* Opción 2: Editorial Suizo */}
                <div
                  onClick={() => { setTheme('suizo'); savePreferences({ theme: 'suizo' }); }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    theme === 'suizo' ? 'border-[#C2410C] bg-[#EFE4CE] shadow-md ring-2 ring-[#C2410C]/30' : 'border-[#C8B28B] bg-[#FBF6EC] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl bg-gradient-to-r from-[#E6D7BE] to-[#EFE4CE] border border-[#C8B28B] p-2 mb-2 flex flex-col justify-between">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#261E14]" />
                    </div>
                    <div className="text-[10px] font-mono text-[#78350F] font-black">#EFE4CE Pergamino Cálido</div>
                  </div>
                  <div className="font-black text-xs text-[#261E14]">Editorial Suizo</div>
                  <div className="text-[11px] text-[#6B563E] mt-0.5">Papel pergamino cálido y terracota antirreflejo.</div>
                </div>

                {/* Opción 3: Bosque Esmeralda */}
                <div
                  onClick={() => { setTheme('esmeralda'); savePreferences({ theme: 'esmeralda' }); }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    theme === 'esmeralda' ? 'border-emerald-400 bg-[#06241A] shadow-sm' : 'border-emerald-950 bg-[#051C14] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl bg-[#0A2E22] border border-emerald-500/40 p-2 mb-2 flex flex-col justify-between">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    </div>
                    <div className="text-[10px] font-mono text-emerald-300 font-bold">#051C14 Pizarra</div>
                  </div>
                  <div className="font-black text-xs text-emerald-50">Bosque Esmeralda</div>
                  <div className="text-[11px] text-emerald-200/70 mt-0.5">Verde pizarrón clásico antifatiga visual.</div>
                </div>

                {/* Opción 4: Bóveda Carbón OLED */}
                <div
                  onClick={() => { setTheme('carbon'); savePreferences({ theme: 'carbon' }); }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    theme === 'carbon' ? 'border-cyan-400 bg-[#0A1322] shadow-sm' : 'border-slate-800 bg-[#070F1E] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl bg-[#0D1829] border border-cyan-500/40 p-2 mb-2 flex flex-col justify-between">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 font-bold">#070F1E OLED</div>
                  </div>
                  <div className="font-black text-xs text-white">Carbón Nocturno</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Modo oscuro profundo para aulas sin luz.</div>
                </div>

                {/* Opción 5: Heritage Borgoña */}
                <div
                  onClick={() => { setTheme('heritage'); savePreferences({ theme: 'heritage' }); }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                    theme === 'heritage' ? 'border-amber-400 bg-[#1C0A0A] shadow-sm' : 'border-red-950 bg-[#160808] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl bg-[#220E0E] border border-amber-500/40 p-2 mb-2 flex flex-col justify-between">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                    <div className="text-[10px] font-mono text-amber-300 font-bold">#160808 Gala</div>
                  </div>
                  <div className="font-black text-xs text-amber-50">Institucional Gala</div>
                  <div className="text-[11px] text-amber-200/70 mt-0.5">Borgoña solemne con acentos dorados.</div>
                </div>
              </div>
            </div>

            {/* 2. Escala Tipográfica, Densidad de Barra Lateral y Automatizaciones Pedagógicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className="text-xs font-black uppercase tracking-wider">
                  2. Ergonomía Visual & Escala de Proyección:
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-bold ${themeClasses.subtext}`}>Tamaño Tipográfico Global:</div>
                    <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-md border ${themeClasses.pill}`}>
                      Escala activa: {fontSize === 'compact' ? '91% (14px)' : fontSize === 'projector' ? '112% (18.5px)' : '100% (16px)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'compact', label: 'Compacta (91%)' },
                      { id: 'standard', label: 'Estándar (100%)' },
                      { id: 'projector', label: 'Proyector Aula (112%)' }
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setFontSize(opt.id); savePreferences({ fontSize: opt.id }); }}
                        className={`p-2.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                          fontSize === opt.id ? `${themeClasses.accentBg} shadow-sm scale-[1.02]` : `${themeClasses.btnSecondary}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className={`text-xs font-bold ${themeClasses.subtext}`}>Modo de Barra Lateral Izquierda:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSidebarExpanded(true); savePreferences({ sidebarExpanded: true }); }}
                      className={`p-2.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        sidebarExpanded ? `${themeClasses.accentBg} shadow-xs` : `${themeClasses.btnSecondary}`
                      }`}
                    >
                      Expandida con Contadores
                    </button>
                    <button
                      onClick={() => { setSidebarExpanded(false); savePreferences({ sidebarExpanded: false }); }}
                      className={`p-2.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        !sidebarExpanded ? `${themeClasses.accentBg} shadow-xs` : `${themeClasses.btnSecondary}`
                      }`}
                    >
                      Compacta (Solo Íconos)
                    </button>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${themeClasses.card} space-y-3`}>
                <div className="text-xs font-black uppercase tracking-wider">
                  3. Automatizaciones Pedagógicas & Accesibilidad:
                </div>

                <label className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex items-center justify-between gap-3 cursor-pointer`}>
                  <div>
                    <div className="text-xs font-black">Sincronización Automática con Bóveda Curricular</div>
                    <div className={`text-[11px] ${themeClasses.subtext}`}>Guarda cada clase diferida como nodo Markdown reutilizable.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncVault}
                    onChange={(e) => { setAutoSyncVault(e.target.checked); savePreferences({ autoSyncVault: e.target.checked }); }}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex items-center justify-between gap-3 cursor-pointer`}>
                  <div>
                    <div className="text-xs font-black">Preguntas Detonadoras Dinámicas con Taxonomía de Bloom</div>
                    <div className={`text-[11px] ${themeClasses.subtext}`}>Adapta la pregunta en pizarra al cambiar entre los 6 niveles de Bloom.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBloomSuggestions}
                    onChange={(e) => { setAutoBloomSuggestions(e.target.checked); savePreferences({ autoBloomSuggestions: e.target.checked }); }}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`p-3 rounded-xl border ${themeClasses.surfaceMuted} flex items-center justify-between gap-3 cursor-pointer`}>
                  <div>
                    <div className="text-xs font-black">Bordes de Alto Contraste WCAG 2.2 AAA</div>
                    <div className={`text-[11px] ${themeClasses.subtext}`}>Refuerza el contorno de las tarjetas para proyectores con mucha luz ambiental.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrastBorders}
                    onChange={(e) => { setHighContrastBorders(e.target.checked); savePreferences({ highContrastBorders: e.target.checked }); }}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          10. MODAL DE MAGIC LINK INMEDIATO (DISPARO DIRECTO A PADRES)
          ========================================================================= */}
      {magicLinkModalStudent && (() => {
        const modalAtt = attendanceMap[magicLinkModalStudent.id] || 'present';
        const modalStamp = stampedMap[magicLinkModalStudent.id];
        const isModalStamped = !!modalStamp?.stamped;
        const modalStampPage = modalStamp?.page || todayStampPage;
        const modalPageNumber = modalStampPage.includes(' - ') ? modalStampPage.split(' - ')[0] : modalStampPage;
        
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://iskool.edu.mx';
        const generatedToken = `ml_${magicLinkModalStudent.id}_${Date.now().toString(36)}`;
        const fullMagicUrl = `${origin}/parent?student_id=${encodeURIComponent(magicLinkModalStudent.id)}&token=${generatedToken}&auth=magic`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className={`w-full max-w-md p-5 rounded-2xl border ${themeClasses.card} space-y-4 shadow-2xl`}>
              
              <div className={`flex items-center justify-between border-b pb-3 ${themeClasses.divider}`}>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  <h3 className="font-black text-sm md:text-base">
                    Disparo de Magic Link Inmediato
                  </h3>
                </div>
                <button 
                  onClick={() => setMagicLinkModalStudent(null)}
                  className={`p-1 rounded-lg ${themeClasses.btnSecondary} cursor-pointer`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-3.5 rounded-xl border ${themeClasses.surfaceMuted} space-y-2.5 text-xs`}>
                <div className="flex items-center gap-3">
                  <img
                    src={getStudentAvatarUrl(magicLinkModalStudent)}
                    alt={magicLinkModalStudent.first_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-sky-500"
                  />
                  <div>
                    <div className="font-black text-sm">
                      {getStudentFullName(magicLinkModalStudent)}
                    </div>
                    <div className={`text-[11px] ${themeClasses.subtext}`}>
                      {activePreparedClass?.groupLabel || '1°A Secundaria'} • Reporte Diario Oficial
                    </div>
                  </div>
                </div>

                <div className={`space-y-1.5 pt-2 border-t ${themeClasses.divider} text-[11px]`}>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Asistencia Hoy:</span>
                    <span className="font-black text-emerald-600">
                      {modalAtt === 'present' ? 'Presente (08:00 AM) ✓' :
                       modalAtt === 'late' ? 'Retardo (08:15 AM) ⚠' :
                       modalAtt === 'absent' ? 'Falta en Aula ✗' : 'Justificado ℹ'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Libreta Física:</span>
                    <span className={`font-black ${isModalStamped ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isModalStamped ? `${modalPageNumber} Sellada ✓` : `${modalPageNumber} Sin Sello ✗`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Nivel Cognitivo Bloom:</span>
                    <span className="text-sky-600 font-black">{activeBloomConfig.label}</span>
                  </div>
                </div>

                <div className={`pt-2 border-t ${themeClasses.divider} space-y-1 text-[11px]`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">Tutor registrado:</span>
                    <span className="font-black">{magicLinkModalStudent.tutor_name || `Tutor de ${magicLinkModalStudent.first_name}`}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${themeClasses.inputBg}`}>
                    <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <input
                      type="text"
                      value={modalCustomPhone}
                      onChange={(e) => setModalCustomPhone(e.target.value)}
                      placeholder="Teléfono (ej. 55-4160-8800)"
                      className="bg-transparent font-black text-xs outline-hidden w-full"
                    />
                  </div>
                </div>

                <div className={`pt-2 border-t ${themeClasses.divider} space-y-1`}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="opacity-70">Magic Link Cifrado Generado:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fullMagicUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="text-sky-600 font-black flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                    </button>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${themeClasses.inputBg} text-[10px] font-mono truncate select-all`}>
                    {fullMagicUrl}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleSendMagicLink(magicLinkModalStudent, 'whatsapp', modalCustomPhone)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar por WhatsApp Institucional</span>
                </button>

                <button
                  onClick={() => handleSendMagicLink(magicLinkModalStudent, 'sms', modalCustomPhone)}
                  className={`w-full py-2 px-4 rounded-xl ${themeClasses.btnSecondary} font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar por SMS Seguro</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
