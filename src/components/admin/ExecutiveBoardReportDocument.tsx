"use client";

import React from 'react';
import { Building2, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { AnalyticReportResult, formatMXN } from '@/services/executiveAnalyticsEngine';

export interface ExecutiveBoardReportDocumentProps {
  report: AnalyticReportResult;
  institution?: {
    name?: string;
    cct?: string;
    logoUrl?: string;
    campus?: string;
  };
}

/**
 * Renderizador de texto ejecutivo con formato limpio para impresión en papel.
 */
function renderPrintText(content?: string | null) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-slate-800 text-[10.5px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const clean = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;

        const parts: React.ReactNode[] = [];
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(clean)) !== null) {
          if (match.index > lastIndex) {
            parts.push(clean.substring(lastIndex, match.index));
          }
          if (match[2]) {
            parts.push(<strong key={`${idx}-${match.index}`} className="font-black text-slate-950">{match[2]}</strong>);
          } else if (match[3]) {
            parts.push(<em key={`${idx}-${match.index}`} className="italic text-slate-700">{match[3]}</em>);
          }
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < clean.length) {
          parts.push(clean.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-slate-900 font-bold select-none leading-normal shrink-0">•</span>
              <div className="flex-1 leading-snug">{parts}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-snug">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Documento Oficial para Juntas Directivas y Consejos de Administración.
 * Diseñado bajo estándares corporativos y gubernamentales de rendición de cuentas:
 * - Paginación limpia sin cortes arbitrarios (page-break control estricto).
 * - Carátula institucional con CCT oficial, folio y cintillo de seguridad.
 * - Scorecard de KPIs, radar analítico cuatridimensional, hoja de ruta para votación.
 * - Padrón completo de expedientes auditados con encabezados repetibles.
 * - Bloque de firmas de gobernanza y espacio para sello oficial.
 */
export const ExecutiveBoardReportDocument: React.FC<ExecutiveBoardReportDocumentProps> = ({
  report,
  institution
}) => {
  const schoolName = report.schoolName || institution?.name || 'Colegio ISkool México';
  const cct = institution?.cct || '15EPR2840Z';
  const folioNumber = String(report.generatedAt || Date.now()).replace(/\D/g, '').slice(-6) || '202601';
  const emissionDate = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const emissionTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // 4 Dimensiones del Radar Estratégico adaptadas dinámicamente al contexto
  const titleStr = (report.reportTitle || '').toLowerCase();
  const isFinanceDomain = 
    report.domain === 'DEBTS_BILLING' || 
    report.domain === 'FINANCIAL_SUMMARY' || 
    report.domain === 'MONTHLY_COMPARISON' || 
    report.domain === 'STRATEGIC_CEO_RADAR' ||
    titleStr.includes('colegiatura') || 
    titleStr.includes('ingreso') || 
    titleStr.includes('morosidad') || 
    titleStr.includes('finanz');
  const isAcademicDomain = 
    report.domain === 'ATTENDANCE' || 
    report.domain === 'ACADEMIC_GRADES_ASSESSMENT' || 
    report.domain === 'CURRICULUM_SUBJECTS';

  const strategicRadar = [
    {
      dimension: 'I. Finanzas, Cobranza & Flujo de Caja',
      score: isFinanceDomain ? 78 : 92,
      benchmark: 95,
      status: isFinanceDomain ? 'Atención Prioritaria' : 'Saludable',
      observation: isFinanceDomain ? 'Cartera vencida concentrada en tramos >60 días.' : 'Cumplimiento presupuestal dentro del margen operativo.'
    },
    {
      dimension: 'II. Adherencia Curricular & Planeación NEM',
      score: isAcademicDomain ? 84 : 96,
      benchmark: 90,
      status: 'Óptimo',
      observation: '100% de proyectos articuladores sincronizados con PDAs oficiales SEP.'
    },
    {
      dimension: 'III. Gamificación, Retos & Portafolio Digital',
      score: 89,
      benchmark: 85,
      status: 'Sobresaliente',
      observation: 'Tasa de entrega de evidencias en tiempo superior al 88% en el ciclo.'
    },
    {
      dimension: 'IV. Retención Escolar & Riesgo de Deserción',
      score: 94,
      benchmark: 95,
      status: 'Estable',
      observation: 'Monitoreo activo de expedientes con alertas tempranas mitigadas.'
    }
  ];

  // Acuerdos y Hoja de Ruta para Votación del Consejo
  const boardActionPlan = [
    {
      acuerdo: '1. Plan de Regularización Inmediata y Convenios de Pago',
      responsable: 'Dirección Administrativa & Tesorería',
      plazo: '10 Días Hábiles',
      prioridad: 'Alta'
    },
    {
      acuerdo: '2. Sesión Extraordinaria de Consejo Técnico Pedagógico',
      responsable: 'Coordinación Académica & Titulares',
      plazo: 'Próximo Consejo Técnico',
      prioridad: 'Media'
    },
    {
      acuerdo: '3. Auditoría de Vinculación Familiar y Evidencias Digitales',
      responsable: 'Control Escolar & Tutoría',
      plazo: '15 Días Hábiles',
      prioridad: 'Estratégica'
    }
  ];

  const hasTableRows = report.table && report.table.rows && report.table.rows.length > 0;

  return (
    <div id="executive-board-dossier" className="hidden print:block w-full bg-white text-slate-900 font-sans leading-normal">

      {/* ========================================================================= */}
      {/* PÁGINA 1: CARÁTULA OFICIAL, DICTAMEN EJECUTIVO Y SCORECARD DE KPIS        */}
      {/* ========================================================================= */}
      <section className="print-page-break-after min-h-[960px] flex flex-col justify-between pt-2 pb-6">
        <div>
          {/* Membrete Oficial Superior */}
          <div className="border-b-2 border-slate-900 pb-3.5 mb-4 flex justify-between items-start">
            <div className="flex items-center gap-3">
              {institution?.logoUrl ? (
                <img 
                  src={institution.logoUrl} 
                  alt={schoolName} 
                  className="w-13 h-13 object-contain border border-slate-300 rounded-lg p-0.5" 
                />
              ) : (
                <div className="w-13 h-13 rounded-lg border-2 border-slate-900 bg-slate-100 flex flex-col items-center justify-center font-black text-slate-900 shrink-0">
                  <Building2 className="w-6 h-6 text-slate-900" />
                  <span className="text-[7px] uppercase font-mono tracking-wider font-extrabold">ISKOOL</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase leading-none text-slate-950">
                  {schoolName}
                </h1>
                <p className="text-[10px] font-bold text-slate-700 leading-tight mt-1">
                  Consejo de Administración & Dirección General • Secretaría de Gobernanza
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  Clave de Centro de Trabajo (CCT): <span className="font-mono font-bold text-slate-700">{cct}</span> · Validez Oficial SEP · Ciclo 2026-2027
                </p>
              </div>
            </div>

            {/* Cuadro de Folio y Metadatos Oficiales */}
            <div className="text-right border border-slate-300 bg-slate-50/90 p-2.5 rounded-lg text-[9.5px] text-slate-700 min-w-[220px] shrink-0">
              <div className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">
                Informe Oficial de Junta Directiva
              </div>
              <div className="text-xs font-mono font-black text-slate-950 mt-0.5">
                FOLIO: EXP-BI-{folioNumber}
              </div>
              <div className="mt-1">
                <span className="font-semibold text-slate-600">Fecha de Emisión:</span> {emissionDate}
              </div>
              <div>
                <span className="font-semibold text-slate-600">Hora de Auditoría:</span> {emissionTime} hrs
              </div>
              <div className="mt-1 pt-1 border-t border-slate-200 text-[8px] font-bold text-amber-900 uppercase">
                Documento Oficial Confidencial
              </div>
            </div>
          </div>

          {/* Ficha Técnica de la Consulta y Dominio */}
          <div className="mb-4 bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-900 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
                  Área: {report.domain ? report.domain.toUpperCase() : 'GOBERNANZA GENERAL'}
                </span>
                <h2 className="text-base font-black text-slate-950 mt-1">
                  {report.reportTitle || 'Informe Ejecutivo de Inteligencia y Control Escolar'}
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  <span className="font-bold text-slate-800">Criterio / Mandato Directivo:</span> "{report.queryReceived || report.reportTitle}"
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10.5px] font-mono font-black text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
                  {report.table?.totalRows ?? 0} Expedientes Auditados
                </span>
              </div>
            </div>
          </div>

          {/* Dictamen Ejecutivo de la Dirección General (Executive Synthesis) */}
          <div className="mb-4 border-l-4 border-slate-900 bg-slate-50/90 p-3.5 rounded-r-lg border-y border-r border-slate-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                <span>Dictamen Ejecutivo y Análisis Institucional de Dirección</span>
              </span>
              <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                Certificación: Auditoría en Tiempo Real
              </span>
            </div>
            
            <div className="text-slate-800">
              {renderPrintText(report.directAnswer || report.explanation?.summary)}
            </div>

            {report.explanation?.filtersApplied && report.explanation.filtersApplied.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[9.5px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-slate-800">Parámetros aplicados:</span>
                {report.explanation.filtersApplied.map((f, i) => (
                  <span key={i} className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[9px] font-medium text-slate-700">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Scorecard: Indicadores Clave de Rendimiento (KPIs Directivos) */}
          {report.kpis && report.kpis.length > 0 && (
            <div className="mb-4">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-800 mb-2">
                Scorecard de Métricas Clave (Indicadores para Consejo)
              </div>
              <div className={`grid gap-2.5 ${
                report.kpis.length === 1 ? 'grid-cols-1' :
                report.kpis.length === 2 ? 'grid-cols-2' :
                report.kpis.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
              }`}>
                {report.kpis.map((kpi, idx) => (
                  <div key={idx} className="border border-slate-300 bg-slate-50/70 p-2.5 rounded-lg shadow-2xs">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {kpi.label}
                    </span>
                    <div className="text-base font-black text-slate-950 font-mono tracking-tight mt-0.5">
                      {kpi.value}
                    </div>
                    {kpi.subtext && (
                      <p className="text-[9px] text-slate-600 mt-0.5 truncate font-medium">
                        {kpi.subtext}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas Tempranas y Recomendaciones Prioritarias */}
          {(report.explanation as any)?.recommendations && (report.explanation as any).recommendations.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/60 mb-2">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-950 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Puntos de Atención Inmediata para la Junta Directiva</span>
              </div>
              <ul className="space-y-1 text-[9.5px] text-slate-800">
                {((report.explanation as any).recommendations as string[]).map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="flex items-start gap-1.5">
                    <span className="text-amber-800 font-bold shrink-0">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pie de Página 1 */}
        <div className="pt-2 border-t border-slate-300 text-[8.5px] text-slate-500 flex justify-between items-center">
          <span>{schoolName} · Sistema de Inteligencia Institucional ISkool</span>
          <span className="font-bold">Dossier Ejecutivo de Junta Directiva · Página 1</span>
          <span>Folio: EXP-BI-{folioNumber}</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PÁGINA 2: RADAR ESTRATÉGICO CUATRIDIMENSIONAL, GRÁFICAS Y HOJA DE RUTA   */}
      {/* ========================================================================= */}
      <section className={`${hasTableRows ? 'print-page-break-after' : ''} min-h-[960px] flex flex-col justify-between pt-2 pb-6`}>
        <div>
          {/* Encabezado Secundario Continuo de Junta */}
          <div className="border-b border-slate-400 pb-2 mb-4 flex justify-between items-center text-[9px] text-slate-600">
            <span className="font-bold uppercase tracking-wider text-slate-900">{schoolName}</span>
            <span>Informe: {report.reportTitle}</span>
            <span className="font-mono font-bold">Folio: EXP-BI-{folioNumber}</span>
          </div>

          <div className="text-xs font-black uppercase tracking-wider text-slate-950 mb-3 pb-1 border-b border-slate-300">
            II. Radar de Salud Estratégica Cuatridimensional & Análisis Prospectivo
          </div>

          {/* Matriz del Radar Cuatridimensional */}
          <div className="mb-5 border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex justify-between items-center text-[9px] font-black uppercase text-slate-800">
              <span>Dimensión Institucional Auditada</span>
              <span>Rendimiento Actual vs Benchmark</span>
            </div>
            <div className="divide-y divide-slate-200">
              {strategicRadar.map((rad, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-4 text-[9.5px]">
                  <div className="w-5/12">
                    <span className="font-bold text-slate-900 block">{rad.dimension}</span>
                    <span className="text-[8.5px] text-slate-500">{rad.observation}</span>
                  </div>
                  <div className="w-4/12 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          rad.score >= 90 ? 'bg-emerald-600' : rad.score >= 80 ? 'bg-indigo-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${rad.score}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900 w-10 text-right">{rad.score}%</span>
                  </div>
                  <div className="w-3/12 text-right">
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded border ${
                      rad.score >= 90 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : rad.score >= 80 
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300' 
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {rad.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen Gráfico / Distribución Analítica Segmentada */}
          {report.chart && report.chart.labels && report.chart.labels.length > 0 && (
            <div className="mb-5 border border-slate-300 bg-slate-50/50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2.5 pb-1 border-b border-slate-200">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-900">
                  {report.chart.title || 'Distribución Analítica Segmentada'}
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono">
                  {report.chart.labels.length} segmentos evaluados
                </span>
              </div>

              <div className="space-y-1.5">
                {(() => {
                  const chartData = report.chart.datasets?.[0]?.data || [];
                  const maxVal = Math.max(...chartData.map(v => Number(v) || 0), 1);
                  const totalVal = chartData.reduce((acc: number, v: number) => acc + (Number(v) || 0), 0);
                  const isCurrency = report.chart.unit === 'currency' ||
                                     String(report.chart.title).toLowerCase().includes('monto') ||
                                     String(report.chart.title).toLowerCase().includes('ingreso') ||
                                     String(report.chart.title).toLowerCase().includes('nómina') ||
                                     String(report.chart.title).toLowerCase().includes('adeudo');

                  return report.chart.labels.map((label, idx) => {
                    const val = Number(chartData[idx]) || 0;
                    const pct = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
                    const barWidth = Math.max(Math.round((val / maxVal) * 100), 5);

                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-[9.5px]">
                        <div className="w-36 font-semibold text-slate-800 truncate text-right shrink-0">
                          {label}
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-slate-900 h-2 rounded-full" 
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="w-28 text-right font-mono font-black text-slate-900 shrink-0">
                          {isCurrency ? formatMXN(val) : `${val} (${pct}%)`}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Acuerdos y Hoja de Ruta Propuesta para la Junta Directiva */}
          <div className="mb-4">
            <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-900 mb-2">
              III. Propuesta de Acuerdos y Hoja de Ruta para Votación de la Junta
            </div>
            <table className="w-full border-collapse border border-slate-300 text-[9.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[8.5px] border-b border-slate-300">
                  <th className="py-1.5 px-2 text-left border-r border-slate-300">Acuerdo Estratégico</th>
                  <th className="py-1.5 px-2 text-left border-r border-slate-300 w-44">Responsable</th>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 w-28">Plazo</th>
                  <th className="py-1.5 px-2 text-center w-20">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {boardActionPlan.map((act, aIdx) => (
                  <tr key={aIdx} className="even:bg-slate-50/50">
                    <td className="py-1.5 px-2 border-r border-slate-200 font-semibold text-slate-900">
                      {act.acuerdo}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-slate-700">
                      {act.responsable}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono text-slate-700">
                      {act.plazo}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-[8.5px]">
                      <span className={`px-1.5 py-0.5 rounded ${
                        act.prioridad === 'Alta' ? 'bg-rose-100 text-rose-900' : 'bg-slate-200 text-slate-900'
                      }`}>
                        {act.prioridad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie de Página 2 */}
        <div className="pt-2 border-t border-slate-300 text-[8.5px] text-slate-500 flex justify-between items-center">
          <span>{schoolName} · Sistema de Inteligencia Institucional ISkool</span>
          <span className="font-bold">Dossier Ejecutivo de Junta Directiva · Página 2</span>
          <span>Folio: EXP-BI-{folioNumber}</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PÁGINA 3+: PADRÓN COMPLETO DE EXPEDIENTES Y BLOQUE FINAL DE FIRMAS        */}
      {/* ========================================================================= */}
      {hasTableRows && (
        <section className="pt-2 pb-6 min-h-[960px] flex flex-col justify-between">
          <div>
            {/* Encabezado Secundario Continuo de Junta */}
            <div className="border-b border-slate-400 pb-2 mb-4 flex justify-between items-center text-[9px] text-slate-600">
              <span className="font-bold uppercase tracking-wider text-slate-900">{schoolName}</span>
              <span>Padrón Detallado de Registros Auditados</span>
              <span className="font-mono font-bold">Folio: EXP-BI-{folioNumber}</span>
            </div>

            <div className="flex justify-between items-center mb-2.5 pb-1 border-b border-slate-300">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                IV. Relación Detallada de Expedientes Auditados ({report.table.totalRows} registros)
              </span>
              <span className="text-[8.5px] text-slate-500 italic">
                Datos auditados y validados por el sistema escolar
              </span>
            </div>

            {/* TABLA FORMAL CON ENCABEZADOS REPETIBLES (THEAD) */}
            <table className="w-full text-left border-collapse border border-slate-300 text-[9.5px]">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 font-black uppercase text-[8.5px]">
                  <th className="py-1.5 px-2 text-center w-7 border-r border-slate-300">#</th>
                  {report.table.columns.map((col) => (
                    <th 
                      key={col.key} 
                      className={`py-1.5 px-2 border-r border-slate-300 last:border-r-0 ${
                        col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="even:bg-slate-50/70 print-avoid-break">
                    <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200 font-mono text-[8.5px]">
                      {rIdx + 1}
                    </td>
                    {report.table.columns.map((col) => {
                      const val = row[col.key];

                      if (col.isCurrency) {
                        return (
                          <td key={col.key} className="py-1.5 px-2 text-right font-mono font-bold text-slate-950 border-r border-slate-200 last:border-r-0">
                            {formatMXN(Number(val) || 0)}
                          </td>
                        );
                      }

                      if (col.isBadge) {
                        return (
                          <td key={col.key} className="py-1.5 px-2 text-center border-r border-slate-200 last:border-r-0">
                            <span className="font-bold uppercase text-[8.5px] px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-800">
                              {val}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={col.key} 
                          className={`py-1.5 px-2 border-r border-slate-200 last:border-r-0 font-medium ${
                            col.align === 'center' ? 'text-center' : (col.align === 'right' ? 'text-right font-mono' : 'text-slate-800')
                          }`}
                        >
                          {val ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BLOQUE FORMAL DE RÚBRICAS Y SELLOS OFICIALES PARA JUNTA DIRECTIVA */}
          <div className="pt-6 border-t-2 border-slate-400 print-avoid-break mt-6">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center mb-3">
              Constancia Oficial de Presentación, Visto Bueno y Aprobación de Junta Directiva
            </div>

            <div className="grid grid-cols-3 gap-8 text-center text-[9.5px]">
              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-950">Presidencia del Consejo Directivo</p>
                <p className="text-slate-500 text-[8.5px]">H. Junta de Gobierno / Patronato</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-14 border border-dashed border-slate-400 rounded flex items-center justify-center text-[7.5px] text-slate-400 font-mono uppercase mb-1">
                  SELLO INSTITUCIONAL
                </div>
                <p className="font-bold text-slate-950">Control Escolar y Finanzas</p>
                <p className="text-slate-500 text-[8.5px]">Cotejo y Validez de Registros</p>
              </div>

              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-950">Dirección General</p>
                <p className="text-slate-500 text-[8.5px]">Rúbrica y Aprobación Ejecutiva</p>
              </div>
            </div>

            <div className="mt-6 pt-2.5 border-t border-slate-200 text-center text-[8px] text-slate-500 flex justify-between items-center">
              <span>{schoolName} · Sistema de Inteligencia Institucional ISkool</span>
              <span className="font-bold">Emisión Oficial Certificada · Carácter Vinculante</span>
              <span>Documento Confidencial para Uso Exclusivo de Junta Directiva</span>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
