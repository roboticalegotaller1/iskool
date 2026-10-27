// src/app/redisenos_gamificados/torneo_de_saberes_tcg/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Sparkles, 
  Coins, 
  ArrowLeft, 
  ShoppingBag, 
  HelpCircle, 
  RotateCcw, 
  Play, 
  Zap, 
  Shield, 
  Swords, 
  Layers, 
  CheckCircle2, 
  X,
  Flame,
  Star,
  Clock,
  Shirt,
  GraduationCap,
  Check,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Eye,
  Heart,
  BookOpen
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS FASE 5 SEP)
// ==========================================
interface TcgStudent {
  id: string;
  name: string;
  grade: string;
  age: number;
  rank: string;
  avatarIcon: string;
  manaCrystals: number;
  totalCards: number;
  wins: number;
  gems: number;
  activeDeck: string;
  equippedSleeve: string;
  equippedRobes: string;
  inventoryCards: string[];
}

const INITIAL_TCG_STUDENTS: TcgStudent[] = [
  {
    id: 'tcg-diego',
    name: 'Diego Morales',
    grade: '5º de Primaria · Fase 5 SEP',
    age: 10,
    rank: 'Duelista de Oro',
    avatarIcon: '⚡',
    manaCrystals: 7,
    totalCards: 34,
    wins: 19,
    gems: 1250,
    activeDeck: 'Mazo de Astrofísica & Ciencias Naturales',
    equippedSleeve: 'Reverso Holográfico Galaxia',
    equippedRobes: 'Bata de Científico con Pines Cuánticos',
    inventoryCards: ['newton', 'curie', 'einstein', 'davinci']
  },
  {
    id: 'tcg-lucia',
    name: 'Lucía Méndez',
    grade: '4º de Primaria · Fase 5 SEP',
    age: 9,
    rank: 'Estratega de Plata',
    avatarIcon: '🔮',
    manaCrystals: 5,
    totalCards: 26,
    wins: 12,
    gems: 740,
    activeDeck: 'Mazo de Historia & Civilizaciones',
    equippedSleeve: 'Reverso Calendario Solar',
    equippedRobes: 'Túnica de Estratega con Auriculares',
    inventoryCards: ['galileo', 'tesla', 'darwin', 'hypatia']
  },
  {
    id: 'tcg-carlos',
    name: 'Carlos Vela',
    grade: '6º de Primaria · Fase 5 SEP',
    age: 11,
    rank: 'Gran Maestro de Conocimiento',
    avatarIcon: '👑',
    manaCrystals: 8,
    totalCards: 48,
    wins: 31,
    gems: 1850,
    activeDeck: 'Mazo Universal de Matemáticas y Lógica',
    equippedSleeve: 'Reverso Dorado Institucional',
    equippedRobes: 'Armadura Ligera de Duelista Tech',
    inventoryCards: ['newton', 'einstein', 'tesla', 'hypatia']
  }
];

// Las 8 Cartas Legendarias del Archivador de Sabios
interface ThinkerCard {
  id: string;
  name: string;
  discovery: string;
  costMana: number;
  blueStat: number;
  greenStat: number;
  redStat: number;
  hp: number;
  image: string;
  voiceQuote: string;
  rarity: 'Legendaria' | 'Épica';
}

