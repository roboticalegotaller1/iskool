"use client";

import React from 'react';
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
  Radio,
  FileSpreadsheet,
  CheckCheck,
  Compass
} from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';

export interface TeacherHubCardsProps {
  onSelectAction: (action: 'classroom' | 'classes' | 'studio' | 'community' | 'planning' | 'attendance') => void;
  teacherName?: string;
}

export const TeacherHubCards: React.FC<TeacherHubCardsProps> = ({ 
  onSelectAction, 
  teacherName = 'Profesor(a)' 
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 animate-fade-in">
      {/* Cabecera del Hub - Diseño Minimalista B2B */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Sistema Bento • Centro de Mando Docente</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            ¡Hola, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">{teacherName}</span>!
          </h1>
          
          <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Navegación asimétrica optimizada para reducir clics y maximizar la productividad pedagógica diaria.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Periodo Escolar Activo • Ciclo 2026-2027</span>
        </div>
      </div>

      {/* Cuadrícula Asimétrica: SISTEMA BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* CARD HERO 1: ESTUDIO ISKOOL (Creación con Inteligencia Artificial Pedagógica) */}
        {/* Ocupa 2 columnas y 2 filas para dominio visual */}
        <BentoCard
          colSpan="col-span-1 md:col-span-2 lg:col-span-2"
          rowSpan="row-span-1 md:row-span-2"
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/30 shadow-xl shadow-indigo-950/20 flex flex-col justify-between"
          onClick={() => onSelectAction('studio')}
          icon={
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/40 flex items-center justify-center text-white shadow-inner">
              <Palette className="w-6 h-6 text-teal-300" />
            </div>
          }
          badge={
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Motor de IA Pedagógica</span>
            </span>
          }
          subtitle="Creación & Gamificación Curricular"
          title={<span className="text-xl sm:text-2xl font-black text-white">🎨 Estudio ISkool</span>}
          footer={
            <div className="flex items-center justify-between text-teal-300 font-bold text-xs pt-2">
              <span className="flex items-center gap-1.5">
                <span>Abrir Estudio Interactivo</span>
                <span className="text-[10px] text-slate-400 font-normal">(Trilingüe ES/EN/FR)</span>
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 font-black" />
              </div>
            </div>
          }
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Genera retos gamificados, evaluaciones formativas y secuencias didácticas alineadas con precisión a los PDAs oficiales de la SEP y NEM 2024.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Catálogo</div>
                <div className="text-sm font-bold text-white mt-0.5">40+ Retos y Dinámicas</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Currículo</div>
                <div className="text-sm font-bold text-teal-300 mt-0.5">NEM SEP Certificado</div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* CARD 2: MIS CLASES & EVALUACIÓN */}
        {/* Ocupa 2 columnas en pantallas medianas/grandes */}
        <BentoCard
          colSpan="col-span-1 md:col-span-2 lg:col-span-2"
          onClick={() => onSelectAction('classes')}
          className="border-slate-200/80 dark:border-zinc-800/80"
          icon={
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
          }
          badge={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              📋 Gestión Oficial
            </span>
          }
          subtitle="Seguimiento Formativo & Evidencias"
          title="📚 Mis Clases & Evaluación"
          footer={
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-xs">
              <span>Entrar al Portafolio y Calificaciones</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          }
        >
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Supervisa alumnos por grupo, revisa evidencias entregadas y asigna retroalimentación con rúbricas analíticas de evaluación formativa.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Portafolio de Evidencias y Rúbricas NEM</span>
            </div>
          </div>
        </BentoCard>

        {/* CARD 3: AULA DIGITAL & GREMIO */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('classroom')}
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              ⚡ En Vivo
            </span>
          }
          subtitle="Convivencia"
          title="🏛️ Aula Digital"
          footer={
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <span>Modo Proyector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Edictos de clase, ruleta de participación y termómetro socioemocional interactivo.
          </p>
        </BentoCard>

        {/* CARD 4: COMUNIDAD DOCENTE */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('community')}
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              🌱 Red Global
            </span>
          }
          subtitle="Colaboración"
          title="🌍 Comunidad"
          footer={
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <span>Clonar Plantillas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Explora actividades creadas por otros profesores, vota y clónalas directamente a tus materias.
          </p>
        </BentoCard>

        {/* CARD 5: PLANEACIÓN CURRICULAR NEM */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('planning')}
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Compass className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              📖 Bóveda Curricular
            </span>
          }
          subtitle="Secuencias Didácticas"
          title="📑 Planeación NEM"
          footer={
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold text-xs">
              <span>Abrir Planeador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Consulta inmediata desde la Bóveda Central con fallback pedagógico de Inteligencia Artificial.
          </p>
        </BentoCard>

        {/* CARD 6: CONTROL DE ASISTENCIA DIARIA */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('attendance')}
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CheckCheck className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
              ⏱️ 1 Clic
            </span>
          }
          subtitle="Pase de Lista"
          title="📋 Asistencia Diaria"
          footer={
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-bold text-xs">
              <span>Tomar Lista</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Registro ágil por grupo: presente, falta, retardo y justificación con sincronización institucional.
          </p>
        </BentoCard>

      </div>
    </div>
  );
};
