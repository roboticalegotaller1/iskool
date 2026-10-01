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
 * Logotipo y Escudo Oficial del Instituto Bilingüe Ibime.
 * Renderizado vectorial ultra nítido con el blasón heráldico facetado en dos tonos
 * (Rojo Escarlata Oficial #E41B14 y Carmesí Sombra #C01D0C), emblema en blanco óptico
 * con el sol/cabeza del estudiante y el libro abierto de 6 columnas fanning.
 * Portal oficial: https://ibime.edu.mx
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

  // Escudo Heráldico Vectorial Oficial Bicolor
  const renderShieldSvg = (dim: number = 44) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md select-none"
    >
      {/* Faceta Izquierda del Escudo (Rojo Escarlata Vivo Oficial #E41B14) */}
      <path
        d="M50 15 L16 24 C16 40 16 58 26 71 C35.5 82.5 46.5 88 50 89.5 L50 15 Z"
        fill="#E41B14"
      />

      {/* Faceta Derecha del Escudo (Carmesí Sombra Facetada #C01D0C) */}
      <path
        d="M50 15 L84 24 C84 40 84 58 74 71 C64.5 82.5 53.5 88 50 89.5 L50 15 Z"
        fill="#C01D0C"
      />

      {/* Borde Perimetral Sutil de Definición Óptica */}
      <path
        d="M50 15 L16 24 C16 40 16 58 26 71 C35.5 82.5 46.5 88 50 89.5 C53.5 88 64.5 82.5 74 71 C84 58 84 40 84 24 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />

      {/* Emblema Blanco: Sol / Cabeza del Estudiante */}
      <circle cx="50" cy="37" r="6" fill="#FFFFFF" />

      {/* Emblema Blanco: Cuerpo Central (Libro Abierto / Torso) */}
      {/* Hoja Central Izquierda */}
      <path d="M50 49 L39 42.5 L39 63 C43.5 65.5 47.5 68 50 71 L50 49 Z" fill="#FFFFFF" />
      {/* Hoja Central Derecha */}
      <path d="M50 49 L61 42.5 L61 63 C56.5 65.5 52.5 68 50 71 L50 49 Z" fill="#FFFFFF" />

      {/* Columnas / Páginas Fanning Izquierda */}
      <path d="M33.5 45.5 L37 43.5 L37 61.8 C35 60.8 33.5 59.5 33.5 58 Z" fill="#FFFFFF" />
      <path d="M28 47.5 L31.5 46 L31.5 60.5 C29.8 59.5 28 58 28 56.5 Z" fill="#FFFFFF" />

      {/* Columnas / Páginas Fanning Derecha */}
      <path d="M66.5 45.5 L63 43.5 L63 61.8 C65 60.8 66.5 59.5 66.5 58 Z" fill="#FFFFFF" />
      <path d="M72 47.5 L68.5 46 L68.5 60.5 C70.2 59.5 72 58 72 56.5 Z" fill="#FFFFFF" />

      {/* Hojas Inferiores Abiertas (Líneas de Base Fanning del Libro) */}
      <path
        d="M50 71 C44 67.5 35 65.5 28 64.8 C34 67 43 69.5 50 73 C57 69.5 66 67 72 64.8 C65 65.5 56 67.5 50 71 Z"
        fill="#FFFFFF"
      />
      <path
        d="M50 73.8 C43 70.8 34.5 69 29.5 67.8 C35.5 70 43.5 72 50 75.5 C56.5 72 64.5 70 70.5 67.8 C65.5 69 57 70.8 50 73.8 Z"
        fill="#FFFFFF"
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
          <span className="font-black tracking-tight uppercase text-[#E41B14] font-sans text-[1.1em]">
            IBIME
          </span>
          <span className="text-[0.62em] font-black uppercase px-1.5 py-0.5 rounded-sm bg-[#0F2744] text-white tracking-wider shadow-2xs">
            S.C.
          </span>
        </div>

        <span className="font-extrabold text-[0.82em] tracking-normal text-[#0F2744] dark:text-slate-100 uppercase">
          Instituto Bilingüe
        </span>

        {variant === 'full' && (
          <span className="text-[0.62em] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
            ibime.edu.mx · Montes · Lagos · San Cristóbal · Coacalco
          </span>
        )}
      </div>
    </div>
  );
};

export default IbimeOfficialLogo;
