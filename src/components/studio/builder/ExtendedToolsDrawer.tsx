"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlockType } from '@/types/studioBlocks';
import { 
  X, 
  Sparkles, 
  Video, 
  Globe, 
  Gamepad2, 
  GitBranch, 
  Volume2, 
  Swords, 
  Gift, 
  HelpCircle, 
  BookOpen, 
  Plus,
  Layers,
  ChevronDown,
  Search,
  CheckCircle2,
  KeyRound,
  ListOrdered,
  Link2,
  FileEdit,
  MessageSquare,
  ShieldCheck,
  Award,
  Compass,
  Binary,
  Cpu,
  Network,
  Boxes,
  Bot,
  ToggleLeft,
  BrainCircuit
} from 'lucide-react';

interface ToolItem {
  type: StudioBlockType;
  category: 'assessments' | 'multimedia' | 'gamification' | 'pedagogy' | 'logic_math';
  title: string;
  description: string;
  icon: any;
  gradient: string;
  glow: string;
  badge: string;
  platformInspiration: string; // ej. "Tipo Kahoot / Quizizz", "Estilo Duolingo", "Laboratorio PhET"
}

export const ExtendedToolsDrawer: React.FC = () => {
  const { isExtendedMenuOpen, setIsExtendedMenuOpen, addBlock } = useActivityBuilderStore();
  const [activeTab, setActiveTab] = useState<'all' | 'assessments' | 'multimedia' | 'gamification' | 'pedagogy' | 'logic_math'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tools: ToolItem[] = [
    // === 1. EVALUACIONES AVANZADAS E INTERACTIVIDAD ===
    {
      type: 'drag_drop_match',
      category: 'assessments',
      title: 'Emparejamiento / Drag & Drop',
      description: 'Conecta conceptos con definiciones, términos o imágenes interactivas.',
      icon: Link2,
      gradient: 'from-violet-500 to-purple-600 text-white',
      glow: 'shadow-purple-500/20',
      badge: 'Interactivo',
      platformInspiration: 'Estilo Quizizz & Nearpod'
    },
    {
      type: 'ordering_sequence',
      category: 'assessments',
      title: 'Ordenar Secuencia / Cronología',
      description: 'Reorganiza pasos de un proceso, método científico o líneas de tiempo históricas.',
      icon: ListOrdered,
      gradient: 'from-blue-500 to-indigo-600 text-white',
      glow: 'shadow-blue-500/20',
      badge: 'Cronología',
      platformInspiration: 'Tipo Kahoot Reorder'
    },
    {
      type: 'fill_in_blanks',
      category: 'assessments',
      title: 'Completar Espacios / Texto Mutilado',
      description: 'Arrastra o escribe palabras clave faltantes en un enunciado pedagógico.',
      icon: FileEdit,
      gradient: 'from-teal-500 to-emerald-600 text-white',
      glow: 'shadow-teal-500/20',
      badge: 'Comprensión',
      platformInspiration: 'Estilo Duolingo'
    },
    {
      type: 'open_poll_wordcloud',
      category: 'assessments',
      title: 'Pregunta Abierta & Reflexión IA',
      description: 'Pregunta reflexiva con retroalimentación automática generada por rúbrica de IA.',
      icon: MessageSquare,
      gradient: 'from-fuchsia-500 to-pink-600 text-white',
      glow: 'shadow-fuchsia-500/20',
      badge: 'Evaluación IA',
      platformInspiration: 'Nube de Ideas & Mentimeter'
    },
    {
      type: 'quiz_question',
      category: 'assessments',
      title: 'Pregunta de Opción Múltiple',
      description: 'Reactivo formativo con retroalimentación inmediata, tiempo límite e imágenes.',
      icon: HelpCircle,
      gradient: 'from-purple-500 to-indigo-600 text-white',
      glow: 'shadow-purple-500/20',
      badge: 'Reactivo',
      platformInspiration: 'Estándar LMS'
    },

    // === 2. MULTIMEDIA & LABORATORIOS VIVOS ===
    {
      type: 'youtube_video',
      category: 'multimedia',
      title: 'Video Interactivo de YouTube',
      description: 'Incrusta cápsulas audiovisuales con marcas de tiempo y pausas formativas.',
      icon: Video,
      gradient: 'from-red-500 to-rose-600 text-white',
      glow: 'shadow-red-500/20',
      badge: 'Video',
      platformInspiration: 'Tipo Edpuzzle'
    },
    {
      type: 'external_embed',
      category: 'multimedia',
      title: 'Simulador / Laboratorio Web',
      description: 'Integra simuladores de física, química y matemáticas (PhET, GeoGebra, Desmos).',
      icon: Globe,
      gradient: 'from-cyan-500 to-blue-600 text-white',
      glow: 'shadow-cyan-500/20',
      badge: 'Laboratorio',
      platformInspiration: 'PhET & GeoGebra Live'
    },
    {
      type: 'audio_sfx',
      category: 'multimedia',
      title: 'Efecto de Audio / Fanfarria',
      description: 'Fanfarrias triunfales, tambores de batalla y pistas sonoras de inmersión.',
      icon: Volume2,
      gradient: 'from-violet-500 to-fuchsia-600 text-white',
      glow: 'shadow-violet-500/20',
      badge: 'Inmersión',
      platformInspiration: 'Audio Gamificado'
    },

    // === 3. GAMIFICACIÓN, RETOS & RECOMPENSAS ===
    {
      type: 'secret_code_puzzle',
      category: 'gamification',
      title: 'Misterio & Código Secreto',
      description: 'Acertijo criptográfico estilo Escape Room para desbloquear la fase siguiente.',
      icon: KeyRound,
      gradient: 'from-amber-500 to-orange-600 text-white',
      glow: 'shadow-amber-500/20',
      badge: 'Escape Room',
      platformInspiration: 'Genially Breakout'
    },
    {
      type: 'boss_enemy',
      category: 'gamification',
      title: 'Encuentro Pixi con Boss',
      description: 'Combate por turnos con dragones y jefes animados PixiJS y barra de vida.',
      icon: Swords,
      gradient: 'from-rose-500 to-red-600 text-white',
      glow: 'shadow-rose-500/20',
      badge: 'RPG Combate',
      platformInspiration: 'Tipo Classcraft'
    },
    {
      type: 'minigame_action',
      category: 'gamification',
      title: 'Minijuego Arcade Gamificado',
      description: 'Ruleta de la fortuna, memorama de tarjetas, ahorcado o candados numéricos.',
      icon: Gamepad2,
      gradient: 'from-emerald-500 to-teal-600 text-white',
      glow: 'shadow-emerald-500/20',
      badge: 'Minijuego',
      platformInspiration: 'Tipo Blooket & Wordwall'
    },
    {
      type: 'reward_chest',
      category: 'gamification',
      title: 'Cofre Épico de Recompensas',
      description: 'Otorga paquetes de experiencia XP, monedas de oro e insignias coleccionables.',
      icon: Gift,
      gradient: 'from-amber-400 to-yellow-500 text-slate-950',
      glow: 'shadow-amber-500/20',
      badge: 'Loot Box',
      platformInspiration: 'Economía de Clase'
    },
    {
      type: 'badge_certificate',
      category: 'gamification',
      title: 'Diploma & Certificado de Honor',
      description: 'Genera una insignia o diploma digital descargable al finalizar la misión.',
      icon: Award,
      gradient: 'from-yellow-500 to-amber-600 text-slate-950',
      glow: 'shadow-yellow-500/20',
      badge: 'Certificación',
      platformInspiration: 'Credenciales Digitales'
    },

    // === 4. ESTRUCTURA PEDAGÓGICA & RUTAS ADAPTATIVAS ===
    {
      type: 'logic_branch',
      category: 'pedagogy',
      title: 'Ramificación Adaptativa Condicional',
      description: 'Adapta la ruta didáctica: si el alumno acierta > 80% va a reto avanzado; si no, a refuerzo.',
      icon: GitBranch,
      gradient: 'from-indigo-500 to-purple-600 text-white',
      glow: 'shadow-indigo-500/20',
      badge: 'Adaptativo',
      platformInspiration: 'Mastery Learning LMS'
    },
    {
      type: 'checkpoint_gate',
      category: 'pedagogy',
      title: 'Punto de Control & Autoevaluación',
      description: 'Pausa metacognitiva donde el alumno reflexiona sobre lo aprendido antes de avanzar.',
      icon: ShieldCheck,
      gradient: 'from-slate-700 to-slate-900 text-white',
      glow: 'shadow-slate-500/20',
      badge: 'Metacognición',
      platformInspiration: 'Rúbricas NEM / Formativo'
    },
    {
      type: 'text_narrative',
      category: 'pedagogy',
      title: 'Texto, Guía o Fragmento Lore',
      description: 'Lecturas introductorias, instrucciones docentes o diálogos de personajes guía.',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-600 text-white',
      glow: 'shadow-blue-500/20',
      badge: 'Lectura',
      platformInspiration: 'Storytelling'
    },
    // === 5. LÓGICA MATEMÁTICA & PENSAMIENTO COMPUTACIONAL ===
    {
      type: 'logic_challenge_interactive',
      category: 'logic_math',
      title: 'Reto de Lógica & Condiciones',
      description: 'Desafíos de patrones, reglas condicionales IF-THEN, ordenamiento y optimización con retroalimentación.',
      icon: BrainCircuit,
      gradient: 'from-cyan-500 to-blue-600 text-white',
      glow: 'shadow-cyan-500/20',
      badge: 'Lógica Algorítmica',
      platformInspiration: 'Desafíos de Lógica'
    },
    {
      type: 'boolean_circuit_builder',
      category: 'logic_math',
      title: 'Compuertas & Circuitos Booleanos',
      description: 'Simulador visual interactivo de compuertas AND, OR, NOT, XOR con cables luminosos y focos.',
      icon: ToggleLeft,
      gradient: 'from-blue-600 to-indigo-700 text-white',
      glow: 'shadow-blue-500/20',
      badge: 'Compuertas Lógicas',
      platformInspiration: 'Simulador de Hardware'
    },
    {
      type: 'graph_network_path',
      category: 'logic_math',
      title: 'Redes, Grafos & Rutas BFS',
      description: 'Exploración de mapas interconectados, senderos de Euler, flujo máximo y propagación en amplitud (BFS).',
      icon: Network,
      gradient: 'from-indigo-500 to-purple-600 text-white',
      glow: 'shadow-indigo-500/20',
      badge: 'Teoría de Grafos',
      platformInspiration: 'Algoritmia de Redes'
    },
    {
      type: 'turing_step_simulator',
      category: 'logic_math',
      title: 'Autómatas & Máquinas de Turing',
      description: 'Cabezal lector/escritor sobre cinta de símbolos, autómatas finitos y algoritmos de recorrido paso a paso.',
      icon: Bot,
      gradient: 'from-teal-500 to-emerald-600 text-white',
      glow: 'shadow-teal-500/20',
      badge: 'Simulador de Cinta',
      platformInspiration: 'Máquina de Turing'
    },
    {
      type: 'constraint_scheduler',
      category: 'logic_math',
      title: 'Restricciones & Planificador CSP',
      description: 'Optimización de recursos, balanceo de carga en procesadores y calendarización de tareas complejas.',
      icon: Boxes,
      gradient: 'from-amber-500 to-orange-600 text-white',
      glow: 'shadow-amber-500/20',
      badge: 'Algoritmos CSP',
      platformInspiration: 'Planificación de Procesos'
    },
  ];

  // Filtrado por Pestaña y por Búsqueda en Vivo
  const filteredTools = tools.filter((tool) => {
    const matchesTab = activeTab === 'all' || tool.category === activeTab;
    const matchesQuery = !searchQuery.trim() || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.platformInspiration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleSelectTool = (type: StudioBlockType) => {
    addBlock(type);
    setIsExtendedMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isExtendedMenuOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed bottom-0 inset-x-0 z-50 max-w-7xl mx-auto px-2 sm:px-6 pointer-events-none"
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-t-2 sm:border-x-2 border-purple-400/80 dark:border-purple-600/80 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.25)] p-4 sm:p-6 space-y-4 pointer-events-auto max-h-[82vh] sm:max-h-[62vh] flex flex-col">
            
            {/* Manija táctil superior */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-750 rounded-full mx-auto shrink-0" />

            {/* Barra de Título, Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Catálogo de Herramientas LMS Gamificado
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      21 Mecánicas
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Elige entre evaluaciones interactivas, laboratorios vivos, retos de lógica matemática, minijuegos y rutas adaptativas.
                  </p>
                </div>
              </div>

              {/* Buscador Rápido y Botón Cerrar */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar mecánica o tipo..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsExtendedMenuOpen(false)}
                  aria-label="Cerrar catálogo de bloques"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-zinc-400 transition-all cursor-pointer shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pestañas de Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              {[
                { id: 'all', label: '🌟 Todos (21)' },
                { id: 'logic_math', label: '🧮 Lógica Matemática & Algoritmia' },
                { id: 'assessments', label: '⚡ Evaluaciones Interactivas' },
                { id: 'multimedia', label: '🎬 Multimedia & Laboratorios' },
                { id: 'gamification', label: '🎮 Gamificación & Retos' },
                { id: 'pedagogy', label: '🔀 Rutas & Pedagogía' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Banner de Acceso al Directorio de 50 Simuladores */}
            <div className="shrink-0">
              <Link
                href="/guide?role=teacher#simuladores"
                target="_blank"
                className="p-2 px-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-[11px] text-cyan-900 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>💡 ¿Buscas interactivos para tus clases? Explora nuestro Directorio de 50 Simuladores Web (PhET, GeoGebra, Desmos, NASA).</span>
                </div>
                <span className="font-black text-cyan-700 dark:text-cyan-300 shrink-0 flex items-center gap-1">
                  Ver guía ➔
                </span>
              </Link>
            </div>

            {/* Cuadrícula de Bloques Interactivos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 pb-4">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type + tool.title}
                      type="button"
                      onClick={() => handleSelectTool(tool.type)}
                      className={`group p-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/70 dark:bg-zinc-850/80 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-start gap-3`}
                    >
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center shrink-0 shadow-md ${tool.glow} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                            {tool.title}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-750 text-slate-700 dark:text-zinc-300 shrink-0">
                            {tool.badge}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {tool.description}
                        </p>

                        <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{tool.platformInspiration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                  No se encontraron mecánicas para "{searchQuery}". Prueba con otro término.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
