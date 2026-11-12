"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  useLanguagesStore,
  LanguageLesson,
  LanguageCode,
  DialogueLine,
  KaraokePhrase,
  sanitizeAndEnsureCompleteCatalog,
} from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { BackButton } from '@/components/navigation/BackButton';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import {
  MULTILINGUAL_HISTORICAL_FIGURES,
  MultilingualHistoricalFigure,
  playUniversalIskoolVoice,
  stopAllIskoolAudio,
} from '@/lib/historicalVoiceEngine';
import {
  Plus,
  Trash2,
  Eye,
  Edit3,
  Sparkles,
  CheckCircle2,
  Volume2,
  Mic,
  BookOpen,
  Search,
  Play,
  Pause,
  Building2,
  PenTool,
  ChevronDown,
  ChevronUp,
  X,
  ListFilter,
  Monitor,
  Smartphone,
  QrCode,
  Settings,
  Headphones,
  TrafficCone,
  FolderOpen,
  Clock,
} from 'lucide-react';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import { english40WeeksCurriculum } from '@/components/languages/data/english40WeeksCurriculum';
import { french40WeeksCurriculum } from '@/components/languages/data/french40WeeksCurriculum';
import { CurricularWeek, CurricularLesson } from '@/components/languages/data/curriculumTypes';
import { AvatarGestureMode } from '@/components/common/NanoBananaLipSyncCanvas';
import {
  resolveCeltaPocketGuide,
  tokenizeDialogueWithStress,
} from '@/components/languages/hybrid/hybridPedagogicalData';
import { ClassroomBoardModal } from '@/components/languages/hybrid/ClassroomBoardModal';
import {
  PocketRemoteQrModal,
  TeacherAccountOption,
} from '@/components/languages/hybrid/PocketRemoteQrModal';
import { ContrastivePhoneticsMirrorView } from '@/components/languages/hybrid/ContrastivePhoneticsMirrorView';
import { HybridWritingStarStudio } from '@/components/languages/hybrid/HybridWritingStarStudio';
import { TrafficLightDifferentiatedView } from '@/components/languages/hybrid/TrafficLightDifferentiatedView';
import { CoordinatorAdvancedDrawer } from '@/components/languages/hybrid/CoordinatorAdvancedDrawer';
import { useAuth } from '@/context/AuthContext';
import {
  deriveTeacherRemoteCredentials,
  syncActiveLessonToPocketServer,
} from '@/utils/pocketRemoteBridge';

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
    levelInfo: 'Preescolar · Primaria · Secundaria · Bachillerato CCH',
  },
  {
    id: 'lagos',
    name: 'Campus Lagos (Fundador 2004)',
    shortName: 'Lagos',
    cct: '15PES0124X',
    badge: 'Fundador · Bilingüe Integral',
    levelInfo: 'Maternal · Preescolar · Primaria',
  },
  {
    id: 'sancristobal',
    name: 'Campus San Cristóbal (Ecatepec Centro)',
    shortName: 'San Cristóbal',
    cct: '15PES0891Z',
    badge: 'Centro Integral · Idiomas',
    levelInfo: 'Primaria · Secundaria Bilingüe',
  },
  {
    id: 'coacalco',
    name: 'Campus Coacalco (Zarzaparrillas)',
    shortName: 'Coacalco',
    cct: '15PPR4411K',
    badge: 'Valle de México · ESL/FLE',
    levelInfo: 'Preescolar · Primaria Bilingüe',
  },
];

const CEFR_CERTIFICATIONS: Record<
  string,
  {
    cambridge: string;
    french: string;
    cenni: string;
    unamNote: string;
    color: string;
  }
> = {
  A1: {
    cambridge: 'Cambridge English: Pre-A1 Starters / A1 Movers',
    french: 'DELF Prim / Scolaire A1',
    cenni: 'CENNI 4 (Básico Inicial)',
    unamNote: 'Iniciación Temprana · Fase 1 a 3',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
  },
  A2: {
    cambridge: 'Cambridge English: A2 Key (KET) for Schools',
    french: 'DELF A2 Junior / Scolaire',
    cenni: 'CENNI 6 (Básico Consolidado)',
    unamNote: 'Egreso Primaria & Secundaria Temprana',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
  },
  B1: {
    cambridge: 'Cambridge English: B1 Preliminary (PET) for Schools',
    french: 'DELF B1 Scolaire',
    cenni: 'CENNI 9 (Intermedio Independiente)',
    unamNote: 'Perfil Egreso Secundaria Bilingüe IBIME',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
  },
  B2: {
    cambridge: 'Cambridge English: B2 First (FCE) for Schools',
    french: 'DELF B2 Tout Public / Scolaire',
    cenni: 'CENNI 12 (Avanzado Operativo)',
    unamNote: 'Requisito Oficial de Egreso y Titulación CCH UNAM',
    color: 'from-rose-500/20 to-red-500/20 border-red-500/40 text-red-300',
  },
};

const HISTORICAL_TRANSLATIONS: Record<string, string> = {
  shakespeare:
    'Soy William Shakespeare. Nací en Stratford-upon-Avon, y sobre las tablas del Teatro Globe en Londres, forjé las tragedias de Hamlet y Macbeth.',
  ada_lovelace:
    'Soy Ada Lovelace. En 1843, escribí el primer algoritmo computacional para la Máquina Analítica de Charles Babbage, vislumbrando que las máquinas manipularían símbolos y compondrían música.',
  abraham_lincoln:
    'Soy Abraham Lincoln, 16º presidente de los Estados Unidos. En 1863, proclamé que el gobierno del pueblo, por el pueblo y para el pueblo, no perecerá de la tierra.',
  napoleon:
    'Soy Napoleón Bonaparte, nacido en Ajaccio en Córcega. Reorganicé la administración, promulgué el Código Civil y conduje los ejércitos de la República.',
  marie_curie:
    'Soy Marie Curie. Junto a Pierre Curie, aislé el polonio y el radio en mi modesto laboratorio de París, convirtiéndome en la primera laureada con dos Premios Nobel.',
  victor_hugo:
    'Soy Victor Hugo. Escribí Los Miserables y Nuestra Señora de París para dar voz a los humildes y defender la dignidad humana contra toda opresión.',
  jeanne_darc:
    'Soy Juana de Arco, la Doncella de Orleans. A los diecisiete años, guiada por mi fe, levanté el sitio de Orleans y conduje al delfín Carlos a su coronación en Reims.',
};