const THINKER_CARDS: ThinkerCard[] = [
  {
    id: 'newton',
    name: 'Sir Isaac Newton',
    discovery: 'Descubrió la Gravitación Universal',
    costMana: 1,
    blueStat: 8,
    greenStat: 7,
    redStat: 3,
    hp: 3,
    image: '/redisenos_assets/torneo_tcg/tcg_card_isaac_newton.jpg',
    voiceQuote: 'Formulé la ley de gravitación universal al observar cómo todos los cuerpos celestes y terrenales se atraen mutuamente.',
    rarity: 'Legendaria'
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    discovery: 'Descubrió el Radio y el Polonio',
    costMana: 2,
    blueStat: 9,
    greenStat: 6,
    redStat: 4,
    hp: 4,
    image: '/redisenos_assets/torneo_tcg/tcg_card_marie_curie.jpg',
    voiceQuote: 'Aislé en mi laboratorio el radio y el polonio, abriendo la era de la física nuclear y la medicina radiológica.',
    rarity: 'Legendaria'
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    discovery: 'Teoría de la Relatividad General',
    costMana: 3,
    blueStat: 10,
    greenStat: 9,
    redStat: 2,
    hp: 2,
    image: '/redisenos_assets/torneo_tcg/tcg_card_albert_einstein.jpg',
    voiceQuote: 'Demostré que el espacio y el tiempo forman un tejido continuo que la gravedad curva con la energía.',
    rarity: 'Legendaria'
  },
  {
    id: 'davinci',
    name: 'Leonardo da Vinci',
    discovery: 'Polímata: Vuelo, Arte y Anatomía',
    costMana: 4,
    blueStat: 7,
    greenStat: 8,
    redStat: 9,
    hp: 9,
    image: '/redisenos_assets/torneo_tcg/tcg_card_leonardo_davinci.jpg',
    voiceQuote: 'Combiné la observación de la naturaleza, el dibujo anatómico y los engranajes para proyectar el vuelo humano.',
    rarity: 'Épica'
  },
  {
    id: 'galileo',
    name: 'Galileo Galilei',
    discovery: 'Telescopio y Heliocentrismo',
    costMana: 5,
    blueStat: 7,
    greenStat: 8,
    redStat: 5,
    hp: 5,
    image: '/redisenos_assets/torneo_tcg/tcg_card_galileo_galilei.jpg',
    voiceQuote: 'Apunté mi telescopio hacia el firmamento y descubrí las lunas de Júpiter, confirmando que la Tierra gira alrededor del Sol.',
    rarity: 'Épica'
  },
  {
    id: 'tesla',
    name: 'Nikola Tesla',
    discovery: 'Corriente Alterna y Bobinas Electromagnéticas',
    costMana: 6,
    blueStat: 9,
    greenStat: 7,
    redStat: 3,
    hp: 3,
    image: '/redisenos_assets/torneo_tcg/tcg_card_nikola_tesla.jpg',
    voiceQuote: 'Ideé los generadores de corriente alterna y las bobinas de inducción que electrifican el mundo moderno.',
    rarity: 'Legendaria'
  },
  {
    id: 'darwin',
    name: 'Charles Darwin',
    discovery: 'Evolución por Selección Natural',
    costMana: 7,
    blueStat: 8,
    greenStat: 5,
    redStat: 6,
    hp: 6,
    image: '/redisenos_assets/torneo_tcg/tcg_card_charles_darwin.jpg',
    voiceQuote: 'Navegué en el HMS Beagle observando a las especies en Galápagos para comprender cómo la vida se adapta y evoluciona.',
    rarity: 'Épica'
  },
  {
    id: 'hypatia',
    name: 'Hypatia de Alejandría',
    discovery: 'Matemáticas, Álgebra y Astrolabio',
    costMana: 8,
    blueStat: 6,
    greenStat: 8,
    redStat: 7,
    hp: 7,
    image: '/redisenos_assets/torneo_tcg/tcg_card_hypatia_alexandria.jpg',
    voiceQuote: 'Enseñé matemáticas y astronomía en el Museo de Alejandría, trazando secciones cónicas y perfeccionando el astrolabio.',
    rarity: 'Legendaria'
  }
];

