// src/app/redisenos_gamificados/nexus_protocol_research_guild/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe2, 
  FileText, 
  Award, 
  Atom, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Compass, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  QrCode, 
  Terminal, 
  Activity, 
  Check, 
  GitBranch, 
  Network,
  Volume2,
  VolumeX,
  Eye,
  Vote,
  TrendingUp,
  ShieldCheck,
  ThumbsUp,
  Code,
  Flame,
  Sliders,
  Users
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';

// =========================================================================
// 1. MODELOS DE DATOS: INVESTIGADORES & THINK TANK GLOBAL (FASE 6 SEP)
// =========================================================================

interface ResearcherStudent {
  id: string;
  name: string;
  semester: string;
  fellowshipTitle: string;
  avatarIcon: string;
  publishedPapers: number;
  hIndex: number;
  diplomacyPoints: number;
  computeHours: number;
  activeTesis: string;
  unlockedMasteryNodes: number;
  rankTitle: string;
  rankLevel: number;
  equippedCredential: {
    badge: string;
    clearanceLevel: string;
  };
  activeRenderKey: 'base' | 'capa' | 'band' | 'relicario';
}

const INITIAL_RESEARCHERS: ResearcherStudent[] = [
  {
    id: 'res-elena',
    name: 'Elena Rostova',
    semester: '6º Semestre · Bachillerato Internacional',
    fellowshipTitle: 'Senior Fellow en Diplomacia Científica & Cuántica',
    avatarIcon: '🌐',
    publishedPapers: 5,
    hIndex: 4,
    diplomacyPoints: 3400,
    computeHours: 120,
    activeTesis: 'Modelado Estocástico de Sequías en Cuencas del Norte de México',
    unlockedMasteryNodes: 14,
    rankTitle: 'Nova Researcher',
    rankLevel: 14,
    equippedCredential: {
      badge: 'Beca de Publicación Open-Access Q1',
      clearanceLevel: 'Nivel 5 · Cuántico'
    },
    activeRenderKey: 'capa'
  },
  {
    id: 'res-julian',
    name: 'Julián Carvajal',
    semester: '5º Semestre · Bachillerato Tecnológico',
    fellowshipTitle: 'Investigador Asociado de Física Cuántica & Grafeno',
    avatarIcon: '⚛️',
    publishedPapers: 3,
    hIndex: 2,
    diplomacyPoints: 2100,
    computeHours: 85,
    activeTesis: 'Cálculo de Densidad de Estados en Materiales 2D Grafeno',
    unlockedMasteryNodes: 11,
    rankTitle: 'Associate Fellow',
    rankLevel: 11,
    equippedCredential: {
      badge: 'Acceso a Supercómputo Paralelo',
      clearanceLevel: 'Nivel 4 · Avanzado'
    },
    activeRenderKey: 'relicario'
  },
  {
    id: 'res-andrea',
    name: 'Andrea Morales',
    semester: '4º Semestre · Bachillerato General',
    fellowshipTitle: 'Analista de Políticas Geopolíticas & Filosofía Ética',
    avatarIcon: '📜',
    publishedPapers: 2,
    hIndex: 2,
    diplomacyPoints: 1650,
    computeHours: 40,
    activeTesis: 'Impacto Ético de la Automatización en el Empleo Juvenil',
    unlockedMasteryNodes: 8,
    rankTitle: 'Junior Analyst',
    rankLevel: 8,
    equippedCredential: {
      badge: 'Acreditación de Laboratorio Social',
      clearanceLevel: 'Nivel 3 · Intermedio'
    },
    activeRenderKey: 'band'
  }
];

// Catálogo de Atuendos y Reliquias Científicas
interface ResearcherGear {
  id: 'base' | 'capa' | 'band' | 'relicario';
  name: string;
  category: 'Indumentaria Base' | 'Toga de Maestría' | 'Óptica Neural' | 'Artefacto Cuántico';
  stats: string;
  description: string;
  image: string;
  rarity: 'Investigador' | 'Magíster' | 'Senior Fellow' | 'Singularidad';
  badgeColor: string;
}

