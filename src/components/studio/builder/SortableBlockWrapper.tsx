"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioBlock, StudioBlockType } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { BlockDispatcher } from './blocks/BlockDispatcher';
import { 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Swords, 
  Video, 
  Globe, 
  Gamepad2, 
  GitBranch, 
  Volume2,
  Check,
  Link2,
  ListOrdered,
  FileEdit,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Award,
  Binary,
  Cpu,
  Network,
  Bot,
  Boxes,
  ToggleLeft,
  BrainCircuit
} from 'lucide-react';

export interface Props {
  block: StudioBlock;
  index: number;
  totalBlocks: number;
  isOverlay?: boolean;
}

// Configuración de estilo e ícono por tipo de bloque
export const BLOCK_META: Record<StudioBlockType, { label: string; icon: any; colorScheme: string; badgeBg: string; glow: string; color?: string }> = {
  text_narrative: {
    label: 'Texto / Narrativa',
    icon: BookOpen,
    colorScheme: 'border-blue-200/90 dark:border-blue-900/60 shadow-blue-500/5',
    badgeBg: 'bg-blue-100/90 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200/60',
    glow: 'hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10',
    color: 'from-blue-600 to-indigo-600'
  },
  quiz_question: {
    label: 'Pregunta de Opción Múltiple',
    icon: HelpCircle,
    colorScheme: 'border-purple-200/90 dark:border-purple-900/60 shadow-purple-500/5',
    badgeBg: 'bg-purple-100/90 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200/60',
    glow: 'hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-purple-500/10',
    color: 'from-purple-600 to-pink-600'
  },
  timed_reading_block: {
    label: 'Lectura Cronometrada & PPM',
    icon: BookOpen,
    colorScheme: 'border-indigo-200/90 dark:border-indigo-900/60 shadow-indigo-500/5',
    badgeBg: 'bg-indigo-100/90 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200/60',
    glow: 'hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-indigo-500/10',
    color: 'from-blue-600 to-indigo-600'
  },
  reward_chest: {
    label: 'Cofre de Recompensas',
    icon: Sparkles,
    colorScheme: 'border-amber-200/90 dark:border-amber-900/60 shadow-amber-500/5',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200/60',
    glow: 'hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-amber-500/10',
    color: 'from-amber-500 to-yellow-400'
  },
  boss_enemy: {
    label: 'Combate Pixi / Boss',
    icon: Swords,
    colorScheme: 'border-rose-200/90 dark:border-rose-900/60 shadow-rose-500/5',
    badgeBg: 'bg-rose-100/90 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200/60',
    glow: 'hover:border-rose-400 dark:hover:border-rose-700 hover:shadow-rose-500/10',
    color: 'from-rose-600 to-red-700'
  },
  youtube_video: {
    label: 'Video Educativo YouTube',
    icon: Video,
    colorScheme: 'border-red-200/90 dark:border-red-900/60 shadow-red-500/5',
    badgeBg: 'bg-red-100/90 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200/60',
    glow: 'hover:border-red-400 dark:hover:border-red-700 hover:shadow-red-500/10',
    color: 'from-red-600 to-rose-600'
  },
  external_embed: {
    label: 'Simulador / Iframe Web',
    icon: Globe,
    colorScheme: 'border-cyan-200/90 dark:border-cyan-900/60 shadow-cyan-500/5',
    badgeBg: 'bg-cyan-100/90 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200/60',
    glow: 'hover:border-cyan-400 dark:hover:border-cyan-700 hover:shadow-cyan-500/10',
    color: 'from-cyan-600 to-blue-600'
  },
  drag_drop_match: {
    label: 'Emparejamiento / Drag & Drop',
    icon: Link2,
    colorScheme: 'border-violet-200/90 dark:border-violet-900/60 shadow-violet-500/5',
    badgeBg: 'bg-violet-100/90 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200/60',
    glow: 'hover:border-violet-400 dark:hover:border-violet-700 hover:shadow-violet-500/10',
    color: 'from-violet-600 to-purple-600'
  },
  ordering_sequence: {
    label: 'Ordenar Secuencia / Cronología',
    icon: ListOrdered,
    colorScheme: 'border-blue-200/90 dark:border-blue-900/60 shadow-blue-500/5',
    badgeBg: 'bg-blue-100/90 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200/60',
    glow: 'hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10',
    color: 'from-blue-600 to-cyan-600'
  },
  fill_in_blanks: {
    label: 'Completar Espacios / Texto Mutilado',
    icon: FileEdit,
    colorScheme: 'border-teal-200/90 dark:border-teal-900/60 shadow-teal-500/5',
    badgeBg: 'bg-teal-100/90 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200/60',
    glow: 'hover:border-teal-400 dark:hover:border-teal-700 hover:shadow-teal-500/10',
    color: 'from-teal-600 to-emerald-600'
  },
  open_poll_wordcloud: {
    label: 'Pregunta Abierta & Reflexión IA',
    icon: MessageSquare,
    colorScheme: 'border-fuchsia-200/90 dark:border-fuchsia-900/60 shadow-fuchsia-500/5',
    badgeBg: 'bg-fuchsia-100/90 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200/60',
    glow: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-700 hover:shadow-fuchsia-500/10',
    color: 'from-fuchsia-600 to-pink-600'
  },
  secret_code_puzzle: {
    label: 'Misterio & Código Secreto',
    icon: KeyRound,
    colorScheme: 'border-amber-200/90 dark:border-amber-900/60 shadow-amber-500/5',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200/60',
    glow: 'hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-amber-500/10',
    color: 'from-amber-500 to-orange-600'
  },
  minigame_action: {
    label: 'Minijuego Gamificado',
    icon: Gamepad2,
    colorScheme: 'border-emerald-200/90 dark:border-emerald-900/60 shadow-emerald-500/5',
    badgeBg: 'bg-emerald-100/90 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200/60',
    glow: 'hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-emerald-500/10',
    color: 'from-emerald-600 to-teal-600'
  },
  logic_branch: {
    label: 'Condición & Ramificación',
    icon: GitBranch,
    colorScheme: 'border-indigo-200/90 dark:border-indigo-900/60 shadow-indigo-500/5',
    badgeBg: 'bg-indigo-100/90 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200/60',
    glow: 'hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-indigo-500/10'
  },
  checkpoint_gate: {
    label: 'Punto de Control & Autoevaluación',
    icon: ShieldCheck,
    colorScheme: 'border-slate-300/90 dark:border-slate-800 shadow-slate-500/5',
    badgeBg: 'bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300/60',
    glow: 'hover:border-slate-500 hover:shadow-slate-500/10'
  },
  badge_certificate: {
    label: 'Diploma & Certificado de Honor',
    icon: Award,
    colorScheme: 'border-yellow-300/90 dark:border-yellow-800 shadow-yellow-500/5',
    badgeBg: 'bg-yellow-100/90 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-300/60',
    glow: 'hover:border-yellow-400 dark:hover:border-yellow-700 hover:shadow-yellow-500/10'
  },
  audio_sfx: {
    label: 'Audio / Ambientación',
    icon: Volume2,
    colorScheme: 'border-violet-200/90 dark:border-violet-900/60 shadow-violet-500/5',
    badgeBg: 'bg-violet-100/90 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200/60',
    glow: 'hover:border-violet-400 dark:hover:border-violet-700 hover:shadow-violet-500/10'
  },
  logic_challenge_interactive: {
    label: 'Reto de Lógica & Condiciones',
    icon: BrainCircuit,
    colorScheme: 'border-cyan-200/90 dark:border-cyan-900/60 shadow-cyan-500/5',
    badgeBg: 'bg-cyan-100/90 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200/60',
    glow: 'hover:border-cyan-400 dark:hover:border-cyan-700 hover:shadow-cyan-500/10'
  },
  boolean_circuit_builder: {
    label: 'Compuertas & Circuitos Booleanos',
    icon: ToggleLeft,
    colorScheme: 'border-blue-200/90 dark:border-blue-900/60 shadow-blue-500/5',
    badgeBg: 'bg-blue-100/90 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200/60',
    glow: 'hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10'
  },
  graph_network_path: {
    label: 'Redes, Grafos & Rutas BFS',
    icon: Network,
    colorScheme: 'border-indigo-200/90 dark:border-indigo-900/60 shadow-indigo-500/5',
    badgeBg: 'bg-indigo-100/90 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200/60',
    glow: 'hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-indigo-500/10'
  },
  turing_step_simulator: {
    label: 'Autómatas & Máquinas de Turing',
    icon: Bot,
    colorScheme: 'border-teal-200/90 dark:border-teal-900/60 shadow-teal-500/5',
    badgeBg: 'bg-teal-100/90 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200/60',
    glow: 'hover:border-teal-400 dark:hover:border-teal-700 hover:shadow-teal-500/10'
  },
  constraint_scheduler: {
    label: 'Restricciones & Planificador CSP',
    icon: Boxes,
    colorScheme: 'border-amber-200/90 dark:border-amber-900/60 shadow-amber-500/5',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200/60',
    glow: 'hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-amber-500/10'
  },
};

