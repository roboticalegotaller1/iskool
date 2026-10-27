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
import { speakNaturalFemaleSpanish } from '@/lib/redisenosVoiceTTS';

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

// ==========================================
// 2. ARSENAL EDUCATIVO Y MOTOR DE COMBATE PEDAGÓGICO POR CARTA
// ==========================================
interface CardEducationalMove {
  element: string;
  elementIcon: string;
  attackName: string;
  ultimateName: string;
  baseAtk: number;
  maxHp: number;
  lessonCapsule: string;
  quizQuestion: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
}

const CARD_EDUCATIONAL_ARSENAL: Record<string, CardEducationalMove> = {
  newton: {
    element: 'Física & Gravitación',
    elementIcon: '🌌',
    attackName: 'Órbita de Gravitación Universal',
    ultimateName: 'Impacto de las Tres Leyes del Movimiento',
    baseAtk: 850,
    maxHp: 1400,
    lessonCapsule: 'En 1687 publiqué los Principia Mathematica: demostré que la misma fuerza que hace caer una manzana en la Tierra mantiene a la Luna y a los planetas en órbita.',
    quizQuestion: '¿Qué establece mi Ley de Gravitación Universal sobre la fuerza de atracción entre dos cuerpos?',
    options: [
      'Aumenta con la masa de los cuerpos y disminuye con el cuadrado de la distancia que los separa',
      'Solo actúa dentro de la atmósfera terrestre y desaparece en el vacío espacial',
      'Depende únicamente de la temperatura superficial de las estrellas'
    ],
    correctIndex: 0,
    explanation: '¡Exacto! A mayor masa, mayor atracción gravitatoria, e inversamente proporcional al cuadrado de la distancia.'
  },
  curie: {
    element: 'Química & Física Nuclear',
    elementIcon: '🧪',
    attackName: 'Pulso Luminiscente de Radio-88',
    ultimateName: 'Resonancia Atómica de Polonio y Radio',
    baseAtk: 900,
    maxHp: 1350,
    lessonCapsule: 'Fui la primera persona en recibir dos Premios Nobel en distintas especialidades científicas (Física y Química) tras descubrir que ciertos átomos emiten energía espontáneamente.',
    quizQuestion: '¿Cuáles fueron los dos elementos químicos radiactivos que aislé y bauticé en mis investigaciones?',
    options: [
      'El Helio y el Litio',
      'El Polonio (en honor a mi patria natal) y el Radio',
      'El Oxígeno y el Hidrógeno pesado'
    ],
    correctIndex: 1,
    explanation: '¡Brillante! Nombré al Polonio en honor a Polonia, donde nací, y al Radio por su intensa radiactividad.'
  },
  einstein: {
    element: 'Física Cuántica & Relatividad',
    elementIcon: '⚡',
    attackName: 'Curvatura Espacio-Temporal',
    ultimateName: 'Singularidad Fotónica E = mc²',
    baseAtk: 1000,
    maxHp: 1250,
    lessonCapsule: 'Con mi ecuación E = mc² demostré que la masa y la energía son dos manifestaciones equivalentes de una misma realidad física, multiplicadas por la velocidad de la luz al cuadrado.',
    quizQuestion: 'En mi célebre fórmula E = mc², ¿qué representa la letra "c"?',
    options: [
      'El calor específico del carbono sólido',
      'La velocidad de la luz en el vacío (aprox. 300,000 km/s)',
      'La circunferencia orbital del planeta Tierra'
    ],
    correctIndex: 1,
    explanation: '¡Correcto! La constante "c" es la velocidad de la luz en el vacío; por eso una pequeña masa concentra una energía colosal.'
  },
  davinci: {
    element: 'Ingeniería, Arte & Anatomía',
    elementIcon: '⚙️',
    attackName: 'Hélice Aérea del Renacimiento',
    ultimateName: 'Sinfonía del Códice Atlántico',
    baseAtk: 780,
    maxHp: 1650,
    lessonCapsule: 'Estudié la anatomía de las aves, la hidráulica y la perspectiva geométrica para diseñar máquinas voladoras, puentes giratorios y obras maestras del Renacimiento.',
    quizQuestion: '¿Qué principio natural observé detalladamente para diseñar mi Ornitóptero y el Tornillo Aéreo?',
    options: [
      'La biomecánica de las alas de las aves y la resistencia del aire',
      'La combustión de motores de vapor industriales',
      'El magnetismo de las brújulas marítimas'
    ],
    correctIndex: 0,
    explanation: '¡Así es! Analicé el esqueleto y el batir de las alas de las aves en mi Códice sobre el Vuelo de los Pájaros.'
  },
  galileo: {
    element: 'Astronomía & Método Científico',
    elementIcon: '🔭',
    attackName: 'Destello de las Lunas Jovianas',
    ultimateName: 'Revolución Heliocéntrica de 1610',
    baseAtk: 820,
    maxHp: 1450,
    lessonCapsule: 'Perfeccioné el telescopio refractor y observé las fases de Venus, los cráteres de la Luna y cuatro satélites orbitando Júpiter, probando que no todo gira alrededor de la Tierra.',
    quizQuestion: '¿Qué demostré al descubrir con mi telescopio cuatro lunas girando alrededor de Júpiter en 1610?',
    options: [
      'Que Júpiter era una estrella más grande que el Sol',
      'Que existen cuerpos celestes que orbitan otros planetas y que el modelo geocéntrico era incorrecto',
      'Que la Luna carece de montañas o cráteres'
    ],
    correctIndex: 1,
    explanation: '¡Excelente! Las lunas galileanas probaron empíricamente el sistema heliocéntrico.'
  },
  tesla: {
    element: 'Electromagnetismo & Energía',
    elementIcon: '🌩️',
    attackName: 'Arco de Bobina Resonante',
    ultimateName: 'Tormenta de Corriente Alterna Polifásica',
    baseAtk: 950,
    maxHp: 1300,
    lessonCapsule: 'Desarrollé el motor de inducción y el sistema de corriente alterna polifásica, permitiendo transmitir electricidad a grandes distancias para iluminar ciudades enteras.',
    quizQuestion: '¿Por qué mi sistema de Corriente Alterna (CA) superó a la corriente continua para distribuir energía a las ciudades?',
    options: [
      'Porque permite elevar y reducir el voltaje con transformadores, viajando grandes distancias con mínima pérdida',
      'Porque no necesita cables ni generadores para producir calor',
      'Porque funciona únicamente durante tormentas eléctricas'
    ],
    correctIndex: 0,
    explanation: '¡Magistral! Los transformadores de corriente alterna hicieron posible llevar electricidad desde las centrales hidroeléctricas hasta cada hogar.'
  },
  darwin: {
    element: 'Biología & Evolución',
    elementIcon: '🧬',
    attackName: 'Adaptación de los Pinzones de Galápagos',
    ultimateName: 'Árbol Evolutivo de la Selección Natural',
    baseAtk: 840,
    maxHp: 1550,
    lessonCapsule: 'Al comparar los picos de los pinzones y los caparazones de las tortugas en distintas islas de Galápagos, descubrí que las especies evolucionan adaptándose a su entorno.',
    quizQuestion: 'Según mi teoría de la Selección Natural publicada en "El Origen de las Especies", ¿qué individuos tienen mayor probabilidad de sobrevivir y dejar descendencia?',
    options: [
      'Los que poseen rasgos hereditarios mejor adaptados a las condiciones y recursos de su medio ambiente',
      'Solo los animales más grandes sin importar su alimentación',
      'Los organismos que nunca cambian a lo largo de millones de años'
    ],
    correctIndex: 0,
    explanation: '¡Correcto! La adaptación al medio ambiente impulsa la evolución biológica de todas las especies.'
  },
  hypatia: {
    element: 'Matemáticas, Geometría & Cosmos',
    elementIcon: '📐',
    attackName: 'Trazo de Secciones Cónicas',
    ultimateName: 'Astrolabio Dorado de Alejandría',
    baseAtk: 880,
    maxHp: 1500,
    lessonCapsule: 'En la Biblioteca y Museo de Alejandría edité tratados sobre álgebra y las secciones cónicas de Apolonio (elipse, parábola e hipérbola), esenciales para calcular las órbitas planetarias.',
    quizQuestion: '¿Para qué servía el astrolabio plano que perfeccioné y enseñé a construir en Alejandría?',
    options: [
      'Para medir la posición de las estrellas y el Sol, determinar la hora y orientarse en la navegación',
      'Para fundir metales preciosos a altas temperaturas',
      'Para amplificar el sonido en los teatros griegos'
    ],
    correctIndex: 0,
    explanation: '¡Exacto! El astrolabio es un calculador astronómico analógico que proyecta la bóveda celeste sobre un disco graduado.'
  }
};

// ==========================================
// 3. GUARDIANES NPC Y COMPAÑEROS DE AULA (PVP ESCOLAR)
// ==========================================
interface DuelOpponent {
  id: string;
  name: string;
  title: string;
  mode: 'npc' | 'peer';
  level: number;
  maxLp: number;
  avatar: string;
  specialty: string;
  roomCode?: string;
  statusBadge: string;
  deckIds: string[];
  introQuote: string;
  victoryRewardGems: number;
}

const DUEL_OPPONENTS: DuelOpponent[] = [
  {
    id: 'npc-minerva',
    name: 'Gran Maestra Minerva',
    title: 'Guardiana NPC · Observatorio de Física y Cosmos',
    mode: 'npc',
    level: 15,
    maxLp: 2500,
    avatar: '/redisenos_assets/torneo_tcg/duel_npc_minerva.webp',
    specialty: 'Gravitación, Astronomía y Relatividad',
    statusBadge: 'IA Pedagógica · Nivel Maestro',
    deckIds: ['galileo', 'newton', 'einstein', 'hypatia'],
    introQuote: '¡Bienvenido al Coliseo Astronómico! Demuéstrame que comprendes las leyes del universo con las cartas que has reunido.',
    victoryRewardGems: 450
  },
  {
    id: 'npc-cronos',
    name: 'Arquitecto Cronos',
    title: 'Guardián NPC · Bóveda de Ingeniería y Evolución',
    mode: 'npc',
    level: 20,
    maxLp: 3000,
    avatar: '/redisenos_assets/torneo_tcg/duel_npc_cronos.webp',
    specialty: 'Electromagnetismo, Polimatía y Biología',
    statusBadge: 'IA Pedagógica · Nivel Élite',
    deckIds: ['davinci', 'tesla', 'curie', 'darwin'],
    introQuote: 'Custodio los tratados de los grandes inventores y naturalistas. ¡Veamos si tu estrategia curricular supera mis defensas!',
    victoryRewardGems: 600
  },
  {
    id: 'peer-sofia',
    name: 'Sofía Castillo (6ºB)',
    title: 'Compañera de Aula · Campeona de Ciencias Naturales',
    mode: 'peer',
    level: 12,
    maxLp: 2400,
    avatar: '/redisenos_assets/torneo_tcg/duel_peer_sofia.webp',
    specialty: 'Mazo Personalizado de Sobres (Curie & Darwin)',
    roomCode: 'AULA-6B-204',
    statusBadge: '🟢 En Línea en tu Salón',
    deckIds: ['curie', 'darwin', 'hypatia', 'davinci'],
    introQuote: '¡Hola! Abrí dos sobres hoy y armé mi mazo con Marie Curie y Charles Darwin. ¡Acepto tu reto de salón!',
    victoryRewardGems: 500
  },
  {
    id: 'peer-sebastian',
    name: 'Sebastián Morales (5ºA)',
    title: 'Compañero de Aula · Estratega de Física y Lógica',
    mode: 'peer',
    level: 11,
    maxLp: 2400,
    avatar: '/redisenos_assets/torneo_tcg/duel_peer_sebastian.webp',
    specialty: 'Mazo Personalizado de Sobres (Tesla & Einstein)',
    roomCode: 'AULA-5A-108',
    statusBadge: '🟢 En Línea · Mesa 4',
    deckIds: ['tesla', 'einstein', 'newton', 'galileo'],
    introQuote: '¡Listo desde mi pupitre! Conecté mi mazo táctico con Nikola Tesla en vanguardia. ¡Que gane quien sepa más!',
    victoryRewardGems: 500
  }
];

