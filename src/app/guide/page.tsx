"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GUIDE_ROLE_DATA, RoleGuideData, RoleFeature, GuideStep } from '@/data/guideRoleContent';
import { SIMULATORS_DIRECTORY, SimulatorItem } from '@/data/simulatorsDirectory';
import { 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Gamepad2, 
  Users, 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  PlusCircle, 
  Play, 
  Send, 
  Award, 
  Globe, 
  HelpCircle, 
  Swords, 
  Flame, 
  Coins, 
  Heart, 
  MapPin, 
  ShoppingBag, 
  Smile, 
  TrendingUp, 
  Bell, 
  LayoutDashboard, 
  BarChart3, 
  Palette, 
  CheckSquare,
  Layers,
  ChevronDown,
  ChevronUp,
  Database,
  Video,
  CheckCircle2,
  Zap,
  FolderGit2,
  AlertCircle,
  Compass,
  Cpu,
  Eye,
  Sliders,
  FileText,
  Lock,
  Home,
  Wand2,
  RefreshCw,
  X
} from 'lucide-react';

const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case 'Database': return <Database className={className} />;
    case 'Video': return <Video className={className} />;
    case 'Workflow': return <Layers className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Play': return <Play className={className} />;
    case 'Send': return <Send className={className} />;
    case 'Settings': return <Settings className={className} />;
    case 'Map':
    case 'MapPin': return <MapPin className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'User': return <Users className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Award': return <Award className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'LayoutDashboard': return <LayoutDashboard className={className} />;
    case 'Bell': return <Bell className={className} />;
    case 'BarChart3': return <BarChart3 className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Sliders': return <Sliders className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <Sparkles className={className} />;
  }
};

// Datos interactivos para vitrinas didácticas
const PET_RACES = [
  { id: 'cryo', name: 'Cryo', title: 'Dragón Glacial', element: 'Hielo / Ártico', color: 'from-cyan-500 to-blue-600', icon: '❄️', desc: 'Guardián de las nieves eternas con escamas de escarcha y aliento boreal.' },
  { id: 'pyros', name: 'Pyros', title: 'Fuego Solar', element: 'Fuego / Magma', color: 'from-amber-500 to-red-600', icon: '🔥', desc: 'Espíritu ígneo que canaliza la energía radiante y el entusiasmo escolar.' },
  { id: 'aqua', name: 'Aqua', title: 'Dragón de Mareas', element: 'Agua / Marina', color: 'from-blue-500 to-teal-600', icon: '🌊', desc: 'Criatura de corrientes marinas con alas translúcidas y serenidad profunda.' },
  { id: 'voltfang', name: 'Voltfang', title: 'Lobo Tormenta', element: 'Rayo / Eléctrico', color: 'from-yellow-400 to-amber-600', icon: '⚡', desc: 'Cánido relampagueante con pelaje estático y reflejos hiperveloces.' },
  { id: 'flora', name: 'Flora', title: 'Venado Silvestre', element: 'Naturaleza / Tierra', color: 'from-emerald-500 to-green-600', icon: '🌿', desc: 'Noble ciervo adornado con cornamenta de ramas en flor y vitalidad.' },
  { id: 'astro', name: 'Astro', title: 'Nebulosa Cósmica', element: 'Éter / Espacial', color: 'from-purple-500 to-indigo-600', icon: '✨', desc: 'Entidad estelar envuelta en polvo de galaxias y constelaciones flotantes.' },
  { id: 'umbra', name: 'Umbra', title: 'Felino Sombrío', element: 'Sombra / Sigilo', color: 'from-violet-600 to-slate-900', icon: '🐾', desc: 'Pantera mística que camina entre penumbras con ojos de zafiro estelar.' },
  { id: 'solari', name: 'Solari', title: 'Fénix Dorado', element: 'Luz / Corona', color: 'from-yellow-500 to-orange-500', icon: '🦅', desc: 'Ave mítica de plumaje áureo que renace ante cada desafío superado.' },
  { id: 'terra', name: 'Terra', title: 'Gólem de Cristal', element: 'Roca / Gema', color: 'from-stone-500 to-emerald-700', icon: '💎', desc: 'Coloso noble con incrustaciones de cuarzo y resistencia inquebrantable.' },
  { id: 'axo', name: 'Axo', title: 'Axolote Éter', element: 'Místico / Regeneración', color: 'from-pink-400 to-rose-500', icon: '🫧', desc: 'Anfibio ancestral sagrado con branquias brillantes y poder de renovación.' }
];

