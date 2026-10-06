'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from('school_brand_settings')
          .select('*')
          .limit(1)
          .single();

        if (data) {
          setTheme(data);
          applyCSSVariables(data);
        }
      } catch (err) {
        console.warn('Usando tema institucional predeterminado.');
        applyCSSVariables(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  const applyCSSVariables = (currentTheme: SchoolBrandTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', currentTheme.primary_color);
    root.style.setProperty('--brand-secondary', currentTheme.secondary_color);
    root.style.setProperty('--brand-accent', currentTheme.accent_color);
    root.style.setProperty('--brand-bg', currentTheme.background_color);
    root.style.setProperty('--brand-surface', currentTheme.surface_color);
    root.style.setProperty('--brand-text', currentTheme.text_primary_color);
  };

  const updateTheme = async (newTheme: Partial<SchoolBrandTheme>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    applyCSSVariables(updated);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('school_brand_settings').upsert({
      ...updated,
      updated_at: new Date().toISOString()
    }, { onConflict: 'school_id' });
  };

  return (
    <BrandThemeContext.Provider value={{ theme, updateTheme, isLoading }}>
      {children}
    </BrandThemeContext.Provider>
  );
};

export const useBrandTheme = () => useContext(BrandThemeContext);
