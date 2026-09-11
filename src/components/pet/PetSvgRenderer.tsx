"use client";

import React from 'react';
import { ElementalPetRace, PetEvolutionStage } from '@/types';
import { resolvePetRace, PetRaceMetadata } from './types';

interface PetSvgRendererProps {
  raceId?: ElementalPetRace | string;
  stage?: PetEvolutionStage;
  actionId?: string;
  isPetting?: boolean;
  className?: string;
}

export const PetSvgRenderer: React.FC<PetSvgRendererProps> = ({
  raceId = 'cryo_dragon',
  stage = 'egg',
  actionId = 'idle',
  isPetting = false,
  className = 'w-full h-full'
}) => {
  const meta: PetRaceMetadata = resolvePetRace(raceId);
  const isEgg = stage === 'egg';
  const isBaby = stage === 'baby';
  const isChild = stage === 'child';
  const isTeen = stage === 'teen';
  const isAdult = stage === 'adult' || stage === 'mystic';

  // Expresiones según acción viva
  const isSleeping = actionId === 'sleep_snooze' || actionId === 'drop_to_ground';
  const isHappyClosedEyes = isPetting || actionId === 'joy_bounce' || actionId === 'pout' || actionId === 'belly_nap';
  const isWinking = actionId === 'wink';
  const isTongueOut = actionId === 'funny_face';

  // 1. RENDERIZADO DEL HUEVO RÚNICO ANCESTRAL (Etapa 1)
  if (isEgg) {
    return (
      <svg
        viewBox="0 0 120 140"
        className={`${className} filter drop-shadow-xl select-none`}
      >
        <defs>
          <radialGradient id={`eggGrad-${meta.id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor={meta.accentColor} />
            <stop offset="70%" stopColor={meta.primaryColor} />
            <stop offset="100%" stopColor={meta.secondaryColor} />
          </radialGradient>
          <filter id="eggGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Aura elemental pulsante del huevo */}
        <ellipse
          cx="60"
          cy="122"
          rx="36"
          ry="10"
          fill={meta.glowColor}
          className="animate-pulse"
        />

        {/* Pedestal de roca o nido elemental */}
        <path
          d="M26 122 C 34 116, 50 114, 60 114 C 70 114, 86 116, 94 122 C 86 128, 34 128, 26 122 Z"
          fill="#334155"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <path
          d="M34 120 C 44 117, 76 117, 86 120 C 80 123, 40 123, 34 120 Z"
          fill="#475569"
        />

        {/* Cuerpo del Huevo con Balanceo Rítmico */}
        <g className="origin-bottom transition-transform duration-700 ease-in-out hover:rotate-3">
          {/* Cascarón base */}
          <path
            d="M 60 18 C 30 18, 22 65, 22 92 C 22 112, 38 122, 60 122 C 82 122, 98 112, 98 92 C 98 65, 90 18, 60 18 Z"
            fill={`url(#eggGrad-${meta.id})`}
            stroke={meta.secondaryColor}
            strokeWidth="2.5"
          />

          {/* Grietas rúnicas luminosas que presagian el nacimiento */}
          <path
            d="M 52 45 L 58 58 L 50 72 L 64 85 L 59 98"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#eggGlow)"
            className="animate-pulse"
          />
          <path
            d="M 64 85 L 75 88 L 78 96"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#eggGlow)"
          />

          {/* Glifos elementales grabados en el cascarón */}
          <circle cx="42" cy="48" r="3" fill="#ffffff" opacity="0.75" />
          <circle cx="76" cy="62" r="4" fill="#ffffff" opacity="0.6" />
          <circle cx="44" cy="95" r="2.5" fill="#ffffff" opacity="0.7" />
          <circle cx="78" cy="98" r="3.5" fill="#ffffff" opacity="0.6" />

          {/* Símbolo elemental central grabado */}
          <text
            x="60"
            y="76"
            textAnchor="middle"
            fontSize="16"
            fill="#ffffff"
            opacity="0.85"
            className="select-none pointer-events-none drop-shadow-md"
          >
            {meta.badgeEmoji}
          </text>
        </g>
      </svg>
    );
  }

  // 2. ESCALAS SEGÚN ETAPA EVOLUTIVA (Bebé, Niño, Adolescente, Adulto)
  const headSize = isBaby ? 24 : isChild ? 22 : isTeen ? 20 : 22;
  const eyeRadius = isBaby ? 4.5 : isChild ? 4 : isTeen ? 3.5 : 3.8;
  const bodyWidth = isBaby ? 32 : isChild ? 36 : isTeen ? 42 : 52;
  const wingSpan = isBaby ? 18 : isChild ? 28 : isTeen ? 44 : 60;
  const hornLength = isBaby ? 8 : isChild ? 14 : isTeen ? 22 : 32;

  // Renderizado dinámico de ojos según estado
  const renderEyes = (cx1: number, cx2: number, cy: number) => {
    if (isSleeping) {
      return (
        <>
          <path d={`M ${cx1 - 4} ${cy} Q ${cx1} ${cy + 3} ${cx1 + 4} ${cy}`} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d={`M ${cx2 - 4} ${cy} Q ${cx2} ${cy + 3} ${cx2 + 4} ${cy}`} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (isHappyClosedEyes) {
      return (
        <>
          <path d={`M ${cx1 - 4} ${cy + 1} Q ${cx1} ${cy - 3} ${cx1 + 4} ${cy + 1}`} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={`M ${cx2 - 4} ${cy + 1} Q ${cx2} ${cy - 3} ${cx2 + 4} ${cy + 1}`} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (isWinking) {
      return (
        <>
          <circle cx={cx1} cy={cy} r={eyeRadius} fill="#0f172a" />
          <circle cx={cx1 - 1.2} cy={cy - 1.2} r={eyeRadius * 0.4} fill="#ffffff" />
          <path d={`M ${cx2 - 4} ${cy} Q ${cx2} ${cy + 2} ${cx2 + 4} ${cy}`} stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      );
    }
    return (
      <>
        <circle cx={cx1} cy={cy} r={eyeRadius} fill="#0f172a" />
        <circle cx={cx1 - 1.2} cy={cy - 1.2} r={eyeRadius * 0.42} fill="#ffffff" />
        <circle cx={cx1 + 1.2} cy={cy + 1.2} r={eyeRadius * 0.2} fill="#ffffff" opacity="0.8" />
        <circle cx={cx2} cy={cy} r={eyeRadius} fill="#0f172a" />
        <circle cx={cx2 - 1.2} cy={cy - 1.2} r={eyeRadius * 0.42} fill="#ffffff" />
        <circle cx={cx2 + 1.2} cy={cy + 1.2} r={eyeRadius * 0.2} fill="#ffffff" opacity="0.8" />
      </>
    );
  };

  // Renderizado dinámico de boca según estado
  const renderMouth = (cx: number, cy: number) => {
    if (isTongueOut) {
      return (
        <g>
          <path d={`M ${cx - 3} ${cy} Q ${cx} ${cy + 2.5} ${cx + 3} ${cy}`} stroke="#0f172a" strokeWidth="1.5" fill="none" />
          <path d={`M ${cx - 1.5} ${cy + 1.5} Q ${cx} ${cy + 5.5} ${cx + 1.5} ${cy + 1.5} Z`} fill="#f43f5e" />
        </g>
      );
    }
    if (actionId === 'pout') {
      return (
        <circle cx={cx} cy={cy + 1} r="2" fill="#0f172a" />
      );
    }
    if (actionId === 'yawn') {
      return (
        <ellipse cx={cx} cy={cy + 2} rx="3" ry="4" fill="#0f172a" />
      );
    }
    return (
      <path
        d={`M ${cx - 3} ${cy} Q ${cx} ${cy + (isBaby ? 3.5 : 2.5)} ${cx + 3} ${cy}`}
        stroke="#0f172a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  // 3. RENDERIZADO DE LA ESPECIE ELEMENTAL ESPECÍFICA
  return (
    <svg
      viewBox="0 0 140 140"
      className={`${className} filter drop-shadow-xl select-none transition-all duration-300`}
    >
      <defs>
        {/* Gradiente principal del cuerpo */}
        <linearGradient id={`gradBody-${meta.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={meta.accentColor} />
          <stop offset="50%" stopColor={meta.primaryColor} />
          <stop offset="100%" stopColor={meta.secondaryColor} />
        </linearGradient>

        {/* Gradiente de las alas o apéndices */}
        <linearGradient id={`gradWings-${meta.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={meta.secondaryColor} />
          <stop offset="70%" stopColor={meta.primaryColor} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Sombra proyectada en el suelo */}
      <ellipse
        cx="70"
        cy="124"
        rx={isAdult ? 42 : isTeen ? 34 : isChild ? 28 : 22}
        ry="7"
        fill={meta.glowColor}
        className="opacity-70 animate-pulse"
      />

      {/* Aura protectora para etapas avanzadas (Adolescente y Adulto) */}
      {(isTeen || isAdult) && (
        <circle
          cx="70"
          cy="70"
          r={isAdult ? 58 : 48}
          fill="none"
          stroke={meta.primaryColor}
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.4"
          className="animate-spin"
          style={{ animationDuration: '24s' }}
        />
      )}

      {/* RENDER POR FAMILIA ELEMENTAL */}
      {/* A. FAMILIA DRAGONES: CRYO, PYROS, AQUA */}
      {(meta.id === 'cryo_dragon' || meta.id === 'pyros_dragon' || meta.id === 'aqua_dragon' || meta.id === 'dragon') && (
        <g>
          {/* Alas de Dragón */}
          <g>
            <path
              d={`M 54 68 C ${54 - wingSpan} 50, ${54 - wingSpan - 8} 30, ${48 - wingSpan} 24 C ${50 - wingSpan * 0.7} 42, ${54 - wingSpan * 0.4} 54, 52 74 Z`}
              fill={`url(#gradWings-${meta.id})`}
              stroke={meta.secondaryColor}
              strokeWidth="1.5"
            />
            <path
              d={`M 86 68 C ${86 + wingSpan} 50, ${86 + wingSpan + 8} 30, ${92 + wingSpan} 24 C ${90 + wingSpan * 0.7} 42, ${86 + wingSpan * 0.4} 54, 88 74 Z`}
              fill={`url(#gradWings-${meta.id})`}
              stroke={meta.secondaryColor}
              strokeWidth="1.5"
            />
          </g>

          {/* Cola de Dragón con Cresta */}
          <path
            d="M 52 106 Q 30 114 26 122 Q 38 124 58 112 Z"
            fill={`url(#gradBody-${meta.id})`}
            stroke={meta.secondaryColor}
            strokeWidth="1.5"
          />
          {/* Punta elemental de la cola */}
          <polygon
            points="24,120 18,124 24,128 30,124"
            fill={meta.accentColor}
            stroke={meta.secondaryColor}
            strokeWidth="1"
          />

          {/* Cuerpo y Pancita */}
          <ellipse
            cx="70"
            cy="92"
            rx={bodyWidth * 0.5}
            ry={isBaby ? 24 : 28}
            fill={`url(#gradBody-${meta.id})`}
            stroke={meta.secondaryColor}
            strokeWidth="2"
          />
          {/* Placas pectorales suaves */}
          <ellipse cx="70" cy="94" rx={bodyWidth * 0.3} ry={isBaby ? 16 : 20} fill={meta.accentColor} opacity="0.9" />
          <line x1="63" y1="88" x2="77" y2="88" stroke={meta.secondaryColor} strokeWidth="1" opacity="0.5" />
          <line x1="62" y1="94" x2="78" y2="94" stroke={meta.secondaryColor} strokeWidth="1" opacity="0.5" />
          <line x1="64" y1="100" x2="76" y2="100" stroke={meta.secondaryColor} strokeWidth="1" opacity="0.5" />

          {/* Patitas Delanteras */}
          <ellipse cx="56" cy="112" rx="7" ry="5" fill={meta.secondaryColor} />
          <ellipse cx="84" cy="112" rx="7" ry="5" fill={meta.secondaryColor} />

          {/* Cabeza */}
          <circle
            cx="70"
            cy="52"
            r={headSize}
            fill={`url(#gradBody-${meta.id})`}
            stroke={meta.secondaryColor}
            strokeWidth="2"
          />

          {/* Cuernos de Dragón */}
          <polygon
            points={`58,40 ${58 - hornLength * 0.5},${40 - hornLength} 64,36`}
            fill={meta.accentColor}
            stroke={meta.secondaryColor}
            strokeWidth="1.5"
          />
          <polygon
            points={`82,40 ${82 + hornLength * 0.5},${40 - hornLength} 76,36`}
            fill={meta.accentColor}
            stroke={meta.secondaryColor}
            strokeWidth="1.5"
          />

          {/* Rostro: Ojos, Chapitas y Boca */}
          {renderEyes(62, 78, 52)}
          {/* Chapitas tiernas sonrosadas */}
          <circle cx="58" cy="58" r="3.5" fill="#f43f5e" opacity={isHappyClosedEyes ? '0.6' : '0.35'} />
          <circle cx="82" cy="58" r="3.5" fill="#f43f5e" opacity={isHappyClosedEyes ? '0.6' : '0.35'} />
          {renderMouth(70, 58)}

          {/* Corona o cresta mística en adultos */}
          {isAdult && (
            <path
              d="M 60 30 L 70 20 L 80 30 L 75 34 L 65 34 Z"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="1.5"
            />
          )}
        </g>
      )}

      {/* B. LOBO TORMENTA: VOLTFANG */}
      {(meta.id === 'voltfang_wolf' || meta.id === 'lobo') && (
        <g>
          {/* Orejas de Lobo erizadas */}
          <polygon points="50,44 42,16 60,32" fill={meta.secondaryColor} stroke={meta.secondaryColor} strokeWidth="1.5" />
          <polygon points="52,42 46,22 58,34" fill={meta.accentColor} />
          <polygon points="90,44 98,16 80,32" fill={meta.secondaryColor} stroke={meta.secondaryColor} strokeWidth="1.5" />
          <polygon points="88,42 94,22 82,34" fill={meta.accentColor} />

          {/* Cola eléctrica relámpago */}
          <path
            d="M 46 102 L 28 108 L 36 94 L 20 102 L 32 86"
            stroke={meta.primaryColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cuerpo */}
          <ellipse cx="70" cy="92" rx={bodyWidth * 0.48} ry="26" fill={`url(#gradBody-${meta.id})`} stroke={meta.secondaryColor} strokeWidth="2" />
          <ellipse cx="70" cy="94" rx={bodyWidth * 0.28} ry="18" fill="#ffffff" opacity="0.9" />

          {/* Patitas */}
          <ellipse cx="56" cy="112" rx="7" ry="5" fill={meta.secondaryColor} />
          <ellipse cx="84" cy="112" rx="7" ry="5" fill={meta.secondaryColor} />

          {/* Cabeza de Lobo */}
          <circle cx="70" cy="52" r={headSize} fill={`url(#gradBody-${meta.id})`} stroke={meta.secondaryColor} strokeWidth="2" />
          {/* Mechones laterales de pelaje */}
          <polygon points="50,54 42,58 52,62" fill={meta.secondaryColor} />
          <polygon points="90,54 98,58 88,62" fill={meta.secondaryColor} />

          {/* Hocico */}
          <ellipse cx="70" cy="58" rx="8" ry="6" fill="#ffffff" />
          <polygon points="68,55 72,55 70,58" fill="#0f172a" />
          {renderMouth(70, 60)}
          {renderEyes(62, 78, 48)}
        </g>
      )}

      {/* C. VENADO SILVESTRE: FLORA */}
      {(meta.id === 'flora_stag' || meta.id === 'venado') && (
        <g>
          {/* Cornamenta de Cerezos en Flor */}
          <path
            d={`M 58 40 Q 46 26 40 18 M 46 26 Q 34 24 32 20 M 42 22 Q 44 14 46 12`}
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 82 40 Q 94 26 100 18 M 94 26 Q 106 24 108 20 M 98 22 Q 96 14 94 12`}
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Florecitas de cerezo en los cuernos */}
          <circle cx="32" cy="20" r="3" fill="#f472b6" />
          <circle cx="46" cy="12" r="3" fill="#fbcfe8" />
          <circle cx="108" cy="20" r="3" fill="#f472b6" />
          <circle cx="94" cy="12" r="3" fill="#fbcfe8" />

          {/* Orejitas caídas */}
          <ellipse cx="48" cy="46" rx="8" ry="4" transform="rotate(-25 48 46)" fill={meta.primaryColor} />
          <ellipse cx="92" cy="46" rx="8" ry="4" transform="rotate(25 92 46)" fill={meta.primaryColor} />

          {/* Cuerpo y Colita */}
          <ellipse cx="70" cy="92" rx={bodyWidth * 0.46} ry="24" fill={`url(#gradBody-${meta.id})`} stroke={meta.secondaryColor} strokeWidth="2" />
          <ellipse cx="70" cy="94" rx={bodyWidth * 0.26} ry="16" fill={meta.accentColor} />
          <circle cx="90" cy="100" r="4" fill="#ffffff" />

          {/* Patitas */}
          <ellipse cx="56" cy="112" rx="6" ry="5" fill="#78350f" />
          <ellipse cx="84" cy="112" rx="6" ry="5" fill="#78350f" />

          {/* Cabeza */}
          <circle cx="70" cy="52" r={headSize} fill={`url(#gradBody-${meta.id})`} stroke={meta.secondaryColor} strokeWidth="2" />
          {/* Manchas blancas de venadito */}
          <circle cx="64" cy="44" r="1.5" fill="#ffffff" />
          <circle cx="76" cy="44" r="1.5" fill="#ffffff" />
          <circle cx="70" cy="40" r="1.8" fill="#ffffff" />

          {/* Hociquito */}
          <ellipse cx="70" cy="58" rx="6" ry="4" fill="#ffffff" />
          <circle cx="70" cy="56" r="1.5" fill="#0f172a" />
          {renderMouth(70, 59)}
          {renderEyes(62, 78, 50)}
        </g>
      )}

      {/* D. GUSANO ALQUÍMICO: ASTRO */}
      {(meta.id === 'astro_caterpillar' || meta.id === 'gusano') && (
        <g>
          {/* Antenas Cósmicas con Estrellas */}
          <path d="M 64 36 Q 56 22 50 20" stroke={meta.secondaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 76 36 Q 84 22 90 20" stroke={meta.secondaryColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="50,16 52,20 56,20 53,23 54,27 50,24 46,27 47,23 44,20 48,20" fill="#fef08a" />
          <polygon points="90,16 92,20 96,20 93,23 94,27 90,24 86,27 87,23 84,20 88,20" fill="#fef08a" />

          {/* Segmentos del cuerpo cósmico */}
          <circle cx="44" cy="104" r="14" fill={meta.secondaryColor} stroke="#ffffff" strokeWidth="1" />
          <circle cx="56" cy="98" r="16" fill={meta.primaryColor} stroke="#ffffff" strokeWidth="1" />
          <circle cx="72" cy="92" r="18" fill={`url(#gradBody-${meta.id})`} stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="86" cy="84" r="16" fill={meta.accentColor} stroke="#ffffff" strokeWidth="1" />

          {/* Constelaciones trazadas en los segmentos */}
          <line x1="44" y1="104" x2="56" y2="98" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          <line x1="56" y1="98" x2="72" y2="92" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          <line x1="72" y1="92" x2="86" y2="84" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />

          {/* Cabeza redonda adorable */}
          <circle cx="70" cy="50" r={headSize + 2} fill={`url(#gradBody-${meta.id})`} stroke={meta.secondaryColor} strokeWidth="2" />
          <circle cx="58" cy="58" r="3.5" fill="#f43f5e" opacity="0.4" />
          <circle cx="82" cy="58" r="3.5" fill="#f43f5e" opacity="0.4" />
          {renderEyes(62, 78, 50)}
          {renderMouth(70, 57)}
        </g>
      )}

      {/* E. FELINO SOMBRÍO: UMBRA */}
      {(meta.id === 'umbra_cat' || meta.id === 'gatito') && (
        <g>
          {/* Orejas felinas */}
          <polygon points="50,44 42,18 62,32" fill={meta.secondaryColor} stroke={meta.secondaryColor} strokeWidth="1.5" />
          <polygon points="52,42 46,24 58,34" fill="#f472b6" />
          <polygon points="90,44 98,18 78,32" fill={meta.secondaryColor} stroke={meta.secondaryColor} strokeWidth="1.5" />
          <polygon points="88,42 94,24 82,34" fill="#f472b6" />

          {/* Cola sinuosa humeante */}
          <path
            d="M 48 106 Q 26 110 24 94 Q 22 76 34 82"
            stroke={meta.primaryColor}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cuerpo */}
          <ellipse cx="70" cy="92" rx={bodyWidth * 0.44} ry="24" fill={meta.secondaryColor} stroke="#ffffff" strokeWidth="1" />
          <ellipse cx="70" cy="94" rx={bodyWidth * 0.24} ry="16" fill={meta.accentColor} opacity="0.8" />

          {/* Patitas */}
          <ellipse cx="56" cy="112" rx="6" ry="5" fill="#ffffff" />
          <ellipse cx="84" cy="112" rx="6" ry="5" fill="#ffffff" />

          {/* Cabeza */}
          <circle cx="70" cy="52" r={headSize} fill={meta.secondaryColor} stroke="#ffffff" strokeWidth="1" />
          {/* Media luna en la frente */}
          <path d="M 68 36 A 5 5 0 0 0 72 44 A 4 4 0 0 1 68 36" fill="#fef08a" />

          {/* Bigotitos */}
          <line x1="50" y1="56" x2="40" y2="54" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          <line x1="50" y1="58" x2="40" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          <line x1="90" y1="56" x2="100" y2="54" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          <line x1="90" y1="58" x2="100" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.7" />

          {/* Naricita y boca */}
          <polygon points="68,54 72,54 70,56" fill="#f472b6" />
          {renderMouth(70, 58)}
          {renderEyes(62, 78, 50)}
        </g>
      )}

      {/* F. FÉNIX DORADO: SOLARI */}
      {meta.id === 'solari_phoenix' && (
        <g>
          {/* Alas ardientes extendidas */}
          <path
            d="M 52 70 Q 20 54 18 34 Q 38 46 54 62 Z"
            fill="url(#gradWings-solari_phoenix)"
            stroke="#b45309"
            strokeWidth="1.5"
          />
          <path
            d="M 88 70 Q 120 54 122 34 Q 102 46 86 62 Z"
            fill="url(#gradWings-solari_phoenix)"
            stroke="#b45309"
            strokeWidth="1.5"
          />

          {/* Plumas de la cola */}
          <path d="M 64 104 Q 50 126 44 130 Q 60 120 68 110 Z" fill="#ea580c" />
          <path d="M 76 104 Q 90 126 96 130 Q 80 120 72 110 Z" fill="#ea580c" />
          <path d="M 70 106 Q 70 132 70 134 Q 74 124 74 110 Z" fill="#f59e0b" />

          {/* Cuerpo */}
          <ellipse cx="70" cy="88" rx="20" ry="24" fill="url(#gradBody-solari_phoenix)" stroke="#b45309" strokeWidth="1.5" />
          <ellipse cx="70" cy="90" rx="12" ry="16" fill="#fef08a" />

          {/* Cabeza de Ave Real */}
          <circle cx="70" cy="50" r={headSize} fill="url(#gradBody-solari_phoenix)" stroke="#b45309" strokeWidth="1.5" />
          {/* Penacho real */}
          <path d="M 70 32 Q 62 14 56 12 Q 68 22 70 32 Z" fill="#dc2626" />
          <path d="M 70 32 Q 78 14 84 12 Q 72 22 70 32 Z" fill="#f59e0b" />

          {/* Pico dorado */}
          <polygon points="66,54 74,54 70,62" fill="#d97706" />
          {renderEyes(62, 78, 48)}
        </g>
      )}

      {/* G. GÓLEM DE CRISTAL: TERRA */}
      {meta.id === 'terra_golem' && (
        <g>
          {/* Hombros de Roca con Cristales de Esmeralda */}
          <polygon points="40,68 30,50 48,54" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
          <polygon points="100,68 110,50 92,54" fill="#15803d" stroke="#166534" strokeWidth="1.5" />

          {/* Brazos macizos de roca */}
          <rect x="34" y="68" width="16" height="34" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          <rect x="90" y="68" width="16" height="34" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />

          {/* Torso con Geoda Central Brillante */}
          <polygon points="50,72 90,72 84,110 56,110" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <polygon points="62,84 78,84 74,98 66,98" fill="#22c55e" className="animate-pulse" />

          {/* Cabeza cúbica / rúnica */}
          <rect x="52" y="34" width="36" height="32" rx="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          {/* Cristales en la coronilla */}
          <polygon points="62,34 66,22 70,34" fill="#22c55e" stroke="#166534" strokeWidth="1" />
          <polygon points="70,34 74,18 78,34" fill="#4ade80" stroke="#166534" strokeWidth="1" />

          {/* Ojos brillantes de gema */}
          <circle cx="62" cy="50" r="3.5" fill="#22c55e" className="animate-pulse" />
          <circle cx="78" cy="50" r="3.5" fill="#22c55e" className="animate-pulse" />
          <line x1="64" y1="58" x2="76" y2="58" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* H. AXOLOTE ÉTER: AXO */}
      {meta.id === 'axo_axolotl' && (
        <g>
          {/* Branquias emplumadas de color fucsia bioluminiscente */}
          <g>
            <path d="M 52 44 Q 32 38 28 42 Q 38 48 50 50" fill="#f43f5e" stroke="#be185d" strokeWidth="1" />
            <path d="M 50 52 Q 28 50 26 56 Q 38 60 50 58" fill="#fb7185" stroke="#be185d" strokeWidth="1" />
            <path d="M 52 60 Q 32 64 34 70 Q 42 66 52 64" fill="#fda4af" stroke="#be185d" strokeWidth="1" />

            <path d="M 88 44 Q 108 38 112 42 Q 102 48 90 50" fill="#f43f5e" stroke="#be185d" strokeWidth="1" />
            <path d="M 90 52 Q 112 50 114 56 Q 102 60 90 58" fill="#fb7185" stroke="#be185d" strokeWidth="1" />
            <path d="M 88 60 Q 108 64 106 70 Q 98 66 88 64" fill="#fda4af" stroke="#be185d" strokeWidth="1" />
          </g>

          {/* Colita ondulante con aleta transparente */}
          <path
            d="M 52 106 Q 30 112 36 126 Q 52 118 64 110 Z"
            fill="#fda4af"
            opacity="0.8"
          />

          {/* Cuerpo redondeado y suave */}
          <ellipse cx="70" cy="92" rx={bodyWidth * 0.48} ry="24" fill="url(#gradBody-axo_axolotl)" stroke="#be185d" strokeWidth="1.5" />
          <ellipse cx="70" cy="94" rx={bodyWidth * 0.28} ry="16" fill="#fce7f3" />

          {/* Patitas palmeadas */}
          <ellipse cx="56" cy="112" rx="6" ry="4" fill="#f43f5e" />
          <ellipse cx="84" cy="112" rx="6" ry="4" fill="#f43f5e" />

          {/* Cabeza ancha y adorable */}
          <ellipse cx="70" cy="54" rx={headSize + 2} ry={headSize - 2} fill="url(#gradBody-axo_axolotl)" stroke="#be185d" strokeWidth="1.5" />
          {/* Chapitas rosas vivas */}
          <circle cx="56" cy="58" r="4" fill="#f43f5e" opacity="0.6" />
          <circle cx="84" cy="58" r="4" fill="#f43f5e" opacity="0.6" />

          {renderEyes(62, 78, 52)}
          {renderMouth(70, 60)}
        </g>
      )}

      {/* Partículas elementales flotantes según la raza */}
      <circle cx="34" cy="30" r="1.8" fill={meta.primaryColor} opacity="0.7" className="animate-ping" />
      <circle cx="106" cy="36" r="2.2" fill={meta.accentColor} opacity="0.8" className="animate-ping" style={{ animationDelay: '0.8s' }} />
    </svg>
  );
};
