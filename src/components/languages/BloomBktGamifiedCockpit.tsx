"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  Volume2,
  Mic,
  BookOpen,
  Zap,
  Play,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Layers,
  Target,
  Activity,
  Brain,
  Compass,
  PenTool,
  Users,
  Lock,
  Unlock,
  Star,
  HelpCircle,
  AlertTriangle,
  FileCode2,
  Sliders,
  Send,
  GraduationCap,
  Check,
  RefreshCw,
  ChevronRight,
  Radio
} from 'lucide-react';
import {
  useLanguagesStore,
  LanguageCode,
  KaraokePhrase
} from '@/store/useLanguagesStore';
import { HumanGesticulatingAvatar } from '@/components/languages/HumanGesticulatingAvatar';
import { LanguageKaraokePlayer } from '@/components/languages/LanguageKaraokePlayer';
import { HardwareAudioTester } from '@/components/languages/HardwareAudioTester';
import {
  playUniversalIskoolVoice,
  stopAllIskoolAudio,
  MULTILINGUAL_HISTORICAL_FIGURES
} from '@/lib/historicalVoiceEngine';
import {
  BLOOM_REVISED_TAXONOMY_LEVELS,
  SAGITTAL_VOCAL_TRACT_TARGETS,
  CLASSROOM_COHORT_STUDENTS,
  SOCRATIC_HINT_COINS,
  L1_INTERFERENCE_DETECTORS,
  OFFICIAL_WRITING_RUBRICS,
  ARCHITECTURE_12_PHASES_NODES,
  IDENTIFIABLE_LANGUAGE_SKILLS,
  INTERNATIONAL_BENCHMARK_AUDITS,
  CONTINUOUS_METHODOLOGY_STAGES,
  updateBktMasteryProbability,
  computeSepCenniProjection,
  getEnriched40WeekMatrix,
  type BloomTaxonomyLevelSpec,
  type SagittalVocalTractSpec,
  type StudentBktProfile
} from '@/components/languages/data/bloomBktMasteryEngine';
import { CurricularWeek, CurricularLesson } from '@/components/languages/data/curriculumTypes';

export type SurgicalScreenId =
  | 'master'
  | 'p1_hub'
  | 'p2_matrix'
  | 'p3_dsp'
  | 'p4_avatar'
  | 'p5_writing'
  | 'p6_bkt'
  | 'p7_audit';

interface BloomBktGamifiedCockpitProps {
  role: 'student' | 'teacher';
  activeLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onLoadWeekLessonToWorkshop?: (week: CurricularWeek, lesson: CurricularLesson) => void;
  onNavigateLegacyTab?: (tab: string) => void;
}

