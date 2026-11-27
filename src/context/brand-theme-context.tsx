'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface SchoolBrandTheme {
  school_id: string;
  school_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_primary_color: string;
}

const defaultTheme: SchoolBrandTheme = {
  school_id: '938fa492-4ddc-4f6f-80d7-1bd054af8536',
  school_name: 'Colegio Horizonte',
  primary_color: '#0f172a',
  secondary_color: '#0284c7',
  accent_color: '#10b981',
  background_color: '#f8fafc',
  surface_color: '#ffffff',
  text_primary_color: '#0f172a',
};

const applyCSSVariables = (currentTheme: SchoolBrandTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', currentTheme.primary_color);
  root.style.setProperty('--brand-secondary', currentTheme.secondary_color);
  root.style.setProperty('--brand-accent', currentTheme.accent_color);
  root.style.setProperty('--brand-bg', currentTheme.background_color);
  root.style.setProperty('--brand-surface', currentTheme.surface_color);
  root.style.setProperty('--brand-text', currentTheme.text_primary_color);
};

const BrandThemeContext = createContext<{
  theme: SchoolBrandTheme;
  updateTheme: (newTheme: Partial<SchoolBrandTheme>) => Promise<void>;
  isLoading: boolean;
}>({
  theme: defaultTheme,
  updateTheme: async () => {},
  isLoading: true,
});

export const BrandThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SchoolBrandTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const themeRef = useRef<SchoolBrandTheme>(defaultTheme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    let active = true;
    const fetchTheme = async () => {
      try {
        const { data } = await supabase
          .from('school_brand_settings')
          .select('*')
          .limit(1)
          .single();

        if (active && data) {
          themeRef.current = data;
          setTheme(data);
          applyCSSVariables(data);
        }
      } catch {
        if (active) {
          console.warn('Usando tema institucional predeterminado.');
          applyCSSVariables(defaultTheme);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchTheme();
    return () => {
      active = false;
    };
  }, []);

  const updateTheme = useCallback(async (newTheme: Partial<SchoolBrandTheme>) => {
    const updated = { ...themeRef.current, ...newTheme };
    themeRef.current = updated;
    setTheme(updated);
    applyCSSVariables(updated);

    await supabase.from('school_brand_settings').upsert(
      {
        ...updated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'school_id' }
    );
  }, []);

  const contextValue = useMemo(
    () => ({ theme, updateTheme, isLoading }),
    [theme, updateTheme, isLoading]
  );

  return (
    <BrandThemeContext.Provider value={contextValue}>
      {children}
    </BrandThemeContext.Provider>
  );
};

export const useBrandTheme = () => useContext(BrandThemeContext);
