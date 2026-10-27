// src/app/redisenos_gamificados/apex_academy_venture_studio/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  X,
  Award,
  Sparkles,
  Target,
  QrCode,
  GraduationCap,
  Activity,
  Code,
  Calendar,
  Shield,
  Volume2,
  VolumeX,
  Terminal,
  Cpu,
  Layers,
  Compass,
  Check,
  ChevronRight,
  ExternalLink,
  Eye,
  Sliders,
  Users
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';

// =========================================================================
// 1. MODELOS DE DATOS: FUNDADORES TECH & VENTURE STUDIO (FASE 6 SEP)
// =========================================================================

interface FounderStudent {
  id: string;
  name: string;
  semester: string;
  startupName: string;
  sector: string;
  avatarIcon: string;
  valuation: string;
  raisedCapital: string;
  runwayMonths: number;
  growthMom: string;
  stage: 'Idea' | 'Semilla' | 'Serie A Pre';
  ventureCredits: number;
  gpa: number;
  cambridgeLevel: string;
  prioritySprint: string;
  radarScores: {
    math: number;
    stem: number;
    writing: number;
    leadership: number;
    english: number;
  };
  activeRenderKey: 'base' | 'lentes' | 'maletin' | 'pin';
}

const INITIAL_FOUNDERS: FounderStudent[] = [
  {
    id: 'fnd-santiago',
    name: 'Santiago De la Vega',
    semester: '5º Semestre · Bachillerato Tecnológico',
    startupName: 'BioAlgae Solutions',
    sector: 'Biotecnología & Captura de Carbono',
    avatarIcon: '🌱',
    valuation: '$2.4M MXN',
    raisedCapital: '$450,000 MXN',
    runwayMonths: 14,
    growthMom: '+18.5%',
    stage: 'Semilla',
    ventureCredits: 4250,
    gpa: 9.7,
    cambridgeLevel: 'C1 Advanced',
    prioritySprint: 'Sprint 03: Validación de Fotobiorreactores',
    radarScores: { math: 95, stem: 89, writing: 85, leadership: 92, english: 91 },
    activeRenderKey: 'maletin'
  },
  {
    id: 'fnd-natalia',
    name: 'Natalia Ramos',
    semester: '6º Semestre · Bachillerato General',
    startupName: 'EduNeuroTech',
    sector: 'Inteligencia Artificial Pedagógica',
    avatarIcon: '🧠',
    valuation: '$4.8M MXN',
    raisedCapital: '$920,000 MXN',
    runwayMonths: 18,
    growthMom: '+27.2%',
    stage: 'Serie A Pre',
    ventureCredits: 5800,
    gpa: 9.9,
    cambridgeLevel: 'C2 Proficiency',
    prioritySprint: 'Sprint 05: Algoritmos de Atención EEG',
    radarScores: { math: 98, stem: 96, writing: 94, leadership: 95, english: 96 },
    activeRenderKey: 'lentes'
  },
  {
    id: 'fnd-alejandro',
    name: 'Alejandro Peña',
    semester: '4º Semestre · Bachillerato Internacional',
    startupName: 'LogiSolar Urban',
    sector: 'Movilidad Eléctrica Escolar',
    avatarIcon: '🔋',
    valuation: '$1.2M MXN',
    raisedCapital: '$180,000 MXN',
    runwayMonths: 8,
    growthMom: '+12.0%',
    stage: 'Idea',
    ventureCredits: 2600,
    gpa: 9.4,
    cambridgeLevel: 'B2 Vantage',
    prioritySprint: 'Sprint 02: Modelado CAD de Chasis Solar',
    radarScores: { math: 88, stem: 90, writing: 82, leadership: 86, english: 84 },
    activeRenderKey: 'pin'
  }
];

// Catálogo de Atuendos y Aditamentos Ejecutivos
interface FounderGear {
  id: 'base' | 'lentes' | 'maletin' | 'pin';
  name: string;
  category: 'Traje Ejecutivo' | 'Óptica AR' | 'Seguridad & Datos' | 'Distintivo de Élite';
  stats: string;
  description: string;
  image: string;
  rarity: 'Profesional' | 'Senior' | 'Founders Club' | 'Unicornio';
  badgeColor: string;
}

const FOUNDER_CATALOG: FounderGear[] = [
  {
    id: 'base',
    name: 'Traje Ejecutivo Base de Incubadora',
    category: 'Traje Ejecutivo',
    stats: '+15% Confianza de Inversionistas',
    description: 'Blazer azul marino de corte sastre con forro de microfibra termorreguladora para jornadas intensivas de pitch y negociación.',
    image: '/redisenos_assets/apex_studio/founder_base_pedestal.jpg',
    rarity: 'Profesional',
    badgeColor: 'from-slate-600 to-slate-800'
  },
  {
    id: 'lentes',
    name: 'Lentes AR con Analíticas de Valuación',
    category: 'Óptica AR',
    stats: '+35% Precisión en Métricas MoM',
    description: 'Armazón de titanio con display HUD micro-OLED que proyecta estados de flujo de caja, burn-rate y ratios financieros en tiempo real.',
    image: '/redisenos_assets/apex_studio/founder_lentes_ar.jpg',
    rarity: 'Senior',
    badgeColor: 'from-indigo-600 to-violet-800'
  },
  {
    id: 'maletin',
    name: 'Maletín Ejecutivo de Fibra con Biometría',
    category: 'Seguridad & Datos',
    stats: '+40% Seguridad Criptográfica de Patentes',
    description: 'Carcasa de fibra de carbono reforzada con cerrojo biométrico y blindaje Faraday para transportar contratos y prototipos confidenciales.',
    image: '/redisenos_assets/apex_studio/founder_maletin_ejecutivo.jpg',
    rarity: 'Founders Club',
    badgeColor: 'from-amber-600 to-yellow-800'
  },
  {
    id: 'pin',
    name: 'Pin Unicornio de Platino y Diamante',
    category: 'Distintivo de Élite',
    stats: 'Valuación Superior a $1M USD',
    description: 'Presea conmemorativa otorgada exclusivamente a fundadores estudiantiles cuyo proyecto superó la ronda de inversión ángel.',
    image: '/redisenos_assets/apex_studio/founder_pin_unicornio.jpg',
    rarity: 'Unicornio',
    badgeColor: 'from-purple-600 to-pink-800'
  }
];

