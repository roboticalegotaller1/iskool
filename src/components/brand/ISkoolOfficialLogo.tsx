"use client";

import React from 'react';
import { WORDMARK_FONT_CLASS } from './wordmarkFont';

export interface ISkoolOfficialLogoProps {
  variant?: 'emblem_only' | 'horizontal' | 'stacked' | 'badge';
  theme?: 'dark' | 'light' | 'auto' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

const SIZES = { xs: 24, sm: 32, md: 44, lg: 60, xl: 84, '2xl': 120 } as const;

const TAGLINE = 'Inteligencia para instituciones educativas';
// Por debajo de esta altura el lema ya no cabe ni se lee junto al logotipo.
const TAGLINE_MIN_SIZE = 40;

const WORD_COLOR = {
  dark: 'text-white',
  light: 'text-[#0B1B3F]',
  auto: 'text-[#0B1B3F] dark:text-white',
  monochrome: '',
} as const;

const TAGLINE_COLOR = {
  dark: 'text-white/70',
  light: 'text-[#4A5B7A]',
  auto: 'text-[#4A5B7A] dark:text-white/70',
  monochrome: 'opacity-70',
} as const;

// Monocromo: la "i" se recorta del cuadro para dejar ver el fondo.
const MONOCHROME_MARK =
  'M14 0H50A14 14 0 0 1 64 14V50A14 14 0 0 1 50 64H14A14 14 0 0 1 0 50V14A14 14 0 0 1 14 0Z' +
  'M32 26a6 6 0 0 1 6 6v14a6 6 0 0 1-12 0V32a6 6 0 0 1 6-6Z' +
  'M32 8.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Z';

/**
 * Logotipo oficial de ISkool: la palabra "iSkool®" y, donde no cabe, su cuadro con la "i".
 * `size` es la altura aproximada que ocupa en pixeles.
 */
export const ISkoolOfficialLogo: React.FC<ISkoolOfficialLogoProps> = ({
  variant = 'horizontal',
  theme = 'auto',
  size = 'md',
  showTagline = true,
  className = '',
  glow = false
}) => {
  const pixelDim = typeof size === 'number' ? size : SIZES[size] ?? SIZES.md;
  const glowClass = glow ? 'drop-shadow-[0_0_15px_rgba(47,155,255,0.4)]' : '';

  if (variant === 'emblem_only' || variant === 'badge') {
    return (
      <span
        role="img"
        aria-label="ISkool"
        data-logo-part="mark"
        className={`inline-flex shrink-0 select-none ${glowClass} ${className}`}
      >
        <svg aria-hidden="true" width={pixelDim} height={pixelDim} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          {theme === 'monochrome' ? (
            <path d={MONOCHROME_MARK} fill="currentColor" fillRule="evenodd" />
          ) : (
            <>
              <rect width="64" height="64" rx="14" fill="#0B1B3F" />
              <rect x="26" y="26" width="12" height="26" rx="6" fill="#2F9BFF" />
              <circle cx="32" cy="15" r="6.5" fill="#2F9BFF" />
            </>
          )}
        </svg>
      </span>
    );
  }

  const stacked = variant === 'stacked';
  const withTagline = showTagline && pixelDim >= TAGLINE_MIN_SIZE;
  // En horizontal, palabra y lema comparten la altura del logotipo.
  const fontSize = Math.round(withTagline && !stacked ? pixelDim * 0.72 : pixelDim);
  const wordColor = WORD_COLOR[theme];

  return (
    <span
      role="img"
      aria-label="ISkool"
      className={`inline-flex shrink-0 select-none flex-col leading-none ${stacked ? 'items-center text-center' : 'text-left'} ${glowClass} ${className}`}
    >
      <span
        aria-hidden="true"
        data-logo-part="wordmark"
        className={`whitespace-nowrap font-bold tracking-[-0.045em] ${WORDMARK_FONT_CLASS}`}
        style={{ fontSize }}
      >
        <span className={theme === 'monochrome' ? '' : 'text-[#2F9BFF]'}>i</span>
        <span className={wordColor}>Skool</span>
        <span className={`relative -top-[1.6em] ml-[0.2em] inline-block text-[0.3em] tracking-normal ${wordColor}`}>®</span>
      </span>
      {withTagline && (
        <span
          aria-hidden="true"
          data-logo-part="tagline"
          className={`mt-1 font-semibold uppercase leading-[1.3] tracking-[0.18em] ${stacked ? '' : 'whitespace-nowrap'} ${TAGLINE_COLOR[theme]}`}
          style={{ fontSize: Math.max(9, Math.round(fontSize * 0.2)) }}
        >
          {TAGLINE}
        </span>
      )}
    </span>
  );
};
