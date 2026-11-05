"use client";

import React, { useState } from 'react';
import { StudioBlockType } from '@/types/studioBlocks';

export type StudioCategoryKey =
  | 'studio_master'
  | 'exams_omr'
  | 'assessment'
  | 'assessments'
  | 'media'
  | 'multimedia'
  | 'gamification'
  | 'pedagogy'
  | 'logic_math'
  | 'languages'
  | 'history'
  | 'history_figures';

interface CategoryVisualSpec {
  imagePath: string;
  badgeText: string;
  gradientBg: string;
  borderStyle: string;
  shadowStyle: string;
  badgeColors: string;
  titleHint: string;
}

export const CATEGORY_VISUAL_SPECS: Record<StudioCategoryKey, CategoryVisualSpec> = {
  studio_master: {
    imagePath: '/images/studio-icons/cat_studio_master.webp',
    badgeText: '34',
    gradientBg: 'from-emerald-500 via-teal-600 to-cyan-700',
    borderStyle: 'border-emerald-300/90 dark:border-emerald-700',
    shadowStyle: 'shadow-md shadow-emerald-600/20',
    badgeColors: 'bg-emerald-950 text-emerald-200 border-emerald-400',
    titleHint: 'Catálogo Maestro de 34 Nodos Didácticos'
  },
  exams_omr: {
    imagePath: '/images/studio-icons/cat_exams_omr.webp',
    badgeText: 'OMR',
    gradientBg: 'from-rose-500 via-emerald-600 to-teal-700',
    borderStyle: 'border-emerald-300/90 dark:border-emerald-700',
    shadowStyle: 'shadow-md shadow-emerald-600/25',
    badgeColors: 'bg-rose-600 text-white border-white',
    titleHint: 'Exámenes Híbridos, Variantes A/B/C/D & Escáner Óptico OMR'
  },
  assessment: {
    imagePath: '/images/studio-icons/cat_assessment.webp',
    badgeText: 'EVAL',
    gradientBg: 'from-emerald-500 via-teal-600 to-green-700',
    borderStyle: 'border-emerald-300/90 dark:border-emerald-700',
    shadowStyle: 'shadow-md shadow-emerald-600/20',
    badgeColors: 'bg-emerald-700 text-white border-white',
    titleHint: 'Evaluación Formativa, Reactivos & Comprensión Lectora'
  },
  assessments: {
    imagePath: '/images/studio-icons/cat_assessment.webp',
    badgeText: 'EVAL',
    gradientBg: 'from-emerald-500 via-teal-600 to-green-700',
    borderStyle: 'border-emerald-300/90 dark:border-emerald-700',
    shadowStyle: 'shadow-md shadow-emerald-600/20',
    badgeColors: 'bg-emerald-700 text-white border-white',
    titleHint: 'Evaluación Formativa, Reactivos & Comprensión Lectora'
  },
  media: {
    imagePath: '/images/studio-icons/cat_media.webp',
    badgeText: 'LAB',
    gradientBg: 'from-blue-500 via-indigo-600 to-cyan-700',
    borderStyle: 'border-blue-300/90 dark:border-blue-700',
    shadowStyle: 'shadow-md shadow-blue-600/20',
    badgeColors: 'bg-blue-700 text-white border-white',
    titleHint: 'Multimedia, Video Educativo & Simuladores de Laboratorio'
  },
  multimedia: {
    imagePath: '/images/studio-icons/cat_media.webp',
    badgeText: 'LAB',
    gradientBg: 'from-blue-500 via-indigo-600 to-cyan-700',
    borderStyle: 'border-blue-300/90 dark:border-blue-700',
    shadowStyle: 'shadow-md shadow-blue-600/20',
    badgeColors: 'bg-blue-700 text-white border-white',
    titleHint: 'Multimedia, Video Educativo & Simuladores de Laboratorio'
  },
  gamification: {
    imagePath: '/images/studio-icons/cat_gamification.webp',
    badgeText: 'RPG',
    gradientBg: 'from-amber-400 via-orange-500 to-rose-600',
    borderStyle: 'border-amber-300/90 dark:border-amber-700',
    shadowStyle: 'shadow-md shadow-amber-500/25',
    badgeColors: 'bg-amber-600 text-white border-white',
    titleHint: 'Gamificación, Combate Boss RPG & Cofres de Recompensa'
  },
  pedagogy: {
    imagePath: '/images/studio-icons/cat_pedagogy.webp',
    badgeText: 'RUTA',
    gradientBg: 'from-teal-500 via-emerald-600 to-indigo-700',
    borderStyle: 'border-teal-300/90 dark:border-teal-700',
    shadowStyle: 'shadow-md shadow-teal-600/20',
    badgeColors: 'bg-teal-700 text-white border-white',
    titleHint: 'Narrativa, Bifurcación Condicional & Certificados SEP'
  },
  logic_math: {
    imagePath: '/images/studio-icons/cat_logic_math.webp',
    badgeText: 'STEM',
    gradientBg: 'from-blue-600 via-cyan-600 to-indigo-800',
    borderStyle: 'border-cyan-300/90 dark:border-cyan-700',
    shadowStyle: 'shadow-md shadow-blue-600/25',
    badgeColors: 'bg-indigo-700 text-white border-white',
    titleHint: 'Lógica Matemática, Circuitos Booleanos & Graficador STEM'
  },
  languages: {
    imagePath: '/images/studio-icons/cat_languages.webp',
    badgeText: 'CEFR',
    gradientBg: 'from-violet-500 via-purple-600 to-fuchsia-700',
    borderStyle: 'border-violet-300/90 dark:border-violet-700',
    shadowStyle: 'shadow-md shadow-violet-600/25',
    badgeColors: 'bg-violet-700 text-white border-white',
    titleHint: 'Centro de Idiomas, Karaoke Fonético & Certificación CENNI/DELF'
  },
  history: {
    imagePath: '/images/studio-icons/cat_history.webp',
    badgeText: '3D',
    gradientBg: 'from-amber-600 via-orange-600 to-red-700',
    borderStyle: 'border-amber-300/90 dark:border-amber-700',
    shadowStyle: 'shadow-md shadow-amber-600/25',
    badgeColors: 'bg-amber-800 text-amber-100 border-amber-300',
    titleHint: 'Personajes Históricos & Sitios Patrimoniales 3D en 1ª Persona'
  },
  history_figures: {
    imagePath: '/images/studio-icons/cat_history.webp',
    badgeText: '3D',
    gradientBg: 'from-amber-600 via-orange-600 to-red-700',
    borderStyle: 'border-amber-300/90 dark:border-amber-700',
    shadowStyle: 'shadow-md shadow-amber-600/25',
    badgeColors: 'bg-amber-800 text-amber-100 border-amber-300',
    titleHint: 'Personajes Históricos & Sitios Patrimoniales 3D en 1ª Persona'
  }
};

