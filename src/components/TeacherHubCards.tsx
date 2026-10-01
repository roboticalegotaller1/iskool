"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Globe, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Palette, 
  Shield, 
  CheckCheck, 
  Compass,
  GraduationCap,
  Building2,
  Check,
  Languages,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';

export interface TeacherHubCardsProps {
  onSelectAction: (action: 'classroom' | 'classes' | 'studio' | 'community' | 'planning' | 'attendance' | 'idiomas') => void;
  teacherName?: string;
  totalStudents?: number;
  pendingReviews?: number;
  vaultPlans?: number;
}

interface IbimeCampus {
  id: string;
  name: string;
  shortName: string;
  cct: string;
  badge: string;
}

const IBIME_CAMPUSES: IbimeCampus[] = [
  {
    id: 'montes',
    name: 'Campus Montes (Sede Central & CCH)',
    shortName: 'Montes',
    cct: '15PPR3322G',
    badge: 'Sede Matriz · CCH UNAM'
  },
  {
    id: 'lagos',
    name: 'Campus Lagos (Fundador 2004)',
    shortName: 'Lagos',
    cct: '15PES0124X',
    badge: 'Fundador · Bilingüe Integral'
  },
  {
    id: 'sancristobal',
    name: 'Campus San Cristóbal (Ecatepec Centro)',
    shortName: 'San Cristóbal',
    cct: '15PES0891Z',
    badge: 'Centro Integral · Idiomas'
  },
  {
    id: 'coacalco',
    name: 'Campus Coacalco (Zarzaparrillas)',
    shortName: 'Coacalco',
    cct: '15PPR4411K',
    badge: 'Valle de México · ESL/FLE'
  }
];

