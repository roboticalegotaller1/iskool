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
  PenTool
} from 'lucide-react';
import Link from 'next/link';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';

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

  // Estado de reproducción y prueba auditiva de la voz
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [activePlayingLineId, setActivePlayingLineId] = useState<string | null>(null);
  const audioControllerRef = useRef<any>(null);

  const activeLesson = useMemo(() => {
    return lessons.find(l => l.id === activeLessonId) || lessons[0];
  }, [lessons, activeLessonId]);

  const selectedCampus = useMemo(() => {
    return IBIME_CAMPUSES.find(c => c.id === selectedCampusId) || IBIME_CAMPUSES[0];
  }, [selectedCampusId]);

  const activeCertification = useMemo(() => {
    return CEFR_CERTIFICATIONS[activeLesson.level] || CEFR_CERTIFICATIONS['B1'];
  }, [activeLesson.level]);

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
          translationEs: 'Presentación en primera persona histórica obligatoria.',
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
          translationEs: 'Oración canónica en primera persona',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        
        {/* Barra Superior con Control de Retroceso Inteligente y Selector Institucional */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton 
            fallbackUrl="/teacher" 
            label="Volver a la página anterior" 
            variant="header" 
          />

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Selector de Campus IBIME */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm text-xs">
              <Building2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <label htmlFor="campus-select" className="text-slate-400 font-bold hidden sm:inline">Plantel:</label>
              <select
                id="campus-select"
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="bg-transparent text-slate-200 font-bold focus:outline-hidden cursor-pointer"
              >
                {IBIME_CAMPUSES.map(campus => (
                  <option key={campus.id} value={campus.id} className="bg-slate-900 text-white">
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
                  ? 'bg-red-600/20 border-red-500/50 text-red-300 shadow-sm shadow-red-900/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Alternar entre presentación institucional IBIME y visualización general"
            >
              <div className={`w-2 h-2 rounded-full ${isIbimePresentationMode ? 'bg-[#E41B14] shadow-sm shadow-red-500 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isIbimePresentationMode ? 'Presentación IBIME Activa' : 'Modo General'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            ENCABEZADO INSTITUCIONAL DEL CENTRO DE IDIOMAS (12 FASES · ESL & FLE)
            ========================================================================= */}
        <div className={`flex flex-wrap items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl transition-all shadow-2xl ${
          isIbimePresentationMode
            ? 'bg-gradient-to-r from-[#0B132B] via-[#0F172A] to-[#1a0808] border border-[#E41B14]/40 shadow-red-950/20'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30'
        }`}>
          <div className="space-y-2 flex-1 min-w-0">
            {/* Fila de Insignias y CCT */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider">
              {isIbimePresentationMode ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#E41B14]/20 border border-[#E41B14]/40 text-red-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E41B14] animate-pulse" />
                    Instituto Bilingüe IBIME S.C.
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-mono">CCT {selectedCampus.cct}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300 font-mono">{selectedCampus.shortName}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">Cambridge & DELF Preparation Centre</span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                    Centro de Idiomas Profesional ISkool
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-cyan-300 font-mono">12 Fases Curriculares Oficiales</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-teal-300">SEP CENNI (1-20) & DELF/DALF</span>
                </>
              )}
            </div>
            
            {/* Título y Logo */}
            <div className="flex items-center gap-4 pt-1">
              {isIbimePresentationMode ? (
                <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-lg shrink-0">
                  <IbimeOfficialLogo variant="shield_only" size={50} />
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 shrink-0">
                  <Globe2 className="w-9 h-9" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-2">
                  <span>Centro de Idiomas & Fonética Avanzada</span>
                  {isIbimePresentationMode && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#E41B14] text-white tracking-widest uppercase shadow-sm">
                      Edición Institucional IBIME
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {isIbimePresentationMode
                    ? 'Red Bilingüe IBIME · Gestión integral de inmersión oral en Inglés (ESL) y Francés (FLE) con acreditación internacional.'
                    : 'Consola docente de gestión integral de lenguas extranjeras en Inglés (ESL) y Francés (FLE).'}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed pt-1">
              Mentores conversacionales gesticulantes, personajes históricos en primera persona, reconocimiento de fonemas en tiempo real, radares CEFR y vinculación con la <strong>Bóveda Curricular</strong> institucional.
            </p>
          </div>

          {/* Selector de Idioma Rápido */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
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
                    ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-lg shadow-red-700/40 ring-1 ring-red-400' : 'bg-cyan-600 text-white shadow-md')
                    : 'text-slate-400 hover:text-white'
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
                    ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-lg shadow-red-700/40 ring-1 ring-red-400' : 'bg-indigo-600 text-white shadow-md')
                    : 'text-slate-400 hover:text-white'
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
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'editor'
                ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md shadow-red-600/30 ring-1 ring-red-400/40' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20')
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Taller de Diálogo & Avatares</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md shadow-red-600/30 ring-1 ring-red-400/40' : 'bg-teal-600 text-white shadow-md shadow-teal-600/20')
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analítica Gráfica & Radar CEFR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'curriculum'
                ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md shadow-red-600/30 ring-1 ring-red-400/40' : 'bg-purple-600 text-white shadow-md shadow-purple-600/20')
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ecosistema de 12 Fases (40 Semanas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'hardware'
                ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md shadow-red-600/30 ring-1 ring-red-400/40' : 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20')
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Diagnóstico de Micrófono & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
              activeTab === 'reports'
                ? (isIbimePresentationMode ? 'bg-[#E41B14] text-white shadow-md shadow-red-600/30 ring-1 ring-red-400/40' : 'bg-rose-600 text-white shadow-md shadow-rose-600/20')
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
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
            className="px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white shadow-md shadow-indigo-600/30"
          >
            <PenTool className="w-4 h-4" />
            <span>Writing Engine Autónomo (Cambridge / DELF)</span>
          </Link>
        </div>

        {/* =========================================================================
            FRANJA INSTITUCIONAL DE ACREDITACIÓN CEFR & CERTIFICACIONES OFICIALES
            ========================================================================= */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 text-xs ${
          isIbimePresentationMode
            ? 'bg-slate-900/90 border-[#E41B14]/30 shadow-lg shadow-red-950/20'
            : 'bg-slate-900/60 border-slate-800'
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              
              {/* Selector de Lección Activa */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
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
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <span>{lesson.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                    <span>{lesson.title}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCreateNewLesson}
                  className="px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Lección</span>
                </button>
              </div>

              {/* Interruptor de Vista Previa del Alumno */}
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isPreviewMode
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black scale-105'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isPreviewMode ? '✏️ Volver al Taller Docente' : '👁️ Demostración Alumno (Gamificada)'}</span>
              </button>
            </div>

            {/* MODO VISTA PREVIA INTERACTIVA (GAMIFICACIÓN DEL ALUMNO) */}
            {isPreviewMode ? (
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Entorno Gamificado del Alumno · Avatar Parlante & Karaoke de Precisión</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Frase activa:</span>
                    <select
                      value={selectedKaraokeIndex}
                      onChange={(e) => setSelectedKaraokeIndex(Number(e.target.value))}
                      className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700"
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
                    avatarImage={activeLesson.avatarImage}
                    historicalFigureId={activeLesson.historicalFigureId}
                    lessonId={activeLesson.id}
                    lessonTitle={activeLesson.title}
                    studentName="Docente (Modo Simulación)"
                  />
                )}
              </div>
            ) : (
              /* MODO EDITOR Y CONFIGURACIÓN DOCENTE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Lado Izquierdo: Configuración del Mentor & Personajes Históricos */}
                <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Mentor & Voz Neural</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Parámetros
                    </span>
                  </div>

                  {/* Selector Personaje Histórico vs Avatar Estándar */}
                  <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>Personaje Histórico Vivo</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={useHistoricalFigure}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setUseHistoricalFigure(isChecked);
                          if (isChecked) {
                            const figToApply = availableHistoricalFigures.find(f => f.id === selectedHistoricalId) || availableHistoricalFigures[0];
                            if (figToApply) {
                              setSelectedHistoricalId(figToApply.id);
                              handleApplyHistoricalFigure(figToApply);
                            }
                          } else {
                            const defaultVoice = activeLesson.language === 'en' ? 'en-US-JennyNeural' : 'fr-FR-VivienneMultilingualNeural';
                            const defaultName = activeLesson.language === 'en' ? 'Claire' : 'Sophie';
                            updateLesson(activeLesson.id, {
                              avatarName: defaultName,
                              avatarVoice: defaultVoice,
                              avatarGender: 'female',
                              avatarImage: undefined,
                              historicalFigureId: undefined
                            });
                          }
                        }}
                        className="rounded accent-amber-500 cursor-pointer w-4 h-4"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Activa próceres en primera persona estricta (Shakespeare, Lincoln, Napoleón, Curie) con sus voces de época.
                    </p>
                  </div>

                  {useHistoricalFigure ? (
                    /* LISTA DE PERSONAJES HISTÓRICOS DISPONIBLES */
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                        <span>Elegir Personaje Histórico ({activeLesson.language === 'fr' ? 'Francés' : 'Inglés'}):</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">1ª Persona Estricta</span>
                      </label>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {availableHistoricalFigures.map(fig => (
                          <div
                            key={fig.id}
                            onClick={() => {
                              setSelectedHistoricalId(fig.id);
                              handleApplyHistoricalFigure(fig);
                            }}
                            className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              activeLesson.avatarName === fig.name || activeLesson.historicalFigureId === fig.id
                                ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md shadow-amber-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-500/60 shrink-0 shadow-md">
                                <img 
                                  src={fig.avatarImage} 
                                  alt={fig.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="block font-bold text-white text-xs">{fig.name}</span>
                                <span className="text-[10px] text-amber-300/80">{fig.era}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold">
                                1ª Persona
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {fig.gender === 'female' ? '👩' : '👨'} {fig.country}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* SELECTORES DEL AVATAR ESTÁNDAR */
                    <>
                      {/* Género del Avatar */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Género del Avatar:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newVoice = activeLesson.language === 'en' ? 'en-US-JennyNeural' : 'fr-FR-VivienneMultilingualNeural';
                              const newName = activeLesson.language === 'en' ? 'Claire' : 'Sophie';
                              updateLesson(activeLesson.id, { 
                                avatarGender: 'female', 
                                avatarVoice: newVoice,
                                avatarName: newName
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              activeLesson.avatarGender === 'female'
                                ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span>👩‍🏫</span>
                            <span>Mujer ({activeLesson.language === 'en' ? 'Claire' : 'Sophie'})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const newVoice = activeLesson.language === 'en' ? 'en-US-GuyNeural' : 'fr-FR-HenriNeural';
                              const newName = activeLesson.language === 'en' ? 'Arthur' : 'Henri';
                              updateLesson(activeLesson.id, { 
                                avatarGender: 'male', 
                                avatarVoice: newVoice,
                                avatarName: newName
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              activeLesson.avatarGender === 'male'
                                ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span>👨‍🏫</span>
                            <span>Hombre ({activeLesson.language === 'en' ? 'Arthur' : 'Henri'})</span>
                          </button>
                        </div>
                      </div>

                      {/* Selector de Voz Neural */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Voz Neural Calibrada:</label>
                        <select
                          value={activeLesson.avatarVoice}
                          onChange={(e) => updateLesson(activeLesson.id, { avatarVoice: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white"
                        >
                          {availableVoices.map(v => (
                            <option key={v.id} value={v.id}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Velocidad Predeterminada */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Velocidad de Dicción:</span>
                      <span className="text-cyan-400 font-mono">{activeLesson.defaultSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.2"
                      step="0.05"
                      value={activeLesson.defaultSpeed}
                      onChange={(e) => updateLesson(activeLesson.id, { defaultSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>0.6x (Rezagados)</span>
                      <span>1.0x (Nativo)</span>
                      <span>1.2x (Avanzado)</span>
                    </div>
                  </div>

                  {/* Botón de Auditoría y Prueba de Pronunciación en Vivo */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handlePlayAudioSample()}
                      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                        isPlayingPreview
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white'
                      }`}
                      title="Escuchar locución de la voz seleccionada con dicción nativa calibrada"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Detener Muestra Fonética</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-cyan-300" />
                          <span>Escuchar Muestra ({activeLesson.language === 'fr' ? 'Prononciation Française' : 'English Accent'})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Vista en Miniatura del Avatar Configurado */}
                  <div className="pt-2 flex justify-center">
                    <HumanGesticulatingAvatar
                      gender={activeLesson.avatarGender}
                      name={activeLesson.avatarName}
                      language={activeLesson.language}
                      voiceId={activeLesson.avatarVoice}
                      avatarImage={activeLesson.avatarImage}
                      historicalFigureId={activeLesson.historicalFigureId || (useHistoricalFigure ? selectedHistoricalId : undefined)}
                      speechRate={activeLesson.defaultSpeed}
                      onSpeechRateChange={(rate) => updateLesson(activeLesson.id, { defaultSpeed: rate })}
                      isPlaying={isPlayingPreview}
                      onRepeat={() => handlePlayAudioSample(activeLesson.dialogue[0]?.text)}
                      onStop={() => {
                        stopAllIskoolAudio();
                        audioControllerRef.current?.stop();
                        setIsPlayingPreview(false);
                        setActivePlayingLineId(null);
                      }}
                      currentText={activeLesson.dialogue[0]?.text || (activeLesson.language === 'fr' ? "Prêt pour la leçon de prononciation française." : "Ready for the English pronunciation lesson.")}
                      className="scale-90"
                    />
                  </div>
                </div>

                {/* Lado Derecho: Editor de Diálogos & Frases para Karaoke */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* SECCIÓN 1: LÍNEAS DE DIÁLOGO DE LA CONVERSACIÓN */}
                  <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                          <span>Guion de Diálogo Interactivo</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Redacta la interacción entre el mentor ({activeLesson.avatarName}) y el estudiante. El avatar hablará con gesticulación real.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDialogueLine}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Línea</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeLesson.dialogue.map((line, idx) => (
                        <div key={line.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {idx + 1}
                              </span>
                              <select
                                value={line.speaker}
                                onChange={(e) => handleUpdateDialogueLine(idx, { speaker: e.target.value as any })}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-bold text-white border border-slate-700"
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
                                    : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white'
                                }`}
                                title="Escuchar locución de esta línea con voz del avatar"
                              >
                                {activePlayingLineId === line.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                                <span className="text-[10px] hidden sm:inline">{activePlayingLineId === line.id ? 'Detener' : 'Escuchar'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDialogueLine(idx)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
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
                              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={line.translationEs}
                              onChange={(e) => handleUpdateDialogueLine(idx, { translationEs: e.target.value })}
                              placeholder="Traducción al Español para soporte del alumno..."
                              className="w-full p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECCIÓN 2: FRASES DE RETO PARA EL KARAOKE FONÉTICO */}
                  <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <Mic className="w-4 h-4 text-teal-400" />
                          <span>Frases Guiadas para Karaoke de Pronunciación</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          El alumno grabará estas oraciones con su micrófono. El sistema resaltará en verde las palabras correctas en tiempo real.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddKaraokePhrase}
                        className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Frase Karaoke</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeLesson.karaokePhrases.map((phrase, idx) => (
                        <div key={phrase.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-teal-400">
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
                                    : 'bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white'
                                }`}
                                title="Escuchar pronunciación modelo"
                              >
                                {activePlayingLineId === phrase.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
                                <span className="text-[10px] hidden sm:inline">{activePlayingLineId === phrase.id ? 'Detener' : 'Escuchar Modelo'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = activeLesson.karaokePhrases.filter((_, i) => i !== idx);
                                  updateLesson(activeLesson.id, { karaokePhrases: updated });
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
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
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:border-teal-400 focus:outline-hidden"
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
                            className="w-full p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: ANALÍTICA GRÁFICA & RADAR CEFR / SEP CENNI
            ========================================================================= */}
        {activeTab === 'analytics' && (
          <LanguageAnalyticsCharts language={activeLesson.language} />
        )}

        {/* =========================================================================
            PESTAÑA 3: ECOSISTEMA DE 12 FASES CURRICULARES & PLAN DE 40 SEMANAS
            ========================================================================= */}
        {activeTab === 'curriculum' && (
          <Curriculum12PhasesExplorer 
            language={activeLesson.language}
            onSelectLessonTemplate={handleLoadCurriculumTemplate}
          />
        )}

        {/* =========================================================================
            PESTAÑA 4: DIAGNÓSTICO DE HARDWARE, MICRÓFONO & AUDIO
            ========================================================================= */}
        {activeTab === 'hardware' && (
          <HardwareAudioTester language={activeLesson.language} />
        )}

        {/* =========================================================================
            PESTAÑA 5: BITÁCORA EN TIEMPO REAL & NOTAS DE ALUMNOS (DIAGNÓSTICO)
            ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Tarjetas de Resumen General */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Prácticas Evaluadas</span>
                <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <span>{stats.total}</span>
                </div>
                <p className="text-[11px] text-slate-400">Enviadas en tiempo real desde el karaoke</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Precisión Promedio Grupal</span>
                <div className="text-2xl sm:text-3xl font-black text-teal-300 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>{stats.avgAccuracy}%</span>
                </div>
                <p className="text-[11px] text-slate-400">Porcentaje de palabras acertadas</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Palabras Más Complejas</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stats.commonErrors.length > 0 ? (
                    stats.commonErrors.map(([word, count]) => (
                      <span key={word} className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-700 text-rose-300 font-mono text-[11px] font-bold">
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno, palabra con error o frase..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    reportFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Todas ({studentReports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReportFilter('unreviewed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    reportFilter === 'unreviewed' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Pendientes ({studentReports.filter(r => !r.reviewedByTeacher).length})
                </button>
              </div>
            </div>

            {/* Lista Detallada de Reportes de Alumnos en Tiempo Real */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                  No hay reportes de pronunciación con los filtros seleccionados.
                </div>
              ) : (
                filteredReports.map(report => (
                  <div 
                    key={report.id}
                    className={`p-5 rounded-3xl border transition-all space-y-3 ${
                      report.reviewedByTeacher
                        ? 'bg-slate-900/60 border-slate-800 opacity-80'
                        : 'bg-slate-900 border-indigo-700/60 shadow-xl'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Alumno y Datos */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-cyan-300">
                          {report.studentAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={report.studentAvatar} alt={report.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{report.studentName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            <span>{report.studentName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {report.language === 'fr' ? '🇫🇷 Francés' : '🇬🇧 Inglés'}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Lección: {report.lessonTitle}
                          </span>
                        </div>
                      </div>

                      {/* Calificación y Estado de Revisión */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Precisión Fonética</span>
                          <span className={`text-base font-black font-mono ${
                            report.overallAccuracy >= 85 
                              ? 'text-emerald-400' 
                              : report.overallAccuracy >= 70 
                                ? 'text-amber-400' 
                                : 'text-rose-400'
                          }`}>
                            {report.overallAccuracy}%
                          </span>
                        </div>

                        {!report.reviewedByTeacher && (
                          <button
                            type="button"
                            onClick={() => markReportAsReviewed(report.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            title="Marcar como revisado"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Marcar Revisado</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Frase Evaluada */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Frase Asignada:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        &ldquo;{report.targetPhrase}&rdquo;
                      </p>
                    </div>

                    {/* DESGLOSE EN TIEMPO REAL: PALABRAS CON ERROR */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-slate-400 text-[11px]">
                        Diagnóstico para el docente:
                      </span>
                      {report.mispronouncedWords.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-rose-400 font-bold">Palabras a reforzar en clase:</span>
                          {report.mispronouncedWords.map((word, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold font-mono text-[11px]"
                            >
                              ❌ {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Excelente entonación y dicción completada.
                        </span>
                      )}
                    </div>

                    {/* Recomendación Pedagógica Entregada al Alumno */}
                    {report.pedagogicalAdvice && (
                      <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                          <span>💡 Recomendación asignada al alumno:</span>
                        </span>
                        <p className="text-[11px] leading-relaxed">
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