interface BlockVisualSpec {
  imagePath: string;
  microTag: string;
  gradientBg: string;
  tagColors: string;
  tooltip: string;
}

export const BLOCK_VISUAL_SPECS: Record<StudioBlockType, BlockVisualSpec> = {
  // Exámenes & OMR (4)
  omr_optical_exam_block: {
    imagePath: '/images/studio-icons/blk_omr_optical_exam_block.webp',
    microTag: 'A-D',
    gradientBg: 'from-rose-500 via-red-600 to-orange-600',
    tagColors: 'bg-rose-700 text-white',
    tooltip: 'Examen Híbrido OMR, 4 Variantes Anti-Copia y Escáner Óptico'
  },
  interactive_hotspot_canvas: {
    imagePath: '/images/studio-icons/blk_interactive_hotspot_canvas.webp',
    microTag: 'PIN',
    gradientBg: 'from-cyan-500 via-sky-600 to-blue-600',
    tagColors: 'bg-cyan-700 text-white',
    tooltip: 'Mapa de Puntos Calientes & Oclusión Visual Interactiva'
  },
  cornell_smart_notes: {
    imagePath: '/images/studio-icons/blk_cornell_smart_notes.webp',
    microTag: 'QR',
    gradientBg: 'from-emerald-500 via-teal-600 to-green-700',
    tagColors: 'bg-emerald-700 text-white',
    tooltip: 'Apuntes Estructurados Cornell & Sello QR de Libreta Física'
  },
  exit_ticket_reflection: {
    imagePath: '/images/studio-icons/blk_exit_ticket_reflection.webp',
    microTag: '321',
    gradientBg: 'from-amber-500 via-orange-500 to-emerald-600',
    tagColors: 'bg-amber-700 text-white',
    tooltip: 'Boleto de Salida 3-2-1 & Termómetro Metacognitivo de Aula'
  },

  // Evaluación & Reactivos (6)
  timed_reading_block: {
    imagePath: '/images/studio-icons/blk_timed_reading_block.webp',
    microTag: 'PPM',
    gradientBg: 'from-indigo-500 via-blue-600 to-violet-700',
    tagColors: 'bg-indigo-700 text-white',
    tooltip: 'Lectura Cronometrada con Medición de Fluidez (PPM)'
  },
  quiz_question: {
    imagePath: '/images/studio-icons/blk_quiz_question.webp',
    microTag: 'A✓',
    gradientBg: 'from-emerald-500 via-teal-600 to-cyan-700',
    tagColors: 'bg-emerald-700 text-white',
    tooltip: 'Pregunta de Opción Múltiple con Retroalimentación Inmediata'
  },
  drag_drop_match: {
    imagePath: '/images/studio-icons/blk_drag_drop_match.webp',
    microTag: 'A↔B',
    gradientBg: 'from-teal-500 via-emerald-600 to-cyan-700',
    tagColors: 'bg-teal-700 text-white',
    tooltip: 'Emparejamiento Táctil de Conceptos y Definiciones'
  },
  ordering_sequence: {
    imagePath: '/images/studio-icons/blk_ordering_sequence.webp',
    microTag: '123',
    gradientBg: 'from-blue-500 via-cyan-600 to-indigo-700',
    tagColors: 'bg-blue-700 text-white',
    tooltip: 'Ordenamiento Secuencial y Línea del Tiempo Cronológica'
  },
  fill_in_blanks: {
    imagePath: '/images/studio-icons/blk_fill_in_blanks.webp',
    microTag: '[ ]',
    gradientBg: 'from-teal-500 via-cyan-600 to-emerald-700',
    tagColors: 'bg-teal-800 text-white',
    tooltip: 'Completar Espacios con Banco de Palabras Validado'
  },
  open_poll_wordcloud: {
    imagePath: '/images/studio-icons/blk_open_poll_wordcloud.webp',
    microTag: 'IA',
    gradientBg: 'from-cyan-500 via-teal-600 to-blue-700',
    tagColors: 'bg-cyan-800 text-white',
    tooltip: 'Pregunta Abierta de Pensamiento Crítico y Rúbrica'
  },

  // Multimedia & Laboratorios (4)
  youtube_video: {
    imagePath: '/images/studio-icons/blk_youtube_video.webp',
    microTag: 'HD',
    gradientBg: 'from-red-500 via-rose-600 to-orange-600',
    tagColors: 'bg-red-700 text-white',
    tooltip: 'Cápsula de Video Educativo Interactiva'
  },
  external_embed: {
    imagePath: '/images/studio-icons/blk_external_embed.webp',
    microTag: 'LAB',
    gradientBg: 'from-cyan-500 via-blue-600 to-indigo-700',
    tagColors: 'bg-blue-700 text-white',
    tooltip: 'Simulador Interactivo de Laboratorio Científico / STEM'
  },
  audio_sfx: {
    imagePath: '/images/studio-icons/blk_audio_sfx.webp',
    microTag: 'VOZ',
    gradientBg: 'from-teal-500 via-emerald-600 to-cyan-700',
    tagColors: 'bg-teal-700 text-white',
    tooltip: 'Locución Neural LatAm y Ambientación Sonora'
  },
  minigame_action: {
    imagePath: '/images/studio-icons/blk_minigame_action.webp',
    microTag: 'PLAY',
    gradientBg: 'from-emerald-500 via-green-600 to-teal-700',
    tagColors: 'bg-emerald-700 text-white',
    tooltip: 'Minijuego Didáctico de Agilidad Mental'
  },

  // Gamificación & Retos (4)
  boss_enemy: {
    imagePath: '/images/studio-icons/blk_boss_enemy.webp',
    microTag: 'BOSS',
    gradientBg: 'from-rose-600 via-red-600 to-amber-600',
    tagColors: 'bg-rose-800 text-white',
    tooltip: 'Duelo Curricular RPG contra Jefe de Unidad'
  },
  reward_chest: {
    imagePath: '/images/studio-icons/blk_reward_chest.webp',
    microTag: '+XP',
    gradientBg: 'from-amber-400 via-yellow-500 to-orange-600',
    tagColors: 'bg-amber-700 text-white',
    tooltip: 'Cofre de Recompensas, Monedas e Insignias'
  },
  secret_code_puzzle: {
    imagePath: '/images/studio-icons/blk_secret_code_puzzle.webp',
    microTag: 'KEY',
    gradientBg: 'from-amber-500 via-orange-600 to-red-600',
    tagColors: 'bg-orange-800 text-white',
    tooltip: 'Acertijo de Misterio y Candado de Código Secreto'
  },

  // Pedagogía & Rutas (4)
  text_narrative: {
    imagePath: '/images/studio-icons/blk_text_narrative.webp',
    microTag: 'DOC',
    gradientBg: 'from-blue-500 via-indigo-600 to-slate-700',
    tagColors: 'bg-blue-700 text-white',
    tooltip: 'Narrativa Didáctica, Contexto e Introducción'
  },
  logic_branch: {
    imagePath: '/images/studio-icons/blk_logic_branch.webp',
    microTag: 'IF/→',
    gradientBg: 'from-indigo-500 via-violet-600 to-emerald-600',
    tagColors: 'bg-indigo-700 text-white',
    tooltip: 'Bifurcación Condicional Adaptativa (Ruta Maestría vs Refuerzo)'
  },
  checkpoint_gate: {
    imagePath: '/images/studio-icons/blk_checkpoint_gate.webp',
    microTag: 'GATE',
    gradientBg: 'from-slate-600 via-emerald-600 to-teal-700',
    tagColors: 'bg-slate-800 text-white',
    tooltip: 'Compuerta de Control y Verificación de Avance'
  },
  badge_certificate: {
    imagePath: '/images/studio-icons/blk_badge_certificate.webp',
    microTag: 'SEP',
    gradientBg: 'from-yellow-400 via-amber-500 to-orange-600',
    tagColors: 'bg-amber-800 text-white',
    tooltip: 'Diploma y Certificado de Excelencia Curricular'
  },
  socratic_debate_arena: {
    imagePath: '/images/studio-icons/blk_socratic_debate_arena.webp',
    microTag: 'A/B',
    gradientBg: 'from-indigo-500 via-purple-600 to-violet-700',
    tagColors: 'bg-indigo-800 text-white',
    tooltip: 'Foro de Debate Estructurado y Co-Evaluación por Pares'
  },

  // Lógica Matemática & Algoritmia (6)
  logic_challenge_interactive: {
    imagePath: '/images/studio-icons/blk_logic_challenge_interactive.webp',
    microTag: 'LOG',
    gradientBg: 'from-cyan-500 via-blue-600 to-indigo-700',
    tagColors: 'bg-cyan-800 text-white',
    tooltip: 'Reto Interactivo de Lógica y Pensamiento Computacional'
  },
  boolean_circuit_builder: {
    imagePath: '/images/studio-icons/blk_boolean_circuit_builder.webp',
    microTag: 'AND',
    gradientBg: 'from-blue-500 via-indigo-600 to-cyan-700',
    tagColors: 'bg-blue-800 text-white',
    tooltip: 'Constructor de Compuertas Lógicas y Circuitos Booleanos'
  },
  graph_network_path: {
    imagePath: '/images/studio-icons/blk_graph_network_path.webp',
    microTag: 'BFS',
    gradientBg: 'from-indigo-500 via-blue-600 to-violet-700',
    tagColors: 'bg-indigo-800 text-white',
    tooltip: 'Redes, Teoría de Grafos y Ruta Óptima BFS'
  },
  turing_step_simulator: {
    imagePath: '/images/studio-icons/blk_turing_step_simulator.webp',
    microTag: 'BOT',
    gradientBg: 'from-teal-500 via-cyan-600 to-blue-700',
    tagColors: 'bg-teal-800 text-white',
    tooltip: 'Autómata de Estados y Máquina de Turing Paso a Paso'
  },
  constraint_scheduler: {
    imagePath: '/images/studio-icons/blk_constraint_scheduler.webp',
    microTag: 'CSP',
    gradientBg: 'from-amber-500 via-orange-600 to-indigo-600',
    tagColors: 'bg-amber-800 text-white',
    tooltip: 'Planificador de Restricciones y Optimización Combinatoria'
  },
  interactive_whiteboard_math: {
    imagePath: '/images/studio-icons/blk_interactive_whiteboard_math.webp',
    microTag: 'f(x)',
    gradientBg: 'from-blue-600 via-cyan-600 to-teal-600',
    tagColors: 'bg-blue-800 text-white',
    tooltip: 'Pizarra Matemática, Plano Cartesiano y Graficador STEM'
  },

  // Lenguajes (5)
  languages_practice_portal: {
    imagePath: '/images/studio-icons/blk_languages_practice_portal.webp',
    microTag: 'TALK',
    gradientBg: 'from-violet-500 via-indigo-600 to-purple-700',
    tagColors: 'bg-violet-800 text-white',
    tooltip: 'Avatar Conversacional Bilingüe / Multilingüe'
  },
  languages_karaoke_block: {
    imagePath: '/images/studio-icons/blk_languages_karaoke_block.webp',
    microTag: 'MIC',
    gradientBg: 'from-purple-500 via-fuchsia-600 to-pink-600',
    tagColors: 'bg-purple-800 text-white',
    tooltip: 'Karaoke de Fluidez Fonética y Pronunciación'
  },
  languages_socratic_tutor: {
    imagePath: '/images/studio-icons/blk_languages_socratic_tutor.webp',
    microTag: 'B1+',
    gradientBg: 'from-indigo-500 via-violet-600 to-purple-700',
    tagColors: 'bg-indigo-800 text-white',
    tooltip: 'Tutor Socrático de Certificación Internacional (Cambridge / DELF)'
  },
  languages_roleplay_mission: {
    imagePath: '/images/studio-icons/blk_languages_roleplay_mission.webp',
    microTag: 'ROL',
    gradientBg: 'from-fuchsia-500 via-purple-600 to-violet-700',
    tagColors: 'bg-fuchsia-800 text-white',
    tooltip: 'Misión Inmersiva de Roleplay Situacional'
  },
  languages_evaluation_rubric: {
    imagePath: '/images/studio-icons/blk_languages_evaluation_rubric.webp',
    microTag: 'CEFR',
    gradientBg: 'from-cyan-500 via-indigo-600 to-violet-700',
    tagColors: 'bg-cyan-800 text-white',
    tooltip: 'Evaluación Formativa Oficial CENNI / DELF / MCER'
  },

  // Personajes & Sitios Históricos (1)
  historical_figure_block: {
    imagePath: '/images/studio-icons/blk_historical_figure_block.webp',
    microTag: '3D',
    gradientBg: 'from-amber-500 via-orange-600 to-red-700',
    tagColors: 'bg-amber-900 text-amber-100',
    tooltip: 'Personaje o Sitio Histórico 3D en Primera Persona + Libro Cómic + Mapa GPS'
  }
};

