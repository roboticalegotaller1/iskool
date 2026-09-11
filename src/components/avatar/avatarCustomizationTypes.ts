export type AvatarGender = 'female' | 'male' | 'neutral';
export type AvatarBodyScale = 'compact' | 'normal' | 'tall';
export type AvatarAnimationState = 'idle' | 'cast' | 'cheer' | 'walk';

export type ClothingCategory = 
  | 'shoes' 
  | 'bottom' 
  | 'top' 
  | 'outerwear' 
  | 'hat' 
  | 'accessory';

export interface TraitOption {
  id: string;
  name: string;
  badgeEmoji?: string;
  icon?: string;
  value?: string;
  color?: string;
  description?: string;
  genderHint?: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  price: number;
  badgeEmoji: string;
  icon?: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isDefault?: boolean;
}

export type AvatarClothingItem = ClothingItem;

// ============================================================================
// 1. AL MENOS 15 PEINADOS ANIME
// ============================================================================
export const AVATAR_HAIRSTYLES: TraitOption[] = [
  { id: 'spiky', name: 'Puntas Anime Rebelde', badgeEmoji: '⚡', description: 'Cabello puntiagudo clásico de héroe shonen' },
  { id: 'ponytail', name: 'Coleta Alta Aventurera', badgeEmoji: '🎀', description: 'Coleta dinámica para exploradores activos' },
  { id: 'twin_braids', name: 'Trenzas Dobles Épicas', badgeEmoji: '👧', description: 'Trenzas simétricas con lazos escolares' },
  { id: 'afro', name: 'Afro Voluminoso Estelar', badgeEmoji: '✨', description: 'Rizos esponjosos llenos de personalidad' },
  { id: 'wavy_long', name: 'Melena Ondulada Suave', badgeEmoji: '🌊', description: 'Ondas suaves que caen sobre los hombros' },
  { id: 'bob', name: 'Corte Bob Moderno', badgeEmoji: '💇', description: 'Corte recto pulcro a la altura del cuello' },
  { id: 'witch_curls', name: 'Rizos Místicos de Bruja', badgeEmoji: '🧙‍♀️', description: 'Rizos rebeldes inspirados en hechiceras' },
  { id: 'dreadlocks', name: 'Dreadlocks / Rastas Urbanas', badgeEmoji: '🌿', description: 'Rastas largas atadas con cordones dorados' },
  { id: 'sidecut', name: 'Rapado Lateral / Sidecut', badgeEmoji: '🔥', description: 'Rapado moderno a un costado con tupé' },
  { id: 'pixie', name: 'Corte Pixie Élfico', badgeEmoji: '🧝', description: 'Puntas cortas y ligeras estilo bosque' },
  { id: 'straight_long', name: 'Melena Lisa Profunda', badgeEmoji: '✨', description: 'Cabello largo impecable y brillante' },
  { id: 'bantu_knots', name: 'Nudos Bantu Sagrados', badgeEmoji: '👑', description: 'Elegantes moñitos esculpidos geométricos' },
  { id: 'shaggy', name: 'Flequillo Despeinado', badgeEmoji: '🌪️', description: 'Look relajado con flequillo entre los ojos' },
  { id: 'space_buns', name: 'Moños Dobles Cósmicos', badgeEmoji: '🪐', description: 'Dos rodetes altos divertidos y juveniles' },
  { id: 'short_clean', name: 'Corto Clásico de Academia', badgeEmoji: '📚', description: 'Estilo formal y limpio para estudiantes de honor' },
  { id: 'wild_mane', name: 'Melena Salvaje de Héroe', badgeEmoji: '🦁', description: 'Mechones indómitos que ondean con el viento' }
];