export const SortableBlockWrapper: React.FC<Props> = ({ block, index, totalBlocks }) => {
  const {
    selectedBlockId,
    setSelectedBlockId,
    removeBlock,
    duplicateBlock,
    moveBlock,
    toggleCollapseBlock,
    updateBlockTitle,
  } = useActivityBuilderStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const isSelected = selectedBlockId === block.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const meta = BLOCK_META[block.type] || BLOCK_META.text_narrative;
  const BlockIcon = meta.icon;

  // Estado visual cuando el bloque está siendo arrastrado (Placeholder con feedback claro)
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full rounded-3xl border-2 border-dashed border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 p-6 flex items-center justify-center gap-2.5 text-purple-700 dark:text-purple-300 font-black text-xs min-h-[90px] shadow-inner transition-all animate-pulse"
      >
        <GripVertical className="w-4 h-4 text-purple-500" />
        <span>Soltar aquí: {block.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-3xl transition-all duration-200 ${
        isOver ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-xl' : ''
      }`}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={() => setSelectedBlockId(block.id)}
        className={`w-full bg-white dark:bg-zinc-900 rounded-3xl border ${meta.colorScheme} ${meta.glow} ${
          isSelected
            ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/10 dark:shadow-purple-950/40'
            : 'shadow-sm hover:shadow-xl dark:shadow-zinc-950/50 hover:scale-[1.008]'
        } overflow-hidden transition-all duration-200 ease-out`}
      >
        {/* Cabecera del Bloque */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-850/70 select-none">
          {/* Manija de Arrastre e Información */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Arrastra para reordenar"
              title="Arrastra para reordenar"
              className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Número secuencial */}
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-750 text-slate-700 dark:text-zinc-300 text-[10px] font-black flex items-center justify-center shrink-0 shadow-inner">
              {index + 1}
            </span>

            {/* Badge del tipo */}
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 shadow-sm ${meta.badgeBg}`}>
              <BlockIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{meta.label}</span>
            </span>

            {/* Título editable */}
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={block.title}
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                  className="px-2 py-0.5 text-xs font-bold bg-white dark:bg-zinc-800 border border-purple-400 rounded-lg text-slate-900 dark:text-white focus:outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-emerald-500 hover:bg-emerald-50 rounded hover:scale-110 active:scale-95 transition-transform"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                title="Clic para editar título"
                className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>{block.title}</span>
                <Edit3 className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100 transition-opacity" />
              </span>
            )}
          </div>

          {/* Barra de Acciones del Bloque */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mover arriba / abajo */}
            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'up');
              }}
              aria-label="Mover bloque hacia arriba"
              title="Mover arriba"
              className="p-1 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-zinc-750 disabled:opacity-30 cursor-pointer hover:scale-110 active:scale-90 transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalBlocks - 1}
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'down');
              }}
              aria-label="Mover bloque hacia abajo"
              title="Mover abajo"
              className="p-1 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-zinc-750 disabled:opacity-30 cursor-pointer hover:scale-110 active:scale-90 transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
              }}
              aria-label="Duplicar bloque"
              title="Duplicar bloque"
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Eliminar */}
            {totalBlocks > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
                aria-label="Eliminar bloque"
                title="Eliminar bloque"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:scale-110 active:scale-90 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Colapsar / Expandir */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapseBlock(block.id);
              }}
              aria-label={block.isCollapsed ? 'Expandir bloque' : 'Colapsar bloque'}
              title={block.isCollapsed ? 'Expandir bloque' : 'Colapsar bloque'}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-750 hover:scale-110 active:scale-90 transition-all cursor-pointer"
            >
              {block.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Cuerpo del Bloque */}
        <AnimatePresence initial={false}>
          {!block.isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              <BlockDispatcher block={block} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
