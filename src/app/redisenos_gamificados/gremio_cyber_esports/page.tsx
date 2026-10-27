// src/app/redisenos_gamificados/gremio_cyber_esports/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Zap, 
  Trophy, 
  Award, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Users, 
  Cpu, 
  Flame, 
  Coins, 
  X,
  Sparkles,
  Shirt,
  GraduationCap,
  MessageSquare,
  Clock,
  Swords,
  Radio,
  Send,
  Eye,
  Shield,
  Layers,
  Check,
  ChevronRight,
  FlameKindling,
  Volume2,
  VolumeX,
  Target,
  Sparkle
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES SECUNDARIA (FASE 6 SEP)
// ==========================================
interface CyberStudent {
  id: string;
  gamertag: string;
  realName: string;
  grade: string;
  clan: 'Clan Fénix' | 'Clan Serpiente';
  role: 'Estratega de Datos' | 'Analista Lógico' | 'Arquitecto de Código';
  division: 'Bronce' | 'Plata' | 'Oro' | 'Platino' | 'Diamante';
  mmr: number;
  energyCoins: number;
  streakDays: number;
  battlePassTier: number; // Nivel actual en el pase (1 a 50)
  equippedGear: {
    jacket: string;
    goggles: string;
    headset: string;
    gloves: string;
    backpack: string;
    title: string;
  };
}

const INITIAL_CYBER_STUDENTS: CyberStudent[] = [
  {
    id: 'cyb-rodrigo',
    gamertag: 'GamerKai',
    realName: 'Rodrigo Salinas',
    grade: '2º de Secundaria · Fase 6 SEP',
    clan: 'Clan Fénix',
    role: 'Arquitecto de Código',
    division: 'Diamante',
    mmr: 2890,
    energyCoins: 1450,
    streakDays: 30,
    battlePassTier: 28,
    equippedGear: {
      jacket: 'Chaqueta Phoenix Legendaria',
      goggles: 'Gafas Neón Cyberpunk',
      headset: 'Auriculares RGB Tácticos',
      gloves: 'Guante Háptico de Precisión',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Maestro del Algoritmo'
    }
  },
  {
    id: 'cyb-camila',
    gamertag: 'KitsuneCode',
    realName: 'Camila Vega',
    grade: '3º de Secundaria · Fase 6 SEP',
    clan: 'Clan Fénix',
    role: 'Estratega de Datos',
    division: 'Platino',
    mmr: 2590,
    energyCoins: 2100,
    streakDays: 24,
    battlePassTier: 24,
    equippedGear: {
      jacket: 'Chamarra Neo-Estilo (Legendario)',
      goggles: 'Gafas Hologen Cyberpunk',
      headset: 'Auriculares RGB Tácticos',
      gloves: 'Guante Háptico de Precisión',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Gran Maestra de Datos'
    }
  },
  {
    id: 'cyb-iker',
    gamertag: 'EchoPulse',
    realName: 'Iker Torres',
    grade: '1º de Secundaria · Fase 6 SEP',
    clan: 'Clan Serpiente',
    role: 'Analista Lógico',
    division: 'Oro',
    mmr: 1840,
    energyCoins: 920,
    streakDays: 14,
    battlePassTier: 14,
    equippedGear: {
      jacket: 'Camiseta Streetwear GTR',
      goggles: 'Gafas Visor X Pro',
      headset: 'Auriculares RGB Tácticos',
      gloves: 'Guante Háptico de Precisión',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Explorador de Redes'
    }
  }
];

// Artículos de Gear y Vestuario Streetwear Techwear con Renders Reales
interface GearItem {
  id: string;
  name: string;
  category: 'Chamarra' | 'Gafas Cyber' | 'Auriculares' | 'Guantes' | 'Mochila Tech';
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  bonus: string;
  image: string;
  badgeColor: string;
  borderColor: string;
  renderKey: 'base' | 'chaqueta_phoenix' | 'gafas_neon' | 'auriculares_rgb' | 'guante_haptico';
}

