import { TenantId } from '@/lib/auth/multiTenantSession';
import { hexToHsl, hexToRgb } from '@/store/useWhiteLabelStore';

export interface TenantThemeTokens {
  tenantId: TenantId;
  schoolName: string;
  shortName: string;
  tagline: string;
  badgeText: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  heroGradient: string;
  cardRadius: string;
  themePreset: string;
  cssVariables: Record<string, string>;
}

export const ISKOOL_THEME_TOKENS: TenantThemeTokens = {
  tenantId: 'iskool',
  schoolName: 'iSkool Ecosistema Educativo',
  shortName: 'iSkool',
  tagline: 'Plataforma de Alta Tecnología Pedagógica, Inteligencia Artificial y Gamificación',
  badgeText: 'iSkool Studio IA',
  logoUrl: '/brand/iskool_logo.webp',
  faviconUrl: '/favicon.ico',
  primaryColorHex: '#2563EB', // Azul Zafiro Tecnológico
  secondaryColorHex: '#7C3AED', // Púrpura Vibrante
  accentColorHex: '#06B6D4', // Cian Eléctrico
  heroGradient: 'from-blue-600 via-indigo-600 to-purple-700',
  cardRadius: 'rounded-3xl',
  themePreset: 'sapphire',
  cssVariables: {
    '--color-primary': '#2563EB',
    '--color-primary-rgb': '37, 99, 235',
    '--color-primary-hsl': '221 83% 53%',
    '--color-secondary': '#7C3AED',
    '--color-secondary-rgb': '124, 58, 237',
    '--color-secondary-hsl': '262 83% 58%',
    '--color-accent': '#06B6D4',
    '--color-accent-rgb': '6, 182, 212',
    '--color-accent-hsl': '189 94% 43%',
    '--brand-primary': '#2563EB',
    '--brand-primary-hover': '#1d4ed8',
    '--brand-primary-light': '#eff6ff',
    '--brand-hero-gradient': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
    '--brand-badge-bg': '#ede9fe',
    '--brand-badge-text': '#6d28d9'
  }
};

export const IBIME_THEME_TOKENS: TenantThemeTokens = {
  tenantId: 'ibime',
  schoolName: 'Instituto Bilingüe Ibime',
  shortName: 'IBIME',
  tagline: 'Excelencia Bilingüe y Formación Humana desde 2004 · https://ibime.edu.mx',
  badgeText: 'Instituto Bilingüe Ibime',
  logoUrl: '/brand/ibime_logo.webp',
  faviconUrl: '/brand/ibime_favicon.png',
  primaryColorHex: '#E41B14', // Rojo Escarlata Oficial IBIME
  secondaryColorHex: '#0F2744', // Azul Marino Profundo Institucional
  accentColorHex: '#C01D0C', // Carmesí Sombra Facetada
  heroGradient: 'from-[#0F2744] via-[#17426D] to-[#E41B14]',
  cardRadius: 'rounded-2xl',
  themePreset: 'ibime-official',
  cssVariables: {
    '--color-primary': '#E41B14',
    '--color-primary-rgb': '228, 27, 20',
    '--color-primary-hsl': '2 84% 49%',
    '--color-secondary': '#0F2744',
    '--color-secondary-rgb': '15, 39, 68',
    '--color-secondary-hsl': '213 64% 16%',
    '--color-accent': '#17426D',
    '--color-accent-rgb': '23, 66, 109',
    '--color-accent-hsl': '210 65% 26%',
    '--brand-primary': '#E41B14',
    '--brand-primary-hover': '#c01d0c',
    '--brand-primary-light': '#fef2f2',
    '--brand-hero-gradient': 'linear-gradient(135deg, #0f2744 0%, #17426d 50%, #e41b14 100%)',
    '--brand-badge-bg': '#fef2f2',
    '--brand-badge-text': '#e41b14'
  }
};

export function getTokensForTenant(tenantId: TenantId): TenantThemeTokens {
  return tenantId === 'ibime' ? IBIME_THEME_TOKENS : ISKOOL_THEME_TOKENS;
}

/**
 * Genera el bloque CSS estático para inyección SSR en el <head>,
 * asegurando 0ms de FOUC (Flash of Unstyled Content).
 */
export function generateServerTenantCss(defaultTenant: TenantId = 'iskool'): string {
  const currentTokens = getTokensForTenant(defaultTenant);
  const otherTenant = defaultTenant === 'ibime' ? 'iskool' : 'ibime';
  const otherTokens = getTokensForTenant(otherTenant);

  function formatVars(vars: Record<string, string>): string {
    return Object.entries(vars)
      .map(([key, val]) => `  ${key}: ${val};`)
      .join('\n');
  }

  return `
/* =======================================================
   SISTEMA DE TEMAS MULTI-TENANT ISKOOL & IBIME (SSR ZERO-FOUC)
   ======================================================= */
:root {
${formatVars(currentTokens.cssVariables)}
}

[data-tenant="${defaultTenant}"] {
${formatVars(currentTokens.cssVariables)}
}

[data-tenant="${otherTenant}"] {
${formatVars(otherTokens.cssVariables)}
}
`;
}
