// src/app/redisenos_gamificados/cronicas_de_exploradores/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Map, 
  Mountain, 
  TreePine, 
  Landmark, 
  Award, 
  Coins, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  ArrowLeft, 
  ShoppingBag, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Users, 
  ShieldCheck, 
  Flame, 
  BookOpen, 
  X,
  Layers,
  Eye,
  Trophy,
  Gift,
  Check,
  Zap,
  Wand2,
  Clock,
  Shirt,
  GraduationCap,
  FlaskConical,
  Scroll,
  MessageSquare,
  Crosshair,
  Shield,
  Droplets,
  Wind,
  Swords
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { speakNaturalFemaleSpanish } from '@/lib/redisenosVoiceTTS';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS FASE 5 SEP)
// ==========================================
interface ExplorerStudent {
  id: string;
  name: string;
  grade: string;
  age: number;
  house: 'Ignis' | 'Aqua' | 'Terra' | 'Aer';
  level: number;
  rankTitle: string;
  avatarIcon: string;
  crystals: number;
  scrolls: number;
  coins: number;
  unlockedHexCount: number;
  communityPoints: number;
  equippedGear: {
    tool: string;
    outfit: string;
    badge: string;
  };
  inventory: string[];
  alchemyCraftedCount: number;
}

const INITIAL_EXPLORERS: ExplorerStudent[] = [
  {
    id: 'exp-mateo',
    name: 'Mateo Ramírez',
    grade: '5º de Primaria · Fase 5 SEP',
    age: 10,
    house: 'Ignis',
    level: 6,
    rankTitle: 'Cartógrafo Estelar',
    avatarIcon: '🧭',
    crystals: 140,
    scrolls: 28,
    coins: 920,
    unlockedHexCount: 7,
    communityPoints: 340,
    equippedGear: {
      tool: 'Telescopio Dorado de Precisión',
      outfit: 'Traje de Expedición de Jungla',
      badge: 'Naturalista Mayor'
    },
    inventory: ['item-telescopio', 'item-antorcha', 'item-brujula-bronce'],
    alchemyCraftedCount: 3
  },
  {
    id: 'exp-vale',
    name: 'Valentina Cruz',
    grade: '4º de Primaria · Fase 5 SEP',
    age: 9,
    house: 'Terra',
    level: 4,
    rankTitle: 'Naturalista Mayor',
    avatarIcon: '🌿',
    crystals: 95,
    scrolls: 18,
    coins: 610,
    unlockedHexCount: 5,
    communityPoints: 210,
    equippedGear: {
      tool: 'Lupa de Geología Cuántica',
      outfit: 'Bata con Pines de Física',
      badge: 'Botánica de Campo'
    },
    inventory: ['item-red-mariposas', 'item-lupa-geologia'],
    alchemyCraftedCount: 1
  },
  {
    id: 'exp-emiliano',
    name: 'Emiliano Soto',
    grade: '6º de Primaria · Fase 5 SEP',
    age: 11,
    house: 'Aqua',
    level: 8,
    rankTitle: 'Estratega de Ecuaciones',
    avatarIcon: '📐',
    crystals: 210,
    scrolls: 45,
    coins: 1450,
    unlockedHexCount: 11,
    communityPoints: 520,
    equippedGear: {
      tool: 'Astrolabio de Latón Marino',
      outfit: 'Capa Térmica de Volcán',
      badge: 'Maestro de la Brújula'
    },
    inventory: ['item-telescopio', 'item-pico-obsidiana', 'item-astrolabio'],
    alchemyCraftedCount: 5
  }
];

// Nodos Territoriales del Mapa Hexagonal
interface HexNode {
  id: string;
  title: string;
  biome: 'volcan' | 'selva' | 'piramide' | 'ciudad' | 'glaciar';
  subject: string;
  pda: string;
  status: 'conquistado' | 'desafiando' | 'bloqueado';
  question: string;
  options: string[];
  correctCardId: string;
  rewardCrystals: number;
  rewardCoins: number;
  explanation: string;
}

const HEX_MAP_DATA: HexNode[] = [
  {
    id: 'hex-1',
    title: 'Volcán de Geología Tectónica',
    biome: 'volcan',
    subject: 'Saberes y Pensamiento Científico',
    pda: 'Comprende la interacción de placas tectónicas y fallas sísmicas en México',
    status: 'conquistado',
    question: '¿Qué placa tectónica interactúa con la placa de Cocos generando la mayor sismicidad en las costas mexicanas?',
    options: ['Placa Norteamericana', 'Placa Pacífica', 'Placa Africana', 'Placa Euroasiática'],
    correctCardId: 'card-termodinamica',
    rewardCrystals: 25,
    rewardCoins: 120,
    explanation: 'La subducción de la Placa de Cocos debajo de la Placa Norteamericana es la causante directa de sismos y actividad volcánica en el eje neovolcánico de México.'
  },
  {
    id: 'hex-2',
    title: 'Selva de la Biodiversidad Lacandona',
    biome: 'selva',
    subject: 'Ética, Naturaleza y Sociedades',
    pda: 'Valora los ecosistemas de selva húmeda, el ciclo del agua y especies endémicas',
    status: 'desafiando',
    question: '¿Cuál es la ley que explica por qué los planetas orbitan alrededor del Sol y la materia se atrae?',
    options: ['Ley de Gravitación Universal', 'Leyes de la Termodinámica', 'Teoría Celular', 'Cero y Astronomía Maya'],
    correctCardId: 'card-newton',
    rewardCrystals: 30,
    rewardCoins: 150,
    explanation: 'La Ley de Gravitación Universal formulada por Isaac Newton establece que los cuerpos se atraen con una fuerza proporcional al producto de sus masas e inversamente proporcional al cuadrado de su distancia.'
  },
  {
    id: 'hex-3',
    title: 'Pirámide de los Astrónomos Mayas',
    biome: 'piramide',
    subject: 'Lenguajes & Saberes Ancestrales',
    pda: 'Reconoce los sistemas vigesimales y observaciones celestes precolombinas',
    status: 'bloqueado',
    question: '¿Qué innovación matemática crucial incorporaron los sabios mayas en su sistema posicional vigesimal?',
    options: ['El concepto y glifo del Cero (caracol/semilla)', 'El cálculo diferencial', 'Los números complejos', 'El sistema binario'],
    correctCardId: 'card-maya',
    rewardCrystals: 35,
    rewardCoins: 180,
    explanation: 'Los mayas fueron de las primeras civilizaciones en la historia en conceptualizar el cero como posición de valor nulo y completitud cósmica, representado con un caracol marino.'
  },
  {
    id: 'hex-4',
    title: 'Metrópolis de Fracciones y Células',
    biome: 'ciudad',
    subject: 'Pensamiento Matemático & Biología',
    pda: 'Aplica proporciones y reconoce la unidad estructural de la vida',
    status: 'bloqueado',
    question: '¿Qué postulado científico establece que todos los organismos vivos están constituidos por una o más unidades básicas?',
    options: ['Teoría Celular Moderna', 'Leyes de Mendel', 'Teoría Atómica de Bohr', 'Relatividad General'],
    correctCardId: 'card-celular',
    rewardCrystals: 25,
    rewardCoins: 130,
    explanation: 'La Teoría Celular postulada por Schleiden y Schwann demuestra que la célula es la unidad morfológica, fisiológica y genética de todos los seres vivos.'
  }
];

