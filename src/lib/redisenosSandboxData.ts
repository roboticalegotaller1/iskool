// src/lib/redisenosSandboxData.ts
// Datos mock, semillas y estructuras aisladas para la suite de rediseños gamificados de ISkool
// Totalmente desacoplado de la base de datos de producción; seguro y de fácil eliminación.

export function formatCoins(amount: number): string {
  if (typeof amount !== 'number') return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  levelTitle: string;
  grade: string;
  subLevel: 'preescolar' | 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria';
  avatarImage: string;
  coins: number;
  stars: number;
  xp: number;
  maxXp: number;
  streakDays: number;
  clanName?: string;
  equippedItems: {
    outfit?: string;
    companion?: string;
    accessory?: string;
    badge?: string;
  };
  stats: {
    tasksCompleted: number;
    accuracyRate: number;
    hoursLearned: number;
  };
}

export interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  subject: string;
  redesignKey: string;
  schoolCct: string;
  avatar: string;
  activeStudentsCount: number;
  tasksAssignedCount: number;
}

export interface InteractiveTask {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  pdaCode: string;
  pdaDescription: string;
  question: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
  rewardCoins: number;
  rewardXp: number;
  rewardStars: number;
  completed: boolean;
  gameEngineStyle: 'tactile_voice' | 'rpg_turn_combat' | 'tcg_cards' | 'cyber_esports' | 'latex_terminal';
}

export interface BossEnemy {
  id: string;
  name: string;
  title: string;
  image: string;
  maxHp: number;
  currentHp: number;
  affinity: string;
  abilities: string[];
  weakness: string;
  rewardCoins: number;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'companions' | 'outfits' | 'powerups' | 'badges';
  price: number;
  icon: string;
  description: string;
  ageTier: 'all' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria';
  badgeLabel?: string;
}

// 1. Datos del Colegio Montessori del Valle (Imagen 1 del Usuario)
export const COLEGIO_MONTESSORI_METRICS = {
  id: 'montessori-valle',
  name: 'Colegio Montessori del Valle',
  slogan: 'Educación Viva, Creativa y con Sentido Humano',
  cct: '09PPR8800M',
  address: 'Av. Universidad 1200, Col. Del Valle, CDMX',
  director: 'Dirección General Montessori',
  planteles: 2,
  alumnosReales: 3, // Enlazados a la vista CEO
  docentesReales: 20, // 2 por cada uno de los 10 rediseños
  tokensIaConsumidos: '42.8k',
  saludAcademica: '98.4%',
  cfdiColegiaturasAlDia: '100%'
};

// 2. Tres Perfiles de Alumnos Reales
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-mateo',
    name: 'Mateo Hernández',
    age: 7,
    grade: '1º de Primaria',
    levelTitle: 'Nivel 8: Guardián del Fuego',
    subLevel: 'primaria_baja',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    coins: 5430,
    stars: 85,
    xp: 850,
    maxXp: 1000,
    streakDays: 14,
    clanName: 'Escuadrón Chispitas',
    equippedItems: {
      outfit: 'Capa de Fuego Carmesí',
      companion: 'Mascota Fénix Acompañante',
      accessory: 'Báculo de Sabiduría Elemental',
      badge: '¡Maestro de Ciencias!'
    },
    stats: {
      tasksCompleted: 42,
      accuracyRate: 94,
      hoursLearned: 38
    }
  },
  {
    id: 'student-sofia',
    name: 'Sofía Morales',
    age: 13,
    grade: '2º de Secundaria',
    levelTitle: 'Nivel 28: Rango Diamante',
    subLevel: 'secundaria',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    coins: 1450,
    stars: 120,
    xp: 2840,
    maxXp: 3000,
    streakDays: 32,
    clanName: 'Clan Phoenix',
    equippedItems: {
      outfit: 'Chamarra Neo-Estilo (Racha 30 días)',
      accessory: 'Gafas Hologen (100 PDA Completados)',
      companion: 'Baby Robot Asistente',
      badge: 'Coding Expert Badge'
    },
    stats: {
      tasksCompleted: 89,
      accuracyRate: 96,
      hoursLearned: 74
    }
  },
  {
    id: 'student-rodrigo',
    name: 'Rodrigo Fuentes',
    age: 17,
    grade: '3º de Preparatoria (Senior)',
    levelTitle: 'Nivel 42: Fellow Investigador',
    subLevel: 'preparatoria',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    coins: 8200,
    stars: 210,
    xp: 6850,
    maxXp: 7000,
    streakDays: 124,
    clanName: 'Nexus Tech Guild',
    equippedItems: {
      outfit: 'Executive Blazer & Smart Goggles',
      accessory: 'Terminal Crypto Key',
      companion: 'Drone de Análisis Cuántico',
      badge: 'Ceneval Gold Medalist'
    },
    stats: {
      tasksCompleted: 156,
      accuracyRate: 98,
      hoursLearned: 142
    }
  }
];