export interface StudioCategoryIconProps {
  categoryKey: StudioCategoryKey;
  size?: 'sm' | 'md' | 'lg';
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

/**
 * Icono 3D Ilustrado de Alta Precisión para las 8 Agrupaciones Externas de Studio
 */
export const StudioCategoryIcon: React.FC<StudioCategoryIconProps> = ({
  categoryKey,
  size = 'md',
  fallbackIcon: FallbackIcon
}) => {
  const [imgError, setImgError] = useState(false);
  const spec = CATEGORY_VISUAL_SPECS[categoryKey] || CATEGORY_VISUAL_SPECS.studio_master;

  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : size === 'lg'
        ? 'w-12 h-12 rounded-2xl'
        : 'w-11 h-11 rounded-2xl';

  return (
    <div
      title={spec.titleHint}
      className={`relative ${sizeClasses} shrink-0 p-[2px] bg-gradient-to-br ${spec.gradientBg} ${spec.shadowStyle} group select-none transition-transform duration-200 group-hover:scale-105`}
    >
      {/* Contenedor interior cristalino */}
      <div className="relative w-full h-full rounded-[inherit] bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center shadow-inner">
        {!imgError ? (
          <img
            src={spec.imagePath}
            alt={spec.titleHint}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover scale-105 transition-transform duration-200 group-hover:scale-110"
          />
        ) : FallbackIcon ? (
          <div className={`w-full h-full bg-gradient-to-br ${spec.gradientBg} flex items-center justify-center text-white`}>
            <FallbackIcon className="w-5 h-5" />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${spec.gradientBg} flex items-center justify-center text-white font-black text-xs`}>
            {spec.badgeText}
          </div>
        )}
        {/* Brillo especular superior tipo cristal 3D */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent" />
      </div>

      {/* Micro-insignia explicativa en la esquina inferior derecha */}
      <span
        className={`pointer-events-none absolute -bottom-1 -right-1 px-1 py-[1px] rounded-md text-[7.5px] font-black tracking-tighter leading-none border shadow-2xs ${spec.badgeColors}`}
      >
        {spec.badgeText}
      </span>
    </div>
  );
};

export interface StudioBlockIconProps {
  blockType: StudioBlockType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showMicroTag?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

/**
 * Icono 3D Ilustrado de Alta Precisión para cada uno de los 34 Bloques Internos de Studio
 */
export const StudioBlockIcon: React.FC<StudioBlockIconProps> = ({
  blockType,
  size = 'md',
  showMicroTag = true,
  fallbackIcon: FallbackIcon
}) => {
  const [imgError, setImgError] = useState(false);
  const spec = BLOCK_VISUAL_SPECS[blockType] || BLOCK_VISUAL_SPECS.text_narrative;

  const sizeClasses =
    size === 'xs'
      ? 'w-7 h-7 rounded-lg'
      : size === 'sm'
        ? 'w-8 h-8 rounded-xl'
        : size === 'lg'
          ? 'w-11 h-11 rounded-2xl'
          : 'w-9 h-9 rounded-xl';

  return (
    <div
      title={spec.tooltip}
      className={`relative ${sizeClasses} shrink-0 p-[1.5px] bg-gradient-to-br ${spec.gradientBg} shadow-sm group select-none transition-transform duration-150 group-hover:scale-105`}
    >
      <div className="relative w-full h-full rounded-[inherit] bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <img
            src={spec.imagePath}
            alt={spec.tooltip}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover scale-105"
          />
        ) : FallbackIcon ? (
          <div className={`w-full h-full bg-gradient-to-br ${spec.gradientBg} flex items-center justify-center text-white`}>
            <FallbackIcon className="w-4 h-4" />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${spec.gradientBg} flex items-center justify-center text-white font-black text-[9px]`}>
            {spec.microTag}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      {showMicroTag && (
        <span
          className={`pointer-events-none absolute -bottom-1 -right-1 px-1 py-[0.5px] rounded text-[7px] font-black tracking-tighter leading-tight border border-white/90 dark:border-zinc-900 shadow-2xs ${spec.tagColors}`}
        >
          {spec.microTag}
        </span>
      )}
    </div>
  );
};
