"use client";

import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sliders, Sparkles } from 'lucide-react';

interface InteractiveMathLabWidgetProps {
  title: string;
  mathMode: 'linear_function' | 'quadratic_parabola' | 'coordinate_geometry' | 'fractions_visual';
  formulaExpression?: string;
  targetSlopeM?: number;
  targetInterceptB?: number;
  targetCoordinate?: { x: number; y: number };
  promptQuestion?: string;
  onComplete: (xp: number) => void;
}

function parseQuadraticDefaults(expr?: string): { a: number; b: number; c: number } {
  if (!expr) return { a: 1, b: -4, c: 3 };
  const clean = expr.replace(/\s+/g, '').replace(/^y=/i, '').replace(/=0$/i, '');
  const aMatch = clean.match(/^([+-]?\d*\.?\d*)x(?:\^2|²)/i);
  const bMatch = clean.match(/([+-]?\d*\.?\d*)x(?![\^²])/i);
  const withoutX = clean
    .replace(/^([+-]?\d*\.?\d*)x(?:\^2|²)/i, '')
    .replace(/([+-]?\d*\.?\d*)x(?![\^²])/i, '');
  const cMatch = withoutX.match(/([+-]?\d+\.?\d*)/);

  const parseCoeff = (raw: string | undefined, fallback: number) => {
    if (raw === undefined) return fallback;
    if (raw === '' || raw === '+') return 1;
    if (raw === '-') return -1;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const a = parseCoeff(aMatch?.[1], 1);
  const b = bMatch ? parseCoeff(bMatch[1], 0) : 0;
  const c = cMatch ? Number(cMatch[1]) : 0;
  return { a: a === 0 ? 1 : a, b, c };
}

export const InteractiveMathLabWidget: React.FC<InteractiveMathLabWidgetProps> = ({
  title,
  mathMode,
  formulaExpression,
  targetSlopeM = 2,
  targetInterceptB = 3,
  targetCoordinate = { x: 2, y: -1 },
  promptQuestion,
  onComplete,
}) => {
  const isQuadratic = mathMode === 'quadratic_parabola' || (formulaExpression || '').includes('x²') || (formulaExpression || '').includes('x^2');
  const initialQuad = useMemo(() => parseQuadraticDefaults(formulaExpression), [formulaExpression]);

  const [a, setA] = useState<number>(initialQuad.a);
  const [b, setB] = useState<number>(initialQuad.b);
  const [c, setC] = useState<number>(initialQuad.c);
  const [slopeM, setSlopeM] = useState<number>(targetSlopeM || 2);
  const [interceptB, setInterceptB] = useState<number>(targetInterceptB || 1);
  const [exploredCount, setExploredCount] = useState<number>(1);
  const [verified, setVerified] = useState<boolean>(false);

  // Coordinate mapping for 520 x 320 SVG plane: x in [-6, 6], y in [-5, 7]
  const W = 520;
  const H = 320;
  const xMin = -6;
  const xMax = 6;
  const yMin = -5;
  const yMax = 7;
  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const toSvgY = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;

  const quadMetrics = useMemo(() => {
    const safeA = a === 0 ? 0.5 : a;
    const discriminant = Number((b * b - 4 * safeA * c).toFixed(2));
    const vx = Number((-b / (2 * safeA)).toFixed(2));
    const vy = Number((safeA * vx * vx + b * vx + c).toFixed(2));
    let roots: number[] = [];
    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant);
      const r1 = Number(((-b - sqrtD) / (2 * safeA)).toFixed(2));
      const r2 = Number(((-b + sqrtD) / (2 * safeA)).toFixed(2));
      roots = [r1, r2].sort((u, v) => u - v);
    } else if (discriminant === 0) {
      roots = [vx];
    }

    const pts: string[] = [];
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = safeA * x * x + b * x + c;
      if (y >= yMin - 2 && y <= yMax + 2) {
        pts.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
      }
    }
    return { safeA, discriminant, vx, vy, roots, pts: pts.join(' ') };
  }, [a, b, c]);

  const linearPts = useMemo(() => {
    const p1 = `${toSvgX(xMin).toFixed(1)},${toSvgY(slopeM * xMin + interceptB).toFixed(1)}`;
    const p2 = `${toSvgX(xMax).toFixed(1)},${toSvgY(slopeM * xMax + interceptB).toFixed(1)}`;
    return `${p1} ${p2}`;
  }, [slopeM, interceptB]);

  const formattedEquation = useMemo(() => {
    if (!isQuadratic) {
      const signB = interceptB >= 0 ? '+' : '-';
      return `y = ${slopeM}x ${signB} ${Math.abs(interceptB)}`;
    }
    const aPart = a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`;
    const bPart = b === 0 ? '' : b > 0 ? ` + ${b === 1 ? '' : b}x` : ` - ${b === -1 ? '' : Math.abs(b)}x`;
    const cPart = c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
    return `y = ${aPart}${bPart}${cPart}`;
  }, [isQuadratic, a, b, c, slopeM, interceptB]);

  const applyPreset = (na: number, nb: number, nc: number) => {
    setA(na);
    setB(nb);
    setC(nc);
    setExploredCount((prev) => prev + 1);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/70 dark:from-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
            Laboratorio Graficador Cartesiano STEM · En Vivo (0 Tokens)
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
            {title}
          </h3>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-black text-xs sm:text-sm shadow-xs">
          {formattedEquation}
        </span>
      </div>

      {promptQuestion && (
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>{promptQuestion}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Plano Cartesiano Interactivo SVG */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-3 shadow-xs">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl bg-slate-50/60 dark:bg-zinc-900/70">
            {/* Grid X */}
            {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map((x) => (
              <g key={`gx-${x}`}>
                <line
                  x1={toSvgX(x)}
                  y1={0}
                  x2={toSvgX(x)}
                  y2={H}
                  stroke={x === 0 ? '#334155' : '#CBD5E1'}
                  strokeWidth={x === 0 ? 1.8 : 0.75}
                />
                {x !== 0 && x % 2 === 0 && (
                  <text x={toSvgX(x)} y={toSvgY(0) + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
                    {x}
                  </text>
                )}
              </g>
            ))}

            {/* Grid Y */}
            {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((y) => (
              <g key={`gy-${y}`}>
                <line
                  x1={0}
                  y1={toSvgY(y)}
                  x2={W}
                  y2={toSvgY(y)}
                  stroke={y === 0 ? '#334155' : '#CBD5E1'}
                  strokeWidth={y === 0 ? 1.8 : 0.75}
                />
                {y !== 0 && y % 2 === 0 && (
                  <text x={toSvgX(0) - 8} y={toSvgY(y) + 3} textAnchor="end" fontSize="10" fontWeight="700" fill="#64748B">
                    {y}
                  </text>
                )}
              </g>
            ))}

            {isQuadratic ? (
              <>
                {/* Eje de simetría */}
                {quadMetrics.vx >= xMin && quadMetrics.vx <= xMax && (
                  <line
                    x1={toSvgX(quadMetrics.vx)}
                    y1={0}
                    x2={toSvgX(quadMetrics.vx)}
                    y2={H}
                    stroke="#7C3AED"
                    strokeWidth="1.8"
                    strokeDasharray="6,4"
                  />
                )}
                {/* Parábola */}
                <polyline
                  fill="none"
                  stroke="#1E4FD8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  points={quadMetrics.pts}
                />
                {/* Ordenada al origen (0, c) */}
                {c >= yMin && c <= yMax && (
                  <circle cx={toSvgX(0)} cy={toSvgY(c)} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
                )}
                {/* Raíces reales */}
                {quadMetrics.roots.map((rx, idx) =>
                  rx >= xMin && rx <= xMax ? (
                    <g key={`root-${idx}`}>
                      <circle cx={toSvgX(rx)} cy={toSvgY(0)} r="6" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={toSvgX(rx)} y={toSvgY(0) - 10} textAnchor="middle" fontSize="10" fontWeight="800" fill="#065F46">
                        x{quadMetrics.roots.length > 1 ? idx + 1 : ''}={rx}
                      </text>
                    </g>
                  ) : null
                )}
                {/* Vértice */}
                {quadMetrics.vx >= xMin && quadMetrics.vx <= xMax && quadMetrics.vy >= yMin && quadMetrics.vy <= yMax && (
                  <g>
                    <circle cx={toSvgX(quadMetrics.vx)} cy={toSvgY(quadMetrics.vy)} r="6.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={toSvgX(quadMetrics.vx)}
                      y={toSvgY(quadMetrics.vy) + (a > 0 ? 18 : -12)}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="800"
                      fill="#92400E"
                    >
                      V({quadMetrics.vx}, {quadMetrics.vy})
                    </text>
                  </g>
                )}
              </>
            ) : (
              <>
                <polyline fill="none" stroke="#1E4FD8" strokeWidth="3.2" points={linearPts} />
                <circle
                  cx={toSvgX(targetCoordinate.x)}
                  cy={toSvgY(slopeM * targetCoordinate.x + interceptB)}
                  r="6"
                  fill="#047857"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* Experimentos rápidos */}
          {isQuadratic && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Experimentos:</span>
              <button
                type="button"
                onClick={() => applyPreset(1, -4, 3)}
                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold cursor-pointer"
              >
                2 raíces (x²-4x+3)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1, -4, 4)}
                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold cursor-pointer"
              >
                Tangente Δ=0 (x²-4x+4)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(-1, 0, 4)}
                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold cursor-pointer"
              >
                Invertida (-x²+4)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1, 0, 2)}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold cursor-pointer"
              >
                Sin raíces (x²+2)
              </button>
            </div>
          )}
        </div>

        {/* Panel de Controles & Cálculo Paso a Paso */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                {isQuadratic ? 'Coeficientes (a, b, c)' : 'Parámetros (m, b)'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setA(initialQuad.a);
                  setB(initialQuad.b);
                  setC(initialQuad.c);
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>

            {isQuadratic ? (
              <div className="space-y-2.5 text-xs">
                <label className="block">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-200">
                    <span>a (apertura y concavidad)</span>
                    <span className="font-mono text-indigo-700">{a}</span>
                  </div>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.5}
                    value={a}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setA(v === 0 ? 0.5 : v);
                      setExploredCount((p) => p + 1);
                    }}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />
                </label>
                <label className="block">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-200">
                    <span>b (desplazamiento lateral)</span>
                    <span className="font-mono text-indigo-700">{b}</span>
                  </div>
                  <input
                    type="range"
                    min={-8}
                    max={8}
                    step={1}
                    value={b}
                    onChange={(e) => {
                      setB(Number(e.target.value));
                      setExploredCount((p) => p + 1);
                    }}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />
                </label>
                <label className="block">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-200">
                    <span>c (ordenada al origen)</span>
                    <span className="font-mono text-indigo-700">{c}</span>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={6}
                    step={1}
                    value={c}
                    onChange={(e) => {
                      setC(Number(e.target.value));
                      setExploredCount((p) => p + 1);
                    }}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <label className="block">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Pendiente m</span>
                    <span className="font-mono text-indigo-700">{slopeM}</span>
                  </div>
                  <input type="range" min={-5} max={5} step={1} value={slopeM} onChange={(e) => setSlopeM(Number(e.target.value))} className="w-full accent-indigo-700" />
                </label>
                <label className="block">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Ordenada b</span>
                    <span className="font-mono text-indigo-700">{interceptB}</span>
                  </div>
                  <input type="range" min={-5} max={5} step={1} value={interceptB} onChange={(e) => setInterceptB(Number(e.target.value))} className="w-full accent-indigo-700" />
                </label>
              </div>
            )}
          </div>

          {isQuadratic && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Discriminante Δ = b² - 4ac</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-black ${
                    quadMetrics.discriminant > 0
                      ? 'bg-emerald-700 text-white'
                      : quadMetrics.discriminant === 0
                        ? 'bg-blue-700 text-white'
                        : 'bg-rose-700 text-white'
                  }`}
                >
                  Δ = {quadMetrics.discriminant}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Vértice V(-b/2a, f(h))</span>
                <span className="font-mono font-bold text-amber-300">({quadMetrics.vx}, {quadMetrics.vy})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Soluciones reales</span>
                <span className="font-mono font-bold text-emerald-300">
                  {quadMetrics.roots.length === 2
                    ? `x₁ = ${quadMetrics.roots[0]}, x₂ = ${quadMetrics.roots[1]}`
                    : quadMetrics.roots.length === 1
                      ? `x = ${quadMetrics.roots[0]} (doble)`
                      : 'Sin raíces reales'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              {verified ? 'Laboratorio completado' : `Interacciones: ${exploredCount}`}
            </span>
            <button
              type="button"
              onClick={() => {
                setVerified(true);
                onComplete(50);
              }}
              className="px-5 py-2.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Validar Laboratorio (+50 XP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
