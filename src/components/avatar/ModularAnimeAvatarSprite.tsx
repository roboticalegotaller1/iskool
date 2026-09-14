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
  showPedestal = true,
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

        const hairAssetKey = (!isFemale && !isNeutral && hairStyle !== 'spiky')
          ? (HAIR_ASSET_MAP[hairStyle] || null)
          : null;

        const baseSrc = isFemale 
          ? '/images/avatar/trainer_female_clean.png' 
          : isNeutral 
          ? '/images/avatar/trainer_neutral_clean.png' 
          : hairAssetKey
          ? `/images/avatar/hairstyles/trainer_male_${hairAssetKey}.png`
          : '/images/avatar/trainer_base_clean.png';

        const skinMaskSrc = isFemale 
          ? '/images/avatar/trainer_female_skin_mask.png' 
          : isNeutral 
          ? '/images/avatar/trainer_neutral_skin_mask.png' 
          : '/images/avatar/trainer_clean_skin_mask.png';

        const hairMaskSrc = isFemale 
          ? '/images/avatar/trainer_female_hair_mask.png' 
          : isNeutral 
          ? '/images/avatar/trainer_neutral_hair_mask.png' 
          : hairAssetKey
          ? `/images/avatar/hairstyles/trainer_male_${hairAssetKey}_hair_mask.png`
          : '/images/avatar/trainer_hair_mask.png';

        const pantsMaskSrc = isFemale 
          ? '/images/avatar/trainer_female_pants_mask.png' 
          : isNeutral 
          ? '/images/avatar/trainer_neutral_pants_mask.png' 
          : '/images/avatar/trainer_pants_mask.png';

        const bootsMaskSrc = isFemale 
          ? '/images/avatar/trainer_female_boots_mask.png' 
          : isNeutral 
          ? '/images/avatar/trainer_neutral_boots_mask.png' 
          : '/images/avatar/trainer_boots_mask.png';

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

        // 1. Dibujar imagen base sin fondo
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
          // B) Cabello dinámico (Coloreado anatómico de alta fidelidad)
          else if (hmData[idx] > 50) {
            if (!isDefaultHair) {
              const f = lum / 85;
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

  // Zoom transform
  const zoomStyle = zoom === 'face' 
    ? 'scale(2.2) translateY(24%)' 
    : zoom === 'upper' 
    ? 'scale(1.4) translateY(12%)' 
    : 'scale(1) translateY(0%)';

  const bodyScaleTransform = useMemo(() => {
    if (bodyScale === 'compact') {
      return 'scale(0.82, 0.84) translateY(8%)';
    }
    if (bodyScale === 'tall') {
      return 'scale(1.12, 1.16) translateY(-5%)';
    }
    return 'scale(1.0, 1.0) translateY(0%)';
  }, [bodyScale]);

  // Coordenadas oculares calibradas con precisión milimétrica dentro de las cuencas anatómicas
  const eyeCoords = useMemo(() => {
    if (gender === 'female') {
      return {
        left: { cx: 347, cy: 197, rx: 9, ry: 9.5 },
        right: { cx: 418, cy: 192, rx: 9, ry: 9.5 },
        isFemale: true,
        leftSocket: 'M 328,197 Q 347,184 368,198 Q 347,209 328,197 Z',
        rightSocket: 'M 398,194 Q 418,180 438,192 Q 418,204 398,194 Z',
        leftLid: 'M 368,198 Q 347,184 328,197',
        rightLid: 'M 398,194 Q 418,180 438,192'
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
    if (eyesStyle === 'determined') {
      return null; // Los ojos nativos del modelo anime se lucen 100% nítidos
    }

    const { left, right, isFemale, leftSocket, rightSocket, leftLid, rightLid } = eyeCoords;

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

    switch (eyesStyle) {
      case 'cheerful': // Alegres y Radiantes (Sonrisa anime con ojos curvados cerrados ^_^)
        return (
          <g id="eyes_cheerful">
            {/* Parches del párpado superior integrado con la piel */}
            <path d={`M ${left.cx - 18},${left.cy - 7} Q ${left.cx},${left.cy - 10} ${left.cx + 18},${left.cy - 6} L ${left.cx + 17},${left.cy + 7} Q ${left.cx},${left.cy + 9} ${left.cx - 17},${left.cy + 7} Z`} fill={skinHex} />
            <path d={`M ${right.cx - 18},${right.cy - 6} Q ${right.cx},${right.cy - 10} ${right.cx + 18},${right.cy - 7} L ${right.cx + 17},${right.cy + 7} Q ${right.cx},${right.cy + 9} ${right.cx - 17},${right.cy + 7} Z`} fill={skinHex} />
            {/* Rubor delicado en las mejillas */}
            <ellipse cx={left.cx - 10} cy={left.cy + 20} rx="12" ry="5" fill="#F43F5E" opacity="0.38" />
            <ellipse cx={right.cx + 10} cy={right.cy + 20} rx="12" ry="5" fill="#F43F5E" opacity="0.38" />
            {/* Arcos curvados anime en las cuencas */}
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'wink': // Guiño Pícaro (>_• con estrella de destello)
        return (
          <g id="eyes_wink">
            {renderSocketDefs()}
            {/* Ojo izquierdo abierto con iris zafiro brillante y destello */}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#F8FAFC" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#0284C7" />
              <ellipse cx={left.cx} cy={left.cy + 2} rx={left.rx - 1} ry="4" fill="#38BDF8" opacity="0.8" />
              <circle cx={left.cx} cy={left.cy} r="4" fill="#09090B" />
              <polygon points={`${left.cx},${left.cy - 5} ${left.cx + 2.5},${left.cy - 1} ${left.cx + 5},${left.cy} ${left.cx + 2.5},${left.cy + 1} ${left.cx},${left.cy + 5} ${left.cx - 2.5},${left.cy + 1} ${left.cx - 5},${left.cy} ${left.cx - 2.5},${left.cy - 1}`} fill="#FFFFFF" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2.2" fill="#FFFFFF" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            {/* Ojo derecho guiñado en arco anime */}
            <path d={`M ${right.cx - 18},${right.cy - 6} Q ${right.cx},${right.cy - 10} ${right.cx + 18},${right.cy - 7} L ${right.cx + 17},${right.cy + 7} Q ${right.cx},${right.cy + 9} ${right.cx - 17},${right.cy + 7} Z`} fill={skinHex} />
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx={right.cx + 8} cy={right.cy + 16} rx="10" ry="5" fill="#F43F5E" opacity="0.38" />
            {isFemale && (
              <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>
        );

      case 'cat_eyes': // Felinos de Cazador (Pupilas verticales felinas y reflejos dorados)
        return (
          <g id="eyes_cat">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#FFFBEB" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#D97706" />
              <ellipse cx={left.cx} cy={left.cy + 2} rx={left.rx - 1} ry="4" fill="#FBBF24" />
              <ellipse cx={left.cx} cy={left.cy} rx="2" ry="7" fill="#09090B" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            <g clipPath="url(#eyeSocketRight)">
              <rect x="390" y="185" width="45" height="30" fill="#FFFBEB" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#D97706" />
              <ellipse cx={right.cx} cy={right.cy + 2} rx={right.rx - 1} ry="4" fill="#FBBF24" />
              <ellipse cx={right.cx} cy={right.cy} rx="2" ry="7" fill="#09090B" />
              <circle cx={right.cx - 3} cy={right.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'flame': // Fuego Ardiente (Pupilas de llama ámbar con fuego vivo)
        return (
          <g id="eyes_flame">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#FEF2F2" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#DC2626" />
              <circle cx={left.cx} cy={left.cy + 2} r="5" fill="#F59E0B" />
              <polygon points={`${left.cx},${left.cy - 4} ${left.cx + 2},${left.cy} ${left.cx - 1},${left.cy + 3} ${left.cx - 2.5},${left.cy - 1}`} fill="#FEF08A" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            <g clipPath="url(#eyeSocketRight)">
              <rect x="390" y="185" width="45" height="30" fill="#FEF2F2" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#DC2626" />
              <circle cx={right.cx} cy={right.cy + 2} r="5" fill="#F59E0B" />
              <polygon points={`${right.cx},${right.cy - 4} ${right.cx + 2},${right.cy} ${right.cx - 1},${right.cy + 3} ${right.cx - 2.5},${right.cy - 1}`} fill="#FEF08A" />
              <circle cx={right.cx - 3} cy={right.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'lightning': // Relámpago Celeste (Pupilas eléctricas celestes acopladas con precisión)
        return (
          <g id="eyes_lightning">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#F0F9FF" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#0284C7" />
              <circle cx={left.cx} cy={left.cy + 2} r="5.5" fill="#38BDF8" />
              <polygon points={`${left.cx},${left.cy - 4} ${left.cx + 2.5},${left.cy - 1} ${left.cx},${left.cy} ${left.cx + 1.5},${left.cy + 4} ${left.cx - 1.5},${left.cy + 1} ${left.cx},${left.cy}`} fill="#FFFFFF" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2.2" fill="#FFFFFF" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            <g clipPath="url(#eyeSocketRight)">
              <rect x="390" y="185" width="45" height="30" fill="#F0F9FF" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#0284C7" />
              <circle cx={right.cx} cy={right.cy + 2} r="5.5" fill="#38BDF8" />
              <polygon points={`${right.cx},${right.cy - 4} ${right.cx + 2.5},${right.cy - 1} ${right.cx},${right.cy} ${right.cx + 1.5},${right.cy + 4} ${right.cx - 1.5},${right.cy + 1} ${right.cx},${right.cy}`} fill="#FFFFFF" />
              <circle cx={right.cx - 3} cy={right.cy - 3} r="2.2" fill="#FFFFFF" />
            </g>
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'heterochromia': // Heterocromía Bicolor (Izquierdo dorado, Derecho cian)
        return (
          <g id="eyes_heterochromia">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#FFFBEB" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill="#D97706" />
              <circle cx={left.cx} cy={left.cy + 2} r="5" fill="#FBBF24" />
              <circle cx={left.cx} cy={left.cy} r="3.5" fill="#78350F" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            <g clipPath="url(#eyeSocketRight)">
              <rect x="390" y="185" width="45" height="30" fill="#F0FDFA" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill="#0284C7" />
              <circle cx={right.cx} cy={right.cy + 2} r="5" fill="#38BDF8" />
              <circle cx={right.cx} cy={right.cy} r="3.5" fill="#0C4A6E" />
              <circle cx={right.cx - 3} cy={right.cy - 3} r="2" fill="#FFFFFF" />
            </g>
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
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
        const irisCol = eyesStyle === 'emerald' ? '#059669' : eyesStyle === 'ruby' ? '#DC2626' : eyesStyle === 'sapphire' ? '#2563EB' : eyesStyle === 'scholar' ? '#0D9488' : eyesStyle === 'nebula_eyes' ? '#7C3AED' : eyesStyle === 'sparkle' ? '#4F46E5' : '#9333EA';
        const glowCol = eyesStyle === 'emerald' ? '#34D399' : eyesStyle === 'ruby' ? '#F87171' : eyesStyle === 'sapphire' ? '#60A5FA' : eyesStyle === 'scholar' ? '#5EEAD4' : eyesStyle === 'nebula_eyes' ? '#C084FC' : eyesStyle === 'sparkle' ? '#818CF8' : '#C084FC';
        return (
          <g id="eyes_colored">
            {renderSocketDefs()}
            <g clipPath="url(#eyeSocketLeft)">
              <rect x="330" y="185" width="45" height="30" fill="#FFFFFF" />
              <ellipse cx={left.cx} cy={left.cy} rx={left.rx} ry={left.ry} fill={irisCol} />
              <ellipse cx={left.cx} cy={left.cy + 2} rx={left.rx - 1} ry="4" fill={glowCol} />
              <circle cx={left.cx} cy={left.cy} r="4" fill="#09090B" />
              <circle cx={left.cx - 3} cy={left.cy - 3} r="2.2" fill="#FFFFFF" />
              <circle cx={left.cx + 3} cy={left.cy + 3} r="1.3" fill="#FFFFFF" opacity="0.75" />
            </g>
            <path d={leftLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

            <g clipPath="url(#eyeSocketRight)">
              <rect x="390" y="185" width="45" height="30" fill="#FFFFFF" />
              <ellipse cx={right.cx} cy={right.cy} rx={right.rx} ry={right.ry} fill={irisCol} />
              <ellipse cx={right.cx} cy={right.cy + 2} rx={right.rx - 1} ry="4" fill={glowCol} />
              <circle cx={right.cx} cy={right.cy} r="4" fill="#09090B" />
              <circle cx={right.cx - 3} cy={right.cy - 3} r="2.2" fill="#FFFFFF" />
              <circle cx={right.cx + 3} cy={right.cy + 3} r="1.3" fill="#FFFFFF" opacity="0.75" />
            </g>
            <path d={rightLid} fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {isFemale && (
              <>
                <path d="M 342,200 Q 338,196 335,193" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 426,198 Q 429,195 432,192" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
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
            <path d="M 315,160 L 300,75 C 315,80 345,115 355,145 Z" fill={hairHex} stroke="#09090B" strokeWidth="5" />
            <path d="M 318,145 L 308,90 C 318,95 338,118 345,138 Z" fill="#F472B6" />
            <polygon points="325,120 335,130 328,135" fill="#FFFFFF" />
            <path d="M 453,160 L 468,75 C 453,80 423,115 413,145 Z" fill={hairHex} stroke="#09090B" strokeWidth="5" />
            <path d="M 450,145 L 460,90 C 450,95 430,118 423,138 Z" fill="#F472B6" />
            <polygon points="443,120 433,130 440,135" fill="#FFFFFF" />
          </g>
        );

      case 'wolf_ears': // Lobo de las Tormentas
        return (
          <g id="race_wolf_ears">
            <path d="M 320,155 L 295,65 C 315,75 350,120 360,150 Z" fill="#374151" stroke="#111827" strokeWidth="5" />
            <path d="M 322,140 L 305,82 C 318,90 340,120 348,140 Z" fill="#6B7280" />
            <polygon points="295,65 305,80 300,90" fill="#111827" />
            <circle cx="302" cy="98" r="5" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <path d="M 448,155 L 473,65 C 453,75 418,120 408,150 Z" fill="#374151" stroke="#111827" strokeWidth="5" />
            <path d="M 446,140 L 463,82 C 450,90 428,120 420,140 Z" fill="#6B7280" />
            <polygon points="473,65 463,80 468,90" fill="#111827" />
          </g>
        );

      case 'bunny_ears': // Orejitas de Conejo Lunar
        return (
          <g id="race_bunny_ears">
            <path d="M 335,150 C 315,100 310,20 338,15 C 355,20 360,95 352,150 Z" fill="#FFFFFF" stroke="#09090B" strokeWidth="5" />
            <path d="M 338,135 C 326,95 322,35 338,30 C 348,35 352,90 346,135 Z" fill="#FBCFE8" />
            <path d="M 416,150 C 424,95 430,45 448,40 C 462,45 460,75 440,90 C 445,105 442,130 433,150 Z" fill="#FFFFFF" stroke="#09090B" strokeWidth="5" />
            <path d="M 423,135 C 430,90 435,55 446,50 C 454,54 445,78 433,88 C 435,105 432,125 425,135 Z" fill="#FBCFE8" />
          </g>
        );

      case 'dragon_horns': // Cuernos de Dragón Dorado
        return (
          <g id="race_dragon_horns">
            <path d="M 330,165 C 290,130 280,75 320,55 C 330,85 345,130 355,160 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="5" />
            <line x1="305" y1="95" x2="335" y2="105" stroke="#FEF08A" strokeWidth="3" />
            <line x1="312" y1="125" x2="345" y2="135" stroke="#FEF08A" strokeWidth="3" />
            <path d="M 438,165 C 478,130 488,75 448,55 C 438,85 423,130 413,160 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="5" />
            <line x1="463" y1="95" x2="433" y2="105" stroke="#FEF08A" strokeWidth="3" />
            <line x1="456" y1="125" x2="423" y2="135" stroke="#FEF08A" strokeWidth="3" />
          </g>
        );

      case 'demon_horns': // Cuernitos de Gárgola
        return (
          <g id="race_demon_horns">
            <path d="M 335,165 C 300,140 305,90 340,80 C 335,110 345,140 355,165 Z" fill="#18181B" stroke="#991B1B" strokeWidth="4" />
            <polygon points="338,80 344,88 335,92" fill="#EF4444" />
            <path d="M 433,165 C 468,140 463,90 428,80 C 433,110 423,140 413,165 Z" fill="#18181B" stroke="#991B1B" strokeWidth="4" />
            <polygon points="430,80 424,88 433,92" fill="#EF4444" />
          </g>
        );

      case 'stag_antlers': // Astas de Ciervo Silvestre
        return (
          <g id="race_stag_antlers">
            <path d="M 335,150 L 305,80 L 280,65 M 305,80 L 315,50 M 310,105 L 285,100" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="280" cy="65" r="4" fill="#22C55E" />
            <circle cx="315" cy="50" r="4" fill="#22C55E" />
            <path d="M 433,150 L 463,80 L 488,65 M 463,80 L 453,50 M 458,105 L 483,100" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="488" cy="65" r="4" fill="#22C55E" />
            <circle cx="453" cy="50" r="4" fill="#22C55E" />
          </g>
        );

      case 'angel_halo': // Aureola Sagrada Flotante
        return (
          <g id="race_angel_halo" transform="translate(384, 70)" className="animate-pulse">
            <ellipse cx="0" cy="0" rx="75" ry="18" fill="none" stroke="#FDE047" strokeWidth="7" opacity="0.95" />
            <ellipse cx="0" cy="0" rx="75" ry="18" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="-50" cy="-6" r="3.5" fill="#FFFFFF" />
            <circle cx="45" cy="4" r="3.5" fill="#FFFFFF" />
          </g>
        );

      case 'crystal_crown': // Corona Rúnica de Cristal Flotante
        return (
          <g id="race_crystal_crown" transform="translate(384, 130)">
            <polygon points="0,-42 -8,-10 0,-18 8,-10" fill="#00F0FF" stroke="#0284C7" strokeWidth="2" />
            <polygon points="-32,-30 -38,-5 -30,-12 -24,-5" fill="#A855F7" stroke="#6B21A8" strokeWidth="2" />
            <polygon points="32,-30 24,-5 30,-12 38,-5" fill="#A855F7" stroke="#6B21A8" strokeWidth="2" />
            <polygon points="-60,-15 -64,5 -58,0 -52,5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <polygon points="60,-15 52,5 58,0 64,5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          </g>
        );

      case 'cosmic_antennae': // Antenas Cósmicas Estelares
        return (
          <g id="race_cosmic_antennae">
            <path d="M 355,140 Q 330,100 325,65" fill="none" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="325" cy="65" r="9" fill="#00F0FF" className="animate-ping" opacity="0.6" />
            <circle cx="325" cy="65" r="7" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 413,140 Q 438,100 443,65" fill="none" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="443" cy="65" r="9" fill="#00F0FF" className="animate-ping" opacity="0.6" />
            <circle cx="443" cy="65" r="7" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );

      case 'elf_long': // Elfo Boreal
        return (
          <g id="race_elf_long">
            <path d="M 315,200 C 290,195 245,170 240,160 C 255,185 285,215 315,225 Z" fill={skinHex} stroke="#09090B" strokeWidth="4" />
            <path d="M 305,202 C 285,195 260,180 255,172 C 265,185 285,205 305,212 Z" fill="#F43F5E" opacity="0.25" />
            <rect x="270" y="180" width="6" height="12" rx="2" fill="#FACC15" stroke="#713F12" strokeWidth="1" />
            <path d="M 453,200 C 478,195 523,170 528,160 C 513,185 483,215 453,225 Z" fill={skinHex} stroke="#09090B" strokeWidth="4" />
            <path d="M 463,202 C 483,195 508,180 513,172 C 503,185 483,205 463,212 Z" fill="#F43F5E" opacity="0.25" />
            <rect x="492" y="180" width="6" height="12" rx="2" fill="#FACC15" stroke="#713F12" strokeWidth="1" />
          </g>
        );

      case 'elf_short': // Elfo Ágil
        return (
          <g id="race_elf_short">
            <path d="M 315,202 C 298,196 275,180 270,172 C 280,188 300,208 315,218 Z" fill={skinHex} stroke="#09090B" strokeWidth="3.5" />
            <circle cx="282" cy="192" r="3" fill="#FACC15" />
            <path d="M 453,202 C 470,196 493,180 498,172 C 488,188 468,208 453,218 Z" fill={skinHex} stroke="#09090B" strokeWidth="3.5" />
            <circle cx="486" cy="192" r="3" fill="#FACC15" />
          </g>
        );

      case 'merfolk_fins': // Aletas de Sirena
        return (
          <g id="race_merfolk_fins">
            <path d="M 315,195 C 275,175 255,190 245,170 C 265,205 270,225 315,230 Z" fill="#06B6D4" opacity="0.75" stroke="#083344" strokeWidth="3" />
            <path d="M 453,195 C 493,175 513,190 523,170 C 503,205 498,225 453,230 Z" fill="#06B6D4" opacity="0.75" stroke="#083344" strokeWidth="3" />
          </g>
        );

      case 'rune_tattoo': // Tatuajes Rúnicos Faciales
        return (
          <g id="race_rune_tattoo" className="animate-pulse">
            <path d="M 330,230 L 338,245 L 346,230 M 338,226 L 338,252" fill="none" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 438,230 L 430,245 L 422,230 M 430,226 L 430,252" fill="none" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" />
            <polygon points="384,170 388,178 384,186 380,178" fill="#F43F5E" />
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
              d="M 340,275 C 315,285 275,305 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,305 475,285 450,275 Z" 
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

            {/* Cuello elástico a rayas */}
            <path d="M 330,278 Q 384,325 440,278" fill="none" stroke="#1E3A8A" strokeWidth="16" strokeLinecap="round" />
            <path d="M 330,278 Q 384,325 440,278" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="14,10" strokeLinecap="round" />

            {/* Botones y botonera central */}
            <line x1="384" y1="310" x2="384" y2="626" stroke="#1E40AF" strokeWidth="6" />
            <circle cx="384" cy="365" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="425" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="485" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
            <circle cx="384" cy="545" r="5" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />

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
              d="M 340,275 C 315,285 275,305 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,305 475,285 450,275 Z" 
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

            {/* Capucha drapeada en el cuello */}
            <path d="M 310,290 C 330,260 384,255 438,260 C 458,290 448,340 384,345 C 320,340 310,290 310,290 Z" fill="#0369A1" stroke="#09090B" strokeWidth="4.5" />
            <path d="M 325,295 C 345,280 384,275 423,280 C 435,305 425,330 384,335 C 343,330 333,305 325,295 Z" fill="#0284C7" />

            {/* Cordones blancos con herrajes */}
            <path d="M 355,330 C 352,380 350,420 352,460" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <rect x="349" y="455" width="6" height="12" rx="2" fill="#94A3B8" />
            <path d="M 413,330 C 416,380 418,420 416,460" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <rect x="413" y="455" width="6" height="12" rx="2" fill="#94A3B8" />

            {/* Bolsillo canguro frontal */}
            <path d="M 320,525 L 448,525 L 460,615 L 308,615 Z" fill="#0369A1" stroke="#09090B" strokeWidth="3.5" />
            <rect x="270" y="626" width="226" height="20" rx="4" fill="#0369A1" stroke="#09090B" strokeWidth="3" />
          </g>
        );

      case 'outerwear_bomber_jacket': // Chamarra Bomber de Héroe Aviador
        return (
          <g id="outerwear_bomber_layer">
            <path 
              d="M 340,275 C 315,285 275,305 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,305 475,285 450,275 Z" 
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

            {/* Cuello de borrego abullonado */}
            <path d="M 310,285 C 335,320 375,325 384,395 C 393,325 433,320 458,285 C 440,265 330,265 310,285 Z" fill="#FEF3C7" stroke="#09090B" strokeWidth="4.5" />
            <circle cx="340" cy="305" r="12" fill="#FDE68A" />
            <circle cx="428" cy="305" r="12" fill="#FDE68A" />

            {/* Cremallera de latón */}
            <line x1="384" y1="395" x2="384" y2="626" stroke="#F59E0B" strokeWidth="5" />
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
              d="M 340,275 C 315,285 275,305 252,330 C 240,365 240,420 286,465 L 274,642 L 492,642 L 504,465 C 550,420 550,365 538,330 C 515,305 475,285 450,275 Z" 
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

            {/* Cuello de felpa / borrego esponjoso */}
            <path d="M 285,305 C 315,285 355,335 384,375 C 413,335 453,285 483,305 C 460,395 410,430 384,440 C 358,430 308,395 285,305 Z" fill="#3F3F46" stroke="#18181B" strokeWidth="4.5" />
            <circle cx="315" cy="345" r="18" fill="#52525B" />
            <circle cx="453" cy="345" r="18" fill="#52525B" />
            <circle cx="384" cy="400" r="16" fill="#71717A" />

            {/* Broche plateado rúnico central */}
            <circle cx="384" cy="430" r="12" fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
            <circle cx="384" cy="430" r="5" fill="#0284C7" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleAvatarClick}
      className={`relative select-none flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
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
            transformOrigin: '50% 65%',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* =================================================================== */}
          {/* SILUETA DEL AVATAR CON HALO NEÓN PEGADO (.neon-hero-contour)        */}
          {/* Y EMOTES ANIMADOS ESTILO FORTNITE CON MOVIMIENTO VISIBLE DE PIES Y MANOS */}
          {/* =================================================================== */}
          <div className={`relative flex items-center justify-center h-full max-h-[94%] neon-hero-contour ${
            isCheer ? 'animate-victory-jump' : isCombat ? 'animate-combat-ready' : isPower ? 'animate-power-surge' : isWalk ? 'animate-march-stride' : 'animate-breathing-loop'
          }`}>
            
            {/* Capa Posterior: Alas de Hada detrás del personaje */}
            {raceFeature === 'fairy_wings' && (
              <svg
                viewBox="0 0 768 1376"
                className="absolute inset-0 m-auto w-auto h-full max-h-full pointer-events-none overflow-visible animate-pulse"
                style={{ zIndex: 5 }}
              >
                <path d="M 330,440 C 200,320 120,400 130,520 C 150,600 270,550 330,490 Z" fill="#38BDF8" opacity="0.65" stroke="#0284C7" strokeWidth="4" />
                <path d="M 320,460 C 230,400 180,450 180,510 C 200,560 270,530 320,490 Z" fill="#F472B6" opacity="0.4" />
                <path d="M 438,440 C 568,320 648,400 638,520 C 618,600 498,550 438,490 Z" fill="#38BDF8" opacity="0.65" stroke="#0284C7" strokeWidth="4" />
                <path d="M 448,460 C 538,400 588,450 588,510 C 568,560 498,530 448,490 Z" fill="#F472B6" opacity="0.4" />
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

              {/* 6. MOCHILA Y TIRANTES (SOLO SI ESTÁ EQUIPADA) */}
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

          {/* Pedestal Holográfico Futurista Circular */}
          {showPedestal && (
            <div className="absolute bottom-2 pointer-events-none flex items-center justify-center -z-10">
              <svg viewBox="0 0 320 80" className="w-80 h-20 overflow-visible">
                <ellipse cx="160" cy="40" rx="140" ry="32" fill="none" stroke="#00F0FF" strokeWidth="3.5" opacity="0.9" />
                <ellipse cx="160" cy="40" rx="110" ry="24" fill="#06B6D4" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="2.5" />
                <ellipse cx="160" cy="40" rx="75" ry="16" fill="none" stroke="#A5F3FC" strokeWidth="2" strokeDasharray="12,6" />
                <ellipse cx="160" cy="40" rx="35" ry="8" fill="#00F0FF" fillOpacity="0.4" />
              </svg>
            </div>
          )}
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
