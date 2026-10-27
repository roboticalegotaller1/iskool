// src/app/redisenos_gamificados/torneo_de_saberes_tcg/page.tsx
"use client";

import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS)
// ==========================================
interface TcgStudent {
  id: string;
  name: string;
  grade: string;
  rank: string;
  avatarIcon: string;
  manaCrystals: number;
  totalCards: number;
  wins: number;
  coins: number;
  activeDeck: string;
  equippedSleeve: string;
  equippedRobes: string;
  inventory: string[];
}

const INITIAL_TCG_STUDENTS: TcgStudent[] = [
  {
    id: 'tcg-diego',
    name: 'Diego Morales',
    grade: '5º de Primaria · Fase 5 SEP',
    rank: 'Duelista de Oro',
    avatarIcon: '⚡',
    manaCrystals: 5,
    totalCards: 34,
    wins: 19,
    coins: 1100,
    activeDeck: 'Mazo de Astrofísica & Ciencias Naturales',
    equippedSleeve: 'Reverso Holográfico Galaxia',
    equippedRobes: 'Bata de Científico con Pines Cuánticos',
    inventory: ['card-newton', 'card-termo', 'card-celular']
  },
  {
    id: 'tcg-lucia',
    name: 'Lucía Méndez',
    grade: '4º de Primaria · Fase 5 SEP',
    rank: 'Estratega de Plata',
    avatarIcon: '🔮',
    manaCrystals: 4,
    totalCards: 26,
    wins: 12,
    coins: 740,
    activeDeck: 'Mazo de Historia & Civilizaciones',
    equippedSleeve: 'Reverso Calendario Solar',
    equippedRobes: 'Túnica de Estratega con Auriculares',
    inventory: ['card-juarez', 'card-hidalgo']
  },
  {
    id: 'tcg-carlos',
    name: 'Carlos Vela',
    grade: '6º de Primaria · Fase 5 SEP',
    rank: 'Gran Maestro de Conocimiento',
    avatarIcon: '👑',
    manaCrystals: 6,
    totalCards: 48,
    wins: 31,
    coins: 1850,
    activeDeck: 'Mazo Universal de Matemáticas y Lógica',
    equippedSleeve: 'Reverso Dorado Institucional',
    equippedRobes: 'Armadura Ligera de Duelista Tech',
    inventory: ['card-euler', 'card-pitagoras']
  }
];

interface CardItem {
  id: string;
  name: string;
  type: 'Personaje Histórico' | 'Ley Científica' | 'Teoría Universal';
  manaCost: number;
  power: number;
  description: string;
  color: string;
  firstPersonNarrative?: string;
  image?: string;
}

const DECK_CARDS: CardItem[] = [
  {
    id: 'c-newton',
    name: 'Isaac Newton: Gravitación Universal',
    type: 'Ley Científica',
    manaCost: 2,
    power: 95,
    description: 'Explica con rigor físico por qué los planetas orbitan alrededor del Sol mediante la fuerza de atracción mutua.',
    color: 'from-amber-600 via-yellow-600 to-amber-700',
    image: '/redisenos_assets/torneo_tcg/carta_newton_holografica.jpg'
  },
  {
    id: 'c-termo',
    name: 'Leyes de la Termodinámica',
    type: 'Ley Científica',
    manaCost: 3,
    power: 75,
    description: 'La energía del universo no se crea ni se destruye, solo sufre transformaciones.',
    color: 'from-rose-600 via-orange-600 to-red-700'
  },
  {
    id: 'c-celular',
    name: 'Teoría Celular Moderna',
    type: 'Teoría Universal',
    manaCost: 1,
    power: 65,
    description: 'Todos los organismos vivos están formados por una o más unidades celulares autónomas.',
    color: 'from-emerald-600 via-teal-600 to-green-700'
  },
  {
    id: 'c-mendel',
    name: 'Gregor Mendel: Leyes de la Herencia',
    type: 'Teoría Universal',
    manaCost: 2,
    power: 80,
    description: 'Descubrimiento de los factores hereditarios dominantes y recesivos mediante guisantes.',
    color: 'from-cyan-600 via-blue-600 to-indigo-700'
  }
];

