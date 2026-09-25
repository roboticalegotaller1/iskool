"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Calendar, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart, 
  Activity, 
  Layers, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Bot, 
  Mic, 
  MicOff, 
  Send,
  HelpCircle,
  ArrowRight,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { 
  HOLDING_CASHFLOW_12M_SEED, 
  CAMPUS_BENCHMARK_SEED, 
  AGING_TRANCHES_SUMMARY, 
  DETAILED_AGING_DEBTORS_SEED, 
  ENROLLMENT_FUNNEL_SEED, 
  HOLDING_GROWTH_UNIT_ECONOMICS, 
  HOLDING_EXECUTIVE_SUMMARY_SEED,
  AgingDebtorProfile,
  CampusBenchmarkRecord,
  MonthlyCashflowRecord
} from '@/store/seeds/executiveBiSeeds';
import { formatMXN } from '@/services/executiveAnalyticsEngine';
import ExecutiveAnalyticsStudio from './ExecutiveAnalyticsStudio';

interface ExecutiveBiCommandCenterProps {
  isEmbeddedView?: boolean;
  schoolId?: string;
  holdingName?: string;
  initialQuery?: string;
  onBack?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

type TimeHorizon = 'mtd' | 'qtd' | 'ytd' | 'forecast';
type BiMainView = 'matrix' | 'cashflow' | 'campuses' | 'aging' | 'funnel' | 'assistant';

export default function ExecutiveBiCommandCenter({
  isEmbeddedView = false,
  schoolId,
  holdingName = 'Instituto Bilingüe IBIME',
  initialQuery,
  onBack,
  onNavigateTab
}: ExecutiveBiCommandCenterProps) {
  // Estados de control de vista
  const [activeMainView, setActiveMainView] = useState<BiMainView>('matrix');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('ytd');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Estados interactivos para drill-down de expedientes
  const [selectedDebtorForDrawer, setSelectedDebtorForDrawer] = useState<AgingDebtorProfile | null>(null);
  const [selectedCampusDetail, setSelectedCampusDetail] = useState<CampusBenchmarkRecord | null>(null);
  const [activeAgingTrancheFilter, setActiveAgingTrancheFilter] = useState<'all' | '0-30' | '31-60' | '60+'>('all');
  const [hoveredCashflowIndex, setHoveredCashflowIndex] = useState<number | null>(null);

  // Filtrado de deudores según tranche seleccionado
  const displayedDebtors = useMemo(() => {
    if (activeAgingTrancheFilter === 'all') return DETAILED_AGING_DEBTORS_SEED;
    return DETAILED_AGING_DEBTORS_SEED.filter(d => d.agingTranche === activeAgingTrancheFilter);
  }, [activeAgingTrancheFilter]);

  // Manejador para copiar síntesis ejecutiva al portapapeles
  const handleCopyExecutiveSummary = () => {
    const summaryText = `ISKOOL EXECUTIVE BI REPORT - ${holdingName}
Fecha de Emisión: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
--------------------------------------------------
• Margen EBITDA Holding: +${HOLDING_EXECUTIVE_SUMMARY_SEED.ebitdaMarginPct}% (${HOLDING_EXECUTIVE_SUMMARY_SEED.ebitdaMarginTrend})
• Facturación Total MXN: ${formatMXN(HOLDING_EXECUTIVE_SUMMARY_SEED.totalRevenueMxn)}
• Eficiencia de Cobranza: ${HOLDING_EXECUTIVE_SUMMARY_SEED.collectionEfficiencyPct}% (Meta: ${HOLDING_EXECUTIVE_SUMMARY_SEED.collectionTargetPct}%)
• Capacidad de Ocupación: ${HOLDING_EXECUTIVE_SUMMARY_SEED.totalCapacityOccupancyPct}% (${HOLDING_EXECUTIVE_SUMMARY_SEED.totalEnrolledStudents} de ${HOLDING_EXECUTIVE_SUMMARY_SEED.totalCapacitySeats} Asientos)
• Planteles Auditados: 4 Sedes (Montes, Coacalco, Central, Torres)
• Cartera Vencida Exigible: ${formatMXN(AGING_TRANCHES_SUMMARY['0-30'].amount + AGING_TRANCHES_SUMMARY['31-60'].amount + AGING_TRANCHES_SUMMARY['60+'].amount)}
• Conversión Global de Matrícula: ${HOLDING_GROWTH_UNIT_ECONOMICS.overallConversionRatePct}% (CAC: ${formatMXN(HOLDING_GROWTH_UNIT_ECONOMICS.averageCACMxn)} | LTV: ${formatMXN(HOLDING_GROWTH_UNIT_ECONOMICS.projectedLTVMxn)})
--------------------------------------------------
Generado por Motor Autónomo de Inteligencia Pedagógica & Analítica (0 Tokens).`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  // Exportar matriz a formato CSV
  const handleExportCSV = () => {
    const headers = ['Mes', 'Año', 'Colegiaturas', 'Inscripciones', 'Talleres', 'Total Ingresos', 'Nomina Docente', 'Nomina Admin', 'Arrendamiento', 'Gastos Operativos', 'EBITDA', 'Margen %'];
    const rows = HOLDING_CASHFLOW_12M_SEED.map(c => [
      c.month,
      c.year,
      c.tuitionRevenues,
      c.enrollmentRevenues,
      c.extracurricularRevenues,
      c.totalRevenues,
      c.teacherPayroll,
      c.adminPayroll,
      c.facilityLeasing,
      c.operatingExpenses,
      c.ebitda,
      `${c.ebitdaMargin}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Ejecutivo_BI_${holdingName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`select-none transition-all duration-200 ${
      isMaximized 
        ? 'fixed inset-0 z-50 flex flex-col h-screen w-full bg-[#0d131f] text-slate-100 font-sans overflow-hidden shadow-2xl'
        : isEmbeddedView 
        ? 'flex flex-col min-h-[850px] w-full bg-[#0d131f] text-slate-100 font-sans rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative'
        : 'flex flex-col min-h-screen w-full bg-[#0d131f] text-slate-100 font-sans overflow-hidden'
    }`}>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER EJECUTIVO & CONTROLES DE NIVEL C-SUITE                     */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 bg-[#111827]/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 backdrop-blur-md z-30">
        
        {/* Identidad de la Suite Directiva */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1.5px] shrink-0 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d131f] rounded-[10px] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                ISkool Executive Analytics
              </h1>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 hidden xs:inline-block">
                CEO Suite
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 hidden md:inline-block">
                0 Tokens · Latencia &lt;1ms
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {holdingName} · Red de 4 Planteles (3,740 Alumnos Matriculados)
            </p>
          </div>
        </div>

        {/* Controles de Filtro & Acciones Rápidas */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Selector de Horizonte Temporal */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400">
            {(['mtd', 'qtd', 'ytd', 'forecast'] as TimeHorizon[]).map((hz) => (
              <button
                key={hz}
                onClick={() => setTimeHorizon(hz)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer capitalize ${
                  timeHorizon === hz 
                    ? 'bg-slate-800 text-white font-bold shadow-xs' 
                    : 'hover:text-slate-200'
                }`}
              >
                {hz === 'mtd' ? 'Este Mes' : hz === 'qtd' ? 'Trimestre' : hz === 'ytd' ? 'Año Acumulado' : 'Proyección 90d'}
              </button>
            ))}
          </div>

          {/* Selector de Plantel */}
          <div className="relative">
            <select
              value={selectedCampusFilter}
              onChange={(e) => setSelectedCampusFilter(e.target.value)}
              className="appearance-none bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition shadow-xs max-w-[140px] sm:max-w-[190px] truncate"
            >
              <option value="all">Consolidado (4 Sedes)</option>
              {CAMPUS_BENCHMARK_SEED.map(c => (
                <option key={c.campusId} value={c.campusId}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Maximizar / Restaurar (Pantalla Completa) */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restaurar a vista integrada" : "Maximizar pantalla completa (Modo Sala de Juntas)"}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5 text-cyan-400" /> : <Maximize2 className="h-3.5 w-3.5 text-slate-400" />}
            <span className="hidden md:inline">{isMaximized ? 'Restaurar' : 'Maximizar'}</span>
          </button>

          {/* Exportar CSV */}
          <button
            onClick={handleExportCSV}
            title="Descargar matriz en formato CSV/Excel"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Exportar CSV</span>
          </button>

          {/* Imprimir / PDF */}
          <button
            onClick={() => window.print()}
            title="Imprimir informe oficial para Consejo de Administración"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden lg:inline">Imprimir</span>
          </button>

          {/* Publicar / Copiar */}
          <button
            onClick={handleCopyExecutiveSummary}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-white" />}
            <span>{copiedSummary ? 'Copiado' : 'Publicar'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-BARRA DE PESTAÑAS DE NAVEGACIÓN ANALÍTICA                         */}
      {/* ========================================================================= */}
      <div className="h-11 shrink-0 bg-[#0f172a] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto text-xs font-bold">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'matrix', label: 'Matriz Cuádruple Ejecutiva', icon: Layers },
            { id: 'cashflow', label: 'Flujo de Caja & EBITDA', icon: DollarSign },
            { id: 'campuses', label: 'Benchmark 4 Sedes', icon: Building2 },
            { id: 'aging', label: 'Aging Cartera & Deudores', icon: Activity },
            { id: 'funnel', label: 'Embudo Admisiones', icon: UserCheck },
            { id: 'assistant', label: 'Asistente IA & Voz', icon: Bot }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeMainView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainView(tab.id as BiMainView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0 hidden md:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetría en Vivo Ciclo 2026-2027</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIBBON SUPERIOR DE KPIS DIRECTIVOS ESTRATÉGICOS                       */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 pb-2 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Margen EBITDA Holding */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Margen EBITDA Holding</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <TrendingUp className="w-3 h-3" />
                <span>+28.4%</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                +28.4%
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">+3.2% vs presupuesto</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">EBITDA: $1.54M MXN</span>
              </div>
            </div>
            {/* Barra mini Sparkline */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          {/* KPI 2: Facturación Total Consolidada */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Facturación Total (Mes Actual)</span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 font-bold">
                Meta: 96.8%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                $4.84M <span className="text-sm font-semibold text-slate-400">MXN</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Colegiaturas + Cuotas</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">+8.4% vs ciclo 25</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          {/* KPI 3: Eficiencia de Cobranza */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Eficiencia de Cobranza</span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                Meta: 95.0%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                94.2%
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">$4.56M recaudados</span>
                <span className="text-xs font-bold text-amber-400 font-mono">$281K en gestión</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: '94.2%' }} />
            </div>
          </div>

          {/* KPI 4: Capacidad & Ocupación de Planteles */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Capacidad Total de Campus</span>
              <span className="text-[11px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
                88.6% Cupo
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                3,740 <span className="text-sm font-semibold text-slate-400">/ 4,220</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Ratio Alumno/Docente</span>
                <span className="text-xs font-bold text-purple-400 font-mono">17.4 : 1 (Óptimo)</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '88.6%' }} />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CUERPO MODULAR DINÁMICO SEGÚN LA PESTAÑA SELECCIONADA                  */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* --------------------------------------------------------------------- */}
        {/* VISTA A: MATRIZ CUÁDRUPLE EJECUTIVA (IDÉNTICA A LA MAQUETA VISUAL)     */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* FILA SUPERIOR: Panel 1 (Cashflow) + Panel 2 (Benchmark 4 Planteles) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PANEL 1: Financial Cashflow & Forecast (7 Columnas LG) */}
              <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span>Flujo de Caja Financiero & Forecast 90 Días</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Comparativo de Ingresos por Colegiaturas vs. Egresos de Nómina Docente (Ciclo 2025–2026 y Proyección)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      Ingresos
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      Nómina
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Forecast
                    </span>
                  </div>
                </div>

                {/* Gráfica SVG Dinámica de Curvas de Cashflow */}
                <div className="relative w-full h-64 sm:h-72">
                  <svg viewBox="0 0 800 280" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="tuitionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="payrollGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Guías de Cuadrícula Horizontal */}
                    {[0, 70, 140, 210].map((y, i) => (
                      <line key={i} x1="50" y1={y} x2="780" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    ))}

