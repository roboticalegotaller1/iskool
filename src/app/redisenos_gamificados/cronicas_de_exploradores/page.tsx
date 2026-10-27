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
  GraduationCap
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES INDEPENDIENTES (3 ALUMNOS)
// ==========================================
interface ExplorerStudent {
  id: string;
  name: string;
  grade: string;
  level: number;
  rankTitle: string;
  avatarIcon: string;
  crystals: number;
  scrolls: number;
  coins: number;
  unlockedHexCount: number;
  equippedGear: {
    tool: string;
    outfit: string;
    badge: string;
  };
  inventory: string[];
  communityPoints: number;
}

const INITIAL_EXPLORERS: ExplorerStudent[] = [
  {
    id: 'exp-mateo',
    name: 'Mateo Ramírez',
    grade: '5º de Primaria · Fase 5 SEP',
    level: 6,
    rankTitle: 'Cartógrafo Estelar',
    avatarIcon: '🧭',
    crystals: 140,
    scrolls: 28,
    coins: 920,
    unlockedHexCount: 7,
    equippedGear: {
      tool: 'Telescopio Dorado de Precisión',
      outfit: 'Traje de Expedición de Jungla',
      badge: 'Naturalista Mayor'
    },
    inventory: ['item-telescopio', 'item-antorcha', 'item-brujula-bronce'],
    communityPoints: 340
  },
  {
    id: 'exp-vale',
    name: 'Valentina Cruz',
    grade: '4º de Primaria · Fase 5 SEP',
    level: 4,
    rankTitle: 'Naturalista Mayor',
    avatarIcon: '🌿',
    crystals: 95,
    scrolls: 18,
    coins: 610,
    unlockedHexCount: 5,
    equippedGear: {
      tool: 'Lupa de Geología Cuántica',
      outfit: 'Bata con Pines de Física',
      badge: 'Botánica de Campo'
    },
    inventory: ['item-red-mariposas', 'item-lupa-geologia'],
    communityPoints: 210
  },
  {
    id: 'exp-emiliano',
    name: 'Emiliano Soto',
    grade: '6º de Primaria · Fase 5 SEP',
    level: 8,
    rankTitle: 'Estratega de Ecuaciones',
    avatarIcon: '📐',
    crystals: 210,
    scrolls: 45,
    coins: 1450,
    unlockedHexCount: 11,
    equippedGear: {
      tool: 'Astrolabio de Latón Marino',
      outfit: 'Capa Térmica de Volcán',
      badge: 'Maestro de la Brújula'
    },
    inventory: ['item-telescopio', 'item-pico-obsidiana', 'item-astrolabio'],
    communityPoints: 520
  }
];

interface HexNode {
  id: string;
  title: string;
  biome: 'volcan' | 'selva' | 'piramide' | 'ciudad';
  subject: string;
  pda: string;
  status: 'conquistado' | 'desafiando' | 'bloqueado';
  question: string;
  options: string[];
  correctIndex: number;
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
    correctIndex: 0,
    rewardCrystals: 25,
    rewardCoins: 120,
    explanation: 'La subducción de la Placa de Cocos debajo de la Placa Norteamericana es la principal causante de sismos en el sur y centro de México.'
  },
  {
    id: 'hex-2',
    title: 'Selva de la Biodiversidad Lacandona',
    biome: 'selva',
    subject: 'Ética, Naturaleza y Sociedades',
    pda: 'Valora los ecosistemas de selva húmeda, el ciclo del agua y especies endémicas',
    status: 'desafiando',
    question: '¿Cuál es la función principal de los árboles de dosel en el ciclo hidrológico de la selva húmeda?',
    options: [
      'Evapotranspiración masiva y condensación de nubes locales',
      'Erosión deliberada del sustrato de arcilla',
      'Absorción del 100% de la energía solar sin liberar humedad',
      'Aceleración de corrientes eólicas destructivas'
    ],
    correctIndex: 0,
    rewardCrystals: 30,
    rewardCoins: 150,
    explanation: 'Los grandes árboles del dosel bombean cientos de litros de vapor de agua diarios a la atmósfera mediante evapotranspiración, originando ríos voladores.'
  },
  {
    id: 'hex-3',
    title: 'Pirámide de los Astrónomos Mayas',
    biome: 'piramide',
    subject: 'Lenguajes & Saberes Ancestrales',
    pda: 'Reconoce los sistemas vigesimales y observaciones celestes precolombinas',
    status: 'bloqueado',
    question: '¿Qué innovación matemática crucial incorporaron los sabios mayas en su sistema posicional vigesimal?',
    options: [
      'El concepto y símbolo gráfico del Cero (caracol/semilla)',
      'El cálculo diferencial e infinitesimal',
      'Las tablas de logaritmos neperianos',
      'Los números complejos e imaginarios'
    ],
    correctIndex: 0,
    rewardCrystals: 35,
    rewardCoins: 180,
    explanation: 'Los mayas fueron de las primeras civilizaciones en la historia de la humanidad en conceptualizar el cero como posición de valor nulo y completitud cósmica.'
  },
  {
    id: 'hex-4',
    title: 'Metrópolis de Fracciones y Razones',
    biome: 'ciudad',
    subject: 'Pensamiento Matemático',
    pda: 'Aplica proporciones y fracciones equivalentes en problemas de reparto comunitario',
    status: 'bloqueado',
    question: 'Si una expedición consume 3/8 de sus víveres en 3 días de travesía: ¿qué fracción de raciones le queda para el resto del viaje?',
    options: ['5/8 de los víveres', '3/8 de los víveres', '1/2 de los víveres', '7/8 de los víveres'],
    correctIndex: 0,
    rewardCrystals: 25,
    rewardCoins: 130,
    explanation: 'El total de raciones representa 8/8. Al restar 3/8 consumidos, restan exactamente 5/8 para la siguiente etapa.'
  }
];

