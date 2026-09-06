"use client";
import React, { useEffect } from 'react';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

const cleanHslColor = (colorStr: string): string => {
  if (!colorStr) return '';
  return colorStr.replace(/hsl\(|\)/gi, '').trim();
};

export const ThemeSync: React.FC = () => {
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const primary = cleanHslColor(schoolSettings.themeColors.primary);
      const secondary = cleanHslColor(schoolSettings.themeColors.secondary);
      const accent = cleanHslColor(schoolSettings.themeColors.accent);

      // Inyectar tanto en formato HSL directo
      root.style.setProperty('--color-primary-hsl', primary);
      root.style.setProperty('--color-secondary-hsl', secondary);
      root.style.setProperty('--color-accent-hsl', accent);

      // Inyectar como colores Tailwind utilizables
      root.style.setProperty('--color-primary', `hsl(${primary})`);
      root.style.setProperty('--color-secondary', `hsl(${secondary})`);
      root.style.setProperty('--color-accent', `hsl(${accent})`);
    }
  }, [schoolSettings]);

  return null;
};
