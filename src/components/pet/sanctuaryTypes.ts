export type HouseThemeId = 
  | 'forest_cabin'
  | 'cosmic_observatory'
  | 'ice_temple'
  | 'magma_forge'
  | 'coral_sanctuary';

export type FurnitureCategory = 
  | 'bed' 
  | 'food' 
  | 'toy' 
  | 'lighting' 
  | 'decor' 
  | 'wall';

export interface HouseThemeConfig {
  id: HouseThemeId;
  name: string;
  subtitle: string;
  description: string;
  badgeEmoji: string;
  accentColor: string;
  bgGradient: string;
  floorColor: string;
  wallColor: string;
  ambientParticles: 'fireflies' | 'stardust' | 'snowflakes' | 'embers' | 'bubbles';
  windowView: string;
  bgDetails: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  price: number;
  description: string;
  iconEmoji: string;
  tier: number; // 1 to 10 for beds, 1 to 5 for others
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'celestial';
  energyBonus?: number;
  happinessBonus?: number;
  hungerBonus?: number;
  interactivity: 'sleep' | 'eat' | 'play' | 'light' | 'gaze' | 'music' | 'honor';
}

export interface SanctuarySlotConfig {
  id: number; // 1 to 32
  zone: 'bedroom' | 'play' | 'dining' | 'living' | 'wall';
  label: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  zIndex: number;
  allowedCategories: FurnitureCategory[];
  slotScale?: number;
}

// 5 Casas Temáticas Seleccionables
export const SANCTUARY_HOUSES: Record<HouseThemeId, HouseThemeConfig> = {
  forest_cabin: {
    id: 'forest_cabin',
    name: 'Cabaña Silvestre Boreal',
    subtitle: 'Refugio de Madera y Bosque Encantado',
    description: 'Paredes de roble milenario, calidez hogareña y ventanal con vista a la arboleda luminosa.',
    badgeEmoji: '🌲',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-950 via-stone-900 to-amber-950',
    floorColor: '#3F2C1D',
    wallColor: '#251911',
    ambientParticles: 'fireflies',
    windowView: 'Bosque de Robles Mágicos',
    bgDetails: 'Vigas rústicas de roble y enredaderas floridas'
  },
  cosmic_observatory: {
    id: 'cosmic_observatory',
    name: 'Observatorio Astral Cósmico',
    subtitle: 'Cúpula de Estrellas y Nebulosas',
    description: 'Pisos de mármol pulido, telescopios rúnicos y una inmensa cúpula acristalada hacia el cosmos infinito.',
    badgeEmoji: '🌌',
    accentColor: '#6366F1',
    bgGradient: 'from-slate-950 via-indigo-950 to-purple-950',
    floorColor: '#1E1B4B',
    wallColor: '#0F172A',
    ambientParticles: 'stardust',
    windowView: 'Nebulosa Boreal y Vía Láctea',
    bgDetails: 'Anillos astrológicos y constelaciones doradas'
  },
  ice_temple: {
    id: 'ice_temple',
    name: 'Templo de Cristal Ártico',
    subtitle: 'Santuario Glacial Boreal',
    description: 'Estructuras de cuarzo gélido y hielo imperecedero, iluminadas por el vaivén de auroras polares.',
    badgeEmoji: '❄️',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-950 via-slate-900 to-sky-950',
    floorColor: '#0E7490',
    wallColor: '#083344',
    ambientParticles: 'snowflakes',
    windowView: 'Ventisquero Polar y Auroras Boreales',
    bgDetails: 'Estalactitas de prisma y runas de escarcha'
  },
  magma_forge: {
    id: 'magma_forge',
    name: 'Forja y Mansión Magmática',
    subtitle: 'Cámara de Brasas y Roca Volcánica',
    description: 'Paredes de basalto negro, conductos de magma resplandeciente y antorchas flotantes de calidez ancestral.',
    badgeEmoji: '🌋',
    accentColor: '#F59E0B',
    bgGradient: 'from-rose-950 via-stone-900 to-amber-950',
    floorColor: '#451A03',
    wallColor: '#1C1917',
    ambientParticles: 'embers',
    windowView: 'Cráter Volcánico y Géiseres de Fuego',
    bgDetails: 'Grietas de lava viva y braseros de hierro forjado'
  },
  coral_sanctuary: {
    id: 'coral_sanctuary',
    name: 'Cueva Sumergida de Coral',
    subtitle: 'Gruta Cuántica Bioluminiscente',
    description: 'Bóveda submarina de piedra perlada con vista a arrecifes fluorescentes y cardúmenes de peces dorados.',
    badgeEmoji: '🌊',
    accentColor: '#14B8A6',
    bgGradient: 'from-teal-950 via-cyan-950 to-slate-950',
    floorColor: '#134E4A',
    wallColor: '#042F2E',
    ambientParticles: 'bubbles',
    windowView: 'Arrecife de Coral Luminoso',
    bgDetails: 'Anémonas flotantes y conchas perladas iridiscentes'
  }
};

