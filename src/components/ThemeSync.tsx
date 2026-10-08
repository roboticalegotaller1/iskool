"use client";
import React, { useEffect } from 'react';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useWhiteLabelStore, applyWhiteLabelCssVariables } from '@/store/useWhiteLabelStore';

const cleanHslColor = (colorStr: string): string => {
  if (!colorStr) return '';
  return colorStr.replace(/hsl\(|\)/gi, '').trim();
};

export const ThemeSync: React.FC = () => {
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);
  const primaryColor = useWhiteLabelStore(state => state.primaryColor);
  const isCustomized = useWhiteLabelStore(state => state.isCustomized);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Sincronización base del Colegio
    if (schoolSettings?.themeColors) {
      const primary = cleanHslColor(schoolSettings.themeColors.primary);
      const secondary = cleanHslColor(schoolSettings.themeColors.secondary);
      const accent = cleanHslColor(schoolSettings.themeColors.accent);

      root.style.setProperty('--color-secondary-hsl', secondary);
      root.style.setProperty('--color-accent-hsl', accent);
      root.style.setProperty('--color-secondary', `hsl(${secondary})`);
      root.style.setProperty('--color-accent', `hsl(${accent})`);

      if (!isCustomized) {
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

    // 3. Sincronización Universal de Viewport para PC, Laptop, Tablet y Celular
    const syncViewportMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pr = window.devicePixelRatio || 1;

      root.style.setProperty('--dev-viewport-w', `${w}px`);
      root.style.setProperty('--dev-viewport-h', `${h}px`);
      root.style.setProperty('--dev-content-h', `${Math.max(480, h - (h < 760 ? 110 : 150))}px`);

      const calculatedChartH = h < 760 ? 190 : (h < 860 ? 230 : (w >= 2100 ? 310 : 270));
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

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncViewportMetrics, 60);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [schoolSettings, primaryColor, isCustomized]);

  return null;
};