// Cartas TCG Coleccionables
interface TcgCard {
  id: string;
  name: string;
  concept: string;
  costMana: number;
  attack: number;
  health: number;
  image: string;
  rarity: 'Legendaria' | 'Épica' | 'Rara';
  flavorText: string;
}

const TCG_DECK: TcgCard[] = [
  {
    id: 'card-newton',
    name: 'Sir Isaac Newton',
    concept: 'Ley de Gravitación Universal',
    costMana: 1,
    attack: 1,
    health: 3,
    image: '/redisenos_assets/cronicas/tcg_card_newton.jpg',
    rarity: 'Legendaria',
    flavorText: 'Toda partícula en el cosmos atrae a otra con una fuerza cósmica y matemática.'
  },
  {
    id: 'card-termodinamica',
    name: 'Leyes de la Termodinámica',
    concept: 'Conservación de la Energía y Calor',
    costMana: 2,
    attack: 2,
    health: 3,
    image: '/redisenos_assets/cronicas/tcg_card_termodinamica.jpg',
    rarity: 'Épica',
    flavorText: 'La energía no se crea ni se destruye: se transforma en calor, vapor y movimiento.'
  },
  {
    id: 'card-celular',
    name: 'Teoría Celular',
    concept: 'Unidad de la Vida y Microscopía',
    costMana: 3,
    attack: 2,
    health: 3,
    image: '/redisenos_assets/cronicas/tcg_card_celular.jpg',
    rarity: 'Épica',
    flavorText: 'Desde la bacteria más diminuta hasta la secuoya milenaria, la vida late en células.'
  },
  {
    id: 'card-maya',
    name: 'Cero y Astronomía Maya',
    concept: 'Sistema Vigesimal Ancestral',
    costMana: 2,
    attack: 3,
    health: 2,
    image: '/redisenos_assets/cronicas/tcg_card_maya.jpg',
    rarity: 'Legendaria',
    flavorText: 'El caracol de jade que cuenta el infinito y alinea los templos con las estrellas.'
  }
];