const RESEARCHER_CATALOG: ResearcherGear[] = [
  {
    id: 'base',
    name: 'Bata de Investigación y Laboratorio Base',
    category: 'Indumentaria Base',
    stats: '+15% Rigor en Análisis de Muestras',
    description: 'Bata blanca de fibra antiestática con bolsillos blindados para instrumentos de precisión y credencial biométrica de laboratorio.',
    image: '/redisenos_assets/nexus_guild/investigador_base_pedestal.jpg',
    rarity: 'Investigador',
    badgeColor: 'from-slate-600 to-slate-800'
  },
  {
    id: 'capa',
    name: 'Toga Académica con Astrolabio y Constelaciones',
    category: 'Toga de Maestría',
    stats: '+45% Reputación en Comités Doctorales',
    description: 'Túnica de gala bordada con constelaciones astronómicas y filamentos conductores que simbolizan la unión entre ciencia y humanismo.',
    image: '/redisenos_assets/nexus_guild/investigador_capa_academica.jpg',
    rarity: 'Magíster',
    badgeColor: 'from-indigo-600 to-violet-800'
  },
  {
    id: 'band',
    name: 'Diadema Neural Violeta de Constelaciones',
    category: 'Óptica Neural',
    stats: '+30% Enfoque en Tensores & Cálculo',
    description: 'Corona de sincronización bioeléctrica con sensores EEG que monitorea la fatiga cognitiva y optimiza las horas de supercómputo.',
    image: '/redisenos_assets/nexus_guild/investigador_neural_band.jpg',
    rarity: 'Senior Fellow',
    badgeColor: 'from-purple-600 to-fuchsia-800'
  },
  {
    id: 'relicario',
    name: 'Relicario Cuántico de Singularidad Estelar',
    category: 'Artefacto Cuántico',
    stats: '+50% Aceleración en Simulaciones Monte Carlo',
    description: 'Esfera de confinamiento magnético que preserva un estado de superposición cuántica para calibrar algoritmos de criptografía.',
    image: '/redisenos_assets/nexus_guild/investigador_relicario_cuantico.jpg',
    rarity: 'Singularidad',
    badgeColor: 'from-emerald-600 to-teal-800'
  }
];

// Nodos del Grafo de Maestría Curricular
interface MasteryNode {
  id: string;
  title: string;
  discipline: string;
  status: 'dominado' | 'investigando' | 'bloqueado';
  level: string;
  unlockRequirement?: string;
  vaultLink: string;
}

const MASTERY_TREE_NODES: MasteryNode[] = [
  { 
    id: 'node-calc', 
    title: 'Cálculo Multivariable & Tensores', 
    discipline: 'Matemáticas', 
    status: 'dominado', 
    level: 'Nivel 1',
    vaultLink: 'planeaciones/fase6/matematicas/calculo_multivariable.md'
  },
  { 
    id: 'node-ai', 
    title: 'Redes Neuronales y Filosofía Ética', 
    discipline: 'Ciencias de Cómputo', 
    status: 'investigando', 
    level: 'Nivel 2',
    unlockRequirement: 'Dominar Cálculo Multivariable',
    vaultLink: 'planeaciones/fase6/tecnologia/inteligencia_artificial_etica.md'
  },
  { 
    id: 'node-bio', 
    title: 'Biología Molecular & CRISPR-Cas', 
    discipline: 'Biotecnología', 
    status: 'dominado', 
    level: 'Nivel 1',
    vaultLink: 'planeaciones/fase6/ciencias/biologia_molecular_genomica.md'
  },
  { 
    id: 'node-pol', 
    title: 'Diplomacia Científica & Tratados ONU', 
    discipline: 'Ciencias Sociales', 
    status: 'investigando', 
    level: 'Nivel 3',
    unlockRequirement: 'Completar Tesis en Bioseguridad',
    vaultLink: 'planeaciones/fase6/humanidades/diplomacia_cientifica_soberania.md'
  },
  { 
    id: 'node-quant', 
    title: 'Mecánica Cuántica & Materiales 2D', 
    discipline: 'Física Avanzada', 
    status: 'dominado', 
    level: 'Nivel 2',
    vaultLink: 'planeaciones/fase6/ciencias/mecanica_cuantica_grafeno.md'
  },
  { 
    id: 'node-arch', 
    title: 'Arquitectura de Software Descentralizado', 
    discipline: 'Tecnología', 
    status: 'bloqueado', 
    level: 'Nivel 4',
    unlockRequirement: 'Aprobar Protocolo de Criptografía de Clave Pública',
    vaultLink: 'planeaciones/fase6/tecnologia/arquitectura_descentralizada.md'
  }
];