// ============================================================================
// 2. AL MENOS 15 COLORES DE CABELLO
// ============================================================================
export const AVATAR_HAIR_COLORS: TraitOption[] = [
  { id: 'black', name: 'Negro Profundo', value: '#111827' },
  { id: 'brown', name: 'Castaño Avellana', value: '#78350F' },
  { id: 'yellow', name: 'Rubio Dorado Solar', value: '#FBBF24' },
  { id: 'pink', name: 'Rosa Neón Mágico', value: '#EC4899' },
  { id: 'blue', name: 'Azul Boreal Zafiro', value: '#3B82F6' },
  { id: 'red', name: 'Rojo Carmesí Fuego', value: '#EF4444' },
  { id: 'purple', name: 'Púrpura Hechicero', value: '#8B5CF6' },
  { id: 'silver', name: 'Plata Estelar Platino', value: '#E2E8F0' },
  { id: 'green', name: 'Verde Esmeralda Silvestre', value: '#10B981' },
  { id: 'cyan', name: 'Turquesa Cuántico', value: '#06B6D4' },
  { id: 'orange', name: 'Naranja Magma Vivo', value: '#F97316' },
  { id: 'white', name: 'Blanco Nieve Glacial', value: '#FFFFFF' },
  { id: 'lavender', name: 'Lavanda Astral Suave', value: '#C084FC' },
  { id: 'mint', name: 'Menta Pastel Primaveral', value: '#6EE7B7' },
  { id: 'gold', name: 'Oro Divino Luminoso', value: '#F59E0B' }
];

// ============================================================================
// 3. AL MENOS 15 TONOS DE PIEL (REALISTAS Y FANTÁSTICOS)
// ============================================================================
export const AVATAR_SKIN_TONES: TraitOption[] = [
  { id: 'porcelain', name: 'Porcelana Clara', value: '#FFF1F2' },
  { id: 'light', name: 'Melocotón Claro', value: '#FED7AA' },
  { id: 'soft_tan', name: 'Trigueño Suave', value: '#FDE68A' },
  { id: 'warm_gold', name: 'Cálido Dorado', value: '#FDBA74' },
  { id: 'honey_cinnamon', name: 'Canela Miel', value: '#FB923C' },
  { id: 'caribbean_tan', name: 'Bronceado Caribeño', value: '#EA580C' },
  { id: 'caramel', name: 'Café Caramelo', value: '#C2410C' },
  { id: 'intense_cocoa', name: 'Chocolate Intenso', value: '#9A3412' },
  { id: 'deep_ebony', name: 'Ébano Profundo', value: '#7C2D12' },
  { id: 'midnight', name: 'Noche Oscura Radiante', value: '#451A03' },
  { id: 'wood_elf', name: 'Verde Elfo Silvestre', value: '#A7F3D0' },
  { id: 'glacial_ice', name: 'Hielo Glacial Ártico', value: '#CFFAFE' },
  { id: 'lunar_shadow', name: 'Sombra Lunar Violeta', value: '#DDD6FE' },
  { id: 'fairy_blush', name: 'Rosa Hada Radiante', value: '#FCE7F3' },
  { id: 'celestial_gold', name: 'Oro Divino Radiante', value: '#FEF08A' }
];

// ============================================================================
// 4. AL MENOS 15 ESTILOS DE OJOS Y EXPRESIONES
// ============================================================================
export const AVATAR_EYES_STYLES: TraitOption[] = [
  { id: 'determined', name: 'Determinados Heroicos', badgeEmoji: '⚔️', description: 'Mirada fija con brillo de valentía' },
  { id: 'cheerful', name: 'Alegres y Radiantes', badgeEmoji: '😊', description: 'Ojos sonrientes llenos de energía' },
  { id: 'mysterious', name: 'Místicos Amatista', badgeEmoji: '🔮', description: 'Ojos profundos de bruja/hechicero' },
  { id: 'sparkle', name: 'Brillantes Estelares', badgeEmoji: '✨', description: 'Destellos de estrellas en las pupilas' },
  { id: 'flame', name: 'Fuego Ardiente', badgeEmoji: '🔥', description: 'Pupilas ámbar con llamarada interior' },
  { id: 'lightning', name: 'Relámpago Celeste', badgeEmoji: '⚡', description: 'Iris azul eléctrico chispeante' },
  { id: 'amethyst', name: 'Gema de Sabiduría', badgeEmoji: '💜', description: 'Mirada serena violeta' },
  { id: 'emerald', name: 'Esmeralda de la Naturaleza', badgeEmoji: '🌿', description: 'Ojos verdes con reflejos de bosque' },
  { id: 'ruby', name: 'Rubí del Coraje', badgeEmoji: '❤️', description: 'Mirada apasionada roja carmesí' },
  { id: 'sapphire', name: 'Zafiro del Océano', badgeEmoji: '🌊', description: 'Azul cobalto cristalino profundo' },
  { id: 'heterochromia', name: 'Heterocromía Bicolor', badgeEmoji: '👁️‍🗨️', description: 'Un ojo azul y un ojo dorado místico' },
  { id: 'cat_eyes', name: 'Felinos de Cazador', badgeEmoji: '🐱', description: 'Pupilas rasgadas y atentas' },
  { id: 'nebula_eyes', name: 'Nebulosa Cósmica', badgeEmoji: '🌌', description: 'Pupilas con nubes galácticas púrpuras' },
  { id: 'wink', name: 'Guiño Pícaro', badgeEmoji: '😉', description: 'Un ojo guiñado con encanto y astucia' },
  { id: 'scholar', name: 'Sabio Reflexivo', badgeEmoji: '🧐', description: 'Mirada analítica de gran concentración' }
];