// 3. Catálogo de Tienda Gamificada Real
export const STORE_CATALOG: StoreItem[] = [
  // Mascotas
  {
    id: 'item-phoenix',
    name: 'Phoenix Chick',
    category: 'companions',
    price: 500,
    icon: '🔥',
    description: 'Polluelo fénix que vuela junto a tu avatar y otorga un +5% de bonus en multiplicador de racha.',
    ageTier: 'all',
    badgeLabel: 'Mascota Mágica'
  },
  {
    id: 'item-baby-robot',
    name: 'Baby Robot Asistente',
    category: 'companions',
    price: 450,
    icon: '🤖',
    description: 'Compañero mecatrónico que emite luces LED según tu precisión en cálculo y ciencias.',
    ageTier: 'secundaria',
    badgeLabel: 'Tech Companion'
  },
  {
    id: 'item-clay-panda',
    name: 'Clay Panda Suavecito',
    category: 'companions',
    price: 400,
    icon: '🐼',
    description: 'Pandita de plastilina táctil que aplaude alegremente cuando resuelves tareas preescolares.',
    ageTier: 'preescolar',
    badgeLabel: 'Amiguito de Peluche'
  },

  // Atuendos
  {
    id: 'item-flame-cloak',
    name: 'Capa de Fuego Elemental',
    category: 'outfits',
    price: 750,
    icon: '🧣',
    description: 'Tejida con flamas místicas de aprendizaje. Resalta tu rango en las batallas de primaria.',
    ageTier: 'primaria',
    badgeLabel: 'Legendario'
  },
  {
    id: 'item-cyber-jacket',
    name: 'Chamarra Cyber Anime Streetwear',
    category: 'outfits',
    price: 650,
    icon: '🧥',
    description: 'Chamarra neo-Tokyo con ribetes luminosos y emblema del clan bordado con fibra óptica.',
    ageTier: 'secundaria',
    badgeLabel: 'Épico 3D'
  },
  {
    id: 'item-lab-coat',
    name: 'Bata de Laboratorio con Pines de Oro',
    category: 'outfits',
    price: 550,
    icon: '🥼',
    description: 'Bata formal de investigador con pines conmemorativos de ferias de ciencias internacionales.',
    ageTier: 'preparatoria',
    badgeLabel: 'STEM Pro'
  },

  // Pociones y Potenciadores
  {
    id: 'item-hourglass',
    name: 'Reloj de Arena de Sabiduría',
    category: 'powerups',
    price: 300,
    icon: '⏳',
    description: 'Otorga +15 segundos adicionales en preguntas de alta complejidad o exámenes cronometrados.',
    ageTier: 'all',
    badgeLabel: 'Utilidad Táctica'
  },
  {
    id: 'item-logic-potion',
    name: 'Poción de Lógica y Maná',
    category: 'powerups',
    price: 250,
    icon: '🧪',
    description: 'Restaura instantáneamente 50 puntos de energía para continuar resolviendo expediciones.',
    ageTier: 'all',
    badgeLabel: 'Poción Mágica'
  },
  {
    id: 'item-streak-shield',
    name: 'Escudo Protector de Racha',
    category: 'powerups',
    price: 200,
    icon: '🛡️',
    description: 'Protege tu racha de días consecutivos si un día no puedes conectarte por causas de fuerza mayor.',
    ageTier: 'all',
    badgeLabel: 'Salva-Racha'
  },

  // Insignias Holográficas
  {
    id: 'item-badge-scholar',
    name: 'Medalla de Maestro de Saberes',
    category: 'badges',
    price: 1000,
    icon: '🏅',
    description: 'Distintivo dorado que certifica excelencia académica integral en el Colegio Montessori.',
    ageTier: 'all',
    badgeLabel: 'Honor Máximo'
  },
  {
    id: 'item-badge-coding',
    name: 'Insignia de Experto en Algoritmia',
    category: 'badges',
    price: 900,
    icon: '💻',
    description: 'Acredita dominio de estructuras de pensamiento computacional y robótica educativa.',
    ageTier: 'secundaria',
    badgeLabel: 'Tecnología'
  },
  {
    id: 'item-badge-team',
    name: 'Distintivo de Líder Colaborativo',
    category: 'badges',
    price: 800,
    icon: '🤝',
    description: 'Reconocimiento otorgado por profesores y pares por liderazgo positivo y apoyo mutuo.',
    ageTier: 'all',
    badgeLabel: 'Valores NEM'
  }
];

