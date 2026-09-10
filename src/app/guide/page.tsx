"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GUIDE_ROLE_DATA, RoleGuideData, RoleFeature } from '@/data/guideRoleContent';
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
  Cpu
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
    default: return <Sparkles className={className} />;
  }
};

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

  // Estados del Buscador de Simuladores (para profesores)
  const [simSearchQuery, setSimSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSimId, setCopiedSimId] = useState<string | null>(null);

  // Estados del Acordeón de FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const roleData: RoleGuideData = GUIDE_ROLE_DATA[activeRole] || GUIDE_ROLE_DATA.teacher;

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
              href={activeRole === 'teacher' ? '/teacher' : activeRole === 'student' ? '/student' : activeRole === 'parent' ? '/parent' : '/'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Volver a la plataforma"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a ISkool</span>
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  Centro de Ayuda & Guía Maestra
                </h1>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  Colegio Anglo Mexicano • Ecosistema ISkool 2026
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción rápida en cabecera */}
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
              <Link
                href="/student"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Ir al Mapa de Misiones</span>
              </Link>
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
              <Link
                href="/coordinator"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel de Coordinación</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Selector de Segmento / Rol de Usuario */}
        <div className="p-2 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="text-center pb-2 pt-1">
            <span className="text-[11px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">
              Selecciona tu Perfil o Segmento de Usuario:
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
            {activeRole === 'teacher' && (
              <>
                <a href="#boveda" className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 transition-colors">
                  📚 Bóveda Curricular & Videoteca
                </a>
                <a href="#simuladores" className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition-colors">
                  🌐 50 Simuladores Web
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

        {/* ================= SECCIÓN 1: PASO A PASO VISUAL ================= */}
        <section id="metodologia" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                Metodología Gráfica
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Cómo Usar ISkool Paso a Paso
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {roleData.steps.map((step) => (
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
        </section>

        {/* ================= SECCIÓN ESPECIAL PROFESORES: BÓVEDA CURRICULAR & VIDEOTECA MULTIDISCIPLINARIA ================= */}
        {activeRole === 'teacher' && (
          <section id="boveda" className="space-y-6 pt-4 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-indigo-500/40 shadow-2xl space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase border border-indigo-400/30">
                    <Database className="w-3.5 h-3.5" />
                    <span>Segundo Cerebro Docente • NEM 2024</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white mt-2">
                    Bóveda Curricular & Videoteca Pedagógica Certificada
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl mt-1 leading-relaxed">
                    El sistema integra 703 planeaciones oficiales de la Nueva Escuela Mexicana (Fases 3, 4, 5 y 6) con arquitectura Vault-First, búsqueda instantánea en menos de 5 milisegundos y respaldo por Inteligencia Artificial Pedagógica.
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
                {/* Tarjeta 1: Vault-First */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-white">1. Consulta Prioritaria (Vault-First)</h4>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Al solicitar una planeación o tema, el sistema revisa primero los 703 nodos preexistentes en la Bóveda local. Si existe, se entrega al instante (<span className="text-emerald-400 font-bold">&lt;5ms</span>) evitando duplicidad y demoras.
                  </p>
                </div>

                {/* Tarjeta 2: Fallback con Motor de IA */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-white">2. Fallback con IA Pedagógica</h4>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Solo en caso de no encontrarse un nodo previo, la Inteligencia Artificial Pedagógica genera la planeación completa con PDA oficial, momentos didácticos (Inicio, Desarrollo y Cierre) y rúbricas analíticas.
                  </p>
                </div>

                {/* Tarjeta 3: Persistencia Automática */}
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

              {/* Sub-bloque: Videoteca Multidisciplinaria & Verificación en Vivo */}
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
                    <span><strong>Garantía de Enlaces Vivos:</strong> Videos filtrados sin publicidad ni enlaces comerciales.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Reporte Instantáneo:</strong> Si detectas un enlace caído, haz clic en reportar y el sistema lo reemplaza en milisegundos.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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
            {roleData.features.map((feat) => (
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

                {/* Buscador en tiempo real */}
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
                    className="text-xs font-bold text-cyan-600 hover:underline"
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
            {roleData.faq.map((faqItem, fIdx) => {
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
        </section>

        {/* Banner de Soporte Técnico Institucional */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            ¿Necesitas asesoría personalizada o capacitación en el aula?
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            El equipo de Coordinación Académica e Innovación Tecnológica del Colegio Anglo Mexicano está a tu disposición.
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