// ============================================================================
// 5. AL MENOS 15 RASGOS / OREJAS / RAZAS FANTÁSTICAS
// ============================================================================
export const AVATAR_RACE_FEATURES: TraitOption[] = [
  { id: 'human', name: 'Humano Estándar', badgeEmoji: '🧑', description: 'Orejas humanas redondeadas naturales' },
  { id: 'elf_long', name: 'Elfo Boreal (Largas)', badgeEmoji: '🧝‍♀️', description: 'Orejas puntiagudas alargadas y nobles' },
  { id: 'elf_short', name: 'Elfo Ágil (Cortas)', badgeEmoji: '🧝', description: 'Orejas puntiagudas sutiles de guardabosques' },
  { id: 'cat_ears', name: 'Orejas de Gato / Kitsune', badgeEmoji: '🐱', description: 'Orejitas peludas atentas con interior rosa' },
  { id: 'wolf_ears', name: 'Lobo de las Tormentas', badgeEmoji: '🐺', description: 'Orejas grises de lobo con puntas oscuras' },
  { id: 'dragon_horns', name: 'Cuernos de Dragón Dorado', badgeEmoji: '🐲', description: 'Par de cuernos esculpidos con escamas de oro' },
  { id: 'stag_antlers', name: 'Astas de Ciervo Silvestre', badgeEmoji: '🦌', description: 'Cornamenta de madera con brotes de hojas' },
  { id: 'bunny_ears', name: 'Orejitas de Conejo Lunar', badgeEmoji: '🐰', description: 'Orejas largas y tiernas de felpa blanca' },
  { id: 'merfolk_fins', name: 'Aletas Acuáticas de Sirena', badgeEmoji: '🧜', description: 'Aletas branquiales turquesas translúcidas' },
  { id: 'fairy_wings', name: 'Alas Minis de Hada', badgeEmoji: '🧚', description: 'Alas etéreas que flotan a la espalda' },
  { id: 'angel_halo', name: 'Aureola Sagrada Flotante', badgeEmoji: '😇', description: 'Aro de luz dorada suspendido sobre la cabeza' },
  { id: 'demon_horns', name: 'Cuernitos de Gárgola', badgeEmoji: '😈', description: 'Cuernos curvos de basalto volcánico' },
  { id: 'crystal_crown', name: 'Corona Rúnica de Cristal', badgeEmoji: '💎', description: 'Prismas flotantes sobre la frente' },
  { id: 'rune_tattoo', name: 'Tatuajes Rúnicos Faciales', badgeEmoji: '✨', description: 'Marcas de poder grabadas en las mejillas' },
  { id: 'cosmic_antennae', name: 'Antenas Cósmicas Estelares', badgeEmoji: '👽', description: 'Pequeñas antenas brillantes receptoras de maná' }
];

