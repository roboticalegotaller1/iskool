"use client";

import React from 'react';
import { useTenantBranding } from './TenantBrandingProvider';
import { Sparkles, Users, Globe, ArrowRight } from 'lucide-react';

export interface TenantTeacherHubCardsProps {
  onNavigateToClasses: () => void;
  onNavigateToStudio: () => void;
  onNavigateToCommunity: () => void;
  teacherName?: string;
}

/**
 * Hub del Profesor Multi-Tenant con la Regla de los 3 Clics de Apple.
 * Proporciona acceso instantáneo a las 3 tareas pedagógicas centrales
 * adaptando su cromática e insignias institucionales de forma automática.
 */
export const TenantTeacherHubCards: React.FC<TenantTeacherHubCardsProps> = ({
  onNavigateToClasses,
  onNavigateToStudio,
  onNavigateToCommunity,
  teacherName = 'Docente Titular'
}) => {
  const { tokens, isIbime } = useTenantBranding();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* 1. Saludo Minimalista Institucional */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              data-testid="institutional-badge"
              className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: tokens.cssVariables['--brand-badge-bg'] || '#ede9fe',
                color: tokens.cssVariables['--brand-badge-text'] || '#6d28d9'
              }}
            >
              {tokens.badgeText}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Ciclo Escolar 2025-2026
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido, <span style={{ color: tokens.primaryColorHex }}>{teacherName}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            {isIbime
              ? 'Centro de Gestión Docente y Coordinación Bicultural IBIME'
              : 'Hub Docente • Experiencia y Gestión Pedagógica iSkool'}
          </p>
        </div>

        {/* Logo Institucional Adaptable */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-inner"
            style={{ backgroundColor: tokens.primaryColorHex }}
          >
            {isIbime ? 'IB' : 'iS'}
          </div>
          <div className="text-left pr-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campus</p>
            <p className="text-sm font-bold text-slate-800">{tokens.shortName}</p>
          </div>
        </div>
      </div>

      {/* 2. Las 3 Tarjetas Visuales Masivas (Regla de los 3 Clics de Apple) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Tarjeta 1: Mis Clases y Evaluación Formativa */}
        <div
          onClick={onNavigateToClasses}
          role="button"
          tabIndex={0}
          className="group relative bg-white/95 rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Mis Clases
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gestión de listas, control de asistencia, portafolio de evidencias y evaluación formativa por rúbricas analíticas.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-blue-600 font-semibold text-sm">
            <span>Abrir mis grupos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tarjeta 2: HERO ACTION - Crear Actividad / Estudio Pedagógico IA */}
        <div
          onClick={onNavigateToStudio}
          role="button"
          tabIndex={0}
          className="group relative rounded-3xl p-8 text-white shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ring-4 ring-offset-2 ring-slate-100"
          style={{ background: tokens.cssVariables['--brand-hero-gradient'] }}
        >
          {/* Destello de fondo */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:rotate-6 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-white/25 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                1 Clic • IA Pedagógica
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">
              {isIbime ? 'Estudio Bicultural' : 'Crear Actividad'}
            </h2>
            <p className="text-sm text-white/90 leading-relaxed">
              {isIbime
                ? 'Genera planeaciones bilingües, desafíos interdisciplinarios y actividades formativas con Inteligencia Artificial Pedagógica.'
                : 'Diseña simuladores, quizzes interactivos y proyectos situados de la NEM 2024 en el Estudio de Actividades.'}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20 flex items-center justify-between text-white font-bold text-sm">
            <span>{isIbime ? 'Iniciar Estudio Bicultural' : 'Abrir Lienzo Digital'}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Comunidad y Bóveda Compartida */}
        <div
          onClick={onNavigateToCommunity}
          role="button"
          tabIndex={0}
          className="group relative bg-white/95 rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              Comunidad Docente
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explora la Bóveda Central de Conocimiento, clona planeaciones auditadas y comparte proyectos pedagógicos con otros maestros.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-semibold text-sm">
            <span>Explorar red docente</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
};
