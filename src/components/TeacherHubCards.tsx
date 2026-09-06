"use client";

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Globe, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Palette, 
  HeartHandshake,
  BrainCircuit,
  GraduationCap,
  Shield,
  Zap,
  Radio
} from 'lucide-react';

interface TeacherHubCardsProps {
  onSelectAction: (action: 'classroom' | 'classes' | 'studio' | 'community') => void;
  teacherName?: string;
}

export const TeacherHubCards: React.FC<TeacherHubCardsProps> = ({ 
  onSelectAction, 
  teacherName = 'Profesor(a)' 
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 animate-fade-in">
      {/* Saludo y Cabecera del Hub - Diseño Minimalista y Sofisticado */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Panel Docente • Acciones Clave en 1 Clic</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          ¡Hola, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">{teacherName}</span>!
        </h1>
        
        <p className="text-sm sm:text-base font-normal text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Bienvenido a tu espacio docente. Diseñado para trabajar sin fricción cognitiva: selecciona un módulo para iniciar tu sesión.
        </p>
      </div>

      {/* Grid de las 4 Tarjetas de Módulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-2">
        
        {/* TARJETA 1: AULA DIGITAL & GREMIO (ÍNDIGO & LLAMA NARANJA) */}
        <div 
          onClick={() => onSelectAction('classroom')}
          className="group relative bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                ⚡ En Vivo
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Convivencia & Dinámicas
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                🏛️ Aula Digital & Gremio
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                Edictos del aula, termómetro socioemocional, modo proyector en vivo y ruleta del héroe.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-xs">
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Proyector y Ruleta</span>
              </li>
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Termómetro Socioemocional</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform relative z-10">
            <span>Entrar al Aula</span>
            <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* TARJETA 2: MIS CLASES & EVALUACIÓN (AZUL ZAFIRO & CIAN ACADÉMICO) */}
        <div 
          onClick={() => onSelectAction('classes')}
          className="group relative bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                📋 Gestión Oficial
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Estructura & Seguimiento
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                📚 Mis Clases & Evaluación
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                Gestiona la asistencia diaria, portafolio de evidencias y asigna calificaciones formativas NEM.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-xs">
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Portafolio de evidencias</span>
              </li>
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Control de asistencia rápido</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform relative z-10">
            <span>Entrar a Mis Clases</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* TARJETA 3: CREAR ACTIVIDAD (HERO CARD - PÚRPURA MÁGICO) */}
        <Link 
          href="/teacher/studio"
          onClick={() => onSelectAction('studio')}
          className="group relative bg-gradient-to-br from-purple-700 via-violet-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 border border-purple-400/30 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                <Palette className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/40 text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Creación Pedagógica</span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-amber-300">
                Estudio Interactivo
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                🎨 Crear Actividad
              </h2>
              <p className="text-xs text-purple-100/90 leading-relaxed line-clamp-3">
                Diseña experiencias interactivas y retos gamificados alineados al currículo oficial.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-white/15 text-xs">
              <li className="flex items-center gap-1.5 font-medium text-purple-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>40+ Retos y Dinámicas</span>
              </li>
              <li className="flex items-center gap-1.5 font-medium text-purple-100">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Alineación oficial con PDAs</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-amber-200 font-semibold text-xs group-hover:translate-x-0.5 transition-transform relative z-10">
            <span>Abrir Estudio ISkool</span>
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-all">
              <ArrowRight className="w-3.5 h-3.5 font-bold" />
            </div>
          </div>
        </Link>

        {/* TARJETA 4: COMUNIDAD DOCENTE (VERDE ESMERALDA & MENTA) */}
        <Link 
          href="/teacher/community"
          onClick={() => onSelectAction('community')}
          className="group relative bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-400/50 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                🌱 Red Colaborativa
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Crecimiento & Prácticas
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                🌍 Comunidad Docente
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                Explora actividades creadas por otros profesores, vota por tus favoritas y clónalas a tu aula.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-xs">
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Votación comunitaria</span>
              </li>
              <li className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>Clona plantillas listas para usar</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-xs group-hover:translate-x-0.5 transition-transform relative z-10">
            <span>Explorar Comunidad</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};