                    {/* Etiquetas Y */}
                    <text x="10" y="20" fill="#64748b" fontSize="10" fontFamily="monospace">$6.0M</text>
                    <text x="10" y="90" fill="#64748b" fontSize="10" fontFamily="monospace">$4.5M</text>
                    <text x="10" y="160" fill="#64748b" fontSize="10" fontFamily="monospace">$3.0M</text>
                    <text x="10" y="230" fill="#64748b" fontSize="10" fontFamily="monospace">$1.5M</text>

                    {/* Línea Divisoria de Forecast */}
                    <line x1="620" y1="10" x2="620" y2="240" stroke="#334155" strokeDasharray="4 4" />
                    <text x="625" y="25" fill="#10b981" fontSize="10" fontWeight="bold">Forecast &gt;&gt;</text>

                    {/* Área y Curva de Ingresos */}
                    <path
                      d="M 60 140 Q 140 135, 200 125 T 320 70 T 440 130 T 560 40 T 620 90 T 700 85 T 770 80 L 770 240 L 60 240 Z"
                      fill="url(#tuitionGrad)"
                    />
                    <path
                      d="M 60 140 Q 140 135, 200 125 T 320 70 T 440 130 T 560 40 T 620 90 T 700 85 T 770 80"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                    />

                    {/* Área y Curva de Nómina */}
                    <path
                      d="M 60 185 Q 140 185, 200 170 T 320 180 T 440 180 T 560 175 T 620 175 T 700 170 T 770 160 L 770 240 L 60 240 Z"
                      fill="url(#payrollGrad)"
                    />
                    <path
                      d="M 60 185 Q 140 185, 200 170 T 320 180 T 440 180 T 560 175 T 620 175 T 700 170 T 770 160"
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="3"
                    />

