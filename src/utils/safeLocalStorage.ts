import type { StateStorage } from 'zustand/middleware';

const NON_CRITICAL_CACHE_PREFIXES = [
  'iskool_raw_emails_',
  'iskool_calendar_events_',
  'iskool_generated_plannings',
  'iskool_mail_raw_cache_',
];

function evictNonCriticalCaches(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && NON_CRITICAL_CACHE_PREFIXES.some((p) => k.startsWith(p))) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
  } catch {
    // Ignore storage iteration restrictions
  }
}

/**
 * Storage seguro para Zustand persist que previene caídas por QuotaExceededError (5 MB).
 */
export function createSafeLocalStorage(): StateStorage {
  return {
    getItem: (name: string): string | null => {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      try {
        window.localStorage.setItem(name, value);
      } catch {
        evictNonCriticalCaches();
        try {
          window.localStorage.setItem(name, value);
        } catch {
          // Mantener el estado en memoria RAM sin romper la interfaz
        }
      }
    },
    removeItem: (name: string): void => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      try {
        window.localStorage.removeItem(name);
      } catch {
        // Ignore removal failures
      }
    },
  };
}
