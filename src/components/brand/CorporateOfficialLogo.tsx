"use client";

import React from 'react';

export interface CorporateOfficialLogoProps {
  enterpriseId?: string;
  name?: string;
  className?: string;
  variant?: 'emblem_only' | 'horizontal' | 'full' | 'shield_only';
  theme?: 'dark' | 'light' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
}

/**
 * Logotipos Oficiales Vectoriales para el Sector Corporativo B2B e Industrial.
 * Implementación 100% vectorial inline SVG de alta fidelidad:
 * 1. BMW Group México (Planta San Luis Potosí) - Roundel BMW oficial con cuadrantes celeste/blanco, biseles cromados y tipografía técnica.
 * 2. Grupo Comercial Vanguardia Retail - Monograma hexagonal y listón dinámico en esmeralda y oro.
 * 3. Innovasoft Dynamics Cloud & AI - Chip neural cuántico en cian y violeta de alta tecnología.
 */
export const CorporateOfficialLogo: React.FC<CorporateOfficialLogoProps> = ({
  enterpriseId = '',
  name = '',
  className = '',
  variant = 'emblem_only',
  theme = 'auto',
  size = 'md',
}) => {
  // Detección de la empresa
  const idLower = String(enterpriseId || '').toLowerCase();
  const nameLower = String(name || '').toLowerCase();

  const isBmw = idLower === 'emp-bmw' || idLower.includes('bmw') || nameLower.includes('bmw') || nameLower.includes('nexus');
  const isRetail = idLower === 'emp-ventas' || idLower.includes('retail') || idLower.includes('ventas') || nameLower.includes('retail') || nameLower.includes('vanguardia');
  const isTech = idLower === 'emp-tech' || idLower.includes('tech') || nameLower.includes('innovasoft') || nameLower.includes('technology');

  // Resolución de dimensiones numéricas
  const pixelDim = typeof size === 'number'
    ? size
    : {
        xs: 24,
        sm: 32,
        md: 44,
        lg: 56,
        xl: 72,
      }[size] || 44;

  // -------------------------------------------------------------
  // 1. EMBLEMA VECTORIAL OFICIAL BMW (ROUNDEL BAVARO CON BISEL)
  // -------------------------------------------------------------
  const renderBmwEmblem = (dim: number) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-sm"
    >
      <defs>
        <radialGradient id="bmwOuterChrome" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#4A5568" />
          <stop offset="70%" stopColor="#1A202C" />
          <stop offset="100%" stopColor="#0B0F19" />
        </radialGradient>
        <linearGradient id="bmwSilverBevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      {/* Anillo exterior biselado cromo y negro */}
      <circle cx="50" cy="50" r="48" fill="url(#bmwOuterChrome)" stroke="url(#bmwSilverBevel)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#64748B" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.6" />

      {/* Letras B - M - W nítidas y centradas en el cuadrante superior */}
      <text x="32" y="22" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="10.5" fill="#FFFFFF" textAnchor="middle">B</text>
      <text x="50" y="17" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="10.5" fill="#FFFFFF" textAnchor="middle">M</text>
      <text x="68" y="22" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="10.5" fill="#FFFFFF" textAnchor="middle">W</text>

      {/* Círculo central interior con cuadrantes bávaros oficiales */}
      <g transform="translate(50, 50)">
        {/* Fondo Azul Oficial BMW (#0066B1) */}
        <circle cx="0" cy="0" r="28" fill="#0066B1" stroke="url(#bmwSilverBevel)" strokeWidth="1.2" />
        {/* Cuadrante 1: Superior Izquierdo - Blanco Puro */}
        <path d="M 0 -28 A 28 28 0 0 0 -28 0 L 0 0 Z" fill="#FFFFFF" />
        {/* Cuadrante 3: Inferior Derecho - Blanco Puro */}
        <path d="M 0 28 A 28 28 0 0 0 28 0 L 0 0 Z" fill="#FFFFFF" />
        {/* Líneas divisorias de cruz interna */}
        <line x1="0" y1="-28" x2="0" y2="28" stroke="#0F172A" strokeWidth="1.2" />
        <line x1="-28" y1="0" x2="28" y2="0" stroke="#0F172A" strokeWidth="1.2" />
        {/* Centro de alta definición */}
        <circle cx="0" cy="0" r="1.5" fill="#CBD5E1" />
      </g>
    </svg>
  );

  // -------------------------------------------------------------
  // 2. EMBLEMA VECTORIAL OFICIAL VANGUARDIA RETAIL (HEXÁGONO ORO & ESMERALDA)
  // -------------------------------------------------------------
  const renderRetailEmblem = (dim: number) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-sm"
    >
      <defs>
        <linearGradient id="retailEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="retailGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Escudo Hexagonal Facetado Esmeralda */}
      <polygon
        points="50,6 90,26 90,74 50,94 10,74 10,26"
        fill="url(#retailEmeraldGrad)"
        stroke="url(#retailGoldGrad)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Facetado sutil interno de profundidad */}
      <polygon points="50,6 90,26 50,50 10,26" fill="#FFFFFF" opacity="0.12" />
      <polygon points="90,26 90,74 50,50" fill="#000000" opacity="0.1" />

      {/* Letra 'V' y Listón Dinámico de Comercio Omnicanal en Oro */}
      <path
        d="M26 30 L45 72 C48 78 52 78 55 72 L74 30 L62 30 L50 60 L38 30 Z"
        fill="url(#retailGoldGrad)"
      />
      {/* Estrella o destello superior de excelencia */}
      <circle cx="50" cy="22" r="3" fill="#FDE047" />
    </svg>
  );

  // -------------------------------------------------------------
  // 3. EMBLEMA VECTORIAL OFICIAL INNOVASOFT TECH (CHIP NEURAL CIAN & INDIGO)
  // -------------------------------------------------------------
  const renderTechEmblem = (dim: number) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-sm"
    >
      <defs>
        <linearGradient id="techIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="70%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="techCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Base Octagonal de Microprocesador AI */}
      <rect x="14" y="14" width="72" height="72" rx="18" fill="url(#techIndigoGrad)" stroke="url(#techCyanGrad)" strokeWidth="2.5" />

      {/* Pistas de circuito integrado / buses de datos */}
      <line x1="50" y1="4" x2="50" y2="14" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="4" x2="32" y2="14" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="4" x2="68" y2="14" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="50" y1="86" x2="50" y2="96" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="86" x2="32" y2="96" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="86" x2="68" y2="96" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />

      <line x1="4" y1="50" x2="14" y2="50" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="50" x2="96" y2="50" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />

      {/* Núcleo de Red Neuronal Central */}
      <circle cx="50" cy="50" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="url(#techCyanGrad)" />
      
      {/* Nodos Sinápticos */}
      <circle cx="34" cy="34" r="3" fill="#A5B4FC" />
      <circle cx="66" cy="34" r="3" fill="#A5B4FC" />
      <circle cx="34" cy="66" r="3" fill="#A5B4FC" />
      <circle cx="66" cy="66" r="3" fill="#A5B4FC" />

      {/* Conexiones sinápticas */}
      <line x1="34" y1="34" x2="44" y2="44" stroke="#67E8F9" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="66" y1="34" x2="56" y2="44" stroke="#67E8F9" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="34" y1="66" x2="44" y2="56" stroke="#67E8F9" strokeWidth="1" strokeDasharray="2 1" />
      <line x1="66" y1="66" x2="56" y2="56" stroke="#67E8F9" strokeWidth="1" strokeDasharray="2 1" />
    </svg>
  );

  // Selector de emblema
  const renderEmblem = (dim: number) => {
    if (isBmw) return renderBmwEmblem(dim);
    if (isRetail) return renderRetailEmblem(dim);
    return renderTechEmblem(dim);
  };

  // Solo emblema (ej. en avatares, banners estrechos, chips de tabla)
  if (variant === 'emblem_only' || variant === 'shield_only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(pixelDim)}
      </div>
    );
  }

  // Variante Horizontal / Completa con Lockup Tipográfico
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {renderEmblem(pixelDim)}

      <div className="flex flex-col text-left leading-tight min-w-0">
        {isBmw ? (
          <>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-wider text-sm sm:text-base font-sans truncate">
              BMW GROUP
            </span>
            <span className="font-bold text-[#0066B1] text-[11px] sm:text-xs tracking-wide truncate">
              MÉXICO · PLANTA SLP
            </span>
            {variant === 'full' && (
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                Automotriz & Manufactura Avanzada
              </span>
            )}
          </>
        ) : isRetail ? (
          <>
            <span className="font-black text-slate-900 dark:text-white tracking-wide text-sm sm:text-base truncate">
              VANGUARDIA RETAIL
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs tracking-wide truncate">
              GRUPO COMERCIAL & LOGÍSTICA
            </span>
            {variant === 'full' && (
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                Cadena de Suministro Omnicanal 4.0
              </span>
            )}
          </>
        ) : (
          <>
            <span className="font-black text-slate-900 dark:text-white tracking-wide text-sm sm:text-base truncate">
              INNOVASOFT DYNAMICS
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] sm:text-xs tracking-wide truncate">
              CLOUD & AI ENTERPRISE
            </span>
            {variant === 'full' && (
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                Infraestructura SaaS & Modelos IA
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CorporateOfficialLogo;