// ============================================================================
// 6. CATÁLOGO MODULAR DE ROPA Y TIENDA (ROPA GENÉRICA INICIAL + ADQUISICIONES)
// ============================================================================
export const AVATAR_CLOTHING_ITEMS: ClothingItem[] = [
  // --- ZAPATOS ---
  {
    id: 'shoes_basic',
    name: 'Zapatos Escolares Básicos',
    category: 'shoes',
    price: 0,
    badgeEmoji: '👞',
    rarity: 'common',
    description: 'Calzado cómodo y resistente estándar para el aula escolar.',
    isDefault: true
  },
  {
    id: 'shoes_sneakers',
    name: 'Tenis Urbanos Deportivos',
    category: 'shoes',
    price: 60,
    badgeEmoji: '👟',
    rarity: 'common',
    description: 'Tenis ligeros para correr entre clases y misiones.'
  },
  {
    id: 'shoes_witch_boots',
    name: 'Botas de Bruja con Hebilla',
    category: 'shoes',
    price: 180,
    badgeEmoji: '👢',
    rarity: 'rare',
    description: 'Botas de cuero morado con hebilla dorada al estilo de la hechicera mágica.'
  },
  {
    id: 'shoes_paladin_boots',
    name: 'Botas Acorazadas de Paladín',
    category: 'shoes',
    price: 350,
    badgeEmoji: '🛡️',
    rarity: 'epic',
    description: 'Grebas de acero pulido que protegen contra cualquier peligro.'
  },
  {
    id: 'shoes_winged_sandals',
    name: 'Sandalias Aladas de Hermes',
    category: 'shoes',
    price: 700,
    badgeEmoji: '🪽',
    rarity: 'legendary',
    description: 'Sandalias míticas con pequeñas alitas que te hacen flotar al caminar.'
  },

  // --- PANTALONES / FALDAS ---
  {
    id: 'bottom_basic',
    name: 'Pantalón Escolar Básico',
    category: 'bottom',
    price: 0,
    badgeEmoji: '👖',
    rarity: 'common',
    description: 'Pantalón de tela formal oscuro estándar.',
    isDefault: true
  },
  {
    id: 'bottom_blue_jeans',
    name: 'Jeans Clásicos Azules',
    category: 'bottom',
    price: 75,
    badgeEmoji: '👖',
    rarity: 'common',
    description: 'Mezclilla cómoda y resistente para el día a día.'
  },
  {
    id: 'bottom_witch_skirt',
    name: 'Falda Plisada de Hechicera',
    category: 'bottom',
    price: 190,
    badgeEmoji: '👗',
    rarity: 'rare',
    description: 'Falda tableada azul marino con calcetas altas como la bruja mágica de referencia.'
  },
  {
    id: 'bottom_tactical_joggers',
    name: 'Joggers Tácticos de Aventura',
    category: 'bottom',
    price: 340,
    badgeEmoji: '🪖',
    rarity: 'epic',
    description: 'Pantalones militares con múltiples bolsillos y refuerzo en rodillas.'
  },
  {
    id: 'bottom_mage_robes',
    name: 'Faldón Real de Archimago',
    category: 'bottom',
    price: 650,
    badgeEmoji: '🔮',
    rarity: 'legendary',
    description: 'Telas sedosas con runas bordadas en hilo de oro que ondean mágicamente.'
  },

  // --- PLAYERAS / CAMISAS ---
  {
    id: 'top_basic',
    name: 'Playera Básica de Algodón',
    category: 'top',
    price: 0,
    badgeEmoji: '👕',
    rarity: 'common',
    description: 'Camiseta de cuello redondo suave y fresca.',
    isDefault: true
  },
  {
    id: 'top_school_blouse',
    name: 'Camisa Escolar con Corbata/Lazo',
    category: 'top',
    price: 90,
    badgeEmoji: '👔',
    rarity: 'common',
    description: 'Camisa blanca con corbata roja como uniforme distinguido de academia.'
  },
  {
    id: 'top_rune_tshirt',
    name: 'Playera Rúnica del Gremio',
    category: 'top',
    price: 180,
    badgeEmoji: '⚡',
    rarity: 'rare',
    description: 'Estampado con el emblema de poder del gremio de ISkool.'
  },
  {
    id: 'top_alchemist_vest',
    name: 'Chaleco de Alquimista y Cuero',
    category: 'top',
    price: 380,
    badgeEmoji: '🧪',
    rarity: 'epic',
    description: 'Jubón de cuero con correas cruzadas y broches de latón.'
  },
  {
    id: 'top_celestial_tunic',
    name: 'Túnica Celestial Resplandeciente',
    category: 'top',
    price: 750,
    badgeEmoji: '✨',
    rarity: 'legendary',
    description: 'Túnica tejida con luz pura que resalta en cualquier aula o campo de batalla.'
  },

  // --- SUÉTERES / CHAMARRAS / CAPAS ---
  {
    id: 'outerwear_none',
    name: 'Sin Abrigo (Solo Playera)',
    category: 'outerwear',
    price: 0,
    badgeEmoji: '🚫',
    rarity: 'common',
    description: 'Luce tu playera o camisa sin prendas exteriores.',
    isDefault: true
  },
  {
    id: 'outerwear_hoodie',
    name: 'Hoodie Escolar Cálido',
    category: 'outerwear',
    price: 120,
    badgeEmoji: '🧥',
    rarity: 'common',
    description: 'Sudadera con capucha acogedora para días frescos.'
  },
  {
    id: 'outerwear_witch_cloak',
    name: 'Capa Mágica de Bruja con Moño',
    category: 'outerwear',
    price: 280,
    badgeEmoji: '🧙‍♀️',
    rarity: 'rare',
    description: 'Capa con mangas amplias y cuello decorado con moño rojo, idéntica a la bruja de referencia.'
  },
  {
    id: 'outerwear_bomber_jacket',
    name: 'Chamarra Bomber de Héroe',
    category: 'outerwear',
    price: 450,
    badgeEmoji: '🥼',
    rarity: 'epic',
    description: 'Chamarra estilo aviador con insignias escolares cosidas a mano.'
  },
  {
    id: 'outerwear_archmage_cape',
    name: 'Gran Manto del Gran Hechicero',
    category: 'outerwear',
    price: 950,
    badgeEmoji: '👑',
    rarity: 'legendary',
    description: 'Capa regia de terciopelo morado con forro de seda dorada y gemas resplandecientes.'
  },

  // --- GORROS Y SOMBREROS ---
  {
    id: 'hat_none',
    name: 'Sin Gorro (Cabello Libre)',
    category: 'hat',
    price: 0,
    badgeEmoji: '🚫',
    rarity: 'common',
    description: 'Deja tu peinado completamente a la vista.',
    isDefault: true
  },
  {
    id: 'hat_urban_cap',
    name: 'Gorra Deportiva Escolar',
    category: 'hat',
    price: 80,
    badgeEmoji: '🧢',
    rarity: 'common',
    description: 'Gorra con visera moderna para un toque juvenil y deportivo.'
  },
  {
    id: 'hat_witch',
    name: 'Sombrero Puntiagudo de Bruja',
    category: 'hat',
    price: 240,
    badgeEmoji: '🧙‍♀️',
    rarity: 'rare',
    description: 'El clásico sombrero cónico de bruja con lazo rosa y estrellas mágicas doradas.'
  },
  {
    id: 'hat_beret',
    name: 'Boina de Intelectual Artista',
    category: 'hat',
    price: 160,
    badgeEmoji: '🎨',
    rarity: 'rare',
    description: 'Boina francesa ladeada que otorga un aire de gran erudición.'
  },
  {
    id: 'hat_guild_crown',
    name: 'Corona Imperial del Gremio',
    category: 'hat',
    price: 1100,
    badgeEmoji: '👑',
    rarity: 'legendary',
    description: 'Corona de oro macizo con zafiros reservada para los mejores estudiantes.'
  },

  // --- ACCESORIOS Y PODERES (VARITA, LIBRO DE HECHIZOS, LENTES) ---
  {
    id: 'acc_none',
    name: 'Sin Accesorios',
    category: 'accessory',
    price: 0,
    badgeEmoji: '🚫',
    rarity: 'common',
    description: 'Sin objetos adicionales en mano.',
    isDefault: true
  },
  {
    id: 'acc_scholar_glasses',
    name: 'Lentes Redondos de Sabio',
    category: 'accessory',
    price: 95,
    badgeEmoji: '👓',
    rarity: 'common',
    description: 'Lentes con armazón dorado que realzan la concentración en las tareas.'
  },
  {
    id: 'acc_magic_wand',
    name: 'Varita Mágica de Roble y Estrella',
    category: 'accessory',
    price: 250,
    badgeEmoji: '🪄',
    rarity: 'rare',
    description: 'Varita mágica como en la imagen de referencia: canaliza rayos de energía mágica brillante.'
  },
  {
    id: 'acc_spellbook',
    name: 'Libro de Hechizos Flotante Iluminado',
    category: 'accessory',
    price: 400,
    badgeEmoji: '📖',
    rarity: 'epic',
    description: 'Tomo de encantamientos que flota al lado del alumno emitiendo runas luminosas.'
  },
  {
    id: 'acc_wand_and_book',
    name: 'Combo Mágico Supremo: Varita + Grimorio',
    category: 'accessory',
    price: 850,
    badgeEmoji: '🔮',
    rarity: 'legendary',
    description: 'El conjunto completo de la bruja mágica: varita en mano derecha y grimorio abierto en la izquierda con rayos de poder.'
  }
];

export const DEFAULT_WARDROBE_IDS = [
  'shoes_basic',
  'bottom_basic',
  'top_basic',
  'outerwear_none',
  'hat_none',
  'acc_none'
];