// Pipeline de Sprints de la Incubadora
interface SprintTask {
  id: string;
  stage: 'Ideación' | 'Validación' | 'Prototipado' | 'Lanzamiento';
  title: string;
  lead: string;
  daysRemaining: number;
  status: 'Completado' | 'En Proceso' | 'Bloqueado';
  deliverable: string;
  ventureFunding: string;
}

const SPRINT_PIPELINE: SprintTask[] = [
  {
    id: 'sp-1',
    stage: 'Ideación',
    title: 'Benchmarking de Mercado & Análisis Competitivo Ceneval',
    lead: 'Alejandro Peña',
    daysRemaining: 0,
    status: 'Completado',
    deliverable: 'Matriz de Océano Azul en Bóveda Curricular',
    ventureFunding: '+$500 VF'
  },
  {
    id: 'sp-2',
    stage: 'Validación',
    title: 'Pruebas de Toxicidad de Algas & Síntesis de Biopolímero',
    lead: 'Santiago De la Vega',
    daysRemaining: 4,
    status: 'En Proceso',
    deliverable: 'Reporte de Laboratorio y Curva Espectrofotométrica',
    ventureFunding: '+$1,200 VF'
  },
  {
    id: 'sp-3',
    stage: 'Prototipado',
    title: 'Entrenamiento de Red Neuronal Pedagógica en PyTorch',
    lead: 'Natalia Ramos',
    daysRemaining: 2,
    status: 'En Proceso',
    deliverable: 'Pesos del Modelo y Script de Inferencia en Local',
    ventureFunding: '+$2,500 VF'
  },
  {
    id: 'sp-4',
    stage: 'Lanzamiento',
    title: 'Ronda de Demo Day ante Fondos de Inversión y Universidades',
    lead: 'Cuadrilla Apex',
    daysRemaining: 12,
    status: 'En Proceso',
    deliverable: 'Pitch Deck Ejecutivo y Firma Criptográfica HMAC',
    ventureFunding: '+$5,000 VF'
  }
];

