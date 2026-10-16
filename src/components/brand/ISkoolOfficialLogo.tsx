"use client";

import React from 'react';

export interface ISkoolOfficialLogoProps {
  variant?: 'emblem_only' | 'horizontal' | 'stacked' | 'badge';
  theme?: 'dark' | 'light' | 'auto' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

/**
 * ============================================================================
 * LOGOTIPO OFICIAL VECTORIAL iSkool (Plataforma Pedagógica & IA)
 * ============================================================================
 * 
 * Concepto y Fundamento Semiótico del Prototipo:
 * 1. El Prisma del Birrete Académico (Fase Izquierda):
 *    Representa el rigor educativo, la estructura formal de la Nueva Escuela Mexicana
 *    y la tradición pedagógica de excelencia institucional.
 * 2. La Curva 'S' Ascendente & Cinta del Infinito (Fase Central):
 *    Simboliza el aprendizaje continuo (Lifelong Learning), la adaptabilidad del alumno
 *    y el dinamismo lúdico de la gamificación formativa.
 * 3. La Estrella / Chispa Cuántica Áurea (Vértice Superior):
 *    Representa el Motor de Inteligencia Artificial Pedagógica guiando el aprendizaje,
 *    la cúspide del mérito escolar y el punto distinguido de la 'i' de iSkool.
 * 4. Tipografía Biométrica & Sobria:
 *    Equilibrio de trazos modernos sin estridencias infantiles, con sobriedad ejecutiva
 *    apta para colegios de alto prestigio y ministerios educativos.
 */
export const ISkoolOfficialLogo: React.FC<ISkoolOfficialLogoProps> = ({
  variant = 'horizontal',
  theme = 'auto',
  size = 'md',
  showTagline = true,
  className = '',
  glow = false
}) => {
  // Resolución de dimensiones
  const pixelDim = typeof size === 'number'
    ? size
    : {
        xs: 24,
        sm: 32,
        md: 44,
        lg: 60,
        xl: 84,
        '2xl': 120
      }[size] || 44;

  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const isMono = theme === 'monochrome';

  // Configuración de colores del texto según el tema
  const textPrimaryColor = isMono
    ? 'currentColor'
    : isDark
      ? '#F8FAFC'
      : isLight
        ? '#0F172A'
        : 'text-slate-900 dark:text-white';

  const textSecondaryColor = isMono
    ? 'currentColor'
    : isDark
      ? '#94A3B8'
      : isLight
        ? '#64748B'
        : 'text-slate-500 dark:text-slate-400';

  // Render del Emblema Isotipo Vectorial Puro (100x100)
  const renderEmblem = (dim: number) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${glow ? 'drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'drop-shadow-sm'} transition-transform duration-300`}
    >
      <defs>
        {/* Degradado Azul Noche Profundo a Zafiro para el Birrete */}
        <linearGradient id="iskoolCapFacetLeft" x1="20" y1="35" x2="60" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        <linearGradient id="iskoolCapFacetRight" x1="60" y1="35" x2="95" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Degradado Dinámico para la Cinta 'S' Ascendente */}
        <linearGradient id="iskoolAscentCurve" x1="40" y1="100" x2="85" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>

        {/* Degradado Oro Champaña de la Estrella de Inteligencia & Mérito */}
        <linearGradient id="iskoolStarGold" x1="75" y1="10" x2="95" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Bisel Áureo Sutil */}
        <linearGradient id="iskoolGoldTrim" x1="20" y1="35" x2="90" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.6" />
        </linearGradient>

        {/* Sombra de oclusión ambiental */}
        <radialGradient id="iskoolCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Resplandor ambiental tecnológico de fondo */}
      <circle cx="65" cy="55" r="42" fill="url(#iskoolCoreGlow)" />

