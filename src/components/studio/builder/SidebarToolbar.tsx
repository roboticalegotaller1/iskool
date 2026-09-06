"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlockType } from '@/types/studioBlocks';
import { 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  Swords, 
  Video, 
  Globe, 
  Gamepad2, 
  GitBranch, 
  Volume2, 
  Layers, 
  Gift,
  Award,
  Zap,
  ChevronDown,
  ListOrdered,
  FileEdit,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Lightbulb,
  Workflow,
  Search,
  Plus,
  Binary,
  Cpu,
  Network,
  Boxes,
  Bot,
  ToggleLeft,
  BrainCircuit
} from 'lucide-react';

export interface BlockCategoryItem {
  id: 'assessments' | 'multimedia' | 'gamification' | 'pedagogy' | 'logic_math';
  name: string;
  badge: string;
  icon: any;
  color: string;
  description: string;
  example: string;
  blocks: BlockToolItem[];
}

export interface BlockToolItem {
  type: StudioBlockType;
  title: string;
  category: string;
  badge: string;
  description: string;
  example: string;
  icon: any;
  gradient: string;
  glowColor: string;
}

export const SCRATCH_CATEGORIES: BlockCategoryItem[] = [
  {
    id: 'assessments',
    name: 'Evaluación & Reactivos',
    badge: '6 Bloques',
    icon: HelpCircle,
    color: 'from-purple-600 to-indigo-600',
    description: 'Reactivos de evaluación formativa inmediata, lectura cronometrada, emparejamiento y preguntas abiertas.',
    example: 'Ideal para evaluar fluidez y comprensión lectora (PPM), definiciones científicas y procesos históricos.',
    blocks: [
      {
        type: 'timed_reading_block',
        title: 'Lectura Cronometrada (PPM)',
        category: 'Comprensión Lectora',
        badge: '⏱️ Fluidez & Lógica',
        description: 'Texto de lectura con cronómetro automático, cálculo de palabras por minuto (PPM) y preguntas de comprensión.',
        example: 'Lectura sobre el eclipse solar o biodiversidad con 2 reactivos de comprensión formativa.',
        icon: BookOpen,
        gradient: 'from-blue-600 to-indigo-600',
        glowColor: 'shadow-blue-500/30'
      },
      {
        type: 'quiz_question',
        title: 'Pregunta de Opción Múltiple',
        category: 'Evaluación',
        badge: '⚡ Formativo',
        description: 'Reactivo interactivo con 4 opciones, retroalimentación formativa y cronómetro opcional.',
        example: '¿Cuál es la función principal de los cloroplastos en las células vegetales?',
        icon: HelpCircle,
        gradient: 'from-purple-500 to-indigo-600',
        glowColor: 'shadow-purple-500/30'
      },
      {
        type: 'drag_drop_match',
        title: 'Emparejamiento / Drag & Drop',
        category: 'Evaluación',
        badge: '🔀 Táctil',
        description: 'Conecta conceptos con sus definiciones, fórmulas o ilustraciones correspondientes.',
        example: 'Emparejar "Inercia" con "1ª Ley de Newton" y "Fuerza" con "Masa × Aceleración".',
        icon: GitBranch,
        gradient: 'from-indigo-500 to-blue-600',
        glowColor: 'shadow-indigo-500/30'
      },
      {
        type: 'ordering_sequence',
        title: 'Secuencia Cronológica',
        category: 'Evaluación',
        badge: '🔢 Algoritmos',
        description: 'Ordena pasos lógicos, algoritmos o acontecimientos históricos en orden ascendente.',
        example: 'Ordenar los 4 acontecimientos clave del movimiento de Independencia de 1810.',
        icon: ListOrdered,
        gradient: 'from-blue-500 to-cyan-600',
        glowColor: 'shadow-blue-500/30'
      },
      {
        type: 'fill_in_blanks',
        title: 'Completar Espacios en Blanco',
        category: 'Evaluación',
        badge: '✍️ Banco de Palabras',
        description: 'Texto mutilado con banco de palabras para consolidar definiciones y leyes.',
        example: 'La [gravedad] es la fuerza que atrae los cuerpos hacia el centro de la [Tierra].',
        icon: FileEdit,
        gradient: 'from-cyan-500 to-teal-600',
        glowColor: 'shadow-cyan-500/30'
      },
      {
        type: 'open_poll_wordcloud',
        title: 'Pregunta Abierta con IA',
        category: 'Evaluación',
        badge: '🤖 Rúbrica IA',
        description: 'Pregunta de reflexión con retroalimentación cualitativa inmediata basada en criterios NEM.',
        example: '¿Cómo aplicarías el principio de conservación de energía en tu comunidad?',
        icon: MessageSquare,
        gradient: 'from-teal-500 to-emerald-600',
        glowColor: 'shadow-teal-500/30'
      }
    ]
  },
  {
    id: 'multimedia',
    name: 'Multimedia & Laboratorios',
    badge: '4 Bloques',
    icon: Video,
    color: 'from-blue-600 to-cyan-600',
    description: 'Incrustación de videos explicativos, interactivos PhET / GeoGebra, lecturas y audio ambiental.',
    example: 'Inserta simuladores de física de la Universidad de Colorado o cápsulas de YouTube.',
    blocks: [
      {
        type: 'text_narrative',
        title: 'Instrucción o Lectura',
        category: 'Multimedia',
        badge: '📖 Contexto',
        description: 'Texto introductorio, narrativa inmersiva de la misión o diálogo pedagógico.',
        example: '¡Bienvenidos exploradores! Hoy descifraremos las leyes del movimiento universal.',
        icon: BookOpen,
        gradient: 'from-blue-500 to-cyan-600',
        glowColor: 'shadow-blue-500/30'
      },
      {
        type: 'youtube_video',
        title: 'Video Educativo YouTube',
        category: 'Multimedia',
        badge: '🎬 Audiovisual',
        description: 'Cápsula de video de YouTube con marca de tiempo de inicio y modo seguro.',
        example: 'Video de 3 minutos sobre la caída libre de los cuerpos iniciando en el segundo 45.',
        icon: Video,
        gradient: 'from-red-500 to-rose-600',
        glowColor: 'shadow-red-500/30'
      },
      {
        type: 'external_embed',
        title: 'Simulador Web PhET / GeoGebra',
        category: 'Multimedia',
        badge: '🔬 Laboratorio Vivo',
        description: 'Incrusta cualquiera de los 50 simuladores web compatibles (PhET, Desmos, NASA, etc.).',
        example: 'Laboratorio de Fuerzas y Movimiento PhET para experimentar con aceleración.',
        icon: Globe,
        gradient: 'from-cyan-500 to-blue-600',
        glowColor: 'shadow-cyan-500/30'
      },
      {
        type: 'audio_sfx',
        title: 'Efecto Sonoro / Fanfarria',
        category: 'Multimedia',
        badge: '🎵 Ambientación',
        description: 'Reproduce fanfarrias de victoria, redobles de misterio o música estimulante.',
        example: 'Fanfarria triunfal tras resolver el enigma de la pirámide de Chichén Itzá.',
        icon: Volume2,
        gradient: 'from-pink-500 to-rose-600',
        glowColor: 'shadow-pink-500/30'
      }
    ]
  },
  {
    id: 'gamification',
    name: 'Gamificación & Retos',
    badge: '4 Bloques',
    icon: Gamepad2,
    color: 'from-amber-500 to-yellow-600',
    description: 'Duelos RPG contra Bosses animados Pixi, cofres de botín, códigos secretos y ruletas.',
    example: 'Motiva a los alumnos con puntos XP, gemas y combates interactivos por turnos.',
    blocks: [
      {
        type: 'reward_chest',
        title: 'Cofre de Recompensas',
        category: 'Gamificación',
        badge: '🎁 Botín & XP',
        description: 'Otorga puntos XP, monedas de oro e insignias de maestría para el avatar del alumno.',
        example: 'Cofre legendario con +150 XP y 40 monedas al superar la misión matemática.',
        icon: Gift,
        gradient: 'from-amber-500 to-yellow-600',
        glowColor: 'shadow-amber-500/30'
      },
      {
        type: 'boss_enemy',
        title: 'Duelo contra Boss Pixi',
        category: 'Gamificación',
        badge: '⚔️ Combate RPG',
        description: 'Batalla por turnos contra monstruos y dragones animados donde responder bien hace daño.',
        example: 'Duelo contra el "Gólem del Olvido" con 100 HP respondiendo 3 reactivos de repaso.',
        icon: Swords,
        gradient: 'from-rose-500 to-red-600',
        glowColor: 'shadow-rose-500/30'
      },
      {
        type: 'secret_code_puzzle',
        title: 'Código Secreto / Escape Room',
        category: 'Gamificación',
        badge: '🗝️ Acertijo',
        description: 'Candado con palabra clave o código alfanumérico para abrir bóvedas de conocimiento.',
        example: 'Descifra la palabra de 6 letras "FUERZA" para abrir la bóveda de Newton.',
        icon: KeyRound,
        gradient: 'from-orange-500 to-amber-600',
        glowColor: 'shadow-orange-500/30'
      },
      {
        type: 'minigame_action',
        title: 'Minijuego Arcade (Ruleta)',
        category: 'Gamificación',
        badge: '🎰 Dinámica Lúdica',
        description: 'Ruleta de la fortuna, memorama o ruleta de preguntas para otorgar bonificaciones.',
        example: 'Girar la ruleta para duplicar el botín XP antes de enfrentar al Boss.',
        icon: Gamepad2,
        gradient: 'from-violet-500 to-purple-600',
        glowColor: 'shadow-violet-500/30'
      }
    ]
  },
  {
    id: 'pedagogy',
    name: 'Pedagogía & Rutas',
    badge: '3 Bloques',
    icon: GitBranch,
    color: 'from-emerald-500 to-teal-600',
    description: 'Rutas condicionales adaptativas, puntos de control metacognitivo y diplomas de honor.',
    example: 'Personaliza la ruta del alumno según su desempeño o emite diplomas al finalizar.',
    blocks: [
      {
        type: 'logic_branch',
        title: 'Bifurcación Condicional',
        category: 'Pedagogía',
        badge: '🔀 Ruta Adaptativa',
        description: 'Divide el camino según la puntuación del alumno (ruta avanzada vs ruta de refuerzo).',
        example: 'Si el alumno tiene > 80% de aciertos avanza al reto; si no, recibe apoyo guiado.',
        icon: GitBranch,
        gradient: 'from-indigo-600 to-purple-600',
        glowColor: 'shadow-indigo-500/30'
      },
      {
        type: 'checkpoint_gate',
        title: 'Punto de Control Metacognitivo',
        category: 'Pedagogía',
        badge: '🛡️ Autoevaluación',
        description: 'Espacio de autoevaluación donde el alumno califica su nivel de confianza y reflexión.',
        example: '¿Qué tan seguro te sientes aplicando este método en problemas cotidianos?',
        icon: ShieldCheck,
        gradient: 'from-emerald-500 to-teal-600',
        glowColor: 'shadow-emerald-500/30'
      },
      {
        type: 'badge_certificate',
        title: 'Diploma de Honor Digital',
        category: 'Pedagogía',
        badge: '🏆 Reconocimiento',
        description: 'Emite y descarga un certificado de logro con firma institucional al completar la misión.',
        example: 'Diploma oficial "Maestro de las Ciencias Exactas" otorgado por el colegio.',
        icon: Award,
        gradient: 'from-amber-400 to-yellow-500',
        glowColor: 'shadow-amber-500/30'
      }
    ]
  },
  {
    id: 'logic_math',
    name: 'Lógica Matemática & Algoritmia',
    badge: '5 Bloques',
    icon: Binary,
    color: 'from-cyan-600 via-blue-600 to-indigo-700',
    description: 'Retos de pensamiento computacional, compuertas booleanas, autómatas, grafos y satisfacción de restricciones.',
    example: 'Ideal para olimpiadas de lógica, retos interactivos por niveles (1º Primaria a 3º Secundaria) y simuladores animados.',
    blocks: [
      {
        type: 'logic_challenge_interactive',
        title: 'Reto de Lógica & Condiciones',
        category: 'Lógica Matemática',
        badge: '🧠 Razonamiento',
        description: 'Desafíos de patrones, reglas condicionales IF-THEN, ordenamiento y optimización con retroalimentación.',
        example: 'La hora del lunch, dibujos arreglados, collares de amistad y secuencias lógicas.',
        icon: BrainCircuit,
        gradient: 'from-cyan-500 to-blue-600',
        glowColor: 'shadow-cyan-500/30'
      },
      {
        type: 'boolean_circuit_builder',
        title: 'Compuertas & Circuitos Booleanos',
        category: 'Lógica Matemática',
        badge: '⚡ Compuertas Lógicas',
        description: 'Simulador visual interactivo de compuertas AND, OR, NOT, XOR con cables luminosos y focos.',
        example: 'Juego "Prende la Luz": activa los switches correctos para encender la bombilla.',
        icon: ToggleLeft,
        gradient: 'from-blue-600 to-indigo-700',
        glowColor: 'shadow-blue-500/30'
      },
      {
        type: 'graph_network_path',
        title: 'Redes, Grafos & Rutas BFS',
        category: 'Lógica Matemática',
        badge: '🕸️ Teoría de Grafos',
        description: 'Exploración de mapas interconectados, senderos de Euler, flujo máximo y propagación en amplitud (BFS).',
        example: 'El mensaje del cartero en la isla, barquitos de Euler y rutas de transporte público.',
        icon: Network,
        gradient: 'from-indigo-500 to-purple-600',
        glowColor: 'shadow-indigo-500/30'
      },
      {
        type: 'turing_step_simulator',
        title: 'Autómatas & Máquinas de Turing',
        category: 'Lógica Matemática',
        badge: '🤖 Simulador de Cinta',
        description: 'Cabezal lector/escritor sobre cinta de símbolos, autómatas finitos y algoritmos de recorrido paso a paso.',
        example: 'Robot agrícola plantador de flores, laberinto de comandos y autómatas de vajilla.',
        icon: Bot,
        gradient: 'from-teal-500 to-emerald-600',
        glowColor: 'shadow-teal-500/30'
      },
      {
        type: 'constraint_scheduler',
        title: 'Restricciones & Planificador CSP',
        category: 'Lógica Matemática',
        badge: '⏱️ Algoritmos CSP',
        description: 'Optimización de recursos, balanceo de carga en procesadores y calendarización de tareas complejas.',
        example: 'Tradición Du-re, balanceo de velas de adviento y ordenamiento Shortest Job First.',
        icon: Boxes,
        gradient: 'from-amber-500 to-orange-600',
        glowColor: 'shadow-amber-500/30'
      }
    ]
  }
];

