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

  // Blindaje Anti-FOUC y Aislamiento en Transición de Rutas:
  // Detectar si el tenant activo en memoria difiere del atributo data-tenant en document.documentElement.
  // Si se detecta un cambio cruzado durante la navegación cliente, fuerza una recarga total limpia.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const checkDomTenantDiscrepancy = () => {
      const domTenant = document.documentElement.getAttribute('data-tenant') as TenantId | null;
      if (domTenant && domTenant !== tenantId) {
        const targetPortal = tenantId === 'ibime' ? '/ibime/portal' : '/teacher';
        if (typeof window.location?.replace === 'function') {
          window.location.replace(targetPortal);
        }
      }
    };

    const observer = new MutationObserver(() => {
      checkDomTenantDiscrepancy();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-tenant']
    });

    window.addEventListener('popstate', checkDomTenantDiscrepancy);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', checkDomTenantDiscrepancy);
    };
  }, [tenantId]);

  const switchTenant = useCallback((newTenant: TenantId) => {
    if (newTenant === tenantId) return;
    setTenantId(newTenant);
    if (typeof window !== 'undefined' && typeof window.location?.replace === 'function') {
      const targetPortal = newTenant === 'ibime' ? '/ibime/portal' : '/teacher';
      window.location.replace(targetPortal);
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
