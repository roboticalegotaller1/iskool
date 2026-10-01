"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';

export type DeviceScreenCategory = 
  | 'desktop-ultrawide'  // >= 2100px ancho (ej. 2133x1012, 2560x1440, 3440x1440)
  | 'desktop-standard'   // 1600px - 2099px y alto >= 850px (ej. 1920x1080)
  | 'laptop-regular'     // 1366px - 1599px o alto entre 760px y 849px (ej. 1536x864, 1440x900)
  | 'laptop-compact'     // ancho < 1366px o alto < 760px en desktop (ej. 1366x768, scaling 150%)
  | 'mobile-tablet';     // ancho < 1024px

export interface DeviceViewportState {
  /** Ancho real exacto de la ventana en píxeles */
  width: number;
  /** Alto real exacto de la ventana en píxeles */
  height: number;
  /** Ratio de píxeles del dispositivo (densidad Retina/4K/Windows Scaling) */
  pixelRatio: number;
  /** Categoría precisa del dispositivo detectada */
  category: DeviceScreenCategory;
  /** Es laptop (portátil estándar o compacto) */
  isLaptop: boolean;
  /** Es laptop compacta (<1366px ancho o <760px alto) */
  isCompactLaptop: boolean;
  /** Es computadora de escritorio (monitor PC estándar o ultrawide) */
  isDesktop: boolean;
  /** Altura vertical reducida (< 760px, típico de laptops de 13"-14" o pantallas con zoom del SO) */
  isCompactHeight: boolean;
  /** Pantalla de altura media (< 850px) */
  isShortScreen: boolean;
  /** Es monitor ultrawide o alta resolución horizontal (>= 2100px) */
  isUltrawide: boolean;
  /** Altura dinámica disponible en píxeles para el contenedor principal de informes */
  availableContentHeight: number;
  /** Altura dinámica óptima en píxeles para gráficas SVG y radares analíticos */
  chartHeight: number;
  /** Altura máxima sugerida para tablas de datos con sticky header */
  tableMaxHeight: number;
  /** Clases de Tailwind precalculadas según el tamaño exacto del monitor */
  classes: {
    kpiCardPadding: string;
    kpiValueText: string;
    kpiSubtext: string;
    gridGap: string;
    containerPadding: string;
    tableCellPadding: string;
    sectionSpacing: string;
  };
}

/**
 * Hook de Inteligencia de Dispositivo y Viewport Responsivo.
 * Lee en tiempo real las dimensiones exactas de la pantalla en PC y Laptop,
 * evitando alturas fijas rígidas y adaptando los informes BI al milímetro.
 */
export function useDeviceViewport(): DeviceViewportState {
  // Inicialización segura para SSR / Next.js
  const [dimensions, setDimensions] = useState<{ width: number; height: number; pixelRatio: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  });

  const handleResize = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pr = window.devicePixelRatio || 1;

    setDimensions({ width: w, height: h, pixelRatio: pr });

    // Actualizar variables CSS en el elemento raíz para sincronía visual en CSS puro
    const root = document.documentElement;
    root.style.setProperty('--dev-viewport-w', `${w}px`);
    root.style.setProperty('--dev-viewport-h', `${h}px`);
    root.style.setProperty('--dev-content-h', `${Math.max(480, h - (h < 760 ? 110 : 150))}px`);
    
    const calculatedChartH = h < 760 ? 190 : (h < 860 ? 230 : (w >= 2100 ? 310 : 270));
    root.style.setProperty('--dev-chart-h', `${calculatedChartH}px`);
    root.style.setProperty('--dev-table-max-h', `${Math.max(260, h - (h < 760 ? 260 : 330))}px`);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    handleResize();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 60);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  return useMemo(() => {
    const { width: w, height: h, pixelRatio: pr } = dimensions;

    // Clasificación milimétrica del tipo de pantalla
    let category: DeviceScreenCategory;
    if (w < 1024) {
      category = 'mobile-tablet';
    } else if (w >= 2100) {
      category = 'desktop-ultrawide';
    } else if (w >= 1600 && h >= 850) {
      category = 'desktop-standard';
    } else if (w < 1366 || h < 760) {
      category = 'laptop-compact';
    } else {
      category = 'laptop-regular';
    }

    const isLaptop = category === 'laptop-compact' || category === 'laptop-regular';
    const isCompactLaptop = category === 'laptop-compact';
    const isDesktop = category === 'desktop-standard' || category === 'desktop-ultrawide';
    const isCompactHeight = h < 760;
    const isShortScreen = h < 850;
    const isUltrawide = category === 'desktop-ultrawide';

    // Altura disponible neta para módulos analíticos (restando cabeceras y márgenes dinámicos)
    const headerAllowance = isCompactHeight ? 100 : (isLaptop ? 120 : 140);
    const availableContentHeight = Math.max(480, h - headerAllowance);

    // Altura ideal para la gráfica interactiva (Cashflow, Forecasting, Radars)
    const chartHeight = isCompactHeight 
      ? 190 
      : isLaptop 
      ? 230 
      : isUltrawide 
      ? 310 
      : 270;

    // Altura máxima para tablas de datos auditadas con sticky headers
    const tableHeaderOffset = isCompactHeight ? 250 : 310;
    const tableMaxHeight = Math.max(260, h - tableHeaderOffset);

    // Sistema de tokens de diseño adaptativo para Tailwind
    const classes = {
      kpiCardPadding: isCompactHeight ? 'p-3' : (isLaptop ? 'p-3.5' : 'p-4.5 sm:p-5'),
      kpiValueText: isCompactHeight 
        ? 'text-lg sm:text-xl' 
        : (isLaptop ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl xl:text-4xl'),
      kpiSubtext: isCompactHeight ? 'text-[9.5px]' : (isLaptop ? 'text-[10px]' : 'text-[11px]'),
      gridGap: isCompactHeight ? 'gap-2.5 sm:gap-3' : (isLaptop ? 'gap-3.5 sm:gap-4' : 'gap-5 sm:gap-6'),
      containerPadding: isCompactHeight ? 'p-2.5 sm:p-3' : (isLaptop ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6 lg:p-8'),
      tableCellPadding: isCompactHeight ? 'py-1.5 px-2.5' : (isLaptop ? 'py-2 px-3' : 'py-3 px-4'),
      sectionSpacing: isCompactHeight ? 'space-y-3' : (isLaptop ? 'space-y-4' : 'space-y-6')
    };

    return {
      width: w,
      height: h,
      pixelRatio: pr,
      category,
      isLaptop,
      isCompactLaptop,
      isDesktop,
      isCompactHeight,
      isShortScreen,
      isUltrawide,
      availableContentHeight,
      chartHeight,
      tableMaxHeight,
      classes
    };
  }, [dimensions]);
}
