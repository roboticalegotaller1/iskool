"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TenantId } from '@/lib/auth/multiTenantSession';
import {
  TenantThemeTokens,
  getTokensForTenant,
  ISKOOL_THEME_TOKENS,
  IBIME_THEME_TOKENS
} from '@/lib/branding/tenantThemeTokens';
import { useWhiteLabelStore, applyWhiteLabelCssVariables } from '@/store/useWhiteLabelStore';

export interface TenantBrandingContextType {
  tenantId: TenantId;
  tokens: TenantThemeTokens;
  isIbime: boolean;
  isIskool: boolean;
  switchTenant: (tenant: TenantId) => void;
  applyTheme: () => void;
}

const TenantBrandingContext = createContext<TenantBrandingContextType | null>(null);

export interface TenantBrandingProviderProps {
  children: React.ReactNode;
  initialTenant?: TenantId;
}

export const TenantBrandingProvider: React.FC<TenantBrandingProviderProps> = ({
  children,
  initialTenant = 'iskool'
}) => {
  const [tenantId, setTenantId] = useState<TenantId>(initialTenant);
  const setWhiteLabelConfig = useWhiteLabelStore(state => state.setWhiteLabelConfig);

  // Detección en cliente durante montaje: si la cookie o el subdominio es de IBIME
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname.toLowerCase();
    const hasIbimeSubdomain = hostname.startsWith('ibime.') || hostname.includes('ibime');
    const hasIbimeCookie = document.cookie.includes('ibime_session=');
    const isIbimePath = window.location.pathname.startsWith('/ibime');

    if (hasIbimeSubdomain || hasIbimeCookie || isIbimePath) {
      setTenantId('ibime');
    }
  }, []);

  const tokens = useMemo(() => getTokensForTenant(tenantId), [tenantId]);

  // Aplicación reactiva de estilos y metadatos en documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-tenant', tenantId);

    // 1. Inyección de variables CSS calculadas
    applyWhiteLabelCssVariables(tokens.primaryColorHex);

    // Inyección de variables específicas de marca
    Object.entries(tokens.cssVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // 2. Sincronización con el store global de marca blanca existente
    setWhiteLabelConfig({
      schoolName: tokens.schoolName,
      logoUrl: tokens.logoUrl,
      primaryColor: tokens.primaryColorHex
    });

    // 3. Actualización dinámica del Favicon
    let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = tokens.faviconUrl;

  }, [tenantId, tokens, setWhiteLabelConfig]);

  const contextValue = useMemo<TenantBrandingContextType>(() => ({
    tenantId,
    tokens,
    isIbime: tenantId === 'ibime',
    isIskool: tenantId === 'iskool',
    switchTenant: (newTenant: TenantId) => setTenantId(newTenant),
    applyTheme: () => applyWhiteLabelCssVariables(tokens.primaryColorHex)
  }), [tenantId, tokens]);

  return (
    <TenantBrandingContext.Provider value={contextValue}>
      {children}
    </TenantBrandingContext.Provider>
  );
};

export function useTenantBranding(): TenantBrandingContextType {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    // Fallback seguro si se usa fuera del provider
    return {
      tenantId: 'iskool',
      tokens: ISKOOL_THEME_TOKENS,
      isIbime: false,
      isIskool: true,
      switchTenant: () => {},
      applyTheme: () => {}
    };
  }
  return context;
}
