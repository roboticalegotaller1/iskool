"use client";

import React from 'react';
import { ClothingItem } from './avatarCustomizationTypes';

/**
 * 1. Previsualizador Vectorial de Estilos de Ojos Anime
 */
export const EyePreviewSvg: React.FC<{ styleId: string; color?: string }> = ({ 
  styleId, 
  color = '#3B82F6' 
}) => {
  const isWink = styleId === 'wink';
  const isCheerful = styleId === 'cheerful';
  const isCat = styleId === 'cat_eyes';
  const isHetero = styleId === 'heterochromia';
  const isSparkle = styleId === 'sparkle';
  const isFlame = styleId === 'flame';
  const isLightning = styleId === 'lightning';

  const irisColor = isFlame ? '#EF4444' : isLightning ? '#06B6D4' : color;
  const rightIrisColor = isHetero ? '#F59E0B' : irisColor;

  return (
    <svg viewBox="0 0 54 28" className="w-full h-full">
      <defs>
        <radialGradient id={`eyeGlow-${styleId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor={irisColor} />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
      </defs>

      {/* Ojo Izquierdo */}
      {isCheerful ? (
        <path d="M 6,18 Q 16,6 24,18" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : isWink ? (
        <path d="M 6,17 Q 15,22 23,16" stroke="#1E293B" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          {/* Esclerótica (blanco del ojo) */}
          <ellipse cx="15" cy="15" rx="9" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Iris */}
          <ellipse cx="15" cy="15" rx="6.5" ry="7" fill={`url(#eyeGlow-${styleId})`} />
          {/* Pupila */}
          {isCat ? (
            <ellipse cx="15" cy="15" rx="1.5" ry="6" fill="#000000" />
          ) : (
            <circle cx="15" cy="15" r="3.2" fill="#000000" />
          )}
          {/* Destello estelar o reflejo */}
          {isSparkle ? (
            <polygon points="15,11 16,14 19,15 16,16 15,19 14,16 11,15 14,14" fill="#FFFFFF" />
          ) : (
            <>
              <circle cx="17.5" cy="12" r="2.2" fill="#FFFFFF" />
              <circle cx="12.5" cy="17" r="1.2" fill="#FFFFFF" />
            </>
          )}
          {/* Párpado superior estilo anime */}
          <path d="M 5,12 Q 15,7 24,11" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Ojo Derecho */}
      {isCheerful ? (
        <path d="M 30,18 Q 40,6 48,18" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          {/* Esclerótica */}
          <ellipse cx="39" cy="15" rx="9" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Iris */}
          <ellipse cx="39" cy="15" rx="6.5" ry="7" fill={rightIrisColor} />
          {/* Pupila */}
          {isCat ? (
            <ellipse cx="39" cy="15" rx="1.5" ry="6" fill="#000000" />
          ) : (
            <circle cx="39" cy="15" r="3.2" fill="#000000" />
          )}
          {/* Reflejos */}
          <circle cx="41.5" cy="12" r="2.2" fill="#FFFFFF" />
          <circle cx="36.5" cy="17" r="1.2" fill="#FFFFFF" />
          {/* Párpado superior */}
          <path d="M 30,11 Q 39,7 49,12" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Cejas sutiles arriba */}
      <path d="M 7,6 Q 15,3 23,6" stroke="#475569" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 31,6 Q 39,3 47,6" stroke="#475569" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 2. Previsualizador Vectorial de Siluetas de Peinados Anime
 */
export const HairPreviewSvg: React.FC<{ styleId: string; color?: string }> = ({ 
  styleId, 
  color = '#EC4899' 
}) => {
  return (
    <svg viewBox="0 0 54 54" className="w-full h-full">
      {/* Cabeza base detrás */}
      <circle cx="27" cy="30" r="14" fill="#FED7AA" opacity="0.65" />
      
      {/* Siluetas de Peinado según estilo */}
      {styleId === 'spiky' && (
        <path d="M 12,32 L 18,14 L 24,24 L 32,8 L 38,24 L 44,14 L 48,32 Q 44,24 27,24 Q 14,24 12,32 Z" fill={color} />
      )}

      {styleId === 'short_clean' && (
        <path d="M 12,30 Q 27,14 42,30 L 43,36 Q 27,26 11,36 Z" fill={color} />
      )}

      {styleId === 'sidecut' && (
        <g>
          <path d="M 14,32 Q 22,12 40,12 Q 46,18 46,32 Q 38,24 22,26 Z" fill={color} />
          <line x1="12" y1="28" x2="16" y2="28" stroke={color} strokeWidth="1.5" opacity="0.6" />
          <line x1="11" y1="32" x2="15" y2="32" stroke={color} strokeWidth="1.5" opacity="0.6" />
        </g>
      )}

      {styleId === 'shaggy' && (
        <path d="M 12,28 L 17,38 L 22,28 L 27,42 L 32,28 L 37,40 L 42,28 L 46,36 L 46,24 Q 27,16 12,24 Z" fill={color} />
      )}

      {styleId === 'bob' && (
        <path d="M 12,26 Q 27,16 42,26 L 44,42 Q 38,42 37,30 Q 27,28 17,30 Q 16,42 10,42 Z" fill={color} />
      )}

      {styleId === 'pixie' && (
        <path d="M 12,28 L 18,34 L 24,24 L 30,35 L 36,24 L 42,34 L 44,28 Q 27,14 12,28 Z" fill={color} />
      )}

      {styleId === 'afro' && (
        <circle cx="27" cy="25" r="20" fill={color} />
      )}

      {styleId === 'dreadlocks' && (
        <g fill={color}>
          <path d="M 12,26 L 15,44 L 19,43 L 17,28 Z" />
          <path d="M 19,26 L 22,46 L 26,45 L 24,28 Z" />
          <path d="M 28,28 L 30,46 L 34,45 L 33,26 Z" />
          <path d="M 35,28 L 38,44 L 42,43 L 40,26 Z" />
          <circle cx="17" cy="40" r="1.5" fill="#F59E0B" />
          <circle cx="32" cy="42" r="1.5" fill="#F59E0B" />
        </g>
      )}

      {styleId === 'ponytail' && (
        <g fill={color}>
          <path d="M 14,28 Q 27,18 40,28 L 40,34 Q 27,26 14,34 Z" />
          <path d="M 32,22 Q 48,10 50,34 Q 42,30 34,26 Z" />
          <circle cx="34" cy="22" r="3" fill="#EF4444" />
        </g>
      )}

      {styleId === 'twin_braids' && (
        <g fill={color}>
          <path d="M 14,26 Q 27,18 40,26 L 40,32 Q 27,24 14,32 Z" />
          <path d="M 14,32 Q 8,42 10,48 L 14,48 Q 12,42 18,34 Z" />
          <path d="M 40,32 Q 46,42 44,48 L 40,48 Q 42,42 36,34 Z" />
          <circle cx="12" cy="47" r="2" fill="#EC4899" />
          <circle cx="42" cy="47" r="2" fill="#EC4899" />
        </g>
      )}

      {styleId === 'space_buns' && (
        <g fill={color}>
          <path d="M 14,28 Q 27,20 40,28 L 40,34 Q 27,26 14,34 Z" />
          <circle cx="16" cy="18" r="7" />
          <circle cx="38" cy="18" r="7" />
        </g>
      )}

      {styleId === 'bantu_knots' && (
        <g fill={color}>
          <path d="M 14,28 Q 27,20 40,28 L 40,32 Q 27,24 14,32 Z" />
          <circle cx="18" cy="22" r="4.5" />
          <circle cx="27" cy="16" r="5" />
          <circle cx="36" cy="22" r="4.5" />
        </g>
      )}

      {styleId === 'straight_long' && (
        <path d="M 14,26 Q 27,18 40,26 L 42,48 L 38,48 L 37,32 Q 27,28 17,32 L 16,48 L 12,48 Z" fill={color} />
      )}

      {styleId === 'wavy_long' && (
        <path d="M 14,26 Q 27,18 40,26 Q 48,36 42,48 Q 38,36 38,30 Q 27,26 16,30 Q 16,36 12,48 Q 6,36 14,26 Z" fill={color} />
      )}

      {styleId === 'witch_curls' && (
        <g fill={color}>
          <path d="M 14,26 Q 27,16 40,26 L 40,32 Q 27,24 14,32 Z" />
          <path d="M 14,30 Q 6,40 12,46 Q 16,42 16,34 Z" />
          <path d="M 40,30 Q 48,40 42,46 Q 38,42 38,34 Z" />
        </g>
      )}

      {styleId === 'wild_mane' && (
        <path d="M 10,26 L 16,10 L 24,24 L 32,8 L 40,24 L 46,10 L 50,26 Q 38,20 27,20 Q 16,20 10,26 Z" fill={color} />
      )}
    </svg>
  );
};

/**
 * 3. Previsualizador Vectorial de Mechón de Color de Cabello
 */
export const HairColorPreviewSvg: React.FC<{ color: string; isSelected?: boolean }> = ({ 
  color, 
  isSelected = false 
}) => {
  return (
    <svg viewBox="0 0 44 44" className="w-full h-full">
      <defs>
        <linearGradient id={`hairGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Fondo redondo */}
      <circle cx="22" cy="22" r="18" fill={`url(#hairGrad-${color.replace('#', '')})`} stroke="#FFFFFF" strokeWidth="2" className="drop-shadow-sm" />
      
      {/* Mechón ondulado brillante en el centro */}
      <path 
        d="M 16,12 Q 26,16 22,26 Q 18,34 26,36" 
        stroke="#FFFFFF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.8" 
      />

      {isSelected && (
        <circle cx="22" cy="22" r="8" fill="#10B981">
          <path d="M 18,22 L 21,25 L 26,19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </circle>
      )}
    </svg>
  );
};

/**
 * 4. Previsualizador Vectorial de Tonos de Piel Anime
 */
export const SkinTonePreviewSvg: React.FC<{ toneColor: string }> = ({ toneColor }) => {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      {/* Rostro chibi redondeado más amplio y visible */}
      <ellipse cx="24" cy="24" rx="18" ry="19" fill={toneColor} stroke="#000000" strokeOpacity="0.15" strokeWidth="1.2" />
      {/* Orejitas laterales */}
      <ellipse cx="6" cy="25" rx="3.5" ry="4.5" fill={toneColor} />
      <ellipse cx="42" cy="25" rx="3.5" ry="4.5" fill={toneColor} />
      {/* Mejillas rosadas */}
      <circle cx="15" cy="28" r="3.5" fill="#F43F5E" opacity="0.45" />
      <circle cx="33" cy="28" r="3.5" fill="#F43F5E" opacity="0.45" />
      {/* Ojos cerrados sonrientes */}
      <path d="M 13,22 Q 17,17 21,22" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 27,22 Q 31,17 35,22" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Boca sonriente */}
      <path d="M 21,30 Q 24,34 27,30" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 5. Previsualizador Vectorial de Rasgos Fantásticos / Razas
 */
export const RaceFeaturePreviewSvg: React.FC<{ featureId: string; skinColor?: string; hairColor?: string }> = ({
  featureId,
  skinColor = '#FED7AA',
  hairColor = '#EC4899'
}) => {
  return (
    <svg viewBox="0 0 52 52" className="w-full h-full">
      {/* Silueta de Cabeza Base */}
      <circle cx="26" cy="30" r="14" fill={skinColor} opacity="0.8" />
      
      {featureId === 'human' && (
        <g>
          <ellipse cx="12" cy="30" rx="3.5" ry="5" fill={skinColor} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.2" />
          <ellipse cx="40" cy="30" rx="3.5" ry="5" fill={skinColor} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.2" />
        </g>
      )}

      {(featureId === 'elf_long' || featureId === 'elf_short') && (
        <g>
          <polygon points="13,31 2,18 14,24" fill={skinColor} stroke="#000000" strokeWidth="0.8" strokeOpacity="0.25" />
          <polygon points="39,31 50,18 38,24" fill={skinColor} stroke="#000000" strokeWidth="0.8" strokeOpacity="0.25" />
        </g>
      )}

      {featureId === 'cat_ears' && (
        <g>
          <polygon points="14,22 8,6 22,16" fill={hairColor} />
          <polygon points="14,20 11,9 20,17" fill="#F472B6" />
          <polygon points="38,22 44,6 30,16" fill={hairColor} />
          <polygon points="38,20 41,9 32,17" fill="#F472B6" />
        </g>
      )}

      {featureId === 'wolf_ears' && (
        <g>
          <polygon points="15,22 7,8 21,16" fill="#4B5563" />
          <polygon points="15,20 10,11 19,16" fill="#D1D5DB" />
          <polygon points="37,22 45,8 31,16" fill="#4B5563" />
          <polygon points="37,20 42,11 33,16" fill="#D1D5DB" />
        </g>
      )}

      {featureId === 'bunny_ears' && (
        <g>
          <ellipse cx="18" cy="14" rx="4" ry="12" fill="#FFFFFF" stroke="#E2E8F0" />
          <ellipse cx="18" cy="14" rx="2" ry="8" fill="#F472B6" />
          <ellipse cx="34" cy="14" rx="4" ry="12" fill="#FFFFFF" stroke="#E2E8F0" />
          <ellipse cx="34" cy="14" rx="2" ry="8" fill="#F472B6" />
        </g>
      )}

      {featureId === 'dragon_horns' && (
        <g>
          <path d="M 16,22 Q 6,6 12,2 Q 18,10 20,20" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M 36,22 Q 46,6 40,2 Q 34,10 32,20" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        </g>
      )}

      {featureId === 'demon_horns' && (
        <g>
          <path d="M 16,22 Q 6,10 10,4 Q 18,12 20,20" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <path d="M 36,22 Q 46,10 42,4 Q 34,12 32,20" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
        </g>
      )}

      {featureId === 'angel_halo' && (
        <g>
          <ellipse cx="26" cy="10" rx="18" ry="4.5" fill="none" stroke="#FDE047" strokeWidth="3" />
          <ellipse cx="26" cy="10" rx="18" ry="4.5" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      )}

      {featureId === 'fairy_wings' && (
        <g opacity="0.8">
          <path d="M 18,28 C -2,12 -4,34 16,36 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1" />
          <path d="M 34,28 C 54,12 56,34 36,36 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1" />
        </g>
      )}

      {featureId === 'crystal_crown' && (
        <g fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8">
          <polygon points="26,8 23,18 29,18" />
          <polygon points="18,12 16,20 22,20" />
          <polygon points="34,12 30,20 36,20" />
        </g>
      )}

      {featureId === 'rune_tattoo' && (
        <g stroke="#EC4899" strokeWidth="1.5" fill="none">
          <path d="M 15,31 L 18,34 L 15,37" />
          <path d="M 37,31 L 34,34 L 37,37" />
          <circle cx="26" cy="20" r="1.5" fill="#EC4899" />
        </g>
      )}

      {featureId === 'cosmic_antennae' && (
        <g>
          <path d="M 21,20 Q 16,10 14,11" stroke="#A855F7" strokeWidth="1.8" fill="none" />
          <circle cx="13" cy="10" r="2.5" fill="#38BDF8" />
          <path d="M 31,20 Q 36,10 38,11" stroke="#A855F7" strokeWidth="1.8" fill="none" />
          <circle cx="39" cy="10" r="2.5" fill="#38BDF8" />
        </g>
      )}

      {featureId === 'merfolk_fins' && (
        <g fill="#2DD4BF" stroke="#0F766E" strokeWidth="0.8">
          <path d="M 12,25 Q 2,20 4,32 Q 8,30 12,32 Z" />
          <path d="M 40,25 Q 50,20 48,32 Q 44,30 40,32 Z" />
        </g>
      )}

      {featureId === 'stag_antlers' && (
        <g stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M 18,22 L 14,10 L 8,6 M 14,10 L 18,6" />
          <path d="M 34,22 L 38,10 L 44,6 M 38,10 L 34,6" />
        </g>
      )}
    </svg>
  );
};

/**
 * 6. Previsualizador Vectorial de Prendas, Calzado, Sombreros y Accesorios
 */
export const ClothingItemPreviewSvg: React.FC<{ item: ClothingItem }> = ({ item }) => {
  const { id } = item;

  // --- PLAYERAS Y TOPS ---
  if (id === 'top_basic') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,12 32,12 30,34 14,34" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M 12,12 L 6,18 L 10,22 L 13,16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
        <path d="M 32,12 L 38,18 L 34,22 L 31,16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
        <path d="M 19,12 Q 22,16 25,12" stroke="#64748B" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }

  if (id === 'top_school_blouse') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,12 32,12 30,34 14,34" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <path d="M 12,12 L 6,18 L 10,22 L 13,16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M 32,12 L 38,18 L 34,22 L 31,16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        {/* Corbata azul */}
        <polygon points="22,14 19,18 25,18" fill="#2563EB" />
        <polygon points="22,18 20,28 22,30 24,28" fill="#1D4ED8" />
      </svg>
    );
  }

  if (id === 'top_rune_tshirt') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,12 32,12 30,34 14,34" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
        <polygon points="22,18 19,25 25,25" fill="#F59E0B" />
        <circle cx="22" cy="27" r="1.5" fill="#F59E0B" />
      </svg>
    );
  }

  if (id === 'top_alchemist_vest') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,12 32,12 30,34 14,34" fill="#78350F" stroke="#451A03" strokeWidth="1.2" />
        {/* Frasco de poción en el chaleco */}
        <rect x="18" y="20" width="8" height="10" rx="3" fill="#10B981" stroke="#065F46" strokeWidth="0.8" />
        <rect x="20" y="18" width="4" height="2" fill="#D97706" />
      </svg>
    );
  }

  if (id === 'top_celestial_robe') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,10 32,10 34,36 10,36" fill="#4C1D95" stroke="#F59E0B" strokeWidth="1.5" />
        <path d="M 12,10 L 4,24 L 10,26 L 14,16" fill="#4C1D95" stroke="#F59E0B" strokeWidth="1" />
        <path d="M 32,10 L 40,24 L 34,26 L 30,16" fill="#4C1D95" stroke="#F59E0B" strokeWidth="1" />
        <polygon points="22,16 23,20 27,21 24,23 25,27 22,25 19,27 20,23 17,21 21,20" fill="#FDE047" />
      </svg>
    );
  }

  // --- PANTALONES / FALDAS ---
  if (id === 'bottom_basic') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 14,10 L 30,10 L 28,34 L 23,34 L 22,20 L 21,34 L 16,34 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
        <rect x="14" y="10" width="16" height="2.5" fill="#475569" />
      </svg>
    );
  }

  if (id === 'bottom_blue_jeans') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 14,10 L 30,10 L 28,34 L 23,34 L 22,20 L 21,34 L 16,34 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
        <rect x="14" y="10" width="16" height="2.5" fill="#78350F" />
        <rect x="20.5" y="9.5" width="3" height="3.5" rx="0.5" fill="#F59E0B" />
      </svg>
    );
  }

  if (id === 'bottom_witch_skirt') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 16,12 L 28,12 L 36,32 Q 22,35 8,32 Z" fill="#3B0764" stroke="#2E1065" strokeWidth="1.2" />
        <rect x="16" y="12" width="12" height="2" fill="#DB2777" />
        <circle cx="22" cy="13" r="1.5" fill="#FDE047" />
      </svg>
    );
  }

  if (id === 'bottom_sorcerer_pants') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 13,10 L 31,10 L 32,32 L 25,32 L 22,18 L 19,32 L 12,32 Z" fill="#831843" stroke="#500724" strokeWidth="1" />
        <rect x="13" y="10" width="18" height="3" fill="#F59E0B" />
      </svg>
    );
  }

  // --- CALZADO ---
  if (id === 'shoes_basic' || id === 'shoes_sneakers') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <ellipse cx="16" cy="24" rx="8" ry="5" fill={id === 'shoes_sneakers' ? "#DC2626" : "#1E293B"} stroke="#0F172A" strokeWidth="0.8" />
        <ellipse cx="28" cy="24" rx="8" ry="5" fill={id === 'shoes_sneakers' ? "#DC2626" : "#1E293B"} stroke="#0F172A" strokeWidth="0.8" />
        {id === 'shoes_sneakers' && (
          <>
            <path d="M 12,24 L 20,24" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M 24,24 L 32,24" stroke="#FFFFFF" strokeWidth="1.2" />
          </>
        )}
      </svg>
    );
  }

  if (id === 'shoes_witch_boots') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 12,16 L 18,16 L 19,28 L 10,28 Z" fill="#581C87" />
        <path d="M 26,16 L 32,16 L 34,28 L 25,28 Z" fill="#581C87" />
        <rect x="13" y="22" width="4" height="2" fill="#F59E0B" />
        <rect x="27" y="22" width="4" height="2" fill="#F59E0B" />
      </svg>
    );
  }

  // --- CAPAS Y CHAMARRAS ---
  if (id === 'outerwear_witch_cloak' || id === 'outerwear_archmage_cape') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 16,10 Q 22,14 28,10 L 36,36 Q 22,34 8,36 Z" fill={id === 'outerwear_archmage_cape' ? "#4C1D95" : "#31184A"} stroke="#F59E0B" strokeWidth="1" />
        <circle cx="22" cy="13" r="2.5" fill="#FDE047" />
      </svg>
    );
  }

  if (id === 'outerwear_hoodie') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="12,12 32,12 30,34 14,34" fill="#0284C7" stroke="#0369A1" strokeWidth="1.2" />
        <path d="M 18,14 Q 22,22 26,14" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  // --- SOMBREROS ---
  if (id === 'hat_witch') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <ellipse cx="22" cy="30" rx="18" ry="5" fill="#3B185F" stroke="#2A0845" strokeWidth="1" />
        <path d="M 12,28 Q 20,8 30,6 Q 32,20 32,28 Z" fill="#3B185F" stroke="#2A0845" strokeWidth="1" />
        <ellipse cx="22" cy="28" rx="10" ry="3" fill="#DB2777" />
        <polygon points="22,24 23,26 25,26 23,27 24,29 22,28 20,29 21,27 19,26 21,26" fill="#FDE047" />
      </svg>
    );
  }

  if (id === 'hat_urban_cap') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 12,28 Q 22,14 32,28 L 40,29 L 30,31 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.2" />
      </svg>
    );
  }

  if (id === 'hat_guild_crown') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <polygon points="10,28 14,14 20,22 22,10 24,22 30,14 34,28" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
        <circle cx="22" cy="18" r="2" fill="#EF4444" />
      </svg>
    );
  }

  // --- ACCESORIOS (VARITAS, GRIMORIOS, LENTES) ---
  if (id === 'acc_magic_wand' || id === 'acc_wand_and_book') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <line x1="12" y1="32" x2="30" y2="14" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="14" r="4.5" fill="#F59E0B" />
        <polygon points="30,8 31,12 35,13 32,15 33,19 30,17 27,19 28,15 25,13 29,12" fill="#FDE047" />
      </svg>
    );
  }

  if (id === 'acc_spellbook') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <path d="M 22,14 L 10,18 L 10,32 L 22,28 Z" fill="#78350F" stroke="#D97706" strokeWidth="1" />
        <path d="M 22,14 L 34,18 L 34,32 L 22,28 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
        <text x="14" y="25" fill="#DB2777" fontSize="8" fontWeight="bold">ᚱ</text>
        <text x="26" y="25" fill="#38BDF8" fontSize="8" fontWeight="bold">✦</text>
      </svg>
    );
  }

  if (id === 'acc_scholar_glasses') {
    return (
      <svg viewBox="0 0 44 44" className="w-full h-full">
        <circle cx="16" cy="22" r="7" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="28" cy="22" r="7" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <line x1="23" y1="22" x2="21" y2="22" stroke="#F59E0B" strokeWidth="2" />
      </svg>
    );
  }

  // Fallback con emoji
  return (
    <div className="w-full h-full flex items-center justify-center text-2xl">
      {item.badgeEmoji || '✨'}
    </div>
  );
};
