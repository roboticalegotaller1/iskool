// src/app/redisenos_gamificados/metropolis_de_inventores/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Wind, 
  Zap, 
  Coins, 
  Smile, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  X,
  Factory,
  Award,
  Sparkles,
  Shirt,
  GraduationCap,
  Activity,
  Cpu,
  Settings,
  Volume2,
  VolumeX,
  Flame,
  Gauge,
  Compass,
  BookOpen,
  Users,
  Lightbulb,
  Play,
  RotateCcw,
  Sliders,
  Eye
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';

// =========================================================================
// 1. MODELOS DE DATOS: ALCALDES INVENTORES STEM (FASE 6 SECUNDARIA SEP)
// =========================================================================

interface MayorStudent {
  id: string;
  name: string;
  grade: string;
  title: string;
  avatarIcon: string;
  cityPopulation: number;
  cleanEnergyPercent: number;
  citizenHappiness: number;
  municipalBudget: number;
  builtDistricts: number;
  priorityDistrict: string;
  equippedGear: {
    goggles: string;
    vest: string;
    bionicArm: string;
    teslaUnit: string;
    automaton: string;
  };
  patentsCount: number;
  activeRenderKey: 'base' | 'brazo' | 'goggles' | 'dron' | 'tesla';
}

const INITIAL_MAYORS: MayorStudent[] = [
  {
    id: 'may-daniel',
    name: 'Daniel Navarro',
    grade: '2º de Secundaria · Fase 6 SEP',
    title: 'Ingeniero Jefe de Infraestructura y Redes',
    avatarIcon: '⚙️',
    cityPopulation: 45000,
    cleanEnergyPercent: 78,
    citizenHappiness: 88,
    municipalBudget: 15400,
    builtDistricts: 6,
    priorityDistrict: 'Distrito Eléctrico & Bobinas',
    equippedGear: {
      goggles: 'Monóculo Térmico de Latón',
      vest: 'Chaleco de Cuero con Herramientas',
      bionicArm: 'Brazo Mecánico de Vapor',
      teslaUnit: 'Bobina Deflectora de 220V',
      automaton: 'Dron de Relojería y Éter'
    },
    patentsCount: 4,
    activeRenderKey: 'base'
  },
  {
    id: 'may-valeria',
    name: 'Valeria Domínguez',
    grade: '3º de Secundaria · Fase 6 SEP',
    title: 'Alcaldesa de Sostenibilidad y Química Verde',
    avatarIcon: '⚡',
    cityPopulation: 82000,
    cleanEnergyPercent: 94,
    citizenHappiness: 96,
    municipalBudget: 28900,
    builtDistricts: 10,
    priorityDistrict: 'Distrito Médico & Biotecnología',
    equippedGear: {
      goggles: 'Gafas de Observatorio Astral',
      vest: 'Bata Dieléctrica de Alta Tensión',
      bionicArm: 'Prótesis Cuántica de Titanio',
      teslaUnit: 'Generador Tesla Portátil (+380V)',
      automaton: 'Sonda Autómata de Detección'
    },
    patentsCount: 9,
    activeRenderKey: 'tesla'
  },
  {
    id: 'may-sebastian',
    name: 'Sebastián Pineda',
    grade: '1º de Secundaria · Fase 6 SEP',
    title: 'Urbanista Promesa en Termodinámica',
    avatarIcon: '🚂',
    cityPopulation: 28000,
    cleanEnergyPercent: 62,
    citizenHappiness: 82,
    municipalBudget: 9600,
    builtDistricts: 4,
    priorityDistrict: 'Distrito de Transporte Férreo',
    equippedGear: {
      goggles: 'Gafas de Conductor de Locomotora',
      vest: 'Capote Reforzado contra Hollín',
      bionicArm: 'Pinza Neumática de Alta Presión',
      teslaUnit: 'Batería de Descarga Rápida',
      automaton: 'Micro-Zeppelin de Topografía'
    },
    patentsCount: 3,
    activeRenderKey: 'brazo'
  }
];

// Catálogo de Artefactos Steampunk con Renders Reales
interface SteampunkGear {
  id: 'base' | 'brazo' | 'goggles' | 'dron' | 'tesla';
  name: string;
  category: 'Atuendo Base' | 'Prótesis Biónica' | 'Óptica' | 'Autómata' | 'Reactor Personal';
  stats: string;
  description: string;
  image: string;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  badgeColor: string;
}

