"use client";

import { useState, useEffect } from 'react';

/**
 * Hook para evitar errores de hidratación (SSR Hydration Mismatch) en Next.js.
 * Garantiza que cualquier estado dependiente de localStorage, cookies o navegador
 * solo se renderice una vez que el componente se ha montado de forma segura en el cliente.
 * 
 * @param storeInstance (Opcional) Instancia de store de Zustand con middleware persist.
 * Si se proporciona, también verifica que la store haya completado su rehidratación asíncrona.
 * 
 * @returns boolean `true` cuando el cliente está completamente hidratado y listo para renderizar.
 */
export function useHasHydrated(storeInstance?: { persist?: { hasHydrated: () => boolean; onHydrate?: (fn: () => void) => () => void; onFinishHydration?: (fn: () => void) => () => void } }): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Si no se pasó una store con persistencia, marcar montado inmediatamente
    if (!storeInstance?.persist) {
      setHasHydrated(true);
      return;
    }

    // Si la store ya fue hidratada en memoria
    if (storeInstance.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    // Escuchar el evento de finalización de hidratación de Zustand
    const unsubFinish = storeInstance.persist.onFinishHydration?.(() => {
      setHasHydrated(true);
    });

    // Fallback de seguridad en caso de que la store ya haya hidratado antes del listener
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 50);

    return () => {
      if (unsubFinish) unsubFinish();
      clearTimeout(timer);
    };
  }, [storeInstance]);

  return hasHydrated;
}
