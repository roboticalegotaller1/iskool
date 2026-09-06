"use client";

import React from 'react';

interface LoaderProps {
  message?: string;
  compact?: boolean;
}

export function Loader({ message = "Cargando aventura...", compact = false }: LoaderProps) {
  return (
    <div className={`${compact ? 'py-8' : 'min-h-screen'} flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 border-r-transparent" />
        <p className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