export default function NexusProtocolResearchGuildPage() {
  // Estado de Alumno Activo
  const [activeStudent, setActiveStudent] = useState<ResearcherStudent>(INITIAL_RESEARCHERS[0]);

  // Modo de Vista Principal: 'canvas169' (Lienzo Ejecutivo) | 'knowledgeGraph' (Grafo)
  const [activeViewMode, setActiveViewMode] = useState<'canvas169' | 'knowledgeGraph'>('canvas169');

  // Modales interactivos
  const [activeModal, setActiveModal] = useState<
    'none' | 'careerRoadmap' | 'commitHeatmap' | 'thesisDefense' | 'debateHistórico' | 'locker' | 'store' | 'teacherStudio' | 'telemetryHotspot'
  >('none');

  // Estado del Hotspot inspeccionado
  const [inspectedHotspot, setInspectedHotspot] = useState<{
    title: string;
    description: string;
    specs: string[];
    actionName: string;
    onAction: () => void;
  } | null>(null);

  // Estados de Defensa de Tesis (Desafío Científico)
  const [selectedThesisArgument, setSelectedThesisArgument] = useState<number | null>(null);
  const [isThesisApproved, setIsThesisApproved] = useState<boolean>(false);

  // Estados de Debate Histórico (Regla No Negociable 2)
  const [activeDebater, setActiveDebater] = useState<'juarez' | 'curie'>('juarez');
  const [isSpeakingDebater, setIsSpeakingDebater] = useState<boolean>(false);

  // Estados de Taller y Avatar
  const [customizerMode, setCustomizerMode] = useState<'3d_renders' | 'anime_sprite'>('3d_renders');
  const [selectedResearcherItem, setSelectedResearcherItem] = useState<'base' | 'capa' | 'band' | 'relicario'>('capa');
  const [spriteAnimation, setSpriteAnimation] = useState<'idle' | 'cast' | 'cheer'>('idle');

  // Estado de Votos del Proyecto Destacado (Aethernet Redesign)
  const [projectVotes, setProjectVotes] = useState<number>(345);
  const [hasVotedProject, setHasVotedProject] = useState<boolean>(false);

  // Notificaciones
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // 2. SÍNTESIS DE VOZ Y CANON EN PRIMERA PERSONA ESTRICTA (REGLA 2)
  // =========================================================================

  const speakText = (text: string, isDebater = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      if (isDebater) {
        utter.rate = 0.93;
        utter.pitch = activeDebater === 'juarez' ? 0.85 : 1.05;
        setIsSpeakingDebater(true);
        utter.onend = () => setIsSpeakingDebater(false);
        utter.onerror = () => setIsSpeakingDebater(false);
      } else {
        utter.rate = 1.04;
        utter.pitch = 1.05;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignorar bloqueo sin gesto del usuario
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingDebater(false);
    }
  };

  // Discursos en Primera Persona Estricta de Próceres y Científicos (Regla 2)
  const handleDebaterSpeech = (debaterKey: 'juarez' | 'curie') => {
    gamificationAudio.playClickSound();
    setActiveDebater(debaterKey);

    let monologue = "";
    if (debaterKey === 'juarez') {
      monologue = 
        "Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz. " +
        "En mis años de lucha por la República frente a la intervención extranjera y al promulgar las Leyes de Reforma en Veracruz y Paso del Norte, " +
        "sostuve con firmeza que la legalidad constitucional es el único baluarte que preserva la soberanía de una patria libre. " +
        "Tu investigación científica debe guiarse siempre por el servicio al bien común y el apego estricto a la justicia.";
      showToast("Benito Juárez comparte su visión de soberanía en primera persona 📜");
    } else {
      monologue = 
        "En mis laboratorios de París aislé el radio y el polonio en condiciones de extrema exigencia técnica. " +
        "Demostré que la energía emana de la estructura profunda del átomo sin ceder jamás al desaliento ni a la fatiga. " +
        "En tu investigación de supercómputo y materiales cuánticos, la rigurosidad metódica es la única guía legítima.";
      showToast("Marie Curie comparte su mentoría en primera persona 🧪");
    }

    speakText(monologue, true);
  };

  // =========================================================================
  // 3. RESOLUCIÓN DE LA DEFENSA DE TESIS
  // =========================================================================

  const handleDefendThesis = (idx: number) => {
    setSelectedThesisArgument(idx);

    if (idx === 1) {
      // Argumento correcto: Rigor Científico
      gamificationAudio.playVictorySound();
      gamificationAudio.playLevelUpSound();
      setIsThesisApproved(true);
      setActiveStudent(prev => ({
        ...prev,
        diplomacyPoints: prev.diplomacyPoints + 300,
        publishedPapers: prev.publishedPapers + 1
      }));
      const explanation = 
        "¡Defensa de tesis aprobada por unanimidad! La triangulación con estaciones terrestres oficiales, " +
        "la validación cruzada y los estimadores bayesianos garantizan la reproducibilidad científica internacional.";
      speakText(explanation, false);
      showToast("¡Tesis aprobada con honores! +300 Puntos de Diplomacia y nuevo Paper indexado 🎓");
    } else {
      gamificationAudio.playErrorSound();
      showToast("El comité doctoral rechaza la propuesta. Ignorar anomalías o delegar sin contraste empírico vulnera el método científico.");
    }
  };

  const handleVoteProject = () => {
    if (hasVotedProject) return;
    gamificationAudio.playClickSound();
    gamificationAudio.playMagicCastSound();
    setProjectVotes(prev => prev + 1);
    setHasVotedProject(true);
    showToast("¡Voto registrado en el registro distribuido! Proyecto Aethernet +1 Upvote 🚀");
  };

  const handleEquipItem = (gearId: 'base' | 'capa' | 'band' | 'relicario') => {
    gamificationAudio.playClickSound();
    setSelectedResearcherItem(gearId);
    setActiveStudent(prev => ({
      ...prev,
      activeRenderKey: gearId
    }));
    gamificationAudio.playMagicCastSound();
    showToast(`¡Regalía [${RESEARCHER_CATALOG.find(i => i.id === gearId)?.name}] equipada en el pedestal de investigación! 🌌`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans pb-12">
      
      {/* ========================================================================= */}
      {/* HEADER SUPERIOR: IDENTIDAD DE NEXUS PROTOCOL */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-emerald-900/40 px-4 sm:px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo y Retorno */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link 
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 border border-emerald-300">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Nexus Protocol Research Guild</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                    Think Tank Global · Preparatoria
                  </span>
                </h1>
                <p className="text-[11px] text-emerald-200/70 font-medium">
                  Árbol de Maestría, Diplomacia Científica & Supercómputo · Fase 6 SEP
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Investigador y Métricas Rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
            
            {/* Píldoras de los 3 Investigadores */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-emerald-900/40">
              {INITIAL_RESEARCHERS.map(res => (
                <button
                  key={res.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudent(res);
                    setSelectedResearcherItem(res.activeRenderKey);
                    showToast(`Investigador activo: ${res.name} (${res.fellowshipTitle})`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeStudent.id === res.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{res.avatarIcon}</span>
                  <span className="hidden sm:inline">{res.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Métricas Científicas en Vivo */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-900/40 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-300" title="Papers Publicados con Índice H">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                {activeStudent.publishedPapers} Papers (h-{activeStudent.hIndex})
              </span>
              <span className="flex items-center gap-1 text-teal-300" title="Puntos de Diplomacia Científica">
                <Globe2 className="w-3.5 h-3.5 text-teal-400" />
                {activeStudent.diplomacyPoints} Diplomacia
              </span>
              <span className="flex items-center gap-1 text-cyan-300" title="Horas de Supercómputo Paralelo">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.computeHours}h Cómputo
              </span>
            </div>

            {/* Botones de Acción de Pantalla */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('careerRoadmap');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Roadmap</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('commitHeatmap');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-700/50 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Heatmap</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('debateHistórico');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Debate Próceres</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold"
                title="Pedestal de Investigación 3D & Reliquias"
              >
                <Award className="w-4 h-4 text-amber-400" />
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
      {/* CUERPO PRINCIPAL DEL THINK TANK */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* BANNER DE IDENTIDAD Y SELECTOR DE VISTA (CANVAS 16:9 VS GRAFO) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-emerald-900/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                {activeStudent.fellowshipTitle} · {activeStudent.equippedCredential.clearanceLevel}
              </span>
              <span className="text-xs text-slate-400 font-medium">{activeStudent.semester}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} Think Tank de {activeStudent.name}</span>
              <span className="text-xs text-slate-400 font-normal">({activeStudent.rankTitle} L-{activeStudent.rankLevel})</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Tesis Doctoral: <strong className="text-emerald-400">{activeStudent.activeTesis}</strong> · {activeStudent.unlockedMasteryNodes} Nodos Curriculares Dominados
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('canvas169');
                  showToast("Modo: Terminal Científica 16:9 Nexus Guild Dashboard");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'canvas169'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lienzo 16:9</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('knowledgeGraph');
                  showToast("Modo: Grafo de Maestría & Nodos Curriculares");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'knowledgeGraph'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Grafo de Nodos</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANTALLA 1: LIENZO MAESTRO 16:9 INMACULADO CON HOTSPOTS NANO BANANA */}
        {/* ========================================================================= */}
        {activeViewMode === 'canvas169' && (
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-600/40 bg-slate-950 select-none group">
            
            {/* IMAGEN MAESTRA DE FONDO OFICIAL (16:9) */}
            <img 
              src="/redisenos_assets/gamification_preparatoria_nexus_protocol_1792732922568.jpg"
              alt="Nexus Protocol Guild Dashboard 16:9"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* OVERLAY DE VIGNETTE Y LUZ VERDE/TEAL AMBIENTAL */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />

            {/* ========================================================================= */}
            {/* HUD FLOTANTE SUPERIOR DENTRO DEL LIENZO */}
            {/* ========================================================================= */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              
              {/* Telemetría Flotante Izquierda */}
              <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/40 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-emerald-300 tracking-wider">
                    Think Tank de Investigación Global
                  </span>
                </div>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  h-{activeStudent.hIndex}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-teal-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400" />
                  542 Commits
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  {activeStudent.computeHours}h Supercómputo
                </span>
              </div>

              {/* Botón de Debate con Benito Juárez */}
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('debateHistórico');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-xl shadow-emerald-500/20 transition-all border border-emerald-300"
                title="Debate Constitucional con Benito Juárez en primera persona"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Debate Benito Juárez</span>
                {isSpeakingDebater && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </button>
            </div>

            {/* ========================================================================= */}
            {/* HOTSPOTS TRANSPARENTES MILIMÉTRICOS (NANO BANANA GRID) */}
            {/* ========================================================================= */}

            {/* 1. GUILD COMMIT HEATMAP (ARRIBA IZQUIERDA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('commitHeatmap');
              }}
              className="absolute top-[13%] left-[7%] w-[36%] h-[42%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-emerald-400/50 hover:border-emerald-300 hover:bg-emerald-500/15 transition-all flex items-center justify-center"
              title="Guild Commit Heatmap: 542 Commits y Racha de 21 Días"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                📊 Commit Heatmap (542 Commits)
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/70 animate-ping" />
            </div>

            {/* 2. PROJECT SHOWCASE: AETHERNET REDESIGN (CENTRO ARRIBA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Project Showcase: Aethernet Redesign (Team Cypher)',
                  description: 'Plataforma descentralizada de intercambio científico desarrollada con React, ciberseguridad avanzada y machine learning para auditoría de papers.',
                  specs: [
                    'Equipo: Team Cypher (4 Investigadores)',
                    `Impacto Comunitario: 1.2k Vistas · ${projectVotes} Upvotes`,
                    'Categoría: Web Dev / IA / Seguridad Criptográfica'
                  ],
                  actionName: hasVotedProject ? 'Voto Registrado ✓' : 'Emitir Voto de Reconocimiento (+1 Upvote)',
                  onAction: () => {
                    handleVoteProject();
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[13%] left-[44%] w-[33%] h-[46%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-teal-400/50 hover:border-teal-300 hover:bg-teal-500/15 transition-all flex items-center justify-center"
              title="Project Showcase: Aethernet Redesign (Web Dev / AI)"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🚀 Aethernet Project ({projectVotes} Upvotes)
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-teal-400/70 animate-ping" />
            </div>

            {/* 3. CAREER PATHWAYS ROADMAP (DERECHA ARRIBA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('careerRoadmap');
              }}
              className="absolute top-[13%] left-[78%] w-[19%] h-[53%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-indigo-400/50 hover:border-indigo-300 hover:bg-indigo-500/15 transition-all flex items-center justify-center"
              title="Career Pathways Roadmap: Start → Data Science → AI → Research Scientist"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🧭 Career Pathways (L-14)
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-400/70 animate-ping" />
            </div>

            {/* 4. ACADEMIC BADGES: BLOCKCHAIN VERIFIED (ABAJO IZQUIERDA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Academic Badges: Verificación Criptográfica en Cadena',
                  description: 'Credenciales emitidas con clave institucional HMAC-SHA256 que avalan el dominio de estándares internacionales (Cambridge C1/C2, Python, Computación Cuántica y Ética de IA).',
                  specs: [
                    'ID de Verificación: NP_BC_ALEXR001',
                    'Acreditaciones Activas: 5 Badges de Excelencia',
                    'Validez: Reconocimiento Internacional Universitario'
                  ],
                  actionName: 'Verificar en Bóveda Curricular',
                  onAction: () => {
                    gamificationAudio.playMagicCastSound();
                    showToast("Credenciales contrastadas con el Repositorio Central de ISkool 📜");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[57%] left-[7%] w-[36%] h-[37%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-500/15 transition-all flex items-center justify-center"
              title="Academic Badges (Blockchain Verified)"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-cyan-300 text-[10px] font-black border border-cyan-500/40 shadow-lg whitespace-nowrap">
                🛡️ Badges Criptográficos (C1, C2, Python, Quantum)
              </div>
            </div>

            {/* 5. QUANTUM SIMULATION & ROBOTIC SWARM (ABAJO CENTRO) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('thesisDefense');
              }}
              className="absolute top-[61%] left-[44%] w-[33%] h-[33%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-300 hover:bg-emerald-500/15 transition-all flex items-center justify-center"
              title="Laboratorios Experimentales: Simulación Cuántica & Enjambre Robótico"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-emerald-300 text-[10px] font-black border border-emerald-500/40 shadow-lg whitespace-nowrap">
                ⚛️ Lab Cuántico & Robótica Autónoma
              </div>
            </div>

            {/* 6. GUILD NEWS & TASKS (ABAJO DERECHA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Guild News & Convocatorias de Investigación',
                  description: 'Boletín científico y convocatorias abiertas a hackathones internacionales, becas de supercómputo y comités de bioética.',
                  specs: [
                    'Hackathon: Registro Abierto para el Desafío Climático',
                    'Nuevos Cursos: Pre-Engineering Research Institute',
                    'Sesiones: Debate sobre Soberanía Constitucional con Próceres'
                  ],
                  actionName: 'Postular a Convocatoria de Hackathon',
                  onAction: () => {
                    gamificationAudio.playVictorySound();
                    showToast("¡Inscripción a Hackathon confirmada! +100 Horas de Cómputo otorgadas 🚀");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[68%] left-[78%] w-[19%] h-[26%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-teal-500/40 hover:border-teal-300 hover:bg-teal-500/15 transition-all flex items-center justify-center"
              title="Guild News & Tasks: Convocatorias y Hackathones"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-teal-300 text-[10px] font-black border border-teal-500/40 shadow-lg whitespace-nowrap">
                📰 Noticias & Hackathones
              </div>
            </div>

            {/* PIE DE PÁGINA DENTRO DEL LIENZO */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Haz clic en cualquier cuadrante del dashboard para acceder al árbol de maestría, heatmap de investigación o debate constitucional.
              </span>
              <span className="font-bold text-emerald-300 hidden md:inline">
                Fase 6 SEP · Preparatoria / Bachillerato
              </span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PANTALLA ALTERNATIVA: GRAFO DE NODOS DE MAESTRÍA (KNOWLEDGE GRAPH) */}
        {/* ========================================================================= */}
        {activeViewMode === 'knowledgeGraph' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MASTERY_TREE_NODES.map(node => (
                <div 
                  key={node.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-emerald-900/40 hover:border-emerald-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                        {node.discipline} · {node.level}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        node.status === 'dominado'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : node.status === 'investigando'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {node.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">{node.title}</h3>
                    {node.unlockRequirement && (
                      <p className="text-[11px] text-amber-300/80 mt-1">
                        Prerrequisito: {node.unlockRequirement}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Bóveda Curricular:</span>
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        showToast(`Enlace a [${node.vaultLink}] persistido en la Bóveda Curricular 📚`);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold"
                    >
                      Ver Nodo .md
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: CAREER PATHWAYS ROADMAP (ÁRBOL VERTICAL DE MAESTRÍA) */}
      {/* ========================================================================= */}
      {activeModal === 'careerRoadmap' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Career Pathways Roadmap | Progresión de Maestría Científica
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nivel Actual: Level {activeStudent.rankLevel} ({activeStudent.rankTitle})
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

            {/* Árbol Vertical de 5 Niveles */}
            <div className="space-y-3">
              {[
                { lvl: 'START', title: 'Fundamentos de Metodología de la Ciencia', status: 'Aprobado', desc: 'Dominio de epistemología, diseño de experimentos y formulación de hipótesis falseables.' },
                { lvl: 'Data Science (L1)', title: 'Inferencia Estadística & Análisis Multivariable', status: 'Aprobado', desc: 'Tratamiento de datasets masivos, cálculo tensorial y modelos estocásticos.' },
                { lvl: 'AI Specialist (L2)', title: 'Redes Neuronales Profundas & Ética de Algoritmos', status: 'Activo', desc: 'Entrenamiento de modelos con supervisión y marcos de responsabilidad algorítmica.' },
                { lvl: 'RESEARCH SCIENTIST (L4)', title: 'Investigación Independiente & Publicación Q1', status: 'En Progreso', desc: 'Redacción de artículos bajo revisión por pares y defensa ante comités académicos.' },
                { lvl: 'LEAD TECH ANALYST (L6)', title: 'Liderazgo en Think Tanks Globales & Diplomacia', status: 'Bloqueado', desc: 'Asesoría a organismos internacionales y dirección de laboratorios interdisciplinarios.' }
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    step.status === 'Aprobado' 
                      ? 'bg-slate-950/90 border-emerald-500/40'
                      : step.status === 'Activo'
                        ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/40 shadow-xl'
                        : 'bg-slate-950/50 border-slate-800 opacity-75'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    step.status === 'Aprobado'
                      ? 'bg-emerald-500 text-slate-950'
                      : step.status === 'Activo'
                        ? 'bg-indigo-500 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.status === 'Aprobado' ? '✓' : idx + 1}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                        {step.lvl}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        step.status === 'Aprobado' ? 'bg-emerald-500/20 text-emerald-300' :
                        step.status === 'Activo' ? 'bg-indigo-500/20 text-indigo-300 font-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white">{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Cerrar Roadmap
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GUILD COMMIT HEATMAP & BADGES VERIFICADOS */}
      {/* ========================================================================= */}
      {activeModal === 'commitHeatmap' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Guild Commit Heatmap & Registro de Actividad
                  </h3>
                  <p className="text-xs text-slate-400">
                    542 Commits Totales · Racha Activa de 21 Días · Categorías SEP
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

            {/* Heatmap Grid con Categorías */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">Distribución de Aprendizaje:</span>
                  <span className="flex items-center gap-1 text-emerald-400"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Research (45%)</span>
                  <span className="flex items-center gap-1 text-cyan-400"><div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Coding (30%)</span>
                  <span className="flex items-center gap-1 text-amber-400"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> STEM (15%)</span>
                  <span className="flex items-center gap-1 text-purple-400"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> English (10%)</span>
                </div>
                <span className="text-emerald-400 font-black">🔥 21 Días de Racha Continua</span>
              </div>

              {/* Matriz de 52 Semanas */}
              <div className="grid grid-cols-26 sm:grid-cols-52 gap-1 py-2">
                {Array.from({ length: 156 }).map((_, i) => {
                  const mod = (i * 11) % 4;
                  const bg = 
                    mod === 0 ? 'bg-emerald-500' :
                    mod === 1 ? 'bg-cyan-500' :
                    mod === 2 ? 'bg-purple-500' : 'bg-amber-500';
                  return (
                    <div 
                      key={i}
                      className={`w-2.5 h-2.5 rounded-sm ${bg} hover:scale-125 transition-transform cursor-pointer`}
                      title={`Commit académico #${i + 1}: Tesis y laboratorio`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                <span>Enero 2024</span>
                <span>Junio 2024</span>
                <span>Diciembre 2024</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Cerrar Heatmap
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DEBATE FILOSÓFICO & CONSTITUCIONAL CON BENITO JUÁREZ (REGLA 2) */}
      {/* ========================================================================= */}
      {activeModal === 'debateHistórico' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Tribuna de Debate Histórico & Soberanía en Primera Persona
                  </h3>
                  <p className="text-xs text-slate-400">
                    Intervención Canónica en Primera Persona Estricta · Benito Juárez & Marie Curie
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

            {/* Dos Figuras de Debate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Benito Juárez */}
              <div 
                onClick={() => handleDebaterSpeech('juarez')}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all space-y-3 ${
                  activeDebater === 'juarez'
                    ? 'bg-emerald-950/80 border-emerald-500 shadow-xl ring-2 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src="/images/history/benito_juarez_avatar.png"
                    alt="Benito Juárez"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-md"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 block">
                      Benemérito de las Américas (1806-1872)
                    </span>
                    <h4 className="text-base font-black text-white">Benito Juárez</h4>
                    <span className="text-xs text-emerald-300 font-bold">Tema: Legalidad Constitucional y Soberanía</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  "Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz. En mis años de lucha por la República frente a la intervención extranjera, sostuve que la ley es el único escudo que protege al pueblo. Tu investigación debe fundamentarse en la justicia constitucional."
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Debate Activo</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDebaterSpeech('juarez');
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar a Benito Juárez</span>
                  </button>
                </div>
              </div>

              {/* Marie Curie */}
              <div 
                onClick={() => handleDebaterSpeech('curie')}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all space-y-3 ${
                  activeDebater === 'curie'
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
                      Doble Premio Nobel de Ciencias
                    </span>
                    <h4 className="text-base font-black text-white">Marie Curie (1867-1934)</h4>
                    <span className="text-xs text-indigo-300 font-bold">Tema: Perseverancia y Rigor Experimental</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  "En mis laboratorios de París aislé el radio y el polonio en condiciones de extrema exigencia. Demostré que la energía emana de la estructura profunda del átomo. La rigurosidad metódica es la única guía legítima para un científico."
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Debate Activo</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDebaterSpeech('curie');
                    }}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-md"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar a Marie Curie</span>
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
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Finalizar Sesión de Debate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DEFENSA DE TESIS & DESAFÍO CIENTÍFICO RIGUROSO */}
      {/* ========================================================================= */}
      {activeModal === 'thesisDefense' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Defensa de Tesis Doctoral ante el Comité Nexus</span>
                    {isThesisApproved && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                        ✓ TESIS APROBADA CON HONORES
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defensa de Metodología y Reproducibilidad Experimental · Fase 6 SEP
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

            {/* Planteamiento del Problema */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 block uppercase tracking-wider">
                Pregunta del Sínodo Académico:
              </span>
              <p className="text-slate-200 leading-relaxed">
                <em>"En su modelo estocástico de sequías hidrológicas para el norte de México, se detectan múltiples valores extremos (outliers) en las estaciones de monitoreo durante el verano. ¿Cuál es la justificación estadística y metodológica para validar su modelo sin incurrir en sesgo confirmatorio?"</em>
              </p>
            </div>

            {/* 3 Opciones de Argumentación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { idx: 0, label: 'PROPUESTA A', text: 'Eliminar los valores atípicos (outliers) para forzar un ajuste lineal visualmente presentable ante el jurado.' },
                { idx: 1, label: 'PROPUESTA B (RIGOR CIENTÍFICO)', text: 'Triangulación con estaciones de CONAGUA, validación cruzada k-fold y estimadores de incertidumbre bayesianos para modelar anomalías.' },
                { idx: 2, label: 'PROPUESTA C', text: 'Delegar el cálculo a un script automatizado sin contrastar con registros hidrométricos históricos de campo.' }
              ].map(item => (
                <button
                  key={item.idx}
                  onClick={() => handleDefendThesis(item.idx)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-40 ${
                    selectedThesisArgument === item.idx
                      ? item.idx === 1
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40 shadow-xl'
                        : 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 block mb-1">
                      {item.label}
                    </span>
                    <p className="text-xs text-slate-300 leading-snug">{item.text}</p>
                  </div>
                  {selectedThesisArgument === item.idx && item.idx === 1 && (
                    <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Aprobada con Honores
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Cerrar Sesión de Sínodo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PEDESTAL DE INVESTIGACIÓN 3D & VESTUARIO DE FELLOW */}
      {/* ========================================================================= */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Pedestal de Investigación 3D & Regalías Científicas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Personalización de Atuendos Académicos de Alta Gala y Motor de Avatares
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
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
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
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
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
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-emerald-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                  
                  {customizerMode === '3d_renders' ? (
                    <img
                      src={RESEARCHER_CATALOG.find(i => i.id === selectedResearcherItem)?.image || '/redisenos_assets/nexus_guild/investigador_base_pedestal.jpg'}
                      alt="Investigador Nexus 3D"
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-52 h-52 relative">
                      <AnimeAvatarSprite
                        rpgClass="curador"
                        animationState={spriteAnimation}
                        hairStyle="bob"
                        hairColor="silver"
                        equippedOuterwear="toga_academica"
                        showPedestal={true}
                      />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-emerald-300 border border-emerald-400/30">
                    {customizerMode === '3d_renders' ? 'Observatorio Estelar 3D' : 'Sprite Modular SVG'}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {RESEARCHER_CATALOG.find(i => i.id === selectedResearcherItem)?.name}
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
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Catálogo de Ítems */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-2">
                    Regalías Académicas Disponibles:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {RESEARCHER_CATALOG.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquipItem(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedResearcherItem === item.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-400/50'
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
                  <strong className="text-emerald-300 block mb-1">Descripción de la Regalía:</strong>
                  {RESEARCHER_CATALOG.find(i => i.id === selectedResearcherItem)?.description}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Confirmar Configuración y Salir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ACREDITACIONES & TIENDA DE BECAS */}
      {/* ========================================================================= */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Acreditaciones Científicas & Supercómputo</h3>
                  <p className="text-xs text-slate-400">Canje de Puntos de Diplomacia por Becas de Investigación</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-teal-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: {activeStudent.diplomacyPoints} Puntos
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
                  <h4 className="text-xs font-black text-emerald-300">Beca de Supercómputo Paralelo (100h)</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Acceso prioritario a clúster de cómputo para simulación de dinámicas moleculares y redes neuronales.
                  </p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playCoinSound();
                    setActiveStudent(prev => ({ 
                      ...prev, 
                      diplomacyPoints: Math.max(0, prev.diplomacyPoints - 1500),
                      computeHours: prev.computeHours + 100
                    }));
                    showToast("¡Beca de Supercómputo canjeada! +100 Horas de cálculo añadidas 💻");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0 shadow-md"
                >
                  1,500 Pts
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Publicación Open-Access en Revista Q1</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Financiamiento de APC (Article Processing Charges) para divulgar tu tesis en repositorios internacionales.
                  </p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playCoinSound();
                    setActiveStudent(prev => ({ 
                      ...prev, 
                      diplomacyPoints: Math.max(0, prev.diplomacyPoints - 2000),
                      publishedPapers: prev.publishedPapers + 1
                    }));
                    showToast("¡Financiamiento de APC aprobado! Paper enviado a revisión por pares Q1 📚");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0 shadow-md"
                >
                  2,000 Pts
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
      {/* MODAL 7: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE · REGLA 1 CUMPLIDA) */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400">
                    Universal Challenge Studio · Panel Docente
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Diseño de Retos Basados en Problemas (ABP) para Preparatoria
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
                <span className="font-black text-emerald-400 block text-sm">
                  1. Formulación de Desafíos Científicos Empíricos
                </span>
                <p>
                  El profesorado estructura problemas reales (transición energética, secuenciación genética, análisis constitucional) asignados a las cuadrillas de Nexus para fomentar el pensamiento inductivo y deductivo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-cyan-400 block text-sm">
                  2. Enlaces Bidireccionales a la Bóveda Curricular
                </span>
                <p>
                  Cada nodo del árbol de maestría se enlaza directamente con los documentos Markdown de la <strong className="text-white">Bóveda Curricular</strong> con enlaces <code className="text-cyan-300">[[...]]</code> sin depender de herramientas externas propietarias.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-indigo-400 block text-sm">
                  3. Debate Constitucional y Ético con Próceres en 1ª Persona
                </span>
                <p>
                  Los estudiantes contrastan sus conclusiones con figuras históricas que hablan con estricto rigor oratorio en primera persona, consolidando la argumentación cívica y científica.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Cerrar Panel Docente
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: INSPECCIÓN DE TELEMETRÍA DE HOTSPOT */}
      {/* ========================================================================= */}
      {activeModal === 'telemetryHotspot' && inspectedHotspot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
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
              <span className="text-[11px] font-black uppercase text-emerald-400 block">
                Métricas del Dashboard:
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {inspectedHotspot.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">•</span>
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
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20"
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-emerald-300 border border-emerald-500/50 shadow-2xl text-xs font-black flex items-center gap-2.5 animate-in slide-in-from-bottom-3 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
