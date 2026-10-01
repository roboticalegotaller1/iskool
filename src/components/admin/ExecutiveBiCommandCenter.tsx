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
import { formatMXN, AnalyticReportResult, AnalyticTableColumn } from '@/services/executiveAnalyticsEngine';
import ExecutiveAnalyticsStudio from './ExecutiveAnalyticsStudio';
import ExecutiveOracleDashboard from '@/components/oracle/ExecutiveOracleDashboard';
import { ExecutiveBoardReportDocument } from './ExecutiveBoardReportDocument';
import { useDeviceViewport } from '@/hooks/useDeviceViewport';

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

interface CashflowChartPoint {
  label: string;
  x: number;
  tuitionY: number;
  payrollY: number;
  tuitionVal: string;
  payrollVal: string;
  isForecast?: boolean;
}

export default function ExecutiveBiCommandCenter({
  isEmbeddedView = false,
  schoolId,
  holdingName = 'Instituto Bilingüe IBIME',
  initialQuery,
  onBack,
  onNavigateTab
}: ExecutiveBiCommandCenterProps) {
  // Inteligencia de pantalla y viewport en tiempo real (Laptop vs PC)
  const viewport = useDeviceViewport();

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

  // Objeto de sede seleccionada si aplica filtro
  const selectedCampusObj = useMemo(() => {
    if (selectedCampusFilter === 'all') return null;
    return CAMPUS_BENCHMARK_SEED.find(c => c.campusId === selectedCampusFilter) || null;
  }, [selectedCampusFilter]);

  // Factor de escala financiera para la sede seleccionada
  const campusScale = useMemo(() => {
    if (!selectedCampusObj) return 1.0;
    return selectedCampusObj.monthlyRevenue / 5000000;
  }, [selectedCampusObj]);

  // Filtrado de deudores según tranche y campus seleccionado
  const displayedDebtors = useMemo(() => {
    let list = DETAILED_AGING_DEBTORS_SEED;
    if (selectedCampusFilter !== 'all') {
      const cmp = CAMPUS_BENCHMARK_SEED.find(c => c.campusId === selectedCampusFilter);
      if (cmp) {
        list = list.filter(d => 
          d.campusName.toLowerCase().includes(cmp.shortName.toLowerCase()) || 
          d.campusName.toLowerCase().includes(cmp.slug.toLowerCase())
        );
      }
    }
    if (activeAgingTrancheFilter !== 'all') {
      list = list.filter(d => d.agingTranche === activeAgingTrancheFilter);
    }
    return list;
  }, [selectedCampusFilter, activeAgingTrancheFilter]);

  // Cómputo exhaustivo de telemetría reactiva según el horizonte temporal y sede
  const horizonData = useMemo(() => {
    if (timeHorizon === 'mtd') {
      // -------------------------------------------------------------
      // ESTE MES (SEPTIEMBRE 2026 - CIERRE ACTIVO)
      // -------------------------------------------------------------
      const rev = Math.round(5000000 * campusScale);
      const ebitda = Math.round(1540000 * campusScale);
      const margin = selectedCampusObj ? selectedCampusObj.ebitdaMarginPct : 30.8;
      const coll = Math.round(4770000 * campusScale);
      const overdue = Math.round(230000 * campusScale);
      const students = selectedCampusObj ? selectedCampusObj.currentEnrollment : 3740;
      const capacity = selectedCampusObj ? selectedCampusObj.capacityTotal : 4220;
      const occ = selectedCampusObj ? selectedCampusObj.occupancyRate : 88.6;

      return {
        horizon: 'mtd' as TimeHorizon,
        horizonLabel: 'Este Mes',
        horizonPeriod: 'Septiembre 2026 (Cierre Activo)',
        badgeText: 'Mes Actual · Cierre Activo Sep 2026',
        ebitdaValue: ebitda,
        ebitdaMarginPct: margin,
        ebitdaDeltaText: '+2.4% vs meta mensual',
        ebitdaMarginTrend: `+${margin.toFixed(1)}%`,
        ebitdaBarPct: 77,
        revenueTitle: 'Facturación Total (Septiembre 2026)',
        totalRevenue: rev,
        revenueMetaPct: 97.2,
        revenueDeltaText: '+6.8% vs Sep 2025',
        revenueConceptSubtitle: 'Colegiaturas + Cuotas de Septiembre',
        revenueBarPct: 97.2,
        collectionEfficiencyPct: 95.4,
        collectionTargetPct: 95.0,
        collectionCollected: coll,
        collectionOverdue: overdue,
        collectionSubtitle: 'Cobranza líquida del mes',
        collectionDeltaText: '+0.4% sobre meta',
        collectionBarPct: 95.4,
        enrolledStudents: students,
        capacitySeats: capacity,
        occupancyPct: occ,
        ratioStudentTeacher: selectedCampusObj ? `${selectedCampusObj.studentTeacherRatio}:1` : '17.4 : 1 (Óptimo)',
        capacitySubtitle: 'Matrícula activa en planteles',
        capacityDeltaText: `${occ.toFixed(1)}% Cupo`,
        capacityBarPct: occ,
        cashflowChart: {
          title: 'Flujo de Caja - Detalle Semanal de Septiembre 2026',
          subtitle: 'Evolución semanal de recaudo de colegiaturas vs egresos y dispersión quincenal de nómina',
          yLabels: ['$2.0M', '$1.5M', '$1.0M', '$0.5M'],
          points: [
            { label: 'Sem 1 (1-7)', x: 100, tuitionY: 70, payrollY: 195, tuitionVal: '$1.95M', payrollVal: '$0.45M' },
            { label: 'Sem 2 (8-14)', x: 250, tuitionY: 110, payrollY: 200, tuitionVal: '$1.40M', payrollVal: '$0.40M' },
            { label: 'Sem 3 (15-21)', x: 400, tuitionY: 155, payrollY: 120, tuitionVal: '$0.85M', payrollVal: '$1.35M' },
            { label: 'Sem 4 (22-28)', x: 550, tuitionY: 180, payrollY: 205, tuitionVal: '$0.55M', payrollVal: '$0.35M' },
            { label: 'Cierre 30 Sep', x: 700, tuitionY: 205, payrollY: 155, tuitionVal: '$0.25M', payrollVal: '$0.91M' }
          ],
          tuitionPath: 'M 100 70 Q 175 90, 250 110 T 400 155 T 550 180 T 700 205',
          tuitionArea: 'M 100 70 Q 175 90, 250 110 T 400 155 T 550 180 T 700 205 L 700 240 L 100 240 Z',
          payrollPath: 'M 100 195 Q 175 200, 250 200 T 400 120 T 550 205 T 700 155',
          payrollArea: 'M 100 195 Q 175 200, 250 200 T 400 120 T 550 205 T 700 155 L 700 240 L 100 240 Z',
          forecastPath: undefined,
          footerNote: 'Concentración de cobro en Sem 1 ($1.95M) · Quincenas docentes liquidadas en Sem 3 y fin de mes',
          coverageRatio: '1.45x Cobertura Mensual'
        },
        campusBenchmarks: [
          { campusId: 'montes', shortName: 'Campus Montes', currentEnrollment: 1620, capacityTotal: 1720, revenue: 2180000, revenueLabel: 'Facturación Sep', targetPct: 99.1, retentionPct: 96.4, ebitdaMarginPct: 32.4, occupancyRate: 94.2 },
          { campusId: 'coacalco', shortName: 'Campus Coacalco', currentEnrollment: 980, capacityTotal: 1100, revenue: 1320000, revenueLabel: 'Facturación Sep', targetPct: 94.3, retentionPct: 94.8, ebitdaMarginPct: 28.6, occupancyRate: 89.1 },
          { campusId: 'central', shortName: 'Campus Central', currentEnrollment: 720, capacityTotal: 850, revenue: 960000, revenueLabel: 'Facturación Sep', targetPct: 91.4, retentionPct: 93.1, ebitdaMarginPct: 26.2, occupancyRate: 84.7 },
          { campusId: 'torres', shortName: 'Campus Torres', currentEnrollment: 420, capacityTotal: 550, revenue: 540000, revenueLabel: 'Facturación Sep', targetPct: 87.1, retentionPct: 91.5, ebitdaMarginPct: 21.8, occupancyRate: 76.4 }
        ],
        campusBenchmarkHeader: 'Benchmark de 4 Planteles (Septiembre 2026)',
        campusBenchmarkSubtitle: 'Rendimiento comparativo mensual y recaudación neta de Septiembre',
        campusLeaderNote: 'Sede líder en EBITDA: Campus Montes (32.4% margen · $2.18M MXN)',
        agingTotalAmount: 39100,
        agingBadgeText: 'Total Sep: $39,100 MXN',
        agingSubtitle: 'Saldos corrientes y cartera en mora al corte de Septiembre 2026',
        agingTranches: {
          '0-30': { amount: 19800, count: 6, risk: 'Bajo' },
          '31-60': { amount: 14200, count: 4, risk: 'Medio' },
          '60+': { amount: 5100, count: 2, risk: 'Crítico' }
        },
        funnelStages: [
          { id: 'leads', name: 'Leads / Prospectos Registrados', count: 125, passRate: 54.4, color: '#3b82f6', gradient: 'from-blue-600 to-indigo-600' },
          { id: 'tours', name: 'Recorridos en Campus / Open House', count: 68, passRate: 66.2, color: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' },
          { id: 'evaluations', name: 'Evaluaciones Diagnósticas NEM', count: 45, passRate: 71.1, color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
          { id: 'enrolled', name: 'Inscripciones Formalizadas & Pagadas', count: 32, passRate: 100.0, color: '#22c55e', gradient: 'from-emerald-600 to-green-500' }
        ],
        conversionRatePct: 25.6,
        cacMxn: 1290,
        ltvMxn: 108000,
        ltvCacRatio: '83.7x (Excelente)',
        funnelSubtitle: 'Admisiones e inscripciones de último corte mensual (Septiembre 2026)',
        cashflowTableRows: [HOLDING_CASHFLOW_12M_SEED[11], HOLDING_CASHFLOW_12M_SEED[10]],
        cashflowTableSummaryRow: {
          label: 'Total Septiembre 2026',
          tuitionRevenues: 4420000,
          enrollmentRevenues: 220000,
          extracurricularRevenues: 360000,
          totalRevenues: 5000000,
          teacherPayroll: 2250000,
          adminPayroll: 510000,
          facilityLeasing: 380000,
          totalExpenses: 3460000,
          ebitda: 1540000,
          ebitdaMargin: 30.8
        }
      };
    }

    if (timeHorizon === 'qtd') {
      // -------------------------------------------------------------
      // TRIMESTRE (Q3 2026: JULIO + AGOSTO + SEPTIEMBRE)
      // -------------------------------------------------------------
      const rev = Math.round(16240000 * campusScale);
      const ebitda = Math.round(5770000 * campusScale);
      const margin = selectedCampusObj ? (selectedCampusObj.ebitdaMarginPct + 3.1) : 35.5;
      const coll = Math.round(15395000 * campusScale);
      const overdue = Math.round(845000 * campusScale);
      const students = selectedCampusObj ? selectedCampusObj.currentEnrollment : 3740;
      const capacity = selectedCampusObj ? selectedCampusObj.capacityTotal : 4220;
      const occ = selectedCampusObj ? selectedCampusObj.occupancyRate : 88.6;

      return {
        horizon: 'qtd' as TimeHorizon,
        horizonLabel: 'Trimestre',
        horizonPeriod: 'Trimestre Q3 2026 (Julio – Septiembre)',
        badgeText: 'Trimestre Q3 · Periodo Central de Inscripciones',
        ebitdaValue: ebitda,
        ebitdaMarginPct: margin,
        ebitdaDeltaText: '+4.1% vs Q2 anterior',
        ebitdaMarginTrend: `+${margin.toFixed(1)}%`,
        ebitdaBarPct: 89,
        revenueTitle: 'Facturación Total (Trimestre Q3 2026)',
        totalRevenue: rev,
        revenueMetaPct: 98.1,
        revenueDeltaText: '+12.6% vs Q3 ciclo 25',
        revenueConceptSubtitle: 'Julio ($4.97M) + Agosto Pico ($6.27M) + Sep ($5.00M)',
        revenueBarPct: 98.1,
        collectionEfficiencyPct: 94.8,
        collectionTargetPct: 95.0,
        collectionCollected: coll,
        collectionOverdue: overdue,
        collectionSubtitle: 'Cobranza trimestral acumulada',
        collectionDeltaText: '94.8% recaudado',
        collectionBarPct: 94.8,
        enrolledStudents: students,
        capacitySeats: capacity,
        occupancyPct: occ,
        ratioStudentTeacher: selectedCampusObj ? `${selectedCampusObj.studentTeacherRatio}:1` : '17.4 : 1 (Óptimo)',
        capacitySubtitle: '+185 alumnos netos sumados en Q3',
        capacityDeltaText: '+5.2% vs Q2',
        capacityBarPct: occ,
        cashflowChart: {
          title: 'Flujo de Caja - Trimestre Q3 2026 (Julio, Agosto, Septiembre)',
          subtitle: 'Evolución mensual de ingresos y egresos con el pico récord de reinscripciones en Agosto ($6.27M)',
          yLabels: ['$7.0M', '$5.0M', '$3.5M', '$2.0M'],
          points: [
            { label: 'Jul 26', x: 150, tuitionY: 110, payrollY: 160, tuitionVal: '$4.97M', payrollVal: '$2.70M' },
            { label: 'Ago 26 (Pico Anual)', x: 400, tuitionY: 40, payrollY: 155, tuitionVal: '$6.27M', payrollVal: '$2.75M' },
            { label: 'Sep 26 (Actual)', x: 650, tuitionY: 108, payrollY: 154, tuitionVal: '$5.00M', payrollVal: '$2.76M' }
          ],
          tuitionPath: 'M 150 110 Q 275 35, 400 40 T 650 108',
          tuitionArea: 'M 150 110 Q 275 35, 400 40 T 650 108 L 650 240 L 150 240 Z',
          payrollPath: 'M 150 160 Q 275 155, 400 155 T 650 154',
          payrollArea: 'M 150 160 Q 275 155, 400 155 T 650 154 L 650 240 L 150 240 Z',
          forecastPath: undefined,
          footerNote: 'Agosto representó el 38.6% del flujo trimestral ($6.27M) impulsado por matrículas de nuevo ingreso',
          coverageRatio: '1.85x Cobertura Trimestral'
        },
        campusBenchmarks: [
          { campusId: 'montes', shortName: 'Campus Montes', currentEnrollment: 1620, capacityTotal: 1720, revenue: 7080000, revenueLabel: 'Facturación Q3', targetPct: 99.4, retentionPct: 96.4, ebitdaMarginPct: 36.8, occupancyRate: 94.2 },
          { campusId: 'coacalco', shortName: 'Campus Coacalco', currentEnrollment: 980, capacityTotal: 1100, revenue: 4290000, revenueLabel: 'Facturación Q3', targetPct: 95.8, retentionPct: 94.8, ebitdaMarginPct: 32.1, occupancyRate: 89.1 },
          { campusId: 'central', shortName: 'Campus Central', currentEnrollment: 720, capacityTotal: 850, revenue: 3120000, revenueLabel: 'Facturación Q3', targetPct: 93.2, retentionPct: 93.1, ebitdaMarginPct: 29.5, occupancyRate: 84.7 },
          { campusId: 'torres', shortName: 'Campus Torres', currentEnrollment: 420, capacityTotal: 550, revenue: 1750000, revenueLabel: 'Facturación Q3', targetPct: 89.0, retentionPct: 91.5, ebitdaMarginPct: 24.6, occupancyRate: 76.4 }
        ],
        campusBenchmarkHeader: 'Benchmark de 4 Planteles (Trimestre Q3 2026)',
        campusBenchmarkSubtitle: 'Recaudación agregada y eficiencia operativa de los 3 meses de verano',
        campusLeaderNote: 'Sede líder en EBITDA Q3: Campus Montes (36.8% margen · $7.08M MXN)',
        agingTotalAmount: 92400,
        agingBadgeText: 'Total Q3: $92,400 MXN',
        agingSubtitle: 'Volumen trimestral de morosidad y cuentas gestionadas',
        agingTranches: {
          '0-30': { amount: 48200, count: 14, risk: 'Bajo' },
          '31-60': { amount: 29600, count: 8, risk: 'Medio' },
          '60+': { amount: 14600, count: 4, risk: 'Crítico' }
        },
        funnelStages: [
          { id: 'leads', name: 'Leads / Prospectos Registrados', count: 480, passRate: 61.5, color: '#3b82f6', gradient: 'from-blue-600 to-indigo-600' },
          { id: 'tours', name: 'Recorridos en Campus / Open House', count: 295, passRate: 71.2, color: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' },
          { id: 'evaluations', name: 'Evaluaciones Diagnósticas NEM', count: 210, passRate: 81.9, color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
          { id: 'enrolled', name: 'Inscripciones Formalizadas & Pagadas', count: 172, passRate: 100.0, color: '#22c55e', gradient: 'from-emerald-600 to-green-500' }
        ],
        conversionRatePct: 35.8,
        cacMxn: 1380,
        ltvMxn: 108000,
        ltvCacRatio: '78.3x (Líder)',
        funnelSubtitle: 'Campaña principal de verano de admisiones e inscripciones (Q3)',
        cashflowTableRows: [HOLDING_CASHFLOW_12M_SEED[9], HOLDING_CASHFLOW_12M_SEED[10], HOLDING_CASHFLOW_12M_SEED[11]],
        cashflowTableSummaryRow: {
          label: 'Total Trimestre Q3 2026',
          tuitionRevenues: 12790000,
          enrollmentRevenues: 2590000,
          extracurricularRevenues: 860000,
          totalRevenues: 16240000,
          teacherPayroll: 6710000,
          adminPayroll: 1500000,
          facilityLeasing: 1140000,
          totalExpenses: 10470000,
          ebitda: 5770000,
          ebitdaMargin: 35.5
        }
      };
    }

    if (timeHorizon === 'forecast') {
      // -------------------------------------------------------------
      // PROYECCIÓN 90 DÍAS (Q4 2026: OCTUBRE, NOVIEMBRE, DICIEMBRE FORECAST)
      // -------------------------------------------------------------
      const rev = Math.round(15090000 * campusScale);
      const ebitda = Math.round(4350000 * campusScale);
      const margin = selectedCampusObj ? (selectedCampusObj.ebitdaMarginPct - 1.2) : 28.8;
      const coll = Math.round(14109000 * campusScale);
      const overdue = Math.round(981000 * campusScale);
      const students = selectedCampusObj ? Math.round(selectedCampusObj.currentEnrollment * 1.03) : 3850;
      const capacity = selectedCampusObj ? selectedCampusObj.capacityTotal : 4220;
      const occ = selectedCampusObj ? Math.min(100, selectedCampusObj.occupancyRate * 1.03) : 91.2;

      return {
        horizon: 'forecast' as TimeHorizon,
        horizonLabel: 'Proyección 90d',
        horizonPeriod: 'Pronóstico Q4 2026 (Octubre – Diciembre 2026)',
        badgeText: 'Proyección Predictiva 90 Días · Modelo Algorítmico',
        ebitdaValue: ebitda,
        ebitdaMarginPct: margin,
        ebitdaDeltaText: 'Proyección Q4 con aguinaldos',
        ebitdaMarginTrend: `+${margin.toFixed(1)}%`,
        ebitdaBarPct: 72,
        revenueTitle: 'Facturación Proyectada (Próximos 90 Días)',
        totalRevenue: rev,
        revenueMetaPct: 95.0,
        revenueDeltaText: '+6.5% crecimiento modelado',
        revenueConceptSubtitle: 'Oct 26 ($5.02M) + Nov 26 ($5.01M) + Dic 26 ($5.06M)',
        revenueBarPct: 95.0,
        collectionEfficiencyPct: 93.5,
        collectionTargetPct: 94.0,
        collectionCollected: coll,
        collectionOverdue: overdue,
        collectionSubtitle: 'Recaudación modelada a 90 días',
        collectionDeltaText: 'Riesgo modelado: $981K',
        collectionBarPct: 93.5,
        enrolledStudents: students,
        capacitySeats: capacity,
        occupancyPct: occ,
        ratioStudentTeacher: selectedCampusObj ? `${(selectedCampusObj.studentTeacherRatio * 1.02).toFixed(1)}:1` : '17.9 : 1 (En Expansión)',
        capacitySubtitle: '+110 nuevos alumnos proyectados para inicio 2027',
        capacityDeltaText: `${occ.toFixed(1)}% Proyectado`,
        capacityBarPct: occ,
        cashflowChart: {
          title: 'Proyección Algorítmica de Cashflow a 90 Días (Q4 2026)',
          subtitle: 'Modelo predictivo continuo: Cierre Septiembre base + Octubre, Noviembre y Diciembre (con provisión de aguinaldos)',
          yLabels: ['$6.0M', '$4.5M', '$3.0M', '$1.5M'],
          points: [
            { label: 'Sep 26 (Base)', x: 100, tuitionY: 108, payrollY: 154, tuitionVal: '$5.00M', payrollVal: '$2.76M' },
            { label: 'Oct 26 (F)', x: 300, tuitionY: 105, payrollY: 158, tuitionVal: '$5.02M', payrollVal: '$2.77M', isForecast: true },
            { label: 'Nov 26 (F)', x: 500, tuitionY: 106, payrollY: 158, tuitionVal: '$5.01M', payrollVal: '$2.77M', isForecast: true },
            { label: 'Dic 26 (F - Aguinaldo)', x: 700, tuitionY: 102, payrollY: 135, tuitionVal: '$5.06M', payrollVal: '$3.08M', isForecast: true }
          ],
          tuitionPath: 'M 100 108 Q 200 105, 300 105 T 500 106 T 700 102',
          tuitionArea: 'M 100 108 Q 200 105, 300 105 T 500 106 T 700 102 L 700 240 L 100 240 Z',
          payrollPath: 'M 100 154 Q 200 156, 300 158 T 500 158 T 700 135',
          payrollArea: 'M 100 154 Q 200 156, 300 158 T 500 158 T 700 135 L 700 240 L 100 240 Z',
          forecastPath: 'M 100 108 Q 400 95, 700 102',
          footerNote: 'Ajuste de egresos en Diciembre por provisión estatutaria de gratificaciones y aguinaldo (+12.4% nómina)',
          coverageRatio: '1.33x Cobertura Forecast'
        },
        campusBenchmarks: [
          { campusId: 'montes', shortName: 'Campus Montes', currentEnrollment: 1648, capacityTotal: 1720, revenue: 6580000, revenueLabel: 'Proyección 90d', targetPct: 96.5, retentionPct: 96.8, ebitdaMarginPct: 31.5, occupancyRate: 95.8 },
          { campusId: 'coacalco', shortName: 'Campus Coacalco', currentEnrollment: 995, capacityTotal: 1100, revenue: 3980000, revenueLabel: 'Proyección 90d', targetPct: 94.0, retentionPct: 95.0, ebitdaMarginPct: 27.8, occupancyRate: 90.5 },
          { campusId: 'central', shortName: 'Campus Central', currentEnrollment: 733, capacityTotal: 850, revenue: 2900000, revenueLabel: 'Proyección 90d', targetPct: 91.0, retentionPct: 93.5, ebitdaMarginPct: 25.4, occupancyRate: 86.2 },
          { campusId: 'torres', shortName: 'Campus Torres', currentEnrollment: 437, capacityTotal: 550, revenue: 1630000, revenueLabel: 'Proyección 90d', targetPct: 87.5, retentionPct: 92.0, ebitdaMarginPct: 21.0, occupancyRate: 79.5 }
        ],
        campusBenchmarkHeader: 'Benchmark de 4 Planteles (Proyección 90 Días)',
        campusBenchmarkSubtitle: 'Ingresos modelados y capacidad física prevista para el cierre del ciclo Q4',
        campusLeaderNote: 'Sede líder estimada: Campus Montes ($6.58M MXN proyectados · 95.8% cupo)',
        agingTotalAmount: 48500,
        agingBadgeText: 'Riesgo 90d: $48,500 MXN',
        agingSubtitle: 'Riesgo proyectado de morosidad y provisión preventiva de incobrables',
        agingTranches: {
          '0-30': { amount: 24500, count: 10, risk: 'Bajo' },
          '31-60': { amount: 16800, count: 5, risk: 'Medio' },
          '60+': { amount: 7200, count: 3, risk: 'Crítico' }
        },
        funnelStages: [
          { id: 'leads', name: 'Leads / Prospectos Estimados', count: 340, passRate: 55.9, color: '#3b82f6', gradient: 'from-blue-600 to-indigo-600' },
          { id: 'tours', name: 'Recorridos en Campus / Open House', count: 190, passRate: 63.2, color: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' },
          { id: 'evaluations', name: 'Evaluaciones Diagnósticas NEM', count: 120, passRate: 68.3, color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
          { id: 'enrolled', name: 'Inscripciones Estimadas Medio Término', count: 82, passRate: 100.0, color: '#22c55e', gradient: 'from-emerald-600 to-green-500' }
        ],
        conversionRatePct: 24.1,
        cacMxn: 1510,
        ltvMxn: 112000,
        ltvCacRatio: '74.2x (Saludable)',
        funnelSubtitle: 'Admisiones proyectadas para inicio de semestre (Enero 2027)',
        cashflowTableRows: [HOLDING_CASHFLOW_12M_SEED[11], HOLDING_CASHFLOW_12M_SEED[12], HOLDING_CASHFLOW_12M_SEED[13], HOLDING_CASHFLOW_12M_SEED[14]],
        cashflowTableSummaryRow: {
          label: 'Total Proyectado Q4 2026',
          tuitionRevenues: 13360000,
          enrollmentRevenues: 760000,
          extracurricularRevenues: 970000,
          totalRevenues: 15090000,
          teacherPayroll: 7040000,
          adminPayroll: 1580000,
          facilityLeasing: 1155000,
          totalExpenses: 10740000,
          ebitda: 4350000,
          ebitdaMargin: 28.8
        }
      };
    }

    // -------------------------------------------------------------
    // DEFAULT: AÑO ACUMULADO (YTD: CICLO COMPLETO 12 MESES HISTÓRICOS)
    // -------------------------------------------------------------
    const rev = Math.round(58740000 * campusScale);
    const ebitda = Math.round(17540000 * campusScale);
    const margin = selectedCampusObj ? selectedCampusObj.ebitdaMarginPct : 29.9;
    const coll = Math.round(55333000 * campusScale);
    const overdue = Math.round(3407000 * campusScale);
    const students = selectedCampusObj ? selectedCampusObj.currentEnrollment : 3740;
    const capacity = selectedCampusObj ? selectedCampusObj.capacityTotal : 4220;
    const occ = selectedCampusObj ? selectedCampusObj.occupancyRate : 88.6;

    return {
      horizon: 'ytd' as TimeHorizon,
      horizonLabel: 'Año Acumulado',
      horizonPeriod: 'Ciclo 2025–2026 Completo (Octubre 2025 – Septiembre 2026)',
      badgeText: 'Año Acumulado (12M) · Datos Consolidados Auditados',
      ebitdaValue: ebitda,
      ebitdaMarginPct: margin,
      ebitdaDeltaText: '+3.2% vs presupuesto anual',
      ebitdaMarginTrend: `+${margin.toFixed(1)}%`,
      ebitdaBarPct: 75,
      revenueTitle: 'Facturación Total (Año Acumulado 12M)',
      totalRevenue: rev,
      revenueMetaPct: 96.5,
      revenueDeltaText: '+9.8% vs ciclo escolar 2024-2025',
      revenueConceptSubtitle: '12 Meses Históricos Auditados (Colegiaturas + Cuotas)',
      revenueBarPct: 96.5,
      collectionEfficiencyPct: 94.2,
      collectionTargetPct: 95.0,
      collectionCollected: coll,
      collectionOverdue: overdue,
      collectionSubtitle: 'Cobranza global consolidada',
      collectionDeltaText: '94.2% efectividad anual',
      collectionBarPct: 94.2,
      enrolledStudents: students,
      capacitySeats: capacity,
      occupancyPct: occ,
      ratioStudentTeacher: selectedCampusObj ? `${selectedCampusObj.studentTeacherRatio}:1` : '17.4 : 1 (Óptimo)',
      capacitySubtitle: 'Capacidad consolidada en 4 planteles',
      capacityDeltaText: `${occ.toFixed(1)}% Cupo`,
      capacityBarPct: occ,
      cashflowChart: {
        title: 'Flujo de Caja Financiero & Forecast 90 Días (Ciclo Anual)',
        subtitle: 'Comparativo de 12 meses consolidados (Oct 25 – Sep 26) + Proyección algorítmica continua a 90 días',
        yLabels: ['$6.5M', '$5.0M', '$3.5M', '$2.0M'],
        points: [
          { label: 'Oct 25', x: 60, tuitionY: 140, payrollY: 185, tuitionVal: '$4.54M', payrollVal: '$2.66M' },
          { label: 'Nov', x: 120, tuitionY: 142, payrollY: 185, tuitionVal: '$4.52M', payrollVal: '$2.66M' },
          { label: 'Dic', x: 180, tuitionY: 139, payrollY: 168, tuitionVal: '$4.55M', payrollVal: '$2.99M' },
          { label: 'Ene 26', x: 240, tuitionY: 90, payrollY: 180, tuitionVal: '$5.30M', payrollVal: '$2.68M' },
          { label: 'Feb', x: 300, tuitionY: 130, payrollY: 180, tuitionVal: '$4.68M', payrollVal: '$2.68M' },
          { label: 'Mar', x: 360, tuitionY: 130, payrollY: 180, tuitionVal: '$4.68M', payrollVal: '$2.69M' },
          { label: 'Abr', x: 420, tuitionY: 145, payrollY: 180, tuitionVal: '$4.50M', payrollVal: '$2.69M' },
          { label: 'May', x: 480, tuitionY: 125, payrollY: 180, tuitionVal: '$4.79M', payrollVal: '$2.70M' },
          { label: 'Jun', x: 540, tuitionY: 105, payrollY: 178, tuitionVal: '$5.06M', payrollVal: '$2.70M' },
          { label: 'Jul', x: 600, tuitionY: 110, payrollY: 178, tuitionVal: '$4.97M', payrollVal: '$2.70M' },
          { label: 'Ago', x: 660, tuitionY: 40, payrollY: 172, tuitionVal: '$6.27M', payrollVal: '$2.75M' },
          { label: 'Sep', x: 720, tuitionY: 108, payrollY: 172, tuitionVal: '$5.00M', payrollVal: '$2.76M' }
        ],
        tuitionPath: 'M 60 140 Q 140 135, 240 90 T 360 130 T 480 125 T 540 105 T 660 40 T 720 108',
        tuitionArea: 'M 60 140 Q 140 135, 240 90 T 360 130 T 480 125 T 540 105 T 660 40 T 720 108 L 720 240 L 60 240 Z',
        payrollPath: 'M 60 185 Q 120 185, 180 168 T 300 180 T 480 180 T 600 178 T 720 172',
        payrollArea: 'M 60 185 Q 120 185, 180 168 T 300 180 T 480 180 T 600 178 T 720 172 L 720 240 L 60 240 Z',
        forecastPath: 'M 720 108 Q 745 105, 770 102',
        footerNote: 'Picos históricos de reinscripción anual: Enero ($5.30M) y Agosto ($6.27M) · Margen promedio anual: 29.9%',
        coverageRatio: '1.72x Cobertura Anual'
      },
      campusBenchmarks: [
        { campusId: 'montes', shortName: 'Campus Montes', currentEnrollment: 1620, capacityTotal: 1720, revenue: 25610000, revenueLabel: 'Facturación Anual', targetPct: 98.4, retentionPct: 96.4, ebitdaMarginPct: 32.4, occupancyRate: 94.2 },
        { campusId: 'coacalco', shortName: 'Campus Coacalco', currentEnrollment: 980, capacityTotal: 1100, revenue: 15510000, revenueLabel: 'Facturación Anual', targetPct: 94.8, retentionPct: 94.8, ebitdaMarginPct: 28.6, occupancyRate: 89.1 },
        { campusId: 'central', shortName: 'Campus Central', currentEnrollment: 720, capacityTotal: 850, revenue: 11280000, revenueLabel: 'Facturación Anual', targetPct: 91.5, retentionPct: 93.1, ebitdaMarginPct: 26.2, occupancyRate: 84.7 },
        { campusId: 'torres', shortName: 'Campus Torres', currentEnrollment: 420, capacityTotal: 550, revenue: 6340000, revenueLabel: 'Facturación Anual', targetPct: 87.8, retentionPct: 91.5, ebitdaMarginPct: 21.8, occupancyRate: 76.4 }
      ],
      campusBenchmarkHeader: 'Benchmark de los 4 Planteles (Año Acumulado)',
      campusBenchmarkSubtitle: 'Rendimiento comparativo anual, metas de recaudación y medidor de ocupación física',
      campusLeaderNote: 'Sede líder en EBITDA Anual: Campus Montes (32.4% margen · $25.61M MXN)',
      agingTotalAmount: 342000,
      agingBadgeText: 'Acumulado 12M: $342K MXN',
      agingSubtitle: 'Histórico anual de gestión de cartera y cobranza recuperada (94.2%)',
      agingTranches: {
        '0-30': { amount: 182000, count: 28, risk: 'Bajo' },
        '31-60': { amount: 108000, count: 16, risk: 'Medio' },
        '60+': { amount: 52000, count: 7, risk: 'Crítico' }
      },
      funnelStages: [
        { id: 'leads', name: 'Leads / Prospectos Registrados', count: 1640, passRate: 59.8, color: '#3b82f6', gradient: 'from-blue-600 to-indigo-600' },
        { id: 'tours', name: 'Recorridos en Campus / Open House', count: 980, passRate: 68.4, color: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' },
        { id: 'evaluations', name: 'Evaluaciones Diagnósticas NEM', count: 670, passRate: 73.9, color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
        { id: 'enrolled', name: 'Inscripciones Formalizadas & Pagadas', count: 495, passRate: 100.0, color: '#22c55e', gradient: 'from-emerald-600 to-green-500' }
      ],
      conversionRatePct: 30.2,
      cacMxn: 1420,
      ltvMxn: 108000,
      ltvCacRatio: '76.1x (Élite)',
      funnelSubtitle: 'Conversión acumulada del ciclo escolar 2025–2026 completo',
      cashflowTableRows: HOLDING_CASHFLOW_12M_SEED.slice(0, 12),
      cashflowTableSummaryRow: {
        label: 'Total Ciclo 2025–2026 (12 Meses)',
        tuitionRevenues: 50880000,
        enrollmentRevenues: 4180000,
        extracurricularRevenues: 3680000,
        totalRevenues: 58740000,
        teacherPayroll: 26570000,
        adminPayroll: 5850000,
        facilityLeasing: 4560000,
        totalExpenses: 41200000,
        ebitda: 17540000,
        ebitdaMargin: 29.9
      }
    };
  }, [timeHorizon, selectedCampusObj, campusScale]);

  // Manejador para copiar síntesis ejecutiva al portapapeles
  const handleCopyExecutiveSummary = () => {
    const summaryText = `ISKOOL EXECUTIVE BI REPORT - ${holdingName}
Periodo: ${horizonData.horizonPeriod}
${selectedCampusObj ? `Sede Filtrada: ${selectedCampusObj.campusName}` : 'Consolidado Holding: 4 Planteles (Montes, Coacalco, Central, Torres)'}
Fecha de Emisión: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
--------------------------------------------------
• Margen EBITDA: +${horizonData.ebitdaMarginPct}% (${horizonData.ebitdaDeltaText})
• Facturación Total: ${formatMXN(horizonData.totalRevenue)} (Meta: ${horizonData.revenueMetaPct}%)
• Eficiencia de Cobranza: ${horizonData.collectionEfficiencyPct}% (${formatMXN(horizonData.collectionCollected)} recaudados | ${formatMXN(horizonData.collectionOverdue)} en mora)
• Capacidad de Ocupación: ${horizonData.occupancyPct}% (${horizonData.enrolledStudents} de ${horizonData.capacitySeats} Asientos)
• Cartera Vencida: ${formatMXN(horizonData.agingTotalAmount)}
• Conversión de Matrícula: ${horizonData.conversionRatePct}% (CAC: ${formatMXN(horizonData.cacMxn)} | LTV: ${formatMXN(horizonData.ltvMxn)} | Ratio: ${horizonData.ltvCacRatio})
--------------------------------------------------
Generado por Motor Autónomo de Inteligencia Pedagógica & Analítica (0 Tokens).`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  // Exportar matriz a formato CSV según el horizonte temporal activo
  const handleExportCSV = () => {
    const headers = ['Periodo', 'Colegiaturas', 'Inscripciones', 'Talleres', 'Total Ingresos', 'Nomina Docente', 'Nomina Admin', 'Arrendamiento', 'Total Egresos', 'EBITDA', 'Margen %'];
    const rows = horizonData.cashflowTableRows.map(c => [
      c.month,
      c.tuitionRevenues,
      c.enrollmentRevenues,
      c.extracurricularRevenues,
      c.totalRevenues,
      c.teacherPayroll,
      c.adminPayroll,
      c.facilityLeasing,
      c.totalExpenses,
      c.ebitda,
      `${c.ebitdaMargin}%`
    ]);

    const summary = horizonData.cashflowTableSummaryRow;
    rows.push([
      summary.label,
      summary.tuitionRevenues,
      summary.enrollmentRevenues,
      summary.extracurricularRevenues,
      summary.totalRevenues,
      summary.teacherPayroll,
      summary.adminPayroll,
      summary.facilityLeasing,
      summary.totalExpenses,
      summary.ebitda,
      `${summary.ebitdaMargin}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Ejecutivo_BI_${holdingName.replace(/\s+/g, '_')}_${horizonData.horizon.toUpperCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reporte Ejecutivo Integral para Consejos de Administración (Impresión y Exportación a PDF de Alta Fidelidad)
  const biBoardReport = useMemo<AnalyticReportResult>(() => {
    const isAgingView = activeMainView === 'aging';
    const isCashflowView = activeMainView === 'cashflow';
    const isCampusesView = activeMainView === 'campuses';

    let tableCols: AnalyticTableColumn[] = [];
    let tableRows: any[] = [];

    if (isCashflowView) {
      tableCols = [
        { key: 'month', label: 'Periodo', align: 'left' },
        { key: 'tuitionRevenues', label: 'Colegiaturas', align: 'right', isCurrency: true },
        { key: 'enrollmentRevenues', label: 'Inscripciones', align: 'right', isCurrency: true },
        { key: 'extracurricularRevenues', label: 'Talleres/Otros', align: 'right', isCurrency: true },
        { key: 'totalRevenues', label: 'Total Ingresos', align: 'right', isCurrency: true },
        { key: 'teacherPayroll', label: 'Nómina Docente', align: 'right', isCurrency: true },
        { key: 'adminPayroll', label: 'Nómina Admin', align: 'right', isCurrency: true },
        { key: 'facilityLeasing', label: 'Arrendamiento', align: 'right', isCurrency: true },
        { key: 'totalExpenses', label: 'Total Egresos', align: 'right', isCurrency: true },
        { key: 'ebitda', label: 'EBITDA Operativo', align: 'right', isCurrency: true },
        { key: 'ebitdaMargin', label: 'Margen %', align: 'center', isBadge: true }
      ];
      tableRows = horizonData.cashflowTableRows.map(r => ({
        ...r,
        ebitdaMargin: `${r.ebitdaMargin.toFixed(1)}%`
      }));
    } else if (isCampusesView) {
      tableCols = [
        { key: 'campusName', label: 'Plantel Educativo', align: 'left' },
        { key: 'location', label: 'Ubicación', align: 'left' },
        { key: 'currentEnrollment', label: 'Matrícula', align: 'center' },
        { key: 'occupancyRate', label: 'Ocupación %', align: 'center', isBadge: true },
        { key: 'monthlyRevenue', label: 'Facturación Mensual', align: 'right', isCurrency: true },
        { key: 'ebitdaMarginPct', label: 'Margen EBITDA', align: 'center', isBadge: true },
        { key: 'studentRetentionPct', label: 'Retención %', align: 'center', isBadge: true }
      ];
      tableRows = CAMPUS_BENCHMARK_SEED.map(c => ({
        ...c,
        campusName: c.campusName,
        occupancyRate: `${c.occupancyRate.toFixed(1)}%`,
        ebitdaMarginPct: `${c.ebitdaMarginPct.toFixed(1)}%`,
        studentRetentionPct: `${c.studentRetentionPct.toFixed(1)}%`
      }));
    } else {
      // Por defecto y vistas Matrix / Aging: Padrón de deudores auditados con SAT CFDI
      tableCols = [
        { key: 'studentName', label: 'Alumno / Matrícula', align: 'left' },
        { key: 'campusName', label: 'Plantel & Nivel', align: 'left' },
        { key: 'concept', label: 'Concepto Exigible', align: 'left' },
        { key: 'amount', label: 'Monto Adeudo', align: 'right', isCurrency: true },
        { key: 'daysOverdue', label: 'Días Vencido', align: 'center', isBadge: true },
        { key: 'tutorInfo', label: 'Tutor Registrado & Contacto', align: 'left' },
        { key: 'cfdiStatus', label: 'Estatus CFDI 4.0 SAT', align: 'center', isBadge: true },
        { key: 'recommendedAction', label: 'Acción Directiva Resolutiva', align: 'left' }
      ];
      tableRows = displayedDebtors.map(d => ({
        ...d,
        studentName: `${d.studentName} (${d.studentId})`,
        campusName: `${d.campusName} - ${d.level} ${d.gradeGroup}`,
        daysOverdue: `${d.daysOverdue} días`,
        tutorInfo: `${d.tutorName} · ${d.tutorPhone}`,
        cfdiStatus: d.cfdiStatus.toUpperCase()
      }));
    }

    return {
      domain: 'STRATEGIC_CEO_RADAR',
      queryReceived: `Dictamen Ejecutivo de Gobernanza y Finanzas — ${horizonData.horizonPeriod}`,
      reportTitle: `Informe Integral de Gobernanza Financiera y Operativa para Junta Directiva (${horizonData.horizonPeriod})`,
      schoolName: selectedCampusObj ? `${holdingName} · Campus ${selectedCampusObj.shortName}` : holdingName,
      schoolId: schoolId || 'ibime-holding',
      isConsolidated: !selectedCampusObj,
      generatedAt: new Date().toISOString(),
      tokenCost: 0,
      explanation: {
        summary: `El presente expediente consolida el estado financiero y operativo de ${selectedCampusObj ? `la sede ${selectedCampusObj.campusName}` : `la red corporativa ${holdingName} (4 planteles, ${horizonData.enrolledStudents.toLocaleString('es-MX')} alumnos)`}. Se audita una facturación de ${formatMXN(horizonData.totalRevenue)} con EBITDA operativo de ${formatMXN(horizonData.ebitdaValue)} (${horizonData.ebitdaMarginPct.toFixed(1)}% de margen). La eficiencia de cobranza se sitúa en ${horizonData.collectionEfficiencyPct.toFixed(1)}% con un importe en cartera vencida de ${formatMXN(horizonData.collectionOverdue)}. Todos los registros se encuentran conciliados con el motor de facturación CFDI 4.0 SAT y las directivas académicas NEM 2024.`,
        fieldsIncluded: ['Facturación', 'Nómina Docente y Administrativa', 'EBITDA', 'Cartera Vencida', 'Ocupación', 'CFDI SAT'],
        filtersApplied: [
          `Horizonte: ${horizonData.horizonLabel}`,
          selectedCampusObj ? `Sede: ${selectedCampusObj.campusName}` : 'Red Consolidada (4 Planteles)'
        ],
        visualizationDescription: 'Scorecard ejecutivo, radar cuatridimensional de salud escolar y padrón auditado de expedientes.',
        followUpPrompt: '¿Deseas desglosar los acuerdos de cobro para el Consejo de Administración?'
      },
      directAnswer: `**Dictamen Oficial para el Consejo de Administración:**\n\n• **EBITDA y Margen:** Se reporta un EBITDA de **${formatMXN(horizonData.ebitdaValue)}** representando un margen operativo de **${horizonData.ebitdaMarginPct.toFixed(1)}%** (${horizonData.ebitdaDeltaText}).\n• **Facturación y Cobranza:** Ingresos totales de **${formatMXN(horizonData.totalRevenue)}** con eficiencia de recuperación de cobranza del **${horizonData.collectionEfficiencyPct.toFixed(1)}%**.\n• **Cartera Vencida en Riesgo:** Saldo en mora de **${formatMXN(horizonData.collectionOverdue)}** concentrado en ${displayedDebtors.length} expedientes auditados.\n• **Capacidad Instalada:** Ocupación del **${horizonData.capacitySubtitle}** con una matrícula activa de **${horizonData.enrolledStudents.toLocaleString('es-MX')} alumnos** distribuidos en los 4 planteles.\n• **Resolución Inmediata:** Se somete a aprobación del Consejo la suscripción de convenios de pago diferido y la aplicación estricta de timbrado complementario de pagos bajo CFDI 4.0 SAT.`,
      kpis: [
        {
          id: 'ebitda',
          label: 'Margen EBITDA',
          value: `${horizonData.ebitdaMarginPct.toFixed(1)}%`,
          subtext: `${formatMXN(horizonData.ebitdaValue)} Operativo`,
          trend: { direction: 'up', value: horizonData.ebitdaDeltaText },
          color: 'emerald'
        },
        {
          id: 'revenue',
          label: 'Facturación Total',
          value: formatMXN(horizonData.totalRevenue),
          subtext: horizonData.revenueDeltaText,
          trend: { direction: 'up', value: `+${horizonData.revenueMetaPct}% meta` },
          color: 'cyan'
        },
        {
          id: 'collection',
          label: 'Eficiencia Cobranza',
          value: `${horizonData.collectionEfficiencyPct.toFixed(1)}%`,
          subtext: `${formatMXN(horizonData.collectionOverdue)} en mora`,
          trend: { direction: 'up', value: `Meta: ${horizonData.collectionTargetPct}%` },
          color: 'amber'
        },
        {
          id: 'capacity',
          label: 'Matrícula & Capacidad',
          value: `${horizonData.enrolledStudents.toLocaleString('es-MX')}`,
          subtext: `${horizonData.capacitySubtitle} ocupación`,
          trend: { direction: 'neutral', value: horizonData.ratioStudentTeacher },
          color: 'purple'
        }
      ],
      table: {
        columns: tableCols,
        rows: tableRows,
        totalRows: tableRows.length
      },
      suggestedQueries: []
    };
  }, [activeMainView, horizonData, displayedDebtors, selectedCampusObj, holdingName, schoolId]);

  return (
    <div 
      style={!isMaximized && isEmbeddedView ? { minHeight: `${Math.min(viewport.availableContentHeight, 820)}px` } : undefined}
      className={`select-none transition-all duration-200 print:!overflow-visible print:!bg-white print:!h-auto print:!min-h-0 print:!max-h-none print:!border-none print:!shadow-none print:!p-0 print:!m-0 print:!block ${
      isMaximized 
        ? 'fixed inset-0 z-50 flex flex-col h-screen w-full bg-[#0d131f] text-slate-100 font-sans overflow-hidden shadow-2xl'
        : isEmbeddedView 
        ? 'flex flex-col w-full dynamic-bi-height bg-[#0d131f] text-slate-100 font-sans rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative'
        : 'flex flex-col min-h-screen w-full bg-[#0d131f] text-slate-100 font-sans overflow-hidden'
    }`}>
      {/* 1. CONTENEDOR EN PANTALLA (MODO SALA DE JUNTAS / DARK MODE) - OCULTO AL IMPRIMIR */}
      <div className="w-full flex-1 flex flex-col overflow-hidden print:hidden no-print">

      {/* ========================================================================= */}
      {/* 1. TOP HEADER EJECUTIVO & CONTROLES DE NIVEL C-SUITE                     */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 bg-[#111827]/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 backdrop-blur-md z-30 overflow-x-auto no-scrollbar">
        
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
               {/* Selector de Horizonte Temporal */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 gap-1 shadow-inner">
            {(['mtd', 'qtd', 'ytd', 'forecast'] as TimeHorizon[]).map((hz) => {
              const isActive = timeHorizon === hz;
              return (
                <button
                  key={hz}
                  onClick={() => setTimeHorizon(hz)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400/60 scale-[1.02]' 
                      : 'hover:text-slate-200 hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />}
                  <span>{hz === 'mtd' ? 'Este Mes' : hz === 'qtd' ? 'Trimestre' : hz === 'ytd' ? 'Año Acumulado' : 'Proyección 90d'}</span>
                </button>
              );
            })}
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
      <div className="h-12 shrink-0 bg-[#0f172a] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-xs font-bold">
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

        {/* Indicador de Horizonte Activo y Telemetría en Vivo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300">Horizonte Activo:</span>
            <span className="text-[11px] font-black text-cyan-300 font-mono">
              {horizonData.horizonPeriod}
            </span>
          </div>
          {selectedCampusObj && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/60 text-[11px] text-purple-300 font-bold">
              <Building2 className="w-3 h-3 text-purple-400" />
              <span>{selectedCampusObj.shortName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 hidden xl:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetría en Vivo Ciclo 2026-2027</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIBBON SUPERIOR DE KPIS DIRECTIVOS ESTRATÉGICOS (DINÁMICO POR HORIZONTE) */}
      {/* ========================================================================= */}
      <div className={`${viewport.classes.containerPadding} pb-2 shrink-0`}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${viewport.classes.gridGap}`}>
          
          {/* KPI 1: Margen EBITDA */}
          <div className={`${viewport.classes.kpiCardPadding} rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Margen EBITDA {selectedCampusObj ? `· ${selectedCampusObj.shortName}` : 'Holding'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40 font-mono">
                <TrendingUp className="w-3 h-3" />
                <span>{horizonData.ebitdaMarginTrend}</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`${viewport.classes.kpiValueText} font-black text-white tracking-tight font-mono`}>
                +{horizonData.ebitdaMarginPct.toFixed(1)}%
              </div>
              <div className="text-right">
                <span className={`${viewport.classes.kpiSubtext} text-slate-400 block`}>{horizonData.ebitdaDeltaText}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  EBITDA: {formatMXN(horizonData.ebitdaValue)}
                </span>
              </div>
            </div>
            {/* Barra mini Sparkline */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, horizonData.ebitdaBarPct))}%` }} 
              />
            </div>
          </div>

          {/* KPI 2: Facturación Total Consolidada */}
          <div className={`${viewport.classes.kpiCardPadding} rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[200px]">
                {horizonData.revenueTitle}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 font-bold shrink-0">
                Meta: {horizonData.revenueMetaPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`${viewport.classes.kpiValueText} font-black text-white tracking-tight font-mono`}>
                {formatMXN(horizonData.totalRevenue)}
              </div>
              <div className="text-right">
                <span className={`${viewport.classes.kpiSubtext} text-slate-400 block`}>{horizonData.revenueConceptSubtitle}</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">{horizonData.revenueDeltaText}</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, horizonData.revenueBarPct)}%` }} 
              />
            </div>
          </div>

          {/* KPI 3: Eficiencia de Cobranza */}
          <div className={`${viewport.classes.kpiCardPadding} rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Eficiencia de Cobranza</span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40 font-mono">
                Meta: {horizonData.collectionTargetPct}%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`${viewport.classes.kpiValueText} font-black text-white tracking-tight font-mono`}>
                {horizonData.collectionEfficiencyPct.toFixed(1)}%
              </div>
              <div className="text-right">
                <span className={`${viewport.classes.kpiSubtext} text-slate-400 block`}>{formatMXN(horizonData.collectionCollected)} recaudados</span>
                <span className="text-xs font-bold text-amber-400 font-mono">{formatMXN(horizonData.collectionOverdue)} en mora</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, horizonData.collectionBarPct)}%` }} 
              />
            </div>
          </div>

          {/* KPI 4: Capacidad & Ocupación de Planteles */}
          <div className={`${viewport.classes.kpiCardPadding} rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[200px]">
                {selectedCampusObj ? `Capacidad ${selectedCampusObj.shortName}` : 'Capacidad Total de Campus'}
              </span>
              <span className="text-[11px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40 font-mono">
                {horizonData.capacityDeltaText}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`${viewport.classes.kpiValueText} font-black text-white tracking-tight font-mono`}>
                {horizonData.enrolledStudents.toLocaleString('es-MX')} <span className="text-sm font-semibold text-slate-400">/ {horizonData.capacitySeats.toLocaleString('es-MX')}</span>
              </div>
              <div className="text-right">
                <span className={`${viewport.classes.kpiSubtext} text-slate-400 block`}>{horizonData.capacitySubtitle}</span>
                <span className="text-xs font-bold text-purple-400 font-mono">{horizonData.ratioStudentTeacher}</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, horizonData.capacityBarPct)}%` }} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CUERPO MODULAR DINÁMICO SEGÚN LA PESTAÑA SELECCIONADA                  */}
      {/* ========================================================================= */}
      <div className={`flex-1 overflow-y-auto ${viewport.classes.containerPadding} ${viewport.classes.sectionSpacing}`}>

        {/* --------------------------------------------------------------------- */}
        {/* VISTA A: MATRIZ CUÁDRUPLE EJECUTIVA (IDÉNTICA A LA MAQUETA VISUAL)     */}
        {/* --------------------------------------------------------------------- */}
        {activeMainView === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* FILA SUPERIOR: Panel 1 (Cashflow) + Panel 2 (Benchmark 4 Planteles) */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${viewport.classes.gridGap}`}>
              
              {/* PANEL 1: Financial Cashflow & Forecast (7 Columnas LG) */}
              <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span>{horizonData.cashflowChart.title}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {horizonData.cashflowChart.subtitle}
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
                    {timeHorizon === 'forecast' || timeHorizon === 'ytd' ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Forecast
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Gráfica SVG Dinámica de Curvas de Cashflow Responsiva */}
                <div className="relative w-full" style={{ height: `${viewport.chartHeight}px` }}>
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
                    <text x="10" y="20" fill="#64748b" fontSize="10" fontFamily="monospace">{horizonData.cashflowChart.yLabels[0]}</text>
                    <text x="10" y="90" fill="#64748b" fontSize="10" fontFamily="monospace">{horizonData.cashflowChart.yLabels[1]}</text>
                    <text x="10" y="160" fill="#64748b" fontSize="10" fontFamily="monospace">{horizonData.cashflowChart.yLabels[2]}</text>
                    <text x="10" y="230" fill="#64748b" fontSize="10" fontFamily="monospace">{horizonData.cashflowChart.yLabels[3]}</text>

                    {/* Línea Divisoria de Forecast si aplica */}
                    {timeHorizon === 'forecast' && (
                      <>
                        <line x1="200" y1="10" x2="200" y2="240" stroke="#334155" strokeDasharray="4 4" />
                        <text x="210" y="25" fill="#10b981" fontSize="10" fontWeight="bold">Forecast Predictivo &gt;&gt;</text>
                      </>
                    )}
                    {timeHorizon === 'ytd' && (
                      <>
                        <line x1="680" y1="10" x2="680" y2="240" stroke="#334155" strokeDasharray="4 4" />
                        <text x="685" y="25" fill="#10b981" fontSize="10" fontWeight="bold">Forecast &gt;&gt;</text>
                      </>
                    )}

                    {/* Área y Curva de Ingresos */}
                    <path
                      d={horizonData.cashflowChart.tuitionArea}
                      fill="url(#tuitionGrad)"
                    />
                    <path
                      d={horizonData.cashflowChart.tuitionPath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                    />

                    {/* Área y Curva de Nómina */}
                    <path
                      d={horizonData.cashflowChart.payrollArea}
                      fill="url(#payrollGrad)"
                    />
                    <path
                      d={horizonData.cashflowChart.payrollPath}
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="3"
                    />

                    {/* Curva Punteada de Proyección Futura */}
                    {horizonData.cashflowChart.forecastPath && (
                      <path
                        d={horizonData.cashflowChart.forecastPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* Puntos y Nodos Interactivos */}
                    {horizonData.cashflowChart.points.map((pt: CashflowChartPoint, i: number) => (
                      <g key={i}>
                        <text 
                          x={pt.x} 
                          y="260" 
                          textAnchor="middle" 
                          fill={pt.isForecast ? '#34d399' : '#94a3b8'} 
                          fontSize="9" 
                          fontWeight="bold"
                        >
                          {pt.label}
                        </text>
                        {/* Nodo Ingresos */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.tuitionY} 
                          r="5.5" 
                          fill="#38bdf8" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          className="cursor-pointer transition-all hover:scale-125"
                        >
                          <title>{`${pt.label} - Ingresos: ${pt.tuitionVal}`}</title>
                        </circle>
                        {/* Nodo Nómina */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.payrollY} 
                          r="4.5" 
                          fill="#fb923c" 
                          stroke="#ffffff" 
                          strokeWidth="1.5" 
                          className="cursor-pointer transition-all hover:scale-125"
                        >
                          <title>{`${pt.label} - Nómina: ${pt.payrollVal}`}</title>
                        </circle>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{horizonData.cashflowChart.footerNote}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">Cobertura Nómina: {horizonData.cashflowChart.coverageRatio}</span>
                </div>
              </div>

              {/* PANEL 2: Benchmark de 4 Planteles (5 Columnas LG) */}
              <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>{horizonData.campusBenchmarkHeader}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {horizonData.campusBenchmarkSubtitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-950/70 border border-purple-800/50 px-2 py-0.5 rounded">
                    {selectedCampusObj ? selectedCampusObj.shortName : '4 Sedes'}
                  </span>
                </div>

                {/* Lista de Planteles con Barras y Gauges */}
                <div className="space-y-4">
                  {horizonData.campusBenchmarks.map((campus) => {
                    const isSelected = selectedCampusFilter === campus.campusId;
                    const fullCampus = CAMPUS_BENCHMARK_SEED.find(c => c.campusId === campus.campusId);
                    return (
                      <div 
                        key={campus.campusId}
                        onClick={() => {
                          if (fullCampus) setSelectedCampusDetail(fullCampus);
                        }}
                        className={`p-3 rounded-xl transition cursor-pointer group border ${
                          isSelected 
                            ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10' 
                            : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition">
                                {campus.shortName}
                              </h4>
                              {isSelected && (
                                <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/50">
                                  Filtro Activo
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {campus.currentEnrollment} alumnos · Capacidad: {campus.capacityTotal}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-white block">
                              {formatMXN(campus.revenue)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {campus.revenueLabel}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                              EBITDA: {campus.ebitdaMarginPct}%
                            </span>
                          </div>
                        </div>

                        {/* Barra de progreso de meta de recaudación */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Meta Recaudación: <strong>{campus.targetPct}%</strong></span>
                            <span>Retención: <strong className="text-emerald-400">{campus.retentionPct}%</strong></span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, campus.targetPct)}%` }}
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
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between mt-3">
                  <span>{horizonData.campusLeaderNote}</span>
                  <span className="text-purple-400 font-bold font-mono">LTV: {formatMXN(horizonData.ltvMxn)}</span>
                </div>
              </div>

            </div>

            {/* FILA INFERIOR: Panel 3 (Aging de Cartera) + Panel 4 (Embudo de Admisiones) */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${viewport.classes.gridGap}`}>
              
              {/* PANEL 3: Matriz de Aging de Cartera & Riesgo Crediticio (6 Columnas LG) */}
              <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Matriz de Aging de Cartera (0 a 90+ Días)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {horizonData.agingSubtitle}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded">
                    {horizonData.agingBadgeText}
                  </span>
                </div>

                {/* 3 Bloques de Antigüedad con Barras */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(['0-30', '31-60', '60+'] as const).map(trId => {
                    const tr = AGING_TRANCHES_SUMMARY[trId];
                    const trData = horizonData.agingTranches[trId];
                    return (
                      <div 
                        key={trId}
                        onClick={() => setActiveAgingTrancheFilter(trId)}
                        className={`p-3 rounded-xl border transition cursor-pointer ${
                          activeAgingTrancheFilter === trId
                            ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">
                          {tr.label}
                        </span>
                        <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                          {formatMXN(trData.amount)}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-slate-400">{trData.count} alumnos</span>
                          <span className={`font-bold ${
                            trData.risk === 'Bajo' ? 'text-sky-400' : trData.risk === 'Medio' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {trData.risk}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini Dataframe de Alumnos en Tranche Seleccionado */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>
                      Expedientes en Mora ({displayedDebtors.length}) {selectedCampusObj ? `· ${selectedCampusObj.shortName}` : ''}:
                    </span>
                    {activeAgingTrancheFilter !== 'all' && (
                      <button 
                        onClick={() => setActiveAgingTrancheFilter('all')}
                        className="text-cyan-400 hover:underline cursor-pointer text-xs"
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
                      {horizonData.funnelSubtitle}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Conv: {horizonData.conversionRatePct}%
                  </span>
                </div>

                {/* Embudo Visual Trapezoidal Animado */}
                <div className="space-y-3 my-auto">
                  {horizonData.funnelStages.map((stage, idx) => {
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
                    <span className="text-xs font-black text-cyan-400 font-mono mt-0.5 block">{formatMXN(horizonData.cacMxn)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">LTV Proyectado</span>
                    <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">{formatMXN(horizonData.ltvMxn)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Ratio LTV/CAC</span>
                    <span className="text-xs font-black text-purple-400 font-mono mt-0.5 block">{horizonData.ltvCacRatio}</span>
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
                <h2 className="text-lg font-black text-white">
                  Desglose Mensual de Flujo de Caja & EBITDA ({horizonData.horizonPeriod})
                </h2>
                <p className="text-xs text-slate-400">
                  {horizonData.cashflowChart.subtitle}
                </p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar CSV ({horizonData.horizonLabel})</span>
              </button>
            </div>

            <div 
              className="overflow-x-auto overflow-y-auto border border-slate-800 rounded-xl custom-scrollbar"
              style={{ maxHeight: `${viewport.tableMaxHeight}px` }}
            >
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-slate-300 font-black border-b border-slate-800 uppercase tracking-wider text-[10px] shadow-md backdrop-blur-sm">
                  <tr>
                    <th className={viewport.classes.tableCellPadding}>Periodo</th>
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
                  {horizonData.cashflowTableRows.map((r, i) => (
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
                  {/* Fila Resumen Consolidada del Horizonte Activo */}
                  <tr className="bg-indigo-950/40 font-black text-white border-t-2 border-indigo-500/50">
                    <td className="p-3 font-bold text-cyan-300">{horizonData.cashflowTableSummaryRow.label}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.tuitionRevenues)}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.enrollmentRevenues)}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.extracurricularRevenues)}</td>
                    <td className="p-3 text-right font-black text-cyan-400">{formatMXN(horizonData.cashflowTableSummaryRow.totalRevenues)}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.teacherPayroll)}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.adminPayroll)}</td>
                    <td className="p-3 text-right">{formatMXN(horizonData.cashflowTableSummaryRow.facilityLeasing)}</td>
                    <td className="p-3 text-right font-black text-orange-400">{formatMXN(horizonData.cashflowTableSummaryRow.totalExpenses)}</td>
                    <td className="p-3 text-right font-black text-emerald-400">{formatMXN(horizonData.cashflowTableSummaryRow.ebitda)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                        {horizonData.cashflowTableSummaryRow.ebitdaMargin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
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
              {horizonData.campusBenchmarks.map(campus => {
                const fullCampus = CAMPUS_BENCHMARK_SEED.find(c => c.campusId === campus.campusId);
                const isSelected = selectedCampusFilter === campus.campusId;
                return (
                  <div 
                    key={campus.campusId} 
                    onClick={() => {
                      if (fullCampus) setSelectedCampusDetail(fullCampus);
                    }}
                    className={`p-5 rounded-2xl shadow-xl space-y-4 border transition cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-850/90 border-cyan-400 ring-2 ring-cyan-500/20' 
                        : 'bg-[#111827] border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                          {fullCampus?.location || 'Plantel IBIME'}
                        </span>
                        <h3 className="text-base font-black text-white mt-0.5">{campus.shortName}</h3>
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
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">{campus.revenueLabel}</span>
                        <span className="text-base font-black text-cyan-400 font-mono mt-1 block">{formatMXN(campus.revenue)}</span>
                        <span className="text-[10px] text-slate-500">Meta: {campus.targetPct}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Retención</span>
                        <span className="text-base font-black text-purple-400 font-mono mt-1 block">{campus.retentionPct}%</span>
                        <span className="text-[10px] text-slate-500">Ratio: {fullCampus?.studentTeacherRatio || 17}:1</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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

            <div 
              className="overflow-x-auto overflow-y-auto border border-slate-800 rounded-xl custom-scrollbar"
              style={{ maxHeight: `${viewport.tableMaxHeight}px` }}
            >
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-slate-300 font-black border-b border-slate-800 uppercase tracking-wider text-[10px] shadow-md backdrop-blur-sm">
                  <tr>
                    <th className={viewport.classes.tableCellPadding}>Alumno</th>
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
          <div className="w-full space-y-6">
            {/* Puesto de Mando y Oráculo de Voz Ejecutivo con Telemetría */}
            <ExecutiveOracleDashboard />

            {/* Estudio Analítico Forense Detallado */}
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

      {/* ========================================================================= */}
      {/* 2. DOSSIER EJECUTIVO OFICIAL PARA JUNTAS DIRECTIVAS (SOLO VISIBLE AL IMPRIMIR) */}
      {/* ========================================================================= */}
      <ExecutiveBoardReportDocument
        report={biBoardReport}
        institution={{
          name: selectedCampusObj ? `${holdingName} · Campus ${selectedCampusObj.shortName}` : holdingName,
          cct: '15EPR2840Z',
          campus: selectedCampusObj?.campusName
        }}
      />

    </div>
  );
}
