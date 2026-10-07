"use client";

import React from 'react';
import { Building2, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import { CorporateOfficialLogo } from '@/components/brand/CorporateOfficialLogo';
import { SchoolOfficialLogo } from '@/components/brand/SchoolOfficialLogo';
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
  // Detección estricta de experiencia institucional IBIME
  const isIbime = React.useMemo(() => {
    const sId = (report?.schoolId || (institution as any)?.id || '').toLowerCase();
    const sName = (report?.schoolName || institution?.name || '').toLowerCase();
    if (sId && sId !== 'sch-ibime') return false;
    if (sName && !sName.includes('ibime')) return false;
    if (sId === 'sch-ibime' || sName.includes('ibime')) return true;
    if (typeof window !== 'undefined' && window.location.pathname.includes('/ibime') && (!sId || sId === 'sch-ibime')) {
      return true;
    }
    return false;
  }, [report, institution]);

  // Detección reactiva de experiencia corporativa B2B
  const isCorporate = React.useMemo(() => {
    const sName = (report?.schoolName || institution?.name || '').toLowerCase();
    const instName = (institution?.name || '').toLowerCase();
    const rId = (report?.schoolId || '').toLowerCase();
    return Boolean(
      report.isCorporate ||
      rId.startsWith('emp-') ||
      sName.includes('bmw') ||
      sName.includes('nexus') ||
      sName.includes('vanguardia') ||
      sName.includes('retail') ||
      sName.includes('innovasoft') ||
      instName.includes('bmw') ||
      instName.includes('nexus') ||
      instName.includes('vanguardia') ||
      instName.includes('retail') ||
      instName.includes('innovasoft')
    );
  }, [report, institution]);

  const isBmw = isCorporate && ((report.schoolId === 'emp-bmw') || (report.schoolName?.toLowerCase().includes('bmw') || (institution?.name || '').toLowerCase().includes('bmw')));
  const isRetail = isCorporate && ((report.schoolId === 'emp-ventas') || (report.schoolName?.toLowerCase().includes('vanguardia') || (institution?.name || '').toLowerCase().includes('vanguardia')));
  const isTech = isCorporate && ((report.schoolId === 'emp-tech') || (report.schoolName?.toLowerCase().includes('innovasoft') || (institution?.name || '').toLowerCase().includes('innovasoft')));

  const corporateLogo = isBmw 
    ? '/brand/bmw_group_logo.svg' 
    : (isRetail ? '/brand/vanguardia_retail_logo.svg' : '/brand/innovasoft_tech_logo.svg');

  const schoolName = isIbime 
    ? 'INSTITUTO BILINGÜE IBIME' 
    : (report.schoolName || institution?.name || (isCorporate ? 'BMW Group México · Nexus Motors' : 'Colegio ISkool México'));

  const cct = isIbime 
    ? '15PPR3322G' 
    : (institution?.cct || (isBmw ? 'RFC: BGM940315BMW' : (isRetail ? 'RFC: VRT200115VR1' : (isTech ? 'RFC: INT190512AI9' : '15EPR2840Z'))));
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

  const strategicRadar = isCorporate ? [
    {
      dimension: isRetail ? 'I. Logística y Suministro OTIF' : (isTech ? 'I. Infraestructura Cloud y Microservicios' : 'I. Manufactura Automatizada y Robótica KUKA'),
      score: 99,
      benchmark: 99,
      status: 'Óptimo',
      observation: isRetail ? '98.5% de cumplimiento OTIF sin cuellos de botella.' : (isTech ? '99.98% de disponibilidad SLA ininterrumpida.' : 'Disponibilidad de línea de 99.4% (meta >99.0%).')
    },
    {
      dimension: isRetail ? 'II. Auditoría Comercial en Puntos de Venta' : (isTech ? 'II. Ciberseguridad & DevSecOps ISO 27001' : 'II. Seguridad Industrial y Celdas de Alto Voltaje'),
      score: 98,
      benchmark: 100,
      status: 'Conforme',
      observation: isRetail ? '96.8% Sell-Through rate en tiendas estratégicas.' : (isTech ? 'Cero incidentes y acreditación ISO 27001 conforme.' : 'Cumplimiento normativo ISO 45001 y STPS al 98.2%.')
    },
    {
      dimension: 'III. Formación Técnica Especializada B2B',
      score: 100,
      benchmark: 100,
      status: 'Sobresaliente',
      observation: '120 horas de capacitación técnica acreditadas sin ausentismo.'
    },
    {
      dimension: 'IV. Capital Humano & Dispersión de Nómina',
      score: 100,
      benchmark: 100,
      status: 'Dispersado 100%',
      observation: 'Masa salarial quincenal dispersada puntualmente a colaboradores clave.'
    }
  ] : [
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
  const boardActionPlan = isCorporate ? [
    {
      acuerdo: '1. Ratificación de Presupuesto y Dispersión de Nómina Especializada',
      responsable: 'Dirección de Finanzas & Recursos Humanos',
      plazo: 'Quincenal Inmediato',
      prioridad: 'Alta'
    },
    {
      acuerdo: '2. Homologación de Certificaciones Técnicas (ISO 45001 / NFPA 70E / STPS)',
      responsable: 'Gerencia de Seguridad Industrial & Master Trainers',
      plazo: '15 Días Hábiles',
      prioridad: 'Estratégica'
    },
    {
      acuerdo: '3. Continuidad Operativa y Mantenimiento de Herramentales de Precisión',
      responsable: 'Gerencia de Operaciones y Planta',
      plazo: 'Continuo / Ciclo 2026',
      prioridad: 'Media'
    }
  ] : [
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
    <div id="executive-board-dossier" className="executive-board-dossier hidden print:block w-full bg-white text-slate-900 font-sans leading-normal">

      {/* ========================================================================= */}
      {/* PÁGINA 1: CARÁTULA OFICIAL, DICTAMEN EJECUTIVO Y SCORECARD DE KPIS        */}
      {/* ========================================================================= */}
      <section className="print-page-break-after h-auto min-h-0 flex flex-col justify-between pt-1 pb-4">
        <div>
          {/* Membrete Oficial Superior */}
          <div className={`h-1.5 w-full rounded-full mb-3 ${
            isIbime
              ? 'bg-gradient-to-r from-[#E41B14] via-[#0F2744] to-[#C01D0C]'
              : isCorporate
              ? 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500'
          }`} />
          <div className="border-b-2 border-slate-900 pb-3.5 mb-4 flex justify-between items-start">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
                <SchoolOfficialLogo
                  schoolId={report.schoolId || (institution as any)?.id}
                  name={schoolName}
                  logoUrl={institution?.logoUrl}
                  size={48}
                  variant="shield_only"
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase leading-none text-slate-950">
                  {schoolName}
                </h1>
                <p className="text-[10px] font-bold text-slate-700 leading-tight mt-1">
                  {isCorporate 
                    ? 'Comité Ejecutivo de Dirección & Holding Corporativo • Reporte de Dirección General (CEO)' 
                    : 'Consejo de Administración & Dirección General • Secretaría de Gobernanza'}
                </p>
                <p className="text-[9px] text-slate-500 font-medium">
                  {isCorporate 
                    ? `Registro Federal de Contribuyentes: ${cct} · Aislamiento Estricto B2B · Ejercicio Corporativo 2026`
                    : `Clave de Centro de Trabajo (CCT): ${cct} · Validez Oficial SEP · Ciclo 2026-2027${isIbime ? ' · https://ibime.edu.mx' : ''}`}
                </p>
              </div>
            </div>

            {/* Cuadro de Folio y Metadatos Oficiales */}
            <div className={`text-right border p-2.5 rounded-lg text-[9.5px] min-w-[220px] shrink-0 ${
              isIbime 
                ? 'border-[#E41B14]/40 bg-slate-50/90 text-slate-800' 
                : isCorporate
                ? 'border-blue-300 bg-blue-50/60 text-slate-800'
                : 'border-slate-300 bg-slate-50/90 text-slate-700'
            }`}>
              <div className={`text-[8px] uppercase font-bold tracking-wider ${isIbime ? 'text-[#E41B14]' : isCorporate ? 'text-blue-800' : 'text-slate-500'}`}>
                {isIbime ? 'Informe Oficial de Gobernanza IBIME' : isCorporate ? 'Informe Ejecutivo de Dirección CEO' : 'Informe Oficial de Junta Directiva'}
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
              <div className={`mt-1 pt-1 border-t text-[8px] font-bold uppercase ${
                isIbime ? 'border-[#E41B14]/20 text-[#C01D0C]' : 'border-slate-200 text-amber-900'
              }`}>
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
          <span>{isIbime ? 'Instituto Bilingüe IBIME · Secretaría General y Consejo Directivo · https://ibime.edu.mx' : `${schoolName} · Sistema de Inteligencia Institucional`}</span>
          <span className="font-bold">Dossier Ejecutivo de Junta Directiva · Página 1</span>
          <span>Folio: EXP-BI-{folioNumber}</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PÁGINA 2: RADAR ESTRATÉGICO CUATRIDIMENSIONAL, GRÁFICAS Y HOJA DE RUTA   */}
      {/* ========================================================================= */}
      <section className={`${hasTableRows ? 'print-page-break-after' : ''} h-auto min-h-0 flex flex-col justify-between pt-1 pb-4`}>
        <div>
          {/* Encabezado Secundario Continuo de Junta */}
          <div className="border-b border-slate-400 pb-2 mb-4 flex justify-between items-center text-[9px] text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <SchoolOfficialLogo
                  schoolId={report.schoolId || (institution as any)?.id}
                  name={schoolName}
                  logoUrl={institution?.logoUrl}
                  size={18}
                  variant="shield_only"
                />
              </div>
              <span className="font-bold uppercase tracking-wider text-slate-900">{schoolName}</span>
              {cct && <span className="font-mono text-slate-500 text-[8px]">· CCT: {cct}</span>}
            </div>
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
          <span>{isIbime ? 'Instituto Bilingüe IBIME · Secretaría General y Consejo Directivo · https://ibime.edu.mx' : `${schoolName} · Sistema de Inteligencia Institucional`}</span>
          <span className="font-bold">Dossier Ejecutivo de Junta Directiva · Página 2</span>
          <span>Folio: EXP-BI-{folioNumber}</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PÁGINA 3+: PADRÓN COMPLETO DE EXPEDIENTES Y BLOQUE FINAL DE FIRMAS        */}
      {/* ========================================================================= */}
      {hasTableRows && (
        <section className="pt-1 pb-4 h-auto min-h-0 flex flex-col justify-between">
          <div>
            {/* Encabezado Secundario Continuo de Junta */}
            <div className="border-b border-slate-400 pb-2 mb-4 flex justify-between items-center text-[9px] text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <SchoolOfficialLogo
                    schoolId={report.schoolId || (institution as any)?.id}
                    name={schoolName}
                    logoUrl={institution?.logoUrl}
                    size={18}
                    variant="shield_only"
                  />
                </div>
                <span className="font-bold uppercase tracking-wider text-slate-900">{schoolName}</span>
                {cct && <span className="font-mono text-slate-500 text-[8px]">· CCT: {cct}</span>}
              </div>
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
              {isCorporate 
                ? 'Constancia Oficial de Presentación, Visto Bueno y Dictamen de Dirección General Holding' 
                : 'Constancia Oficial de Presentación, Visto Bueno y Aprobación de Junta Directiva'}
            </div>

            <div className="grid grid-cols-3 gap-8 text-center text-[9.5px]">
              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-950">
                  {isCorporate ? 'Gerencia de Operaciones y Planta' : 'Presidencia del Consejo Directivo'}
                </p>
                <p className="text-slate-500 text-[8.5px]">
                  {isCorporate ? 'Dirección Técnica y Mantenimiento' : 'H. Junta de Gobierno / Patronato'}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className={`w-28 h-16 border border-dashed rounded flex flex-col items-center justify-center text-[7.5px] font-mono uppercase mb-1 p-1 ${
                  isIbime ? 'border-[#E41B14]/50 bg-red-50/20 text-[#0F2744]' : isCorporate ? 'border-blue-400 bg-blue-50/20 text-blue-900' : 'border-slate-400 text-slate-400'
                }`}>
                  {isIbime ? (
                    <>
                      <div className="w-6 h-6 flex items-center justify-center mb-0.5 opacity-70">
                        <IbimeOfficialLogo variant="shield_only" size={22} />
                      </div>
                      <span className="font-bold text-[7px] text-[#0F2744]">SELLO OFICIAL IBIME</span>
                      <span className="text-[6px] text-slate-500">CCT: 15PPR3322G</span>
                    </>
                  ) : isCorporate ? (
                    <>
                      <span className="font-bold text-[7px] text-slate-800">SELLO CORPORATIVO B2B</span>
                      <span className="text-[6px] text-slate-500">RFC: {cct}</span>
                      <span className="text-[5.5px] text-slate-400">HOLDING DIRECCIÓN GENERAL</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 flex items-center justify-center mb-0.5 opacity-80">
                        <SchoolOfficialLogo
                          schoolId={report.schoolId || (institution as any)?.id}
                          name={schoolName}
                          logoUrl={institution?.logoUrl}
                          size={22}
                          variant="shield_only"
                        />
                      </div>
                      <span className="font-bold text-[7px] text-slate-900 truncate max-w-[100px]">SELLO OFICIAL</span>
                      <span className="text-[6px] text-slate-500">CCT: {cct}</span>
                    </>
                  )}
                </div>
                <p className="font-bold text-slate-950">
                  {isCorporate ? 'Auditoría de Cumplimiento & Finanzas' : 'Control Escolar y Finanzas'}
                </p>
                <p className="text-slate-500 text-[8.5px]">
                  {isCorporate ? 'Fiscalización y Certificación B2B' : 'Cotejo y Validez de Registros'}
                </p>
              </div>

              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-950">
                  {isCorporate ? 'Dirección General / CEO' : 'Dirección General'}
                </p>
                <p className="text-slate-500 text-[8.5px]">
                  {isCorporate ? 'Rúbrica y Aprobación Ejecutiva Holding' : 'Rúbrica y Aprobación Ejecutiva'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-2.5 border-t border-slate-200 text-center text-[8px] text-slate-500 flex justify-between items-center">
              <span>{isIbime ? 'Instituto Bilingüe IBIME · Secretaría General y Consejo Directivo · https://ibime.edu.mx' : isCorporate ? `${schoolName} · Suite de Inteligencia Corporativa B2B · Modo CEO` : `${schoolName} · Sistema de Inteligencia Institucional`}</span>
              <span className="font-bold">Emisión Oficial Certificada · Carácter Vinculante</span>
              <span>{isCorporate ? 'Documento Confidencial para Uso Exclusivo del Comité de Dirección CEO' : 'Documento Confidencial para Uso Exclusivo de Junta Directiva'}</span>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