const EVOLUTION_STAGES = [
  { stage: 1, name: 'Huevo Misterioso', req: '0 Tareas', desc: 'Huevo elemental vibrante esperando tu primer esfuerzo escolar.', badge: 'Comienzo', icon: '🥚' },
  { stage: 2, name: 'Bebé Eclosionado', req: '1ª Tarea Entregada', desc: 'Eclosiona con cinemática especial y da sus primeros pasos por el aula.', badge: 'Eclosión', icon: '🐣' },
  { stage: 3, name: 'Niño Curioso', req: '3 Tareas Cumplidas', desc: 'Desarrolla sus primeros cuernos o alas y empieza a apoyarte en clase.', badge: 'Crecimiento', icon: '🐾' },
  { stage: 4, name: 'Adolescente Fuerte', req: '10 Tareas Superadas', desc: 'Gana rasgos elementales avanzados y mayor potencia en sus habilidades.', badge: 'Dominio', icon: '⚡' },
  { stage: 5, name: 'Guardián Adulto', req: '25 Tareas Escolares', desc: 'Forma legendaria definitiva con partículas flotantes y aura de maestría.', badge: 'Legendario', icon: '👑' }
];

const SANCTUARY_HOUSES = [
  { id: 'boreal', name: 'Cabaña Silvestre Boreal', atmosphere: 'Lluvia de hojas doradas, chimenea rústica y calma boscosa.', bonus: 'Serenidad en estudio', color: 'from-emerald-600 to-teal-700' },
  { id: 'astral', name: 'Observatorio Astral Cósmico', atmosphere: 'Estrellas fugaces, nebulosas espaciales y piso de cristal.', bonus: 'Concentración científica', color: 'from-indigo-600 to-purple-800' },
  { id: 'artico', name: 'Templo de Cristal Ártico', atmosphere: 'Copos de nieve relucientes, columnas de hielo tallado y escarcha.', bonus: 'Claridad mental', color: 'from-cyan-600 to-blue-700' },
  { id: 'magma', name: 'Forja y Mansión Magmática', atmosphere: 'Chispas incandescentes, pilares de piedra volcánica y calor vivo.', bonus: 'Determinación en retos', color: 'from-amber-600 to-red-700' },
  { id: 'coral', name: 'Cueva Sumergida de Coral', atmosphere: 'Burbujas marinas, cardúmenes luminosos y arrecifes bioluminiscentes.', bonus: 'Imaginación y calma', color: 'from-blue-600 to-emerald-700' }
];

const STUDIO_BLOCKS = [
  { name: 'Opción Múltiple', type: 'Evaluación', icon: 'CheckSquare', desc: 'Reactivo estándar con 4 opciones y retroalimentación inmediata.' },
  { name: 'Arrastrar y Soltar', type: 'Gamificado', icon: 'Layers', desc: 'Asociación de parejas, definiciones o clasificaciones visuales.' },
  { name: 'Completar Enunciado', type: 'Lenguaje', icon: 'BookOpen', desc: 'Rellenar huecos con palabras clave o términos gramaticales.' },
  { name: 'Escape Room', type: 'Gamificado', icon: 'ShieldCheck', desc: 'Candados numéricos, acertijos de lógica y pistas guiadas.' },
  { name: 'Duelo Boss RPG', type: 'Combate Pixi', icon: 'Swords', desc: 'Enfrentamiento épico donde los aciertos causan daño al monstruo.' },
  { name: 'Tarjetas de Memoria', type: 'Gamificado', icon: 'Sparkles', desc: 'Juego de parejas y memoria para vocabulario o fórmulas.' },
  { name: 'Línea de Tiempo', type: 'Historia', icon: 'TrendingUp', desc: 'Orden cronológico de eventos históricos o pasos procedimentales.' },
  { name: 'Ruleta de Preguntas', type: 'Gamificado', icon: 'HelpCircle', desc: 'Giro aleatorio de categorías con multiplicadores de puntos.' },
  { name: 'Verdadero o Falso', type: 'Evaluación', icon: 'CheckSquare', desc: 'Evaluación ágil de afirmaciones con justificación requerida.' },
  { name: 'Simulador Científico', type: 'Laboratorio', icon: 'Globe', desc: 'Incrustación de laboratorios PhET, GeoGebra, Desmos o Tinkercad.' },
  { name: 'Video Pedagógico', type: 'Multimedia', icon: 'Video', desc: 'Videoteca verificada con preguntas intermedias obligatorias.' },
  { name: 'Texto & Lectura', type: 'Contenido', icon: 'BookOpen', desc: 'Fragmentos de lectura guiada con narración por voz nativa.' },
  { name: 'Imagen Interactiva', type: 'Visual', icon: 'Eye', desc: 'Puntos calientes (hotspots) explorables con tarjetas explicativas.' },
  { name: 'Audio Narrado', type: 'Auditivo', icon: 'Play', desc: 'Pistas sonoras para listening en inglés o dictados.' },
  { name: 'Selección Múltiple', type: 'Evaluación', icon: 'CheckSquare', desc: 'Casillas de verificación para reactivos con varias respuestas.' },
  { name: 'Fórmula Matemática', type: 'Ciencias', icon: 'Zap', desc: 'Entrada guiada de ecuaciones, cálculo y resolución algebraica.' },
  { name: 'Pantalla de Victoria', type: 'Recompensa', icon: 'Award', desc: 'Cofres de recompensa con XP, monedas de oro y medallas oficiales.' }
];

function GuideContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Determinar rol activo inicial (del query param, del usuario logueado o profesor por defecto)
  const initialRole = (searchParams.get('role') as any) || user?.role || 'teacher';
  const [activeRole, setActiveRole] = useState<'teacher' | 'student' | 'parent' | 'admin'>(
    ['teacher', 'student', 'parent', 'admin', 'coordinator'].includes(initialRole) 
      ? (initialRole === 'coordinator' ? 'admin' : initialRole) 
      : 'teacher'
  );

  // Estados de Búsqueda Global en la Guía
  const [guideSearchQuery, setGuideSearchQuery] = useState('');

  // Estados de Vitrinas Interactivas
  const [selectedPetRace, setSelectedPetRace] = useState(PET_RACES[0]);
  const [pettingCount, setPettingCount] = useState(0);
  const [pettingHearts, setPettingHearts] = useState<{ id: number; x: number }[]>([]);
  const [avatarActionState, setAvatarActionState] = useState<'idle' | 'celebrate' | 'magic'>('idle');
  const [selectedHouse, setSelectedHouse] = useState(SANCTUARY_HOUSES[0]);

  // Estados del Buscador de Simuladores (para profesores)
  const [simSearchQuery, setSimSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSimId, setCopiedSimId] = useState<string | null>(null);

  // Estados del Acordeón de FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const roleData: RoleGuideData = GUIDE_ROLE_DATA[activeRole] || GUIDE_ROLE_DATA.teacher;

  // Manejador de Caricias a Mascota (Simulación de Petting Touch)
  const handlePetInteraction = () => {
    setPettingCount(prev => prev + 1);
    const newHeart = { id: Date.now(), x: Math.floor(Math.random() * 60) + 20 };
    setPettingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setPettingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1200);
  };

  // Manejador de Animaciones del Avatar
  const triggerAvatarAction = (action: 'celebrate' | 'magic') => {
    setAvatarActionState(action);
    setTimeout(() => setAvatarActionState('idle'), 2400);
  };

  // Filtrado reactivo de Pasos, Módulos y FAQs basado en guideSearchQuery
  const filteredSteps = useMemo(() => {
    const q = guideSearchQuery.toLowerCase().trim();
    if (!q) return roleData.steps;
    return roleData.steps.filter(st => 
      st.title.toLowerCase().includes(q) ||
      st.subtitle.toLowerCase().includes(q) ||
      st.description.toLowerCase().includes(q) ||
      st.highlights.some(h => h.toLowerCase().includes(q))
    );
  }, [roleData.steps, guideSearchQuery]);

  const filteredFeatures = useMemo(() => {
    const q = guideSearchQuery.toLowerCase().trim();
    if (!q) return roleData.features;
    return roleData.features.filter(feat => 
      feat.title.toLowerCase().includes(q) ||
      feat.category.toLowerCase().includes(q) ||
      feat.description.toLowerCase().includes(q) ||
      feat.benefit.toLowerCase().includes(q)
    );
  }, [roleData.features, guideSearchQuery]);

  const filteredFaqs = useMemo(() => {
    const q = guideSearchQuery.toLowerCase().trim();
    if (!q) return roleData.faq;
    return roleData.faq.filter(f => 
      f.q.toLowerCase().includes(q) ||
      f.a.toLowerCase().includes(q)
    );
  }, [roleData.faq, guideSearchQuery]);

  // Filtrado de Simuladores
  const filteredSimulators = useMemo(() => {
    return SIMULATORS_DIRECTORY.filter(sim => {
      const matchesCategory = selectedCategory === 'all' || sim.category === selectedCategory;
      const q = simSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        sim.name.toLowerCase().includes(q) ||
        sim.description.toLowerCase().includes(q) ||
        sim.organization.toLowerCase().includes(q) ||
        sim.tags.some(tag => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [simSearchQuery, selectedCategory]);

  const handleCopyUrl = (sim: SimulatorItem) => {
    navigator.clipboard.writeText(sim.embedUrl);
    setCopiedSimId(sim.id);
    setTimeout(() => setCopiedSimId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 pb-20 selection:bg-purple-500 selection:text-white">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link 
              href={activeRole === 'teacher' ? '/teacher' : activeRole === 'student' ? '/student' : activeRole === 'parent' ? '/parent' : '/admin'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Volver a la plataforma"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a ISkool</span>
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>Centro de Ayuda & Guía Maestra</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                    v2.4
                  </span>
                </h1>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  Colegio Anglo Mexicano • Ecosistema ISkool 2026
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción rápida en cabecera según el rol */}
          <div className="flex items-center gap-2">
            {activeRole === 'teacher' && (
              <>
                <Link
                  href="/teacher"
                  className="hidden md:flex px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs items-center gap-1.5 hover:bg-indigo-100 transition-all"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Bóveda Curricular</span>
                </Link>
                <Link
                  href="/teacher/studio"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Estudio de Actividades</span>
                  <span className="sm:hidden">Estudio</span>
                </Link>
              </>
            )}
            {activeRole === 'student' && (
              <>
                <Link
                  href="/student/avatar"
                  className="hidden md:flex px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs items-center gap-1.5 hover:bg-purple-100 transition-all"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Personalizador Avatar</span>
                </Link>
                <Link
                  href="/student"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Ir al Mapa de Misiones</span>
                </Link>
              </>
            )}
            {activeRole === 'parent' && (
              <Link
                href="/parent"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Panel Familiar</span>
              </Link>
            )}
            {activeRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className="hidden md:flex px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs items-center gap-1.5 hover:bg-purple-100 transition-all"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Portal Super Usuario</span>
                </Link>
                <Link
                  href="/coordinator"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel de Coordinación</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Selector de Segmento / Rol de Usuario */}
        <div className="p-2 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="text-center pb-2 pt-1">
            <span className="text-[11px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">
              Selecciona tu Perfil o Segmento Institucional:
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveRole('teacher')}
              className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeRole === 'teacher'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>👨‍🏫 Soy Profesor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('student')}
              className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>🎒 Soy Alumno</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('parent')}
              className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeRole === 'parent'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>👨‍👩‍👧 Tutor / Familia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>🏛️ Dirección / Admin</span>
            </button>
          </div>
        </div>

        {/* Buscador Rápido Global en la Guía */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-purple-500 dark:text-purple-400" />
            <input
              type="text"
              value={guideSearchQuery}
              onChange={(e) => setGuideSearchQuery(e.target.value)}
              placeholder="Buscar en el Centro de Ayuda (ej. mascotas, santuario, avatar, libros SEP, tokens, suspensión, 17 bloques)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"
            />
            {guideSearchQuery && (
              <button
                type="button"
                onClick={() => setGuideSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {guideSearchQuery && (
            <div className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 px-2 flex items-center justify-between">
              <span>Resultados encontrados: {filteredSteps.length} pasos, {filteredFeatures.length} módulos y {filteredFaqs.length} preguntas frecuentes.</span>
              <button
                type="button"
                onClick={() => setGuideSearchQuery('')}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Hero Banner del Rol Seleccionado */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-10 shadow-2xl border border-indigo-800/40">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{roleData.roleBadge}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {roleData.roleTitle}
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              {roleData.heroDescription}
            </p>

            {/* Beneficios Destacados */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roleData.keyBenefits.map((benefit, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2 text-xs font-bold text-slate-200">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces de anclaje rápido */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap gap-2 text-xs font-bold">
            <a href="#metodologia" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              📍 Metodología Gráfica
            </a>
            {activeRole === 'student' && (
              <>
                <a href="#mascotas-showcase" className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 transition-colors">
                  🐾 Mascotas & Evolución
                </a>
                <a href="#santuario-showcase" className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors">
                  🏡 Santuario & Casas
                </a>
                <a href="#avatar-showcase" className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 transition-colors">
                  🎨 Avatar Anime
                </a>
              </>
            )}
            {activeRole === 'teacher' && (
              <>
                <a href="#boveda" className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 transition-colors">
                  📚 Bóveda Curricular & Videoteca
                </a>
                <a href="#libros-sep" className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors">
                  📖 Libros SEP (0 Tokens)
                </a>
                <a href="#bloques-studio" className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 transition-colors">
                  🛠️ 17 Bloques del Estudio
                </a>
                <a href="#simuladores" className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition-colors">
                  🌐 50 Simuladores Web
                </a>
              </>
            )}
            {activeRole === 'admin' && (
              <>
                <a href="#super-usuario" className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition-colors">
                  ⚡ Auditoría de Tokens
                </a>
                <a href="#suspension-preservacion" className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors">
                  🔒 Suspensión & Preservación
                </a>
              </>
            )}
            <a href="#modulos" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              ⚡ Módulos & Herramientas
            </a>
            <a href="#faq" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              ❓ Preguntas Frecuentes
            </a>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        </div>

        {/* ================= VITRINA INTERACTIVA ESPECIAL: ESTUDIANTES ================= */}
        {activeRole === 'student' && (
          <section id="mascotas-showcase" className="space-y-8 scroll-mt-24">
            {/* Bloque 1: Mascotas Vivas y 10 Razas Elementales */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 text-white border-2 border-pink-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase border border-pink-400/30">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>Compañeros Místicos & Crianza Gamificada</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white mt-2">
                    10 Razas Elementales & 5 Etapas de Evolución
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-200 max-w-2xl mt-1 leading-relaxed">
                    Tu mascota escolar no es un dibujo estático: es un compañero vivo que responde a tus caricias con corazones y evoluciona de Huevo a Guardián Adulto conforme cumples tus tareas escolares.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-bold text-xs">
                    Vínculo EXP: +{pettingCount * 5}
                  </span>
                </div>
              </div>

              {/* Selector de Razas Elementales */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PET_RACES.map(race => (
                  <button
                    key={race.id}
                    type="button"
                    onClick={() => setSelectedPetRace(race)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                      selectedPetRace.id === race.id
                        ? 'bg-white/15 border-pink-400 shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{race.icon}</span>
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black/40 text-pink-300">
                        {race.element}
                      </span>
                    </div>
                    <strong className="text-xs font-black text-white block mt-1.5">{race.name}</strong>
                    <span className="text-[10px] text-slate-300 block">{race.title}</span>
                  </button>
                ))}
              </div>

              {/* Simulador de Caricias y Detalle de Raza */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-black/40 border border-pink-500/20 space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-pink-400">
                        Raza Seleccionada: {selectedPetRace.name} ({selectedPetRace.title})
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Elemento: {selectedPetRace.element}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedPetRace.desc}
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-200">
                      <strong>💡 Mecánica Tamagotchi:</strong> Alimenta a tu compañero (5🪙) para llenar su barra de Hambre y juega con él (2🪙) para elevar su Felicidad al 100%.
                    </div>
                  </div>

                  {/* Botón Interactivo de Caricia con corazones animados */}
                  <div className="pt-3 border-t border-white/10 relative">
                    <button
                      type="button"
                      onClick={handlePetInteraction}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer relative"
                    >
                      <Heart className="w-4 h-4 fill-white animate-pulse" />
                      <span>¡Tocar para Acariciar! (Petting Touch)</span>
                      <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">Caricias: {pettingCount}</span>
                    </button>

                    {/* Corazones flotantes */}
                    {pettingHearts.map(h => (
                      <span
                        key={h.id}
                        style={{ left: `${h.x}%` }}
                        className="absolute bottom-12 text-pink-400 text-lg font-black pointer-events-none animate-bounce"
                      >
                        💖 +5 Vínculo
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hitos de Evolución */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Línea del Tiempo de Evolución por Tareas</span>
                  </span>

                  <div className="space-y-2">
                    {EVOLUTION_STAGES.map((st) => (
                      <div key={st.stage} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <span className="text-xl shrink-0">{st.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <strong className="text-xs font-black text-white">{st.name}</strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                              {st.req}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: Santuario y 5 Casas Temáticas */}
            <div id="santuario-showcase" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-black uppercase">
                    <Home className="w-3.5 h-3.5" />
                    <span>Hogar Gamificado & Descanso</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    5 Casas Temáticas & Regeneración de Energía
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
                    Cada casa cuenta con efectos de partículas ambientales, matriz de 32 ranuras para muebles y 10 camas progresivas que regeneran tu energía de +10⚡ hasta +300⚡.
                  </p>
                </div>

                <Link
                  href="/student"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Ver Mi Santuario</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {SANCTUARY_HOUSES.map(house => (
                  <div
                    key={house.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${house.color} text-white font-black text-xs flex items-center justify-center mb-2 shadow-sm`}>
                        🏡
                      </span>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                        {house.name}
                      </strong>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                        {house.atmosphere}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      ★ {house.bonus}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque 3: Personalizador de Avatar Anime Shonen / Hechicera */}
            <div id="avatar-showcase" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-indigo-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase border border-purple-400/30">
                    <Smile className="w-3.5 h-3.5" />
                    <span>Identidad Visual Shonen & Hechicera</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white mt-2">
                    Personalizador Modular & Animaciones en Vivo
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-200 max-w-2xl mt-1 leading-relaxed">
                    Combina más de 15 estilos de cabello, 15 colores, tonos de piel, rasgos míticos y 6 categorías de guardarropa. Tu personaje camina a escala 3x sobre el Mapa de Aventuras y reacciona con animaciones dinámicas.
                  </p>
                </div>

                <Link
                  href="/student/avatar"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all shrink-0"
                >
                  <Smile className="w-4 h-4" />
                  <span>Abrir Personalizador de Avatar</span>
                </Link>
              </div>

              {/* Botones de Animaciones Interactivas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-black uppercase text-amber-300">🎉 Celebración Acrobática</span>
                  <p className="text-xs text-slate-300">
                    Tu avatar realiza un salto mortal de 360 grados acompañado de una lluvia de confeti dorado y vítores de victoria.
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerAvatarAction('celebrate')}
                    className="mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer transition-all"
                  >
                    {avatarActionState === 'celebrate' ? '¡Celebrando con Confeti! 🎊' : 'Probar Celebración'}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-black uppercase text-purple-300">✨ Magia Arcana</span>
                  <p className="text-xs text-slate-300">
                    Canaliza un orbe de energía elemental con destellos de poder mágico que iluminan la pantalla durante los combates RPG.
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerAvatarAction('magic')}
                    className="mt-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer transition-all"
                  >
                    {avatarActionState === 'magic' ? '¡Lanzando Magia Elemental! ⚡' : 'Probar Lanzar Magia'}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-black uppercase text-cyan-300">👗 Guardarropa de 6 Categorías</span>
                  <p className="text-xs text-slate-300">
                    Equipa calzado, pantalones/faldas, torso escolar, capas míticas, sombreros y varitas mágicas desbloqueadas en la Tienda.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Calzado', 'Pantalones', 'Camisas', 'Capas', 'Sombreros', 'Varitas'].map(c => (
                      <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= VITRINA INTERACTIVA ESPECIAL: PROFESORES ================= */}
        {activeRole === 'teacher' && (
          <>
            {/* Bloque 1: Bóveda Curricular & Videoteca Pedagógica */}
            <section id="boveda" className="space-y-6 scroll-mt-24">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-indigo-500/40 shadow-2xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase border border-indigo-400/30">
                      <Database className="w-3.5 h-3.5" />
                      <span>Segundo Cerebro Docente • NEM 2024</span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-black text-white mt-2">
                      Bóveda Curricular (703 Nodos) & Videoteca Certificada
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl mt-1 leading-relaxed">
                      El sistema integra 703 planeaciones oficiales de la Nueva Escuela Mexicana (Fases 3, 4, 5 y 6) con arquitectura Vault-First, respuesta en menos de 5 milisegundos y respaldo por Inteligencia Artificial Pedagógica.
                    </p>
                  </div>

                  <Link
                    href="/teacher"
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <Database className="w-4 h-4" />
                    <span>Abrir Planificador Didáctico</span>
                  </Link>
                </div>

                {/* Grid explicativo de la Bóveda Curricular */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white">1. Consulta Prioritaria (Vault-First)</h4>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Al solicitar una planeación o tema, el sistema revisa primero los 703 nodos preexistentes en la Bóveda local. Si existe, se entrega al instante (<span className="text-emerald-400 font-bold">&lt;5ms</span>) evitando duplicidad y demoras.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white">2. Fallback con IA Pedagógica</h4>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Solo en caso de no encontrarse un nodo previo, el Asistente Pedagógico IA genera la planeación completa con PDA oficial, momentos didácticos (Inicio, Desarrollo y Cierre) y rúbricas analíticas.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white">3. Persistencia & Sincronización</h4>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Toda planeación generada se guarda de inmediato como archivo Markdown con metadatos YAML y enlaces bidireccionales, sincronizándose automáticamente con el Repositorio Central institucional.
                    </p>
                  </div>
                </div>

                {/* Sub-bloque: Videoteca Multidisciplinaria */}
                <div className="p-6 rounded-2xl bg-black/30 border border-indigo-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-400">
                    <Video className="w-4 h-4" />
                    <span>Videoteca Pedagógica Multidisciplinaria (oEmbed 200 OK)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <strong className="text-cyan-300 block mb-1">🇬🇧 Inglés (A1 - B2)</strong>
                      <p className="text-[11px] text-slate-300">Verbos regulares/irregulares, tiempos verbales y comprensión auditiva en BBC Learning English y AgendaWeb.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <strong className="text-amber-300 block mb-1">📐 Matemáticas</strong>
                      <p className="text-[11px] text-slate-300">Aritmética, fracciones, álgebra y geometría en Khan Academy y GeoGebra.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <strong className="text-emerald-300 block mb-1">🧬 Ciencias & Naturaleza</strong>
                      <p className="text-[11px] text-slate-300">Biología, física, química y ecosistemas con simuladores PhET y EncicloVida.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <strong className="text-purple-300 block mb-1">📖 Español & Historia</strong>
                      <p className="text-[11px] text-slate-300">Lectura, gramática y memoria histórica con libros oficiales Conaliteg y el INAH.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-slate-300 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Garantía de Enlaces Vivos:</strong> Videos verificados sin publicidad ni contenidos comerciales.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Purga Automática:</strong> Si un video es retirado, el botón de reporte lo reemplaza en milisegundos.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bloque 2: Libros de Texto SEP & Cuaderno Inteligente a 0 Tokens */}
            <section id="libros-sep" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-6 scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Contenido Oficial de la SEP • 0 Tokens</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Libros Digitales SEP & Cuaderno Inteligente
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
                    Aprovecha los libros de texto gratuitos de Primaria y Secundaria de Conaliteg con indexación directa a 0 tokens y fundamentación de preguntas con citas exactas de página.
                  </p>
                </div>

                <Link
                  href="/teacher"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explorar Libros SEP</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                    📚 Catálogo Gratuito Oficial
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Acceso instantáneo a los libros de texto de la SEP organizados por Fase y Grado, sin depender de descargas pesadas ni enlaces externos inestables.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                    ⚡ Mapeo a Coste Cero (0 Tokens)
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    La extracción estructural directa permite a los docentes vincular lecturas y problemas oficiales a sus planeaciones sin consumir la cuota de IA del plantel.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                    📝 Citas de Página en Q&A
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    El Cuaderno Inteligente resuelve dudas de los alumnos señalando el tomo, capítulo y número de página exacto de donde se fundamenta la respuesta.
                  </p>
                </div>
              </div>
            </section>

            {/* Bloque 3: Estudio de Actividades con los 17 Bloques Gamificados */}
            <section id="bloques-studio" className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6 scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black uppercase">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Lienzo Digital • 17 Mecánicas Interactivas</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Catálogo de los 17 Bloques del Estudio Docente
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
                    Combina y conecta cualquier secuencia de nodos didácticos jalando flechas entre los puertos de salida (●) y entrada.
                  </p>
                </div>

                <Link
                  href="/teacher/studio"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Crear en el Estudio</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {STUDIO_BLOCKS.map(block => (
                  <div
                    key={block.name}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 shadow-xs flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {block.type}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-700 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        {renderIcon(block.icon, "w-3.5 h-3.5")}
                      </div>
                    </div>
                    <div>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block">
                        {block.name}
                      </strong>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                        {block.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ================= VITRINA INTERACTIVA ESPECIAL: DIRECTORES Y SUPER USUARIOS ================= */}
        {activeRole === 'admin' && (
          <section id="super-usuario" className="space-y-6 scroll-mt-24">
            {/* Bloque 1: Auditoría de Tokens en Tiempo Real */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border-2 border-cyan-500/40 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase border border-cyan-400/30">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Portal de Super Usuario • Auditoría en Vivo</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white mt-2">
                    Métricas de Consumo de Tokens & Eficiencia de IA
                  </h3>
                  <p className="text-xs sm:text-sm text-cyan-200 max-w-2xl mt-1 leading-relaxed">
                    Monitoreo en tiempo real del uso del Motor de IA Pedagógica, costo acumulado por plantel, llamadas a la API y el impacto del ahorro generado por la Bóveda Curricular.
                  </p>
                </div>

                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all shrink-0"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Ver Portal Super Usuario</span>
                </Link>
              </div>

              {/* Tarjetas de Métricas Simuladas en Tiempo Real */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-cyan-300">Total Tokens Consumidos</span>
                  <div className="text-xl font-black text-white">412,850</div>
                  <span className="text-[10px] text-emerald-400 font-bold">● Dentro de cuota institucional</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-300">Ahorro Vault-First</span>
                  <div className="text-xl font-black text-emerald-400">88.4%</div>
                  <span className="text-[10px] text-slate-300">Resuelto en &lt;5ms sin tokens</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-300">Costo Estimado</span>
                  <div className="text-xl font-black text-amber-400">$0.82 USD</div>
                  <span className="text-[10px] text-slate-300">Optimizador activo</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-300">Planteles Auditados</span>
                  <div className="text-xl font-black text-purple-400">100%</div>
                  <span className="text-[10px] text-slate-300">Colegio Anglo Mexicano</span>
                </div>
              </div>
            </div>

            {/* Bloque 2: Suspensión Escolar y Preservación Curricular */}
            <div id="suspension-preservacion" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tarjeta Suspensión */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Control Deslizante de Suspensión Institucional</span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Bloqueo Inmediato con Candado Multi-Cuenta
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  El panel directivo incorpora un interruptor deslizante por plantel. Al suspender una escuela, se activa de forma instantánea un candado administrativo que impide el inicio de sesión y muestra un aviso institucional sin alterar las calificaciones ni historiales escolares.
                </p>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Reactivación al instante:</strong> Vuelve a deslizar el interruptor para restablecer el acceso sin demoras.</span>
                </div>
              </div>

              {/* Tarjeta Preservación Curricular */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                  <Database className="w-4 h-4" />
                  <span>Cláusula de Preservación Curricular</span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Acervo Protegido del Prof. Israel López Ángeles
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Si se elimina un plantel escolar inactivo o de prueba, el sistema aplica la Cláusula de Preservación Curricular: las cuentas temporales se eliminan, pero todas las planeaciones y actividades de la Bóveda se preservan de por vida y se re-acreditan al Prof. Israel López Ángeles en el Repositorio Central.
                </p>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Cero Pérdida Pedagógica:</strong> El acervo curricular de la Nueva Escuela Mexicana queda blindado.</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= SECCIÓN 1: METODOLOGÍA GRÁFICA (PASO A PASO VISUAL) ================= */}
        <section id="metodologia" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                Metodología Gráfica
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Cómo Usar ISkool Paso a Paso ({roleData.roleBadge})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredSteps.map((step) => (
              <div 
                key={step.stepNumber}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${step.colorClass} text-white font-black text-xs flex items-center justify-center shadow-md`}>
                      {step.stepNumber}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {step.badgeText}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      {step.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Puntos Clave */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                  {step.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredSteps.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 text-xs text-slate-500">
              No hay pasos que coincidan con la búsqueda &ldquo;{guideSearchQuery}&rdquo;.
            </div>
          )}
        </section>

        {/* ================= SECCIÓN 2: MÓDULOS & HERRAMIENTAS CLAVE ================= */}
        <section id="modulos" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                Ecosistema Modular
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Módulos y Herramientas ({roleData.roleBadge})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFeatures.map((feat) => (
              <div
                key={feat.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {feat.category}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {renderIcon(feat.icon, "w-4 h-4")}
                    </div>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feat.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
                    <strong className="text-purple-600 dark:text-purple-400 block mb-0.5">Ventaja Clave:</strong>
                    {feat.benefit}
                  </div>

                  {feat.actionUrl && (
                    <Link
                      href={feat.actionUrl}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{feat.actionLabel || 'Explorar'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 text-xs text-slate-500">
              No hay módulos que coincidan con la búsqueda &ldquo;{guideSearchQuery}&rdquo;.
            </div>
          )}
        </section>

        {/* ================= SECCIÓN ESPECIAL PROFESORES: DIRECTORIO DE LOS 50 SIMULADORES ================= */}
        {activeRole === 'teacher' && (
          <section id="simuladores" className="space-y-6 pt-4 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-purple-900/20 border-2 border-cyan-500/30 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Directorio Oficial de Recursos Interactivos</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    50 Sitios Web y Simuladores Compatibles
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
                    Incrusta laboratorios científicos PhET, graficadores Desmos, modelos 3D de anatomía o simuladores de circuitos en tus actividades con un solo clic.
                  </p>
                </div>

                {/* Buscador de simuladores en tiempo real */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={simSearchQuery}
                    onChange={(e) => setSimSearchQuery(e.target.value)}
                    placeholder="Buscar simulador o tema..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Filtros de Categoría */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'all', label: 'Todos (50)' },
                  { id: 'physics', label: '⚡ Física y Mecánica (10)' },
                  { id: 'math', label: '📐 Matemáticas & GeoGebra (10)' },
                  { id: 'chemistry', label: '🧪 Química & Moléculas (8)' },
                  { id: 'biology', label: '🧬 Biología & Astronomía (8)' },
                  { id: 'robotics', label: '🤖 Robótica & Arduino (8)' },
                  { id: 'humanities', label: '🌍 Artes & Geografía (6)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid de Simuladores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSimulators.map((sim) => {
                  const isCopied = copiedSimId === sim.id;
                  return (
                    <div
                      key={sim.id}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                            {sim.categoryLabel}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {sim.recommendedGrades}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                          {sim.name}
                        </h4>

                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                          🏛️ {sim.organization}
                        </span>

                        <p className="text-xs text-slate-600 dark:text-zinc-300">
                          {sim.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300">
                          <strong className="text-cyan-600 dark:text-cyan-400 block mb-0.5">💡 Consejo Pedagógico:</strong>
                          {sim.pedagogicalTip}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(sim)}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isCopied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? '¡URL Copiada!' : 'Copiar URL'}</span>
                        </button>

                        <a
                          href={sim.embedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
                          title="Probar en pestaña nueva"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSimulators.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-2">
                  <p className="text-xs text-slate-500">No se encontraron simuladores con el término &ldquo;{simSearchQuery}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => { setSimSearchQuery(''); setSelectedCategory('all'); }}
                    className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= SECCIÓN 3: PREGUNTAS FRECUENTES (FAQ) ================= */}
        <section id="faq" className="space-y-4 pt-4 scroll-mt-24">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
              Resolución de Dudas
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Preguntas Frecuentes ({roleData.roleBadge})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faqItem, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    className="w-full p-4 text-left font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  >
                    <span>{faqItem.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-purple-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed border-t border-slate-100 dark:border-zinc-800 pt-3 animate-fade-in">
                      {faqItem.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 text-xs text-slate-500">
              No hay preguntas frecuentes que coincidan con la búsqueda &ldquo;{guideSearchQuery}&rdquo;.
            </div>
          )}
        </section>

        {/* Banner de Soporte Técnico Institucional */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            ¿Necesitas asesoría personalizada o capacitación en el aula?
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            El equipo de Coordinación Académica e Innovación Tecnológica del Colegio Anglo Mexicano está a tu entera disposición.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-500 text-xs font-bold">
        Cargando Centro de Ayuda & Guía ISkool...
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}
