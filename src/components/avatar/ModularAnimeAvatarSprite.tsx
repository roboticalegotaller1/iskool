"use client";

import React from 'react';
import { 
  AvatarGender, 
  AvatarBodyScale, 
  AvatarAnimationState, 
  AVATAR_SKIN_TONES, 
  AVATAR_HAIR_COLORS 
} from './avatarCustomizationTypes';

export interface ModularAnimeAvatarSpriteProps {
  gender?: AvatarGender | string;
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  eyesStyle?: string;
  raceFeature?: string;
  bodyScale?: AvatarBodyScale;
  equippedShoes?: string;
  equippedBottom?: string;
  equippedTop?: string;
  equippedOuterwear?: string;
  equippedHat?: string;
  equippedAccessory?: string;
  animationState?: AvatarAnimationState;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const ModularAnimeAvatarSprite: React.FC<ModularAnimeAvatarSpriteProps> = ({
  gender = 'female',
  skinTone = 'light',
  hairStyle = 'witch_curls',
  hairColor = 'pink',
  eyesStyle = 'mysterious',
  raceFeature = 'human',
  bodyScale = 'normal',
  equippedShoes = 'shoes_witch_boots',
  equippedBottom = 'bottom_witch_skirt',
  equippedTop = 'top_school_blouse',
  equippedOuterwear = 'outerwear_witch_cloak',
  equippedHat = 'hat_witch',
  equippedAccessory = 'acc_wand_and_book',
  animationState = 'idle',
  width,
  height,
  className = 'w-full h-full'
}) => {

  // Resolver color de piel
  const resolveSkinColor = (tone: string) => {
    const matched = AVATAR_SKIN_TONES.find(t => t.id === tone);
    if (matched?.value) return matched.value;
    const presets: Record<string, string> = {
      'light': '#FED7AA',
      'medium': '#FDBA74',
      'dark': '#92400E',
      'pale': '#FFF1F2',
      'porcelain': '#FFF1F2',
      'wood_elf': '#A7F3D0',
      'glacial_ice': '#CFFAFE'
    };
    return presets[tone] || tone || '#FED7AA';
  };

  // Resolver color de cabello
  const resolveHairColor = (color: string) => {
    const matched = AVATAR_HAIR_COLORS.find(c => c.id === color);
    if (matched?.value) return matched.value;
    const presets: Record<string, string> = {
      'pink': '#EC4899',
      'brown': '#78350F',
      'yellow': '#FBBF24',
      'black': '#111827',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'silver': '#E2E8F0',
      'purple': '#8B5CF6',
      'green': '#10B981',
      'cyan': '#06B6D4'
    };
    return presets[color] || color || '#EC4899';
  };

  const skin = resolveSkinColor(skinTone);
  const hair = resolveHairColor(hairColor);

  const isCasting = animationState === 'cast';
  const isCheering = animationState === 'cheer';

  // Escala del cuerpo
  const scaleValue = bodyScale === 'compact' ? 0.92 : bodyScale === 'tall' ? 1.08 : 1.0;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ 
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined, 
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined 
      }}
    >
      <svg
        viewBox="0 0 160 150"
        className="w-full h-full overflow-visible"
        style={{ transform: `scale(${scaleValue})`, transformOrigin: 'bottom center' }}
      >
        <defs>
          {/* Brillo para orbe de poder y hechizos */}
          <filter id="spellGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="energyOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F472B6" />
            <stop offset="80%" stopColor="#DB2777" />
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform="translate(10, 8)">
          {/* 1. SOMBRA BASE EN EL SUELO */}
          <ellipse cx="65" cy="126" rx="28" ry="6" fill="#000000" opacity="0.35" />

          {/* 2. CAPA / CABELLO TRASERO / ALAS */}
          <g id="layer-back">
          {/* Capa de Bruja Trasera */}
          {(equippedOuterwear === 'outerwear_witch_cloak' || equippedOuterwear === 'outerwear_archmage_cape') && (
            <path
              d={isCasting 
                ? "M 48,65 Q 20,85 15,115 Q 65,125 105,115 Q 95,85 78,65 Z"
                : "M 48,65 Q 26,90 28,118 Q 65,124 98,118 Q 98,90 78,65 Z"
              }
              fill={equippedOuterwear === 'outerwear_archmage_cape' ? "#4C1D95" : "#31184A"}
              stroke="#581C87"
              strokeWidth="1.5"
            />
          )}

          {/* Alas de Hada */}
          {raceFeature === 'fairy_wings' && (
            <g className="animate-pulse">
              <path d="M 50,60 C 20,35 15,65 48,72 Z" fill="#93C5FD" opacity="0.6" />
              <path d="M 76,60 C 106,35 111,65 78,72 Z" fill="#93C5FD" opacity="0.6" />
            </g>
          )}

          {/* Cabello Trasero */}
          {(hairStyle === 'wavy_long' || hairStyle === 'witch_curls' || hairStyle === 'straight_long' || hairStyle === 'dreadlocks' || hairStyle === 'wild_mane') && (
            <path
              d={isCasting 
                ? "M 45,35 Q 22,65 24,98 Q 63,105 100,98 Q 104,65 81,35 Z"
                : "M 45,35 Q 28,65 30,95 Q 63,100 96,95 Q 98,65 81,35 Z"
              }
              fill={hair}
              className={isCasting ? "animate-pulse" : ""}
            />
          )}
          {hairStyle === 'ponytail' && (
            <path d="M 68,32 Q 95,20 100,55 Q 85,50 72,40 Z" fill={hair} />
          )}
          {hairStyle === 'twin_braids' && (
            <>
              <path d="M 44,40 Q 28,65 32,90 Q 36,90 40,75 Z" fill={hair} />
              <path d="M 82,40 Q 98,65 94,90 Q 90,90 86,75 Z" fill={hair} />
            </>
          )}
        </g>

        {/* 3. CUERPO Y PIERNAS */}
        <g id="layer-body">
          {/* Piernas con piel o medias */}
          <rect 
            x="50" 
            y="90" 
            width="8" 
            height="28" 
            rx="3" 
            fill={equippedBottom === 'bottom_witch_skirt' ? "#1E293B" : skin} 
          />
          <rect 
            x="68" 
            y="90" 
            width="8" 
            height="28" 
            rx="3" 
            fill={equippedBottom === 'bottom_witch_skirt' ? "#1E293B" : skin} 
          />

          {/* ZAPATOS */}
          <g id="layer-shoes">
            {equippedShoes === 'shoes_witch_boots' && (
              <>
                <path d="M 47,110 L 59,110 L 61,124 L 43,124 Z" fill="#581C87" stroke="#3B0764" strokeWidth="1" />
                <rect x="49" y="114" width="8" height="3" fill="#F59E0B" />
                <path d="M 65,110 L 77,110 L 83,124 L 65,124 Z" fill="#581C87" stroke="#3B0764" strokeWidth="1" />
                <rect x="67" y="114" width="8" height="3" fill="#F59E0B" />
              </>
            )}
            {equippedShoes === 'shoes_sneakers' && (
              <>
                <rect x="46" y="116" width="13" height="8" rx="3" fill="#EF4444" stroke="#DC2626" />
                <rect x="45" y="122" width="15" height="3" rx="1" fill="#FFFFFF" />
                <rect x="67" y="116" width="13" height="8" rx="3" fill="#EF4444" stroke="#DC2626" />
                <rect x="66" y="122" width="15" height="3" rx="1" fill="#FFFFFF" />
              </>
            )}
            {equippedShoes === 'shoes_basic' && (
              <>
                <ellipse cx="52" cy="122" rx="7" ry="4" fill="#3F3F46" />
                <ellipse cx="74" cy="122" rx="7" ry="4" fill="#3F3F46" />
              </>
            )}
          </g>

          {/* PANTALÓN O FALDA */}
          <g id="layer-bottom">
            {equippedBottom === 'bottom_witch_skirt' && (
              <path 
                d="M 45,78 L 81,78 L 90,95 L 36,95 Z" 
                fill="#1E3A8A" 
                stroke="#172554" 
                strokeWidth="1.5" 
              />
            )}
            {equippedBottom === 'bottom_blue_jeans' && (
              <path 
                d="M 46,78 L 80,78 L 78,114 L 69,114 L 63,88 L 57,114 L 48,114 Z" 
                fill="#2563EB" 
                stroke="#1D4ED8" 
                strokeWidth="1" 
              />
            )}
            {equippedBottom === 'bottom_basic' && (
              <path 
                d="M 46,78 L 80,78 L 78,115 L 69,115 L 63,88 L 57,115 L 48,115 Z" 
                fill="#18181B" 
                stroke="#27272A" 
                strokeWidth="1" 
              />
            )}
          </g>

          {/* TORSO / PLAYERA O CAMISA */}
          <g id="layer-top">
            {/* Pecho base */}
            <rect x="47" y="58" width="32" height="24" rx="4" fill={skin} />
            {equippedTop === 'top_school_blouse' && (
              <>
                <polygon points="46,58 80,58 78,80 48,80" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                {/* Cuello y corbata / moño rojo */}
                <polygon points="63,58 58,64 68,64" fill="#EF4444" />
                <polygon points="63,64 60,74 63,78 66,74" fill="#DC2626" />
              </>
            )}
            {equippedTop === 'top_basic' && (
              <polygon points="46,58 80,58 78,80 48,80" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
            )}
            {equippedTop === 'top_rune_tshirt' && (
              <>
                <polygon points="46,58 80,58 78,80 48,80" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
                <polygon points="63,65 60,72 66,72" fill="#F59E0B" />
              </>
            )}
          </g>

          {/* PRENDA EXTERIOR: CHALECO, HOODIE O CAPA */}
          <g id="layer-outerwear-front">
            {equippedOuterwear === 'outerwear_witch_cloak' && (
              <>
                {/* Chaleco y mangas amplias de hechicera */}
                <path d="M 45,60 L 53,80 L 46,80 L 41,64 Z" fill="#4A1D75" />
                <path d="M 81,60 L 73,80 L 80,80 L 85,64 Z" fill="#4A1D75" />
                {/* Mangas acampanadas */}
                <path d={isCasting ? "M 80,62 L 105,68 L 100,78 L 76,70 Z" : "M 78,64 L 88,85 L 80,88 L 74,70 Z"} fill="#4A1D75" />
                <path d="M 46,64 L 38,85 L 44,88 L 50,70 Z" fill="#4A1D75" />
              </>
            )}
            {equippedOuterwear === 'outerwear_hoodie' && (
              <path d="M 44,58 L 82,58 L 80,82 L 46,82 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
            )}
          </g>

          {/* BRAZOS Y MANOS BASE (Si no lleva mangas amplias de hechicera) */}
          {equippedOuterwear !== 'outerwear_witch_cloak' && (
            <g id="layer-arms">
              {/* Brazo Izquierdo (hacia el libro o costado) */}
              <path 
                d={isCasting 
                  ? "M 48,64 L 28,72 L 30,78 L 50,68 Z" 
                  : "M 48,64 L 38,82 L 44,84 L 52,68 Z"
                } 
                fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
              />
              <circle cx={isCasting ? "28" : "41"} cy={isCasting ? "75" : "83"} r="3.5" fill={skin} />

              {/* Brazo Derecho (apuntando con la varita o costado) */}
              <path 
                d={isCasting 
                  ? "M 78,64 L 102,62 L 102,70 L 76,68 Z" 
                  : "M 78,64 L 88,82 L 82,84 L 74,68 Z"
                } 
                fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
              />
              <circle cx={isCasting ? "102" : "85"} cy={isCasting ? "66" : "83"} r="3.5" fill={skin} />
            </g>
          )}
        </g>

        {/* 4. CABEZA, OREJAS, ROSTRO Y EXPRESIONES */}
        <g id="layer-head">
          {/* Cuello */}
          <rect x="58" y="46" width="10" height="12" fill={skin} />

          {/* Cabeza / Rostro Anime */}
          <path
            d="M 44,32 C 44,18 82,18 82,32 C 82,44 76,54 63,54 C 50,54 44,44 44,32 Z"
            fill={skin}
            stroke="#000000"
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />

          {/* OREJAS Y RASGOS FANTÁSTICOS */}
          <g id="layer-ears">
            {raceFeature === 'human' && (
              <>
                <ellipse cx="43" cy="35" rx="3" ry="4" fill={skin} />
                <ellipse cx="83" cy="35" rx="3" ry="4" fill={skin} />
              </>
            )}
            {raceFeature === 'elf_long' && (
              <>
                <polygon points="44,36 30,22 43,30" fill={skin} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.3" />
                <polygon points="82,36 96,22 83,30" fill={skin} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.3" />
              </>
            )}
            {raceFeature === 'cat_ears' && (
              <>
                <polygon points="46,20 38,6 52,14" fill={hair} />
                <polygon points="46,18 41,9 50,15" fill="#F472B6" />
                <polygon points="80,20 88,6 74,14" fill={hair} />
                <polygon points="80,18 85,9 76,15" fill="#F472B6" />
              </>
            )}
            {raceFeature === 'dragon_horns' && (
              <>
                <path d="M 46,18 Q 36,4 40,-2 Q 46,8 50,16" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <path d="M 80,18 Q 90,4 86,-2 Q 80,8 76,16" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              </>
            )}
            {raceFeature === 'angel_halo' && (
              <ellipse cx="63" cy="6" rx="20" ry="4" fill="none" stroke="#FDE047" strokeWidth="3" className="animate-pulse" />
            )}
          </g>

          {/* OJOS Y EXPRESIÓN */}
          <g id="layer-eyes">
            {/* Ojo Izquierdo */}
            {eyesStyle === 'wink' ? (
              <path d="M 49,36 Q 54,40 59,36" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse cx="53" cy="36" rx="4.5" ry="5.5" fill="#FFFFFF" />
                <ellipse cx="53" cy="36" rx="3.5" ry="4.5" fill={eyesStyle === 'flame' ? "#EF4444" : eyesStyle === 'lightning' ? "#06B6D4" : "#A855F7"} />
                <circle cx="54.5" cy="34" r="1.8" fill="#FFFFFF" />
                <circle cx="51.5" cy="37.5" r="0.8" fill="#FFFFFF" />
                <path d="M 47,31 Q 53,28 58,32" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Ojo Derecho */}
            <g>
              <ellipse cx="73" cy="36" rx="4.5" ry="5.5" fill="#FFFFFF" />
              <ellipse cx="73" cy="36" rx="3.5" ry="4.5" fill={eyesStyle === 'flame' ? "#EF4444" : eyesStyle === 'heterochromia' ? "#F59E0B" : eyesStyle === 'lightning' ? "#06B6D4" : "#A855F7"} />
              <circle cx="74.5" cy="34" r="1.8" fill="#FFFFFF" />
              <circle cx="71.5" cy="37.5" r="0.8" fill="#FFFFFF" />
              <path d="M 68,32 Q 73,28 79,31" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* Rubor en las mejillas */}
            <ellipse cx="48" cy="42" rx="3" ry="1.5" fill="#F43F5E" opacity="0.4" />
            <ellipse cx="78" cy="42" rx="3" ry="1.5" fill="#F43F5E" opacity="0.4" />

            {/* Boca */}
            {isCheering || isCasting ? (
              <path d="M 60,45 Q 63,50 66,45 Z" fill="#E11D48" />
            ) : (
              <path d="M 61,45 Q 63,48 65,45" stroke="#9F1239" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}
          </g>

          {/* CABELLO FRONTAL / FLEQUILLO */}
          <g id="layer-front-hair">
            <path
              d={hairStyle === 'spiky' 
                ? "M 42,28 L 48,16 L 54,26 L 62,12 L 70,26 L 78,16 L 84,28 Z"
                : hairStyle === 'afro'
                ? "M 36,24 C 30,6 96,6 90,24 C 92,34 34,34 36,24 Z"
                : "M 42,26 Q 52,38 63,28 Q 74,38 84,26 Q 74,18 63,18 Q 52,18 42,26 Z"
              }
              fill={hair}
            />
            {/* Mechones laterales */}
            <path d="M 43,26 Q 38,42 42,54 Q 45,45 46,32 Z" fill={hair} />
            <path d="M 83,26 Q 88,42 84,54 Q 81,45 80,32 Z" fill={hair} />
          </g>

          {/* LENTES DE SABIO */}
          {equippedAccessory === 'acc_scholar_glasses' && (
            <g>
              <circle cx="53" cy="36" r="6" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="73" cy="36" r="6" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="59" y1="36" x2="67" y2="36" stroke="#F59E0B" strokeWidth="1.5" />
            </g>
          )}

          {/* SOMBRERO DE BRUJA O GORRO */}
          {equippedHat === 'hat_witch' && (
            <g id="layer-witch-hat" className="drop-shadow-lg">
              {/* Ala ancha morada */}
              <ellipse cx="63" cy="20" rx="38" ry="10" fill="#3B185F" stroke="#2A0845" strokeWidth="1.5" />
              {/* Cinta con lazo */}
              <ellipse cx="63" cy="18" rx="22" ry="6" fill="#DB2777" />
              <circle cx="63" cy="18" r="3" fill="#FDE047" />
              {/* Cono puntiagudo curvado */}
              <path d="M 44,18 Q 55,-12 78,-16 Q 80,4 82,18 Z" fill="#3B185F" stroke="#2A0845" strokeWidth="1.5" />
              {/* Estrellita decorativa en el sombrero */}
              <polygon points="56,6 58,10 62,11 59,14 60,18 56,15 52,18 53,14 50,11 54,10" fill="#FDE047" />
            </g>
          )}
          {equippedHat === 'hat_urban_cap' && (
            <path d="M 44,20 Q 63,6 82,20 L 94,22 L 80,24 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.5" />
          )}
          {equippedHat === 'hat_guild_crown' && (
            <polygon points="46,18 50,8 57,14 63,4 69,14 76,8 80,18" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          )}
        </g>

        {/* 5. ARTEFACTOS EN MANO Y PODERES (VARITA, LIBRO DE HECHIZOS Y RAYOS MÁGICOS) */}
        <g id="layer-magic-powers">
          {/* Libro de Hechizos Flotante (Grimorio en mano izquierda) */}
          {(equippedAccessory === 'acc_spellbook' || equippedAccessory === 'acc_wand_and_book' || isCasting) && (
            <g className={isCasting ? "animate-pulse" : "animate-bounce"} style={{ animationDuration: '3s' }}>
              {/* Portada y páginas abiertas iluminadas */}
              <path d="M 28,68 L 18,62 L 18,80 L 28,86 Z" fill="#78350F" stroke="#D97706" strokeWidth="1" />
              <path d="M 28,68 L 38,62 L 38,80 L 28,86 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
              {/* Runas luminosas que brotan del libro */}
              <text x="21" y="74" fill="#DB2777" fontSize="6" fontWeight="bold">ᚱ</text>
              <text x="31" y="74" fill="#38BDF8" fontSize="6" fontWeight="bold">✦</text>
              {isCasting && (
                <circle cx="28" cy="72" r="8" fill="#F472B6" opacity="0.3" filter="url(#spellGlow)" />
              )}
            </g>
          )}

          {/* Varita Mágica en mano derecha */}
          {(equippedAccessory === 'acc_magic_wand' || equippedAccessory === 'acc_wand_and_book' || isCasting) && (
            <g>
              {/* Vara de madera noble conectada a la mano derecha */}
              <line
                x1={isCasting ? "100" : "84"}
                y1={isCasting ? "66" : "78"}
                x2={isCasting ? "118" : "96"}
                y2={isCasting ? "58" : "66"}
                stroke="#92400E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Punta dorada de la varita */}
              <circle cx={isCasting ? "118" : "96"} cy={isCasting ? "58" : "66"} r="3" fill="#F59E0B" />

              {/* EFECTO DE RAYO Y CHISPAS MÁGICAS AL CASTEAR (Como la imagen de la bruja) */}
              {isCasting && (
                <g filter="url(#spellGlow)">
                  {/* Orbe de energía concentrada */}
                  <circle cx="120" cy="58" r="9" fill="url(#energyOrb)" />
                  <circle cx="120" cy="58" r="3.5" fill="#FFFFFF" />

                  {/* Rayo zigzagueante de plasma rosa y azul */}
                  <path
                    d="M 120,58 L 126,50 L 130,64 L 136,48 L 142,60 L 148,54"
                    stroke="#F472B6"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  <path
                    d="M 120,58 L 126,50 L 130,64 L 136,48 L 142,60 L 148,54"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Chispas flotantes alrededor */}
                  <circle cx="132" cy="44" r="1.5" fill="#FDE047" className="animate-ping" />
                  <circle cx="140" cy="66" r="1.5" fill="#F472B6" className="animate-ping" />
                  <circle cx="124" cy="70" r="1.2" fill="#38BDF8" />
                </g>
              )}
            </g>
          )}
        </g>
        </g>
      </svg>
    </div>
  );
};
