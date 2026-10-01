import { create } from 'zustand';

/**
 * Rutas de autenticación y del sistema que NUNCA deben registrarse
 * como páginas anteriores seguras en el historial de navegación de ISkool.
 */
const AUTH_AND_SYSTEM_PATHS = [
  '/',
  '/login',
  '/ibime/login',
  '/auth',
  '/Lcxad5iH8kGm3ZC',
  '/02DJoUJSkwYQZjn',
  '/404',
  '/not-found'
];

export const isAuthOrSystemPath = (path: string): boolean => {
  if (!path) return true;
  const cleanPath = path.split('?')[0].split('#')[0];
  if (AUTH_AND_SYSTEM_PATHS.includes(cleanPath)) return true;
  if (cleanPath.startsWith('/login/') || cleanPath.startsWith('/ibime/login/')) return true;
  if (cleanPath.startsWith('/api/') || cleanPath.startsWith('/_next/')) return true;
  return false;
};

/**
 * Calcula la ruta padre contextual basada en la URL actual y el rol del usuario,
 * asegurando que NUNCA se regrese a la pantalla de login cuando hay sesión activa.
 */
export const getContextualParentUrl = (currentPath: string, userRole?: string): string => {
  const clean = currentPath.split('?')[0].split('#')[0];

  // Si estamos dentro de sub-rutas de profesor
  if (clean.startsWith('/teacher/')) {
    return '/teacher';
  }

  // Si estamos dentro de sub-rutas de estudiante
  if (clean.startsWith('/student/')) {
    return '/student';
  }

  // Si estamos dentro de sub-rutas de coordinador
  if (clean.startsWith('/coordinator/')) {
    return '/coordinator';
  }

  // Si estamos dentro de sub-rutas de padre / tutor
  if (clean.startsWith('/parent/')) {
    return '/parent';
  }

  // Si estamos dentro de sub-rutas de administrador
  if (clean.startsWith('/admin/')) {
    return '/admin';
  }

  // Si estamos dentro de sub-rutas de director
  if (clean.startsWith('/director/')) {
    return '/director';
  }

  // Si estamos dentro de IBIME
  if (clean.startsWith('/ibime/')) {
    return '/ibime/portal';
  }

  // Fallback por rol del usuario si está en una ruta raíz o no coincidente
  if (userRole) {
    switch (userRole) {
      case 'student':
        return '/student';
      case 'teacher':
        return '/teacher';
      case 'parent':
      case 'tutor':
        return '/parent';
      case 'coordinator':
      case 'billing':
        return '/coordinator';
      case 'director':
        return '/director';
      case 'admin':
      case 'superadmin':
      case 'owner':
      case 'ceo':
        return '/admin';
    }
  }

  return '/teacher';
};

const STORAGE_KEY = 'iskool_nav_history_stack_v1';

const getInitialStack = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => typeof p === 'string' && !isAuthOrSystemPath(p));
      }
    }
  } catch {
    // Si falla la lectura de sessionStorage, se inicia vacío
  }
  return [];
};

const saveStack = (stack: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-30)));
  } catch {
    // Silencio en modo privado o límites de storage
  }
};

interface NavigationState {
  historyStack: string[];
  currentPath: string;
  previousPath: string | null;
  isNavigatingBack: boolean;

  /**
   * Registra una nueva ruta dentro del historial interno de ISkool.
   * Filtra automáticamente rutas de login y duplicados consecutivos.
   */
  recordPath: (path: string) => void;

  /**
   * Obtiene la ruta segura anterior sin modificar el stack.
   */
  getSafeBackUrl: (currentPath: string, userRole?: string, explicitFallback?: string) => string;

  /**
   * Extrae la ruta anterior del stack y devuelve la URL a la que se debe navegar.
   */
  popBackUrl: (currentPath: string, userRole?: string, explicitFallback?: string) => string;

  /**
   * Marca temporalmente que se está realizando una navegación de retorno para no reiniciar el stack.
   */
  setIsNavigatingBack: (value: boolean) => void;

  /**
   * Limpia el historial (utilizado por ejemplo al cerrar sesión).
   */
  clearHistory: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => {
  const initialStack = getInitialStack();
  const initialPrev = initialStack.length > 0 ? initialStack[initialStack.length - 1] : null;

  return {
    historyStack: initialStack,
    currentPath: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
    previousPath: initialPrev,
    isNavigatingBack: false,

    recordPath: (path: string) => {
      if (!path || isAuthOrSystemPath(path)) return;

      const { historyStack, currentPath, isNavigatingBack } = get();

      // Si venimos de un pop/retroceso explícito, resetear la bandera y no duplicar
      if (isNavigatingBack) {
        set({
          isNavigatingBack: false,
          currentPath: path,
          previousPath: historyStack.length > 0 ? historyStack[historyStack.length - 1] : null
        });
        return;
      }

      // Evitar registrar la misma ruta consecutiva
      if (path === currentPath) return;

      const newStack = [...historyStack];
      if (currentPath && !isAuthOrSystemPath(currentPath)) {
        // No apilar duplicados inmediatos en la cima
        if (newStack[newStack.length - 1] !== currentPath) {
          newStack.push(currentPath);
        }
      }

      // Limitar a los últimos 30 saltos
      const trimmedStack = newStack.slice(-30);
      saveStack(trimmedStack);

      set({
        historyStack: trimmedStack,
        previousPath: trimmedStack.length > 0 ? trimmedStack[trimmedStack.length - 1] : null,
        currentPath: path
      });
    },

    getSafeBackUrl: (currentPath: string, userRole?: string, explicitFallback?: string) => {
      const { historyStack } = get();
      
      // Buscar en el stack hacia atrás una ruta diferente a la actual y que no sea de auth
      for (let i = historyStack.length - 1; i >= 0; i--) {
        const candidate = historyStack[i];
        if (candidate && candidate !== currentPath && !isAuthOrSystemPath(candidate)) {
          return candidate;
        }
      }

      // Si se proporcionó un fallback explícito y no es de login
      if (explicitFallback && !isAuthOrSystemPath(explicitFallback)) {
        return explicitFallback;
      }

      // Fallback contextual por jerarquía o rol (nunca pantalla de autenticación)
      return getContextualParentUrl(currentPath, userRole);
    },

    popBackUrl: (currentPath: string, userRole?: string, explicitFallback?: string) => {
      const { historyStack } = get();
      const target = get().getSafeBackUrl(currentPath, userRole, explicitFallback);

      // Eliminar del stack las entradas que coincidan con el destino y la actual
      const filtered = historyStack.filter(p => p !== currentPath && p !== target);
      saveStack(filtered);

      set({
        historyStack: filtered,
        previousPath: filtered.length > 0 ? filtered[filtered.length - 1] : null,
        isNavigatingBack: true
      });

      return target;
    },

    setIsNavigatingBack: (value: boolean) => set({ isNavigatingBack: value }),

    clearHistory: () => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // Noop
        }
      }
      set({
        historyStack: [],
        previousPath: null,
        currentPath: '',
        isNavigatingBack: false
      });
    }
  };
});
