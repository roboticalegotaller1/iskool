"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Compass, 
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface LanguageAnalyticsChartsProps {
  language: 'en' | 'fr';
}

interface SkillDimension {
  name: string;
  code: string;
  currentScore: number; // 0 - 100
  targetScore: number;  // 0 - 100
}

export const LanguageAnalyticsCharts: React.FC<LanguageAnalyticsChartsProps> = ({ language }) => {
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'secundaria' | 'preparatoria'>('all');

  // Dimensiones evaluadas
  const dimensions: SkillDimension[] = language === 'fr' ? [
    { name: 'Compréhension Orale (CO)', code: 'CO', currentScore: 78, targetScore: 80 },
    { name: 'Production Orale (PO)', code: 'PO', currentScore: 72, targetScore: 75 },
    { name: 'Compréhension Écrite (CE)', code: 'CE', currentScore: 84, targetScore: 80 },
    { name: 'Production Écrite (PE)', code: 'PE', currentScore: 69, targetScore: 75 },
    { name: 'Précision Phonétique & Liaison', code: 'FON', currentScore: 74, targetScore: 80 },
    { name: 'Étendue Lexicale & Registre', code: 'LEX', currentScore: 81, targetScore: 80 },
  ] : [
    { name: 'Oral Comprehension (Listening)', code: 'CO', currentScore: 82, targetScore: 80 },
    { name: 'Oral Production (Speaking)', code: 'PO', currentScore: 76, targetScore: 80 },
    { name: 'Reading Comprehension', code: 'CE', currentScore: 88, targetScore: 85 },
    { name: 'Written Production', code: 'PE', currentScore: 73, targetScore: 75 },
    { name: 'Phonetic Articulation & Stress', code: 'FON', currentScore: 79, targetScore: 80 },
    { name: 'Vocabulary & Idiomatic Range', code: 'LEX', currentScore: 85, targetScore: 85 },
  ];

  // Distribución de alumnos por nivel oficial
  const levelDistribution = language === 'fr' ? [
    { level: 'A1 (Découverte)', count: 8, percentage: 12, cenni: 'CENNI 3-5', color: 'bg-emerald-500' },
    { level: 'A2 (Intermédiaire)', count: 24, percentage: 36, cenni: 'CENNI 6-8', color: 'bg-teal-500' },
    { level: 'B1 (Seuil Indépendant)', count: 26, percentage: 39, cenni: 'CENNI 9-11', color: 'bg-indigo-500' },
    { level: 'B2 (Avancé / Autonome)', count: 7, percentage: 11, cenni: 'CENNI 12-14', color: 'bg-violet-500' },
    { level: 'C1 (Maîtrise)', count: 2, percentage: 2, cenni: 'CENNI 15-17', color: 'bg-fuchsia-500' },
  ] : [
    { level: 'A1 (Beginner)', count: 5, percentage: 8, cenni: 'CENNI 3-5', color: 'bg-emerald-500' },
    { level: 'A2 (Elementary)', count: 18, percentage: 27, cenni: 'CENNI 6-8', color: 'bg-teal-500' },
    { level: 'B1 (Intermediate)', count: 28, percentage: 42, cenni: 'CENNI 9-11', color: 'bg-indigo-500' },
    { level: 'B2 (Upper Intermediate)', count: 12, percentage: 18, cenni: 'CENNI 12-14', color: 'bg-violet-500' },
    { level: 'C1 (Advanced Fluency)', count: 3, percentage: 5, cenni: 'CENNI 15-17', color: 'bg-fuchsia-500' },
  ];

  // Cálculo del polígono de Radar SVG (6 vértices)
  const radarSize = 260;
  const center = radarSize / 2;
  const radius = center - 35;

  const getCoordinates = (index: number, total: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  const currentPolygonPoints = dimensions.map((d, i) => {
    const { x, y } = getCoordinates(i, dimensions.length, d.currentScore / 100);
    return `${x},${y}`;
  }).join(' ');

  const targetPolygonPoints = dimensions.map((d, i) => {
    const { x, y } = getCoordinates(i, dimensions.length, d.targetScore / 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Barra de KPIs Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Nivel Grupal Consolidado</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white font-mono">B1+ (Independiente)</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-black">
              CENNI 11
            </span>
          </div>
          <span className="text-[11px] text-teal-400 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            +14% vs trimestre anterior
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Precisión Fonética Grupal</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-teal-300 font-mono">79.4%</span>
            <span className="text-xs text-slate-400 font-bold">0 Tokens IA</span>
          </div>
          <p className="text-[11px] text-slate-400">Evaluado en tiempo real por el karaoke</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Horas de Diálogo Inmersivo</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">428 hrs</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">
              Avatares
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Con gesticulación y primera persona</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Candidatos a Certificación</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">35 Alumnos</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-bold">
              {language === 'fr' ? 'DELF B1/B2' : 'Cambridge B2'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Aptos según rúbrica oficial del centro</p>
        </div>
      </div>

      {/* Gráficos Principales: Radar de Competencias & Distribución por Niveles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar de Competencias Lingüísticas */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Radar de Macro-Habilidades Lingüísticas</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Ponderación de destrezas comunicativas oficiales ({language === 'fr' ? 'Cadre Européen CECRL' : 'CEFR Framework'})
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Grupo
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Meta
              </span>
            </div>
          </div>

          {/* Gráfico SVG de Radar */}
          <div className="flex justify-center items-center py-2">
            <svg width={radarSize} height={radarSize} className="overflow-visible">
              {/* Círculos concéntricos guía (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius * ratio}
                  fill="none"
                  stroke="#334155"
                  strokeDasharray={ratio === 1 ? undefined : "3 3"}
                  strokeWidth="1"
                />
              ))}

              {/* Radios desde el centro */}
              {dimensions.map((_, i) => {
                const { x, y } = getCoordinates(i, dimensions.length, 1.0);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Polígono Objetivo Meta */}
              <polygon
                points={targetPolygonPoints}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Polígono Real del Grupo */}
              <polygon
                points={currentPolygonPoints}
                fill="rgba(20, 184, 166, 0.25)"
                stroke="#14b8a6"
                strokeWidth="2.5"
              />

              {/* Puntos y Etiquetas */}
              {dimensions.map((d, i) => {
                const { x, y } = getCoordinates(i, dimensions.length, d.currentScore / 100);
                const labelCoord = getCoordinates(i, dimensions.length, 1.22);

                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2" />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[9px] font-black fill-slate-300"
                    >
                      {d.code} ({d.currentScore}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Leyenda de Dimensiones */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {dimensions.map(d => (
              <div key={d.code} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 truncate max-w-[150px]">{d.name}</span>
                <span className="font-mono font-bold text-teal-400">{d.currentScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Niveles Oficiales SEP CENNI & MCER */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Población Escolar por Nivel de Acreditación</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Equivalencia oficial SEP CENNI (1-20) y Marco Común Europeo
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-[10px] font-black text-indigo-300">
              67 Alumnos Activos
            </span>
          </div>

          {/* Barras de Progreso por Nivel */}
          <div className="space-y-3.5 pt-2">
            {levelDistribution.map((item) => (
              <div key={item.level} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.level}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px]">
                      {item.cenni}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-300 font-bold">{item.count} est.</span>
                    <span className="text-indigo-400 font-black">({item.percentage}%)</span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recomendación de Certificación Institucional */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 space-y-1.5 text-xs text-indigo-200">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Diagnóstico de Certificación para Dirección Escolar:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              El <strong>51% del alumnado</strong> supera la barrera del nivel B1/B2 (CENNI 11+). Se recomienda agendar la ronda semestral de simulacro {language === 'fr' ? 'DELF Junior Scolaire' : 'Cambridge B1 Preliminary / B2 First'} para el próximo mes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