      {/* ------------------------------------------------------------- */}
      {/* 1. BIRRETE ACADÉMICO GEOMÉTRICO (FUNDAMENTO PEDAGÓGICO)        */}
      {/* ------------------------------------------------------------- */}
      <g id="academic-mortarboard">
        {/* Faceta Izquierda del Birrete */}
        <path
          d="M 58 35 L 20 53 L 56 69 L 58 35 Z"
          fill={isMono ? 'currentColor' : 'url(#iskoolCapFacetLeft)'}
          stroke={isMono ? 'none' : 'url(#iskoolGoldTrim)'}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Faceta Derecha del Birrete */}
        <path
          d="M 58 35 L 94 51 L 58 69 L 58 35 Z"
          fill={isMono ? 'currentColor' : 'url(#iskoolCapFacetRight)'}
          stroke={isMono ? 'none' : 'url(#iskoolGoldTrim)'}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Base de la Corona / Bonete Inferior */}
        <path
          d="M 36 62 L 36 78 C 36 84 50 88 58 88 C 66 88 78 84 78 78 L 78 64 C 72 67 65 69 58 69 C 50 69 43 66 36 62 Z"
          fill={isMono ? 'currentColor' : '#0F172A'}
          opacity={isMono ? '0.6' : '0.95'}
          stroke={isMono ? 'none' : '#334155'}
          strokeWidth="1"
        />

        {/* Cordón y Borla de Honor Académico (Izquierda) */}
        <path
          d="M 58 35 Q 28 42 26 62 L 24 74"
          fill="none"
          stroke={isMono ? 'currentColor' : '#F59E0B'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Borla estilizada */}
        <path
          d="M 22 74 L 27 74 L 26 84 C 25.5 86 23.5 86 23 84 Z"
          fill={isMono ? 'currentColor' : '#F59E0B'}
        />
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 2. CINTA ASCENDENTE 'S' (INNOVACIÓN, GAMIFICACIÓN E INFINITO) */}
      {/* ------------------------------------------------------------- */}
      <g id="ascending-s-ribbon">
        {/* Lazo inferior del infinito */}
        <path
          d="M 58 88 C 72 88 88 84 88 72 C 88 62 76 56 64 56 C 52 56 42 50 42 42 C 42 34 50 28 60 28"
          fill="none"
          stroke={isMono ? 'currentColor' : 'url(#iskoolAscentCurve)'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isMono ? '0.85' : '1'}
        />

        {/* Estela de propulsión hacia la estrella superior */}
        <path
          d="M 64 56 C 76 56 86 46 86 32 L 86 28"
          fill="none"
          stroke={isMono ? 'currentColor' : '#38BDF8'}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 3. ESTRELLA ÁUREA / NÚCLEO IA PEDAGÓGICA (EL PUNTO DE LA 'i') */}
      {/* ------------------------------------------------------------- */}
      <g id="pedagogical-ai-star" transform="translate(86, 26)">
        {/* Resplandor suave */}
        <circle cx="0" cy="0" r="10" fill="#F59E0B" opacity="0.25" />

        {/* Estrella de 4 puntas biselada (Estrella polar del saber) */}
        <path
          d="M 0 -13 Q 1 -3 9 0 Q 1 3 0 13 Q -1 3 -9 0 Q -1 -3 0 -13 Z"
          fill={isMono ? 'currentColor' : 'url(#iskoolStarGold)'}
          stroke={isMono ? 'none' : '#FFFFFF'}
          strokeWidth="0.8"
        />

        {/* Destellos secundarios diagonales */}
        <path
          d="M -4 -4 L 4 4 M -4 4 L 4 -4"
          stroke={isMono ? 'currentColor' : '#FDE68A'}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Núcleo de alta luminosidad */}
        <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
      </g>
    </svg>
  );

  // -------------------------------------------------------------
  // VARIANTE: SÓLO EMBLEMA (FAVICON / AVATAR / ICON)
  // -------------------------------------------------------------
  if (variant === 'emblem_only') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {renderEmblem(pixelDim)}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANTE: DISTINTIVO BADGE (HERÁLDICO CON BORDE PULIDO)
  // -------------------------------------------------------------
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg shadow-blue-950/20 ${className}`}>
        {renderEmblem(Math.round(pixelDim * 0.75))}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-0.5">
            <span className="font-extrabold tracking-tight text-amber-400 text-sm">i</span>
            <span className="font-extrabold tracking-tight text-white text-sm">Skool</span>
          </div>
          {showTagline && (
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
              Académico
            </span>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANTE: APILADO / VERTICAL (PORTADAS, DIPLOMAS, SPLASH)
  // -------------------------------------------------------------
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        {renderEmblem(pixelDim)}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline tracking-tight">
            <span
              className="font-black text-amber-500"
              style={{ fontSize: `${Math.round(pixelDim * 0.48)}px` }}
            >
              i
            </span>
            <span
              className={`font-black ${typeof textPrimaryColor === 'string' && textPrimaryColor.startsWith('#') ? '' : textPrimaryColor}`}
              style={{
                fontSize: `${Math.round(pixelDim * 0.48)}px`,
                color: typeof textPrimaryColor === 'string' && textPrimaryColor.startsWith('#') ? textPrimaryColor : undefined
              }}
            >
              Skool
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-4 h-[1px] bg-amber-500/50" />
              <span
                className={`uppercase tracking-[0.2em] font-bold ${typeof textSecondaryColor === 'string' && textSecondaryColor.startsWith('#') ? '' : textSecondaryColor}`}
                style={{
                  fontSize: `${Math.max(9, Math.round(pixelDim * 0.14))}px`,
                  color: typeof textSecondaryColor === 'string' && textSecondaryColor.startsWith('#') ? textSecondaryColor : undefined
                }}
              >
                Plataforma Pedagógica & IA
              </span>
              <span className="w-4 h-[1px] bg-amber-500/50" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VARIANTE: HORIZONTAL (NAVBAR / CABECERAS OFICIALES / FOOTER)
  // -------------------------------------------------------------
  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {renderEmblem(pixelDim)}

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline tracking-tight leading-none">
          {/* 'i' distintiva áurea */}
          <span
            className="font-black text-amber-500 transition-colors"
            style={{ fontSize: `${Math.round(pixelDim * 0.58)}px` }}
          >
            i
          </span>
          {/* 'Skool' institucional */}
          <span
            className={`font-black ${typeof textPrimaryColor === 'string' && textPrimaryColor.startsWith('#') ? '' : textPrimaryColor} transition-colors`}
            style={{
              fontSize: `${Math.round(pixelDim * 0.58)}px`,
              color: typeof textPrimaryColor === 'string' && textPrimaryColor.startsWith('#') ? textPrimaryColor : undefined
            }}
          >
            Skool
          </span>
        </div>

        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`uppercase tracking-[0.16em] font-bold ${typeof textSecondaryColor === 'string' && textSecondaryColor.startsWith('#') ? '' : textSecondaryColor}`}
              style={{
                fontSize: `${Math.max(8.5, Math.round(pixelDim * 0.16))}px`,
                color: typeof textSecondaryColor === 'string' && textSecondaryColor.startsWith('#') ? textSecondaryColor : undefined
              }}
            >
              Plataforma Pedagógica & IA
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