export default function TorneoDeSaberesTcgPage() {
  const [students, setStudents] = useState<TcgStudent[]>(INITIAL_TCG_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('tcg-diego');
  
  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'tcgArena' | 'cardDetail' | 'albumCustomizer' | 'teacherStudio' | 'store'>('none');
  const [inspectedCard, setInspectedCard] = useState<ThinkerCard | null>(null);
  
  // Estados de la Arena del Conocimiento (Enigma Dual en Vivo)
  const [playerHp, setPlayerHp] = useState<number>(30);
  const [rivalHp, setRivalHp] = useState<number>(30);
  const [arenaAnswerState, setArenaAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [manaGoldCrystals, setManaGoldCrystals] = useState<number>(7);
  
  // Estados de la Arena de Duelo Holográfica (Pantalla 2)
  const [arenaMana, setArenaMana] = useState<number>(10);
  const [arenaTime, setArenaTime] = useState<number>(30);
  const [isArenaTimerRunning, setIsArenaTimerRunning] = useState<boolean>(false);
  const [playedArenaCardId, setPlayedArenaCardId] = useState<string | null>(null);
  const [arenaFeedback, setArenaFeedback] = useState<string | null>(null);

  // Estados del Vestidor y Álbum (Pantalla 3)
  const [selectedDuelistItem, setSelectedDuelistItem] = useState<'base' | 'capa' | 'visor' | 'guante'>('base');

  // Notificaciones y Sonido
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);
  };

  // Síntesis de voz en primera persona estricta (Regla No Negociable 2)
  const speakText = (text: string) => {
    if (isSoundMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      utter.rate = 0.95;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    } catch {
      // Manejo de restricciones de audio en navegador
    }
  };

  // Temporizador para la Arena Holográfica TCG
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeModal === 'tcgArena' && isArenaTimerRunning && arenaTime > 0) {
      interval = setInterval(() => {
        setArenaTime(prev => prev - 1);
      }, 1000);
    } else if (arenaTime === 0 && isArenaTimerRunning) {
      setIsArenaTimerRunning(false);
      gamificationAudio.playHitSound();
      setArenaFeedback('¡Tiempo concluido! Consulta la Bóveda Curricular y selecciona tu carta.');
    }
    return () => clearInterval(interval);
  }, [activeModal, isArenaTimerRunning, arenaTime]);

  const getDuelistRender = () => {
    switch (selectedDuelistItem) {
      case 'capa':
        return '/redisenos_assets/torneo_tcg/duelista_capa_campeon.jpg';
      case 'visor':
        return '/redisenos_assets/torneo_tcg/duelista_visor_tactico.jpg';
      case 'guante':
        return '/redisenos_assets/torneo_tcg/duelista_guante_dragon.jpg';
      case 'base':
      default:
        return '/redisenos_assets/torneo_tcg/duelista_base_pedestal.jpg';
    }
  };

  // 1. Abrir detalle de una carta del archivador
  const handleInspectCard = (card: ThinkerCard) => {
    gamificationAudio.playClickSound();
    setInspectedCard(card);
    setActiveModal('cardDetail');
    speakText(card.voiceQuote);
  };

  // 2. Responder al Enigma Dual en la Arena del Conocimiento (Pantalla 1)
  const handleAnswerArenaDual = (choice: 'A' | 'B' | 'C') => {
    gamificationAudio.playClickSound();

    if (choice === 'A') {
      // Roma / 84 es la respuesta correcta (Capital de Italia: Roma; 14 x 6 = 84)
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setRivalHp(0);
      setArenaAnswerState('correct');
      speakText('¡Golpe didáctico perfecto! La capital de Italia es Roma y 14 por 6 es 84. ¡Rival superado en la Arena del Conocimiento!');

      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          wins: s.wins + 1,
          gems: s.gems + 350
        };
      }));

      showToast('¡Victoria en la Arena del Conocimiento! +350 Gemas');
    } else {
      gamificationAudio.playHitSound();
      setArenaAnswerState('wrong');
      speakText('Respuesta inexacta. Recuerda que 14 por 6 es 84 y la capital de Italia es Roma. ¡Vuelve a intentarlo!');
      showToast('Respuesta incorrecta. ¡Analiza con calma!');
    }
  };

  // 3. Jugar Carta en la Arena Holográfica de Ciencias (Pantalla 2)
  const handlePlayArenaCard = (card: ThinkerCard) => {
    if (arenaMana < card.costMana) {
      gamificationAudio.playHitSound();
      showToast('¡Cristales de maná insuficientes!');
      return;
    }

    gamificationAudio.playClickSound();
    setArenaMana(prev => prev - card.costMana);
    setPlayedArenaCardId(card.id);

    if (card.id === 'newton') {
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setIsArenaTimerRunning(false);
      setArenaFeedback('¡IMPACTO GRAVITACIONAL! La Ley de Gravitación Universal de Sir Isaac Newton demuestra cómo la masa solar curva y guía las órbitas elípticas.');
      speakText('¡Excelente! Mi ley de gravitación universal explica por qué los planetas orbitan alrededor del Sol.');
      
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          wins: s.wins + 1,
          gems: s.gems + 400
        };
      }));
    } else {
      gamificationAudio.playHitSound();
      setArenaFeedback(`Has jugado a ${card.name}. Este prócer de la ciencia realizó descubrimientos invaluables, pero este enigma requiere la ley gravitacional de Newton.`);
      speakText(`Mi nombre es ${card.name}, pero para las órbitas solares necesitas a Isaac Newton.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* 1. CONFETI ANIMADO EN DOM */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3.5 h-3.5 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#38bdf8'][i % 5],
                top: `${(i * 6.5) % 95}%`,
                left: `${(i * 11.3) % 98}%`,
                transform: `rotate(${i * 24}deg)`,
                animationDuration: `${1.1 + (i % 5) * 0.25}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 2. TOAST NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-indigo-400 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. HEADER SUPERIOR INSTITUCIONAL TCG */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-2 border-indigo-500/40 shadow-xl px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Rediseños</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight flex items-center gap-2">
                  Torneo de Saberes: Cartas del Conocimiento
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold hidden sm:inline">
                    Primaria Alta · 9 a 11 Años
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold line-clamp-1">
                  Colegio Anglo Mexicano de Coyoacán · Torneo Táctico Escolar y Deckbuilding Curricular
                </p>
              </div>
            </div>
          </div>

          {/* Conmutador de 3 Alumnos Reales */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 hidden md:inline">Duelista:</span>
            <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudentId(s.id);
                    speakText(`¡Bienvenido al torneo duelista ${s.name.split(' ')[0]}! Tienes ${s.gems} gemas de conocimiento.`);
                    showToast(`Duelista cambiado a ${s.name} (${s.grade})`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    activeStudentId === s.id
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
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

          {/* Recursos & Botonera */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-black">
              <span className="flex items-center gap-1 text-cyan-300">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.gems} Gemas
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.wins} Victorias
              </span>
            </div>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('albumCustomizer');
                speakText("¡Abriendo el Vestidor de Duelista y Álbum de Maestría!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-black border border-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Shirt className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Duelista 3D</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('teacherStudio');
              }}
              className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold transition-transform hover:scale-105"
              title="Universal Challenge Studio (Vista Docente)"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
              title={isSoundMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. PANTALLA 1: LIENZO PRINCIPAL DEL ESTADIO DE DUELOS (16:9 FULL MOCKUP) */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        
        {/* LIENZO ENMARCADO CON MÁXIMA FIDELIDAD VISUAL */}
        <div className="relative w-full aspect-[16/9] max-h-[82vh] rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500/60 bg-slate-950 group">
          
          {/* Ilustración de Fondo Original (1600px Optimizado) */}
          <img 
            src="/redisenos_assets/torneo_tcg/torneo_hub_master_scene.jpg" 
            alt="Torneo de Saberes - Estadio de Duelos y Archivador de Cartas"
            className="w-full h-full object-cover select-none"
          />

          {/* ========================================================= */}
          {/* HOTSPOTS INTERACTIVOS MAESTROS DIRECTOS SOBRE EL LIENZO  */}
          {/* ========================================================= */}

          {/* 1. ARCHIVADOR DE 8 CARTAS DE SABIOS (LADO IZQUIERDO: 2 FILAS x 4 COLUMNAS) */}
          <div className="absolute top-[21%] left-[2.2%] w-[46.5%] h-[58%] z-20 grid grid-cols-4 grid-rows-2 gap-1.5 p-1">
            {THINKER_CARDS.map(card => (
              <button
                key={card.id}
                onClick={() => handleInspectCard(card)}
                className="rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-105 active:scale-95 group/card relative"
                title={`Ver detalles de ${card.name}`}
              >
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/card:opacity-100 rounded-xl transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          {/* 2. BOTONES DEL COLISEO SUPERIOR DERECHO (JUGAR, MAZOS, TIENDA) */}
          <div className="absolute top-[37%] right-[2.2%] w-[33%] h-[7%] z-20 grid grid-cols-3 gap-2">
            {/* Botón JUGAR */}
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setArenaMana(10);
                setArenaTime(30);
                setIsArenaTimerRunning(true);
                setPlayedArenaCardId(null);
                setArenaFeedback(null);
                setActiveModal('tcgArena');
                speakText("¡Entrando a la Mesa de Duelo Holográfica!");
              }}
              className="rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-purple-400 hover:scale-105 active:scale-95"
              title="Iniciar Duelo Holográfico TCG"
            />
            {/* Botón MAZOS */}
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                showToast(`Constructor de Mazos: 4 de 20 cartas equipadas`);
                speakText("Tu mazo activo tiene cuatro cartas didácticas listas para el combate.");
              }}
              className="rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-cyan-400 hover:scale-105 active:scale-95"
              title="Organizar Mazo de Cartas"
            />
            {/* Botón TIENDA */}
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                showToast(`Bazar de Sobres: Sobres de Historia, Física y Matemáticas`);
                speakText("¡Bienvenido a la tienda de sobres coleccionables!");
              }}
              className="rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-amber-400 hover:scale-105 active:scale-95"
              title="Bazar de Sobres TCG"
            />
          </div>

          {/* 3. ARENA DEL CONOCIMIENTO (ENIGMA DUAL EN VIVO: CAPITAL DE ITALIA + 14 x 6) */}
          <div className="absolute bottom-[23.5%] right-[11.5%] w-[28.5%] h-[6%] z-20 grid grid-cols-3 gap-2">
            {/* Opción A: Roma / 84 (CORRECTA) */}
            <button
              onClick={() => handleAnswerArenaDual('A')}
              className="rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:scale-105 active:scale-95"
              title="Opción A: Roma / 84 (Respuesta Correcta)"
            />
            {/* Opción B: París / 72 */}
            <button
              onClick={() => handleAnswerArenaDual('B')}
              className="rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-rose-400 hover:scale-105 active:scale-95"
              title="Opción B: París / 72"
            />
            {/* Opción C: Madrid / 60 */}
            <button
              onClick={() => handleAnswerArenaDual('C')}
              className="rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-rose-400 hover:scale-105 active:scale-95"
              title="Opción C: Madrid / 60"
            />
          </div>

          {/* 4. BOTONERA INFERIOR DEL TABLERO (JUGAR, MAZOS, TIENDA, MENÚ) */}
          <div className="absolute bottom-[2%] right-[1.5%] w-[48%] h-[6.5%] z-20 grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setArenaMana(10);
                setArenaTime(30);
                setIsArenaTimerRunning(true);
                setActiveModal('tcgArena');
              }}
              className="rounded-xl hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer"
              title="Jugar Duelo Holográfico"
            />
            <button
              onClick={() => showToast('Mazo: 4 cartas listas')}
              className="rounded-xl hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer"
              title="Mazos"
            />
            <button
              onClick={() => showToast('Tienda de Sobres Abierta')}
              className="rounded-xl hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer"
              title="Tienda"
            />
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('albumCustomizer');
              }}
              className="rounded-xl hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer"
              title="Menú y Personalizador"
            />
          </div>

        </div>

        {/* BARRA INFORMATIVA INFERIOR DE DUELO */}
        <div className="mt-3 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-indigo-500/30 flex flex-wrap items-center justify-between text-xs text-slate-300 shadow-xl gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-400">ISkool TCG Master</span>
            <span>·</span>
            <span>Rango: {activeStudent.rank}</span>
            <span>·</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/40">
              Evaluación Lúdica de Pensamiento Crítico
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setArenaMana(10);
                setArenaTime(30);
                setIsArenaTimerRunning(true);
                setActiveModal('tcgArena');
              }}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Duelo Holográfico en Vivo</span>
            </button>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 5. MODAL DE DETALLE DE CARTA DEL ARCHIVADOR (BIOGRAFÍA EN 1ª PERSONA) */}
      {/* ========================================================================= */}
      {activeModal === 'cardDetail' && inspectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500 bg-slate-950 p-6 space-y-5 text-slate-100">
            
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">{inspectedCard.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-bold">
                  {inspectedCard.rarity}
                </span>
              </div>
              <button onClick={() => setActiveModal('none')} className="p-1 rounded-xl bg-slate-800 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* Carta Full-Art Renderizada por Nano Banana */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-400">
                  <img src={inspectedCard.image} alt={inspectedCard.name} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Atributos y Voz en 1ª Persona */}
              <div className="sm:col-span-7 space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block mb-1">
                    Voz Inviolable del Sabio (Primera Persona):
                  </span>
                  <p className="text-xs text-indigo-100 italic leading-relaxed">
                    "{inspectedCard.voiceQuote}"
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Coste Maná</span>
                    <strong className="text-sm text-cyan-300">{inspectedCard.costMana} ⚡</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ataque</span>
                    <strong className="text-sm text-rose-300">{inspectedCard.blueStat} ⚔️</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Vida</span>
                    <strong className="text-sm text-emerald-300">{inspectedCard.hp} 🛡️</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      gamificationAudio.playCoinSound();
                      showToast(`¡${inspectedCard.name} añadida a tu mazo de torneo!`);
                      setActiveModal('none');
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md"
                  >
                    Equipar en Mazo Activo
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PANTALLA 2: ARENA DE DUELO HOLOGRÁFICA EN EL AULA (TCG BATTLE) */}
      {/* ========================================================================= */}
      {activeModal === 'tcgArena' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-500/50 text-xs font-black text-white flex items-center gap-3">
                <span className="text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Maná: {arenaMana}/10
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {arenaTime}s restantes
                </span>
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIENZO DE LA ARENA TCG (MOCKUP REAL EN 16:9) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden group">
              <img 
                src="/redisenos_assets/torneo_tcg/torneo_tcg_battle_arena.jpg" 
                alt="Arena TCG - Mesa Holográfica"
                className="w-full h-full object-cover"
              />

              {/* Pregunta Holográfica Flotante */}
              <div className="absolute top-[16%] left-[30%] w-[40%] h-[32%] z-20 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full mb-1 border border-cyan-400/40">
                  Desafío de Astrofísica Curricular
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-snug">
                  "¿Cuál es la ley que explica por qué los planetas orbitan alrededor del Sol?"
                </p>
                <span className="text-[10px] text-amber-300 mt-1 font-bold">
                  Juega la carta de Isaac Newton para activar la órbita dorada (+400 Gemas)
                </span>
              </div>

              {/* 4 CARTAS TCG EN LA MANO DEL ALUMNO (INFERIOR) */}
              <div className="absolute bottom-[2%] left-[24%] right-[16%] z-20 grid grid-cols-4 gap-2.5 sm:gap-3 px-2">
                {[THINKER_CARDS[0], THINKER_CARDS[1], THINKER_CARDS[2], THINKER_CARDS[3]].map(card => {
                  const isSelected = playedArenaCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handlePlayArenaCard(card)}
                      className={`relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl border-2 group/card ${
                        isSelected
                          ? 'ring-4 ring-amber-400 scale-110 -translate-y-4 shadow-amber-500/50 z-30'
                          : 'border-indigo-400/60 hover:scale-105 hover:-translate-y-2 hover:border-amber-300'
                      }`}
                      title={`Jugar ${card.name} (${card.costMana} Maná)`}
                    >
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>

              {/* Banner de Feedback */}
              {arenaFeedback && (
                <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 z-30 w-[85%] max-w-xl">
                  <div className="p-4 rounded-2xl text-xs sm:text-sm font-black text-center shadow-2xl border-2 bg-indigo-950/95 border-indigo-400 text-indigo-100 flex items-center justify-between gap-3 animate-in fade-in">
                    <span>{arenaFeedback}</span>
                    <button
                      onClick={() => setActiveModal('none')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-md"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold text-indigo-300">
                Torneo de Duelos TCG · Combos didácticos por sinergia conceptual
              </span>
              <button onClick={() => setActiveModal('none')} className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold">
                Volver al Estadio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PANTALLA 3: ÁLBUM Y VESTIDOR DE DUELISTA (MOCKUP REAL 16:9) */}
      {/* ========================================================================= */}
      {activeModal === 'albumCustomizer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-4 py-1 rounded-full border border-indigo-500 text-xs font-black text-indigo-300">
                📖 Grimorio de Maestría & Vestidor de Duelista 3D
              </div>
              <button onClick={() => setActiveModal('none')} className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 shadow-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lienzo del Álbum y Duelista */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <img 
                src="/redisenos_assets/torneo_tcg/torneo_album_duelist_custom.jpg" 
                alt="Álbum y Personalizador de Duelista"
                className="w-full h-full object-cover"
              />

              {/* RENDER VIVO DEL DUELISTA EN EL PEDESTAL 3D (DERECHA) */}
              <div className="absolute top-[24%] right-[24%] w-[22%] h-[54%] z-20 pointer-events-none flex flex-col items-center justify-center p-1">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-400 bg-slate-950 relative">
                  <img src={getDuelistRender()} alt="Duelista 3D" className="w-full h-full object-cover animate-in fade-in duration-200" />
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 rounded-lg py-0.5 text-center text-white text-[9px] font-black">
                    {selectedDuelistItem === 'capa' && '🏆 Capa de Campeón del Torneo'}
                    {selectedDuelistItem === 'visor' && '🔍 Visor Táctico Scouter'}
                    {selectedDuelistItem === 'guante' && '🐉 Guantelete Dragón de Duelo'}
                    {selectedDuelistItem === 'base' && '⚡ Techwear Base de Duelista'}
                  </div>
                </div>
              </div>

              {/* BOTONES FLOTANTES DE ACCESORIOS */}
              <div className="absolute top-[26%] right-[3.5%] w-[18%] h-[52%] z-20 grid grid-rows-4 gap-2">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedDuelistItem(prev => prev === 'capa' ? 'base' : 'capa');
                    showToast('Capa de Campeón equipada');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${selectedDuelistItem === 'capa' ? 'ring-2 ring-amber-400 bg-amber-400/20' : 'hover:bg-white/10'}`}
                  title="Equipar Capa de Campeón"
                />
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedDuelistItem(prev => prev === 'visor' ? 'base' : 'visor');
                    showToast('Visor Táctico Scouter equipado');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${selectedDuelistItem === 'visor' ? 'ring-2 ring-cyan-400 bg-cyan-400/20' : 'hover:bg-white/10'}`}
                  title="Equipar Visor Scouter"
                />
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedDuelistItem(prev => prev === 'guante' ? 'base' : 'guante');
                    showToast('Guantelete Dragón equipado');
                  }}
                  className={`rounded-xl transition-all cursor-pointer ${selectedDuelistItem === 'guante' ? 'ring-2 ring-indigo-400 bg-indigo-400/20' : 'hover:bg-white/10'}`}
                  title="Equipar Guantelete Dragón"
                />
              </div>

            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold">
                Duelista Activo: <strong className="text-indigo-300">{activeStudent.name}</strong> ({activeStudent.rank})
              </span>
              <button
                onClick={() => {
                  gamificationAudio.playCoinSound();
                  showToast('¡Equipamiento guardado con éxito!');
                  setActiveModal('none');
                }}
                className="px-5 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md"
              >
                Guardar y Volver
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PANTALLA 4: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE) */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-purple-500 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md px-4 py-1 rounded-full border border-purple-500 text-xs font-black text-purple-300">
                🎓 Universal Challenge Studio · Generador Automático de Cartas TCG
              </div>
              <button onClick={() => setActiveModal('none')} className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 shadow-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <img src="/redisenos_assets/torneo_tcg/torneo_teacher_studio.jpg" alt="Universal Challenge Studio" className="w-full h-full object-cover" />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold text-purple-300">
                El profesor ingresa un banco de preguntas y el Motor de IA Pedagógica diseña las cartas correspondientes con atributos didácticos.
              </span>
              <button onClick={() => setActiveModal('none')} className="px-5 py-1.5 rounded-xl bg-purple-600 text-white font-black text-xs shadow-md">
                Cerrar Estudio Docente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