// 4. Jefes Enemigos para las Batallas Didácticas
export const BOSS_ENEMIES: BossEnemy[] = [
  {
    id: 'boss-golem',
    name: 'Silvanus, The Forest Golem',
    title: 'Guardián del Robledal Ancestral (Fantasía & Primaria)',
    image: '/redisenos_assets/enemy_forest_golem_boss_1792738753735.jpg',
    maxHp: 80,
    currentHp: 80,
    affinity: 'Naturaleza / Luz Arcana',
    abilities: ['Golpe de Raíz', 'Escudo de Cuarzo', 'Torbellino de Hojas'],
    weakness: 'Cálculo Aritmético Rápido y Ortografía',
    rewardCoins: 250
  },
  {
    id: 'boss-cyber-dragon',
    name: 'Nexus Void Drake',
    title: 'El Dragón Glitch del Abismo Digital (Cyber & Secundaria/Prepa)',
    image: '/redisenos_assets/enemy_cyber_glitch_dragon_1792738786143.jpg',
    maxHp: 150,
    currentHp: 150,
    affinity: 'Ciber Fuego / Datos Corruptos',
    abilities: ['Static Barrage', 'Void Overload', 'Ciber Garra Glitch'],
    weakness: 'Pensamiento Crítico, Ecuaciones y Análisis de Fuentes',
    rewardCoins: 400
  }
];

// 5. Cinco Tareas Interactivas Reales con Vinculación Curricular
export const INTERACTIVE_TASKS: InteractiveTask[] = [
  {
    id: 'task-math-div',
    title: 'El Hechizo de la División',
    subject: 'Pensamiento Matemático',
    gradeLevel: '1º y 2º Primaria (Fase 3)',
    pdaCode: 'PDA-MAT.3.2',
    pdaDescription: 'Resuelve situaciones problemáticas vinculadas a su contexto que implican divisiones con números naturales.',
    question: '¡Resuelve el hechizo elemental! ¿Cuál es el resultado de 24 ÷ 4?',
    options: [
      { id: 'opt-1', label: '4', isCorrect: false },
      { id: 'opt-2', label: '6', isCorrect: true },
      { id: 'opt-3', label: '8', isCorrect: false },
      { id: 'opt-4', label: '12', isCorrect: false }
    ],
    explanation: '¡Exacto! 4 multiplicado por 6 da 24. El hechizo impacta al Golem con luz elemental.',
    rewardCoins: 120,
    rewardXp: 80,
    rewardStars: 3,
    completed: false,
    gameEngineStyle: 'rpg_turn_combat'
  },
  {
    id: 'task-history-rev',
    title: 'La Aurora Revolucionaria Mexicana',
    subject: 'Historia y Ética',
    gradeLevel: '2º de Secundaria (Fase 6)',
    pdaCode: 'PDA-HIST.6.1',
    pdaDescription: 'Analiza los antecedentes, causas y etapas del movimiento revolucionario de 1910.',
    question: '¿En qué año comenzó formalmente la Revolución Mexicana convocada por Francisco I. Madero?',
    options: [
      { id: 'opt-h1', label: 'A. 1810', isCorrect: false },
      { id: 'opt-h2', label: 'B. 1910', isCorrect: true },
      { id: 'opt-h3', label: 'C. 1857', isCorrect: false },
      { id: 'opt-h4', label: 'D. 1920', isCorrect: false }
    ],
    explanation: 'El 20 de noviembre de 1910 dio inicio el levantamiento armado bajo el Plan de San Luis.',
    rewardCoins: 150,
    rewardXp: 110,
    rewardStars: 4,
    completed: false,
    gameEngineStyle: 'cyber_esports'
  },
  {
    id: 'task-science-grav',
    title: 'Leyes del Cosmos: Newton y la Gravedad',
    subject: 'Ciencias y Física',
    gradeLevel: '5º de Primaria (Fase 5)',
    pdaCode: 'PDA-CN.5.3',
    pdaDescription: 'Comprende el efecto de la fuerza de gravedad en el movimiento de los cuerpos en el Sistema Solar.',
    question: '¿Cuál es la ley que explica por qué los planetas orbitan ordenadamente alrededor del Sol?',
    options: [
      { id: 'opt-s1', label: 'Ley de Gravitación Universal (Isaac Newton)', isCorrect: true },
      { id: 'opt-s2', label: 'Segunda Ley de la Termodinámica', isCorrect: false },
      { id: 'opt-s3', label: 'Teoría Celular de los Organismos', isCorrect: false },
      { id: 'opt-s4', label: 'Principio de Arquímedes', isCorrect: false }
    ],
    explanation: 'La Ley de Gravitación Universal describe la atracción mutua proporcional a las masas.',
    rewardCoins: 140,
    rewardXp: 95,
    rewardStars: 3,
    completed: false,
    gameEngineStyle: 'tcg_cards'
  },
  {
    id: 'task-calc-limit',
    title: 'Límite Fundamental y Cálculo Superior',
    subject: 'Cálculo Diferencial',
    gradeLevel: '3º de Preparatoria (Senior)',
    pdaCode: 'PDA-CALC.PREPA.4',
    pdaDescription: 'Determina límites trigonométricos especiales resolviendo formas indeterminadas 0/0.',
    question: 'Calcular el límite: lim(x->0) [sin(3x) / x]',
    options: [
      { id: 'opt-c1', label: '3', isCorrect: true },
      { id: 'opt-c2', label: '1/3', isCorrect: false },
      { id: 'opt-c3', label: '0', isCorrect: false },
      { id: 'opt-c4', label: '∞', isCorrect: false }
    ],
    explanation: 'Multiplicando y dividiendo por 3: lim [3 * sin(3x)/(3x)] = 3 * 1 = 3.',
    rewardCoins: 200,
    rewardXp: 150,
    rewardStars: 5,
    completed: false,
    gameEngineStyle: 'latex_terminal'
  },
  {
    id: 'task-preschool-fruit',
    title: 'Los Colores y Frutas del Huerto Vivo',
    subject: 'Exploración y Lenguajes',
    gradeLevel: 'Preescolar (Fase 2)',
    pdaCode: 'PDA-PRE.2.1',
    pdaDescription: 'Identifica características visuales, colores primarios y nombres de alimentos saludables.',
    question: 'Toca la pantalla: ¿Cuál de estos alimentos es una fruta roja?',
    options: [
      { id: 'opt-p1', label: 'Manzana Roja Brillante', isCorrect: true },
      { id: 'opt-p2', label: 'Plátano Amarillo', isCorrect: false },
      { id: 'opt-p3', label: 'Dado Azul de Juguete', isCorrect: false }
    ],
    explanation: '¡Bravo! La manzana es roja y deliciosa. El zorrito da una voltereta de felicidad.',
    rewardCoins: 100,
    rewardXp: 60,
    rewardStars: 3,
    completed: false,
    gameEngineStyle: 'tactile_voice'
  }
];

