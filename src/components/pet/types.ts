import { ElementalPetRace, PetEvolutionStage } from '@/types';

export interface PetRaceMetadata {
  id: ElementalPetRace;
  name: string;
  element: string;
  title: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  badgeEmoji: string;
  particleType: 'frost' | 'flame' | 'bubble' | 'spark' | 'leaf' | 'star' | 'shadow' | 'feather' | 'crystal' | 'spore';
}

export const ELEMENTAL_PET_RACES: PetRaceMetadata[] = [
  {
    id: 'cryo_dragon',
    name: 'Cryo',
    element: 'Hielo Polar',
    title: 'Dragón Glacial',
    tagline: 'Dragón de escamas heladas traslúcidas, cuernos de cuarzo azul y aliento de vapor polar.',
    primaryColor: '#38bdf8',
    secondaryColor: '#0284c7',
    accentColor: '#e0f2fe',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    badgeEmoji: '❄️',
    particleType: 'frost'
  },
  {
    id: 'pyros_dragon',
    name: 'Pyros',
    element: 'Fuego Solar',
    title: 'Dragón Ígneo',
    tagline: 'Dragón bermellón de crestas llameantes, nacido del magma y las llamaradas solares.',
    primaryColor: '#f97316',
    secondaryColor: '#dc2626',
    accentColor: '#fef08a',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    badgeEmoji: '🔥',
    particleType: 'flame'
  },
  {
    id: 'aqua_dragon',
    name: 'Aqua',
    element: 'Agua Abisal',
    title: 'Dragón de Mareas',
    tagline: 'Serpiente marina con aletas translúcidas ondulantes y perlas bioluminiscentes.',
    primaryColor: '#06b6d4',
    secondaryColor: '#0284c7',
    accentColor: '#cffafe',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    badgeEmoji: '💧',
    particleType: 'bubble'
  },
  {
    id: 'voltfang_wolf',
    name: 'Voltfang',
    element: 'Rayo Cósmico',
    title: 'Lobo Tormenta',
    tagline: 'Lobo de pelaje plateado erizado con arcos eléctricos, mirada penetrante y garras de plasma.',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    accentColor: '#fef9c3',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    badgeEmoji: '⚡',
    particleType: 'spark'
  },
  {
    id: 'flora_stag',
    name: 'Flora',
    element: 'Flora Primordial',
    title: 'Venado Silvestre',
    tagline: 'Venado místico con cornamenta de ramas de cerezo florecientes y aroma a musgo verde.',
    primaryColor: '#10b981',
    secondaryColor: '#047857',
    accentColor: '#d1fae5',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    badgeEmoji: '🌿',
    particleType: 'leaf'
  },
  {
    id: 'astro_caterpillar',
    name: 'Astro',
    element: 'Cosmos & Nebulosa',
    title: 'Gusano Alquímico',
    tagline: 'Oruga cósmica bioluminiscente con constelaciones trazadas en su lomo y orbes estelares.',
    primaryColor: '#a855f7',
    secondaryColor: '#7e22ce',
    accentColor: '#f3e8ff',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    badgeEmoji: '✨',
    particleType: 'star'
  },
  {
    id: 'umbra_cat',
    name: 'Umbra',
    element: 'Sombra Lunar',
    title: 'Felino Sombrío',
    tagline: 'Gato espectral de pelaje negro aterciopelado con luna creciente y ojos violeta brillantes.',
    primaryColor: '#8b5cf6',
    secondaryColor: '#4c1d95',
    accentColor: '#ede9fe',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    badgeEmoji: '🌙',
    particleType: 'shadow'
  },
  {
    id: 'solari_phoenix',
    name: 'Solari',
    element: 'Luz Radiante',
    title: 'Fénix Dorado',
    tagline: 'Fénix celestial de plumaje incandescente amarillo y dorado, símbolo de sabiduría académica.',
    primaryColor: '#f59e0b',
    secondaryColor: '#b45309',
    accentColor: '#fef3c7',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeEmoji: '☀️',
    particleType: 'feather'
  },
  {
    id: 'terra_golem',
    name: 'Terra',
    element: 'Tierra Geomántica',
    title: 'Gólem de Cristal',
    tagline: 'Gólem protector ensamblado con placas de roca volcánica y geodas de cuarzo esmeralda.',
    primaryColor: '#84cc16',
    secondaryColor: '#4d7c0f',
    accentColor: '#ecfccb',
    glowColor: 'rgba(132, 204, 22, 0.45)',
    badgeEmoji: '💎',
    particleType: 'crystal'
  },
  {
    id: 'axo_axolotl',
    name: 'Axo',
    element: 'Éter Bioluminiscente',
    title: 'Axolote Éter',
    tagline: 'Axolote mágico de branquias emplumadas fucsia, cuerpo translúcido y sonrisa eterna.',
    primaryColor: '#ec4899',
    secondaryColor: '#be185d',
    accentColor: '#fce7f3',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    badgeEmoji: '🌸',
    particleType: 'spore'
  }
];