export default function TorneoDeSaberesTcgPage() {
  const [students, setStudents] = useState<TcgStudent[]>(INITIAL_TCG_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('tcg-diego');
  const [hand, setHand] = useState<CardItem[]>(DECK_CARDS);
  const [playedCard, setPlayedCard] = useState<CardItem | null>(null);
  const [bossHp, setBossHp] = useState<number>(100);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'store' | 'deckBuilder' | 'teacherStudio'>('none');
  const [selectedDuelistItem, setSelectedDuelistItem] = useState<'base' | 'capa' | 'visor' | 'guante'>('base');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

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
    handleResetDuel();
    showToast(`Duelista cambiado a ${students.find(s => s.id === id)?.name}`);
  };

  const handlePlayCard = (card: CardItem) => {
    gamificationAudio.playMagicCastSound();
    setPlayedCard(card);

    if (card.id === 'c-newton') {
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setBossHp(0);
      setComboMultiplier(3);
      setFeedback('¡COMBO DIDÁCTICO PERFECTO! La Gravitación Universal de Newton responde con exactitud al enigma de las órbitas planetarias. ¡Jefe de Sabiduría superado con Sinergia x3!');
      
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          wins: s.wins + 1,
          coins: s.coins + 350
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setComboMultiplier(1);
      setFeedback(`Jugaste "${card.name}". Esta carta posee alto poder conceptual, pero no fundamenta la mecánica de traslación gravitatoria. ¡Selecciona la ley correspondiente!`);
    }
  };

  const handleResetDuel = () => {
    gamificationAudio.playClickSound();
    setPlayedCard(null);
    setFeedback(null);
    setBossHp(100);
    setComboMultiplier(1);
    setTimeLeft(30);
  };

  const handleBuyPack = (packName: string, cost: number) => {
    if (activeStudent.coins < cost) {
      gamificationAudio.playEnemyHitSound();
      showToast('Gemas de Conocimiento insuficientes.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        coins: s.coins - cost,
        totalCards: s.totalCards + 3
      };
    }));
    showToast(`¡Sobre "${packName}" abierto con éxito! +3 cartas didácticas añadidas a tu colección.`);
  };

  const handleEquipSleeve = (sleeveName: string) => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return { ...s, equippedSleeve: sleeveName };
    }));
    showToast(`Reverso "${sleeveName}" equipado.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#38bdf8'][i % 5],
                top: `${(i * 7) % 95}%`,
                left: `${(i * 13) % 98}%`,
                transform: `rotate(${i * 24}deg)`,
                animationDuration: `${1.2 + (i % 5) * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* TOAST NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 border border-indigo-400 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER DE DUELO */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-indigo-900/40 px-4 sm:px-6 py-3">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/50">
                06 Primaria Alta · TCG Didáctico (9 a 11 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-indigo-400" />
                Torneo de Saberes & Cartas del Conocimiento
              </h1>
            </div>
          </div>

          {/* PERFILES & BOTONERA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    s.id === activeStudent.id
                      ? 'bg-indigo-600 text-white shadow-md font-black scale-105'
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
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.coins} Gemas
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.wins} Victorias
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('deckBuilder');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Constructor</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Sobres</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teacherStudio');
                }}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-bold"
                title="Universal Challenge Studio (Vista Docente)"
              >
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: ESTADIO DE DUELOS & MESA HOLOGRÁFICA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUD DEL ESTADIO DE DUELOS */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900 border border-indigo-800/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/40">
                {activeStudent.rank}
              </span>
              <span className="text-xs text-slate-400">{activeStudent.grade}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} Duelo Didáctico de {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Baraja Activa: <strong className="text-indigo-300">{activeStudent.activeDeck}</strong> · Reverso: <em>{activeStudent.equippedSleeve}</em> ({activeStudent.totalCards} cartas registradas)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-amber-400 block">{activeStudent.wins}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Triunfos en Torneo</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-cyan-400 block">{activeStudent.manaCrystals}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Cristales de Maná</span>
            </div>
          </div>
        </div>

        {/* PANTALLA 2: MESA DE DUELO HOLOGRÁFICA & JEFE DE SABIDURÍA */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/30 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-6 shadow-2xl">
          
          {/* Tarjeta del Oponente */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50">
                  Jefe de Sabiduría
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Sinergia {comboMultiplier}x
                </span>
              </div>
              <h3 className="text-base font-black text-white">Guardián de la Astrofísica Curricular</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Desafío en Mesa: <em>"¿Cuál es la ley que explica por qué los planetas orbitan alrededor del Sol?"</em>
              </p>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-300 mb-1">
                <span>Resistencia del Enigma:</span>
                <span className={bossHp === 0 ? 'text-emerald-400 font-black' : 'text-rose-400'}>
                  {bossHp}/100 HP
                </span>
              </div>
              <div className="w-full sm:w-48 h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Banner de Retroalimentación Didáctica */}
          {feedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              bossHp === 0
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                : 'bg-amber-950/70 border-amber-500 text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
              <button
                onClick={handleResetDuel}
                className="px-3 py-1.5 rounded-xl bg-black/50 text-[11px] font-black flex items-center gap-1 shrink-0 ml-3"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar Duelo
              </button>
            </div>
          )}

          {/* Cartas en Mano del Estudiante */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Cartas en Mano (Selecciona una carta para jugarla al centro de la mesa)
              </span>
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Maná: {activeStudent.manaCrystals} Cristales
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hand.map(card => (
                <div
                  key={card.id}
                  onClick={() => handlePlayCard(card)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-slate-950 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all flex flex-col justify-between h-64 border-2 border-white/20 group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-black uppercase tracking-wider">
                        {card.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/50 text-cyan-200 text-xs font-black">
                        ⚡ {card.manaCost} Maná
                      </span>
                    </div>

                    <h4 className="font-black text-white text-base leading-tight mb-2 group-hover:text-amber-200 transition-colors">
                      {card.name}
                    </h4>
                    <p className="text-[11px] text-white/95 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/20 flex items-center justify-between text-white text-xs font-black">
                    <span>Poder: {card.power}</span>
                    <span className="bg-black/40 px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase group-hover:bg-white group-hover:text-slate-950 transition-colors">
                      JUGAR CARTA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* PANTALLA 3: VESTIDOR Y CONSTRUCTOR DE BARAJAS */}
      {activeModal === 'deckBuilder' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal Holográfico 3D & Constructor de Barajas</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Duelista */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-indigo-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-2xl">
                  <img
                    src={getDuelistRender()}
                    alt="Duelista TCG 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-400/30">
                    Holo-Pedestal TCG
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedDuelistItem === 'capa' && '👑 Capa de Campeón Imperial Equipada'}
                    {selectedDuelistItem === 'visor' && '🥽 Visor Scouter Táctico (+250 Análisis)'}
                    {selectedDuelistItem === 'guante' && '🐉 Guante Dragón Dorado (+300 Maná)'}
                    {selectedDuelistItem === 'base' && '⚡ Atuendo Base de Torneo'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Duelista:</span>
                  <span className="text-cyan-300 font-black">{activeStudent.name}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Ítems */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-2">
                    Equipamiento Táctico de Duelo:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedDuelistItem(prev => prev === 'capa' ? 'base' : 'capa');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedDuelistItem === 'capa'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">👑</span>
                      <strong className="text-xs block">Capa de Campeón</strong>
                      <span className="text-[10px] opacity-80">+15% Multiplicador Combo</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedDuelistItem(prev => prev === 'visor' ? 'base' : 'visor');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedDuelistItem === 'visor'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🥽</span>
                      <strong className="text-xs block">Visor Scouter</strong>
                      <span className="text-[10px] opacity-80">+250 Poder de Análisis</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedDuelistItem(prev => prev === 'guante' ? 'base' : 'guante');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedDuelistItem === 'guante'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🐉</span>
                      <strong className="text-xs block">Guante Dragón</strong>
                      <span className="text-[10px] opacity-80">+300 Maná Máximo</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedDuelistItem('base');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedDuelistItem === 'base'
                          ? 'bg-slate-800 text-white border-slate-700 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">⚡</span>
                      <strong className="text-xs block">Atuendo Base</strong>
                      <span className="text-[10px] opacity-80">Por Defecto</span>
                    </button>
                  </div>
                </div>

                {/* Reversos de Cartas */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-indigo-300 block">Reversos Holográficos de Cartas</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Reverso Holográfico Galaxia', 'Reverso Calendario Solar', 'Reverso Dorado Institucional'].map(sleeve => (
                      <button
                        key={sleeve}
                        onClick={() => handleEquipSleeve(sleeve)}
                        className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all ${
                          activeStudent.equippedSleeve === sleeve
                            ? 'bg-indigo-600 text-white border-indigo-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/40'
                        }`}
                      >
                        {sleeve}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Personalización y Baraja TCG guardadas!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-indigo-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOUTIQUE DE SOBRES DE CARTAS (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Boutique de Sobres TCG de Primaria Alta</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: {activeStudent.coins} Gemas
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
                  <h4 className="text-xs font-black text-indigo-300">Sobre Holográfico: Héroes de la Independencia</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Contiene 3 cartas narradas en primera persona estricta (Hidalgo, Morelos, Josefa Ortiz).</p>
                </div>
                <button
                  onClick={() => handleBuyPack('Héroes de la Independencia', 300)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shrink-0"
                >
                  300 Gemas
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300">Sobre Místico: Pioneros de la Física</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Incluye a Galileo Galilei, Isaac Newton y Marie Curie con efectos especiales de laboratorio.</p>
                </div>
                <button
                  onClick={() => handleBuyPack('Pioneros de la Física', 450)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0"
                >
                  450 Gemas
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-emerald-300">Sobre Ancestral: Sabios de Mesoamérica</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Cartas de astronomía maya, arquitectura mexica y botánica tradicional de la NEM.</p>
                </div>
                <button
                  onClick={() => handleBuyPack('Sabios de Mesoamérica', 400)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0"
                >
                  400 Gemas
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 4: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE) */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Generación Automática de Cartas Didácticas</h3>
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
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-1.5">
                <span className="font-bold text-purple-300 block">1. Creación Polimórfica de Cartas con IA Pedagógica</span>
                <p>El docente ingresa los reactivos del examen trimestral; el Motor de IA genera automáticamente las cartas ilustradas con atributos de Ataque de Conocimiento y Defensa de Lógica.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">2. Modo Repaso en Proyector de Aula</span>
                <p>Permite proyectar la mesa de duelo holográfica en pantalla gigante para competencias amistosas en equipos antes de los exámenes bimestrales.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">3. Vinculación con Rúbricas Oficiales SEP</span>
                <p>Cada victoria en duelo actualiza directamente el porcentaje de dominio de PDA en las boletas oficiales del colegio sin captura manual.</p>
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