const STEAMPUNK_CATALOG: SteampunkGear[] = [
  {
    id: 'base',
    name: 'Atuendo Base de Maestro Mecánico',
    category: 'Atuendo Base',
    stats: '+10% Eficiencia en Reparaciones',
    description: 'Chaleco de cuero curtido con correas de latón y compartimento reforzado para instrumentos de calibración.',
    image: '/redisenos_assets/metropolis/inventor_base_taller.jpg',
    rarity: 'Común',
    badgeColor: 'from-slate-600 to-slate-700'
  },
  {
    id: 'brazo',
    name: 'Brazo Mecánico de Vapor Hidráulico',
    category: 'Prótesis Biónica',
    stats: '+40% Par Motor Mecánico · 120 PSI',
    description: 'Pistón neumático doble de cobre con articulaciones de engranes helicoidales para manipular válvulas de vapor de alta presión.',
    image: '/redisenos_assets/metropolis/inventor_brazo_bionico.jpg',
    rarity: 'Épico',
    badgeColor: 'from-amber-600 to-amber-700'
  },
  {
    id: 'goggles',
    name: 'Goggles de Bronce Magnificadoras',
    category: 'Óptica',
    stats: '+35% Visión Térmica y Espectral',
    description: 'Lentes bicóncavas ajustables con filtros polarizados para inspeccionar arcos voltaicos y fugas de vapor invisible.',
    image: '/redisenos_assets/metropolis/inventor_goggles_bronce.jpg',
    rarity: 'Raro',
    badgeColor: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'dron',
    name: 'Dron de Vapor y Relojería Automática',
    category: 'Autómata',
    stats: '+50% Alcance de Inspección Aérea',
    description: 'Micro-orquidóptero propulsado por escape de vapor presurizado y giroscopio de precisión para patrullar los distritos.',
    image: '/redisenos_assets/metropolis/inventor_dron_vapor.jpg',
    rarity: 'Épico',
    badgeColor: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'tesla',
    name: 'Generador Tesla Portátil (+380V)',
    category: 'Reactor Personal',
    stats: '+380V Campo Deflector Cuántico',
    description: 'Minibobina toroidal de resonancia magnética que almacena cargas electrostáticas y estabiliza sobrecargas en la red.',
    image: '/redisenos_assets/metropolis/inventor_mochila_tesla.jpg',
    rarity: 'Legendario',
    badgeColor: 'from-purple-600 to-indigo-800'
  }
];

// Distritos Urbanos de la Metrópolis
interface UrbanDistrict {
  id: string;
  name: string;
  icon: string;
  energyPercent: number;
  steamPressurePSI: number;
  requiredMW: number;
  status: 'Operativo' | 'Alerta de Vapor' | 'Falta de Potencia';
  turbinesActive: number;
  specialty: string;
}

const INITIAL_DISTRICTS: UrbanDistrict[] = [
  {
    id: 'dist-electric',
    name: 'Distrito Eléctrico & Bobinas',
    icon: '⚡',
    energyPercent: 92,
    steamPressurePSI: 145,
    requiredMW: 20,
    status: 'Operativo',
    turbinesActive: 6,
    specialty: 'Generación electromagnética y redes polifásicas de corriente alterna.'
  },
  {
    id: 'dist-medical',
    name: 'Distrito Médico & Botánica Cuántica',
    icon: '🧪',
    energyPercent: 84,
    steamPressurePSI: 120,
    requiredMW: 12,
    status: 'Operativo',
    turbinesActive: 4,
    specialty: 'Purificación de sueros, electrólisis estéril y destilación térmica.'
  },
  {
    id: 'dist-transit',
    name: 'Distrito de Transporte & Tren Maglev',
    icon: '🚂',
    energyPercent: 76,
    steamPressurePSI: 160,
    requiredMW: 10,
    status: 'Alerta de Vapor',
    turbinesActive: 3,
    specialty: 'Líneas neumáticas y monorrieles magnéticos de levitación a vapor.'
  },
  {
    id: 'dist-observatory',
    name: 'Distrito Observatorio & Astrofísica',
    icon: '🔭',
    energyPercent: 95,
    steamPressurePSI: 90,
    requiredMW: 8,
    status: 'Operativo',
    turbinesActive: 2,
    specialty: 'Telescopios de refracción de bronce, espectrometría y clima astronómico.'
  }
];

// Patentes del Lienzo Digital y Bóveda Curricular
interface InventorPatent {
  id: string;
  code: string;
  title: string;
  author: string;
  discipline: string;
  sepPDA: string;
  status: 'Aprobada' | 'En Revisión' | 'Prototipo en Taller';
  powerGeneration: string;
}

const PATENTS_DATA: InventorPatent[] = [
  {
    id: 'pat-1',
    code: 'PAT-STEM-081',
    title: 'Turbina Geotérmica de Vapor Seco con Rotor de Alabes Helicoidales',
    author: 'Daniel Navarro',
    discipline: 'Física & Termodinámica',
    sepPDA: 'Analiza el calor como energía transferible y el funcionamiento de motores térmicos.',
    status: 'Aprobada',
    powerGeneration: '+15 MW Suministro Limpio'
  },
  {
    id: 'pat-2',
    code: 'PAT-STEM-082',
    title: 'Desalinizadora Solar Cuántica con Electrólisis de Membrana',
    author: 'Valeria Domínguez',
    discipline: 'Química Sustentable',
    sepPDA: 'Identifica los reactivos y productos en reacciones químicas de óxido-reducción.',
    status: 'Aprobada',
    powerGeneration: '+22 MW Potencia de Hidrógeno'
  },
  {
    id: 'pat-3',
    code: 'PAT-STEM-083',
    title: 'Levitador Neumático de Inducción con Relación de Transmisión Variable',
    author: 'Sebastián Pineda',
    discipline: 'Tecnología y Mecánica',
    sepPDA: 'Aplica el principio de conservación de energía y ventajas mecánicas de engranes.',
    status: 'Prototipo en Taller',
    powerGeneration: '+8 MW Ahorro Cinético'
  },
  {
    id: 'pat-4',
    code: 'PAT-STEM-084',
    title: 'Filtro Catalítico de Hollín por Precipitación Electrostática',
    author: 'Daniel Navarro',
    discipline: 'Ecología Industrial',
    sepPDA: 'Evalúa el impacto ambiental de las emisiones y propone soluciones de mitigación.',
    status: 'Aprobada',
    powerGeneration: '99.4% Reducción de Partículas'
  },
  {
    id: 'pat-5',
    code: 'PAT-STEM-085',
    title: 'Acumulador Dieléctrico de Grafeno para Almacenamiento de Red 60 Hz',
    author: 'Valeria Domínguez',
    discipline: 'Física Electromagnética',
    sepPDA: 'Relaciona la capacitancia eléctrica con la densidad de carga y diferencia de potencial.',
    status: 'Aprobada',
    powerGeneration: '+35 MW Respaldo Nocturno'
  }
];