export default function ApexAcademyVentureStudioPage() {
  // Estado del Estudiante Activo
  const [activeStudent, setActiveStudent] = useState<FounderStudent>(INITIAL_FOUNDERS[0]);

  // Modo de Vista Principal: 'canvas169' (Lienzo Ejecutivo) | 'kanban' (Sprints)
  const [activeViewMode, setActiveViewMode] = useState<'canvas169' | 'kanban'>('canvas169');

  // Modales
  const [activeModal, setActiveModal] = useState<
    'none' | 'uniMastery' | 'radarPortfolio' | 'locker' | 'mentorship' | 'store' | 'teacherStudio' | 'telemetryHotspot'
  >('none');

  // Hotspot inspeccionado
  const [inspectedHotspot, setInspectedHotspot] = useState<{
    title: string;
    description: string;
    specs: string[];
    actionName: string;
    onAction: () => void;
  } | null>(null);

  // Estados de UniMastery Pro (Desafío de Cálculo Superior)
  const [selectedCalculusOption, setSelectedCalculusOption] = useState<number | null>(null);
  const [isCalculusSolved, setIsCalculusSolved] = useState<boolean>(false);
  const [admissionProbability, setAdmissionProbability] = useState<number>(94);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [codeEditorOutput, setCodeEditorOutput] = useState<string | null>(null);

  // Estados de Mentoría IA
  const [activeMentor, setActiveMentor] = useState<'curie' | 'davinci'>('curie');
  const [isSpeakingMentor, setIsSpeakingMentor] = useState<boolean>(false);

  // Estados de Taller y Avatar
  const [customizerMode, setCustomizerMode] = useState<'3d_renders' | 'anime_sprite'>('3d_renders');
  const [selectedFounderItem, setSelectedFounderItem] = useState<'base' | 'lentes' | 'maletin' | 'pin'>('maletin');
  const [spriteAnimation, setSpriteAnimation] = useState<'idle' | 'cast' | 'cheer'>('idle');

  // Notificaciones y Audio
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // 2. SÍNTESIS DE VOZ Y CANON EN PRIMERA PERSONA ESTRICTA (REGLA 2)
  // =========================================================================

  const speakText = (text: string, isMentor = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      if (isMentor) {
        utter.rate = 0.94;
        utter.pitch = activeMentor === 'curie' ? 1.05 : 0.88;
        setIsSpeakingMentor(true);
        utter.onend = () => setIsSpeakingMentor(false);
        utter.onerror = () => setIsSpeakingMentor(false);
      } else {
        utter.rate = 1.05;
        utter.pitch = 1.05;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignorar si el navegador bloquea la reproducción de voz sin gesto
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingMentor(false);
    }
  };

  // Discursos en Primera Persona Estricta (Regla No Negociable 2)
  const handleMentorSpeech = (mentorKey: 'curie' | 'davinci') => {
    gamificationAudio.playClickSound();
    setActiveMentor(mentorKey);

    let monologue = "";
    if (mentorKey === 'curie') {
      monologue = 
        "En mis investigaciones en París descubrí el polonio y el radio, demostrando que la energía emana de la estructura íntima del átomo. " +
        "En tu proyecto científico, la pulcritud experimental y la perseverancia frente a la adversidad son las únicas herramientas que conducen a la verdad. " +
        "No temas a las dificultades del cálculo ni a los reactivos complejos; la ciencia exige consagración absoluta.";
      showToast("Marie Curie comparte su mentoría científica en primera persona 🧪");
    } else {
      monologue = 
        "En mis talleres de Florencia y Milán uní el estudio anatómico con el diseño de máquinas hidráulicas y voladoras. " +
        "Tu hipótesis de innovación debe nacer siempre de la observación rigurosa de las leyes de la naturaleza. " +
        "Antes de diseñar una solución de mercado, comprende las fuerzas físicas que la rigen.";
      showToast("Leonardo da Vinci comparte su mentoría en primera persona 🎨");
    }

    speakText(monologue, true);
  };

  // =========================================================================
  // 3. RESOLUCIÓN DEL DESAFÍO EN UNIMASTERY PRO
  // =========================================================================

  const handleSolveCalculus = (optIdx: number) => {
    setSelectedCalculusOption(optIdx);

    if (optIdx === 0) {
      // Opción correcta: 3
      gamificationAudio.playVictorySound();
      gamificationAudio.playLevelUpSound();
      setIsCalculusSolved(true);
      setAdmissionProbability(98);
      const explanation = 
        "¡Demostración impecable! Al multiplicar el numerador y denominador por 3, aplicas el límite notable " +
        "del seno sobre su argumento cuando tiende a cero, obteniendo un valor exacto de 3.";
      speakText(explanation, false);
      showToast("¡Reactivo de cálculo resuelto con rigor universitario! Admisión UNAM/Tec elevada al 98% 🎓");
    } else {
      gamificationAudio.playErrorSound();
      showToast("Indeterminación 0/0 detectada. Recuerda multiplicar por 3/3 para aplicar el límite estándar lim(u->0)[sin(u)/u] = 1.");
    }
  };

  const handleRunCodeVerification = () => {
    gamificationAudio.playClickSound();
    gamificationAudio.playMagicCastSound();
    setCodeEditorOutput(
      "$ python -c 'import math; x=1e-7; print(math.sin(3*x)/x)'\n" +
      ">>> 2.99999999999985 \n" +
      ">>> Convergencia numérica exacta: L = 3.0 (Error < 1e-12)\n" +
      ">>> Test suite: 100% Passed · Rigor Metodológico Aprobado"
    );
    showToast("Terminal interactiva ejecutada: Comprobación numérica confirmada en L = 3.0 💻");
  };

  const handleEquipItem = (gearId: 'base' | 'lentes' | 'maletin' | 'pin') => {
    gamificationAudio.playClickSound();
    setSelectedFounderItem(gearId);
    setActiveStudent(prev => ({
      ...prev,
      activeRenderKey: gearId
    }));
    gamificationAudio.playMagicCastSound();
    showToast(`¡Accesorio [${FOUNDER_CATALOG.find(i => i.id === gearId)?.name}] equipado en el perfil ejecutivo! 💼`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans pb-12">
      
      {/* ========================================================================= */}
      {/* HEADER SUPERIOR: IDENTIDAD DE APEX VENTURE STUDIO */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-indigo-900/40 px-4 sm:px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo y Enlace de Retorno */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link 
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-indigo-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Apex Academy Venture Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/40">
                    Preparatoria · 15 a 18 Años
                  </span>
                </h1>
                <p className="text-[11px] text-indigo-200/70 font-medium">
                  Aceleradora de Talento, Innovación y Portafolio Universitario · Fase 6 SEP
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Estudiante Fundador y Métricas Rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
            
            {/* Píldoras de los 3 Fundadores */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-indigo-900/40">
              {INITIAL_FOUNDERS.map(fnd => (
                <button
                  key={fnd.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudent(fnd);
                    setSelectedFounderItem(fnd.activeRenderKey);
                    showToast(`Perfil activo: ${fnd.name} (${fnd.startupName})`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeStudent.id === fnd.id
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{fnd.avatarIcon}</span>
                  <span className="hidden sm:inline">{fnd.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Métricas Ejecutivas en Vivo */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-900/40 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-300" title="Valuación Post-Money">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {activeStudent.valuation}
              </span>
              <span className="flex items-center gap-1 text-indigo-300" title="Venture Funding Credits">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ${activeStudent.ventureCredits.toLocaleString()} VF
              </span>
              <span className="flex items-center gap-1 text-cyan-300" title="GPA Oficial Ponderado">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                GPA {activeStudent.gpa}
              </span>
            </div>

            {/* Botones de Acción de Pantalla */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('uniMastery');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <Target className="w-3.5 h-3.5" />
                <span>UniMastery</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('radarPortfolio');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-700/50 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Radar & Heatmap</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('mentorship');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Mentoría IA</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold"
                title="Pedestal Ejecutivo 3D & Vestuario"
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teacherStudio');
                }}
                className="p-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold"
                title="Universal Challenge Studio (Vista Docente)"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL DEL VENTURE STUDIO */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* BANNER DE IDENTIDAD Y SELECTOR DE VISTA (CANVAS 16:9 VS KANBAN) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-indigo-900/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/40">
                Fase {activeStudent.stage} · GPA {activeStudent.gpa}
              </span>
              <span className="text-xs text-slate-400 font-medium">{activeStudent.semester}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} {activeStudent.startupName}</span>
              <span className="text-xs text-slate-400 font-normal">por {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Sector: <strong className="text-indigo-400">{activeStudent.sector}</strong> · Certificación: <span className="text-cyan-400 font-bold">{activeStudent.cambridgeLevel}</span> · {activeStudent.prioritySprint}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('canvas169');
                  showToast("Modo: Terminal Ejecutiva 16:9 Apex Venture Studio");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'canvas169'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lienzo 16:9</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('kanban');
                  showToast("Modo: Tablero de Sprints & Pipeline");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sprints</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANTALLA 1: LIENZO MAESTRO 16:9 INMACULADO CON HOTSPOTS NANO BANANA */}
        {/* ========================================================================= */}
        {activeViewMode === 'canvas169' && (
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-600/40 bg-slate-950 select-none group">
            
            {/* IMAGEN MAESTRA DE FONDO OFICIAL (16:9) */}
            <img 
              src="/redisenos_assets/gamification_preparatoria_venture_studio_1792732893154.jpg"
              alt="Apex Academy Venture Studio Hub 16:9"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* OVERLAY DE VIGNETTE Y LUZ EJECUTIVA AMBIENTAL */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />

            {/* ========================================================================= */}
            {/* HUD FLOTANTE SUPERIOR DENTRO DEL LIENZO */}
            {/* ========================================================================= */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              
              {/* Telemetría Flotante Izquierda */}
              <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-indigo-500/40 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider">
                    Incubadora de Aceleración de Talento
                  </span>
                </div>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  {activeStudent.valuation}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  ${activeStudent.ventureCredits.toLocaleString()} VF
                </span>
              </div>

              {/* Botón de Mentoría Marie Curie / Da Vinci */}
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('mentorship');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-black shadow-xl shadow-indigo-500/20 transition-all border border-indigo-300"
                title="Conectar con Mentores Científicos e Históricos"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mentoría Histórica IA</span>
                {isSpeakingMentor && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            </div>

            {/* ========================================================================= */}
            {/* HOTSPOTS TRANSPARENTES MILIMÉTRICOS (NANO BANANA GRID) */}
            {/* ========================================================================= */}

            {/* 1. PROJECT ACCELERATOR TRACK (ARRIBA IZQUIERDA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Project Accelerator Track: Pipeline de Incubación',
                  description: 'Monitoreo de hitos de desarrollo técnico, validación de mercado y entregables tangibles para la admisión en universidades de alta demanda (UNAM, Tec de Monterrey, Stanford).',
                  specs: [
                    'Nivel de Incubación: Nivel 3 de 5 (65% Progreso)',
                    'Proyecto Activo: BioAlgae Solutions (Impacto 8.5/10)',
                    'Hitos Próximos: Validación de MVP en 4 Semanas'
                  ],
                  actionName: 'Ver Hitos del Sprint',
                  onAction: () => {
                    setActiveViewMode('kanban');
                    showToast("Cambiando a vista de Sprints y Pipeline");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[26%] left-[9%] w-[34%] h-[26%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-500/15 transition-all flex items-center justify-center"
              title="Project Accelerator Track: Nivel 3 de 5"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🚀 Accelerator Track (65%)
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/70 animate-ping" />
            </div>

            {/* 2. REAL-TIME AI HISTORICAL FIGURE MENTORSHIP (ARRIBA DERECHA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('mentorship');
              }}
              className="absolute top-[26%] left-[45%] w-[46%] h-[28%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-violet-400/50 hover:border-violet-300 hover:bg-violet-500/15 transition-all flex items-center justify-center"
              title="Real-Time AI Historical Figure Mentorship: Marie Curie & Leonardo da Vinci"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-violet-500 text-white text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🧠 Mentoría Marie Curie & Da Vinci
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-violet-400/70 animate-ping" />
            </div>

            {/* 3. VERIFIED CREDENTIAL MASTERY MATRIX (ABAJO IZQUIERDA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('radarPortfolio');
              }}
              className="absolute top-[55%] left-[9%] w-[40%] h-[32%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-emerald-400/50 hover:border-emerald-300 hover:bg-emerald-500/15 transition-all flex items-center justify-center"
              title="Verified Credential Mastery Matrix: 78% Total Mastery"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-emerald-300 text-[10px] font-black border border-emerald-500/40 shadow-lg whitespace-nowrap">
                📊 Mastery Matrix (FinTech, IA/ML, Estrategia)
              </div>
            </div>

            {/* 4. UNIVERSITY PORTFOLIO READINESS SCORE (ABAJO DERECHA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('uniMastery');
              }}
              className="absolute top-[57%] left-[51%] w-[40%] h-[30%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-indigo-400/50 hover:border-indigo-300 hover:bg-indigo-500/15 transition-all flex items-center justify-center"
              title="University Portfolio Readiness Score: 96/100"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-indigo-300 text-[10px] font-black border border-indigo-500/40 shadow-lg whitespace-nowrap flex items-center gap-1.5">
                <Target className="w-3 h-3 text-indigo-400" />
                <span>Readiness Score: 96/100 (Global Rank #14)</span>
              </div>
            </div>

            {/* 5. VENTURE FUNDING CREDITS COUNTER (ARRIBA DERECHA HEADER) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('store');
              }}
              className="absolute top-[15%] left-[74%] w-[17%] h-[9%] cursor-pointer group/hotspot rounded-xl border-2 border-dashed border-amber-400/50 hover:border-amber-300 hover:bg-amber-500/15 transition-all flex items-center justify-center"
              title="Venture Funding Credits Counter: $4,250 VF Credits"
            >
              <div className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[9px] font-black shadow-md">
                💰 VF Credits: ${activeStudent.ventureCredits.toLocaleString()}
              </div>
            </div>

            {/* PIE DE PÁGINA DENTRO DEL LIENZO */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Haz clic sobre las tarjetas del lienzo interactivo para abrir los módulos de preparación universitaria y aceleración de proyectos.
              </span>
              <span className="font-bold text-indigo-300 hidden md:inline">
                Fase 6 SEP · Estándar Universitario Internacional
              </span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PANTALLA ALTERNATIVA: TABLERO KANBAN DE SPRINTS EJECUTIVOS */}
        {/* ========================================================================= */}
        {activeViewMode === 'kanban' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Ideación', 'Validación', 'Prototipado', 'Lanzamiento'].map((colStage) => {
                const tasksInCol = SPRINT_PIPELINE.filter(t => t.stage === colStage);
                return (
                  <div 
                    key={colStage}
                    className="p-4 rounded-3xl bg-slate-900 border border-indigo-900/40 shadow-xl flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                        {colStage}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                        {tasksInCol.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {tasksInCol.map(task => (
                        <div 
                          key={task.id}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              task.status === 'Completado' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">
                              {task.ventureFunding}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug">
                            {task.title}
                          </h4>

                          <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Líder: <strong className="text-slate-300">{task.lead}</strong></span>
                            <span>{task.daysRemaining === 0 ? 'Entregado' : `${task.daysRemaining} días`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: UNIMASTERY PRO (DESAFÍO DE CÁLCULO CON SCRATCHPAD LATEX) */}
      {/* ========================================================================= */}
      {activeModal === 'uniMastery' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-5xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            {/* Header de UniMastery Pro */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>UniMastery Pro | University Entrance Challenge</span>
                    {isCalculusSolved && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                        ✓ DEMOSTRACIÓN APROBADA
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cálculo Infinitesimal y Límites Notables · Estándar Ceneval / UNAM / Tec / MIT
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout de 3 Columnas Oficial de UniMastery Pro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Columna 1 (Lg: 4): Scratchpad & Reasoning (LaTeX Formal) */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                    Scratchpad & Reasoning
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    LaTeX Engine
                  </span>
                </div>

                <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <p>
                    <strong className="text-indigo-300">STEP 1:</strong> Identify indeterminate form:
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 text-center">
                    {"\\lim_{x \\to 0} \\frac{\\sin(3x)}{x} = \\frac{0}{0}"}
                  </div>

                  <p>
                    <strong className="text-indigo-300">STEP 2:</strong> Recall the standard fundamental limit:
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 text-center">
                    {"\\lim_{\\theta \\to 0} \\frac{\\sin\\theta}{\\theta} = 1"}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Sea θ = 3x; cuando x → 0, entonces θ → 0.
                  </p>

                  <p>
                    <strong className="text-indigo-300">STEP 3:</strong> Multiply numerator and denominator by 3:
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-center">
                    {"3 \\cdot \\lim_{x \\to 0} \\frac{\\sin(3x)}{3x} = 3(1) = 3"}
                  </div>

                  <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-center font-black text-indigo-200">
                    FINAL ANSWER: L = 3
                  </div>
                </div>
              </div>

              {/* Columna 2 (Lg: 5): Consola Central de Problema & Terminal */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">Problem: Advanced Calculus</span>
                  </div>
                  <button
                    onClick={() => setIsCodeEditorOpen(prev => !prev)}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Code className="w-3 h-3" />
                    <span>{isCodeEditorOpen ? 'Ocultar Terminal' : 'Abrir Terminal Python'}</span>
                  </button>
                </div>

                <div className="text-center py-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Calcular el límite:</span>
                  <div className="text-2xl font-black text-white font-mono bg-slate-900/90 py-3 px-4 rounded-xl border border-slate-800 inline-block shadow-inner">
                    lim (x → 0) [ sin(3x) / x ]
                  </div>
                </div>

                {/* 4 Opciones en Botonera */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { opt: 0, val: '3', label: 'L = 3 (Demostración Rigurosa)' },
                    { opt: 1, val: '1/3', label: 'L = 1/3 (Inversión de argumento)' },
                    { opt: 2, val: '0', label: 'L = 0 (Evaluación directa 0/0)' },
                    { opt: 3, val: '∞', label: 'L = ∞ (Divergencia inexistente)' }
                  ].map(item => (
                    <button
                      key={item.opt}
                      onClick={() => handleSolveCalculus(item.opt)}
                      className={`p-3 rounded-xl border text-left transition-all font-mono ${
                        selectedCalculusOption === item.opt
                          ? item.opt === 0
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40 shadow-xl'
                            : 'bg-rose-950/80 border-rose-500 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500/50'
                      }`}
                    >
                      <span className="text-base font-black text-indigo-300 block mb-0.5">
                        {item.val}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Terminal Toggle de Código */}
                {isCodeEditorOpen && (
                  <div className="p-3.5 rounded-xl bg-black border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Python 3.11 · Sandbox Numérico</span>
                      <button 
                        onClick={handleRunCodeVerification}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30"
                      >
                        Ejecutar Script
                      </button>
                    </div>
                    <pre className="text-emerald-400 text-[10px] whitespace-pre-wrap leading-relaxed">
                      {codeEditorOutput || "$ Click en 'Ejecutar Script' para verificar convergencia con math.sin(3*x)/x..."}
                    </pre>
                  </div>
                )}
              </div>

              {/* Columna 3 (Lg: 3): Analytics & Progress (Predictor UNAM/Tec 94%) */}
              <div className="lg:col-span-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                  Analytics & Progress
                </span>

                {/* Gauge Semicircular de Admisión */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    UNAM / Tec Admission Predictor
                  </span>
                  <div className="relative w-32 h-20 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 160 90">
                      <path
                        d="M 20 80 A 60 60 0 0 1 140 80"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 80 A 60 60 0 0 1 140 80"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="12"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * admissionProbability) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute bottom-1 text-center">
                      <span className="text-2xl font-black text-indigo-400 block">
                        {admissionProbability}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    PROBABILITY OF ACCEPTANCE
                  </span>
                </div>

                {/* Métricas de Peer Benchmark */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Time Elapsed:</span>
                    <span className="font-mono text-white">04:18</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">You (Percentil):</span>
                      <span className="text-indigo-400 font-bold">{admissionProbability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${admissionProbability}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Top 5% Generación:</span>
                      <span className="text-slate-300 font-bold">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Difficulty:</span>
                  <span className="font-bold text-amber-400 uppercase">HARD</span>
                </div>
              </div>

            </div>

            {/* Footer de UniMastery Pro */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedCalculusOption(null);
                  setIsCalculusSolved(false);
                  setAdmissionProbability(94);
                  setCodeEditorOutput(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Reactivo</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20"
              >
                Guardar Progreso y Salir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PORTAFOLIO DE COMPETENCIAS, RADAR PENTAGONAL & ACADEMIC HEATMAP */}
      {/* ========================================================================= */}
      {activeModal === 'radarPortfolio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-5xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            {/* Header del Portafolio */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Portafolio Académico de Alta Gama & Credenciales Criptográficas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Radar Pentagonal de Competencias, Academic Heatmap de 365 Días y Verificación QR
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Principal: Radar + Heatmap (Izquierda) y Credenciales QR (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Columna Izquierda (Lg: 8): Radar Pentagonal + Heatmap de Actividad */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Gráfica de Radar Pentagonal SVG */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-inner flex flex-col items-center">
                  <span className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-2 self-start">
                    Evaluación Pentagonal de Competencias Egresadas
                  </span>

                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 300">
                      {/* Círculos y Polígonos de Fondo (25%, 50%, 75%, 100%) */}
                      {[0.25, 0.5, 0.75, 1.0].map((scale, i) => {
                        const r = 100 * scale;
                        return (
                          <polygon
                            key={i}
                            points={`
                              ${150 + r * Math.cos(-Math.PI / 2)},${150 + r * Math.sin(-Math.PI / 2)}
                              ${150 + r * Math.cos(-Math.PI / 2 + (2 * Math.PI) / 5)},${150 + r * Math.sin(-Math.PI / 2 + (2 * Math.PI) / 5)}
                              ${150 + r * Math.cos(-Math.PI / 2 + (4 * Math.PI) / 5)},${150 + r * Math.sin(-Math.PI / 2 + (4 * Math.PI) / 5)}
                              ${150 + r * Math.cos(-Math.PI / 2 + (6 * Math.PI) / 5)},${150 + r * Math.sin(-Math.PI / 2 + (6 * Math.PI) / 5)}
                              ${150 + r * Math.cos(-Math.PI / 2 + (8 * Math.PI) / 5)},${150 + r * Math.sin(-Math.PI / 2 + (8 * Math.PI) / 5)}
                            `}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray={scale === 1 ? 'none' : '3 3'}
                          />
                        );
                      })}

                      {/* Ejes Radiales */}
                      {[0, 1, 2, 3, 4].map(idx => {
                        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 5;
                        return (
                          <line
                            key={idx}
                            x1="150"
                            y1="150"
                            x2={150 + 100 * Math.cos(angle)}
                            y2={150 + 100 * Math.sin(angle)}
                            stroke="#475569"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Polígono de Datos del Alumno */}
                      {/* Math: 95%, STEM: 89%, Redacción: 85%, Liderazgo: 92%, Inglés: 91% */}
                      {(() => {
                        const rMath = (activeStudent.radarScores.math / 100) * 100;
                        const rStem = (activeStudent.radarScores.stem / 100) * 100;
                        const rWriting = (activeStudent.radarScores.writing / 100) * 100;
                        const rLead = (activeStudent.radarScores.leadership / 100) * 100;
                        const rEng = (activeStudent.radarScores.english / 100) * 100;

                        const p0 = `${150 + rMath * Math.cos(-Math.PI / 2)},${150 + rMath * Math.sin(-Math.PI / 2)}`;
                        const p1 = `${150 + rStem * Math.cos(-Math.PI / 2 + (2 * Math.PI) / 5)},${150 + rStem * Math.sin(-Math.PI / 2 + (2 * Math.PI) / 5)}`;
                        const p2 = `${150 + rWriting * Math.cos(-Math.PI / 2 + (4 * Math.PI) / 5)},${150 + rWriting * Math.sin(-Math.PI / 2 + (4 * Math.PI) / 5)}`;
                        const p3 = `${150 + rLead * Math.cos(-Math.PI / 2 + (6 * Math.PI) / 5)},${150 + rLead * Math.sin(-Math.PI / 2 + (6 * Math.PI) / 5)}`;
                        const p4 = `${150 + rEng * Math.cos(-Math.PI / 2 + (8 * Math.PI) / 5)},${150 + rEng * Math.sin(-Math.PI / 2 + (8 * Math.PI) / 5)}`;

                        return (
                          <>
                            <polygon
                              points={`${p0} ${p1} ${p2} ${p3} ${p4}`}
                              fill="rgba(99, 102, 241, 0.25)"
                              stroke="#6366f1"
                              strokeWidth="2.5"
                            />
                            {/* Nodos */}
                            {[p0, p1, p2, p3, p4].map((pt, i) => {
                              const [x, y] = pt.split(',');
                              return <circle key={i} cx={x} cy={y} r="4.5" fill="#38bdf8" stroke="#1e1b4b" strokeWidth="1.5" />;
                            })}
                          </>
                        );
                      })()}

                      {/* Etiquetas de Vértices */}
                      <text x="150" y="32" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">
                        Pensamiento Matemático ({activeStudent.radarScores.math})
                      </text>
                      <text x="250" y="115" textAnchor="start" fill="#34d399" fontSize="10" fontWeight="bold">
                        Habilidades STEM ({activeStudent.radarScores.stem})
                      </text>
                      <text x="215" y="245" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">
                        Redacción & Oratoria ({activeStudent.radarScores.writing})
                      </text>
                      <text x="85" y="245" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">
                        Liderazgo ({activeStudent.radarScores.leadership})
                      </text>
                      <text x="50" y="115" textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        Inglés C1 ({activeStudent.radarScores.english})
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Academic Heatmap (Actividad de 365 días) */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Actividad Académica - Último Año (365 días de constancia)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Academic commits and tasks completed
                    </span>
                  </div>

                  {/* Grid de Cuadritos Verdes */}
                  <div className="grid grid-cols-26 sm:grid-cols-52 gap-1 py-1">
                    {Array.from({ length: 156 }).map((_, i) => {
                      // Intensidad de verde aleatoria pero consistente
                      const intensity = (i * 7) % 5;
                      const bgClass = 
                        intensity === 4 ? 'bg-emerald-400' :
                        intensity === 3 ? 'bg-emerald-500' :
                        intensity === 2 ? 'bg-emerald-700' :
                        intensity === 1 ? 'bg-emerald-900' : 'bg-slate-900';
                      return (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-sm ${bgClass}`}
                          title={`Día ${i + 1}: ${intensity * 2 + 1} entregas académicas completadas`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Ene</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                    <span>Nov</span>
                    <div className="flex items-center gap-1">
                      <span>Menos</span>
                      <div className="w-2 h-2 rounded-sm bg-slate-900" />
                      <div className="w-2 h-2 rounded-sm bg-emerald-900" />
                      <div className="w-2 h-2 rounded-sm bg-emerald-700" />
                      <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                      <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                      <span>Más</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Columna Derecha (Lg: 4): 3 Credenciales Verificadas con Código QR */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block">
                  Credenciales Criptográficas con QR Verificable:
                </span>

                {/* 1. Ceneval Gold Medalist */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40">
                      EXCELENCIA ACADÉMICA
                    </span>
                    <h4 className="text-xs font-black text-white">Ceneval Gold Medalist</h4>
                    <p className="text-[10px] text-slate-400">Puntaje Sobresaliente Nacional (1,280 pts)</p>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                    {/* SVG Simulador de QR Nítido */}
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="#000000">
                      <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5 0h1v1H9V4zm1 1h1v1h-1V5zm-1 1h1v1H9V6zm-7 5h7v7H2v-7zm2 2v3h3v-3H4zm7-2h2v2h-2v-2zm3 0h2v1h-2v-1zm-1 2h1v1h-1v-1zm2 0h1v2h-1v-2zm-3 1h1v2h-1v-2zm-3 2h2v1h-2v-1zm4 0h1v1h-1v-1zm2 0h2v2h-2v-2zm-5 1h1v2h-1v-2zm7 0h1v1h-1v-1zm-9 1h1v1H8v-1zm4 0h1v1h-1v-1zm3 0h1v1h-1v-1zM2 13h1v1H2v-1zm13-11h7v7h-7V2zm2 2v3h3V4h-3z" />
                    </svg>
                  </div>
                </div>

                {/* 2. Cambridge C1 Certified */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black border border-indigo-500/40">
                      CEFR LEVEL C1
                    </span>
                    <h4 className="text-xs font-black text-white">Cambridge English C1</h4>
                    <p className="text-[10px] text-slate-400">Dominio Avanzado para Admisiones Globales</p>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="#000000">
                      <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5 0h1v1H9V4zm1 1h1v1h-1V5zm-1 1h1v1H9V6zm-7 5h7v7H2v-7zm2 2v3h3v-3H4zm7-2h2v2h-2v-2zm3 0h2v1h-2v-1zm-1 2h1v1h-1v-1zm2 0h1v2h-1v-2zm-3 1h1v2h-1v-2zm-3 2h2v1h-2v-1zm4 0h1v1h-1v-1zm2 0h2v2h-2v-2zm-5 1h1v2h-1v-2zm7 0h1v1h-1v-1zm-9 1h1v1H8v-1zm4 0h1v1h-1v-1zm3 0h1v1h-1v-1zM2 13h1v1H2v-1zm13-11h7v7h-7V2zm2 2v3h3V4h-3z" />
                    </svg>
                  </div>
                </div>

                {/* 3. SEP - PDA 100% Logro Máximo */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-500/40">
                      CURRICULAR SEP FASE 6
                    </span>
                    <h4 className="text-xs font-black text-white">SEP - PDA 100% Logro</h4>
                    <p className="text-[10px] text-slate-400">Validado en Bóveda Curricular Institucional</p>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="#000000">
                      <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5 0h1v1H9V4zm1 1h1v1h-1V5zm-1 1h1v1H9V6zm-7 5h7v7H2v-7zm2 2v3h3v-3H4zm7-2h2v2h-2v-2zm3 0h2v1h-2v-1zm-1 2h1v1h-1v-1zm2 0h1v2h-1v-2zm-3 1h1v2h-1v-2zm-3 2h2v1h-2v-1zm4 0h1v1h-1v-1zm2 0h2v2h-2v-2zm-5 1h1v2h-1v-2zm7 0h1v1h-1v-1zm-9 1h1v1H8v-1zm4 0h1v1h-1v-1zm3 0h1v1h-1v-1zM2 13h1v1H2v-1zm13-11h7v7h-7V2zm2 2v3h3V4h-3z" />
                    </svg>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-[11px] text-slate-300">
                  <strong className="text-indigo-300 block mb-0.5">Firma Criptográfica HMAC-SHA256:</strong>
                  Cualquier universidad puede escanear el QR para contrastar los resultados directamente con el Repositorio Central de ISkool.
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20"
              >
                Cerrar Portafolio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MENTORÍA HISTÓRICA IA (MARIE CURIE & LEONARDO DA VINCI - REGLA 2) */}
      {/* ========================================================================= */}
      {activeModal === 'mentorship' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Mentoría Ejecutiva de Figuras Históricas en Primera Persona
                  </h3>
                  <p className="text-xs text-slate-400">
                    Asesoría de Vanguardia con Marie Curie y Leonardo da Vinci · Canon Inviolable
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopSpeech();
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Mentor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Marie Curie */}
              <div 
                onClick={() => handleMentorSpeech('curie')}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all space-y-3 ${
                  activeMentor === 'curie'
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-xl ring-2 ring-indigo-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src="/redisenos_assets/torneo_tcg/tcg_card_marie_curie.jpg"
                    alt="Marie Curie"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/60 shadow-md"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 block">
                      Doble Premio Nobel (Física & Química)
                    </span>
                    <h4 className="text-base font-black text-white">Marie Curie (1867-1934)</h4>
                    <span className="text-xs text-emerald-400 font-bold">En línea: Asesorando en Rigor Experimental</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  "En mis investigaciones en París descubrí el polonio y el radio, demostrando que la energía emana de la estructura atómica. En tu proyecto de biotecnología, la pulcritud experimental y la constancia analítica son los únicos caminos hacia la innovación."
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Mentoría Activa</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMentorSpeech('curie');
                    }}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar a Marie Curie</span>
                  </button>
                </div>
              </div>

              {/* Leonardo da Vinci */}
              <div 
                onClick={() => handleMentorSpeech('davinci')}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all space-y-3 ${
                  activeMentor === 'davinci'
                    ? 'bg-amber-950/80 border-amber-500 shadow-xl ring-2 ring-amber-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src="/redisenos_assets/torneo_tcg/tcg_card_leonardo_davinci.jpg"
                    alt="Leonardo da Vinci"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-md"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 block">
                      Polímata del Renacimiento
                    </span>
                    <h4 className="text-base font-black text-white">Leonardo da Vinci (1452-1519)</h4>
                    <span className="text-xs text-amber-400 font-bold">En línea: Asesorando en Prototipado y Diseño</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  "En mis talleres de Florencia y Milán uní el estudio anatómico con el diseño de máquinas hidráulicas y voladoras. Tu hipótesis de innovación debe nacer siempre de la observación rigurosa de las leyes de la naturaleza."
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Mentoría Activa</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMentorSpeech('davinci');
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar a Da Vinci</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  stopSpeech();
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20"
              >
                Finalizar Sesión de Mentoría
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PEDESTAL EJECUTIVO 3D & VESTUARIO DE FUNDADOR */}
      {/* ========================================================================= */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Pedestal Ejecutivo 3D & Vestuario de Fundador
                  </h3>
                  <p className="text-xs text-slate-400">
                    Personalización de Atuendos Ejecutivos de Élite y Motor de Avatares
                  </p>
                </div>
              </div>

              {/* Selector de Modo: Renders 3D vs Anime Sprite */}
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setCustomizerMode('3d_renders');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      customizerMode === '3d_renders'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Renders 3D
                  </button>
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setCustomizerMode('anime_sprite');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      customizerMode === 'anime_sprite'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Motor Anime
                  </button>
                </div>

                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('none');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Taller */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Viewport del Avatar / Pedestal */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-indigo-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                  
                  {customizerMode === '3d_renders' ? (
                    <img
                      src={FOUNDER_CATALOG.find(i => i.id === selectedFounderItem)?.image || '/redisenos_assets/apex_studio/founder_base_pedestal.jpg'}
                      alt="Founder 3D"
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-52 h-52 relative">
                      <AnimeAvatarSprite
                        rpgClass="mago"
                        animationState={spriteAnimation}
                        hairStyle="short"
                        hairColor="dark"
                        equippedOuterwear="traje_ejecutivo"
                        showPedestal={true}
                      />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-indigo-300 border border-indigo-400/30">
                    {customizerMode === '3d_renders' ? 'Render Fotorrealista Silicon Valley' : 'Sprite Modular SVG'}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {FOUNDER_CATALOG.find(i => i.id === selectedFounderItem)?.name}
                  </div>
                </div>

                {customizerMode === 'anime_sprite' && (
                  <div className="mt-3 flex items-center gap-1.5 w-full justify-center">
                    {(['idle', 'cast', 'cheer'] as const).map(anim => (
                      <button
                        key={anim}
                        onClick={() => {
                          gamificationAudio.playClickSound();
                          setSpriteAnimation(anim);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          spriteAnimation === anim
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Catálogo de Ítems de Fundador */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-2">
                    Accesorios Ejecutivos de Élite:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FOUNDER_CATALOG.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquipItem(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedFounderItem === item.id
                            ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] opacity-75">{item.category}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black/30">
                            {item.rarity}
                          </span>
                        </div>
                        <strong className="text-xs block">{item.name}</strong>
                        <span className="text-[10px] opacity-90 block mt-0.5">{item.stats}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-indigo-300 block mb-1">Especificación del Accesorio:</strong>
                  {FOUNDER_CATALOG.find(i => i.id === selectedFounderItem)?.description}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20"
              >
                Confirmar Configuración y Salir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SERVICIOS DE ACELERACIÓN & RONDA DE INVERSIÓN */}
      {/* ========================================================================= */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Servicios de Aceleración Pro & Venture Credits</h3>
                  <p className="text-xs text-slate-400">Inversión de Créditos Académicos en Propiedad Intelectual</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: ${activeStudent.ventureCredits.toLocaleString()} VF
                </span>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300">Asesoría de Registro de Patente Escolar</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Protege la propiedad intelectual del proyecto en la Bóveda Curricular y eleva la valuación a $3.5M MXN.
                  </p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playCoinSound();
                    setActiveStudent(prev => ({ ...prev, ventureCredits: Math.max(0, prev.ventureCredits - 1500) }));
                    showToast("¡Asesoría de Patente adquirida! Valuación de startup incrementada 📜");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 shadow-md"
                >
                  1,500 VF
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Auditoría ESG & Sostenibilidad Global</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Aval internacional de sustentabilidad para postulaciones de pregrado en Europa y Norteamérica.
                  </p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playCoinSound();
                    setActiveStudent(prev => ({ ...prev, ventureCredits: Math.max(0, prev.ventureCredits - 2000) }));
                    showToast("¡Auditoría ESG completada! Sello de sustentabilidad añadido al portafolio 🌱");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0 shadow-md"
                >
                  2,000 VF
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE · REGLA 1 CUMPLIDA) */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400">
                    Universal Challenge Studio · Panel Docente
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Rúbricas Analíticas Complejas para Preparatoria (Fase 6 SEP)
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-indigo-400 block text-sm">
                  1. Evaluación Automatizada de Tesis y Reportes
                </span>
                <p>
                  El docente ingresa los criterios analíticos estandarizados; el sistema evalúa automáticamente la redacción formal, citas de fuentes académicas y rigurosidad metodológica, traduciendo los resultados al radar de competencias del estudiante.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-emerald-400 block text-sm">
                  2. Ecosistema Institucional de Productividad Cloud y Bóveda
                </span>
                <p>
                  Las tesis, diagramas de circuitos y modelos matemáticos se respaldan automáticamente en el <strong className="text-white">Almacenamiento Cloud Seguro Cifrado</strong> del colegio con autenticación única institucional (@colegio.edu.mx) y sincronización con la <strong className="text-white">Bóveda Curricular</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-cyan-400 block text-sm">
                  3. Portafolio de Egreso Verificable con Firma Criptográfica
                </span>
                <p>
                  Genera un enlace institucional seguro avalado con firma digital HMAC-SHA256 y código QR para comités de admisión de universidades internacionales y fondos de becas de excelencia.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20"
              >
                Cerrar Panel Docente
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: INSPECCIÓN DE TELEMETRÍA DE HOTSPOT */}
      {/* ========================================================================= */}
      {activeModal === 'telemetryHotspot' && inspectedHotspot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {inspectedHotspot.title}
              </h3>
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectedHotspot.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-indigo-400 block">
                Métricas del Pipeline:
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {inspectedHotspot.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  inspectedHotspot.onAction();
                  setActiveModal('none');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20"
              >
                {inspectedHotspot.actionName}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST FLOTANTE DE NOTIFICACIÓN HÁPTICA */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-indigo-300 border border-indigo-500/50 shadow-2xl text-xs font-black flex items-center gap-2.5 animate-in slide-in-from-bottom-3 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
