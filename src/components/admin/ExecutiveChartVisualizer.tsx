"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Maximize2,
  AlertCircle,
  ExternalLink,
  User,
  Users,
  Building2,
  Phone,
  X
} from 'lucide-react';
import { AnalyticChartConfig, ChartType, formatMXN } from '@/services/executiveAnalyticsEngine';
import { DetailedStudent } from '@/types';

export interface DebtorItem {
  studentId?: string;
  studentName: string;
  level?: string;
  gradeGroup?: string;
  concept?: string;
  amount: number;
  dueDate?: string;
  status?: string;
  parentContact?: string;
}

interface ExecutiveChartVisualizerProps {
  chart: AnalyticChartConfig;
  mode?: 'compact' | 'full';
  onExpandToFull?: () => void;
  className?: string;
  debtors?: DebtorItem[];
  reportRows?: Record<string, any>[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  onOpenExpediente?: (studentId?: string, studentName?: string) => void;
  allStudents?: DetailedStudent[];
}

const PALETTE = [
  '#38bdf8', // cyan-400
  '#818cf8', // indigo-400
  '#34d399', // emerald-400
  '#f43f5e', // rose-500
  '#fbbf24', // amber-400
  '#c084fc', // purple-400
  '#f97316', // orange-500
  '#a3e635', // lime-400
  '#2dd4bf', // teal-400
  '#e879f9'  // fuchsia-400
];

export function matchStudentToCategory(
  student: DetailedStudent,
  category: string
): boolean {
  if (!category) return false;
  const clean = (str: string) => 
    (str || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.\-_,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const catClean = clean(category);
  if (!catClean) return false;

  // 1. Coincidencia directa por nombre del alumno
  const sFullName = clean(`${student.first_name} ${student.second_name || ''} ${student.last_name_1} ${student.last_name_2 || ''}`);
  const sShortName = clean(`${student.first_name} ${student.last_name_1}`);
  if (sFullName.includes(catClean) || catClean.includes(sShortName) || catClean.includes(sFullName)) {
    return true;
  }

  // 2. Coincidencia por Plantel / Campus (e.g. "Primaria Laboratorio Demo", "Primaria Lab...", "Secundaria Torres")
  const campusClean = clean(student.campus_name || '');
  if (campusClean) {
    if (campusClean.includes(catClean) || catClean.includes(campusClean)) return true;
    const catWords = catClean.split(' ').filter(w => w.length >= 3);
    if (catWords.length > 0 && catWords.every(w => campusClean.includes(w))) {
      return true;
    }
  }

  // 3. Coincidencia por Nivel ("primaria", "secundaria", "preparatoria")
  const levelClean = clean(student.level || '');
  if (levelClean && (catClean.includes(levelClean) || levelClean.includes(catClean))) {
    return true;
  }

  // 4. Coincidencia por Grado y Grupo
  const gradeClean = clean(student.grade || '');
  if (gradeClean) {
    const normGrade = gradeClean.replace(/[^0-9]/g, '');
    const normCat = catClean.replace(/[^0-9]/g, '');
    if (normGrade && normCat && normGrade === normCat && (catClean.includes('grado') || catClean.includes('º') || catClean.includes('°') || catClean.includes('to') || catClean.includes('ro'))) {
      return true;
    }
    if (catClean.includes(gradeClean)) return true;
  }

  // 5. Coincidencia por Mes de Cumpleaños
  if (student.birth_date) {
    const bDate = new Date(student.birth_date);
    if (!isNaN(bDate.getTime())) {
      const monthIdx = bDate.getUTCMonth();
      const monthShortNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const monthFullNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      if (catClean === monthShortNames[monthIdx] || catClean === monthFullNames[monthIdx] || catClean.includes(monthShortNames[monthIdx])) {
        return true;
      }
    }
  }

  // 6. Coincidencia por Beca o Estatus
  if (student.scholarship_type && clean(student.scholarship_type).includes(catClean)) return true;
  if (student.status && clean(student.status) === catClean) return true;

  return false;
}

export function matchReportRowToCategory(row: Record<string, any>, category: string): boolean {
  if (!category) return false;
  const clean = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.\-_,]/g, " ").trim();
  const catClean = clean(category);

