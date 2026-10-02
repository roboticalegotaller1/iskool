import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getTokensForTenant,
  generateServerTenantCss,
  ISKOOL_THEME_TOKENS,
  IBIME_THEME_TOKENS
} from '@/lib/branding/tenantThemeTokens';
import {
  TenantBrandingProvider,
  useTenantBranding
} from '@/components/branding/TenantBrandingProvider';
import { TenantTeacherHubCards } from '@/components/branding/TenantTeacherHubCards';

describe('🎨 MOTOR DE WHITE-LABEL Y DISEÑO ATÓMICO: iSkool e IBIME', () => {

  describe('1. Sistema de Tokens Dinámicos de Marca Blanca', () => {
    it('debe entregar los tokens correctos para iSkool (Azul Zafiro / Tecnológico)', () => {
      const tokens = getTokensForTenant('iskool');

      expect(tokens.tenantId).toBe('iskool');
      expect(tokens.primaryColorHex).toBe('#2563EB');
      expect(tokens.schoolName).toBe('iSkool Ecosistema Educativo');
      expect(tokens.cssVariables['--color-primary']).toBe('#2563EB');
      expect(tokens.cssVariables['--brand-hero-gradient']).toContain('#2563eb');
    });

    it('debe entregar los tokens correctos para IBIME (Verde Esmeralda / Bicultural)', () => {
      const tokens = getTokensForTenant('ibime');

      expect(tokens.tenantId).toBe('ibime');
      expect(tokens.primaryColorHex).toBe('#E41B14');
      expect(tokens.schoolName).toBe('Instituto Bilingüe Ibime');
      expect(tokens.badgeText).toBe('Instituto Bilingüe Ibime');
      expect(tokens.cssVariables['--color-primary']).toBe('#E41B14');
      expect(tokens.cssVariables['--brand-badge-bg']).toBe('#fef2f2');
      expect(tokens.cssVariables['--brand-badge-text']).toBe('#e41b14');
    });

    it('debe generar CSS SSR anti-FOUC con selectores [data-tenant] diferenciados', () => {
      const css = generateServerTenantCss('iskool');

      expect(css).toContain(':root');
      expect(css).toContain('[data-tenant="iskool"]');
      expect(css).toContain('[data-tenant="ibime"]');
      expect(css).toContain('--color-primary: #2563EB');
      expect(css).toContain('--color-primary: #E41B14');
    });
  });

  describe('2. Componente TenantBrandingProvider (Contexto React)', () => {
    let assignMock: ReturnType<typeof vi.fn>;
    const originalLocation = window.location;

    beforeEach(() => {
      assignMock = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: {
          ...originalLocation,
          assign: assignMock,
          replace: vi.fn(),
          reload: vi.fn()
        }
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation
      });
    });

    const TestConsumer = () => {
      const { tenantId, tokens, isIbime, switchTenant } = useTenantBranding();
      return (
        <div>
          <span data-testid="tenant-name">{tokens.schoolName}</span>
          <span data-testid="tenant-id">{tenantId}</span>
          <span data-testid="is-ibime">{isIbime ? 'true' : 'false'}</span>
          <button data-testid="switch-btn" onClick={() => switchTenant('ibime')}>
            Cambiar a IBIME
          </button>
        </div>
      );
    };

    it('debe inicializarse con el tenant especificado y permitir conmutación reactiva', () => {
      render(
        <TenantBrandingProvider initialTenant="iskool">
          <TestConsumer />
        </TenantBrandingProvider>
      );

      expect(screen.getByTestId('tenant-id').textContent).toBe('iskool');
      expect(screen.getByTestId('tenant-name').textContent).toBe('iSkool Ecosistema Educativo');
      expect(screen.getByTestId('is-ibime').textContent).toBe('false');

      // Conmutar a IBIME
      fireEvent.click(screen.getByTestId('switch-btn'));

      expect(assignMock).toHaveBeenCalledWith('/ibime');
      expect(screen.getByTestId('tenant-id').textContent).toBe('ibime');
      expect(screen.getByTestId('tenant-name').textContent).toBe('Instituto Bilingüe Ibime');
      expect(screen.getByTestId('is-ibime').textContent).toBe('true');
    });
  });

  describe('3. Componente TenantTeacherHubCards (Apple Rule 3-Clics y Cero Duplicación)', () => {
    const onClasses = vi.fn();
    const onStudio = vi.fn();
    const onCommunity = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('debe renderizar el Hub con la estética de iSkool sin duplicar vistas', () => {
      render(
        <TenantBrandingProvider initialTenant="iskool">
          <TenantTeacherHubCards
            onNavigateToClasses={onClasses}
            onNavigateToStudio={onStudio}
            onNavigateToCommunity={onCommunity}
            teacherName="Prof. Israel López"
          />
        </TenantBrandingProvider>
      );

      expect(screen.getByText('Prof. Israel López')).toBeDefined();
      expect(screen.getByText('iSkool Studio IA')).toBeDefined();
      expect(screen.getByText('Crear Actividad')).toBeDefined();

      // Validación de 1 clic en acción Hero
      fireEvent.click(screen.getByText('Crear Actividad'));
      expect(onStudio).toHaveBeenCalledTimes(1);

      // Validación de 1 clic en Mis Clases
      fireEvent.click(screen.getByText('Mis Clases'));
      expect(onClasses).toHaveBeenCalledTimes(1);
    });

    it('debe renderizar el Hub con la identidad gráfica de IBIME manteniendo la misma funcionalidad', () => {
      render(
        <TenantBrandingProvider initialTenant="ibime">
          <TenantTeacherHubCards
            onNavigateToClasses={onClasses}
            onNavigateToStudio={onStudio}
            onNavigateToCommunity={onCommunity}
            teacherName="Prof. Laura Gómez"
          />
        </TenantBrandingProvider>
      );

      expect(screen.getByText('Prof. Laura Gómez')).toBeDefined();
      expect(screen.getByText('Centro de Gestión Docente y Coordinación Bicultural IBIME')).toBeDefined();
      expect(screen.getByText('Estudio Bicultural')).toBeDefined();

      // La acción Hero ahora abre el estudio con terminología e identidad de IBIME
      fireEvent.click(screen.getByText('Estudio Bicultural'));
      expect(onStudio).toHaveBeenCalledTimes(1);
    });
  });
});