// Catálogo de Camas (10 Opciones progresivas en precio, 100% obtenibles con esfuerzo escolar)
export const SANCTUARY_BEDS: FurnitureItem[] = [
  {
    id: 'bed_straw',
    name: 'Colchón de Paja Básica',
    category: 'bed',
    price: 25,
    tier: 1,
    rarity: 'common',
    description: 'Paja seca tejida a mano y una manta humilde. Sencilla pero cálida para empezar la aventura.',
    iconEmoji: '🌾',
    energyBonus: 10,
    happinessBonus: 5,
    interactivity: 'sleep'
  },
  {
    id: 'bed_wool',
    name: 'Cojín de Lana Acogedora',
    category: 'bed',
    price: 60,
    tier: 2,
    rarity: 'common',
    description: 'Lana de oveja peinada con ribete azul cielo. Muy suave para cachorros curiosos.',
    iconEmoji: '🐑',
    energyBonus: 20,
    happinessBonus: 12,
    interactivity: 'sleep'
  },
  {
    id: 'bed_rustic_oak',
    name: 'Nido Rústico de Roble',
    category: 'bed',
    price: 120,
    tier: 3,
    rarity: 'rare',
    description: 'Cesta tallada en madera noble con cojín afelpado y base de pino aromatizada.',
    iconEmoji: '🪵',
    energyBonus: 35,
    happinessBonus: 20,
    interactivity: 'sleep'
  },
  {
    id: 'bed_cloud',
    name: 'Cama Nube Esponjosa',
    category: 'bed',
    price: 250,
    tier: 4,
    rarity: 'rare',
    description: 'Algodón mágico celestial que da la sensación de flotar suavemente sobre una nube esponjada.',
    iconEmoji: '☁️',
    energyBonus: 50,
    happinessBonus: 35,
    interactivity: 'sleep'
  },
  {
    id: 'bed_mag_lev',
    name: 'Cuna de Levitación Magnética',
    category: 'bed',
    price: 500,
    tier: 5,
    rarity: 'epic',
    description: 'Plataforma con tecnología antigravedad que se mece rítmicamente en el aire.',
    iconEmoji: '🛸',
    energyBonus: 70,
    happinessBonus: 50,
    interactivity: 'sleep'
  },
  {
    id: 'bed_canopy_silk',
    name: 'Cama Dosel de Seda Real',
    category: 'bed',
    price: 850,
    tier: 6,
    rarity: 'epic',
    description: 'Columnas de madera laqueada con cortinajes de seda carmesí que protegen del frío y la luz.',
    iconEmoji: '🎪',
    energyBonus: 95,
    happinessBonus: 70,
    interactivity: 'sleep'
  },
  {
    id: 'bed_amethyst',
    name: 'Trono-Cama de Amatista',
    category: 'bed',
    price: 1350,
    tier: 7,
    rarity: 'epic',
    description: 'Tallada en una sola geoda de amatista pulida que emite una frecuencia relajante para soñar.',
    iconEmoji: '🔮',
    energyBonus: 125,
    happinessBonus: 90,
    interactivity: 'sleep'
  },
  {
    id: 'bed_boreal_hammock',
    name: 'Hamaca Boreal Resplandeciente',
    category: 'bed',
    price: 2100,
    tier: 8,
    rarity: 'legendary',
    description: 'Tejida con hebras de luz boreal y polvo de estrellas. Induce sueños proféticos y energía ilimitada.',
    iconEmoji: '🌌',
    energyBonus: 160,
    happinessBonus: 120,
    interactivity: 'sleep'
  },
  {
    id: 'bed_cryo_capsule',
    name: 'Cápsula Criogénica Estelar',
    category: 'bed',
    price: 3200,
    tier: 9,
    rarity: 'legendary',
    description: 'Cápsula bioclimática futurista con pantalla holográfica que regenera la energía del compañero al instante.',
    iconEmoji: '❄️',
    energyBonus: 200,
    happinessBonus: 160,
    interactivity: 'sleep'
  },
  {
    id: 'bed_celestial_dragon',
    name: 'Cama Celestial de Dragón Dorado',
    category: 'bed',
    price: 4800,
    tier: 10,
    rarity: 'celestial',
    description: 'La máxima joya de descanso: estructura de oro forjado, plumas de fénix y rubíes vivos. Digna de un Guardián Supremo.',
    iconEmoji: '👑',
    energyBonus: 300,
    happinessBonus: 250,
    interactivity: 'sleep'
  }
];