  const sName = clean(row.studentName || row.name || '');
  const sCampus = clean(row.campus || row.campusName || row.campus_name || '');
  const sLevel = clean(row.level || '');
  const sGrade = clean(row.grade || '');
  const sLevelGrade = clean(row.levelGrade || `${sLevel} ${sGrade}`);
  const sMonth = clean(row.month || '');

  if (sName && (sName.includes(catClean) || catClean.includes(sName))) return true;
  if (sCampus && (sCampus.includes(catClean) || catClean.includes(sCampus))) return true;
  if (sLevelGrade && (sLevelGrade.includes(catClean) || catClean.includes(sLevelGrade))) return true;
  if (sMonth && (sMonth === catClean || catClean.includes(sMonth))) return true;

  const catWords = catClean.split(' ').filter(w => w.length >= 3);
  if (catWords.length > 0 && sCampus && catWords.every(w => sCampus.includes(w))) return true;

  return false;
}

export default function ExecutiveChartVisualizer({
  chart,
  mode = 'compact',
  onExpandToFull,
  className = '',
  debtors = [],
  reportRows = [],
  selectedCategory: externalSelectedCategory,
  onSelectCategory,
  onOpenExpediente,
  allStudents = []
}: ExecutiveChartVisualizerProps) {
  // Tipos disponibles sugeridos para este dataset
  const availableTypes: ChartType[] = useMemo(() => {
    if (chart.availableTypes && chart.availableTypes.length > 0) {
      return chart.availableTypes;
    }
    if (chart.datasets.length > 1) {
      return ['line', 'area', 'column', 'bar'];
    }
    if (chart.labels.length <= 8) {
      return ['bar', 'column', 'donut', 'line', 'area'];
    }
    return ['bar', 'column', 'line', 'area'];
  }, [chart]);

  const [currentType, setCurrentType] = useState<ChartType>(chart.type || availableTypes[0] || 'bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredDatasetIdx, setHoveredDatasetIdx] = useState<number | null>(null);
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null);
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;

  // Sincronizar si cambia el reporte
  React.useEffect(() => {
    if (chart.type && availableTypes.includes(chart.type)) {
      setCurrentType(chart.type);
    } else {
      setCurrentType(availableTypes[0] || 'bar');
    }
    setHoveredIndex(null);
    setInternalSelectedCategory(null);
  }, [chart, availableTypes]);

  // Formateador de valor según unidad
  const formatVal = (val: number) => {
    if (chart.unit === 'currency') return formatMXN(val);
    if (chart.unit === 'percentage') return `${val.toFixed(1)}%`;
    return new Intl.NumberFormat('es-MX').format(val);
  };

  // Cálculos estadísticos deterministas
  const stats = useMemo(() => {
    const primaryDataset = chart.datasets[0]?.data || [];
    if (primaryDataset.length === 0) {
      return { total: 0, avg: 0, max: 0, min: 0, maxLabel: 'N/A', minLabel: 'N/A' };
    }
    const total = primaryDataset.reduce((a, b) => a + b, 0);
    const avg = total / primaryDataset.length;
    let max = -Infinity;
    let min = Infinity;
    let maxIdx = 0;
    let minIdx = 0;

    primaryDataset.forEach((v, i) => {
      if (v > max) { max = v; maxIdx = i; }
      if (v < min) { min = v; minIdx = i; }
    });

    return {
      total,
      avg,
      max: max === -Infinity ? 0 : max,
      min: min === Infinity ? 0 : min,
      maxLabel: chart.labels[maxIdx] || 'N/A',
      minLabel: chart.labels[minIdx] || 'N/A'
    };
  }, [chart]);

  // Manejo de clic en categoría o elemento de la gráfica para abrir expedientes o filtrar directorio
  const handleCategoryClick = (label: string) => {
    const nextCategory = selectedCategory === label ? null : label;
    setInternalSelectedCategory(nextCategory);
    onSelectCategory?.(nextCategory);

    if (!nextCategory) return;

    // Si coincide con 1 solo alumno específico de allStudents, abrir directo su expediente 360°
    const matchingFromAll = (allStudents || []).filter(s => matchStudentToCategory(s, label));
    if (matchingFromAll.length === 1 && onOpenExpediente) {
      onOpenExpediente(matchingFromAll[0].id, `${matchingFromAll[0].first_name} ${matchingFromAll[0].last_name_1}`);
      return;
    }

    // Coincidencias en filas de alumnos del reporte activo
    const matchingFromRows = (reportRows || []).filter(r => matchReportRowToCategory(r, label));
    if (matchingFromRows.length === 1 && onOpenExpediente) {
      onOpenExpediente(matchingFromRows[0].studentId || matchingFromRows[0].id, matchingFromRows[0].studentName || matchingFromRows[0].name);
      return;
    }

    // Coincidencias en lista de deudores
    const matchingFromDebtors = (debtors || []).filter(d => {
      const sName = (d.studentName || '').toLowerCase();
      const sLevel = (d.level || '').toLowerCase();
      const sGrade = (d.gradeGroup || '').toLowerCase();
      const lClean = label.toLowerCase().trim();
      return sName.includes(lClean) || lClean.includes(sName) || sLevel.includes(lClean) || sGrade.includes(lClean);
    });
    if (matchingFromDebtors.length === 1 && onOpenExpediente) {
      onOpenExpediente(matchingFromDebtors[0].studentId, matchingFromDebtors[0].studentName);
      return;
    }
  };

  // Alumnos de la categoría seleccionada (con nombres, plantel y botón a expedientes 360°)
  const displayedCategoryStudents = useMemo(() => {
    if (!selectedCategory) return [];

    // 1. De allStudents si están provistos
    const fromAll = (allStudents || []).filter(s => matchStudentToCategory(s, selectedCategory));

    if (fromAll.length > 0) {
      return fromAll.map(s => {
        const matchingRow = (reportRows || []).find(r => 
          (r.studentId && r.studentId === s.id) ||
          (r.studentName && `${s.first_name} ${s.last_name_1}`.toLowerCase().includes(String(r.studentName).toLowerCase()))
        );
        return {
          id: s.id,
          name: `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
          shortName: `${s.first_name} ${s.last_name_1}`,
          enrollmentId: s.enrollment_id || s.id.slice(0, 8).toUpperCase(),
          level: s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria',
          grade: s.grade || '1º',
          campus: s.campus_name || 'Plantel Principal',
          tutor: s.tutor_name || s.father_name || s.mother_name || 'No registrado',
          phone: s.emergency_contact_phone || s.phone || 'No registrado',
          status: s.status || 'Activo',
          extraBadge: matchingRow?.status || matchingRow?.rangeStatus || matchingRow?.attendance || undefined
        };
      });
    }

    // 2. De reportRows si allStudents no trajo nada pero reportRows tiene alumnos
    const fromRows = (reportRows || []).filter(r => matchReportRowToCategory(r, selectedCategory));
    if (fromRows.length > 0 && fromRows.some(r => r.studentName || r.name)) {
      return fromRows.map(r => ({
        id: r.studentId || r.id,
        name: r.studentName || r.name || 'Estudiante',
        shortName: r.name || r.studentName || 'Estudiante',
        enrollmentId: r.enrollmentId || 'MAT-2026',
        level: r.level || 'Primaria',
        grade: r.grade || r.gradeGroup || '1º',
        campus: r.campus || r.campusName || r.campus_name || 'Plantel Principal',
        tutor: r.tutor || r.tutorName || 'Tutor Familiar',
        phone: r.phone || 'No registrado',
        status: r.status || 'Activo',
        extraBadge: r.extraBadge || r.rangeStatus || undefined
      }));
    }

    return [];
  }, [selectedCategory, allStudents, reportRows]);

  // Deudores a mostrar (filtrados por categoría si se hizo clic en una barra)
  const displayedDebtors = useMemo(() => {
    if (!debtors || debtors.length === 0) return [];
    if (!selectedCategory) return debtors;

    const filtered = debtors.filter(d => 
      (d.level || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes((d.level || '').toLowerCase()) ||
      d.studentName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (d.gradeGroup || '').toLowerCase().includes(selectedCategory.toLowerCase())
    );

    return filtered.length > 0 ? filtered : debtors;
  }, [debtors, selectedCategory]);

  // --------------------------------------------------------------------------
  // RENDER 1: BARRAS HORIZONTALES (INTERACTIVAS CON CLIC)
  // --------------------------------------------------------------------------
  const renderHorizontalBars = () => {
    const maxVal = Math.max(
      ...chart.datasets.flatMap(d => d.data),
      1
    );

    return (
      <div className="space-y-3.5 pt-2">
        {chart.labels.map((label, idx) => {
          const isHovered = hoveredIndex === idx;
          const isSelected = selectedCategory === label;

          return (
            <div 
              key={idx} 
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCategoryClick(label)}
              title="Haz clic para abrir el expediente del alumno correspondiente"
              className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-50 border border-indigo-300 shadow-sm ring-1 ring-indigo-400' 
                  : isHovered 
                    ? 'bg-slate-50 border border-slate-200 shadow-sm' 
                    : 'bg-white border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className={`truncate ${isSelected ? 'text-indigo-700 font-bold' : isHovered ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(label);
                    }}
                    title={
                      (chart.datasets[0]?.data[idx] || 0) === 1
                        ? `Abrir expediente de ${label}`
                        : `Ver los ${chart.datasets[0]?.data[idx] || 0} expedientes de ${label}`
                    }
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 shrink-0 ml-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition border border-indigo-200 font-medium"
                  >
                    <ExternalLink className="h-2.5 w-2.5 text-indigo-600" />
                    <span>
                      {(chart.datasets[0]?.data[idx] || 0) === 1 
                        ? 'Ver expediente' 
                        : `Ver ${chart.datasets[0]?.data[idx] || 0} expedientes`}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  {chart.datasets.map((ds, dIdx) => (
                    <span 
                      key={dIdx} 
                      className={`text-xs font-bold ${isHovered || isSelected ? 'text-slate-900' : 'text-slate-700'}`}
                    >
                      {chart.datasets.length > 1 && (
                        <span className="text-[10px] text-slate-500 font-normal mr-1">{ds.name}:</span>
                      )}
                      {formatVal(ds.data[idx] || 0)}
                    </span>
                  ))}
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    {(((chart.datasets[0]?.data[idx] || 0) / (stats.total || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Barras por dataset */}
              <div className="space-y-1">
                {chart.datasets.map((ds, dIdx) => {
                  const val = ds.data[idx] || 0;
                  const pct = Math.min(Math.max((val / maxVal) * 100, 3), 100);
                  const color = ds.color || PALETTE[dIdx % PALETTE.length];

                  return (
                    <div 
                      key={dIdx}
                      className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200"
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${pct}%`,
                          backgroundColor: color,
                          boxShadow: isHovered || isSelected ? `0 0 10px ${color}80` : 'none'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RENDER 2: COLUMNAS VERTICALES (INTERACTIVAS CON CLIC)
  // --------------------------------------------------------------------------
  const renderVerticalColumns = () => {
    const width = 800;
    const height = mode === 'full' ? 380 : 280;
    const padding = { top: 35, right: 30, bottom: 65, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = chart.datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allValues, 1);
    const niceMax = Math.ceil(maxVal * 1.1);

    const numCategories = chart.labels.length;
    const groupWidth = chartW / (numCategories || 1);
    const numDatasets = chart.datasets.length;
    const colWidth = Math.min(Math.max((groupWidth * 0.7) / numDatasets, 8), 56);

    const ySteps = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="relative w-full overflow-x-auto pt-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[550px] select-none"
        >
          {/* Grid Horizontal */}
          {ySteps.map((step, idx) => {
            const y = padding.top + chartH * (1 - step);
            const val = niceMax * step;

            return (
              <g key={idx}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={width - padding.right} 
                  y2={y} 
                  stroke="rgba(0,0,0,0.08)" 
                  strokeDasharray={step === 0 ? "0" : "3 3"} 
                />
                <text 
                  x={padding.left - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {formatVal(val)}
                </text>
              </g>
            );
          })}

          {/* Columnas */}
          {chart.labels.map((label, cIdx) => {
            const groupX = padding.left + cIdx * groupWidth + (groupWidth - colWidth * numDatasets) / 2;
            const isHovered = hoveredIndex === cIdx;
            const isSelected = selectedCategory === label;

            return (
              <g 
                key={cIdx}
                onMouseEnter={() => setHoveredIndex(cIdx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCategoryClick(label)}
                className="cursor-pointer"
              >
                {(isHovered || isSelected) && (
                  <rect 
                    x={padding.left + cIdx * groupWidth + 4} 
                    y={padding.top} 
                    width={groupWidth - 8} 
                    height={chartH} 
                    fill={isSelected ? "rgba(99, 102, 241, 0.08)" : "rgba(0,0,0,0.03)"} 
                    stroke={isSelected ? "rgba(99, 102, 241, 0.4)" : "none"}
                    rx={8} 
                  />
                )}

                {chart.datasets.map((ds, dIdx) => {
                  const val = ds.data[cIdx] || 0;
                  const barH = Math.max((val / niceMax) * chartH, 4);
                  const x = groupX + dIdx * colWidth;
                  const y = padding.top + chartH - barH;
                  const color = ds.color || PALETTE[dIdx % PALETTE.length];

                  return (
                    <g key={dIdx}>
                      <rect 
                        x={x + 2} 
                        y={y} 
                        width={colWidth - 4} 
                        height={barH} 
                        rx={6} 
                        fill={color} 
                        opacity={isHovered || isSelected ? 1 : 0.85} 
                        style={{
                          transition: 'all 0.3s ease',
                          filter: isHovered || isSelected ? `drop-shadow(0 2px 6px ${color}60)` : 'none'
                        }}
                      />
                      {(isHovered || isSelected || numCategories <= 6) && (
                        <text 
                          x={x + colWidth / 2} 
                          y={y - 6} 
                          textAnchor="middle" 
                          className="fill-slate-900 font-mono font-bold text-[10px]"
                        >
                          {formatVal(val)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Etiqueta X */}
                <text 
                  x={padding.left + cIdx * groupWidth + groupWidth / 2} 
                  y={height - padding.bottom + 22} 
                  textAnchor="middle" 
                  className={`text-[11px] transition-colors ${
                    isSelected ? 'fill-indigo-600 font-bold' : isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-600 font-medium'
                  }`}
                >
                  {label.length > 14 ? `${label.slice(0, 12)}...` : label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RENDER 3: DONUT / PASTEL CIRCULAR (INTERACTIVO CON CLIC)
  // --------------------------------------------------------------------------
  const renderDonutChart = () => {
    const data = chart.datasets[0]?.data || [];
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const r = 90;
    const c = 2 * Math.PI * r;
    let accumulated = 0;

    const activeItem = (selectedCategory || hoveredIndex !== null) ? {
      label: selectedCategory || (hoveredIndex !== null ? chart.labels[hoveredIndex] : ''),
      value: selectedCategory 
        ? (data[chart.labels.indexOf(selectedCategory)] || 0) 
        : (hoveredIndex !== null ? (data[hoveredIndex] || 0) : 0),
      share: (((selectedCategory ? (data[chart.labels.indexOf(selectedCategory)] || 0) : (data[hoveredIndex!] || 0)) / total) * 100).toFixed(1),
      color: PALETTE[(selectedCategory ? chart.labels.indexOf(selectedCategory) : (hoveredIndex || 0)) % PALETTE.length]
    } : null;

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 pt-4 pb-2">
        {/* Gráfico SVG Central */}
        <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90">
            <circle 
              cx="120" 
              cy="120" 
              r={r} 
              fill="transparent" 
              stroke="rgba(0,0,0,0.06)" 
              strokeWidth="28" 
            />

            {data.map((val, idx) => {
              const slice = (val / total) * c;
              const offset = c - accumulated;
              accumulated += slice;
              const label = chart.labels[idx];
              const isHovered = hoveredIndex === idx;
              const isSelected = selectedCategory === label;
              const color = chart.datasets[0]?.color && data.length === 1 
                ? chart.datasets[0].color 
                : PALETTE[idx % PALETTE.length];

              return (
                <circle 
                  key={idx}
                  cx="120" 
                  cy="120" 
                  r={r} 
                  fill="transparent" 
                  stroke={color} 
                  strokeWidth={isSelected ? 36 : (isHovered ? 34 : 28)} 
                  strokeDasharray={`${slice} ${c}`} 
                  strokeDashoffset={offset} 
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleCategoryClick(label)}
                  className="cursor-pointer transition-all duration-300 ease-out"
                  style={{
                    filter: isHovered || isSelected ? `drop-shadow(0 2px 8px ${color}80)` : 'none'
                  }}
                />
              );
            })}
          </svg>

          {/* Centro del Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {activeItem ? activeItem.label : 'Total Global'}
            </span>
            <span className="text-lg font-black text-slate-900 font-mono mt-0.5 tracking-tight">
              {activeItem ? formatVal(activeItem.value) : formatVal(total)}
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-semibold mt-0.5">
              {activeItem ? `${activeItem.share}% del total` : `${chart.labels.length} categorías`}
            </span>
          </div>
        </div>

        {/* Leyenda Interactiva con porcentajes */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
          {chart.labels.map((label, idx) => {
            const val = data[idx] || 0;
            const pct = ((val / total) * 100).toFixed(1);
            const color = PALETTE[idx % PALETTE.length];
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedCategory === label;

            return (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCategoryClick(label)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-400'
                    : isHovered 
                      ? 'bg-slate-100 border-slate-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: color }} 
                  />
                  <span className={`text-xs truncate ${isSelected ? 'text-indigo-700 font-bold' : isHovered ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                    {label}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2 font-mono">
                  <span className="text-xs font-bold text-slate-900 block">{formatVal(val)}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RENDER 4: LÍNEAS DE TENDENCIA / TEMPORAL (INTERACTIVAS CON CLIC)
  // --------------------------------------------------------------------------
  const renderLineChart = (isArea = false) => {
    const width = 800;
    const height = mode === 'full' ? 380 : 280;
    const padding = { top: 35, right: 35, bottom: 55, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = chart.datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allValues, 1);
    const niceMax = Math.ceil(maxVal * 1.15);
    const nPoints = chart.labels.length;
    const stepX = chartW / Math.max(nPoints - 1, 1);

    const ySteps = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="relative w-full overflow-x-auto pt-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[550px] select-none"
        >
          <defs>
            {chart.datasets.map((ds, dIdx) => {
              const color = ds.color || PALETTE[dIdx % PALETTE.length];
              return (
                <linearGradient key={dIdx} id={`areaGrad-${dIdx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Grid Horizontal */}
          {ySteps.map((step, idx) => {
            const y = padding.top + chartH * (1 - step);
            const val = niceMax * step;

            return (
              <g key={idx}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={width - padding.right} 
                  y2={y} 
                  stroke="rgba(0,0,0,0.08)" 
                  strokeDasharray={step === 0 ? "0" : "3 3"} 
                />
                <text 
                  x={padding.left - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {formatVal(val)}
                </text>
              </g>
            );
          })}

          {/* Trazado de Curvas y Áreas por Dataset */}
          {chart.datasets.map((ds, dIdx) => {
            const color = ds.color || PALETTE[dIdx % PALETTE.length];
            const points = ds.data.map((val, idx) => {
              const x = padding.left + idx * stepX;
              const y = padding.top + chartH - (val / niceMax) * chartH;
              return { x, y, val, label: chart.labels[idx] };
            });

            if (points.length === 0) return null;

            let pathD = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
              const p0 = points[i];
              const p1 = points[i + 1];
              const cx = (p0.x + p1.x) / 2;
              pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
            }

            const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

            return (
              <g key={dIdx}>
                <path 
                  d={areaD} 
                  fill={`url(#areaGrad-${dIdx})`} 
                  opacity={isArea ? 0.9 : 0.5} 
                />

                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{
                    filter: `drop-shadow(0 2px 6px ${color}80)`
                  }}
                />

                {points.map((pt, pIdx) => {
                  const isHovered = hoveredIndex === pIdx;
                  const isSelected = selectedCategory === pt.label;

                  return (
                    <g 
                      key={pIdx}
                      onMouseEnter={() => {
                        setHoveredIndex(pIdx);
                        setHoveredDatasetIdx(dIdx);
                      }}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        setHoveredDatasetIdx(null);
                      }}
                      onClick={() => handleCategoryClick(pt.label)}
                      className="cursor-pointer"
                    >
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered || isSelected ? 7.5 : 4.5} 
                        fill="#ffffff" 
                        stroke={color} 
                        strokeWidth={isHovered || isSelected ? 3.5 : 2.5} 
                        className="transition-all duration-200"
                        style={{
                          filter: isHovered || isSelected ? `drop-shadow(0 2px 6px ${color}80)` : 'none'
                        }}
                      />

                      {/* Tooltip flotante */}
                      {isHovered && hoveredDatasetIdx === dIdx && (
                        <g>
                          <rect 
                            x={pt.x - 55} 
                            y={pt.y - 42} 
                            width="110" 
                            height="32" 
                            rx="8" 
                            fill="#0f172a" 
                            stroke="rgba(0,0,0,0.15)" 
                          />
                          <text 
                            x={pt.x} 
                            y={pt.y - 22} 
                            textAnchor="middle" 
                            className="fill-white font-mono font-bold text-[11px]"
                          >
                            {formatVal(pt.val)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Etiquetas Eje X */}
          {chart.labels.map((label, idx) => {
            const x = padding.left + idx * stepX;
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedCategory === label;

            return (
              <text 
                key={idx} 
                x={x} 
                y={height - padding.bottom + 20} 
                textAnchor="middle" 
                onClick={() => handleCategoryClick(label)}
                className={`text-[11px] cursor-pointer transition-colors ${
                  isSelected ? 'fill-indigo-600 font-bold' : isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-600 font-medium'
                }`}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm ${className}`}>
      
      {/* BARRA DE HERRAMIENTAS Y ENCABEZADO DE LA GRÁFICA (SIN BOTÓN DE 0 TOKENS) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide">
            {chart.title}
          </h3>
          {chart.subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{chart.subtitle}</p>
          )}
        </div>

        {/* SELECTOR DE TIPO DE GRÁFICA (VARIEDAD DISPONIBLE) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          {availableTypes.includes('bar') && (
            <button
              onClick={() => setCurrentType('bar')}
              title="Gráfico de Barras Horizontales (Ideal para clasificaciones)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Barras</span>
            </button>
          )}

          {availableTypes.includes('column') && (
            <button
              onClick={() => setCurrentType('column')}
              title="Columnas Verticales (Ideal para categorías)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentType === 'column'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Columnas</span>
            </button>
          )}

          {availableTypes.includes('donut') && (
            <button
              onClick={() => setCurrentType('donut')}
              title="Gráfico de Dona / Pastel (Ideal para distribución y proporciones)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentType === 'donut'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <PieChart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dona / Pastel</span>
            </button>
          )}

          {availableTypes.includes('line') && (
            <button
              onClick={() => setCurrentType('line')}
              title="Líneas de Tendencia (Ideal para series temporales y comparativas)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentType === 'line'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tendencia</span>
            </button>
          )}

          {availableTypes.includes('area') && (
            <button
              onClick={() => setCurrentType('area')}
              title="Gráfico de Área Suave (Ideal para acumulación y volumen)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentType === 'area'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Área</span>
            </button>
          )}

          {mode === 'compact' && onExpandToFull && (
            <button
              onClick={onExpandToFull}
              title="Abrir en pestaña de Vista Gráfica completa"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition cursor-pointer ml-1"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* LEYENDA MULTI-DATASET */}
      {chart.datasets.length > 1 && (
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-medium">
          {chart.datasets.map((ds, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: ds.color || PALETTE[idx % PALETTE.length] }} 
              />
              <span className="text-slate-700">{ds.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ÁREA DE VISUALIZACIÓN DINÁMICA SEGÚN EL TIPO ELEGIDO */}
      <div className="pt-2">
        {currentType === 'bar' && renderHorizontalBars()}
        {currentType === 'column' && renderVerticalColumns()}
        {currentType === 'donut' && renderDonutChart()}
        {currentType === 'line' && renderLineChart(false)}
        {currentType === 'area' && renderLineChart(true)}
      </div>

      {/* CINTA DE RESUMEN ESTADÍSTICO */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
          <div>
            <span className="text-slate-500">Total: </span>
            <span className="text-slate-900 font-bold">{formatVal(stats.total)}</span>
          </div>
          <div>
            <span className="text-slate-500">Promedio: </span>
            <span className="text-indigo-600 font-bold">{formatVal(stats.avg)}</span>
          </div>
          <div>
            <span className="text-slate-500">Pico Máx: </span>
            <span className="text-emerald-600 font-bold">{formatVal(stats.max)}</span>
            <span className="text-slate-400 text-[10px] ml-1">({stats.maxLabel})</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 italic">
          💡 Haz clic en una barra o en "Ver expediente" para consultar los registros correspondientes
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN DE ALUMNOS DE LA CATEGORÍA: NOMBRES Y BOTÓN A EXPEDIENTES 360° */}
      {/* ========================================================================= */}
      {displayedCategoryStudents.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-3 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Alumnos Registrados en {selectedCategory}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[11px] font-bold">
                    {displayedCategoryStudents.length} {displayedCategoryStudents.length === 1 ? 'alumno' : 'alumnos'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Haz clic en cualquier alumno o en "Abrir Expediente" para consultar su expediente 360°.
                </p>
              </div>
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  setInternalSelectedCategory(null);
                  onSelectCategory?.(null);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer self-start sm:self-auto flex items-center gap-1 border border-slate-200"
              >
                <span>Limpiar filtro de gráfica</span>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Grid de Tarjetas de Alumnos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 max-h-[460px] overflow-y-auto pr-1">
            {displayedCategoryStudents.map((student, sIdx) => (
              <div
                key={student.id || sIdx}
                onClick={() => onOpenExpediente && onOpenExpediente(student.id, student.name)}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                      {student.shortName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate block">
                        {student.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {student.level} · {student.grade}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    student.status?.toLowerCase().includes('inactiv') || student.status?.toLowerCase().includes('baja')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {student.status || 'Activo'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700">{student.campus}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">Tutor: <strong className="text-slate-800 font-medium">{student.tutor}</strong></span>
                  </div>
                  {student.phone && student.phone !== 'No registrado' && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[10px] text-slate-800">{student.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="font-mono text-[10px] text-slate-500 truncate">
                    <span>Mat: </span>
                    <span className="text-indigo-600 font-semibold">{student.enrollmentId}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenExpediente && onOpenExpediente(student.id, student.name);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span>Abrir Expediente</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN DE DEUDORES: NOMBRES EN LA PARTE BAJA Y ACCESO A EXPEDIENTES 360° */}
      {/* ========================================================================= */}
      {displayedDebtors.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Estudiantes con Adeudo Activo ({displayedDebtors.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedCategory 
                    ? `Filtrado por "${selectedCategory}" · Haz clic en cualquier alumno para abrir su expediente 360°`
                    : 'Nombres de deudores registrados · Haz clic para abrir su expediente completo'}
                </p>
              </div>
            </div>

            {selectedCategory && (
              <button
                onClick={() => {
                  setInternalSelectedCategory(null);
                  onSelectCategory?.(null);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer self-start sm:self-auto flex items-center gap-1 border border-slate-200"
              >
                <span>Ver todos los deudores</span>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Grid de Tarjetas de Deudores con Nombres y Botón a Expedientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {displayedDebtors.map((debtor, dIdx) => (
              <div
                key={dIdx}
                onClick={() => onOpenExpediente && onOpenExpediente(debtor.studentId, debtor.studentName)}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate block">
                        {debtor.studentName}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {debtor.level || 'Primaria'} · {debtor.gradeGroup || '1º A'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    String(debtor.status).toLowerCase().includes('vencid') 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {debtor.status || 'Pendiente'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                      {debtor.concept || 'Colegiatura de Septiembre'}
                    </span>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      {formatMXN(debtor.amount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenExpediente && onOpenExpediente(debtor.studentId, debtor.studentName);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span>Abrir Expediente</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
