"use client";

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNavigationStore, isAuthOrSystemPath } from '@/store/useNavigationStore';

/**
 * Rastreador y Guardián Global del Historial de Navegación de ISkool.
 * 
 * Funciones Principales:
 * 1. Monitorea cada transición de ruta interna en ISkool para saber con exactitud de dónde viene el usuario.
 * 2. Bloquea de forma perimetral que el botón de retroceso (Back) del navegador exponga la pantalla de login/autenticación.
 * 3. Si el usuario presiona el botón 'Atrás' del navegador y la pila intentaba llevarlo a '/login' o '/',
 *    lo redirige automáticamente a su última página interna visitada o al hub de su rol.
 */
function NavigationTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const recordPath = useNavigationStore(state => state.recordPath);
  const getSafeBackUrl = useNavigationStore(state => state.getSafeBackUrl);

  // Construir la URL actual con query params
  const currentFullUrl = searchParams && searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const lastRecordedUrlRef = useRef<string>('');

  // 1. Registro proactivo de la ruta actual en el store de navegación
  useEffect(() => {
    if (!pathname) return;

    if (currentFullUrl !== lastRecordedUrlRef.current) {
      lastRecordedUrlRef.current = currentFullUrl;
      recordPath(currentFullUrl);
    }
  }, [currentFullUrl, pathname, recordPath]);

  // 2. Interceptación y Blindaje de Retroceso Nativo del Navegador (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      const destinationPath = window.location.pathname;

      // Si el usuario está autenticado y el retroceso del navegador apunta a login o raíz
      if (!loading && user && isAuthOrSystemPath(destinationPath)) {
        // Detener la exposición del formulario de autenticación
        event.preventDefault?.();

        const safeDestination = getSafeBackUrl(destinationPath, user.role);

        // Corregir el historial del navegador inmediatamente
        window.history.pushState({ iskoolBypassAuth: true }, '', safeDestination);
        router.replace(safeDestination);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, loading, router, getSafeBackUrl]);

  return null;
}

export function NavigationTracker() {
  return (
    <Suspense fallback={null}>
      <NavigationTrackerInner />
    </Suspense>
  );
}
