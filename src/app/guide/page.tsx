"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GUIDE_ROLE_DATA, RoleGuideData } from '@/data/guideRoleContent';
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
  Filter,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

          {/* Botón de acceso directo al Estudio (si es docente) */}
          <div className="flex items-center gap-2">
            {activeRole === 'teacher' && (
              <Link
                href="/teacher/studio"
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir Creador de Actividades</span>
                <span className="sm:hidden">Estudio</span>
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

          {/* Decoración de fondo */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        </div>

        {/* ================= SECCIÓN: PASO A PASO VISUAL ================= */}
        <section className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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

        {/* ================= SECCIÓN ESPECIAL PROFESORES: DIRECTORIO DE LOS 50 SIMULADORES ================= */}
        {activeRole === 'teacher' && (
          <section id="simuladores" className="space-y-6 pt-4">
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

        {/* ================= SECCIÓN: PREGUNTAS FRECUENTES (FAQ) ================= */}
        <section className="space-y-4 pt-4">
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

        {/* Banner de Soporte Técnico */}
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