// Helper para mapear razas legadas ('dragon', 'lobo', etc.) a las nuevas razas
export function resolvePetRace(rawType?: string): PetRaceMetadata {
  const norm = (rawType || '').toLowerCase().trim();
  if (norm === 'dragon' || norm === 'cryo_dragon') return ELEMENTAL_PET_RACES[0];
  if (norm === 'pyros_dragon' || norm === 'fuego') return ELEMENTAL_PET_RACES[1];
  if (norm === 'aqua_dragon' || norm === 'agua') return ELEMENTAL_PET_RACES[2];
  if (norm === 'lobo' || norm === 'voltfang_wolf' || norm === 'rayo') return ELEMENTAL_PET_RACES[3];
  if (norm === 'venado' || norm === 'flora_stag' || norm === 'planta') return ELEMENTAL_PET_RACES[4];
  if (norm === 'gusano' || norm === 'astro_caterpillar' || norm === 'cosmos') return ELEMENTAL_PET_RACES[5];
  if (norm === 'gatito' || norm === 'umbra_cat' || norm === 'gato' || norm === 'sombra') return ELEMENTAL_PET_RACES[6];
  if (norm === 'solari_phoenix' || norm === 'fenix' || norm === 'luz') return ELEMENTAL_PET_RACES[7];
  if (norm === 'terra_golem' || norm === 'golem' || norm === 'tierra') return ELEMENTAL_PET_RACES[8];
  if (norm === 'axo_axolotl' || norm === 'axolote' || norm === 'eter') return ELEMENTAL_PET_RACES[9];

  // Predeterminado
  return ELEMENTAL_PET_RACES[0];
}

// 32 Micro-Acciones Autónomas del Motor de Vida en Espera
export interface IdleActionDefinition {
  id: string;
  name: string;
  durationMs: number;
  thoughtBubble?: string;
  category: 'curiosity' | 'affection' | 'rest' | 'playful' | 'elemental';
}