const GEAR_CATALOG: GearItem[] = [
  {
    id: 'chaqueta_phoenix',
    name: 'Chaqueta Phoenix Legendaria',
    category: 'Chamarra',
    rarity: 'Legendario',
    bonus: 'Multiplicador Clan x5 · Aura Neón',
    image: '/redisenos_assets/gremio_cyber/cyber_gamer_chaqueta_phoenix.jpg',
    badgeColor: 'from-rose-500 to-amber-500',
    borderColor: 'border-rose-400',
    renderKey: 'chaqueta_phoenix'
  },
  {
    id: 'gafas_neon',
    name: 'Gafas Neón Cyberpunk',
    category: 'Gafas Cyber',
    rarity: 'Épico',
    bonus: 'HUD Táctico · Lectura de PDA',
    image: '/redisenos_assets/gremio_cyber/cyber_gamer_gafas_neon.jpg',
    badgeColor: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400',
    renderKey: 'gafas_neon'
  },
  {
    id: 'auriculares_rgb',
    name: 'Auriculares RGB Tácticos',
    category: 'Auriculares',
    rarity: 'Épico',
    bonus: 'Audio Binaural · Enlace Discord Salón',
    image: '/redisenos_assets/gremio_cyber/cyber_gamer_auriculares_rgb.jpg',
    badgeColor: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400',
    renderKey: 'auriculares_rgb'
  },
  {
    id: 'guante_haptico',
    name: 'Guante Háptico de Precisión',
    category: 'Guantes',
    rarity: 'Raro',
    bonus: 'Precisión Mecánica +25% en Quizzes',
    image: '/redisenos_assets/gremio_cyber/cyber_gamer_guante_haptico.jpg',
    badgeColor: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400',
    renderKey: 'guante_haptico'
  },
  {
    id: 'chamarra_neo',
    name: 'Chamarra Neo-Estilo',
    category: 'Chamarra',
    rarity: 'Legendario',
    bonus: 'Racha 30 días ininterrumpida',
    image: '/redisenos_assets/gremio_cyber/gear_chamarra_neo_estilo.jpg',
    badgeColor: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400',
    renderKey: 'chaqueta_phoenix'
  },
  {
    id: 'gafas_hologen',
    name: 'Gafas Hologen',
    category: 'Gafas Cyber',
    rarity: 'Épico',
    bonus: '100 PDA SEP Completados',
    image: '/redisenos_assets/gremio_cyber/gear_gafas_hologen.jpg',
    badgeColor: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400',
    renderKey: 'gafas_neon'
  },
  {
    id: 'mochila_tech_b',
    name: 'Mochila Tech-B Táctica',
    category: 'Mochila Tech',
    rarity: 'Raro',
    bonus: 'Capacidad Extra de Proyectos',
    image: '/redisenos_assets/gremio_cyber/gear_mochila_tech_b.jpg',
    badgeColor: 'from-blue-500 to-cyan-600',
    borderColor: 'border-cyan-400',
    renderKey: 'base'
  },
  {
    id: 'camiseta_gtr',
    name: 'Camiseta Street GTR',
    category: 'Chamarra',
    rarity: 'Raro',
    bonus: 'Estilo Urbano de Competencia',
    image: '/redisenos_assets/gremio_cyber/gear_camiseta_gtr.jpg',
    badgeColor: 'from-blue-500 to-indigo-600',
    borderColor: 'border-indigo-400',
    renderKey: 'base'
  }
];

// Pase de Batalla de 50 Niveles (Extracto de Tiers Destacados de Temporada 2)
interface BattlePassLevel {
  level: number;
  title: string;
  rewardType: 'Cosmético' | 'MMR Boost' | 'Título' | 'Skin 3D';
  rewardName: string;
  icon: string;
  unlocked: boolean;
  isSpecial: boolean;
}

const BATTLE_PASS_50_TIERS: BattlePassLevel[] = [
  { level: 1, title: 'Iniciación Cuántica', rewardType: 'Cosmético', rewardName: 'Marco Neón Cyan', icon: '🖼️', unlocked: true, isSpecial: false },
  { level: 5, title: 'Protocolo de Enlace', rewardType: 'Título', rewardName: 'Título: [Cadete de Datos]', icon: '🏷️', unlocked: true, isSpecial: false },
  { level: 10, title: 'Ascenso Táctico', rewardType: 'Skin 3D', rewardName: 'Camiseta Streetwear GTR', icon: '👕', unlocked: true, isSpecial: true },
  { level: 15, title: 'Dominio de Algoritmos', rewardType: 'MMR Boost', rewardName: 'Multiplicador x2 de MMR', icon: '⚡', unlocked: true, isSpecial: false },
  { level: 20, title: 'Sincronía de Clan', rewardType: 'Skin 3D', rewardName: 'Gafas Visor X Pro', icon: '👓', unlocked: true, isSpecial: true },
  { level: 25, title: 'Foco Formativo SEP', rewardType: 'Cosmético', rewardName: 'Aura Holográfica Violeta', icon: '✨', unlocked: true, isSpecial: false },
  { level: 28, title: 'Vanguardia Cuántica', rewardType: 'Skin 3D', rewardName: 'Chaqueta Phoenix Legendaria', icon: '🧥', unlocked: true, isSpecial: true },
  { level: 35, title: 'Maestría Experimental', rewardType: 'Skin 3D', rewardName: 'Guante Háptico de Precisión', icon: '🧤', unlocked: false, isSpecial: true },
  { level: 40, title: 'Líder de Cuadrilla', rewardType: 'Título', rewardName: 'Título: [Estratega Supremo]', icon: '👑', unlocked: false, isSpecial: false },
  { level: 45, title: 'Consistencia de Racha', rewardType: 'Skin 3D', rewardName: 'Auriculares RGB Tácticos', icon: '🎧', unlocked: false, isSpecial: true },
  { level: 50, title: 'Gran Campeón Nacional', rewardType: 'Skin 3D', rewardName: 'Set Completo Cyber-God 16:9', icon: '🏆', unlocked: false, isSpecial: true }
];