                    {/* Curva Punteada de Proyección Futura */}
                    <path
                      d="M 620 90 Q 700 70, 770 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />

                    {/* Puntos y Nodos Interactivos */}
                    {[
                      { x: 60, l: 'Oct 25' }, { x: 130, l: 'Nov' }, { x: 200, l: 'Dic' },
                      { x: 270, l: 'Ene 26' }, { x: 340, l: 'Feb' }, { x: 410, l: 'Abr' },
                      { x: 480, l: 'Jun' }, { x: 550, l: 'Ago' }, { x: 620, l: 'Sep' },
                      { x: 690, l: 'Oct (F)' }, { x: 760, l: 'Nov (F)' }
                    ].map((pt, i) => (
                      <g key={i}>
                        <text x={pt.x - 12} y="260" fill="#64748b" fontSize="9" fontWeight="bold">
                          {pt.l}
                        </text>
                      </g>
                    ))}

                    {/* Nodo Destacado Septiembre (Actual) */}
                    <circle cx="620" cy="90" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="620" cy="175" r="5" fill="#fb923c" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Pico de Reinscripciones: <strong>Enero ($5.3M)</strong> y <strong>Agosto ($6.27M)</strong></span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">Cobertura Nómina: 1.8x</span>
                </div>
              </div>