export const LIVING_IDLE_ACTIONS: IdleActionDefinition[] = [
  { id: 'head_tilt_left', name: 'Ladeo a la izquierda', durationMs: 2500, thoughtBubble: '¿Eh?', category: 'curiosity' },
  { id: 'head_tilt_right', name: 'Ladeo a la derecha', durationMs: 2500, thoughtBubble: '👀', category: 'curiosity' },
  { id: 'pout', name: 'Hacer pucheros', durationMs: 3000, thoughtBubble: '🥺', category: 'affection' },
  { id: 'drop_to_ground', name: 'Tirarse al suelo', durationMs: 3500, thoughtBubble: 'Aww...', category: 'rest' },
  { id: 'sleep_snooze', name: 'Dormir con Zzz', durationMs: 4500, thoughtBubble: '💤 Zzz...', category: 'rest' },
  { id: 'startle_wake', name: 'Despertar sobresaltado', durationMs: 2000, thoughtBubble: '¡Ouch! ⚡', category: 'rest' },
  { id: 'ear_scratch', name: 'Rascarse la oreja', durationMs: 2500, thoughtBubble: '✨', category: 'playful' },
  { id: 'yawn', name: 'Bostezar profundamente', durationMs: 3000, thoughtBubble: 'Aaahhh~', category: 'rest' },
  { id: 'stretch', name: 'Estirar el lomo', durationMs: 2800, thoughtBubble: '🧘‍♂️', category: 'rest' },
  { id: 'track_cursor', name: 'Seguir el mouse', durationMs: 3000, category: 'curiosity' },
  { id: 'joy_bounce', name: 'Salto de júbilo', durationMs: 2200, thoughtBubble: '¡Yupi! 🎉', category: 'affection' },
  { id: 'tail_chase', name: 'Perseguir la cola', durationMs: 2600, thoughtBubble: '🌀', category: 'playful' },
  { id: 'sniff_air', name: 'Olfatear el aire', durationMs: 2400, thoughtBubble: '👃✨', category: 'curiosity' },
  { id: 'wink', name: 'Guiñar un ojo', durationMs: 2000, thoughtBubble: '😉', category: 'affection' },
  { id: 'shake_dust', name: 'Sacudirse el polvo', durationMs: 2200, thoughtBubble: '💨', category: 'playful' },
  { id: 'look_sky', name: 'Mirar a las estrellas', durationMs: 3200, thoughtBubble: '🌌✨', category: 'curiosity' },
  { id: 'float_hover', name: 'Flotar mágicamente', durationMs: 3500, thoughtBubble: '🔮', category: 'elemental' },
  { id: 'rub_eyes', name: 'Frotarse los ojos', durationMs: 2600, thoughtBubble: '🥱', category: 'rest' },
  { id: 'funny_face', name: 'Cara traviesa', durationMs: 2200, thoughtBubble: '😝', category: 'playful' },
  { id: 'arch_back', name: 'Arquear la espalda', durationMs: 2500, thoughtBubble: '🐾', category: 'rest' },
  { id: 'elemental_spark', name: 'Chispa de su elemento', durationMs: 2800, thoughtBubble: '⚡✨', category: 'elemental' },
  { id: 'happy_wiggle', name: 'Meneo alegre de colita', durationMs: 2400, thoughtBubble: '💖', category: 'affection' },
  { id: 'curious_peek', name: 'Asomarse a la pantalla', durationMs: 2800, thoughtBubble: '¿Qué estudias?', category: 'curiosity' },
  { id: 'hiccup', name: 'Hipo con burbujita', durationMs: 2000, thoughtBubble: '¡Hic! 🫧', category: 'playful' },
  { id: 'butterfly_chase', name: 'Mirar mariposa de luz', durationMs: 3000, thoughtBubble: '🦋', category: 'curiosity' },
  { id: 'belly_nap', name: 'Pedir mimos de panza', durationMs: 3500, thoughtBubble: '¡Acaríciame! 🥰', category: 'affection' },
  { id: 'proud_pose', name: 'Pose gallarda de guardián', durationMs: 2800, thoughtBubble: '🛡️', category: 'playful' },
  { id: 'nod_approval', name: 'Asentir con orgullo', durationMs: 2200, thoughtBubble: '¡Excelente! 👍', category: 'affection' },
  { id: 'gentle_shiver', name: 'Escalofrío tierno', durationMs: 2000, thoughtBubble: 'Brrr~', category: 'playful' },
  { id: 'dance_step', name: 'Pasito de baile', durationMs: 2800, thoughtBubble: '🎶💃', category: 'playful' },
  { id: 'cheer_shout', name: 'Porras con las patitas', durationMs: 2500, thoughtBubble: '¡Tú puedes! 📚🔥', category: 'affection' },
  { id: 'sit_meditate', name: 'Meditación con orbes', durationMs: 4000, thoughtBubble: '🧘 Focus...', category: 'elemental' }
];

export const EVOLUTION_STAGE_CONFIG: Record<PetEvolutionStage, {
  label: string;
  tasksRequired: number;
  levelRequired: number;
  description: string;
  scale: number;
}> = {
  egg: {
    label: 'Huevo Misterioso',
    tasksRequired: 0,
    levelRequired: 1,
    description: 'Huevo rúnico ancestral. Completa tu primera tarea escolar para que nazca.',
    scale: 0.85
  },
  baby: {
    label: 'Bebé',
    tasksRequired: 1,
    levelRequired: 1,
    description: 'Recién nacido tierno, curioso y cariñoso. Tu primer vínculo de estudio.',
    scale: 0.9
  },
  child: {
    label: 'Niño',
    tasksRequired: 3,
    levelRequired: 5,
    description: 'Compañero ágil e hiperactivo con pequeños cuernos y destellos mágicos.',
    scale: 1.0
  },
  teen: {
    label: 'Adolescente',
    tasksRequired: 10,
    levelRequired: 15,
    description: 'Elegante y seguro de sí mismo. Domina auras y vuela con soltura.',
    scale: 1.15
  },
  adult: {
    label: 'Guardián Adulto',
    tasksRequired: 25,
    levelRequired: 30,
    description: 'Legendario guardián supremo con armadura de cristal y poder ancestral.',
    scale: 1.3
  },
  mystic: {
    label: 'Guardián Místico',
    tasksRequired: 50,
    levelRequired: 50,
    description: 'Deidad pedagógica trascendente enlazada a la maestría académica del alumno.',
    scale: 1.35
  }
};