// Catálogo de Otros Muebles, Alimentos, Juguetes y Decoraciones
export const SANCTUARY_OTHER_ITEMS: FurnitureItem[] = [
  // Comida y Bebida
  {
    id: 'food_clay_bowl',
    name: 'Plato de Cerámica Rústico',
    category: 'food',
    price: 30,
    tier: 1,
    rarity: 'common',
    description: 'Plato hondo de barro cocido con comida casera nutritiva.',
    iconEmoji: '🥣',
    hungerBonus: 25,
    interactivity: 'eat'
  },
  {
    id: 'food_silver_bowl',
    name: 'Tazón de Plata con Agua Pura',
    category: 'food',
    price: 75,
    tier: 2,
    rarity: 'rare',
    description: 'Tazón de plata que mantiene el agua de manantial fresca y cristalina.',
    iconEmoji: '🥈',
    hungerBonus: 40,
    interactivity: 'eat'
  },
  {
    id: 'food_vital_fountain',
    name: 'Fuente de Rocío Vital',
    category: 'food',
    price: 220,
    tier: 3,
    rarity: 'epic',
    description: 'Pequeña fuente de piedra mágica que mana agua dulce sin cesar.',
    iconEmoji: '⛲',
    hungerBonus: 70,
    interactivity: 'eat'
  },
  {
    id: 'food_mana_feast',
    name: 'Banquete Real de Frutas de Maná',
    category: 'food',
    price: 450,
    tier: 4,
    rarity: 'legendary',
    description: 'Cesta repleta de manzanas doradas, bayas estelares y néctar dulce para deleitar a tu compañero.',
    iconEmoji: '🍇',
    hungerBonus: 100,
    happinessBonus: 40,
    interactivity: 'eat'
  },

  // Juguetes e Interacción
  {
    id: 'toy_bouncy_ball',
    name: 'Pelota de Lana Saltarina',
    category: 'toy',
    price: 40,
    tier: 1,
    rarity: 'common',
    description: 'Pelota elástica que rebota por la habitación. A tu compañero le encanta perseguirla.',
    iconEmoji: '🎾',
    happinessBonus: 25,
    interactivity: 'play'
  },
  {
    id: 'toy_scratch_post',
    name: 'Torre Rascadora de Roble',
    category: 'toy',
    price: 130,
    tier: 2,
    rarity: 'rare',
    description: 'Poste forrado con cuerdas resistentes y plataformas para que trepe y afile sus garritas.',
    iconEmoji: '🪵',
    happinessBonus: 45,
    interactivity: 'play'
  },
  {
    id: 'toy_laser_orb',
    name: 'Esfera Láser Elemental',
    category: 'toy',
    price: 280,
    tier: 3,
    rarity: 'rare',
    description: 'Dispositivo mágico que proyecta puntos de luz danzantes en el suelo.',
    iconEmoji: '🔴',
    happinessBonus: 65,
    interactivity: 'play'
  },
  {
    id: 'toy_acrobatic_ring',
    name: 'Aro de Salto Acrobático',
    category: 'toy',
    price: 520,
    tier: 4,
    rarity: 'epic',
    description: 'Aro flotante decorado con plumas para que el compañero practique saltos y piruetas en el aire.',
    iconEmoji: '⭕',
    happinessBonus: 90,
    interactivity: 'play'
  },
  {
    id: 'toy_cloud_trampoline',
    name: 'Trampolín de Nube Elástica',
    category: 'toy',
    price: 850,
    tier: 5,
    rarity: 'legendary',
    description: 'Trampolín con micro-vórtice de viento suave para rebotar hacia el techo con risas contagiosas.',
    iconEmoji: '🎪',
    happinessBonus: 130,
    interactivity: 'play'
  },

  // Iluminación
  {
    id: 'light_firefly_lantern',
    name: 'Farol de Luciérnagas Mágicas',
    category: 'lighting',
    price: 70,
    tier: 1,
    rarity: 'common',
    description: 'Frasco de cristal con pequeñas luces vivas que iluminan con un tono dorado suave.',
    iconEmoji: '🏮',
    interactivity: 'light'
  },
  {
    id: 'light_pink_salt',
    name: 'Lámpara de Sal Rosa Relajante',
    category: 'lighting',
    price: 180,
    tier: 2,
    rarity: 'rare',
    description: 'Piedra mineral tallada que emana una luz cálida perfecta para meditar y estudiar.',
    iconEmoji: '🪨',
    interactivity: 'light'
  },
  {
    id: 'light_holy_flame',
    name: 'Candelabro de Llama Sagrada',
    category: 'lighting',
    price: 360,
    tier: 3,
    rarity: 'epic',
    description: 'Candelabro flotante de bronce con llamas azules que nunca queman ni producen humo.',
    iconEmoji: '🕯️',
    interactivity: 'light'
  },
  {
    id: 'light_plasma_galaxy',
    name: 'Lámpara de Plasma Galáctica',
    category: 'lighting',
    price: 680,
    tier: 4,
    rarity: 'legendary',
    description: 'Esfera de vidrio que proyecta relámpagos de arcoíris interactivos al tocarla.',
    iconEmoji: '🔮',
    interactivity: 'light'
  },

  // Decoraciones Vivas
  {
    id: 'decor_breathing_bonsai',
    name: 'Bonsái Encantado que Respira',
    category: 'decor',
    price: 110,
    tier: 1,
    rarity: 'rare',
    description: 'Árbol miniatura cuyas hojas brillan y se mueven lentamente como si respirara en paz.',
    iconEmoji: '🪴',
    interactivity: 'gaze'
  },
  {
    id: 'decor_singing_crystal',
    name: 'Flor de Cristal Cantarina',
    category: 'decor',
    price: 240,
    tier: 2,
    rarity: 'epic',
    description: 'Petálos de cuarzo que producen armonías musicales suaves al pasar la brisa.',
    iconEmoji: '🌸',
    interactivity: 'music'
  },
  {
    id: 'decor_music_box',
    name: 'Caja de Música de los Recuerdos',
    category: 'decor',
    price: 490,
    tier: 3,
    rarity: 'legendary',
    description: 'Caja de caoba con manivela dorada que toca melodías nostálgicas que tranquilizan a la mascota.',
    iconEmoji: '📻',
    interactivity: 'music'
  },

  // Pared y Trofeos
  {
    id: 'wall_honor_diploma',
    name: 'Cuadro de Honor y Diplomas',
    category: 'wall',
    price: 80,
    tier: 1,
    rarity: 'common',
    description: 'Marco dorado donde se reflejan los diplomas y reconocimientos obtenidos en clase.',
    iconEmoji: '📜',
    interactivity: 'honor'
  },
  {
    id: 'wall_school_banner',
    name: 'Estandarte Escolar del Gremio',
    category: 'wall',
    price: 190,
    tier: 2,
    rarity: 'rare',
    description: 'Bordado en terciopelo con el escudo de tu colegio y cordones trenzados de seda.',
    iconEmoji: '🚩',
    interactivity: 'honor'
  },
  {
    id: 'wall_pendulum_clock',
    name: 'Reloj de Péndulo Cósmico',
    category: 'wall',
    price: 380,
    tier: 3,
    rarity: 'epic',
    description: 'Reloj antiguo con péndulo oscilante que marca el paso de los ciclos académicos.',
    iconEmoji: '🕰️',
    interactivity: 'gaze'
  },
  {
    id: 'wall_trophy_case',
    name: 'Vitrina de Trofeos del Campeón',
    category: 'wall',
    price: 750,
    tier: 4,
    rarity: 'legendary',
    description: 'Elegante repisa con copas y medallas ganadas en misiones y exámenes con excelencia.',
    iconEmoji: '🏆',
    interactivity: 'honor'
  }
];

