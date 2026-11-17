'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-5 shadow-2xl">
          <h1 className="text-2xl font-black tracking-tight">Recuperación Institucional ISkool</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Se detectó una interrupción inesperada en la sesión actual. Puedes recargar este módulo de forma segura sin perder tu avance guardado.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-500">Código: {error.digest}</p>
          )}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