// 6. Dos Profesores Asignados por cada Rediseño al Colegio Montessori del Valle
export const TEACHERS_BY_REDESIGN: TeacherProfile[] = [
  // 01 Preescolar Huellitas
  { id: 't-01a', name: 'Mtra. Jimena Alarcón', role: 'Educadora Titular Preescolar 2', subject: 'Lenguajes y Motricidad', redesignKey: '01', schoolCct: '09PPR8800M', avatar: '👩‍🏫', activeStudentsCount: 18, tasksAssignedCount: 12 },
  { id: 't-01b', name: 'Mtra. Daniela Soto', role: 'Educadora de Música y Sensorial', subject: 'Artes y Expresión', redesignKey: '01', schoolCct: '09PPR8800M', avatar: '👩‍🎨', activeStudentsCount: 18, tasksAssignedCount: 9 },

  // 02 Preescolar Isla Mágica
  { id: 't-02a', name: 'Mtro. Carlos E. Valdés', role: 'Educador de Pensamiento Espacial', subject: 'Saberes y Matemáticas Inicial', redesignKey: '02', schoolCct: '09PPR8800M', avatar: '👨‍🏫', activeStudentsCount: 20, tasksAssignedCount: 14 },
  { id: 't-02b', name: 'Mtra. Laura Peñaloza', role: 'Coordinadora de Desarrollo Infantil', subject: 'Ética y Naturaleza Preescolar', redesignKey: '02', schoolCct: '09PPR8800M', avatar: '👩‍🏫', activeStudentsCount: 20, tasksAssignedCount: 11 },

  // 03 Primaria Baja Guardianes
  { id: 't-03a', name: 'Prof. Roberto Mendoza', role: 'Profesor Titular 1º Primaria', subject: 'Cálculo y Lenguajes', redesignKey: '03', schoolCct: '09PPR8800M', avatar: '🧙‍♂️', activeStudentsCount: 24, tasksAssignedCount: 22 },
  { id: 't-03b', name: 'Profra. Mariana Vega', role: 'Profesora Titular 2º Primaria', subject: 'Ciencias y Convivencia', redesignKey: '03', schoolCct: '09PPR8800M', avatar: '👩‍🔬', activeStudentsCount: 22, tasksAssignedCount: 19 },

  // 04 Primaria Baja Libro de Aventura
  { id: 't-04a', name: 'Mtra. Carmen Solís', role: 'Docente de Fomento a la Lectura', subject: 'Español y Comprensión', redesignKey: '04', schoolCct: '09PPR8800M', avatar: '📖', activeStudentsCount: 25, tasksAssignedCount: 16 },
  { id: 't-04b', name: 'Mtro. Fernando Gil', role: 'Profesor de Habilidades Lógicas', subject: 'Matemáticas y Geometría', redesignKey: '04', schoolCct: '09PPR8800M', avatar: '📐', activeStudentsCount: 25, tasksAssignedCount: 18 },

  // 05 Primaria Alta Crónicas
  { id: 't-05a', name: 'Profra. Andrea Navarrete', role: 'Titular de Proyectos Comunitarios 5º', subject: 'Geografía y Biodiversidad', redesignKey: '05', schoolCct: '09PPR8800M', avatar: '🧭', activeStudentsCount: 26, tasksAssignedCount: 24 },
  { id: 't-05b', name: 'Prof. Luis Miguel Ortiz', role: 'Profesor de Ciencias y Laboratorio', subject: 'Física y Química Inicial', redesignKey: '05', schoolCct: '09PPR8800M', avatar: '🔬', activeStudentsCount: 26, tasksAssignedCount: 21 },

  // 06 Primaria Alta Torneo de Cartas
  { id: 't-06a', name: 'Mtro. Alejandro Téllez', role: 'Especialista en Gamificación 6º', subject: 'Historia y Civismo', redesignKey: '06', schoolCct: '09PPR8800M', avatar: '🃏', activeStudentsCount: 28, tasksAssignedCount: 27 },
  { id: 't-06b', name: 'Mtra. Beatriz Escalante', role: 'Docente de Matemáticas Avanzadas', subject: 'Fracciones y Álgebra Básica', redesignKey: '06', schoolCct: '09PPR8800M', avatar: '🧮', activeStudentsCount: 28, tasksAssignedCount: 25 },

  // 07 Secundaria Gremio Esports
  { id: 't-07a', name: 'Prof. David Guzmán', role: 'Líder de Academia de Esports Educativos', subject: 'Historia de México y Universal', redesignKey: '07', schoolCct: '09PPR8800M', avatar: '🎮', activeStudentsCount: 30, tasksAssignedCount: 32 },
  { id: 't-07b', name: 'Profra. Ximena Paredes', role: 'Docente de Lengua Extranjera', subject: 'Inglés Cambridge B2/C1', redesignKey: '07', schoolCct: '09PPR8800M', avatar: '🗣️', activeStudentsCount: 30, tasksAssignedCount: 28 },

  // 08 Secundaria Metrópolis STEM
  { id: 't-08a', name: 'Ing. Manuel Cárdenas', role: 'Director de Taller STEM y Robótica', subject: 'Física y Mecatrónica', redesignKey: '08', schoolCct: '09PPR8800M', avatar: '⚙️', activeStudentsCount: 28, tasksAssignedCount: 30 },
  { id: 't-08b', name: 'Dra. Patricia Rivas', role: 'Docente de Química y Sostenibilidad', subject: 'Química y Energías Limpias', redesignKey: '08', schoolCct: '09PPR8800M', avatar: '⚗️', activeStudentsCount: 28, tasksAssignedCount: 26 },

  // 09 Preparatoria Venture Studio
  { id: 't-09a', name: 'Lic. Esteban Garza', role: 'Director de Incubadora y Emprendimiento', subject: 'Liderazgo y Modelos de Negocio', redesignKey: '09', schoolCct: '09PPR8800M', avatar: '💼', activeStudentsCount: 32, tasksAssignedCount: 35 },
  { id: 't-09b', name: 'Mtra. Marcela Coronado', role: 'Consejera Pre-Universitaria', subject: 'Portafolios y Ensayos de Admisión', redesignKey: '09', schoolCct: '09PPR8800M', avatar: '🎓', activeStudentsCount: 32, tasksAssignedCount: 31 },

  // 10 Preparatoria Nexus Protocol
  { id: 't-10a', name: 'Dr. Ricardo Monroy', role: 'Catedrático de Matemáticas Superiores', subject: 'Cálculo Multivariable y Lógica', redesignKey: '10', schoolCct: '09PPR8800M', avatar: '🧠', activeStudentsCount: 30, tasksAssignedCount: 38 },
  { id: 't-10b', name: 'Mtra. Elena Villegas', role: 'Investigadora de Inteligencia Artificial', subject: 'Ciencia de Datos y Algoritmia', redesignKey: '10', schoolCct: '09PPR8800M', avatar: '💻', activeStudentsCount: 30, tasksAssignedCount: 34 }
];

