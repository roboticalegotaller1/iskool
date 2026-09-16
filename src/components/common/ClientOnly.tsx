"use client";

import React, { ReactNode } from 'react';
import { useHasHydrated } from '@/hooks/useHasHydrated';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  storeInstance?: any;
}

/**
 * Componente envoltorio para blindar secciones de UI dependientes de localStorage
 * y Zustand persist contra errores de hidratación (Text content does not match server-rendered HTML).
 * 
 * Renderiza el contenido únicamente cuando el DOM del navegador está listo e hidratado.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
  storeInstance
}) => {
  const hasHydrated = useHasHydrated(storeInstance);

  if (!hasHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