export const ALL_SANCTUARY_ITEMS: FurnitureItem[] = [
  ...SANCTUARY_BEDS,
  ...SANCTUARY_OTHER_ITEMS
];

// Catálogo de las 32 Ranuras (Hotspots) organizadas por zonas en el hogar
export const SANCTUARY_SLOTS: SanctuarySlotConfig[] = [
  // --- ZONA DORMITORIO / DESCANSO (Ranuras 1 a 6) ---
  { id: 1, zone: 'bedroom', label: 'Cama Principal', xPercent: 18, yPercent: 70, zIndex: 10, allowedCategories: ['bed'], slotScale: 1.2 },
  { id: 2, zone: 'bedroom', label: 'Alfombra de Noche', xPercent: 18, yPercent: 82, zIndex: 5, allowedCategories: ['decor', 'bed'], slotScale: 1.0 },
  { id: 3, zone: 'bedroom', label: 'Mesa de Noche Izquierda', xPercent: 8, yPercent: 66, zIndex: 8, allowedCategories: ['lighting', 'decor'], slotScale: 0.85 },
  { id: 4, zone: 'bedroom', label: 'Lámpara de Dormitorio', xPercent: 8, yPercent: 54, zIndex: 8, allowedCategories: ['lighting'], slotScale: 0.85 },
  { id: 5, zone: 'bedroom', label: 'Cuna / Almohadón Secundario', xPercent: 28, yPercent: 74, zIndex: 9, allowedCategories: ['bed', 'toy'], slotScale: 0.9 },
  { id: 6, zone: 'bedroom', label: 'Tapiz de Dormitorio', xPercent: 16, yPercent: 30, zIndex: 4, allowedCategories: ['wall'], slotScale: 0.9 },

  // --- ZONA DE JUEGOS Y ENTRETENIMIENTO (Ranuras 7 a 12) ---
  { id: 7, zone: 'play', label: 'Espacio de Pelota / Juego', xPercent: 42, yPercent: 78, zIndex: 12, allowedCategories: ['toy'], slotScale: 1.0 },
  { id: 8, zone: 'play', label: 'Torre Rascadora / Circuito', xPercent: 34, yPercent: 62, zIndex: 7, allowedCategories: ['toy', 'decor'], slotScale: 1.1 },
  { id: 9, zone: 'play', label: 'Aro de Acrobacias / Trampolín', xPercent: 48, yPercent: 64, zIndex: 8, allowedCategories: ['toy'], slotScale: 1.1 },
  { id: 10, zone: 'play', label: 'Alfombra de Juegos', xPercent: 42, yPercent: 70, zIndex: 4, allowedCategories: ['decor'], slotScale: 1.1 },
  { id: 11, zone: 'play', label: 'Móvil de Techo / Esfera', xPercent: 42, yPercent: 25, zIndex: 15, allowedCategories: ['lighting', 'toy'], slotScale: 0.85 },
  { id: 12, zone: 'play', label: 'Baúl de Juguetes', xPercent: 54, yPercent: 76, zIndex: 9, allowedCategories: ['toy', 'decor'], slotScale: 0.9 },

  // --- ZONA COMEDOR / NUTRICIÓN (Ranuras 13 a 18) ---
  { id: 13, zone: 'dining', label: 'Plato de Comida Principal', xPercent: 70, yPercent: 74, zIndex: 11, allowedCategories: ['food'], slotScale: 1.0 },
  { id: 14, zone: 'dining', label: 'Tazón de Agua Fresca', xPercent: 78, yPercent: 74, zIndex: 11, allowedCategories: ['food'], slotScale: 1.0 },
  { id: 15, zone: 'dining', label: 'Fuente / Banquete Central', xPercent: 74, yPercent: 62, zIndex: 8, allowedCategories: ['food', 'decor'], slotScale: 1.15 },
  { id: 16, zone: 'dining', label: 'Alfombrilla de Comedor', xPercent: 74, yPercent: 78, zIndex: 4, allowedCategories: ['decor'], slotScale: 1.05 },
  { id: 17, zone: 'dining', label: 'Despensa de Golosinas', xPercent: 86, yPercent: 68, zIndex: 7, allowedCategories: ['food', 'decor'], slotScale: 0.9 },
  { id: 18, zone: 'dining', label: 'Lámpara de Comedor', xPercent: 74, yPercent: 28, zIndex: 14, allowedCategories: ['lighting'], slotScale: 0.85 },

  // --- ZONA MÁGICA, PLANTAS Y DECORACIÓN VIVA (Ranuras 19 a 25) ---
  { id: 19, zone: 'living', label: 'Bonsái / Planta Viva Izquierda', xPercent: 4, yPercent: 82, zIndex: 14, allowedCategories: ['decor'], slotScale: 1.1 },
  { id: 20, zone: 'living', label: 'Cristal Musical / Radio', xPercent: 62, yPercent: 60, zIndex: 6, allowedCategories: ['decor', 'toy'], slotScale: 0.9 },
  { id: 21, zone: 'living', label: 'Planta Purificadora Derecha', xPercent: 94, yPercent: 80, zIndex: 14, allowedCategories: ['decor'], slotScale: 1.1 },
  { id: 22, zone: 'living', label: 'Pedestal Rúnico Central', xPercent: 50, yPercent: 86, zIndex: 13, allowedCategories: ['decor', 'toy'], slotScale: 0.95 },
  { id: 23, zone: 'living', label: 'Farol Ambiental Flotante', xPercent: 26, yPercent: 48, zIndex: 7, allowedCategories: ['lighting'], slotScale: 0.85 },
  { id: 24, zone: 'living', label: 'Farol Ambiental Derecho', xPercent: 88, yPercent: 52, zIndex: 7, allowedCategories: ['lighting'], slotScale: 0.85 },
  { id: 25, zone: 'living', label: 'Alfombra Rúnica Central', xPercent: 50, yPercent: 74, zIndex: 3, allowedCategories: ['decor'], slotScale: 1.3 },

  // --- ZONA PARED, CUADROS Y TROFEOS (Ranuras 26 a 32) ---
  { id: 26, zone: 'wall', label: 'Cuadro de Honor Superior', xPercent: 28, yPercent: 22, zIndex: 2, allowedCategories: ['wall'], slotScale: 0.95 },
  { id: 27, zone: 'wall', label: 'Reloj de Péndulo Cósmico', xPercent: 50, yPercent: 16, zIndex: 2, allowedCategories: ['wall'], slotScale: 1.0 },
  { id: 28, zone: 'wall', label: 'Estandarte Escolar', xPercent: 70, yPercent: 22, zIndex: 2, allowedCategories: ['wall'], slotScale: 0.95 },
  { id: 29, zone: 'wall', label: 'Repisa de Diplomas', xPercent: 12, yPercent: 20, zIndex: 2, allowedCategories: ['wall'], slotScale: 0.9 },
  { id: 30, zone: 'wall', label: 'Vitrina de Trofeos', xPercent: 88, yPercent: 20, zIndex: 2, allowedCategories: ['wall'], slotScale: 0.95 },
  { id: 31, zone: 'wall', label: 'Bandera del Gremio Izquierda', xPercent: 2, yPercent: 36, zIndex: 3, allowedCategories: ['wall'], slotScale: 0.85 },
  { id: 32, zone: 'wall', label: 'Bandera del Gremio Derecha', xPercent: 96, yPercent: 36, zIndex: 3, allowedCategories: ['wall'], slotScale: 0.85 }
];