export default function TorneoDeSaberesTcgPage() {
  const [students, setStudents] = useState<TcgStudent[]>(INITIAL_TCG_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('tcg-diego');
  
  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'tcgArena' | 'cardDetail' | 'albumCustomizer' | 'teacherStudio' | 'store' | 'deckBuilder'>('none');
  const [inspectedCard, setInspectedCard] = useState<ThinkerCard | null>(null);
  const [equippedDeckIds, setEquippedDeckIds] = useState<string[]>(['newton', 'einstein', 'curie', 'galileo']);
  const [teacherCardPrompt, setTeacherCardPrompt] = useState<string>('Sor Juana Inés de la Cruz · Lógica, Poesía Barroca y Filosofía Novohispana');
  const [teacherCardSaved, setTeacherCardSaved] = useState<boolean>(false);

  // Estados de Ceremonia Cinemática de Apertura de Sobre TCG
  const [packOpeningStage, setPackOpeningStage] = useState<'idle' | 'sealed_pack' | 'slashing' | 'card_back' | 'card_revealed'>('idle');
  const [pulledCard, setPulledCard] = useState<ThinkerCard | null>(null);
  const [packBonusMana, setPackBonusMana] = useState<number>(5);
  const [packTypeLabel, setPackTypeLabel] = useState<string>('Sobre Legendario de Ciencias y Matemáticas');
  
  // Estados de la Arena del Conocimiento (Enigma Dual en Vivo)
  const [playerHp, setPlayerHp] = useState<number>(30);
  const [rivalHp, setRivalHp] = useState<number>(30);
  const [arenaAnswerState, setArenaAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [manaGoldCrystals, setManaGoldCrystals] = useState<number>(7);
  
  // Estados de la Arena de Duelo Holográfica (Pantalla 2 - Motor Completo NPC & PvP)
  const [arenaMana, setArenaMana] = useState<number>(10);
  const [arenaTime, setArenaTime] = useState<number>(45);
  const [isArenaTimerRunning, setIsArenaTimerRunning] = useState<boolean>(false);
  const [playedArenaCardId, setPlayedArenaCardId] = useState<string | null>(null);
  const [arenaFeedback, setArenaFeedback] = useState<string | null>(null);

  // Nuevos Estados del Motor Táctico de Duelos 3D (NPC & Compañeros de Aula)
  const [duelStage, setDuelStage] = useState<'lobby' | 'battle' | 'victory'>('lobby');
  const [duelModeTab, setDuelModeTab] = useState<'npc' | 'peer'>('npc');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('npc-minerva');
  const [classroomPinCode, setClassroomPinCode] = useState<string>('ISK-409');
  const [peerInviteCopied, setPeerInviteCopied] = useState<boolean>(false);

  const [playerLp, setPlayerLp] = useState<number>(2500);
  const [playerMaxLp, setPlayerMaxLp] = useState<number>(2500);
  const [opponentLp, setOpponentLp] = useState<number>(2500);
  const [opponentMaxLp, setOpponentMaxLp] = useState<number>(2500);
  const [duelTurn, setDuelTurn] = useState<number>(1);

  const [playerActiveCard, setPlayerActiveCard] = useState<ThinkerCard>(THINKER_CARDS[0]);
  const [playerActiveHp, setPlayerActiveHp] = useState<number>(1400);
  const [playerBenchCards, setPlayerBenchCards] = useState<ThinkerCard[]>([THINKER_CARDS[1], THINKER_CARDS[2]]);
  const [playerHandCards, setPlayerHandCards] = useState<ThinkerCard[]>([THINKER_CARDS[3], THINKER_CARDS[4], THINKER_CARDS[5]]);
  const [playerAttachedEnergy, setPlayerAttachedEnergy] = useState<number>(1);
  const [energyAttachedThisTurn, setEnergyAttachedThisTurn] = useState<boolean>(false);

  const [opponentActiveCard, setOpponentActiveCard] = useState<ThinkerCard>(THINKER_CARDS[4]);
  const [opponentActiveHp, setOpponentActiveHp] = useState<number>(1450);
  const [opponentBenchCards, setOpponentBenchCards] = useState<ThinkerCard[]>([THINKER_CARDS[0], THINKER_CARDS[7]]);
  const [opponentEnergy, setOpponentEnergy] = useState<number>(1);
  const [opponentDialogue, setOpponentDialogue] = useState<string>('¡Iniciemos el duelo de saberes! Demuestra el poder de tus cartas.');

  const [cutInBanner, setCutInBanner] = useState<{
    title: string;
    subtitle: string;
    quote: string;
    image: string;
    isRival?: boolean;
  } | null>(null);
  const [battleAnimState, setBattleAnimState] = useState<'idle' | 'player_beam' | 'rival_beam' | 'energy_charge'>('idle');
  const [floatingDamage, setFloatingDamage] = useState<{
    target: 'player' | 'rival';
    amount: number;
    label: string;
  } | null>(null);
  const [activeEduQuiz, setActiveEduQuiz] = useState<{
    card: ThinkerCard;
    isUltimate: boolean;
  } | null>(null);
  const [eduQuizResult, setEduQuizResult] = useState<{
    isCorrect: boolean;
    selectedIdx: number;
    explanation: string;
    damageDealt: number;
  } | null>(null);
  const [masteredConcepts, setMasteredConcepts] = useState<Array<{ thinker: string; concept: string; discovery: string }>>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const selectedOpponent = DUEL_OPPONENTS.find(o => o.id === selectedOpponentId) || DUEL_OPPONENTS[0];

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

  // Síntesis de voz femenina neuronal humana en primera persona estricta (Regla No Negociable 2)
  const speakText = (text: string) => {
    if (isSoundMuted) return;
    speakNaturalFemaleSpanish(text, { rate: 0.98, pitch: 1.04 });
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

  // 3. MOTOR TÁCTICO DE BATALLA EDUCATIVA 3D (NPC & COMPAÑEROS DE AULA)
  const startNewDuel = (oppId?: string) => {
    const targetOppId = oppId || selectedOpponentId;
    const opp = DUEL_OPPONENTS.find(o => o.id === targetOppId) || DUEL_OPPONENTS[0];
    setSelectedOpponentId(opp.id);

    // Construir el mazo del alumno a partir de sus cartas conseguidas en sobres + mazo equipado
    const unlockedIds = Array.from(new Set([...equippedDeckIds, ...activeStudent.inventoryCards]));
    const playerPool = unlockedIds
      .map(id => THINKER_CARDS.find(c => c.id === id))
      .filter((c): c is ThinkerCard => Boolean(c));
    const fullPlayerDeck = playerPool.length >= 4 ? playerPool : THINKER_CARDS.slice(0, 5);

    const pActive = fullPlayerDeck[0];
    const pBench = fullPlayerDeck.slice(1, 3);
    const pHand = fullPlayerDeck.slice(3).concat(
      THINKER_CARDS.filter(c => !fullPlayerDeck.some(d => d.id === c.id)).slice(0, 2)
    );

    const oppCards = opp.deckIds
      .map(id => THINKER_CARDS.find(c => c.id === id))
      .filter((c): c is ThinkerCard => Boolean(c));
    const oActive = oppCards[0] || THINKER_CARDS[4];
    const oBench = oppCards.slice(1, 3);

    setPlayerMaxLp(2500);
    setPlayerLp(2500);
    setOpponentMaxLp(opp.maxLp);
    setOpponentLp(opp.maxLp);
    setDuelTurn(1);

    setPlayerActiveCard(pActive);
    setPlayerActiveHp(CARD_EDUCATIONAL_ARSENAL[pActive.id]?.maxHp || 1400);
    setPlayerBenchCards(pBench);
    setPlayerHandCards(pHand);
    setPlayerAttachedEnergy(1);
    setEnergyAttachedThisTurn(false);
    setArenaMana(10);

    setOpponentActiveCard(oActive);
    setOpponentActiveHp(CARD_EDUCATIONAL_ARSENAL[oActive.id]?.maxHp || 1450);
    setOpponentBenchCards(oBench);
    setOpponentEnergy(1);
    setOpponentDialogue(opp.introQuote);

    setActiveEduQuiz(null);
    setEduQuizResult(null);
    setFloatingDamage(null);
    setBattleAnimState('idle');
    setBattleLog([
      `⚔️ Duelo iniciado contra ${opp.name} (${opp.mode === 'npc' ? 'Guardián NPC' : `Compañero de Aula · ${opp.roomCode}`}).`,
      `🃏 Invocaste en vanguardia a ${pActive.name} (${pActive.discovery}).`
    ]);

    setDuelStage('battle');
    gamificationAudio.playMagicCastSound();
    speakText(`${opp.introQuote} Invoco a ${oActive.name} al campo de batalla.`);

    setCutInBanner({
      title: `¡INVOCACIÓN EN VANGUARDIA: ${pActive.name.toUpperCase()}!`,
      subtitle: CARD_EDUCATIONAL_ARSENAL[pActive.id]?.element || pActive.discovery,
      quote: pActive.voiceQuote,
      image: pActive.image,
      isRival: false
    });
    setTimeout(() => setCutInBanner(null), 2600);
  };

  // Invocar desde la mano o relevar desde la banca hacia la Vanguardia Activa
  const handleSummonOrSwapCard = (card: ThinkerCard, fromZone: 'hand' | 'bench') => {
    if (arenaMana < 1) {
      gamificationAudio.playHitSound();
      showToast('¡Necesitas al menos 1 Cristal de Maná para relevar o invocar!');
      return;
    }

    gamificationAudio.playMagicCastSound();
    const prevActive = playerActiveCard;
    setArenaMana(prev => Math.max(0, prev - 1));
    setPlayerActiveCard(card);
    setPlayerActiveHp(CARD_EDUCATIONAL_ARSENAL[card.id]?.maxHp || 1400);

    if (fromZone === 'hand') {
      setPlayerHandCards(prev => prev.filter(c => c.id !== card.id));
      setPlayerBenchCards(prev => (prev.length < 2 ? [...prev, prevActive] : [prevActive, prev[0]]));
    } else {
      setPlayerBenchCards(prev => prev.map(c => (c.id === card.id ? prevActive : c)));
    }

    setBattleLog(prev => [`✨ ¡Invocación Táctica! ${card.name} entra a la Vanguardia Activa.`, ...prev.slice(0, 6)]);
    speakText(card.voiceQuote);

    setCutInBanner({
      title: `¡INVOCACIÓN CIENTÍFICA: ${card.name.toUpperCase()}!`,
      subtitle: CARD_EDUCATIONAL_ARSENAL[card.id]?.attackName || card.discovery,
      quote: card.voiceQuote,
      image: card.image,
      isRival: false
    });
    setTimeout(() => setCutInBanner(null), 2500);
  };

  // Anexar Cristal de Energía Curricular (+250 ATK y habilita Habilidad Suprema)
  const handleAttachEnergyCrystal = () => {
    if (energyAttachedThisTurn) {
      gamificationAudio.playHitSound();
      showToast('Ya anexaste 1 Cristal de Energía en este turno. ¡Declara tu ataque pedagógico!');
      return;
    }
    gamificationAudio.playCoinSound();
    setPlayerAttachedEnergy(prev => prev + 1);
    setEnergyAttachedThisTurn(true);
    setBattleAnimState('energy_charge');
    setTimeout(() => setBattleAnimState('idle'), 900);

    const move = CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id];
    setBattleLog(prev => [
      `⚡ Cristal de Energía de ${move?.element || 'Ciencia'} anexado a ${playerActiveCard.name} (+250 ATK).`,
      ...prev.slice(0, 6)
    ]);
    showToast(`¡+1 Cristal de Energía anexado a ${playerActiveCard.name}! (+250 ATK)`);
  };

  // Robar carta adicional del mazo de sobres conseguidos
  const handleDrawCardFromDeck = () => {
    const activeIds = new Set([
      playerActiveCard.id,
      ...playerBenchCards.map(c => c.id),
      ...playerHandCards.map(c => c.id)
    ]);
    const available = THINKER_CARDS.filter(c => !activeIds.has(c.id));
    if (available.length === 0) {
      showToast('¡Todas las cartas de tu mazo ya están en tu mano o en el campo!');
      return;
    }
    const drawn = available[0];
    gamificationAudio.playClickSound();
    setPlayerHandCards(prev => [...prev, drawn]);
    setBattleLog(prev => [`🃏 Robaste la carta de ${drawn.name} desde tu Mazo Curricular.`, ...prev.slice(0, 6)]);
    showToast(`¡Carta robada: ${drawn.name}!`);
  };

  // Abrir el Reto Pedagógico de Ataque para aprender y potenciar el golpe
  const handleInitiateEducationalAttack = (isUltimate: boolean) => {
    if (isUltimate && playerAttachedEnergy < 2) {
      gamificationAudio.playHitSound();
      showToast('¡Anexa al menos 2 Cristales de Energía (⚡) para activar la Habilidad Suprema!');
      return;
    }
    gamificationAudio.playClickSound();
    setEduQuizResult(null);
    setActiveEduQuiz({ card: playerActiveCard, isUltimate });
    const move = CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id];
    if (move) {
      speakText(`${move.lessonCapsule} Responde: ${move.quizQuestion}`);
    }
  };

  // Resolver la respuesta del alumno y ejecutar las animaciones de ataque + turno del rival
  const handleAnswerEducationalQuiz = (selectedIdx: number) => {
    if (!activeEduQuiz) return;
    const card = activeEduQuiz.card;
    const move = CARD_EDUCATIONAL_ARSENAL[card.id] || CARD_EDUCATIONAL_ARSENAL.newton;
    const isCorrect = selectedIdx === move.correctIndex;

    const energyBonus = playerAttachedEnergy * 250;
    const rawDamage = move.baseAtk + energyBonus + (activeEduQuiz.isUltimate ? 400 : 0);
    const finalDamage = isCorrect ? Math.round(rawDamage * 1.35) : Math.round(rawDamage * 0.55);

    if (isCorrect) {
      gamificationAudio.playLevelUpSound();
      speakText(move.explanation);
      setMasteredConcepts(prev => {
        if (prev.some(m => m.thinker === card.name)) return prev;
        return [...prev, { thinker: card.name, concept: move.element, discovery: move.explanation }];
      });
    } else {
      gamificationAudio.playHitSound();
      speakText(`Casi lo logras. Recuerda: ${move.explanation}`);
    }

    setEduQuizResult({
      isCorrect,
      selectedIdx,
      explanation: move.explanation,
      damageDealt: finalDamage
    });
  };

  // Ejecutar el impacto en el tablero 3D tras leer la retroalimentación educativa
  const executeBattleStrike = () => {
    if (!activeEduQuiz || !eduQuizResult) return;
    const dmg = eduQuizResult.damageDealt;
    const wasCorrect = eduQuizResult.isCorrect;
    const move = CARD_EDUCATIONAL_ARSENAL[activeEduQuiz.card.id] || CARD_EDUCATIONAL_ARSENAL.newton;

    setActiveEduQuiz(null);
    setEduQuizResult(null);
    setBattleAnimState('player_beam');
    gamificationAudio.playMagicCastSound();

    setFloatingDamage({
      target: 'rival',
      amount: dmg,
      label: wasCorrect ? '¡IMPACTO CRÍTICO DE SABIDURÍA!' : 'Ataque Base'
    });

    const newOppLp = Math.max(0, opponentLp - dmg);
    const newOppCardHp = Math.max(0, opponentActiveHp - dmg);
    setOpponentLp(newOppLp);
    setOpponentActiveHp(newOppCardHp);

    if (wasCorrect) {
      setPlayerLp(prev => Math.min(playerMaxLp, prev + 200));
    }

    setBattleLog(prev => [
      `💥 ${playerActiveCard.name} usó "${activeEduQuiz.isUltimate ? move.ultimateName : move.attackName}" causando ${dmg} LP de daño ${wasCorrect ? '(¡Maestría Curricular Crítica!)' : ''}.`,
      ...prev.slice(0, 6)
    ]);

    setTimeout(() => {
      setBattleAnimState('idle');
      setFloatingDamage(null);

      // Verificar si el jugador ganó el duelo
      if (newOppLp <= 0) {
        triggerConfetti();
        gamificationAudio.playLevelUpSound();
        setDuelStage('victory');
        speakText(`¡Victoria magistral en el Torneo de Saberes! Has superado a ${selectedOpponent.name} demostrando dominio científico e histórico.`);
        setStudents(prev => prev.map(s => {
          if (s.id !== activeStudent.id) return s;
          return {
            ...s,
            wins: s.wins + 1,
            gems: s.gems + selectedOpponent.victoryRewardGems,
            manaCrystals: s.manaCrystals + 5
          };
        }));
        return;
      }

      // Si la carta activa del rival fue derrotada pero aún tiene LP, releva con su banca
      if (newOppCardHp <= 0 && opponentBenchCards.length > 0) {
        const nextRivalCard = opponentBenchCards[0];
        setOpponentActiveCard(nextRivalCard);
        setOpponentActiveHp(CARD_EDUCATIONAL_ARSENAL[nextRivalCard.id]?.maxHp || 1400);
        setOpponentBenchCards(prev => prev.slice(1));
        setOpponentDialogue(`¡Derrotaste mi carta, pero ahora invoco a ${nextRivalCard.name} al campo!`);
      }

      // Turno de contraataque del Rival (NPC o Compañero)
      setTimeout(() => {
        const rivalMove = CARD_EDUCATIONAL_ARSENAL[opponentActiveCard.id] || CARD_EDUCATIONAL_ARSENAL.galileo;
        const rivalDmg = Math.round((rivalMove.baseAtk + opponentEnergy * 120) * 0.55);
        setBattleAnimState('rival_beam');
        gamificationAudio.playHitSound();
        setOpponentEnergy(prev => Math.min(3, prev + 1));
        setOpponentDialogue(`¡Mi turno! Ataco con ${opponentActiveCard.name}: ¡${rivalMove.attackName}!`);
        setFloatingDamage({
          target: 'player',
          amount: rivalDmg,
          label: `Contraataque de ${opponentActiveCard.name}`
        });

        setPlayerLp(prev => Math.max(250, prev - rivalDmg));
        setPlayerActiveHp(prev => Math.max(300, prev - rivalDmg));
        setDuelTurn(prev => prev + 1);
        setEnergyAttachedThisTurn(false);
        setArenaMana(prev => Math.min(10, prev + 2));

        setBattleLog(prev => [
          `🛡️ ${selectedOpponent.name} contraatacó con ${opponentActiveCard.name} (${rivalMove.attackName}: -${rivalDmg} LP). ¡Es tu turno!`,
          ...prev.slice(0, 6)
        ]);

        setTimeout(() => {
          setBattleAnimState('idle');
          setFloatingDamage(null);
        }, 1000);
      }, 900);
    }, 1050);
  };

  // Compatibilidad rápida para llamadas directas
  const handlePlayArenaCard = (card: ThinkerCard) => {
    handleSummonOrSwapCard(card, 'hand');
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
        
        {/* LIENZO ENMARCADO CON MÁXIMA FIDELIDAD VISUAL (RELACIÓN EXACTA 1600:893 SIN RECORTE) */}
        <div className="relative w-full max-w-[calc(82vh*1.7917)] aspect-[1600/893] mx-auto rounded-[36px] overflow-hidden shadow-2xl border-4 border-indigo-500/60 bg-slate-950 group">
          
          {/* Ilustración de Fondo Original (1600x893) */}
          <img 
            src="/redisenos_assets/torneo_tcg/torneo_hub_master_scene.jpg" 
            alt="Torneo de Saberes - Estadio de Duelos y Archivador de Cartas"
            className="w-full h-full object-fill select-none"
          />

          {/* ========================================================= */}
          {/* HOTSPOTS INTERACTIVOS MAESTROS DIRECTOS SOBRE EL LIENZO  */}
          {/* ========================================================= */}

          {/* 0. BOTÓN SUPERIOR DERECHO DE RECARGA DE GEMAS (+) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setPackOpeningStage('idle');
              setPulledCard(null);
              setActiveModal('store');
              speakText("¡Abriendo el Bazar de Sobres y Cristales!");
            }}
            className="absolute top-[2.5%] left-[90.8%] w-[8.0%] h-[5.2%] z-20 rounded-full transition-all cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:bg-emerald-400/15 active:scale-95"
            title="Ir a la Tienda de Sobres y Gemas"
          />

          {/* 1. ARCHIVADOR DE 8 CARTAS DE SABIOS (LADO IZQUIERDO: 2 FILAS x 4 COLUMNAS CALIBRADAS) */}
          <div className="absolute top-[22.5%] left-[4.8%] w-[42.8%] h-[55.5%] z-20 grid grid-cols-4 grid-rows-2 gap-x-[1.3%] gap-y-[2.5%]">
            {THINKER_CARDS.map(card => (
              <button
                key={card.id}
                onClick={() => handleInspectCard(card)}
                className="rounded-xl transition-all cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-[1.03] active:scale-95 group/card relative"
                title={`Ver detalles de ${card.name}`}
              >
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/card:opacity-100 rounded-xl transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          {/* 2. BOTONES DEL COLISEO SUPERIOR DERECHO (JUGAR, MAZOS, TIENDA) */}
          {/* Botón JUGAR Superior */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setDuelStage('lobby');
              setActiveModal('tcgArena');
              speakText("¡Bienvenido al Coliseo de Duelos Tácticos! Elige combatir contra un Guardián de la Academia o contra un compañero de tu salón.");
            }}
            className="absolute top-[37.3%] left-[66.8%] w-[10.0%] h-[6.9%] z-20 rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/15 hover:scale-105 active:scale-95"
            title="Iniciar Duelo Holográfico TCG"
          />
          {/* Botón MAZOS Superior */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('deckBuilder');
              speakText("Constructor de Mazos: selecciona tus cartas de pensadores históricos para el duelo.");
            }}
            className="absolute top-[37.3%] left-[77.5%] w-[9.8%] h-[6.9%] z-20 rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-cyan-400 hover:bg-cyan-500/15 hover:scale-105 active:scale-95"
            title="Organizar Mazo de Cartas"
          />
          {/* Botón TIENDA Superior */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setPackOpeningStage('idle');
              setPulledCard(null);
              setActiveModal('store');
              speakText("¡Bienvenido al Bazar de Sobres Holográficos del Torneo de Saberes!");
            }}
            className="absolute top-[37.3%] left-[87.8%] w-[10.0%] h-[6.9%] z-20 rounded-2xl transition-all cursor-pointer hover:ring-2 hover:ring-amber-400 hover:bg-amber-500/15 hover:scale-105 active:scale-95"
            title="Bazar de Sobres TCG"
          />

          {/* 3. ARENA DEL CONOCIMIENTO (ENIGMA DUAL EN VIVO: CAPITAL DE ITALIA + 14 x 6) */}
          {/* Coordenadas milimétricas calibradas sobre los 3 óvalos reales de la ilustración */}
          {/* Opción A: Roma / 84 (RESPUESTA CORRECTA) */}
          <button
            onClick={() => handleAnswerArenaDual('A')}
            className={`absolute top-[75.3%] left-[62.2%] w-[7.6%] h-[3.4%] z-20 rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              arenaAnswerState === 'correct'
                ? 'ring-2 ring-emerald-400 bg-emerald-500/25 shadow-[0_0_16px_rgba(16,185,129,0.8)]'
                : ' ring-1 ring-emerald-400/60 hover:ring-2 hover:ring-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
            }`}
            title="Opción A: Roma / 84 (Respuesta Correcta)"
          />
          {/* Opción B: París / 72 */}
          <button
            onClick={() => handleAnswerArenaDual('B')}
            className="absolute top-[75.3%] left-[70.6%] w-[7.6%] h-[3.4%] z-20 rounded-full transition-all cursor-pointer ring-1 ring-amber-400/40 hover:ring-2 hover:ring-rose-400 hover:bg-rose-500/20 hover:scale-105 active:scale-95"
            title="Opción B: París / 72"
          />
          {/* Opción C: Madrid / 60 */}
          <button
            onClick={() => handleAnswerArenaDual('C')}
            className="absolute top-[75.3%] left-[79.0%] w-[7.6%] h-[3.4%] z-20 rounded-full transition-all cursor-pointer ring-1 ring-amber-400/40 hover:ring-2 hover:ring-rose-400 hover:bg-rose-500/20 hover:scale-105 active:scale-95"
            title="Opción C: Madrid / 60"
          />

          {/* 4. BOTONERA INFERIOR DEL TABLERO (JUGAR, MAZOS, TIENDA, MENÚ) */}
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setDuelStage('lobby');
              setActiveModal('tcgArena');
              speakText("¡Entrando al Coliseo de Duelos Tácticos 3D!");
            }}
            className="absolute top-[90.8%] left-[50.8%] w-[12.8%] h-[7.0%] z-20 rounded-2xl hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/15 transition-all cursor-pointer active:scale-95"
            title="Jugar Duelo Holográfico"
          />
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('deckBuilder');
              speakText("Abriendo el constructor de mazos tácticos.");
            }}
            className="absolute top-[90.8%] left-[64.6%] w-[11.4%] h-[7.0%] z-20 rounded-2xl hover:ring-2 hover:ring-cyan-400 hover:bg-cyan-500/15 transition-all cursor-pointer active:scale-95"
            title="Mazos"
          />
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setPackOpeningStage('idle');
              setPulledCard(null);
              setActiveModal('store');
              speakText("Abriendo el bazar de sobres coleccionables.");
            }}
            className="absolute top-[90.8%] left-[76.8%] w-[11.2%] h-[7.0%] z-20 rounded-2xl hover:ring-2 hover:ring-amber-400 hover:bg-amber-500/15 transition-all cursor-pointer active:scale-95"
            title="Tienda"
          />
          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              setActiveModal('albumCustomizer');
            }}
            className="absolute top-[90.8%] left-[88.8%] w-[9.7%] h-[7.0%] z-20 rounded-2xl hover:ring-2 hover:ring-indigo-400 hover:bg-indigo-500/15 transition-all cursor-pointer active:scale-95"
            title="Menú y Personalizador"
          />

        </div>

        {/* BARRA INFORMATIVA INFERIOR DE DUELO */}
        <div className="mt-3 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-indigo-500/30 flex flex-wrap items-center justify-between text-xs text-slate-300 shadow-xl gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-400">Maestro de Cartas ISkool</span>
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
                setDuelStage('lobby');
                setActiveModal('tcgArena');
                speakText("¡Abriendo el Coliseo de Duelos contra Guardianes y Compañeros de Aula!");
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
      {/* 6. PANTALLA 2: MOTOR TÁCTICO DE DUELOS 3D (NPC & COMPAÑEROS DE AULA)      */}
      {/* ========================================================================= */}
      {activeModal === 'tcgArena' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          
          <div className="relative w-full max-w-6xl rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.35)] border-4 border-indigo-500/80 bg-slate-950 flex flex-col justify-between max-h-[96vh]">
            
            {/* BARRA SUPERIOR DEL MOTOR DE DUELOS */}
            <div className="bg-slate-900/95 border-b border-indigo-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-30">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                  <Swords className="w-3.5 h-3.5" /> Coliseo Táctico 3D
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {duelStage === 'lobby' && 'Selección de Oponente: Guardianes NPC y Compañeros de Aula'}
                  {duelStage === 'battle' && `Duelo en Vivo · Turno ${duelTurn} vs. ${selectedOpponent.name}`}
                  {duelStage === 'victory' && `¡Victoria Magistral sobre ${selectedOpponent.name}!`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {duelStage === 'battle' && (
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setDuelStage('lobby');
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 text-xs font-black transition-all"
                  >
                    Cambiar Rival / Modo
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black">
                  <span className="text-cyan-300">💎 {activeStudent.gems} Gemas</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-300">📚 {masteredConcepts.length} Conceptos Dominados</span>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors"
                  title="Cerrar Coliseo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* SUB-VISTA 1: LOBBY DE SELECCIÓN (NPC IA vs. COMPAÑEROS DE AULA PvP)   */}
            {/* ===================================================================== */}
            {duelStage === 'lobby' && (
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[84vh] bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950">
                
                {/* Selector de Modalidad de Juego */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setDuelModeTab('npc');
                        setSelectedOpponentId('npc-minerva');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        duelModeTab === 'npc'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Modo 1: Guardianes NPC de la Academia (IA Pedagógica)</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setDuelModeTab('peer');
                        setSelectedOpponentId('peer-sofia');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        duelModeTab === 'peer'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-[1.02]'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Modo 2: Duelo contra Compañeros de Aula (PvP Escolar)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setPackOpeningStage('idle');
                        setPulledCard(null);
                        setActiveModal('store');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Conseguir Más Cartas en Sobres</span>
                    </button>
                  </div>
                </div>

                {/* Banner de Sincronización entre Compañeros de Salón (Cuando está en pestaña 'peer') */}
                {duelModeTab === 'peer' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-2 border-emerald-500/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        📡 Red Escolar Multijugador ISkool · Emparejamiento de Aula en Tiempo Real
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        Reta a tus compañeros de salón con las cartas que desbloqueaste en tus sobres
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Comparte tu <strong>PIN de Mesa Curricular</strong> con un compañero de clase o selecciona a un compañero conectado en tu grupo para combatir turno a turno resolviendo desafíos científicos reales.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/90 p-3 rounded-2xl border border-emerald-500/40">
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">PIN de Sala Escolar</span>
                        <strong className="text-base font-black text-emerald-300 tracking-widest">{classroomPinCode}</strong>
                      </div>
                      <button
                        onClick={() => {
                          gamificationAudio.playCoinSound();
                          const nextPin = `ISK-${Math.floor(100 + Math.random() * 899)}`;
                          setClassroomPinCode(nextPin);
                          setPeerInviteCopied(true);
                          showToast(`¡Sala escolar ${nextPin} sincronizada para duelo entre compañeros!`);
                          setTimeout(() => setPeerInviteCopied(false), 3000);
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        {peerInviteCopied ? '✓ Sala Activa' : 'Generar PIN'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tarjetas de Oponentes (NPCs o Compañeros de Salón) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DUEL_OPPONENTS.filter(o => o.mode === duelModeTab).map(opp => {
                    const isSelected = selectedOpponentId === opp.id;
                    return (
                      <div
                        key={opp.id}
                        onClick={() => {
                          gamificationAudio.playClickSound();
                          setSelectedOpponentId(opp.id);
                          speakText(opp.introQuote);
                        }}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
                          isSelected
                            ? 'bg-indigo-950/80 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] scale-[1.01]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/60'
                        }`}
                      >
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shrink-0 shadow-xl">
                          <img src={opp.avatar} alt={opp.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 right-1 bg-black/80 text-amber-300 text-[9px] font-black text-center py-0.5 rounded">
                            NV. {opp.level} · {opp.maxLp} LP
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              opp.mode === 'npc'
                                ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {opp.statusBadge}
                            </span>
                            <span className="text-[10px] font-black text-amber-300">
                              🏆 +{opp.victoryRewardGems} Gemas
                            </span>
                          </div>

                          <h4 className="text-base font-black text-white">{opp.name}</h4>
                          <p className="text-[11px] text-indigo-300 font-bold">{opp.title}</p>
                          <p className="text-xs text-slate-300 italic bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                            "{opp.introQuote}"
                          </p>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400 font-bold">
                              Especialidad: <strong className="text-cyan-300">{opp.specialty}</strong>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startNewDuel(opp.id);
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Swords className="w-3.5 h-3.5" />
                              <span>¡Iniciar Duelo!</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mazo Activo del Estudiante (Con las cartas desbloqueadas en Sobres) */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                        🃏 Tu Escuadrón de Cartas Desbloqueadas para el Duelo ({activeStudent.name})
                      </span>
                      <p className="text-xs text-slate-300">
                        Haz clic en cualquier carta para integrarla o retirarla de tu vanguardia antes de entrar a la Arena 3D:
                      </p>
                    </div>
                    <button
                      onClick={() => startNewDuel(selectedOpponentId)}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    >
                      <Swords className="w-4 h-4" />
                      <span>ENTRAR AL CAMPO DE BATALLA 3D VS. {selectedOpponent.name.toUpperCase()}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {THINKER_CARDS.map(card => {
                      const isEquipped = equippedDeckIds.includes(card.id);
                      const move = CARD_EDUCATIONAL_ARSENAL[card.id];
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            gamificationAudio.playClickSound();
                            setEquippedDeckIds(prev =>
                              prev.includes(card.id)
                                ? prev.length > 2 ? prev.filter(id => id !== card.id) : prev
                                : [...prev, card.id]
                            );
                          }}
                          className={`p-1.5 rounded-xl border-2 cursor-pointer transition-all text-center ${
                            isEquipped
                              ? 'bg-indigo-950/90 border-cyan-400 shadow-md scale-[1.02]'
                              : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden mb-1 relative">
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-slate-950/90 text-cyan-300 text-[9px] font-black px-1.5 rounded">
                              {move?.baseAtk || 850} ATK
                            </span>
                          </div>
                          <p className="text-[10px] font-black text-white truncate">{card.name}</p>
                          <span className={`text-[9px] font-bold block ${isEquipped ? 'text-cyan-300' : 'text-slate-500'}`}>
                            {isEquipped ? '✓ En Mazo' : '+ Equipar'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-VISTA 2: ARENA DE BATALLA HOLOGRÁFICA 3D EN VIVO (`battle`)       */}
            {/* ===================================================================== */}
            {duelStage === 'battle' && (
              <div className="relative w-full aspect-[16/9] max-h-[82vh] overflow-hidden bg-slate-950 select-none">
                
                {/* Escenario Holográfico 3D Limpio Generado con Nano Banana 2.1 */}
                <img
                  src="/redisenos_assets/torneo_tcg/tcg_arena_clean_stadium.webp"
                  alt="Estadio Holográfico de Duelos 3D"
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    battleAnimState === 'player_beam' || battleAnimState === 'rival_beam' ? 'scale-[1.03]' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-transparent to-slate-950/85 pointer-events-none" />

                {/* ----------------------------------------------------------------- */}
                {/* 1. HUD SUPERIOR DEL RIVAL (NPC O COMPAÑERO DE AULA) + CAMPO RIVAL */}
                {/* ----------------------------------------------------------------- */}
                <div className="absolute top-2.5 left-4 right-4 z-20 flex flex-wrap items-start justify-between gap-3">
                  
                  {/* Perfil y Barra de Vida (LP) del Oponente */}
                  <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-md p-2 pr-4 rounded-2xl border-2 border-rose-500/60 shadow-2xl">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-rose-400 shrink-0">
                      <img src={selectedOpponent.avatar} alt={selectedOpponent.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-rose-600 text-white text-[8px] font-black text-center">
                        {selectedOpponent.mode === 'npc' ? 'GUARDIÁN NPC' : 'COMPAÑERO'}
                      </span>
                    </div>
                    <div className="space-y-1 min-w-[170px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{selectedOpponent.name}</span>
                        <span className="text-xs font-black text-rose-400">{opponentLp} / {opponentMaxLp} LP</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, (opponentLp / opponentMaxLp) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-rose-200 italic line-clamp-1 max-w-[260px]">
                        "{opponentDialogue}"
                      </p>
                    </div>
                  </div>

                  {/* Banca de Apoyo del Rival (2 Cartas) */}
                  <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-rose-500/30">
                    <span className="text-[10px] font-black uppercase text-rose-300">Banca Rival:</span>
                    {opponentBenchCards.map(bCard => (
                      <div key={bCard.id} className="w-10 h-14 rounded-lg overflow-hidden border border-rose-400/60 opacity-90" title={`Reserva Rival: ${bCard.name}`}>
                        <img src={bCard.image} alt={bCard.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* 2. ZONA CENTRAL DEL TABLERO 3D: VANGUARDIA RIVAL VS. JUGADOR      */}
                {/* ----------------------------------------------------------------- */}
                
                {/* CARTA ACTIVA DEL RIVAL (PARTE SUPERIOR DE LA MESA HOLOGRÁFICA) */}
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                  <div className={`relative w-28 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.55)] transition-all duration-300 ${
                    battleAnimState === 'player_beam' ? 'animate-bounce ring-4 ring-red-500 scale-95' : ''
                  }`}>
                    <img src={opponentActiveCard.image} alt={opponentActiveCard.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 right-1 flex justify-between items-center px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-black">
                      <span className="text-amber-300">⚡×{opponentEnergy}</span>
                      <span className="text-emerald-300">{opponentActiveHp} HP</span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent p-1.5 text-center">
                      <p className="text-[10px] font-black text-white truncate">{opponentActiveCard.name}</p>
                      <span className="text-[8px] font-bold text-rose-300 block truncate">
                        ⚔️ {(CARD_EDUCATIONAL_ARSENAL[opponentActiveCard.id]?.baseAtk || 820) + opponentEnergy * 120} ATK
                      </span>
                    </div>
                  </div>
                </div>

                {/* EFECTOS DE HAZ LÁSER Y CHOQUE HOLOGRÁFICO ENTRE CARTAS */}
                {battleAnimState === 'player_beam' && (
                  <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                    <div className="w-3 h-[45%] bg-gradient-to-t from-cyan-400 via-amber-300 to-rose-500 rounded-full blur-[2px] animate-ping shadow-[0_0_50px_#38bdf8]" />
                    <div className="absolute top-[20%] w-40 h-40 rounded-full bg-amber-400/40 blur-xl animate-ping" />
                  </div>
                )}

                {battleAnimState === 'rival_beam' && (
                  <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                    <div className="w-3 h-[45%] bg-gradient-to-b from-rose-500 via-purple-500 to-amber-400 rounded-full blur-[2px] animate-ping shadow-[0_0_50px_#f43f5e]" />
                    <div className="absolute bottom-[28%] w-40 h-40 rounded-full bg-rose-500/40 blur-xl animate-ping" />
                  </div>
                )}

                {/* POPUP FLOTANTE DE DAÑO CRÍTICO */}
                {floatingDamage && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce ${
                      floatingDamage.target === 'rival' ? 'top-[18%]' : 'bottom-[34%]'
                    }`}
                  >
                    <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-red-600 to-rose-600 border-2 border-white text-white shadow-[0_0_40px_rgba(245,158,11,0.9)] text-center">
                      <span className="text-[10px] font-black uppercase block tracking-wider text-amber-100">
                        {floatingDamage.label}
                      </span>
                      <strong className="text-2xl sm:text-3xl font-black drop-shadow">
                        -{floatingDamage.amount} LP
                      </strong>
                    </div>
                  </div>
                )}

                {/* CARTA ACTIVA DEL JUGADOR EN VANGUARDIA + BANCA DE SINERGIA */}
                <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 sm:gap-6">
                  
                  {/* Banca de Sinergia del Jugador (Izquierda de la Vanguardia) */}
                  <div className="hidden sm:flex flex-col items-center gap-1.5 bg-slate-950/85 p-2 rounded-2xl border border-cyan-500/40">
                    <span className="text-[9px] font-black uppercase text-cyan-300">Banca (Relevo):</span>
                    <div className="flex items-center gap-2">
                      {playerBenchCards.map(bCard => (
                        <button
                          key={bCard.id}
                          onClick={() => handleSummonOrSwapCard(bCard, 'bench')}
                          className="relative w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden border-2 border-cyan-400/70 hover:border-amber-400 hover:scale-110 transition-all cursor-pointer group/bench"
                          title={`Relevar a Vanguardia: ${bCard.name}`}
                        >
                          <img src={bCard.image} alt={bCard.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[8px] font-black text-cyan-200 py-0.5 truncate px-0.5">
                            🔄 {bCard.name.split(' ').pop()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Carta Vanguardia Activa del Jugador */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-32 sm:w-36 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_rgba(56,189,248,0.65)] transition-all duration-300 ${
                        battleAnimState === 'energy_charge'
                          ? 'ring-4 ring-amber-300 scale-110 shadow-[0_0_50px_rgba(251,191,36,0.95)]'
                          : battleAnimState === 'player_beam'
                          ? '-translate-y-6 scale-110 ring-4 ring-cyan-400'
                          : ''
                      }`}
                    >
                      <img src={playerActiveCard.image} alt={playerActiveCard.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 right-1 flex justify-between items-center px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-400/40 text-[9px] font-black">
                        <span className="text-amber-300 flex items-center gap-0.5" title="Cristales de Energía Anexados">
                          ⚡×{playerAttachedEnergy}
                        </span>
                        <span className="text-emerald-300">{playerActiveHp} HP</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-1.5 text-center">
                        <p className="text-[10px] font-black text-amber-300 truncate">{playerActiveCard.name}</p>
                        <span className="text-[9px] font-black text-cyan-300 block">
                          ⚔️ {(CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id]?.baseAtk || 850) + playerAttachedEnergy * 250} ATK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PANEL DE COMANDOS TÁCTICOS DE BATALLA Y APRENDIZAJE (DERECHA DE LA VANGUARDIA) */}
                  <div className="flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-indigo-500/60 shadow-2xl w-52 sm:w-60">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                      <span>⚡ Comandos de Sabio Activo</span>
                      <span className="text-cyan-300">Maná: {arenaMana}</span>
                    </span>

                    {/* 1. Anexar Energía Científica */}
                    <button
                      onClick={handleAttachEnergyCrystal}
                      className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-black flex items-center justify-between transition-all cursor-pointer ${
                        energyAttachedThisTurn
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md'
                      }`}
                    >
                      <span>⚡ Anexar Energía (+250 ATK)</span>
                      <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded">
                        {energyAttachedThisTurn ? 'Listo' : '+1 ⚡'}
                      </span>
                    </button>

                    {/* 2. Ataque Curricular Principal (Abre Reto Educativo) */}
                    <button
                      onClick={() => handleInitiateEducationalAttack(false)}
                      className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-[11px] shadow-lg flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <span className="truncate">
                        ⚔️ {CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id]?.attackName || 'Ataque Científico'}
                      </span>
                      <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded shrink-0">
                        Quiz ×1.35
                      </span>
                    </button>

                    {/* 3. Habilidad Suprema de Descubrimiento (Requiere 2+ Cristales de Energía) */}
                    <button
                      onClick={() => handleInitiateEducationalAttack(true)}
                      className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-black flex items-center justify-between transition-all cursor-pointer ${
                        playerAttachedEnergy >= 2
                          ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.6)] animate-pulse'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        🌟 {CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id]?.ultimateName || 'Habilidad Suprema'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 shrink-0">
                        2⚡ Req.
                      </span>
                    </button>

                    {/* 4. Escuchar Cápsula del Sabio en 1ª Persona */}
                    <button
                      onClick={() => {
                        const move = CARD_EDUCATIONAL_ARSENAL[playerActiveCard.id];
                        speakText(move ? move.lessonCapsule : playerActiveCard.voiceQuote);
                        showToast(`🎙️ ${playerActiveCard.name}: "${playerActiveCard.voiceQuote}"`);
                      }}
                      className="w-full py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Escuchar Cápsula del Sabio</span>
                    </button>
                  </div>

                </div>

                {/* ----------------------------------------------------------------- */}
                {/* 3. HUD INFERIOR DEL JUGADOR + MANO DE CARTAS DESBLOQUEADAS        */}
                {/* ----------------------------------------------------------------- */}
                <div className="absolute bottom-2 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3">
                  
                  {/* Retrato 3D del Alumno y Barra de Puntos de Sabiduría (LP) */}
                  <div className="flex items-center gap-3 bg-slate-950/95 backdrop-blur-md p-2 pr-4 rounded-2xl border-2 border-cyan-400/70 shadow-2xl">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0">
                      <img src={getDuelistRender()} alt={activeStudent.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-cyan-600 text-slate-950 text-[8px] font-black text-center">
                        TÚ · {activeStudent.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="space-y-1 min-w-[165px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{activeStudent.name}</span>
                        <span className="text-xs font-black text-cyan-300">{playerLp} / {playerMaxLp} LP</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, (playerLp / playerMaxLp) * 100))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                        <span>⚡ Energía Activa: {playerAttachedEnergy}</span>
                        <button
                          onClick={handleDrawCardFromDeck}
                          className="text-amber-300 hover:underline font-black cursor-pointer"
                        >
                          + Robar Carta
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MANO DE CARTAS EN ABANICO (CLICK PARA INVOCAR AL CAMPO) */}
                  <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-indigo-500/50 shadow-2xl">
                    <div className="hidden lg:block pr-2 border-r border-slate-800 text-right">
                      <span className="text-[9px] font-black uppercase text-indigo-300 block">Tu Mano ({playerHandCards.length})</span>
                      <span className="text-[9px] text-slate-400 block">Clic para Invocar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {playerHandCards.map(hCard => (
                        <button
                          key={hCard.id}
                          onClick={() => handleSummonOrSwapCard(hCard, 'hand')}
                          className="relative w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden border-2 border-indigo-400/80 hover:border-amber-400 hover:-translate-y-3 hover:scale-110 transition-all duration-200 shadow-xl cursor-pointer group/hand"
                          title={`Invocar a ${hCard.name} a la Vanguardia`}
                        >
                          <img src={hCard.image} alt={hCard.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/85 py-0.5 px-1 text-center">
                            <span className="text-[8px] font-black text-white block truncate">{hCard.name.split(' ').pop()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitácora Rápida de Combate */}
                  <div className="hidden xl:flex flex-col justify-center bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 w-64 max-h-20 overflow-y-auto text-[10px] text-slate-300 space-y-1">
                    {battleLog.slice(0, 2).map((entry, idx) => (
                      <p key={idx} className="leading-tight line-clamp-2">{entry}</p>
                    ))}
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* 4. CUT-IN CINEMÁTICO DIAGONAL DE INVOCACIÓN DE SABIO              */}
                {/* ----------------------------------------------------------------- */}
                {cutInBanner && (
                  <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="w-full py-5 px-6 bg-gradient-to-r from-indigo-950 via-amber-500/95 to-indigo-950 border-y-4 border-white shadow-[0_0_80px_rgba(245,158,11,0.9)] -rotate-2 flex items-center justify-center gap-6">
                      <div className="w-24 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 rotate-2">
                        <img src={cutInBanner.image} alt={cutInBanner.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-xl text-slate-950 space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                          ⚡ {cutInBanner.subtitle}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 drop-shadow">
                          {cutInBanner.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 italic">
                          "{cutInBanner.quote}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* 5. MODAL INTERACTIVO DE CÁPSULA EDUCATIVA Y QUIZ DE ATAQUE        */}
                {/* ----------------------------------------------------------------- */}
                {activeEduQuiz && (() => {
                  const move = CARD_EDUCATIONAL_ARSENAL[activeEduQuiz.card.id] || CARD_EDUCATIONAL_ARSENAL.newton;
                  return (
                    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.4)] p-5 sm:p-6 space-y-4 text-white">
                        
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <img src={activeEduQuiz.card.image} alt={activeEduQuiz.card.name} className="w-12 h-14 rounded-xl object-cover border border-amber-400" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                                {move.elementIcon} {move.element} · Impulso de Sabiduría Curricular
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white">
                                {activeEduQuiz.card.name} — {activeEduQuiz.isUltimate ? move.ultimateName : move.attackName}
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => speakText(`${move.lessonCapsule} ${move.quizQuestion}`)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Escuchar</span>
                          </button>
                        </div>

                        {/* Cápsula de Aprendizaje en Primera Persona (Para que el alumno aprenda antes de responder) */}
                        <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-400/40 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                            📖 Cápsula de Conocimiento en Primera Persona ({activeEduQuiz.card.name}):
                          </span>
                          <p className="text-xs sm:text-sm text-indigo-100 italic leading-relaxed">
                            "{move.lessonCapsule}"
                          </p>
                        </div>

                        {/* Pregunta de Comprobación Curricular */}
                        <div className="space-y-2.5">
                          <p className="text-xs sm:text-sm font-black text-amber-300">
                            🎯 {move.quizQuestion}
                          </p>

                          <div className="space-y-2">
                            {move.options.map((opt, idx) => {
                              const isSelected = eduQuizResult?.selectedIdx === idx;
                              const isCorrectOpt = idx === move.correctIndex;
                              let btnStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200';
                              if (eduQuizResult) {
                                if (isCorrectOpt) {
                                  btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400';
                                } else if (isSelected) {
                                  btnStyle = 'bg-rose-950/90 border-rose-400 text-rose-200';
                                }
                              }
                              return (
                                <button
                                  key={idx}
                                  disabled={Boolean(eduQuizResult)}
                                  onClick={() => handleAnswerEducationalQuiz(idx)}
                                  className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                                >
                                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-black text-amber-300 shrink-0">
                                    {['A', 'B', 'C'][idx]}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Retroalimentación Pedagógica y Botón de Disparo */}
                        {eduQuizResult && (
                          <div className={`p-3.5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in ${
                            eduQuizResult.isCorrect
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                              : 'bg-amber-950/80 border-amber-400 text-amber-100'
                          }`}>
                            <div className="space-y-0.5 text-xs">
                              <strong className="block text-sm font-black">
                                {eduQuizResult.isCorrect
                                  ? `✨ ¡MAESTRÍA CIENTÍFICA! Daño Crítico Potenciado: ${eduQuizResult.damageDealt} LP (+200 LP de Escudo)`
                                  : `📘 Retroalimentación Curricular (Ataque Base: ${eduQuizResult.damageDealt} LP):`}
                              </strong>
                              <p>{eduQuizResult.explanation}</p>
                            </div>
                            <button
                              onClick={executeBattleStrike}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shrink-0 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                            >
                              💥 ¡Lanzar Ataque ({eduQuizResult.damageDealt} LP)!
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-VISTA 3: RESUMEN PEDAGÓGICO DE VICTORIA (`victory`)               */}
            {/* ===================================================================== */}
            {duelStage === 'victory' && (
              <div className="p-6 sm:p-8 text-center space-y-6 bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 overflow-y-auto max-h-[84vh]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest">
                  <Trophy className="w-4 h-4" /> ¡Campeón del Coliseo de Saberes ISkool!
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  ¡Derrotaste a {selectedOpponent.name} con el Poder de la Ciencia!
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                  Has recibido <strong className="text-amber-300">+{selectedOpponent.victoryRewardGems} Gemas de Conocimiento</strong> y <strong className="text-cyan-300">+5 Cristales de Maná</strong> para abrir nuevos sobres de pensadores históricos.
                </p>

                {/* Bitácora de Aprendizaje Demostrado en la Batalla */}
                <div className="max-w-3xl mx-auto p-5 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/40 text-left space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Conceptos Curriculares Dominados en este Duelo:
                  </span>
                  {masteredConcepts.length === 0 ? (
                    <p className="text-xs text-slate-300 italic">
                      Has completado la partida con éxito. ¡Sigue respondiendo las cápsulas de los sabios para coleccionar insignias de dominio científico!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {masteredConcepts.map((mc, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-xs font-black text-amber-300">{mc.thinker}</strong>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold">
                              {mc.concept}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{mc.discovery}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => startNewDuel(selectedOpponentId)}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    🔄 Jugar Revancha
                  </button>
                  <button
                    onClick={() => setDuelStage('lobby')}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    👥 Elegir Otro NPC o Compañero de Aula
                  </button>
                  <button
                    onClick={() => {
                      setPackOpeningStage('idle');
                      setPulledCard(null);
                      setActiveModal('store');
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    🎁 Gastar Gemas en la Tienda de Sobres
                  </button>
                </div>
              </div>
            )}

            {/* PIE INFORMATIVO DEL MOTOR */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <span className="font-bold text-indigo-300">
                ⚡ Motor de Duelos Educativos ISkool · Sinergia de Cartas Desbloqueadas, Cristales de Energía y Retos Curriculares SEP
              </span>
              <button onClick={() => setActiveModal('none')} className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer">
                Volver al Estadio Principal
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
      {/* 7B. MODAL CONSTRUCTOR DE MAZOS TÁCTICOS ('deckBuilder') */}
      {/* ========================================================================= */}
      {activeModal === 'deckBuilder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-cyan-500 bg-slate-950 p-6 space-y-4 text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400">🃏 Armería de Cartas · Sinergia Curricular</span>
                <h3 className="text-lg font-black text-white">Constructor de Mazo Táctico ({equippedDeckIds.length} Cartas Equipadas)</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="p-1.5 rounded-xl bg-slate-800 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THINKER_CARDS.map(card => {
                const isEquipped = equippedDeckIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setEquippedDeckIds(prev =>
                        prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]
                      );
                      speakText(card.voiceQuote);
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isEquipped ? 'bg-cyan-950/50 border-cyan-400 shadow-lg' : 'bg-slate-900 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 border border-white/10">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xs font-black text-white">{card.name}</h4>
                      <p className="text-[10px] text-cyan-300 font-bold">{card.discovery}</p>
                    </div>
                    <span className={`mt-2 text-center py-1 rounded-lg text-[10px] font-black ${
                      isEquipped ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isEquipped ? '✓ En Mazo Principal' : '+ Añadir al Mazo'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7C. MODAL BAZAR DE SOBRES HOLOGRÁFICOS & CEREMONIA DE APERTURA ('store') */}
      {/* ========================================================================= */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          
          {/* MODO 1: CATÁLOGO DE LA TIENDA DE SOBRES (CUANDO packOpeningStage === 'idle') */}
          {packOpeningStage === 'idle' && (
            <div className="relative w-full max-w-3xl rounded-[36px] overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] border-4 border-amber-500 bg-slate-950 p-6 sm:p-7 space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    🎁 Bazar Oficial del Coliseo · Invocación Holográfica
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">Tienda de Sobres de Pensadores Históricos</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center gap-2 text-xs font-black text-amber-300 shadow-inner">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{activeStudent.gems.toLocaleString()} Gemas</span>
                  </div>
                  <button
                    onClick={() => {
                      setPackOpeningStage('idle');
                      setActiveModal('none');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* SOBRE 1: SOBRE LEGENDARIO DORADO */}
                <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/30 border-2 border-amber-500/50 hover:border-amber-400 transition-all group flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    {/* Arte Visual del Sobre Sellado */}
                    <div className="relative h-44 rounded-2xl bg-gradient-to-br from-amber-500/20 via-indigo-950 to-slate-950 border border-amber-400/40 flex flex-col items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.28),transparent_70%)] group-hover:scale-125 transition-transform duration-500" />
                      {/* Empaque 3D Simulado */}
                      <div className="relative w-28 h-36 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-600 to-amber-900 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:-translate-y-1 group-hover:rotate-2 transition-all duration-300">
                        <div className="w-full h-full rounded-[10px] bg-slate-950/90 flex flex-col items-center justify-between p-2 border border-amber-300/60">
                          <span className="text-[7px] font-black tracking-widest uppercase text-amber-300 border-b border-amber-500/40 w-full text-center pb-0.5">
                            EDICIÓN PRIMERA FILA
                          </span>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/60">
                            <Sparkles className="w-6 h-6 text-slate-950" />
                          </div>
                          <span className="text-[8px] font-black text-white text-center leading-tight">
                            TORNEO DE SABERES
                          </span>
                          <span className="text-[7px] font-bold text-amber-400">★ HOLOGRÁFICO ★</span>
                        </div>
                      </div>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[9px] font-black text-amber-300">
                        1 Carta Foil + 5 ⚡
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-amber-300">Sobre Legendario de Ciencias y Matemáticas</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Invoca un sobre sellado con animación de corte dimensional. Incluye inspección previa de tu carta holográfica narrada en 1ª persona y <strong className="text-amber-300">+5 Cristales de Maná</strong>.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activeStudent.gems < 150) {
                        gamificationAudio.playErrorSound();
                        showToast("Necesitas 150 Gemas para invocar este sobre.");
                        return;
                      }
                      gamificationAudio.playCoinSound();
                      gamificationAudio.playMagicCastSound();
                      const randomCard = THINKER_CARDS[Math.floor(Math.random() * THINKER_CARDS.length)];
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, gems: s.gems - 150 } : s));
                      setPulledCard(randomCard);
                      setPackBonusMana(5);
                      setPackTypeLabel('Sobre Legendario de Ciencias y Matemáticas');
                      setPackOpeningStage('sealed_pack');
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Abrir Sobre (150 Gemas)</span>
                  </button>
                </div>

                {/* SOBRE 2: COFRE IMPERIAL DE CRISTALES Y SABIDURÍA */}
                <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/30 border-2 border-purple-500/50 hover:border-purple-400 transition-all group flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    {/* Arte Visual del Cofre Sellado */}
                    <div className="relative h-44 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-950 to-slate-950 border border-purple-400/40 flex flex-col items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3),transparent_70%)] group-hover:scale-125 transition-transform duration-500" />
                      {/* Empaque 3D Simulado */}
                      <div className="relative w-28 h-36 rounded-xl bg-gradient-to-br from-purple-400 via-fuchsia-600 to-indigo-900 p-0.5 shadow-[0_0_30px_rgba(168,85,247,0.55)] group-hover:-translate-y-1 group-hover:-rotate-2 transition-all duration-300">
                        <div className="w-full h-full rounded-[10px] bg-slate-950/90 flex flex-col items-center justify-between p-2 border border-purple-300/60">
                          <span className="text-[7px] font-black tracking-widest uppercase text-purple-300 border-b border-purple-500/40 w-full text-center pb-0.5">
                            EDICIÓN SUPREMA
                          </span>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center shadow-lg border border-white/60">
                            <Zap className="w-6 h-6 text-slate-950" />
                          </div>
                          <span className="text-[8px] font-black text-white text-center leading-tight">
                            COFRE ARCANO
                          </span>
                          <span className="text-[7px] font-bold text-cyan-300">★★ ULTRA RARO ★★</span>
                        </div>
                      </div>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/50 text-[9px] font-black text-purple-300">
                        Legendaria + 10 ⚡
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-purple-300">Cofre de Cristales de Sabiduría</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Garantiza una carta de rango <strong className="text-purple-300">Legendaria</strong> con revelación prismática de alto impacto y recarga <strong className="text-cyan-300">+10 Cristales de Maná</strong>.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activeStudent.gems < 200) {
                        gamificationAudio.playErrorSound();
                        showToast("Necesitas 200 Gemas para invocar este cofre.");
                        return;
                      }
                      gamificationAudio.playCoinSound();
                      gamificationAudio.playMagicCastSound();
                      const legendaryPool = THINKER_CARDS.filter(c => c.rarity === 'Legendaria');
                      const chosenCard = legendaryPool[Math.floor(Math.random() * legendaryPool.length)] || THINKER_CARDS[0];
                      setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, gems: s.gems - 200 } : s));
                      setPulledCard(chosenCard);
                      setPackBonusMana(10);
                      setPackTypeLabel('Cofre Supremo de Cristales y Sabiduría');
                      setPackOpeningStage('sealed_pack');
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Adquirir Cofre (200 Gemas)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODO 2: CEREMONIA CINEMÁTICA DE APERTURA DE SOBRE TCG (3 FASES + INSPECCIÓN) */}
          {/* ========================================================================= */}
          {packOpeningStage !== 'idle' && pulledCard && (
            <div className="relative w-full max-w-4xl min-h-[560px] rounded-[40px] overflow-hidden shadow-[0_0_90px_rgba(245,158,11,0.4)] border-4 border-amber-400/80 bg-slate-950 p-6 sm:p-8 flex flex-col items-center justify-between text-white select-none">
              
              {/* Fondo Cósmico de Invocación con Halos de Luz */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,rgba(99,102,241,0.15)_45%,transparent_70%)] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(251,191,36,0.06)_0%,transparent_40%,rgba(56,189,248,0.08)_100%)]" />
              </div>

              {/* Cabecera de la Ceremonia */}
              <div className="relative z-20 w-full flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    ⚡ Invocación Dimensional TCG
                  </span>
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                    {packTypeLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-black text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/30">
                  <span>Paso {packOpeningStage === 'sealed_pack' ? '1/3 · Cortar Sello' : packOpeningStage === 'slashing' ? '2/3 · Desgarro Astral' : packOpeningStage === 'card_back' ? '2/3 · Revelar Dorso' : '3/3 · Inspección de Carta'}</span>
                </div>
              </div>

              {/* FASE 1 Y 2: EL SOBRE SELLADO + CORTE LÁSER DE APERTURA */}
              {(packOpeningStage === 'sealed_pack' || packOpeningStage === 'slashing') && (
                <div className="relative z-20 flex flex-col items-center justify-center my-auto py-6 space-y-6">
                  
                  <div className="text-center space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-300 animate-pulse block">
                      {packOpeningStage === 'sealed_pack' ? '¡ENERGÍA LEGENDARIA DETECTADA EN EL SOBRE!' : '¡DESGARRANDO SELLO DIMENSIONAL!'}
                    </span>
                    <h4 className="text-lg sm:text-2xl font-black text-white">
                      {packOpeningStage === 'sealed_pack' ? 'Haz clic sobre el sobre para rasgar el sello luminoso' : 'Liberando reliquia histórica...'}
                    </h4>
                  </div>

                  {/* Contenedor 3D del Sobre Sellado */}
                  <div
                    onClick={() => {
                      if (packOpeningStage !== 'sealed_pack') return;
                      gamificationAudio.playMagicCastSound();
                      setPackOpeningStage('slashing');
                      setTimeout(() => {
                        gamificationAudio.playCoinSound();
                        setPackOpeningStage('card_back');
                      }, 850);
                    }}
                    className={`relative w-64 h-88 sm:w-72 sm:h-96 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center ${
                      packOpeningStage === 'slashing'
                        ? 'scale-125 rotate-3 brightness-150'
                        : 'hover:scale-105 hover:-translate-y-2'
                    }`}
                  >
                    {/* Aura Exterior Giratoria */}
                    <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 opacity-75 blur-xl animate-pulse" />

                    {/* Línea de Corte Superior (Destello de Espada/Láser) */}
                    <div className={`absolute top-7 -left-8 -right-8 z-30 flex items-center justify-center transition-all duration-300 ${
                      packOpeningStage === 'slashing' ? 'scale-x-150 opacity-100' : 'opacity-90'
                    }`}>
                      <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_#22d3ee]" />
                      <span className="absolute px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black uppercase tracking-widest shadow-lg">
                        ✂️ CORTAR AQUÍ
                      </span>
                    </div>

                    {/* Rayo Diagonal de Apertura cuando está en 'slashing' */}
                    {packOpeningStage === 'slashing' && (
                      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                        <div className="w-[140%] h-3 bg-white shadow-[0_0_50px_#fbbf24,0_0_90px_#38bdf8] -rotate-12 animate-ping" />
                      </div>
                    )}

                    {/* Cuerpo Metálico del Sobre */}
                    <div className="relative z-10 w-full h-full rounded-[28px] bg-gradient-to-br from-amber-300 via-amber-600 to-indigo-950 p-1 shadow-[0_0_50px_rgba(245,158,11,0.6)] border-2 border-amber-200 flex flex-col justify-between overflow-hidden">
                      <div className="w-full h-full rounded-[24px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-5 flex flex-col items-center justify-between border border-amber-400/50 relative overflow-hidden">
                        
                        {/* Textura Foil Diagonal */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)]" />

                        <div className="relative z-10 text-center w-full border-b border-amber-500/30 pb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
                            COLECCIÓN OFICIAL NEM · FASE 5
                          </span>
                          <strong className="text-xs font-black text-white">SOBRE DE CAMPEONES</strong>
                        </div>

                        {/* Emblema Central del Sobre */}
                        <div className="relative z-10 my-2 w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-1 shadow-[0_0_35px_rgba(251,191,36,0.7)] flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-2 border-amber-200">
                            <Sparkles className="w-10 h-10 text-amber-400 animate-spin" />
                            <span className="text-[9px] font-black text-amber-200 mt-1">FOIL 100%</span>
                          </div>
                        </div>

                        <div className="relative z-10 text-center space-y-1">
                          <div className="text-amber-300 text-xs font-black tracking-widest">★★★★★</div>
                          <span className="text-sm font-black text-white block">TORNEO DE SABERES</span>
                          <span className="text-[10px] font-bold text-cyan-300 block">
                            1 Carta de Pensador + {packBonusMana} Cristales ⚡
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (packOpeningStage !== 'sealed_pack') return;
                      gamificationAudio.playMagicCastSound();
                      setPackOpeningStage('slashing');
                      setTimeout(() => {
                        gamificationAudio.playCoinSound();
                        setPackOpeningStage('card_back');
                      }, 850);
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Rasgar Sobre y Descubrir Carta</span>
                  </button>
                </div>
              )}

              {/* FASE 3: CARTA BOCA ABAJO CON AURA DE RAREZA ('card_back') */}
              {packOpeningStage === 'card_back' && (
                <div className="relative z-20 flex flex-col items-center justify-center my-auto py-6 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-300 animate-bounce block">
                      ✨ ¡RESPLANDOR {pulledCard.rarity.toUpperCase()} DETECTADO! ✨
                    </span>
                    <h4 className="text-lg sm:text-2xl font-black text-white">
                      Toca el dorso holográfico para voltear y revelar tu carta
                    </h4>
                  </div>

                  {/* Dorso de la Carta Flotante */}
                  <div
                    onClick={() => {
                      gamificationAudio.playVictorySound();
                      gamificationAudio.playLevelUpSound();
                      triggerConfetti();
                      setPackOpeningStage('card_revealed');
                      speakText(`¡Carta ${pulledCard.rarity} revelada! ${pulledCard.name}. ${pulledCard.voiceQuote}`);
                    }}
                    className="relative w-64 aspect-[2/3] cursor-pointer group transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  >
                    {/* Resplandor según rareza */}
                    <div className={`absolute -inset-5 rounded-[32px] blur-2xl animate-pulse ${
                      pulledCard.rarity === 'Legendaria'
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400 opacity-90'
                        : 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 opacity-85'
                    }`} />

                    {/* Dorso Institucional del Torneo de Saberes */}
                    <div className="relative z-10 w-full h-full rounded-[26px] bg-gradient-to-br from-amber-300 via-indigo-500 to-amber-500 p-1.5 shadow-2xl border-2 border-white/80">
                      <div className="w-full h-full rounded-[20px] bg-slate-950 flex flex-col items-center justify-between p-5 border-2 border-amber-400/60 relative overflow-hidden">
                        {/* Círculo Arcano Geométrico */}
                        <div className="w-full flex justify-between text-amber-300/80 text-xs font-black">
                          <span>✦</span>
                          <span>✦</span>
                        </div>

                        <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-amber-400/70 flex items-center justify-center group-hover:rotate-45 transition-transform duration-700">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 via-purple-700 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.8)] border border-white/50">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                            REVERSO HOLOGRÁFICO
                          </span>
                          <span className="text-xs font-bold text-slate-300 block">
                            Haz clic para girar 360°
                          </span>
                        </div>

                        <div className="w-full flex justify-between text-amber-300/80 text-xs font-black">
                          <span>✦</span>
                          <span>✦</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      gamificationAudio.playVictorySound();
                      gamificationAudio.playLevelUpSound();
                      triggerConfetti();
                      setPackOpeningStage('card_revealed');
                      speakText(`¡Carta ${pulledCard.rarity} revelada! ${pulledCard.name}. ${pulledCard.voiceQuote}`);
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 hover:from-cyan-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Voltear y Revelar Carta Ahora</span>
                  </button>
                </div>
              )}

              {/* FASE 4: REVELACIÓN GRÁFICA DE LA CARTA + INSPECCIÓN PREVIA A INTEGRAR ('card_revealed') */}
              {packOpeningStage === 'card_revealed' && (
                <div className="relative z-20 w-full my-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in zoom-in-95 duration-300">
                  
                  {/* COLUMNA IZQUIERDA (LG: 5): LA CARTA TCG EN FORMATO ULTRA GRÁFICO HOLOGRÁFICO */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center">
                    <div className="relative w-64 sm:w-72 aspect-[2/3] rounded-[28px] p-1.5 bg-gradient-to-br from-amber-300 via-yellow-500 to-indigo-600 shadow-[0_0_60px_rgba(251,191,36,0.55)] border-2 border-white transition-transform duration-300 hover:scale-105 group">
                      
                      {/* Marco Interno Estilo Juego de Duelos */}
                      <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex flex-col justify-between border border-amber-300/60">
                        
                        {/* Imagen Full-Art del Sabio */}
                        <img
                          src={pulledCard.image}
                          alt={pulledCard.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Brillo Foil Prismático sobre la carta */}
                        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.22)_48%,rgba(251,191,36,0.25)_52%,rgba(255,255,255,0)_70%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60 pointer-events-none" />

                        {/* Barra Superior de la Carta: Nombre, Rareza y Coste de Maná */}
                        <div className="relative z-10 p-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-amber-400/40">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
                              ★ {pulledCard.rarity.toUpperCase()} FOIL ★
                            </span>
                            <h4 className="text-sm font-black text-white leading-tight">{pulledCard.name}</h4>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md border border-white/60" title="Coste de Maná">
                            {pulledCard.costMana}⚡
                          </div>
                        </div>

                        {/* Estrellas de Nivel en la Parte Media-Alta */}
                        <div className="relative z-10 px-3 py-1 flex justify-end gap-0.5 text-amber-400 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>

                        {/* Caja Inferior de Efecto y Estadísticas de Duelo */}
                        <div className="relative z-10 m-2.5 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-amber-400/50 space-y-2 shadow-xl">
                          <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider border-b border-slate-800 pb-1">
                            [Sabio Histórico / Efecto Curricular]
                          </div>
                          <p className="text-[11px] text-slate-200 font-medium leading-snug">
                            {pulledCard.discovery}
                          </p>
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-black">
                            <span className="text-rose-400">ATK / {pulledCard.blueStat * 300}</span>
                            <span className="text-cyan-400">CIENCIA / {pulledCard.greenStat * 300}</span>
                            <span className="text-emerald-400">DEF / {pulledCard.hp * 300}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA (LG: 7): PANEL DE INSPECCIÓN ANTES DE INTEGRAR AL MAZO */}
                  <div className="lg:col-span-7 space-y-4 bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-amber-500/40 shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase">
                          Inspección Previa a la Integración
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                          {pulledCard.name}
                        </h3>
                        <p className="text-xs text-cyan-300 font-bold">
                          Aportación: {pulledCard.discovery}
                        </p>
                      </div>

                      <button
                        onClick={() => speakText(pulledCard.voiceQuote)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Escuchar al Sabio</span>
                      </button>
                    </div>

                    {/* Cita en Primera Persona Estricta */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                        Voz Inviolable en Primera Persona (Audio Activo):
                      </span>
                      <p className="text-xs sm:text-sm text-indigo-100 italic leading-relaxed">
                        "{pulledCard.voiceQuote}"
                      </p>
                    </div>

                    {/* Desglose de Atributos y Bonificación del Sobre */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Coste Maná</span>
                        <strong className="text-sm font-black text-cyan-300">{pulledCard.costMana} ⚡</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Ataque Lógico</span>
                        <strong className="text-sm font-black text-rose-400">{pulledCard.blueStat} ⚔️</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Resistencia</span>
                        <strong className="text-sm font-black text-emerald-400">{pulledCard.hp} 🛡️</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                        <span className="text-[10px] text-amber-300 block">Bono de Sobre</span>
                        <strong className="text-sm font-black text-amber-300">+{packBonusMana} Cristales</strong>
                      </div>
                    </div>

                    {/* Botones de Acción: Integrar al Álbum/Mazo o Abrir Otro Sobre */}
                    <div className="pt-2 space-y-2.5">
                      <button
                        onClick={() => {
                          gamificationAudio.playVictorySound();
                          setStudents(prev => prev.map(s => {
                            if (s.id !== activeStudent.id) return s;
                            const updatedInventory = s.inventoryCards.includes(pulledCard.id)
                              ? s.inventoryCards
                              : [...s.inventoryCards, pulledCard.id];
                            return {
                              ...s,
                              manaCrystals: s.manaCrystals + packBonusMana,
                              totalCards: s.totalCards + 1,
                              inventoryCards: updatedInventory
                            };
                          }));
                          if (!equippedDeckIds.includes(pulledCard.id) && equippedDeckIds.length < 4) {
                            setEquippedDeckIds(prev => [...prev, pulledCard.id]);
                          }
                          showToast(`¡Carta de ${pulledCard.name} y +${packBonusMana} Cristales integrados a tu Álbum y Mazo! 🃏✨`);
                          setPackOpeningStage('idle');
                          setPulledCard(null);
                          setActiveModal('none');
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Integrar Carta al Álbum y Mazo Activo (+{packBonusMana} Cristales)</span>
                      </button>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            // Primero integramos la carta actual
                            setStudents(prev => prev.map(s => {
                              if (s.id !== activeStudent.id) return s;
                              const updatedInventory = s.inventoryCards.includes(pulledCard.id)
                                ? s.inventoryCards
                                : [...s.inventoryCards, pulledCard.id];
                              return {
                                ...s,
                                manaCrystals: s.manaCrystals + packBonusMana,
                                totalCards: s.totalCards + 1,
                                inventoryCards: updatedInventory
                              };
                            }));
                            gamificationAudio.playCoinSound();
                            showToast(`¡${pulledCard.name} guardada en el Álbum! Selecciona otro sobre.`);
                            setPackOpeningStage('idle');
                            setPulledCard(null);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Guardar y Volver a la Tienda de Sobres</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PANTALLA 4: ESTUDIO DOCENTE CREADOR DE CARTAS TCG */}
      {/* ========================================================================= */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl border-4 border-purple-500 bg-slate-950 flex flex-col justify-between max-h-[96vh] overflow-y-auto">
            
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="bg-slate-950/90 px-4 py-1 rounded-full border border-purple-500 text-xs font-black text-purple-300">
                🎓 Estudio Docente Creador de Cartas TCG · Bóveda Curricular ISkool
              </div>
              <button onClick={() => setActiveModal('none')} className="p-2 rounded-full bg-white text-slate-800 shadow-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <img src="/redisenos_assets/torneo_tcg/torneo_teacher_studio.jpg" alt="Estudio Docente Creador de Cartas" className="w-full h-full object-cover" />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-purple-300 mb-1">
                    Personaje Histórico / PDA para Forjar Nueva Carta en 1ª Persona:
                  </label>
                  <input
                    type="text"
                    value={teacherCardPrompt}
                    onChange={(e) => setTeacherCardPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/40 text-xs text-white font-bold"
                  />
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playLevelUpSound();
                    setTeacherCardSaved(true);
                    speakText("Nueva carta histórica en primera persona sincronizada en la Bóveda Curricular.");
                    showToast("¡Carta forjada y guardada en Bóveda Curricular!");
                  }}
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md"
                >
                  🃏 Forjar Carta en Bóveda
                </button>
              </div>
              {teacherCardSaved && (
                <div className="text-xs text-emerald-400 font-bold">
                  ✅ Carta persistida en <code>planeaciones/primaria_alta/torneo_saberes_tcg.md</code> con voz en 1ª persona.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