              {/* PANEL 2: Benchmark de 4 Planteles (5 Columnas LG) */}
              <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>Benchmark de los 4 Planteles</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rendimiento comparativo, metas de recaudación y medidor de ocupación física
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-950/70 border border-purple-800/50 px-2 py-0.5 rounded">
                    4 Sedes
                  </span>
                </div>

                {/* Lista de Planteles con Barras y Gauges */}
                <div className="space-y-4">
                  {CAMPUS_BENCHMARK_SEED.map((campus) => (
                    <div 
                      key={campus.campusId}
                      onClick={() => setSelectedCampusDetail(campus)}
                      className="p-3 bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition">
                            {campus.shortName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {campus.currentEnrollment} alumnos · Capacidad: {campus.capacityTotal}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-white">
                            {formatMXN(campus.monthlyRevenue)}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            EBITDA: {campus.ebitdaMarginPct}%
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso de meta de recaudación */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Meta Recaudación: <strong>{campus.revenueTargetPct}%</strong></span>
                          <span>Retención: <strong className="text-emerald-400">{campus.studentRetentionPct}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${campus.revenueTargetPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Mini Gauge de Ocupación */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400">Ocupación Física:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {campus.occupancyRate.toFixed(1)}% ({campus.capacityTotal - campus.currentEnrollment} asientos disp.)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between mt-3">
                  <span>Sede líder en EBITDA: <strong>Campus Montes (32.4%)</strong></span>
                  <span className="text-purple-400 font-bold">LTV Promedio: $108K MXN</span>
                </div>
              </div>

            </div>

            {/* FILA INFERIOR: Panel 3 (Aging de Cartera) + Panel 4 (Embudo de Admisiones) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PANEL 3: Matriz de Aging de Cartera & Riesgo Crediticio (6 Columnas LG) */}
              <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Matriz de Aging de Cartera (0 a 90+ Días)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Segmentación de morosidad, concentración de saldos y cuentas por cobrar
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded">
                    Total: $39,100 MXN
                  </span>
                </div>

                {/* 3 Bloques de Antigüedad con Barras */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {Object.values(AGING_TRANCHES_SUMMARY).map(tr => (
                    <div 
                      key={tr.id}
                      onClick={() => setActiveAgingTrancheFilter(tr.id as any)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        activeAgingTrancheFilter === tr.id
                          ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">
                        {tr.label}
                      </span>
                      <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                        {formatMXN(tr.amount)}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">{tr.debtorsCount} alumnos</span>
                        <span className={`font-bold ${
                          tr.riskLevel === 'Bajo' ? 'text-sky-400' : tr.riskLevel === 'Medio' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {tr.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini Dataframe de Alumnos en Tranche Seleccionado */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Expedientes en Cartera Vencida ({displayedDebtors.length}):</span>
                    {activeAgingTrancheFilter !== 'all' && (
                      <button 
                        onClick={() => setActiveAgingTrancheFilter('all')}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Ver todos
                      </button>
                    )}
                  </div>

                  {displayedDebtors.slice(0, 4).map(debtor => (
                    <div 
                      key={debtor.id}
                      onClick={() => setSelectedDebtorForDrawer(debtor)}
                      className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-xs transition cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white group-hover:text-cyan-400 truncate">
                          {debtor.studentName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {debtor.campusName} · {debtor.level} {debtor.gradeGroup}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-rose-400">
                          {formatMXN(debtor.amount)}
                        </div>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                          {debtor.daysOverdue} días
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between mt-3">
                  <span>CFDI 4.0 con complemento IEDU: <strong>96.8% timbrado</strong></span>
                  <button 
                    onClick={() => setActiveMainView('aging')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver matriz detallada</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PANEL 4: Embudo de Admisiones & Retención Escolar (6 Columnas LG) */}
              <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Embudo de Admisiones & Crecimiento Escolar</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Conversión por etapas (Leads $\rightarrow$ Tours $\rightarrow$ Exámenes $\rightarrow$ Inscritos) y Unit Economics
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Conv: 36.0%
                  </span>
                </div>

                {/* Embudo Visual Trapezoidal Animado */}
                <div className="space-y-3 my-auto">
                  {ENROLLMENT_FUNNEL_SEED.map((stage, idx) => {
                    const widthPercent = 100 - idx * 16;
                    return (
                      <div key={stage.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                            {stage.name}
                          </span>
                          <span className="font-mono font-black text-white">
                            {stage.count} <span className="text-[10px] text-slate-400 font-normal">({stage.passRate}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-6 rounded-lg p-0.5 border border-slate-800 flex items-center">
                          <div 
                            className={`h-full rounded-md bg-gradient-to-r ${stage.gradient} transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-white`}
                            style={{ width: `${widthPercent}%` }}
                          >
                            {stage.count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Métricas de Adquisición Unit Economics */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">CAC Promedio</span>
                    <span className="text-xs font-black text-cyan-400 font-mono mt-0.5 block">$1,420 MXN</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">LTV Proyectado (3a)</span>
                    <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">$108,000 MXN</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Ratio LTV/CAC</span>
                    <span className="text-xs font-black text-purple-400 font-mono mt-0.5 block">76.1x (Élite)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* VISTA B: FLUIDEZ DE CASHFLOW DETALLADA                                 */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'cashflow' && (
          <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">Desglose Mensual de Flujo de Caja & EBITDA Holding</h2>
                <p className="text-xs text-slate-400">12 meses históricos consolidados + 3 meses de proyección algorítmica a 0 tokens</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Modelo Financiero CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-black border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Periodo</th>
                    <th className="p-3 text-right">Colegiaturas</th>
                    <th className="p-3 text-right">Inscripciones</th>
                    <th className="p-3 text-right">Talleres/Otros</th>
                    <th className="p-3 text-right text-cyan-400">Total Ingresos</th>
                    <th className="p-3 text-right">Nómina Docente</th>
                    <th className="p-3 text-right">Nómina Admin</th>
                    <th className="p-3 text-right">Arrendamiento</th>
                    <th className="p-3 text-right text-orange-400">Total Egresos</th>
                    <th className="p-3 text-right text-emerald-400">EBITDA</th>
                    <th className="p-3 text-center">Margen %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                  {HOLDING_CASHFLOW_12M_SEED.map((r, i) => (
                    <tr key={i} className={`hover:bg-slate-800/40 transition ${r.isForecast ? 'bg-emerald-950/20' : ''}`}>
                      <td className="p-3 font-bold text-white">
                        {r.month} {r.isForecast && <span className="text-[9px] text-emerald-400 uppercase font-black ml-1">(Forecast)</span>}
                      </td>
                      <td className="p-3 text-right">{formatMXN(r.tuitionRevenues)}</td>
                      <td className="p-3 text-right">{formatMXN(r.enrollmentRevenues)}</td>
                      <td className="p-3 text-right">{formatMXN(r.extracurricularRevenues)}</td>
                      <td className="p-3 text-right font-black text-cyan-400">{formatMXN(r.totalRevenues)}</td>
                      <td className="p-3 text-right">{formatMXN(r.teacherPayroll)}</td>
                      <td className="p-3 text-right">{formatMXN(r.adminPayroll)}</td>
                      <td className="p-3 text-right">{formatMXN(r.facilityLeasing)}</td>
                      <td className="p-3 text-right font-black text-orange-400">{formatMXN(r.totalExpenses)}</td>
                      <td className="p-3 text-right font-black text-emerald-400">{formatMXN(r.ebitda)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.ebitdaMargin >= 30 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {r.ebitdaMargin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* VISTA C: BENCHMARK DE 4 PLANTELES                                     */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'campuses' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CAMPUS_BENCHMARK_SEED.map(campus => (
                <div key={campus.campusId} className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">{campus.location}</span>
                      <h3 className="text-base font-black text-white mt-0.5">{campus.campusName}</h3>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      EBITDA: {campus.ebitdaMarginPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Matrícula</span>
                      <span className="text-base font-black text-white font-mono mt-1 block">{campus.currentEnrollment}</span>
                      <span className="text-[10px] text-slate-500">de {campus.capacityTotal} ({campus.occupancyRate.toFixed(1)}%)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Facturación Mes</span>
                      <span className="text-base font-black text-cyan-400 font-mono mt-1 block">{formatMXN(campus.monthlyRevenue)}</span>
                      <span className="text-[10px] text-slate-500">Meta: {campus.revenueTargetPct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Retención</span>
                      <span className="text-base font-black text-purple-400 font-mono mt-1 block">{campus.studentRetentionPct}%</span>
                      <span className="text-[10px] text-slate-500">Ratio: {campus.studentTeacherRatio}:1</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* VISTA D: AGING DE CARTERA VENCIDA & GESTIÓN DE MOROSIDAD              */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'aging' && (
          <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">Directorio Ejecutivo de Cartera Vencida & Aging Crediticio</h2>
                <p className="text-xs text-slate-400">12 expedientes auditados con estatus de timbrado CFDI 4.0 IEDU SAT y acciones directivas</p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', '0-30', '31-60', '60+'] as const).map(tr => (
                  <button
                    key={tr}
                    onClick={() => setActiveAgingTrancheFilter(tr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                      activeAgingTrancheFilter === tr 
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black' 
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {tr === 'all' ? 'Ver Todos (12)' : tr === '0-30' ? '0-30 Días' : tr === '31-60' ? '31-60 Días' : '60+ Días'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-black border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Alumno</th>
                    <th className="p-3">Plantel & Nivel</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-right">Adeudo</th>
                    <th className="p-3 text-center">Días Vencido</th>
                    <th className="p-3">Tutor Familiar & Contacto</th>
                    <th className="p-3 text-center">CFDI 4.0 SAT</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                  {displayedDebtors.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">
                        <div>{d.studentName}</div>
                        <span className="text-[10px] text-slate-500 font-normal">{d.studentId}</span>
                      </td>
                      <td className="p-3">
                        <div>{d.campusName}</div>
                        <span className="text-[10px] text-slate-400">{d.level} {d.gradeGroup}</span>
                      </td>
                      <td className="p-3 max-w-xs truncate">{d.concept}</td>
                      <td className="p-3 text-right font-black text-rose-400">{formatMXN(d.amount)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.agingTranche === '0-30' ? 'bg-sky-950 text-sky-400' : d.agingTranche === '31-60' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400 font-black'
                        }`}>
                          {d.daysOverdue} días
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{d.tutorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.tutorPhone}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          d.cfdiStatus === 'timbrado' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {d.cfdiStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedDebtorForDrawer(d)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Ver 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* VISTA E: ASISTENTE CONVERSACIONAL INTEGRADO CON IA PEDAGÓGICA         */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'assistant' && (
          <div className="w-full">
            <ExecutiveAnalyticsStudio
              isEmbeddedView={true}
              schoolId={schoolId}
              holdingName={holdingName}
              initialQuery={initialQuery || 'Estudiantes con adeudo activo por nivel y monto pendiente'}
              onBack={() => setActiveMainView('matrix')}
              onNavigateTab={onNavigateTab}
            />
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. DRAWER SLIDE-OVER: EXPEDIENTE 360° DEL ALUMNO DEUDOR                 */}
      {/* ========================================================================= */}
      {selectedDebtorForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#111827] border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-400 font-black text-lg">
                    {selectedDebtorForDrawer.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{selectedDebtorForDrawer.studentName}</h3>
                    <p className="text-xs text-slate-400">{selectedDebtorForDrawer.campusName} · {selectedDebtorForDrawer.level} {selectedDebtorForDrawer.gradeGroup}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDebtorForDrawer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resumen Financiero del Expediente */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo Exigible</span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {formatMXN(selectedDebtorForDrawer.amount)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Días de mora:</span>
                  <span className="font-bold text-white">{selectedDebtorForDrawer.daysOverdue} días</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Vencimiento:</span>
                  <span className="font-mono text-slate-300">{selectedDebtorForDrawer.dueDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>CFDI 4.0 SAT:</span>
                  <span className="font-mono text-emerald-400 font-bold uppercase">{selectedDebtorForDrawer.cfdiStatus}</span>
                </div>
              </div>

              {/* Información del Tutor */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tutor Registrado</span>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-white">{selectedDebtorForDrawer.tutorName}</div>
                  <div className="text-slate-400 font-mono">Tel: {selectedDebtorForDrawer.tutorPhone}</div>
                  <div className="text-slate-400">Email: {selectedDebtorForDrawer.tutorEmail}</div>
                </div>
              </div>

              {/* Acción Directiva Recomendada */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Acción Directiva Recomendada:
                </span>
                <p className="leading-relaxed">{selectedDebtorForDrawer.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => setSelectedDebtorForDrawer(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert(`Convenio generado para ${selectedDebtorForDrawer.studentName}. Se envió notificación al tutor.`);
                  setSelectedDebtorForDrawer(null);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white transition cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Generar Convenio
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