// 7. Plan Anual SEP Ciclo Escolar 2026-2027 (Progreso de la NEM)
export const SEP_ANNUAL_PLAN_2026 = [
  { week: 1, dates: '24-28 Ago 2026', title: 'Diagnóstico Integral y Bienvenida', status: 'completed' },
  { week: 2, dates: '31 Ago - 4 Sep 2026', title: 'Comunidad Escolar y Acuerdos de Convivencia', status: 'completed' },
  { week: 3, dates: '7-11 Sep 2026', title: 'Proyectos de Identidad y Patrimonio Patrio', status: 'completed' },
  { week: 4, dates: '14-18 Sep 2026', title: 'La Independencia y la Construcción de la Nación', status: 'completed' },
  { week: 5, dates: '21-25 Sep 2026', title: 'Sistemas del Cuerpo Humano y Salud Integral', status: 'completed' },
  { week: 6, dates: '28 Sep - 2 Oct 2026', title: 'Estructura Atómica y Modelos Moleculares', status: 'completed' },
  { week: 7, dates: '5-9 Oct 2026', title: 'Operaciones Básicas y Fracciones en la Vida Diaria', status: 'completed' },
  { week: 8, dates: '12-16 Oct 2026', title: 'Encuentro de Dos Mundos y Diversidad Lingüística', status: 'completed' },
  { week: 9, dates: '19-23 Oct 2026', title: 'Semana Actual: Evaluación Formativa y Retos Gamificados', status: 'in_progress' },
  { week: 10, dates: '26-30 Oct 2026', title: 'Tradiciones Vivas: Día de Muertos y Memoria', status: 'upcoming' },
  { week: 11, dates: '2-6 Nov 2026', title: 'Geometría del Espacio y Cálculo de Áreas', status: 'upcoming' },
  { week: 12, dates: '9-13 Nov 2026', title: 'Ecosistemas de México y Conservación de Flora', status: 'upcoming' },
  { week: 13, dates: '16-20 Nov 2026', title: 'Revolución Mexicana y Derechos Sociales', status: 'upcoming' }
];

// 8. Definición de los 10 Rediseños
export interface RedesignDetail {
  key: string;
  code: string;
  title: string;
  level: string;
  ages: string;
  tagline: string;
  theme: string;
  hubImage: string;
  quizImage: string;
  avatarImage: string;
  summary: string;
  worldBenchmark: string;
  features: string[];
}