export default function CronicasDeExploradoresPage() {
  const [students, setStudents] = useState<ExplorerStudent[]>(INITIAL_EXPLORERS);
  const [activeStudentId, setActiveStudentId] = useState<string>('exp-mateo');
  const [hexagons, setHexagons] = useState<HexNode[]>(HEX_MAP_DATA);
  const [activeHex, setActiveHex] = useState<HexNode>(HEX_MAP_DATA[1]);
  
  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'tcgArena' | 'albumLocker' | 'alchemyLab' | 'teacherStudio' | 'store' | 'missions'>('none');
  const [selectedHeroItem, setSelectedHeroItem] = useState<'base' | 'brujula' | 'sombrero' | 'quetzal' | 'poncho'>('base');
  
  // Estados de la Arena TCG
  const [manaAvailable, setManaAvailable] = useState<number>(10);
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [playedCardId, setPlayedCardId] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<{ success: boolean; message: string } | null>(null);
  
  // Estados del Laboratorio de Artesanía Alquímica
  const [herbCount, setHerbCount] = useState<number>(3);
  const [stoneCount, setStoneCount] = useState<number>(5);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewedPotion, setBrewedPotion] = useState<boolean>(false);

  // Estados visuales y sonoros
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [teacherHexPrompt, setTeacherHexPrompt] = useState<string>('Biodiversidad endémica de México, placas tectónicas y sistema vigesimal maya');
  const [teacherHexSaved, setTeacherHexSaved] = useState<boolean>(false);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);
  };

  // Síntesis de voz femenina neuronal humana en español
  const speakText = (text: string) => {
    if (isSoundMuted) return;
    speakNaturalFemaleSpanish(text, { rate: 0.98, pitch: 1.04 });
  };

  // Temporizador para el Duelo TCG
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeModal === 'tcgArena' && isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      gamificationAudio.playHitSound();
      setCardFeedback({
        success: false,
        message: '¡Tiempo agotado! Juega una carta de conocimiento antes de que acabe el turno.'
      });
    }
    return () => clearInterval(interval);
  }, [activeModal, isTimerRunning, timerSeconds]);

  // Selección del render vivo del explorador en pedestal 3D
  const getExplorerRender = () => {
    switch (selectedHeroItem) {
      case 'brujula':
        return '/redisenos_assets/cronicas/explorador_brujula_antigua.jpg';
      case 'sombrero':
        return '/redisenos_assets/cronicas/explorador_sombrero_safari.jpg';
      case 'quetzal':
        return '/redisenos_assets/cronicas/explorador_mascota_quetzal.jpg';
      case 'poncho':
        return '/redisenos_assets/cronicas/explorador_poncho_artico.jpg';
      case 'base':
      default:
        return '/redisenos_assets/cronicas/explorador_base_pedestal.jpg';
    }
  };

  // 1. Interacción con la Heroína Exploradora
  const handleExplorerHeroClick = () => {
    gamificationAudio.playLevelUpSound();
    speakText(`¡Saludos, explorador ${activeStudent.name.split(' ')[0]}! Soy Elena. Estamos cartografiando el archipiélago. ¡Toca la selva o el volcán para despejar la niebla de guerra!`);
    showToast(`¡Elena la Exploradora te saluda con entusiasmo! 🧭✨`);
  };

  // 2. Selección de Bandera de Casa Elemental
  const handleSelectHouse = (house: 'Ignis' | 'Aqua' | 'Terra' | 'Aer') => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, house } : s));
    const desc = {
      Ignis: 'Casa del Fuego y Termodinámica 🔥',
      Aqua: 'Casa del Agua y los Ciclos Naturales 💧',
      Terra: 'Casa de la Tierra y la Geología 🌿',
      Aer: 'Casa del Viento y la Atmósfera 💨'
    }[house];
    speakText(`¡Elegiste la ${desc}!`);
    showToast(`Afinidad cambiada a ${desc}`);
  };

  // 3. Iniciar Expedición / Duelo TCG
  const handleLaunchHexExpedition = (hex: HexNode) => {
    gamificationAudio.playClickSound();
    setActiveHex(hex);
    setPlayedCardId(null);
    setCardFeedback(null);
    setManaAvailable(10);
    setTimerSeconds(30);
    setIsTimerRunning(true);
    setActiveModal('tcgArena');
    speakText(`Iniciando expedición en ${hex.title}. Consulta la pregunta y juega tu carta.`);
  };

  // 4. Jugar Carta TCG en la Arena
  const handlePlayCard = (card: TcgCard) => {
    if (manaAvailable < card.costMana) {
      gamificationAudio.playHitSound();
      showToast('¡Cristales de maná insuficientes!');
      return;
    }

    gamificationAudio.playClickSound();
    setManaAvailable(prev => prev - card.costMana);
    setPlayedCardId(card.id);

    if (card.id === activeHex.correctCardId) {
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setIsTimerRunning(false);
      setCardFeedback({
        success: true,
        message: `¡JUGADA MAESTRA! Has jugado "${card.name}" con éxito. Despejaste la niebla de "${activeHex.title}". Ganaste +${activeHex.rewardCrystals} Cristales y +50 Pts NEM.`
      });
      speakText(`¡Excelente jugada! La carta ${card.name} responde al enigma. ¡La niebla de guerra se disipa!`);

      // Desbloquear hexágono
      setHexagons(prev => prev.map(h => h.id === activeHex.id ? { ...h, status: 'conquistado' } : h));

      // Premiar al alumno
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          crystals: s.crystals + activeHex.rewardCrystals,
          coins: s.coins + activeHex.rewardCoins,
          communityPoints: s.communityPoints + 50,
          unlockedHexCount: Math.min(18, s.unlockedHexCount + 1)
        };
      }));
    } else {
      gamificationAudio.playHitSound();
      setCardFeedback({
        success: false,
        message: `La carta "${card.name}" tiene gran valor didáctico, pero no responde la causa fundamental de este reto. Prueba otra carta antes de que acabe el tiempo.`
      });
      speakText(`Casi, pero la carta ${card.name} no resuelve este enigma. ¡Revisa tu baraja!`);
    }
  };

  // 5. Crafteo en el Laboratorio de Alquimia
  const handleCraftPotion = () => {
    if (herbCount < 1 || stoneCount < 1) {
      gamificationAudio.playHitSound();
      showToast('Ingredientes insuficientes para la alquimia.');
      return;
    }

    setIsBrewing(true);
    gamificationAudio.playClickSound();
    speakText('¡Mezclando ingredientes botánicos y minerales en el alambique de ciencias!');

    setTimeout(() => {
      setIsBrewing(false);
      setBrewedPotion(true);
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setHerbCount(prev => prev - 1);
      setStoneCount(prev => prev - 1);

      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          crystals: s.crystals + 60,
          communityPoints: s.communityPoints + 80,
          alchemyCraftedCount: s.alchemyCraftedCount + 1
        };
      }));

      speakText('¡Elixir de Maestría Científica creado! +60 Cristales y +80 Puntos para el Proyecto Comunitario.');
      showToast('¡Poción de Ciencia creada con éxito! (+60 Cristales, +80 Pts NEM)');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* 1. EFECTO DE CONFETI EN DOM */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3.5 h-3.5 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#eab308'][i % 6],
                top: `${(i * 6.5) % 95}%`,
                left: `${(i * 11.3) % 98}%`,
                transform: `rotate(${i * 24}deg)`,
                animationDuration: `${1.1 + (i % 5) * 0.25}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 2. TOAST DE NOTIFICACIÓN INSTITUCIONAL */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-amber-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. HEADER SUPERIOR INSTITUCIONAL PRIMARIA ALTA */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-2 border-amber-500/40 shadow-xl px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo y Botón Volver */}
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Rediseños</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-2xl">🧭</span>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight flex items-center gap-2">
                  Crónicas de Exploradores: El Atlas Hexagonal
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold hidden sm:inline">
                    Fase 5 SEP · 9 a 11 Años
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold line-clamp-1">
                  Instituto Cumbres de Anáhuac · Exploración Científica y Proyectos Comunitarios NEM
                </p>
              </div>
            </div>
          </div>

          {/* Conmutador de 3 Alumnos Reales */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 hidden md:inline">Alumno:</span>
            <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudentId(s.id);
                    speakText(`¡Bienvenido explorador ${s.name.split(' ')[0]}! Tienes ${s.crystals} cristales de lógica.`);
                    showToast(`Perfil cambiado a ${s.name} (${s.grade})`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    activeStudentId === s.id
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{s.avatarIcon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75 hidden lg:inline">({s.age}a)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recursos de Explorador & Botonera de Acciones */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-black">
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.crystals} Cristales
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.coins} Monedas
              </span>
              <span className="flex items-center gap-1 text-emerald-300">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                +{activeStudent.communityPoints} Pts NEM
              </span>
            </div>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('albumLocker');
                speakText("¡Abriendo el Álbum de Logros y Vestidor de Héroe!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black border border-amber-500/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Álbum & Héroe</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('alchemyLab');
                speakText("¡Bienvenido al Laboratorio de Alquimia y Artesanía Científica!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-black transition-transform hover:scale-105 active:scale-95"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Alquimia</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('store');
                speakText("Abriendo el Almacén de Suministros de Expedición.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-black transition-transform hover:scale-105 active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Suministros</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('teacherStudio');
                speakText("Estudio Cartográfico Docente y Mentor Histórico en primera persona.");
              }}
              className="p-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-transform hover:scale-105"
              title="Estudio de Actividades Docente (Vista Profesor)"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
              title={isSoundMuted ? 'Activar voz y sonido' : 'Silenciar'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. PANTALLA 1: LIENZO PRINCIPAL DEL ARCHIPIÉLAGO (16:9 FULL MOCKUP FIDELITY) */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        
        {/* LIENZO ENMARCADO CON MÁXIMA FIDELIDAD VISUAL (1600:893 SIN RECORTE) */}
        <div className="relative w-full max-w-[calc(82vh*1.7917)] aspect-[1600/893] mx-auto rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-500/60 bg-slate-950 group">
          
          {/* Ilustración de Fondo Original (1600x893) */}
          <img 
            src="/redisenos_assets/cronicas/cronicas_main_hub_scene.jpg" 
            alt="Crónicas de Exploradores - Archipiélago Hexagonal"
            className="w-full h-full object-fill select-none"
          />

          {/* ========================================================= */}
          {/* HOTSPOTS INTERACTIVOS MAESTROS DIRECTOS SOBRE EL LIENZO  */}
          {/* ========================================================= */}

          {/* 1. Hotspot: Banderas de Casas Elementales (Top-Left: Ignis, Aqua, Terra, Aer) */}
          <div className="absolute top-[9%] left-[3.2%] w-[27%] h-[19%] z-20 grid grid-cols-4 gap-1">
            {/* Ignis */}
            <button
              onClick={() => handleSelectHouse('Ignis')}
              className={`rounded-xl transition-all cursor-pointer ${
                activeStudent.house === 'Ignis'
                  ? 'ring-2 ring-rose-400 bg-rose-500/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              title="Casa Ignis (Fuego y Termodinámica)"
            />
            {/* Aqua */}
            <button
              onClick={() => handleSelectHouse('Aqua')}
              className={`rounded-xl transition-all cursor-pointer ${
                activeStudent.house === 'Aqua'
                  ? 'ring-2 ring-sky-400 bg-sky-500/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              title="Casa Aqua (Agua y Ciclos Naturales)"
            />
            {/* Terra */}
            <button
              onClick={() => handleSelectHouse('Terra')}
              className={`rounded-xl transition-all cursor-pointer ${
                activeStudent.house === 'Terra'
                  ? 'ring-2 ring-emerald-400 bg-emerald-500/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              title="Casa Terra (Tierra y Geología)"
            />
            {/* Aer */}
            <button
              onClick={() => handleSelectHouse('Aer')}
              className={`rounded-xl transition-all cursor-pointer ${
                activeStudent.house === 'Aer'
                  ? 'ring-2 ring-cyan-400 bg-cyan-500/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              title="Casa Aer (Viento y Atmósfera)"
            />
          </div>

          {/* 2. Hotspot: Heroína Exploradora Viva (Left Column) */}
          <div 
            onClick={handleExplorerHeroClick}
            className="absolute top-[30%] left-[5%] w-[19%] h-[65%] z-20 cursor-pointer group/hero rounded-3xl"
            title="¡Toca a la Heroína Exploradora para conversar y recibir pistas!"
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/hero:opacity-100 transition-opacity bg-amber-400/20 border-2 border-amber-400/60 pointer-events-none flex items-center justify-center">
              <span className="bg-amber-900/90 text-amber-200 text-[11px] font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 animate-bounce">
                <Volume2 className="w-3.5 h-3.5" />
                ¡Elena te Saluda!
              </span>
            </div>
          </div>

          {/* 3. Hotspot: Hexágono Central - Selva de la Biodiversidad Lacandona */}
          <button
            onClick={() => handleLaunchHexExpedition(hexagons[1])}
            className="absolute top-[38%] left-[45%] w-[14%] h-[24%] z-20 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 group/selva"
            title="Explorar Selva Lacandona (Saber y Duelo TCG)"
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover/selva:opacity-100 transition-opacity bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center pointer-events-none">
              <span className="bg-emerald-950/90 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                🌲 ¡Iniciar Expedición TCG!
              </span>
            </div>
          </button>

          {/* 4. Hotspot: Hexágono Volcán de Geología */}
          <button
            onClick={() => handleLaunchHexExpedition(hexagons[0])}
            className="absolute top-[34%] left-[27%] w-[12%] h-[22%] z-20 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 group/volcan"
            title="Explorar Volcán de Geología Tectónica"
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover/volcan:opacity-100 transition-opacity bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center pointer-events-none">
              <span className="bg-rose-950/90 text-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                🌋 Volcán Activo
              </span>
            </div>
          </button>

          {/* 5. Hotspot: Hexágono Pirámide de los Astrónomos Mayas */}
          <button
            onClick={() => handleLaunchHexExpedition(hexagons[2])}
            className="absolute top-[52%] left-[36%] w-[12%] h-[20%] z-20 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 group/maya"
            title="Explorar Pirámide Maya (Cero y Astronomía)"
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover/maya:opacity-100 transition-opacity bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center pointer-events-none">
              <span className="bg-amber-950/90 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                🏛️ Pirámide Maya
              </span>
            </div>
          </button>

          {/* 5b. Hotspot: Hexágono Metrópolis de Fracciones y Células */}
          <button
            onClick={() => handleLaunchHexExpedition(hexagons[3])}
            className="absolute top-[30%] left-[60%] w-[12%] h-[21%] z-20 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 group/ciudad"
            title="Explorar Metrópolis de Fracciones y Células"
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover/ciudad:opacity-100 transition-opacity bg-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center pointer-events-none">
              <span className="bg-cyan-950/90 text-cyan-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                🧬 Metrópolis Celular
              </span>
            </div>
          </button>

          {/* 6. Hotspot: Laboratorio de Artesanía (Bottom-Center Alambique de Alquimia) */}
          <div 
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('alchemyLab');
              speakText("¡Mesa de Alquimia y Artesanía Científica lista para mezclar recursos!");
            }}
            className="absolute bottom-[4%] left-[36%] w-[30%] h-[24%] z-20 cursor-pointer group/lab rounded-2xl"
            title="Abrir Laboratorio de Artesanía (Mezclar Hojas + Roca = Poción)"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/lab:opacity-100 transition-opacity bg-amber-500/25 border-2 border-amber-400 pointer-events-none flex items-center justify-center">
              <span className="bg-amber-950/90 text-amber-200 text-xs font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 animate-pulse">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                Laboratorio de Alquimia (¡CREAR!)
              </span>
            </div>
          </div>

          {/* 7. Hotspot: Pergamino de Contratos de Misión (Bottom-Right) */}
          <div 
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('missions');
              speakText("¡Contratos de Misión y Proyectos Comunitarios NEM!");
            }}
            className="absolute bottom-[6%] right-[2%] w-[20%] h-[42%] z-20 cursor-pointer group/scroll rounded-2xl"
            title="Abrir Contratos de Misión Curricular"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/scroll:opacity-100 transition-opacity bg-amber-500/20 border-2 border-amber-400 pointer-events-none flex items-center justify-center">
              <span className="bg-amber-950/90 text-amber-200 text-xs font-black px-2 py-1 rounded-full shadow-xl flex items-center gap-1">
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                Contratos de Misión
              </span>
            </div>
          </div>

          {/* 8. Hotspot: Radar y Minimapa de Exploración (Top-Right) */}
          <div 
            onClick={() => {
              gamificationAudio.playClickSound();
              showToast(`Minimapa del Sector 5: ${activeStudent.unlockedHexCount} de 18 hexágonos despejados`);
              speakText(`Tu equipo lleva ${activeStudent.unlockedHexCount} de 18 hexágonos explorados sin niebla.`);
            }}
            className="absolute top-[6%] right-[2.5%] w-[19%] h-[32%] z-20 cursor-pointer group/radar rounded-2xl"
            title="Minimapa Táctico de Exploración"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/radar:opacity-100 transition-opacity bg-cyan-400/20 border-2 border-cyan-400 pointer-events-none flex items-center justify-center">
              <span className="bg-slate-950/90 text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                🧭 {activeStudent.unlockedHexCount}/18 Despejados
              </span>
            </div>
          </div>

        </div>

        {/* BARRA INFORMATIVA INFERIOR DE EXPEDICIÓN */}
        <div className="mt-3 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-amber-500/30 flex flex-wrap items-center justify-between text-xs text-slate-300 shadow-xl gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400">ISkool Atlas Hexagonal</span>
            <span>·</span>
            <span>Casa {activeStudent.house}</span>
            <span>·</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
              Evaluación Formativa Colaborativa NEM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLaunchHexExpedition(hexagons[1])}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Duelo TCG en Vivo</span>
            </button>
            <button
              onClick={() => setActiveModal('alchemyLab')}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratorio</span>
            </button>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 5. PANTALLA 2: MODAL ARENA TCG DIDÁCTICA EN VIVO (TCG CARDS GAMEPLAY) */}
      {/* ========================================================================= */}
      {activeModal === 'tcgArena' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-500 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            {/* Header Flotante del Duelo */}
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl border border-amber-500/50 text-xs font-black text-white flex items-center gap-3">
                <span className="text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Maná: {manaAvailable}/10
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {timerSeconds}s restantes
                </span>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl transition-transform active:scale-95"
                title="Cerrar Duelo TCG"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIENZO DE LA ARENA TCG (FONDO MOCKUP OPTIMIZADO) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden group">
              
              <img 
                src="/redisenos_assets/cronicas/cronicas_tcg_arena_scene.jpg" 
                alt="Arena TCG - Duelo de Cartas Didáctico"
                className="w-full h-full object-cover"
              />

              {/* Pregunta Holográfica Flotante en el Círculo de Invocación */}
              <div className="absolute top-[16%] left-[30%] w-[40%] h-[32%] z-20 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full mb-1 border border-cyan-400/40">
                  Enigma Curricular del Archipiélago
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-snug">
                  {activeHex.question}
                </p>
                <span className="text-[10px] text-amber-300 mt-1 font-bold">
                  Selecciona la carta correcta de tu mano para responder (+{activeHex.rewardCrystals} Cristales)
                </span>
              </div>

              {/* 4 CARTAS TCG JUGABLES EN LA MANO DEL ALUMNO (INFERIOR) */}
              <div className="absolute bottom-[2%] left-[24%] right-[16%] z-20 grid grid-cols-4 gap-2.5 sm:gap-3 px-2">
                {TCG_DECK.map(card => {
                  const isSelected = playedCardId === card.id;
                  const canAfford = manaAvailable >= card.costMana;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handlePlayCard(card)}
                      className={`relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl border-2 group/card ${
                        isSelected
                          ? 'ring-4 ring-amber-400 scale-110 -translate-y-4 shadow-amber-500/50 z-30'
                          : canAfford
                          ? 'border-amber-400/60 hover:scale-105 hover:-translate-y-2 hover:border-amber-300'
                          : 'border-slate-700 opacity-60'
                      }`}
                      title={`Jugar ${card.name} (${card.costMana} Maná)`}
                    >
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover transition-transform group-hover/card:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                          <Check className="w-8 h-8 text-amber-300 animate-bounce" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón de Terminar Turno (Esquina Inferior Derecha) */}
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setTimerSeconds(30);
                  setManaAvailable(10);
                  showToast('Turno reiniciado: Cristales de Maná al 100%');
                }}
                className="absolute bottom-[5%] right-[2%] w-[12%] h-[9%] z-20 rounded-xl hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer"
                title="Terminar Turno y Recargar Maná"
              />

              {/* Banner de Feedback Didáctico */}
              {cardFeedback && (
                <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 z-30 w-[85%] max-w-xl">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm font-black text-center shadow-2xl border-2 flex items-center justify-between gap-3 animate-in fade-in ${
                    cardFeedback.success
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200'
                      : 'bg-rose-950/95 border-rose-400 text-rose-200'
                  }`}>
                    <span>{cardFeedback.message}</span>
                    {cardFeedback.success && (
                      <button
                        onClick={() => setActiveModal('none')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-md"
                      >
                        Continuar
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Barra Inferior del Duelo */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400" /> Duelo Curricular NEM: Pensamiento Científico y Matemático
              </span>
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Volver al Archipiélago
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PANTALLA 3: ÁLBUM DE LOGROS Y PERSONALIZADOR DE HÉROE (MOCKUP REAL) */}
      {/* ========================================================================= */}
      {activeModal === 'albumLocker' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-500 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            {/* Header del Álbum */}
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-4 py-1 rounded-full border border-amber-500/40 text-xs font-black text-amber-300">
                📖 Álbum de Logros STEM & Personalizador 3D
              </div>
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIENZO DEL ÁLBUM Y HÉROE (FONDO MOCKUP OPTIMIZADO) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden group">
              
              <img 
                src="/redisenos_assets/cronicas/cronicas_album_customizer_scene.jpg" 
                alt="Álbum de Logros y Personalizador"
                className="w-full h-full object-cover"
              />

              {/* RENDER VIVO DEL EXPLORADOR EN EL PEDESTAL 3D (DERECHA) */}
              <div className="absolute top-[24%] right-[24%] w-[22%] h-[54%] z-20 pointer-events-none flex flex-col items-center justify-center p-1">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-slate-950 relative">
                  <img 
                    src={getExplorerRender()} 
                    alt="Explorador en Pedestal 3D"
                    className="w-full h-full object-cover animate-in fade-in duration-200"
                  />
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 rounded-lg py-0.5 text-center text-white text-[9px] font-black">
                    {selectedHeroItem === 'brujula' && '🧭 Brújula Ancestral'}
                    {selectedHeroItem === 'sombrero' && '🤠 Sombrero Safari'}
                    {selectedHeroItem === 'quetzal' && '🦜 Quetzal Sagrado'}
                    {selectedHeroItem === 'poncho' && '🧥 Poncho Andino'}
                    {selectedHeroItem === 'base' && '🎒 Atuendo Base'}
                  </div>
                </div>
              </div>

              {/* BOTONES FLOTANTES PARA EQUIPAR ACCESORIOS (DERECHA) */}
              <div className="absolute top-[26%] right-[3.5%] w-[18%] h-[52%] z-20 grid grid-rows-4 gap-2">
                {/* 1. Capa / Poncho */}
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedHeroItem(prev => prev === 'poncho' ? 'base' : 'poncho');
                    showToast('Poncho Andino Térmico equipado');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${
                    selectedHeroItem === 'poncho' ? 'ring-2 ring-emerald-400 bg-emerald-400/20' : 'hover:bg-white/10'
                  }`}
                  title="Equipar Poncho Andino Térmico"
                />
                {/* 2. Báculo / Brújula */}
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedHeroItem(prev => prev === 'brujula' ? 'base' : 'brujula');
                    showToast('Brújula de Oro Ancestral equipada');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${
                    selectedHeroItem === 'brujula' ? 'ring-2 ring-amber-400 bg-amber-400/20' : 'hover:bg-white/10'
                  }`}
                  title="Equipar Brújula de Oro Ancestral"
                />
                {/* 3. Mascota Fénix / Quetzal */}
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedHeroItem(prev => prev === 'quetzal' ? 'base' : 'quetzal');
                    showToast('Mascota Quetzal Sagrado equipada en hombro');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${
                    selectedHeroItem === 'quetzal' ? 'ring-2 ring-cyan-400 bg-cyan-400/20' : 'hover:bg-white/10'
                  }`}
                  title="Equipar Mascota Quetzal Sagrado"
                />
                {/* 4. Corona / Sombrero */}
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedHeroItem(prev => prev === 'sombrero' ? 'base' : 'sombrero');
                    showToast('Sombrero Safari de Pith equipado');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${
                    selectedHeroItem === 'sombrero' ? 'ring-2 ring-yellow-400 bg-yellow-400/20' : 'hover:bg-white/10'
                  }`}
                  title="Equipar Sombrero Safari"
                />
              </div>

              {/* SELLOS DE LOGROS EN EL GRIMORIO ABIERTO (IZQUIERDA) */}
              <div className="absolute top-[32%] left-[12%] w-[27%] h-[40%] z-20 grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    speakText("¡Sello Maestro de Ciencias Químicas! Dominaste las soluciones y reacciones.");
                    showToast("Sello: Maestro de Ciencias ⭐⭐⭐");
                  }}
                  className="rounded-xl hover:bg-amber-400/20 transition-all cursor-pointer"
                  title="Maestro de Ciencias Químicas"
                />
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    speakText("¡Sello de Ingeniería Mecánica! Dominaste los engranajes y poleas.");
                    showToast("Sello: Ingeniería Mecánica ⭐⭐⭐");
                  }}
                  className="rounded-xl hover:bg-amber-400/20 transition-all cursor-pointer"
                  title="Ingeniería Mecánica"
                />
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    speakText("¡Sello de Física Molecular! Dominaste los enlaces y átomos.");
                    showToast("Sello: Física Molecular ⭐⭐⭐");
                  }}
                  className="rounded-xl hover:bg-amber-400/20 transition-all cursor-pointer"
                  title="Física Molecular"
                />
              </div>

            </div>

            {/* Barra Inferior del Álbum */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold">
                Alumno Activo: <strong className="text-amber-300">{activeStudent.name}</strong> ({activeStudent.rankTitle})
              </span>
              <button
                onClick={() => {
                  gamificationAudio.playCoinSound();
                  showToast('¡Configuración de Héroe Guardada con Éxito!');
                  setActiveModal('none');
                }}
                className="px-5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md"
              >
                Guardar Héroe y Volver
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL LABORATORIO DE ARTESANÍA Y ALQUIMIA CIENTÍFICA */}
      {/* ========================================================================= */}
      {activeModal === 'alchemyLab' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-600 bg-amber-950 p-6 space-y-6 text-amber-100">
            
            <div className="flex items-center justify-between border-b border-amber-800/80 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-black text-white">Laboratorio de Artesanía Alquímica</h3>
                  <p className="text-xs text-amber-300/80">Combina recursos botánicos y minerales para proyectos comunitarios de la NEM</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MESA DE CRAFTEO DIDÁCTICA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-black/50 p-4 rounded-3xl border border-amber-800">
              
              {/* Ingrediente 1: Hierba Lacandona */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-900/40 border border-amber-700/60 text-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-400 mb-2">
                  <img src="/redisenos_assets/cronicas/alquimia_hierba.jpg" alt="Hierba Lacandona" className="w-full h-full object-cover" />
                </div>
                <strong className="text-xs text-white">Hierba Lacandona</strong>
                <span className="text-[10px] text-emerald-300">Disponible: {herbCount}x</span>
              </div>

              {/* Signo Más e Ingrediente 2: Roca Basalto */}
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-black text-amber-400 mb-2">+</span>
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-rose-400 mb-2">
                  <img src="/redisenos_assets/cronicas/alquimia_roca.jpg" alt="Roca de Basalto" className="w-full h-full object-cover" />
                </div>
                <strong className="text-xs text-white">Roca de Basalto</strong>
                <span className="text-[10px] text-rose-300">Disponible: {stoneCount}x</span>
              </div>

              {/* Resultado: Poción de Ciencia */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-900/40 border border-amber-700/60 text-center">
                <span className="text-2xl font-black text-amber-400 mb-1">=</span>
                <div className={`w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400 mb-2 ${isBrewing ? 'animate-spin' : ''}`}>
                  <img src="/redisenos_assets/cronicas/alquimia_pocion.jpg" alt="Poción de Ciencia" className="w-full h-full object-cover" />
                </div>
                <strong className="text-xs text-amber-300">Poción de Ciencia</strong>
                <span className="text-[10px] text-amber-400 font-bold">+60 Cristales · +80 Pts NEM</span>
              </div>

            </div>

            {/* Botón de Crafteo */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-amber-300">
                Pociones sintetizadas por {activeStudent.name.split(' ')[0]}: <strong>{activeStudent.alchemyCraftedCount}</strong>
              </span>

              <button
                onClick={handleCraftPotion}
                disabled={isBrewing || herbCount < 1 || stoneCount < 1}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-400 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-900/50 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isBrewing ? 'Sintetizando Alquimia...' : '¡CREAR POCIÓN DE CIENCIA!'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL CONTRATOS DE MISIÓN CURRICULAR (PAPIRO NEM) */}
      {/* ========================================================================= */}
      {activeModal === 'missions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-600 bg-amber-950 p-6 space-y-4 text-amber-100">
            
            <div className="flex items-center justify-between border-b border-amber-800 pb-3">
              <div className="flex items-center gap-2">
                <Scroll className="w-6 h-6 text-amber-400" />
                <h3 className="text-base font-black text-white">Contratos de Misión Curricular (Fase 5 SEP)</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="p-1 rounded-xl bg-amber-900 text-amber-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-amber-700/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Misión 1 · Dificultad 50</span>
                  <h4 className="font-extrabold text-white text-sm">El Misterio de las Ruinas Mayas</h4>
                  <p className="text-xs text-amber-200/80">Investiga la correlación entre el sistema vigesimal maya y la alineación estelar.</p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playLevelUpSound();
                    speakText("¡Contrato de las Ruinas Mayas completado! Recibes 50 puntos de proyecto comunitario y 100 monedas.");
                    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, communityPoints: s.communityPoints + 50, coins: s.coins + 100 } : s));
                    showToast("¡Misión 1 completada! +50 Pts NEM y +100 Monedas");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 shadow-md"
                >
                  Completar (+50 Pts)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-amber-700/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-400">Misión 2 · Dificultad 30</span>
                  <h4 className="font-extrabold text-white text-sm">Ayuda al Pescador y Ciclo del Agua</h4>
                  <p className="text-xs text-amber-200/80">Recopila datos de precipitación pluvial en la cuenca del Río Usumacinta.</p>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playLevelUpSound();
                    speakText("¡Contrato del Ciclo del Agua completado! Recibes 30 puntos de proyecto comunitario y 80 monedas.");
                    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, communityPoints: s.communityPoints + 30, coins: s.coins + 80 } : s));
                    showToast("¡Misión 2 completada! +30 Pts NEM y +80 Monedas");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 shadow-md"
                >
                  Completar (+30 Pts)
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal('none')}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md"
              >
                Cerrar Contratos
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8B. MODAL ALMACÉN DE SUMINISTROS DE EXPEDICIÓN ('store') */}
      {/* ========================================================================= */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-amber-500 bg-slate-950 p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase">⛺ Intendencia del Archipiélago</span>
                <h3 className="text-lg font-black text-white">Almacén de Suministros de Expedición</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="p-1.5 rounded-xl bg-slate-800 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-2xl mb-1">🌿🪨</div>
                  <h4 className="font-black text-sm text-emerald-300">Lote Alquímico (+3 Hojas y +3 Rocas)</h4>
                  <p className="text-xs text-slate-400">Insumos botánicos y geológicos para sintetizar más pociones de ciencia.</p>
                </div>
                <button
                  onClick={() => {
                    if (activeStudent.coins < 100) {
                      showToast("Necesitas 100 Monedas para este lote.");
                      return;
                    }
                    gamificationAudio.playCoinSound();
                    setHerbCount(prev => prev + 3);
                    setStoneCount(prev => prev + 3);
                    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, coins: s.coins - 100 } : s));
                    speakText("Lote alquímico adquirido. Tienes tres nuevas hojas curativas y tres rocas de basalto.");
                    showToast("¡+3 Hojas y +3 Rocas añadidas al Laboratorio!");
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  Adquirir por 100 Monedas
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-2xl mb-1">🧭✨</div>
                  <h4 className="font-black text-sm text-cyan-300">Recarga de Maná Cartográfico (+5 Maná)</h4>
                  <p className="text-xs text-slate-400">Aumenta la reserva de maná táctico para tus duelos de cartas en el Atlas.</p>
                </div>
                <button
                  onClick={() => {
                    if (activeStudent.coins < 120) {
                      showToast("Necesitas 120 Monedas.");
                      return;
                    }
                    gamificationAudio.playCoinSound();
                    setManaAvailable(prev => prev + 5);
                    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, coins: s.coins - 120, crystals: s.crystals + 25 } : s));
                    speakText("Reserva de maná cartográfico recargada con éxito.");
                    showToast("¡+5 Maná Táctico y +25 Cristales!");
                  }}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                >
                  Adquirir por 120 Monedas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL PANTALLA 4: ESTUDIO DE ACTIVIDADES DOCENTE & MENTOR 1ª PERSONA */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500 bg-slate-950 flex flex-col justify-between max-h-[96vh] overflow-y-auto">
            
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="bg-slate-950/90 px-4 py-1 rounded-full border border-indigo-500 text-xs font-black text-indigo-300">
                🎓 Estudio Cartográfico Docente · Creación Unificada de Retos ISkool
              </div>
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('none');
                }}
                className="p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lienzo del Estudio Docente (Mockup Optimizado) */}
            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <img 
                src="/redisenos_assets/cronicas/cronicas_teacher_studio_scene.jpg" 
                alt="Estudio Cartográfico Docente"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400">👩‍🏫 Bóveda Curricular · Fase 5 SEP</span>
                  <h4 className="text-sm font-black text-white">Configurar Nuevo Hexágono de Expedición</h4>
                  <input
                    type="text"
                    value={teacherHexPrompt}
                    onChange={(e) => setTeacherHexPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        gamificationAudio.playLevelUpSound();
                        setTeacherHexSaved(true);
                        speakText("Hexágono curricular guardado en la Bóveda Curricular para quinto y sexto de primaria.");
                        showToast("¡Hexágono sincronizado en Bóveda Curricular!");
                      }}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs"
                    >
                      💾 Sincronizar en Bóveda
                    </button>
                    <button
                      onClick={() => handleLaunchHexExpedition(hexagons[1])}
                      className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                    >
                      🧭 Probar Hexágono
                    </button>
                  </div>
                  {teacherHexSaved && (
                    <div className="text-[11px] text-emerald-400 font-bold">
                      ✅ Guardado en <code>planeaciones/primaria_alta/cronicas_exploradores.md</code>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-amber-400">📜 Mentor Histórico en 1ª Persona · Canon Inviolable</span>
                  <h4 className="text-sm font-black text-white">Alexander von Humboldt (1769–1859)</h4>
                  <p className="text-xs text-slate-300 italic">
                    &ldquo;Nací en Berlín en 1769 y en 1803 recorrí las montañas, volcanes y selvas de México midiendo la presión barométrica, la flora y las pirámides antiguas para trazar el primer gran atlas científico de este territorio.&rdquo;
                  </p>
                  <button
                    onClick={() => {
                      gamificationAudio.playLevelUpSound();
                      speakText("Nací en Berlín en 1769 y en 1803 recorrí los volcanes y selvas de México midiendo la altitud, la flora y la geografía para trazar mi atlas científico. ¡Toma 40 cristales para tu expedición!");
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, crystals: s.crystals + 40 } : s));
                      showToast("🧭 ¡Escuchaste a Humboldt en 1ª persona! +40 Cristales");
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar Crónica en 1ª Persona (+40 Cristales)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
