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
  }, [schoolSettings, primaryColor, isCustomized]);

  return null;
};