export default function GremioCyberEsportsPage() {
  const [students, setStudents] = useState<CyberStudent[]>(INITIAL_CYBER_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('cyb-rodrigo');

  // Estado del Gamer activo en el Vestidor
  const [selectedGearId, setSelectedGearId] = useState<string>('chaqueta_phoenix');
  const [activeVisualRender, setActiveVisualRender] = useState<'chaqueta_phoenix' | 'gafas_neon' | 'auriculares_rgb' | 'guante_haptico' | 'base'>('chaqueta_phoenix');
  const [lockerDisplayMode, setLockerDisplayMode] = useState<'photoreal' | 'anime_sprite'>('photoreal');

  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'arena' | 'locker' | 'battlePass' | 'clansLeaderboard' | 'teacherStudio'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Estado de la Arena de Duelo
  const [phoenixScore, setPhoenixScore] = useState<number>(1450);
  const [serpentScore, setSerpentScore] = useState<number>(1320);
  const [duelTimer, setDuelTimer] = useState<number>(117); // Temporizador general
  const [questionSpeedTimer, setQuestionSpeedTimer] = useState<number>(10); // Temporizador de 10s por pregunta
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);
  const [triviaFeedback, setTriviaFeedback] = useState<{ message: string; success: boolean; comboMultiplier: number } | null>(null);
  const [isSpeakingCommentator, setIsSpeakingCommentator] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Estado del Boss Raid (Chronos Overseer)
  const [bossHp, setBossHp] = useState<number>(680);
  const [bossMaxHp] = useState<number>(1000);
  const [projectDeliveries, setProjectDeliveries] = useState<number>(14);

  // Chat de Espectadores
  const [spectatorChat, setSpectatorChat] = useState<Array<{ sender: string; text: string; team: string }>>([
    { sender: 'GamerKid', text: '¡VAMOS PHOENIX! 🔥 Con todo al podio', team: 'phoenix' },
    { sender: 'Viper_01', text: 'Serpiente no perdona en Historia 🇲🇽', team: 'serpent' },
    { sender: 'QuizQueen', text: '¡Speed bonus activo, responde en <3s!', team: 'phoenix' },
    { sender: 'Prof_Mendoza', text: 'Excelente ritmo de argumentación jóvenes', team: 'teacher' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Banco de Preguntas Curriculares Oficiales de Secundaria (Fase 6 SEP)
  const CURRICULAR_TRIVIAS = [
    {
      subject: 'Historia de México (Fase 6 SEP)',
      question: '¿EN QUÉ AÑO COMENZÓ LA REVOLUCIÓN MEXICANA?',
      options: [
        { label: 'A. 1810', text: 'Grito de Dolores e inicio del movimiento insurgente', isCorrect: false },
        { label: 'B. 1910', text: 'Plan de San Luis y levantamiento armado contra el Porfiriato', isCorrect: true },
        { label: 'C. 1857', text: 'Promulgación de la Constitución Política Liberal', isCorrect: false },
        { label: 'D. 1920', text: 'Plan de Agua Prieta y fin de la etapa bélica inicial', isCorrect: false }
      ],
      commentator: {
        name: 'Venustiano Carranza',
        title: 'Primer Jefe del Ejército Constitucionalista',
        speech: 'Yo convoqué al Congreso Constituyente de Querétaro y promulgué la Constitución de 1917 para plasmar en nuestra Carta Magna los ideales y la sangre derramada por nuestro pueblo alzado en armas aquel 20 de noviembre de 1910.'
      }
    },
    {
      subject: 'Física & Robótica (Fase 6 SEP)',
      question: '¿QUÉ LEY EXPLICA LA PROPULSIÓN DE UN COHETE O DRON POR ACCIÓN Y REACCIÓN?',
      options: [
        { label: 'A. Primera Ley', text: 'Ley de la Inercia de los cuerpos en reposo', isCorrect: false },
        { label: 'B. Segunda Ley', text: 'Relación entre Fuerza, Masa y Aceleración (F=ma)', isCorrect: false },
        { label: 'C. Tercera Ley de Newton', text: 'A toda acción corresponde una reacción igual y opuesta', isCorrect: true },
        { label: 'D. Ley de Gravitación', text: 'Atracción proporcional al producto de las masas', isCorrect: false }
      ],
      commentator: {
        name: 'Isaac Newton',
        title: 'Prócer de la Ciencia Universal',
        speech: 'Formulé mis tres leyes del movimiento en mis Principia Mathematica en 1687. Si un cuerpo ejerce una fuerza sobre otro, el segundo responde con una fuerza idéntica en sentido opuesto.'
      }
    }
  ];

  const currentTrivia = CURRICULAR_TRIVIAS[activeQuestionIndex % CURRICULAR_TRIVIAS.length];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  // Síntesis de Voz Oratoria en Primera Persona Estricta (Regla No Negociable 2)
  const speakText = (text: string, isCommentator = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      if (isCommentator) {
        utter.rate = 0.92;
        utter.pitch = 0.95;
        setIsSpeakingCommentator(true);
        utter.onend = () => setIsSpeakingCommentator(false);
        utter.onerror = () => setIsSpeakingCommentator(false);
      } else {
        utter.rate = 1.05;
        utter.pitch = 1.15;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignorar fallas si el navegador bloquea la reproducción de voz sin gesto
    }
  };

  // Temporizador general de partida en la Arena
  useEffect(() => {
    if (activeModal !== 'arena') return;
    const interval = setInterval(() => {
      setDuelTimer(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModal]);

  // Temporizador dinámico de la Speed Bonus Bar (10 segundos decrecientes)
  useEffect(() => {
    if (activeModal !== 'arena' || selectedTriviaOption !== null) return;
    const speedInterval = setInterval(() => {
      setQuestionSpeedTimer(prev => {
        if (prev <= 1) {
          // Tiempo agotado: El rival de Clan Serpiente responde
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(speedInterval);
  }, [activeModal, selectedTriviaOption]);

  const handleTimeExpired = () => {
    gamificationAudio.playEnemyHitSound();
    setSerpentScore(prev => prev + 150);
    setSelectedTriviaOption(-1);
    setTriviaFeedback({
      message: '¡TIEMPO AGOTADO! El Clan Serpiente aprovechó la pausa y anotó +150 puntos.',
      success: false,
      comboMultiplier: 1
    });
    setSpectatorChat(prev => [
      ...prev,
      { sender: 'ViperByte (Rival IA)', text: '¡Puntos para Clan Serpiente! Velocidad de respuesta impecable 🐍', team: 'serpent' }
    ]);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Saludo verbal del Jugador en el Hub Maestro
  const handleHeroClick = () => {
    gamificationAudio.playClickSound();
    const heroGreeting = `¡Sistemas cuánticos en línea! Soy ${activeStudent.gamertag}, rango ${activeStudent.division} del ${activeStudent.clan}. Llevo ${activeStudent.streakDays} días de racha continua de estudio. ¡Vamos a ganar la arena de hoy!`;
    speakText(heroGreeting, false);
    showToast(`¡${activeStudent.gamertag} listo para la arena de Esports! ✨`);
  };

  // Respuesta en la Arena de Duelo
  const handleTriviaAnswer = (optionIdx: number) => {
    if (selectedTriviaOption !== null) return;
    setSelectedTriviaOption(optionIdx);

    const isCorrect = currentTrivia.options[optionIdx]?.isCorrect;

    // Cálculo dinámico de Speed Bonus real
    let multiplier = 1;
    let bonusText = 'x1';
    let earnedMMR = 100;

    if (questionSpeedTimer >= 7) {
      multiplier = 5;
      bonusText = 'x5 CRITICAL SPEED';
      earnedMMR = 500;
    } else if (questionSpeedTimer >= 4) {
      multiplier = 3;
      bonusText = 'x3 GREAT SPEED';
      earnedMMR = 300;
    } else {
      multiplier = 1;
      bonusText = 'x1 REGULAR';
      earnedMMR = 150;
    }

    if (isCorrect) {
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setPhoenixScore(prev => prev + earnedMMR);
      setTriviaFeedback({
        message: `¡RESPUESTA EXACTA! Speed Bonus ${bonusText} aplicado (+${earnedMMR} pts para ${activeStudent.clan}).`,
        success: true,
        comboMultiplier: multiplier
      });

      // Actualizar progreso del estudiante
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          mmr: s.mmr + earnedMMR,
          energyCoins: s.energyCoins + (earnedMMR / 2),
          battlePassTier: Math.min(50, s.battlePassTier + 1)
        };
      }));

      // Mensaje de compañeros en el chat
      setSpectatorChat(prev => [
        ...prev,
        { sender: activeStudent.gamertag, text: `¡ACIERTO CLAVE! +${earnedMMR} PTS con multiplicador ${bonusText} 🏆`, team: 'phoenix' }
      ]);

      // Oratoria del Prócer en Primera Persona Estricta (Regla No Negociable 2)
      setTimeout(() => {
        speakText(currentTrivia.commentator.speech, true);
      }, 500);

    } else {
      gamificationAudio.playEnemyHitSound();
      setSerpentScore(prev => prev + 100);
      setTriviaFeedback({
        message: 'Respuesta inexacta. El Clan Serpiente contraataca sumando +100 puntos.',
        success: false,
        comboMultiplier: 1
      });
      setSpectatorChat(prev => [
        ...prev,
        { sender: 'Viper_01', text: '¡Contraataque de Serpiente efectivo!', team: 'serpent' }
      ]);
    }
  };

  const handleNextQuestion = () => {
    gamificationAudio.playClickSound();
    setSelectedTriviaOption(null);
    setTriviaFeedback(null);
    setQuestionSpeedTimer(10);
    setActiveQuestionIndex(prev => prev + 1);
  };

  // Contribución de Proyecto Escolar al Boss Raid
  const handleContributeProject = () => {
    gamificationAudio.playLevelUpSound();
    triggerConfetti();
    const damage = 140;
    setBossHp(prev => Math.max(0, prev - damage));
    setProjectDeliveries(prev => prev + 1);
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        mmr: s.mmr + 180,
        energyCoins: s.energyCoins + 250
      };
    }));
    showToast(`¡Proyecto entregado! -${damage} HP a Chronos Overseer · +180 MMR a tu clan`);
    speakText(`¡Proyecto de ciencias verificado! Le restaste ${damage} puntos de vida al Boss Chronos Overseer.`);
  };

  // Manejo de Vestuario y Equipamiento con Conmutación Visual Verdadera
  const handleEquipGear = (gear: GearItem) => {
    gamificationAudio.playClickSound();
    setSelectedGearId(gear.id);
    setActiveVisualRender(gear.renderKey);

    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedGear: {
          ...s.equippedGear,
          ...(gear.category === 'Chamarra' && { jacket: gear.name }),
          ...(gear.category === 'Gafas Cyber' && { goggles: gear.name }),
          ...(gear.category === 'Auriculares' && { headset: gear.name }),
          ...(gear.category === 'Guantes' && { gloves: gear.name }),
          ...(gear.category === 'Mochila Tech' && { backpack: gear.name })
        }
      };
    }));

    showToast(`¡${gear.name} equipado en tu pedestal 3D!`);
    speakText(`Equipaste ${gear.name}. Tu avatar luce el nuevo atuendo en el pedestal neón.`);
  };

  // Imagen Dinámica del Gamer en el Pedestal 3D (Conmutación real entre 5 renders)
  const getGamerHeroImage = () => {
    switch (activeVisualRender) {
      case 'chaqueta_phoenix':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_chaqueta_phoenix.jpg';
      case 'gafas_neon':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_gafas_neon.jpg';
      case 'auriculares_rgb':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_auriculares_rgb.jpg';
      case 'guante_haptico':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_guante_haptico.jpg';
      case 'base':
      default:
        return '/redisenos_assets/gremio_cyber/cyber_gamer_base.jpg';
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    gamificationAudio.playClickSound();
    setSpectatorChat(prev => [
      ...prev,
      { sender: activeStudent.gamertag, text: chatInput.trim(), team: 'phoenix' }
    ]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(45)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'][i % 5],
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
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-cyan-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOPBAR TÁCTICA DEL GREMIO */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              onClick={() => gamificationAudio.playClickSound()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a la Suite</span>
            </Link>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                07 Secundaria · eSports Didáctico (Fase 6 SEP · 12 a 14 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Gremio Cyber-Saga: Torneo de Clanes Escolares
              </h1>
            </div>
          </div>

          {/* SELECTOR DE PERFILES DE ALUMNOS & CRÉDITOS */}
          <div className="flex items-center gap-2 sm:gap-4 font-sans">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveStudentId(s.id);
                    speakText(`Perfil cambiado a ${s.gamertag} de ${s.clan}`);
                    showToast(`Perfil: ${s.gamertag} (${s.clan})`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    s.id === activeStudent.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.gamertag}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
              <span className="flex items-center gap-1 text-cyan-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.mmr} MMR
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.energyCoins} Monedas ISkool
              </span>
            </div>

            {/* BOTONES DIRECTOS DE ACCIÓN */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                  speakText("Bienvenido a tu Avatar Locker 3D. Aquí puedes personalizar tu equipo streetwear con tus logros académicos.");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-transform hover:scale-105"
              >
                <Shirt className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Locker 3D</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('arena');
                  speakText("Entrando a la Arena de Duelo de Clanes en vivo. Responde en menos de tres segundos para activar el Speed Bonus por cinco.");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-pulse transition-transform hover:scale-105"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Arena en Vivo</span>
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

      {/* ======================================================== */}
      {/* 2. LIENZO MAESTRO 16:9 DE CLASE MUNDIAL (CANON CASO 01)  */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* ESCENARIO MAESTRO 16:9 LIMPIO SIN CAJAS OPACAS QUE LO TAPEN */}
        <div className="relative w-full aspect-[16/9] min-h-[540px] rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/40 bg-slate-950 group">
          
          {/* Fondo Oficial de Alta Resolución */}
          <img
            src="/redisenos_assets/gremio_cyber/cyber_master_hub_scene.jpg"
            alt="Gremio Cyber-Saga Escenario Maestro"
            className="w-full h-full object-cover object-center pointer-events-none"
          />

          {/* ============================================================== */}
          {/* HOTSPOTS INTERACTIVOS MILIMÉTRICOS (IDÉNTICOS AL CASO 01)     */}
          {/* ============================================================== */}

          {/* 1. HOTSPOT DEL GAMER HERO (IZQUIERDA) */}
          <div
            onClick={handleHeroClick}
            className="absolute top-[12%] left-[2%] w-[35%] h-[82%] cursor-pointer z-20 group/hero rounded-3xl"
            title="¡Toca a tu avatar para hablar y revisar tu equipo!"
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover/hero:opacity-100 transition-opacity bg-cyan-400/10 backdrop-blur-[1px] border-2 border-cyan-400/50 flex flex-col justify-end p-4 pointer-events-none">
              <span className="bg-cyan-950/90 text-cyan-300 border border-cyan-400 px-3 py-1.5 rounded-full text-xs font-black shadow-xl flex items-center gap-1.5 w-fit animate-bounce">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ¡Tócame para hablar! ({activeStudent.gamertag})
              </span>
            </div>
          </div>

          {/* BADGE DEL ATUENDO Y RACHA DEL GAMER (ESQUINA INFERIOR IZQUIERDA) */}
          <div className="absolute bottom-4 left-6 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-slate-200 text-xs font-bold shadow-lg">
              Atuendo: <strong className="text-cyan-400">{activeStudent.equippedGear.jacket}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-extrabold shadow-lg">
              🔥 Racha: {activeStudent.streakDays} Días
            </span>
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveModal('locker');
              }}
              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-1"
            >
              <Shirt className="w-3 h-3" />
              <span>Personalizar 3D</span>
            </button>
          </div>

          {/* 2. HOTSPOT: PASE DE BATALLA DE 50 NIVELES (MONITOR SUPERIOR DERECHO) */}
          <div
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('battlePass');
              speakText(`Pase de batalla Temporada 2: Horizonte Cuántico. Estás en el nivel ${activeStudent.battlePassTier} de 50.`);
            }}
            className="absolute top-[20%] left-[39%] w-[58%] h-[24%] cursor-pointer z-20 rounded-2xl group/pass"
            title="¡Toca para abrir el Pase de Batalla de 50 Niveles!"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/pass:opacity-100 transition-opacity bg-cyan-500/15 border-2 border-cyan-400/80 flex items-center justify-between p-4 pointer-events-none">
              <span className="bg-slate-950/90 text-cyan-300 px-3 py-1 rounded-xl text-xs font-black border border-cyan-400/50">
                ⭐ Nivel {activeStudent.battlePassTier} / 50 · Click para reclamar cosméticos
              </span>
              <span className="text-xs font-black text-amber-400 bg-black/80 px-2.5 py-1 rounded-lg">
                EXPANDIR PASE ⚡
              </span>
            </div>
          </div>

          {/* 3. HOTSPOT: TABLA DE CLANES DEL SALÓN (MONITOR MEDIO IZQUIERDO) */}
          <div
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('clansLeaderboard');
              speakText("Tabla de posiciones de cuadrillas. El Clan Cyber-Dragons lidera con cuatro mil ochocientos noventa puntos.");
            }}
            className="absolute top-[48%] left-[39%] w-[27%] h-[20%] cursor-pointer z-20 rounded-2xl group/clans"
            title="¡Toca para ver el ranking de clanes del salón!"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/clans:opacity-100 transition-opacity bg-amber-500/15 border-2 border-amber-400/80 flex items-center justify-center p-2 pointer-events-none">
              <span className="bg-slate-950/90 text-amber-300 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-400/40">
                🏆 Ver Ranking de Clanes
              </span>
            </div>
          </div>

          {/* 4. HOTSPOT: ARENA DE DUELO SINCRONIZADA (MONITOR MEDIO DERECHO) */}
          <div
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('arena');
              speakText("Iniciando Duelo de Clanes en vivo. Prepárate para responder.");
            }}
            className="absolute top-[48%] left-[69%] w-[28%] h-[20%] cursor-pointer z-20 rounded-2xl group/arena"
            title="¡Toca para entrar a la Arena de Duelo Fénix vs Serpiente!"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/arena:opacity-100 transition-opacity bg-rose-500/20 border-2 border-rose-400/90 flex flex-col items-center justify-center p-2 pointer-events-none">
              <span className="text-[11px] font-black text-rose-300 mb-1">⏱️ 00:34 · PARTIDA LISTA</span>
              <span className="bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-lg">
                JOIN MATCH (UNIRSE) ⚔️
              </span>
            </div>
          </div>

          {/* 5. HOTSPOT: BOSS RAID SEMANAL CHRONOS OVERSEER (MONITOR INFERIOR) */}
          <div
            onClick={handleContributeProject}
            className="absolute top-[71%] left-[39%] w-[58%] h-[22%] cursor-pointer z-20 rounded-2xl group/boss"
            title="¡Toca para contribuir entregas de ciencias y dañar al Boss Raid semanal!"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/boss:opacity-100 transition-opacity bg-indigo-500/20 border-2 border-indigo-400/80 flex items-center justify-between p-4 pointer-events-none">
              <div className="text-left">
                <span className="text-xs font-black text-rose-300 block">
                  Chronos Overseer: {bossHp} / {bossMaxHp} HP
                </span>
                <span className="text-[10px] text-slate-300">
                  {projectDeliveries} entregas de ciencias grupales registradas
                </span>
              </div>
              <span className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg">
                CONTRIBUTE PROJECT 🧪
              </span>
            </div>
          </div>

        </div>

        {/* METADATOS PEDAGÓGICOS DEL GREMIO (BENCHMARKS Y ARQUITECTURA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase">
              <FlameKindling className="w-4 h-4 text-cyan-400" />
              <span>Pedagogía de Clanes eSports</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fomenta la colaboración escolar mediante cuadrillas de salón (<em>Clan Fénix vs Clan Serpiente</em>). El esfuerzo individual en tareas nutre el multiplicador de puntos del grupo completo sin microtransacciones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Speed Bonus & Precisión SEP</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Duelos de trivia en vivo basados en la Fase 6 de la NEM (Historia, Ciencias, Matemáticas). Responder en menos de 3 segundos otorga multiplicador <strong>Combo x5</strong> reforzando la retención de contenidos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Comentaristas en 1ª Persona</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cumplimiento riguroso de la Regla No Negociable 2: próceres como Venustiano Carranza o Isaac Newton comentan las jugadas clave con síntesis de voz en estricta primera persona histórica (<em>"Yo convoqué..."</em>).
            </p>
          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: ARENA DE DUELO DE CLANES CON SPEED BONUS REAL   */}
      {/* ======================================================== */}
      {activeModal === 'arena' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="relative bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
            
            {/* Header de la Arena */}
            <div className="p-4 bg-slate-900/95 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/40 animate-pulse flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" />
                  EN VIVO · ARENA DE CLANES
                </span>
                <span className="text-xs text-slate-300 font-bold hidden sm:inline">
                  {currentTrivia.subject}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 font-mono font-black text-xs">
                  <span className="text-cyan-400">🦅 FÉNIX: {phoenixScore}</span>
                  <span className="px-2 py-0.5 rounded bg-black text-amber-400 border border-amber-500/40">
                    ⏱️ {formatTimer(duelTimer)}
                  </span>
                  <span className="text-rose-400">SERPIENTE: {serpentScore} 🐍</span>
                </div>

                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('none');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Escenario de Combate Holográfico */}
            <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* Escenario 16:9 con los Pedestales Holográficos */}
              <div className="relative w-full aspect-[16/9] min-h-[320px] max-h-[420px] rounded-2xl overflow-hidden border border-cyan-400/40 shadow-xl bg-black">
                <img
                  src="/redisenos_assets/gremio_cyber/cyber_arena_duel_scene.jpg"
                  alt="Duelo de Clanes Escolar"
                  className="w-full h-full object-cover"
                />

                {/* SPEED BONUS BAR DINÁMICA (TEMPORIZADOR REAL DE 10S) */}
                <div className="absolute top-3 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-cyan-500/50 flex flex-col gap-1.5 shadow-2xl">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      SPEED BONUS BAR (PRECISIÓN TEMPORAL):
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg font-mono text-xs ${
                      questionSpeedTimer >= 7
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : questionSpeedTimer >= 4
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    }`}>
                      ⏱️ {questionSpeedTimer}s restantes · {
                        questionSpeedTimer >= 7 ? '🔥 MULTIPLICADOR x5' : questionSpeedTimer >= 4 ? '⚡ MULTIPLICADOR x3' : '⚠️ MULTIPLICADOR x1'
                      }
                    </span>
                  </div>

                  {/* Barra de Progreso Decreciente */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        questionSpeedTimer >= 7
                          ? 'bg-gradient-to-r from-emerald-400 to-cyan-500'
                          : questionSpeedTimer >= 4
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                          : 'bg-gradient-to-r from-rose-500 to-red-600'
                      }`}
                      style={{ width: `${(questionSpeedTimer / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Combatientes en los Pedestales */}
                <div className="absolute bottom-3 left-6 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-400/40 text-xs font-black text-cyan-300">
                  🦅 {activeStudent.gamertag} ({activeStudent.clan})
                </div>

                <div className="absolute bottom-3 right-6 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-400/40 text-xs font-black text-rose-300">
                  🐍 ViperByte (Rival IA · Clan Serpiente)
                </div>
              </div>

              {/* Panel Central de la Pregunta & Opciones Holográficas */}
              <div className="bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Pregunta Curricular Oficial en Pantalla Holográfica:
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {currentTrivia.question}
                  </h3>
                </div>

                {/* 4 Opciones Holográficas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTrivia.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={selectedTriviaOption !== null}
                      onClick={() => handleTriviaAnswer(idx)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedTriviaOption === idx
                          ? opt.isCorrect
                            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50 scale-[1.01]'
                            : 'bg-rose-950/90 border-rose-500 text-rose-100'
                          : selectedTriviaOption !== null && opt.isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-cyan-400/60 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <strong className="text-sm font-black block text-white">{opt.label}</strong>
                        <span className="text-xs text-slate-400">{opt.text}</span>
                      </div>
                      {selectedTriviaOption === idx && (
                        <span className="text-lg shrink-0 ml-2">
                          {opt.isCorrect ? '✅' : '❌'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Retroalimentación & Comentarista Histórico en 1ª Persona */}
                {triviaFeedback && (
                  <div className={`p-4 rounded-xl border text-xs font-bold space-y-3 ${
                    triviaFeedback.success
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{triviaFeedback.message}</span>
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md"
                      >
                        Siguiente Pregunta <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Proyección del Comentarista en Primera Persona (Regla No Negociable 2) */}
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/50 text-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-black flex items-center gap-2 text-xs">
                          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                          Comentarista Histórico Invitado: {currentTrivia.commentator.name} ({currentTrivia.commentator.title})
                        </span>
                        <button
                          onClick={() => speakText(currentTrivia.commentator.speech, true)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/30"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Escuchar Oratoria
                        </button>
                      </div>

                      <p className="italic text-xs leading-relaxed text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border-l-4 border-amber-500">
                        "{currentTrivia.commentator.speech}"
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Chat de Espectadores de Salón (Moderación IA Activa) */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Chat de Espectadores del Aula (Moderación Automática Activa)
                  </span>
                  <span className="text-[10px] text-slate-500">Solo emotes y mensajes de apoyo</span>
                </div>

                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
                  {spectatorChat.map((msg, i) => (
                    <div key={i} className="text-xs flex items-center gap-2">
                      <span className={`font-black text-[11px] ${
                        msg.team === 'phoenix' ? 'text-cyan-400' : msg.team === 'serpent' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        [{msg.sender}]:
                      </span>
                      <span className="text-slate-300">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Formulario de Chat */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-1 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Escribe ánimos para tu clan..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: AVATAR LOCKER & PERSONALIZACIÓN TECHWEAR 3D     */}
      {/* (CON CONMUTACIÓN VISUAL VERDADERA ENTRE 5 RENDERS REALES)*/}
      {/* ======================================================== */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-5xl w-full p-6 space-y-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
            
            {/* Header del Locker */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    AVATAR LOCKER & PERSONALIZACIÓN STREETWEAR TECHWEAR
                  </h3>
                  <span className="text-[10px] text-cyan-400">
                    Conmutación Visual Verdadera de Renders 3D y Sprite Anime Modular
                  </span>
                </div>
              </div>

              {/* Selector de Modo de Visualización del Avatar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setLockerDisplayMode('photoreal');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lockerDisplayMode === 'photoreal'
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Render 3D Fotorrealista
                  </button>
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setLockerDisplayMode('anime_sprite');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lockerDisplayMode === 'anime_sprite'
                        ? 'bg-indigo-600 text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sprite Anime ISkool
                  </button>
                </div>

                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Layout en 2 Columnas: Pedestal Interactivo + Catálogo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Columna Izquierda: Pedestal Central del Avatar (3D o Sprite) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 p-4 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
                
                {lockerDisplayMode === 'photoreal' ? (
                  /* Modo Render 3D con Conmutación Visual Verdadera */
                  <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-2xl bg-black">
                    <img
                      src={getGamerHeroImage()}
                      alt="Pedestal 3D Holográfico"
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-400/40">
                      Pedestal Neón 3D Activo
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[10px] font-black text-white text-center border border-white/10">
                      Equipado: {activeStudent.equippedGear.jacket}
                    </div>
                  </div>
                ) : (
                  /* Modo Sprite Anime Vectorial de ISkool */
                  <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-2xl bg-slate-950 flex items-center justify-center p-2">
                    <AnimeAvatarSprite
                      gender="male"
                      rpgClass="ninja"
                      headType="standard"
                      skinTone="light"
                      hairColor="black"
                      hairStyle="spiky"
                      eyesStyle="determined"
                      equippedOuterwear="outerwear_bomber_jacket"
                      equippedAccessory="acc_scholar_glasses"
                      showPedestal={true}
                      zoom="full"
                      className="w-full h-full"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-black text-indigo-300 border border-indigo-400/40">
                      Motor Modular de Sprites Anime ISkool
                    </div>
                  </div>
                )}

                <div className="mt-3 text-center text-xs">
                  <span className="font-extrabold text-white text-sm block">{activeStudent.gamertag}</span>
                  <span className="text-[11px] text-cyan-400 font-bold">{activeStudent.grade} · {activeStudent.clan}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Gear con Rarezas Reales */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    CATÁLOGO DE GEAR STREETWEAR & HARDWARE TÁCTICO:
                  </span>
                  <span className="text-[11px] text-cyan-400 font-bold">{GEAR_CATALOG.length} Artículos</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {GEAR_CATALOG.map(gear => (
                    <div
                      key={gear.id}
                      onClick={() => handleEquipGear(gear)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedGearId === gear.id
                          ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg scale-[1.02]'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 border border-slate-800">
                        <img
                          src={gear.image}
                          alt={gear.name}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r ${gear.badgeColor} text-white shadow`}>
                          {gear.rarity}
                        </span>
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block truncate">{gear.name}</strong>
                        <span className="text-[10px] text-slate-400 block truncate">{gear.bonus}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipGear(gear);
                        }}
                        className="mt-2 w-full py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black text-center"
                      >
                        {selectedGearId === gear.id ? 'Equipado ✅' : 'Equipar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Bar del Locker */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" /> Monedas ISkool: {activeStudent.energyCoins}
                </span>
                <span className="font-bold text-cyan-300">
                  Nivel {activeStudent.battlePassTier} · Rango {activeStudent.division} 💎
                </span>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Personalización de avatar guardada en tu perfil escolar!');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
              >
                Guardar y Volver al Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PASE DE BATALLA ACADÉMICO DE 50 NIVELES        */}
      {/* ======================================================== */}
      {activeModal === 'battlePass' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    PASE DE BATALLA ACADÉMICO · TEMPORADA 2 (HORIZONTE CUÁNTICO)
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    50 Niveles de Progresión Curricular · Mérito Académico Sin Microtransacciones
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {BATTLE_PASS_50_TIERS.map(tier => {
                const isUnlocked = tier.level <= activeStudent.battlePassTier;
                return (
                  <div
                    key={tier.level}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      isUnlocked
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">Nivel {tier.level}: {tier.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                            {tier.rewardType}
                          </span>
                          {tier.isSpecial && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
                              RECOMPENSA DE ÉLITE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">Recompensa: {tier.rewardName}</span>
                      </div>
                    </div>

                    <button
                      disabled={!isUnlocked}
                      onClick={() => {
                        gamificationAudio.playCoinSound();
                        showToast(`¡Recompensa "${tier.rewardName}" añadida a tu inventario!`);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isUnlocked
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? 'Reclamado ✅' : 'Bloqueado 🔒'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Pase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RANKING DE CLANES DEL SALÓN                     */}
      {/* ======================================================== */}
      {activeModal === 'clansLeaderboard' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  TABLA DE POSICIONES · CLANES DEL AULA (FASE 6 SEP)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥇</span>
                  <div>
                    <strong className="text-amber-300 font-extrabold block text-sm">1. Clan Cyber-Dragons</strong>
                    <span className="text-slate-400">8 Alumnos · 100% Entregas Puntuales en Ciencias</span>
                  </div>
                </div>
                <span className="font-mono font-black text-amber-300 text-sm">4,890 pts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥈</span>
                  <div>
                    <strong className="text-cyan-300 font-extrabold block text-sm">2. Clan Fénix (Tu Clan)</strong>
                    <span className="text-slate-400">7 Alumnos · Racha grupal de 30 días de estudio</span>
                  </div>
                </div>
                <span className="font-mono font-black text-cyan-300 text-sm">4,210 pts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥉</span>
                  <div>
                    <strong className="text-rose-300 font-extrabold block text-sm">3. Clan Serpiente</strong>
                    <span className="text-slate-400">8 Alumnos · Duelos de Trivia en vivo</span>
                  </div>
                </div>
                <span className="font-mono font-black text-rose-300 text-sm">3,950 pts</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Tabla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: UNIVERSAL CHALLENGE STUDIO (DOCENTE)           */}
      {/* ======================================================== */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-indigo-500/60 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Panel Maestro del Educador (Secundaria)</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-1.5">
                <span className="font-bold text-indigo-300 block">1. Modo Torneo Relámpago de Salón</span>
                <p>El profesor proyecta la arena de combate con 1 clic en la pantalla interactiva del aula. Los estudiantes participan en vivo desde sus dispositivos en competencias de 10 minutos.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">2. Sincronización Automática con Bóveda Curricular</span>
                <p>Las preguntas se nutren de los PDA SEP oficiales de Secundaria (Fase 6). Las entregas de proyectos otorgan daño directo al Boss Raid semanal.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">3. Reportes de Retención & Evaluación Formativa</span>
                <p>Analíticas inmediatas de precisión y velocidad de respuesta para orientar la retroalimentación pedagógica grupal.</p>
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
