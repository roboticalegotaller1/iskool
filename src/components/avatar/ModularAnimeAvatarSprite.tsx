"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
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
  showPedestal?: boolean;
  zoom?: 'full' | 'face' | 'upper';
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  className?: string;
}

// Cache global de imágenes para rendimiento instantáneo a 60fps
const imgCache: Record<string, HTMLImageElement> = {};
function loadImg(src: string): Promise<HTMLImageElement> {
  if (imgCache[src] && imgCache[src].complete) {
    return Promise.resolve(imgCache[src]);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgCache[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgbArr(hex: string): [number, number, number] {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) cleaned = cleaned.split('').map(c => c + c).join('');
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const ModularAnimeAvatarSprite: React.FC<ModularAnimeAvatarSpriteProps> = ({
  gender = 'male',
  skinTone = '#FED7AA',
  hairStyle = 'spiky',
  hairColor = '#111827',
  eyesStyle = 'determined',
  raceFeature = 'human',
  bodyScale = 'normal',
  equippedShoes = 'shoes_tan_boots',
  equippedBottom = 'bottom_ripped_jeans',
  equippedTop = 'top_dia_de_muertos',
  equippedOuterwear = 'outerwear_none',
  equippedHat = 'hat_snapback_trainer',
  equippedAccessory = 'acc_none',
  animationState = 'idle',
  showPedestal = false,
  zoom = 'full',
  width,
  height,
  className = 'w-full h-full'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados de interacción 3D interactiva con cursor/touch
  const [rotate3D, setRotate3D] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickReaction, setClickReaction] = useState(false);

  // Paleta de color de piel
  const skinRgb: [number, number, number] = useMemo(() => {
    const found = AVATAR_SKIN_TONES.find(
      t => t.id === skinTone || t.value?.toLowerCase() === skinTone?.toLowerCase()
    );
    const hex = found?.value || (skinTone && skinTone.startsWith('#') ? skinTone : '#FED7AA');
    return hexToRgbArr(hex);
  }, [skinTone]);

  // Paleta de color de cabello
  const hairRgb: [number, number, number] = useMemo(() => {
    const found = AVATAR_HAIR_COLORS.find(
      c => c.id === hairColor || c.value?.toLowerCase() === hairColor?.toLowerCase()
    );
    const hex = found?.value || (hairColor && hairColor.startsWith('#') ? hairColor : '#111827');
    return hexToRgbArr(hex);
  }, [hairColor]);

  const hairHex = useMemo(() => {
    const found = AVATAR_HAIR_COLORS.find(
      c => c.id === hairColor || c.value?.toLowerCase() === hairColor?.toLowerCase()
    );
    return found?.value || (hairColor && hairColor.startsWith('#') ? hairColor : '#111827');
  }, [hairColor]);

  const hairDarkHex = useMemo(() => {
    const [r, g, b] = hairRgb;
    const dr = Math.max(0, Math.round(r * 0.6)).toString(16).padStart(2, '0');
    const dg = Math.max(0, Math.round(g * 0.6)).toString(16).padStart(2, '0');
    const db = Math.max(0, Math.round(b * 0.6)).toString(16).padStart(2, '0');
    return `#${dr}${dg}${db}`;
  }, [hairRgb]);

  const hairLightHex = useMemo(() => {
    const [r, g, b] = hairRgb;
    const lr = Math.min(255, Math.round(r * 1.35 + 30)).toString(16).padStart(2, '0');
    const lg = Math.min(255, Math.round(g * 1.35 + 30)).toString(16).padStart(2, '0');
    const lb = Math.min(255, Math.round(b * 1.35 + 30)).toString(16).padStart(2, '0');
    return `#${lr}${lg}${lb}`;
  }, [hairRgb]);

  const skinHex = useMemo(() => {
    const [r, g, b] = skinRgb;
    const sr = r.toString(16).padStart(2, '0');
    const sg = g.toString(16).padStart(2, '0');
    const sb = b.toString(16).padStart(2, '0');
    return `#${sr}${sg}${sb}`;
  }, [skinRgb]);

  // Color de pantalones según la prenda equipada
  const pantsRgb: [number, number, number] = useMemo(() => {
    if (equippedBottom === 'bottom_basic') return [30, 41, 59]; // Pantalón formal escolar oscuro
    if (equippedBottom === 'bottom_blue_jeans') return [29, 78, 216]; // Jeans clásicos azules
    if (equippedBottom === 'bottom_dark_slacks') return [10, 10, 12]; // Pantalón negro élite
    if (equippedBottom === 'bottom_tactical_joggers') return [63, 79, 56]; // Joggers verdes tácticos
    if (equippedBottom === 'bottom_witch_skirt') return [59, 7, 100]; // Falda morada hechicera
    return [37, 99, 235]; // bottom_ripped_jeans (denim azul base)
  }, [equippedBottom]);

  // Color de calzado según la prenda equipada
  const bootsRgb: [number, number, number] = useMemo(() => {
    if (equippedShoes === 'shoes_sneakers') return [220, 38, 38]; // Tenis urbanos rojos
    if (equippedShoes === 'shoes_combat') return [20, 20, 24]; // Botas combate negras
    if (equippedShoes === 'shoes_basic') return [15, 23, 42]; // Zapatos escolares oscuros
    if (equippedShoes === 'shoes_iron_greaves' || equippedShoes === 'shoes_paladin_boots') return [203, 213, 225]; // Grebas acero plata
    if (equippedShoes === 'shoes_witch_boots') return [107, 33, 168]; // Botas bruja terciopelo morado
    if (equippedShoes === 'shoes_winged_sandals') return [251, 191, 36]; // Sandalias aladas oro radiante
    return [217, 119, 6]; // shoes_tan_boots (botas nubuck trigo miel)
  }, [equippedShoes]);

  // Renderizado dinámico en tiempo real en Canvas de alta fidelidad
  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      try {
        const isFemale = gender === 'female';
        const isNeutral = gender === 'neutral';

        const HAIR_ASSET_MAP: Record<string, string> = {
          straight_long: 'straight_long',
          ponytail: 'ponytail',
          twin_braids: 'twin_braids',
          wavy_long: 'wavy_long',
          bob: 'bob',
          witch_curls: 'witch_curls',
          wild_mane: 'wild_mane',
          afro: 'afro',
          dreadlocks: 'dreadlocks',
          sidecut: 'sidecut',
          pixie: 'bob',
          shaggy: 'wild_mane',
          short_clean: 'sidecut',
          space_buns: 'twin_braids',
          bantu_knots: 'afro'
        };

        // El estilo 'spiky' representa el peinado canónico/natural de cada modelo
        const hairAssetKey = hairStyle !== 'spiky' ? (HAIR_ASSET_MAP[hairStyle] || null) : null;
        const prefix = isFemale ? 'female' : isNeutral ? 'neutral' : 'male';

        const v = '?v=20260915_zero_collar_final';
        const baseSrc = (hairAssetKey
          ? `/images/avatar/hairstyles/trainer_${prefix}_${hairAssetKey}.png`
          : isFemale 
          ? '/images/avatar/trainer_female_clean.png' 
          : isNeutral
          ? '/images/avatar/trainer_neutral_clean.png' 
          : '/images/avatar/trainer_base_clean.png') + v;

        const skinMaskSrc = (isFemale 
          ? '/images/avatar/trainer_female_skin_mask.png' 
          : isNeutral
          ? '/images/avatar/trainer_neutral_skin_mask.png' 
          : '/images/avatar/trainer_clean_skin_mask.png') + v;

        const hairMaskSrc = (hairAssetKey
          ? `/images/avatar/hairstyles/trainer_${prefix}_${hairAssetKey}_hair_mask.png`
          : isFemale 
          ? '/images/avatar/trainer_female_hair_mask.png' 
          : isNeutral
          ? '/images/avatar/trainer_neutral_hair_mask.png' 
          : '/images/avatar/trainer_hair_mask.png') + v;

        const pantsMaskSrc = (isFemale 
          ? '/images/avatar/trainer_female_pants_mask.png' 
          : isNeutral
          ? '/images/avatar/trainer_neutral_pants_mask.png' 
          : '/images/avatar/trainer_pants_mask.png') + v;

        const bootsMaskSrc = (isFemale 
          ? '/images/avatar/trainer_female_boots_mask.png' 
          : isNeutral
          ? '/images/avatar/trainer_neutral_boots_mask.png' 
          : '/images/avatar/trainer_boots_mask.png') + v;

        const [baseImg, skinMask, hairMask, pantsMask, bootsMask] = await Promise.all([
          loadImg(baseSrc),
          loadImg(skinMaskSrc),
          loadImg(hairMaskSrc),
          loadImg(pantsMaskSrc),
          loadImg(bootsMaskSrc)
        ]);

        if (!isMounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const w = baseImg.naturalWidth || 768;
        const h = baseImg.naturalHeight || 1376;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        // 1. Dibujar imagen base sin fondo con cabello natural integrado
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(baseImg, 0, 0, w, h);

        const baseData = ctx.getImageData(0, 0, w, h);

        // 2. Cargar máscaras a canvas temporales para lectura rápida de canales
        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tmpCtx = tmp.getContext('2d');
        if (!tmpCtx) return;

        tmpCtx.drawImage(skinMask, 0, 0, w, h);
        const smData = tmpCtx.getImageData(0, 0, w, h).data;

        tmpCtx.clearRect(0, 0, w, h);
        tmpCtx.drawImage(hairMask, 0, 0, w, h);
        const hmData = tmpCtx.getImageData(0, 0, w, h).data;

        tmpCtx.clearRect(0, 0, w, h);
        tmpCtx.drawImage(pantsMask, 0, 0, w, h);
        const pmData = tmpCtx.getImageData(0, 0, w, h).data;

        tmpCtx.clearRect(0, 0, w, h);
        tmpCtx.drawImage(bootsMask, 0, 0, w, h);
        const bmData = tmpCtx.getImageData(0, 0, w, h).data;

        const bd = baseData.data;
        const total = w * h;

        const isDefaultSkin = skinRgb[0] === 254 && skinRgb[1] === 215 && skinRgb[2] === 170;
        const isDefaultPants = equippedBottom === 'bottom_ripped_jeans';
        const isDefaultBoots = equippedShoes === 'shoes_tan_boots';
        const isDefaultHair = hairRgb[0] === 17 && hairRgb[1] === 24 && hairRgb[2] === 39;

        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          if (bd[idx + 3] < 40) continue; // Píxel transparente exterior

          const br = bd[idx];
          const bg = bd[idx + 1];
          const bb = bd[idx + 2];
          const lum = 0.299 * br + 0.587 * bg + 0.114 * bb;

          // A) Piel dinámica
          if (!isDefaultSkin && smData[idx] > 128) {
            const f = lum / 199;
            bd[idx] = Math.min(255, Math.max(0, Math.round(skinRgb[0] * f)));
            bd[idx + 1] = Math.min(255, Math.max(0, Math.round(skinRgb[1] * f)));
            bd[idx + 2] = Math.min(255, Math.max(0, Math.round(skinRgb[2] * f)));
          }
          // B) Cabello dinámico (Coloreado anatómico de alta fidelidad según género)
          else if (hmData[idx] > 50) {
            if (!isDefaultHair) {
              const hairNorm = (isNeutral && !hairAssetKey) ? 200 : isFemale ? 75 : 85;
              const f = lum / hairNorm;
              bd[idx] = Math.min(255, Math.max(0, Math.round(hairRgb[0] * f)));
              bd[idx + 1] = Math.min(255, Math.max(0, Math.round(hairRgb[1] * f)));
              bd[idx + 2] = Math.min(255, Math.max(0, Math.round(hairRgb[2] * f)));
            }
          }
          // C) Pantalones modulares
          else if (!isDefaultPants && pmData[idx] > 128) {
            const f = lum / 120;
            bd[idx] = Math.min(255, Math.max(0, Math.round(pantsRgb[0] * f)));
            bd[idx + 1] = Math.min(255, Math.max(0, Math.round(pantsRgb[1] * f)));
            bd[idx + 2] = Math.min(255, Math.max(0, Math.round(pantsRgb[2] * f)));
          }
          // D) Calzado modular
          else if (!isDefaultBoots && bmData[idx] > 128) {
            const f = lum / 140;
            bd[idx] = Math.min(255, Math.max(0, Math.round(bootsRgb[0] * f)));
            bd[idx + 1] = Math.min(255, Math.max(0, Math.round(bootsRgb[1] * f)));
            bd[idx + 2] = Math.min(255, Math.max(0, Math.round(bootsRgb[2] * f)));
          }
        }

        ctx.putImageData(baseData, 0, 0);
      } catch (err) {
        console.error('Error rendering modular avatar canvas:', err);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [gender, skinRgb, hairRgb, pantsRgb, bootsRgb, equippedBottom, equippedShoes, hairStyle]);

  // Manejo de interacción de inclinación 3D con cursor
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setRotate3D({
      y: Math.max(-14, Math.min(14, deltaX * 14)),
      x: Math.max(-8, Math.min(8, -deltaY * 8))
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setRotate3D({ x: 0, y: 0 });
  }, []);

  const handleAvatarClick = useCallback(() => {
    setClickReaction(true);
    setTimeout(() => setClickReaction(false), 500);
  }, []);

  // Zoom transform calibrado para centrar exactamente el rostro y mirada en la cámara
  const zoomStyle = zoom === 'face' 
    ? 'translateY(34%) scale(2.45)' 
    : zoom === 'upper' 
    ? 'translateY(12%) scale(1.5)' 
    : 'scale(1)';

  const zoomOrigin = zoom === 'face' ? '50% 16%' : zoom === 'upper' ? '50% 25%' : '50% 50%';

  const bodyScaleTransform = useMemo(() => {
    if (bodyScale === 'compact') {
      return 'scale(0.82, 0.84) translateY(4%)';
    }
    if (bodyScale === 'tall') {
      return 'scale(0.96, 0.98) translateY(2%)';
    }
    return 'scale(0.91, 0.91) translateY(2%)';
  }, [bodyScale]);

  // Coordenadas oculares calibradas con precisión milimétrica dentro de las cuencas anatómicas
  const eyeCoords = useMemo(() => {
    if (gender === 'female') {
      return {
        left: { cx: 349, cy: 196, rx: 12, ry: 11 },
        right: { cx: 416, cy: 196, rx: 12, ry: 11 },
        isFemale: true,
        leftSocket: 'M 368,199 C 364,190 357,186 349,186 C 340,186 334,190 329,195 C 334,201.5 341,205 349,205 C 357,205 364,202.5 368,199 Z',
        rightSocket: 'M 398,199 C 402,190 409,186 416,186 C 425,186 431,190 436,195 C 431,201.5 424,205 416,205 C 408,205 402,202.5 398,199 Z',
        leftLid: 'M 368,199 C 363,189.5 356,185.5 349,185.5 C 340,185.5 333,189.5 327,194 L 323,191.5 C 328,188.5 336,185 349,185 C 358,185 365,189 368,199 Z',
        rightLid: 'M 398,199 C 403,189.5 410,185.5 416,185.5 C 425,185.5 432,189.5 438,194 L 442,191.5 C 437,188.5 429,185 416,185 C 408,185 401,189 398,199 Z'
      };
    }
    if (gender === 'neutral') {
      return {
        left: { cx: 356, cy: 198, rx: 8.5, ry: 9 },
        right: { cx: 412, cy: 198, rx: 8.5, ry: 9 },
        isFemale: false,
        leftSocket: 'M 340,198 Q 356,189 372,198 Q 356,207 340,198 Z',
        rightSocket: 'M 396,198 Q 412,189 428,198 Q 412,207 396,198 Z',
        leftLid: 'M 372,198 Q 356,189 340,198',
        rightLid: 'M 396,198 Q 412,189 428,198'
      };
    }
    return {
      left: { cx: 355, cy: 200, rx: 8.5, ry: 9 },
      right: { cx: 412, cy: 200, rx: 8.5, ry: 9 },
      isFemale: false,
      leftSocket: 'M 340,198 Q 355,193 370,201 Q 355,206 340,198 Z',
      rightSocket: 'M 398,201 Q 412,193 428,198 Q 412,206 398,201 Z',
      leftLid: 'M 370,201 Q 355,193 340,198',
      rightLid: 'M 398,201 Q 412,193 428,198'
    };
  }, [gender]);

  // Estado de pose activa para animación de emotes estilo Fortnite
  const isCombat = animationState === 'pose';
  const isPower = animationState === 'cast';
  const isCheer = animationState === 'cheer';
  const isWalk = animationState === 'walk';

  // =========================================================================
  // 1. RENDERIZADO MODULAR DE FORMAS Y EXPRESIONES DE OJOS ANIME
  // ACOPLADOS CON PRECISIÓN MILIMÉTRICA MEDIANTE MÁSCARAS DE RECORTE SVG
  // =========================================================================
  const renderEyes = () => {
    const { left, right, isFemale, leftSocket, rightSocket, leftLid, rightLid } = eyeCoords;
    const lidStroke = isFemale ? "3.8" : "3";

    // El modelo femenino y sus peinados ya tienen los ojos removidos y la piel limpia
    const renderFemaleSkinBase = () => null;

    const renderUpperScleraShadow = (side: 'left' | 'right') => {
      if (!isFemale) return null;
      if (side === 'left') {
        return <path d="M 368,199 C 364,190 357,186 349,186 C 340,186 334,190 329,195 L 329,186 L 368,186 Z" fill="#64748B" opacity="0.32" />;
      }
      return <path d="M 398,199 C 402,190 409,186 416,186 C 425,186 431,190 436,195 L 436,186 L 398,186 Z" fill="#64748B" opacity="0.32" />;
    };

    const renderLid = (side: 'left' | 'right') => {
      const pathD = side === 'left' ? leftLid : rightLid;
      if (isFemale) {
        return <path d={pathD} fill="#0F172A" />;
      }
      return <path d={pathD} fill="none" stroke="#0F172A" strokeWidth={lidStroke} strokeLinecap="round" strokeLinejoin="round" />;
    };

    const renderFemaleLashes = () => {
      if (!isFemale) return null;
      return (
        <>
          {/* Pestañas aladas exteriores sutiles y elegantes */}
          <path d="M 327,194 L 322,191 L 326,188 Z" fill="#0F172A" />
          <path d="M 438,194 L 443,191 L 439,188 Z" fill="#0F172A" />
          {/* Párpado inferior delicado */}
          <path d="M 364,201 C 360,203.5 355,205 349,205 C 343,205 337,203.5 333,200" fill="none" stroke="#0F172A" strokeWidth="1.5" opacity="0.75" strokeLinecap="round" />
          <path d="M 401,201 C 405,203.5 410,205 416,205 C 422,205 428,203.5 432,200" fill="none" stroke="#0F172A" strokeWidth="1.5" opacity="0.75" strokeLinecap="round" />
          {/* Pliegue del párpado superior anime */}
          <path d="M 363,181 Q 349,177.5 336,181" fill="none" stroke="#9A3412" strokeWidth="1.2" opacity="0.32" strokeLinecap="round" />
          <path d="M 402,181 Q 416,177.5 429,181" fill="none" stroke="#9A3412" strokeWidth="1.2" opacity="0.32" strokeLinecap="round" />
        </>
      );
    };

    const renderIrisLayers = (cx: number, cy: number, rx: number, ry: number, darkCol: string, midCol: string, glowCol: string) => (
      <>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={darkCol} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#090E1F" strokeWidth="1.2" />
        <ellipse cx={cx} cy={cy + 1.5} rx={rx - 1.5} ry={ry - 2} fill={midCol} />
        <path d={`M ${cx - 7},${cy + 4} Q ${cx},${cy + 8.5} ${cx + 7},${cy + 4}`} fill="none" stroke={glowCol} strokeWidth="2" opacity="0.9" strokeLinecap="round" />
        <circle cx={cx} cy={cy - 0.5} r="4.2" fill="#090E1F" />
        <circle cx={cx - 3.8} cy={cy - 3.5} r="3" fill="#FFFFFF" />
        <circle cx={cx + 4.2} cy={cy + 3.5} r="1.6" fill="#FFFFFF" opacity="0.9" />
      </>
    );

    const renderSocketDefs = () => (
      <defs>
        <clipPath id="eyeSocketLeft">
          <path d={leftSocket} />
        </clipPath>
        <clipPath id="eyeSocketRight">
          <path d={rightSocket} />
        </clipPath>
      </defs>
    );

    if (eyesStyle === 'determined') {
      if (!isFemale) {
        return null; // Los ojos nativos de masculino y neutro se lucen sin superposición
      }
      return (
        <g id="eyes_determined_female">
          {renderFemaleSkinBase()}
          {renderSocketDefs()}
          <g clipPath="url(#eyeSocketLeft)">
            <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#F8FAFC" />
            {renderUpperScleraShadow('left')}
            {renderIrisLayers(left.cx, left.cy, left.rx, left.ry, '#0F172A', '#1D4ED8', '#38BDF8')}
          </g>
          {renderLid('left')}

          <g clipPath="url(#eyeSocketRight)">
            <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#F8FAFC" />
            {renderUpperScleraShadow('right')}
            {renderIrisLayers(right.cx, right.cy, right.rx, right.ry, '#0F172A', '#1D4ED8', '#38BDF8')}
          </g>
          {renderLid('right')}
          {renderFemaleLashes()}
        </g>
      );
    }

    switch (eyesStyle) {
      case 'cheerful': // Alegres y Radiantes (Sonrisa anime con ojos curvados cerrados ^_^)
        return (
          <g id="eyes_cheerful">
            {/* Parches del párpado superior integrado con la piel (masculino/neutro) */}
            {!isFemale && (
              <>
                <path d={`M ${left.cx - 15},${left.cy - 5} Q ${left.cx},${left.cy - 8} ${left.cx + 15},${left.cy - 5} L ${left.cx + 14},${left.cy + 5} Q ${left.cx},${left.cy + 7} ${left.cx - 14},${left.cy + 5} Z`} fill={skinHex} />
                <path d={`M ${right.cx - 15},${right.cy - 5} Q ${right.cx},${right.cy - 8} ${right.cx + 15},${right.cy - 5} L ${right.cx + 14},${right.cy + 5} Q ${right.cx},${right.cy + 7} ${right.cx - 14},${right.cy + 5} Z`} fill={skinHex} />
              </>
            )}
            {/* Rubor delicado en las mejillas */}
            <ellipse cx={left.cx - 7} cy={left.cy + 18} rx="11" ry="5.5" fill="#F43F5E" opacity="0.4" />
            <ellipse cx={right.cx + 7} cy={right.cy + 18} rx="11" ry="5.5" fill="#F43F5E" opacity="0.4" />
            {/* Arcos curvados anime en las cuencas */}
            {isFemale ? (
              <>
                <path d="M 330,197 Q 349,187 368,197" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 328,195 Q 325,191 322,189" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                <path d="M 398,197 Q 416,187 436,197" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 438,195 Q 441,191 444,189" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth={lidStroke} strokeLinecap="round" />
                <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth={lidStroke} strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'wink': // Guiño Pícaro (>_• con destello)
        return (
          <g id="eyes_wink">
            {renderSocketDefs()}
            {/* Ojo izquierdo abierto con iris zafiro brillante y destello */}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#F8FAFC" />
              {renderUpperScleraShadow('left')}
              {renderIrisLayers(left.cx, left.cy, left.rx, left.ry, '#082F49', '#0284C7', '#38BDF8')}
              <polygon points={`${left.cx},${left.cy - 5} ${left.cx + 2.5},${left.cy - 1} ${left.cx + 5},${left.cy} ${left.cx + 2.5},${left.cy + 1} ${left.cx},${left.cy + 5} ${left.cx - 2.5},${left.cy + 1} ${left.cx - 5},${left.cy} ${left.cx - 2.5},${left.cy - 1}`} fill="#FFFFFF" />
            </g>
            {renderLid('left')}
            {isFemale && (
              <>
                <path d="M 327,194 L 322,191 L 326,188 Z" fill="#0F172A" />
                <path d="M 364,201 C 360,203.5 355,205 349,205 C 343,205 337,203.5 333,200" fill="none" stroke="#0F172A" strokeWidth="1.5" opacity="0.75" strokeLinecap="round" />
                <path d="M 363,181 Q 349,177.5 336,181" fill="none" stroke="#9A3412" strokeWidth="1.2" opacity="0.32" strokeLinecap="round" />
              </>
            )}

            {/* Ojo derecho guiñado en arco anime */}
            {!isFemale && (
              <path d={`M ${right.cx - 15},${right.cy - 5} Q ${right.cx},${right.cy - 8} ${right.cx + 15},${right.cy - 5} L ${right.cx + 14},${right.cy + 5} Q ${right.cx},${right.cy + 7} ${right.cx - 14},${right.cy + 5} Z`} fill={skinHex} />
            )}
            {isFemale ? (
              <>
                <path d="M 398,197 Q 416,187 436,197" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 438,195 Q 441,191 444,189" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth={lidStroke} strokeLinecap="round" />
            )}
            <ellipse cx={right.cx + 7} cy={right.cy + 18} rx="11" ry="5.5" fill="#F43F5E" opacity="0.4" />
          </g>
        );

      case 'cat_eyes': // Felinos de Cazador (Pupilas verticales felinas y reflejos dorados)
        return (
          <g id="eyes_cat">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#FFFBEB" />
              {renderUpperScleraShadow('left')}
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#78350F" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="none" stroke="#451A03" strokeWidth="1.2" />
              <ellipse cx={left.cx} cy={left.cy + 1.5} rx={left.rx - 1.5} ry={left.ry - 2} fill="#D97706" />
              <ellipse cx={left.cx} cy={left.cy} rx="2.5" ry={left.ry * 0.75} fill="#09090B" />
              <path d={`M ${left.cx - 7},${left.cy + 4} Q ${left.cx},${left.cy + 8.5} ${left.cx + 7},${left.cy + 4}`} fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={left.cx - 3.8} cy={left.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('left')}

            <g clipPath="url(#eyeSocketRight)">
              <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#FFFBEB" />
              {renderUpperScleraShadow('right')}
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#78350F" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="none" stroke="#451A03" strokeWidth="1.2" />
              <ellipse cx={right.cx} cy={right.cy + 1.5} rx={right.rx - 1.5} ry={right.ry - 2} fill="#D97706" />
              <ellipse cx={right.cx} cy={right.cy} rx="2.5" ry={right.ry * 0.75} fill="#09090B" />
              <path d={`M ${right.cx - 7},${right.cy + 4} Q ${right.cx},${right.cy + 8.5} ${right.cx + 7},${right.cy + 4}`} fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={right.cx - 3.8} cy={right.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('right')}
            {renderFemaleLashes()}
          </g>
        );

      case 'flame': // Fuego Ardiente (Pupilas de llama ámbar con fuego vivo)
        return (
          <g id="eyes_flame">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#FEF2F2" />
              {renderUpperScleraShadow('left')}
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#7F1D1D" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="none" stroke="#450A0A" strokeWidth="1.2" />
              <ellipse cx={left.cx} cy={left.cy + 1.5} rx={left.rx - 1.5} ry={left.ry - 2} fill="#DC2626" />
              <path d={`M ${left.cx - 7},${left.cy + 4} Q ${left.cx},${left.cy + 8.5} ${left.cx + 7},${left.cy + 4}`} fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={left.cx} cy={left.cy - 0.5} r="4.2" fill="#09090B" />
              <polygon points={`${left.cx},${left.cy - 4} ${left.cx + 2},${left.cy} ${left.cx - 1},${left.cy + 3} ${left.cx - 2.5},${left.cy - 1}`} fill="#FEF08A" />
              <circle cx={left.cx - 3.8} cy={left.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('left')}

            <g clipPath="url(#eyeSocketRight)">
              <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#FEF2F2" />
              {renderUpperScleraShadow('right')}
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#7F1D1D" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="none" stroke="#450A0A" strokeWidth="1.2" />
              <ellipse cx={right.cx} cy={right.cy + 1.5} rx={right.rx - 1.5} ry={right.ry - 2} fill="#DC2626" />
              <path d={`M ${right.cx - 7},${right.cy + 4} Q ${right.cx},${right.cy + 8.5} ${right.cx + 7},${right.cy + 4}`} fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={right.cx} cy={right.cy - 0.5} r="4.2" fill="#09090B" />
              <polygon points={`${right.cx},${right.cy - 4} ${right.cx + 2},${right.cy} ${right.cx - 1},${right.cy + 3} ${right.cx - 2.5},${right.cy - 1}`} fill="#FEF08A" />
              <circle cx={right.cx - 3.8} cy={right.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('right')}
            {renderFemaleLashes()}
          </g>
        );

      case 'lightning': // Relámpago Celeste (Pupilas eléctricas celestes acopladas con precisión)
        return (
          <g id="eyes_lightning">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#F0F9FF" />
              {renderUpperScleraShadow('left')}
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#082F49" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="none" stroke="#031E30" strokeWidth="1.2" />
              <ellipse cx={left.cx} cy={left.cy + 1.5} rx={left.rx - 1.5} ry={left.ry - 2} fill="#0284C7" />
              <path d={`M ${left.cx - 7},${left.cy + 4} Q ${left.cx},${left.cy + 8.5} ${left.cx + 7},${left.cy + 4}`} fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={left.cx} cy={left.cy - 0.5} r="4.2" fill="#09090B" />
              <polygon points={`${left.cx},${left.cy - 4} ${left.cx + 2.5},${left.cy - 1} ${left.cx},${left.cy} ${left.cx + 1.5},${left.cy + 4} ${left.cx - 1.5},${left.cy + 1} ${left.cx},${left.cy}`} fill="#FFFFFF" />
              <circle cx={left.cx - 3.8} cy={left.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('left')}

            <g clipPath="url(#eyeSocketRight)">
              <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#F0F9FF" />
              {renderUpperScleraShadow('right')}
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#082F49" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="none" stroke="#031E30" strokeWidth="1.2" />
              <ellipse cx={right.cx} cy={right.cy + 1.5} rx={right.rx - 1.5} ry={right.ry - 2} fill="#0284C7" />
              <path d={`M ${right.cx - 7},${right.cy + 4} Q ${right.cx},${right.cy + 8.5} ${right.cx + 7},${right.cy + 4}`} fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.9" strokeLinecap="round" />
              <circle cx={right.cx} cy={right.cy - 0.5} r="4.2" fill="#09090B" />
              <polygon points={`${right.cx},${right.cy - 4} ${right.cx + 2.5},${right.cy - 1} ${right.cx},${right.cy} ${right.cx + 1.5},${right.cy + 4} ${right.cx - 1.5},${right.cy + 1} ${right.cx},${right.cy}`} fill="#FFFFFF" />
              <circle cx={right.cx - 3.8} cy={right.cy - 3.5} r="2.8" fill="#FFFFFF" />
            </g>
            {renderLid('right')}
            {renderFemaleLashes()}
          </g>
        );

      case 'heterochromia': // Heterocromía Bicolor (Izquierdo dorado, Derecho cian)
        return (
          <g id="eyes_heterochromia">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#FFFBEB" />
              {renderUpperScleraShadow('left')}
              {renderIrisLayers(left.cx, left.cy, left.rx, left.ry, '#451A03', '#D97706', '#FDE047')}
            </g>
            {renderLid('left')}

            <g clipPath="url(#eyeSocketRight)">
              <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#F0FDFA" />
              {renderUpperScleraShadow('right')}
              {renderIrisLayers(right.cx, right.cy, right.rx, right.ry, '#082F49', '#0284C7', '#38BDF8')}
            </g>
            {renderLid('right')}
            {renderFemaleLashes()}
          </g>
        );

      case 'emerald':
      case 'ruby':
      case 'sapphire':
      case 'amethyst':
      case 'mysterious':
      case 'scholar':
      case 'nebula_eyes':
      case 'sparkle':
      default: {
        const palette = {
          emerald: { dark: '#064E3B', mid: '#059669', glow: '#6EE7B7' },
          ruby: { dark: '#7F1D1D', mid: '#DC2626', glow: '#FCA5A5' },
          sapphire: { dark: '#08152B', mid: '#1D4ED8', glow: '#60A5FA' },
          scholar: { dark: '#134E4A', mid: '#0D9488', glow: '#5EEAD4' },
          nebula_eyes: { dark: '#3B0764', mid: '#7C3AED', glow: '#C084FC' },
          sparkle: { dark: '#1E1B4B', mid: '#4F46E5', glow: '#818CF8' },
          amethyst: { dark: '#3B0764', mid: '#9333EA', glow: '#D8B4FE' },
          mysterious: { dark: '#3B0764', mid: '#9333EA', glow: '#C084FC' },
        }[eyesStyle] || { dark: '#08152B', mid: '#1D4ED8', glow: '#38BDF8' };

        return (
          <g id="eyes_colored">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x={left.cx - 30} y={left.cy - 16} width="60" height="35" fill="#F8FAFC" />
              {renderUpperScleraShadow('left')}
              {renderIrisLayers(left.cx, left.cy, left.rx, left.ry, palette.dark, palette.mid, palette.glow)}
            </g>
            {renderLid('left')}

            <g clipPath="url(#eyeSocketRight)">
              <rect x={right.cx - 30} y={right.cy - 16} width="60" height="35" fill="#F8FAFC" />
              {renderUpperScleraShadow('right')}
              {renderIrisLayers(right.cx, right.cy, right.rx, right.ry, palette.dark, palette.mid, palette.glow)}
            </g>
            {renderLid('right')}
            {renderFemaleLashes()}
          </g>
        );
      }
    }
  };

  // =========================================================================
  // 2. RENDERIZADO MODULAR DE CALZADO ESPECIALIZADO (FOOTWEAR)
  // TRANSFORMACIÓN COMPLETA Y VISIBLE AL 100% SIN RESIDUOS DE BOTA BASE
  // =========================================================================
  const renderFootwear = () => {
    switch (equippedShoes) {
      case 'shoes_winged_sandals': // Sandalias Aladas de Hermes
        return (
          <g id="footwear_winged_sandals_layer">
            {/* Greba Izquierda (Calf Guard con tiras cruzadas) */}
            <path d="M 238,1005 C 275,1035 335,1035 358,1005 L 358,1125 L 240,1125 Z" fill="#F59E0B" stroke="#09090B" strokeWidth="3" />
            <path d="M 248,1015 L 350,1015 L 350,1118 L 248,1118 Z" fill="#FBBF24" />
            <line x1="248" y1="1025" x2="350" y2="1110" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="350" y1="1025" x2="248" y2="1110" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="299" cy="1067" r="6" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
            <circle cx="299" cy="1067" r="3" fill="#FEF08A" />

            {/* Bota/Sandalia Izquierda completa */}
            <path d="M 240,1120 L 358,1120 L 356,1224 L 290,1218 L 182,1218 C 168,1218 168,1185 192,1180 L 240,1120 Z" fill="#F59E0B" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 248,1130 L 348,1130 L 346,1212 L 285,1206 L 195,1206 L 246,1130 Z" fill="#FBBF24" />
            <path d="M 210,1190 Q 250,1170 295,1195" fill="none" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            <path d="M 245,1150 Q 280,1140 315,1165" fill="none" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            <path d="M 180,1216 L 358,1222 L 354,1234 L 180,1228 Z" fill="#B45309" stroke="#09090B" strokeWidth="3" />

            {/* Greba Derecha (Calf Guard con tiras cruzadas) */}
            <path d="M 464,1005 C 485,1035 545,1035 566,1005 L 566,1125 L 464,1125 Z" fill="#F59E0B" stroke="#09090B" strokeWidth="3" />
            <path d="M 472,1015 L 558,1015 L 558,1118 L 472,1118 Z" fill="#FBBF24" />
            <line x1="472" y1="1025" x2="558" y2="1110" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="558" y1="1025" x2="472" y2="1110" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="515" cy="1067" r="6" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
            <circle cx="515" cy="1067" r="3" fill="#FEF08A" />

            {/* Bota/Sandalia Derecha completa */}
            <path d="M 464,1120 L 566,1120 L 568,1252 L 464,1252 Z" fill="#F59E0B" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 472,1130 L 558,1130 L 560,1242 L 472,1242 Z" fill="#FBBF24" />
            <path d="M 475,1165 Q 515,1155 555,1165" fill="none" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            <path d="M 475,1205 Q 515,1195 555,1205" fill="none" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            <path d="M 462,1248 L 570,1250 L 566,1264 L 462,1260 Z" fill="#B45309" stroke="#09090B" strokeWidth="3" />

            {/* Ala Izquierda de Hermes */}
            <g transform="translate(242, 1115)" className="animate-pulse">
              <path d="M 0,0 C -35,-20 -75,-80 -55,-110 C -30,-80 -10,-40 0,-15 Z" fill="#FFFFFF" stroke="#D97706" strokeWidth="3" />
              <path d="M -8,-20 C -50,-50 -85,-105 -65,-130 C -40,-95 -20,-50 -5,-30 Z" fill="#FEF08A" stroke="#D97706" strokeWidth="2.5" />
              <path d="M -16,-40 C -75,-80 -105,-135 -85,-155 C -60,-125 -30,-70 -12,-50 Z" fill="#FFFFFF" stroke="#EAB308" strokeWidth="3" />
              <circle cx="0" cy="0" r="10" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="5" fill="#FEF08A" />
            </g>

            {/* Ala Derecha de Hermes */}
            <g transform="translate(566, 1125)" className="animate-pulse">
              <path d="M 0,0 C 35,-20 75,-80 55,-110 C 30,-80 10,-40 0,-15 Z" fill="#FFFFFF" stroke="#D97706" strokeWidth="3" />
              <path d="M 8,-20 C 50,-50 85,-105 65,-130 C 40,-95 20,-50 5,-30 Z" fill="#FEF08A" stroke="#D97706" strokeWidth="2.5" />
              <path d="M 16,-40 C 75,-80 105,-135 85,-155 C 60,-125 30,-70 12,-50 Z" fill="#FFFFFF" stroke="#EAB308" strokeWidth="3" />
              <circle cx="0" cy="0" r="10" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="5" fill="#FEF08A" />
            </g>
          </g>
        );

      case 'shoes_paladin_boots': // Botas Acorazadas de Paladín
        return (
          <g id="footwear_paladin_boots_layer">
            {/* Greba Izquierda (Plate Armor Shin Guard) */}
            <path d="M 238,975 L 358,975 L 358,1120 L 240,1120 Z" fill="#94A3B8" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 248,985 L 348,985 L 348,1110 L 248,1110 Z" fill="#E2E8F0" />
            <line x1="298" y1="980" x2="298" y2="1115" stroke="#F59E0B" strokeWidth="5" />
            <polygon points="298,965 313,985 298,1005 283,985" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />
            <circle cx="298" cy="985" r="4" fill="#FEF08A" />

            {/* Escarpín Izquierdo de Acero Articulado */}
            <path d="M 240,1120 L 358,1120 L 356,1224 L 290,1218 L 180,1218 L 195,1175 L 240,1120 Z" fill="#64748B" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 248,1130 L 348,1130 L 344,1210 L 285,1205 L 190,1206 L 242,1132 Z" fill="#CBD5E1" />
            <line x1="240" y1="1145" x2="310" y2="1195" stroke="#475569" strokeWidth="3" />
            <line x1="260" y1="1135" x2="330" y2="1185" stroke="#475569" strokeWidth="3" />
            <line x1="280" y1="1125" x2="345" y2="1175" stroke="#475569" strokeWidth="3" />
            <path d="M 180,1218 L 356,1222 L 352,1234 L 180,1228 Z" fill="#1E293B" stroke="#09090B" strokeWidth="3" />

            {/* Greba Derecha */}
            <path d="M 464,975 L 566,975 L 566,1120 L 464,1120 Z" fill="#94A3B8" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 472,985 L 558,985 L 558,1110 L 472,1110 Z" fill="#E2E8F0" />
            <line x1="515" y1="980" x2="515" y2="1115" stroke="#F59E0B" strokeWidth="5" />
            <polygon points="515,965 530,985 515,1005 500,985" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />
            <circle cx="515" cy="985" r="4" fill="#FEF08A" />

            {/* Escarpín Derecho de Acero Articulado */}
            <path d="M 464,1120 L 566,1120 L 568,1252 L 464,1252 Z" fill="#64748B" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 472,1130 L 558,1130 L 560,1242 L 472,1242 Z" fill="#CBD5E1" />
            <line x1="480" y1="1145" x2="545" y2="1145" stroke="#475569" strokeWidth="3" />
            <line x1="482" y1="1175" x2="548" y2="1175" stroke="#475569" strokeWidth="3" />
            <line x1="484" y1="1205" x2="552" y2="1205" stroke="#475569" strokeWidth="3" />
            <path d="M 462,1248 L 570,1250 L 566,1264 L 462,1260 Z" fill="#1E293B" stroke="#09090B" strokeWidth="3" />
          </g>
        );

      case 'shoes_witch_boots': // Botas de Bruja con Dobladillo de Terciopelo Púrpura y Hebilla Mística
        return (
          <g id="footwear_witch_boots_layer">
            {/* Bota Izquierda: Terciopelo Púrpura Profundo cubriendo 100% de la bota base */}
            <path d="M 238,1005 C 275,1035 335,1035 358,1005 L 358,1125 L 356,1224 L 290,1218 L 180,1218 C 165,1218 165,1185 190,1180 L 238,1120 Z" fill="#3B0764" stroke="#09090B" strokeWidth="3.5" />
            {/* Dobladillo vuelto de terciopelo morado con pico gótico */}
            <path d="M 230,1010 C 275,1055 335,1055 365,1010 L 362,1075 C 335,1115 260,1115 228,1075 Z" fill="#6B21A8" stroke="#09090B" strokeWidth="3" />
            <polygon points="298,1085 304,1102 292,1102" fill="#A855F7" />
            {/* Hebilla Dorada Mística de Hechicera */}
            <g transform="translate(285, 1145) rotate(-15)">
              <rect x="-18" y="-14" width="36" height="28" rx="5" fill="#FACC15" stroke="#713F12" strokeWidth="2.5" />
              <rect x="-9" y="-7" width="18" height="14" rx="2" fill="#2E1065" />
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#FACC15" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4" fill="#E879F9" />
            </g>
            <path d="M 180,1218 L 356,1222 L 352,1234 L 180,1228 Z" fill="#18181B" stroke="#09090B" strokeWidth="3" />

            {/* Bota Derecha: Terciopelo Púrpura Profundo cubriendo 100% de la bota base */}
            <path d="M 464,1005 C 485,1035 545,1035 566,1005 L 566,1125 L 568,1252 L 464,1252 Z" fill="#3B0764" stroke="#09090B" strokeWidth="3.5" />
            {/* Dobladillo vuelto derecho */}
            <path d="M 456,1010 C 485,1055 545,1055 574,1010 L 570,1075 C 545,1115 475,1115 450,1075 Z" fill="#6B21A8" stroke="#09090B" strokeWidth="3" />
            <polygon points="508,1085 514,1102 502,1102" fill="#A855F7" />
            {/* Hebilla Dorada Mística */}
            <g transform="translate(515, 1155)">
              <rect x="-18" y="-14" width="36" height="28" rx="5" fill="#FACC15" stroke="#713F12" strokeWidth="2.5" />
              <rect x="-9" y="-7" width="18" height="14" rx="2" fill="#2E1065" />
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#FACC15" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4" fill="#E879F9" />
            </g>
            <path d="M 462,1248 L 570,1250 L 566,1264 L 462,1260 Z" fill="#18181B" stroke="#09090B" strokeWidth="3" />
          </g>
        );

      default:
        return null;
    }
  };

  // =========================================================================
  // 3. RENDERIZADO MODULAR DE RASGOS DE CABEZA / OREJAS / RAZAS FANTÁSTICAS
  // =========================================================================
  const renderRaceFeatures = () => {
    switch (raceFeature) {
      case 'cat_ears': // Orejas de Gato / Kitsune
        return (
          <g id="race_cat_ears">
            <defs>
              <linearGradient id="catInnerPinkL" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="50%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#FECDD3" />
              </linearGradient>
              <linearGradient id="catInnerPinkR" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="50%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#FECDD3" />
              </linearGradient>
              <filter id="catEarShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#090D1A" floodOpacity="0.38" />
              </filter>
            </defs>

            {/* OREJA IZQUIERDA (Corona Parietal) */}
            <g filter="url(#catEarShadow)">
              <path d="M 305,108 C 298,92 288,72 278,54 C 274,48 274,44 280,44 C 292,50 318,68 340,90 C 352,102 358,114 360,118 C 352,121 340,121 328,120 C 316,118 308,114 305,108 Z" 
                    fill={hairHex} stroke="#0F172A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 280,44 C 286,58 296,80 304,98 C 300,105 296,112 296,114 C 288,96 280,68 280,44 Z" 
                    fill="#000000" opacity="0.32" />
              <path d="M 292,76 C 286,58 285,48 288,46 C 298,54 318,74 334,92 C 344,104 346,112 346,114 C 336,116 314,108 292,76 Z" 
                    fill="url(#catInnerPinkL)" stroke="#9F1239" strokeWidth="1.8" />
              <path d="M 290,110 C 298,102 308,92 312,80 C 315,88 320,95 326,98 C 330,88 334,80 336,70 C 338,80 342,88 348,96 C 342,106 330,114 316,116 C 304,116 294,114 290,110 Z" 
                    fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M 298,105 C 306,97 312,89 313,83 C 316,91 322,95 325,97" 
                    fill="none" stroke="#FFE4E6" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* OREJA DERECHA (Corona Parietal) */}
            <g filter="url(#catEarShadow)">
              <path d="M 463,108 C 470,92 480,72 490,54 C 494,48 494,44 488,44 C 476,50 450,68 428,90 C 416,102 410,114 408,118 C 416,121 428,121 440,120 C 452,118 460,114 463,108 Z" 
                    fill={hairHex} stroke="#0F172A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 488,44 C 482,58 472,80 464,98 C 468,105 472,112 472,114 C 480,96 488,68 488,44 Z" 
                    fill="#000000" opacity="0.32" />
              <path d="M 476,76 C 482,58 483,48 480,46 C 470,54 450,74 434,92 C 424,104 422,112 422,114 C 432,116 454,108 476,76 Z" 
                    fill="url(#catInnerPinkR)" stroke="#9F1239" strokeWidth="1.8" />
              <path d="M 478,110 C 470,102 460,92 456,80 C 453,88 448,95 442,98 C 438,88 434,80 432,70 C 430,80 426,88 420,96 C 426,106 438,114 452,116 C 464,116 474,114 478,110 Z" 
                    fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M 470,105 C 462,97 456,89 455,83 C 452,91 446,95 443,97" 
                    fill="none" stroke="#FFE4E6" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>
        );

      case 'wolf_ears': // Lobo de las Tormentas
        return (
          <g id="race_wolf_ears">
            <defs>
              <linearGradient id="wolfSlateL" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="45%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="wolfSlateR" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="45%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="wolfShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#090D1A" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* OREJA IZQUIERDA DE LOBO */}
            <g filter="url(#wolfShadow)">
              <path d="M 308,112 C 298,96 284,72 272,48 C 268,40 268,36 274,36 C 286,42 308,60 334,84 C 348,98 356,112 358,118 C 348,122 330,122 308,112 Z" 
                    fill="url(#wolfSlateL)" stroke="#090D1A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 274,36 C 280,44 290,60 298,72 C 290,66 282,52 274,36 Z" fill="#020617" />
              <path d="M 284,68 C 280,54 282,46 284,44 C 292,52 306,70 320,88 C 328,98 332,108 332,112 C 322,114 304,104 284,68 Z" 
                    fill="#64748B" stroke="#1E293B" strokeWidth="1.8" />
              <path d="M 284,108 C 294,100 306,86 310,74 C 314,84 320,92 326,96 C 330,86 334,78 338,68 C 340,78 342,88 344,96 C 336,108 324,116 310,118 C 298,118 288,114 284,108 Z" 
                    fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
              <ellipse cx="274" cy="46" rx="3.5" ry="6" fill="none" stroke="#E2E8F0" strokeWidth="2.6" transform="rotate(-30 274 46)" />
              <ellipse cx="279" cy="62" rx="3" ry="5" fill="none" stroke="#E2E8F0" strokeWidth="2.2" transform="rotate(-30 279 62)" />
            </g>

            {/* OREJA DERECHA DE LOBO */}
            <g filter="url(#wolfShadow)">
              <path d="M 460,112 C 470,96 484,72 496,48 C 500,40 500,36 494,36 C 482,42 460,60 434,84 C 420,98 412,112 410,118 C 420,122 438,122 460,112 Z" 
                    fill="url(#wolfSlateR)" stroke="#090D1A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 494,36 C 488,44 478,60 470,72 C 478,66 486,52 494,36 Z" fill="#020617" />
              <path d="M 484,68 C 488,54 486,46 484,44 C 476,52 462,70 448,88 C 440,98 436,108 436,112 C 446,114 464,104 484,68 Z" 
                    fill="#64748B" stroke="#1E293B" strokeWidth="1.8" />
              <path d="M 484,108 C 474,100 462,86 458,74 C 454,84 448,92 442,96 C 438,86 434,78 430,68 C 428,78 426,88 424,96 C 432,108 444,116 458,118 C 470,118 480,114 484,108 Z" 
                    fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
            </g>
          </g>
        );

      case 'bunny_ears': // Orejitas de Conejo Lunar
        return (
          <g id="race_bunny_ears">
            <defs>
              <filter id="bunnyShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.32" />
              </filter>
              <linearGradient id="bunnyPinkCore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="65%" stopColor="#FBCFE8" />
                <stop offset="100%" stopColor="#FFF1F2" />
              </linearGradient>
            </defs>

            {/* OREJA IZQUIERDA DE CONEJO */}
            <g filter="url(#bunnyShadow)">
              <path d="M 330,118 C 322,92 312,50 308,18 C 305,-4 318,-16 332,-14 C 348,-12 358,12 360,50 C 362,88 356,110 348,118 C 340,122 334,122 330,118 Z" 
                    fill="#FFFFFF" stroke="#0F172A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 308,18 C 305,-4 318,-16 332,-14 C 324,-8 320,4 322,28 C 326,68 333,100 340,116 C 334,114 326,92 308,18 Z" 
                    fill="#E2E8F0" opacity="0.65" />
              <path d="M 330,102 C 326,78 320,42 318,15 C 316,2 322,-5 328,-4 C 336,-2 342,12 344,38 C 346,68 344,92 338,105 C 334,107 332,105 330,102 Z" 
                    fill="url(#bunnyPinkCore)" stroke="#F472B6" strokeWidth="1.4" />
            </g>

            {/* OREJA DERECHA DE CONEJO CON PLIEGUE CHARMING */}
            <g filter="url(#bunnyShadow)">
              <path d="M 420,118 C 424,102 430,70 438,36 C 444,14 458,4 470,10 C 478,16 472,36 458,54 C 454,80 448,104 438,120 C 430,122 425,121 420,118 Z" 
                    fill="#FFFFFF" stroke="#0F172A" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 430,110 C 432,90 438,65 444,42 C 447,28 454,22 460,25 C 463,30 458,44 450,56 C 445,80 440,100 436,110 Z" 
                    fill="url(#bunnyPinkCore)" stroke="#F472B6" strokeWidth="1.4" />
              <path d="M 458,4 C 470,10 480,18 474,40 C 464,30 454,26 444,30 C 450,16 454,8 458,4 Z" 
                    fill="#F1F5F9" stroke="#0F172A" strokeWidth="2.6" strokeLinejoin="round" />
            </g>
          </g>
        );

      case 'dragon_horns': // Cuernos de Dragón Dorado
        return (
          <g id="race_dragon_horns">
            <defs>
              <linearGradient id="dragonGoldL" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="25%" stopColor="#B45309" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="90%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="dragonGoldR" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="25%" stopColor="#B45309" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="90%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <filter id="dragonAura" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.65" />
              </filter>
            </defs>

            {/* CUERNO IZQUIERDO DE DRAGÓN */}
            <g filter="url(#dragonAura)">
              <path d="M 334,122 C 314,118 284,106 256,86 C 235,70 220,52 216,40 C 222,40 242,54 274,72 C 306,90 338,106 348,120 Z" 
                    fill="url(#dragonGoldL)" stroke="#451A03" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 230,48 Q 240,56 252,50" fill="none" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 250,64 Q 264,74 278,66" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              <path d="M 274,80 Q 292,92 308,82" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 302,96 Q 322,108 336,96" fill="none" stroke="#78350F" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M 218,41 C 230,53 262,78 316,106" fill="none" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
              <circle cx="216" cy="40" r="2.8" fill="#FFFFFF" />
            </g>

            {/* CUERNO DERECHO DE DRAGÓN */}
            <g filter="url(#dragonAura)">
              <path d="M 434,122 C 454,118 484,106 512,86 C 533,70 548,52 552,40 C 546,40 526,54 494,72 C 462,90 430,106 420,120 Z" 
                    fill="url(#dragonGoldR)" stroke="#451A03" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 538,48 Q 528,56 516,50" fill="none" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 518,64 Q 504,74 490,66" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              <path d="M 494,80 Q 476,92 460,82" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 466,96 Q 446,108 432,96" fill="none" stroke="#78350F" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M 550,41 C 538,53 506,78 452,106" fill="none" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
              <circle cx="552" cy="40" r="2.8" fill="#FFFFFF" />
            </g>
          </g>
        );

      case 'demon_horns': // Cuernitos de Gárgola
        return (
          <g id="race_demon_horns">
            <defs>
              <filter id="magmaGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* CUERNO IZQUIERDO */}
            <g filter="url(#magmaGlow)">
              <path d="M 334,124 C 316,118 288,98 276,70 C 270,52 274,32 284,24 C 286,30 286,46 298,66 C 314,90 336,112 348,124 Z" 
                    fill="#18181B" stroke="#09090B" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="284" cy="24" r="2.2" fill="#FEF08A" />
            </g>

            {/* CUERNO DERECHO */}
            <g filter="url(#magmaGlow)">
              <path d="M 434,124 C 452,118 480,98 492,70 C 498,52 494,32 484,24 C 482,30 482,46 470,66 C 454,90 432,112 420,124 Z" 
                    fill="#18181B" stroke="#09090B" strokeWidth="3.6" strokeLinejoin="round" />
              <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="484" cy="24" r="2.2" fill="#FEF08A" />
            </g>
          </g>
        );

      case 'stag_antlers': // Astas de Ciervo Silvestre
        return (
          <g id="race_stag_antlers">
            <defs>
              <filter id="natureAura" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#16A34A" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* CORNAMENTA IZQUIERDA */}
            <g filter="url(#natureAura)">
              <path d="M 336,118 C 330,98 316,72 292,48 C 274,30 252,18 244,15 C 248,22 266,42 280,66 C 294,90 302,108 308,122 Z" 
                    fill="#78350F" stroke="#451A03" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 280,62 C 274,46 264,30 252,22 C 255,30 266,48 272,66 Z" fill="#854D0E" stroke="#451A03" strokeWidth="2.2" />
              <path d="M 318,92 C 304,82 286,80 274,82 C 284,88 302,92 312,100 Z" fill="#854D0E" stroke="#451A03" strokeWidth="2.2" />
              <circle cx="244" cy="15" r="4" fill="#86EFAC" stroke="#15803D" strokeWidth="1.2" />
              <circle cx="252" cy="22" r="3" fill="#BBF7D0" />
              <path d="M 274,54 Q 266,52 264,46 Q 272,46 276,52 Z" fill="#22C55E" />
              <path d="M 288,78 Q 282,74 278,68 Q 286,70 290,76 Z" fill="#22C55E" />
            </g>

            {/* CORNAMENTA DERECHA */}
            <g filter="url(#natureAura)">
              <path d="M 432,118 C 438,98 452,72 476,48 C 494,30 516,18 524,15 C 520,22 502,42 488,66 C 474,90 466,108 460,122 Z" 
                    fill="#78350F" stroke="#451A03" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 488,62 C 494,46 504,30 516,22 C 513,30 502,48 496,66 Z" fill="#854D0E" stroke="#451A03" strokeWidth="2.2" />
              <path d="M 450,92 C 464,82 482,80 494,82 C 484,88 466,92 456,100 Z" fill="#854D0E" stroke="#451A03" strokeWidth="2.2" />
              <circle cx="524" cy="15" r="4" fill="#86EFAC" stroke="#15803D" strokeWidth="1.2" />
              <circle cx="516" cy="22" r="3" fill="#BBF7D0" />
              <path d="M 494,54 Q 502,52 504,46 Q 496,46 492,52 Z" fill="#22C55E" />
              <path d="M 480,78 Q 486,74 490,68 Q 482,70 478,76 Z" fill="#22C55E" />
            </g>
          </g>
        );

      case 'elf_long': // Elfo Boreal (Largas)
        return (
          <g id="race_elf_long">
            <defs>
              <filter id="elfShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-1" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* OREJA ÉLFICA IZQUIERDA (Sustituye la oreja humana en ángulo de 35°) */}
            <g filter="url(#elfShadow)">
              <path d="M 328,192 C 314,184 285,168 250,150 C 246,148 245,153 249,158 C 270,185 304,218 322,238 C 326,240 330,234 330,224 C 330,214 329,202 328,192 Z" 
                    fill={skinHex} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 324,196 C 310,190 286,176 264,164 C 280,182 304,206 320,226 Z" fill="#9A3412" opacity="0.25" />
              <path d="M 326,194 C 314,188 296,178 278,170" fill="none" stroke="#9A3412" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
              <path d="M 284,174 Q 286,182 280,188" fill="none" stroke="#FACC15" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="283" cy="181" r="2" fill="#FEF08A" />
              <polygon points="280,190 278,197 282,197" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
            </g>

            {/* OREJA ÉLFICA DERECHA */}
            <g filter="url(#elfShadow)">
              <path d="M 440,192 C 454,184 483,168 518,150 C 522,148 523,153 519,158 C 498,185 464,218 446,238 C 442,240 438,234 438,224 C 438,214 439,202 440,192 Z" 
                    fill={skinHex} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 444,196 C 458,190 482,176 504,164 C 488,182 464,206 448,226 Z" fill="#9A3412" opacity="0.25" />
              <path d="M 442,194 C 454,188 472,178 490,170" fill="none" stroke="#9A3412" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
              <path d="M 484,174 Q 482,182 488,188" fill="none" stroke="#FACC15" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="485" cy="181" r="2" fill="#FEF08A" />
              <polygon points="488,190 490,197 486,197" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
            </g>
          </g>
        );

      case 'elf_short': // Elfo Ágil (Cortas)
        return (
          <g id="race_elf_short">
            <defs>
              <filter id="elfShortShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-1" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* OREJA CORTA IZQUIERDA */}
            <g filter="url(#elfShortShadow)">
              <path d="M 328,194 C 316,188 290,178 268,166 C 265,164 264,169 268,174 C 284,194 308,218 324,232 C 328,234 330,228 330,220 C 330,212 329,202 328,194 Z" 
                    fill={skinHex} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 322,198 C 310,192 292,182 278,174 C 290,188 308,206 320,222 Z" fill="#9A3412" opacity="0.2" />
              <circle cx="282" cy="186" r="2.2" fill="#FACC15" stroke="#713F12" strokeWidth="0.8" />
            </g>

            {/* OREJA CORTA DERECHA */}
            <g filter="url(#elfShortShadow)">
              <path d="M 440,194 C 452,188 478,178 500,166 C 503,164 504,169 500,174 C 484,194 460,218 444,232 C 440,234 438,228 438,220 C 438,212 439,202 440,194 Z" 
                    fill={skinHex} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 446,198 C 458,192 476,182 490,174 C 478,188 460,206 448,222 Z" fill="#9A3412" opacity="0.2" />
              <circle cx="486" cy="186" r="2.2" fill="#FACC15" stroke="#713F12" strokeWidth="0.8" />
            </g>
          </g>
        );

      case 'merfolk_fins': // Aletas Acuáticas de Sirena
        return (
          <g id="race_merfolk_fins">
            <defs>
              <linearGradient id="finCyanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.65" />
              </linearGradient>
              <filter id="waterGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00F0FF" floodOpacity="0.75" />
              </filter>
            </defs>

            {/* ALETA ACUÁTICA IZQUIERDA */}
            <g filter="url(#waterGlow)">
              <path d="M 328,194 C 298,172 264,152 238,132 C 248,162 250,186 236,204 C 254,208 266,218 254,232 C 274,230 304,226 328,234 Z" 
                    fill="url(#finCyanGrad)" stroke="#083344" strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M 326,202 Q 284,168 240,134" fill="none" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 326,212 Q 286,192 240,205" fill="none" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
              <path d="M 326,222 Q 296,222 258,233" fill="none" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="242" cy="138" r="2.8" fill="#FFFFFF" opacity="0.9" />
            </g>

            {/* ALETA ACUÁTICA DERECHA */}
            <g filter="url(#waterGlow)">
              <path d="M 440,194 C 470,172 504,152 530,132 C 520,162 518,186 532,204 C 514,208 502,218 514,232 C 494,230 464,226 440,234 Z" 
                    fill="url(#finCyanGrad)" stroke="#083344" strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M 442,202 Q 484,168 528,134" fill="none" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 442,212 Q 482,192 528,205" fill="none" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
              <path d="M 442,222 Q 472,222 510,233" fill="none" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="526" cy="138" r="2.8" fill="#FFFFFF" opacity="0.9" />
            </g>
          </g>
        );

      case 'fairy_wings': // Alas Minis de Hada (renderizadas en la capa posterior zIndex 5)
        return null;

      case 'angel_halo': // Aureola Sagrada Flotante
        return (
          <g id="race_angel_halo" transform="translate(384, 68)">
            <defs>
              <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FACC15" floodOpacity="0.9" />
              </filter>
            </defs>
            <g filter="url(#haloGlow)">
              <ellipse cx="0" cy="0" rx="82" ry="20" fill="none" stroke="#FEF08A" strokeWidth="8" opacity="0.4" />
              <ellipse cx="0" cy="0" rx="78" ry="18" fill="none" stroke="#FBBF24" strokeWidth="6" />
              <ellipse cx="0" cy="0" rx="78" ry="18" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
              <polygon points="-55,-10 -53,-5 -48,-3 -53,-1 -55,4 -57,-1 -62,-3 -57,-5" fill="#FFFFFF" />
              <polygon points="55,10 57,5 62,3 57,1 55,-4 53,1 48,3 53,5" fill="#FFFFFF" />
            </g>
          </g>
        );

      case 'crystal_crown': // Corona Rúnica de Cristal
        return (
          <g id="race_crystal_crown" transform="translate(384, 136)">
            <defs>
              <filter id="tiaraGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.85" />
              </filter>
              <linearGradient id="crystalCentralGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#7DD3FC" />
                <stop offset="80%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
              <linearGradient id="crystalAmethystGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FAF5FF" />
                <stop offset="40%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>
            </defs>

            <g filter="url(#tiaraGlow)">
              <path d="M -72,8 C -40,-2 40,-2 72,8" fill="none" stroke="#B45309" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M -70,8 C -40,-2 40,-2 70,8" fill="none" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
              <path d="M -48,4 Q -35,-8 -20,2" fill="none" stroke="#FDE047" strokeWidth="1.8" />
              <path d="M 48,4 Q 35,-8 20,2" fill="none" stroke="#FDE047" strokeWidth="1.8" />

              {/* Prisma Central Celeste */}
              <polygon points="0,-48 -11,-12 0,-18 11,-12" fill="url(#crystalCentralGrad)" stroke="#0284C7" strokeWidth="1.8" />
              <polygon points="0,-48 0,-18 11,-12" fill="#FFFFFF" opacity="0.45" />
              
              {/* Prismas Amatista Flanqueantes */}
              <polygon points="-28,-36 -37,-8 -28,-14 -19,-8" fill="url(#crystalAmethystGrad)" stroke="#581C87" strokeWidth="1.6" />
              <polygon points="-28,-36 -28,-14 -19,-8" fill="#FFFFFF" opacity="0.4" />

              <polygon points="28,-36 19,-8 28,-14 37,-8" fill="url(#crystalAmethystGrad)" stroke="#581C87" strokeWidth="1.6" />
              <polygon points="28,-36 28,-14 37,-8" fill="#FFFFFF" opacity="0.4" />
              
              {/* Cristales Cianos Exteriores */}
              <polygon points="-54,-24 -60,-2 -54,-6 -48,-2" fill="url(#crystalCentralGrad)" stroke="#0284C7" strokeWidth="1.4" />
              <polygon points="54,-24 48,-2 54,-6 60,-2" fill="url(#crystalCentralGrad)" stroke="#0284C7" strokeWidth="1.4" />

              {/* Rubí Central Radiante */}
              <circle cx="0" cy="0" r="5" fill="#E11D48" stroke="#881337" strokeWidth="1.5" />
              <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFE4E6" />
            </g>
          </g>
        );

      case 'rune_tattoo': // Tatuajes Rúnicos Faciales
        return (
          <g id="race_rune_tattoo">
            <defs>
              <filter id="runeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00F0FF" floodOpacity="0.9" />
              </filter>
            </defs>

            <g filter="url(#runeGlow)">
              <path d="M 324,228 Q 338,235 348,225 M 326,236 Q 338,242 346,234" fill="none" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="352" cy="223" r="2" fill="#FFFFFF" />

              <path d="M 444,228 Q 430,235 420,225 M 442,236 Q 430,242 422,234" fill="none" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="416" cy="223" r="2" fill="#FFFFFF" />

              <polygon points="384,152 387,159 384,166 381,159" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="384" cy="159" r="1.6" fill="#FFFFFF" />
            </g>
          </g>
        );

      case 'cosmic_antennae': // Antenas Cósmicas Estelares
        return (
          <g id="race_cosmic_antennae">
            <defs>
              <filter id="antennaGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00F0FF" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* ANTENA IZQUIERDA */}
            <g filter="url(#antennaGlow)">
              <rect x="340" y="112" width="7" height="10" rx="2.5" fill="#334155" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M 343,114 Q 320,80 316,40" fill="none" stroke="#06B6D4" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M 343,114 Q 320,80 316,40" fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="316" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
              <circle cx="316" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.8" />
              <circle cx="314" cy="36" r="2.8" fill="#FFFFFF" />
              <ellipse cx="316" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" strokeWidth="1.4" transform="rotate(-25 316 38)" />
            </g>

            {/* ANTENA DERECHA */}
            <g filter="url(#antennaGlow)">
              <rect x="421" y="112" width="7" height="10" rx="2.5" fill="#334155" stroke="#0F172A" strokeWidth="1.4" />
              <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#06B6D4" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="452" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
              <circle cx="452" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.8" />
              <circle cx="450" cy="36" r="2.8" fill="#FFFFFF" />
              <ellipse cx="452" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" strokeWidth="1.4" transform="rotate(25 452 38)" />
            </g>
          </g>
        );

      default:
        return null;
    }
  };

  // =========================================================================
  // 4. RENDERIZADO MODULAR DE PEINADOS ANIME (ILUSTRACIÓN CANÓNICA EN CANVAS)
  // =========================================================================
  const renderHairStyles = () => {
    // Todos los estilos de peinado anime están integrados directamente en el lienzo Canvas
    // con sombreado profesional e iluminación cel-shaded sin polígonos sobrepuestos.
    return null;
  };

  // =========================================================================
  // 5. RENDERIZADO DEL ORBE DE SABIDURÍA PEDAGÓGICA (INSTITUCIONAL / MARCA BLANCA)
  // =========================================================================
  const renderWisdomOrb = () => (
    <g id="institutional_wisdom_orb" transform="translate(239, 702)">
      <circle cx="0" cy="0" r="34" fill="#00F0FF" opacity="0.25" className="animate-ping" />
      <circle cx="0" cy="0" r="26" fill="#0284C7" stroke="#09090B" strokeWidth="3" />
      <circle cx="0" cy="0" r="22" fill="#38BDF8" />
      <ellipse cx="0" cy="0" rx="30" ry="9" fill="none" stroke="#F59E0B" strokeWidth="2.5" transform="rotate(-20)" />
      <ellipse cx="0" cy="0" rx="30" ry="9" fill="none" stroke="#FEF08A" strokeWidth="1.8" transform="rotate(40)" />
      <circle cx="0" cy="0" r="8" fill="#FEF08A" />
      <polygon points="0,-14 3,-3 14,0 3,3 0,14 -3,3 -14,0 -3,-3" fill="#FFFFFF" />
    </g>
  );

  // =========================================================================
  // 6. RENDERIZADO MODULAR DE PRENDAS EXTERIORES CEL-SHADED (OUTERWEAR)
  // AJUSTADO EXACTAMENTE A LOS BRAZOS Y MANOS ("PEGADO A LAS MANOS")
  // =========================================================================
  // =========================================================================
  // 6. RENDERIZADO MODULAR DE PRENDAS EXTERIORES CEL-SHADED (OUTERWEAR)
  // AJUSTADO ANATÓMICAMENTE A LOS BRAZOS Y PEGADO DIRECTAMENTE A LAS MANOS
  // =========================================================================
  const renderOuterwear = () => {
    switch (equippedOuterwear) {
      case 'outerwear_varsity': // Chamarra Bomber Colegial "ISkool"
        return (
          <g id="outerwear_varsity_layer">
            {/* Torso azul real ajustado al cuerpo */}
            <path 
              d="M 340,285 C 315,295 275,310 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,310 475,295 450,285 C 440,312 416,346 384,354 C 352,346 328,312 340,285 Z" 
              fill="#1D4ED8" 
              stroke="#09090B" 
              strokeWidth="4.5" 
            />
            {/* Sombra de oclusión torácica */}
            <path d="M 285,420 L 278,635 L 305,635 L 300,420 Z" fill="#1E40AF" opacity="0.45" />

            {/* Manga Izquierda: contorneada anatómicamente pegada a la mano */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#F8FAFC" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 218,520 Q 235,530 255,515" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <path d="M 210,580 Q 228,590 248,575" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            {/* Puño elástico acanalado pegado directamente a la muñeca y mano */}
            <polygon points="190,658 248,661 246,676 188,673" fill="#1E3A8A" stroke="#09090B" strokeWidth="2.5" />
            <line x1="190" y1="667" x2="246" y2="668" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,4" />

            {/* Manga Derecha: contorneada anatómicamente pegada a la mano */}
            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#F8FAFC" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 578,520 Q 558,530 538,515" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <path d="M 574,580 Q 556,590 536,575" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            {/* Puño elástico acanalado pegado directamente a la muñeca y mano */}
            <polygon points="512,661 576,654 574,669 510,676" fill="#1E3A8A" stroke="#09090B" strokeWidth="2.5" />
            <line x1="512" y1="668" x2="574" y2="661" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,4" />

            {/* Cuello elástico a rayas pegado al cuerpo */}
            <path d="M 338,290 Q 384,346 430,290" fill="none" stroke="#1E3A8A" strokeWidth="14" strokeLinecap="round" />
            <path d="M 338,290 Q 384,346 430,290" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="12,8" strokeLinecap="round" />

            {/* Botones y botonera central */}
            <line x1="384" y1="340" x2="384" y2="626" stroke="#1E40AF" strokeWidth="6" />
            <circle cx="384" cy="370" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="430" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="490" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="550" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />

            {/* Pretina elástica inferior a rayas */}
            <rect x="270" y="626" width="226" height="20" rx="4" fill="#1E3A8A" stroke="#09090B" strokeWidth="3.5" />
            <line x1="276" y1="636" x2="490" y2="636" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="12,8" />

            {/* Emblema universitario bordado "IS" en el pecho izquierdo */}
            <g transform="translate(330, 380)">
              <rect x="-16" y="-14" width="32" height="28" rx="6" fill="#FACC15" stroke="#713F12" strokeWidth="2.5" />
              <text x="0" y="6" textAnchor="middle" fill="#1E3A8A" fontWeight="900" fontSize="16" fontFamily="sans-serif">IS</text>
            </g>
          </g>
        );

      case 'outerwear_hoodie': // Hoodie Escolar Cálido (Sudadera celeste)
        return (
          <g id="outerwear_hoodie_layer">
            <path 
              d="M 340,285 C 315,295 275,310 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,310 475,295 450,285 C 440,312 416,346 384,354 C 352,346 328,312 340,285 Z" 
              fill="#0284C7" 
              stroke="#09090B" 
              strokeWidth="4.5" 
            />
            {/* Manga Izquierda ajustada anatómicamente hasta la mano */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#0284C7" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 218,520 Q 235,530 255,515" fill="none" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
            <polygon points="190,658 248,661 246,676 188,673" fill="#0369A1" stroke="#09090B" strokeWidth="2.5" />

            {/* Manga Derecha ajustada anatómicamente hasta la mano */}
            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#0284C7" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 578,520 Q 558,530 538,515" fill="none" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
            <polygon points="512,661 576,654 574,669 510,676" fill="#0369A1" stroke="#09090B" strokeWidth="2.5" />

            {/* Cuello y capucha drapeada pegada perfectamente al cuerpo */}
            <path d="M 336,288 C 356,320 372,348 384,352 C 396,348 412,320 432,288 C 440,294 424,335 384,360 C 344,335 328,294 336,288 Z" fill="#0369A1" stroke="#09090B" strokeWidth="3.5" />
            <path d="M 346,296 C 362,324 376,346 384,350 C 392,346 406,324 422,296 C 414,312 400,336 384,342 C 368,336 354,312 346,296 Z" fill="#0284C7" />

            {/* Cordones blancos con herrajes que caen desde la base del cuello */}
            <path d="M 366,350 C 364,390 362,420 364,455" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="361" y="450" width="6" height="12" rx="2" fill="#94A3B8" />
            <path d="M 402,350 C 404,390 406,420 404,455" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="401" y="450" width="6" height="12" rx="2" fill="#94A3B8" />

            {/* Bolsillo canguro frontal y pretina */}
            <path d="M 320,525 L 448,525 L 460,615 L 308,615 Z" fill="#0369A1" stroke="#09090B" strokeWidth="3.5" />
            <rect x="270" y="626" width="226" height="20" rx="4" fill="#0369A1" stroke="#09090B" strokeWidth="3" />
          </g>
        );

      case 'outerwear_bomber_jacket': // Chamarra Bomber de Héroe Aviador
        return (
          <g id="outerwear_bomber_layer">
            <path 
              d="M 340,285 C 315,295 275,310 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,310 475,295 450,285 C 440,312 416,346 384,354 C 352,346 328,312 340,285 Z" 
              fill="#9A3412" 
              stroke="#09090B" 
              strokeWidth="4.5" 
            />
            {/* Mangas de cuero marrón cálido ajustadas anatómicamente hasta la mano */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#78350F" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 218,520 Q 235,530 255,515" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
            <polygon points="190,658 248,661 246,676 188,673" fill="#451A03" stroke="#09090B" strokeWidth="2.5" />

            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#78350F" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <path d="M 578,520 Q 558,530 538,515" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
            <polygon points="512,661 576,654 574,669 510,676" fill="#451A03" stroke="#09090B" strokeWidth="2.5" />

            {/* Cuello de borrego abullonado pegado al cuello */}
            <path d="M 332,290 C 354,324 372,352 384,380 C 396,352 414,324 436,290 C 446,298 426,358 384,390 C 342,358 322,298 332,290 Z" fill="#FEF3C7" stroke="#09090B" strokeWidth="4" />
            <circle cx="348" cy="315" r="10" fill="#FDE68A" />
            <circle cx="420" cy="315" r="10" fill="#FDE68A" />

            {/* Cremallera de latón */}
            <line x1="384" y1="380" x2="384" y2="626" stroke="#F59E0B" strokeWidth="5" />
            <rect x="380" y="415" width="8" height="14" rx="2" fill="#D97706" />

            {/* Parche de aviador */}
            <circle cx="218" cy="510" r="14" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="2.5" />
            <polygon points="218,500 221,508 229,508 223,513 225,521 218,516 211,521 213,513 207,508 215,508" fill="#F59E0B" />

            <rect x="270" y="626" width="226" height="20" rx="4" fill="#451A03" stroke="#09090B" strokeWidth="3.5" />
          </g>
        );

      case 'outerwear_witch_cloak': // Capa Mágica de Bruja con Moño
        return (
          <g id="outerwear_witch_cloak_layer">
            {/* Capa ancha cayendo sobre hombros y espalda */}
            <path 
              d="M 230,300 C 270,265 330,300 384,330 C 438,300 498,265 538,300 L 595,780 C 530,830 460,860 384,870 C 308,860 238,830 173,780 Z" 
              fill="#4C1D95" 
              stroke="#09090B" 
              strokeWidth="5" 
            />
            <path d="M 235,320 L 195,760 C 255,800 310,820 350,830 L 350,420 Z" fill="#3B0764" />
            <path d="M 533,320 L 573,760 C 513,800 458,820 418,830 L 418,420 Z" fill="#3B0764" />

            {/* Mangas de terciopelo morado ajustadas anatómicamente hasta las muñecas */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#5B21B6" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="190,658 248,661 246,676 188,673" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />

            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#5B21B6" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="512,661 576,654 574,669 510,676" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />

            {/* Borde con filigrana dorada */}
            <path d="M 175,775 C 240,825 310,855 384,865 C 458,855 528,825 593,775" fill="none" stroke="#F59E0B" strokeWidth="6" />

            {/* Moño de seda carmesí al cuello */}
            <g transform="translate(384, 340)">
              <ellipse cx="-24" cy="-6" rx="20" ry="12" fill="#DC2626" stroke="#09090B" strokeWidth="3" transform="rotate(-15 -24 -6)" />
              <ellipse cx="24" cy="-6" rx="20" ry="12" fill="#DC2626" stroke="#09090B" strokeWidth="3" transform="rotate(15 24 -6)" />
              <circle cx="0" cy="0" r="11" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
              <circle cx="0" cy="0" r="5" fill="#EF4444" />
            </g>
          </g>
        );

      case 'outerwear_archmage_cape': // Gran Manto del Hechicero
        return (
          <g id="outerwear_archmage_cape_layer">
            <path 
              d="M 230,290 C 270,255 330,290 384,320 C 438,290 498,255 538,290 L 620,850 C 550,910 470,940 384,945 C 298,940 218,910 148,850 Z" 
              fill="#581C87" 
              stroke="#09090B" 
              strokeWidth="5" 
            />
            {/* Mangas ceremoniales ajustadas anatómicamente hasta las muñecas */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#6B21A8" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="190,658 248,661 246,676 188,673" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />

            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#6B21A8" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="512,661 576,654 574,669 510,676" fill="#F59E0B" stroke="#09090B" strokeWidth="2.5" />

            {/* Dobladillo con cenefa dorada */}
            <path d="M 152,845 C 222,905 302,935 384,940 C 466,935 546,905 616,845" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />

            {/* Hombreras ceremoniales doradas */}
            <g transform="translate(260, 315)">
              <ellipse cx="0" cy="0" rx="34" ry="18" fill="#EAB308" stroke="#713F12" strokeWidth="3" transform="rotate(-20)" />
              <circle cx="0" cy="0" r="9" fill="#0284C7" />
            </g>
            <g transform="translate(508, 315)">
              <ellipse cx="0" cy="0" rx="34" ry="18" fill="#EAB308" stroke="#713F12" strokeWidth="3" transform="rotate(20)" />
              <circle cx="0" cy="0" r="9" fill="#0284C7" />
            </g>
            <path d="M 285,325 Q 384,380 483,325" fill="none" stroke="#F59E0B" strokeWidth="4" />
          </g>
        );

      case 'outerwear_fur_duster': // Abrigo Nocturno con Cuello de Peluche
        return (
          <g id="outerwear_fur_duster_layer">
            <path 
              d="M 340,285 C 315,295 275,310 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,310 475,295 450,285 C 440,312 416,346 384,354 C 352,346 328,312 340,285 Z" 
              fill="#18181B" 
              stroke="#09090B" 
              strokeWidth="4.5" 
            />
            {/* Mangas negras ajustadas anatómicamente hasta las muñecas */}
            <path 
              d="M 258,320 C 248,360 245,410 242,460 C 238,500 222,540 214,570 C 204,605 198,640 192,664 L 246,667 C 252,635 266,580 278,550 C 286,520 292,480 292,430 C 292,390 286,355 284,335 Z" 
              fill="#18181B" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="190,658 248,661 246,676 188,673" fill="#3F3F46" stroke="#18181B" strokeWidth="2.5" />

            <path 
              d="M 500,320 C 522,350 556,395 566,445 C 574,485 582,530 581,568 C 580,600 577,635 574,660 L 514,667 C 520,635 532,590 528,550 C 524,520 514,480 498,440 C 488,400 484,360 480,335 Z" 
              fill="#18181B" 
              stroke="#09090B" 
              strokeWidth="4" 
            />
            <polygon points="512,661 576,654 574,669 510,676" fill="#3F3F46" stroke="#18181B" strokeWidth="2.5" />

            {/* Cuello de felpa / borrego esponjoso pegado al cuerpo */}
            <path d="M 326,290 C 352,325 372,355 384,385 C 396,355 416,325 442,290 C 454,350 416,410 384,420 C 352,410 314,350 326,290 Z" fill="#3F3F46" stroke="#18181B" strokeWidth="4" />
            <circle cx="335" cy="335" r="14" fill="#52525B" />
            <circle cx="433" cy="335" r="14" fill="#52525B" />
            <circle cx="384" cy="380" r="14" fill="#71717A" />

            {/* Broche plateado rúnico central */}
            <circle cx="384" cy="405" r="10" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
            <circle cx="384" cy="405" r="4" fill="#0284C7" />
          </g>
        );

      default:
        return null;
    }
  };

  // Prenda Superior Modular (Top / Playera / Camisa / Chaleco / Túnica)
  // Calibrada anatómicamente por género (femenino, masculino, neutro) con estilo cel-shaded realista
  const renderTop = () => {
    if (!equippedTop) {
      return null;
    }

    const prefix = gender === 'female' ? 'female' : gender === 'neutral' ? 'neutral' : 'male';
    const topSrc = `/images/avatar/tops/${prefix}_${equippedTop}.png?v=20260915_zero_collar_final`;

    return (
      <image
        id={`top_${equippedTop}_layer`}
        href={topSrc}
        x="0"
        y="0"
        width="768"
        height="1376"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none"
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleAvatarClick}
      className={`relative select-none flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing ${className}`}
      style={{
        perspective: '1200px',
        width: width || '100%',
        height: height || '100%',
        background: 'transparent'
      }}
    >
      {/* Wrapper con rotación 3D */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${rotate3D.y}deg) rotateX(${rotate3D.x}deg) ${clickReaction ? 'scale(1.04)' : ''}`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Contenedor de cámara y zoom con escala y altura anatómica marcada */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `${zoomStyle} ${bodyScaleTransform}`,
            transformOrigin: zoomOrigin,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* =================================================================== */}
          {/* SILUETA DEL AVATAR CON HALO NEÓN PEGADO (.neon-hero-contour)        */}
          {/* Y EMOTES ANIMADOS ESTILO FORTNITE CON MOVIMIENTO VISIBLE DE PIES Y MANOS */}
          {/* =================================================================== */}
          <div className={`relative flex items-center justify-center h-full max-h-full neon-hero-contour ${
            isCheer ? 'animate-victory-jump' : isCombat ? 'animate-combat-ready' : isPower ? 'animate-power-surge' : isWalk ? 'animate-march-stride' : 'animate-breathing-loop'
          }`}>
            
            {/* Capa Posterior: Alas de Hada detrás del personaje */}
            {raceFeature === 'fairy_wings' && (
              <svg
                viewBox="0 0 768 1376"
                className="absolute inset-0 m-auto w-auto h-full max-h-full pointer-events-none overflow-visible animate-pulse"
                style={{ zIndex: 5 }}
              >
                <defs>
                  <linearGradient id="fairyWingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.65" />
                  </linearGradient>
                  <filter id="fairyGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#67E8F9" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* PAR DE ALAS IZQUIERDAS */}
                <g filter="url(#fairyGlow)">
                  <path d="M 330,420 C 260,340 180,260 120,230 C 130,270 160,370 220,430 C 270,480 310,460 330,420 Z" 
                        fill="url(#fairyWingGrad)" stroke="#0284C7" strokeWidth="2.5" />
                  <path d="M 120,230 Q 220,330 325,420" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.85" />
                  <path d="M 310,440 C 260,465 190,490 160,525 C 190,535 250,515 295,480 Z" 
                        fill="url(#fairyWingGrad)" stroke="#0284C7" strokeWidth="2" />
                  <circle cx="120" cy="230" r="3" fill="#FFFFFF" />
                  <circle cx="160" cy="525" r="2.5" fill="#FFFFFF" />
                </g>

                {/* PAR DE ALAS DERECHAS */}
                <g filter="url(#fairyGlow)">
                  <path d="M 438,420 C 508,340 588,260 648,230 C 638,270 608,370 548,430 C 498,480 458,460 438,420 Z" 
                        fill="url(#fairyWingGrad)" stroke="#0284C7" strokeWidth="2.5" />
                  <path d="M 648,230 Q 548,330 443,420" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.85" />
                  <path d="M 458,440 C 508,465 578,490 608,525 C 578,535 518,515 473,480 Z" 
                        fill="url(#fairyWingGrad)" stroke="#0284C7" strokeWidth="2" />
                  <circle cx="648" cy="230" r="3" fill="#FFFFFF" />
                  <circle cx="608" cy="525" r="2.5" fill="#FFFFFF" />
                </g>
              </svg>
            )}

            {/* Canvas Principal con Renderizado Cel-Shaded de Alta Definición */}
            <canvas
              ref={canvasRef}
              className="w-auto h-full max-h-full object-contain pointer-events-none"
              style={{ filter: 'contrast(1.03) brightness(1.02)', zIndex: 10 }}
            />

            {/* Capa Modular SVG Frontal Superpuesta en coordenadas exactas 768 x 1376 */}
            <svg
              viewBox="0 0 768 1376"
              className="absolute inset-0 m-auto w-auto h-full max-h-full pointer-events-none overflow-visible"
              style={{ zIndex: 15 }}
            >
              <defs>
                <linearGradient id="hairMainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={hairLightHex} />
                  <stop offset="45%" stopColor={hairHex} />
                  <stop offset="100%" stopColor={hairDarkHex} />
                </linearGradient>
                <linearGradient id="hairSheen" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* 1. PEINADOS ANIME FRONTALES Y VOLÚMENES */}
              {renderHairStyles()}

              {/* 2. RASGOS DE CABEZA / OREJAS / RAZAS FANTÁSTICAS */}
              {renderRaceFeatures()}

              {/* 3. FORMAS Y EXPRESIONES DE OJOS ANIME ALTAMENTE VISIBLES */}
              {renderEyes()}

              {/* 4. CALZADO ESPECIALIZADO (FOOTWEAR: SANDALIAS ALADAS, BOTAS DE BRUJA, BOTAS ACORAZADAS) */}
              {renderFootwear()}

              {/* 5. GORROS / SOMBREROS */}
              {equippedHat === 'hat_snapback_trainer' && (
                <g id="hat_snapback_layer" transform="translate(384, 158)">
                  <path d="M -80,-30 C -80,-115 80,-115 80,-30 Z" fill="#18181B" stroke="#09090B" strokeWidth="6" />
                  <path d="M -85,-28 C -35,-8 35,-8 85,-28 L 92,-38 C 35,-24 -35,-24 -92,-38 Z" fill="#09090B" stroke="#27272A" strokeWidth="4" />
                  <circle cx="45" cy="-58" r="12" fill="#E2E8F0" stroke="#475569" strokeWidth="2.5" />
                  <circle cx="41" cy="-60" r="3" fill="#0F172A" />
                  <circle cx="49" cy="-60" r="3" fill="#0F172A" />
                </g>
              )}

              {equippedHat === 'hat_witch' && (
                <g id="hat_witch_layer" transform="translate(384, 150)">
                  <ellipse cx="0" cy="5" rx="145" ry="42" fill="#3B0764" stroke="#1E0B30" strokeWidth="6" />
                  <path d="M -85,4 L 0,-180 Q 55,-140 18,-70 L 85,4 Z" fill="#4C1D95" stroke="#1E0B30" strokeWidth="6" />
                  <ellipse cx="0" cy="0" rx="90" ry="20" fill="#D946EF" />
                  <circle cx="0" cy="-20" r="24" fill="#FACC15" />
                  <circle cx="8" cy="-24" r="20" fill="#4C1D95" />
                </g>
              )}

              {equippedHat === 'hat_beret' && (
                <g id="hat_beret_layer" transform="translate(390, 150) rotate(-10)">
                  <ellipse cx="0" cy="0" rx="95" ry="38" fill="#BE185D" stroke="#831843" strokeWidth="5" />
                  <ellipse cx="-15" cy="-8" rx="65" ry="24" fill="#E11D48" />
                  <line x1="0" y1="-38" x2="0" y2="-48" stroke="#831843" strokeWidth="6" strokeLinecap="round" />
                </g>
              )}

              {equippedHat === 'hat_guild_crown' && (
                <g id="hat_crown_layer" transform="translate(384, 135)">
                  <path d="M -75,20 L -85,-38 L -42,-12 L 0,-50 L 42,-12 L 85,-38 L 75,20 Z" fill="#EAB308" stroke="#713F12" strokeWidth="5" />
                  <circle cx="0" cy="-50" r="7" fill="#EF4444" />
                  <circle cx="-85" cy="-38" r="6" fill="#3B82F6" />
                  <circle cx="85" cy="-38" r="6" fill="#10B981" />
                </g>
              )}

              {/* 6. PRENDA SUPERIOR MODULAR ANATÓMICA (TOP) */}
              {renderTop()}

              {/* 7. MOCHILA Y TIRANTES (SOLO SI ESTÁ EQUIPADA) */}
              {equippedAccessory === 'acc_red_backpack' && (
                <g id="acc_backpack_straps_layer">
                  <path d="M 305,370 C 315,450 322,500 328,570" fill="none" stroke="#DC2626" strokeWidth="20" strokeLinecap="round" />
                  <path d="M 305,370 C 315,450 322,500 328,570" fill="none" stroke="#991B1B" strokeWidth="4" />
                  <rect x="312" y="470" width="26" height="12" rx="3" fill="#18181B" />
                  <path d="M 463,370 C 453,450 446,500 440,570" fill="none" stroke="#DC2626" strokeWidth="20" strokeLinecap="round" />
                  <path d="M 463,370 C 453,450 446,500 440,570" fill="none" stroke="#991B1B" strokeWidth="4" />
                  <rect x="430" y="470" width="26" height="12" rx="3" fill="#18181B" />
                  <path d="M 500,430 C 560,430 580,520 575,640 L 490,640 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="5" />
                </g>
              )}

              {/* 7. PRENDAS EXTERIORES CEL-SHADED COMPLETAS (OUTERWEAR) */}
              {renderOuterwear()}

              {/* 8. ORBE DE SABIDURÍA PEDAGÓGICA (EN LA MANO DERECHA) */}
              {renderWisdomOrb()}

              {/* 9. ACCESORIOS ADICIONALES */}
              {equippedAccessory === 'acc_silver_pendant' && (
                <g id="acc_pendant_layer" transform="translate(384, 430)">
                  <path d="M -45,-30 C -20,25 20,25 45,-30" fill="none" stroke="#CBD5E1" strokeWidth="4" />
                  <circle cx="0" cy="24" r="16" fill="#94A3B8" stroke="#475569" strokeWidth="3" />
                  <circle cx="0" cy="24" r="8" fill="#F8FAFC" />
                </g>
              )}

              {equippedAccessory === 'acc_magic_wand' && (
                <g id="acc_wand_layer" transform="translate(230, 680) rotate(-25)">
                  <line x1="0" y1="0" x2="0" y2="-180" stroke="#78350F" strokeWidth="10" strokeLinecap="round" />
                  <polygon points="0,-180 14,-205 0,-230 -14,-205" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
                  <circle cx="0" cy="-205" r="22" fill="#38BDF8" opacity="0.65" />
                </g>
              )}

              {equippedAccessory === 'acc_scholar_glasses' && (
                <g id="acc_glasses_layer" transform="translate(384, 215)">
                  <circle cx="-32" cy="0" r="24" fill="rgba(255,255,255,0.3)" stroke="#F59E0B" strokeWidth="4" />
                  <circle cx="32" cy="0" r="24" fill="rgba(255,255,255,0.3)" stroke="#F59E0B" strokeWidth="4" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#F59E0B" strokeWidth="4" />
                </g>
              )}

              {/* 10. EFECTOS ESPECIALES Y PARTICULAS DE POSES */}
              {isPower && (
                <g id="power_lightning_fx" className="animate-pulse">
                  <path d="M 384,200 L 320,100 L 360,60 L 280,-20" fill="none" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 538,650 L 590,560 L 560,520 L 630,420" fill="none" stroke="#FF007F" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="538" cy="650" r="32" fill="#00F0FF" opacity="0.75" />
                </g>
              )}
            </svg>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* EMOTES DINÁMICOS ESTILO FORTNITE A 60 FPS CON MOVIMIENTO VISIBLE    */}
      {/* =================================================================== */}
      <style jsx>{`
        /* Respiración fluida en reposo */
        .animate-breathing-loop {
          animation: heroBreatheSmooth 3.2s ease-in-out infinite;
          transform-origin: 50% 88%;
        }

        @keyframes heroBreatheSmooth {
          0%, 100% {
            transform: translateY(0) scaleY(1);
          }
          50% {
            transform: translateY(-6px) scaleY(1.012);
          }
        }

        /* Emote Pose de Combate: Rebote marcial ágil, esquiva lateral, juego de pies y finta */
        .animate-combat-ready {
          animation: combatReadyEmote 1.0s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 50% 90%;
        }

        @keyframes combatReadyEmote {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          20% {
            transform: translateY(16px) translateX(-24px) rotate(-4.5deg) scale(0.96, 0.96);
          }
          45% {
            transform: translateY(-14px) translateX(-6px) rotate(-1deg) scale(1.02, 1.02);
          }
          70% {
            transform: translateY(16px) translateX(24px) rotate(4.5deg) scale(0.96, 0.96);
          }
          85% {
            transform: translateY(-12px) translateX(6px) rotate(1deg) scale(1.02, 1.02);
          }
        }

        /* Emote Salto de Victoria: Agachada de anticipación, salto alto, giro aéreo y aterrizaje */
        .animate-victory-jump {
          animation: victoryJumpDanceEmote 1.4s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          transform-origin: 50% 95%;
        }

        @keyframes victoryJumpDanceEmote {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          15% {
            transform: translateY(22px) scale(0.92, 0.94);
          }
          45% {
            transform: translateY(-88px) rotate(-6deg) scale(1.08, 1.05);
          }
          65% {
            transform: translateY(-74px) rotate(6deg) scale(1.06, 1.05);
          }
          82% {
            transform: translateY(12px) rotate(0deg) scale(0.94, 0.95);
          }
        }

        /* Emote Canalización Mágica: Levitación en suspensión aérea y oleadas de energía */
        .animate-power-surge {
          animation: levitationPowerEmote 1.8s ease-in-out infinite;
          transform-origin: 50% 80%;
        }

        @keyframes levitationPowerEmote {
          0%, 100% {
            transform: translateY(-56px) scale(1.04) rotate(-2deg);
          }
          50% {
            transform: translateY(-80px) scale(1.07) rotate(2.5deg);
          }
        }

        /* Emote Paso de Marcha: Zancada enérgica de desfile militar con elevación de rodillas y pies */
        .animate-march-stride {
          animation: marchStrideEmote 0.85s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 50% 95%;
        }

        @keyframes marchStrideEmote {
          0%, 100% {
            transform: translateY(6px) translateX(0) rotate(0deg) skewX(0deg) scaleY(0.97);
          }
          25% {
            transform: translateY(-26px) translateX(-18px) rotate(4.5deg) skewX(3.5deg) scaleY(1.03);
          }
          50% {
            transform: translateY(6px) translateX(0) rotate(0deg) skewX(0deg) scaleY(0.97);
          }
          75% {
            transform: translateY(-26px) translateX(18px) rotate(-4.5deg) skewX(-3.5deg) scaleY(1.03);
          }
        }
      `}</style>
    </div>
  );
};