export default function TeacherIdiomasPage() {
  const {
    lessons,
    activeLessonId,
    setActiveLessonId,
    addLesson,
    updateLesson,
    deleteLesson,
    deduplicateLessons,
    studentReports,
    markReportAsReviewed,
  } = useLanguagesStore();

  // Estados de la Fusión Híbrida Maestra (4 Macro-Habilidades CEFR + Sub-vistas + Modales)
  const [activeMacroTab, setActiveMacroTab] = useState<
    'speaking' | 'listening' | 'writing' | 'traffic_light'
  >('speaking');
  const [speakingSubView, setSpeakingSubView] = useState<'studio' | 'mirror' | 'preview'>(
    'studio'
  );
  const [selectedMirrorId, setSelectedMirrorId] = useState<string | undefined>(undefined);
  const [activeAgendaStep, setActiveAgendaStep] = useState<1 | 2 | 3>(1);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState<boolean>(false);
  const [boardStartTimer, setBoardStartTimer] = useState<boolean>(false);
  const [isPocketRemoteOpen, setIsPocketRemoteOpen] = useState<boolean>(false);
  const [isCoordinatorViewOpen, setIsCoordinatorViewOpen] = useState<boolean>(false);
  const [activeAvatarGesture, setActiveAvatarGesture] = useState<AvatarGestureMode>('auto');
  const [avatarGestureImpulse, setAvatarGestureImpulse] = useState<number>(0);
  const [isEditingScript, setIsEditingScript] = useState<boolean>(false);
  const [showFull40WeekExplorer, setShowFull40WeekExplorer] = useState<boolean>(false);

  // Estados para gestión retráctil y eliminación de lecciones
  const [isLessonListRetracted, setIsLessonListRetracted] = useState<boolean>(true);
  const [lessonSearchQuery, setLessonSearchQuery] = useState<string>('');
  const [lessonToDelete, setLessonToDelete] = useState<LanguageLesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    deduplicateLessons();
  }, [deduplicateLessons]);

  const cleanLessons = useMemo(() => {
    return sanitizeAndEnsureCompleteCatalog(lessons);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (!lessonSearchQuery.trim()) return cleanLessons;
    const q = lessonSearchQuery.toLowerCase().trim();
    return cleanLessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.topic && l.topic.toLowerCase().includes(q)) ||
        l.level.toLowerCase().includes(q)
    );
  }, [cleanLessons, lessonSearchQuery]);

  const handleDeleteLessonRequest = (lesson: LanguageLesson, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cleanLessons.length <= 1) {
      triggerToast('⚠️ Debe mantenerse al menos una lección activa en el Centro de Idiomas');
      return;
    }
    setLessonToDelete(lesson);
  };

  const executeDeleteLesson = () => {
    if (!lessonToDelete) return;
    const targetTitle = lessonToDelete.title;
    deleteLesson(lessonToDelete.id);
    setLessonToDelete(null);
    triggerToast(`✓ Lección "${targetTitle}" eliminada del catálogo`);
  };

  const [selectedKaraokeIndex, setSelectedKaraokeIndex] = useState<number>(0);
  const [useHistoricalFigure, setUseHistoricalFigure] = useState<boolean>(false);
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string>('shakespeare');

  // Estado Institucional IBIME y Sedes
  const [selectedCampusId, setSelectedCampusId] = useState<string>('montes');
  const [isLightMode, setIsLightMode] = useState<boolean>(true);

  // Estado de reproducción y prueba auditiva de la voz
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [activePlayingLineId, setActivePlayingLineId] = useState<string | null>(null);
  const audioControllerRef = useRef<any>(null);

  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [expandedWeekNumber, setExpandedWeekNumber] = useState<number | null>(null);

  const activeLesson = useMemo(() => {
    return cleanLessons.find((l) => l.id === activeLessonId) || cleanLessons[0] || lessons[0];
  }, [cleanLessons, lessons, activeLessonId]);

  // Lecciones filtradas estrictamente por el idioma activo (sin mezclar Inglés en Francés ni viceversa)
  const lessonsForActiveLanguage = useMemo(() => {
    const byLang = cleanLessons.filter((l) => l.language === activeLesson.language);
    return byLang.length > 0 ? byLang : cleanLessons;
  }, [cleanLessons, activeLesson.language]);

  // Reiniciar índice de frase de karaoke y sincronizar rig histórico cuando cambia la lección activa
  useEffect(() => {
    setSelectedKaraokeIndex(0);
    setUseHistoricalFigure(Boolean(activeLesson.historicalFigureId));
    setSelectedHistoricalId(activeLesson.historicalFigureId || '');
  }, [activeLesson.id, activeLesson.historicalFigureId]);

  // Cambiar de Nivel CEFR (A1, A2, B1, B2) dentro del idioma activo en 1 clic
  const handleSelectCefrLevel = (targetLevel: 'A1' | 'A2' | 'B1' | 'B2') => {
    stopAllIskoolAudio();
    const matchInLang = lessonsForActiveLanguage.find((l) => l.level === targetLevel);
    if (matchInLang) {
      setActiveLessonId(matchInLang.id);
      setSelectedKaraokeIndex(0);
      triggerToast(
        `✓ Nivel ${targetLevel} (${
          activeLesson.language === 'fr' ? '🇫🇷 Francés DELF' : '🇬🇧 Inglés Cambridge'
        }) activo: "${matchInLang.title}"`
      );
    }
  };

  const { user: authUser } = useAuth();
  const adminSchools = useSchoolAdminStore((s) => s.institutionsList);
  const adminCampuses = useSchoolAdminStore((s) => s.campusesList);
  const adminTeachers = useSchoolAdminStore((s) => s.teachersList);

  const allAvailableCampuses = useMemo(() => {
    const list: {
      id: string;
      name: string;
      shortName: string;
      schoolName: string;
      badge: string;
      cct: string;
      levelInfo: string;
    }[] = [];

    IBIME_CAMPUSES.forEach((c) => {
      list.push({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        schoolName: 'Instituto Bilingüe (IBIME)',
        badge: c.badge,
        cct: c.cct,
        levelInfo: c.levelInfo,
      });
    });

    (adminCampuses || []).forEach((ac) => {
      const parentSchool = (adminSchools || []).find((s) => s.id === ac.school_id);
      const sName = parentSchool?.name || 'Colegio Registrado';
      if (!list.some((item) => item.id === ac.id)) {
        list.push({
          id: ac.id,
          name: `${ac.name} (${sName})`,
          shortName: ac.name,
          schoolName: sName,
          badge: sName,
          cct: (ac as any).cct || '15PPR3322G',
          levelInfo: 'Comunidad Educativa',
        });
      }
    });

    return list;
  }, [adminSchools, adminCampuses]);

  const selectedCampus = useMemo(() => {
    return allAvailableCampuses.find((c) => c.id === selectedCampusId) || allAvailableCampuses[0];
  }, [allAvailableCampuses, selectedCampusId]);

  // Cuentas de profesores disponibles para generar su código QR único y cifrado por cuenta
  const availableTeacherAccounts = useMemo<TeacherAccountOption[]>(() => {
    const accounts: TeacherAccountOption[] = [];

    if (authUser && authUser.id) {
      const fullName =
        `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() ||
        'Docente en Sesión Activa';
      accounts.push({
        id: authUser.id,
        name: fullName,
        email: authUser.email || 'docente.activo@iskool.edu.mx',
        roleLabel: authUser.role === 'superadmin' ? 'Dirección General / Docente' : 'Docente Titular',
        campusName: selectedCampus.shortName,
      });
    }

    const institutionalLanguageTeachers: TeacherAccountOption[] = [
      {
        id: 'tch-ibime-elena',
        name: 'Prof. María Elena Villaseñor (Titular ESL)',
        email: 'maria.elena@ibime.edu.mx',
        roleLabel: 'Titular Inglés Cambridge CELTA',
        campusName: selectedCampus.shortName,
      },
      {
        id: 'tch-ibime-sophie',
        name: 'Prof. Sophie Laurent (Titular FLE)',
        email: 'sophie.laurent@ibime.edu.mx',
        roleLabel: 'Titular Francés DELF/DALF',
        campusName: selectedCampus.shortName,
      },
      {
        id: 'tch-ibime-arturo',
        name: 'Prof. Arturo Mendoza (Coordinador Bilingüe)',
        email: 'arturo.mendoza@ibime.edu.mx',
        roleLabel: 'Coordinación CENNI / CEFR',
        campusName: selectedCampus.shortName,
      },
    ];

    institutionalLanguageTeachers.forEach((t) => {
      if (!accounts.some((a) => a.id === t.id || a.email === t.email)) {
        accounts.push(t);
      }
    });

    (adminTeachers || []).slice(0, 6).forEach((t) => {
      const tEmail = (t.email || `${t.id}@iskool.edu.mx`).toLowerCase();
      if (!accounts.some((a) => a.id === t.id || a.email.toLowerCase() === tEmail)) {
        accounts.push({
          id: t.id,
          name: `Prof. ${t.first_name} ${t.last_name}`.trim(),
          email: tEmail,
          roleLabel: 'Docente Registrado en Plantel',
          campusName: selectedCampus.shortName,
        });
      }
    });

    return accounts;
  }, [authUser, adminTeachers, selectedCampus.shortName]);

  const [selectedTeacherQrId, setSelectedTeacherQrId] = useState<string>('');

  const activeTeacherQrAccount = useMemo<TeacherAccountOption>(() => {
    if (selectedTeacherQrId) {
      const found = availableTeacherAccounts.find((t) => t.id === selectedTeacherQrId);
      if (found) return found;
    }
    return availableTeacherAccounts[0] || {
      id: 'tch-ibime-elena',
      name: 'Prof. María Elena Villaseñor',
      email: 'maria.elena@ibime.edu.mx',
      roleLabel: 'Titular Inglés ESL',
      campusName: selectedCampus.shortName,
    };
  }, [selectedTeacherQrId, availableTeacherAccounts, selectedCampus.shortName]);

  const activeCertification = useMemo(() => {
    return CEFR_CERTIFICATIONS[activeLesson.level] || CEFR_CERTIFICATIONS['A1'];
  }, [activeLesson.level]);

  // Resolución infalible de imagen 3D de alta fidelidad
  const resolvedAvatar3dSrc = useMemo(() => {
    if (useHistoricalFigure || activeLesson.historicalFigureId) {
      const histId = useHistoricalFigure ? selectedHistoricalId : activeLesson.historicalFigureId;
      const histFig = MULTILINGUAL_HISTORICAL_FIGURES.find(
        (f) => f.id === histId || f.name === activeLesson.avatarName
      );
      if (histFig?.avatarImage && histFig.avatarImage.includes('/3d/')) {
        return histFig.avatarImage;
      }
      if (histId === 'shakespeare') return '/images/languages/3d/shakespeare_3d.webp';
      if (histId === 'ada_lovelace') return '/images/languages/3d/ada_lovelace_3d.webp';
      if (histId === 'abraham_lincoln') return '/images/languages/3d/abraham_lincoln_3d.webp';
      if (histId === 'marie_curie') return '/images/languages/3d/marie_curie_3d.webp';
      if (histId === 'napoleon') return '/images/languages/3d/napoleon_3d.webp';
      if (histId === 'victor_hugo') return '/images/languages/3d/victor_hugo_3d.webp';
      if (histId === 'jeanne_darc') return '/images/languages/3d/jeanne_darc_3d.webp';
    }

    if (activeLesson.avatarImage && activeLesson.avatarImage.includes('/3d/')) {
      return activeLesson.avatarImage;
    }

    if (
      activeLesson.avatarGender === 'female' ||
      activeLesson.avatarName?.toLowerCase().includes('claire') ||
      activeLesson.avatarName?.toLowerCase().includes('sophie')
    ) {
      return '/images/languages/3d/mentor_female_3d.webp';
    }
    return '/images/languages/3d/mentor_male_3d_v2.webp';
  }, [
    useHistoricalFigure,
    selectedHistoricalId,
    activeLesson.historicalFigureId,
    activeLesson.avatarImage,
    activeLesson.avatarGender,
    activeLesson.avatarName,
  ]);

  // Guía CELTA de Bolsillo dinámica según la lección activa
  const activeCeltaGuide = useMemo(() => {
    return resolveCeltaPocketGuide(
      activeLesson.language,
      activeLesson.level,
      activeLesson.title,
      activeLesson.dialogue[0]?.text || ''
    );
  }, [activeLesson.language, activeLesson.level, activeLesson.title, activeLesson.dialogue]);

  const current40Weeks: CurricularWeek[] = useMemo(() => {
    return activeLesson.language === 'fr' ? french40WeeksCurriculum : english40WeeksCurriculum;
  }, [activeLesson.language]);

  const filteredCurriculumWeeks = useMemo(() => {
    if (!curriculumSearch.trim()) return current40Weeks;
    const q = curriculumSearch.toLowerCase();
    return current40Weeks.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.level.toLowerCase().includes(q) ||
        w.certificationTarget.toLowerCase().includes(q) ||
        w.lessons.some(
          (l) => l.target.toLowerCase().includes(q) || l.title.toLowerCase().includes(q)
        )
    );
  }, [current40Weeks, curriculumSearch]);

  const handleLoadWeekIntoWorkshop = (week: CurricularWeek) => {
    const isFr = activeLesson.language === 'fr';
    const firstLesson = week.lessons[0] || {
      id: `w${week.weekNumber}-1`,
      title: week.title,
      target: isFr
        ? "Bonjour! Pratiquons notre prononciation aujourd'hui."
        : 'Hello! Let us practice our pronunciation today.',
      translationEs: '¡Hola! Practiquemos nuestra pronunciación hoy.',
      phoneticTip: 'Articula con claridad y ritmo constante.',
    };

    const dialogueLines: DialogueLine[] = [
      {
        id: `d-${Date.now()}-1`,
        speaker: 'avatar',
        text: firstLesson.target,
        translationEs: firstLesson.translationEs,
        phoneticTip: firstLesson.phoneticTip,
      },
      ...(week.lessons[1]
        ? [
            {
              id: `d-${Date.now()}-2`,
              speaker: 'student' as const,
              text: week.lessons[1].target,
              translationEs: week.lessons[1].translationEs,
            },
          ]
        : []),
    ];

    const karaokePhrases: KaraokePhrase[] = week.lessons.map((l, idx) => ({
      id: `k-${Date.now()}-${idx}`,
      targetText: l.target,
      translationEs: l.translationEs,
      difficulty: (week.cefr === 'A1'
        ? 'beginner'
        : week.cefr === 'A2'
          ? 'intermediate'
          : 'advanced') as any,
      phoneticGuide: l.phoneticTip,
    }));

    const cleanTitle = week.title
      .replace(/^Week \d+:\s*/, '')
      .replace(/^Semaine \d+:\s*/, '');
    const newId = addLesson({
      title: `Semana ${week.weekNumber}: ${cleanTitle}`,
      topic: week.title,
      language: activeLesson.language,
      level: week.cefr.startsWith('B2')
        ? 'B2'
        : week.cefr.startsWith('B')
          ? 'B1'
          : week.cefr.startsWith('A2')
            ? 'A2'
            : 'A1',
      avatarGender: activeLesson.avatarGender,
      avatarName: activeLesson.avatarName,
      avatarVoice: activeLesson.avatarVoice,
      avatarImage: resolvedAvatar3dSrc,
      historicalFigureId: activeLesson.historicalFigureId,
      defaultSpeed: activeLesson.defaultSpeed,
      dialogue: dialogueLines,
      karaokePhrases: karaokePhrases,
    });

    setActiveLessonId(newId);
    setActiveMacroTab('speaking');
    setSpeakingSubView('studio');
    triggerToast(`✓ Semana ${week.weekNumber} ("${cleanTitle}") cargada en el Estudio 3D`);
  };

  const handleLoadSingleLessonIntoWorkshop = (
    week: CurricularWeek,
    lesson: CurricularLesson
  ) => {
    const dialogueLines: DialogueLine[] = [
      {
        id: `d-${Date.now()}-1`,
        speaker: 'avatar',
        text: lesson.target,
        translationEs: lesson.translationEs,
        phoneticTip: lesson.phoneticTip,
      },
    ];

    const karaokePhrases: KaraokePhrase[] = [
      {
        id: `k-${Date.now()}-0`,
        targetText: lesson.target,
        translationEs: lesson.translationEs,
        difficulty: (week.cefr === 'A1'
          ? 'beginner'
          : week.cefr === 'A2'
            ? 'intermediate'
            : 'advanced') as any,
        phoneticGuide: lesson.phoneticTip,
      },
      ...week.lessons
        .filter((l) => l.id !== lesson.id)
        .map((l, idx) => ({
          id: `k-${Date.now()}-${idx + 1}`,
          targetText: l.target,
          translationEs: l.translationEs,
          difficulty: (week.cefr === 'A1'
            ? 'beginner'
            : week.cefr === 'A2'
              ? 'intermediate'
              : 'advanced') as any,
          phoneticGuide: l.phoneticTip,
        })),
    ];

    const cleanWeekTitle = week.title
      .replace(/^Week \d+:\s*/, '')
      .replace(/^Semaine \d+:\s*/, '');
    const newId = addLesson({
      title: `${cleanWeekTitle} · ${lesson.title}`,
      topic: `${week.title} - ${lesson.title}`,
      language: activeLesson.language,
      level: week.cefr.startsWith('B2')
        ? 'B2'
        : week.cefr.startsWith('B')
          ? 'B1'
          : week.cefr.startsWith('A2')
            ? 'A2'
            : 'A1',
      avatarGender: activeLesson.avatarGender,
      avatarName: activeLesson.avatarName,
      avatarVoice: activeLesson.avatarVoice,
      avatarImage: resolvedAvatar3dSrc,
      historicalFigureId: activeLesson.historicalFigureId,
      defaultSpeed: activeLesson.defaultSpeed,
      dialogue: dialogueLines,
      karaokePhrases: karaokePhrases,
    });

    setActiveLessonId(newId);
    setActiveMacroTab('speaking');
    setSpeakingSubView('studio');
    triggerToast(`✓ Lección "${lesson.title}" cargada en el Estudio 3D`);
  };

  const availableHistoricalFigures = useMemo(() => {
    return MULTILINGUAL_HISTORICAL_FIGURES.filter(
      (fig) => fig.language === activeLesson.language
    );
  }, [activeLesson.language]);

  useEffect(() => {
    const isHist = Boolean(
      activeLesson.historicalFigureId ||
        activeLesson.avatarImage?.includes('/historical/') ||
        MULTILINGUAL_HISTORICAL_FIGURES.some(
          (f) => f.name === activeLesson.avatarName || f.id === activeLesson.historicalFigureId
        )
    );
    setUseHistoricalFigure(isHist);
    if (isHist) {
      const fig = MULTILINGUAL_HISTORICAL_FIGURES.find(
        (f) => f.name === activeLesson.avatarName || f.id === activeLesson.historicalFigureId
      );
      if (fig) {
        setSelectedHistoricalId(fig.id);
      }
    }
  }, [
    activeLesson.id,
    activeLesson.avatarName,
    activeLesson.historicalFigureId,
    activeLesson.avatarImage,
  ]);

  const handleCreateNewLesson = () => {
    const isFr = activeLesson.language === 'fr';
    const baseTitle = isFr ? 'Nouvelle Conversation Guidée' : 'New Guided Conversation';
    let uniqueTitle = baseTitle;
    let counter = 1;
    while (
      cleanLessons.some(
        (l) =>
          l.language === activeLesson.language &&
          l.title.trim().toLowerCase() === uniqueTitle.trim().toLowerCase()
      )
    ) {
      counter++;
      uniqueTitle = `${baseTitle} ${counter}`;
    }

    const id = addLesson({
      title: uniqueTitle,
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
          text: isFr
            ? "Bonjour la classe! Comment allez-vous aujourd'hui?"
            : 'Hello students! How are you feeling today?',
          translationEs: isFr
            ? '¡Buenos días clase! ¿Cómo están hoy?'
            : '¡Hola alumnos! ¿Cómo se sienten hoy?',
          phoneticTip: isFr
            ? 'Prononcer les voyelles nasales clairement'
            : 'Pronounce the "H" with gentle aspiration',
        },
        {
          id: `d-${Date.now()}-2`,
          speaker: 'student',
          text: isFr
            ? "Je suis très heureux d'apprendre le français!"
            : 'I am excited to learn and practice my pronunciation!',
          translationEs: isFr
            ? '¡Estoy muy feliz de aprender francés!'
            : '¡Estoy emocionado por aprender y practicar mi pronunciación!',
        },
      ],
      karaokePhrases: [
        {
          id: `k-${Date.now()}-1`,
          targetText: isFr
            ? "Je suis très heureux d'apprendre le français"
            : 'I am excited to learn and practice my pronunciation',
          translationEs: isFr
            ? 'Estoy muy feliz de aprender francés'
            : 'Estoy emocionado por aprender y practicar mi pronunciación',
          difficulty: 'beginner',
          phoneticGuide: isFr
            ? 'ʒə sɥi tʁɛ zœ.ʁø da.pʁɑ̃dʁ lə fʁɑ̃.sɛ'
            : 'ai æm ɪkˈsaɪtɪd tuː lɜːrn ænd ˈpræktɪs',
        },
      ],
    });
    setActiveLessonId(id);
    setSpeakingSubView('studio');
    triggerToast(`✓ Lección "${uniqueTitle}" creada exitosamente`);
  };

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
      karaokePhrases: template.karaokePhrases,
    });
    setActiveLessonId(newLessonId);
    setActiveMacroTab('speaking');
    setSpeakingSubView('studio');
  };

  const handleApplyHistoricalFigure = (figure: MultilingualHistoricalFigure) => {
    stopAllIskoolAudio();
    const existingHistLesson = cleanLessons.find(
      (l) => l.historicalFigureId === figure.id && l.language === figure.language
    );
    if (existingHistLesson) {
      setActiveLessonId(existingHistLesson.id);
      setUseHistoricalFigure(true);
      setSelectedHistoricalId(figure.id);
      setSelectedKaraokeIndex(0);
      triggerToast(`✓ Personaje 3D en 1ª Persona activo: ${figure.name}`);
      return;
    }

    const spanishIntro =
      HISTORICAL_TRANSLATIONS[figure.id] || 'Presentación canónica del personaje histórico.';
    const newHistId = addLesson({
      title: `Inmersión 1ª Persona: ${figure.name}`,
      topic: 'Inmersión Histórica en 1ª Persona',
      language: figure.language,
      level: 'B2',
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
          phoneticTip: 'Dicción solemne y articulación nativa de época',
        },
        {
          id: `d-${Date.now()}-q1`,
          speaker: 'student',
          text: figure.sampleQuestions[0] || 'Tell me about your historical legacy.',
          translationEs: 'Pregunta del alumno al personaje en primera persona.',
        },
      ],
      karaokePhrases: [
        {
          id: `k-${Date.now()}-hist`,
          targetText: figure.canonicalIntro.split('.')[0] + '.',
          translationEs: spanishIntro.split('.')[0] + '.',
          difficulty: 'intermediate',
        },
      ],
    });
    setActiveLessonId(newHistId);
    setUseHistoricalFigure(true);
    setSelectedHistoricalId(figure.id);
    setSelectedKaraokeIndex(0);
    triggerToast(`✓ Personaje 3D en 1ª Persona activo: ${figure.name}`);
  };

  const handlePlayAudioSample = async (
    textToPlay?: string,
    lineId?: string,
    customRate?: number
  ) => {
    if (isPlayingPreview || activePlayingLineId) {
      stopAllIskoolAudio();
      audioControllerRef.current?.stop();
      setIsPlayingPreview(false);
      setActivePlayingLineId(null);
      if (!lineId && isPlayingPreview && !customRate) return;
      if (lineId && activePlayingLineId === lineId) return;
    }

    const defaultSample =
      activeLesson.dialogue[0]?.text ||
      (activeLesson.language === 'fr'
        ? `Bonjour! Je suis ${activeLesson.avatarName}. Bienvenue dans notre atelier de français.`
        : `Good morning! Welcome to our class. What would you like today?`);

    const sampleText = textToPlay || defaultSample;
    const effectiveRate = customRate || activeLesson.defaultSpeed || 0.88;

    if (lineId) {
      setActivePlayingLineId(lineId);
    } else {
      setIsPlayingPreview(true);
    }

    try {
      audioControllerRef.current = await playUniversalIskoolVoice({
        text: sampleText,
        characterName: activeLesson.avatarName,
        voiceId: activeLesson.avatarVoice,
        language: activeLesson.language,
        gender: activeLesson.avatarGender,
        rate: effectiveRate,
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
        },
      });
    } catch {
      setIsPlayingPreview(false);
      setActivePlayingLineId(null);
    }
  };

  // Sincronización global continua del Control Remoto QR del Profesor (incluso con el modal cerrado)
  useEffect(() => {
    const cleanId = activeTeacherQrAccount.id.trim().toLowerCase();
    const { pin } = deriveTeacherRemoteCredentials(
      activeTeacherQrAccount.id,
      activeTeacherQrAccount.email,
      activeTeacherQrAccount.campusName
    );

    syncActiveLessonToPocketServer({
      teacherId: activeTeacherQrAccount.id,
      teacherEmail: activeTeacherQrAccount.email,
      teacherName: activeTeacherQrAccount.name,
      campusName: activeTeacherQrAccount.campusName,
      pin,
      lessonSnapshot: {
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        avatarName: activeLesson.avatarName,
        avatarSrc: resolvedAvatar3dSrc,
        language: activeLesson.language,
        level: activeLesson.level,
        defaultSpeed: activeLesson.defaultSpeed,
        selectedLineIdx: 0,
        isPlayingAudio: isPlayingPreview || Boolean(activePlayingLineId),
        choralStatus: 'idle',
        dialogue: activeLesson.dialogue.map((d) => ({
          id: d.id,
          speaker: d.speaker,
          text: d.text,
          translationEs: d.translationEs,
        })),
        ccqQuestions: activeCeltaGuide.ccqQuestions,
        spanishInterference: activeCeltaGuide.spanishInterference,
      },
    });

    if (isPocketRemoteOpen) return;

    const handleGlobalRemoteCmd = (cmd: any) => {
      if (!cmd || !cmd.type) return;
      if (cmd.type === 'PLAY_NORMAL') {
        const idx = typeof cmd.payload?.lineIndex === 'number' ? cmd.payload.lineIndex : 0;
        const targetLine = activeLesson.dialogue[idx] || activeLesson.dialogue[0];
        handlePlayAudioSample(
          cmd.payload?.text || targetLine?.text,
          targetLine?.id,
          cmd.payload?.rate || activeLesson.defaultSpeed
        );
        triggerToast(
          `📱 QR [${activeTeacherQrAccount.name}]: Hablando con Prof. ${activeLesson.avatarName} 3D`
        );
      } else if (cmd.type === 'PLAY_SLOW') {
        const idx = typeof cmd.payload?.lineIndex === 'number' ? cmd.payload.lineIndex : 0;
        const targetLine = activeLesson.dialogue[idx] || activeLesson.dialogue[0];
        handlePlayAudioSample(cmd.payload?.text || targetLine?.text, targetLine?.id, 0.68);
        triggerToast(
          `📱 QR [${activeTeacherQrAccount.name}]: Repitiendo en Cámara Lenta 🐢 (0.68x)`
        );
      } else if (cmd.type === 'START_PAIR_TIMER' || cmd.type === 'TOGGLE_PIZARRA') {
        setBoardStartTimer(cmd.type === 'START_PAIR_TIMER');
        setIsBoardModalOpen(true);
        triggerToast(
          `📱 QR [${activeTeacherQrAccount.name}]: Pizarrón 36pt + Cronómetro de Parejas activado`
        );
      } else if (cmd.type === 'SET_GESTURE' && cmd.payload?.gesture) {
        setActiveAvatarGesture(cmd.payload.gesture as AvatarGestureMode);
        triggerToast(
          `📱 QR [${activeTeacherQrAccount.name}]: Gesto 3D activado (${cmd.payload.gesture})`
        );
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`iskool_pocket_remote_${cleanId}`);
      bc.onmessage = (ev) => handleGlobalRemoteCmd(ev.data);
    } catch {
      // Ignorar si no soporta BroadcastChannel
    }

    return () => {
      if (bc) bc.close();
    };
  }, [
    activeTeacherQrAccount,
    activeLesson,
    resolvedAvatar3dSrc,
    activeCeltaGuide,
    isPlayingPreview,
    activePlayingLineId,
    isPocketRemoteOpen,
  ]);

  const handleAddDialogueLine = () => {
    const newLine: DialogueLine = {
      id: `d-${Date.now()}`,
      speaker: 'avatar',
      text: '',
      translationEs: '',
    };
    updateLesson(activeLesson.id, {
      dialogue: [...activeLesson.dialogue, newLine],
    });
  };

  const handleUpdateDialogueLine = (index: number, updates: Partial<DialogueLine>) => {
    const updated = [...activeLesson.dialogue];
    updated[index] = { ...updated[index], ...updates };
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  const handleDeleteDialogueLine = (index: number) => {
    const updated = activeLesson.dialogue.filter((_, i) => i !== index);
    updateLesson(activeLesson.id, { dialogue: updated });
  };

  const handleSwitchLanguageGlobal = (lang: LanguageCode) => {
    stopAllIskoolAudio();
    audioControllerRef.current?.stop();
    setIsPlayingPreview(false);
    setActivePlayingLineId(null);

    const candidates = cleanLessons.filter((l) => l.language === lang);
    // Si la lección actual trata sobre horario escolar ("schedule" / "emploi du temps"), elegir su equivalente directo en el otro idioma
    const isCurrentSchoolSchedule = /schedule|science lab|emploi du temps|collège/i.test(
      activeLesson.title
    );
    const counterpartSchedule = isCurrentSchoolSchedule
      ? candidates.find((l) => /schedule|science lab|emploi du temps|collège/i.test(l.title))
      : undefined;

    const sameLevelLesson = candidates.find(
      (l) => l.level === activeLesson.level && !l.historicalFigureId
    );
    const targetLesson =
      counterpartSchedule || sameLevelLesson || candidates[0];

    if (targetLesson) {
      setUseHistoricalFigure(Boolean(targetLesson.historicalFigureId));
      setSelectedHistoricalId(targetLesson.historicalFigureId || '');
      setSelectedKaraokeIndex(0);
      setActiveLessonId(targetLesson.id);
      triggerToast(
        lang === 'fr'
          ? `🇫🇷 Francés (FLE · DELF ${targetLesson.level}) activado: "${targetLesson.title}"`
          : `🇬🇧 Inglés (ESL · Cambridge ${targetLesson.level}) activado: "${targetLesson.title}"`
      );
    }
  };

  // Agrupación de las 40 semanas en las 4 Etapas de Certificación (Pantalla Híbrida 3)
  const stage1Weeks = useMemo(
    () => current40Weeks.filter((w) => w.weekNumber >= 1 && w.weekNumber <= 10),
    [current40Weeks]
  );
  const stage2Weeks = useMemo(
    () => current40Weeks.filter((w) => w.weekNumber >= 11 && w.weekNumber <= 20),
    [current40Weeks]
  );
  const stage3Weeks = useMemo(
    () => current40Weeks.filter((w) => w.weekNumber >= 21 && w.weekNumber <= 30),
    [current40Weeks]
  );
  const stage4Weeks = useMemo(
    () => current40Weeks.filter((w) => w.weekNumber >= 31 && w.weekNumber <= 40),
    [current40Weeks]
  );

  // Tarjetas de la Galería de Mentores e Inmersión Histórica 3D en 1ª Persona (Adaptadas por Idioma ESL / FLE)
  const galleryMentors3D = useMemo(() => {
    if (activeLesson.language === 'fr') {
      return [
        {
          id: 'mentor-sophie',
          targetLessonId: 'lesson-fr-paris',
          name: 'Prof. Sophie 3D',
          subtitle: 'Situación: Brasserie à Paris & Gare TGV · DELF A1–A2',
          language: 'fr' as LanguageCode,
          gender: 'female' as const,
          voiceId: 'fr-FR-DeniseNeural',
          image: '/images/languages/3d/mentor_female_3d.webp',
          sampleText:
            "Bonjour et bienvenue à la brasserie parisienne ! Comment puis-je vous aider aujourd'hui ?",
          isHistorical: false,
        },
        {
          id: 'mentor-henri',
          targetLessonId: 'lesson-fr-college-a1',
          name: 'Prof. Henri 3D',
          subtitle: 'Situación: Collège, Laboratoire & Écologie · DELF A1–B1',
          language: 'fr' as LanguageCode,
          gender: 'male' as const,
          voiceId: 'fr-FR-HenriNeural',
          image: '/images/languages/3d/mentor_male_3d_v2.webp',
          sampleText:
            "Bonjour les élèves ! Notre séance au laboratoire de sciences commence à huit heures du matin.",
          isHistorical: false,
        },
        {
          id: 'marie_curie',
          targetLessonId: 'lesson-fr-curie-b1',
          name: 'Marie Curie 3D',
          subtitle: '1ª Persona: Mon Laboratoire à Paris · DELF B1',
          language: 'fr' as LanguageCode,
          gender: 'female' as const,
          voiceId: 'fr-FR-DeniseNeural',
          image: '/images/languages/3d/marie_curie_3d.webp',
          sampleText:
            'Je suis Marie Curie. Dans mon laboratoire à Paris, j’ai découvert le radium et le polonium.',
          isHistorical: true,
        },
        {
          id: 'napoleon',
          targetLessonId: 'lesson-fr-napoleon',
          name: 'Napoléon Bonaparte 3D',
          subtitle: '1ª Persona: Le Code Civil des Français · DELF B2',
          language: 'fr' as LanguageCode,
          gender: 'male' as const,
          voiceId: 'fr-FR-HenriNeural',
          image: '/images/languages/3d/napoleon_3d.webp',
          sampleText:
            "Je suis Napoléon Bonaparte. J'ai réorganisé l'administration et promulgué le Code civil.",
          isHistorical: true,
        },
        {
          id: 'victor_hugo',
          targetLessonId: '',
          name: 'Victor Hugo 3D',
          subtitle: '1ª Persona: Notre-Dame et Les Misérables · DELF B2',
          language: 'fr' as LanguageCode,
          gender: 'male' as const,
          voiceId: 'fr-FR-HenriNeural',
          image: '/images/languages/3d/victor_hugo_3d.webp',
          sampleText:
            "Je suis Victor Hugo. J'ai écrit Les Misérables et Notre-Dame de Paris pour défendre la dignité humaine.",
          isHistorical: true,
        },
      ];
    }

    return [
      {
        id: 'mentor-claire',
        targetLessonId: 'lesson-en-coffee',
        name: 'Prof. Claire 3D',
        subtitle: 'Situación: Cafetería & Estación en Londres · A1–A2',
        language: 'en' as LanguageCode,
        gender: 'female' as const,
        voiceId: 'en-US-JennyNeural',
        image: '/images/languages/3d/mentor_female_3d.webp',
        sampleText: 'Good morning! Welcome to the Royal Orchard Café. What would you like today?',
        isHistorical: false,
      },
      {
        id: 'mentor-arthur',
        targetLessonId: 'lesson-en-science',
        name: 'Prof. Arthur 3D',
        subtitle: 'Situación: Laboratorio & Energía Limpia · A1–B1',
        language: 'en' as LanguageCode,
        gender: 'male' as const,
        voiceId: 'en-US-GuyNeural',
        image: '/images/languages/3d/mentor_male_3d_v2.webp',
        sampleText:
          'Welcome explorers! Today we investigate how kinetic energy transforms our world.',
        isHistorical: false,
      },
      {
        id: 'ada_lovelace',
        targetLessonId: 'lesson-en-lovelace-b1',
        name: 'Ada Lovelace 3D',
        subtitle: '1ª Persona: Cómo inventé el primer algoritmo · B1',
        language: 'en' as LanguageCode,
        gender: 'female' as const,
        voiceId: 'en-GB-SoniaNeural',
        image: '/images/languages/3d/ada_lovelace_3d.webp',
        sampleText:
          'I am Ada Lovelace. In 1843, I wrote the first algorithm for Charles Babbage and envisioned modern computing.',
        isHistorical: true,
      },
      {
        id: 'shakespeare',
        targetLessonId: 'lesson-en-shakespeare',
        name: 'William Shakespeare 3D',
        subtitle: '1ª Persona: Mi Teatro Globe en 1599 · B2',
        language: 'en' as LanguageCode,
        gender: 'male' as const,
        voiceId: 'en-GB-RyanNeural',
        image: '/images/languages/3d/shakespeare_3d.webp',
        sampleText:
          'I am William Shakespeare. Upon the boards of the Globe Theatre in London, I crafted Hamlet and Macbeth.',
        isHistorical: true,
      },
      {
        id: 'abraham_lincoln',
        targetLessonId: '',
        name: 'Abraham Lincoln 3D',
        subtitle: '1ª Persona: El Discurso de Gettysburg · B2',
        language: 'en' as LanguageCode,
        gender: 'male' as const,
        voiceId: 'en-US-GuyNeural',
        image: '/images/languages/3d/abraham_lincoln_3d.webp',
        sampleText:
          'I am Abraham Lincoln. In 1863 at Gettysburg, I proclaimed that government of the people shall not perish.',
        isHistorical: true,
      },
    ];
  }, [activeLesson.language]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col overflow-x-hidden ${
        isLightMode ? 'bg-[#F1F5F9] text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* =========================================================================
          1. BARRA SUPERIOR INSTITUCIONAL UNIFICADA (56px+ · CERO DUPLICIDAD)
          ========================================================================= */}
      <header className="w-full bg-[#0F172A] text-white border-b border-slate-800 px-3.5 sm:px-6 lg:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Izquierda: Retroceso + Escudo IBIME + Nombre Institucional + Selector de Sede */}
          <div className="flex flex-wrap items-center gap-3">
            <BackButton fallbackUrl="/teacher" label="Regresar" variant="header" />

            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                <IbimeOfficialLogo variant="shield_only" size={30} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                  Instituto Bilingüe IBIME · Centro de Idiomas
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Building2 className="w-3 h-3 text-red-400 shrink-0" />
                  <select
                    aria-label="Seleccionar plantel"
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                    className="bg-transparent font-bold text-slate-200 focus:outline-hidden cursor-pointer truncate max-w-[190px] sm:max-w-none"
                  >
                    {allAvailableCampuses.map((campus) => (
                      <option
                        key={campus.id}
                        value={campus.id}
                        className="bg-slate-900 text-white"
                      >
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Centro: Píldora Unificada de Grupo, Certificación y Selector Rápido de Nivel CEFR (A1, A2, B1, B2) */}
          <div className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs sm:text-sm font-extrabold text-slate-100 shadow-inner flex flex-wrap items-center gap-2">
            <span>Grupo: 2º A</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-black">
              {activeLesson.language === 'fr' ? '🇫🇷 DELF' : '🇬🇧 Cambridge'} {activeLesson.level} (
              {activeCertification.cenni.split('(')[0].trim()})
            </span>
            <div className="flex items-center gap-1 ml-1 bg-slate-900/90 p-0.5 rounded-full border border-slate-700">
              {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  data-testid={`header-level-${lvl}`}
                  onClick={() => handleSelectCefrLevel(lvl)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                    activeLesson.level === lvl
                      ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title={`Cambiar a Nivel ${lvl} en ${
                    activeLesson.language === 'fr' ? 'Francés (FLE)' : 'Inglés (ESL)'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Derecha: Selector Único de Idioma (ESL / FLE) + Modo Claro/Oscuro + Switch Vista Coordinador */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selector Único de Idioma */}
            <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleSwitchLanguageGlobal('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeLesson.language === 'en'
                    ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-600'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇬🇧</span>
                <span>Inglés ESL</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchLanguageGlobal('fr')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeLesson.language === 'fr'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇫🇷</span>
                <span>FLE</span>
              </button>
            </div>

            {/* Conmutador de Revelación Progresiva: Vista Coordinador OFF / ACTIVA */}
            <button
              type="button"
              data-testid="btn-coordinator-drawer"
              onClick={() => setIsCoordinatorViewOpen(!isCoordinatorViewOpen)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                isCoordinatorViewOpen
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Activar o desactivar el Panel Técnico de Coordinación y Radar BKT"
            >
              <Settings className="w-3.5 h-3.5 text-slate-300" />
              <span>
                Vista Coordinador: {isCoordinatorViewOpen ? 'ACTIVA' : 'OFF'}
              </span>
              <span
                className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                  isCoordinatorViewOpen ? 'bg-sky-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    isCoordinatorViewOpen ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>

            {/* Botón Modo Claro / Oscuro */}
            <button
              type="button"
              onClick={() => setIsLightMode(!isLightMode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs cursor-pointer"
              title={isLightMode ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            >
              {isLightMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CUERPO PRINCIPAL DE LA CABINA HÍBRIDA MAESTRA
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* =====================================================================
            PANEL EJECUTIVO DE COORDINACIÓN (PANTALLA HÍBRIDA 8 — OCULTO EN MODO AULA)
            ===================================================================== */}
        <CoordinatorAdvancedDrawer
          isOpen={isCoordinatorViewOpen}
          onClose={() => setIsCoordinatorViewOpen(false)}
          language={activeLesson.language}
          level={activeLesson.level}
          cenniLabel={activeCertification.cenni}
          phaseLabel={activeCertification.unamNote}
          isLightMode={isLightMode}
          onLanguageChange={handleSwitchLanguageGlobal}
          onLoadWeekLessonToWorkshop={handleLoadSingleLessonIntoWorkshop}
          onSelectLessonTemplate={handleLoadCurriculumTemplate}
          onTriggerToast={triggerToast}
        />

        {/* =====================================================================
            2. FRANJA COMPACTA DE AGENDA DE 50 MINUTOS (REDISEÑO 3 EN 1 CLIC)
            ===================================================================== */}
        <div
          className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border shadow-2xs transition-all ${
            isLightMode
              ? 'bg-white border-slate-200/90 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center text-xs sm:text-sm font-black">
            {/* Paso 1: Min 0-15 */}
            <button
              type="button"
              onClick={() => {
                setActiveAgendaStep(1);
                setActiveMacroTab('speaking');
                setSpeakingSubView('studio');
              }}
              className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all text-left ${
                activeAgendaStep === 1
                  ? 'bg-emerald-50/90 text-slate-900 border border-emerald-300'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                <span className="truncate">
                  Min 0-15: Rompehielo con Avatar 3D{' '}
                  <span className="text-emerald-700 font-bold">(En Curso)</span>
                </span>
              </div>
              <span className="text-slate-400 hidden md:inline">───→</span>
            </button>

            {/* Paso 2: Min 15-35 */}
            <button
              type="button"
              onClick={() => {
                setActiveAgendaStep(2);
                setBoardStartTimer(true);
                setIsBoardModalOpen(true);
              }}
              className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all text-left ${
                activeAgendaStep === 2
                  ? 'bg-amber-50/90 text-slate-900 border border-amber-300'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">⏳</span>
                <span className="truncate">Min 15-35: Roleplay en Parejas (Pizarrón)</span>
              </div>
              <span className="text-slate-400 hidden md:inline">───→</span>
            </button>

            {/* Paso 3: Min 35-50 */}
            <button
              type="button"
              onClick={() => {
                setActiveAgendaStep(3);
                setActiveMacroTab('traffic_light');
              }}
              className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all text-left ${
                activeAgendaStep === 3
                  ? 'bg-indigo-50/90 text-slate-900 border border-indigo-300'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">⏳</span>
                <span className="truncate">Min 35-50: Ticket de Salida y Tarea 1-Clic</span>
              </div>
            </button>
          </div>

          {/* Barra visual de progreso de los 50 minutos */}
          <div className="mt-2.5 w-full h-2 rounded-full bg-slate-200 overflow-hidden flex items-center">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{
                width:
                  activeAgendaStep === 1
                    ? '36%'
                    : activeAgendaStep === 2
                      ? '70%'
                      : '100%',
              }}
            />
          </div>
        </div>

        {/* =====================================================================
            3. NAVEGACIÓN PRINCIPAL POR LAS 4 MACRO-HABILIDADES CEFR (REDISEÑO 2)
            ===================================================================== */}
        <div
          className={`p-1.5 rounded-2xl border shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 ${
            isLightMode
              ? 'bg-white border-slate-200/90'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          {/* Macro-Habilidad 1: Speaking & Avatar 3D */}
          <button
            type="button"
            data-testid="macro-tab-1-speaking"
            onClick={() => setActiveMacroTab('speaking')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMacroTab === 'speaking'
                ? 'bg-[#1E3A8A] text-white shadow-md'
                : isLightMode
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🗣️</span>
            <span>
              1. Speaking & Avatar 3D {activeMacroTab === 'speaking' ? '(Activo)' : ''}
            </span>
          </button>

          {/* Macro-Habilidad 2: Listening & 40 Semanas */}
          <button
            type="button"
            data-testid="macro-tab-2-listening-40weeks"
            onClick={() => setActiveMacroTab('listening')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMacroTab === 'listening'
                ? 'bg-[#1E3A8A] text-white shadow-md'
                : isLightMode
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Listening, 40 Semanas & Mentores 3D</span>
          </button>

          {/* Macro-Habilidad 3: Writing & Rúbrica Estrellas */}
          <button
            type="button"
            data-testid="macro-tab-3-writing-rubric"
            onClick={() => setActiveMacroTab('writing')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMacroTab === 'writing'
                ? 'bg-[#1E3A8A] text-white shadow-md'
                : isLightMode
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4 text-amber-500" />
            <span>3. Writing & Rúbrica Estrellas</span>
          </button>

          {/* Macro-Habilidad 4: Semáforo del Grupo & CENNI */}
          <button
            type="button"
            data-testid="macro-tab-4-traffic-cenni"
            onClick={() => setActiveMacroTab('traffic_light')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeMacroTab === 'traffic_light'
                ? 'bg-[#1E3A8A] text-white shadow-md'
                : isLightMode
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🚦</span>
            <span>4. Semáforo del Grupo & CENNI</span>
            {studentReports.filter((r) => !r.reviewedByTeacher).length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        {/* =====================================================================
            CONTENIDO DE LA MACRO-HABILIDAD 1: SPEAKING & AVATAR 3D (PANTALLAS HÍBRIDAS 1 Y 4)
            ===================================================================== */}
        {activeMacroTab === 'speaking' && (
          <div className="space-y-3">
            {/* Sub-Conmutador Rápido: Estudio de Diálogo 3D vs Espejo de Pronunciación y Karaoke */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="subview-studio"
                  onClick={() => setSpeakingSubView('studio')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                    speakingSubView === 'studio'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🎭 Cabina de Diálogo 3D & Guía CELTA</span>
                </button>

                <button
                  type="button"
                  data-testid="subview-contrastive-mirror"
                  onClick={() => setSpeakingSubView('mirror')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                    speakingSubView === 'mirror'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👄 Espejo Articulatorio Contrastivo & Karaoke</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeakingSubView('preview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                    speakingSubView === 'preview'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Demostración Alumno (Gamificada)</span>
                </button>
              </div>

              {/* Selector compacto de Nivel CEFR (A1-B2) + Lección Activa Filtrada por Idioma */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-black text-slate-500 px-1.5">Nivel:</span>
                  {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      data-testid={`level-pill-${lvl}`}
                      onClick={() => handleSelectCefrLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        activeLesson.level === lvl
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-bold text-slate-500">Lección Activa:</span>
                <select
                  aria-label="Seleccionar lección activa"
                  data-testid="select-active-lesson"
                  value={activeLesson.id}
                  onChange={(e) => setActiveLessonId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 shadow-2xs cursor-pointer max-w-[330px] truncate"
                >
                  {lessonsForActiveLanguage.map((les) => (
                    <option key={les.id} value={les.id}>
                      {les.language === 'fr' ? '🇫🇷' : '🇬🇧'} [{les.level}] {les.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleCreateNewLesson}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva</span>
                </button>
              </div>
            </div>

            {speakingSubView === 'mirror' ? (
              /* PANTALLA HÍBRIDA 4: ESPEJO ARTICULATORIO CONTRASTIVO + KARAOKE GRUPAL */
              <ContrastivePhoneticsMirrorView
                lesson={activeLesson}
                avatarSrc={resolvedAvatar3dSrc}
                initialMirrorId={selectedMirrorId || activeCeltaGuide.spanishInterference.mirrorId}
                isLightMode={isLightMode}
                onPlayAudio={(txt, rate) => handlePlayAudioSample(txt, undefined, rate)}
                onBackToStudio={() => setSpeakingSubView('studio')}
              />
            ) : speakingSubView === 'preview' ? (
              /* VISTA DE SIMULACIÓN GAMIFICADA DEL ALUMNO */
              <div
                className={`p-6 rounded-3xl border-2 shadow-xl space-y-5 animate-fade-in ${
                  isLightMode
                    ? 'bg-white border-amber-400 text-slate-900'
                    : 'bg-slate-900 border-amber-500/50 text-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-black text-sm text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>
                      Entorno Gamificado del Alumno · Avatar Parlante 60 FPS & Karaoke de Precisión
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Frase activa:</span>
                    <select
                      value={selectedKaraokeIndex}
                      onChange={(e) => setSelectedKaraokeIndex(Number(e.target.value))}
                      className="px-3 py-1 rounded-xl text-xs font-bold border bg-slate-50 text-slate-800 border-slate-300"
                    >
                      {activeLesson.karaokePhrases.map((phrase, idx) => (
                        <option key={phrase.id} value={idx}>
                          Frase {idx + 1}: &ldquo;{phrase.targetText.substring(0, 38)}...&rdquo;
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
              /* =================================================================
                 PANTALLA HÍBRIDA 1: CABINA MAESTRA UNIFICADA (0px SCROLL)
                 3 Columnas Quirúrgicas:
                 - Izquierda (5 cols / 38%): Avatar 3D en Vivo (60 FPS)
                 - Centro (4 cols / 38%): Diálogo de la Clase + Modo Pizarrón + QR
                 - Derecha (3 cols / 24%): Guía CELTA de Bolsillo (CCQs + Alerta Fonética)
                 ================================================================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* COLUMNA IZQUIERDA (5 cols / 38%): Avatar 3D en Vivo (60 FPS) */}
                <div
                  className={`lg:col-span-5 p-4 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${
                    isLightMode
                      ? 'bg-white border-slate-200/90 text-slate-900'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-black tracking-tight">
                        Avatar 3D en Vivo (60 FPS)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold">
                        38%
                      </span>
                    </div>

                    {/* Escenario 3D de Alta Fidelidad (0px de Scroll) */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-100 via-slate-50 to-white h-[272px] flex items-end justify-center p-2 shadow-inner">
                      <div className="relative w-full max-w-[290px] h-[260px] flex items-end justify-center">
                        <HumanGesticulatingAvatar
                          variant="stage"
                          gender={activeLesson.avatarGender}
                          name={activeLesson.avatarName}
                          language={activeLesson.language}
                          voiceId={activeLesson.avatarVoice}
                          avatarImage={resolvedAvatar3dSrc}
                          historicalFigureId={
                            useHistoricalFigure
                              ? selectedHistoricalId
                              : activeLesson.historicalFigureId
                          }
                          isPlaying={isPlayingPreview || Boolean(activePlayingLineId)}
                          currentText={
                            activePlayingLineId
                              ? activeLesson.dialogue.find((d) => d.id === activePlayingLineId)
                                  ?.text || activeLesson.dialogue[0]?.text
                              : activeLesson.dialogue[0]?.text ||
                                'Good morning! What would you like today?'
                          }
                          speechRate={activeLesson.defaultSpeed}
                          isLightMode={isLightMode}
                          activeGesture={activeAvatarGesture}
                          onActiveGestureChange={setActiveAvatarGesture}
                          gestureImpulse={avatarGestureImpulse}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-black shadow-md pointer-events-none">
                        Prof. {activeLesson.avatarName} · 60 FPS
                      </div>
                    </div>
                  </div>

                  {/* Controles Docentes Simplificados del Avatar 3D */}
                  <div className="space-y-2.5">
                    {/* Botón Esmeralda Gigante: Escuchar Diálogo + Velocidad 🐢 / 🚶 */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayAudioSample()}
                        className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                          isPlayingPreview
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-[#059669] hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {isPlayingPreview ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Detener Locución</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>Escuchar Diálogo</span>
                          </>
                        )}
                      </button>

                      {/* Selector de Velocidad Intuitivo: 🐢 Lento vs 🚶 Normal */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            updateLesson(activeLesson.id, { defaultSpeed: 0.68 });
                            handlePlayAudioSample(activeLesson.dialogue[0]?.text, undefined, 0.68);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer border transition-all ${
                            activeLesson.defaultSpeed <= 0.75
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🐢</span>
                          <span>Lento</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateLesson(activeLesson.id, { defaultSpeed: 0.9 });
                            handlePlayAudioSample(activeLesson.dialogue[0]?.text, undefined, 0.9);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer border transition-all ${
                            activeLesson.defaultSpeed > 0.75
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🚶</span>
                          <span>Normal</span>
                        </button>
                      </div>
                    </div>

                    {/* Compendio Ampliado de 12 Movimientos 3D + Ciclo Automático */}
                    <div className="space-y-1.5" data-testid="teacher-avatar-movements-pad">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Compendio de 12 Movimientos 3D
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveAvatarGesture('auto')}
                          className={`py-0.5 px-2.5 rounded-lg text-[10px] font-black border cursor-pointer transition-all flex items-center gap-1 ${
                            activeAvatarGesture === 'auto'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>✨</span>
                          <span>Ciclo Auto (12)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'welcome' as AvatarGestureMode, icon: '👋', label: 'Bienvenida' },
                          { id: 'wave' as AvatarGestureMode, icon: '🙋', label: 'Saludo' },
                          { id: 'explain' as AvatarGestureMode, icon: '☝️', label: 'Explicar' },
                          { id: 'point' as AvatarGestureMode, icon: '👉', label: 'Pizarrón' },
                          { id: 'pronounce' as AvatarGestureMode, icon: '🗣️', label: 'Fonética' },
                          { id: 'inquire' as AvatarGestureMode, icon: '🤔', label: 'Pregunta' },
                          { id: 'think' as AvatarGestureMode, icon: '💡', label: '¡Idea!' },
                          { id: 'exclaim' as AvatarGestureMode, icon: '🎉', label: '¡Exclamar!' },
                          { id: 'celebrate' as AvatarGestureMode, icon: '👏', label: 'Aplauso' },
                          { id: 'encourage' as AvatarGestureMode, icon: '👍', label: 'Ánimo' },
                          { id: 'calm' as AvatarGestureMode, icon: '🤲', label: 'Calma' },
                          { id: 'listen' as AvatarGestureMode, icon: '👁️', label: 'Parpadeo' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            data-movement-btn={g.id}
                            onClick={() => {
                              setActiveAvatarGesture(g.id);
                              setAvatarGestureImpulse((prev) => prev + 1);
                            }}
                            className={`py-1 px-1.5 rounded-xl text-[10.5px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                              activeAvatarGesture === g.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : isLightMode
                                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                          >
                            <span>{g.icon}</span>
                            <span className="truncate">{g.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA CENTRAL (4 cols / 38%): Diálogo de la Clase + Modo Pizarrón + Control Remoto QR */}
                <div
                  className={`lg:col-span-4 p-4 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${
                    isLightMode
                      ? 'bg-white border-slate-200/90 text-slate-900'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                          Diálogo de la Clase
                        </h2>
                        <p className="text-xs font-bold text-slate-600">
                          ({activeLesson.title})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingScript(!isEditingScript)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingScript ? 'Listo' : 'Editar'}</span>
                      </button>
                    </div>

                    {!isEditingScript ? (
                      /* Tarjetas Apiladas de Diálogo con Sílabas Tónicas Subrayadas */
                      <div className="space-y-2">
                        {activeLesson.dialogue.slice(0, 2).map((line) => {
                          const isLinePlaying = activePlayingLineId === line.id;
                          return (
                            <div
                              key={line.id}
                              onClick={() => handlePlayAudioSample(line.text, line.id)}
                              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer space-y-1 ${
                                isLinePlaying
                                  ? 'bg-indigo-50/70 border-indigo-500 shadow-md'
                                  : 'bg-slate-50/80 hover:bg-white border-slate-200/90 shadow-xs'
                              }`}
                              title="Pulsa para escuchar esta línea con el Avatar 3D"
                            >
                              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                                <span>
                                  {line.speaker === 'avatar'
                                    ? `👩‍🏫 ${activeLesson.avatarName}:`
                                    : '🙋‍♂️ Student / Alumno:'}
                                </span>
                                <span className="text-indigo-600 flex items-center gap-1">
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Oír</span>
                                </span>
                              </div>

                              <p className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                                {tokenizeDialogueWithStress(line.text).map((tok, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={
                                      tok.isStressed
                                        ? 'underline decoration-blue-600 decoration-2 underline-offset-4 mr-1.5 inline-block'
                                        : 'mr-1.5 inline-block'
                                    }
                                  >
                                    {tok.display}
                                  </span>
                                ))}
                              </p>

                              {line.translationEs && (
                                <p className="text-[11px] font-semibold text-slate-600">
                                  {line.translationEs}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Modo Edición Rápida de Líneas de Diálogo */
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {activeLesson.dialogue.map((line, idx) => (
                          <div
                            key={line.id}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>
                                Línea {idx + 1} (
                                {line.speaker === 'avatar' ? activeLesson.avatarName : 'Alumno'})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteDialogueLine(idx)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={line.text}
                              onChange={(e) =>
                                handleUpdateDialogueLine(idx, { text: e.target.value })
                              }
                              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={line.translationEs}
                              onChange={(e) =>
                                handleUpdateDialogueLine(idx, {
                                  translationEs: e.target.value,
                                })
                              }
                              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-[11px] text-slate-700"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddDialogueLine}
                          className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black cursor-pointer"
                        >
                          + Añadir Línea al Diálogo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Los 2 Botones Maestros de Aula (Modo Pizarrón + Control Remoto QR) */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      data-testid="btn-classroom-pizarra"
                      onClick={() => {
                        setBoardStartTimer(false);
                        setIsBoardModalOpen(true);
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-98"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Modo Pizarrón (Pantalla Completa)</span>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-pocket-remote"
                      onClick={() => setIsPocketRemoteOpen(true)}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-900 font-black text-xs flex items-center justify-between gap-2 cursor-pointer shadow-2xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-800 shrink-0" />
                        <span className="text-left leading-tight">
                          Control Remoto en mi Celular (QR)
                        </span>
                      </div>
                      <div className="p-1 rounded-lg bg-white border border-slate-200 shrink-0">
                        <QrCode className="w-5 h-5 text-slate-900" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* COLUMNA DERECHA (3 cols / 24%): Innovación Internacional "Guía CELTA de Bolsillo (Para el Teacher)" */}
                <div className="lg:col-span-3 rounded-3xl overflow-hidden border-2 border-amber-300/90 bg-[#FEF9E7] text-slate-900 shadow-sm flex flex-col justify-between">
                  {/* Encabezado Dorado CELTA */}
                  <div className="bg-[#CA8A04] text-white px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-black leading-tight">
                        Guía CELTA de Bolsillo
                      </h2>
                      <span className="text-[11px] font-bold text-amber-100">
                        (Para el Teacher)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-black/20 text-white text-[11px] font-extrabold">
                      24%
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                    {/* Tarjeta 1: Preguntas CCQ (Concept Checking) */}
                    <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/90 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>💡 Preguntas CCQ (Concept Checking):</span>
                        </h3>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        {activeCeltaGuide.ccqQuestions.map((ccq) => (
                          <div key={ccq.id} className="space-y-0.5">
                            <p className="font-bold text-slate-800 leading-snug">
                              {ccq.questionEs}
                            </p>
                            <p className="text-[11px] font-extrabold text-emerald-800">
                              → ({ccq.expectedAnswer})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tarjeta 2: Alerta Fonética (Hispano-Hablantes) + Acceso Directo al Espejo Articulatorio */}
                    <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/90 space-y-2 shadow-2xs">
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>⚠️ Alerta Fonética (Hispano-Hablantes):</span>
                      </h3>

                      <p className="text-[11px] font-medium text-slate-800 leading-snug">
                        {activeCeltaGuide.spanishInterference.wrongHabitEs}{' '}
                        <strong className="text-slate-900">
                          {activeCeltaGuide.spanishInterference.correctArticulationEs}
                        </strong>
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMirrorId(
                            activeCeltaGuide.spanishInterference.mirrorId
                          );
                          setSpeakingSubView('mirror');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>👄 Ver Espejo Articulatorio</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CONTENIDO DE LA MACRO-HABILIDAD 2: LISTENING, 40 SEMANAS & MENTORES 3D (PANTALLA HÍBRIDA 3)
            ===================================================================== */}
        {activeMacroTab === 'listening' && (
          <div className="space-y-4 animate-fade-in">
            {/* SECCIÓN SUPERIOR: Malla Curricular Visual de 40 Semanas (Listo para usar en 1 Clic) */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border shadow-sm space-y-3.5 ${
                isLightMode
                  ? 'bg-white border-slate-200/90 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Malla Curricular Visual de 40 Semanas (Listo para usar en 1 Clic)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Organizada por certificaciones oficiales. Pulsa cualquier semana para cargar su diálogo, audio y karaoke en el pizarrón.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFull40WeekExplorer(!showFull40WeekExplorer)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {showFull40WeekExplorer
                      ? 'Ver Vista Compacta por Etapas'
                      : 'Buscar en las 160 Lecciones Detalladas'}
                  </span>
                </button>
              </div>

              {!showFull40WeekExplorer ? (
                /* 4 Columnas de Etapas Oficiales (Adaptadas a Cambridge ESL o DELF FLE) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    {
                      stageTitle:
                        activeLesson.language === 'fr'
                          ? 'Étape 1: DELF Prim / A1'
                          : 'Etapa 1: A1 Movers',
                      subLabel: '(Sem 1–10 · CENNI 3–4)',
                      weeks: stage1Weeks.slice(0, 2),
                      highlightFirst: true,
                    },
                    {
                      stageTitle:
                        activeLesson.language === 'fr'
                          ? 'Étape 2: DELF A2 Scolaire'
                          : 'Etapa 2: A2 Key',
                      subLabel: '(Sem 11–20 · CENNI 5–7)',
                      weeks: stage2Weeks.slice(0, 2),
                      highlightFirst: false,
                    },
                    {
                      stageTitle:
                        activeLesson.language === 'fr'
                          ? 'Étape 3: DELF B1 Junior'
                          : 'Etapa 3: B1 Preliminary',
                      subLabel: '(Sem 21–30 · CENNI 8–10)',
                      weeks: stage3Weeks.slice(0, 2),
                      highlightFirst: false,
                    },
                    {
                      stageTitle:
                        activeLesson.language === 'fr'
                          ? 'Étape 4: DELF B2 Tout Public'
                          : 'Etapa 4: B2 First',
                      subLabel: '(Sem 31–40 · CENNI 11–13)',
                      weeks: stage4Weeks.slice(0, 2),
                      highlightFirst: false,
                    },
                  ].map((col, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-2xl bg-[#F8F6F0] border border-slate-200/90 space-y-2.5"
                    >
                      <div className="text-center pb-1.5 border-b border-slate-200/80">
                        <h3 className="text-xs sm:text-sm font-black text-slate-900">
                          {col.stageTitle}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-600">
                          {col.subLabel}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {col.weeks.map((w, wIdx) => {
                          const isFeatured = col.highlightFirst && wIdx === 0;
                          const cleanTitle = w.title
                            .replace(/^Week \d+:\s*/, '')
                            .replace(/^Semaine \d+:\s*/, '');
                          return (
                            <div
                              key={w.weekNumber}
                              className={`p-2.5 rounded-2xl transition-all space-y-1.5 ${
                                isFeatured
                                  ? 'bg-white border-2 border-blue-600 shadow-md'
                                  : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-black text-slate-900 leading-snug">
                                  Semana {w.weekNumber}: {cleanTitle}
                                </span>
                              </div>

                              {isFeatured && (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                                  Lista para hoy
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleLoadWeekIntoWorkshop(w)}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Abrir Diálogo, Audio y Ejercicios</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Explorador Completo de las 40 Semanas con Buscador */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={curriculumSearch}
                      onChange={(e) => setCurriculumSearch(e.target.value)}
                      placeholder="Buscar por semana, tema o nivel (A1, A2, B1, B2)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {filteredCurriculumWeeks.map((week) => {
                      const cleanTitle = week.title
                        .replace(/^Week \d+:\s*/, '')
                        .replace(/^Semaine \d+:\s*/, '');
                      return (
                        <div
                          key={week.weekNumber}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs font-black text-indigo-600">
                              <span>Semana {week.weekNumber}</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                                {week.cefr}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-1">
                              {cleanTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {week.pda}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLoadWeekIntoWorkshop(week)}
                            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer"
                          >
                            Cargar Semana {week.weekNumber} en Clase →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN INFERIOR: Galería de Mentores e Inmersión Histórica 3D en 1ª Persona (60 FPS) */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
                isLightMode
                  ? 'bg-white border-slate-200/90 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Galería de Mentores e Inmersión Histórica 3D en 1ª Persona (60 FPS ·{' '}
                  {activeLesson.language === 'fr' ? '🇫🇷 Francés FLE' : '🇬🇧 Inglés ESL'})
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Selecciona un mentor pedagógico o un personaje histórico en primera persona para proyectar al frente del aula.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {galleryMentors3D.map((card) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 text-center"
                  >
                    <div className="space-y-2.5">
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900">{card.name}</h3>
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-snug">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          playUniversalIskoolVoice({
                            text: card.sampleText,
                            characterName: card.name,
                            voiceId: card.voiceId,
                            language: card.language,
                            gender: card.gender,
                            rate: 0.88,
                          })
                        }
                        className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                        <span>Escuchar Voz</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (card.targetLessonId) {
                            const found = cleanLessons.find(
                              (l) => l.id === card.targetLessonId
                            );
                            if (found) {
                              setActiveLessonId(found.id);
                              setUseHistoricalFigure(Boolean(found.historicalFigureId));
                              setSelectedHistoricalId(found.historicalFigureId || '');
                              setSelectedKaraokeIndex(0);
                              triggerToast(`✓ ${card.name} activo: "${found.title}"`);
                              setActiveMacroTab('speaking');
                              setSpeakingSubView('studio');
                              return;
                            }
                          }
                          if (card.isHistorical) {
                            const fig = MULTILINGUAL_HISTORICAL_FIGURES.find(
                              (f) => f.id === card.id
                            );
                            if (fig) {
                              handleApplyHistoricalFigure(fig);
                            }
                          }
                          setActiveMacroTab('speaking');
                          setSpeakingSubView('studio');
                        }}
                        className="py-2 px-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>🎬 Usar Ahora</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            CONTENIDO DE LA MACRO-HABILIDAD 3: WRITING & RÚBRICA ESTRELLAS (PANTALLA HÍBRIDA 5)
            ===================================================================== */}
        {activeMacroTab === 'writing' && (
          <HybridWritingStarStudio
            language={activeLesson.language}
            level={activeLesson.level}
            isLightMode={isLightMode}
            onPlayAudio={(txt, rate) => handlePlayAudioSample(txt, undefined, rate)}
            onTriggerToast={triggerToast}
          />
        )}

        {/* =====================================================================
            CONTENIDO DE LA MACRO-HABILIDAD 4: SEMÁFORO DEL GRUPO & CENNI (PANTALLA HÍBRIDA 6)
            ===================================================================== */}
        {activeMacroTab === 'traffic_light' && (
          <TrafficLightDifferentiatedView
            lesson={activeLesson}
            campusName={selectedCampus.name}
            cenniLabel={activeCertification.cenni}
            studentReports={studentReports}
            onMarkReviewed={markReportAsReviewed}
            onPlayAudio={(txt, rate) => handlePlayAudioSample(txt, undefined, rate)}
            onTriggerToast={triggerToast}
            isLightMode={isLightMode}
          />
        )}

        {/* =====================================================================
            MODALES INTERACTIVOS DE AULA:
            - PANTALLA HÍBRIDA 2: MODO PIZARRÓN INTERACTIVO (36pt + CRONÓMETRO PAREJAS)
            - PANTALLA HÍBRIDA 7: CONTROL REMOTO DE BOLSILLO POR QR
            ===================================================================== */}
        <ClassroomBoardModal
          isOpen={isBoardModalOpen}
          onClose={() => setIsBoardModalOpen(false)}
          lesson={activeLesson}
          avatarSrc={resolvedAvatar3dSrc}
          celtaGuide={activeCeltaGuide}
          isPlayingAudio={isPlayingPreview || Boolean(activePlayingLineId)}
          onPlayLineAudio={(txt, rate) => handlePlayAudioSample(txt, undefined, rate)}
          initialPairTimerRunning={boardStartTimer}
        />

        <PocketRemoteQrModal
          isOpen={isPocketRemoteOpen}
          onClose={() => setIsPocketRemoteOpen(false)}
          lesson={activeLesson}
          avatarSrc={resolvedAvatar3dSrc}
          celtaGuide={activeCeltaGuide}
          isPlayingAudio={isPlayingPreview || Boolean(activePlayingLineId)}
          activeTeacherAccount={activeTeacherQrAccount}
          availableTeacherAccounts={availableTeacherAccounts}
          onSelectTeacherAccount={(teacher) => setSelectedTeacherQrId(teacher.id)}
          onPlayLineAudio={(txt, rate) => handlePlayAudioSample(txt, undefined, rate)}
          onLaunchBoardWithTimer={() => {
            setBoardStartTimer(true);
            setIsBoardModalOpen(true);
          }}
          onTriggerGesture={(gesture) => setActiveAvatarGesture(gesture)}
        />

        {/* Modal de Confirmación de Eliminación de Lección */}
        {lessonToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    ¿Eliminar lección del catálogo?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Esta acción removerá la lección seleccionada.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLessonToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeDeleteLesson}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md"
                >
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación Toast Flotante */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