export const REDESIGNS_LIST: RedesignDetail[] = [
  {
    key: '01',
    code: '01preescolar_huellitas',
    title: '01 Preescolar · El Reino de las Huellitas',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    tagline: 'Santuario táctil de plastilina con navegación por voz',
    theme: 'Claymation & Amigos de Felpa',
    hubImage: '/redisenos_assets/gamification_preescolar_huellitas_1792732717441.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',
    summary: 'Diseñado sin necesidad de texto escrito; botones acolchados gigantes y sintetizador de voz natural guían al alumno en el cuidado de su granja de animalitos.',
    worldBenchmark: 'Khan Academy Kids & Toca Boca World',
    features: ['Navegación 100% por voz', 'Pedagogía del error amable sin pérdida de vidas', 'Botones táctiles gigantes con física de plastilina']
  },
  {
    key: '02',
    code: '02preescolar_isla_magica',
    title: '02 Preescolar · La Isla de los Juguetes Mágicos',
    level: 'Preescolar (Fase 2 SEP)',
    ages: '3 a 5 Años',
    tagline: 'Maqueta voxel tridimensional con bloques de construcción espacial',
    theme: 'Voxel 3D & Juguetes Vivientes',
    hubImage: '/redisenos_assets/gamification_preescolar_isla_magica_1792732740102.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preescolar_gameplay_1792734559505.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_preescolar_customizer_1792734577407.jpg',
    summary: 'Cada respuesta correcta otorga un bloque mágico para construir puentes, faros y castillos flotantes que cobran vida en un entorno tridimensional relajante.',
    worldBenchmark: 'LEGO DUPLO World & Nintendo Yoshi Crafted World',
    features: ['Construcción espacial isométrica', 'Compañero mecatrónico de juguete', 'Diploma de explorador automático']
  },
  {
    key: '03',
    code: '03primaria_baja_guardianes',
    title: '03 Primaria Baja · Academia de Guardianes Elementales',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    tagline: 'Saga de rol al estilo Nintendo con mapa Overworld y combate de hechizos',
    theme: 'Aventura RPG Nintendo & Mascotas Evolutivas',
    hubImage: '/redisenos_assets/gamification_primaria_baja_guardianes_1792732757751.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    summary: 'Mapa sinuoso con 4 biomas elementales. El cálculo mental y la lectoescritura activan runas que restan vida al simpático Forest Golem con combos de racha.',
    worldBenchmark: 'Prodigy Math Game & Super Mario RPG',
    features: ['Batalla por turnos didáctica', 'Mascota fénix que evoluciona', 'Cofres de recompensa por racha de estudio']
  },
  {
    key: '04',
    code: '04primaria_baja_libro_aventura',
    title: '04 Primaria Baja · El Libro de Aventuras & Álbum',
    level: '1º a 3º de Primaria (Fases 3 y 4 SEP)',
    ages: '6 a 8 Años',
    tagline: 'Grimorio de pergamino con sobres de estampas holográficas coleccionables',
    theme: 'Grimorio Iluminado & Coleccionismo Panini',
    hubImage: '/redisenos_assets/gamification_primaria_baja_libro_aventura_1792732777656.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_baja_battle_1792734597009.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    summary: 'Cada materia es un capítulo de un libro fantástico. Los aciertos desbloquean sobres de cromos con rarezas que se pegan en un álbum interactivo.',
    worldBenchmark: 'Animal Crossing Museum & Kahoot Kids',
    features: ['Efecto de brillo holográfico WebGL', 'Intercambio de estampas en el aula', 'Avatares de personajes históricos desbloqueables']
  },
  {
    key: '05',
    code: '05primaria_alta_cronicas',
    title: '05 Primaria Alta · Crónicas de Exploradores',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    tagline: 'Archipiélago de hexágonos 3D tipo Catan con niebla de guerra y crafting STEM',
    theme: 'Exploración Táctica & Proyectos Comunitarios',
    hubImage: '/redisenos_assets/gamification_primaria_alta_cronicas_1792732799979.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    summary: 'Estrategia territorial cooperativa. Al resolver preguntas de geografía, ciencias e historia se levanta la niebla y se consiguen recursos para proyectos reales de la NEM.',
    worldBenchmark: 'Classcraft & Catan Boardgame',
    features: ['Cuadrícula hexagonal infinita', 'Construcción de observatorios y laboratorios', 'Misiones de equipo sin rivalidades tóxicas']
  },
  {
    key: '06',
    code: '06primaria_alta_torneo_cartas',
    title: '06 Primaria Alta · Torneo de Saberes & Cartas TCG',
    level: '4º a 6º de Primaria (Fase 5 SEP)',
    ages: '9 a 11 Años',
    tagline: 'Estadio de duelos intelectuales con barajas de conocimiento coleccionables',
    theme: 'Estrategia TCG (Trading Card Game) Curricular',
    hubImage: '/redisenos_assets/gamification_primaria_alta_torneo_cartas_1792732819565.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_primaria_alta_tcg_1792734618682.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_primaria_baja_album_1792734760601.jpg',
    summary: 'Los conceptos aprendidos son cartas con poder de ataque de conocimiento. El alumno invoca a Isaac Newton o las Leyes de la Termodinámica con cristales de maná.',
    worldBenchmark: 'Hearthstone & Magic: The Gathering Didáctico',
    features: ['Constructor de barajas personalizable', 'Combos de sinergia entre ciencias y matemáticas', 'Importación de reactivos desde Google Forms']
  },
  {
    key: '07',
    code: '07secundaria_gremio_esports',
    title: '07 Secundaria · Gremio Cyber-Saga Esports',
    level: '1º a 3º de Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    tagline: 'Arena cyberpunk de Esports con Pase de Batalla de temporada y duelos de clanes',
    theme: 'Synthwave / Cyberpunk & Clanes Escolares',
    hubImage: '/redisenos_assets/gamification_secundaria_gremio_esports_1792732846760.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    summary: 'Adrenalina pura para adolescentes. Duelos de trivia síncronos en pedestales de neón con chat en vivo moderado y personalización anime streetwear por méritos.',
    worldBenchmark: 'Guilded / Discord Académico & Kahoot Live Arena',
    features: ['WebSockets en tiempo real <80ms', 'Pase de batalla con 50 niveles cosméticos', 'Guardarropa techwear sin micropagos reales']
  },
  {
    key: '08',
    code: '08secundaria_metropolis_stem',
    title: '08 Secundaria · Metrópolis de Inventores',
    level: '1º a 3º de Secundaria (Fase 6 SEP)',
    ages: '12 a 14 Años',
    tagline: 'Simulador steampunk donde la resolución de problemas genera energía urbana',
    theme: 'Steampunk Victoriano & Ingeniería STEM',
    hubImage: '/redisenos_assets/gamification_secundaria_metropolis_stem_1792732869540.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_secundaria_cyber_duel_1792734640480.jpg',
    avatarImage: '/redisenos_assets/gamification_avatar_secundaria_customizer_1792734666483.jpg',
    summary: 'Cada circuito resuelto y ecuación equilibrada activa torres Tesla que iluminan los distritos de la ciudad. El Lienzo Digital archiva las patentes inventadas.',
    worldBenchmark: 'SimCityEDU & Brilliant.org',
    features: ['Gestión de energía y recursos urbanos', 'Patentes vinculadas a Google Drive', 'Atuendos de latón y monóculos térmicos']
  },
  {
    key: '09',
    code: '09preparatoria_venture_studio',
    title: '09 Preparatoria · Apex Academy Venture Studio',
    level: '1º a 3º de Preparatoria / Bachillerato',
    ages: '15 a 18 Años',
    tagline: 'Aceleradora de proyectos estilo Silicon Valley con portafolio y código QR',
    theme: 'Executive Dark Mode & Venture Capital Escolar',
    hubImage: '/redisenos_assets/gamification_preparatoria_venture_studio_1792732893154.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    summary: 'Gamificación de élite. Los estudiantes acumulan créditos de investigación, completan sprints y generan un portafolio profesional con radar de habilidades para universidades.',
    worldBenchmark: 'Linear, Vercel & GitHub Education',
    features: ['Predictor de admisión UNAM/Tec en tiempo real', 'Demostraciones formales en LaTeX', 'Credenciales criptográficas verificables con QR']
  },
  {
    key: '10',
    code: '10preparatoria_nexus_protocol',
    title: '10 Preparatoria · Nexus Protocol Research Guild',
    level: '1º a 3º de Preparatoria / Bachillerato',
    ages: '15 a 18 Años',
    tagline: 'Terminal minimalista de alta ingeniería con grafos de constelación de maestría',
    theme: 'Minimalismo OLED & Deep Tech Research',
    hubImage: '/redisenos_assets/gamification_preparatoria_nexus_protocol_1792732922568.jpg',
    quizImage: '/redisenos_assets/gamification_quiz_preparatoria_mastery_1792734699863.jpg',
    avatarImage: '/redisenos_assets/gamification_preparatoria_portfolio_radar_1792734730504.jpg',
    summary: 'Árboles de maestría donde el conocimiento no se mide con números sino con dominio demostrado. Incluye revisión por pares y terminal interactiva de comandos.',
    worldBenchmark: 'Roam Research, LeetCode & Kaggle',
    features: ['Grafos curriculares de fuerza dirigida', 'Revisión por pares con reputación académica', 'Integración nativa con Google Colab y Drive']
  }
];
