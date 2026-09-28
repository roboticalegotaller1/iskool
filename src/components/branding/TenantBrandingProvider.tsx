"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { TenantId } from '@/lib/auth/multiTenantSession';
import {
  TenantThemeTokens,
  getTokensForTenant,
  ISKOOL_THEME_TOKENS
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

/**
 * Proveedor de Marca Blanca Institucional.
 * Resuelve el branding exclusivamente a partir del estado de SSR provisto por el servidor ('initialTenant').
 * Cero lectura de 'document.cookie' en el cliente para garantizar coherencia y evitar hidratación inconsistente o FOUC.
 */
export const TenantBrandingProvider: React.FC<TenantBrandingProviderProps> = ({
  children,
  initialTenant = 'iskool'
}) => {
  const [tenantId, setTenantId] = useState<TenantId>(initialTenant);
  const setWhiteLabelConfig = useWhiteLabelStore(state => state.setWhiteLabelConfig);

  // Sincronizar si cambia initialTenant desde SSR
  useEffect(() => {
    if (initialTenant && initialTenant !== tenantId) {
      setTenantId(initialTenant);
    }
  }, [initialTenant]);

  const tokens = useMemo(() => getTokensForTenant(tenantId), [tenantId]);

  // Aplicación reactiva en el DOM sin tocar document.cookie
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-tenant', tenantId);

    // 1. Inyección de variables CSS
    applyWhiteLabelCssVariables(tokens.primaryColorHex);

    Object.entries(tokens.cssVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // 2. Sincronización con el store global de marca blanca
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

  const switchTenant = useCallback((targetTenant: TenantId) => {
    if (targetTenant === tenantId) return;
    setTenantId(targetTenant);
    if (typeof window !== 'undefined') {
      window.location.assign('/' + targetTenant);
    }
  }, [tenantId]);

  const contextValue = useMemo<TenantBrandingContextType>(() => ({
    tenantId,
    tokens,
    isIbime: tenantId === 'ibime',
    isIskool: tenantId === 'iskool',
    switchTenant,
    applyTheme: () => applyWhiteLabelCssVariables(tokens.primaryColorHex)
  }), [tenantId, tokens, switchTenant]);

  return (
    <TenantBrandingContext.Provider value={contextValue}>
      {children}
    </TenantBrandingContext.Provider>
  );
};

export function useTenantBranding(): TenantBrandingContextType {
  const context = useContext(TenantBrandingContext);
  if (!context) {
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
