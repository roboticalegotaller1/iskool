"use client";

import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  BookOpen, 
  Award, 
  Users, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ChevronRight,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { formatMXN, AnalyticReportResult } from '@/services/executiveAnalyticsEngine';

interface ExecutiveManagerialBriefingCardProps {
  report: AnalyticReportResult;
  onOpenDimension?: (key: 'finanzas' | 'curriculo' | 'gamificacion' | 'operacion') => void;
  onSpeak?: (text?: string) => void;
  isSpeaking?: boolean;
}

export const ExecutiveManagerialBriefingCard: React.FC<ExecutiveManagerialBriefingCardProps> = ({
  report,
  onOpenDimension,
  onSpeak,
  isSpeaking = false
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden space-y-0 text-slate-900 select-text transition-all">
      
      {/* 1. ENCABEZADO GERENCIAL INSTITUCIONAL (SIN LOGO DE ROBOT) */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-950">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-300/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-extrabold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-300/30">
                Despacho Ejecutivo del CEO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                Certificación: 0 Tokens • Tiempo Real
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                {report.schoolName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Informe Ejecutivo de Gobernanza y Proyección Estratégica
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Chief of Staff & Business Intelligence • Escaneo Cuatridimensional del Ecosistema iSkool
            </p>
          </div>
        </div>

        {/* CONTROLES GERENCIALES */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(report.directAnswer)}
              title={isSpeaking ? "Detener locución" : "Escuchar informe gerencial de viva voz"}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-md ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-indigo-600/50 hover:bg-indigo-600 text-white border-indigo-400/50 hover:border-indigo-300'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>{isSpeaking ? 'Detener Voz' : 'Escuchar Informe Oral'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* 2. SECCIÓN I: RADAR DE SALUD ESTRATÉGICA (PULSO GENERAL) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                I. Radar de Salud Estratégica (Pulso General)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Estado General:</span>
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-black tracking-wide shadow-xs">
                EN OBSERVACIÓN
              </span>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-amber-200/80 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed shadow-xs">
            <span className="text-amber-800 font-bold block mb-1 text-[11px] uppercase tracking-wider">
              Diagnóstico Clave de la Semana:
            </span>
            La brecha acumulada del 36.8% en cobranza institucional (58.2% observada vs. meta 95.0%) y una adopción curricular sociocrítica del 64.0% en Fases 4 y 5, amenazan con estrangular el flujo de nómina docente y generar observaciones en auditorías de fin de trimestre de no intervenir en los próximos 14 días.
          </div>
        </div>

        {/* 3. SECCIÓN II: FOCOS CRÍTICOS A FUTURO (PROYECCIÓN A 14-30 DÍAS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              <span>II. Focos Críticos a Futuro (Proyección Prospectiva a 14–30 Días)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">3 Focos de Alto Impacto</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* FOCO 1: FINANZAS Y COBRANZA */}
            <div className="bg-white rounded-2xl border-2 border-rose-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Foco Crítico 1 · Finanzas
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">14 Días</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Recuperación de Cartera Vencida
                  </h4>
                  <p className="text-xs text-slate-500">Módulo de Facturación Centralizada</p>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Por Recaudar</span>
                    <span className="text-lg font-black text-rose-600 font-mono block">
                      {formatMXN(8424.00)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Eficiencia</span>
                    <span className="text-sm font-bold text-slate-900 font-mono block">
                      58.2% <span className="text-[10px] text-slate-400 font-normal">/ 95%</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Señal Temprana:</strong> 2 expedientes de alto saldo promedio ($4,212.00) en mora activa.
                  </p>
                  <p>
                    <strong className="text-slate-900">Impacto a 21 días:</strong> Estrangulamiento de dispersión de nómina en planteles periféricos.
                  </p>
                  <p>
                    <strong className="text-slate-900">Decisión Requerida:</strong> Activar protocolo de notificación y convenio de pago.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDimension?.('finanzas')}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Inspeccionar Deudores en Tiempo Real</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* FOCO 2: GOBERNANZA CURRICULAR */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Foco Crítico 2 · Curricular
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">21 Días</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Evaluaciones y Proyectos NEM
                  </h4>
                  <p className="text-xs text-slate-500">Bóveda Curricular & Planeaciones</p>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Adopción Actual</span>
                    <span className="text-lg font-black text-indigo-700 font-mono block">
                      64.0%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Desfase Fases</span>
                    <span className="text-sm font-bold text-amber-600 font-mono block">
                      -22.0% <span className="text-[10px] text-slate-400 font-normal">Fases 4 y 5</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Señal Temprana:</strong> Planeaciones registradas de forma aislada sin articulación STEAM.
                  </p>
                  <p>
                    <strong className="text-slate-900">Impacto a 3 semanas:</strong> Observaciones de supervisores de zona por falta de rúbricas.
                  </p>
                  <p>
                    <strong className="text-slate-900">Decisión Requerida:</strong> Homologar plantillas maestras pre-aprobadas en Bóveda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDimension?.('curriculo')}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Auditar Bóveda Curricular</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* FOCO 3: GAMIFICACIÓN Y RETENCIÓN */}
            <div className="bg-white rounded-2xl border-2 border-purple-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Foco Crítico 3 · Retención
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">30 Días</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Economía de Tienda y Avatares
                  </h4>
                  <p className="text-xs text-slate-500">LMS Inmersivo & Engagement Dual UX</p>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Canjes Tienda</span>
                    <span className="text-lg font-black text-purple-700 font-mono block">
                      -18.4%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Asistencia Aula</span>
                    <span className="text-sm font-bold text-emerald-600 font-mono block">
                      94.6% <span className="text-[10px] text-slate-400 font-normal">Auditada</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Señal Temprana:</strong> Menor canje de gemas en grados superiores (Fases 5 y 6).
                  </p>
                  <p>
                    <strong className="text-slate-900">Impacto a 30 días:</strong> Fatiga de plataforma y desenganche del incentivo formativo.
                  </p>
                  <p>
                    <strong className="text-slate-900">Decisión Requerida:</strong> Ajustar catálogo de avatares con recompensas de mérito.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDimension?.('gamificacion')}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Inspeccionar Telemetría LMS</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* 4. SECCIÓN III: TABLA DE CONTROL LEADING VS. LAGGING */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              <span>III. Indicadores Líder vs. Rezagados (Leading vs. Lagging)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Control Cuatridimensional</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dimensión</th>
                  <th className="py-3 px-4">Indicador Temprano (Tendencia)</th>
                  <th className="py-3 px-4">Indicador Rezagado (Resultado)</th>
                  <th className="py-3 px-4 text-center">Métrica Actual</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">Finanzas y Operación</td>
                  <td className="py-3 px-4 text-slate-600">Eficiencia semanal de recaudación (58.2%)</td>
                  <td className="py-3 px-4 text-slate-600">Flujo de caja y dispersión de nómina</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold font-mono text-[11px]">
                      {formatMXN(8424.00)} pendiente
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDimension?.('finanzas')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Ver detalle →
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">Académica / NEM</td>
                  <td className="py-3 px-4 text-slate-600">Adopción de proyectos interdisciplinarios</td>
                  <td className="py-3 px-4 text-slate-600">Cobertura de PDAs oficiales acreditados</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold font-mono text-[11px]">
                      64.0% de Adopción
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDimension?.('curriculo')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Ver detalle →
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">LMS & Gamificación</td>
                  <td className="py-3 px-4 text-slate-600">Ratio de recirculación y canje en tienda</td>
                  <td className="py-3 px-4 text-slate-600">DAU estudiantil y finalización de retos</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold font-mono text-[11px]">
                      -18% Canjes (Fases 5/6)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDimension?.('gamificacion')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Ver detalle →
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">Docente & Minimalist UX</td>
                  <td className="py-3 px-4 text-slate-600">Frecuencia del bucle simplificado (Apple Rule)</td>
                  <td className="py-3 px-4 text-slate-600">Tiempo de carga administrativa fuera de aula</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono text-[11px]">
                      6 Docentes Activos
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDimension?.('operacion')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Ver detalle →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. SECCIÓN IV: MATRIZ DE DECISIONES EJECUTIVAS VS. DELEGACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* PANEL IZQUIERDO: DECISIONES EXCLUSIVAS DEL CEO */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border-2 border-amber-300/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                Decisiones Exclusivas del CEO (Intervención de Alto Nivel)
              </h4>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-800 list-decimal list-inside leading-relaxed font-medium">
              <li>
                <strong className="text-slate-900">Blindaje Financiero de Planteles:</strong> Autorizar calendario de regularización escalonada para los $8,424.00 de cartera vencida antes de aprobar dispersiones extraordinarias.
              </li>
              <li>
                <strong className="text-slate-900">Pacto de Homologación Curricular:</strong> Establecer fecha límite no negociable (15 de octubre) para el sellado de rúbricas oficiales en la Bóveda Curricular.
              </li>
              <li>
                <strong className="text-slate-900">Priorización Estratégica de Producto:</strong> Congelar peticiones de funciones secundarias y enfocar al equipo técnico en la telemetría del Teacher Social Loop.
              </li>
            </ol>
          </div>

          {/* PANEL DERECHO: MATRIZ DE DELEGACIÓN */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Matriz de Delegación Operativa (Mandatos Directos)
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  A la Dirección Académica:
                </span>
                <p>Auditar y forzar la adopción de planeaciones interdisciplinarias validadas en Fases 4 y 5 antes del viernes a las 18:00 hrs.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                  Al Líder Técnico:
                </span>
                <p>Instrumentar en el motor analítico la telemetría del ciclo de tienda de avatares e integrar las alertas de cobranza en el cuadro directivo.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  A la Coordinación de Operaciones / Finanzas:
                </span>
                <p>Ejecutar protocolo de contacto directo con tutores deudores para elevar la eficiencia de cobranza arriba del 85% en 10 días.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ExecutiveManagerialBriefingCard;
