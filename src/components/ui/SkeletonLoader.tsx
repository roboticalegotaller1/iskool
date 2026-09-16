"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "rounded";
}

/**
 * Componente base de Skeleton con animación shimmer sutil para evitar bloqueos de pantalla.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "w-full h-4",
  variant = "rounded"
}) => {
  const roundedClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "rectangular"
      ? "rounded-none"
      : "rounded-2xl";

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/80 dark:bg-zinc-800/80 ${roundedClass} ${className}`}
    />
  );
};

/**
 * Esqueleto para Tarjetas (Bento cards, actividades pedagógicas, expedientes)
 */
export const CardSkeleton: React.FC<{ className?: string; lines?: number }> = ({
  className = "w-full h-48",
  lines = 3
}) => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando contenido..."
      className={`p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      </div>
      <div className="space-y-2 my-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-4/5" : "w-full"}`} />
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-16 h-6" />
      </div>
    </div>
  );
};

/**
 * Esqueleto para Tablas de Datos (Estudiantes, Asistencias, Nóminas, Facturación)
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = ""
}) => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando tabla de datos..."
      className={`w-full rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs ${className}`}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className={`h-4 ${i === 0 ? "w-1/3" : "w-1/5"}`} />
        ))}
      </div>

      {/* Filas */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={`cell-${rowIdx}-${colIdx}`}
                className={`h-4 ${colIdx === 0 ? "w-2/5" : "w-1/5"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Esqueleto para Botones de Acción
 */
export const ButtonSkeleton: React.FC<{ className?: string }> = ({
  className = "w-28 h-10"
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-zinc-800/80 ${className}`}
    />
  );
};

/**
 * Esqueleto para Cabeceras Hero
 */
export const HeroBannerSkeleton: React.FC<{ className?: string }> = ({
  className = "w-full h-40"
}) => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando cabecera..."
      className={`p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 flex flex-col justify-center gap-3.5 ${className}`}
    >
      <Skeleton className="w-32 h-5 rounded-full" />
      <Skeleton className="w-3/5 h-8" />
      <Skeleton className="w-2/5 h-4" />
    </div>
  );
};

export default Skeleton;
