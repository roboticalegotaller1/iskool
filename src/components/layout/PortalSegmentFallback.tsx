'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

export function PortalErrorFallback({
  error,
  reset,
  portalLabel = 'Portal Académico',
}: {
  error: Error & { digest?: string };
  reset: () => void;
  portalLabel?: string;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {portalLabel}
          </p>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Interrupción temporal en la vista
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Ocurrió una incidencia inesperada al cargar este módulo institucional. Tu sesión y tus datos permanecen resguardados.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              Referencia: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PortalLoadingFallback({ label = 'Cargando módulo institucional...' }: { label?: string }) {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-950/70"
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  );
}