export const TeacherHubCards: React.FC<TeacherHubCardsProps> = ({ 
  onSelectAction, 
  teacherName = 'Profesor(a)',
  totalStudents = 184,
  pendingReviews = 12,
  vaultPlans = 38
}) => {
  const [selectedCampusId, setSelectedCampusId] = useState<string>('montes');

  const selectedCampus = IBIME_CAMPUSES.find(c => c.id === selectedCampusId) || IBIME_CAMPUSES[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* =========================================================================
          CABECERA INSTITUCIONAL DEL CENTRO DE MANDO DOCENTE (IBIME BENTO 2.0)
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#0F172A] to-[#1a0808] border border-[#E41B14]/40 shadow-2xl shadow-red-950/20 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-xl shrink-0">
            <IbimeOfficialLogo variant="shield_only" size={52} />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-md bg-[#E41B14]/20 border border-[#E41B14]/40 text-red-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E41B14] animate-pulse" />
                Instituto Bilingüe IBIME S.C.
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-amber-400 font-mono">CCT {selectedCampus.cct}</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-cyan-300 font-semibold">{selectedCampus.shortName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>¡Hola,</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                {teacherName}
              </span>
              <span>!</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consola docente de gestión integral, secuencias didácticas NEM 2024, laboratorios orales de idiomas y seguimiento formativo continuo.
            </p>
          </div>
        </div>

        {/* Controles de Plantel y Ciclo Activo */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
          {/* Selector de Plantel IBIME */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner text-xs">
            <Building2 className="w-4 h-4 text-red-500 shrink-0" />
            <label htmlFor="hub-campus-select" className="text-slate-400 font-bold hidden sm:inline">Plantel:</label>
            <select
              id="hub-campus-select"
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-hidden cursor-pointer"
            >
              {IBIME_CAMPUSES.map(campus => (
                <option key={campus.id} value={campus.id} className="bg-slate-900 text-white">
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Distintivo de Ciclo Escolar */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/80 border border-slate-700 px-3.5 py-2 rounded-2xl shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
            <span>Ciclo Escolar 2026-2027</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE MÉTRICAS RÁPIDAS (KPIs DOCENTES)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Alumnos Activos</span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalStudents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onSelectAction('classes')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-sm hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Por Revisar</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{pendingReviews} evidencias</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onSelectAction('planning')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-sm hover:border-purple-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">Bóveda Curricular</span>
            <span className="text-xl sm:text-2xl font-black text-purple-400">{vaultPlans} planes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Capacidad IA</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">99.8% Óptima</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* =========================================================================
          CUADRÍCULA ASIMÉTRICA: SISTEMA BENTO GRID 2.0
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-[minmax(190px,auto)]">
        
        {/* CARD HERO 1: ESTUDIO PEDAGÓGICO & BÓVEDA CURRICULAR (2x2) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-2 lg:col-span-2"
          rowSpan="row-span-1 md:row-span-2"
          className="bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1e0a0a] text-white border-[#E41B14]/40 shadow-2xl shadow-red-950/20 flex flex-col justify-between"
          onClick={() => onSelectAction('studio')}
          icon={
            <div className="w-12 h-12 rounded-2xl bg-[#E41B14]/20 backdrop-blur-md border border-[#E41B14]/50 flex items-center justify-center text-white shadow-inner">
              <Palette className="w-6 h-6 text-red-400" />
            </div>
          }
          badge={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                ES / EN / FR
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Motor Pedagógico IA</span>
              </span>
            </div>
          }
          subtitle="Creación & Gamificación Curricular"
          title={<span className="text-xl sm:text-2xl font-black text-white">🎨 Estudio Pedagógico & Bóveda Curricular</span>}
          footer={
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-300 font-medium">
                Catálogo trilingüe de retos pedagógicos interactivos
              </span>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl bg-[#E41B14] hover:bg-[#c01d0c] text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 group-hover:scale-105 transition-all cursor-pointer"
              >
                <span>Abrir Estudio</span>
                <ArrowRight className="w-4 h-4 font-black" />
              </button>
            </div>
          }
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Genera retos gamificados, evaluaciones formativas y secuencias didácticas alineadas con rigor a los PDAs oficiales de la SEP y el marco NEM 2024.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Catálogo</div>
                <div className="text-sm font-bold text-white mt-0.5">40+ Dinámicas Activas</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Currículo</div>
                <div className="text-sm font-bold text-emerald-300 mt-0.5">NEM SEP Certificado</div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* CARD 2: MIS CLASES & EVALUACIÓN FORMATIVA (2 COLS) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-2 lg:col-span-2"
          onClick={() => onSelectAction('classes')}
          className="border-slate-800 bg-slate-900/90 text-white"
          icon={
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
          }
          badge={
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              📋 Portafolio Oficial
            </span>
          }
          subtitle="Seguimiento Formativo & Evidencias"
          title={<span className="text-lg sm:text-xl font-black text-white">📚 Mis Clases & Evaluación</span>}
          footer={
            <div className="flex items-center justify-between text-blue-400 font-bold text-xs">
              <span>Entrar al Portafolio y Calificaciones</span>
              <div className="w-7 h-7 rounded-full bg-blue-950 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          }
        >
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-400 leading-relaxed">
              Supervisa alumnos por grupo, revisa evidencias entregadas y asigna retroalimentación con rúbricas analíticas de evaluación formativa.
            </p>
            
            {/* Visualizador de Mini Barras de Logro Rúbrica */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rúbricas Analíticas NEM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-2 rounded-xs bg-emerald-500" title="Logrado" />
                <span className="h-6 w-2 rounded-xs bg-emerald-400" title="Avanzado" />
                <span className="h-3 w-2 rounded-xs bg-amber-400" title="En proceso" />
                <span className="h-5 w-2 rounded-xs bg-cyan-400" title="Destacado" />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* CARD 3: CENTRO DE IDIOMAS & FONÉTICA AVANZADA (1 COL) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('idiomas')}
          className="border-[#E41B14]/30 bg-slate-900/90 text-white"
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Languages className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
              🇬🇧 / 🇫🇷 A1-B2
            </span>
          }
          subtitle="Inmersión Oral"
          title={<span className="text-base sm:text-lg font-black text-white">🌐 Centro de Idiomas</span>}
          footer={
            <div className="flex items-center justify-between text-red-400 font-bold text-xs">
              <span>Laboratorio de Idiomas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              Avatares gesticulantes 3D, personajes históricos en primera persona y karaoke fonético en vivo.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Cambridge & DELF Ready</span>
            </div>
          </div>
        </BentoCard>

        {/* CARD 4: AULA DIGITAL & GREMIO (1 COL) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('classroom')}
          className="border-indigo-500/30 bg-slate-900/90 text-white"
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              ⚡ En Vivo
            </span>
          }
          subtitle="Convivencia"
          title={<span className="text-base sm:text-lg font-black text-white">🏛️ Aula Digital</span>}
          footer={
            <div className="flex items-center justify-between text-indigo-400 font-bold text-xs">
              <span>Modo Proyector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            Edictos de clase, ruleta de participación y termómetro socioemocional interactivo.
          </p>
        </BentoCard>

        {/* CARD 5: PLANEACIÓN CURRICULAR NEM (1 COL) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('planning')}
          className="border-purple-500/30 bg-slate-900/90 text-white"
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Compass className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              📖 Bóveda Central
            </span>
          }
          subtitle="Secuencias Didácticas"
          title={<span className="text-base sm:text-lg font-black text-white">📑 Planeación NEM</span>}
          footer={
            <div className="flex items-center justify-between text-purple-400 font-bold text-xs">
              <span>Abrir Planeador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            Consulta inmediata desde la Bóveda Central con fallback pedagógico de Inteligencia Artificial.
          </p>
        </BentoCard>

        {/* CARD 6: CONTROL DE ASISTENCIA DIARIA (1 COL) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-1 lg:col-span-1"
          onClick={() => onSelectAction('attendance')}
          className="border-sky-500/30 bg-slate-900/90 text-white"
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CheckCheck className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
              ⏱️ 1 Clic
            </span>
          }
          subtitle="Pase de Lista"
          title={<span className="text-base sm:text-lg font-black text-white">📋 Asistencia Diaria</span>}
          footer={
            <div className="flex items-center justify-between text-sky-400 font-bold text-xs">
              <span>Tomar Lista (96%)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            Registro ágil por grupo: presente, falta, retardo y justificación con sincronización institucional.
          </p>
        </BentoCard>

        {/* CARD 7: COMUNIDAD DOCENTE (2 COLS) */}
        <BentoCard
          colSpan="col-span-1 md:col-span-2 lg:col-span-2"
          onClick={() => onSelectAction('community')}
          className="border-emerald-500/30 bg-slate-900/90 text-white"
          icon={
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
          }
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              🌱 Red IBIME
            </span>
          }
          subtitle="Colaboración"
          title={<span className="text-lg sm:text-xl font-black text-white">🌍 Comunidad Docente</span>}
          footer={
            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
              <span>Clonar Plantillas Curriculares</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          }
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            Explora actividades creadas por otros profesores de la red IBIME, vota y clónalas directamente a tus asignaturas.
          </p>
        </BentoCard>

      </div>
    </div>
  );
};

export default TeacherHubCards;