export const SidebarToolbar: React.FC = () => {
  const { 
    blocks, 
    addBlock, 
    setDraggedNewBlockType 
  } = useActivityBuilderStore();

  // Estados de categorías desplegadas (acordeón múltiple o individual)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    assessments: true,
    multimedia: false,
    gamification: false,
    pedagogy: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Hover Tooltip Enriquecido
  const [hoveredTool, setHoveredTool] = useState<BlockToolItem | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<BlockCategoryItem | null>(null);

  // Estados de Arrastre Global con el Mouse hacia el tablero
  const [draggingTool, setDraggingTool] = useState<BlockToolItem | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Iniciar arrastre con clic sostenido
  const handleMouseDownTool = (e: React.MouseEvent, tool: BlockToolItem) => {
    e.preventDefault();
    setDraggingTool(tool);
    setDraggedNewBlockType(tool.type);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  // Manejar movimiento global y drop al soltar el clic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingTool) {
        setCursorPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (draggingTool) {
        // Localizar el contenedor del tablero de trabajo
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const boardElem = targetElement?.closest('[data-board-container="true"], .scroll-smooth') || document.querySelector('[data-board-container="true"]');

        if (boardElem) {
          const rect = boardElem.getBoundingClientRect();
          const scrollContainer = document.querySelector('.scroll-smooth');
          const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
          const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

          const dropX = Math.max(40, Math.round(e.clientX - rect.left + scrollLeft));
          const dropY = Math.max(40, Math.round(e.clientY - rect.top + scrollTop));

          addBlock(draggingTool.type, undefined, { x: dropX, y: dropY });
        } else {
          // Si se soltó fuera, añadirlo con posición automática
          addBlock(draggingTool.type);
        }

        setDraggingTool(null);
        setDraggedNewBlockType(null);
      }
    };

    if (draggingTool) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTool, addBlock, setDraggedNewBlockType]);

  // Filtrar bloques si hay búsqueda activa
  const filteredCategories = SCRATCH_CATEGORIES.map(cat => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const matchingBlocks = cat.blocks.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.description.toLowerCase().includes(q) ||
      b.badge.toLowerCase().includes(q)
    );
    return {
      ...cat,
      blocks: matchingBlocks
    };
  }).filter(cat => cat.blocks.length > 0);

  return (
    <aside className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-zinc-800 p-4 shadow-xl select-none flex flex-col gap-3 relative z-30">
      {/* Cabecera del Panel de Bloques */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black shadow-xs">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Agrupaciones de Bloques
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Haz clic o arrastra al tablero
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200/60 dark:border-purple-800/60">
          17 Nodos
        </span>
      </div>

      {/* Buscador Rápido de Bloques */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar bloque (ej. PhET, Quiz, Boss)..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
      </div>

      {/* Lista de Agrupaciones (Acordeón Desplegable / Replegable) */}
      <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCategories[cat.id] || searchQuery.trim().length > 0;
          const Icon = cat.icon;

          return (
            <div 
              key={cat.id}
              className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden bg-slate-50/60 dark:bg-zinc-850/50 transition-all"
            >
              {/* Cabecera de la Agrupación (Clic despliega / repliega) */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`w-full p-2.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                  isExpanded ? 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200' : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                      {cat.badge}
                    </span>
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-purple-600' : ''}`} />
              </button>

              {/* Lista de Bloques dentro de la Agrupación */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="p-2 space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70"
                  >
                    {cat.blocks.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <div
                          key={tool.type}
                          onMouseDown={(e) => handleMouseDownTool(e, tool)}
                          onClick={() => {
                            if (!draggingTool) addBlock(tool.type);
                          }}
                          onMouseEnter={() => setHoveredTool(tool)}
                          onMouseLeave={() => setHoveredTool(null)}
                          className="group p-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-zinc-850 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between gap-2 transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${tool.gradient} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
                              <ToolIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-black text-slate-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                                {tool.title}
                              </h5>
                              <span className="text-[9px] font-bold text-slate-400 block truncate">
                                {tool.badge}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            + Añadir
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ================= POPOVER / TOOLTIP ENRIQUECIDO CON EJEMPLOS ================= */}
      <AnimatePresence>
        {(hoveredTool || hoveredCategory) && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="hidden lg:block fixed left-[340px] xl:left-[370px] top-28 z-[99999] pointer-events-none w-72 sm:w-80 shadow-2xl rounded-2xl overflow-hidden bg-slate-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-xl border border-slate-700/80 dark:border-zinc-700/80 p-4 space-y-2.5 animate-fade-in"
          >
            {hoveredTool ? (
              <>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${hoveredTool.gradient} text-white flex items-center justify-center shrink-0 shadow-md`}>
                      <hoveredTool.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">
                        {hoveredTool.category}
                      </span>
                      <h4 className="text-xs font-black text-white truncate">
                        {hoveredTool.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-purple-200 shrink-0">
                    {hoveredTool.badge}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {hoveredTool.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      <span>Ejemplo práctico de uso:</span>
                    </div>
                    <p className="text-purple-200 italic leading-snug">
                      &ldquo;{hoveredTool.example}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="text-[9px] font-bold text-slate-400 text-center pt-1 border-t border-slate-800">
                  💡 Haz clic para añadir o arrastra con el ratón al tablero.
                </div>
              </>
            ) : hoveredCategory ? (
              <>
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${hoveredCategory.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <hoveredCategory.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">
                      Agrupación de Bloques
                    </span>
                    <h4 className="text-xs font-black text-white">
                      {hoveredCategory.name}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {hoveredCategory.description}
                </p>

                <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/40 text-[11px] space-y-1">
                  <span className="font-bold text-cyan-300">💡 Aplicación sugerida:</span>
                  <p className="text-blue-200 text-[10px] leading-snug">
                    {hoveredCategory.example}
                  </p>
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= PREVIEW FLOTANTE MIENTRAS SE ARRASTRA UN BLOQUE ================= */}
      {draggingTool && (
        <div
          style={{
            position: 'fixed',
            left: `${cursorPos.x + 15}px`,
            top: `${cursorPos.y + 15}px`,
            pointerEvents: 'none',
            zIndex: 999999,
          }}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-purple-500 shadow-2xl flex items-center gap-2.5 min-w-[200px] animate-scale-in opacity-90 rotate-2"
        >
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${draggingTool.gradient} text-white flex items-center justify-center shrink-0 shadow-md`}>
            <draggingTool.icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-purple-600 block">
              Soltar para crear nodo
            </span>
            <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
              {draggingTool.title}
            </h5>
          </div>
        </div>
      )}
    </aside>
  );
};