export default function MetropolisDeInventoresPage() {
  // Estado de Alumno Activo
  const [activeStudent, setActiveStudent] = useState<MayorStudent>(INITIAL_MAYORS[0]);
  
  // Estado de Vista Principal: 'canvas169' (Lienzo Maestro) | 'districts' (Cuadrícula)
  const [activeViewMode, setActiveViewMode] = useState<'canvas169' | 'districts'>('canvas169');

  // Modales interactivos
  const [activeModal, setActiveModal] = useState<
    'none' | 'teslaLab' | 'locker' | 'patents' | 'teacherStudio' | 'telemetryHotspot'
  >('none');

  // Estado del Hotspot inspeccionado
  const [inspectedHotspot, setInspectedHotspot] = useState<{
    title: string;
    description: string;
    specs: string[];
    actionName: string;
    onAction: () => void;
  } | null>(null);

  // Estados del Laboratorio Tesla
  const [generatorVoltage, setGeneratorVoltage] = useState<number>(220);
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const [challengeSolved, setChallengeSolved] = useState<boolean>(false);
  const [isBladeSwitchClosed, setIsBladeSwitchClosed] = useState<boolean>(false);
  const [teslaSpeechActive, setTeslaSpeechActive] = useState<boolean>(false);

  // Estado del Taller / Vestidor
  const [customizerMode, setCustomizerMode] = useState<'3d_renders' | 'anime_sprite'>('3d_renders');
  const [selectedInventorItem, setSelectedInventorItem] = useState<'base' | 'brazo' | 'goggles' | 'dron' | 'tesla'>('base');
  const [spriteAnimation, setSpriteAnimation] = useState<'idle' | 'cast' | 'cheer'>('idle');

  // Estados de Telemetría Dinámica de la Ciudad
  const [steamPressure, setSteamPressure] = useState<number>(142);
  const [districts, setDistricts] = useState<UrbanDistrict[]>(INITIAL_DISTRICTS);

  // Notificaciones y Audio
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Helper para mostrar notificaciones flotantes
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // 2. SÍNTESIS DE VOZ Y CANON EN PRIMERA PERSONA ESTRICTA (REGLA 2)
  // =========================================================================

  const speakText = (text: string, isTesla = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      if (isTesla) {
        utter.rate = 0.92;
        utter.pitch = 0.90;
        setTeslaSpeechActive(true);
        utter.onend = () => setTeslaSpeechActive(false);
        utter.onerror = () => setTeslaSpeechActive(false);
      } else {
        utter.rate = 1.02;
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
      setTeslaSpeechActive(false);
    }
  };

  // Discurso Canónico en Primera Persona de Nikola Tesla
  const handleTeslaSpeech = () => {
    gamificationAudio.playClickSound();
    const teslaMonologue = 
      "Yo concebí el sistema polifásico de corriente alterna y la bobina de alta frecuencia en mis laboratorios de Nueva York y Colorado Springs. " +
      "A través de mis experimentos demostré que la energía no debe transportarse por fuerza bruta, sino mediante armónicos de resonancia magnética. " +
      "Cuando equilibras la impedancia del circuito y abasteces los 50 Megawatts requeridos, el flujo rotatorio ilumina la ciudad sin disipar calor contaminante. " +
      "¡Has honrado las leyes eternas del electromagnetismo!";
    speakText(teslaMonologue, true);
    showToast("Nikola Tesla está compartiendo sus principios científicos en primera persona ⚡");
  };

  // =========================================================================
  // 3. RESOLUCIÓN DEL DESAFÍO EN EL GENERADOR TESLA
  // =========================================================================

  const handleBladeSwitchToggle = () => {
    gamificationAudio.playClickSound();
    setIsBladeSwitchClosed(prev => !prev);
    if (!isBladeSwitchClosed) {
      gamificationAudio.playMagicCastSound();
      showToast("Interruptor de cuchilla de cobre cerrado: Conexión de alta tensión establecida.");
    } else {
      showToast("Circuito abierto: La corriente alterna ha sido desenergizada.");
    }
  };

  const handleSolveChallenge = (optionIdx: number) => {
    if (challengeSolved) return;
    setSelectedSolution(optionIdx);

    if (optionIdx === 1) {
      // Solución correcta: Propuesta B (Ingeniería Óptima)
      gamificationAudio.playVictorySound();
      gamificationAudio.playLevelUpSound();
      setChallengeSolved(true);
      setGeneratorVoltage(380);
      setIsBladeSwitchClosed(true);
      setSteamPressure(158);

      // Actualizar distritos iluminados
      setDistricts(prev => prev.map(d => ({ ...d, energyPercent: Math.min(100, d.energyPercent + 15), status: 'Operativo' })));

      const successExplanation = 
        "¡Excelente cálculo de ingeniería! La combinación balanceada de 6 aerogeneradores (30 MW continuos) " +
        "con 10 celdas solares (20 MW diurnos) y el banco dieléctrico garantiza 50 MW ininterrumpidos a 380V estables.";
      speakText(successExplanation, false);
      showToast("¡Voltímetro a 380V! El reactor central está sincronizado con la red urbana ⚡");
    } else {
      // Solución incorrecta
      gamificationAudio.playErrorSound();
      setGeneratorVoltage(110);
      showToast("Pérdida de tensión: La propuesta genera apagones rotativos o emisiones contaminantes. Intenta con una matriz híbrida sustentable.");
    }
  };

  // Reset del Generador
  const handleResetChallenge = () => {
    gamificationAudio.playClickSound();
    setSelectedSolution(null);
    setChallengeSolved(false);
    setGeneratorVoltage(220);
    setIsBladeSwitchClosed(false);
    showToast("Laboratorio Tesla restablecido al estado de calibración inicial.");
  };

  // Equipar ítem en el taller
  const handleEquipItem = (itemId: 'base' | 'brazo' | 'goggles' | 'dron' | 'tesla') => {
    gamificationAudio.playClickSound();
    setSelectedInventorItem(itemId);
    setActiveStudent(prev => ({
      ...prev,
      activeRenderKey: itemId
    }));
    gamificationAudio.playMagicCastSound();
    showToast(`¡Artefacto [${STEAMPUNK_CATALOG.find(i => i.id === itemId)?.name}] calibrado y equipado con éxito! ⚙️`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans pb-12">
      
      {/* ========================================================================= */}
      {/* HEADER SUPERIOR: IDENTIDAD DE LA METRÓPOLIS Y SELECTOR DE ALCALDES */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-amber-900/40 px-4 sm:px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo y Enlace de Retorno */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link 
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Metrópolis de Inventores</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                    STEM · Secundaria
                  </span>
                </h1>
                <p className="text-[11px] text-amber-200/70 font-medium">
                  Simulación Urbana Steampunk & Desafíos Termodinámicos · Fase 6 SEP
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Alcalde Inventor y Estado de Energía */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
            
            {/* Píldoras de los 3 Alumnos */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-amber-900/40">
              {INITIAL_MAYORS.map(mayor => (
                <button
                  key={mayor.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudent(mayor);
                    setSelectedInventorItem(mayor.activeRenderKey);
                    showToast(`Alcalde activo: ${mayor.name} (${mayor.grade})`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeStudent.id === mayor.id
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{mayor.avatarIcon}</span>
                  <span className="hidden sm:inline">{mayor.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Métricas Rápidas en Vivo */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-900/40 text-xs font-bold">
              <span className="flex items-center gap-1 text-amber-300" title="Voltaje del Reactor Central">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {generatorVoltage}V AC
              </span>
              <span className="flex items-center gap-1 text-emerald-300" title="Porcentaje de Energía Limpia">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                {activeStudent.cleanEnergyPercent}% Limpia
              </span>
              <span className="flex items-center gap-1 text-cyan-300" title="Presupuesto Municipal de Ingeniería">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                ${activeStudent.municipalBudget.toLocaleString()}
              </span>
            </div>

            {/* Botones de Acción de Pantalla */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teslaLab');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Lab Tesla</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-700/50 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Taller 3D</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('patents');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Patentes</span>
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
      {/* CUERPO PRINCIPAL DE LA METRÓPOLIS */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* BANNER DE IDENTIDAD Y SELECTOR DE VISTA (CANVAS 16:9 VS CUADRÍCULA) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-amber-900/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                {activeStudent.title}
              </span>
              <span className="text-xs text-slate-400 font-medium">{activeStudent.grade}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} Metrópolis Steampunk de {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Distrito Prioritario: <strong className="text-amber-400">{activeStudent.priorityDistrict}</strong> · {activeStudent.cityPopulation.toLocaleString()} Ciudadanos · {districts.length} Distritos en Red
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('canvas169');
                  showToast("Modo: Lienzo Maestro 16:9 Steamporium Smart City");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'canvas169'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lienzo 16:9</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveViewMode('districts');
                  showToast("Modo: Cuadrícula Analítica de Distritos Urbanos");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'districts'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Distritos</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANTALLA 1: LIENZO MAESTRO 16:9 INMACULADO CON HOTSPOTS NANO BANANA */}
        {/* ========================================================================= */}
        {activeViewMode === 'canvas169' && (
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-600/40 bg-slate-950 select-none group">
            
            {/* IMAGEN MAESTRA DE FONDO OFICIAL (16:9) */}
            <img 
              src="/redisenos_assets/gamification_secundaria_metropolis_stem_1792732869540.jpg"
              alt="Metrópolis de Inventores Steamporium Smart City"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* OVERLAY DE VIGNETTE Y LUZ STEAMPUNK AMBIENTAL */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />

            {/* ========================================================================= */}
            {/* HUD FLOTANTE SUPERIOR DENTRO DEL LIENZO */}
            {/* ========================================================================= */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              
              {/* Telemetría Flotante Izquierda */}
              <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-500/40 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                    Red Municipal de Vapor & Alta Tensión
                  </span>
                </div>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {generatorVoltage} V AC
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  {steamPressure} PSI
                </span>
              </div>

              {/* Botón de Intervención Oral de Nikola Tesla */}
              <button
                onClick={handleTeslaSpeech}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xl shadow-amber-500/20 transition-all border border-amber-300"
                title="Escuchar discurso científico de Nikola Tesla en primera persona"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Voz de Nikola Tesla</span>
                {teslaSpeechActive && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </button>
            </div>

            {/* ========================================================================= */}
            {/* HOTSPOTS TRANSPARENTES MILIMÉTRICOS (NANO BANANA GRID) */}
            {/* ========================================================================= */}

            {/* 1. MATH TOWER (TORRE DORADA CENTRAL) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Torre de Matemáticas & Presión Barométrica (Math Tower)',
                  description: 'Estructura dorada central donde se coordinan los cálculos de engranes planetarios, relaciones de transmisión volumétrica y cálculo de presión en pascales para toda la urbe.',
                  specs: [
                    'Transmisión Helicoidal: Relación 1:4.8',
                    'Cálculo de Potencia de Válvulas: P = V × I',
                    'Ecuación Diferencial de Flujo de Vapor: Continuo'
                  ],
                  actionName: 'Calcular Relación de Engranes',
                  onAction: () => {
                    gamificationAudio.playMagicCastSound();
                    showToast("¡Relación de engranes calculada! Eficiencia térmica +12%");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[18%] left-[38%] w-[9%] h-[26%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-amber-400/40 hover:border-amber-300 hover:bg-amber-400/15 transition-all flex items-center justify-center"
              title="Math Tower: Centro de Cálculo Matemático y Termodinámica"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                📐 Math Tower
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-400/60 animate-ping group-hover/hotspot:bg-amber-300" />
            </div>

            {/* 2. PHYSICS LAB (CÚPULA TESLA CON ENERGÍA AZUL) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('teslaLab');
              }}
              className="absolute top-[34%] left-[26%] w-[11%] h-[19%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center"
              title="Physics Lab: Bobina de Tesla y Red Electromagnética"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                ⚡ Physics Lab (Tesla)
              </div>
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* 3. PHYSICS WORKSHOP (TALLER MECÁNICO Y ENGRANES) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('locker');
              }}
              className="absolute top-[49%] left-[35%] w-[10%] h-[15%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-300 hover:bg-amber-500/20 transition-all flex items-center justify-center"
              title="Physics Workshop: Pedestal 3D y Ensamblaje de Mecanismos"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🔧 Taller Mecánico 3D
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            </div>

            {/* 4. CHEMISTRY LAB (DESTILERÍA CUÁNTICA CON TUBOS VERDES) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Laboratorio de Química Sostenible & Destilería Cuántica',
                  description: 'Instalación de celdas galvánicas y columnas de fraccionamiento molecular. Aquí se procesa el agua de lluvia mediante electrólisis para generar hidrógeno combustible limpio.',
                  specs: [
                    'Reacción: 2H₂O + Energía → 2H₂ + O₂',
                    'Eficiencia Faradaica: 94.2%',
                    'Pureza de Hidrógeno Producido: 99.8%'
                  ],
                  actionName: 'Activar Electrólisis de Hidrógeno',
                  onAction: () => {
                    gamificationAudio.playMagicCastSound();
                    showToast("¡Electrólisis activada! +22 MW de potencia química para la metrópolis 🧪");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[32%] left-[71%] w-[12%] h-[20%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-emerald-400/50 hover:border-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center justify-center"
              title="Chemistry Lab: Celdas Electroquímicas e Hidrógeno"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                🧪 Chemistry Lab
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* 5. ATROMITY REACTOR CENTRAL (HAZ DE LUZ VERTICAL) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Atromity Quantum Reactor (Núcleo Central)',
                  description: 'Corazón termodinámico de la ciudad. Fusiona el flujo de vapor a alta presión con campos electromagnéticos inducidos para abastecer 50 MW continuos sin emisiones fósiles.',
                  specs: [
                    `Potencia Generada: ${generatorVoltage === 380 ? '50 MW (ÓPTIMO)' : '24 MW (DÉFICIT)'}`,
                    `Voltaje de Salida: ${generatorVoltage} V AC`,
                    'Estabilidad Térmica: 98.4%'
                  ],
                  actionName: 'Sincronizar Bobinas de Resonancia',
                  onAction: () => {
                    gamificationAudio.playMagicCastSound();
                    showToast("¡Bobinas sincronizadas! Voltaje continuo en equilibrio harmónico.");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[27%] left-[48%] w-[13%] h-[28%] cursor-pointer group/hotspot rounded-2xl border-2 border-dashed border-indigo-400/50 hover:border-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center"
              title="Atromity Level: Reactor Cuántico Central"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-indigo-400 text-slate-950 text-[9px] font-black opacity-0 group-hover/hotspot:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                ⚛️ Atromity Reactor
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-300 animate-ping" />
            </div>

            {/* 6. ENERGY GRID MANAGEMENT WIDGET (TUBERÍAS DE COBRE - ABAJO IZQUIERDA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Red Maestra de Válvulas y Tuberías de Vapor (Energy Grid)',
                  description: 'Matriz subterránea y aérea de conductos de cobre que transporta vapor saturado desde las calderas geotérmicas hacia los 4 distritos urbanos.',
                  specs: [
                    `Presión en el Colector Principal: ${steamPressure} PSI`,
                    'Válvula de Alivio Neumático: Calibrada a 180 PSI',
                    'Temperatura de Trabajo: 310 °C'
                  ],
                  actionName: 'Calibrar Válvula de Presión',
                  onAction: () => {
                    gamificationAudio.playMagicCastSound();
                    setSteamPressure(150);
                    showToast("¡Válvula de presión ajustada a 150 PSI óptimos!");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[62%] left-[10%] w-[22%] h-[24%] cursor-pointer group/hotspot rounded-3xl border-2 border-dashed border-amber-600/40 hover:border-amber-400 hover:bg-amber-600/15 transition-all flex items-center justify-center"
              title="Energy Grid Management Widget: Válvulas de Vapor y Presión"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-amber-300 text-[10px] font-black border border-amber-500/40 shadow-lg whitespace-nowrap">
                ⚙️ Red de Válvulas de Vapor ({steamPressure} PSI)
              </div>
            </div>

            {/* 7. GUILD RESEARCH TREE (ÁRBOL COOPERATIVO DE PATENTES - ABAJO DERECHA) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('patents');
              }}
              className="absolute top-[58%] left-[70%] w-[24%] h-[28%] cursor-pointer group/hotspot rounded-3xl border-2 border-dashed border-purple-500/40 hover:border-purple-300 hover:bg-purple-500/15 transition-all flex items-center justify-center"
              title="Guild Cooperative Research Tree: Patentes y Propulsión por Éter"
            >
              <div className="absolute bottom-2 px-2.5 py-1 rounded-xl bg-slate-950/90 text-purple-300 text-[10px] font-black border border-purple-500/40 shadow-lg whitespace-nowrap">
                📜 Árbol de Patentes & Éter ({PATENTS_DATA.length} Patentes)
              </div>
            </div>

            {/* 8. BARÓMETRO SOCIOEMOCIONAL DEL AULA (CENTRO INFERIOR) */}
            <div 
              onClick={() => {
                gamificationAudio.playClickSound();
                setInspectedHotspot({
                  title: 'Barómetro Socioemocional & Clima del Aula',
                  description: 'Indicador pedagógico en tiempo real que mide la cohesión del grupo, la resolución colaborativa de fallas de vapor y la sincronía socioemocional del salón.',
                  specs: [
                    'Estado Anímico: Sunshine & Gears ☀️⚙️',
                    'Sincronía de Cuadrilla: 92% Colaboración',
                    'Pedagogía del Error: Pistas constructivas sin frustración'
                  ],
                  actionName: 'Enviar Reconocimiento a la Cuadrilla',
                  onAction: () => {
                    gamificationAudio.playVictorySound();
                    showToast("¡Reconocimiento enviado! La moral de los inventores sube al 98% ✨");
                  }
                });
                setActiveModal('telemetryHotspot');
              }}
              className="absolute top-[75%] left-[38%] w-[24%] h-[18%] cursor-pointer group/hotspot rounded-3xl border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-500/15 transition-all flex items-center justify-center"
              title="Barómetro Socioemocional: Sunshine & Gears 92% Sync"
            >
              <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 text-emerald-300 text-[10px] font-black border border-emerald-500/40 shadow-lg whitespace-nowrap flex items-center gap-1.5">
                <Smile className="w-3 h-3 text-emerald-400" />
                <span>Sunshine & Gears · 92% Sync</span>
              </div>
            </div>

            {/* PIE DE PÁGINA DENTRO DEL LIENZO */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Haz clic en cualquier edificio o válvula para interactuar con la simulación termodinámica.
              </span>
              <span className="font-bold text-amber-300 hidden md:inline">
                Fase 6 SEP · Ciencias Físico-Matemáticas
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANTALLA ALTERNATIVA: CUADRÍCULA DE DISTRITOS URBANOS */}
        {/* ========================================================================= */}
        {activeViewMode === 'districts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {districts.map(dist => (
                <div 
                  key={dist.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-amber-900/40 hover:border-amber-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{dist.icon}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        dist.status === 'Operativo'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {dist.status}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white">{dist.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{dist.specialty}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Iluminación de Red:</span>
                      <span className="text-amber-400">{dist.energyPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
                        style={{ width: `${dist.energyPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Demanda: {dist.requiredMW} MW</span>
                      <span>Turbinas: {dist.turbinesActive} Activas</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      gamificationAudio.playMagicCastSound();
                      setDistricts(prev => prev.map(d => d.id === dist.id ? { ...d, energyPercent: Math.min(100, d.energyPercent + 10) } : d));
                      showToast(`¡Vapor suministrado al ${dist.name}!`);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-xs font-black transition-all flex items-center justify-center gap-1.5 border border-amber-600/30 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Inyectar Vapor & Energía</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: LABORATORIO TESLA & ENCENDIDO DEL REACTOR (DESAFÍO INTERACTIVO) */}
      {/* ========================================================================= */}
      {activeModal === 'teslaLab' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            {/* Header del Laboratorio */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Laboratorio Tesla: Cálculo de Red Eléctrica Sustentable</span>
                    {challengeSolved && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                        ⚡ REACTOR SINCRONIZADO
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Demanda Municipal: 50 Megawatts (MW) Continuos · Fase 6 SEP Física
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

            {/* Consola de Medidores: Voltímetro Analógico & Interruptor de Cuchilla */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-950 p-5 rounded-3xl border border-amber-500/30">
              
              {/* Dial de Voltímetro Analógico con Aguja Dinámica */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border border-amber-600/30 relative">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-2">
                  Voltímetro Analógico de Alta Tensión
                </span>

                {/* SVG del Dial con Aguja */}
                <div className="relative w-48 h-28 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 120">
                    {/* Arco del Dial */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Zona Verde de 380V */}
                    <path
                      d="M 120 28 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Marcas de Graduación */}
                    <text x="20" y="115" fill="#94a3b8" fontSize="10" fontWeight="bold">0V</text>
                    <text x="92" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold">220V</text>
                    <text x="165" y="115" fill="#10b981" fontSize="10" fontWeight="bold">380V</text>

                    {/* Aguja Giratoria */}
                    {/* 0V -> -60deg, 220V -> 0deg, 380V -> 60deg */}
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="30"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: `rotate(${generatorVoltage === 380 ? 55 : generatorVoltage === 110 ? -35 : 0}deg)`,
                        transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                    <circle cx="100" cy="100" r="7" fill="#f59e0b" />
                  </svg>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-2xl font-black text-amber-400 bg-slate-950 px-4 py-1 rounded-xl border border-amber-500/40 shadow-inner">
                    ⚡ {generatorVoltage} V AC
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    Frecuencia: 60 Hz · Estado: {generatorVoltage === 380 ? 'Potencia Nominal Óptima' : 'En Calibración'}
                  </span>
                </div>
              </div>

              {/* Interruptor de Cuchilla & Estado de Red */}
              <div className="md:col-span-6 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Interruptor de Cuchilla de Cobre:</span>
                    <button
                      onClick={handleBladeSwitchToggle}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        isBladeSwitchClosed
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isBladeSwitchClosed ? 'CERRADO (CONECTADO)' : 'ABIERTO (CORTE)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    El interruptor transmite la corriente polifásica hacia la bobina primaria del transformador elevador.
                  </p>
                </div>

                {/* Retrato y Voz de Nikola Tesla */}
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/redisenos_assets/torneo_tcg/tcg_card_nikola_tesla.jpg"
                      alt="Nikola Tesla"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 shadow-md"
                    />
                    <div>
                      <strong className="text-xs font-black text-amber-300 block">Nikola Tesla (1856-1943)</strong>
                      <span className="text-[10px] text-slate-300">Pionero de la Corriente Alterna y Bobinas de Resonancia</span>
                    </div>
                  </div>

                  <button
                    onClick={handleTeslaSpeech}
                    className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md"
                    title="Escuchar explicación en primera persona"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Planteamiento del Problema Lúdico */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Desafío de Cálculo Termodinámico & Matriz Eléctrica:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                La metrópolis requiere un suministro continuo de <strong className="text-white">50 Megawatts (MW)</strong> las 24 horas del día. 
                Cada aerogenerador de vapor eólico produce <strong className="text-amber-300">5 MW</strong> y cada campo de celdas solares fotovoltaicas aporta <strong className="text-amber-300">2 MW</strong> en horas pico. 
                ¿Cuál es la combinación de ingeniería que minimiza el costo, garantiza respaldo nocturno y no emite gases de efecto invernadero?
              </p>

              {/* 3 Opciones de Solución */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSolveChallenge(0)}
                  className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                    selectedSolution === 0
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 mb-1 font-black">PROPUESTA A</span>
                  25 Celdas Solares únicamente (Sin almacenamiento en baterías ni aerogeneradores)
                </button>

                <button
                  onClick={() => handleSolveChallenge(1)}
                  className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                    selectedSolution === 1
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400/40 shadow-xl'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50'
                  }`}
                >
                  <span className="block text-[10px] text-emerald-400 mb-1 font-black">PROPUESTA B (INGENIERÍA ÓPTIMA)</span>
                  6 Aerogeneradores (30 MW) + 10 Celdas (20 MW) con Banco de Baterías de Grafeno
                </button>

                <button
                  onClick={() => handleSolveChallenge(2)}
                  className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                    selectedSolution === 2
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 mb-1 font-black">PROPUESTA C</span>
                  1 Central Térmica de Combustión de Carbón y Diésel Municipal
                </button>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetChallenge}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Laboratorio</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
              >
                Cerrar e Ir a la Ciudad
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TALLER STEAMPUNK 3D & VESTIDOR DE INVENCIONES */}
      {/* ========================================================================= */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            {/* Header del Taller */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Pedestal Steampunk 3D & Taller de Ingeniería
                  </h3>
                  <p className="text-xs text-slate-400">
                    Personalización de Atuendos Mecánicos y Sincronización de Avatar
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
                        ? 'bg-amber-500 text-slate-950 shadow-md'
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
                        ? 'bg-amber-500 text-slate-950 shadow-md'
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
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-amber-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                  
                  {customizerMode === '3d_renders' ? (
                    <img
                      src={STEAMPUNK_CATALOG.find(i => i.id === selectedInventorItem)?.image || '/redisenos_assets/metropolis/inventor_base_taller.jpg'}
                      alt="Inventor STEM 3D"
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-52 h-52 relative">
                      <AnimeAvatarSprite
                        rpgClass="mago"
                        animationState={spriteAnimation}
                        hairStyle="spiky"
                        hairColor="amber"
                        equippedOuterwear="chaleco_steampunk"
                        showPedestal={true}
                      />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
                    {customizerMode === '3d_renders' ? 'Render Fotorrealista 3D' : 'Sprite Modular SVG'}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {STEAMPUNK_CATALOG.find(i => i.id === selectedInventorItem)?.name}
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
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Catálogo de Ítems Steampunk */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-2">
                    Mecanismos y Artefactos Disponibles:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STEAMPUNK_CATALOG.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquipItem(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedInventorItem === item.id
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
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
                  <strong className="text-amber-400 block mb-1">Descripción del Artefacto Seleccionado:</strong>
                  {STEAMPUNK_CATALOG.find(i => i.id === selectedInventorItem)?.description}
                </div>
              </div>

            </div>

            {/* Footer del Taller */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
              >
                Confirmar Configuración y Salir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFICINA DE PATENTES (LIENZO DIGITAL + BÓVEDA CURRICULAR) */}
      {/* ========================================================================= */}
      {activeModal === 'patents' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Oficina Central de Patentes de la Metrópolis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Proyectos Terminados en el Lienzo Digital e Integración con la Bóveda Curricular
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

            {/* Listado de Patentes */}
            <div className="space-y-3">
              {PATENTS_DATA.map(patent => (
                <div 
                  key={patent.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {patent.code}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{patent.discipline}</span>
                      <span className="text-xs text-emerald-400 font-bold">{patent.powerGeneration}</span>
                    </div>
                    <h4 className="text-sm font-black text-white">{patent.title}</h4>
                    <p className="text-xs text-slate-300">
                      Autor: <strong className="text-amber-400">{patent.author}</strong> · PDA SEP: <em>"{patent.sepPDA}"</em>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        showToast(`Plano [${patent.code}] sincronizado con la Bóveda Curricular 📚`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Bóveda Curricular
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Integración Institucional (Regla 1 Cumplida) */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/30 text-xs text-slate-300 space-y-1">
              <strong className="text-amber-300 block">Sincronización Institucional de Patentes:</strong>
              <p>
                Toda patente aprobada se compila como entregable tangible en el <strong className="text-white">Lienzo Digital</strong> de actividades y se almacena con cifrado seguro en la <strong className="text-white">Bóveda Curricular</strong> para la evaluación bimestral de los docentes.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
              >
                Cerrar Oficina de Patentes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE) */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Universal Challenge Studio · Panel Docente
                  </h3>
                  <p className="text-xs text-indigo-300">
                    Configuración de Megaproyectos de Ingeniería y Articulación con PDA Oficiales SEP
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

            {/* Tres Pilares Pedagógicos */}
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-amber-400 block text-sm">
                  1. Cuadrillas Cooperativas de Ingeniería por Distritos
                </span>
                <p>
                  Los profesores de Física, Química y Matemáticas agrupan a los estudiantes en cuadrillas técnicas responsables de mantener iluminado y abastecido un distrito de la metrópolis durante el bimestre escolar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-emerald-400 block text-sm">
                  2. Integración con el Lienzo Digital y la Bóveda Curricular
                </span>
                <p>
                  Los esquemas de circuitos eléctricos y proyectos sustentables diseñados en el <strong className="text-white">Lienzo Digital</strong> se transforman automáticamente en patentes de ingeniería de la ciudad persistidas en Markdown en la <strong className="text-white">Bóveda Curricular</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-cyan-400 block text-sm">
                  3. Presentaciones Digitales Institucionales y Almacenamiento Seguro
                </span>
                <p>
                  Las presentaciones de patentes se sincronizan en repositorios de almacenamiento cloud institucional seguro para la evaluación formativa y sumativa oficial del colegio.
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
      {/* MODAL 5: INSPECCIÓN DE TELEMETRÍA DE HOTSPOT */}
      {/* ========================================================================= */}
      {activeModal === 'telemetryHotspot' && inspectedHotspot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
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
              <span className="text-[11px] font-black uppercase text-amber-400 block">
                Especificaciones Técnicas:
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {inspectedHotspot.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-amber-400">•</span>
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-amber-300 border border-amber-500/50 shadow-2xl text-xs font-black flex items-center gap-2.5 animate-in slide-in-from-bottom-3 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
