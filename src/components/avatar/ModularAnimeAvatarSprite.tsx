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
  hairStyle = 'spiky',
  hairColor = 'pink',
  eyesStyle = 'determined',
  raceFeature = 'human',
  bodyScale = 'normal',
  equippedShoes = 'shoes_basic',
  equippedBottom = 'bottom_basic',
  equippedTop = 'top_basic',
  equippedOuterwear = 'outerwear_none',
  equippedHat = 'hat_none',
  equippedAccessory = 'acc_none',
  animationState = 'idle',
  width,
  height,
  className = 'w-full h-full'
}) => {
  const isMale = gender === 'male';
  const isFemale = gender === 'female';
  const isCasting = animationState === 'cast';
  const isCheering = animationState === 'cheer';

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

  // Escala del cuerpo
  const scaleValue = bodyScale === 'compact' ? 0.92 : bodyScale === 'tall' ? 1.08 : 1.0;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ 
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined, 
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        animation: isCheering ? 'cheerJumpBounce 0.62s cubic-bezier(0.28, 0.84, 0.42, 1) infinite' : undefined,
        willChange: isCheering ? 'transform' : undefined
      }}
    >
      <style>{`
        @keyframes cheerJumpBounce {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          30% { transform: translateY(-22px) scale(0.95, 1.05); }
          50% { transform: translateY(-26px) scale(0.92, 1.08); }
          75% { transform: translateY(3px) scale(1.06, 0.94); }
        }
        @keyframes cheerArmWaveLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes cheerArmWaveRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes floatConfettiParticle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          50% { transform: translateY(-8px) rotate(180deg); opacity: 0.9; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 1; }
        }
      `}</style>

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
          <ellipse 
            cx="65" 
            cy="126" 
            rx={isMale ? "32" : "28"} 
            ry={isCheering ? "3" : "6"} 
            fill="#000000" 
            opacity={isCheering ? 0.18 : 0.35} 
            className="transition-all duration-300"
          />

          {/* 2. CAPA / CABELLO TRASERO / ALAS */}
          <g id="layer-back">
            {/* Capa de Bruja / Archimago Trasera */}
            {(equippedOuterwear === 'outerwear_witch_cloak' || equippedOuterwear === 'outerwear_archmage_cape') && (
              <path
                d={isCasting 
                  ? "M 46,65 Q 18,85 14,115 Q 65,125 108,115 Q 96,85 80,65 Z"
                  : isMale
                  ? "M 42,65 Q 20,90 22,118 Q 65,125 106,118 Q 104,90 84,65 Z"
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
                <path d="M 50,60 C 18,35 12,65 48,72 Z" fill="#93C5FD" opacity="0.6" />
                <path d="M 76,60 C 108,35 114,65 78,72 Z" fill="#93C5FD" opacity="0.6" />
              </g>
            )}

            {/* CABELLO TRASERO DINÁMICO SEGÚN PEINADO Y GÉNERO */}
            {/* Coleta Alta Aventurera */}
            {hairStyle === 'ponytail' && (
              <g id="backhair-ponytail">
                <path d={isMale ? "M 66,30 Q 98,16 102,52 Q 88,48 72,38 Z" : "M 68,32 Q 95,20 100,55 Q 85,50 72,40 Z"} fill={hair} />
                <ellipse cx="69" cy="31" rx="4" ry="4" fill="#EF4444" />
              </g>
            )}

            {/* Trenzas Dobles Épicas */}
            {hairStyle === 'twin_braids' && (
              <g id="backhair-braids">
                <path d="M 44,40 Q 26,65 30,92 Q 35,92 39,76 Z" fill={hair} />
                <path d="M 82,40 Q 100,65 96,92 Q 91,92 87,76 Z" fill={hair} />
                <circle cx="31" cy="90" r="3" fill="#EC4899" />
                <circle cx="95" cy="90" r="3" fill="#EC4899" />
              </g>
            )}

            {/* Moños Dobles Cósmicos (Space Buns) */}
            {hairStyle === 'space_buns' && (
              <g id="backhair-spacebuns">
                <circle cx="38" cy="18" r="10" fill={hair} />
                <circle cx="88" cy="18" r="10" fill={hair} />
                <ellipse cx="38" cy="22" rx="6" ry="2" fill="#F59E0B" />
                <ellipse cx="88" cy="22" rx="6" ry="2" fill="#F59E0B" />
              </g>
            )}

            {/* Nudos Bantu Sagrados */}
            {hairStyle === 'bantu_knots' && (
              <g id="backhair-bantu">
                <circle cx="38" cy="20" r="6" fill={hair} />
                <circle cx="50" cy="12" r="6" fill={hair} />
                <circle cx="63" cy="10" r="6.5" fill={hair} />
                <circle cx="76" cy="12" r="6" fill={hair} />
                <circle cx="88" cy="20" r="6" fill={hair} />
              </g>
            )}

            {/* Afro Voluminoso */}
            {hairStyle === 'afro' && (
              <g id="backhair-afro">
                <circle cx="63" cy="28" r="36" fill={hair} />
                <circle cx="35" cy="30" r="18" fill={hair} />
                <circle cx="91" cy="30" r="18" fill={hair} />
                <circle cx="63" cy="8" r="20" fill={hair} />
              </g>
            )}

            {/* Rastas / Dreadlocks */}
            {hairStyle === 'dreadlocks' && (
              <g id="backhair-dreadlocks">
                <path d="M 38,36 Q 22,65 24,96 L 29,95 Q 28,66 42,40 Z" fill={hair} />
                <path d="M 44,38 Q 32,68 34,98 L 39,97 Q 38,69 48,42 Z" fill={hair} />
                <path d="M 82,38 Q 94,68 92,98 L 87,97 Q 88,69 78,42 Z" fill={hair} />
                <path d="M 88,36 Q 104,65 102,96 L 97,95 Q 98,66 84,40 Z" fill={hair} />
                <rect x="25" y="70" width="4" height="3" fill="#F59E0B" />
                <rect x="97" y="72" width="4" height="3" fill="#F59E0B" />
              </g>
            )}

            {/* Melenas Largas (Ondulada, Lisa, Rizos, Salvaje) */}
            {(hairStyle === 'wavy_long' || hairStyle === 'witch_curls' || hairStyle === 'straight_long' || hairStyle === 'wild_mane') && (
              <path
                d={hairStyle === 'wild_mane'
                  ? "M 42,32 Q 14,50 18,92 Q 63,105 108,92 Q 112,50 84,32 Z"
                  : isCasting 
                  ? "M 45,35 Q 22,65 24,98 Q 63,105 100,98 Q 104,65 81,35 Z"
                  : "M 45,35 Q 28,65 30,95 Q 63,100 96,95 Q 98,65 81,35 Z"
                }
                fill={hair}
                className={isCasting ? "animate-pulse" : ""}
              />
            )}

            {/* Puntas traseras masculinas de héroe shonen (solo si es spiky) */}
            {isMale && hairStyle === 'spiky' && (
              <path d="M 38,30 L 32,46 L 42,40 L 38,54 L 46,44 L 80,44 L 88,54 L 84,40 L 94,46 L 88,30 Z" fill={hair} />
            )}

            {/* Mechones traseros de shaggy/flequillo despeinado */}
            {hairStyle === 'shaggy' && (
              <path d="M 40,32 L 35,45 L 43,42 L 39,52 L 46,46 L 80,46 L 87,52 L 83,42 L 91,45 L 86,32 Z" fill={hair} />
            )}
          </g>

          {/* 3. CUERPO Y PIERNAS */}
          <g id="layer-body">
            {/* Piernas con piel o medias */}
            <rect 
              x={isMale ? "48" : "50"} 
              y="90" 
              width={isMale ? "10" : "8"} 
              height="28" 
              rx="3" 
              fill={equippedBottom === 'bottom_witch_skirt' && !isMale ? "#1E293B" : skin} 
            />
            <rect 
              x={isMale ? "68" : "68"} 
              y="90" 
              width={isMale ? "10" : "8"} 
              height="28" 
              rx="3" 
              fill={equippedBottom === 'bottom_witch_skirt' && !isMale ? "#1E293B" : skin} 
            />

            {/* ZAPATOS */}
            <g id="layer-shoes">
              {equippedShoes === 'shoes_witch_boots' && (
                <>
                  <path d="M 45,110 L 59,110 L 61,124 L 41,124 Z" fill="#581C87" stroke="#3B0764" strokeWidth="1" />
                  <rect x="47" y="114" width="8" height="3" fill="#F59E0B" />
                  <path d="M 65,110 L 79,110 L 85,124 L 65,124 Z" fill="#581C87" stroke="#3B0764" strokeWidth="1" />
                  <rect x="67" y="114" width="8" height="3" fill="#F59E0B" />
                </>
              )}
              {equippedShoes === 'shoes_sneakers' && (
                <>
                  <rect x="45" y="116" width="14" height="8" rx="3" fill="#EF4444" stroke="#DC2626" />
                  <rect x="44" y="122" width="16" height="3" rx="1" fill="#FFFFFF" />
                  <rect x="66" y="116" width="14" height="8" rx="3" fill="#EF4444" stroke="#DC2626" />
                  <rect x="65" y="122" width="16" height="3" rx="1" fill="#FFFFFF" />
                </>
              )}
              {equippedShoes === 'shoes_basic' && (
                <>
                  <ellipse cx={isMale ? "53" : "52"} cy="122" rx={isMale ? "8" : "7"} ry="4.5" fill="#27272A" stroke="#18181B" />
                  <ellipse cx={isMale ? "73" : "74"} cy="122" rx={isMale ? "8" : "7"} ry="4.5" fill="#27272A" stroke="#18181B" />
                </>
              )}
            </g>

            {/* PANTALÓN O FALDA */}
            <g id="layer-bottom">
              {equippedBottom === 'bottom_witch_skirt' && (
                isMale ? (
                  /* Túnica y pantalones de combate de hechicero para varón */
                  <g>
                    <path d="M 43,78 L 83,78 L 81,114 L 71,114 L 63,88 L 55,114 L 45,114 Z" fill="#1E1B4B" stroke="#312E81" strokeWidth="1.5" />
                    {/* Fajín de mago con broche dorado */}
                    <polygon points="43,78 83,78 81,84 45,84" fill="#6366F1" />
                    <rect x="60" y="78" width="6" height="6" rx="1" fill="#F59E0B" />
                  </g>
                ) : (
                  <path 
                    d="M 45,78 L 81,78 L 90,95 L 36,95 Z" 
                    fill="#1E3A8A" 
                    stroke="#172554" 
                    strokeWidth="1.5" 
                  />
                )
              )}
              {equippedBottom === 'bottom_blue_jeans' && (
                <g>
                  <path 
                    d={isMale 
                      ? "M 43,78 L 83,78 L 81,114 L 70,114 L 63,88 L 56,114 L 45,114 Z" 
                      : "M 46,78 L 80,78 L 78,114 L 69,114 L 63,88 L 57,114 L 48,114 Z"
                    } 
                    fill="#2563EB" 
                    stroke="#1D4ED8" 
                    strokeWidth="1" 
                  />
                  {isMale && (
                    <>
                      <rect x="44" y="78" width="38" height="3" fill="#78350F" />
                      <rect x="61" y="77" width="4" height="5" rx="1" fill="#F59E0B" />
                    </>
                  )}
                </g>
              )}
              {equippedBottom === 'bottom_basic' && (
                <g>
                  <path 
                    d={isMale 
                      ? "M 43,78 L 83,78 L 81,115 L 70,115 L 63,88 L 56,115 L 45,115 Z" 
                      : "M 46,78 L 80,78 L 78,115 L 69,115 L 63,88 L 57,115 L 48,115 Z"
                    } 
                    fill="#18181B" 
                    stroke="#27272A" 
                    strokeWidth="1" 
                  />
                  {isMale && (
                    <>
                      <rect x="44" y="78" width="38" height="3" fill="#27272A" />
                      <rect x="61" y="77" width="4" height="5" rx="1" fill="#71717A" />
                    </>
                  )}
                </g>
              )}
            </g>

            {/* TORSO / PLAYERA O CAMISA */}
            <g id="layer-top">
              {/* Pecho base adaptado a masculinidad/hombros */}
              <rect 
                x={isMale ? "43" : "47"} 
                y="58" 
                width={isMale ? "40" : "32"} 
                height="24" 
                rx={isMale ? "2" : "4"} 
                fill={skin} 
              />

              {equippedTop === 'top_school_blouse' && (
                <>
                  <polygon 
                    points={isMale ? "42,58 84,58 81,80 45,80" : "46,58 80,58 78,80 48,80"} 
                    fill="#F8FAFC" 
                    stroke="#CBD5E1" 
                    strokeWidth="1" 
                  />
                  {isMale ? (
                    /* Corbata masculina recta */
                    <>
                      <polygon points="63,58 59,62 67,62" fill="#2563EB" />
                      <polygon points="63,62 61,76 63,80 65,76" fill="#1D4ED8" />
                    </>
                  ) : (
                    /* Cuello y lazo escolar rojo */
                    <>
                      <polygon points="63,58 58,64 68,64" fill="#EF4444" />
                      <polygon points="63,64 60,74 63,78 66,74" fill="#DC2626" />
                    </>
                  )}
                </>
              )}
              {equippedTop === 'top_basic' && (
                <polygon 
                  points={isMale ? "42,58 84,58 81,80 45,80" : "46,58 80,58 78,80 48,80"} 
                  fill="#E2E8F0" 
                  stroke="#94A3B8" 
                  strokeWidth="1" 
                />
              )}
              {equippedTop === 'top_rune_tshirt' && (
                <>
                  <polygon 
                    points={isMale ? "42,58 84,58 81,80 45,80" : "46,58 80,58 78,80 48,80"} 
                    fill="#0F172A" 
                    stroke="#1E293B" 
                    strokeWidth="1" 
                  />
                  <polygon points="63,65 60,72 66,72" fill="#F59E0B" />
                </>
              )}
            </g>

            {/* PRENDA EXTERIOR: CHALECO, HOODIE O CAPA */}
            <g id="layer-outerwear-front">
              {equippedOuterwear === 'outerwear_witch_cloak' && (
                <>
                  {/* Chaleco */}
                  <path d={isMale ? "M 42,60 L 51,80 L 44,80 L 38,64 Z" : "M 45,60 L 53,80 L 46,80 L 41,64 Z"} fill="#4A1D75" />
                  <path d={isMale ? "M 84,60 L 75,80 L 82,80 L 88,64 Z" : "M 81,60 L 73,80 L 80,80 L 85,64 Z"} fill="#4A1D75" />
                  
                  {/* Mangas acampanadas con soporte de celebración o hechizo */}
                  {isCheering ? (
                    <>
                      <path d="M 44,62 L 18,32 L 28,26 L 52,58 Z" fill="#4A1D75" />
                      <circle cx="22" cy="27" r="3.5" fill={skin} />
                      <path d="M 82,62 L 108,32 L 98,26 L 74,58 Z" fill="#4A1D75" />
                      <circle cx="104" cy="27" r="3.5" fill={skin} />
                    </>
                  ) : (
                    <>
                      <path d={isCasting ? "M 80,62 L 105,68 L 100,78 L 76,70 Z" : "M 78,64 L 88,85 L 80,88 L 74,70 Z"} fill="#4A1D75" />
                      <path d="M 46,64 L 38,85 L 44,88 L 50,70 Z" fill="#4A1D75" />
                    </>
                  )}
                </>
              )}
              {equippedOuterwear === 'outerwear_hoodie' && (
                <path 
                  d={isMale ? "M 41,58 L 85,58 L 82,82 L 44,82 Z" : "M 44,58 L 82,58 L 80,82 L 46,82 Z"} 
                  fill="#0284C7" 
                  stroke="#0369A1" 
                  strokeWidth="1.5" 
                />
              )}
            </g>

            {/* BRAZOS Y MANOS BASE */}
            {equippedOuterwear !== 'outerwear_witch_cloak' && (
              <g id="layer-arms">
                {isCheering ? (
                  /* Ambos brazos levantados al cielo en señal de victoria y balanceo */
                  <g>
                    {/* Brazo Izquierdo arriba con balanceo festivo */}
                    <g style={{ animation: 'cheerArmWaveLeft 0.62s ease-in-out infinite', transformOrigin: '48px 60px' }}>
                      <path 
                        d={isMale 
                          ? "M 44,64 L 18,26 L 26,22 L 50,58 Z" 
                          : "M 46,64 L 20,28 L 27,24 L 50,58 Z"
                        } 
                        fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
                      />
                      <circle cx={isMale ? "21" : "23"} cy="24" r="3.8" fill={skin} />
                      <line x1={isMale ? "20" : "22"} y1="21" x2={isMale ? "17" : "19"} y2="15" stroke={skin} strokeWidth="1.8" strokeLinecap="round" />
                      <line x1={isMale ? "23" : "25"} y1="21" x2={isMale ? "25" : "27"} y2="15" stroke={skin} strokeWidth="1.8" strokeLinecap="round" />
                    </g>

                    {/* Brazo Derecho arriba con balanceo festivo */}
                    <g style={{ animation: 'cheerArmWaveRight 0.62s ease-in-out infinite', transformOrigin: '78px 60px' }}>
                      <path 
                        d={isMale 
                          ? "M 82,64 L 108,26 L 100,22 L 76,58 Z" 
                          : "M 80,64 L 106,28 L 99,24 L 76,58 Z"
                        } 
                        fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
                      />
                      <circle cx={isMale ? "105" : "103"} cy="24" r="3.8" fill={skin} />
                      <line x1={isMale ? "104" : "102"} y1="21" x2={isMale ? "102" : "100"} y2="15" stroke={skin} strokeWidth="1.8" strokeLinecap="round" />
                      <line x1={isMale ? "107" : "105"} y1="21" x2={isMale ? "109" : "107"} y2="15" stroke={skin} strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  </g>
                ) : (
                  <>
                    {/* Brazo Izquierdo */}
                    <path 
                      d={isCasting 
                        ? "M 48,64 L 28,72 L 30,78 L 50,68 Z" 
                        : "M 48,64 L 38,82 L 44,84 L 52,68 Z"
                      } 
                      fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
                    />
                    <circle cx={isCasting ? "28" : "41"} cy={isCasting ? "75" : "83"} r="3.5" fill={skin} />

                    {/* Brazo Derecho */}
                    <path 
                      d={isCasting 
                        ? "M 78,64 L 102,62 L 102,70 L 76,68 Z" 
                        : "M 78,64 L 88,82 L 82,84 L 74,68 Z"
                      } 
                      fill={equippedTop === 'top_basic' ? "#CBD5E1" : equippedTop === 'top_rune_tshirt' ? "#0F172A" : skin} 
                    />
                    <circle cx={isCasting ? "102" : "85"} cy={isCasting ? "66" : "83"} r="3.5" fill={skin} />
                  </>
                )}
              </g>
            )}
          </g>

          {/* 4. CABEZA, OREJAS, ROSTRO Y EXPRESIONES */}
          <g id="layer-head">
            {/* Cuello (más robusto para varón) */}
            <rect 
              x={isMale ? "56" : "58"} 
              y="46" 
              width={isMale ? "14" : "10"} 
              height="12" 
              fill={skin} 
              rx="1" 
            />

            {/* Cabeza / Rostro Anime: Mandíbula definida de shonen vs mejillas suaves de chica */}
            {isMale ? (
              <path
                d="M 43,28 C 43,15 83,15 83,28 C 83,41 78,54 63,57 C 48,54 43,41 43,28 Z"
                fill={skin}
                stroke="#000000"
                strokeWidth="0.6"
                strokeOpacity="0.25"
              />
            ) : (
              <path
                d="M 44,32 C 44,18 82,18 82,32 C 82,44 76,54 63,54 C 50,54 44,44 44,32 Z"
                fill={skin}
                stroke="#000000"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
            )}

            {/* OREJAS Y RASGOS FANTÁSTICOS */}
            <g id="layer-ears">
              {raceFeature === 'human' && (
                <>
                  <ellipse cx={isMale ? "42" : "43"} cy="35" rx="3.5" ry="4.5" fill={skin} />
                  <ellipse cx={isMale ? "84" : "83"} cy="35" rx="3.5" ry="4.5" fill={skin} />
                </>
              )}
              {raceFeature === 'elf_long' && (
                <>
                  <polygon points="44,36 28,20 43,30" fill={skin} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.3" />
                  <polygon points="82,36 98,20 83,30" fill={skin} stroke="#000000" strokeWidth="0.5" strokeOpacity="0.3" />
                </>
              )}
              {raceFeature === 'cat_ears' && (
                <>
                  <polygon points="46,20 38,4 52,14" fill={hair} />
                  <polygon points="46,18 41,7 50,15" fill="#F472B6" />
                  <polygon points="80,20 88,4 74,14" fill={hair} />
                  <polygon points="80,18 85,7 76,15" fill="#F472B6" />
                </>
              )}
              {raceFeature === 'fox_ears' && (
                <>
                  <polygon points="45,22 35,2 51,14" fill={hair} />
                  <polygon points="45,20 38,5 49,15" fill="#FFFFFF" />
                  <polygon points="81,22 91,2 75,14" fill={hair} />
                  <polygon points="81,20 88,5 77,15" fill="#FFFFFF" />
                </>
              )}
              {raceFeature === 'dragon_horns' && (
                <>
                  <path d="M 46,18 Q 34,2 40,-4 Q 46,6 50,16" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                  <path d="M 80,18 Q 92,2 86,-4 Q 80,6 76,16" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                </>
              )}
              {raceFeature === 'angel_halo' && (
                <ellipse cx="63" cy="4" rx="22" ry="4.5" fill="none" stroke="#FDE047" strokeWidth="3" className="animate-pulse" />
              )}
            </g>

            {/* CEJAS (Masculinas definidas vs Femeninas elegantes) */}
            {isMale ? (
              <g id="layer-eyebrows-male">
                <path d="M 46,28 L 58,30" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 68,30 L 80,28" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
              </g>
            ) : (
              <g id="layer-eyebrows-female">
                <path d="M 47,31 Q 53,27 58,31" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 68,31 Q 73,27 79,30" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                {/* Pestañas sutiles anime */}
                <path d="M 46,33 L 43,31" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M 80,33 L 83,31" stroke="#1E293B" strokeWidth="1.4" strokeLinecap="round" />
              </g>
            )}

            {/* OJOS Y EXPRESIÓN */}
            <g id="layer-eyes">
              {isCheering ? (
                /* Ojos cerrados sonrientes de felicidad ( ^ ‿ ^ ) */
                <g>
                  <path d="M 48,36 Q 54,28 60,36" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 66,36 Q 72,28 78,36" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
              ) : eyesStyle === 'wink' ? (
                <>
                  <path d="M 49,36 Q 54,40 59,36" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <ellipse cx="73" cy="36" rx="4.5" ry="5.5" fill="#FFFFFF" />
                  <ellipse cx="73" cy="36" rx="3.5" ry="4.5" fill="#A855F7" />
                  <circle cx="74.5" cy="34" r="1.8" fill="#FFFFFF" />
                </>
              ) : (
                <>
                  {/* Ojo Izquierdo */}
                  <g>
                    <ellipse cx="53" cy="36" rx={isMale ? "4.2" : "4.5"} ry={isMale ? "5" : "5.5"} fill="#FFFFFF" />
                    <ellipse cx="53" cy="36" rx={isMale ? "3.2" : "3.5"} ry={isMale ? "4" : "4.5"} fill={eyesStyle === 'flame' ? "#EF4444" : eyesStyle === 'lightning' ? "#06B6D4" : "#A855F7"} />
                    <circle cx="54.5" cy="34" r="1.8" fill="#FFFFFF" />
                    <circle cx="51.5" cy="37.5" r="0.8" fill="#FFFFFF" />
                  </g>
                  {/* Ojo Derecho */}
                  <g>
                    <ellipse cx="73" cy="36" rx={isMale ? "4.2" : "4.5"} ry={isMale ? "5" : "5.5"} fill="#FFFFFF" />
                    <ellipse cx="73" cy="36" rx={isMale ? "3.2" : "3.5"} ry={isMale ? "4" : "4.5"} fill={eyesStyle === 'flame' ? "#EF4444" : eyesStyle === 'heterochromia' ? "#F59E0B" : eyesStyle === 'lightning' ? "#06B6D4" : "#A855F7"} />
                    <circle cx="74.5" cy="34" r="1.8" fill="#FFFFFF" />
                    <circle cx="71.5" cy="37.5" r="0.8" fill="#FFFFFF" />
                  </g>
                </>
              )}

              {/* Rubor en las mejillas */}
              <ellipse cx="48" cy="42" rx={isCheering ? "4.5" : "3"} ry={isCheering ? "2" : "1.5"} fill="#F43F5E" opacity={isCheering ? 0.65 : 0.4} />
              <ellipse cx="78" cy="42" rx={isCheering ? "4.5" : "3"} ry={isCheering ? "2" : "1.5"} fill="#F43F5E" opacity={isCheering ? 0.65 : 0.4} />

              {/* Boca */}
              {isCheering ? (
                /* Boca sonriente alegre y abierta */
                <g>
                  <path d="M 58,43 Q 63,53 68,43 Z" fill="#E11D48" />
                  <circle cx="63" cy="49" r="2.5" fill="#FDA4AF" />
                </g>
              ) : isCasting ? (
                <path d="M 60,45 Q 63,50 66,45 Z" fill="#E11D48" />
              ) : (
                <path d="M 61,45 Q 63,48 65,45" stroke="#9F1239" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              )}
            </g>

            {/* CABELLO FRONTAL DINÁMICO (16 ESTILOS ANIME PARA HOMBRE Y MUJER) */}
            <g id="layer-front-hair">
              {/* 1. Spiky / Puntas Anime Rebelde */}
              {hairStyle === 'spiky' && (
                <g id="hair-spiky">
                  {isMale ? (
                    <>
                      <path d="M 40,28 L 47,8 L 54,20 L 63,4 L 72,20 L 79,8 L 86,28 Z" fill={hair} />
                      <path d="M 41,26 L 36,38 L 44,33 Z" fill={hair} />
                      <path d="M 85,26 L 90,38 L 82,33 Z" fill={hair} />
                    </>
                  ) : (
                    <>
                      <path d="M 42,28 L 48,14 L 54,24 L 63,10 L 72,24 L 78,14 L 84,28 Z" fill={hair} />
                      <path d="M 42,26 Q 37,42 42,54 Q 45,45 46,32 Z" fill={hair} />
                      <path d="M 84,26 Q 89,42 84,54 Q 81,45 80,32 Z" fill={hair} />
                    </>
                  )}
                </g>
              )}

              {/* 2. Short Clean / Corto Clásico de Academia */}
              {(hairStyle === 'short_clean' || (!hairStyle && isMale)) && (
                <g id="hair-short-clean">
                  <path d="M 41,26 Q 63,14 85,26 L 85,32 Q 63,22 41,32 Z" fill={hair} />
                  <path d="M 41,26 L 38,36 L 43,32 Z" fill={hair} />
                  <path d="M 85,26 L 88,36 L 83,32 Z" fill={hair} />
                </g>
              )}

              {/* 3. Sidecut / Rapado Lateral Urbano */}
              {hairStyle === 'sidecut' && (
                <g id="hair-sidecut">
                  <path d="M 42,28 Q 50,10 74,8 Q 88,14 88,30 Q 78,22 54,25 Z" fill={hair} />
                  {/* Líneas de fade / rapado en el lateral izquierdo */}
                  <line x1="41" y1="28" x2="45" y2="28" stroke={hair} strokeWidth="1.5" opacity="0.6" />
                  <line x1="40" y1="32" x2="44" y2="32" stroke={hair} strokeWidth="1.5" opacity="0.6" />
                  <path d="M 85,26 L 89,38 L 82,34 Z" fill={hair} />
                </g>
              )}

              {/* 4. Shaggy / Flequillo Despeinado */}
              {hairStyle === 'shaggy' && (
                <g id="hair-shaggy">
                  <path d="M 40,26 L 46,37 L 51,26 L 58,40 L 64,26 L 70,39 L 76,26 L 82,36 L 86,26 Z" fill={hair} />
                  <path d="M 41,26 L 36,40 L 44,34 Z" fill={hair} />
                  <path d="M 85,26 L 90,40 L 82,34 Z" fill={hair} />
                </g>
              )}

              {/* 5. Bob / Corte Bob Moderno */}
              {hairStyle === 'bob' && (
                <g id="hair-bob">
                  <path d="M 41,26 Q 63,18 85,26 L 86,48 Q 80,48 79,30 Q 63,28 47,30 Q 46,48 40,48 Z" fill={hair} />
                </g>
              )}

              {/* 6. Pixie / Corte Pixie Élfico */}
              {hairStyle === 'pixie' && (
                <g id="hair-pixie">
                  <path d="M 42,26 L 48,32 L 54,23 L 63,33 L 72,23 L 78,32 L 84,26 Z" fill={hair} />
                  <path d="M 42,26 L 38,34 L 44,30 Z" fill={hair} />
                  <path d="M 84,26 L 88,34 L 82,30 Z" fill={hair} />
                </g>
              )}

              {/* 7. Afro Voluminoso Estelar */}
              {hairStyle === 'afro' && (
                <g id="hair-afro">
                  <path d="M 36,26 C 30,6 96,6 90,26 C 92,34 34,34 36,26 Z" fill={hair} />
                </g>
              )}

              {/* 8. Dreadlocks / Rastas Urbanas */}
              {hairStyle === 'dreadlocks' && (
                <g id="hair-dreadlocks">
                  <path d="M 40,26 L 45,38 L 49,27 L 55,42 L 59,27 L 67,27 L 71,42 L 77,27 L 81,38 L 86,26 Z" fill={hair} />
                  <circle cx="55" cy="38" r="1.5" fill="#F59E0B" />
                  <circle cx="71" cy="38" r="1.5" fill="#F59E0B" />
                </g>
              )}

              {/* 9. Coleta Alta Aventurera (Frontal) */}
              {hairStyle === 'ponytail' && (
                <g id="hair-ponytail">
                  <path d="M 42,26 Q 52,36 63,26 Q 74,36 84,26 Q 74,18 63,18 Q 52,18 42,26 Z" fill={hair} />
                  <path d="M 42,26 Q 38,40 43,50 Q 45,42 46,30 Z" fill={hair} />
                  <path d="M 84,26 Q 88,40 83,50 Q 81,42 80,30 Z" fill={hair} />
                </g>
              )}

              {/* 10. Trenzas Dobles Épicas (Frontal) */}
              {hairStyle === 'twin_braids' && (
                <g id="hair-braids-front">
                  <path d="M 42,26 Q 52,34 63,26 Q 74,34 84,26 Q 63,16 42,26 Z" fill={hair} />
                  <path d="M 42,26 L 38,42 L 44,36 Z" fill={hair} />
                  <path d="M 84,26 L 88,42 L 82,36 Z" fill={hair} />
                </g>
              )}

              {/* 11. Moños Dobles Cósmicos (Space Buns Frontal) */}
              {hairStyle === 'space_buns' && (
                <g id="hair-spacebuns-front">
                  <path d="M 42,26 Q 63,20 84,26 L 84,32 Q 63,24 42,32 Z" fill={hair} />
                  <path d="M 43,26 Q 38,44 43,52 Q 45,44 46,30 Z" fill={hair} />
                  <path d="M 83,26 Q 88,44 83,52 Q 81,44 80,30 Z" fill={hair} />
                </g>
              )}

              {/* 12. Nudos Bantu Sagrados (Frontal) */}
              {hairStyle === 'bantu_knots' && (
                <g id="hair-bantu-front">
                  <path d="M 42,26 Q 63,18 84,26 L 84,30 Q 63,22 42,30 Z" fill={hair} />
                  <circle cx="56" cy="22" r="3.5" fill={hair} />
                  <circle cx="70" cy="22" r="3.5" fill={hair} />
                </g>
              )}

              {/* 13. Straight Long / Melena Lisa Profunda */}
              {hairStyle === 'straight_long' && (
                <g id="hair-straight-long">
                  <path d="M 42,26 Q 63,22 84,26 L 86,58 Q 81,58 80,32 Q 63,28 46,32 Q 45,58 40,58 Z" fill={hair} />
                </g>
              )}

              {/* 14. Wavy Long / Melena Ondulada Suave */}
              {hairStyle === 'wavy_long' && (
                <g id="hair-wavy-long">
                  <path d="M 42,26 Q 52,36 63,26 Q 74,36 84,26 Q 63,16 42,26 Z" fill={hair} />
                  <path d="M 42,26 Q 36,46 43,62 Q 46,50 46,32 Z" fill={hair} />
                  <path d="M 84,26 Q 90,46 83,62 Q 80,50 80,32 Z" fill={hair} />
                </g>
              )}

              {/* 15. Witch Curls / Rizos Místicos de Bruja */}
              {hairStyle === 'witch_curls' && (
                <g id="hair-witch-curls">
                  <path d="M 42,26 Q 52,38 63,26 Q 74,38 84,26 Q 63,16 42,26 Z" fill={hair} />
                  <path d="M 42,26 Q 34,44 42,56 Q 44,48 45,34 Z" fill={hair} />
                  <path d="M 84,26 Q 92,44 84,56 Q 82,48 81,34 Z" fill={hair} />
                </g>
              )}

              {/* 16. Wild Mane / Melena Salvaje de Héroe */}
              {hairStyle === 'wild_mane' && (
                <g id="hair-wild-mane">
                  <path d="M 38,26 L 44,10 L 52,24 L 63,6 L 74,24 L 82,10 L 88,26 Z" fill={hair} />
                  <path d="M 39,26 L 32,46 L 42,38 Z" fill={hair} />
                  <path d="M 87,26 L 94,46 L 84,38 Z" fill={hair} />
                </g>
              )}
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
                <ellipse cx="63" cy="20" rx="38" ry="10" fill="#3B185F" stroke="#2A0845" strokeWidth="1.5" />
                <ellipse cx="63" cy="18" rx="22" ry="6" fill="#DB2777" />
                <circle cx="63" cy="18" r="3" fill="#FDE047" />
                <path d="M 44,18 Q 55,-12 78,-16 Q 80,4 82,18 Z" fill="#3B185F" stroke="#2A0845" strokeWidth="1.5" />
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
                <path d="M 28,68 L 18,62 L 18,80 L 28,86 Z" fill="#78350F" stroke="#D97706" strokeWidth="1" />
                <path d="M 28,68 L 38,62 L 38,80 L 28,86 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
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
                <line
                  x1={isCasting ? "100" : "84"}
                  y1={isCasting ? "66" : "78"}
                  x2={isCasting ? "118" : "96"}
                  y2={isCasting ? "58" : "66"}
                  stroke="#92400E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx={isCasting ? "118" : "96"} cy={isCasting ? "58" : "66"} r="3" fill="#F59E0B" />

                {/* Rayo zigzagueante de plasma rosa y azul al castear */}
                {isCasting && (
                  <g filter="url(#spellGlow)">
                    <circle cx="120" cy="58" r="9" fill="url(#energyOrb)" />
                    <circle cx="120" cy="58" r="3.5" fill="#FFFFFF" />

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

                    <circle cx="132" cy="44" r="1.5" fill="#FDE047" className="animate-ping" />
                    <circle cx="140" cy="66" r="1.5" fill="#F472B6" className="animate-ping" />
                    <circle cx="124" cy="70" r="1.2" fill="#38BDF8" />
                  </g>
                )}
              </g>
            )}
          </g>

          {/* 6. EFECTO DE CELEBRACIÓN: ESTRELLAS, CONFETI Y DESTELLOS */}
          {isCheering && (
            <g id="layer-cheer-effects" className="animate-pulse">
              {/* Estrellas doradas luminosas */}
              <polygon points="63,0 65,5 70,6 66,9 67,14 63,11 59,14 60,9 56,6 61,5" fill="#FDE047" />
              <polygon points="24,14 25,17 28,18 26,20 26,23 24,21 22,23 22,20 20,18 23,17" fill="#F59E0B" />
              <polygon points="102,14 103,17 106,18 104,20 104,23 102,21 100,23 100,20 98,18 101,17" fill="#F59E0B" />
              <text x="14" y="20" fill="#FDE047" fontSize="10" fontWeight="bold">✨</text>
              <text x="98" y="20" fill="#FDE047" fontSize="10" fontWeight="bold">✨</text>
              
              {/* Confeti colorido flotando */}
              <circle cx="36" cy="8" r="1.8" fill="#EC4899" />
              <circle cx="90" cy="8" r="1.8" fill="#3B82F6" />
              <circle cx="48" cy="4" r="1.5" fill="#10B981" />
              <circle cx="78" cy="4" r="1.5" fill="#F97316" />
              <rect x="42" y="14" width="2" height="4" transform="rotate(25, 42, 14)" fill="#8B5CF6" />
              <rect x="84" y="12" width="2" height="4" transform="rotate(-30, 84, 12)" fill="#E11D48" />
            </g>
          )}

        </g>
      </svg>
    </div>
  );
};
