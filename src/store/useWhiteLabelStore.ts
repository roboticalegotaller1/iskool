import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WhiteLabelState {
  logoUrl: string;
  primaryColor: string; // Hexadecimal string, p. ej. '#2563EB'
  schoolName: string;
  isCustomized: boolean;

  // Acciones
  setLogoUrl: (url: string) => void;
  setPrimaryColor: (hexColor: string) => void;
  setSchoolName: (name: string) => void;
  setWhiteLabelConfig: (config: { logoUrl?: string; primaryColor?: string; schoolName?: string }) => void;
  resetWhiteLabel: () => void;
  applyTheme: () => void;
}

/**
 * Convierte color Hexadecimal (#RRGGBB o #RGB) a valores RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number; rgbString: string } {
  if (!hex || typeof hex !== 'string') {
    return { r: 37, g: 99, b: 235, rgbString: '37, 99, 235' };
  }
  const cleanHex = hex.replace('#', '').trim();
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(fullHex, 16);
  if (isNaN(num)) {
    return { r: 37, g: 99, b: 235, rgbString: '37, 99, 235' };
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b, rgbString: `${r}, ${g}, ${b}` };
}

/**
 * Convierte color Hexadecimal a representación HSL de Tailwind
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number; hslString: string } {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  return {
    h: hDeg,
    s: sPct,
    l: lPct,
    hslString: `${hDeg} ${sPct}% ${lPct}%`
  };
}

/**
 * Inyecta dinámicamente las variables CSS institucionales al :root del DOM
 */
export function applyWhiteLabelCssVariables(primaryColorHex: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !primaryColorHex) return;
  try {
    const root = document.documentElement;
    const hsl = hexToHsl(primaryColorHex);
    const rgb = hexToRgb(primaryColorHex);

    // Variables estándar de Tailwind v4 y diseño institucional
    root.style.setProperty('--color-primary-hsl', hsl.hslString);
    root.style.setProperty('--color-brand-primary-hsl', hsl.hslString);

    root.style.setProperty('--color-primary', primaryColorHex);
    root.style.setProperty('--color-brand-primary', primaryColorHex);
    root.style.setProperty('--brand-primary', primaryColorHex);
    root.style.setProperty('--primary-color', primaryColorHex);
    root.style.setProperty('--brand-primary-rgb', rgb.rgbString);
    root.style.setProperty('--color-primary-rgb', rgb.rgbString);

    // Sombras y estados hover computados
    root.style.setProperty('--brand-primary-hover', `hsl(${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 8, 12)}%)`);
    root.style.setProperty('--brand-primary-light', `hsl(${hsl.h} ${hsl.s}% 96%)`);
  } catch (err) {
    console.warn('Error inyectando variables CSS de Marca Blanca:', err);
  }
}

export const DEFAULT_WHITE_LABEL_CONFIG = {
  logoUrl: '',
  primaryColor: '#2563EB', // Azul Zafiro Institucional Predeterminado
  schoolName: '',
  isCustomized: false
};

export const useWhiteLabelStore = create<WhiteLabelState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_WHITE_LABEL_CONFIG,

      setLogoUrl: (url: string) => {
        const trimmed = url.trim();
        set({ 
          logoUrl: trimmed, 
          isCustomized: Boolean(trimmed || get().primaryColor !== DEFAULT_WHITE_LABEL_CONFIG.primaryColor || get().schoolName) 
        });
      },

      setPrimaryColor: (hexColor: string) => {
        const formattedHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
        set({ 
          primaryColor: formattedHex,
          isCustomized: Boolean(get().logoUrl || formattedHex !== DEFAULT_WHITE_LABEL_CONFIG.primaryColor || get().schoolName)
        });
        applyWhiteLabelCssVariables(formattedHex);
      },

      setSchoolName: (name: string) => {
        const trimmed = name.trim();
        set({ 
          schoolName: trimmed,
          isCustomized: Boolean(get().logoUrl || get().primaryColor !== DEFAULT_WHITE_LABEL_CONFIG.primaryColor || trimmed)
        });
      },

      setWhiteLabelConfig: (config) => {
        const newPrimary = config.primaryColor 
          ? (config.primaryColor.startsWith('#') ? config.primaryColor : `#${config.primaryColor}`)
          : get().primaryColor;
        
        const newLogo = config.logoUrl !== undefined ? config.logoUrl.trim() : get().logoUrl;
        const newName = config.schoolName !== undefined ? config.schoolName.trim() : get().schoolName;

        set({
          logoUrl: newLogo,
          primaryColor: newPrimary,
          schoolName: newName,
          isCustomized: Boolean(newLogo || newPrimary !== DEFAULT_WHITE_LABEL_CONFIG.primaryColor || newName)
        });

        applyWhiteLabelCssVariables(newPrimary);
      },

      resetWhiteLabel: () => {
        set({ ...DEFAULT_WHITE_LABEL_CONFIG });
        applyWhiteLabelCssVariables(DEFAULT_WHITE_LABEL_CONFIG.primaryColor);
      },

      applyTheme: () => {
        applyWhiteLabelCssVariables(get().primaryColor);
      }
    }),
    {
      name: 'iskool_whitelabel_store',
      onRehydrateStorage: () => (state) => {
        if (state?.primaryColor) {
          applyWhiteLabelCssVariables(state.primaryColor);
        }
      }
    }
  )
);
