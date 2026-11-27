"use client";
import React, { useEffect } from 'react';
import { useWhiteLabelStore, applyWhiteLabelCssVariables } from '@/store/useWhiteLabelStore';

const cleanHslColor = (colorStr: string): string => {
  if (!colorStr) return '';
  return colorStr.replace(/hsl\(|\)/gi, '').trim();
};

export const ThemeSync: React.FC = () => {
  const schoolThemeHsl = useWhiteLabelStore((state) => state.schoolThemeHsl);
  const primaryColor = useWhiteLabelStore((state) => state.primaryColor);
  const isCustomized = useWhiteLabelStore((state) => state.isCustomized);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Sincronización base del Colegio (espejada en useWhiteLabelStore sin acoplar useSchoolAdminStore)
    if (schoolThemeHsl) {
      const primary = cleanHslColor(schoolThemeHsl.primary);
      const secondary = cleanHslColor(schoolThemeHsl.secondary);
      const accent = cleanHslColor(schoolThemeHsl.accent);

      if (secondary) {
        root.style.setProperty('--color-secondary-hsl', secondary);
        root.style.setProperty('--color-secondary', `hsl(${secondary})`);
      }
      if (accent) {
        root.style.setProperty('--color-accent-hsl', accent);
        root.style.setProperty('--color-accent', `hsl(${accent})`);
      }

      if (!isCustomized && primary) {
        root.style.setProperty('--color-primary-hsl', primary);
        root.style.setProperty('--color-primary', `hsl(${primary})`);
        root.style.setProperty('--color-brand-primary', `hsl(${primary})`);
        root.style.setProperty('--brand-primary', `hsl(${primary})`);
      }
    }

    // 2. Inyección Dinámica y Reactiva de Marca Blanca (Zustand)
    if (primaryColor) {
      applyWhiteLabelCssVariables(primaryColor);
    }
  }, [schoolThemeHsl, primaryColor, isCustomized]);

  // 3. Sincronización Universal de Viewport para PC, Laptop, Tablet y Celular
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const root = document.documentElement;

    const syncViewportMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      root.style.setProperty('--dev-viewport-w', `${w}px`);
      root.style.setProperty('--dev-viewport-h', `${h}px`);
      root.style.setProperty('--dev-content-h', `${Math.max(480, h - (h < 760 ? 110 : 150))}px`);

      const calculatedChartH = h < 760 ? 190 : h < 860 ? 230 : w >= 2100 ? 310 : 270;
      root.style.setProperty('--dev-chart-h', `${calculatedChartH}px`);
      root.style.setProperty('--dev-table-max-h', `${Math.max(260, h - (h < 760 ? 260 : 330))}px`);

      let category = 'desktop-standard';
      if (w < 768) {
        category = 'mobile';
      } else if (w < 1024) {
        category = 'tablet';
      } else if (w >= 2100) {
        category = 'desktop-ultrawide';
      } else if (w >= 1600 && h >= 850) {
        category = 'desktop-standard';
      } else if (w < 1366 || h < 760) {
        category = 'laptop-compact';
      } else {
        category = 'laptop-regular';
      }

      root.setAttribute('data-device-category', category);
      root.setAttribute('data-device-width', String(w));
      root.setAttribute('data-device-height', String(h));
    };

    syncViewportMetrics();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncViewportMetrics, 60);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return null;
};
