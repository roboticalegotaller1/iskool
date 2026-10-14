"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  useLanguagesStore, 
  LanguageLesson, 
  LanguageCode, 
  AvatarGender,
  DialogueLine,
  KaraokePhrase 
} from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { HardwareAudioTester } from '@/components/languages/HardwareAudioTester';
import { LanguageAnalyticsCharts } from '@/components/languages/LanguageAnalyticsCharts';
import { Curriculum12PhasesExplorer } from '@/components/languages/Curriculum12PhasesExplorer';
import { BackButton } from '@/components/navigation/BackButton';
import { 
  MULTILINGUAL_HISTORICAL_FIGURES, 
  MultilingualHistoricalFigure,
  playUniversalIskoolVoice,
  stopAllIskoolAudio
} from '@/lib/historicalVoiceEngine';
import { 
  Languages, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  MessageSquare, 
  Mic, 
  Flame, 
  Trophy, 
  BookOpen, 
  Save, 
  Gauge, 
  Users, 
  Clock, 
  Search,
  CheckCheck,
  BarChart3,
  Layers,
  Activity,
  Award,
  Globe2,
  Sliders,
  Landmark,
  ShieldCheck,
  Play,
  Pause,
  Building2,
  GraduationCap,
  Check,
  School,
  PenTool,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import { english40WeeksCurriculum } from '@/components/languages/data/english40WeeksCurriculum';
import { french40WeeksCurriculum } from '@/components/languages/data/french40WeeksCurriculum';
import { CurricularWeek, CurricularLesson } from '@/components/languages/data/curriculumTypes';

interface IbimeCampus {
  id: string;
  name: string;
  shortName: string;
  cct: string;
  badge: string;
  levelInfo: string;
}

const IBIME_CAMPUSES: IbimeCampus[] = [
  {
    id: 'montes',
    name: 'Campus Montes (Sede Central & CCH)',
    shortName: 'Montes',
    cct: '15PPR3322G',
    badge: 'Sede Matriz · CCH UNAM',
    levelInfo: 'Preescolar · Primaria · Secundaria · Bachillerato CCH'
  },
  {
    id: 'lagos',
    name: 'Campus Lagos (Fundador 2004)',
    shortName: 'Lagos',
    cct: '15PES0124X',
    badge: 'Fundador · Bilingüe Integral',
    levelInfo: 'Maternal · Preescolar · Primaria'
  },
  {
    id: 'sancristobal',
    name: 'Campus San Cristóbal (Ecatepec Centro)',
    shortName: 'San Cristóbal',
    cct: '15PES0891Z',
    badge: 'Centro Integral · Idiomas',
    levelInfo: 'Primaria · Secundaria Bilingüe'
  },
  {
    id: 'coacalco',
    name: 'Campus Coacalco (Zarzaparrillas)',
    shortName: 'Coacalco',
    cct: '15PPR4411K',
    badge: 'Valle de México · ESL/FLE',
    levelInfo: 'Preescolar · Primaria Bilingüe'
  }
];

const CEFR_CERTIFICATIONS: Record<string, {
  cambridge: string;
  french: string;
  cenni: string;
  unamNote: string;
  color: string;
}> = {
  A1: {
    cambridge: 'Cambridge English: Pre-A1 Starters / A1 Movers',
    french: 'DELF Prim / Scolaire A1',
    cenni: 'CENNI Nivel 3 - 5 (Básico Inicial)',
    unamNote: 'Iniciación Temprana · Fase 1 a 3',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
  },
  A2: {
    cambridge: 'Cambridge English: A2 Key (KET) for Schools',
    french: 'DELF A2 Junior / Scolaire',
    cenni: 'CENNI Nivel 6 - 8 (Básico Consolidado)',
    unamNote: 'Egreso Primaria & Secundaria Temprana',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
  },
  B1: {
    cambridge: 'Cambridge English: B1 Preliminary (PET) for Schools',
    french: 'DELF B1 Scolaire',
    cenni: 'CENNI Nivel 9 - 11 (Intermedio Independiente)',
    unamNote: 'Perfil Egreso Secundaria Bilingüe IBIME',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
  },
  B2: {
    cambridge: 'Cambridge English: B2 First (FCE) for Schools',
    french: 'DELF B2 Tout Public / Scolaire',
    cenni: 'CENNI Nivel 12 - 14 (Avanzado Operativo)',
    unamNote: 'Requisito Oficial de Egreso y Titulación CCH UNAM',
    color: 'from-rose-500/20 to-red-500/20 border-red-500/40 text-red-300'
  },
  C1: {
    cambridge: 'Cambridge English: C1 Advanced (CAE)',
    french: 'DALF C1 Académique',
    cenni: 'CENNI Nivel 15 - 17 (Dominio Operativo Eficaz)',
    unamNote: 'Nivel Docente / Excelencia Universitaria',
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300'
  },
  C2: {
    cambridge: 'Cambridge English: C2 Proficiency (CPE)',
    french: 'DALF C2 Maîtrise',
    cenni: 'CENNI Nivel 18 - 20 (Maestría Plena)',
    unamNote: 'Dominio Nativo Bilingüe',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300'
  }
};

const HISTORICAL_TRANSLATIONS: Record<string, string> = {
  shakespeare: 'Soy William Shakespeare. Nací en Stratford-upon-Avon, y sobre las tablas del Teatro Globe en Londres, forjé las tragedias de Hamlet y Macbeth.',
  ada_lovelace: 'Soy Ada Lovelace. En 1843, escribí el primer algoritmo computacional para la Máquina Analítica de Charles Babbage, vislumbrando que las máquinas manipularían símbolos y compondrían música.',
  abraham_lincoln: 'Soy Abraham Lincoln, 16º presidente de los Estados Unidos. En 1863, proclamé que el gobierno del pueblo, por el pueblo y para el pueblo, no perecerá de la tierra.',
  napoleon: 'Soy Napoleón Bonaparte, nacido en Ajaccio en Córcega. Reorganicé la administración, promulgué el Código Civil y conduje los ejércitos de la República.',
  marie_curie: 'Soy Marie Curie. Junto a Pierre Curie, aislé el polonio y el radio en mi modesto laboratorio de París, convirtiéndome en la primera laureada con dos Premios Nobel.',
  victor_hugo: 'Soy Victor Hugo. Escribí Los Miserables y Nuestra Señora de París para dar voz a los humildes y defender la dignidad humana contra toda opresión.',
  jeanne_darc: 'Soy Juana de Arco, la Doncella de Orleans. A los diecisiete años, guiada por mi fe, levanté el sitio de Orleans y conduje al delfín Carlos a su coronación en Reims.'
};

export default function TeacherIdiomasPage() {
  const { 
    lessons, 
    activeLessonId, 
    setActiveLessonId, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    studentReports,
    markReportAsReviewed 
  } = useLanguagesStore();

  // Pestañas del Centro de Idiomas
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'curriculum' | 'hardware' | 'reports'>('editor');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [selectedKaraokeIndex, setSelectedKaraokeIndex] = useState<number>(0);
  const [reportFilter, setReportFilter] = useState<'all' | 'unreviewed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [useHistoricalFigure, setUseHistoricalFigure] = useState<boolean>(false);
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string>('shakespeare');

  // Estado Institucional IBIME y Sedes
  const [selectedCampusId, setSelectedCampusId] = useState<string>('montes');
  const [isIbimePresentationMode, setIsIbimePresentationMode] = useState<boolean>(true);
  const [isLightMode, setIsLightMode] = useState<boolean>(true); // Rediseño en Colores Claros (Light Mode)

  // Estado de reproducción y prueba auditiva de la voz
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [activePlayingLineId, setActivePlayingLineId] = useState<string | null>(null);
  const audioControllerRef = useRef<any>(null);

  // Estado de vista del panel derecho del taller (Plan de 40 Semanas vs Editor de Guion)
  const [workshopRightView, setWorkshopRightView] = useState<'curriculum' | 'script'>('curriculum');
  const [curriculumTrimester, setCurriculumTrimester] = useState<1 | 2 | 3>(1);
  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [showDialogueTranslation, setShowDialogueTranslation] = useState<boolean>(true);
  const [expandedWeekNumber, setExpandedWeekNumber] = useState<number | null>(null);

  const activeLesson = useMemo(() => {
    return lessons.find(l => l.id === activeLessonId) || lessons[0];
  }, [lessons, activeLessonId]);

  const selectedCampus = useMemo(() => {
    return IBIME_CAMPUSES.find(c => c.id === selectedCampusId) || IBIME_CAMPUSES[0];
  }, [selectedCampusId]);

  const activeCertification = useMemo(() => {
    return CEFR_CERTIFICATIONS[activeLesson.level] || CEFR_CERTIFICATIONS['B1'];
  }, [activeLesson.level]);

  // Resolución infalible de imagen 3D de alta fidelidad (ignora rutas obsoletas de localStorage)
  const resolvedAvatar3dSrc = useMemo(() => {
    // 1. Si está activo el modo prócer histórico o la lección tiene historicalFigureId
    if (useHistoricalFigure || activeLesson.historicalFigureId) {
      const histId = selectedHistoricalId || activeLesson.historicalFigureId;
      const histFig = MULTILINGUAL_HISTORICAL_FIGURES.find(f => f.id === histId || f.name === activeLesson.avatarName);
      if (histFig?.avatarImage && histFig.avatarImage.includes('/3d/')) {
        return histFig.avatarImage;
      }
      if (histId === 'shakespeare') return '/images/languages/3d/shakespeare_3d.webp';
      if (histId === 'ada_lovelace') return '/images/languages/3d/ada_lovelace_3d.webp';
      if (histId === 'abraham_lincoln') return '/images/languages/3d/abraham_lincoln_3d.webp';
      if (histId === 'marie_curie') return '/images/languages/3d/marie_curie_3d.webp';
      if (histId === 'napoleon') return '/images/languages/3d/napoleon_3d.webp';
    }

    // 2. Si la lección ya tiene una ruta 3D explícita válida
    if (activeLesson.avatarImage && activeLesson.avatarImage.includes('/3d/')) {
      return activeLesson.avatarImage;
    }

    // 3. Fallback inteligente según género o nombre del mentor estándar
    if (
      activeLesson.avatarGender === 'female' ||
      activeLesson.avatarName?.toLowerCase().includes('claire') ||
      activeLesson.avatarName?.toLowerCase().includes('sophie')
    ) {
      return '/images/languages/3d/mentor_female_3d.webp';
    }
    return '/images/languages/3d/mentor_male_3d_v2.webp';
  }, [useHistoricalFigure, selectedHistoricalId, activeLesson.historicalFigureId, activeLesson.avatarImage, activeLesson.avatarGender, activeLesson.avatarName]);

  // Soporte pedagógico y traducción dinámicamente resuelta (evita directivas internas)
  const resolvedTranslationText = useMemo(() => {
    if (showDialogueTranslation) {
      const raw = activeLesson.dialogue[0]?.translationEs;
      // Si el texto en base de datos es una directiva interna o está vacío, sustituir por la traducción real
      if (!raw || raw.toLowerCase().includes('primera persona') || raw.toLowerCase().includes('obligatoria') || raw.toLowerCase().includes('presentación en')) {
        const histId = selectedHistoricalId || activeLesson.historicalFigureId;
        if (histId && HISTORICAL_TRANSLATIONS[histId]) {
          return HISTORICAL_TRANSLATIONS[histId];
        }
      }
      return raw || "Traducción en tiempo real de la frase modelo.";
    }
    return activeLesson.dialogue[0]?.phoneticTip || "Dicción y modulación nativa en tiempo real.";
  }, [showDialogueTranslation, activeLesson.dialogue, selectedHistoricalId, activeLesson.historicalFigureId]);

  // Base curricular de 40 semanas según el idioma activo
  const current40Weeks: CurricularWeek[] = useMemo(() => {
    return activeLesson.language === 'fr' ? french40WeeksCurriculum : english40WeeksCurriculum;
  }, [activeLesson.language]);

  // Filtrado de semanas por trimestre y búsqueda
  const filteredCurriculumWeeks = useMemo(() => {
    return current40Weeks.filter(w => {
      if (!curriculumSearch.trim() && w.trimester !== curriculumTrimester) return false;
      if (!curriculumSearch.trim()) return true;
      const q = curriculumSearch.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.level.toLowerCase().includes(q) ||
        w.certificationTarget.toLowerCase().includes(q) ||
        w.lessons.some(l => l.target.toLowerCase().includes(q) || l.title.toLowerCase().includes(q))
      );
    });
  }, [current40Weeks, curriculumTrimester, curriculumSearch]);

  // Carga instantánea de una semana curricular completa al taller docente
  const handleLoadWeekIntoWorkshop = (week: CurricularWeek) => {
    const isFr = activeLesson.language === 'fr';
    const firstLesson = week.lessons[0] || {
      id: `w${week.weekNumber}-1`,
      title: week.title,
      target: isFr ? "Bonjour! Pratiquons notre prononciation aujourd'hui." : "Hello! Let us practice our pronunciation today.",
      translationEs: "¡Hola! Practiquemos nuestra pronunciación hoy.",
      phoneticTip: "Articula con claridad y ritmo constante."
    };

    const dialogueLines: DialogueLine[] = [
      {
        id: `d-${Date.now()}-1`,
        speaker: 'avatar',
        text: firstLesson.target,
        translationEs: firstLesson.translationEs,
        phoneticTip: firstLesson.phoneticTip
      },
      ...(week.lessons[1] ? [{
        id: `d-${Date.now()}-2`,
        speaker: 'student' as const,
        text: week.lessons[1].target,
        translationEs: week.lessons[1].translationEs
      }] : [])
    ];

    const karaokePhrases: KaraokePhrase[] = week.lessons.map((l, idx) => ({
      id: `k-${Date.now()}-${idx}`,
      targetText: l.target,
      translationEs: l.translationEs,
      difficulty: (week.cefr === 'A1' ? 'beginner' : week.cefr === 'A2' ? 'intermediate' : 'advanced') as any,
      phoneticGuide: l.phoneticTip
    }));

    const cleanTitle = week.title.replace(/^Week \d+:\s*/, '').replace(/^Semaine \d+:\s*/, '');
    const newId = addLesson({
      title: `Semana ${week.weekNumber}: ${cleanTitle}`,
      topic: week.title,
      language: activeLesson.language,
      level: week.cefr.startsWith('B') ? 'B1' : week.cefr.startsWith('A2') ? 'A2' : 'A1',
      avatarGender: activeLesson.avatarGender,
      avatarName: activeLesson.avatarName,
      avatarVoice: activeLesson.avatarVoice,
      avatarImage: resolvedAvatar3dSrc,
      historicalFigureId: activeLesson.historicalFigureId,
      defaultSpeed: activeLesson.defaultSpeed,
      dialogue: dialogueLines,
      karaokePhrases: karaokePhrases
    });

    setActiveLessonId(newId);
  };

  // Carga instantánea de una lección curricular específica al taller docente
  const handleLoadSingleLessonIntoWorkshop = (week: CurricularWeek, lesson: CurricularLesson) => {
    const dialogueLines: DialogueLine[] = [
      {
        id: `d-${Date.now()}-1`,
        speaker: 'avatar',
        text: lesson.target,
        translationEs: lesson.translationEs,
        phoneticTip: lesson.phoneticTip
      }
    ];

    const karaokePhrases: KaraokePhrase[] = [
      {
        id: `k-${Date.now()}-0`,
        targetText: lesson.target,
        translationEs: lesson.translationEs,
        difficulty: (week.cefr === 'A1' ? 'beginner' : week.cefr === 'A2' ? 'intermediate' : 'advanced') as any,
        phoneticGuide: lesson.phoneticTip
      },
      ...week.lessons
        .filter(l => l.id !== lesson.id)
        .map((l, idx) => ({
          id: `k-${Date.now()}-${idx + 1}`,
          targetText: l.target,
          translationEs: l.translationEs,
          difficulty: (week.cefr === 'A1' ? 'beginner' : week.cefr === 'A2' ? 'intermediate' : 'advanced') as any,
          phoneticGuide: l.phoneticTip
        }))
    ];

    const cleanWeekTitle = week.title.replace(/^Week \d+:\s*/, '').replace(/^Semaine \d+:\s*/, '');
    const newId = addLesson({
      title: `${cleanWeekTitle} · ${lesson.title}`,
      topic: `${week.title} - ${lesson.title}`,
      language: activeLesson.language,
      level: week.cefr.startsWith('B') ? 'B1' : week.cefr.startsWith('A2') ? 'A2' : 'A1',
      avatarGender: activeLesson.avatarGender,
      avatarName: activeLesson.avatarName,
      avatarVoice: activeLesson.avatarVoice,
      avatarImage: resolvedAvatar3dSrc,
      historicalFigureId: activeLesson.historicalFigureId,
      defaultSpeed: activeLesson.defaultSpeed,
      dialogue: dialogueLines,
      karaokePhrases: karaokePhrases
    });

    setActiveLessonId(newId);
  };

  // Personajes históricos filtrados por el idioma de la lección
  const availableHistoricalFigures = useMemo(() => {
    return MULTILINGUAL_HISTORICAL_FIGURES.filter(fig => fig.language === activeLesson.language);
  }, [activeLesson.language]);

  // Sincronizar automáticamente si la lección activa es un personaje histórico
  useEffect(() => {
    const isHist = Boolean(
      activeLesson.historicalFigureId ||
      activeLesson.avatarImage?.includes('/historical/') ||
      MULTILINGUAL_HISTORICAL_FIGURES.some(f => f.name === activeLesson.avatarName || f.id === activeLesson.historicalFigureId)
    );
    setUseHistoricalFigure(isHist);
    if (isHist) {
      const fig = MULTILINGUAL_HISTORICAL_FIGURES.find(f => f.name === activeLesson.avatarName || f.id === activeLesson.historicalFigureId);
      if (fig) {
        setSelectedHistoricalId(fig.id);
      }
    }
  }, [activeLesson.id, activeLesson.avatarName, activeLesson.historicalFigureId, activeLesson.avatarImage]);

  // Voces disponibles según género e idioma con calibración fonética óptima
  const availableVoices = useMemo(() => {
    if (activeLesson.language === 'en') {
      return activeLesson.avatarGender === 'female'
        ? [
            { id: 'en-US-JennyNeural', label: 'Claire (EE.UU.) · Femenina Suave & Pedagógica' },
            { id: 'en-GB-SoniaNeural', label: 'Sonia / Ada Lovelace (Reino Unido) · Victoriana Clásica' },
            { id: 'en-US-AvaMultilingualNeural', label: 'Ava (EE.UU.) · Expresiva Multilingüe' },
            { id: 'en-US-EmmaMultilingualNeural', label: 'Emma (EE.UU.) · Fonética Clara' }
          ]
        : [
            { id: 'en-US-GuyNeural', label: 'Arthur / Lincoln (EE.UU.) · Masculina Académica' },
            { id: 'en-GB-RyanNeural', label: 'Shakespeare (Reino Unido) · Oxford Teatral' },
            { id: 'en-US-AndrewMultilingualNeural', label: 'Andrew (EE.UU.) · Dinámico & Moderno' }
          ];
    } else {
      return activeLesson.avatarGender === 'female'
        ? [
            { id: 'fr-FR-VivienneMultilingualNeural', label: 'Mme. Sophie (Francia) · Parisina Expresiva & Pedagógica' },
            { id: 'fr-FR-DeniseNeural', label: 'Marie Curie (Francia) · Académica Posada & Clara' },
            { id: 'fr-FR-EloiseNeural', label: 'Jeanne d\'Arc (Francia) · Juvenil Heroica' },
            { id: 'fr-CA-SylvieNeural', label: 'Sylvie (Canadá) · Québécoise Suave' }
          ]
        : [
            { id: 'fr-FR-HenriNeural', label: 'Prof. Henri / Napoléon (Francia) · Profesor Masculino & Estadista' },
            { id: 'fr-FR-RemyMultilingualNeural', label: 'Rémy (Francia) · Conversacional Moderno' },
            { id: 'fr-CA-JeanNeural', label: 'Jean (Canadá) · Québécois Masculino' }
          ];
    }
  }, [activeLesson.language, activeLesson.avatarGender]);

  // Crear nueva lección rápida
  const handleCreateNewLesson = () => {
    const isFr = activeLesson.language === 'fr';
    const id = addLesson({
      title: isFr ? 'Nouvelle Conversation Guidée' : 'New Guided Conversation',
      topic: isFr ? 'Communication Quotidienne' : 'Essential Communication',
      language: activeLesson.language,
      level: 'A1',
      avatarGender: isFr ? 'male' : 'female',
      avatarName: isFr ? 'Henri' : 'Claire',
      avatarVoice: isFr ? 'fr-FR-HenriNeural' : 'en-US-JennyNeural',
      defaultSpeed: 0.85,
      dialogue: [
        {
          id: `d-${Date.now()}-1`,
          speaker: 'avatar',
          text: isFr ? 'Bonjour la classe! Comment allez-vous aujourd\'hui?' : 'Hello students! How are you feeling today?',
          translationEs: isFr ? '¡Buenos días clase! ¿Cómo están hoy?' : '¡Hola alumnos! ¿Cómo se sienten hoy?',
          phoneticTip: isFr ? 'Prononcer les voyelles nasales clairement' : 'Pronounce the "H" with gentle aspiration'
        },
        {
          id: `d-${Date.now()}-2`,
          speaker: 'student',
          text: isFr ? 'Je suis très heureux d\'apprendre le français!' : 'I am excited to learn and practice my pronunciation!',
          translationEs: isFr ? '¡Estoy muy feliz de aprender francés!' : '¡Estoy emocionado por aprender y practicar mi pronunciación!'
        }
      ],
      karaokePhrases: [
        {
          id: `k-${Date.now()}-1`,
          targetText: isFr ? 'Je suis très heureux d\'apprendre le français' : 'I am excited to learn and practice my pronunciation',
          translationEs: isFr ? 'Estoy muy feliz de aprender francés' : 'Estoy emocionado por aprender y practicar mi pronunciación',
          difficulty: 'beginner',
          phoneticGuide: isFr ? 'ʒə sɥi tʁɛ zœ.ʁø da.pʁɑ̃dʁ lə fʁɑ̃.sɛ' : 'ai æm ɪkˈsaɪtɪd tuː lɜːrn ænd ˈpræktɪs'
        }
      ]
    });
    setActiveLessonId(id);
    setIsPreviewMode(false);
  };

  // Cargar plantilla desde las 12 Fases curriculares
  const handleLoadCurriculumTemplate = (template: {
    title: string;
    topic: string;
    level: string;
    language: 'en' | 'fr';
    dialogue: any[];
    karaokePhrases: any[];
  }) => {
    const isFr = template.language === 'fr';
    const newLessonId = addLesson({
      title: template.title,
      topic: template.topic,
      language: template.language,
      level: (template.level as any) || 'B1',
      avatarGender: isFr ? 'female' : 'male',
      avatarName: isFr ? 'Sophie' : 'Arthur',
      avatarVoice: isFr ? 'fr-FR-DeniseNeural' : 'en-US-GuyNeural',
      defaultSpeed: 0.85,
      dialogue: template.dialogue,
      karaokePhrases: template.karaokePhrases
    });
    setActiveLessonId(newLessonId);
    setActiveTab('editor');
    setIsPreviewMode(false);
  };

  // Asignar personaje histórico seleccionado
  const handleApplyHistoricalFigure = (figure: MultilingualHistoricalFigure) => {
    const spanishIntro = HISTORICAL_TRANSLATIONS[figure.id] || 'Presentación canónica del personaje histórico.';
    updateLesson(activeLesson.id, {
      avatarName: figure.name,
      avatarVoice: figure.voiceId,
      avatarGender: figure.gender,
      avatarImage: figure.avatarImage,
      historicalFigureId: figure.id,
      defaultSpeed: figure.speechRate,
      dialogue: [
        {
          id: `d-${Date.now()}-intro`,
          speaker: 'avatar',
          text: figure.canonicalIntro,
          translationEs: spanishIntro,
          phoneticTip: 'Dicción solemne y articulación nativa de época'
        },
        {
          id: `d-${Date.now()}-q1`,
          speaker: 'student',
          text: figure.sampleQuestions[0] || 'Tell me about your historical legacy.',
          translationEs: 'Pregunta del alumno al personaje.'
        }
      ],
      karaokePhrases: [
        {
          id: `k-${Date.now()}-hist`,
          targetText: figure.canonicalIntro.split('.')[0] + '.',
          translationEs: spanishIntro.split('.')[0] + '.',
          difficulty: 'intermediate'
        }
      ]
    });
  };

  // Reproducción y auditoría de muestra fonética en tiempo real
  const handlePlayAudioSample = async (textToPlay?: string, lineId?: string) => {
    if (isPlayingPreview || activePlayingLineId) {
      stopAllIskoolAudio();
      audioControllerRef.current?.stop();
      setIsPlayingPreview(false);
      setActivePlayingLineId(null);
      // Si el usuario presionó el botón de detener la muestra activa, salir de inmediato
      if (!lineId && isPlayingPreview) return;
      if (lineId && activePlayingLineId === lineId) return;
    }

    const defaultSample = activeLesson.language === 'fr'
      ? (useHistoricalFigure
          ? availableHistoricalFigures.find(f => f.name === activeLesson.avatarName)?.canonicalIntro || "Bonjour, je suis votre mentor de français. Pratiquons une prononciation claire et authentique."
          : `Bonjour! Je suis ${activeLesson.avatarName}. Bienvenue dans notre atelier de français. Écoutez attentivement ma prononciation et répétez après moi.`)
      : (useHistoricalFigure
          ? availableHistoricalFigures.find(f => f.name === activeLesson.avatarName)?.canonicalIntro || "Hello, I am your English mentor. Let us practice clear and fluent speech together."
          : `Hello! My name is ${activeLesson.avatarName}. Welcome to our language workshop. Listen carefully to my pronunciation and practice with me.`);

    const sampleText = textToPlay || defaultSample;

    if (lineId) {
      setActivePlayingLineId(lineId);
    } else {
      setIsPlayingPreview(true);
    }

    try {
      audioControllerRef.current = await playUniversalIskoolVoice({
        text: sampleText,
        voiceId: activeLesson.avatarVoice,
        language: activeLesson.language,
        gender: activeLesson.avatarGender,
        rate: activeLesson.defaultSpeed,
        onStart: () => {
          if (lineId) setActivePlayingLineId(lineId);
          else setIsPlayingPreview(true);
        },
        onEnd: () => {
          setIsPlayingPreview(false);
          setActivePlayingLineId(null);
        },
        onError: () => {
          setIsPlayingPreview(false);
          setActivePlayingLineId(null);
        }
      });
    } catch {
      setIsPlayingPreview(false);
      setActivePlayingLineId(null);
    }
  };

  // Añadir línea de diálogo
  const handleAddDialogueLine = () => {
    const newLine: DialogueLine = {
      id: `d-${Date.now()}`,
      speaker: 'avatar',
      text: '',
      translationEs: ''
    };
    updateLesson(activeLesson.id, {
      dialogue: [...activeLesson.dialogue, newLine]
    });
  };

  // Actualizar línea de diálogo
  const handleUpdateDialogueLine = (index: number, updates: Partial<DialogueLine>) => {
    const updated = [...activeLesson.dialogue];
    updated[index] = { ...updated[index], ...updates };
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  // Eliminar línea de diálogo
  const handleDeleteDialogueLine = (index: number) => {
    const updated = activeLesson.dialogue.filter((_, i) => i !== index);
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  // Añadir frase de karaoke
  const handleAddKaraokePhrase = () => {
    const newPhrase: KaraokePhrase = {
      id: `k-${Date.now()}`,
      targetText: activeLesson.language === 'fr' 
        ? 'La pratique constante perfectionne la prononciation' 
        : 'Practice makes perfect in every language',
      translationEs: 'La práctica constante hace al maestro en cada idioma',
      difficulty: 'beginner'
    };
    updateLesson(activeLesson.id, {
      karaokePhrases: [...activeLesson.karaokePhrases, newPhrase]
    });
  };

  // Filtrado de reportes de alumnos
  const filteredReports = useMemo(() => {
    return studentReports.filter(rep => {
      const matchesSearch = rep.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.targetPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.mispronouncedWords.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));

      if (reportFilter === 'unreviewed') {
        return matchesSearch && !rep.reviewedByTeacher;
      }
      return matchesSearch;
    });
  }, [studentReports, reportFilter, searchQuery]);

  // Estadísticas grupales
  const stats = useMemo(() => {
    const total = studentReports.length;
    if (total === 0) return { total: 0, avgAccuracy: 0, commonErrors: [] };

    const sumAcc = studentReports.reduce((acc, r) => acc + r.overallAccuracy, 0);
    const avgAccuracy = Math.round(sumAcc / total);

    const errorMap: Record<string, number> = {};
    studentReports.forEach(r => {
      r.mispronouncedWords.forEach(w => {
        const clean = w.toLowerCase();
        errorMap[clean] = (errorMap[clean] || 0) + 1;
      });
    });

    const commonErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { total, avgAccuracy, commonErrors };
  }, [studentReports]);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col overflow-x-hidden ${
      isLightMode ? 'bg-[#F8FAFC] text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        
        {/* Barra Superior con Control de Retroceso Inteligente y Selector Institucional */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton 
            fallbackUrl="/teacher" 
            label="Volver a la página anterior" 
            variant="header" 
          />

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Alternador de Modo Claro / Modo Oscuro */}
            <button
              type="button"
              onClick={() => setIsLightMode(!isLightMode)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isLightMode
                  ? 'bg-amber-50/90 border-amber-300/80 text-amber-900 shadow-xs hover:bg-amber-100'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isLightMode ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
            >
              {isLightMode ? (
                <>
                  <span className="text-amber-500 text-sm">☀️</span>
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <span className="text-indigo-400 text-sm">🌙</span>
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>

            {/* Selector de Campus IBIME */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-xs text-xs ${
              isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <Building2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <label htmlFor="campus-select" className={`font-bold hidden sm:inline ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}>Plantel:</label>
              <select
                id="campus-select"
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className={`bg-transparent font-bold focus:outline-hidden cursor-pointer ${
                  isLightMode ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                {IBIME_CAMPUSES.map(campus => (
                  <option key={campus.id} value={campus.id} className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Alternador de Modo Presentación Institucional IBIME */}
            <button
              type="button"
              onClick={() => setIsIbimePresentationMode(!isIbimePresentationMode)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                isIbimePresentationMode
                  ? 'bg-red-600/10 border-red-500/40 text-red-600 shadow-xs'
                  : (isLightMode ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')
              }`}
              title="Alternar entre presentación institucional IBIME y visualización general"
            >
              <div className={`w-2 h-2 rounded-full ${isIbimePresentationMode ? 'bg-[#E41B14] shadow-xs shadow-red-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isIbimePresentationMode ? 'Presentación IBIME Activa' : 'Modo General'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            ENCABEZADO INSTITUCIONAL DEL CENTRO DE IDIOMAS (12 FASES · ESL & FLE)
            ========================================================================= */}
        <div className={`flex flex-wrap items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl transition-all ${
          isLightMode
            ? 'bg-white border border-slate-200/90 shadow-sm'
            : (isIbimePresentationMode
                ? 'bg-gradient-to-r from-[#0B132B] via-[#0F172A] to-[#1a0808] border border-[#E41B14]/40 shadow-2xl shadow-red-950/20'
                : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl')
        }`}>
          <div className="space-y-2 flex-1 min-w-0">
            {/* Fila de Insignias y CCT */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider">
              {isIbimePresentationMode ? (
                <>
                  <span className={`px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                    isLightMode 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-[#E41B14]/20 border-[#E41B14]/40 text-red-300'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E41B14] animate-pulse" />
                    Instituto Bilingüe IBIME S.C.
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className={`font-mono ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>CCT {selectedCampus.cct}</span>
                  <span className="text-slate-400">·</span>
                  <span className={`font-mono ${isLightMode ? 'text-indigo-700' : 'text-cyan-300'}`}>{selectedCampus.shortName}</span>
                  <span className="text-slate-400">·</span>
                  <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>Cambridge & DELF Preparation Centre</span>
                </>
              ) : (
                <>
                  <span className={`px-2.5 py-0.5 rounded-md border ${
                    isLightMode 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                  }`}>
                    Centro de Idiomas Profesional ISkool
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className={`font-mono ${isLightMode ? 'text-indigo-700' : 'text-cyan-300'}`}>12 Fases Curriculares Oficiales</span>
                  <span className="text-slate-400">·</span>
                  <span className={isLightMode ? 'text-teal-700' : 'text-teal-300'}>SEP CENNI (1-20) & DELF/DALF</span>
                </>
              )}
            </div>
            
            {/* Título y Logo */}
            <div className="flex items-center gap-4 pt-1">
              {isIbimePresentationMode ? (
                <div className={`p-2 rounded-2xl border shadow-xs shrink-0 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-700/60'
                }`}>
                  <IbimeOfficialLogo variant="shield_only" size={50} />
                </div>
              ) : (
                <div className={`p-2.5 rounded-2xl border shrink-0 ${
                  isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/30 text-cyan-400'
                }`}>
                  <Globe2 className="w-9 h-9" />
                </div>
              )}
              <div>
                <h1 className={`text-2xl sm:text-3xl font-black flex flex-wrap items-center gap-2 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  <span>Centro de Idiomas & Fonética Avanzada</span>
                  {isIbimePresentationMode && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#E41B14] text-white tracking-widest uppercase shadow-sm">
                      Edición Institucional IBIME
                    </span>
                  )}
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${
                  isLightMode ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {isIbimePresentationMode
                    ? 'Red Bilingüe IBIME · Gestión integral de inmersión oral en Inglés (ESL) y Francés (FLE) con acreditación internacional.'
                    : 'Consola docente de gestión integral de lenguas extranjeras en Inglés (ESL) y Francés (FLE).'}
                </p>
              </div>
            </div>
            
            <p className={`text-xs max-w-3xl leading-relaxed pt-1 ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Mentores conversacionales gesticulantes, personajes históricos en primera persona, reconocimiento de fonemas en tiempo real, radares CEFR y vinculación con la <strong>Bóveda Curricular</strong> institucional.
            </p>
          </div>

          {/* Selector de Idioma Rápido */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className={`flex items-center gap-2 p-1.5 rounded-2xl border shadow-inner ${
              isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => {
                  const newVoice = activeLesson.avatarGender === 'female' ? 'en-US-JennyNeural' : 'en-US-GuyNeural';
                  updateLesson(activeLesson.id, { 
                    language: 'en',
                    avatarVoice: newVoice,
                    avatarName: activeLesson.avatarGender === 'female' ? 'Claire' : 'Arthur'
                  });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeLesson.language === 'en'
                    ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md ring-1 ring-red-400' : 'bg-indigo-600 text-white shadow-md')
                    : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                <span className="text-base leading-none">🇬🇧</span>
                <span>Inglés (ESL)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newVoice = activeLesson.avatarGender === 'female' ? 'fr-FR-DeniseNeural' : 'fr-FR-HenriNeural';
                  updateLesson(activeLesson.id, { 
                    language: 'fr',
                    avatarVoice: newVoice,
                    avatarName: activeLesson.avatarGender === 'female' ? 'Sophie' : 'Henri'
                  });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeLesson.language === 'fr'
                    ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md ring-1 ring-red-400' : 'bg-blue-600 text-white shadow-md')
                    : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                <span className="text-base leading-none">🇫🇷</span>
                <span>Francés (FLE)</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BARRA DE NAVEGACIÓN POR PESTAÑAS (UTILIDAD & FUNCIONALIDAD DOCENTE)
            ========================================================================= */}
        <div className={`flex items-center gap-2 pb-2 border-b overflow-x-auto no-scrollbar scroll-smooth ${
          isLightMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'editor'
                ? (isLightMode ? 'bg-[#D9E2EC] text-slate-900 border border-slate-300 font-extrabold shadow-2xs' : 'bg-indigo-600 text-white shadow-md')
                : (isLightMode ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800')
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Taller de Diálogo & Avatares</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? (isLightMode ? 'bg-[#D9E2EC] text-slate-900 border border-slate-300 font-extrabold shadow-2xs' : 'bg-teal-600 text-white shadow-md')
                : (isLightMode ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800')
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analítica Gráfica CEFR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'curriculum'
                ? (isLightMode ? 'bg-[#D9E2EC] text-slate-900 border border-slate-300 font-extrabold shadow-2xs' : 'bg-purple-600 text-white shadow-md')
                : (isLightMode ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800')
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ecosistema de 40 Semanas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'hardware'
                ? (isLightMode ? 'bg-[#D9E2EC] text-slate-900 border border-slate-300 font-extrabold shadow-2xs' : 'bg-cyan-600 text-white shadow-md')
                : (isLightMode ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800')
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Diagnóstico de Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
              activeTab === 'reports'
                ? (isLightMode ? 'bg-[#D9E2EC] text-slate-900 border border-slate-300 font-extrabold shadow-2xs' : 'bg-rose-600 text-white shadow-md')
                : (isLightMode ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800')
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bitácora de Pronunciación</span>
            {studentReports.filter(r => !r.reviewedByTeacher).length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          <Link
            href="/teacher/idiomas/writing"
            className="px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white shadow-md shadow-indigo-600/20"
          >
            <PenTool className="w-4 h-4" />
            <span>Writing Engine Autónomo (Cambridge / DELF)</span>
          </Link>
        </div>

        {/* =========================================================================
            FRANJA INSTITUCIONAL DE ACREDITACIÓN CEFR & CERTIFICACIONES OFICIALES
            ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 text-xs ${
          isLightMode 
            ? 'bg-white border-slate-200/90 text-slate-800 shadow-xs' 
            : (isIbimePresentationMode
                ? 'bg-slate-900/90 border-[#E41B14]/30 shadow-lg shadow-red-950/20'
                : 'bg-slate-900/60 border-slate-800')
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 font-black">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Nivel CEFR: {activeLesson.level}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-300 font-medium">
              <span className="font-bold text-white">
                {activeLesson.language === 'en' ? activeCertification.cambridge : activeCertification.french}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-amber-400 font-mono font-semibold">
                {activeCertification.cenni}
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="text-cyan-300 font-semibold hidden md:inline">
                {activeCertification.unamNote}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-red-400" />
              <span>{selectedCampus.name} · CCT {selectedCampus.cct}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Acreditación Curricular Validada</span>
            </span>
          </div>
        </div>

        {/* =========================================================================
            PESTAÑA 1: TALLER DE DIÁLOGO, AVATARES Y VOCES HISTÓRICAS
            ========================================================================= */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            
            {/* Barra de Gestión de Lecciones y Modo Vista Previa */}
            <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
              isLightMode 
                ? 'bg-white border-slate-200/90 shadow-xs' 
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              
              {/* Selector de Lección Activa */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className={`text-xs font-bold uppercase tracking-wider shrink-0 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Lección:
                </span>
                {lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setActiveLessonId(lesson.id);
                      setIsPreviewMode(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      lesson.id === activeLesson.id
                        ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md border border-red-400' : 'bg-indigo-600 text-white shadow-md border border-indigo-400')
                        : (isLightMode 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700')
                    }`}
                  >
                    <span>{lesson.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    <span>{lesson.title}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCreateNewLesson}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Lección</span>
                </button>
              </div>

              {/* Interruptor de Vista Previa del Alumno */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isPreviewMode
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black scale-105'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isPreviewMode ? '✏️ Volver al Taller Docente' : '👁️ Demostración Alumno (Gamificada)'}</span>
              </button>
            </div>

            {/* MODO VISTA PREVIA INTERACTIVA (GAMIFICACIÓN DEL ALUMNO) */}
            {isPreviewMode ? (
              <div className={`p-6 rounded-3xl border-2 shadow-2xl space-y-6 animate-fade-in ${
                isLightMode ? 'bg-white border-amber-400 shadow-amber-500/10 text-slate-900' : 'bg-slate-900 border-amber-500/50 text-white'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isLightMode ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <div className={`flex items-center gap-2 font-black text-sm ${
                    isLightMode ? 'text-amber-800' : 'text-amber-400'
                  }`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Entorno Gamificado del Alumno · Avatar Parlante & Karaoke de Precisión</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Frase activa:</span>
                    <select
                      value={selectedKaraokeIndex}
                      onChange={(e) => setSelectedKaraokeIndex(Number(e.target.value))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        isLightMode 
                          ? 'bg-slate-50 text-slate-800 border-slate-300' 
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {activeLesson.karaokePhrases.map((phrase, idx) => (
                        <option key={phrase.id} value={idx}>
                          Frase {idx + 1}: &ldquo;{phrase.targetText.substring(0, 35)}...&rdquo;
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeLesson.karaokePhrases[selectedKaraokeIndex] && (
                  <LanguageKaraokePlayer
                    phrase={activeLesson.karaokePhrases[selectedKaraokeIndex]}
                    language={activeLesson.language}
                    avatarGender={activeLesson.avatarGender}
                    avatarVoice={activeLesson.avatarVoice}
                    avatarName={activeLesson.avatarName}
                    avatarImage={resolvedAvatar3dSrc}
                    historicalFigureId={activeLesson.historicalFigureId}
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                    studentName="Docente (Modo Simulación)"
                    isLightMode={isLightMode}
                  />
                )}
              </div>
            ) : (
              /* MODO REDISEÑADO CONVERSATIONAL AVATAR STUDIO & COURSE PLANNING (IMAGEN 1) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* =====================================================================
                    COLUMNA IZQUIERDA (5 cols): Conversational Avatar Studio
                    ===================================================================== */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-black tracking-tight ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      Conversational Avatar Studio
                    </h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
                      {useHistoricalFigure ? '3D Prócer Vivo' : '3D Neural Avatar'}
                    </span>
                  </div>

                  {/* Tarjeta Principal del Avatar Studio */}
                  <div className={`p-5 rounded-3xl border shadow-sm space-y-4 transition-all ${
                    isLightMode ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}>
                    
                    {/* Escenario del Avatar 3D con Burbujas de Diálogo Flotantes (Exacto a Imagen 1) */}
                    <div className={`relative rounded-2xl overflow-hidden border min-h-[380px] flex items-end justify-between p-4 transition-all ${
                      isLightMode 
                        ? 'bg-gradient-to-b from-[#F1F5F9] via-[#F8FAFC] to-[#FFFFFF] border-slate-200/80 shadow-inner' 
                        : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800 shadow-inner'
                    }`}>
                      {/* Personaje 3D Renderizado en Mitad Izquierda */}
                      <div className="relative w-[65%] max-w-[320px] h-[360px] flex items-end justify-start pointer-events-none -ml-2">
                        <img
                          src={resolvedAvatar3dSrc}
                          alt={activeLesson.avatarName}
                          className="w-full h-full object-contain object-bottom drop-shadow-2xl select-none transition-transform duration-500 hover:scale-102 filter contrast-102"
                        />
                      </div>

                      {/* Burbuja de Diálogo Principal Flotante en la esquina superior derecha */}
                      <div className="absolute top-4 right-3 max-w-[210px] sm:max-w-[230px] pointer-events-auto z-10">
                        <div className={`relative p-3.5 rounded-2xl border shadow-md text-xs font-semibold leading-relaxed transition-all ${
                          isLightMode 
                            ? 'bg-white text-slate-800 border-slate-200/90 shadow-slate-200/60' 
                            : 'bg-slate-900/95 text-slate-100 border-slate-700 shadow-black/50'
                        }`}>
                          <div className={`absolute -left-2 top-5 w-0 h-0 border-y-6 border-y-transparent border-r-8 ${
                            isLightMode ? 'border-r-white' : 'border-r-slate-900'
                          }`} />
                          <p className="line-clamp-4">
                            {activeLesson.dialogue[0]?.text || "Lis a sophisticated gesticulating pedagogical mentor avatar."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cinta Dedicada de Subtítulo en Español y Guía Fonética (Colocada FUERA del avatar para 100% de legibilidad) */}
                    <div className={`p-3.5 rounded-2xl border shadow-xs transition-all flex items-center justify-between gap-3 ${
                      isLightMode
                        ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border-emerald-200/90 text-emerald-950 shadow-emerald-500/5'
                        : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-800/80 text-emerald-200 shadow-black/40'
                    }`}>
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                          isLightMode ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-900 text-emerald-300'
                        }`}>
                          {showDialogueTranslation ? <Languages className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                              isLightMode ? 'text-emerald-800' : 'text-emerald-400'
                            }`}>
                              {showDialogueTranslation ? 'Subtítulo en Español:' : 'Tip Fonético de Pronunciación:'}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold leading-snug pt-0.5 ${
                            isLightMode ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {resolvedTranslationText}
                          </p>
                        </div>
                      </div>

                      {/* Switch interactivo con etiqueta clara */}
                      <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-emerald-200/80 dark:border-emerald-800/80">
                        <span className={`text-[10px] font-bold hidden sm:inline ${
                          isLightMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {showDialogueTranslation ? 'Español' : 'Fonética'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowDialogueTranslation(!showDialogueTranslation)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 flex items-center ${
                            showDialogueTranslation ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title="Alternar entre traducción al español y guía fonética"
                        >
                          <span className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            showDialogueTranslation ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Fila de Diagnóstico: Phonetic Wave & Pitch Accuracy (Exacto a Imagen 1) */}
                    <div className="grid grid-cols-12 gap-3 pt-1">
                      
                      {/* Widget: Phonetic Wave (8 cols) */}
                      <div className={`col-span-7 sm:col-span-8 p-3 rounded-2xl border shadow-xs flex flex-col justify-between ${
                        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={isLightMode ? 'text-slate-900' : 'text-white'}>Phonetic Wave</span>
                          <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-bold">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <span>Baro</span>
                          </div>
                        </div>

                        {/* Barras de Onda Fonética en Gradiente */}
                        <div className="flex items-end justify-between gap-1 h-9 pt-2">
                          {[30, 60, 85, 45, 95, 100, 65, 80, 50, 70, 95, 60, 85, 40, 65, 90, 75, 50, 30].map((h, i) => (
                            <span
                              key={i}
                              className="flex-1 rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-teal-400 transition-all duration-150"
                              style={{
                                height: isPlayingPreview 
                                  ? `${Math.min(100, Math.max(18, h * (0.35 + Math.random() * 0.7)))}%` 
                                  : `${Math.max(12, h * 0.45)}%`
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Widget: Pitch Accuracy (4 cols) */}
                      <div className={`col-span-5 sm:col-span-4 p-3 rounded-2xl border shadow-xs flex flex-col justify-between ${
                        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                      }`}>
                        <div className={`text-xs font-bold truncate ${
                          isLightMode ? 'text-slate-900' : 'text-white'
                        }`}>
                          Pitch Accuracy
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {/* Medidor Radial */}
                          <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className={isLightMode ? 'text-slate-100' : 'text-slate-800'}
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-teal-600"
                                strokeDasharray="98, 100"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className={`absolute text-xs font-black ${
                              isLightMode ? 'text-slate-900' : 'text-white'
                            }`}>98%</span>
                          </div>
                          <Mic className="w-4 h-4 text-teal-600 shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Toolbar de Selección Rápida de Avatares 3D y Controles de Voz */}
                    <div className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                      isLightMode ? 'bg-slate-50/80 border-slate-200/90' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div>
                        <span className={`text-[11px] font-bold block mb-1.5 uppercase tracking-wide ${
                          isLightMode ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Avatares 3D Disponibles ({activeLesson.language === 'fr' ? 'Francés' : 'Inglés'}):
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {/* Mentores Estándar 3D */}
                          <button
                            type="button"
                            onClick={() => {
                              const isFr = activeLesson.language === 'fr';
                              setUseHistoricalFigure(false);
                              setSelectedHistoricalId('');
                              updateLesson(activeLesson.id, {
                                avatarGender: 'male',
                                avatarName: isFr ? 'Henri' : 'Arthur',
                                avatarVoice: isFr ? 'fr-FR-HenriNeural' : 'en-US-GuyNeural',
                                avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
                                historicalFigureId: undefined
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              !useHistoricalFigure && activeLesson.avatarGender === 'male'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : (isLightMode ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800')
                            }`}
                          >
                            <span>👨‍🏫</span>
                            <span>{activeLesson.language === 'fr' ? 'Prof. Henri (3D)' : 'Prof. Arthur (3D)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const isFr = activeLesson.language === 'fr';
                              setUseHistoricalFigure(false);
                              setSelectedHistoricalId('');
                              updateLesson(activeLesson.id, {
                                avatarGender: 'female',
                                avatarName: isFr ? 'Sophie' : 'Claire',
                                avatarVoice: isFr ? 'fr-FR-VivienneMultilingualNeural' : 'en-US-JennyNeural',
                                avatarImage: '/images/languages/3d/mentor_female_3d.webp',
                                historicalFigureId: undefined
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              !useHistoricalFigure && activeLesson.avatarGender === 'female'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : (isLightMode ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800')
                            }`}
                          >
                            <span>👩‍🏫</span>
                            <span>{activeLesson.language === 'fr' ? 'Mme. Sophie (3D)' : 'Prof. Claire (3D)'}</span>
                          </button>

                          {/* Próceres Históricos 3D */}
                          {availableHistoricalFigures.map(fig => (
                            <button
                              key={fig.id}
                              type="button"
                              onClick={() => {
                                setUseHistoricalFigure(true);
                                setSelectedHistoricalId(fig.id);
                                handleApplyHistoricalFigure(fig);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                activeLesson.avatarName === fig.name || activeLesson.historicalFigureId === fig.id
                                  ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-xs'
                                  : (isLightMode ? 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40')
                              }`}
                            >
                              <span>{fig.avatarEmoji}</span>
                              <span>{fig.name} (3D)</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fila de Velocidad y Reproducción de Audio */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] font-bold mr-1 ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>Velocidad:</span>
                          {[0.8, 1.0, 1.2].map(speed => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => updateLesson(activeLesson.id, { defaultSpeed: speed })}
                              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                Math.abs(activeLesson.defaultSpeed - speed) < 0.05
                                  ? 'bg-indigo-600 text-white font-black'
                                  : (isLightMode ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100' : 'bg-slate-900 text-slate-300 border border-slate-800')
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayAudioSample()}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            isPlayingPreview
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isPlayingPreview ? 'Detener' : 'Escuchar Muestra'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* =====================================================================
                    COLUMNA DERECHA (7 cols): Course Planning & 40-Week Curriculum Layer
                    ===================================================================== */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Encabezado con Switch de Vista (Plan de 40 Semanas vs Editor de Guion) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className={`text-xl font-black tracking-tight ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      {workshopRightView === 'curriculum'
                        ? 'Course Planning & 40-Week Curriculum Layer'
                        : 'Editor de Guion & Karaoke Fonético'}
                    </h2>

                    {/* Selector de Modo (Plan Curricular vs Editor de Guion) */}
                    <div className={`flex items-center p-1 rounded-2xl border shadow-xs text-xs font-bold ${
                      isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setWorkshopRightView('curriculum')}
                        className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          workshopRightView === 'curriculum'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Plan de 40 Semanas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkshopRightView('script')}
                        className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          workshopRightView === 'script'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editor de Guion & Frases</span>
                      </button>
                    </div>
                  </div>

                  {/* VISTA 1: Plan de 40 Semanas (Idéntica a Imagen 1) */}
                  {workshopRightView === 'curriculum' ? (
                    <div className="space-y-4">
                      {/* Barra de Búsqueda */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={curriculumSearch}
                          onChange={(e) => setCurriculumSearch(e.target.value)}
                          placeholder="Search..."
                          className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-hidden transition-all shadow-xs ${
                            isLightMode 
                              ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500' 
                              : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-400'
                          }`}
                        />
                      </div>

                      {/* Pestañas de Trimestre */}
                      <div className={`flex items-center border-b gap-4 sm:gap-6 text-xs sm:text-sm font-bold ${
                        isLightMode ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setCurriculumTrimester(1)}
                          className={`pb-2.5 transition-all cursor-pointer relative ${
                            curriculumTrimester === 1
                              ? 'text-indigo-600 font-black'
                              : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')
                          }`}
                        >
                          <span>Trimestre 1 (A1/A1+)</span>
                          {curriculumTrimester === 1 && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurriculumTrimester(2)}
                          className={`pb-2.5 transition-all cursor-pointer relative ${
                            curriculumTrimester === 2
                              ? 'text-indigo-600 font-black'
                              : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')
                          }`}
                        >
                          <span>Trimestre 2 (A2/A2+)</span>
                          {curriculumTrimester === 2 && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurriculumTrimester(3)}
                          className={`pb-2.5 transition-all cursor-pointer relative ${
                            curriculumTrimester === 3
                              ? 'text-indigo-600 font-black'
                              : (isLightMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')
                          }`}
                        >
                          <span>Trimestre 3 (B1/B2)</span>
                          {curriculumTrimester === 3 && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                          )}
                        </button>
                      </div>

                      {/* Rejilla de Tarjetas Semanales de 2 Columnas (Expandible al Desplegar Lecciones) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredCurriculumWeeks.map(week => {
                          const hasMilestoneStar = week.weekNumber === 2 || week.weekNumber === 30 || week.weekNumber % 10 === 0;
                          const isExpanded = expandedWeekNumber === week.weekNumber;
                          const cleanWeekTitle = week.title.replace(/^Week \d+:\s*/, '').replace(/^Semaine \d+:\s*/, '');

                          return (
                            <div
                              key={week.weekNumber}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                                isExpanded 
                                  ? (isLightMode ? 'sm:col-span-2 bg-white border-indigo-400 ring-2 ring-indigo-400/30 shadow-xl' : 'sm:col-span-2 bg-slate-900 border-indigo-600 ring-2 ring-indigo-500/40 shadow-2xl')
                                  : (isLightMode ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xs')
                              }`}
                            >
                              {/* Cabecera Interactiva: Al pulsar en Week o en el Título se despliegan las lecciones */}
                              <div>
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedWeekNumber(isExpanded ? null : week.weekNumber)}
                                    className="flex items-center gap-2 cursor-pointer group/wbtn text-left"
                                    title="Pulsar para desplegar o contraer las lecciones de la semana"
                                  >
                                    <span className={`text-xs font-black group-hover/wbtn:underline ${
                                      isLightMode ? 'text-indigo-600' : 'text-indigo-400'
                                    }`}>
                                      Week {week.weekNumber}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                      isExpanded
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : (isLightMode ? 'bg-indigo-50 text-indigo-700 border-indigo-200 group-hover/wbtn:bg-indigo-100' : 'bg-indigo-950 text-indigo-300 border-indigo-800')
                                    }`}>
                                      {week.lessons.length} Lecciones
                                    </span>
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    {/* Checkmark Verde */}
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shadow-2xs font-bold" title="Contenido curricular verificado">
                                      ✓
                                    </span>
                                    {/* Estrella Dorada para Milestones */}
                                    {hasMilestoneStar && (
                                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-2xs font-bold" title="Hito Curricular">
                                        ★
                                      </span>
                                    )}
                                    {/* Botón Flecha Desplegable */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedWeekNumber(isExpanded ? null : week.weekNumber)}
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                        isExpanded 
                                          ? 'bg-indigo-600 text-white rotate-180' 
                                          : (isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')
                                      }`}
                                      title={isExpanded ? "Contraer lecciones" : "Desplegar 4 lecciones"}
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Botón / Título de la Semana (ej. Week 1 Social Greetings & Personal Identity) */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedWeekNumber(isExpanded ? null : week.weekNumber)}
                                  className="w-full text-left cursor-pointer group/title mt-1.5"
                                >
                                  <h3 className={`text-base font-extrabold tracking-tight transition-colors line-clamp-1 group-hover/title:text-indigo-600 ${
                                    isLightMode ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    {cleanWeekTitle}
                                  </h3>
                                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                                  }`}>
                                    {week.pda}
                                  </p>
                                </button>
                              </div>

                              {/* Insignias de Acreditación (A1/B2, CENNI, Cambridge / DELF) */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    {/* Nivel CEFR */}
                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                                      week.cefr.startsWith('B')
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                      {week.cefr}
                                    </span>

                                    {/* Nivel CENNI */}
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                      {week.level.includes('CENNI') ? week.level.replace(/^[^(]*\(/, '').replace(/\)/, '') : `CENNI ${week.weekNumber <= 14 ? '3' : week.weekNumber <= 27 ? '7' : '13'}`}
                                    </span>
                                  </div>

                                  {/* Escudo Cambridge & DELF */}
                                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-600">
                                    <IbimeOfficialLogo variant="shield_only" size={16} />
                                    <span>CAMBRIDGE & DELF</span>
                                  </div>
                                </div>

                                {/* Barra de Acciones de la Tarjeta */}
                                {!isExpanded ? (
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {/* Botón 1: Desplegar Lecciones */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedWeekNumber(week.weekNumber)}
                                      className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                        isLightMode
                                          ? 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700'
                                          : 'border-indigo-800 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300'
                                      }`}
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span>Ver Lecciones</span>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Botón 2: Cargar en Taller */}
                                    <button
                                      type="button"
                                      onClick={() => handleLoadWeekIntoWorkshop(week)}
                                      className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                        isLightMode
                                          ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-indigo-600'
                                          : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white'
                                      }`}
                                    >
                                      <span>Cargar en Taller</span>
                                    </button>
                                  </div>
                                ) : (
                                  /* VISTA DESPLEGADA DE LAS 4 LECCIONES */
                                  <div className={`mt-3 pt-3 border-t space-y-3 animate-fade-in ${
                                    isLightMode ? 'border-indigo-100' : 'border-slate-800'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                        <span className={`text-xs font-black uppercase tracking-wider ${
                                          isLightMode ? 'text-slate-800' : 'text-slate-200'
                                        }`}>
                                          Lecciones Planificadas de la Semana {week.weekNumber} (Elige una para el taller):
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedWeekNumber(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Contraer</span>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Rejilla de 4 Lecciones */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {week.lessons.map((lesson, lIdx) => (
                                        <div
                                          key={lesson.id}
                                          className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between space-y-2.5 ${
                                            isLightMode
                                              ? 'bg-slate-50/90 hover:bg-indigo-50/40 border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                                              : 'bg-slate-950/80 hover:bg-indigo-950/40 border-slate-800 hover:border-indigo-700'
                                          }`}
                                        >
                                          <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                                isLightMode
                                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                                  : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                              }`}>
                                                Lección {week.weekNumber}.{lIdx + 1}
                                              </span>

                                              {/* Botón Elegir esta lección */}
                                              <button
                                                type="button"
                                                onClick={() => handleLoadSingleLessonIntoWorkshop(week, lesson)}
                                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] cursor-pointer shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                                                title="Cargar esta lección específica al taller docente"
                                              >
                                                <span>Elegir</span>
                                                <span>→</span>
                                              </button>
                                            </div>

                                            {/* Título de la lección */}
                                            <h4 className={`font-extrabold text-xs ${
                                              isLightMode ? 'text-slate-900' : 'text-white'
                                            }`}>
                                              {lesson.title}
                                            </h4>

                                            {/* Frase Modelo Target */}
                                            <div className={`p-2.5 rounded-lg border font-medium ${
                                              isLightMode
                                                ? 'bg-white border-slate-200 text-slate-900'
                                                : 'bg-slate-900 border-slate-800 text-slate-100'
                                            }`}>
                                              <p className="font-bold text-indigo-600 dark:text-cyan-400">
                                                &ldquo;{lesson.target}&rdquo;
                                              </p>
                                              <p className={`text-[11px] mt-1 italic ${
                                                isLightMode ? 'text-slate-600' : 'text-slate-400'
                                              }`}>
                                                {lesson.translationEs}
                                              </p>
                                            </div>

                                            {/* Tip Fonético */}
                                            {lesson.phoneticTip && (
                                              <div className={`p-2 rounded-lg border flex items-start gap-1.5 text-[10px] ${
                                                isLightMode
                                                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                                                  : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                                              }`}>
                                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                                <span className="font-medium">
                                                  <strong>Tip Fonético:</strong> {lesson.phoneticTip}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Barra Inferior del Cajón Desplegado */}
                                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                                      <button
                                        type="button"
                                        onClick={() => handleLoadWeekIntoWorkshop(week)}
                                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Cargar Semana Completa (4 Lecciones) en Taller</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setExpandedWeekNumber(null)}
                                        className={`py-2 px-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                          isLightMode
                                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                            : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                        }`}
                                      >
                                        Contraer Lecciones
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* VISTA 2: Editor de Guion & Frases de Karaoke (Funcionalidad Completa) */
                    <div className="space-y-6">
                      
                      {/* SECCIÓN 1: LÍNEAS DE DIÁLOGO DE LA CONVERSACIÓN */}
                      <div className={`p-5 rounded-3xl border space-y-4 transition-all ${
                        isLightMode 
                          ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
                          : 'bg-slate-900/90 border-slate-800 shadow-xl text-white'
                      }`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${
                          isLightMode ? 'border-slate-100' : 'border-slate-800'
                        }`}>
                          <div>
                            <h3 className={`text-sm font-black flex items-center gap-2 ${
                              isLightMode ? 'text-slate-900' : 'text-white'
                            }`}>
                              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                              <span>Guion de Diálogo Interactivo</span>
                            </h3>
                            <p className={`text-[11px] ${
                              isLightMode ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              Redacta la interacción entre el mentor ({activeLesson.avatarName}) y el estudiante. El avatar hablará con gesticulación real.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddDialogueLine}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Línea</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activeLesson.dialogue.map((line, idx) => (
                            <div key={line.id} className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                              isLightMode 
                                ? 'bg-slate-50/90 border-slate-200/80 text-slate-900' 
                                : 'bg-slate-950 border-slate-800 text-white'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                                    isLightMode 
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <select
                                    value={line.speaker}
                                    onChange={(e) => handleUpdateDialogueLine(idx, { speaker: e.target.value as any })}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                                      isLightMode 
                                        ? 'bg-white border-slate-200 text-slate-800' 
                                        : 'bg-slate-800 text-white border-slate-700'
                                    }`}
                                  >
                                    <option value="avatar">Mentor ({activeLesson.avatarName})</option>
                                    <option value="student">Alumno (Respuesta Oral)</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handlePlayAudioSample(line.text, line.id)}
                                    disabled={!line.text.trim()}
                                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      activePlayingLineId === line.id
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : (isLightMode 
                                            ? 'bg-slate-200/80 hover:bg-indigo-600 text-slate-700 hover:text-white' 
                                            : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white')
                                    }`}
                                    title="Escuchar locución de esta línea con voz del avatar"
                                  >
                                    {activePlayingLineId === line.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />}
                                    <span className="text-[10px] hidden sm:inline">{activePlayingLineId === line.id ? 'Detener' : 'Escuchar'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDialogueLine(idx)}
                                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                                    title="Eliminar línea"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <textarea
                                  rows={2}
                                  value={line.text}
                                  onChange={(e) => handleUpdateDialogueLine(idx, { text: e.target.value })}
                                  placeholder={`Texto en ${activeLesson.language === 'en' ? 'Inglés' : 'Francés'}...`}
                                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
                                    isLightMode 
                                      ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs' 
                                      : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={line.translationEs}
                                  onChange={(e) => handleUpdateDialogueLine(idx, { translationEs: e.target.value })}
                                  placeholder="Traducción al Español para soporte del alumno..."
                                  className={`w-full p-2 rounded-lg border text-[11px] transition-all ${
                                    isLightMode 
                                      ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400' 
                                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECCIÓN 2: FRASES DE RETO PARA EL KARAOKE FONÉTICO */}
                      <div className={`p-5 rounded-3xl border space-y-4 transition-all ${
                        isLightMode 
                          ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
                          : 'bg-slate-900/90 border-slate-800 shadow-xl text-white'
                      }`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${
                          isLightMode ? 'border-slate-100' : 'border-slate-800'
                        }`}>
                          <div>
                            <h3 className={`text-sm font-black flex items-center gap-2 ${
                              isLightMode ? 'text-slate-900' : 'text-white'
                            }`}>
                              <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              <span>Frases Guiadas para Karaoke de Pronunciación</span>
                            </h3>
                            <p className={`text-[11px] ${
                              isLightMode ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              El alumno grabará estas oraciones con su micrófono. El sistema resaltará en verde las palabras correctas en tiempo real.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddKaraokePhrase}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir Frase Karaoke</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activeLesson.karaokePhrases.map((phrase, idx) => (
                            <div key={phrase.id} className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                              isLightMode 
                                ? 'bg-slate-50/90 border-slate-200/80 text-slate-900' 
                                : 'bg-slate-950 border-slate-800 text-white'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${
                                  isLightMode ? 'text-teal-700' : 'text-teal-400'
                                }`}>
                                  Frase {idx + 1} ({phrase.difficulty})
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handlePlayAudioSample(phrase.targetText, phrase.id)}
                                    disabled={!phrase.targetText.trim()}
                                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      activePlayingLineId === phrase.id
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : (isLightMode 
                                            ? 'bg-slate-200/80 hover:bg-teal-600 text-slate-700 hover:text-white' 
                                            : 'bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white')
                                    }`}
                                    title="Escuchar pronunciación modelo"
                                  >
                                    {activePlayingLineId === phrase.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                                    <span className="text-[10px] hidden sm:inline">{activePlayingLineId === phrase.id ? 'Detener' : 'Escuchar Modelo'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = activeLesson.karaokePhrases.filter((_, i) => i !== idx);
                                      updateLesson(activeLesson.id, { karaokePhrases: updated });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                                    title="Eliminar frase"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={phrase.targetText}
                                onChange={(e) => {
                                  const updated = [...activeLesson.karaokePhrases];
                                  updated[idx].targetText = e.target.value;
                                  updateLesson(activeLesson.id, { karaokePhrases: updated });
                                }}
                                placeholder="Oración exacta que el alumno pronunciará..."
                                className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-hidden transition-all ${
                                  isLightMode 
                                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 shadow-xs' 
                                    : 'bg-slate-900 border-slate-700 text-white focus:border-teal-400'
                                }`}
                              />

                              <input
                                type="text"
                                value={phrase.translationEs}
                                onChange={(e) => {
                                  const updated = [...activeLesson.karaokePhrases];
                                  updated[idx].translationEs = e.target.value;
                                  updateLesson(activeLesson.id, { karaokePhrases: updated });
                                }}
                                placeholder="Significado en español..."
                                className={`w-full p-2 rounded-lg border text-[11px] transition-all ${
                                  isLightMode 
                                    ? 'bg-white border-slate-200 text-slate-700 placeholder-slate-400' 
                                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: ANALÍTICA GRÁFICA & RADAR CEFR / SEP CENNI
            ========================================================================= */}
        {activeTab === 'analytics' && (
          <LanguageAnalyticsCharts language={activeLesson.language} isLightMode={isLightMode} />
        )}

        {/* =========================================================================
            PESTAÑA 3: ECOSISTEMA DE 12 FASES CURRICULARES & PLAN DE 40 SEMANAS
            ========================================================================= */}
        {activeTab === 'curriculum' && (
          <Curriculum12PhasesExplorer 
            language={activeLesson.language}
            isLightMode={isLightMode}
            onSelectLessonTemplate={handleLoadCurriculumTemplate}
          />
        )}

        {/* =========================================================================
            PESTAÑA 4: DIAGNÓSTICO DE HARDWARE, MICRÓFONO & AUDIO
            ========================================================================= */}
        {activeTab === 'hardware' && (
          <HardwareAudioTester language={activeLesson.language} isLightMode={isLightMode} />
        )}

        {/* =========================================================================
            PESTAÑA 5: BITÁCORA EN TIEMPO REAL & NOTAS DE ALUMNOS (DIAGNÓSTICO)
            ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Tarjetas de Resumen General */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-3xl border space-y-1 transition-all ${
                isLightMode ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <span className={`text-xs font-bold uppercase ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>Prácticas Evaluadas</span>
                <div className={`text-2xl sm:text-3xl font-black flex items-center gap-2 ${
                  isLightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  <Users className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
                  <span>{stats.total}</span>
                </div>
                <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enviadas en tiempo real desde el karaoke
                </p>
              </div>

              <div className={`p-5 rounded-3xl border space-y-1 transition-all ${
                isLightMode ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <span className={`text-xs font-bold uppercase ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>Precisión Promedio Grupal</span>
                <div className={`text-2xl sm:text-3xl font-black flex items-center gap-2 ${
                  isLightMode ? 'text-teal-700' : 'text-teal-300'
                }`}>
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span>{stats.avgAccuracy}%</span>
                </div>
                <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Porcentaje de palabras acertadas
                </p>
              </div>

              <div className={`p-5 rounded-3xl border space-y-1 transition-all ${
                isLightMode ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <span className={`text-xs font-bold uppercase ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>Palabras Más Complejas</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stats.commonErrors.length > 0 ? (
                    stats.commonErrors.map(([word, count]) => (
                      <span key={word} className={`px-2 py-0.5 rounded-md border font-mono text-[11px] font-bold ${
                        isLightMode 
                          ? 'bg-rose-50 border-rose-200 text-rose-700' 
                          : 'bg-rose-950/80 border-rose-700 text-rose-300'
                      }`}>
                        {word} ({count})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-normal">Sin errores registrados</span>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtros de Reporte */}
            <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
              isLightMode ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno, palabra con error o frase..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-hidden transition-all ${
                    isLightMode 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500' 
                      : 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    reportFilter === 'all' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : (isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-slate-800 text-slate-400')
                  }`}
                >
                  Todas ({studentReports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportFilter('unreviewed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    reportFilter === 'unreviewed' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : (isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-slate-800 text-slate-400')
                  }`}
                >
                  Pendientes ({studentReports.filter(r => !r.reviewedByTeacher).length})
                </button>
              </div>
            </div>

            {/* Lista Detallada de Reportes de Alumnos en Tiempo Real */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className={`p-8 text-center rounded-3xl border text-xs ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  No hay reportes de pronunciación con los filtros seleccionados.
                </div>
              ) : (
                filteredReports.map(report => (
                  <div 
                    key={report.id}
                    className={`p-5 rounded-3xl border transition-all space-y-3 ${
                      report.reviewedByTeacher
                        ? (isLightMode ? 'bg-white border-slate-200/80 shadow-xs opacity-90' : 'bg-slate-900/60 border-slate-800 opacity-80')
                        : (isLightMode ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/20' : 'bg-slate-900 border-indigo-700/60 shadow-xl')
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Alumno y Datos */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl overflow-hidden border flex items-center justify-center font-black text-sm ${
                          isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-800 border-slate-700 text-cyan-300'
                        }`}>
                          {report.studentAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={report.studentAvatar} alt={report.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{report.studentName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className={`text-sm font-black flex items-center gap-2 ${
                            isLightMode ? 'text-slate-900' : 'text-white'
                          }`}>
                            <span>{report.studentName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
                              isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {report.language === 'fr' ? '🇫🇷 Francés' : '🇬🇧 Inglés'}
                            </span>
                          </h4>
                          <span className={`text-[11px] flex items-center gap-1.5 mt-0.5 ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Lección: {report.lessonTitle}
                          </span>
                        </div>
                      </div>

                      {/* Calificación y Estado de Revisión */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                          <span className={`text-[10px] uppercase font-bold ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>Precisión Fonética</span>
                          <span className={`text-base font-black font-mono ${
                            report.overallAccuracy >= 85 
                              ? (isLightMode ? 'text-emerald-600' : 'text-emerald-400') 
                              : report.overallAccuracy >= 70 
                                ? (isLightMode ? 'text-amber-600' : 'text-amber-400') 
                                : (isLightMode ? 'text-rose-600' : 'text-rose-400')
                          }`}>
                            {report.overallAccuracy}%
                          </span>
                        </div>

                        {!report.reviewedByTeacher && (
                          <button
                            type="button"
                            onClick={() => markReportAsReviewed(report.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                            title="Marcar como revisado"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Marcar Revisado</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Frase Evaluada */}
                    <div className={`p-3 rounded-2xl border space-y-1.5 ${
                      isLightMode ? 'bg-slate-50/90 border-slate-200 text-slate-900' : 'bg-slate-950/80 border-slate-800 text-slate-200'
                    }`}>
                      <span className={`text-[10px] uppercase font-bold block ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>Frase Asignada:</span>
                      <p className={`text-xs font-medium leading-relaxed ${
                        isLightMode ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        &ldquo;{report.targetPhrase}&rdquo;
                      </p>
                    </div>

                    {/* DESGLOSE EN TIEMPO REAL: PALABRAS CON ERROR */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className={`font-bold text-[11px] ${
                        isLightMode ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        Diagnóstico para el docente:
                      </span>
                      {report.mispronouncedWords.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[11px] font-bold ${
                            isLightMode ? 'text-rose-600' : 'text-rose-400'
                          }`}>Palabras a reforzar en clase:</span>
                          {report.mispronouncedWords.map((word, idx) => (
                            <span 
                              key={idx}
                              className={`px-2 py-0.5 rounded-md border font-bold font-mono text-[11px] ${
                                isLightMode 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                  : 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                              }`}
                            >
                              ❌ {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Excelente entonación y dicción completada.
                        </span>
                      )}
                    </div>

                    {/* Recomendación Pedagógica Entregada al Alumno */}
                    {report.pedagogicalAdvice && (
                      <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        isLightMode 
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                          : 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                          isLightMode ? 'text-amber-800' : 'text-amber-400'
                        }`}>
                          <span>💡 Recomendación asignada al alumno:</span>
                        </span>
                        <p className={`text-[11px] leading-relaxed ${
                          isLightMode ? 'text-amber-900' : 'text-amber-200'
                        }`}>
                          {report.pedagogicalAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