export const BloomBktGamifiedCockpit: React.FC<BloomBktGamifiedCockpitProps> = ({
  role,
  activeLanguage: externalLanguage,
  onLanguageChange,
  onLoadWeekLessonToWorkshop,
  onNavigateLegacyTab,
}) => {
  const { lessons, activeLessonId, setActiveLessonId, updateLesson } = useLanguagesStore();

  const activeLesson = useMemo(() => {
    return lessons.find((l) => l.id === activeLessonId) || lessons[0];
  }, [lessons, activeLessonId]);

  const [internalLang, setInternalLang] = useState<LanguageCode>(
    externalLanguage || activeLesson?.language || 'en'
  );
  const currentLang: LanguageCode = externalLanguage || internalLang;
  const isFrench = currentLang === 'fr';

  const handleSwitchLanguage = (lang: LanguageCode) => {
    stopAllIskoolAudio();
    setInternalLang(lang);
    onLanguageChange?.(lang);
    const matchingLesson = lessons.find((l) => l.language === lang);
    if (matchingLesson) {
      setActiveLessonId(matchingLesson.id);
    } else if (activeLesson) {
      updateLesson(activeLesson.id, {
        language: lang,
        avatarName: lang === 'fr' ? 'Sophie' : 'Claire',
        avatarVoice: lang === 'fr' ? 'fr-FR-DeniseNeural' : 'en-US-JennyNeural',
      });
    }
  };

  // Navegación entre las 8 Vistas Quirúrgicas (Cabina Maestra + 7 Pantallas Especializadas)
  const [activeScreen, setActiveScreen] = useState<SurgicalScreenId>('master');
  const [roleViewOverride, setRoleViewOverride] = useState<'student' | 'teacher'>(role);

  // Estado Gamificado & Cognitivo (Taxonomía de Bloom + 40 Semanas + BKT)
  const [selectedBloomLevel, setSelectedBloomLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(6);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([1, 2, 3, 4, 5]);
  const [openedChests, setOpenedChests] = useState<number[]>([5]);
  const [xpTotal, setXpTotal] = useState<number>(3480);
  const [socraticCoinsBalance, setSocraticCoinsBalance] = useState<number>(9);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [karaokeCombo, setKaraokeCombo] = useState<number>(4);
  const [active5EStageIdx, setActive5EStageIdx] = useState<number>(2);

  // Estado BKT de las 6 Macro-Competencias (0.0 - 1.0)
  const [macroMastery, setMacroMastery] = useState<
    Record<'FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED', number>
  >({
    FON: 0.84,
    CO: 0.88,
    PO: 0.82,
    CE: 0.91,
    PE: 0.79,
    MED: 0.85,
  });

  // Estado de Audio / Voz en Vivo y Mentores 3D a 60 FPS
  const [selectedMentorId, setSelectedMentorId] = useState<string>(
    isFrench ? 'marie_curie' : 'abraham_lincoln'
  );
  const [isSpeakingLive, setIsSpeakingLive] = useState<boolean>(false);
  const [activeSpokenText, setActiveSpokenText] = useState<string>('');
  const [studentOralResponseText, setStudentOralResponseText] = useState<string>('');
  const [sttPercentage, setSttPercentage] = useState<number>(92);

  // Estado del Laboratorio DSP & Corte Sagital F1/F2/F3
  const phoneticTargetsForLang = useMemo(
    () => SAGITTAL_VOCAL_TRACT_TARGETS.filter((t) => t.language === currentLang),
    [currentLang]
  );
  const [selectedPhoneticId, setSelectedPhoneticId] = useState<string>('en_schwa');
  const activePhoneticSpec: SagittalVocalTractSpec = useMemo(() => {
    return (
      phoneticTargetsForLang.find((t) => t.id === selectedPhoneticId) ||
      phoneticTargetsForLang[0] ||
      SAGITTAL_VOCAL_TRACT_TARGETS[0]
    );
  }, [phoneticTargetsForLang, selectedPhoneticId]);

  const [showHardwareCalibrator, setShowHardwareCalibrator] = useState<boolean>(false);
  const [activeKaraokeIndex, setActiveKaraokeIndex] = useState<number>(0);

  // Estado del Writing Engine Socrático (0% Ghostwriting + 3 Monedas + Detector L1->L2)
  const [writingDraft, setWritingDraft] = useState<string>(
    isFrench
      ? "D'une part, la recherche scientifique de Marie Curie démontre que la persévérance transforme la société. En revanche, il convient de formuler un cadre éthique pour chaque découverte."
      : 'Furthermore, Abraham Lincoln demonstrated at Gettysburg that civic unity requires shared sacrifice. Consequently, we must formulate ethical solutions that protect human dignity.'
  );
  const [unlockedCoinNumbers, setUnlockedCoinNumbers] = useState<number[]>([1]);

  // Estado Docente: Alumno seleccionado en la cohorte y despacho de Misiones Relámpago
  const [selectedCohortStudentId, setSelectedCohortStudentId] = useState<string>('stu-sofia-01');
  const [dispatchedQuestsLog, setDispatchedQuestsLog] = useState<string[]>([
    'Misión Relámpago DSP (/θ/ vs /ð/ · Bloom Nivel 3) enviada a Diego Emiliano Santillán',
  ]);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 4200);
  };

  // Datos Enriquecidos de la Malla de 40 Semanas y Proyección Oficial SEP/CENNI
  const enrichedWeeks = useMemo(
    () => getEnriched40WeekMatrix(currentLang, selectedWeekNumber, completedWeeks),
    [currentLang, selectedWeekNumber, completedWeeks]
  );

  const currentEnrichedWeek = useMemo(
    () => enrichedWeeks.find((w) => w.week.weekNumber === selectedWeekNumber) || enrichedWeeks[0],
    [enrichedWeeks, selectedWeekNumber]
  );

  const activeBloomSpec: BloomTaxonomyLevelSpec = useMemo(
    () =>
      BLOOM_REVISED_TAXONOMY_LEVELS.find((b) => b.level === selectedBloomLevel) ||
      BLOOM_REVISED_TAXONOMY_LEVELS[2],
    [selectedBloomLevel]
  );

  const sepCenniProjection = useMemo(
    () => computeSepCenniProjection(macroMastery),
    [macroMastery]
  );

  const selectedCohortStudent: StudentBktProfile = useMemo(
    () =>
      CLASSROOM_COHORT_STUDENTS.find((s) => s.id === selectedCohortStudentId) ||
      CLASSROOM_COHORT_STUDENTS[0],
    [selectedCohortStudentId]
  );

  // Mentores 3D y Próceres en 1ª Persona filtrados por idioma
  const allMentorsForLang = useMemo(() => {
    const historicals = MULTILINGUAL_HISTORICAL_FIGURES.filter((f) => f.language === currentLang);
    const pedagogicalMentors =
      currentLang === 'fr'
        ? [
            {
              id: 'claire',
              name: 'Mme. Sophie (Coach Accional DELF)',
              language: 'fr' as const,
              gender: 'female' as const,
              voiceId: 'fr-FR-DeniseNeural',
              speechRate: 0.96,
              speechPitch: 1.0,
              era: 'Alliance & FEI DELF/DALF Studio',
              country: 'France',
              avatarEmoji: '🎓',
              avatarImage: '/images/languages/3d/mentor_female_3d.webp',
              canonicalIntro:
                "Bonjour ! Je suis Sophie, votre mentore de français. Aujourd'hui, nous allons pratiquer les voyelles nasales et les liaisons obligatoires en situation réelle.",
              pdaRelevance: 'Enfoque accional CECR, fonética articulatoria y preparación DELF/DALF.',
              sampleQuestions: [
                'Comment réussir la production orale du DELF B1 ?',
                'Quelle est la différence acoustique entre « tu » et « tout » ?',
              ],
            },
          ]
        : [
            {
              id: 'claire',
              name: 'Prof. Claire (Cambridge CLT Mentor)',
              language: 'en' as const,
              gender: 'female' as const,
              voiceId: 'en-US-JennyNeural',
              speechRate: 0.96,
              speechPitch: 1.0,
              era: 'Cambridge & CELTA Immersion Studio',
              country: 'United Kingdom / USA',
              avatarEmoji: '🎓',
              avatarImage: '/images/languages/3d/mentor_female_3d.webp',
              canonicalIntro:
                'Hello! I am Professor Claire. In our session today, I will guide you through inductive grammar discovery and real-time phonetic articulation.',
              pdaRelevance: 'Inmersión comunicativa CELTA/DELTA, reducción Schwa /ə/ y fluidez natural.',
              sampleQuestions: [
                'How can I master the Schwa /ə/ sound in connected speech?',
                'What strategies unlock a high score in Cambridge B2 First?',
              ],
            },
            {
              id: 'arthur',
              name: 'Prof. Arthur (Academic Phonetics Coach)',
              language: 'en' as const,
              gender: 'male' as const,
              voiceId: 'en-US-GuyNeural',
              speechRate: 0.95,
              speechPitch: 0.98,
              era: 'Acoustic Formant & Debate Lab',
              country: 'United Kingdom / USA',
              avatarEmoji: '🎙️',
              avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
              canonicalIntro:
                'Greetings! I am Professor Arthur. Together we will calibrate your vocal tract formants and build rigorous academic arguments.',
              pdaRelevance: 'Condicionamiento neuromuscular articulatorio y debate estructurado.',
              sampleQuestions: [
                'How do I distinguish minimal pairs /ɪ/ and /iː/?',
                'How do I structure an evaluative paragraph at Bloom Level 5?',
              ],
            },
          ];
    return [...pedagogicalMentors, ...historicals];
  }, [currentLang]);

  const activeMentor = useMemo(() => {
    return (
      allMentorsForLang.find((m) => m.id === selectedMentorId) ||
      allMentorsForLang[0]
    );
  }, [allMentorsForLang, selectedMentorId]);

  // Reproducción de voz real en 1ª persona con lip-sync a 60 FPS
  const handleSpeakText = async (textToSpeak: string, customSpeaker?: typeof activeMentor) => {
    const speaker = customSpeaker || activeMentor;
    if (!textToSpeak) return;

    if (isSpeakingLive && activeSpokenText === textToSpeak) {
      stopAllIskoolAudio();
      setIsSpeakingLive(false);
      setActiveSpokenText('');
      return;
    }

    stopAllIskoolAudio();
    setIsSpeakingLive(true);
    setActiveSpokenText(textToSpeak);

    try {
      await playUniversalIskoolVoice({
        text: textToSpeak,
        characterName: speaker.name,
        voiceId: speaker.voiceId,
        language: speaker.language,
        gender: speaker.gender,
        rate: speaker.speechRate || 0.96,
        onStart: () => {
          setIsSpeakingLive(true);
        },
        onEnd: () => {
          setIsSpeakingLive(false);
        },
        onError: () => {
          setIsSpeakingLive(false);
        },
      });
    } catch {
      setIsSpeakingLive(false);
    }
  };

  // Actualización real de dominio BKT y XP multiplicado por Taxonomía de Bloom
  const handleRecordMasteryEvidence = (
    skillKey: 'FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED',
    isSuccess: boolean,
    labelEs: string
  ) => {
    const nextProb = updateBktMasteryProbability(
      macroMastery[skillKey],
      isSuccess,
      selectedBloomLevel
    );
    setMacroMastery((prev) => ({
      ...prev,
      [skillKey]: nextProb,
    }));

    const earnedXp = Math.round(activeBloomSpec.baseXpReward * activeBloomSpec.xpMultiplier);
    if (isSuccess) {
      setXpTotal((prev) => prev + earnedXp);
    }

    showToast(
      `✓ ${labelEs} · BKT [${skillKey}] actualizado a ${Math.round(nextProb * 100)}% (+${earnedXp} XP · Bloom x${activeBloomSpec.xpMultiplier})`
    );
  };

  // Análisis en vivo del borrador en el Writing Engine Socrático (0% IA Ghostwriting)
  const writingAnalysis = useMemo(() => {
    const words = writingDraft.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detectar verbos cognitivos de Bloom usados en el texto
    const lowerDraft = writingDraft.toLowerCase();
    const detectedBloomVerbs: { verb: string; level: number; tier: string }[] = [];
    BLOOM_REVISED_TAXONOMY_LEVELS.forEach((b) => {
      b.actionVerbs[currentLang].forEach((v) => {
        if (lowerDraft.includes(v.toLowerCase().slice(0, Math.max(4, v.length - 2)))) {
          detectedBloomVerbs.push({ verb: v, level: b.level, tier: b.tier });
        }
      });
    });

    // Detectar interferencias L1->L2 y falsos amigos
    const l1Alerts = L1_INTERFERENCE_DETECTORS.filter(
      (d) => d.language === currentLang && d.patternRegex.test(writingDraft)
    );

    // Calcular puntaje analítico en vivo (Cambridge 0-20 / DELF 0-25)
    const maxScale = isFrench ? 25 : 20;
    const perCriterionMax = isFrench ? 6.25 : 5;
    const lengthFactor = Math.min(1, wordCount / 28);
    const verbBonus = Math.min(1, 0.65 + detectedBloomVerbs.length * 0.12);
    const penalty = l1Alerts.length * 0.08;

    const criteriaScores = OFFICIAL_WRITING_RUBRICS[currentLang].map((crit, idx) => {
      const rawRatio = Math.max(
        0.55,
        Math.min(0.98, lengthFactor * 0.45 + verbBonus * 0.52 - penalty + idx * 0.02)
      );
      const score = Number((rawRatio * perCriterionMax).toFixed(1));
      return {
        ...crit,
        score,
      };
    });

    const totalScore = Number(
      Math.min(maxScale, criteriaScores.reduce((acc, c) => acc + c.score, 0)).toFixed(1)
    );

    return {
      wordCount,
      detectedBloomVerbs,
      l1Alerts,
      criteriaScores,
      totalScore,
      maxScale,
    };
  }, [writingDraft, currentLang, isFrench]);

  // Cálculo del Polígono SVG del Radar Hexagonal BKT (6 Vértices)
  const radarGeometry = useMemo(() => {
    const keys: ('FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED')[] = [
      'FON',
      'CO',
      'PO',
      'CE',
      'PE',
      'MED',
    ];
    const size = 250;
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 36;

    const getPoint = (idx: number, ratio: number) => {
      const angle = ((Math.PI * 2) / 6) * idx - Math.PI / 2;
      return {
        x: cx + r * ratio * Math.cos(angle),
        y: cy + r * ratio * Math.sin(angle),
      };
    };

    const studentPoints = keys
      .map((k, idx) => {
        const pt = getPoint(idx, macroMastery[k] || 0.75);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    const targetPoints = keys
      .map((_, idx) => {
        const pt = getPoint(idx, 0.85);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    const vertices = keys.map((k, idx) => {
      const labelPt = getPoint(idx, 1.18);
      const dotPt = getPoint(idx, macroMastery[k] || 0.75);
      return {
        key: k,
        pct: Math.round((macroMastery[k] || 0.75) * 100),
        labelX: labelPt.x,
        labelY: labelPt.y,
        dotX: dotPt.x,
        dotY: dotPt.y,
      };
    });

    return { size, cx, cy, r, getPoint, studentPoints, targetPoints, vertices };
  }, [macroMastery]);

  // Frases de Karaoke para la semana seleccionada
  const activeWeekKaraokePhrases: KaraokePhrase[] = useMemo(() => {
    return currentEnrichedWeek.week.lessons.map((les, idx) => ({
      id: les.id || `wk-${selectedWeekNumber}-${idx}`,
      targetText: les.target,
      translationEs: les.translationEs,
      difficulty:
        currentEnrichedWeek.week.cefr.startsWith('B')
          ? 'advanced'
          : currentEnrichedWeek.week.cefr.startsWith('A2')
          ? 'intermediate'
          : 'beginner',
      phoneticGuide: les.phoneticTip,
    }));
  }, [currentEnrichedWeek, selectedWeekNumber]);

  const screenTabs: {
    id: SurgicalScreenId;
    shortLabel: string;
    title: string;
    badge: string;
    emblem: string;
  }[] = [
    {
      id: 'master',
      shortLabel: 'Cabina Maestra',
      title: 'Matriz 40S · Bloom · Radar BKT · CENNI',
      badge: 'VISTA INTEGRAL',
      emblem: '/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp',
    },
    {
      id: 'p1_hub',
      shortLabel: 'P1 · Hub & 12 Fases',
      title: '12 Fases Arquitectónicas & Ciclo 5E (55m)',
      badge: '258 NODOS DAG',
      emblem: '/images/languages/nanobanana-gamified/nb_bkt_hexagon_crystal.webp',
    },
    {
      id: 'p2_matrix',
      shortLabel: 'P2 · Malla 40 Sem & Bóveda',
      title: 'Espiral 40 Semanas (160 Lec) · Cofres & YAML',
      badge: 'VAULT-FIRST',
      emblem: '/images/languages/nanobanana-gamified/nb_spiral_treasure_chest.webp',
    },
    {
      id: 'p3_dsp',
      shortLabel: 'P3 · Estudio Karaoke & Voz 60 FPS',
      title: 'Karaoke Neuromuscular >80% · Avatar 60 FPS & Guía Vocal',
      badge: 'COMBO DSP',
      emblem: '/images/languages/nanobanana-gamified/nb_dsp_acoustic_shield.webp',
    },
    {
      id: 'p4_avatar',
      shortLabel: 'P4 · Avatares 60 FPS (1ª Persona)',
      title: 'Mentores 3D & Próceres en 1ª Persona · 100% STT',
      badge: '60 FPS VIVO',
      emblem: activeMentor.avatarImage,
    },
    {
      id: 'p5_writing',
      shortLabel: 'P5 · Writing Socrático 0% IA',
      title: '3 Monedas Doradas · Detector L1→L2 · Cambridge/DELF',
      badge: 'BLOOM NIVEL 6',
      emblem: '/images/languages/nanobanana-gamified/nb_socratic_gold_coin.webp',
    },
    {
      id: 'p6_bkt',
      shortLabel: 'P6 · 36 Insignias BKT & CENNI',
      title: '36 Micro-Habilidades · Boleta SEP · Liga de Aula',
      badge: 'CENNI 1–20',
      emblem: '/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp',
    },
    {
      id: 'p7_audit',
      shortLabel: 'P7 · Auditoría 6 Instituciones',
      title: 'Benchmark Global CEFR 2020 & Sync Zero-PII',
      badge: 'ESTÁNDAR MUNDIAL',
      emblem: '/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp',
    },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] text-slate-900 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-5 sm:space-y-6 p-3 sm:p-5 lg:p-7">
      {/* Notificación Flotante de Recompensa / Evidencia BKT */}
      {toastBanner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 z-50 sm:max-w-md bg-slate-900 text-white px-4 sm:px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-3 animate-bounce">
          <img
            src="/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp"
            alt="Emblema Bloom"
            className="w-9 h-9 rounded-xl object-cover bg-white p-0.5 shrink-0"
          />
          <div className="text-xs font-extrabold leading-snug">{toastBanner}</div>
        </div>
      )}

      {/* =====================================================================
          BARRA SUPERIOR MAESTRA: MARCA BLANCA + HUD GAMIFICADO NANO BANANA 2.1
          ===================================================================== */}
      <div className="bg-gradient-to-r from-[#FFFFFF] via-[#F8FAFC] to-[#FFFFFF] rounded-3xl border-2 border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Identidad del Ecosistema */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-amber-300 shadow-md p-1 flex items-center justify-center shrink-0">
              <img
                src="/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp"
                alt="Corona Cognitiva Bloom Nano Banana 2.1"
                className="w-full h-full object-contain"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[9px] shadow">
                60 FPS
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                  NANO BANANA 2.1 · CABINA COGNITIVA BLOOM-BKT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  {sepCenniProjection.cefrBand} · {sepCenniProjection.cenniBandLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  Racha: {streakDays} Días
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {isFrench
                  ? 'Centre de Langues & Neuro-Phonétique : Matrice Spirale 40 Semaines & Bloom-BKT'
                  : 'Centro de Idiomas & Fonética Avanzada: Matriz 40 Semanas & Cabina Bloom-BKT'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isFrench
                  ? 'Synthèse Alliance Française (DELF/DALF), Méthode Directe, Phonétique Sagittale 60 FPS, Taxonomie de Bloom (LOTS→HOTS) & Radar BKT.'
                  : 'Síntesis Cambridge One, The Anglo CELTA/DELTA, Inmersión Directa 1ª Persona a 60 FPS, Taxonomía de Bloom (x1.0→x3.0 XP) y Radar Hexagonal BKT.'}
              </p>
            </div>
          </div>

          {/* Selector Simétrico Bilingüe (Inglés ESL / Francés FLE) + Selector de Rol */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchLanguage('en')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span className="text-base leading-none">🇬🇧</span>
                <span>Inglés (ESL/EFL)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage('fr')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  currentLang === 'fr'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span className="text-base leading-none">🇫🇷</span>
                <span>Francés (FLE)</span>
              </button>
            </div>

            {role === 'teacher' && (
              <div className="flex items-center bg-amber-50 p-1 rounded-2xl border border-amber-200">
                <button
                  type="button"
                  onClick={() => setRoleViewOverride('teacher')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                    roleViewOverride === 'teacher'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  👨‍🏫 Lente Docente Forense
                </button>
                <button
                  type="button"
                  onClick={() => setRoleViewOverride('student')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                    roleViewOverride === 'student'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  🎮 Lente Alumno Gamificado
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            6 TARJETAS DE EMBLEMAS 3D NANO BANANA 2.1 (SIN CORTE NI SALTO DE LÍNEA)
            =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Nivel Cognitivo Bloom */}
          <div
            onClick={() => setActiveScreen('master')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Escalón Bloom
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp"
                alt="Corona Bloom"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-indigo-950 truncate">
              {activeBloomSpec.level}. {activeBloomSpec.nameEs}
            </div>
            <div className="text-[10px] font-extrabold text-amber-600 truncate mt-0.5">
              Multiplicador x{activeBloomSpec.xpMultiplier} XP
            </div>
          </div>

          {/* 2. XP Acumulado & Monedas Socráticas */}
          <div
            onClick={() => setActiveScreen('p5_writing')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Tesoro Socrático
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_socratic_gold_coin.webp"
                alt="Moneda Socrática"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 font-mono truncate">
              {xpTotal.toLocaleString()} XP
            </div>
            <div className="text-[10px] font-extrabold text-amber-700 truncate mt-0.5">
              {socraticCoinsBalance} Monedas 0% IA
            </div>
          </div>

          {/* 3. Cofres & Malla 40 Semanas */}
          <div
            onClick={() => setActiveScreen('p2_matrix')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Malla en Espiral
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_spiral_treasure_chest.webp"
                alt="Cofre 40 Semanas"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
              Semana {selectedWeekNumber} / 40
            </div>
            <div className="text-[10px] font-extrabold text-blue-700 truncate mt-0.5">
              {completedWeeks.length * 4} / 160 Lecciones
            </div>
          </div>

          {/* 4. Escudo Acústico DSP >80% */}
          <div
            onClick={() => setActiveScreen('p3_dsp')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Combo Acústico
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_dsp_acoustic_shield.webp"
                alt="Escudo DSP"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-800 font-mono truncate">
              {Math.round(macroMastery.FON * 100)}% · Combo x{karaokeCombo}
            </div>
            <div className="text-[10px] font-extrabold text-emerald-600 truncate mt-0.5">
              Meta &gt;80% Activa
            </div>
          </div>

          {/* 5. Cristal Hexagonal BKT 36 Micro-Habilidades */}
          <div
            onClick={() => setActiveScreen('p6_bkt')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Radar BKT
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_bkt_hexagon_crystal.webp"
                alt="Cristal BKT"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-indigo-900 font-mono truncate">
              {sepCenniProjection.averageBktPct}% Global
            </div>
            <div className="text-[10px] font-extrabold text-indigo-600 truncate mt-0.5">
              {sepCenniProjection.unlockedMicroBadgesCount}/36 Insignias
            </div>
          </div>

          {/* 6. Medalla Oficial CENNI / Boleta SEP */}
          <div
            onClick={() => setActiveScreen('p6_bkt')}
            className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                Boleta SEP / CENNI
              </span>
              <img
                src="/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp"
                alt="Medalla CENNI SEP"
                className="w-7 h-7 object-contain shrink-0"
              />
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-800 font-mono truncate">
              SEP {sepCenniProjection.sepGrade10.toFixed(1)} / 10
            </div>
            <div className="text-[10px] font-extrabold text-amber-700 truncate mt-0.5">
              Nivel CENNI {sepCenniProjection.cenniBandNumeric}
            </div>
          </div>
        </div>

        {/* ===================================================================
            CINTA COMPACTA DEL CICLO CONTINUO 5E (55 MIN) × BLOOM
            =================================================================== */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/90">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                CICLO CONTINUO 5E · 55 MIN
              </span>
              <span className="text-xs font-extrabold text-slate-700">
                Ruta Neurolingüística Sincronizada con la Taxonomía de Bloom
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              100% Tiempo de Habla del Alumno (STT {sttPercentage}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
            {CONTINUOUS_METHODOLOGY_STAGES.map((stage, idx) => {
              const isSelected = active5EStageIdx === idx;
              const targetScreenMap: SurgicalScreenId[] = [
                'p3_dsp',
                'p4_avatar',
                'p3_dsp',
                'p5_writing',
                'p6_bkt',
              ];
              const conciseStageTitles = [
                '1. Despertar Acústico & Oído',
                '2. Inmersión 60 FPS (1ª Persona)',
                '3. Karaoke Neuromuscular (>80%)',
                '4. Escritura Socrática (0% IA)',
                '5. Certificación BKT & CENNI',
              ];
              const mappedBloomLabels = [
                'Bloom 1–2 (Recordar/Comprender)',
                'Bloom 2–3 (Comprender/Aplicar)',
                'Bloom 3–4 (Aplicar/Analizar)',
                'Bloom 5–6 (Evaluar/Crear x3.0)',
                'Auditoría BKT & Boleta SEP',
              ];

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setActive5EStageIdx(idx);
                    setActiveScreen(targetScreenMap[idx] || 'master');
                  }}
                  className={`text-left px-3 py-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                      : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Etapa {idx + 1} · {stage.durationMinutesPerSession}m
                    </span>
                    <span className="text-[10px] font-black text-emerald-700">
                      {stage.weightInContinuousScore}%
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 truncate">
                    {conciseStageTitles[idx] || stage.titleEs}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-700 truncate mt-0.5">
                    {mappedBloomLabels[idx]} →
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            NAVEGADOR DE LAS 8 PANTALLAS QUIRÚRGICAS (100% VISIBLES SIN RECORTE)
            =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {screenTabs.map((tab) => {
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScreen(tab.id)}
                className={`px-3 py-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={tab.emblem}
                  alt={tab.shortLabel}
                  className="w-8 h-8 rounded-xl object-cover bg-white p-0.5 border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black truncate">{tab.shortLabel}</span>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        isActive
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] block truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {tab.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VISTA 0 (MASTER): CABINA COGNITIVA INTEGRAL (MATRIZ 40S + BLOOM + BKT + CENNI)
          ===================================================================== */}
      {activeScreen === 'master' && (
        <div className="space-y-6">
          {/* Tri-Panel Quirúrgico Adaptativo: Celular (1 col) · Tableta (2 cols + 1 full) · Laptop/PC (3 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
            {/* PANEL IZQUIERDO: MATRIZ EN ESPIRAL DE 40 SEMANAS CON ESTRELLAS Y COFRES */}
            <div className="md:col-span-6 xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/languages/nanobanana-gamified/nb_spiral_treasure_chest.webp"
                      alt="Cofre 40 Semanas"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ESPIRAL CAMBRIDGE / DELF
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        Malla Curricular de 40 Semanas
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('p2_matrix')}
                    className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Ver 160 Lecciones →
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Selecciona cualquier semana de los 8 bloques para cargar sus 4 lecciones, abrir Cofres de Hito y sincronizar la Bóveda Curricular.
                </p>

                {/* Cuadrícula Compacta de las 40 Semanas (8 filas de 5 semanas) */}
                <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {enrichedWeeks.map((node) => {
                    const wNum = node.week.weekNumber;
                    const isSelected = wNum === selectedWeekNumber;
                    const isDone = node.status === 'mastered';
                    return (
                      <button
                        key={wNum}
                        type="button"
                        onClick={() => {
                          setSelectedWeekNumber(wNum);
                          setSelectedBloomLevel(node.dominantBloomLevel.level);
                        }}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105 z-10'
                            : isDone
                            ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase opacity-80">
                          S{wNum}
                        </span>
                        <span className="text-[10px] font-extrabold">
                          {node.week.cefr}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <span
                              key={s}
                              className={`text-[9px] leading-none ${
                                s <= node.starsEarned
                                  ? isSelected
                                    ? 'text-amber-300'
                                    : 'text-amber-500'
                                  : 'opacity-25'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {node.isMilestoneChestWeek && (
                          <span
                            className="absolute -top-1.5 -right-1.5 text-[10px]"
                            title={`Cofre de Hito · Bloque ${node.blockNumber}`}
                          >
                            🎁
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle de la Semana Activa Seleccionada */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                    Bloque {currentEnrichedWeek.blockNumber} · {currentEnrichedWeek.week.level}
                  </span>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {currentEnrichedWeek.dominantBloomLevel.nameEs} (x
                    {currentEnrichedWeek.dominantBloomLevel.xpMultiplier} XP)
                  </span>
                </div>
                <div className="text-xs font-black text-slate-900">
                  {currentEnrichedWeek.week.title}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  <strong>PDA SEP:</strong> {currentEnrichedWeek.week.pda}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const firstLesson = currentEnrichedWeek.week.lessons[0];
                      if (firstLesson) {
                        handleSpeakText(firstLesson.target);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar Meta 60 FPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('p3_dsp')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Practicar Karaoke</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL CENTRAL: ESCALERA COGNITIVA DE LA TAXONOMÍA DE BLOOM (6 NIVELES) */}
            <div className="md:col-span-6 xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp"
                      alt="Pirámide Bloom"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ANDERSON & KRATHWOHL · LOTS → HOTS
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        Escalera Cognitiva de Bloom
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                    x{activeBloomSpec.xpMultiplier} XP
                  </span>
                </div>

                {/* Los 6 Escalones Interactivos (De Nivel 6 Crear arriba a Nivel 1 Recordar abajo, o 1 a 6) */}
                <div className="space-y-2">
                  {BLOOM_REVISED_TAXONOMY_LEVELS.map((b) => {
                    const isSelected = b.level === selectedBloomLevel;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBloomLevel(b.level)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-50 via-white to-amber-50 border-2 border-indigo-600 shadow-md'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={b.nanoBananaEmblemPath}
                            alt={b.nameEs}
                            className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900">
                                {isFrench ? b.nameFr : b.nameEs}
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  b.tier === 'HOTS'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {b.tier}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {b.mapped5EDescriptionEs}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black font-mono text-indigo-700 block">
                            x{b.xpMultiplier.toFixed(1)} XP
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700">
                            +{ Math.round(b.baseXpReward * b.xpMultiplier) } XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tarjeta de Misión Cognitiva Activa según el Nivel de Bloom */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-900">
                    Verbos Meta ({activeBloomSpec.tier}):
                  </span>
                  <span className="text-[10px] font-black text-amber-800">
                    Recompensa: +{Math.round(activeBloomSpec.baseXpReward * activeBloomSpec.xpMultiplier)} XP
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeBloomSpec.actionVerbs[currentLang].map((verb) => (
                    <span
                      key={verb}
                      className="px-2 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-[10px] font-black"
                    >
                      {verb}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-slate-700 font-medium leading-snug">
                  <strong>Pregunta Detonadora Socrática:</strong>{' '}
                  {activeBloomSpec.socraticTriggerQuestion[currentLang]}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveScreen('p4_avatar')}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black cursor-pointer shadow-xs"
                  >
                    🗣️ Diálogo 1ª Persona
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('p5_writing')}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer shadow-xs"
                  >
                    ✍️ Writing Socrático
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO: RADAR HEXAGONAL BKT + SIMULADOR OFICIAL SEP / CENNI */}
            <div className="md:col-span-12 xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/languages/nanobanana-gamified/nb_bkt_hexagon_crystal.webp"
                      alt="Radar Hexagonal BKT"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        BAYESIAN KNOWLEDGE TRACING
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        Radar Hexagonal BKT & CENNI
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleRecordMasteryEvidence(
                        'PO',
                        true,
                        'Simulación de Evidencia Oral BKT'
                      )
                    }
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer shadow-2xs"
                    title="Actualizar probabilidad posterior BKT en vivo"
                  >
                    + Evidencia BKT
                  </button>
                </div>

                {/* Gráfico SVG del Radar Hexagonal BKT en Fondo Claro */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 p-2">
                  <svg
                    width={radarGeometry.size}
                    height={radarGeometry.size}
                    viewBox={`0 0 ${radarGeometry.size} ${radarGeometry.size}`}
                    className="w-full max-w-[250px] h-auto aspect-square overflow-visible"
                  >
                    {/* Anillos concéntricos */}
                    {[0.25, 0.5, 0.75, 1.0].map((level) => {
                      const pts = [0, 1, 2, 3, 4, 5]
                        .map((i) => {
                          const p = radarGeometry.getPoint(i, level);
                          return `${p.x},${p.y}`;
                        })
                        .join(' ');
                      return (
                        <polygon
                          key={level}
                          points={pts}
                          fill="none"
                          stroke="#CBD5E1"
                          strokeWidth="1"
                          strokeDasharray={level === 0.75 ? '3 3' : undefined}
                        />
                      );
                    })}

                    {/* Ejes desde el centro */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const p = radarGeometry.getPoint(i, 1.0);
                      return (
                        <line
                          key={i}
                          x1={radarGeometry.cx}
                          y1={radarGeometry.cy}
                          x2={p.x}
                          y2={p.y}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Polígono Meta Institucional (85%) */}
                    <polygon
                      points={radarGeometry.targetPoints}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Polígono Real BKT del Alumno */}
                    <polygon
                      points={radarGeometry.studentPoints}
                      fill="rgba(79, 70, 229, 0.24)"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                    />

                    {/* Vértices y Etiquetas de las 6 Macro-Competencias */}
                    {radarGeometry.vertices.map((v) => (
                      <g key={v.key}>
                        <circle
                          cx={v.dotX}
                          cy={v.dotY}
                          r={4.5}
                          fill="#4F46E5"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        <text
                          x={v.labelX}
                          y={v.labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[10px] font-black fill-slate-800"
                        >
                          [{v.key}] {v.pct}%
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Simulador Oficial Boleta SEP (5.0 - 10.0) & Certificación CENNI (1 - 20) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-indigo-50 border border-amber-300/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp"
                      alt="Medalla CENNI"
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-900 block">
                        SIMULADOR OFICIAL SEP / CENNI
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {sepCenniProjection.internationalCertTarget[currentLang]}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs font-black">
                    SEP {sepCenniProjection.sepGrade10.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 block">MCER / CEFR</span>
                    <span className="text-xs font-black text-indigo-700">
                      {sepCenniProjection.cefrBand}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 block">Banda CENNI</span>
                    <span className="text-xs font-black text-emerald-700">
                      Nivel {sepCenniProjection.cenniBandNumeric}/20
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 block">Insignias BKT</span>
                    <span className="text-xs font-black text-amber-700">
                      {sepCenniProjection.unlockedMicroBadgesCount}/36
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              CONSOLA FORENSE DE AULA & DESPACHO 1-CLIC (VISIBLE EN MODO DOCENTE)
              ================================================================= */}
          {roleViewOverride === 'teacher' && (
            <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp"
                    alt="Diagnóstico Forense"
                    className="w-11 h-11 object-contain"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900">
                      DIAGNÓSTICO FORENSE DE AULA & REMEDIACIÓN 1-CLIC
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Telemetría Grupal BKT, Detección de Interferencias L1→L2 y Despacho de Misiones Relámpago
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Misiones Relámpago Enviadas:
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs">
                    {dispatchedQuestsLog.length} Activas
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                        <th className="py-2.5 px-3">Alumno / Matrícula</th>
                        <th className="py-2.5 px-2 text-center">Bloom</th>
                        <th className="py-2.5 px-2 text-center">DSP [FON]</th>
                        <th className="py-2.5 px-2 text-center">STT Oral</th>
                        <th className="py-2.5 px-2 text-center">Boleta SEP</th>
                        <th className="py-2.5 px-3">Acción Forense 1-Clic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {CLASSROOM_COHORT_STUDENTS.map((stu) => {
                        const proj = computeSepCenniProjection(stu.macroMastery);
                        const isSelected = stu.id === selectedCohortStudentId;
                        return (
                          <tr
                            key={stu.id}
                            onClick={() => {
                              setSelectedCohortStudentId(stu.id);
                              setMacroMastery(stu.macroMastery);
                              setSelectedBloomLevel(stu.bloomUnlockedLevel);
                            }}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-indigo-50/80 font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-black text-slate-900">{stu.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {stu.enrollmentCode} · Sem {stu.currentWeek}/40
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-black text-[10px]">
                                Nivel {stu.bloomUnlockedLevel}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-black text-emerald-700">
                              {stu.dspAccuracyAvg}%
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-700">
                              {stu.sttPercentage}%
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-black text-[11px]">
                                {proj.sepGrade10.toFixed(1)} ({proj.cefrBand})
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const msg = `⚡ Misión Relámpago enviada a ${stu.name}: Lab DSP (${stu.recommendedRemediationId}) + Bloom Nivel ${stu.bloomUnlockedLevel}`;
                                  setDispatchedQuestsLog((prev) => [msg, ...prev]);
                                  showToast(msg);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Misión 1-Clic</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Diagnóstico Individual del Alumno Seleccionado */}
                <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Diagnóstico de Interferencia L1→L2
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      {selectedCohortStudent.name}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {selectedCohortStudent.recentL1InterferenceAlert[currentLang]}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      Última Misión Despachada en Aula:
                    </span>
                    <div className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                      {dispatchedQuestsLog[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PANTALLA 1 (P1_HUB): LAS 12 FASES ARQUITECTÓNICAS & CICLO 5E × BLOOM
          ===================================================================== */}
      {activeScreen === 'p1_hub' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded">
                PANTALLA 1 · ARQUITECTURA DE 12 FASES & GRAFO DAG (258 NODOS · 0 CICLOS)
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Explorador Quirúrgico de las 12 Fases Curriculares de ISkool
              </h3>
              <p className="text-xs text-slate-600">
                Haz clic en cualquier fase para inspeccionar su integración con la Taxonomía de Bloom y abrir su estudio operativo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800">
                🇬🇧 222 Nodos ESL
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800">
                🇫🇷 36 Nodos FLE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURE_12_PHASES_NODES.map((phase) => (
              <div
                key={phase.phaseNumber}
                onClick={() => setActiveScreen(phase.targetScreenId)}
                className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-indigo-500 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-black">
                      {phase.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                      {phase.metricBadge[currentLang]}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {phase.titleEs}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {phase.descriptionEs}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-700 truncate max-w-[82%]">
                    {phase.bloomIntegrationEs}
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 2 (P2_MATRIX): MALLA 40 SEMANAS, COFRES & BÓVEDA CURRICULAR
          ===================================================================== */}
      {activeScreen === 'p2_matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Selector de las 40 Semanas agrupadas en 8 Bloques */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/languages/nanobanana-gamified/nb_spiral_treasure_chest.webp"
                    alt="Cofre 40 Semanas"
                    className="w-11 h-11 object-contain"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      PANTALLA 2 · 8 BLOQUES × 5 SEMANAS = 40 SEMANAS (160 LECCIONES)
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Malla Curricular en Espiral & Cofres de Hito
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                {enrichedWeeks.map((node) => {
                  const wNum = node.week.weekNumber;
                  const isSelected = wNum === selectedWeekNumber;
                  return (
                    <div
                      key={wNum}
                      onClick={() => setSelectedWeekNumber(wNum)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg'
                          : 'bg-slate-50/80 text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase">
                          Semana {wNum}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-50 text-indigo-800'
                          }`}
                        >
                          {node.week.cefr}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold line-clamp-2 mb-2">
                        {node.week.title.replace(/^Week \d+:\s*/, '').replace(/^Semaine \d+:\s*/, '')}
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-current/10">
                        <span>{node.dominantBloomLevel.nameEs}</span>
                        <span>{node.isMilestoneChestWeek ? '🎁 Cofre' : '★★★'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inspector de las 4 Lecciones de la Semana + Nodo Markdown/YAML de Bóveda Curricular */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    BÓVEDA CURRICULAR (VAULT-FIRST)
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    {currentEnrichedWeek.week.title}
                  </h4>
                </div>
                {currentEnrichedWeek.isMilestoneChestWeek && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!openedChests.includes(selectedWeekNumber)) {
                        setOpenedChests((prev) => [...prev, selectedWeekNumber]);
                        setXpTotal((prev) => prev + 250);
                        setSocraticCoinsBalance((prev) => prev + 2);
                        showToast(
                          `🎁 ¡Cofre de Hito de la Semana ${selectedWeekNumber} Abierto! +250 XP y +2 Monedas Socráticas`
                        );
                      } else {
                        showToast(`Cofre de la Semana ${selectedWeekNumber} ya reclamado.`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <span>🎁 Reclamar Cofre</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {currentEnrichedWeek.week.lessons.map((les, idx) => (
                  <div
                    key={les.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900">
                        Lección {idx + 1}: {les.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSpeakText(les.target)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Voz 60 FPS</span>
                        </button>
                        {onLoadWeekLessonToWorkshop && (
                          <button
                            type="button"
                            onClick={() => {
                              onLoadWeekLessonToWorkshop(currentEnrichedWeek.week, les);
                              showToast(`✓ Lección "${les.title}" cargada en el Taller Docente`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer"
                          >
                            Cargar Taller
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-indigo-950">{les.target}</p>
                    <p className="text-[11px] text-slate-500">{les.translationEs}</p>
                    {les.phoneticTip && (
                      <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        💡 Fonética DSP: {les.phoneticTip}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Inspector Secundario Desplegable del Nodo Markdown / YAML en Bóveda Curricular (Modo Claro) */}
              <details className="group rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs transition-all">
                <summary className="flex items-center justify-between cursor-pointer font-black text-slate-700 hover:text-indigo-700 list-none">
                  <span className="flex items-center gap-2 truncate">
                    <span>📄 Metadatos de Bóveda Curricular:</span>
                    <span className="font-mono text-[11px] text-indigo-700 truncate">{currentEnrichedWeek.vaultFilePath}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shrink-0">
                    Ver YAML + [[WikiLinks]]
                  </span>
                </summary>
                <pre className="mt-3 p-3 rounded-xl bg-white border border-slate-200 whitespace-pre-wrap font-mono text-[10px] text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                  {currentEnrichedWeek.vaultYamlFrontmatter}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 3 (P3_DSP): ESTUDIO PRINCIPAL DE KARAOKE 60 FPS + DOCK AUXILIAR VOCAL
          ===================================================================== */}
      {activeScreen === 'p3_dsp' && (
        <div className="space-y-6">
          {/* 1. PROTAGONISTA PRINCIPAL (100% ANCHO): KARAOKE NEUROMUSCULAR & AVATAR 60 FPS */}
          <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-5 overflow-hidden">
            {/* Barra Superior del Estudio Principal de Karaoke */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src="/images/languages/nanobanana-gamified/nb_dsp_acoustic_shield.webp"
                  alt="Estudio Karaoke Neuromuscular"
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      ESTUDIO PRINCIPAL · ETAPA 3 DEL CICLO 5E
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      COMBO ACÚSTICO x{karaokeCombo} · META &gt;80%
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Karaoke Neuromuscular Sincronizado a 60 FPS · Semana {selectedWeekNumber} ({currentEnrichedWeek.week.cefr})
                  </h3>
                </div>
              </div>

              {/* Selector Rápido de Mentor 60 FPS + Selector de Frases (1-4) */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Selector compacto de Mentor en 1ª Persona */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 mr-1 hidden sm:inline">
                    Mentor 60 FPS:
                  </span>
                  {allMentorsForLang.slice(0, 4).map((m) => {
                    const isSelectedMentor = m.id === activeMentor.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          stopAllIskoolAudio();
                          setSelectedMentorId(m.id);
                          setIsSpeakingLive(false);
                        }}
                        className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelectedMentor
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={`Practicar con ${m.name} (${m.era})`}
                      >
                        <img
                          src={m.avatarImage}
                          alt={m.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="max-w-[95px] truncate">{m.name.split(' ').slice(-1)[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selector de las 4 Frases de la Semana */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 mr-1">
                    Reto:
                  </span>
                  {activeWeekKaraokePhrases.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveKaraokeIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        idx === activeKaraokeIndex
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Escenario Completo de Karaoke (Avatar 60 FPS a la izquierda + Consola Karaoke a la derecha, 0% superposición) */}
            {activeWeekKaraokePhrases[activeKaraokeIndex] && (
              <LanguageKaraokePlayer
                phrase={activeWeekKaraokePhrases[activeKaraokeIndex]}
                language={currentLang}
                avatarGender={activeMentor.gender}
                avatarVoice={activeMentor.voiceId}
                avatarName={activeMentor.name}
                avatarImage={activeMentor.avatarImage}
                historicalFigureId={activeMentor.id}
                studentName="Sofía Valentina Mendoza"
                lessonId={`wk-${selectedWeekNumber}`}
                lessonTitle={currentEnrichedWeek.week.title}
                isLightMode={true}
                onComplete={(stats) => {
                  const passed = stats.accuracy >= 80;
                  if (passed) {
                    setKaraokeCombo((prev) => prev + 1);
                  }
                  handleRecordMasteryEvidence(
                    'FON',
                    passed,
                    `Karaoke DSP (${stats.accuracy}% precisión)`
                  );
                }}
              />
            )}
          </div>

          {/* 2. DOCK AUXILIAR NANO BANANA 2.1 (SECUNDARIO, ABAJO EN MODO CLARO): GUÍA DE ARTICULACIÓN & FORMANTES */}
          <div className="w-full bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 rounded-3xl border-2 border-indigo-100 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/languages/nanobanana-gamified/nb_articulatory_coach_badge.webp"
                  alt="Coach de Articulación Nano Banana 2.1"
                  className="w-11 h-11 rounded-2xl object-contain bg-white border border-indigo-200 p-0.5 shadow-2xs shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">
                      APOYO COMPLEMENTARIO NANO BANANA 2.1 · GUÍA BIOMECÁNICA DE PRONUNCIACIÓN
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      Fonema Activo: {activePhoneticSpec.symbolIpa} ({activePhoneticSpec.titleEs})
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    Asistente de Articulación Vocal, Posición de Lengua/Labios & Formantes (F1/F2/F3)
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHardwareCalibrator(!showHardwareCalibrator)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-black cursor-pointer shadow-2xs"
                >
                  {showHardwareCalibrator ? 'Ocultar Calibrador SNR' : '🎙️ Calibrador SNR de Micrófono'}
                </button>
              </div>
            </div>

            {/* Grid Horizontal de 3 Columnas en Estética Blanca/Perla Nano Banana 2.1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Columna 1 (4 cols): Selector de los 4 Fonemas Críticos + Palabras Ejemplares */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    1. Selecciona un Fonema para ver su Articulación:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {phoneticTargetsForLang.map((spec) => {
                      const isSelected = spec.id === activePhoneticSpec.id;
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedPhoneticId(spec.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-indigo-300'
                          }`}
                        >
                          <div className="text-xs font-black font-mono">{spec.symbolIpa}</div>
                          <div className="text-[10px] truncate opacity-90">{spec.titleEs}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Palabras Ejemplares con Voz Instantánea */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    Escuchar Palabras Clave ({activePhoneticSpec.symbolIpa}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePhoneticSpec.exemplarWords.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleSpeakText(w.split('/')[0].trim())}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-indigo-600" />
                        <span>{w}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna 2 (4 cols): Esquema Articular Claro Nano Banana 2.1 (Fondo Blanco/Perla) */}
              <div className="lg:col-span-4 bg-gradient-to-br from-white via-indigo-50/40 to-emerald-50/40 rounded-2xl border border-indigo-200/80 p-3.5 flex flex-col justify-between space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-black text-indigo-950 font-mono">
                    Esquema Vocal: {activePhoneticSpec.symbolIpa}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold">
                      F1:{activePhoneticSpec.targetF1Hz}Hz
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                      F2:{activePhoneticSpec.targetF2Hz}Hz
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                      F3:{activePhoneticSpec.targetF3Hz}Hz
                    </span>
                  </div>
                </div>

                {/* Diagrama Articular en Modo Claro Cristalino */}
                <svg
                  viewBox="0 0 320 135"
                  className="w-full h-32 bg-white rounded-xl border border-slate-200 shadow-inner"
                >
                  {/* Paladar duro y cavidad oral superior */}
                  <path
                    d="M 55 38 Q 145 14 235 38 L 265 86"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Velo del paladar (abierto en vocales nasales francesas) */}
                  <line
                    x1="215"
                    y1="32"
                    x2="245"
                    y2={activePhoneticSpec.velumNasalOpen ? '62' : '42'}
                    stroke={activePhoneticSpec.velumNasalOpen ? '#D97706' : '#4F46E5'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Lengua dinámica según altura y anterioridad */}
                  <path
                    d={`M 75 ${102 + activePhoneticSpec.jawOpenPct * 0.18} Q ${
                      195 - activePhoneticSpec.tongueFrontnessPct * 0.85
                    } ${94 - activePhoneticSpec.tongueHeightPct * 0.58} 230 100`}
                    fill="rgba(244, 63, 94, 0.22)"
                    stroke="#E11D48"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Protrusión / Redondeo Labial */}
                  <circle
                    cx={52 - activePhoneticSpec.lipRoundingPct * 0.08}
                    cy={58 + activePhoneticSpec.jawOpenPct * 0.22}
                    r={6 + activePhoneticSpec.lipRoundingPct * 0.06}
                    fill="#10B981"
                  />
                  <text x="12" y="18" className="text-[9px] fill-slate-700 font-mono font-bold">
                    Mandíbula: {activePhoneticSpec.jawOpenPct}% · Labios: {activePhoneticSpec.lipRoundingPct}%
                  </text>
                  <text x="12" y="126" className="text-[9px] fill-indigo-900 font-mono font-bold">
                    {activePhoneticSpec.velumNasalOpen
                      ? 'Velo Nasal ABIERTO (Resonancia Nasal FLE)'
                      : 'Velo Nasal CERRADO (Flujo Oral Puro)'}
                  </text>
                </svg>
              </div>

              {/* Columna 3 (4 cols): Instrucción Biomecánica y Prevención de Interferencia L1->L2 */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-2.5">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    💡 Cómo colocar la boca y lengua
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {activePhoneticSpec.anatomicalInstructionEs}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 leading-snug">
                  <strong>⚠️ Evita el error común (L1→L2):</strong>{' '}
                  {activePhoneticSpec.l1SpanishInterferenceTrapEs}
                </div>
              </div>
            </div>

            {showHardwareCalibrator && (
              <div className="pt-2">
                <HardwareAudioTester isLightMode={true} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 4 (P4_AVATAR): AVATARES 60 FPS EN 1ª PERSONA & MAZO DE PRÓCERES
          ===================================================================== */}
      {activeScreen === 'p4_avatar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Mazo Coleccionable 3D de Próceres Históricos y Mentores a 60 FPS */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  PANTALLA 4 · REGLA NO NEGOCIABLE 2 (1ª PERSONA INVIOLABLE)
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Mentores 3D & Próceres Históricos a 60 FPS
                </h3>
                <p className="text-xs text-slate-600">
                  Selecciona un personaje para conversar 1-a-1 en primera persona estricta con sincronización labial y deformación mandibular a 60 FPS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allMentorsForLang.map((mentor) => {
                  const isSelected = mentor.id === activeMentor.id;
                  return (
                    <div
                      key={mentor.id}
                      onClick={() => {
                        stopAllIskoolAudio();
                        setSelectedMentorId(mentor.id);
                        setIsSpeakingLive(false);
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-600 shadow-md'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <img
                        src={mentor.avatarImage}
                        alt={mentor.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase text-amber-800 block truncate">
                          {mentor.era}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {mentor.name}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-700 block">
                          1ª Persona · 60 FPS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preguntas Históricas / Accionales en 1ª Persona */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-500 block">
                  Preguntas Detonadoras para {activeMentor.name}:
                </span>
                {activeMentor.sampleQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setStudentOralResponseText(q);
                      handleSpeakText(activeMentor.canonicalIntro, activeMentor);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span>“{q}”</span>
                    <Play className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Escenario 60 FPS del Avatar Gesticulante + Anillo 100% STT */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4 flex flex-col items-center">
              <div className="w-full flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    INMERSIÓN DIRECTA 100% IDIOMA META · STT {sttPercentage}%
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">
                    {activeMentor.name} · {activeMentor.era}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeakText(activeMentor.canonicalIntro, activeMentor)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isSpeakingLive ? 'Detener Voz 60 FPS' : 'Escuchar Testimonio en 1ª Persona'}
                  </span>
                </button>
              </div>

              <HumanGesticulatingAvatar
                gender={activeMentor.gender}
                name={activeMentor.name}
                language={currentLang}
                voiceId={activeMentor.voiceId}
                avatarImage={activeMentor.avatarImage}
                historicalFigureId={activeMentor.id}
                historicalEra={activeMentor.era}
                currentText={activeSpokenText || activeMentor.canonicalIntro}
                translationText={activeMentor.pdaRelevance}
                phoneticTip={activePhoneticSpec.anatomicalInstructionEs}
                isPlaying={isSpeakingLive}
                isLightMode={true}
              />

              {/* Caja de Intervención Oral / Escrita del Alumno (100% STT) */}
              <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    🎙️ Tu Turno de Habla / Respuesta en {isFrench ? 'Francés' : 'Inglés'} ({activeBloomSpec.nameEs}):
                  </span>
                  <span className="text-[10px] font-black text-indigo-700">
                    Recompensa: +{Math.round(activeBloomSpec.baseXpReward * activeBloomSpec.xpMultiplier)} XP
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={studentOralResponseText}
                    onChange={(e) => setStudentOralResponseText(e.target.value)}
                    placeholder={
                      isFrench
                        ? 'Répondez directement en français à la 1re personne...'
                        : 'Respond directly in English using target Bloom verbs...'
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSttPercentage((prev) => Math.min(100, prev + 2));
                      handleRecordMasteryEvidence(
                        'PO',
                        true,
                        `Interacción 1ª Persona con ${activeMentor.name}`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shrink-0"
                  >
                    Validar Intervención
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 5 (P5_WRITING): WRITING ENGINE SOCRÁTICO 0% IA & 3 MONEDAS
          ===================================================================== */}
      {activeScreen === 'p5_writing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Socrático con 0% Ghostwriting y 3 Monedas Doradas */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/languages/nanobanana-gamified/nb_socratic_gold_coin.webp"
                    alt="Moneda Socrática"
                    className="w-11 h-11 object-contain"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      PANTALLA 5 · CANDADO ÉTICO 0% IA GHOSTWRITING · BLOOM NIVEL 6 (x3.0 XP)
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Writing Engine Autónomo & 3 Monedas de Pista Socrática
                    </h3>
                  </div>
                </div>

                <Link
                  href={role === 'teacher' ? '/teacher/idiomas/writing' : '/student/idiomas/writing'}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <span>Abrir Estudio Pantalla Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Las 3 Monedas Doradas de Pista Socrática */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SOCRATIC_HINT_COINS.map((coin) => {
                  const isUnlocked = unlockedCoinNumbers.includes(coin.coinNumber);
                  return (
                    <div
                      key={coin.coinNumber}
                      onClick={() => {
                        if (!isUnlocked) {
                          setUnlockedCoinNumbers((prev) => [...prev, coin.coinNumber]);
                          setSocraticCoinsBalance((prev) => Math.max(0, prev - 1));
                          showToast(`🪙 ${coin.titleEs} desbloqueada (0% generación automática)`);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isUnlocked
                          ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-amber-900">
                          🪙 Moneda {coin.coinNumber}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white border border-amber-200">
                          {isUnlocked ? 'Desbloqueada' : 'Canjear 1 🪙'}
                        </span>
                      </div>
                      <div className="text-xs font-black mb-1">{coin.titleEs}</div>
                      {isUnlocked ? (
                        <p className="text-[11px] text-slate-700 leading-snug">
                          {coin.hintQuestion[currentLang]}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500">
                          Haz clic para revelar la pregunta orientadora socrática sin que el sistema redacte por ti.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Lienzo de Redacción Autónoma del Alumno */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800">
                    Tu Producción Escrita Original ({writingAnalysis.wordCount} palabras):
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    🔒 Autoría 100% del Alumno Verificada
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={writingDraft}
                  onChange={(e) => setWritingDraft(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white text-sm text-slate-900 font-medium leading-relaxed focus:outline-hidden"
                  placeholder={
                    isFrench
                      ? 'Rédigez votre texte argumentatif ici (DELF/DALF)...'
                      : 'Compose your analytical essay or response here (Cambridge Scale)...'
                  }
                />
              </div>

              {/* Detector Forense de Interferencias L1->L2 y Falsos Amigos */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-900">
                    Detector Forense de Interferencias L1→L2 & Verbos Bloom:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWritingDraft((prev) =>
                        currentLang === 'en'
                          ? `${prev} I have 15 years and it depends of the people is ready.`
                          : `${prev} Je vais visiter mon ami actuellement.`
                      )
                    }
                    className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                  >
                    Probar Detección de Calco L1→L2
                  </button>
                </div>

                {writingAnalysis.l1Alerts.length === 0 ? (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                    ✓ Cero calcos morfosintácticos L1→L2 detectados en tu borrador actual.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {writingAnalysis.l1Alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1"
                      >
                        <div className="font-black text-amber-950">
                          ⚠️ {alert.categoryEs}: {alert.calqueDetected}
                        </div>
                        <div className="text-slate-800">{alert.socraticPromptEs}</div>
                        <div className="text-[11px] font-bold text-indigo-800">
                          Pista Estructural: {alert.suggestedTargetReformulation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rúbrica Analítica Oficial Cambridge (0-20) / FEI DELF-DALF (0-25) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {isFrench
                        ? 'GRILLE OFFICIELLE FEI DELF/DALF (0–25 PTS)'
                        : 'CAMBRIDGE ASSESSMENT ANALYTIC SCALE (0–20 PTS)'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">
                      Evaluación Analítica de los 4 Criterios Oficiales
                    </h4>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-sm font-black">
                    {writingAnalysis.totalScore} / {writingAnalysis.maxScale}
                  </div>
                </div>

                <div className="space-y-3">
                  {writingAnalysis.criteriaScores.map((crit) => {
                    const pct = Math.round((crit.score / crit.maxScore) * 100);
                    return (
                      <div
                        key={crit.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-900">{crit.nameEs}</span>
                          <span className="font-mono font-black text-indigo-700">
                            {crit.score} / {crit.maxScore}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">{crit.descriptorEs}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedBloomLevel(6);
                  handleRecordMasteryEvidence(
                    'PE',
                    true,
                    `Ensayo Socrático Evaluado (${writingAnalysis.totalScore}/${writingAnalysis.maxScale})`
                  );
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                Registrar Evidencia Escrita en Radar BKT ([PE] & [MED] · Bloom Nivel 6 x3.0 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 6 (P6_BKT): VITRINA DE 36 MICRO-HABILIDADES BKT & SIMULADOR CENNI
          ===================================================================== */}
      {activeScreen === 'p6_bkt' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src="/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp"
                alt="Medalla CENNI"
                className="w-12 h-12 object-contain"
              />
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded">
                  PANTALLA 6 · 6 MACRO-COMPETENCIAS × 6 MICRO-HABILIDADES = 36 INSIGNIAS VERIFICABLES
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Vitrina de 36 Micro-Habilidades CEFR/CENNI & Simulador Oficial de Boleta SEP
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs font-black">
                Boleta Oficial SEP: {sepCenniProjection.sepGrade10.toFixed(1)} / 10.0 · {sepCenniProjection.cenniBandLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {IDENTIFIABLE_LANGUAGE_SKILLS.map((macro) => {
              const prob = macroMastery[macro.shortCode] || 0.8;
              const pct = Math.round(prob * 100);
              return (
                <div
                  key={macro.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black">
                        [{macro.shortCode}] {macro.nameEs}
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-700">
                        BKT {pct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{macro.descriptionEs}</p>

                    <div className="space-y-1.5 pt-2">
                      {macro.microSkills.map((micro) => (
                        <div
                          key={micro.code}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-black text-indigo-700 mr-1.5">
                              {micro.code}
                            </span>
                            <span className="font-bold text-slate-800">{micro.nameEs}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[9px] shrink-0">
                            {micro.cefrAlignment}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRecordMasteryEvidence(
                        macro.shortCode,
                        true,
                        `Verificación de Competencia [${macro.shortCode}]`
                      )
                    }
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-black cursor-pointer transition-colors"
                  >
                    + Certificar Evidencia Empírica en [{macro.shortCode}]
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          PANTALLA 7 (P7_AUDIT): AUDITORÍA DE 6 INSTITUCIONES & SYNC ZERO-PII
          ===================================================================== */}
      {activeScreen === 'p7_audit' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                PANTALLA 7 · AUDITORÍA FORENSE INTERNACIONAL & MEMORIA INSTITUCIONAL ZERO-PII
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Síntesis Superadora de las 6 Mejores Metodologías del Mundo
              </h3>
              <p className="text-xs text-slate-600">
                Comparativa quirúrgica auditada e integrada en el motor continuo de ISkool para Inglés (ESL/EFL) y Francés (FLE).
              </p>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-emerald-950 text-emerald-300 font-mono text-xs font-black">
              🔒 Sincronización Institucional Zero-PII Activa (SHA-256)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INTERNATIONAL_BENCHMARK_AUDITS.map((audit) => (
              <div
                key={audit.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-700">
                      {audit.countryOrigin} · {audit.globalRating}
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      {audit.institution}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <strong>Fortalezas Adoptadas:</strong> {audit.surgicalStrengths[0]}
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                    <strong>Limitación Tradicional Superada:</strong> {audit.structuralLimitations[0]}
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium">
                    <strong>🚀 Síntesis Quirúrgica ISkool Nano Banana 2.1:</strong>{' '}
                    {audit.iskoolSynthesisAndUpgrade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BloomBktGamifiedCockpit;

