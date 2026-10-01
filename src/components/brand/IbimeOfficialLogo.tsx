"use client";

import React from 'react';

interface IbimeOfficialLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'shield_only' | 'horizontal';
  theme?: 'dark' | 'light' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
}

/**
 * Logotipo y Escudo Oficial del Instituto Bilingüe IBIME S.C.
 * Renderizado vectorial ultra nítido con el blasón heráldico, antorcha del saber,
 * libro abierto y los 4 astros representativos de los planteles (Montes, Lagos, San Cristóbal, Coacalco).
 */
export const IbimeOfficialLogo: React.FC<IbimeOfficialLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'auto',
  size = 'md',
  showText = true
}) => {
  const isNumberSize = typeof size === 'number';
  const pixelDim = isNumberSize ? size : (size === 'sm' ? 32 : size === 'lg' ? 56 : size === 'xl' ? 72 : 44);
  const sizeClasses = isNumberSize ? '' : {
    sm: 'h-8 text-xs',
    md: 'h-11 text-sm',
    lg: 'h-16 text-base',
    xl: 'h-24 text-xl'
  }[size];

  // Escudo Heráldico Vectorial Oficial
  const renderShieldSvg = (dim: number = 44) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md select-none"
    >
      <defs>
        <linearGradient id="ibimeShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#065F46" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="ibimeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="ibimeTorchGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
      </defs>

      {/* Halo exterior dorado */}
      <circle cx="50" cy="50" r="48" fill="url(#ibimeGoldGrad)" opacity="0.9" />

      {/* Anillo de contraste verde esmeralda */}
      <circle cx="50" cy="50" r="45" fill="#064E3B" stroke="#FDE68A" strokeWidth="1.5" />

      {/* Silueta del Escudo Mayor */}
      <path
        d="M50 12 L78 22 C78 52 50 78 50 78 C50 78 22 52 22 22 Z"
        fill="url(#ibimeShieldGrad)"
        stroke="url(#ibimeGoldGrad)"
        strokeWidth="2.5"
      />

      {/* Libro Abierto (Fundamento Académico Bilingüe) */}
      <path
        d="M34 56 C39 53 45 53 50 56 C55 53 61 53 66 56 L66 64 C61 61 55 61 50 64 C45 61 39 61 34 64 Z"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="1"
      />
      <line x1="50" y1="56" x2="50" y2="64" stroke="#047857" strokeWidth="1.2" />

      {/* Antorcha Central del Saber */}
      <path
        d="M48 42 L52 42 L51 54 L49 54 Z"
        fill="url(#ibimeGoldGrad)"
      />
      {/* Copa de la antorcha */}
      <path
        d="M46 42 Q50 45 54 42 L53 38 L47 38 Z"
        fill="#D97706"
      />
      {/* Llama viva de la excelencia */}
      <path
        d="M50 25 C45 31 46 37 50 39 C54 37 55 31 50 25 Z"
        fill="url(#ibimeTorchGrad)"
        filter="drop-shadow(0 0 3px rgba(251,191,36,0.8))"
      />

      {/* 4 Estrellas de Excelencia (4 Planteles: Montes, Lagos, San Cristóbal, Coacalco) */}
      <polygon points="50,14 51.5,17 55,17 52,19.5 53,23 50,21 47,23 48,19.5 45,17 48.5,17" fill="#FDE68A" />
      <polygon points="30,30 31,32 33,32 31.5,33.5 32,35.5 30,34 28,35.5 28.5,33.5 27,32 29,32" fill="#FDE68A" />
      <polygon points="70,30 71,32 73,32 71.5,33.5 72,35.5 70,34 68,35.5 68.5,33.5 67,32 69,32" fill="#FDE68A" />
      <polygon points="50,71 50.8,72.5 52.5,72.5 51,73.5 51.5,75 50,74 48.5,75 49,73.5 47.5,72.5 49.2,72.5" fill="#FDE68A" />

      {/* Laurel de Victoria Académica */}
      <path
        d="M26 44 C25 55 32 66 42 72 M74 44 C75 55 68 66 58 72"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="2 3"
      />
    </svg>
  );

  if (variant === 'shield_only' || showText === false) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderShieldSvg(pixelDim)}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${sizeClasses} ${className}`}>
      {renderShieldSvg(pixelDim)}

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight uppercase text-emerald-800 dark:text-emerald-400 font-serif text-[1.05em]">
            IBIME
          </span>
          <span className="text-[0.62em] font-black uppercase px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 tracking-wider">
            S.C.
          </span>
        </div>

        <span className="font-extrabold text-[0.82em] tracking-normal text-slate-800 dark:text-slate-100 uppercase">
          Instituto Bilingüe
        </span>

        {variant === 'full' && (
          <span className="text-[0.62em] font-semibold text-emerald-700 dark:text-emerald-300/80 tracking-wider uppercase mt-0.5">
            Montes · Lagos · San Cristóbal · Coacalco
          </span>
        )}
      </div>
    </div>
  );
};

export default IbimeOfficialLogo;
