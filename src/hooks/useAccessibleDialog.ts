'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook accesible WCAG 2.2 para diálogos modales:
 * - Cierra con Escape cuando está abierto
 * - Restaura el foco al elemento disparador al cerrarse
 */
export function useAccessibleDialog(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const previousFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocused && typeof previousFocused.focus === 'function') {
        try {
          previousFocused.focus();
        } catch {
          // Element may no longer be mounted
        }
      }
    };
  }, [isOpen]);
}