export default function CronicasDeExploradoresPage() {
  const [students, setStudents] = useState<ExplorerStudent[]>(INITIAL_EXPLORERS);
  const [activeStudentId, setActiveStudentId] = useState<string>('exp-mateo');
  const [hexagons, setHexagons] = useState<HexNode[]>(HEX_MAP_DATA);
  const [activeHex, setActiveHex] = useState<HexNode | null>(null);
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'quiz' | 'store' | 'locker' | 'teacherStudio'>('none');
  const [selectedHeroItem, setSelectedHeroItem] = useState<'base' | 'brujula' | 'sombrero' | 'quetzal' | 'poncho'>('base');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

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

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  const handleSelectStudent = (id: string) => {
    gamificationAudio.playClickSound();
    setActiveStudentId(id);
    setActiveHex(null);
    setFeedback(null);
    showToast(`Perfil de expedición cambiado a ${students.find(s => s.id === id)?.name}`);
  };

  const handleOpenHexChallenge = (hex: HexNode) => {
    gamificationAudio.playClickSound();
    setActiveHex(hex);
    setSelectedAnswer(null);
    setFeedback(null);
    setActiveModal('quiz');
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (!activeHex) return;
    setSelectedAnswer(optionIndex);
    if (optionIndex === activeHex.correctIndex) {
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setFeedback({
        message: `¡EXPEDICIÓN EXITOSA! Has despejado la niebla en "${activeHex.title}". Ganaste +${activeHex.rewardCrystals} Cristales, +${activeHex.rewardCoins} Monedas y +50 Puntos de Proyecto Comunitario.`,
        success: true
      });
      // Actualizar estado del hexágono a conquistado
      setHexagons(prev => prev.map(h => h.id === activeHex.id ? { ...h, status: 'conquistado' } : h));
      // Actualizar progreso del alumno activo
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          crystals: s.crystals + activeHex.rewardCrystals,
          coins: s.coins + activeHex.rewardCoins,
          communityPoints: s.communityPoints + 50,
          unlockedHexCount: s.unlockedHexCount + 1
        };
      }));
    } else {
      gamificationAudio.playHitSound();
      setFeedback({
        message: 'Respuesta inexacta. Consulta las fuentes primarias en la Bóveda Curricular y vuelve a intentarlo sin penalizaciones.',
        success: false
      });
    }
  };

  const handleEquipItem = (category: 'tool' | 'outfit' | 'badge', itemName: string) => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedGear: {
          ...s.equippedGear,
          [category]: itemName
        }
      };
    }));
    showToast(`¡${itemName} equipado con éxito!`);
  };

  const handleBuyStoreItem = (itemName: string, costCoins: number, category: 'tool' | 'outfit' | 'badge') => {
    if (activeStudent.coins < costCoins) {
      gamificationAudio.playHitSound();
      showToast('Monedas insuficientes. Completa más expediciones curriculares para ganar monedas.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        coins: s.coins - costCoins,
        inventory: [...s.inventory, itemName],
        equippedGear: {
          ...s.equippedGear,
          [category]: itemName
        }
      };
    }));
    showToast(`¡Compraste y equipaste "${itemName}" por ${costCoins} Monedas!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* EFECTO DE CONFETI EN DOM */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'][i % 5],
                top: `${(i * 7) % 95}%`,
                left: `${(i * 13) % 98}%`,
                transform: `rotate(${i * 24}deg)`,
                animationDuration: `${1.2 + (i % 5) * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* TOAST DE NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER DE EXPEDICIÓN */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-900/40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a Rediseños</span>
            </Link>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/50">
                05 Primaria Alta · Fase 5 SEP (9 a 11 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                Crónicas de Exploradores: El Atlas Hexagonal
              </h1>
            </div>
          </div>

          {/* PERFILES DE ALUMNOS & BOTONERA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    s.id === activeStudent.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{s.avatarIcon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.crystals} Cristales
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.coins} Monedas
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <Shirt className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Vestidor</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Bazar</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teacherStudio');
                }}
                className="p-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold"
                title="Universal Challenge Studio (Vista Docente)"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: 4 PANTALLAS INTEGRADAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUB DEL MAPA HEXAGONAL & CAMPAMENTO BASE */}
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-800/40 shadow-2xl space-y-5">
          
          {/* Banner del Explorador Activo */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                  {activeStudent.rankTitle}
                </span>
                <span className="text-xs text-slate-400">{activeStudent.grade}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>{activeStudent.avatarIcon} Campamento Base de {activeStudent.name}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Herramienta Activa: <strong className="text-amber-300">{activeStudent.equippedGear.tool}</strong> · {activeStudent.equippedGear.outfit} · Insignia: <em>{activeStudent.equippedGear.badge}</em>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
                <span className="text-xl font-black text-emerald-400 block">{activeStudent.unlockedHexCount}/18</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Territorios Libres</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
                <span className="text-xl font-black text-cyan-400 block">+{activeStudent.communityPoints}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Puntos Proyecto NEM</span>
              </div>
            </div>
          </div>

          {/* Cuadrícula Hexagonal Táctica (Niebla de Guerra) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-400" />
                Archipiélago Inexplorado de Territorios Curriculares (Fase 5 SEP)
              </h3>
              <span className="text-xs text-slate-400">Toca un hexágono para iniciar la expedición científica</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hexagons.map((hex, idx) => {
                const isConquered = hex.status === 'conquistado';
                const isChallenging = hex.status === 'desafiando';
                return (
                  <div
                    key={hex.id}
                    onClick={() => handleOpenHexChallenge(hex)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-64 group ${
                      isConquered
                        ? 'bg-emerald-950/25 border-emerald-500/50 hover:border-emerald-400 shadow-lg shadow-emerald-950/20'
                        : isChallenging
                        ? 'bg-amber-950/30 border-amber-500/70 hover:border-amber-400 shadow-xl shadow-amber-950/30 ring-2 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800 opacity-65 hover:opacity-95'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isConquered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isChallenging
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          Bioma {hex.biome}
                        </span>
                        {isConquered ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Despejado
                          </span>
                        ) : isChallenging ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                            ¡Niebla Activa!
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">Por Explorar</span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-white text-base leading-tight mb-1 group-hover:text-amber-300 transition-colors">
                        {hex.title}
                      </h4>
                      <span className="text-[10px] text-amber-400/90 font-bold block mb-1.5">
                        {hex.subject}
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {hex.pda}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-black flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> +{hex.rewardCoins}
                      </span>
                      <span className="text-cyan-400 font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> +{hex.rewardCrystals} Cristales
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* PANTALLA 2: MODAL DE EXPEDICIÓN DIDÁCTICA & QUIZ */}
      {activeModal === 'quiz' && activeHex && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Expedición Científica en Vivo</span>
                  <h3 className="text-base font-extrabold text-white">{activeHex.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Enigma Curricular de Expedición:</span>
                <span className="text-[11px] text-cyan-300 font-bold">Temporizador de Agilidad: 30s</span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                {activeHex.question}
              </p>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {activeHex.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                      selectedAnswer === idx
                        ? idx === activeHex.correctIndex
                          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                          : 'bg-rose-950/90 border-rose-500 text-rose-200'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-amber-300">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {selectedAnswer === idx && idx === activeHex.correctIndex && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {feedback && (
              <div className={`p-4 rounded-2xl border text-xs font-bold space-y-2 ${
                feedback.success
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/70 text-rose-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span>{feedback.message}</span>
                  <button
                    onClick={() => {
                      if (feedback.success) setActiveModal('none');
                      setFeedback(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-black/40 text-[11px] font-black"
                  >
                    {feedback.success ? 'Continuar Expedición' : 'Reintentar'}
                  </button>
                </div>
                {feedback.success && (
                  <p className="text-[11px] text-emerald-400/90 font-normal border-t border-emerald-800/40 pt-1.5">
                    <strong>Fundamento Curricular:</strong> {activeHex.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANTALLA 3: VESTIDOR Y PERSONALIZADOR DE AVATAR STEM */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal 3D & Vestidor de Expedición STEM</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Explorador en Pedestal */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-amber-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl">
                  <img
                    src={getExplorerRender()}
                    alt="Explorador en Pedestal 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
                    Pedestal Maya 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedHeroItem === 'brujula' && '🧭 Brújula de Oro Ancestral Equipada'}
                    {selectedHeroItem === 'sombrero' && '🤠 Sombrero Safari de Pith Equipado'}
                    {selectedHeroItem === 'quetzal' && '🦜 Mascota Quetzal Sagrado en Hombro'}
                    {selectedHeroItem === 'poncho' && '🧥 Poncho Andino Térmico Equipado'}
                    {selectedHeroItem === 'base' && '🎒 Atuendo Base de Expedición'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Explorador:</span>
                  <span className="text-amber-300 font-black">{activeStudent.name}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Ítems Equipables */}
              <div className="md:col-span-7 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                  Selecciona el Ítem para el Pedestal 3D:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedHeroItem(prev => prev === 'brujula' ? 'base' : 'brujula');
                      handleEquipItem('tool', 'Brújula Dorada Ancestral');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedHeroItem === 'brujula'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🧭</span>
                    <strong className="text-xs block">Brújula de Oro</strong>
                    <span className="text-[10px] opacity-80">+30% Percepción Niebla</span>
                  </button>

                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedHeroItem(prev => prev === 'sombrero' ? 'base' : 'sombrero');
                      handleEquipItem('outfit', 'Sombrero Safari de Pith');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedHeroItem === 'sombrero'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🤠</span>
                    <strong className="text-xs block">Sombrero Safari</strong>
                    <span className="text-[10px] opacity-80">+25% Protección Solar</span>
                  </button>

                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedHeroItem(prev => prev === 'quetzal' ? 'base' : 'quetzal');
                      handleEquipItem('badge', 'Amigo del Quetzal Sagrado');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedHeroItem === 'quetzal'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🦜</span>
                    <strong className="text-xs block">Mascota Quetzal</strong>
                    <span className="text-[10px] opacity-80">+40% Hallazgo de Gemas</span>
                  </button>

                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedHeroItem(prev => prev === 'poncho' ? 'base' : 'poncho');
                      handleEquipItem('outfit', 'Poncho Andino Térmico');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedHeroItem === 'poncho'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🧥</span>
                    <strong className="text-xs block">Poncho Térmico</strong>
                    <span className="text-[10px] opacity-80">+35% Resistencia Clima</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedHeroItem('base');
                      handleEquipItem('outfit', 'Traje de Expedición Base');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 text-center"
                  >
                    Restablecer a Atuendo Base de Expedición
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Equipo de expedición 3D actualizado con éxito!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAZAR DE EXPEDICIÓN (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Bazar del Explorador de Primaria Alta</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: {activeStudent.coins} Monedas
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
                  <h4 className="text-xs font-black text-amber-300">Telescopio de Latón Astronómico</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Despeja la niebla de guerra en 2 hexágonos adyacentes de forma automática.</p>
                </div>
                <button
                  onClick={() => handleBuyStoreItem('Telescopio de Latón Astronómico', 350, 'tool')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0"
                >
                  350 Monedas
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Brújula Náutica de Precisión</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Otorga pistas automáticas del Motor de IA Pedagógica sin costo en acertijos de ciencias.</p>
                </div>
                <button
                  onClick={() => handleBuyStoreItem('Brújula Náutica de Precisión', 450, 'tool')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0"
                >
                  450 Monedas
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-emerald-300">Chaqueta Térmica de Montaña</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Resiste biomas volcánicos y otorga bonificador de +20% XP en desafíos de geología.</p>
                </div>
                <button
                  onClick={() => handleBuyStoreItem('Chaqueta Térmica de Montaña', 500, 'outfit')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0"
                >
                  500 Monedas
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Bazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 4: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE) */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Panel Docente: Gestión de Expediciones Colaborativas</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-1.5">
                <span className="font-bold text-indigo-300 block">1. Asignación de Territorio Trimestral</span>
                <p>El profesor configura un archipiélago de 18 hexágonos vinculados a los PDA de la Fase 5 SEP (Geología, Selvas, Proporciones y Civilizaciones).</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">2. Proyectos Comunitarios y Almacenamiento en la Nube</span>
                <p>Al resolver una expedición, el alumno entrega su reporte en un documento institucional vinculado a Google Drive, sumando puntos al proyecto comunitario de la clase.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 block">3. Mapa de Calor de Comprensión Grupal</span>
                <p>La visualización de calor identifica que el 82% del grupo domina "Placas Tectónicas", mientras que "Sistemas Vigesimales" requiere una sesión de repaso en clase.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Panel Docente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
